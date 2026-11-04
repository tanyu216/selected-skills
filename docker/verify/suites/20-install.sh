#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../lib/common.sh"
source "$(dirname "$0")/../lib/fixtures.sh"

begin_suite "20-install"
seed_general_sources

expect_exit 0 "scenario general 安装到全部平台" \
  installer install --scenario general --platform all --no-deps --yes --offline --verify --json
REPORT="$WS/last.out"

assert_json_eq "$REPORT" "d.installed.length" "108" "12 个 skill × 9 个平台 = 108 次安装"
assert_json_eq "$REPORT" "d.failed.length" "0" "没有失败项"
assert_json_eq "$REPORT" "d.skipped.length" "0" "首次安装没有跳过项"
assert_json_eq "$REPORT" "d.warnings.filter((w) => w.startsWith('verify ')).length" "0" "--verify 没有发现 frontmatter 问题"
assert_json_eq "$REPORT" "d.licenses.length >= 1" "true" "license 汇总不为空"

for platform in "${ALL_PLATFORMS[@]}"; do
  base="$(platform_skills_dir "$platform")"
  assert_dir "$base" "$platform 全局目录已创建"
  assert_file "$base/pdf/SKILL.md" "$platform 安装 pdf"
  assert_file "$base/tavily-search/SKILL.md" "$platform 安装 tavily-search"
  assert_file "$base/grilling/SKILL.md" "$platform 安装 grilling"
  count="$(find "$base" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')"
  assert_eq "$count" "12" "$platform 目录下有 12 个 skill"
done

# 拷贝语义：frontmatter 规范化、引用文件、可执行位
CLAUDE_SKILLS="$(platform_skills_dir claude)"
assert_contains "$CLAUDE_SKILLS/pdf/SKILL.md" '^name: pdf$' "pdf 的 name 规范化为 slug"
assert_contains "$CLAUDE_SKILLS/pdf/SKILL.md" '^description: ' "pdf 保留 description"
assert_file "$CLAUDE_SKILLS/pdf/references/notes.md" "引用文件被复制"
assert_mode "$CLAUDE_SKILLS/pdf/scripts/run.sh" "755" "脚本可执行位被保留"
assert_not_symlink "$CLAUDE_SKILLS/pdf" "默认 copy 不是软链接"

# state / 日志 / pending keys
STATE="$SELECTED_SKILLS_HOME/state.json"
assert_file "$STATE" "state.json 已写入"
assert_mode "$STATE" "600" "state.json 权限为 0600"
assert_json_eq "$STATE" "Object.keys(d.skills).length" "12" "state 记录 12 个 skill"
assert_json_eq "$STATE" "Object.keys(d.skills.pdf.platforms).length" "9" "pdf 记录了 9 个平台"
assert_json_eq "$STATE" "d.skills.pdf.platforms.claude.method" "copy" "state 记录 copy 方式"
assert_json_eq "$STATE" "d.skills.grilling.platforms.hermes.installedHash.length > 0" "true" "state 记录安装内容 hash"
assert_json_eq "$STATE" "d.skills.pdf.platforms.claude.dir.startsWith('$HOME/')" "true" "安装目录位于隔离 HOME 内"

LOG="$SELECTED_SKILLS_HOME/logs/last-install.json"
assert_file "$LOG" "最近一次安装日志已写入"
assert_json_eq "$LOG" "d.installed.length" "108" "日志记录 108 次安装"
assert_json_eq "$LOG" "d.depResults.length" "0" "日志记录 --no-deps 结果"
assert_json_eq "$LOG" "d.keyResults.length" "1" "日志记录 key 处理结果"

PENDING="$SELECTED_SKILLS_HOME/pending-keys.sh"
assert_file "$PENDING" "跳过的 API key 写入 pending-keys.sh"
assert_mode "$PENDING" "600" "pending-keys.sh 权限为 0600"
assert_contains "$PENDING" "tvly login" "pending-keys.sh 包含占位符命令"
assert_not_contains "$PENDING" "tvly-[A-Za-z0-9]\{20,\}" "pending-keys.sh 不包含真实 key"

assert_no_root_files "安装产物不属于 root" "$HOME" "$SELECTED_SKILLS_HOME"

finish_suite
