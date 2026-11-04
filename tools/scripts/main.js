import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, helpText, getVersion } from './cli.js';
import { loadCatalog, catalogBySlug } from './catalog.js';
import { buildSourceIndex, collectUnresolved, loadExtraSources } from './sources.js';
import { buildSelection } from './scenarios.js';
import { PLATFORM_NAMES, detectPlatforms, getPlatform } from './platforms.js';
import { installSkills } from './install.js';
import { installDependencies, collectDependencies, collectKeys } from './deps.js';
import { configureKeys, pendingKeysLocation } from './keys.js';
import { loadState, saveState, withLock, recordInstall, logsRoot, pruneBackups, backupsRoot } from './state.js';
import { splitFrontmatter } from './frontmatter.js';
import { updateInstallations, syncCollections, uninstall, checkUpdates } from './update.js';
import { runWizard } from './wizard.js';
import { isTTY, confirm, closePrompt } from './prompt.js';
import { parseList, ensureDir, writeFileAtomic, commandExists, dataHome, homeDir } from './util.js';
import { repoCommit, repoDir } from './git.js';
import { installReport, listReport, doctorReport } from './report.js';

function colorEnabled(options) {
  return !options.noColor && process.stdout.isTTY;
}

function requireNonInteractiveConsent(options, command) {
  if (!isTTY() && !options.yes && !options.dryRun) {
    throw new Error(`非交互环境执行 ${command} 需要 --yes`);
  }
}

function keyValuesFromOptions(options) {
  const values = {};
  for (const item of options.key || []) {
    const index = item.indexOf('=');
    if (index === -1) throw new Error(`--key 需要 NAME=value 形式: ${item}`);
    values[item.slice(0, index)] = item.slice(index + 1);
  }
  return values;
}

function resolvePlatforms(options, { allowDetected = true } = {}) {
  const listed = parseList(options.platform);
  if (listed.length) {
    if (listed.includes('all')) return [...PLATFORM_NAMES];
    for (const name of listed) getPlatform(name);
    return listed.map((name) => name.toLowerCase());
  }
  if (options.dest) return ['claude'];
  if (allowDetected) {
    const detected = detectPlatforms();
    if (detected.length) return detected;
  }
  throw new Error(`请用 --platform 指定目标平台；可用: ${PLATFORM_NAMES.join(', ')}`);
}

function selectionOptions(options) {
  return {
    scenarios: parseList(options.scenario),
    categories: parseList(options.category),
    skills: parseList(options.skills),
    all: Boolean(options.all),
    includeCollections: Boolean(options.includeCollections)
  };
}

async function writeLog(report) {
  const dir = logsRoot();
  await ensureDir(dir);
  const file = path.join(dir, 'last-install.json');
  await writeFileAtomic(file, `${JSON.stringify(report, null, 2)}\n`, 0o600);
  return file;
}

