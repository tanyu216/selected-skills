---
name: TradingAgents
category: quant
source: https://github.com/TauricResearch/TradingAgents
license: Apache-2.0
tags: [multi-agent, trading, framework, llm]
summary: 多 Agent LLM 交易研究框架：分析师、研究员、交易员、风控与组合经理协作决策。
---

# TradingAgents

## 用途

框架条目：TradingAgents 用 LangGraph 编排一支「AI 交易团队」——基本面、情绪、新闻与技术分析师并行产出报告，多空研究员辩论，交易员形成提案，风控团队评估，组合经理最终批准或拒绝，获批订单送到模拟交易所。它支持多家 LLM 提供商、组合上下文、决策记忆与断点续跑，适合研究多 Agent 协作、给量化候选做独立第二意见，或模拟投委会式评审。

## 适用 / 不适用

- **适用**：研究多 Agent 辩论与 LLM 决策流程；对最终候选标的按日期做基本面/新闻/情绪/技术面复核；给量化策略加独立软否决或降仓依据；带组合上下文的交易提案评审。
- **不适用**：策略代码回测、参数扫描与组合优化（用 `qlib`、`backtest-expert` 或 `manifoldbt-backtester`）；实盘券商执行；高频或大股票池逐票评审；要求完全确定、可复现的决策；需要 A 股/期货/外汇深度数据源。

## 典型场景

- **触发语句**：「让多角色评审这只票」「模拟一次投委会」「给量化候选加一个基本面与新闻复核」。
- **要点**：配置所选 LLM 提供商的 API key；CLI 用 `tradingagents --ticker NVDA --date 2026-09-23 --save --no-show`，Python 用 `TradingAgentsGraph(config).propagate(ticker, date, portfolio=...)`；把持仓作为 `PortfolioContext` 传入；评审报告只作为决策输入之一，最终仓位仍由明确规则决定。

## 注意点

- **没有 REST / MCP / Web UI**：外部接入只有 CLI、Python API 和 Docker；要接进自己的系统需自建适配层。
- **结果非确定**：LLM 采样、实时新闻与社交数据都会变化；推理模型通常忽略 `temperature`。用于实盘流程时要定义重试、投票或软否决规则。
- **不是策略回测引擎**：`run_backtest` 是对一组 ticker × 日期评估决策质量，不是任意策略的收益回测。
- **只连模拟交易所**：不提供真实券商下单，不能替代 paper/live 交易系统。
- **数据与前视偏差**：主要覆盖 Yahoo Finance 能拿到的市场，并使用 SEC EDGAR、新闻与社交数据；历史复盘必须按决策时点可得信息重放。
- 需要 Python 3.11+，多 Agent 多轮调用会带来明显的成本与延迟；项目定位为研究工具，不构成投资建议。

## 来源

- 地址：https://github.com/TauricResearch/TradingAgents
- 许可证：Apache-2.0
- 安装：克隆仓库后 `pip install .`；或 `docker compose run --rm tradingagents`
