---
name: Tavily Entity
category: research
source: https://github.com/tavily-ai/skills
license: MIT
tags: [crm, enrichment, tavily]
summary: 从网上补全公司、人物或组织的 CRM 字段，支持已有 CSV。
---

# Tavily Entity

## 用途

给 CRM 补全一个公司、人物或组织的信息，也支持用户已有的 CSV 行。先在同名实体中识别正确对象，再从权威来源填字段。适合账户补全、表格补全或粘贴的已知名单。

## 适用 / 不适用

- **适用**：已有明确实体名，要补字段；批量补 CSV；需要权威来源。
- **不适用**：还不知道有哪些实体、要先发现匹配（用 `tavily-list`）；要写深度报告（用 `tavily-research`）。

## 典型场景

- **触发语句**：「enrich 这张客户表」「查一下这家公司的官网和规模」。
- **要点**：先解决同名歧义，再填字段；每个字段标注来源。

## 注意点

实体识别错误会污染整行数据；不确定的字段留空比猜一个更好。

## 来源

- 地址：https://github.com/tavily-ai/skills/blob/HEAD/skills/tasks/tavily-entity/SKILL.md
- 许可证：MIT
