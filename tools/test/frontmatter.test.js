import test from 'node:test';
import assert from 'node:assert/strict';
import { splitFrontmatter, normalizeSkillMd, descriptionWarning } from '../scripts/frontmatter.js';

test('parses scalars, inline arrays and quoted values', () => {
  const { data, body } = splitFrontmatter('---\nname: Demo\ntags: [a, b]\nsummary: "a: b"\n---\n# Body\n');
  assert.equal(data.name, 'Demo');
  assert.deepEqual(data.tags, ['a', 'b']);
  assert.equal(data.summary, 'a: b');
  assert.match(body, /# Body/);
});

test('normalization renames invalid names and fills description', () => {
  const input = '---\nname: Demo Skill\nsummary: demo\n---\n# Body\n';
  const output = normalizeSkillMd(input, { slug: 'demo-skill', fallbackDescription: 'demo summary' });
  assert.match(output, /^---\nname: demo-skill\n/);
  assert.match(output, /description: "demo summary"/);
  assert.match(output, /catalog_name: "Demo Skill"/);
  assert.match(output, /# Body/);
});

test('normalization preserves valid names and existing description', () => {
  const input = '---\nname: tavily-search\ndescription: |\n  multi line\nmetadata:\n  version: 1\n---\nBody\n';
  const output = normalizeSkillMd(input, { slug: 'tavily-search', fallbackDescription: 'x' });
  assert.match(output, /name: tavily-search/);
  assert.match(output, /description: \|/);
  assert.match(output, /  version: 1/);
});

test('normalization adds frontmatter when missing', () => {
  const output = normalizeSkillMd('# Body\n', { slug: 'demo', fallbackDescription: 'desc' });
  assert.match(output, /^---\nname: demo\ndescription: "desc"\n---\n\n# Body/);
});

test('description warning triggers above 500 chars', () => {
  const text = `---\nname: demo\ndescription: ${'x'.repeat(501)}\n---\n`;
  assert.ok(descriptionWarning(text));
});
