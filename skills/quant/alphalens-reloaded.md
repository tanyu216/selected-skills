---
name: Alphalens Reloaded
category: quant
source: https://github.com/stefan-jansen/alphalens-reloaded
license: Apache-2.0
tags: [factor-analysis, ic-ir, quant, python]
summary: 因子绩效分析：IC/IR、分位收益、换手与分组分析，原 Alphalens 的维护 fork。
---

# Alphalens Reloaded

## 用途

库条目：Alphalens 用于分析预测型（alpha）股票因子的表现，核心输出是因子 IC、分位收益、换手率与分组分析，并生成 tear sheet。典型流程是 `get_clean_factor_and_forward_returns()` 清洗因子与未来收益，再用 `create_full_tear_sheet()` 或 `create_information_tear_sheet()` 查看 IC 时序、分位单调性与换手。它是原 Quantopian Alphalens 的社区维护 fork，适配了新版 Python / pandas。

## 适用 / 不适用

- **适用**：单因子或多因子的 IC / IR 检验；分位收益与单调性检查；换手率与分组（行业、市值）分析；回测前的因子筛查与因子对比。
- **不适用**：完整策略回测与组合优化（用 `qlib` 或 `backtest-expert`）；高频 / tick 级研究；需要交易成本与撮合模拟；没有可靠的因子值与价格数据。

## 典型场景

- **触发语句**：「算一下这个因子的 IC / IR」「做 5 分层回测」「看看因子收益是不是单调」「因子换手率高不高」。
- **要点**：因子用带 `(date, asset)` MultiIndex 的 Series 或 DataFrame；价格数据要对齐；调用 `get_clean_factor_and_forward_returns(factor, prices, quantiles=5, periods=(1, 5, 10), groupby=sector)` 后生成 tear sheet；重点看 IC 均值与 IR、分位收益是否单调、换手率、缺失值与行业暴露。

## 注意点

- **时间对齐**：因子必须是 `t` 时刻可得的信息，未来收益必须严格在 `t` 之后；先做 lag 与可得性检查，避免未来函数。
- **样本与掩码**：退市股票、停牌、缺失值和行业映射会影响分位分组；要明确 universe 与 rebalance 频率。
- Alphalens 是因子诊断工具，不模拟交易成本与撮合，tear sheet 好看不等于策略可交易。
- 原版 `quantopian/alphalens` 自 2020 年后基本停更，新环境兼容性差；请使用本条的 `alphalens-reloaded`。上游说明新功能转向 ML4T Diagnostic，本库主要做兼容性与缺陷修复。
- 需要 Python 3.11–3.15（当前发布版要求 `<3.16`）。

## 来源

- 地址：https://github.com/stefan-jansen/alphalens-reloaded
- 许可证：Apache-2.0（保留 Quantopian 版权声明）
- 安装：`pip install alphalens-reloaded`；或 `conda install -c ml4t alphalens-reloaded`
