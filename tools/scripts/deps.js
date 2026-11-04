import { toolPath, readJson, uniq, run, commandExists } from './util.js';

export function loadDependencyManifest() {
  return readJson(toolPath('installer', 'dependencies.json'));
}

export function collectDependencies(skills, manifest = loadDependencyManifest()) {
  const ids = [];
  for (const skill of skills) {
    for (const id of manifest.skillRequires?.[skill.slug] || []) ids.push(id);
    for (const id of manifest.collectionRequires?.[skill.slug] || []) ids.push(id);
  }
  return uniq(ids).map((id) => ({ id, ...manifest.dependencies[id] })).filter((item) => item.label);
}

export function collectKeys(skills, manifest = loadDependencyManifest()) {
  const keys = [];
  for (const skill of skills) {
    for (const key of manifest.skillKeyBundles?.[skill.slug] || []) keys.push(key);
    for (const key of manifest.collectionKeyBundles?.[skill.slug] || []) keys.push(key);
  }
  const deps = collectDependencies(skills, manifest);
  for (const dep of deps) {
    for (const key of dep.keys || []) keys.push(key);
  }
  return uniq(keys).map((id) => ({ id, ...manifest.keys[id] })).filter((item) => item.env);
}

export async function checkDependency(dep, { project } = {}) {
  if (!dep.check || dep.check.length === 0) return { status: 'unknown', detail: dep.note || '' };
  const result = await run(dep.check[0], dep.check.slice(1), { timeout: 30_000, cwd: project || undefined });
  return {
    status: result.ok ? 'present' : 'missing',
    detail: result.ok ? result.stdout.trim().split(/\r?\n/)[0] : (result.stderr.trim() || result.stdout.trim())
  };
}

function managerFor(kind) {
  if (kind === 'npm-global' || kind === 'npx') return 'npm';
  if (kind === 'uv-tool') return 'uv';
  if (kind === 'pipx') return 'pipx';
  if (kind === 'project-pip') return 'pip';
  return null;
}

export async function installDependency(dep, { yes = false, dryRun = false, project, confirm = async () => true } = {}) {
  if (dep.kind === 'manual' || !dep.install || dep.install.length === 0) {
    return { ok: false, status: 'manual', message: dep.note || '需要手动安装' };
  }
  if ((dep.kind === 'project' || dep.kind === 'project-pip') && !project) {
    return { ok: false, status: 'manual', message: '项目级依赖，需要 --project <dir> 才会安装' };
  }
  if (dep.interactive && yes) {
    return { ok: false, status: 'manual', message: dep.note || `交互式安装，请手动运行: ${dep.install[0].join(' ')}` };
  }
  const commands = [dep.install];
  if (!yes && !dryRun) {
    const approved = await confirm(`安装依赖 ${dep.label}？`);
    if (!approved) return { ok: false, status: 'skipped' };
  }
  if (dryRun) return { ok: true, status: 'dry-run', commands };

  let lastError = '';
  for (const command of commands) {
    const [cmd, ...args] = command;
    if (managerFor(dep.kind) && !commandExists(cmd)) {
      lastError = `找不到 ${cmd}`;
      continue;
    }
    const result = await run(cmd, args, { inherit: true, cwd: project || undefined });
    if (result.ok) return { ok: true, status: 'installed', command: command.join(' ') };
    lastError = result.stderr || `退出码 ${result.code}`;
  }

  if (dep.fallbackInstall) {
    for (const command of dep.fallbackInstall) {
      const [cmd, ...args] = command;
      if (!commandExists(cmd)) continue;
      const result = await run(cmd, args, { inherit: true, cwd: project || undefined });
      if (result.ok) return { ok: true, status: 'installed', command: command.join(' ') };
      lastError = result.stderr || `退出码 ${result.code}`;
    }
  }

  const permissionHint = /EACCES|permission denied/i.test(lastError)
    ? '（全局 npm 目录不可写：配置 npm prefix 或使用 nvm，不要用 sudo）'
    : '';
  return { ok: false, status: 'failed', message: `${lastError}${permissionHint}` };
}

export async function installDependencies(deps, options = {}) {
  const results = [];
  for (const dep of deps) {
    const check = await checkDependency(dep, { project: options.project });
    if (check.status === 'present') {
      results.push({ id: dep.id, label: dep.label, status: 'present', detail: check.detail });
      if (dep.postInstallHint) results.push({ id: dep.id, status: 'hint', message: dep.postInstallHint });
      continue;
    }
    const installed = await installDependency(dep, options);
    results.push({ id: dep.id, label: dep.label, ...installed });
  }
  return results;
}

export function hintsForSkills(skills, manifest = loadDependencyManifest()) {
  const hints = [];
  const seen = new Set();
  for (const skill of skills) {
    for (const hint of manifest.manualHints?.[skill.slug] || []) {
      if (seen.has(hint)) continue;
      seen.add(hint);
      hints.push({ slug: skill.slug, hint });
    }
  }
  return hints;
}

export function frameworkHints(specs, manifest = loadDependencyManifest()) {
  return specs.map((spec) => ({
    slug: spec.slug,
    hints: manifest.frameworkHints?.[spec.slug] || []
  }));
}
