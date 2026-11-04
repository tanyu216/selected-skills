import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSourceIndex, parseGitHubUrl, loadExtraSources, loadOverrides, collectUnresolved } from '../scripts/sources.js';

test('parseGitHubUrl handles blob, tree and repo roots', () => {
  assert.deepEqual(
    parseGitHubUrl('https://github.com/tavily-ai/skills/blob/HEAD/skills/core/tavily-search/SKILL.md'),
    { repo: 'tavily-ai/skills', type: 'blob', ref: 'HEAD', path: 'skills/core/tavily-search/SKILL.md' }
  );
  assert.deepEqual(
    parseGitHubUrl('https://github.com/browser-use/video-use/blob/HEAD/SKILL.md'),
    { repo: 'browser-use/video-use', type: 'blob', ref: 'HEAD', path: 'SKILL.md' }
  );
  assert.equal(parseGitHubUrl('https://github.com/anthropics/knowledge-work-plugins/tree/HEAD/data').type, 'tree');
  assert.equal(parseGitHubUrl('https://example.com/foo'), null);
});

test('every catalog entry resolves to an upstream source', () => {
  const index = buildSourceIndex();
  assert.equal(collectUnresolved(index).length, 0);
  assert.equal(index.get('tavily-search').path, 'skills/core/tavily-search');
  assert.equal(index.get('tavily-search').repo, 'tavily-ai/skills');
  assert.equal(index.get('video-use').path, '');
  assert.equal(index.get('video-use').root, true);
  assert.equal(index.get('remotion-video-toolkit').root, true);
  assert.equal(index.get('qlib').kind, 'framework');
  assert.equal(index.get('knowledge-work-plugins-data').kind, 'collection');
  assert.equal(index.get('claude-trading-skills').kind, 'collection');
});

test('extra sources cover the scenario-only skills', () => {
  const extras = loadExtraSources();
  assert.ok(Object.keys(extras).length >= 50);
  assert.equal(extras['write-query'].path, 'data/skills/write-query');
  assert.equal(extras['backtest-expert'].path, 'skills/backtest-expert');
  assert.equal(extras['grilling'].repo, 'mattpocock/skills');
  const overrides = loadOverrides();
  assert.equal(overrides['tradingagents'].kind, 'framework');
});
