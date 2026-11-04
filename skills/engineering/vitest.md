---
name: Vitest
category: engineering
source: https://github.com/antfu/skills
license: MIT
tags: [vitest, testing, unit-test]
summary: Vitest 的单元测试、mock、覆盖率与测试筛选。
---

# Vitest

## 用途

用 Vitest 写和跑测试：Jest 兼容 API、mock 与 spy、覆盖率配置、测试筛选与 fixture 组织。

## 适用 / 不适用

- **适用**：Vite 生态项目的单元与集成测试；需要快速反馈的测试；从 Jest 迁移。
- **不适用**：端到端浏览器测试（用 `playwright-cli`）；需要测试先行的流程编排（用 `mattpocock-skills` 的 `tdd`）。

## 典型场景

- **触发语句**：「给这个工具函数补测试」「mock 这个模块的 fetch」。
- **要点**：优先 `vi.mock` 的模块级模拟；覆盖率只作为信号，不作为唯一目标。

## 注意点

Vitest 与 Vite 版本需匹配；浏览器模式与 Node 环境的 API 可用性不同。

## 来源

- 地址：https://github.com/antfu/skills/blob/HEAD/skills/vitest/SKILL.md
- 许可证：MIT
