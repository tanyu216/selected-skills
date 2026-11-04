import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { loadState, saveState, backupPath } from './state.js';
import { repoDir, updateRepo, repoCommit, repoDirty } from './git.js';
import { hashDir, runCapture } from './util.js';
import { refreshSkillCopy, expandCollection } from './install.js';
import { buildSourceIndex } from './sources.js';

function specFromRecord(record) {
  return {
    slug: record.slug,
    name: record.name || record.slug,
    repo: record.repo,
    path: record.path || '',
    kind: 'skill',
    source: record.source || '',
    license: record.license || 'unknown',
    summary: '',
    origin: 'state'
  };
}

export async function checkUpdates(state = loadState(), { offline = false } = {}) {
  if (offline) return [];
  const repos = [...new Set(Object.values(state.skills).map((item) => item.repo).filter(Boolean))];
  const updates = [];
  for (const repo of repos) {
    const dir = repoDir(repo);
    if (!fs.existsSync(path.join(dir, '.git'))) continue;
    const fetch = await runCapture('git', ['-C', dir, 'fetch', '--depth=1', 'origin', 'HEAD']);
    if (!fetch.ok) continue;
    const local = await repoCommit(repo);
    const remote = await runCapture('git', ['-C', dir, 'rev-parse', 'FETCH_HEAD']);
    if (remote.ok && local !== remote.stdout.trim()) {
      updates.push({ repo, local, remote: remote.stdout.trim() });
    }
  }
  return updates;
}

export async function updateInstallations({
  platforms = null,
  check = false,
  force = false,
  repair = false,
  prune = false,
  offline = false,
  keepLocal = false,
  state = loadState()
} = {}) {
  const result = { updated: [], skipped: [], failed: [], broken: [], userModified: [], repos: [], updates: [] };
  const skippedRepos = new Set();
  const repos = [...new Set(Object.values(state.skills).map((item) => item.repo).filter(Boolean))];

  if (check) {
    result.updates = await checkUpdates(state, { offline });
    return result;
  }

  const failedRepos = new Set();
  for (const repo of repos) {
    const dirty = await repoDirty(repo);
    if (dirty) {
      result.repos.push({ repo, warning: '源缓存有本地改动，reset --hard 会丢弃' });
      if (keepLocal) {
        skippedRepos.add(repo);
        result.repos.push({ repo, skipped: '--keep-local' });
        continue;
      }
    }
    try {
      const updated = await updateRepo(repo, { offline });
      if (updated.recloned) result.repos.push({ repo, recloned: true });
      const commit = await repoCommit(repo);
      if (commit) state.repos[repo] = { commit, updatedAt: new Date().toISOString() };
    } catch (error) {
      failedRepos.add(repo);
      result.failed.push({ slug: repo, error: error.message });
    }
  }

  for (const record of Object.values(state.skills)) {
    if (failedRepos.has(record.repo)) {
      for (const platformName of Object.keys(record.platforms)) {
        if (platforms && !platforms.includes(platformName)) continue;
        result.failed.push({ slug: record.slug, platform: platformName, error: '源仓库更新失败，已跳过（未执行 prune）' });
      }
      continue;
    }
    if (skippedRepos.has(record.repo)) {
      for (const platformName of Object.keys(record.platforms)) {
        if (platforms && !platforms.includes(platformName)) continue;
        result.skipped.push({ slug: record.slug, platform: platformName, reason: '源仓库被 --keep-local 跳过' });
      }
      continue;
    }
    const sourceDir = record.path ? path.join(repoDir(record.repo), record.path) : repoDir(record.repo);
    if (!fs.existsSync(path.join(sourceDir, 'SKILL.md'))) {
      result.broken.push({ slug: record.slug, repo: record.repo, path: record.path });
      if (prune) {
        for (const [platformName, info] of Object.entries(record.platforms)) {
          if (platforms && !platforms.includes(platformName)) continue;
          if (fs.existsSync(info.dir)) {
            const current = await hashDir(info.dir).catch(() => '');
            if (!force && info.installedHash && current !== info.installedHash) {
              result.userModified.push({ slug: record.slug, platform: platformName, dir: info.dir });
              continue;
            }
            const target = backupPath(platformName, record.slug);
            try {
              await fsp.mkdir(path.dirname(target), { recursive: true });
              await fsp.rename(info.dir, target);
            } catch (error) {
              result.failed.push({ slug: record.slug, platform: platformName, error: `prune 备份失败: ${error.message}` });
              continue;
            }
          }
          delete record.platforms[platformName];
        }
        if (Object.keys(record.platforms).length === 0) delete state.skills[record.slug];
      }
      continue;
    }

    const sourceHash = await hashDir(sourceDir).catch(() => '');
    for (const [platformName, info] of Object.entries(record.platforms)) {
      if (platforms && !platforms.includes(platformName)) continue;
      if (!fs.existsSync(info.dir)) {
        if (!repair) { result.skipped.push({ slug: record.slug, platform: platformName, reason: '目标不存在（--repair 重建）' }); continue; }
      } else if (info.method === 'link') {
        if (sourceHash && sourceHash === info.sourceHash && !force) {
          result.skipped.push({ slug: record.slug, platform: platformName, reason: '未变化' });
        } else {
          info.sourceHash = sourceHash;
          info.installedHash = sourceHash;
          info.installedAt = new Date().toISOString();
          result.updated.push({ slug: record.slug, platform: platformName, dir: info.dir });
        }
        continue;
      } else {
        const current = await hashDir(info.dir).catch(() => '');
        if (info.installedHash && current !== info.installedHash && !force) {
          result.userModified.push({ slug: record.slug, platform: platformName, dir: info.dir });
          continue;
        }
        const unchanged = sourceHash && sourceHash === info.sourceHash && !force;
        if (unchanged) { result.skipped.push({ slug: record.slug, platform: platformName, reason: '未变化' }); continue; }
      }

      try {
        const copy = await refreshSkillCopy({
          sourceDir,
          destDir: info.dir,
          platformName,
          slug: record.slug,
          summary: '',
          root: !record.path,
          method: info.method,
          force: true,
          repoRoot: repoDir(record.repo)
        });
        info.sourceHash = sourceHash;
        info.installedHash = copy.installedHash || '';
        info.installedAt = new Date().toISOString();
        result.updated.push({ slug: record.slug, platform: platformName, dir: info.dir });
      } catch (error) {
        result.failed.push({ slug: record.slug, platform: platformName, error: error.message });
      }
    }
  }

  await saveState(state);
  return result;
}

