---
title: 数据分析场景（清洗、统计、可视化）
skills: [tavily-search, tavily-research, tavily-list, xlsx, polars, exploratory-data-analysis, statistical-analysis, statsmodels, scikit-learn, write-query, sql-queries, explore-data, data-context-extractor, data-visualization, create-viz, build-dashboard, validate-data, grilling]
---

# 数据分析场景（清洗、统计、可视化）

## 目标

把数据整理成可分析、可复核的表格与图表，完成一轮统计分析或可视化交付。

## 推荐组合与顺序

1. `tavily-search` / `tavily-research` —— 取外部数据与背景，形成带来源的候选集。
2. `tavily-list` —— 生成去重后的候选清单，并标明「搜索结果而非全集」。
3. `xlsx` 或 `polars` —— 载入与清洗：交付物是工作簿时用 `xlsx`；较大数据、ETL 或 pandas 迁移时用 `polars`。
4. `exploratory-data-analysis` —— 做数据画像、缺失与泄漏审计、异常与变换敏感性检查。
5. `statistical-analysis` —— 选检验、查假设、算效应量与功效；需要回归、面板或时序模型时接 `statsmodels`。
6. `scikit-learn` —— 需要预测建模、模型评估或调参时使用。
7. `data-visualization` / `create-viz` / `build-dashboard` —— 出图或搭交互看板。
8. `validate-data` —— 交付前做口径、准确性与偏差检查。

## 分支与替代

- 只需要表格产物：直接用 `xlsx`，不必进本场景。
- 数据量超出 pandas 舒适区、要做多文件 ETL：用 `polars`；需要集群或分布式时再评估同源的 `dask`。
- 有数仓（Snowflake / Databricks / BigQuery）：用 data 插件的 `write-query` / `sql-queries` 取数，`explore-data` 做探索。
- 团队口径复杂、每次都要重复解释表名与指标：用 `data-context-extractor` 生成公司专属 skill。
- 需要解释模型预测：先用 `scikit-learn` 建模，再评估同源上游的 `shap`（本次未单独收录）。
- 要统计检验与 APA 报告：用 `statistical-analysis`；只要拟合系数与时序模型：用 `statsmodels`。
- 分析目标、口径或数据范围不清：用 `grilling` 做压力测试（主流程见 WEB开发）。
- 因子分析、回测与交易流程：转「量化研究场景」。

## 注意事项

- 结论写清数据来源、时间窗口与复现步骤；统计结论带效应量与不确定性。
- 清洗与变换保留前后对比，避免只给结果不给口径。
- 不把 Tavily 返回的候选当成全集；外部数据要标注检索范围与时间。
