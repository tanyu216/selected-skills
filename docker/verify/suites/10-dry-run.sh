#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../lib/common.sh"
source "$(dirname "$0")/../lib/fixtures.sh"

begin_suite "10-dry-run"
seed_general_sources

expect_exit 0 "dry-run 全平台计划" \
  installer install --skills pdf,docx,tavily-search --platform all --no-deps --yes --dry-run --json
assert_json_eq "$WS/last.out" "d.installed.length" "27" "3 个 skill × 9 个平台 = 27 条计划"
assert_json_eq "$WS/last.out" "d.failed.length" "0" "dry-run 没有失败项"
assert_json_eq "$WS/last.out" "d.installed.every((item) => item.dryRun === true)" "true" "所有计划都标记为 dryRun"
assert_json_eq "$WS/last.out" "d.installed.every((item) => item.method === 'copy')" "true" "默认计划使用 copy"

assert_absent "$HOME/.claude" "dry-run 不创建平台目录"
assert_absent "$HOME/.codex" "dry-run 不创建 codex 目录"
assert_absent "$SELECTED_SKILLS_HOME/state.json" "dry-run 不写 state.json"
assert_absent "$SELECTED_SKILLS_HOME/logs" "dry-run 不写安装日志"
assert_absent "$SELECTED_SKILLS_HOME/pending-keys.sh" "dry-run 不写 pending-keys.sh"

# CI 中常见的用法：非交互 + 无 --yes，只预演
expect_exit 0 "dry-run 无需 --yes" \
  installer install --skills pdf --platform claude --no-deps --dry-run --json
assert_json_eq "$WS/last.out" "d.installed.length" "1" "单平台 dry-run 计划正确"

finish_suite
