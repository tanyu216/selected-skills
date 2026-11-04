import fs from 'node:fs';
import path from 'node:path';
import { packagePath, uniq } from './util.js';
import { splitFrontmatter } from './frontmatter.js';
import { loadCatalog, catalogBySlug } from './catalog.js';

export function loadScenarios() {
  const dir = packagePath('scenarios');
  const files = fs.readdirSync(dir).filter((file) => file.endsWith('.md') && file !== 'README.md').sort();
  return files.map((file) => {
    const full = path.join(dir, file);
    const { data } = splitFrontmatter(fs.readFileSync(full, 'utf8'));
    return {
      slug: path.basename(file, '.md'),
      title: data.title || path.basename(file, '.md'),
      skills: Array.isArray(data.skills) ? data.skills : [],
      file: full
    };
  });
}

export function scenarioByName(entries = loadScenarios()) {
  return new Map(entries.map((entry) => [entry.slug, entry]));
}

function sameSource(a, b) {
  return a.repo === b.repo && (a.path || '') === (b.path || '');
}

export function buildSelection(options, { index, catalog = loadCatalog() } = {}) {
  if (!index) throw new Error('buildSelection 需要 source index');
  const selected = new Map();
  const unresolved = [];
  const conflicts = [];
  const collectionHints = new Map();
  const bySlug = catalogBySlug(catalog);

  const add = (spec, requestedAs) => {
    if (!spec) {
      unresolved.push({ name: requestedAs, reason: '未在 catalog 或 extra-sources 中找到' });
      return;
    }
    if (spec.kind === 'unresolved') {
      unresolved.push({ name: requestedAs || spec.slug, reason: spec.reason || '来源无法解析' });
      return;
    }
    if (spec.kind === 'collection' && !options.includeCollections) {
      collectionHints.set(spec.slug, spec);
      return;
    }
    const existing = selected.get(spec.slug);
    if (existing) {
      if (!sameSource(existing, spec) && existing.kind !== 'collection' && spec.kind !== 'collection') {
        conflicts.push({ slug: spec.slug, first: existing, second: spec });
      }
      if (existing.origin === 'catalog' && spec.origin !== 'catalog') return;
      if (spec.origin === 'catalog' && existing.origin !== 'catalog') selected.set(spec.slug, spec);
      return;
    }
    selected.set(spec.slug, spec);
  };

  const addByName = (name) => {
    const spec = index.get(name);
    if (!spec) {
      const catalogEntry = bySlug.get(name);
      if (catalogEntry) {
        add({ ...catalogEntry, kind: 'unresolved', repo: null, reason: '来源无法解析' }, name);
      } else {
        unresolved.push({ name, reason: '未收录；请先加入 skills/ 或 tools/installer/extra-sources.json' });
      }
      return;
    }
    add(spec, name);
  };

  if (options.all) {
    for (const entry of catalog) {
      const spec = index.get(entry.slug);
      if (!spec) continue;
      if (spec.kind === 'skill' || spec.kind === 'framework') add(spec, entry.slug);
      else if (spec.kind === 'collection' && options.includeCollections) add(spec, entry.slug);
      else if (spec.kind === 'collection') collectionHints.set(spec.slug, spec);
    }
    for (const [name, spec] of index) {
      if (spec.origin === 'extra') add(spec, name);
    }
  }

  for (const scenarioName of options.scenarios || []) {
    const scenario = (options.scenarioIndex || scenarioByName()).get(scenarioName);
    if (!scenario) throw new Error(`未知场景: ${scenarioName}`);
    for (const name of scenario.skills) addByName(name);
  }

  for (const categoryName of options.categories || []) {
    const entries = catalog.filter((entry) => entry.category === categoryName);
    if (entries.length === 0) throw new Error(`未知分类: ${categoryName}`);
    for (const entry of entries) {
      const spec = index.get(entry.slug);
      if (!spec) continue;
      if (spec.kind === 'collection' && !options.includeCollections) collectionHints.set(spec.slug, spec);
      else add(spec, entry.slug);
    }
  }

  for (const name of options.skills || []) addByName(name);

  return {
    selected: [...selected.values()],
    unresolved,
    conflicts,
    collectionHints: [...collectionHints.values()]
  };
}

export function expandAllScenarioSkills(options, helpers) {
  return buildSelection({ ...options, all: true, includeCollections: options.includeCollections }, helpers);
}

export function uniqueScenarioNames(scenarios = loadScenarios()) {
  return uniq(scenarios.flatMap((scenario) => scenario.skills));
}
