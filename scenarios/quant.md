---
title: 量化研究场景（因子、回测、交易流程）
skills: [qlib, backtest-expert, manifoldbt-backtester, alphalens-reloaded, optuna, tradingagents, trading-skills-navigator, market-breadth-analyzer, uptrend-analyzer, exposure-coach, vcp-screener, technical-analyst, position-sizer, pre-trade-discipline-gate, trader-memory-core, signal-postmortem, data-quality-checker, polars, xlsx, exploratory-data-analysis, statistical-analysis, statsmodels, scikit-learn, grilling]
---

# 量化研究场景（因子、回测、交易流程）

## 目标

完成因子或策略研究、回测与组合/交易流程，结论可复核，数据口径、成本假设与风险边界写清楚。

## 推荐组合与顺序

1. `grilling` —— 先收敛研究目标：标的与频率、持有期、数据范围、可接受回撤与验证方式。
2. `polars` / `xlsx` —— 整理行情、因子与交易记录；统一时间轴、复权、缺失与停牌口径。
3. `exploratory-data-analysis` —— 做数据画像，重点检查未来函数、幸存者偏差与样本泄漏。
4. `statistical-analysis` / `statsmodels` —— 检验因子有效性，做回归、面板或时序诊断并报告不确定性。
5. `scikit-learn` / `optuna` —— 需要预测建模、交叉验证或超参数搜索时使用；Optuna 负责搜索空间、剪枝与试验管理。
6. `qlib` —— 需要端到端量化流水线时，用 Qlib 建数据、因子、模型训练与 `qrun` 回测评估。
7. `alphalens-reloaded` —— 在回测前做因子体检：IC / IR、分位收益、换手率与行业分组。
8. `backtest-expert` —— 对策略做压力测试、参数稳健性、滑点与偏差审查；声明式回测接 `manifoldbt-backtester`。
9. `tradingagents` —— 需要对最终候选做独立第二意见或投委会式评审时，按标的与决策日期跑多角色分析；只作为软否决或降仓依据，不替代回测。
10. `trading-skills-navigator` —— 需要具体交易流程时，先在 `claude-trading-skills` 里选工作流，再按需接 `market-breadth-analyzer` / `uptrend-analyzer` / `exposure-coach`、`vcp-screener`、`technical-analyst`、`position-sizer`、`pre-trade-discipline-gate`、`trader-memory-core`、`signal-postmortem`。
11. `data-quality-checker` —— 交付前校验数据、结论与文档的一致性。

## 分支与替代

- 只做数据清洗、统计检验或可视化：转「数据分析场景」，不必进本场景。
- 只想复现基准模型或论文：用 `qlib` + `qrun`，先跑 LightGBM / Alpha158 基准。
- 只想筛因子、看 IC / IR 与分层收益：用 `alphalens-reloaded`，不必先搭完整回测。
- 只想调模型超参：用 `optuna`，目标函数接现有的训练与验证流程即可。
- 要对最终候选做基本面 / 新闻 / 情绪复核：用 `tradingagents` 离线批量评审；它不读策略代码，只按标的与日期给第二意见。
- 只验证已有策略：用 `backtest-expert` 做稳健性审查，或用 `manifoldbt-backtester` 跑声明式回测。
- 因子归因与 IC/IR：用 `qlib` 的因子与模型评估；需要更细的因子分析时接上游 `alphalens` 等库。
- 实盘交易流程（市场状态、选股、仓位与复盘）：用 `claude-trading-skills` 合集，先跑 `trading-skills-navigator`；多数子 skill 依赖 FMP / FINVIZ / Alpaca 等外部数据与账户。
- 高频、tick 级或实盘执行：不在本场景范围；Qlib 与回测 skill 只服务研究，不接券商下单。
- 研究目标、口径或验证方式不清：先用 `grilling` 做压力测试。

## 注意事项

- 结论必须标注数据源、样本区间、复权方式、交易成本与滑点假设。
- 回测要留样本外或滚动验证，警惕过拟合、未来函数与幸存者偏差。
- 交易类 skill 只是流程辅助，不构成投资建议；回测、筛选与 AI 分析都不保证未来收益。
