import readline from 'node:readline';

let rl = null;

export function isTTY() {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

function interfaceInstance() {
  if (!rl) rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return rl;
}

export function closePrompt() {
  if (rl) {
    rl.close();
    rl = null;
  }
}

export async function ask(question, { defaultValue = '' } = {}) {
  if (!isTTY()) throw new Error('非交互环境，请使用 --yes 或相应参数');
  const suffix = defaultValue ? ` (${defaultValue})` : '';
  const answer = await interfaceInstance().question(`${question}${suffix} `);
  return answer.trim() || defaultValue;
}

export async function confirm(question, { defaultYes = true } = {}) {
  const hint = defaultYes ? 'Y/n' : 'y/N';
  const answer = await ask(`${question} [${hint}]`);
  if (!answer) return defaultYes;
  return /^y(es)?$/i.test(answer);
}

export async function select(question, options) {
  if (!isTTY()) throw new Error('非交互环境，请直接指定参数');
  console.log(question);
  options.forEach((option, index) => {
    console.log(`  ${index + 1}. ${option.label}${option.hint ? ` — ${option.hint}` : ''}`);
  });
  const answer = await ask('选择序号');
  const index = Number.parseInt(answer, 10) - 1;
  if (!Number.isInteger(index) || index < 0 || index >= options.length) {
    throw new Error(`无效选择: ${answer}`);
  }
  return options[index].value;
}

function parseIndexes(input, length, defaults) {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return new Set(defaults || []);
  if (trimmed === 'a' || trimmed === 'all' || trimmed === '全部') {
    return new Set(Array.from({ length }, (_, index) => index));
  }
  const result = new Set();
  for (const part of trimmed.split(/[\s,，]+/).filter(Boolean)) {
    const range = part.match(/^(\d+)-(\d+)$/);
    if (range) {
      const start = Number(range[1]) - 1;
      const end = Number(range[2]) - 1;
      for (let index = start; index <= end; index += 1) {
        if (index >= 0 && index < length) result.add(index);
      }
    } else {
      const index = Number(part) - 1;
      if (Number.isInteger(index) && index >= 0 && index < length) result.add(index);
    }
  }
  return result;
}

export async function multiSelect(question, options, { defaults = [] } = {}) {
  if (!isTTY()) throw new Error('非交互环境，请直接指定参数');
  console.log(question);
  options.forEach((option, index) => {
    const mark = defaults.includes(index) ? '*' : ' ';
    console.log(` ${mark}${index + 1}. ${option.label}${option.hint ? ` — ${option.hint}` : ''}`);
  });
  console.log('  输入序号（逗号分隔，如 1,3），a 全选，回车使用 * 默认项');
  const answer = await ask('选择');
  const indexes = parseIndexes(answer, options.length, defaults);
  return [...indexes].map((index) => options[index].value);
}

export async function secret(question) {
  if (!isTTY()) return '';
  const instance = interfaceInstance();
  const original = instance._writeToOutput;
  instance._writeToOutput = () => {};
  process.stdout.write(question);
  const answer = await new Promise((resolve) => instance.question('', resolve));
  instance._writeToOutput = original;
  process.stdout.write('\n');
  return answer;
}
