import test from 'node:test';
import assert from 'node:assert/strict';
import { parseArgs } from '../scripts/cli.js';

test('parses commands, values and booleans', () => {
  const parsed = parseArgs(['install', '--platform', 'claude,codex', '--all', '--dry-run', '--skills=tavily-search']);
  assert.equal(parsed.command, 'install');
  assert.deepEqual(parsed.options.platform, ['claude,codex']);
  assert.equal(parsed.options.all, true);
  assert.equal(parsed.options.dryRun, true);
  assert.deepEqual(parsed.options.skills, ['tavily-search']);
});

test('rejects unknown flags', () => {
  assert.throws(() => parseArgs(['install', '--nope']), /未知参数/);
});

test('requires a value for value flags', () => {
  assert.throws(() => parseArgs(['install', '--platform']), /需要一个值/);
});

test('repeated flags accumulate', () => {
  const parsed = parseArgs(['install', '--scenario', 'general', '--scenario', 'quant']);
  assert.deepEqual(parsed.options.scenario, ['general', 'quant']);
});
