import test from 'node:test';
import assert from 'node:assert/strict';
import { loadScenarios, buildSelection } from '../scripts/scenarios.js';
import { buildSourceIndex } from '../scripts/sources.js';
import { loadCatalog } from '../scripts/catalog.js';

const catalog = loadCatalog();
const index = buildSourceIndex({ catalog });
const helpers = { index, catalog };

function selection(options) {
  return buildSelection({ includeCollections: false, ...options }, helpers);
}

test('there are nine scenarios with skill lists', () => {
  const scenarios = loadScenarios();
  assert.equal(scenarios.length, 9);
  for (const scenario of scenarios) assert.ok(scenario.skills.length > 0, `${scenario.slug} has no skills`);
});

test('--all selects 103 skills and 6 frameworks, no unresolved items', () => {
  const result = selection({ all: true });
  assert.equal(result.selected.filter((spec) => spec.kind === 'skill').length, 103);
  assert.equal(result.selected.filter((spec) => spec.kind === 'framework').length, 6);
  assert.equal(result.unresolved.length, 0);
  assert.equal(result.selected.filter((spec) => spec.kind === 'collection').length, 0);
});

test('scenario counts resolve completely', () => {
  const expectations = {
    'data-analysis': 18,
    quant: 20,
    'web-development': 22,
    'agent-workflow': 13,
    'video-production': 11,
    general: 12,
    'product-prototype': 14,
    'game-development': 13,
    specialized: 2
  };
  for (const [name, count] of Object.entries(expectations)) {
    const result = selection({ scenarios: [name] });
    assert.equal(result.selected.filter((spec) => spec.kind === 'skill').length, count, name);
    assert.equal(result.unresolved.length, 0, name);
  }
});

test('quant scenario includes framework hints and the trading extras', () => {
  const result = selection({ scenarios: ['quant'] });
  const frameworks = result.selected.filter((spec) => spec.kind === 'framework').map((spec) => spec.slug).sort();
  assert.deepEqual(frameworks, ['alphalens-reloaded', 'optuna', 'qlib', 'tradingagents']);
  assert.ok(result.selected.some((spec) => spec.slug === 'backtest-expert' && spec.repo === 'tradermonty/claude-trading-skills'));
});

test('quant category has no standalone skills but surfaces its collection', () => {
  const result = selection({ categories: ['quant'] });
  assert.equal(result.selected.filter((spec) => spec.kind === 'skill').length, 0);
  assert.equal(result.selected.filter((spec) => spec.kind === 'framework').length, 4);
  assert.deepEqual(result.collectionHints.map((spec) => spec.slug), ['claude-trading-skills']);
});

test('catalog statistical-analysis wins over the data plugin copy', () => {
  const result = selection({ skills: ['statistical-analysis'] });
  const spec = result.selected.find((item) => item.slug === 'statistical-analysis');
  assert.equal(spec.repo, 'K-Dense-AI/scientific-agent-skills');
});
