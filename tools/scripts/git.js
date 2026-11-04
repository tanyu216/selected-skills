import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { dataHome, ensureDir, isPathInside, run, runCapture, commandExists, timestamp } from './util.js';

export function sourcesRoot() {
  return path.join(dataHome(), 'sources', 'github.com');
}

export function repoDir(repo) {
  return path.join(sourcesRoot(), ...repo.split('/'));
}

export function repoUrl(repo) {
  return `https://github.com/${repo}.git`;
}

export function hasGit() {
  return commandExists('git');
}

export function hasTar() {
  return commandExists('tar');
}

function sparsePatterns(paths) {
  if (!paths.length || paths.includes('')) return null; // full checkout
  const patterns = new Set();
  for (const item of paths) {
    patterns.add(`/${item}`);
    patterns.add(`/${item}/**`);
  }
  return [...patterns];
}

async function git(args, options = {}) {
  return run('git', args, options);
}

async function cloneSparse(repo, target, paths) {
  const patterns = sparsePatterns(paths);
  if (!patterns) return false;
  const temp = `${target}.tmp-${process.pid}-${Date.now()}`;
  await fsp.rm(temp, { recursive: true, force: true });
  const clone = await git(['clone', '--depth=1', '--filter=blob:none', '--no-checkout', repoUrl(repo), temp]);
  if (!clone.ok) {
    await fsp.rm(temp, { recursive: true, force: true });
    return false;
  }
  const init = await git(['-C', temp, 'sparse-checkout', 'init', '--no-cone']);
  const set = init.ok ? await git(['-C', temp, 'sparse-checkout', 'set', '--no-cone', ...patterns]) : { ok: false };
  const checkout = set.ok ? await git(['-C', temp, 'checkout', '-q']) : { ok: false };
  if (!checkout.ok) {
    await fsp.rm(temp, { recursive: true, force: true });
    return false;
  }
  await fsp.rm(target, { recursive: true, force: true });
  await fsp.rename(temp, target);
  return true;
}

async function cloneFull(repo, target) {
  const temp = `${target}.tmp-${process.pid}-${Date.now()}`;
  await fsp.rm(temp, { recursive: true, force: true });
  const clone = await git(['clone', '--depth=1', repoUrl(repo), temp]);
  if (!clone.ok) {
    await fsp.rm(temp, { recursive: true, force: true });
    return false;
  }
  await fsp.rm(target, { recursive: true, force: true });
  await fsp.rename(temp, target);
  return true;
}

function assertNoEscapingSymlinks(root) {
  const walk = (current) => {
    let entries;
    try { entries = fs.readdirSync(current, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      const stat = fs.lstatSync(full);
      if (stat.isSymbolicLink()) {
        const link = fs.readlinkSync(full);
        const resolved = path.resolve(current, link);
        const real = fs.existsSync(resolved) ? fs.realpathSync(resolved) : resolved;
        if (!isPathInside(root, real)) {
          throw new Error(`tarball 包含越界 symlink: ${full} -> ${link}`);
        }
      } else if (stat.isDirectory()) {
        walk(full);
      }
    }
  };
  walk(root);
}

async function downloadTarball(repo, target) {
  if (!hasTar()) throw new Error('没有 git，也没有 tar，无法下载上游仓库');
  const tempFile = path.join(dataHome(), 'sources', `.${repo.replaceAll('/', '--')}-${timestamp()}.tar.gz`);
  const tempDir = `${target}.tmp-${process.pid}-${Date.now()}`;
  await ensureDir(path.dirname(tempFile));
  await fsp.rm(tempDir, { recursive: true, force: true });
  await ensureDir(tempDir);

  try {
    const response = await fetch(`https://codeload.github.com/${repo}/tar.gz/HEAD`);
    if (!response.ok || !response.body) {
      throw new Error(`下载 ${repo} 失败: HTTP ${response.status}`);
    }
    await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(tempFile));

    const listing = await run('tar', ['-tzf', tempFile]);
    if (!listing.ok) throw new Error(`无法读取 ${repo} 的 tarball`);
    for (const entry of listing.stdout.split(/\r?\n/)) {
      if (!entry) continue;
      if (entry.startsWith('/') || entry.split('/').includes('..')) {
        throw new Error(`tarball 包含越界路径: ${entry}`);
      }
    }
    const extract = await run('tar', ['-xzf', tempFile, '-C', tempDir, '--strip-components=1']);
    if (!extract.ok) throw new Error(`解压 ${repo} 失败: ${extract.stderr}`);
    assertNoEscapingSymlinks(tempDir);

    await fsp.rm(target, { recursive: true, force: true });
    await fsp.rename(tempDir, target);
  } catch (error) {
    await fsp.rm(tempFile, { force: true });
    await fsp.rm(tempDir, { recursive: true, force: true });
    throw error;
  } finally {
    await fsp.rm(tempFile, { force: true });
  }
}

