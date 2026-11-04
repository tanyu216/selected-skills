#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../lib/common.sh"

begin_suite "90-network-smoke"

if command -v git >/dev/null 2>&1; then
  TRANSPORT="git clone（失败时回退 tarball）"
else
  TRANSPORT="tarball"
fi
echo "# 上游获取策略: $TRANSPORT"

REPO="tavily-ai/skills"
CACHE="$SELECTED_SKILLS_HOME/sources/github.com/$REPO"

# 真实上游（联网）：验证 clone / tarball 下载与稀疏 checkout 路径
expect_exit 0 "真实上游安装（$TRANSPORT）" \
  installer install --skills tavily-search --platform claude --no-deps --yes --json
assert_json_eq "$WS/last.out" "d.installed.length" "1" "安装 1 个上游 skill"
assert_json_eq "$WS/last.out" "d.failed.length" "0" "真实上游安装没有失败"
assert_file "$HOME/.claude/skills/tavily-search/SKILL.md" "目标 SKILL.md 存在"
assert_file "$HOME/.claude/skills/tavily-search/references/setup.md" "上游 references 被复制"

# git 可用时优先 clone；github.com:443 不可达时会自动回退 tarball，
# 因此按实际缓存形态断言，而不是只看 git 是否存在。
if [ -d "$CACHE/.git" ]; then
  ok "使用 git 仓库缓存"
else
  assert_absent "$CACHE/.git" "未使用 git 缓存（无 git 或 clone 失败后回退）"
  assert_file "$CACHE/skills/core/tavily-search/SKILL.md" "tarball 缓存内容完整"
fi

# 缓存复用：第二次完全不联网
expect_exit 0 "离线复用上游缓存" \
  installer install --skills tavily-search --platform codex --no-deps --yes --offline --json
assert_json_eq "$WS/last.out" "d.installed.length" "1" "离线缓存安装成功"
assert_file "$HOME/.codex/skills/tavily-search/SKILL.md" "离线安装目标存在"
assert_json_eq "$SELECTED_SKILLS_HOME/state.json" "Object.keys(d.skills['tavily-search'].platforms).length" "2" \
  "state 记录两个平台"

finish_suite
