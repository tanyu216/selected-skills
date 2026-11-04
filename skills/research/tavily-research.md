---
name: Tavily Research
category: research
source: https://github.com/tavily-ai/skills
license: MIT
tags: [research, report, tavily]
summary: 多来源综合的深度研究报告，输出带引用的报告。
---

# Tavily Research

## 用途

需要把很多来源放在一起权衡时使用：市场、政策、技术或趋势分析，多指标方案对比，文献回顾，或任何「深入研究 / 调研 / 分析」请求。产出是带引用的结构化报告。

## 适用 / 不适用

- **适用**：开放式问题、需要多源交叉验证、需要可引用的结论。
- **不适用**：单个事实或一次查找（用 `tavily-search`）；单个公司/人的 CRM 补全（用 `tavily-entity`）。

## 典型场景

- **触发语句**：「调研一下这个市场的玩家」「对比这几个方案的优劣并给出处」。
- **要点**：先把问题拆成子问题，再让每个子问题各有来源；结论必须能回溯到引用。

## 注意点

耗时通常在 30–120 秒；需要鉴权。引用质量取决于来源质量，不要用二手博客替代一手来源。

## 来源

- 地址：https://github.com/tavily-ai/skills/blob/HEAD/skills/tasks/tavily-research/SKILL.md
- 许可证：MIT
