import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { installSkills } from '../scripts/install.js';

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'selected-skills-test-'));
  process.env.SELECTED_SKILLS_HOME = path.join(root, 'data');
  const sources = path.join(root, 'data', 'sources', 'github.com');
  return {
    root,
    sources,
    repo(name) {
      return path.join(sources, ...name.split('/'));
    }
  };
}

function write(file, content, mode) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  if (mode) fs.chmodSync(file, mode);
}

function spec(slug, repo, skillPath, extra = {}) {
  return {
    slug,
    name: slug,
    repo,
    path: skillPath,
    kind: 'skill',
    source: `https://github.com/${repo}`,
    license: 'MIT',
    summary: `${slug} summary`,
    root: skillPath === '',
    ...extra
  };
}

test('copies a normal skill, preserves modes and warns about nested SKILL.md', async () => {
  const f = fixture();
  const source = f.repo('acme/demo');
  write(path.join(source, 'skills/demo/SKILL.md'), '---\nname: Demo Skill\n---\n# Demo\n');
  write(path.join(source, 'skills/demo/references/note.md'), 'note');
  write(path.join(source, 'skills/demo/scripts/run.sh'), '#!/bin/sh\necho ok\n', 0o755);
  write(path.join(source, 'skills/demo/assets/template/SKILL.md'), '---\nname: template\n---\n');

  const dest = path.join(f.root, 'dest');
  const result = await installSkills({
    selected: [spec('demo-skill', 'acme/demo', 'skills/demo')],
    platforms: ['claude'],
    dest
  });

  assert.equal(result.failed.length, 0);
  assert.equal(result.installed.length, 1);
  const target = path.join(dest, 'demo-skill');
  const skill = fs.readFileSync(path.join(target, 'SKILL.md'), 'utf8');
  assert.match(skill, /name: demo-skill/);
  assert.match(skill, /description: "demo-skill summary"/);
  assert.ok(fs.existsSync(path.join(target, 'references/note.md')));
  assert.equal(fs.statSync(path.join(target, 'scripts/run.sh')).mode & 0o111, 0o111);
  assert.ok(result.warnings.some((item) => item.includes('嵌套 SKILL.md')));
});

test('root-level skill excludes nested skill directories', async () => {
  const f = fixture();
  const source = f.repo('acme/root-skill');
  write(path.join(source, 'SKILL.md'), '---\nname: root-skill\ndescription: root\n---\n# Root\n');
  write(path.join(source, 'rules/a.md'), 'a');
  write(path.join(source, 'other/SKILL.md'), '---\nname: other\ndescription: other\n---\n');
  write(path.join(source, 'skills/other/SKILL.md'), '---\nname: other2\ndescription: other2\n---\n');

  const dest = path.join(f.root, 'dest');
  const result = await installSkills({
    selected: [spec('root-skill', 'acme/root-skill', '', { root: true })],
    platforms: ['claude'],
    dest
  });

  assert.equal(result.failed.length, 0);
  assert.ok(fs.existsSync(path.join(dest, 'root-skill/rules/a.md')));
  assert.equal(fs.existsSync(path.join(dest, 'root-skill/other/SKILL.md')), false);
  assert.equal(fs.existsSync(path.join(dest, 'root-skill/skills/other/SKILL.md')), false);
  assert.ok(result.warnings.some((item) => item.includes('嵌套 SKILL.md')));
});

test('escaping references are copied and rewritten into the skill directory', async () => {
  const f = fixture();
  const source = f.repo('acme/escape');
  write(path.join(source, 'CONNECTORS.md'), '# Connectors\n');
  write(path.join(source, 'skills/esc/SKILL.md'), '---\nname: esc\ndescription: esc\n---\nSee [connectors](../../CONNECTORS.md).\n');

  const dest = path.join(f.root, 'dest');
  const result = await installSkills({
    selected: [spec('esc', 'acme/escape', 'skills/esc')],
    platforms: ['claude'],
    dest
  });

  assert.equal(result.failed.length, 0);
  assert.ok(fs.existsSync(path.join(dest, 'esc/CONNECTORS.md')));
  const skill = fs.readFileSync(path.join(dest, 'esc/SKILL.md'), 'utf8');
  assert.match(skill, /\[connectors\]\(CONNECTORS\.md\)/);
});

test('link method falls back to copy when the upstream name needs normalization', async () => {
  const f = fixture();
  const source = f.repo('acme/link-name');
  write(path.join(source, 'skills/link-name/SKILL.md'), '---\nname: Link Name\ndescription: link\n---\n');
  const dest = path.join(f.root, 'dest');
  const result = await installSkills({
    selected: [spec('link-name', 'acme/link-name', 'skills/link-name')],
    platforms: ['claude'],
    dest,
    method: 'link'
  });
  assert.equal(result.failed.length, 0);
  assert.equal(fs.lstatSync(path.join(dest, 'link-name')).isSymbolicLink(), false);
  assert.ok(result.warnings.some((item) => item.includes('link 回退为 copy')));
});

test('link method falls back to copy for root-level skills', async () => {
  const f = fixture();
  const source = f.repo('acme/link-root');
  write(path.join(source, 'SKILL.md'), '---\nname: link-root\ndescription: root\n---\n');
  const dest = path.join(f.root, 'dest');
  const result = await installSkills({
    selected: [spec('link-root', 'acme/link-root', '', { root: true })],
    platforms: ['claude'],
    dest,
    method: 'link'
  });
  assert.equal(result.failed.length, 0);
  assert.equal(fs.lstatSync(path.join(dest, 'link-root')).isSymbolicLink(), false);
  assert.ok(result.warnings.some((item) => item.includes('根目录 skill 使用 copy')));
});

test('existing targets are skipped unless forced, then backed up', async () => {
  const f = fixture();
  const source = f.repo('acme/again');
  write(path.join(source, 'skills/again/SKILL.md'), '---\nname: again\ndescription: again\n---\n');
  const dest = path.join(f.root, 'dest');

  const first = await installSkills({ selected: [spec('again', 'acme/again', 'skills/again')], platforms: ['claude'], dest });
  assert.equal(first.installed.length, 1);
  const second = await installSkills({ selected: [spec('again', 'acme/again', 'skills/again')], platforms: ['claude'], dest });
  assert.equal(second.skipped.length, 1);
  const third = await installSkills({ selected: [spec('again', 'acme/again', 'skills/again')], platforms: ['claude'], dest, force: true });
  assert.equal(third.installed.length, 1);
  assert.ok(third.warnings.some((item) => item.includes('已备份')));
});
