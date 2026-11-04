---
name: Claude Trading Skills
category: quant
source: https://github.com/tradermonty/claude-trading-skills
license: MIT
tags: [quant, trading, collection, backtest]
summary: 74 个面向个人投资者与交易者的交易流程 skill 合集：市场状态、组合、选股、交易计划、复盘与策略研究。
---

# Claude Trading Skills

## 用途

一套围绕「市场状态 → 组合与选股 → 交易计划 → 交易记录 → 复盘」组织的交易流程 skill，共 74 个，分八组。它的目标不是替人做买卖决定，而是把市场复盘、风险管理、交易计划与持续改进固化成可重复的流程。多数 skill 需要外部数据或账户接口（FMP、FINVIZ、Alpaca 等），第一次使用建议先跑 `trading-skills-navigator`，按目标选择工作流。

推荐标记：`首选` = 第一次使用先读或先跑；`常用` = 高频；`—` = 特定场景。

### Market Regime（16）

| 子 skill | 用途 | 推荐 |
| --- | --- | --- |
| `breadth-chart-analyst` | 解读 S&P 500 广度指数与上涨股比例图表。 | — |
| `cot-contrarian-detector` | 用 CFTC COT 数据识别期货市场的拥挤投机仓位（Shapiro 逆向法第 1 步）。 | — |
| `crypto-regime-analyzer` | 用六项公开数据给加密市场状态打 0–100 分。 | — |
| `downtrend-duration-analyzer` | 统计历史下跌持续时长，按行业与市值生成 HTML 直方图。 | — |
| `exposure-coach` | 汇总广度、状态与资金流，给出净敞口上限与入场/持币建议。 | 首选 |
| `ftd-detector` | 用 O'Neil 方法识别市场底部确认的 Follow-Through Day。 | — |
| `ibd-distribution-day-monitor` | 监测 QQQ/SPY 的 IBD 派发日并分级市场风险。 | — |
| `macro-regime-detector` | 用跨资产比率识别 1–2 年的宏观状态切换。 | 常用 |
| `market-breadth-analyzer` | 用公开 CSV 量化市场广度健康度。 | 首选 |
| `market-environment-analysis` | 综合市场环境分析与报告。 | — |
| `market-news-analyst` | 分析近期市场新闻对股票与商品的影响。 | — |
| `market-top-detector` | 用派发日、龙头股走弱与防御板块轮动评估顶部风险。 | 常用 |
| `news-reaction-failure-analyzer` | 判断拥挤仓位是否对利好消息失效（Shapiro 逆向法第 2 步）。 | — |
| `sector-analyst` | 分析板块轮动与市场周期位置。 | 常用 |
| `uptrend-analyzer` | 用 Uptrend Ratio 面板诊断当前市场环境。 | 首选 |
| `us-market-bubble-detector` | 用 Minsky/Kindleberger 框架量化泡沫风险。 | — |

### Core Portfolio（7）

| 子 skill | 用途 | 推荐 |
| --- | --- | --- |
| `dividend-growth-pullback-screener` | 筛股息增长 12%+、收益率 1.5%+ 且 RSI≤40 的回调股。 | 常用 |
| `kanchi-dividend-review-monitor` | 按 Kanchi T1–T5 触发条件监控股息组合，只标记不自动卖出。 | 首选 |
| `kanchi-dividend-sop` | 把 Kanchi 股息投资法落成可重复的美股操作流程。 | — |
| `kanchi-dividend-us-tax-accounting` | 处理美股股息税与账户配置。 | — |
| `portfolio-manager` | 通过 Alpaca MCP 读取持仓，做配置、风险与再平衡分析。 | 首选 |
| `us-undervalued-growth-screener` | 筛选并排序美股中小盘低估成长股，含流动性与估值校验。 | — |
| `value-dividend-screener` | 筛低估值、高股息且三年持续增长的美股。 | 常用 |

### Swing Opportunity（7）

