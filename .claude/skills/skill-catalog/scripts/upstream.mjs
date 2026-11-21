#!/usr/bin/env node
// Upstream clone and inventory helper for the skill-catalog skill.
//
// Manages read-only GitHub copies under <project>/.github-clones/<owner>/<repo>,
// and scans them for SKILL.md inventory before a card is written.
// No third-party dependencies; Node >= 18, ESM.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CLONES_DIR = '.github-clones';
const GITHUB_HOSTS = new Set(['github.com', 'www.github.com']);
const GIT_ENV = { GIT_TERMINAL_PROMPT: '0', GIT_LFS_SKIP_SMUDGE: '1' };
const SKIP_DIRS = new Set([
  '.git',
  '.hg',
  '.svn',
  'node_modules',
  '.venv',
  'venv',
  'dist',
  'build',
  'coverage',
  'target',
  'vendor',
  '__pycache__',
  '.next',
  '.nuxt',
  '.cache',
  '.turbo',
  '.pytest_cache',
  'out',
]);

class UserError extends Error {}

function fail(message) {
  throw new UserError(message);
}

function out(line = '') {
  process.stdout.write(`${line}\n`);
}

function run(cmd, args, opts = {}) {
  const { env, ...rest } = opts;
  const res = spawnSync(cmd, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...rest,
    env: { ...process.env, ...GIT_ENV, ...(env || {}) },
  });
  if (res.error) {
    return { status: 127, stdout: '', stderr: res.error.message };
  }
  return res;
}

function gitValue(dir, args) {
  const res = run('git', ['-C', dir, ...args]);
  return res.status === 0 ? res.stdout.trim() : null;
}

function rel(root, target) {
  return path.relative(root, target).split(path.sep).join('/');
}

function projectRoot() {
  const res = run('git', ['rev-parse', '--show-toplevel']);
  if (res.status === 0 && res.stdout.trim()) return path.resolve(res.stdout.trim());
  return process.cwd();
}

function clonesRoot(root) {
  return path.join(root, CLONES_DIR);
}

function isGitRepo(dir) {
  if (!fs.existsSync(dir)) return false;
  const res = run('git', ['-C', dir, 'rev-parse', '--is-inside-work-tree']);
  return res.status === 0 && res.stdout.trim() === 'true';
}

function headInfo(dir) {
  const head = gitValue(dir, ['rev-parse', '--short', 'HEAD']) || '?';
  const branch = gitValue(dir, ['rev-parse', '--abbrev-ref', 'HEAD']) || '?';
  if (branch === 'HEAD') {
    const tag = gitValue(dir, ['describe', '--tags', '--exact-match', 'HEAD']);
    return { head, branch: tag || 'detached', detached: true };
  }
  return { head, branch, detached: false };
}

// ---------- repository spec parsing ----------

function decodePart(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function cleanSubpath(value) {
  if (!value) return null;
  const cleaned = path.posix.normalize(String(value).replace(/^\/+/, ''));
  if (
    !cleaned ||
    cleaned === '.' ||
    cleaned === '..' ||
    cleaned.startsWith('../') ||
    path.posix.isAbsolute(cleaned)
  ) {
    fail(`子目录不合法：${value}`);
  }
  return cleaned;
}

function makeSpec(owner, repo, ref = null, subpath = null) {
  const cleanOwner = String(owner || '').trim();
  const cleanRepo = String(repo || '').trim().replace(/\.git$/i, '');

  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(cleanOwner)) {
    fail(`不是合法的 GitHub owner：${owner}`);
  }
  if (
    !/^[A-Za-z0-9._-]+$/.test(cleanRepo) ||
    cleanRepo === '.' ||
    cleanRepo === '..'
  ) {
    fail(`不是合法的 GitHub 仓库名：${repo}`);
  }

  return {
    owner: cleanOwner,
    repo: cleanRepo,
    ref: ref || null,
    subpath: cleanSubpath(subpath),
    url: `https://github.com/${cleanOwner}/${cleanRepo}.git`,
    display: `${cleanOwner}/${cleanRepo}`,
  };
}

