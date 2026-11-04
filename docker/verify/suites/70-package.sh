#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../lib/common.sh"
source "$(dirname "$0")/../lib/fixtures.sh"

begin_suite "70-package"
seed_general_sources

mkdir -p "$WS/pack"
expect_exit 0 "npm pack 生成发布包" npm pack --pack-destination "$WS/pack"
TGZ="$(find "$WS/pack" -maxdepth 1 -name 'selected-skills-*.tgz' | head -n 1)"
assert_ne "$TGZ" "" "找到 npm 发布包"
if [ -z "$TGZ" ]; then
  finish_suite
fi

tar -tzf "$TGZ" > "$WS/tarball-files.txt"
assert_contains "$WS/tarball-files.txt" "package/tools/bin/selected-skills.js" "发布包包含 CLI 入口"
assert_contains "$WS/tarball-files.txt" "package/tools/scripts/main.js" "发布包包含安装器实现"
assert_contains "$WS/tarball-files.txt" "package/skills/docs/pdf.md" "发布包包含 skill 索引"
assert_contains "$WS/tarball-files.txt" "package/scenarios/general.md" "发布包包含场景"
assert_contains "$WS/tarball-files.txt" "package/install.sh" "发布包包含源码安装入口"
assert_not_contains "$WS/tarball-files.txt" "package/tools/test/" "发布包排除单元测试"
assert_not_contains "$WS/tarball-files.txt" "package/docker/" "发布包排除验证环境"
assert_not_contains "$WS/tarball-files.txt" "package/.github/" "发布包排除 CI 配置"

PREFIX="$WS/prefix"
expect_exit 0 "全局安装发布包" \
  npm install -g --prefix "$PREFIX" --no-audit --no-fund --ignore-scripts "$TGZ"
BIN="$PREFIX/bin/selected-skills"
assert_file "$BIN" "全局安装生成 selected-skills 命令"

expect_exit 0 "发布包命令输出版本" "$BIN" --version
assert_contains "$WS/last.out" "0.1.0" "发布包版本正确"

expect_exit 0 "发布包可独立安装场景" \
  "$BIN" install --scenario general --platform claude --no-deps --yes --offline --json
assert_json_eq "$WS/last.out" "d.installed.length" "12" "发布包使用自身 catalog 安装 12 个 skill"
assert_file "$HOME/.claude/skills/pdf/SKILL.md" "发布包安装结果落盘"

finish_suite
