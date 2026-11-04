---
name: Qlib
category: quant
source: https://github.com/microsoft/qlib
license: MIT
tags: [quant, framework, backtest, machine-learning]
summary: 面向 AI 的量化投资框架：数据、因子、模型、回测、组合优化与自动研究流水线。
---

# Qlib

## 用途

框架条目：Qlib 是微软开源的 AI 量化投资平台，把量化研究拆成可组合的组件——数据层与表达式因子、模型训练与预测、`qrun` 工作流、回测与组合策略，并内置 Alpha158 / Alpha360 等基准因子和一批论文模型示例。它支持监督学习、市场状态建模与强化学习，也可接入 RD-Agent 做自动化研究。适合需要一条可复现的端到端流水线，而不是零散脚本。

## 适用 / 不适用

- **适用**：要复现或对比量化论文模型；需要统一的数据、因子、训练、回测与评估入口；做 A 股或自有数据的多因子研究；用 Jupyter 分析预测信号与回测报告。
- **不适用**：实盘下单与券商接入（Qlib 不做执行）；只想做简单数据探索或画图（用 `polars`、`matplotlib`）；没有 Python 与量化基础；不能接受为数据准备投入时间。

## 典型场景

- **触发语句**：「用 LightGBM 跑一版 Alpha158 基准」「搭一套因子到回测的流水线」「复现这个量化论文的模型」。
- **要点**：先 `pip install pyqlib`，再按官方说明准备数据到 `~/.qlib/qlib_data/`；在 `examples/` 目录外运行 `qrun benchmarks/LightGBM/workflow_config_lightgbm_Alpha158.yaml`，一条命令完成建数据集、训练、回测与评估；图形化分析用 `examples/workflow_by_code.ipynb` 配合 Jupyter。

## 注意点

官方演示数据集目前处于临时停用状态，需要改用社区数据源或自备数据；数据质量、复权与时间对齐会直接影响结论。建议用 conda 管理 Python 环境（官方建议 3.8+），macOS 上装 LightGBM 可能要先 `brew install libomp`。回测结果依赖成本、滑点与样本区间假设，不能直接当作实盘预期；Qlib 不提供投资建议。

## 来源

- 地址：https://github.com/microsoft/qlib
- 许可证：MIT
- 安装：`pip install pyqlib`；开发版为克隆仓库后 `pip install -e .[dev]`
