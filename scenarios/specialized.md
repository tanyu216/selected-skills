---
title: 其他/专业场景（meta：skill 创建、安装与优化）
skills: [skill-creator, writing-for-agents, grilling]
---

# 其他/专业场景（meta：skill 创建、安装与优化）

## 目标

说明 skill 的创建、优化与安装入口，以及给 Agent 写说明文字的约定。

## 推荐组合与顺序

1. `skill-creator` —— 创建新 skill、改进现有 skill、跑 eval 与基准、优化 description 触发准确率、打包成 `.skill`。
2. `mattpocock-skills` 的 `writing-for-agents` —— 写或改 skill、AGENTS.md、CLAUDE.md 的说明文字。
3. 安装 skill 到各 Agent 平台：用本仓库的 `selected-skills` 安装器，见 `tools/docs/INSTALL.md`。

## 分支与替代

- 只想给现有 skill 补文档：直接改 `skills/<category>/<slug>.md`。
- 要新增 skill：按 CONTRIBUTING 的新增流程。
- 要安装外部 skill 包：用 `selected-skills` 安装器（`install` / `update` / `uninstall`），见 `tools/docs/INSTALL.md`。
- skill 的用途、边界或触发方式不清：用 `mattpocock-skills` 的 `grilling` 做压力测试（主流程见开发）。

## 注意事项

- 只列实际可用的顶层 skill；子 skill 在正文中说明，不要为了填表编造 skill。
- 不编造来源或许可证。
- 新 skill 收录后同步补进所属场景。
