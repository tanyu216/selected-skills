#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../lib/common.sh"
source "$(dirname "$0")/../lib/fixtures.sh"

begin_suite "60-selection"
seed_general_sources

expect_exit 0 "按分类安装 docs" \
  installer install --category docs --platform claude --no-deps --yes --offline --json
assert_json_eq "$WS/last.out" "d.installed.length" "4" "docs 分类包含 4 个 skill"
assert_json_eq "$WS/last.out" "d.installed.map((i) => i.slug).sort().join(',')" \
  "docx,pdf,pptx,xlsx" "docs 分类内容正确"

expect_exit 0 "按场景安装 general" \
  installer install --scenario general --platform codex --no-deps --yes --offline --json
assert_json_eq "$WS/last.out" "d.installed.length" "12" "general 场景包含 12 个 skill"
assert_json_eq "$WS/last.out" "d.failed.length" "0" "场景内所有来源均可解析"

expect_exit 0 "重复 slug 自动去重" \
  installer install --skills pdf,pdf,docx,pdf --platform cursor --no-deps --yes --offline --json
assert_json_eq "$WS/last.out" "d.installed.length" "2" "重复 slug 只安装一次"

expect_exit 0 "自定义 --dest 安装" \
  installer install --skills pdf --platform claude --dest "$WS/custom" --no-deps --yes --offline --json
assert_file "$WS/custom/pdf/SKILL.md" "自定义目标目录有内容"
assert_json_eq "$WS/last.out" "d.installed[0].dir" "$WS/custom/pdf" "报告中的目标路径正确"

expect_exit 2 "未知 skill 失败" \
  installer install --skills does-not-exist --platform claude --no-deps --yes --offline
expect_exit 2 "未知分类失败" \
  installer install --category nope --platform claude --no-deps --yes --offline
expect_exit 2 "未知场景失败" \
  installer install --scenario nope --platform claude --no-deps --yes --offline
expect_exit 2 "未知 scope 失败" \
  installer install --skills pdf --platform claude --scope machine --no-deps --yes --offline
expect_exit 2 "未知 method 失败" \
  installer install --skills pdf --platform claude --method banana --no-deps --yes --offline
expect_exit 1 "只选中合集时提示展开" \
  installer install --skills meerkat-taskpanel --platform claude --no-deps --yes --offline
assert_contains "$WS/last.err" "合集" "合集提示包含原因"

finish_suite
