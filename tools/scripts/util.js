import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const TOOLS_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const PACKAGE_ROOT = path.resolve(TOOLS_ROOT, '..');
export const IS_WINDOWS = process.platform === 'win32';

export function packagePath(...parts) {
  return path.join(PACKAGE_ROOT, ...parts);
}

export function toolPath(...parts) {
  return path.join(TOOLS_ROOT, ...parts);
}

export function homeDir() {
  return process.env.HOME || process.env.USERPROFILE || os.homedir();
}

export function dataHome() {
  return process.env.SELECTED_SKILLS_HOME || path.join(homeDir(), '.selected-skills');
}

export function expandHome(value) {
  if (!value) return value;
  if (value === '~') return homeDir();
  if (value.startsWith('~/') || value.startsWith('~\\')) return path.join(homeDir(), value.slice(2));
  return value;
}

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true });
}

export function ensureDirSync(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function isValidSlug(slug) {
  return typeof slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 64;
}

export function assertSafeRelativePath(value, label = 'path') {
  if (typeof value !== 'string') throw new Error(`${label} 必须是字符串`);
  const normalized = value.replaceAll('\\', '/');
  if (normalized.startsWith('/') || /^[a-zA-Z]:/.test(normalized)) {
    throw new Error(`${label} 不允许绝对路径: ${value}`);
  }
  if (normalized.split('/').includes('..')) {
    throw new Error(`${label} 不允许包含 ..: ${value}`);
  }
  return normalized.replace(/^\.\//, '').replace(/\/+$/, '');
}

export function isPathInside(parent, child) {
  const rel = path.relative(path.resolve(parent), path.resolve(child));
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

export function commandExists(command) {
  const probe = IS_WINDOWS ? 'where' : 'which';
  const result = spawnSync(probe, [command], { stdio: 'ignore' });
  return result.status === 0;
}

export function run(command, args = [], options = {}) {
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn(command, args, {
        cwd: options.cwd,
        env: { ...process.env, ...(options.env || {}) },
        stdio: options.inherit ? 'inherit' : ['ignore', 'pipe', 'pipe']
      });
    } catch (error) {
      resolve({ ok: false, code: -1, stdout: '', stderr: String(error.message || error) });
      return;
    }
    let stdout = '';
    let stderr = '';
    if (child.stdout) child.stdout.on('data', (chunk) => { stdout += chunk; });
    if (child.stderr) child.stderr.on('data', (chunk) => { stderr += chunk; });
    let timer = null;
    if (options.timeout) {
      timer = setTimeout(() => child.kill('SIGTERM'), options.timeout);
    }
    child.on('error', (error) => {
      if (timer) clearTimeout(timer);
      resolve({ ok: false, code: -1, stdout, stderr: String(error.message || error) });
    });
    child.on('close', (code) => {
      if (timer) clearTimeout(timer);
      resolve({ ok: code === 0, code, stdout, stderr });
    });
  });
}

export function runCapture(command, args = [], options = {}) {
  return run(command, args, { ...options, inherit: false });
}

export async function writeFileAtomic(file, content, mode = 0o644) {
  const dir = path.dirname(file);
  await ensureDir(dir);
  const tmp = path.join(dir, `.tmp-${process.pid}-${Date.now()}-${path.basename(file)}`);
  await fsp.writeFile(tmp, content);
  await fsp.chmod(tmp, mode).catch(() => {});
  await fsp.rename(tmp, file);
}

export function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export function parseList(value) {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value.flatMap(parseList);
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function uniq(values) {
  return [...new Set(values)];
}

export function dirSize(dir) {
  let total = 0;
  let files = 0;
  const walk = (current) => {
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isSymbolicLink()) {
        files += 1;
      } else if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile()) {
        files += 1;
        try { total += fs.statSync(full).size; } catch { /* ignore */ }
      }
    }
  };
  walk(dir);
  return { bytes: total, files };
}