function parseSpec(raw) {
  if (!raw) fail('缺少仓库地址');

  const input = String(raw).trim().replace(/^["']|["']$/g, '');
  let match = input.match(/^git@github\.com:([^/\s]+)\/([^/\s]+?)(?:\.git)?$/i);
  if (match) return makeSpec(match[1], match[2]);

  if (/^(https?:\/\/|(www\.)?github\.com\/)/i.test(input)) {
    const urlText = /^https?:\/\//i.test(input) ? input : `https://${input}`;
    let parsed;
    try {
      parsed = new URL(urlText);
    } catch {
      fail(`无法解析仓库地址：${raw}`);
    }
    if (!GITHUB_HOSTS.has(parsed.hostname.toLowerCase())) {
      fail(`只支持 github.com，收到：${parsed.hostname}`);
    }

    const parts = parsed.pathname.split('/').filter(Boolean).map(decodePart);
    if (parts.length < 2) fail(`仓库地址缺少 owner/repo：${raw}`);

    let ref = null;
    let subpath = null;
    if (parts[2] === 'tree' && parts[3]) {
      ref = parts[3];
      subpath = parts.slice(4).join('/') || null;
    } else if (parts[2] === 'blob' && parts[3]) {
      ref = parts[3];
      subpath = parts.slice(4, -1).join('/') || null;
    }

    return makeSpec(parts[0], parts[1], ref, subpath);
  }

  match = input.match(/^([^/\s]+)\/([^/\s]+?)(?:\.git)?(?:@([^/\s]+))?$/);
  if (match) return makeSpec(match[1], match[2], match[3] || null);

  fail(
    `无法识别的仓库地址：${raw}。支持完整 URL、owner/repo 或 git@github.com:owner/repo.git`,
  );
}

function sameRepo(a, b) {
  return (
    a.owner.toLowerCase() === b.owner.toLowerCase() &&
    a.repo.toLowerCase() === b.repo.toLowerCase()
  );
}

function specFromRemote(remote) {
  try {
    return parseSpec(remote);
  } catch {
    return null;
  }
}

// ---------- paths and safety ----------

function targetPath(root, spec) {
  return path.join(clonesRoot(root), spec.owner, spec.repo);
}

function assertInside(root, target) {
  const base = path.resolve(clonesRoot(root));
  const resolved = path.resolve(target);
  const relative = path.relative(base, resolved);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    fail(`拒绝操作 ${CLONES_DIR} 之外的路径：${target}`);
  }
}

function ensureClonesRoot(root) {
  const dir = clonesRoot(root);
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (error) {
    fail(`无法创建 ${CLONES_DIR}：${error.message}`);
  }
  return fs.realpathSync(dir);
}

function ensureDirInside(root, dir) {
  const baseReal = ensureClonesRoot(root);
  let probe = path.resolve(dir);

  while (!fs.existsSync(probe)) {
    const parent = path.dirname(probe);
    if (parent === probe) fail(`无法创建目录：${dir}`);
    probe = parent;
  }

  const probeReal = fs.realpathSync(probe);
  if (probeReal !== baseReal && !probeReal.startsWith(baseReal + path.sep)) {
    fail(`拒绝：${dir} 位于 ${CLONES_DIR} 之外`);
  }

  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (error) {
    fail(`无法创建目录 ${dir}：${error.message}`);
  }

  const dirReal = fs.realpathSync(dir);
  if (dirReal !== baseReal && !dirReal.startsWith(baseReal + path.sep)) {
    fail(`拒绝：${dir} 链接到 ${CLONES_DIR} 之外`);
  }
}

function assertTargetRealInside(root, target) {
  const baseReal = ensureClonesRoot(root);
  const targetReal = fs.realpathSync(target);
  if (targetReal !== baseReal && !targetReal.startsWith(baseReal + path.sep)) {
    fail(`拒绝：${rel(root, target)} 链接到 ${CLONES_DIR} 之外`);
  }
}

function findExisting(root, spec) {
  const base = clonesRoot(root);
  if (!fs.existsSync(base)) return null;

  const ownerEntry = fs
    .readdirSync(base, { withFileTypes: true })
    .find(
      (entry) =>
        entry.isDirectory() &&
        entry.name.toLowerCase() === spec.owner.toLowerCase(),
    );
  if (!ownerEntry) return null;

  const ownerDir = path.join(base, ownerEntry.name);
  const repoEntry = fs
    .readdirSync(ownerDir, { withFileTypes: true })
    .find(
      (entry) =>
        entry.isDirectory() &&
        entry.name.toLowerCase() === spec.repo.toLowerCase(),
    );
  return repoEntry ? path.join(ownerDir, repoEntry.name) : null;
}

function listTargets(root) {
  const base = clonesRoot(root);
  if (!fs.existsSync(base)) return [];

  const targets = [];
  for (const ownerEntry of fs.readdirSync(base, { withFileTypes: true })) {
    if (!ownerEntry.isDirectory()) continue;
    const ownerDir = path.join(base, ownerEntry.name);
    for (const repoEntry of fs.readdirSync(ownerDir, { withFileTypes: true })) {
      if (!repoEntry.isDirectory()) continue;
      targets.push(path.join(ownerDir, repoEntry.name));
    }
  }
  return targets.sort();
}

function resolveExisting(root, input) {
  if (!input) fail('缺少仓库（owner/repo 或 .github-clones 内的路径）');

  const asPath = path.resolve(process.cwd(), input);
  if (fs.existsSync(asPath)) {
    try {
      assertInside(root, asPath);
      return asPath;
    } catch (error) {
      if (!(error instanceof UserError)) throw error;
      // Not a clones path; fall through and try parsing it as owner/repo.
    }
  }

  const spec = parseSpec(input);
  const found = findExisting(root, spec);
  if (!found) {
    fail(`未找到 ${spec.display} 的本地副本（${CLONES_DIR}/${spec.owner}/${spec.repo}）`);
  }
  return found;
}

function discardCreated(target) {
  try {
    fs.rmSync(target, { recursive: true, force: true });
  } catch {
    // Best effort. The caller is already on an error path.
  }
}

function ensureIgnored(root) {
  const inside = run('git', ['-C', root, 'rev-parse', '--is-inside-work-tree']);
  if (inside.status !== 0 || inside.stdout.trim() !== 'true') return 'not-a-repo';

  const check = run('git', ['-C', root, 'check-ignore', '-q', `${CLONES_DIR}/`]);
  if (check.status === 0) return 'already';

  const gitPath = run('git', ['-C', root, 'rev-parse', '--git-path', 'info/exclude']);
  if (gitPath.status !== 0 || !gitPath.stdout.trim()) return 'failed';

  let excludePath = gitPath.stdout.trim();
  if (!path.isAbsolute(excludePath)) excludePath = path.resolve(root, excludePath);

  fs.mkdirSync(path.dirname(excludePath), { recursive: true });
  let body = fs.existsSync(excludePath) ? fs.readFileSync(excludePath, 'utf8') : '';
  const lines = body.split(/\r?\n/).map((line) => line.trim());
  if (lines.includes(`${CLONES_DIR}/`) || lines.includes(CLONES_DIR)) return 'already';

  if (body && !body.endsWith('\n')) body += '\n';
  body += `${CLONES_DIR}/\n`;
  fs.writeFileSync(excludePath, body);
  return 'added';
}

function reportIgnore(ignore) {
  if (ignore === 'added') out(`已把 ${CLONES_DIR}/ 加入 .git/info/exclude`);
  else if (ignore === 'already') out(`${CLONES_DIR}/ 已在 ignore 规则中`);
  else if (ignore === 'not-a-repo') out(`提示：当前目录不是 git 仓库，未设置 ignore`);
  else out(`警告：未能确认 ${CLONES_DIR}/ 是否被忽略`);
}

// ---------- inventory ----------

function readText(file, max = 128 * 1024) {
  try {
    return fs.readFileSync(file, 'utf8').slice(0, max);
  } catch {
    return '';
  }
}

function truncate(text, max) {
  const oneLine = String(text).replace(/\s+/g, ' ').trim();
  return oneLine.length > max ? `${oneLine.slice(0, max - 1)}…` : oneLine;
}

function parseFrontmatter(text) {
  const block = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
  if (!block) return {};

  const data = {};
  const lines = block[1].split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!match) continue;

    const key = match[1];
    let value = match[2].trim();

    if (/^[>|][+-]?$/.test(value)) {
      const parts = [];
      while (i + 1 < lines.length && /^\s+/.test(lines[i + 1])) {
        parts.push(lines[i + 1].trim());
        i += 1;
      }
      value = parts.join(' ').trim();
    } else if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    data[key] = value;
  }
  return data;
}

