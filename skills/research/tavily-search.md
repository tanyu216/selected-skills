---
name: Tavily Search
category: research
source: https://github.com/tavily-ai/skills
license: MIT
tags: [search, web, tavily]
summary: 用 Tavily 做面向 LLM 的网页搜索，并覆盖提取、站点地图与抓取。
---

# Tavily Search

## 用途

任何需要联网的任务：查信息、核实事实或新闻、找来源、读一个 URL、在站点内找页面、从站点批量收集页面。上游把它做成一个工具集：搜索在 skill 本体里，extract / map / crawl 放在 `references/`。

## 适用 / 不适用

- **适用**：要一个答案或一批来源；需要当前信息；需要读取单个页面。
- **不适用**：需要多来源综合成长报告（用 `tavily-research`）；需要 CRM 字段补全（用 `tavily-entity`）。

## 典型场景

- **触发语句**：「搜一下这个库的最新用法」「读一下这个链接」「这个站点有哪些相关页面」。
- **要点**：先搜再取；能用 `--json` 就用，便于后续筛选与去重。

## 注意点

- 上游仓库只提供 search / research / entity / list / monitor / sdk 六个 skill；`tavily-extract`、`tavily-dynamic-search`、`tavily-cli` 来自 Tavily CLI 发行版，不属于该仓库。
- `search` 与 `extract` 支持无鉴权但有限流；map、crawl、research 需要登录。

## 来源

- 地址：https://github.com/tavily-ai/skills/blob/HEAD/skills/core/tavily-search/SKILL.md
- 许可证：MIT
