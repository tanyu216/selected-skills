#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../lib/common.sh"
source "$(dirname "$0")/../lib/fixtures.sh"

begin_suite "30-idempotency"
seed_docs_sources

expect_exit 0 "首次安装 pdf/docx 到 claude+codex" \
  installer install --skills pdf,docx --platform claude,codex --no-deps --yes --offline --json
assert_json_eq "$WS/last.out" "d.installed.length" "4" "首次安装 4 个目标"
assert_json_eq "$WS/last.out" "d.skipped.length" "0" "首次安装没有跳过"

expect_exit 0 "重复安装保持幂等" \
  installer install --skills pdf,docx --platform claude,codex --no-deps --yes --offline --json
assert_json_eq "$WS/last.out" "d.installed.length" "0" "重复安装不写入"
assert_json_eq "$WS/last.out" "d.skipped.length" "4" "重复安装全部跳过"

CLAUDE_PDF="$(platform_skills_dir claude)/pdf/SKILL.md"
printf '\nLOCAL-CHANGE\n' >> "$CLAUDE_PDF"
expect_exit 0 "默认不覆盖用户修改" \
  installer install --skills pdf,docx --platform claude,codex --no-deps --yes --offline --json
assert_json_eq "$WS/last.out" "d.skipped.length" "4" "用户修改的目标仍被跳过"
assert_contains "$CLAUDE_PDF" "LOCAL-CHANGE" "用户修改保留"

expect_exit 0 "--force 覆盖并备份" \
  installer install --skills pdf,docx --platform claude,codex --no-deps --yes --offline --force --json
assert_json_eq "$WS/last.out" "d.installed.length" "4" "--force 重新安装 4 个目标"
assert_not_contains "$CLAUDE_PDF" "LOCAL-CHANGE" "--force 覆盖了用户修改"

BACKUP="$(find "$SELECTED_SKILLS_HOME/backups/claude" -mindepth 1 -maxdepth 1 -type d -name 'pdf-*' 2>/dev/null | sort | tail -n 1)"
assert_ne "$BACKUP" "" "生成 claude/pdf 备份"
assert_file "$BACKUP/SKILL.md" "备份包含原始 SKILL.md"
assert_contains "$BACKUP/SKILL.md" "LOCAL-CHANGE" "备份保留被覆盖前的内容"

leftovers="$(find "$HOME" "$SELECTED_SKILLS_HOME" -name '.selected-skills-tmp-*' 2>/dev/null | wc -l | tr -d ' ')"
assert_eq "$leftovers" "0" "没有临时目录残留"

assert_json_eq "$SELECTED_SKILLS_HOME/state.json" "d.skills.pdf.platforms.claude.method" "copy" "state 仍然指向 copy 安装"

finish_suite
