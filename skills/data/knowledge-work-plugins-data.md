---
name: Knowledge Work Plugins · Data
category: data
source: https://github.com/anthropics/knowledge-work-plugins/tree/HEAD/data
license: Apache-2.0
tags: [data-analysis, sql, dashboard, anthropic]
summary: Anthropic 官方数据分析插件：SQL、数据探索、可视化、看板、统计分析与交付校验。
---

# Knowledge Work Plugins · Data

## 用途

插件条目。Anthropic 官方 `knowledge-work-plugins` 仓库中的 data 插件，把「取数 → 探索 → 分析 → 可视化 → 看板 → 交付校验」串成一条分析链路，并附带把公司口径固化成专属 skill 的元能力。

推荐标记：`首选` = 第一次使用先读或先跑；`常用` = 高频；`—` = 特定场景。

| 子 skill | 用途 | 推荐 |
| --- | --- | --- |
| `analyze` | 端到端回答数据问题，从快速查询到完整分析。 | 首选 |
| `explore-data` | 画像数据集的结构、质量与模式，先摸清底数。 | 首选 |
| `write-query` | 按目标方言写优化 SQL，并解释关键取舍。 | 首选 |
| `sql-queries` | 跨方言 SQL 最佳实践、常用模式与性能优化。 | 常用 |
| `data-visualization` | 图表选型、Python 绘图代码模式与设计原则。 | 首选 |
| `create-viz` | 用 Python 生成发布级图表。 | 常用 |
| `build-dashboard` | 用 HTML/JS + Chart.js 搭带筛选与图表的交互看板。 | 常用 |
| `statistical-analysis` | 描述统计、趋势分析、异常检测与假设检验。 | 常用 |
| `validate-data` | 交付前的 QA、健全性检查与文档规范。 | 首选 |
| `data-context-extractor` | 访谈分析师并读取 schema，生成公司专属的数据分析 skill。 | 常用 |

## 适用 / 不适用

- **适用**：数据在 Snowflake、Databricks、BigQuery 等数仓；需要写 SQL、做数据探索、出图、搭 HTML 看板、交付前 QA；想把表名、指标口径与业务规则固化成团队专属 skill。
- **不适用**：纯本地科学计算；复杂统计建模或 ML 训练（转 `statsmodels`、`scikit-learn`）；没有数仓连接器且不需要 SQL 的轻量分析。

## 典型场景

- **触发语句**：「分析上月收入趋势并按产品线拆分」「给这张表做交付前检查」「搭一个带筛选的销售看板」。
- **要点**：先确认数据源、口径与时间窗口，再按 `explore-data → analyze → create-viz / build-dashboard → validate-data` 推进；没有连接器时先粘贴查询结果或上传 CSV / Excel。

## 注意点

插件依赖 MCP 连接器才有完整体验；无连接器时 SQL 需要人工执行后再回填结果。`data-context-extractor` 需要 Python，适合团队口径复杂、分析师反复解释同一套术语的场景。插件内的 `statistical-analysis` 偏描述统计与假设检验，重模型与 ML 不在其范围。

## 来源

- 地址：https://github.com/anthropics/knowledge-work-plugins/tree/HEAD/data
- 安装：
  ```bash
  claude plugin marketplace add anthropics/knowledge-work-plugins
  claude plugin install data@knowledge-work-plugins
  ```
- 许可证：Apache-2.0
