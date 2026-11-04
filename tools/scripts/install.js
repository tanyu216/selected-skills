import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { toolPath, readJson, ensureDir, copySkillDir, hashDir, listSkillDirs, isValidSlug, isPathInside, dirSize, formatBytes } from './util.js';
import { normalizeSkillMd, descriptionWarning, splitFrontmatter } from './frontmatter.js';
import { repoDir, ensureRepo, repoHasSubmodulesOrLfs } from './git.js';
import { loadSharedPaths } from './sources.js';
import { resolveDest, supportsLink, getPlatform, PLATFORM_NAMES } from './platforms.js';
import { backupPath } from './state.js';

function dependenciesManifest() {
  return readJson(toolPath('installer', 'dependencies.json'));
}

export async function expandCollection(spec) {
  const dir = repoDir(spec.repo);
  if (!fs.existsSync(dir)) throw new Error(`合集 ${spec.slug} 尚未 clone`);
  const results = [];
  const seen = new Set();
  for (const relative of spec.paths || []) {
    const root = path.join(dir, relative);
    const dirs = await listSkillDirs(root);
    for (const skillDir of dirs) {
      const relativePath = path.relative(dir, skillDir).replaceAll(path.sep, '/');
      const slug = path.basename(skillDir);
      if (!isValidSlug(slug) || seen.has(slug)) continue;
      seen.add(slug);
      results.push({
        slug,
        name: slug,
        category: spec.category || 'collection',
        summary: '',
        license: spec.license || 'unknown',
        source: `https://github.com/${spec.repo}`,
        origin: 'collection',
        kind: 'skill',
        repo: spec.repo,
        path: relativePath,
        collection: spec.slug
      });
    }
  }
  return results;
}

export async function prepareSpecs(selected, { includeCollections = false } = {}) {
  const final = new Map();
  const frameworks = [];
  const collectionHints = [];
  const warnings = [];
  const failures = [];

  for (const spec of selected) {
    if (spec.kind === 'framework') { frameworks.push(spec); continue; }
    if (spec.kind === 'collection') {
      if (!includeCollections) { collectionHints.push(spec); continue; }
      let expanded = [];
      try {
        expanded = await expandCollection(spec);
      } catch (error) {
        failures.push({ slug: spec.slug, platform: null, error: `合集展开失败: ${error.message}` });
        continue;
      }
      for (const child of expanded) {
        if (final.has(child.slug)) {
          warnings.push(`合集 ${spec.slug} 的 ${child.slug} 与已选 skill 同名，跳过合集版本`);
          continue;
        }
        final.set(child.slug, child);
      }
      continue;
    }
    if (spec.kind !== 'skill') continue;
    if (!final.has(spec.slug) || final.get(spec.slug).origin === 'collection') final.set(spec.slug, spec);
  }

  return { skills: [...final.values()], frameworks, collectionHints, warnings, failures };
}

function walkFiles(dir, results = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return results; }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, results);
    else if (entry.isFile() && entry.name.endsWith('.md')) results.push(full);
  }
  return results;
}

/**
 * Upstream skill directories sometimes link outside themselves, e.g.
 * knowledge-work-plugins/data/skills/write-query links ../../CONNECTORS.md.
 * Copy the referenced target into the skill root and rewrite the link so the
 * installed skill stays self-contained.
 */
