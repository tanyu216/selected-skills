---
name: Exploratory Data Analysis
category: data
source: https://github.com/K-Dense-AI/scientific-agent-skills/blob/HEAD/skills/exploratory-data-analysis/SKILL.md
license: MIT
tags: [eda, data-quality, profiling, python]
summary: 有边界的本地 EDA：数据画像、缺失与泄漏审计、异常与变换敏感性。
---

# Exploratory Data Analysis

## 用途

拿到一份新数据、需要先摸清结构、质量与模式时使用。SKILL 对明确支持的本地格式做有边界的探索分析：脱敏 CSV / TSV / JSON 画像，可选的 NumPy、HDF5、FASTA / FASTQ 与基础图像元数据检查；同时覆盖缺失与泄漏审计、异常与变换敏感性，并给出可复用的 EDA 报告脚手架。

## 适用 / 不适用

- **适用**：本地科学或分析数据；需要在建模前做数据质量与泄漏检查；需要一份可复核、可交付的 EDA 报告。
- **不适用**：未知或不在支持列表内的格式（会 fail closed）；需要连数仓做探索（用 data 插件的 `explore-data`）；需要正式统计检验与效应量（转 `statistical-analysis`）。

## 典型场景

- **触发语句**：「先摸清这份数据」「做缺失、异常和泄漏检查」「给这份 CSV 出一份 EDA 报告」。
- **要点**：先确认格式在支持列表内；报告保留缺失率、异常判定规则与变换前后对比，避免只给结论不给口径。

## 注意点

边界是「本地、显式支持的格式」，不支持的格式会直接失败而不会猜测。核心 CLI 只需 Python 3.11+ 且不联网；完整可选依赖需要 Python 3.12+、uv 与对应格式库。同源的 `matplotlib`、`seaborn`、`scientific-visualization` 未单独收录，出图走 data 插件或内置 `dataviz`。

## 来源

- 地址：https://github.com/K-Dense-AI/scientific-agent-skills/blob/HEAD/skills/exploratory-data-analysis/SKILL.md
- 许可证：MIT
