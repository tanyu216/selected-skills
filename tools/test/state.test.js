import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadState, saveState, stateFile, stateBackupFile } from '../scripts/state.js';

test('state is backed up and recovered from corruption', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'selected-skills-state-'));
  process.env.SELECTED_SKILLS_HOME = root;
  fs.mkdirSync(root, { recursive: true });
  const first = { schemaVersion: 1, skills: { a: { slug: 'a', platforms: {} } }, repos: {} };
  await saveState(first);
  const second = { schemaVersion: 1, skills: { a: first.skills.a, b: { slug: 'b', platforms: {} } }, repos: {} };
  await saveState(second);
  assert.ok(fs.existsSync(stateBackupFile()));
  fs.writeFileSync(stateFile(), '{broken');
  const recovered = loadState();
  assert.equal(recovered._recovered, true);
  assert.ok(recovered.skills.a);
});
