---
name: Tavily Monitor
category: research
source: https://github.com/tavily-ai/skills
license: MIT
tags: [monitoring, recurring, tavily]
summary: 建立按周期运行的搜索或提取监控，并保存基线用于比较变化。
---

# Tavily Monitor

## 用途

把搜索或提取做成按计划运行、带已保存基线的监控。搜索监控会把 `max_age_hours` 设为运行间隔，避免拿到间隔之前的缓存副本。适合「监控 / 追踪 / 关注某事物变化」或「定期检查一个查询或页面」。

## 适用 / 不适用

- **适用**：需要周期性检查并对比变化；需要页面或查询的持续观察。
- **不适用**：一次性查找（用 `tavily-search`）；深度综合报告（用 `tavily-research`）。

## 典型场景

- **触发语句**：「每天看一下这个页面有没有变」「盯着这个关键词的新消息」。
- **要点**：先存基线，再按周期运行；变化判断要明确阈值，避免噪声触发。

## 注意点

缓存时间必须与运行间隔匹配；长期运行需要外部调度器（cron / CI）。

## 来源

- 地址：https://github.com/tavily-ai/skills/blob/HEAD/skills/tasks/tavily-monitor/SKILL.md
- 许可证：MIT
