---
title: 其他/专业场景（meta：skill 创建、安装与优化）
skills: [writing-for-agents, grilling]
---

# 其他/专业场景（meta：skill 创建、安装与优化）

## 目标

说明 skill 的创建、安装与优化入口。当前仓库先用 `mattpocock-skills` 的写作类子 skill 覆盖文档部分，创建、安装与评测工具尚未收录。

## 推荐组合与顺序

1. `mattpocock-skills` 的 `writing-for-agents` —— 写或改 skill、AGENTS.md、CLAUDE.md 的说明文字。
2. 创建、安装、评测 skill：暂无本地 skill，按 CONTRIBUTING 在 `skills/meta/` 下收录。

## 分支与替代

- 只想给现有 skill 补文档：直接改 `skills/<category>/<slug>.md`。
- 要新增 skill：按 CONTRIBUTING 的新增流程。
- 要安装外部 skill 包：暂无本地 skill。
- skill 的用途、边界或触发方式不清：用 `mattpocock-skills` 的 `grilling` 做压力测试（主流程见开发）。

## 注意事项

- 只列实际可用的顶层 skill；子 skill 在正文中说明，不要为了填表编造 skill。
- 不编造来源或许可证。
- 新 skill 收录后同步补进所属场景。