export function sha256Text(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

const DEFAULT_EXCLUDES = new Set(['.git', '.github', 'node_modules']);

export async function hashDir(dir, { exclude = DEFAULT_EXCLUDES } = {}) {
  const hash = crypto.createHash('sha256');
  const walk = async (current, rel) => {
    let entries;
    try {
      entries = await fsp.readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (exclude.has(entry.name)) continue;
      const full = path.join(current, entry.name);
      const relative = rel ? `${rel}/${entry.name}` : entry.name;
      const stat = await fsp.lstat(full);
      if (stat.isSymbolicLink()) {
        hash.update(`L:${relative}:`);
        hash.update(await fsp.readlink(full));
      } else if (stat.isDirectory()) {
        hash.update(`D:${relative}\n`);
        await walk(full, relative);
      } else if (stat.isFile()) {
        hash.update(`F:${relative}:${stat.mode & 0o777}:`);
        hash.update(await fsp.readFile(full));
        hash.update('\n');
      }
    }
  };
  await walk(dir, '');
  return hash.digest('hex');
}

async function containsSkillMd(dir) {
  try {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    return entries.some((entry) => entry.isFile() && entry.name === 'SKILL.md');
  } catch {
    return false;
  }
}

/**
 * Copy a skill directory.
 * - excludes .git/.github/node_modules
 * - preserves file modes
 * - preserves internal symlinks, skips symlinks escaping the source root
 * - for root-level skills, skips nested directories that contain their own SKILL.md
 */
export async function copySkillDir(src, dest, options = {}) {
  const excludes = new Set(options.exclude || DEFAULT_EXCLUDES);
  const warnings = options.warnings || [];
  const sourceRoot = path.resolve(src);
  const skipNestedSkillDirs = Boolean(options.skipNestedSkillDirs);

  const walk = async (current, target, depth) => {
    await fsp.mkdir(target, { recursive: true });
    const entries = await fsp.readdir(current, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (excludes.has(entry.name)) continue;
      const from = path.join(current, entry.name);
      const to = path.join(target, entry.name);
      const stat = await fsp.lstat(from);
      if (stat.isSymbolicLink()) {
        const linkTarget = await fsp.readlink(from);
        const resolved = path.resolve(current, linkTarget);
        if (!isPathInside(sourceRoot, resolved)) {
          warnings.push(`跳过越界 symlink: ${from} -> ${linkTarget}`);
          continue;
        }
        try {
          await fsp.symlink(linkTarget, to);
        } catch {
          const targetStat = await fsp.stat(from).catch(() => null);
          if (targetStat?.isFile()) await fsp.copyFile(from, to);
          else if (targetStat?.isDirectory()) await copySkillDir(from, to, { ...options, skipNestedSkillDirs: false });
          else warnings.push(`无法复制 symlink: ${from}`);
        }
        continue;
      }
      if (stat.isDirectory()) {
        if (skipNestedSkillDirs && await containsSkillMd(from)) {
          warnings.push(`根目录 skill 跳过嵌套 SKILL.md 子目录: ${from}`);
          continue;
        }
        await walk(from, to, depth + 1);
      } else if (stat.isFile()) {
        await fsp.copyFile(from, to);
        await fsp.chmod(to, stat.mode & 0o777).catch(() => {});
      }
    }
  };

  await walk(sourceRoot, dest, 0);
  return warnings;
}

export async function listSkillDirs(root) {
  const results = [];
  const walk = async (current) => {
    let entries;
    try {
      entries = await fsp.readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    if (await containsSkillMd(current)) {
      results.push(current);
      return;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (DEFAULT_EXCLUDES.has(entry.name)) continue;
      await walk(path.join(current, entry.name));
    }
  };
  await walk(root);
  return results;
}

export function colorize(enabled, code, text) {
  return enabled ? `\u001b[${code}m${text}\u001b[0m` : text;
}
