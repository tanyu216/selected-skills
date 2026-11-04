#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../lib/common.sh"
source "$(dirname "$0")/../lib/fixtures.sh"

begin_suite "50-lifecycle"
seed_docs_sources

expect_exit 0 "安装用于生命周期测试" \
  installer install --skills pdf,docx --platform claude,codex --no-deps --yes --offline --json
assert_json_eq "$WS/last.out" "d.installed.length" "4" "初始安装 4 个目标"

expect_exit 0 "doctor --json" installer doctor --json
assert_json_eq "$WS/last.out" "d.stateSkills" "2" "doctor 读取到 2 个已安装 skill"
assert_json_eq "$WS/last.out" "d.detectedPlatforms.includes('claude')" "true" "doctor 检测到 claude"

expect_exit 0 "update --check --offline" installer update --check --offline --yes --json
assert_json_eq "$WS/last.out" "d.updates.length" "0" "离线检查没有可更新仓库"

expect_exit 0 "update --offline 未变化时跳过" installer update --offline --yes --json
assert_json_eq "$WS/last.out" "d.updated.length" "0" "未变化不重写"
assert_json_eq "$WS/last.out" "d.skipped.length" "4" "4 个目标均跳过"
assert_json_eq "$WS/last.out" "d.failed.length" "0" "update 没有失败"

CLAUDE_PDF="$(platform_skills_dir claude)/pdf/SKILL.md"
printf '\nLOCAL-CHANGE\n' >> "$CLAUDE_PDF"
expect_exit 0 "update 保护用户修改" installer update --offline --yes --json
assert_json_eq "$WS/last.out" "d.userModified.length" "1" "检测到 1 个用户修改"
assert_contains "$CLAUDE_PDF" "LOCAL-CHANGE" "用户修改未被覆盖"

expect_exit 0 "update --force 覆盖用户修改" installer update --offline --force --yes --json
assert_json_eq "$WS/last.out" "d.updated.length" "4" "--force 更新 4 个目标"
assert_not_contains "$CLAUDE_PDF" "LOCAL-CHANGE" "--force 覆盖了用户修改"
assert_json_eq "$WS/last.out" "d.failed.length" "0" "--force update 没有失败"

expect_exit 0 "list --installed --json" installer list --installed --json
assert_json_eq "$WS/last.out" "d.length" "2" "list 只列出已安装 skill"

expect_exit 0 "按平台卸载单个 skill" \
  installer uninstall --platform claude --skills pdf --yes --json
assert_json_eq "$WS/last.out" "d.removed.length" "1" "卸载 1 个目标"
assert_absent "$HOME/.claude/skills/pdf" "claude/pdf 目录已删除"
assert_json_eq "$SELECTED_SKILLS_HOME/state.json" "d.skills.pdf.platforms.claude" "undefined" "state 移除 claude 记录"
assert_json_eq "$SELECTED_SKILLS_HOME/state.json" "Boolean(d.skills.pdf.platforms.codex)" "true" "codex 记录保留"

expect_exit 0 "卸载全部" installer uninstall --all --yes --json
assert_json_eq "$WS/last.out" "d.removed.length" "3" "剩余 3 个目标全部卸载"
assert_json_eq "$SELECTED_SKILLS_HOME/state.json" "Object.keys(d.skills).length" "0" "state 清空"
assert_absent "$HOME/.claude/skills/pdf" "claude/pdf 已删除"
assert_absent "$HOME/.claude/skills/docx" "claude/docx 已删除"
assert_absent "$HOME/.codex/skills/pdf" "codex/pdf 已删除"
assert_absent "$HOME/.codex/skills/docx" "codex/docx 已删除"

expect_exit 2 "uninstall 缺少选择项时失败" installer uninstall --yes
expect_exit 0 "卸载后 doctor 仍可用" installer doctor --json
assert_json_eq "$WS/last.out" "d.stateSkills" "0" "doctor 显示无已安装 skill"

finish_suite
