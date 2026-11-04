#!/usr/bin/env bash
# 本地驱动：构建验证镜像并运行套件。
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="${1:-offline}"
IMAGE="${IMAGE:-selected-skills-verify:local}"
ARTIFACTS="${ARTIFACTS_DIR:-$ROOT/artifacts}"

usage() {
  cat <<'EOF'
用法: ./docker/verify.sh [模式]

模式:
  offline        全部离线确定性套件（默认）
  unit           容器内运行 npm test
  network        真实上游 smoke（需要网络）
  all            离线套件 + 网络 smoke
  build          只构建镜像
  preflight | dry-run | install | idempotency | link-project | lifecycle | selection | package
                 只运行单个套件

环境变量:
  IMAGE          镜像名，默认 selected-skills-verify:local
  WITH_GIT       true|false，false 构建无 git 镜像（验证 tarball 回退）
  NODE_IMAGE     基础镜像，默认 node:22-bookworm-slim
  LIVE_MOUNT     1|0，1 把当前仓库只读挂载进容器（默认 1）
  SKIP_BUILD     1 跳过构建，直接运行已有镜像
  ARTIFACTS_DIR  宿主机产物目录，默认 <repo>/artifacts
  SUITE_TIMEOUT  单套件超时秒数，默认 600
EOF
}

if [ "${MODE}" = "-h" ] || [ "${MODE}" = "--help" ]; then
  usage
  exit 0
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "需要 docker。" >&2
  exit 1
fi

build_image() {
  docker build \
    --file "$ROOT/docker/Dockerfile" \
    --tag "$IMAGE" \
    --build-arg "NODE_IMAGE=${NODE_IMAGE:-node:22-bookworm-slim}" \
    --build-arg "WITH_GIT=${WITH_GIT:-true}" \
    "$ROOT"
}

case "$MODE" in
  build)
    build_image
    exit 0
    ;;
  offline|all|network|unit|preflight|dry-run|install|idempotency|link-project|lifecycle|selection|package)
    ;;
  *)
    echo "未知模式: $MODE" >&2
    usage >&2
    exit 2
    ;;
esac

if [ "${SKIP_BUILD:-0}" != "1" ]; then
  build_image
fi

mkdir -p "$ARTIFACTS"
ARTIFACTS="$(cd "$ARTIFACTS" && pwd)"

mounts=(-v "$ARTIFACTS:/opt/verify/artifacts")
if [ "${LIVE_MOUNT:-1}" = "1" ]; then
  mounts+=(-v "$ROOT:/opt/selected-skills:ro")
fi

docker run --rm \
  --user "$(id -u):$(id -g)" \
  -e "SUITE=$MODE" \
  -e "SUITE_TIMEOUT=${SUITE_TIMEOUT:-600}" \
  "${mounts[@]}" \
  "$IMAGE"