| 子 skill | 用途 | 推荐 |
| --- | --- | --- |
| `breakout-trade-planner` | 从 VCP 结果生成 Minervini 式突破交易计划与订单模板。 | — |
| `canslim-screener` | 按 O'Neil CANSLIM 方法筛选美股。 | 常用 |
| `finviz-screener` | 把自然语言请求转成 FinViz 筛选 URL。 | 常用 |
| `stockbee-exhaustion-hammer-screener` | 筛 Stockbee 式卖出衰竭锤子线候选。 | — |
| `stockbee-momentum-burst-screener` | 筛 Stockbee 式 3–5 日动量爆发候选。 | — |
| `theme-detector` | 识别并分析跨行业的市场主题。 | 常用 |
| `vcp-screener` | 在 S&P 500 中筛 Minervini VCP 形态。 | 首选 |

### Trade Planning（7）

| 子 skill | 用途 | 推荐 |
| --- | --- | --- |
| `contrarian-setup-gate` | 把 COT 拥挤、新闻失效与周线确认合成一个 fail-closed 入场状态。 | — |
| `drawdown-circuit-breaker` | 账户级熔断：按日、周、月回撤与连亏决定当天能否开新仓。 | 首选 |
| `futures-position-sizer` | 按 23 个市场的合约规格计算期货仓位。 | — |
| `position-sizer` | 按止损距离计算美股多头仓位。 | 首选 |
| `pre-trade-discipline-gate` | 开盘前检查清单，拦截无计划、超仓与报复性等交易。 | 首选 |
| `technical-analyst` | 分析股票、指数、加密与外汇的周线图。 | 首选 |
| `us-stock-analysis` | 综合基本面、技术面与同行业对比生成美股报告。 | 常用 |

### Trade Memory（6）

| 子 skill | 用途 | 推荐 |
| --- | --- | --- |
| `signal-postmortem` | 记录并分析信号交易后的结果。 | 首选 |
| `stockbee-setup-fluency-trainer` | 用动量爆发候选建立 setup 模型库并跟踪 3/5 日结果。 | — |
| `trade-hypothesis-ideator` | 从行情、交易日志与笔记生成可证伪的策略假设。 | — |
| `trade-performance-coach` | 复盘已平仓交易，评估流程、风控与执行并给出下日规则。 | — |
| `trader-memory-core` | 跟踪投资论点从筛选到平仓的全生命周期。 | 首选 |
| `weekly-performance-digest` | 生成周度胜率、期望值与模式分析。 | 常用 |

### Strategy Research（15）

| 子 skill | 用途 | 推荐 |
| --- | --- | --- |
| `backtest-expert` | 系统回测方法论：压力测试、参数稳健性与偏差防范。 | 首选 |
| `edge-candidate-agent` | 从收盘观察生成并排序美股多头 edge 研究票据。 | — |
| `edge-concept-synthesizer` | 把检测结果抽象成可复用的 edge 概念与策略手册。 | — |
| `edge-hint-extractor` | 从每日观察与新闻反应提取 edge 线索。 | — |
| `edge-pipeline-orchestrator` | 编排从候选发现到策略设计、审查与导出的完整流水线。 | 常用 |
| `edge-signal-aggregator` | 聚合多个 edge 来源信号，输出带权重的信念看板。 | — |
| `edge-strategy-designer` | 把 edge 概念转成策略草案与可导出票据。 | — |
| `edge-strategy-reviewer` | 审查策略草案的合理性、过拟合、样本量与执行现实性。 | — |
| `manifoldbt-backtester` | 用 Rust 引擎在 OHLCV 上跑声明式策略并产出回测评估输入。 | 常用 |
| `mt5-robot-tester` | 批量测试 MetaTrader 5 EA 并保留参数与品种结论。 | — |
| `residual-edge-analyzer` | 用 HAC 回归把收益拆成基准暴露与残差 edge。 | — |
| `scenario-analyzer` | 从新闻标题推演 18 个月情景并给出影响与标的。 | — |
| `stanley-druckenmiller-investment` | 汇总 8 个上游信号形成 0–100 信念分。 | — |
| `stockbee-20pct-study` | 建立 ±20% 异动事件研究并导出 edge 线索。 | — |
| `strategy-pivot-designer` | 检测回测调参停滞并生成结构性转向方案。 | — |

