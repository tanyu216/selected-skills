#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../lib/common.sh"
source "$(dirname "$0")/../lib/fixtures.sh"

begin_suite "40-link-project"
seed_tavily_sources

SOURCE_DIR="$SELECTED_SKILLS_HOME/sources/github.com/tavily-ai/skills/skills/core/tavily-search"

expect_exit 0 "link 模式按平台能力回退" \
  installer install --skills tavily-search --platform claude,gemini,codex \
  --method link --no-deps --yes --offline --json
assert_json_eq "$WS/last.out" "d.installed.length" "3" "三个平台都安装"
assert_json_eq "$WS/last.out" "d.failed.length" "0" "link 安装没有失败"
assert_json_eq "$WS/last.out" "d.installed.find((i) => i.platform === 'claude').method" "link" "claude 使用软链接"
assert_json_eq "$WS/last.out" "d.installed.find((i) => i.platform === 'gemini').method" "link" "gemini 使用软链接"
assert_json_eq "$WS/last.out" "d.installed.find((i) => i.platform === 'codex').method" "copy" "codex 回退为 copy"

assert_symlink "$HOME/.claude/skills/tavily-search" "claude 目标是软链接"
assert_eq "$(readlink "$HOME/.claude/skills/tavily-search")" "$SOURCE_DIR" "claude 软链接指向上游缓存"
assert_file "$HOME/.claude/skills/tavily-search/SKILL.md" "软链接可读取 SKILL.md"
assert_symlink "$HOME/.gemini/skills/tavily-search" "gemini 目标是软链接"
assert_not_symlink "$HOME/.codex/skills/tavily-search" "codex 目标是实体副本"

expect_exit 0 "项目级安装（cursor）" \
  installer install --skills tavily-search --platform cursor --scope project \
  --cwd "$WS/app" --no-deps --yes --offline --json
assert_file "$WS/app/.cursor/skills/tavily-search/SKILL.md" "cursor 项目级目录正确"

expect_exit 0 "项目级安装（openclaw）" \
  installer install --skills tavily-search --platform openclaw --scope project \
  --cwd "$WS/app-openclaw" --no-deps --yes --offline --json
assert_file "$WS/app-openclaw/skills/tavily-search/SKILL.md" "openclaw 项目级目录为 <cwd>/skills"

expect_exit 1 "hermes 不支持项目级安装" \
  installer install --skills tavily-search --platform hermes --scope project \
  --cwd "$WS/app-hermes" --no-deps --yes --offline --json
assert_json_eq "$WS/last.out" "d.failed.length" "1" "hermes 项目级安装报告失败"
assert_contains "$WS/last.out" "不支持项目级安装" "失败原因说明 hermes 不支持项目级"

expect_exit 1 "--dest 与多平台同时使用被拒绝" \
  installer install --skills tavily-search --platform claude,gemini --dest "$WS/custom" \
  --no-deps --yes --offline
assert_contains "$WS/last.err" "只能与单个平台" "--dest 冲突提示清晰"

expect_exit 0 "单平台 --dest 可用" \
  installer install --skills tavily-search --platform claude --dest "$WS/custom" \
  --no-deps --yes --offline --json
assert_file "$WS/custom/tavily-search/SKILL.md" "自定义目标目录生效"

finish_suite