export async function ensureRepo(repo, { paths = [], offline = false } = {}) {
  const target = repoDir(repo);
  if (fs.existsSync(path.join(target, '.git'))) {
    await addSparsePaths(repo, paths);
    return target;
  }
  if (fs.existsSync(target) && fs.readdirSync(target).length > 0 && !fs.existsSync(path.join(target, '.git'))) {
    // Existing tarball cache; treat as usable.
    return target;
  }
  if (offline) throw new Error(`--offline 但本地没有 ${repo} 的缓存`);

  await ensureDir(path.dirname(target));
  let ok = false;
  if (hasGit()) {
    ok = await cloneSparse(repo, target, paths);
    if (!ok) ok = await cloneFull(repo, target);
  }
  if (!ok) await downloadTarball(repo, target);
  return target;
}

export async function addSparsePaths(repo, paths) {
  if (!paths.length) return;
  const target = repoDir(repo);
  const sparse = await runCapture('git', ['-C', target, 'config', '--bool', 'core.sparseCheckout']);
  if (!sparse.ok || sparse.stdout.trim() !== 'true') return;
  if (paths.includes('')) {
    // A root-level skill needs the whole checkout, not the sparse subset.
    await runCapture('git', ['-C', target, 'sparse-checkout', 'disable']);
    await runCapture('git', ['-C', target, 'checkout', '-q']);
    return;
  }
  const current = await runCapture('git', ['-C', target, 'sparse-checkout', 'list']);
  const patterns = new Set(current.ok ? current.stdout.split(/\r?\n/).filter(Boolean) : []);
  for (const pattern of sparsePatterns(paths) || []) patterns.add(pattern);
  await runCapture('git', ['-C', target, 'sparse-checkout', 'set', '--no-cone', ...patterns]);
}

async function recloneWithBackup(repo) {
  const target = repoDir(repo);
  const old = `${target}.old-${process.pid}-${Date.now()}`;
  const hadOld = fs.existsSync(target);
  if (hadOld) await fsp.rename(target, old);
  try {
    const dir = await ensureRepo(repo);
    if (hadOld) await fsp.rm(old, { recursive: true, force: true });
    return dir;
  } catch (error) {
    await fsp.rm(target, { recursive: true, force: true });
    if (hadOld && fs.existsSync(old)) await fsp.rename(old, target);
    throw error;
  }
}

export async function updateRepo(repo, { offline = false } = {}) {
  const target = repoDir(repo);
  if (offline) {
    if (!fs.existsSync(target)) throw new Error(`--offline 但本地没有 ${repo} 的缓存`);
    return { ok: true, recloned: false };
  }
  if (!fs.existsSync(path.join(target, '.git'))) {
    await recloneWithBackup(repo);
    return { ok: true, recloned: true };
  }
  const fetch = await git(['-C', target, 'fetch', '--depth=1', 'origin', 'HEAD']);
  if (!fetch.ok) {
    await recloneWithBackup(repo);
    return { ok: true, recloned: true, reason: fetch.stderr.trim() };
  }
  const reset = await git(['-C', target, 'reset', '--hard', 'FETCH_HEAD']);
  if (!reset.ok) {
    await recloneWithBackup(repo);
    return { ok: true, recloned: true, reason: reset.stderr.trim() };
  }
  return { ok: true, recloned: false };
}

export async function repoCommit(repo) {
  const result = await runCapture('git', ['-C', repoDir(repo), 'rev-parse', 'HEAD']);
  return result.ok ? result.stdout.trim() : null;
}

export async function repoDirty(repo) {
  const result = await runCapture('git', ['-C', repoDir(repo), 'status', '--porcelain']);
  return result.ok ? result.stdout.trim() : '';
}

export async function repoHasSubmodulesOrLfs(repo) {
  const dir = repoDir(repo);
  const warnings = [];
  if (fs.existsSync(path.join(dir, '.gitmodules'))) warnings.push('包含 .gitmodules（submodule），复制可能不完整');
  try {
    const attrs = fs.readFileSync(path.join(dir, '.gitattributes'), 'utf8');
    if (/filter=lfs/.test(attrs)) warnings.push('包含 Git LFS 规则，复制可能不完整');
  } catch { /* ignore */ }
  return warnings;
}

export function ensureRepoPathInside(repo, relativePath) {
  const full = path.join(repoDir(repo), relativePath);
  if (!isPathInside(repoDir(repo), full)) throw new Error(`路径越界: ${relativePath}`);
  return full;
}
