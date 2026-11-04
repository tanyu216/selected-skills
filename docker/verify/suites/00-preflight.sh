#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../lib/common.sh"

begin_suite "00-preflight"

major="$(node -p 'process.versions.node.split(".")[0]')"
assert_ge "$major" 18 "Node.js >= 18（当前 $(node -v)）"

if command -v git >/dev/null 2>&1 || command -v tar >/dev/null 2>&1; then
  ok "git 或 tar 至少有一个可用（上游获取路径存在）"
else
  not_ok "git 与 tar 都不可用，无法获取上游仓库"
fi

expect_exit 0 "install.sh --help 可用" installer --help
assert_contains "$WS/last.out" "selected-skills" "帮助信息包含程序名"

expect_exit 0 "version 输出可用" node "$REPO_ROOT/tools/bin/selected-skills.js" --version
assert_contains "$WS/last.out" "0.1.0" "版本号为 0.1.0"

# 假平台二进制让 detectPlatforms() 识别全部九个平台
expect_exit 0 "doctor --json 可用" installer doctor --json
assert_json_eq "$WS/last.out" "d.detectedPlatforms.length" "9" "检测到全部 9 个平台"
assert_json_eq "$WS/last.out" "d.stateSkills" "0" "初始状态没有已安装 skill"
assert_json_eq "$WS/last.out" "d.unresolved.length" "0" "catalog 没有未解析来源"

expect_exit 2 "非交互安装缺少 --yes 时拒绝执行" installer install --skills pdf --platform claude
expect_exit 2 "缺少选择项时失败" installer install --platform claude --yes
expect_exit 2 "未知平台时失败" installer install --skills pdf --platform nope --yes
expect_exit 2 "未知命令时失败" installer frobnicate

finish_suite
