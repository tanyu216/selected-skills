import fs from 'node:fs';
import path from 'node:path';
import { packagePath } from './util.js';
import { splitFrontmatter } from './frontmatter.js';

function walkMarkdown(dir, results = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkMarkdown(full, results);
    else if (entry.isFile() && entry.name.endsWith('.md')) results.push(full);
  }
  return results;
}

function firstMatch(body, names) {
  for (const line of String(body || '').split(/\r?\n/)) {
    const match = line.match(/^-\s*(地址|安装)\s*[：:]\s*(.+)$/);
    if (match && names.includes(match[1])) return match[2].trim();
  }
  return '';
}

export function loadCatalog() {
  const skillsRoot = packagePath('skills');
  const files = walkMarkdown(skillsRoot).sort();
  const entries = [];
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    const { data, body } = splitFrontmatter(text);
    const slug = path.basename(file, '.md');
    const category = path.basename(path.dirname(file));
    entries.push({
      slug,
      category,
      name: data.name || slug,
      source: data.source || '',
      license: data.license || 'unknown',
      tags: Array.isArray(data.tags) ? data.tags : [],
      summary: data.summary || '',
      address: firstMatch(body, ['地址']),
      installNote: firstMatch(body, ['安装']),
      file
    });
  }
  return entries;
}

export function catalogBySlug(entries = loadCatalog()) {
  return new Map(entries.map((entry) => [entry.slug, entry]));
}

export function categories(entries = loadCatalog()) {
  const map = new Map();
  for (const entry of entries) {
    if (!map.has(entry.category)) map.set(entry.category, []);
    map.get(entry.category).push(entry);
  }
  return map;
}