async function commandInstall(options) {
  requireNonInteractiveConsent(options, 'install');
  const catalog = loadCatalog();
  const index = buildSourceIndex({ catalog });
  const interactive = !options.yes;
  if (options.json && interactive && isTTY()) throw new Error('--json 需要配合 --yes 使用');

  let opts;
  if (interactive && isTTY()) {
    opts = await runWizard({ index, catalog });
  } else {
    opts = {
      ...selectionOptions(options),
      platforms: resolvePlatforms(options),
      scope: options.scope?.[0] || 'global',
      cwd: options.cwd?.[0] || process.cwd(),
      method: options.method?.[0] || 'copy',
      dest: options.dest?.[0]
    };
    if (!opts.all && opts.scenarios.length === 0 && opts.categories.length === 0 && opts.skills.length === 0) {
      throw new Error('请指定 --scenario、--category、--skills 或 --all（非交互模式）');
    }
  }

  if (opts.dest && opts.platforms.length > 1) {
    throw new Error('--dest 只能与单个平台一起使用');
  }
  if (!['global', 'project'].includes(opts.scope)) throw new Error(`未知 scope: ${opts.scope}`);
  if (!['copy', 'link'].includes(opts.method)) throw new Error(`未知 method: ${opts.method}`);
  const selection = buildSelection(opts, { index, catalog });
  if (selection.unresolved.length && options.strictScenarios) {
    throw new Error(`场景有未解析项: ${selection.unresolved.map((item) => item.name).join(', ')}`);
  }
  if (selection.conflicts.length) {
    const message = selection.conflicts.map((item) => `${item.slug}: ${item.first.repo}/${item.first.path} vs ${item.second.repo}/${item.second.path}`).join('; ');
    throw new Error(`来源冲突: ${message}`);
  }
  if (selection.selected.length === 0) {
    if (selection.unresolved.length) {
      throw new Error(`未知 skill 或未解析来源: ${selection.unresolved.map((item) => item.name).join(', ')}`);
    }
    if (selection.collectionHints.length) {
      throw new Error(`只选中了合集 ${selection.collectionHints.map((item) => item.slug).join(', ')}；请加 --include-collections 展开`);
    }
    throw new Error('没有匹配到可安装的 skill');
  }

  const state = loadState();
  const keyValues = keyValuesFromOptions(options);
  if ((options.key || []).length) {
    console.error('警告: --key 参数可能在进程列表中短暂可见；CI 中优先使用环境变量。');
  }
  const dryRun = Boolean(options.dryRun);
  const noDeps = Boolean(options.noDeps);
  if (options.offline && !dryRun) {
    const missing = selection.selected
      .filter((spec) => spec.repo && spec.kind !== 'framework')
      .map((spec) => spec.repo)
      .filter((repo, index, list) => list.indexOf(repo) === index)
      .filter((repo) => !fs.existsSync(repoDir(repo)));
    if (missing.length) throw new Error(`--offline 但本地没有这些仓库缓存: ${missing.join(', ')}`);
  }
  const confirmInstall = options.yes ? async () => true : (question) => confirm(question);

  const run = async () => {
    const deps = collectDependencies(selection.selected);
    const keys = collectKeys(selection.selected);
    let depResults = [];
    if (!noDeps) {
      depResults = await installDependencies(deps, {
        yes: Boolean(options.yes),
        dryRun,
        project: options.project?.[0],
        confirm: confirmInstall
      });
    }
    const keyResults = await configureKeys(keys, {
      yes: Boolean(options.yes),
      dryRun,
      keyValues,
      confirmInstall
    });

    const result = await installSkills({
      selected: selection.selected,
      platforms: opts.platforms,
      scope: opts.scope,
      cwd: opts.cwd,
      dest: opts.dest,
      method: opts.method,
      dryRun,
      force: Boolean(options.force),
      offline: Boolean(options.offline),
      includeCollections: Boolean(opts.includeCollections),
      existingState: state,
      onProgress: ({ slug, platform, dir }) => {
        if (options.verbose) console.log(`  ${slug} -> ${platform}: ${dir}`);
      }
    });
    result.warnings.push(...selection.unresolved.map((item) => `未解析 ${item.name}: ${item.reason}`));
    result.collectionHints = [...(result.collectionHints || []), ...selection.collectionHints];
    result.warnings.push(...depResults.filter((item) => item.status === 'failed').map((item) => `依赖 ${item.id} 安装失败: ${item.message || ''}`));
    result.warnings.push(...keyResults.filter((item) => item.status === 'failed').map((item) => `key ${item.id} 配置失败: ${item.error || ''}`));
    if (options.verify && !dryRun) {
      for (const item of result.installed) {
        try {
          const { data } = splitFrontmatter(fs.readFileSync(path.join(item.dir, 'SKILL.md'), 'utf8'));
          if (!data.name || !data.description) {
            result.warnings.push(`verify ${item.slug}@${item.platform}: 缺少 name 或 description`);
          }
        } catch (error) {
          result.warnings.push(`verify ${item.slug}@${item.platform}: ${error.message}`);
        }
      }
    }
    result.keyResults = keyResults;
    result.depResults = depResults;

    if (!dryRun) {
      for (const item of result.installed) {
        recordInstall(state, {
          slug: item.slug,
          name: item.name,
          repo: item.repo,
          path: item.path,
          kind: 'skill',
          source: item.repo ? `https://github.com/${item.repo}` : item.source,
          license: item.license
        }, item.platform, {
          dir: item.dir,
          method: item.method,
          sourceHash: item.sourceHash,
          installedHash: item.installedHash,
          collection: item.collection,
          slug: item.slug,
          path: item.path
        });
      }
      for (const repo of new Set(result.repos)) {
        state.repos[repo] = { commit: await repoCommit(repo), updatedAt: new Date().toISOString() };
      }
      await saveState(state);
      const keep = Number.parseInt(options.keepBackups?.[0] ?? '3', 10);
      await pruneBackups(Number.isFinite(keep) && keep >= 1 ? keep : 3);
    }

    const pending = keyResults.some((item) => item.status === 'skipped' || item.status === 'failed')
      ? pendingKeysLocation()
      : null;
    let logFile = null;
    if (!dryRun) logFile = await writeLog({ ...result, keyResults, depResults });
    installReport(result, {
      json: Boolean(options.json),
      color: colorEnabled(options),
      pendingKeys: pending,
      logFile
    });

    if (!options.json && !dryRun && depResults.length) {
      console.log('\n依赖结果');
      for (const item of depResults) {
        console.log(`  ${item.label || item.id}: ${item.status}${item.message ? ` — ${item.message}` : ''}`);
        if (item.status === 'dry-run' && item.commands) {
          for (const command of item.commands) console.log(`    $ ${command.join(' ')}`);
        }
      }
    }
    if (!options.json && !dryRun && keyResults.length) {
      console.log('\nKey 结果');
      for (const item of keyResults) {
        console.log(`  ${item.id}: ${item.status}${item.hint ? ` — ${item.hint}` : ''}`);
      }
    }
    if (result.failed.length === 0) return 0;
    const allRepoFailures = result.installed.length === 0
      && result.failed.every((item) => /仓库 .* 准备失败|下载 |HTTP |--offline/.test(item.error || ''));
    return allRepoFailures ? 3 : 1;
  };

  if (dryRun) return run();
  return withLock(run);
}

