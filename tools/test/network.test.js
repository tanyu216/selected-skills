import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { installSkills } from '../scripts/install.js';

const enabled = process.env.SKILLS_NETWORK_TESTS === '1';

test('real upstream smoke: clone and copy tavily-search', { skip: !enabled }, async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'selected-skills-net-'));
  process.env.SELECTED_SKILLS_HOME = path.join(root, 'data');
  const dest = path.join(root, 'dest');
  const result = await installSkills({
    selected: [{
      slug: 'tavily-search',
      name: 'Tavily Search',
      repo: 'tavily-ai/skills',
      path: 'skills/core/tavily-search',
      kind: 'skill',
      source: 'https://github.com/tavily-ai/skills',
      license: 'MIT',
      summary: 'search',
      root: false
    }],
    platforms: ['claude'],
    dest
  });
  assert.equal(result.failed.length, 0, JSON.stringify(result.failed));
  assert.ok(fs.existsSync(path.join(dest, 'tavily-search/SKILL.md')));
  assert.ok(fs.existsSync(path.join(dest, 'tavily-search/references/setup.md')));
});
