#!/usr/bin/env bash
set -euo pipefail

REPO="${SELECTED_SKILLS_REPO:-tanyu216/selected-skills}"
VERSION="0.1.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || true)"

usage() {
  cat <<'EOF'
selected-skills 源码安装引导

用法:
  bash install.sh [install 参数...]
  curl -fsSL https://raw.githubusercontent.com/<owner>/<repo>/HEAD/install.sh | bash -s -- [install 参数...]

示例:
  bash install.sh install --platform claude --scenario general
  bash install.sh install --all --platform claude --yes --no-deps

环境变量:
  SELECTED_SKILLS_REPO   远程模式使用的 GitHub 仓库，默认 tanyu216/selected-skills
  SELECTED_SKILLS_HOME   运行时数据目录，默认 ~/.selected-skills

注意: 不建议用 sudo 运行；Windows 请使用 npx。
EOF
}

need_node() {
  if ! command -v node >/dev/null 2>&1; then
    echo "缺少 Node.js。请安装 Node.js >= 18：https://nodejs.org/" >&2
    exit 1
  fi
  local major
  major="$(node -p 'process.versions.node.split(".")[0]')"
  if [ "$major" -lt 18 ]; then
    echo "Node.js 版本过低（当前 $(node -v)），需要 >= 18。" >&2
    exit 1
  fi
}

if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
  usage
  exit 0
fi

need_node

if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/package.json" ] && [ -f "$SCRIPT_DIR/tools/bin/selected-skills.js" ]; then
  exec node "$SCRIPT_DIR/tools/bin/selected-skills.js" "$@"
fi

# Remote / curl | bash mode
if ! command -v curl >/dev/null 2>&1; then
  echo "远程安装需要 curl。" >&2
  exit 1
fi
if ! command -v tar >/dev/null 2>&1; then
  echo "远程安装需要 tar。" >&2
  exit 1
fi

TMPDIR_BASE="${TMPDIR:-/tmp}"
WORKDIR="$(mktemp -d "${TMPDIR_BASE%/}/selected-skills-${VERSION}.XXXXXX")"
trap 'rm -rf "$WORKDIR"' EXIT

echo "下载 ${REPO}@HEAD ..."
curl -fsSL "https://codeload.github.com/${REPO}/tar.gz/HEAD" -o "$WORKDIR/repo.tar.gz"
tar -xzf "$WORKDIR/repo.tar.gz" -C "$WORKDIR" --strip-components=1
set +e
node "$WORKDIR/tools/bin/selected-skills.js" "$@"
status=$?
set -e
rm -rf "$WORKDIR"
trap - EXIT
exit "$status"