function commandList(options) {
  const catalog = loadCatalog();
  const index = buildSourceIndex({ catalog });
  const categoryFilter = parseList(options.category);
  let entries = catalog.map((entry) => ({ ...entry, kind: index.get(entry.slug)?.kind || 'unresolved' }));
  if (categoryFilter.length) entries = entries.filter((entry) => categoryFilter.includes(entry.category));
  if (options.installed) {
    const state = loadState();
    const known = new Set(entries.map((entry) => entry.slug));
    entries = entries.filter((entry) => state.skills[entry.slug]);
    for (const record of Object.values(state.skills)) {
      if (known.has(record.slug) || categoryFilter.length) continue;
      entries.push({
        slug: record.slug,
        name: record.name || record.slug,
        category: 'installed',
        summary: record.source || '',
        kind: record.kind || 'skill'
      });
    }
  }
  listReport(entries, { json: Boolean(options.json) });
  return 0;
}

async function commandUpdate(options) {
  requireNonInteractiveConsent(options, 'update');
  const platforms = options.platform ? resolvePlatforms(options, { allowDetected: false }) : null;
  const state = loadState();
  const run = async () => {
    const result = await updateInstallations({
      platforms,
      check: Boolean(options.check),
      force: Boolean(options.force),
      repair: Boolean(options.repair),
      prune: Boolean(options.prune),
      offline: Boolean(options.offline),
      keepLocal: Boolean(options.keepLocal),
      state
    });
    await pruneBackups(3);
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('更新结果');
      for (const item of result.updated) console.log(`  updated ${item.slug}@${item.platform}: ${item.dir}`);
      for (const item of result.skipped) console.log(`  skipped ${item.slug}@${item.platform || ''}: ${item.reason}`);
      for (const item of result.broken) console.log(`  broken ${item.slug}: 上游路径消失`);
      for (const item of result.userModified) console.log(`  modified ${item.slug}@${item.platform}: ${item.dir}（--force 覆盖）`);
      for (const item of result.failed) console.log(`  failed ${item.slug}${item.platform ? `@${item.platform}` : ''}: ${item.error}`);
      for (const item of result.repos) if (item.warning) console.log(`  warn ${item.repo}: ${item.warning}`);
      if (options.check) {
        if (result.updates.length === 0) console.log('  没有可用更新');
        for (const item of result.updates) console.log(`  update ${item.repo}: ${item.local} -> ${item.remote}`);
      }
    }
    return result.failed.length ? 1 : 0;
  };
  return withLock(run);
}

