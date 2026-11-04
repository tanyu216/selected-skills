---
name: Polars
category: data
source: https://github.com/K-Dense-AI/scientific-agent-skills/blob/HEAD/skills/polars/SKILL.md
license: MIT
tags: [dataframe, etl, pandas, python]
summary: 高性能 DataFrame：表达式 API、惰性优化、流式处理与 pandas 迁移。
---

# Polars

## 用途

当数据量超过 pandas 的舒适区，或需要做 ETL、聚合、连接与列式处理时使用。SKILL 覆盖表达式 API、LazyFrame 查询优化、并行执行、流式 out-of-core 处理、Arrow 互操作与可选 GPU 执行，并给出从 pandas 迁移的对照写法。

## 适用 / 不适用

- **适用**：大文件或多文件 ETL；需要惰性优化与并行执行；要从 pandas 迁移；与 Parquet / Arrow 生态配合。
- **不适用**：小数据的一次性脚本；下游或团队只接受 pandas；需要统计模型、ML 训练或复杂绘图（分别转 `statsmodels`、`scikit-learn` 与可视化 skill）。

## 典型场景

- **触发语句**：「把这个 20GB CSV 清洗后按天聚合」「把这段 pandas 迁到 polars」「多个 Parquet 文件做 join」。
- **要点**：先用 `scan_*` 建 LazyFrame，再 `collect(streaming=True)`；尽量把表达式留在惰性计划里；迁移时逐段对照 pandas 的默认行为，尤其是 `group_by` 聚合与空值语义。

## 注意点

需要 Python 3.10+ 与 Polars 1.44.2，按 SKILL 的说明用 `uv pip install` 安装。eager 与 lazy 的 API 不同，混用容易在错误的阶段求值。同源还有 `dask`（分布式 / 集群）与 `vaex`（超大数据集惰性处理），按现有基础设施选择；可视化不在本 skill 范围。

## 来源

- 地址：https://github.com/K-Dense-AI/scientific-agent-skills/blob/HEAD/skills/polars/SKILL.md
- 许可证：MIT
