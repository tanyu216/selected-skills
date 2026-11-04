#!/usr/bin/env bash
# 离线 fixture：在 SELECTED_SKILLS_HOME/sources 下构造「已 clone 的上游仓库」。
# 安装器把没有 .git 的非空目录当作可用的 tarball 缓存，因此 --offline 可完全离线运行。

fixture_skill() {
  local repo="$1" rel="$2" slug="${3:-$(basename "$rel")}"
  local dir="$SELECTED_SKILLS_HOME/sources/github.com/$repo/$rel"
  mkdir -p "$dir/references" "$dir/scripts"
  cat > "$dir/SKILL.md" <<EOF
---
name: $slug
description: "Offline verification fixture for $slug."
license: MIT
---

# $slug

Fixture content used by the Docker verification suite. Never installed for real.
EOF
  printf '# %s notes\n\nfixture reference\n' "$slug" > "$dir/references/notes.md"
  printf '#!/bin/sh\necho "%s"\n' "$slug" > "$dir/scripts/run.sh"
  chmod 0755 "$dir/scripts/run.sh"
}

seed_docs_sources() {
  local repo="anthropics/skills"
  fixture_skill "$repo" "skills/pdf" pdf
  fixture_skill "$repo" "skills/docx" docx
  fixture_skill "$repo" "skills/pptx" pptx
  fixture_skill "$repo" "skills/xlsx" xlsx
}

seed_tavily_sources() {
  local repo="tavily-ai/skills"
  fixture_skill "$repo" "skills/core/tavily-search" tavily-search
  fixture_skill "$repo" "skills/tasks/tavily-research" tavily-research
  fixture_skill "$repo" "skills/tasks/tavily-list" tavily-list
  fixture_skill "$repo" "skills/tasks/tavily-entity" tavily-entity
  fixture_skill "$repo" "skills/tasks/tavily-monitor" tavily-monitor
}

# scenarios/general.md 的 12 个 skill，来自 4 个上游仓库
seed_general_sources() {
  seed_docs_sources
  seed_tavily_sources
  fixture_skill "nextlevelbuilder/ui-ux-pro-max-skill" ".claude/skills/design-system" design-system
  fixture_skill "mattpocock/skills" "skills/engineering/research" research
  fixture_skill "mattpocock/skills" "skills/productivity/grilling" grilling
}

platform_skills_dir() {
  # 与 tools/scripts/platforms.js 的 global 目录保持一致
  case "$1" in
    claude)   echo "$HOME/.claude/skills" ;;
    codex)    echo "$HOME/.codex/skills" ;;
    pi)       echo "$HOME/.pi/agent/skills" ;;
    opencode) echo "$HOME/.config/opencode/skills" ;;
    cursor)   echo "$HOME/.cursor/skills" ;;
    grok)     echo "$HOME/.grok/skills" ;;
    gemini)   echo "$HOME/.gemini/skills" ;;
    openclaw) echo "$HOME/.openclaw/skills" ;;
    hermes)   echo "$HOME/.hermes/skills" ;;
    *)        echo "" ;;
  esac
}

ALL_PLATFORMS=(claude codex pi opencode cursor grok gemini openclaw hermes)