function findSkillFiles(dir) {
  const found = [];

  function walk(current) {
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(full);
      } else if (entry.isFile() && /^SKILL\.md$/i.test(entry.name)) {
        found.push(full);
      }
    }
  }

  walk(dir);
  return found.sort();
}

function matchLicense(text) {
  const t = text.toLowerCase();
  if (t.includes('gnu affero general public license')) return 'AGPL-3.0';
  if (t.includes('gnu lesser general public license')) {
    return /version 3/.test(t) ? 'LGPL-3.0' : /version 2\.1/.test(t) ? 'LGPL-2.1' : 'LGPL-3.0';
  }
  if (t.includes('gnu general public license') && /version 3/.test(t)) return 'GPL-3.0';
  if (t.includes('gnu general public license') && /version 2/.test(t)) return 'GPL-2.0';
  if (t.includes('apache license') && /version 2\.0/.test(t)) return 'Apache-2.0';
  if (t.includes('mozilla public license') && /2\.0/.test(t)) return 'MPL-2.0';
  if (
    t.includes('mit license') ||
    t.includes('permission is hereby granted, free of charge')
  ) {
    return 'MIT';
  }
  if (t.includes('redistribution and use in source and binary forms')) {
    return /neither the name/.test(t) ? 'BSD-3-Clause' : 'BSD-2-Clause';
  }
  if (t.includes('permission to use, copy, modify, and/or distribute this software')) {
    return 'ISC';
  }
  if (
    t.includes('this is free and unencumbered software released into the public domain')
  ) {
    return 'Unlicense';
  }
  if (t.includes('cc0 1.0')) return 'CC0-1.0';
  if (t.includes('creative commons attribution 4.0')) return 'CC-BY-4.0';
  return null;
}

