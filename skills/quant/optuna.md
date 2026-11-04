---
name: Optuna
category: quant
source: https://github.com/optuna/optuna
license: MIT
tags: [hyperparameter-optimization, tuning, quant, python]
summary: 超参数优化框架：define-by-run 搜索空间、剪枝、并行与试验管理。
---

# Optuna

## 用途

库条目：Optuna 是面向机器学习的自动超参数优化框架，用 `study` 与 `trial` 组织搜索。它支持 define-by-run 风格的 Python 搜索空间、TPE / CMA-ES 等采样器、Median / Hyperband 等剪枝器、多目标与约束优化、并行与分布式试验，以及 Dashboard 可视化。量化场景里常用来调 LightGBM / XGBoost / CatBoost 或时序模型的超参数。

## 适用 / 不适用

- **适用**：超参数组合多、网格搜索成本高；需要早停剪枝、断点续跑、并行试验；多目标优化（如收益与回撤）；要把调参过程记录成可复现的 study。
- **不适用**：参数组合很少、穷举更直接；目标函数没有中间指标、无法剪枝；需要因果推断或统计显著性（转 `statsmodels`）；不想处理随机性与验证集设计。

## 典型场景

- **触发语句**：「帮我调 LightGBM 的参数」「用 Optuna 搜一版超参」「同时优化收益和最大回撤」。
- **要点**：先定义 `objective(trial)`，用 `trial.suggest_float(..., log=True)` 处理学习率等跨数量级参数；`study.optimize(objective, n_trials=...)`；用 `TPESampler(seed=...)` 保证可复现，用 `MedianPruner` 剪掉明显差的 trial；需要续跑时用 SQLite storage，需要并行时加 `n_jobs`；量化任务用 walk-forward 或时间序列切分作为目标函数，不要用随机 K-Fold。

## 注意点

- **可复现性**：固定 sampler seed，并记录 Python / Optuna / 模型版本；并行时注意模型训练本身的线程安全。
- **过拟合验证集**：调参集与最终测试集必须分开；时间序列要用滚动或 purge 切分，避免未来信息泄漏。
- **搜索空间**：学习率、正则化系数用 log 尺度；范围过宽会浪费 trial，过窄则失去意义；参数不是越多越好。
- 需要 Python 3.9+，当前 PyPI 版本为 5.x；Dashboard 需另装 `optuna-dashboard`。

## 来源

- 地址：https://github.com/optuna/optuna
- 许可证：MIT
- 安装：`pip install optuna`；可视化面板 `pip install optuna-dashboard`