async function commandSync(options) {
  requireNonInteractiveConsent(options, 'sync');
  const platforms = options.platform ? resolvePlatforms(options, { allowDetected: false }) : null;
  const state = loadState();
  const run = async () => {
    const updated = await updateInstallations({ platforms, force: Boolean(options.force), prune: Boolean(options.prune), keepLocal: Boolean(options.keepLocal), offline: Boolean(options.offline), state });
    const synced = await syncCollections({ platforms, prune: Boolean(options.prune), state });
    await pruneBackups(3);
    if (options.json) {
      console.log(JSON.stringify({ updated, synced }, null, 2));
    } else {
      console.log(`update: ${updated.updated.length} 个更新, ${updated.broken.length} 个断链, ${updated.failed.length} 个失败`);
      for (const item of updated.broken) console.log(`  broken ${item.slug}: 上游路径消失`);
      console.log(`sync: ${synced.added.length} 个新增, ${synced.removed.length} 个移除, ${synced.failed.length} 个失败`);
      for (const item of updated.repos) {
        if (item.warning) console.log(`  warn ${item.repo}: ${item.warning}`);
        if (item.skipped) console.log(`  skipped ${item.repo}: ${item.skipped}`);
      }
      for (const item of synced.added) console.log(`  added ${item.slug}@${item.platform}`);
      for (const item of synced.removed) console.log(`  removed ${item.slug}@${item.platform}`);
      for (const item of synced.failed) console.log(`  failed ${item.slug || ''}: ${item.error}`);
    }
    return (updated.failed.length + synced.failed.length) ? 1 : 0;
  };
  return withLock(run);
}

async function commandDoctor(options) {
  const catalog = loadCatalog();
  const index = buildSourceIndex({ catalog });
  const unresolved = collectUnresolved(index);
  const state = loadState();
  const warnings = [];
  const tools = {
    git: commandExists('git'),
    npm: commandExists('npm'),
    uv: commandExists('uv'),
    tar: commandExists('tar')
  };
  const payload = {
    dataHome: dataHome(),
    tools,
    detectedPlatforms: detectPlatforms(),
    unresolved: unresolved.map((item) => ({ slug: item.slug, reason: item.reason })),
    warnings,
    stateSkills: Object.keys(state.skills).length,
    updates: []
  };
  if (!tools.git) warnings.push('没有 git，将回退到 tarball 下载');
  if (!tools.tar) warnings.push('没有 tar，无法使用 tarball 回退');
  if (state._corrupt) warnings.push(`state.json 无法解析（${state._corrupt}）；卸载/更新记录可能不可用`);
  if (state._recovered) warnings.push('state.json 已从 state.json.bak 恢复');
  for (const record of Object.values(state.skills)) {
    const sourceDir = record.path ? path.join(repoDir(record.repo), record.path) : repoDir(record.repo);
    if (fs.existsSync(repoDir(record.repo)) && !fs.existsSync(path.join(sourceDir, 'SKILL.md'))) {
      warnings.push(`上游路径不存在: ${record.slug} (${record.repo}/${record.path || '.'})`);
    }
  }
  for (const [name, extra] of Object.entries(loadExtraSources())) {
    const dir = repoDir(extra.repo);
    if (fs.existsSync(dir) && !fs.existsSync(path.join(dir, extra.path || '', 'SKILL.md'))) {
      warnings.push(`extra-source 路径不存在: ${name} (${extra.repo}/${extra.path})`);
    }
  }
  for (const name of payload.detectedPlatforms) {
    try {
      const dir = getPlatform(name).global();
      fs.accessSync(path.dirname(dir), fs.constants.W_OK);
    } catch {
      warnings.push(`${name}: 目标目录的父目录不可写或不存在`);
    }
  }
  try {
    const codexConfig = fs.readFileSync(path.join(homeDir(), '.codex', 'config.toml'), 'utf8');
    if (/^\s*skills\s*=\s*false/m.test(codexConfig)) warnings.push('Codex config.toml 中 skills = false');
  } catch { /* ignore */ }
  try {
    if (typeof fs.statfsSync === 'function' && fs.existsSync(dataHome())) {
      const stat = fs.statfsSync(dataHome());
      const free = Number(stat.bavail) * Number(stat.bsize);
      if (free < 500 * 1024 * 1024) warnings.push(`数据目录剩余空间不足 500MB（${Math.round(free / 1024 / 1024)}MB）`);
    }
  } catch { /* ignore */ }
  if (options.checkUpdates) {
    try { payload.updates = await checkUpdates(state, { offline: Boolean(options.offline) }); } catch (error) { warnings.push(`检查更新失败: ${error.message}`); }
  }
  for (const spec of unresolved) warnings.push(`${spec.slug}: ${spec.reason}`);
  doctorReport(payload, { json: Boolean(options.json) });
  return unresolved.length ? 1 : 0;
}