### Advanced Satellite（7）

| 子 skill | 用途 | 推荐 |
| --- | --- | --- |
| `earnings-trade-analyzer` | 用五因子给财报后个股打分。 | — |
| `institutional-flow-tracker` | 用 13F 跟踪机构持仓变化与资金流。 | — |
| `options-strategy-advisor` | 期权策略分析与模拟。 | — |
| `pair-trade-screener` | 寻找配对交易的统计套利机会。 | — |
| `parabolic-short-trade-planner` | 筛抛物线衰竭形态并生成盘前做空计划。 | — |
| `pead-screener` | 筛选财报后跳空高开的 PEAD 漂移候选。 | — |
| `stockbee-episodic-pivot-analyzer` | 分析 Stockbee 式 Day 1 事件驱动枢轴候选。 | — |

### Meta / Development Tooling（9）

| 子 skill | 用途 | 推荐 |
| --- | --- | --- |
| `data-quality-checker` | 发布前校验市场分析文档的数据质量。 | 常用 |
| `dual-axis-skill-reviewer` | 用确定性检查 + LLM 深审双轴审查 skill。 | — |
| `earnings-calendar` | 用 FMP 获取美股财报日历。 | 常用 |
| `economic-calendar-fetcher` | 用 FMP 获取经济数据发布日历。 | 常用 |
| `fxmacrodata-calendar` | 用 FXMacroData 获取官方宏观日历。 | — |
| `skill-designer` | 从结构化想法设计新 skill。 | — |
| `skill-idea-miner` | 从 Claude Code 会话日志挖掘 skill 想法。 | — |
| `skill-integration-tester` | 校验多 skill 工作流的契约与交接。 | — |
| `trading-skills-navigator` | 按自然语言目标推荐工作流、技能组合与 API 配置。 | 首选 |

## 适用 / 不适用

- **适用**：有时间约束的个人投资者；以长期投资、ETF 与股息股为核心，同时做有纪律的波段交易；想先把市场状态、仓位与复盘流程固定下来。
- **不适用**：想找自动交易或买卖信号；需要券商实盘执行；做高频、短线 scalping；不愿意配置 FMP / FINVIZ / Alpaca 等数据接口。

## 典型场景

- **触发语句**：「今天市场能不能开新仓」「筛一下 VCP 候选」「复盘我这周的交易」「这个策略回测稳不稳」。
- **要点**：先用 `trading-skills-navigator` 选工作流；日常按 `market-breadth-analyzer` → `uptrend-analyzer` → `exposure-coach` 判断环境，环境允许时再走 `vcp-screener` → `technical-analyst` → `position-sizer` → `pre-trade-discipline-gate`，交易后用 `trader-memory-core` 与 `signal-postmortem` 记录复盘；策略验证用 `backtest-expert` 或 `manifoldbt-backtester`。

## 注意点

- 合集共 74 个子 skill，本条目按上游分组全部列出，不单独拆分。
- 大量选股与图表 skill 依赖外部接口：FMP 多为必需，FINVIZ 常为可选加速，`portfolio-manager` 需要 Alpaca MCP，图表类需要 `chart_image`。没有对应 API 时只能走降级路径。
- 上游明确声明这是流程与教育工具，不是信号服务、投资建议或券商执行平台；回测、筛选与 AI 分析都不保证未来收益。
- 部分 skill 标为 `beta` 或 `research_only`，接口与产出可能变化；首次使用先读对应 SKILL.md 与工作流 manifest。

## 来源

- 地址：https://github.com/tradermonty/claude-trading-skills
- 许可证：MIT
- 安装：克隆仓库后，把需要的 `skills/<name>/` 目录复制到 `~/.claude/skills/` 或项目的 `.claude/skills/`；Claude Web 可在 Releases 下载对应 `.skill` 包上传
