import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { dataHome, ensureDirSync, writeFileAtomic, timestamp } from './util.js';

export const STATE_VERSION = 1;

export function stateFile() {
  return path.join(dataHome(), 'state.json');
}

export function lockDir() {
  return path.join(dataHome(), '.lock');
}

export function backupsRoot() {
  return path.join(dataHome(), 'backups');
}

export function logsRoot() {
  return path.join(dataHome(), 'logs');
}

export function pendingKeysFile() {
  return path.join(dataHome(), 'pending-keys.sh');
}

export function stateBackupFile() {
  return `${stateFile()}.bak`;
}

function parseStateFile(file) {
  const state = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!state.skills) state.skills = {};
  if (!state.repos) state.repos = {};
  if (!state.schemaVersion) state.schemaVersion = STATE_VERSION;
  return state;
}

export function loadState() {
  try {
    return parseStateFile(stateFile());
  } catch (error) {
    try {
      const recovered = parseStateFile(stateBackupFile());
      recovered._recovered = true;
      return recovered;
    } catch {
      return {
        schemaVersion: STATE_VERSION,
        skills: {},
        repos: {},
        _corrupt: error.code === 'ENOENT' ? null : String(error.message || error)
      };
    }
  }
}

export async function saveState(state) {
  const { _corrupt, _recovered, ...clean } = state;
  try {
    await fsp.copyFile(stateFile(), stateBackupFile());
  } catch { /* first write */ }
  await writeFileAtomic(stateFile(), `${JSON.stringify(clean, null, 2)}\n`, 0o600);
}

function readLock() {
  try {
    return JSON.parse(fs.readFileSync(path.join(lockDir(), 'lock.json'), 'utf8'));
  } catch {
    return null;
  }
}

export async function acquireLock() {
  ensureDirSync(dataHome());
  try {
    fs.mkdirSync(lockDir());
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    const lock = readLock();
    let dirAge = 0;
    try { dirAge = Date.now() - fs.statSync(lockDir()).mtimeMs; } catch { /* raced */ }
    const age = lock && lock.time ? Date.now() - Date.parse(lock.time) : dirAge;
    let alive = false;
    if (lock?.pid) {
      try { process.kill(lock.pid, 0); alive = true; } catch { alive = false; }
    }
    const stale = (lock && !alive) || age > 60 * 60 * 1000 || (!lock && dirAge > 60 * 1000);
    if (stale) {
      await fsp.rm(lockDir(), { recursive: true, force: true });
      fs.mkdirSync(lockDir());
    } else {
      throw new Error(`另一个 selected-skills 进程正在运行（pid ${lock?.pid || 'unknown'}）；如确认已退出，删除 ${lockDir()}`);
    }
  }
  fs.writeFileSync(path.join(lockDir(), 'lock.json'), JSON.stringify({ pid: process.pid, time: new Date().toISOString() }));
}

export async function releaseLock() {
  const lock = readLock();
  if (lock && lock.pid && lock.pid !== process.pid) return; // a newer owner took over
  await fsp.rm(lockDir(), { recursive: true, force: true });
}

export async function withLock(fn) {
  await acquireLock();
  try {
    return await fn();
  } finally {
    await releaseLock();
  }
}

export function recordInstall(state, spec, platformName, details) {
  const slug = details.slug || spec.slug;
  if (!state.skills[slug]) {
    state.skills[slug] = {
      slug,
      name: spec.name || slug,
      repo: spec.repo,
      path: spec.path || '',
      kind: spec.kind || 'skill',
      source: spec.source || '',
      license: spec.license || 'unknown',
      collection: details.collection || null,
      platforms: {}
    };
  }
  const record = state.skills[slug];
  record.repo = spec.repo;
  record.path = details.path !== undefined ? details.path : spec.path || '';
  record.collection = details.collection || record.collection || null;
  record.platforms[platformName] = {
    dir: details.dir,
    method: details.method || 'copy',
    sourceHash: details.sourceHash || '',
    installedHash: details.installedHash || '',
    installedAt: new Date().toISOString()
  };
}

export function removeInstall(state, slug, platformName) {
  const record = state.skills[slug];
  if (!record) return;
  delete record.platforms[platformName];
  if (Object.keys(record.platforms).length === 0) delete state.skills[slug];
}

export function backupPath(platformName, slug) {
  return path.join(backupsRoot(), platformName, `${slug}-${timestamp()}`);
}

export async function pruneBackups(keep = 3) {
  const root = backupsRoot();
  if (!fs.existsSync(root)) return;
  for (const platform of await fsp.readdir(root)) {
    const dir = path.join(root, platform);
    const stat = await fsp.stat(dir).catch(() => null);
    if (!stat?.isDirectory()) continue;
    const entries = (await fsp.readdir(dir)).sort().reverse();
    for (const stale of entries.slice(keep)) {
      await fsp.rm(path.join(dir, stale), { recursive: true, force: true });
    }
  }
}