async function commandUninstall(options) {
  requireNonInteractiveConsent(options, 'uninstall');
  if (!options.all && !options.skills) throw new Error('请指定 --skills 或 --all');
  const platforms = options.platform ? resolvePlatforms(options, { allowDetected: false }) : null;
  const state = loadState();
  const skills = parseList(options.skills);
  if (!options.yes && isTTY()) {
    if (!await confirm(`确认卸载 ${options.all ? '全部' : skills.join(', ')}？`)) return 0;
  }
  const run = async () => {
    const result = await uninstall({ platforms, skills, all: Boolean(options.all), force: Boolean(options.force), state });
    if (options.purgeBackups) await fs.promises.rm(backupsRoot(), { recursive: true, force: true });
    if (options.json) console.log(JSON.stringify(result, null, 2));
    else {
      for (const item of result.removed) console.log(`removed ${item.slug}@${item.platform}: ${item.dir}`);
      for (const item of result.skipped) console.log(`skipped ${item.slug}@${item.platform}: ${item.reason}`);
      for (const item of result.failed) console.log(`failed ${item.slug}@${item.platform}: ${item.error}`);
    }
    return result.failed.length ? 1 : 0;
  };
  return withLock(run);
}

export async function main(argv = process.argv.slice(2)) {
  let parsed;
  try {
    parsed = parseArgs(argv);
  } catch (error) {
    console.error(error.message);
    return 2;
  }
  const { command, options } = parsed;
  if (options.version || command === 'version') { console.log(getVersion()); return 0; }
  if (options.help || command === 'help') { console.log(helpText()); return 0; }

  try {
    switch (command) {
      case 'install': return await commandInstall(options);
      case 'list': return commandList(options);
      case 'update': return await commandUpdate(options);
      case 'sync': return await commandSync(options);
      case 'doctor': return await commandDoctor(options);
      case 'uninstall': return await commandUninstall(options);
      default:
        console.error(`未知命令: ${command}\n`);
        console.log(helpText());
        return 2;
    }
  } catch (error) {
    console.error(`错误: ${error.message}`);
    if (options.verbose) console.error(error.stack);
    if (error.message.includes('未知') || error.message.includes('需要') || error.message.includes('请指定') || error.message.includes('参数')) return 2;
    if (/--offline|下载|HTTP|clone|fetch|网络/.test(error.message)) return 3;
    return 1;
  } finally {
    closePrompt();
  }
}