function detectLicense(dir) {
  let names = [];
  try {
    names = fs.readdirSync(dir);
  } catch {
    names = [];
  }

  const files = names
    .filter((name) => /^(LICEN[CS]E|COPYING|UNLICENSE)/i.test(name))
    .map((name) => path.join(dir, name))
    .filter((file) => {
      try {
        return fs.statSync(file).isFile();
      } catch {
        return false;
      }
    });

  if (files.length > 0) {
    const text = files.map((file) => readText(file)).join('\n');
    const id = matchLicense(text);
    const evidence = files.map((file) => path.basename(file)).join(', ');
    return { id: id || 'unknown', evidence: id ? evidence : `${evidence}（未识别）` };
  }

  try {
    const pkg = JSON.parse(readText(path.join(dir, 'package.json')));
    if (pkg.license) return { id: String(pkg.license), evidence: 'package.json' };
  } catch {
    // No usable package.json.
  }

  for (const name of ['pyproject.toml', 'Cargo.toml']) {
    const text = readText(path.join(dir, name));
    const match = text.match(/^\s*license\s*=\s*["']([^"']+)["']/m);
    if (match) return { id: match[1], evidence: name };
  }

  return { id: 'unknown', evidence: '未找到许可证文件' };
}

function detectPackages(dir) {
  const packages = [];

  try {
    const pkg = JSON.parse(readText(path.join(dir, 'package.json')));
    if (pkg.name) {
      const bins =
        typeof pkg.bin === 'string'
          ? [pkg.name]
          : Object.keys(pkg.bin || {});
      packages.push({
        type: 'npm',
        name: pkg.name,
        version: pkg.version || '',
        bins,
      });
    }
  } catch {
    // No usable package.json.
  }

  for (const [file, type] of [
    ['pyproject.toml', 'python'],
    ['Cargo.toml', 'cargo'],
  ]) {
    const text = readText(path.join(dir, file));
    if (!text) continue;
    const name = text.match(/^\s*name\s*=\s*["']([^"']+)["']/m);
    if (!name) continue;
    const version = text.match(/^\s*version\s*=\s*["']([^"']+)["']/m);
    packages.push({
      type,
      name: name[1],
      version: version ? version[1] : '',
      bins: [],
    });
  }

  return packages;
}

