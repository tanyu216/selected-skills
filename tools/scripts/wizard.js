import { PLATFORMS, PLATFORM_NAMES, detectPlatforms } from './platforms.js';
import { loadScenarios, buildSelection } from './scenarios.js';
import { categories } from './catalog.js';
import { collectDependencies, collectKeys } from './deps.js';
import { multiSelect, select, ask, confirm, isTTY } from './prompt.js';

export async function runWizard({ index, catalog }) {
  if (!isTTY()) throw new Error('当前不是交互终端；请使用 --yes 并指定参数');

  console.log('\nselected-skills 安装向导\n');

  const detected = new Set(detectPlatforms());
  const platformOptions = PLATFORM_NAMES.map((name) => ({
    value: name,
    label: `${name} (${PLATFORMS[name].label})`,
    hint: detected.has(name) ? '已检测到' : ''
  }));
  const defaultPlatforms = PLATFORM_NAMES.map((name, index) => detected.has(name) ? index : -1).filter((value) => value >= 0);
  const platforms = await multiSelect(
    '1/5 目标平台',
    platformOptions,
    { defaults: defaultPlatforms.length ? defaultPlatforms : [0] }
  );

  const scope = await select('2/5 安装范围', [
    { value: 'global', label: '全局', hint: '安装到各平台的用户级 skills 目录' },
    { value: 'project', label: '当前项目', hint: '安装到项目内的平台目录' }
  ]);
  const cwd = scope === 'project' ? await ask('项目根目录', { defaultValue: process.cwd() }) : process.cwd();
  const method = await select('3/5 安装方式', [
    { value: 'copy', label: '复制（推荐）', hint: '每个平台一份实体，兼容性最好' },
    { value: 'link', label: '软链接（高级）', hint: '只支持部分平台；升级时自动跟随源缓存' }
  ]);

  const modes = await multiSelect('4/5 安装内容', [
    { value: 'scenario', label: '按场景整包' },
    { value: 'category', label: '按分类整包' },
    { value: 'all', label: '全部可独立安装的 skill' },
    { value: 'manual', label: '手动输入 slug' }
  ], { defaults: [0] });

  const scenarios = [];
  const categoriesSelected = [];
  const skills = [];
  let all = false;

  if (modes.includes('scenario')) {
    const entries = loadScenarios();
    scenarios.push(...await multiSelect('选择场景', entries.map((entry) => ({
      value: entry.slug,
      label: entry.slug,
      hint: entry.title
    }))));
  }
  if (modes.includes('category')) {
    const map = categories(catalog);
    categoriesSelected.push(...await multiSelect('选择分类', [...map.entries()].map(([name, items]) => ({
      value: name,
      label: name,
      hint: `${items.length} 个条目`
    }))));
  }
  if (modes.includes('all')) all = true;
  if (modes.includes('manual')) {
    const answer = await ask('输入 skill slug（逗号分隔）');
    skills.push(...answer.split(/[\s,，]+/).filter(Boolean));
  }

  const includeCollections = await confirm('是否展开选中的合集？（会一次安装大量子 skill）', { defaultYes: false });

  const preview = buildSelection({ scenarios, categories: categoriesSelected, skills, all, includeCollections }, { index, catalog });
  const deps = collectDependencies(preview.selected);
  const keys = collectKeys(preview.selected);

  console.log('\n5/5 确认');
  console.log(`  平台: ${platforms.join(', ')}`);
  console.log(`  范围: ${scope}${scope === 'project' ? ` (${cwd})` : ''}`);
  console.log(`  方式: ${method}`);
  console.log(`  待安装: ${preview.selected.filter((spec) => spec.kind === 'skill').length} 个 skill`);
  if (preview.collectionHints.length) console.log(`  未展开合集: ${preview.collectionHints.map((item) => item.slug).join(', ')}`);
  if (preview.unresolved.length) console.log(`  未解析: ${preview.unresolved.map((item) => item.name).join(', ')}`);
  console.log(`  依赖: ${deps.map((item) => item.label).join(', ') || '无'}`);
  console.log(`  待配置 key: ${keys.map((item) => item.env).join(', ') || '无'}`);

  if (!await confirm('开始安装？')) {
    throw new Error('已取消');
  }

  return { platforms, scope, cwd, method, scenarios, categories: categoriesSelected, skills, all, includeCollections };
}
