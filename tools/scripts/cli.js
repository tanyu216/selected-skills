import fs from 'node:fs';
import { packagePath } from './util.js';

const BOOLEAN_FLAGS = new Set([
  'all', 'yes', 'dry-run', 'force', 'offline', 'include-collections', 'collections', 'no-deps',
  'prune', 'repair', 'check', 'check-updates', 'json', 'no-color', 'strict-scenarios', 'installed',
  'help', 'version', 'verbose', 'keep-local', 'verify', 'purge-backups'
]);

const VALUE_FLAGS = new Set([
  'platform', 'scope', 'scenario', 'category', 'skills', 'method', 'dest', 'cwd',
  'project', 'key', 'keep-backups'
]);

function camel(name) {
  return name.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

export function parseArgs(argv) {
  const args = [...argv];
  let command = 'help';
  if (args[0] && !args[0].startsWith('-')) command = args.shift();
  const options = { _: [] };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--') {
      options._.push(...args.slice(index + 1));
      break;
    }
    if (arg === '-h') { options.help = true; continue; }
    if (arg === '-v') { options.version = true; continue; }
    if (!arg.startsWith('--')) {
      if (arg.startsWith('-') && arg !== '-') throw new Error(`未知参数: ${arg}`);
      options._.push(arg);
      continue;
    }
    const eq = arg.indexOf('=');
    const rawName = eq === -1 ? arg.slice(2) : arg.slice(2, eq);
    const inlineValue = eq === -1 ? undefined : arg.slice(eq + 1);
    const name = camel(rawName);
    if (BOOLEAN_FLAGS.has(rawName)) {
      options[name] = inlineValue === undefined ? true : inlineValue !== 'false';
      continue;
    }
    if (VALUE_FLAGS.has(rawName)) {
      const value = inlineValue === undefined ? args[index + 1] : inlineValue;
      if (value === undefined || (value.startsWith('--') && inlineValue === undefined)) {
        throw new Error(`--${rawName} 需要一个值`);
      }
      if (inlineValue === undefined) index += 1;
      if (options[name] === undefined) options[name] = [];
      options[name].push(value);
      continue;
    }
    throw new Error(`未知参数: --${rawName}`);
  }
  return { command, options };
}

export function getVersion() {
  try {
    return JSON.parse(fs.readFileSync(packagePath('package.json'), 'utf8')).version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

export function helpText() {
  return `selected-skills ${getVersion()}

用法:
  selected-skills install [选项]
  selected-skills list [--category <分类>] [--installed] [--json]
  selected-skills update [--platform <平台>] [--check] [--repair] [--prune] [--yes]
  selected-skills sync --collections [--prune] [--yes]
  selected-skills doctor [--check-updates] [--json]
  selected-skills uninstall [--platform <平台>] [--skills a,b | --all] [--yes]

安装选项:
  --platform <a,b|all>        目标平台: claude,codex,pi,opencode,cursor,grok,gemini,openclaw,hermes
  --scope <global|project>    安装范围，默认 global
  --cwd <dir>                 项目根（--scope project 时使用）
  --dest <dir>                自定义目标目录
  --method <copy|link>        安装方式，默认 copy
  --scenario <name>           按场景整包安装，可重复/逗号分隔
  --category <name>           按分类安装，可重复/逗号分隔
  --skills <a,b>              精确指定 skill
  --all                       安装全部可独立安装的 skill
  --include-collections       展开合集
  --project <dir>             项目级依赖安装目录（如 remotion）
  --key <NAME=value>          非交互传入 key（会提示 argv 可见）
  --no-deps                   跳过依赖安装
  --yes                       非交互确认
  --dry-run                   只打印计划，不联网、不写盘
  --force                     覆盖已存在的目标（先备份）
  --offline                   只使用本地缓存
  --strict-scenarios          场景有未解析项时失败
  --json                      输出机器可读 JSON
  --no-color                  关闭颜色
  -h, --help                  显示帮助
  -v, --version               显示版本
`;
}
