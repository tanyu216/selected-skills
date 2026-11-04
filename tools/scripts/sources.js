import { loadCatalog, catalogBySlug } from './catalog.js';
import { toolPath, readJson, assertSafeRelativePath } from './util.js';

export function loadOverrides() {
  return readJson(toolPath('installer', 'overrides.json')).entries || {};
}

export function loadExtraSourceFile() {
  return readJson(toolPath('installer', 'extra-sources.json'));
}

export function loadExtraSources() {
  return loadExtraSourceFile().sources || {};
}

export function loadSharedPaths() {
  return loadExtraSourceFile().sharedPaths || {};
}

export function parseGitHubUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  let url;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }
  if (url.hostname !== 'github.com' && url.hostname !== 'www.github.com') return null;
  const segments = url.pathname.split('/').filter(Boolean);
  if (segments.length < 2) return null;
  const owner = segments[0];
  const repoName = segments[1].replace(/\.git$/, '');
  const repo = `${owner}/${repoName}`;
  if (segments.length === 2) return { repo, type: 'root', ref: 'HEAD', path: '' };
  const type = segments[2];
  if (type !== 'blob' && type !== 'tree') return { repo, type: 'unknown', ref: 'HEAD', path: '' };
  const ref = segments[3] || 'HEAD';
  const rest = segments.slice(4).join('/');
  return { repo, type, ref, path: rest };
}

function specFromAddress(address) {
  const parsed = parseGitHubUrl(address);
  if (!parsed) return null;
  if (parsed.type === 'blob' && parsed.path.endsWith('SKILL.md')) {
    const skillPath = parsed.path.replace(/\/?SKILL\.md$/, '').replace(/\/+$/, '');
    return { kind: 'skill', repo: parsed.repo, ref: parsed.ref, path: skillPath };
  }
  return null;
}

export function resolveCatalogEntry(entry, overrides = loadOverrides()) {
  const base = {
    slug: entry.slug,
    name: entry.name,
    category: entry.category,
    summary: entry.summary,
    license: entry.license,
    source: entry.source,
    origin: 'catalog'
  };
  const override = overrides[entry.slug];
  if (override) {
    const spec = {
      ...base,
      kind: override.kind,
      repo: override.repo,
      ref: override.ref || 'HEAD',
      path: override.path || '',
      paths: override.paths || null,
      root: Boolean(override.root),
      reason: override.reason || ''
    };
    validateSpec(spec);
    return spec;
  }

  const fromAddress = specFromAddress(entry.address);
  const fromSource = specFromAddress(entry.source);
  const parsed = fromAddress || fromSource;
  if (parsed) {
    const spec = { ...base, ...parsed, paths: null, root: parsed.path === '', reason: '' };
    validateSpec(spec);
    return spec;
  }
  return {
    ...base,
    kind: 'unresolved',
    repo: null,
    path: '',
    reason: '无法从「来源 → 地址」解析出上游 SKILL.md，需要 override'
  };
}

export function specFromExtra(name, extra) {
  const spec = {
    slug: name,
    name,
    category: 'scenario',
    summary: '',
    license: 'unknown',
    source: `https://github.com/${extra.repo}`,
    origin: 'extra',
    kind: 'skill',
    repo: extra.repo,
    ref: extra.ref || 'HEAD',
    path: extra.path || '',
    paths: null,
    root: !extra.path,
    reason: ''
  };
  validateSpec(spec);
  return spec;
}

function validateSpec(spec) {
  if (!spec.repo || !/^[^/\s]+\/[^/\s]+$/.test(spec.repo)) {
    throw new Error(`无效的上游仓库: ${spec.repo}`);
  }
  if (spec.kind === 'skill') {
    spec.path = assertSafeRelativePath(spec.path || '', 'upstream path');
  }
  if (spec.kind === 'collection') {
    if (!Array.isArray(spec.paths) || spec.paths.length === 0) {
      throw new Error(`合集 ${spec.slug} 缺少 paths`);
    }
    spec.paths = spec.paths.map((item) => assertSafeRelativePath(item, 'collection path'));
  }
}

export function buildSourceIndex({ catalog = loadCatalog(), overrides = loadOverrides(), extras = loadExtraSources() } = {}) {
  const index = new Map();
  for (const entry of catalog) index.set(entry.slug, resolveCatalogEntry(entry, overrides));
  for (const [name, extra] of Object.entries(extras)) {
    if (!index.has(name)) index.set(name, specFromExtra(name, extra));
  }
  return index;
}

export function collectUnresolved(index) {
  return [...index.values()].filter((spec) => spec.kind === 'unresolved');
}

export function reposFromSpecs(specs) {
  const map = new Map();
  for (const spec of specs) {
    if (!spec.repo || spec.kind === 'unresolved' || spec.kind === 'framework') continue;
    if (!map.has(spec.repo)) map.set(spec.repo, []);
    const list = map.get(spec.repo);
    if (spec.kind === 'collection') list.push(...spec.paths);
    else list.push(spec.path || '');
  }
  return map;
}

export { loadCatalog, catalogBySlug };
