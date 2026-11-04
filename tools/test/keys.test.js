import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { configureKeys } from '../scripts/keys.js';
import { pendingKeysFile } from '../scripts/state.js';

test('skipping a key writes a placeholder-only pending script', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'selected-skills-keys-'));
  process.env.SELECTED_SKILLS_HOME = root;
  delete process.env.TEST_SELECTED_KEY;
  const keys = [{
    id: 'TEST_SELECTED_KEY',
    env: 'TEST_SELECTED_KEY',
    label: 'Test key',
    check: null,
    configure: null,
    skipHint: 'export TEST_SELECTED_KEY=your_key_here'
  }];
  const results = await configureKeys(keys, { yes: true });
  assert.equal(results[0].status, 'skipped');
  const file = pendingKeysFile();
  assert.ok(fs.existsSync(file));
  const text = fs.readFileSync(file, 'utf8');
  assert.match(text, /export TEST_SELECTED_KEY=your_key_here/);
  assert.equal(fs.statSync(file).mode & 0o777, 0o600);
});

test('an env-provided key is treated as present', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'selected-skills-keys-'));
  process.env.SELECTED_SKILLS_HOME = root;
  process.env.TEST_SELECTED_KEY = 'secret';
  const results = await configureKeys([{
    id: 'TEST_SELECTED_KEY',
    env: 'TEST_SELECTED_KEY',
    label: 'Test key',
    check: null,
    configure: null,
    skipHint: 'x'
  }], { yes: true });
  assert.equal(results[0].status, 'present');
  delete process.env.TEST_SELECTED_KEY;
});

test('configure errors are redacted', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'selected-skills-keys-'));
  process.env.SELECTED_SKILLS_HOME = root;
  const results = await configureKeys([{
    id: 'TEST_SELECTED_KEY',
    env: 'TEST_SELECTED_KEY',
    label: 'Test key',
    check: null,
    configure: ['sh', '-c', 'echo key=$TEST_SELECTED_KEY >&2; exit 1'],
    skipHint: 'export TEST_SELECTED_KEY=x'
  }], { keyValues: { TEST_SELECTED_KEY: 'secret-value' } });
  assert.equal(results[0].status, 'failed');
  assert.equal(results[0].error.includes('secret-value'), false);
  assert.match(results[0].error, /\*\*\*/);
});

test('dry-run never writes a pending script', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'selected-skills-keys-'));
  process.env.SELECTED_SKILLS_HOME = root;
  delete process.env.TEST_SELECTED_KEY;
  const results = await configureKeys([{
    id: 'TEST_SELECTED_KEY',
    env: 'TEST_SELECTED_KEY',
    label: 'Test key',
    check: null,
    configure: null,
    skipHint: 'export TEST_SELECTED_KEY=x'
  }], { dryRun: true, yes: true });
  assert.equal(results[0].status, 'skipped');
  assert.equal(fs.existsSync(pendingKeysFile()), false);
});
