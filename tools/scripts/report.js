import { colorize } from './util.js';

function licenseSummary(items) {
  const map = new Map();
  for (const item of items) {
    const key = item.license || 'unknown';
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

export function installReport(result, { json = false, color = true, pendingKeys = null, logFile = null } = {}) {
  const licenses = licenseSummary(result.installed);
  const payload = {
    installed: result.installed,
    skipped: result.skipped,
    failed: result.failed,
    frameworks: result.frameworks,
    collectionHints: result.collectionHints,
    warnings: result.warnings,
    hints: result.hints,
    keyResults: result.keyResults || [],
    depResults: result.depResults || [],
    licenses,
    pendingKeys,
    logFile
  };
  if (json) {
    console.log(JSON.stringify(payload, null, 2));
    return payload;
  }

  const out = (code, text) => console.log(colorize(color, code, text));
  out('1', '\n安装结果');
  if (result.installed.length) {
    out('32', `  成功 ${result.installed.length}`);
    for (const item of result.installed) {
      console.log(`    ${item.slug}  →  ${item.platform}: ${item.dir}  (${item.method})`);
    }
  } else {
    console.log('  成功 0');
  }
  if (result.skipped.length) {
    out('33', `  跳过 ${result.skipped.length}`);
    for (const item of result.skipped) console.log(`    ${item.slug}@${item.platform}: ${item.reason}`);
  }
  if (result.failed.length) {
    out('31', `  失败 ${result.failed.length}`);
    for (const item of result.failed) console.log(`    ${item.slug}${item.platform ? `@${item.platform}` : ''}: ${item.error}`);
  }
  if (result.frameworks.length) {
    out('36', '  框架/库条目（未安装 skill 目录）');
    for (const item of result.frameworks) {
      console.log(`    ${item.slug}`);
      for (const hint of item.hints) console.log(`      ${hint}`);
    }
  }
  if (result.collectionHints.length) {
    out('36', '  未展开的合集（单独选择或加 --include-collections）');
    for (const item of result.collectionHints) console.log(`    ${item.slug} (${item.repo})`);
  }
  if (licenses.length) {
    out('36', '  license 汇总');
    for (const [license, count] of licenses) console.log(`    ${license}: ${count}`);
  }
  if (result.hints.length) {
    out('36', '  依赖/配置提示');
    for (const hint of result.hints) console.log(`    ${hint}`);
  }
  if (result.warnings.length) {
    out('33', `  警告 ${result.warnings.length}`);
    for (const warning of result.warnings.slice(0, 20)) console.log(`    ${warning}`);
    if (result.warnings.length > 20) console.log(`    ... 其余 ${result.warnings.length - 20} 条见日志`);
  }
  const platformHints = {
    claude: '无需重启，直接使用',
    codex: '用 $skill-name 或 /skills 调用',
    pi: '用 /skill:name 调用',
    opencode: '由 skill 工具自动加载',
    cursor: '用 /skill-name 调用',
    grok: '用 /name 调用',
    gemini: '执行 /skills reload 后使用',
    openclaw: '执行 openclaw skills list 确认',
    hermes: '执行 hermes skills list 或 /reload-skills'
  };
  const usedPlatforms = [...new Set(result.installed.map((item) => item.platform))];
  if (usedPlatforms.length) {
    out('36', '  启用提示');
    for (const platform of usedPlatforms) console.log(`    ${platform}: ${platformHints[platform] || '按平台文档加载'}`);
  }
  if (pendingKeys) {
    out('33', `  待配置 key: ${pendingKeys}`);
    console.log('    跳过时已写入配置示例，替换占位符后执行即可。');
  }
  if (logFile) console.log(`\n日志: ${logFile}`);
  return payload;
}

export function listReport(entries, { json = false } = {}) {
  if (json) {
    console.log(JSON.stringify(entries, null, 2));
    return;
  }
  const byCategory = new Map();
  for (const entry of entries) {
    if (!byCategory.has(entry.category)) byCategory.set(entry.category, []);
    byCategory.get(entry.category).push(entry);
  }
  for (const [category, items] of [...byCategory.entries()].sort()) {
    console.log(`\n${category} (${items.length})`);
    for (const item of items) {
      const kind = item.kind && item.kind !== 'skill' ? ` [${item.kind}]` : '';
      console.log(`  ${item.slug}${kind} — ${item.summary || item.name}`);
    }
  }
}

export function doctorReport(payload, { json = false } = {}) {
  if (json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }
  console.log('selected-skills doctor');
  console.log(`  数据目录: ${payload.dataHome}`);
  console.log(`  git: ${payload.tools.git ? 'ok' : 'missing'}  npm: ${payload.tools.npm ? 'ok' : 'missing'}  uv: ${payload.tools.uv ? 'ok' : 'missing'}  tar: ${payload.tools.tar ? 'ok' : 'missing'}`);
  console.log(`  已检测平台: ${payload.detectedPlatforms.join(', ') || '无'}`);
  if (payload.unresolved.length) {
    console.log('  未解析来源:');
    for (const item of payload.unresolved) console.log(`    ${item.slug}: ${item.reason}`);
  }
  if (payload.warnings.length) {
    console.log('  警告:');
    for (const warning of payload.warnings) console.log(`    ${warning}`);
  }
  if (payload.updates?.length) {
    console.log('  可更新仓库:');
    for (const item of payload.updates) console.log(`    ${item.repo}: ${item.local} -> ${item.remote}`);
  }
}
