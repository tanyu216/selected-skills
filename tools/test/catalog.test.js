import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog, catalogBySlug, categories } from '../scripts/catalog.js';

test('catalog loads every skill card with frontmatter and address', () => {
  const entries = loadCatalog();
  assert.ok(entries.length >= 55, `expected at least 55 skills, got ${entries.length}`);
  const bySlug = catalogBySlug(entries);
  const tavily = bySlug.get('tavily-search');
  assert.equal(tavily.category, 'research');
  assert.equal(tavily.license, 'MIT');
  assert.match(tavily.address, /tavily-search\/SKILL\.md$/);
  assert.equal(bySlug.get('qlib').category, 'quant');
  assert.equal(bySlug.get('polars').category, 'data');
});

test('catalog has the expected categories', () => {
  const map = categories();
  for (const name of ['frontend', 'creative', 'engineering', 'docs', 'data', 'gamedev', 'research', 'agent', 'quant']) {
    assert.ok(map.has(name), `missing category ${name}`);
  }
});
