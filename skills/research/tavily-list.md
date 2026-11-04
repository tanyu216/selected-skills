---
name: Tavily List
category: research
source: https://github.com/tavily-ai/skills
license: MIT
tags: [list, dedupe, tavily]
summary: 用 Tavily 生成去重的匹配表，明确「表里是搜索结果而非全集」。
---

# Tavily List

## 用途

为一个集合生成去重的匹配表。它强调表里是「搜索返回的结果」，不是「所有存在的对象」。适合要一份列表、一类事物的清单，或去重后的表格。

## 适用 / 不适用

- **适用**：需要候选清单并去重；已知列定义与数量上限。
- **不适用**：需要单个实体的 CRM 字段（用 `tavily-entity`）；需要穷尽式普查或深度报告（用 `tavily-research`）。

## 典型场景

- **触发语句**：「列一下这个领域的主要玩家，去重，最多 30 个」。
- **要点**：搜索前先确认列与上限；结果里保留来源，方便二次核验。

## 注意点

不要把结果当成穷尽清单；数量上限和搜索深度会直接影响覆盖率。

## 来源

- 地址：https://github.com/tavily-ai/skills/blob/HEAD/skills/tasks/tavily-list/SKILL.md
- 许可证：MIT