function defaultBranch(dir) {
  const remoteHead = gitValue(dir, [
    'symbolic-ref',
    '--quiet',
    '--short',
    'refs/remotes/origin/HEAD',
  ]);
  if (remoteHead) return remoteHead.replace(/^origin\//, '');

  const current = gitValue(dir, ['rev-parse', '--abbrev-ref', 'HEAD']);
  return current && current !== 'HEAD' ? current : 'HEAD';
}

function cmdScan(argv) {
  const { positionals, flags } = parseFlags(argv);
  if (!positionals[0]) fail('缺少仓库（owner/repo 或 .github-clones 内的路径）');

  const root = projectRoot();
  const target = resolveExisting(root, positionals[0]);
  if (!isGitRepo(target)) fail(`${rel(root, target)} 不是 git 仓库`);

  const remote = gitValue(target, ['remote', 'get-url', 'origin']) || '';
  const remoteSpec = remote ? specFromRemote(remote) : null;
  const head = gitValue(target, ['rev-parse', '--short', 'HEAD']) || '?';
  const branch = defaultBranch(target);
  const files = findSkillFiles(target);

  const skills = files.map((file) => {
    const skillDir = path.dirname(file);
    const frontmatter = parseFrontmatter(readText(file));
    return {
      path: rel(target, skillDir) || '.',
      name: frontmatter.name || path.basename(skillDir),
      description: frontmatter.description || '',
    };
  });

  const shape =
    skills.length === 0 ? 'no-skill' : skills.length === 1 ? 'single' : 'collection';
  const rule =
    shape !== 'collection'
      ? null
      : skills.length >= 30
        ? '单一来源 ≥30 个 skill：只建一个合集条目'
        : '单一来源 <30 个 skill：最多 5 个代表条目';

  const result = {
    repo: remoteSpec ? remoteSpec.display : remote,
    path: rel(root, target),
    remote,
    head,
    branch,
    shape,
    skillCount: skills.length,
    rule,
    license: detectLicense(target),
    packages: detectPackages(target),
    skills,
  };

  if (flags.json) {
    out(JSON.stringify(result, null, 2));
    return;
  }

  out(`仓库：${result.repo || '?'}`);
  out(`路径：${result.path}`);
  out(`远端：${result.remote || '?'}`);
  out(`分支：${result.branch} @ ${result.head}`);
  out(`形态：${shape}，SKILL.md ${skills.length} 个${rule ? `（${rule}）` : ''}`);
  out(`许可证：${result.license.id}（${result.license.evidence}）`);

  for (const pkg of result.packages) {
    const bin = pkg.bins.length ? `（bin: ${pkg.bins.join(', ')}）` : '';
    out(`包：${pkg.type} ${pkg.name}${pkg.version ? `@${pkg.version}` : ''}${bin}`);
  }

  if (skills.length > 0) {
    out('');
    skills.forEach((skill, index) => {
      const description = skill.description
        ? ` — ${truncate(skill.description, 160)}`
        : '';
      out(`${index + 1}. ${skill.path}（${skill.name}）${description}`);
    });
  }
}

// ---------- commands ----------

function parseFlags(argv) {
  const positionals = [];
  const flags = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--') {
      positionals.push(...argv.slice(i + 1));
      break;
    }
    if (!arg.startsWith('--')) {
      positionals.push(arg);
      continue;
    }

    const [name, inlineValue] = arg.slice(2).split('=');
    if (name === 'ref' || name === 'branch' || name === 'path') {
      const value = inlineValue !== undefined ? inlineValue : argv[++i];
      if (value === undefined || value === '') fail(`缺少 --${name} 的值`);
      flags[name === 'branch' ? 'ref' : name] = value;
    } else if (
      name === 'full' ||
      name === 'force' ||
      name === 'all' ||
      name === 'json'
    ) {
      flags[name] = true;
    } else {
      fail(`未知参数：${arg}`);
    }
  }

  return { positionals, flags };
}

