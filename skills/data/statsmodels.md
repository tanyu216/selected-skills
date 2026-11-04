---
name: Statsmodels
category: data
source: https://github.com/K-Dense-AI/scientific-agent-skills/blob/HEAD/skills/statsmodels/SKILL.md
license: BSD-3-Clause
tags: [statistics, econometrics, time-series, regression]
summary: OLS / GLM / 离散与混合模型、ARIMA / SARIMAX 的拟合、推断与诊断。
---

# Statsmodels

## 用途

做计量经济与统计建模时使用：OLS、GLM、离散选择模型、混合模型、ARIMA 与 SARIMAX；支持系数推断、边际效应、模型比较与时序预测，并要求显式检查设计矩阵与不确定性。

## 适用 / 不适用

- **适用**：需要解释系数与显著性；回归、面板或时序建模；模型比较与预测区间。
- **不适用**：大规模纯预测或 ML（转 `scikit-learn`）；需要先做检验选择与 APA 报告（先用 `statistical-analysis`）；因果识别设计本身超出本 skill 的范围。

## 典型场景

- **触发语句**：「做回归并解释系数」「对这份月度数据做 ARIMA 预测」「比较两个模型的拟合」。
- **要点**：先检查设计矩阵、共线性与残差；报告系数时带标准误与置信区间；时序建模先处理平稳性、季节性与滞后结构。

## 注意点

需要 Python 3.10+ 与 statsmodels 0.15.0，测试栈需要 Python 3.12+；绘图需 matplotlib，预测指标需 scikit-learn。公式接口与数组接口语义不同，混用容易漏掉截距或类别编码。混合模型收敛失败时先检查优化器与随机效应设定。与 `statistical-analysis` 分工：本 skill 偏模型 API 与推断，后者偏检验选择与研究报告。

## 来源

- 地址：https://github.com/K-Dense-AI/scientific-agent-skills/blob/HEAD/skills/statsmodels/SKILL.md
- 许可证：BSD-3-Clause
