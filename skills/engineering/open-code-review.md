---
name: Open Code Review
category: engineering
source: https://github.com/alibaba/open-code-review
license: Apache-2.0
tags: [code-review, cli, git]
summary: 用 ocr CLI 对 Git 变更做 AI 代码审查，输出行级评论并可自动修复。
---

# Open Code Review

## 用途

对 Git 变更做 AI 审查：暂存/未暂存改动、单个 commit、分支对比或 PR。输出行级评论，支持按规则检测 bug、安全、性能与代码质量，并可选择自动应用修复。

## 适用 / 不适用

- **适用**：提交前自审；PR 评审；需要按团队规则做一致性检查；需要把审查意见直接落到代码。
- **不适用**：需要同时对照 spec 审查（用 `mattpocock-skills` 的 `code-review`）；只做格式检查（用 linter）。

## 典型场景

- **触发语句**：「审查一下我的改动」「review 这个 PR」。
- **要点**：先确认审查范围（staged / commit / branch）；自动修复要逐条确认，不要整批接受。

## 注意点

- 条目类型是「CLI + 内置 skill」。
- 安装：`npm install -g @alibaba-group/open-code-review`，命令为 `ocr`。
- 默认会调用 LLM endpoint；没有 endpoint 时改用 `open-code-review-delegate`。
- 与 `mattpocock-skills` 的 `code-review` 功能重叠，同一轮只开一个，避免重复评论。

## 来源

- 地址：https://github.com/alibaba/open-code-review/blob/HEAD/skills/open-code-review/SKILL.md
- 许可证：Apache-2.0
