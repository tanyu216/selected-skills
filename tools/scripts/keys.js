import fs from 'node:fs';
import path from 'node:path';
import { ensureDirSync, run, IS_WINDOWS } from './util.js';
import { pendingKeysFile } from './state.js';
import { secret, confirm, isTTY } from './prompt.js';

function keyPresent(key) {
  if (process.env[key.env]) return true;
  return false;
}

async function keyCheck(key) {
  if (!key.check || key.check.length === 0) return false;
  const result = await run(key.check[0], key.check.slice(1), { timeout: 30_000 });
  if (!result.ok) return false;
  if (key.checkExpect) {
    if (new RegExp(key.checkExpect, 'i').test(result.stdout)) return true;
    if (/not authenticated|unauthenticated|no api key/i.test(result.stdout)) return false;
    return true;
  }
  return true;
}

function shellHint(key) {
  const fallback = key.skipHint || `export ${key.env}=your_value_here`;
  if (!IS_WINDOWS) return fallback;
  const exportMatch = fallback.match(/^export\s+\w+=(.*)$/s);
  if (exportMatch) return `$env:${key.env}="${exportMatch[1]}"`;
  return fallback;
}

function appendPending(hint) {
  const file = pendingKeysFile();
  ensureDirSync(path.dirname(file));
  let existing = '';
  try { existing = fs.readFileSync(file, 'utf8'); } catch { /* ignore */ }
  const lines = existing.split(/\r?\n/).filter(Boolean);
  if (lines.includes(hint)) return file;
  const header = existing ? '' : '#!/usr/bin/env bash\n# selected-skills: 跳过的 key 配置示例（占位符，请替换后执行）\n';
  fs.writeFileSync(file, `${header}${lines.join('\n')}${lines.length ? '\n' : ''}${hint}\n`, { mode: 0o600 });
  fs.chmodSync(file, 0o600);
  return file;
}

export async function configureKeys(keys, {
  yes = false,
  dryRun = false,
  keyValues = {},
  confirmInstall = async (question) => confirm(question)
} = {}) {
  const results = [];
  if (keys.length === 0) return results;

  for (const key of keys) {
    if (keyPresent(key) || await keyCheck(key)) {
      results.push({ id: key.id, status: 'present' });
      continue;
    }

    let value = keyValues[key.id] || '';
    if (!value && !yes && !dryRun && isTTY()) {
      const proceed = await confirmInstall(`配置 ${key.label}（${key.env}）？回车跳过也可`);
      if (proceed) value = await secret(`${key.label}（输入后回车；直接回车跳过）: `);
    }

    if (!value) {
      results.push({ id: key.id, status: 'skipped', hint: shellHint(key) });
      if (!dryRun) appendPending(shellHint(key));
      continue;
    }

    if (dryRun) {
      results.push({ id: key.id, status: 'dry-run', env: key.env });
      continue;
    }

    if (!key.configure) {
      results.push({ id: key.id, status: 'skipped', hint: shellHint(key) });
      appendPending(shellHint(key));
      continue;
    }

    const args = key.configure.map((part) => part.replaceAll('{key}', value));
    const result = await run(args[0], args.slice(1), { env: { [key.env]: value }, inherit: false });
    if (result.ok) {
      results.push({ id: key.id, status: 'configured' });
    } else {
      const error = (result.stderr.trim() || `退出码 ${result.code}`).replaceAll(value, '***');
      results.push({ id: key.id, status: 'failed', error, hint: shellHint(key) });
      appendPending(shellHint(key));
    }
  }
  return results;
}

export function pendingKeysLocation() {
  return pendingKeysFile();
}
