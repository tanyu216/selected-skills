import fs from 'node:fs';
import path from 'node:path';
import { commandExists, expandHome, homeDir } from './util.js';

function xdgConfigHome() {
  return process.env.XDG_CONFIG_HOME || path.join(homeDir(), '.config');
}

export const PLATFORMS = {
  claude: {
    label: 'Claude Code',
    bin: 'claude',
    global: () => path.join(homeDir(), '.claude', 'skills'),
    project: (cwd) => path.join(cwd, '.claude', 'skills'),
    link: true
  },
  codex: {
    label: 'OpenAI Codex CLI',
    bin: 'codex',
    global: () => path.join(homeDir(), '.codex', 'skills'),
    project: (cwd) => path.join(cwd, '.codex', 'skills'),
    link: false
  },
  pi: {
    label: 'pi coding agent',
    bin: 'pi',
    global: () => path.join(process.env.PI_CODING_AGENT_DIR || path.join(homeDir(), '.pi', 'agent'), 'skills'),
    project: (cwd) => path.join(cwd, '.pi', 'skills'),
    link: true
  },
  opencode: {
    label: 'opencode',
    bin: 'opencode',
    global: () => path.join(xdgConfigHome(), 'opencode', 'skills'),
    project: (cwd) => path.join(cwd, '.opencode', 'skills'),
    link: false
  },
  cursor: {
    label: 'Cursor',
    bin: 'cursor',
    global: () => path.join(homeDir(), '.cursor', 'skills'),
    project: (cwd) => path.join(cwd, '.cursor', 'skills'),
    link: false
  },
  grok: {
    label: 'Grok Build CLI',
    bin: 'grok',
    global: () => path.join(process.env.GROK_HOME || path.join(homeDir(), '.grok'), 'skills'),
    project: (cwd) => path.join(cwd, '.grok', 'skills'),
    link: false
  },
  gemini: {
    label: 'Gemini CLI',
    bin: 'gemini',
    global: () => path.join(homeDir(), '.gemini', 'skills'),
    project: (cwd) => path.join(cwd, '.gemini', 'skills'),
    link: true
  },
  openclaw: {
    label: 'OpenClaw',
    bin: 'openclaw',
    global: () => path.join(homeDir(), '.openclaw', 'skills'),
    project: (cwd) => path.join(cwd, 'skills'),
    link: true,
    projectLink: false
  },
  hermes: {
    label: 'Hermes Agent',
    bin: 'hermes',
    global: () => path.join(process.env.HERMES_HOME || path.join(homeDir(), '.hermes'), 'skills'),
    project: null,
    link: false
  }
};

export const PLATFORM_NAMES = Object.keys(PLATFORMS);

export function getPlatform(name) {
  const key = String(name || '').toLowerCase();
  const platform = PLATFORMS[key];
  if (!platform) {
    throw new Error(`未知平台: ${name}；可用平台: ${PLATFORM_NAMES.join(', ')}`);
  }
  return { name: key, ...platform };
}

export function detectPlatforms() {
  const detected = [];
  for (const name of PLATFORM_NAMES) {
    const platform = PLATFORMS[name];
    const globalDir = platform.global();
    const hasBin = commandExists(platform.bin);
    const hasDir = fs.existsSync(path.dirname(globalDir));
    if (hasBin || hasDir) detected.push(name);
  }
  return detected;
}

export function resolveDest(platformName, { scope = 'global', cwd = process.cwd(), dest } = {}) {
  if (dest) return path.resolve(expandHome(dest));
  const platform = getPlatform(platformName);
  if (scope === 'global') return platform.global();
  if (!platform.project) {
    throw new Error(`${platform.label} 不支持项目级安装；请使用 --scope global 或 --dest`);
  }
  return platform.project(path.resolve(cwd));
}

export function supportsLink(platformName, { scope = 'global' } = {}) {
  const platform = PLATFORMS[String(platformName).toLowerCase()];
  if (!platform) return false;
  if (platformName === 'openclaw' && scope === 'project') return false;
  return Boolean(platform.link);
}