export async function syncCollections({ platforms = null, prune = false, state = loadState() } = {}) {
  const result = { added: [], removed: [], failed: [] };
  const collections = new Map();
  for (const record of Object.values(state.skills)) {
    if (!record.collection) continue;
    if (!collections.has(record.collection)) collections.set(record.collection, []);
    collections.get(record.collection).push(record);
  }

  const sourceIndex = buildSourceIndex();
  for (const [collectionSlug, members] of collections) {
    const collectionSpec = sourceIndex.get(collectionSlug);
    if (!collectionSpec || collectionSpec.kind !== 'collection') continue;
    let expanded = [];
    try {
      expanded = await expandCollection(collectionSpec);
    } catch (error) {
      result.failed.push({ slug: collectionSlug, error: error.message });
      continue;
    }
    const known = new Set(members.map((item) => item.slug));
    const destRoots = new Map();
    for (const member of members) {
      for (const [platformName, info] of Object.entries(member.platforms)) {
        if (platforms && !platforms.includes(platformName)) continue;
        if (!destRoots.has(platformName)) destRoots.set(platformName, path.dirname(info.dir));
      }
    }
    for (const child of expanded) {
      if (known.has(child.slug)) continue;
      const sourceDir = path.join(repoDir(child.repo), child.path);
      for (const [platformName, root] of destRoots) {
        try {
          const destDir = path.join(root, child.slug);
          const copy = await refreshSkillCopy({
            sourceDir,
            destDir,
            platformName,
            slug: child.slug,
            summary: '',
            root: false,
            method: 'copy',
            force: false,
            repoRoot: repoDir(child.repo)
          });
          if (!copy.skipped) {
            if (!state.skills[child.slug]) {
              state.skills[child.slug] = {
                slug: child.slug,
                name: child.name || child.slug,
                repo: child.repo,
                path: child.path,
                kind: 'skill',
                source: `https://github.com/${child.repo}`,
                license: child.license || 'unknown',
                collection: collectionSlug,
                platforms: {}
              };
            }
            state.skills[child.slug].collection = collectionSlug;
            state.skills[child.slug].platforms[platformName] = {
              dir: destDir,
              method: 'copy',
              sourceHash: await hashDir(sourceDir).catch(() => ''),
              installedHash: copy.installedHash || '',
              installedAt: new Date().toISOString()
            };
            result.added.push({ slug: child.slug, platform: platformName, dir: destDir });
          }
        } catch (error) {
          result.failed.push({ slug: child.slug, platform: platformName, error: error.message });
        }
      }
    }
  }

  if (prune) {
    for (const record of [...Object.values(state.skills)]) {
      if (!record.collection) continue;
      const sourceDir = record.path ? path.join(repoDir(record.repo), record.path) : repoDir(record.repo);
      if (fs.existsSync(path.join(sourceDir, 'SKILL.md'))) continue;
      for (const [platformName, info] of Object.entries(record.platforms)) {
        if (platforms && !platforms.includes(platformName)) continue;
        await fsp.rm(info.dir, { recursive: true, force: true });
        delete record.platforms[platformName];
        result.removed.push({ slug: record.slug, platform: platformName });
      }
      if (Object.keys(record.platforms).length === 0) delete state.skills[record.slug];
    }
  }

  await saveState(state);
  return result;
}

export async function uninstall({ platforms = null, skills = null, all = false, force = false, state = loadState() } = {}) {
  const result = { removed: [], skipped: [], failed: [] };
  const wanted = all ? null : new Set(skills || []);
  for (const record of [...Object.values(state.skills)]) {
    if (wanted && !wanted.has(record.slug)) continue;
    for (const [platformName, info] of Object.entries(record.platforms)) {
      if (platforms && !platforms.includes(platformName)) continue;
      if (!fs.existsSync(info.dir)) {
        delete record.platforms[platformName];
        continue;
      }
      if (!force && info.method !== 'link') {
        const current = await hashDir(info.dir).catch(() => '');
        if (info.installedHash && current !== info.installedHash) {
          result.skipped.push({ slug: record.slug, platform: platformName, reason: '目标被修改过（--force 删除）' });
          continue;
        }
      }
      try {
        await fsp.rm(info.dir, { recursive: true, force: true });
        delete record.platforms[platformName];
        result.removed.push({ slug: record.slug, platform: platformName, dir: info.dir });
      } catch (error) {
        result.failed.push({ slug: record.slug, platform: platformName, error: error.message });
      }
    }
    if (Object.keys(record.platforms).length === 0) delete state.skills[record.slug];
  }
  await saveState(state);
  if (result.removed.length === 0 && result.skipped.length === 0 && result.failed.length === 0 && wanted) {
    result.failed.push({ slug: null, error: '没有找到匹配的已安装 skill' });
  }
  return result;
}
