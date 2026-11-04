#!/usr/bin/env bash
# 容器入口：按 SUITE（或第一个参数）运行离线 / 网络 / 单元测试套件。
set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export REPO_ROOT="${REPO_ROOT:-/opt/selected-skills}"
MODE="${SUITE:-${1:-offline}}"

ARTIFACTS_DIR="${ARTIFACTS_DIR:-$HERE/artifacts}"
if ! mkdir -p "$ARTIFACTS_DIR" 2>/dev/null; then
  ARTIFACTS_DIR="${TMPDIR:-/tmp}/selected-skills-verify-artifacts"
  mkdir -p "$ARTIFACTS_DIR"
fi
RESULTS="$ARTIFACTS_DIR/results.tsv"
: > "$RESULTS"

OFFLINE_SUITES=(
  00-preflight.sh
  10-dry-run.sh
  20-install.sh
  30-idempotency.sh
  40-link-project.sh
  50-lifecycle.sh
  60-selection.sh
  70-package.sh
)

suite_for() {
  case "$1" in
    00-preflight|preflight)     echo "00-preflight.sh" ;;
    10-dry-run|dry-run)         echo "10-dry-run.sh" ;;
    20-install|install)         echo "20-install.sh" ;;
    30-idempotency|idempotency) echo "30-idempotency.sh" ;;
    40-link-project|link-project) echo "40-link-project.sh" ;;
    50-lifecycle|lifecycle)     echo "50-lifecycle.sh" ;;
    60-selection|selection)     echo "60-selection.sh" ;;
    70-package|package)         echo "70-package.sh" ;;
    90-network-smoke|network|network-smoke) echo "90-network-smoke.sh" ;;
    *) if [ -f "$HERE/suites/$1" ]; then echo "$1"; fi ;;
  esac
}

record() {
  local suite="$1" status="$2" duration="$3" log="$4"
  printf '%s\t%s\t%s\t%s\t%s\n' "$suite" "$suite" "$status" "$duration" "$log" >> "$RESULTS"
}

run_suite() {
  local suite="$1"
  local log="$ARTIFACTS_DIR/${suite%.sh}.log"
  local start end duration code
  echo
  echo "==> suite: $suite"
  start="$(date +%s)"
  local runner=(bash "$HERE/suites/$suite")
  if command -v timeout >/dev/null 2>&1; then
    runner=(timeout "${SUITE_TIMEOUT:-600}" "${runner[@]}")
  fi
  "${runner[@]}" 2>&1 | tee "$log"
  code="${PIPESTATUS[0]}"
  end="$(date +%s)"
  duration=$((end - start))
  if [ "$code" -eq 0 ]; then
    record "$suite" "passed" "$duration" "$log"
    echo "==> PASS $suite (${duration}s)"
  else
    record "$suite" "failed" "$duration" "$log"
    echo "==> FAIL $suite (exit $code, ${duration}s)"
  fi
}

run_unit() {
  local log="$ARTIFACTS_DIR/unit.log"
  local start end duration code
  echo
  echo "==> suite: unit (npm test)"
  # --user 覆盖镜像用户时 HOME 可能不可写，给 npm 一个临时 HOME
  export HOME="${UNIT_HOME:-${TMPDIR:-/tmp}/selected-skills-unit-home}"
  mkdir -p "$HOME"
  start="$(date +%s)"
  ( cd "$REPO_ROOT" && npm test ) 2>&1 | tee "$log"
  code="${PIPESTATUS[0]}"
  end="$(date +%s)"
  duration=$((end - start))
  if [ "$code" -eq 0 ]; then
    record "unit" "passed" "$duration" "$log"
    echo "==> PASS unit (${duration}s)"
  else
    record "unit" "failed" "$duration" "$log"
    echo "==> FAIL unit (exit $code, ${duration}s)"
  fi
}

if [ "$MODE" = "unit" ]; then
  run_unit
else
  declare -a SUITES=()
  if [ -n "${SUITE_LIST:-}" ]; then
    for item in $SUITE_LIST; do
      mapped="$(suite_for "$item")"
      if [ -z "$mapped" ]; then
        echo "未知套件: $item" >&2
        exit 2
      fi
      SUITES+=("$mapped")
    done
  else
    case "$MODE" in
      offline)
        SUITES=("${OFFLINE_SUITES[@]}")
        ;;
      all)
        SUITES=("${OFFLINE_SUITES[@]}" "90-network-smoke.sh")
        ;;
      *)
        mapped="$(suite_for "$MODE")"
        if [ -z "$mapped" ]; then
          echo "未知模式: $MODE" >&2
          echo "可用: offline, all, unit, network, preflight, dry-run, install, idempotency, link-project, lifecycle, selection, package" >&2
          exit 2
        fi
        SUITES=("$mapped")
        ;;
    esac
  fi

  echo "selected-skills docker verify"
  echo "  repo:      $REPO_ROOT"
  echo "  mode:      $MODE"
  echo "  artifacts: $ARTIFACTS_DIR"
  echo "  node:      $(node -v 2>/dev/null || echo missing)"
  echo "  git:       $(command -v git || echo missing)"
  echo "  tar:       $(command -v tar || echo missing)"

  for suite in "${SUITES[@]}"; do
    run_suite "$suite"
  done
fi

if command -v node >/dev/null 2>&1; then
  node "$HERE/lib/junit.mjs" "$RESULTS" "$ARTIFACTS_DIR/junit.xml" || true
fi

failures="$(awk -F '\t' '$3 != "passed" { count++ } END { print count + 0 }' "$RESULTS")"
total="$(wc -l < "$RESULTS" | tr -d ' ')"
echo
echo "==> summary: $((total - failures))/$total suites passed"
if [ "$failures" -ne 0 ]; then
  echo "==> artifacts: $ARTIFACTS_DIR"
  exit 1
fi
echo "==> artifacts: $ARTIFACTS_DIR"
exit 0
