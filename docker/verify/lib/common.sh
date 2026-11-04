#!/usr/bin/env bash
# 容器内验证套件的公共断言与隔离工具。每个套件独立 HOME，互不影响。

REPO_ROOT="${REPO_ROOT:-/opt/selected-skills}"
SUITE_CHECKS=0
SUITE_FAILURES=0
WS=""

begin_suite() {
  local name="$1"
  SUITE_NAME="$name"
  WS="$(mktemp -d "${TMPDIR:-/tmp}/ss-${name}.XXXXXX")"
  export HOME="$WS/home"
  export SELECTED_SKILLS_HOME="$WS/data"
  # 保证平台目录只由当前测试决定
  unset PI_CODING_AGENT_DIR GROK_HOME HERMES_HOME XDG_CONFIG_HOME
  mkdir -p "$HOME" "$SELECTED_SKILLS_HOME"
  trap cleanup_suite EXIT
  cd "$REPO_ROOT"
  echo "# selected-skills verify: $name"
  echo "# node $(node -v) | git $(command -v git || echo none) | tar $(command -v tar || echo none)"
  echo "# workspace: $WS"
}

cleanup_suite() {
  if [ "${KEEP_WORKSPACE:-0}" != "1" ] && [ -n "${WS:-}" ] && [ -d "$WS" ]; then
    rm -rf "$WS"
  fi
}

ok() {
  SUITE_CHECKS=$((SUITE_CHECKS + 1))
  printf 'ok %d - %s\n' "$SUITE_CHECKS" "$*"
}

not_ok() {
  SUITE_CHECKS=$((SUITE_CHECKS + 1))
  SUITE_FAILURES=$((SUITE_FAILURES + 1))
  printf 'not ok %d - %s\n' "$SUITE_CHECKS" "$*" >&2
}

assert_eq() {
  local actual="$1" expected="$2" desc="$3"
  if [ "$actual" = "$expected" ]; then
    ok "$desc"
  else
    not_ok "$desc (expected [$expected], got [$actual])"
  fi
  return 0
}

assert_ne() {
  local actual="$1" unexpected="$2" desc="$3"
  if [ "$actual" != "$unexpected" ]; then
    ok "$desc"
  else
    not_ok "$desc (unexpected [$unexpected])"
  fi
  return 0
}

assert_ge() {
  local actual="$1" minimum="$2" desc="$3"
  if [ "$actual" -ge "$minimum" ] 2>/dev/null; then
    ok "$desc"
  else
    not_ok "$desc (expected >= $minimum, got [$actual])"
  fi
  return 0
}

assert_file() {
  local path="$1" desc="${2:-存在文件 $1}"
  if [ -f "$path" ]; then ok "$desc"; else not_ok "$desc (missing: $path)"; fi
  return 0
}

assert_dir() {
  local path="$1" desc="${2:-存在目录 $1}"
  if [ -d "$path" ]; then ok "$desc"; else not_ok "$desc (missing: $path)"; fi
  return 0
}

assert_absent() {
  local path="$1" desc="${2:-不存在 $1}"
  if [ ! -e "$path" ] && [ ! -L "$path" ]; then ok "$desc"; else not_ok "$desc (exists: $path)"; fi
  return 0
}

assert_symlink() {
  local path="$1" desc="${2:-$1 是软链接}"
  if [ -L "$path" ]; then ok "$desc"; else not_ok "$desc (not a symlink: $path)"; fi
  return 0
}

assert_not_symlink() {
  local path="$1" desc="${2:-$1 不是软链接}"
  if [ ! -L "$path" ]; then ok "$desc"; else not_ok "$desc (is a symlink: $path)"; fi
  return 0
}

assert_contains() {
  local file="$1" pattern="$2" desc="${3:-$1 包含 $2}"
  if grep -q -- "$pattern" "$file" 2>/dev/null; then ok "$desc"; else not_ok "$desc (pattern: $pattern)"; fi
  return 0
}

assert_not_contains() {
  local file="$1" pattern="$2" desc="${3:-$1 不包含 $2}"
  if grep -q -- "$pattern" "$file" 2>/dev/null; then not_ok "$desc (pattern: $pattern)"; else ok "$desc"; fi
  return 0
}

assert_mode() {
  local file="$1" expected="$2" desc="${3:-$1 权限为 $2}"
  local actual
  actual="$(stat -c '%a' "$file" 2>/dev/null || echo missing)"
  assert_eq "$actual" "$expected" "$desc"
}

assert_no_root_files() {
  local desc="$1"
  shift
  local found
  found="$(find "$@" -user 0 2>/dev/null | head -n 1 || true)"
  assert_eq "$found" "" "$desc"
}

json_eval() {
  # json_eval <file> <js-expression-using-d>
  node -e '
    const fs = require("fs");
    const d = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    const value = eval(process.argv[2]);
    if (value === undefined) console.log("undefined");
    else if (value !== null && typeof value === "object") console.log(JSON.stringify(value));
    else console.log(String(value));
  ' "$1" "$2"
}

assert_json_eq() {
  local file="$1" expr="$2" expected="$3" desc="$4"
  local actual
  actual="$(json_eval "$file" "$expr" 2>/dev/null || echo "<json-error>")"
  assert_eq "$actual" "$expected" "$desc"
}

installer() {
  bash "$REPO_ROOT/install.sh" "$@"
}

# expect_exit <expected-code> <desc> <command...>
expect_exit() {
  local expected="$1" desc="$2"
  shift 2
  local out="$WS/last.out" err="$WS/last.err"
  local code=0
  "$@" >"$out" 2>"$err" || code=$?
  if [ "$code" = "$expected" ]; then
    ok "$desc"
  else
    not_ok "$desc (exit $code, expected $expected)"
    printf '# --- stdout ---\n' >&2
    sed -n '1,15p' "$out" >&2 || true
    printf '# --- stderr ---\n' >&2
    sed -n '1,15p' "$err" >&2 || true
  fi
  return 0
}

finish_suite() {
  echo "1..$SUITE_CHECKS"
  if [ "$SUITE_FAILURES" -ne 0 ]; then
    echo "# FAILED $SUITE_FAILURES/$SUITE_CHECKS"
    exit 1
  fi
  echo "# PASSED $SUITE_CHECKS"
  exit 0
}