function cmdClone(argv) {
  const { positionals, flags } = parseFlags(argv);
  if (!positionals[0]) fail('缺少仓库地址');

  const spec = parseSpec(positionals[0]);
  if (flags.ref && spec.ref && flags.ref !== spec.ref) {
    fail(`--ref 与 URL 中的 ref 冲突：${flags.ref} != ${spec.ref}`);
  }
  const ref = flags.ref || spec.ref;
  const subpath = flags.path ? cleanSubpath(flags.path) : spec.subpath;
  const root = projectRoot();
  const target = targetPath(root, spec);
  assertInside(root, target);

  const existing = findExisting(root, spec);
  if (existing) {
    const remote = gitValue(existing, ['remote', 'get-url', 'origin']);
    const remoteSpec = remote ? specFromRemote(remote) : null;
    if (remoteSpec && !sameRepo(remoteSpec, spec)) {
      fail(`目录 ${rel(root, existing)} 已存在，但 origin 指向 ${remote}`);
    }
    const info = headInfo(existing);
    out(`已存在：${rel(root, existing)}（${info.branch} @ ${info.head}）`);
    if (info.detached) {
      out('当前是固定版本；要移动版本请先 remove，再用 clone --ref <new>');
    } else {
      out(`如需刷新：node scripts/upstream.mjs update ${spec.display}`);
    }
    if (ref) out(`如需切换到 ${ref}：先 remove，再 clone --ref ${ref}`);
    reportIgnore(ensureIgnored(root));
    return;
  }

  let targetExists = false;
  try {
    fs.lstatSync(target);
    targetExists = true;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (targetExists) {
    fail(`目标路径已存在，但不是 ${spec.display} 的 git 副本：${rel(root, target)}`);
  }

  ensureDirInside(root, path.dirname(target));

  const isSha = Boolean(ref) && /^[0-9a-f]{7,40}$/i.test(ref);
  const full = Boolean(flags.full) || isSha;
  const sparse = Boolean(subpath);
  let mode;

  let args;
  if (full) {
    args = ['clone', '--filter=blob:none'];
    if (sparse) args.push('--sparse');
    args.push(spec.url, target);
    mode = sparse ? '完整历史（稀疏子目录）' : '完整历史';
  } else {
    args = ['clone', '--depth', '1', '--single-branch', '--no-tags'];
    if (ref) args.push('--branch', ref);
    if (sparse) args.push('--filter=blob:none', '--sparse');
    args.push(spec.url, target);
    mode = sparse ? '浅克隆（稀疏子目录）' : '浅克隆';
  }

  let clone = run('git', args);

  if (clone.status !== 0 && sparse && !full) {
    discardCreated(target);
    const retry = ['clone', '--depth', '1', '--single-branch', '--no-tags'];
    if (ref) retry.push('--branch', ref);
    retry.push(spec.url, target);
    clone = run('git', retry);
    if (clone.status === 0) mode = '浅克隆（稀疏子目录，回退模式）';
  }

  if (clone.status !== 0) {
    discardCreated(target);
    fail(`git clone 失败：\n${(clone.stderr || '').trim()}`);
  }

  if (sparse) {
    const sparseCheckout = run('git', [
      '-C',
      target,
      'sparse-checkout',
      'set',
      subpath,
    ]);
    if (sparseCheckout.status !== 0) {
      mode = `${full ? '完整历史' : '浅克隆'}（稀疏检出失败，保留全量）`;
    }
  }

  if (full && ref) {
    const checkoutArgs = ['-C', target, 'checkout'];
    if (isSha) checkoutArgs.push('--detach');
    checkoutArgs.push(ref);
    let checkout = run('git', checkoutArgs);

    if (checkout.status !== 0 && isSha) {
      const fetched = run('git', [
        '-C',
        target,
        'fetch',
        '--depth',
        '1',
        'origin',
        ref,
      ]);
      if (fetched.status === 0) {
        checkout = run('git', ['-C', target, 'checkout', '--detach', 'FETCH_HEAD']);
      }
    }

    if (checkout.status !== 0) {
      discardCreated(target);
      fail(`无法检出 ${ref}：\n${(checkout.stderr || '').trim()}`);
    }
  }

  const info = headInfo(target);
  out(`已克隆 ${spec.display} → ${rel(root, target)}`);
  out(`模式：${mode}，${info.branch} @ ${info.head}`);
  if (subpath) out(`子目录：${subpath}`);
  reportIgnore(ensureIgnored(root));
  out(`搜索：rg --hidden -g '!.git/**' "pattern" ${rel(root, target)}`);
}

function hasUncommittedChanges(dir) {
  const status = run('git', ['-C', dir, 'status', '--porcelain']);
  if (status.status !== 0) fail(`无法检查 ${dir} 的工作区状态`);
  return status.stdout.trim().length > 0;
}

function hasLocalCommits(dir) {
  const branch = gitValue(dir, ['rev-parse', '--abbrev-ref', 'HEAD']);
  if (!branch) return true;

  if (branch === 'HEAD') {
    const tag = gitValue(dir, ['describe', '--tags', '--exact-match', 'HEAD']);
    if (tag) return false;
    const containingBranches = gitValue(dir, ['branch', '-r', '--contains', 'HEAD']);
    return !containingBranches;
  }

  const upstream = gitValue(dir, [
    'rev-parse',
    '--abbrev-ref',
    '--symbolic-full-name',
    '@{u}',
  ]);
  if (!upstream) return true;

  return gitValue(dir, ['rev-parse', 'HEAD']) !== gitValue(dir, ['rev-parse', upstream]);
}

function updateOne(root, target, flags) {
  const label = rel(root, target);
  if (!isGitRepo(target)) fail(`${label} 不是 git 仓库`);

  if (hasUncommittedChanges(target) && !flags.force) {
    fail(`${label} 有未提交改动，拒绝更新；确认要丢弃后加 --force`);
  }

  const branch = gitValue(target, ['rev-parse', '--abbrev-ref', 'HEAD']);
  if (!branch) fail(`${label} 无法读取 HEAD`);
  if (branch === 'HEAD') {
    fail(`${label} 是 detached HEAD（tag/commit 固定版本），不自动更新；换版本请 remove 后重新 clone`);
  }

  const upstream = gitValue(target, [
    'rev-parse',
    '--abbrev-ref',
    '--symbolic-full-name',
    '@{u}',
  ]);
  if (!upstream) fail(`${label} 没有上游跟踪分支，无法判断更新目标`);

  const before = gitValue(target, ['rev-parse', 'HEAD']);
  const tracked = gitValue(target, ['rev-parse', upstream]);
  if (before !== tracked && !flags.force) {
    fail(`${label} 有本地提交，拒绝更新；确认要丢弃后加 --force`);
  }

  const shallow = gitValue(target, ['rev-parse', '--is-shallow-repository']) === 'true';
  const fetchArgs = ['fetch', '--prune'];
  if (shallow) fetchArgs.push('--depth', '1');
  fetchArgs.push('origin', branch);

  const fetched = run('git', ['-C', target, ...fetchArgs]);
  if (fetched.status !== 0) fail(`fetch 失败：${(fetched.stderr || '').trim()}`);

  const next = gitValue(target, ['rev-parse', 'FETCH_HEAD']);
  if (!next) fail('fetch 完成但读不到 FETCH_HEAD');

  if (next === before) {
    out(`无变化：${label}（${branch} @ ${before.slice(0, 7)}）`);
    return 'unchanged';
  }

  const reset = run('git', ['-C', target, 'reset', '--hard', 'FETCH_HEAD']);
  if (reset.status !== 0) fail(`reset 失败：${(reset.stderr || '').trim()}`);

  let changed = null;
  const diff = run('git', ['-C', target, 'diff', '--name-only', before, next]);
  if (diff.status === 0) changed = diff.stdout.split('\n').filter(Boolean).length;

  const suffix = changed === null ? '' : `，${changed} 个文件变化`;
  out(`已更新：${label}（${branch} ${before.slice(0, 7)} → ${next.slice(0, 7)}${suffix}）`);
  return 'updated';
}

function cmdUpdate(argv) {
  const { positionals, flags } = parseFlags(argv);
  const root = projectRoot();

  if (flags.all) {
    if (positionals.length > 0) fail('使用 --all 时不要再指定仓库');
    const targets = listTargets(root);
    if (targets.length === 0) {
      out(`（${CLONES_DIR}/ 下没有可更新的副本）`);
      return;
    }

    let updated = 0;
    let unchanged = 0;
    let skipped = 0;
    for (const target of targets) {
      try {
        if (updateOne(root, target, flags) === 'updated') updated += 1;
        else unchanged += 1;
      } catch (error) {
        if (!(error instanceof UserError)) throw error;
        skipped += 1;
        out(`跳过 ${rel(root, target)}：${error.message}`);
      }
    }
    out(`完成：更新 ${updated}，无变化 ${unchanged}，跳过 ${skipped}`);
    return;
  }

  if (!positionals[0]) fail('缺少要更新的仓库；批量更新用 --all');
  updateOne(root, resolveExisting(root, positionals[0]), flags);
}

function cmdList(argv) {
  const { positionals, flags } = parseFlags(argv);
  if (positionals.length > 0 || Object.keys(flags).length > 0) {
    fail('list 不接受参数');
  }

  const root = projectRoot();
  out(`根目录：${root}`);

  const targets = listTargets(root);
  if (targets.length === 0) {
    out(`（${CLONES_DIR}/ 下还没有克隆）`);
    return;
  }

  for (const target of targets) {
    const label = rel(root, target);
    if (!isGitRepo(target)) {
      out(`${label}    非 git 目录`);
      continue;
    }
    const info = headInfo(target);
    const status = run('git', ['-C', target, 'status', '--porcelain']);
    const dirty =
      status.status !== 0 ? ' *error' : status.stdout.trim() ? ' *dirty' : '';
    const date = gitValue(target, ['log', '-1', '--format=%cs']) || '?';
    const remote = gitValue(target, ['remote', 'get-url', 'origin']) || '?';
    out(`${label}    ${info.branch} @ ${info.head}${dirty}    ${date}    ${remote}`);
  }
}

function removeOne(root, target, force) {
  const label = rel(root, target);
  const stats = fs.lstatSync(target);

  if (stats.isSymbolicLink()) fail(`${label} 是符号链接，拒绝删除`);
  if (!stats.isDirectory()) fail(`${label} 不是目录，拒绝删除`);

  assertTargetRealInside(root, target);

  if (isGitRepo(target)) {
    const dirty = hasUncommittedChanges(target);
    const localCommits = hasLocalCommits(target);
    if ((dirty || localCommits) && !force) {
      const reasons = [dirty ? '未提交改动' : null, localCommits ? '本地提交' : null]
        .filter(Boolean)
        .join('、');
      fail(`${label} 有${reasons}，拒绝删除；确认要丢弃后加 --force`);
    }
  } else if (!force) {
    fail(`${label} 不是 git 仓库，拒绝自动删除；确认后加 --force`);
  }

  try {
    fs.rmSync(target, { recursive: true, force: false });
  } catch (error) {
    fail(`删除失败：${error.message}`);
  }
  out(`已删除：${label}`);

  const ownerDir = path.dirname(target);
  const base = path.resolve(clonesRoot(root));
  if (
    path.dirname(ownerDir) === base &&
    fs.existsSync(ownerDir) &&
    fs.readdirSync(ownerDir).length === 0
  ) {
    try {
      fs.rmdirSync(ownerDir);
    } catch {
      // Another clone may have appeared; leaving the empty dir is harmless.
    }
  }
}

function cmdRemove(argv) {
  const { positionals, flags } = parseFlags(argv);
  const root = projectRoot();

  if (flags.all) {
    if (positionals.length > 0) fail('使用 --all 时不要再指定仓库');
    const targets = listTargets(root);
    if (targets.length === 0) {
      out(`（${CLONES_DIR}/ 下没有可删除的副本）`);
      return;
    }

    let removed = 0;
    let skipped = 0;
    for (const target of targets) {
      try {
        removeOne(root, target, flags.force);
        removed += 1;
      } catch (error) {
        if (!(error instanceof UserError)) throw error;
        skipped += 1;
        out(`跳过 ${rel(root, target)}：${error.message}`);
      }
    }
    out(`完成：删除 ${removed}，跳过 ${skipped}`);
    return;
  }

  if (!positionals[0]) fail('缺少要删除的仓库；全部删除用 --all');
  removeOne(root, resolveExisting(root, positionals[0]), flags.force);
}

// ---------- entrypoint ----------

function usage() {
  return `用法：
  node scripts/upstream.mjs clone <url|owner/repo> [--ref <branch|tag|sha>] [--path <subdir>] [--full]
  node scripts/upstream.mjs update <owner/repo|路径> [--force]
  node scripts/upstream.mjs update --all [--force]
  node scripts/upstream.mjs scan <owner/repo|路径> [--json]
  node scripts/upstream.mjs list
  node scripts/upstream.mjs remove <owner/repo|路径> [--force]
  node scripts/upstream.mjs remove --all [--force]

目录：<project>/.github-clones/<owner>/<repo>
`;
}

function main(argv) {
  const [command, ...rest] = argv;
  if (!command || command === 'help' || command === '-h' || command === '--help') {
    out(usage());
    return;
  }
  if (command === 'clone') return cmdClone(rest);
  if (command === 'update') return cmdUpdate(rest);
  if (command === 'scan') return cmdScan(rest);
  if (command === 'list' || command === 'ls') return cmdList(rest);
  if (command === 'remove' || command === 'rm') return cmdRemove(rest);
  fail(`未知命令：${command}\n\n${usage()}`);
}

try {
  main(process.argv.slice(2));
} catch (error) {
  if (error instanceof UserError) {
    console.error(`错误：${error.message}`);
  } else {
    console.error(error);
  }
  process.exit(1);
}