async function rewriteEscapingReferences(tempDest, sourceDir, repoRoot, warnings) {
  let realRepoRoot = repoRoot;
  try { realRepoRoot = fs.realpathSync(repoRoot); } catch { /* keep lexical root */ }
  const files = walkFiles(tempDest);
  const regex = /((?:\.\.\/)+)([A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*)/g;
  for (const destFile of files) {
    const relative = path.relative(tempDest, destFile);
    const sourceFile = path.join(sourceDir, relative);
    const text = await fsp.readFile(destFile, 'utf8');
    const replacements = new Map();

    for (const match of text.matchAll(regex)) {
      const target = path.resolve(path.dirname(sourceFile), match[0]);
      if (!isPathInside(repoRoot, target) || !fs.existsSync(target)) {
        // Missing targets are often examples (../bar, ../out.pptx) or upstream
        // links that are already stale. Leave them untouched and stay quiet.
        continue;
      }
      let realTarget;
      try { realTarget = fs.realpathSync(target); } catch { continue; }
      if (!isPathInside(realRepoRoot, realTarget)) {
        warnings.push(`跳过越界引用 ${match[0]}（目标在仓库外）`);
        continue;
      }
      const base = path.basename(target);
      const destTarget = path.join(tempDest, base);
      if (!fs.existsSync(destTarget)) {
        try {
          const stat = fs.statSync(target);
          if (stat.isDirectory()) {
            await copySkillDir(target, destTarget, { warnings, skipNestedSkillDirs: false });
          } else {
            fs.copyFileSync(target, destTarget);
            fs.chmodSync(destTarget, stat.mode & 0o777);
          }
        } catch (error) {
          warnings.push(`复制越界引用失败 ${match[0]}: ${error.message}`);
          continue;
        }
      }
      const rel = path.relative(path.dirname(destFile), destTarget).replaceAll(path.sep, '/');
      replacements.set(match[0], rel || base);
    }

    if (replacements.size) {
      let rewritten = text;
      for (const [from, to] of replacements) rewritten = rewritten.split(from).join(to);
      await fsp.writeFile(destFile, rewritten);
    }
  }
}

async function writeSkillCopy({ sourceDir, tempDest, slug, summary, root, repoRoot }) {
  const warnings = [];
  await ensureDir(tempDest);
  await copySkillDir(sourceDir, tempDest, { warnings, skipNestedSkillDirs: root });
  const skillFile = path.join(tempDest, 'SKILL.md');
  if (!fs.existsSync(skillFile)) {
    throw new Error(`上游目录里没有 SKILL.md: ${sourceDir}`);
  }
  if (repoRoot) await rewriteEscapingReferences(tempDest, sourceDir, repoRoot, warnings);
  if (root) {
    const size = dirSize(tempDest);
    if (size.bytes > 50 * 1024 * 1024 || size.files > 5000) {
      warnings.push(`根目录 skill 较大: ${formatBytes(size.bytes)} / ${size.files} 个文件，已完整复制`);
    }
  }
  const nested = walkFiles(tempDest).filter((file) => path.basename(file) === 'SKILL.md' && file !== skillFile);
  for (const file of nested) {
    warnings.push(`包含嵌套 SKILL.md: ${path.relative(tempDest, file)}（Codex/Hermes 递归扫描可能当成额外 skill）`);
  }
  const raw = await fsp.readFile(skillFile, 'utf8');
  const normalized = normalizeSkillMd(raw, { slug, fallbackDescription: summary });
  await fsp.writeFile(skillFile, normalized);
  const descWarning = descriptionWarning(normalized);
  if (descWarning) warnings.push(`${slug}: ${descWarning}`);
  return warnings;
}

async function moveToBackup(platformName, slug, destDir) {
  const target = backupPath(platformName, slug);
  await ensureDir(path.dirname(target));
  await fsp.rename(destDir, target);
  return target;
}

export async function installSkills({
  selected,
  platforms,
  scope = 'global',
  cwd = process.cwd(),
  dest,
  method = 'copy',
  dryRun = false,
  force = false,
  offline = false,
  includeCollections = false,
  existingState = null,
  onProgress = () => {}
}) {
  const manifest = dependenciesManifest();
  const sharedPaths = loadSharedPaths();
  const preWarnings = [];
  if (!dryRun) {
    const preRepos = new Map();
    for (const spec of selected) {
      if (!spec.repo || spec.kind === 'framework' || spec.kind === 'unresolved') continue;
      if (!preRepos.has(spec.repo)) preRepos.set(spec.repo, []);
      const list = preRepos.get(spec.repo);
      if (spec.kind === 'collection') list.push(...(spec.paths || []));
      else list.push(spec.path || '');
      list.push(...(sharedPaths[spec.repo] || []));
    }
    for (const [repo, paths] of preRepos) {
      try {
        await ensureRepo(repo, { paths: [...new Set(paths)], offline });
      } catch (error) {
        preWarnings.push(`仓库 ${repo} 准备失败: ${error.message}`);
      }
    }
  }
  const { skills, frameworks, collectionHints, warnings, failures } = await prepareSpecs(selected, { includeCollections });
  warnings.unshift(...preWarnings);
  const result = {
    installed: [],
    skipped: [],
    failed: [...failures],
    frameworks: [],
    collectionHints,
    warnings: [...warnings],
    hints: [],
    repos: []
  };

  for (const spec of frameworks) {
    const hints = manifest.frameworkHints?.[spec.slug] || [];
    result.frameworks.push({ slug: spec.slug, repo: spec.repo, hints });
    if (spec.reason) result.warnings.push(`${spec.slug}: ${spec.reason}`);
  }

  if (skills.length === 0) return result;

  // Group by repo so each repo is cloned once.
  const repoPaths = new Map();
  for (const spec of skills) {
    if (!repoPaths.has(spec.repo)) repoPaths.set(spec.repo, []);
    repoPaths.get(spec.repo).push(spec.path || '');
    repoPaths.get(spec.repo).push(...(sharedPaths[spec.repo] || []));
  }

  const repoReady = new Map();
  for (const [repo, paths] of repoPaths) {
    if (dryRun) {
      repoReady.set(repo, { ok: true, cached: fs.existsSync(repoDir(repo)), dryRun: true });
      continue;
    }
    try {
      await ensureRepo(repo, { paths: [...new Set(paths)], offline });
      const lfsWarnings = await repoHasSubmodulesOrLfs(repo);
      result.warnings.push(...lfsWarnings.map((item) => `${repo}: ${item}`));
      result.repos.push(repo);
      repoReady.set(repo, { ok: true });
    } catch (error) {
      repoReady.set(repo, { ok: false, error: error.message });
      result.failed.push({ slug: repo, platform: null, error: `仓库 ${repo} 准备失败: ${error.message}` });
    }
  }

  const destinationKeys = new Set();
  const realDestKey = (target) => {
    try { return fs.realpathSync(target); } catch {
      try { return path.join(fs.realpathSync(path.dirname(target)), path.basename(target)); } catch { return path.resolve(target); }
    }
  };
  for (const spec of skills) {
    const ready = repoReady.get(spec.repo);
    if (!ready?.ok) continue;

    const sourceDir = spec.path ? path.join(repoDir(spec.repo), spec.path) : repoDir(spec.repo);
    if (!dryRun && !fs.existsSync(path.join(sourceDir, 'SKILL.md'))) {
      result.failed.push({ slug: spec.slug, platform: null, error: `上游缺少 SKILL.md: ${spec.path || '.'}` });
      continue;
    }

      const existingRecord = existingState?.skills?.[spec.slug];
    if (existingRecord && (existingRecord.repo !== spec.repo || (existingRecord.path || '') !== (spec.path || ''))) {
      result.failed.push({
        slug: spec.slug,
        platform: null,
        error: `已安装同名但不同来源的 skill（${existingRecord.repo}/${existingRecord.path || '.'}）；请先卸载再安装`
      });
      continue;
    }

    let sourceHash = '';
    if (!dryRun) {
      try { sourceHash = await hashDir(sourceDir); } catch { sourceHash = ''; }
    }

    let linkable = method === 'link' && !spec.root;
    if (linkable && !dryRun) {
      try {
        const { data } = splitFrontmatter(fs.readFileSync(path.join(sourceDir, 'SKILL.md'), 'utf8'));
        linkable = data.name === spec.slug && Boolean(data.description);
        if (!linkable) {
          result.warnings.push(`${spec.slug}: 上游 name/description 需要规范化，link 回退为 copy`);
        }
      } catch {
        linkable = false;
      }
    } else if (method === 'link' && spec.root) {
      result.warnings.push(`${spec.slug}: 根目录 skill 使用 copy（避免把仓库根直接链入技能目录）`);
    }

    for (const platformName of platforms) {
      let destRoot;
      try {
        destRoot = resolveDest(platformName, { scope, cwd, dest });
      } catch (error) {
        result.failed.push({ slug: spec.slug, platform: platformName, error: error.message });
        continue;
      }
      const destDir = path.join(destRoot, spec.slug);
      const realKey = realDestKey(destDir);
      const destKey = `${platformName}:${realKey}`;
      if (destinationKeys.has(destKey) || destinationKeys.has(realKey)) continue;
      destinationKeys.add(destKey);
      destinationKeys.add(realKey);

      const shouldLink = linkable && supportsLink(platformName, { scope });
      const action = shouldLink ? 'link' : 'copy';
      if (method === 'link' && !shouldLink && linkable && !result.warnings.some((item) => item.includes(`${platformName} 不支持软链接`))) {
        result.warnings.push(`${platformName} 不支持软链接（或当前作用域不安全），已回退为 copy`);
      }
      if (dryRun) {
        result.installed.push({
          slug: spec.slug,
          platform: platformName,
          dir: destDir,
          source: sourceDir,
          method: action,
          dryRun: true,
          license: spec.license
        });
        continue;
      }

      const existed = fs.existsSync(destDir);
      if (existed && !force) {
        result.skipped.push({ slug: spec.slug, platform: platformName, dir: destDir, reason: '目标已存在（--force 覆盖）' });
        continue;
      }

      let tempRootUsed = null;
      try {
        await ensureDir(destRoot);
        if (existed && force) {
          const backup = await moveToBackup(platformName, spec.slug, destDir);
          result.warnings.push(`${spec.slug}@${platformName}: 已备份到 ${backup}`);
        }

        if (shouldLink) {
          try {
            await fsp.symlink(sourceDir, destDir, 'dir');
          } catch (error) {
            if (process.platform !== 'win32') throw error;
            const tempRoot = path.join(path.dirname(destRoot), `.selected-skills-tmp-${process.pid}`);
            tempRootUsed = tempRoot;
            const tempDest = path.join(tempRoot, spec.slug);
            await fsp.rm(tempDest, { recursive: true, force: true });
            const copyWarnings = await writeSkillCopy({ sourceDir, tempDest, slug: spec.slug, summary: spec.summary, root: Boolean(spec.root), repoRoot: repoDir(spec.repo) });
            result.warnings.push(...copyWarnings);
            await fsp.rename(tempDest, destDir);
            await fsp.rm(tempRoot, { recursive: true, force: true }).catch(() => {});
          }
        } else {
          const tempRoot = path.join(path.dirname(destRoot), `.selected-skills-tmp-${process.pid}`);
          tempRootUsed = tempRoot;
          const tempDest = path.join(tempRoot, spec.slug);
          await fsp.rm(tempDest, { recursive: true, force: true });
          const copyWarnings = await writeSkillCopy({ sourceDir, tempDest, slug: spec.slug, summary: spec.summary, root: Boolean(spec.root), repoRoot: repoDir(spec.repo) });
          result.warnings.push(...copyWarnings.map((item) => `${spec.slug}@${platformName}: ${item}`));
          await fsp.rename(tempDest, destDir);
          await fsp.rm(tempRoot, { recursive: true, force: true }).catch(() => {});
        }

        const installedHash = await hashDir(destDir).catch(() => '');
        result.installed.push({
          slug: spec.slug,
          name: spec.name,
          repo: spec.repo,
          path: spec.path,
          root: Boolean(spec.root),
          platform: platformName,
          dir: destDir,
          source: sourceDir,
          method: action,
          sourceHash,
          installedHash,
          collection: spec.collection || null,
          license: spec.license
        });
        onProgress({ slug: spec.slug, platform: platformName, dir: destDir });
      } catch (error) {
        if (tempRootUsed) await fsp.rm(tempRootUsed, { recursive: true, force: true }).catch(() => {});
        result.failed.push({ slug: spec.slug, platform: platformName, error: error.message });
      }
    }
  }

  result.hints = collectHints(result, manifest);
  return result;
}

function collectHints(result, manifest) {
  const hints = [];
  const seen = new Set();
  const push = (text) => {
    if (!text || seen.has(text)) return;
    seen.add(text);
    hints.push(text);
  };
  for (const item of [...result.installed, ...result.skipped]) {
    for (const hint of manifest.manualHints?.[item.slug] || []) push(`[${item.slug}] ${hint}`);
    if (item.collection) {
      for (const hint of manifest.collectionManualHints?.[item.collection] || []) push(`[${item.collection}] ${hint}`);
    }
  }
  return hints;
}

export async function refreshSkillCopy({
  sourceDir,
  destDir,
  platformName,
  slug,
  summary = '',
  root = false,
  method = 'copy',
  force = false,
  repoRoot = ''
}) {
  const existed = fs.existsSync(destDir);
  if (existed && !force) return { skipped: true, reason: '目标已存在（--force 覆盖）' };
  const destRoot = path.dirname(destDir);
  await ensureDir(destRoot);
  if (existed && force) await moveToBackup(platformName, slug, destDir);

  let warnings = [];
  if (method === 'link' && supportsLink(platformName)) {
    await fsp.symlink(sourceDir, destDir, 'dir');
  } else {
    const tempRoot = path.join(path.dirname(destRoot), `.selected-skills-tmp-${process.pid}`);
    const tempDest = path.join(tempRoot, slug);
    await fsp.rm(tempDest, { recursive: true, force: true });
    warnings = await writeSkillCopy({ sourceDir, tempDest, slug, summary, root, repoRoot });
    await fsp.rename(tempDest, destDir);
    await fsp.rm(tempRoot, { recursive: true, force: true }).catch(() => {});
  }
  const installedHash = await hashDir(destDir).catch(() => '');
  return { skipped: false, installedHash, warnings };
}

export function platformList(value) {
  if (!value || value === 'all') return [...PLATFORM_NAMES];
  const names = String(value).split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
  for (const name of names) getPlatform(name);
  return names;
}
