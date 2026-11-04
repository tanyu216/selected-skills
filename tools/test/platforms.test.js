import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { PLATFORM_NAMES, resolveDest, getPlatform, supportsLink } from '../scripts/platforms.js';

test('all nine platforms resolve a global skills directory', () => {
  assert.equal(PLATFORM_NAMES.length, 9);
  for (const name of PLATFORM_NAMES) {
    const dir = resolveDest(name, { scope: 'global' });
    assert.ok(dir.endsWith('skills'), `${name}: ${dir}`);
  }
});

test('project scope follows each platform convention', () => {
  const cwd = path.join(os.tmpdir(), 'demo-project');
  assert.equal(resolveDest('claude', { scope: 'project', cwd }), path.join(cwd, '.claude', 'skills'));
  assert.equal(resolveDest('opencode', { scope: 'project', cwd }), path.join(cwd, '.opencode', 'skills'));
  assert.equal(resolveDest('openclaw', { scope: 'project', cwd }), path.join(cwd, 'skills'));
  assert.throws(() => resolveDest('hermes', { scope: 'project', cwd }), /不支持项目级/);
});

test('environment overrides are honored', () => {
  const previous = {
    XDG_CONFIG_HOME: process.env.XDG_CONFIG_HOME,
    HERMES_HOME: process.env.HERMES_HOME,
    GROK_HOME: process.env.GROK_HOME,
    PI_CODING_AGENT_DIR: process.env.PI_CODING_AGENT_DIR
  };
  process.env.XDG_CONFIG_HOME = '/tmp/xdg';
  process.env.HERMES_HOME = '/tmp/hermes';
  process.env.GROK_HOME = '/tmp/grok';
  process.env.PI_CODING_AGENT_DIR = '/tmp/pi';
  assert.equal(resolveDest('opencode'), '/tmp/xdg/opencode/skills');
  assert.equal(resolveDest('hermes'), '/tmp/hermes/skills');
  assert.equal(resolveDest('grok'), '/tmp/grok/skills');
  assert.equal(resolveDest('pi'), '/tmp/pi/skills');
  for (const [key, value] of Object.entries(previous)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test('link support matches the platform table', () => {
  assert.equal(supportsLink('claude'), true);
  assert.equal(supportsLink('gemini'), true);
  assert.equal(supportsLink('openclaw', { scope: 'global' }), true);
  assert.equal(supportsLink('openclaw', { scope: 'project' }), false);
  assert.equal(supportsLink('cursor'), false);
  assert.throws(() => getPlatform('nope'), /未知平台/);
});
