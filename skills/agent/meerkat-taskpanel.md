---
name: Meerkat TaskPanel
category: agent
source: https://github.com/tanyu216/meerkat-taskpanel
license: MIT
tags: [agent, task-board, multi-agent, cli]
summary: 面向 AI Agent 团队的本机任务看板：卡片流转、交付报告、独立审查与 supervisor 调度。
---

# Meerkat TaskPanel

## 用途

CLI + 内置 skill：用 `taskctl` 驱动一块本地优先的任务看板，Agent 自己建卡、认领、心跳、评论、交付，人类只设目标、答问题、做验收。看板用单个 SQLite 文件持久化（`node:sqlite`），`taskd` 提供 loopback HTTP/SSE 给看板 UI，supervisor（`taskctl loop`）按 tick 发现卡片并调度 worker。支持 Claude Code、Codex、OpenClaw、pi 四种 Agent kind。

推荐标记：`首选` = 第一次使用先装或先读；`常用` = 高频；`—` = 特定场景。

### 看板与决策（4）

| 子 skill | 用途 | 推荐 |
| --- | --- | --- |
| `setup-meerkat` | 六步装好与配置：`taskctl`/`taskd` 安装升级、env 冲突修复、director 项目规则、看板项目规则、角色跨平台放置、从模板建新角色。 | 首选 |
| `meerkat` | 看板操作契约：建卡/拆卡与附件、`depends_on` 与 epic、claim、heartbeat、comment、交付报告、审查、验收、导出 `card.md`。 | 首选 |
| `meerkat-chat` | 人类控制台：读进度、待答问题、待验收卡与 loop 健康；每次写入先展示确切评论，再以 `--as-human` 记录。 | 常用 |
| `meerkat-director` | 决策中枢：回答 worker 问题、给无主卡路由、处理 required handoff 的 triage、把 E1–E5 升级给人；command-only，由 supervisor 打开。 | — |

### 角色（5）

| 子 skill | 用途 | 推荐 |
| --- | --- | --- |
| `jobs` | 产品设计：产品简报、方向选择、原型验证、PRD、术语表/ADR 与 UI 流程。 | 常用 |
| `linus` | 工程：架构与项目初始化、安全工具链、实现、重构、修 bug。 | 常用 |
| `turing` | 验证：测试设计、测试编写、修复后回归、生产 bug、性能与安全扫描证据。 | 常用 |
| `reviewer` | 独立验收审查：九步审计底线加按交付形态细化，核对需求台账，只给一个 VERDICT。 | 常用 |
| `worker` | 默认兜底角色：承接无专职角色的卡，计划、执行、自检、交付。 | 首选 |

## 适用 / 不适用

- **适用**：多个 Agent 跨会话接力同一批工作；需要冻结验收基线、当轮交付报告、独立审查和 append-only 审计记录；人类只想在问题上答复、在 `human` 模式卡上验收。
- **不适用**：人类项目管理（Jira / Linear 那种由人建卡、拖卡的方式）；一个会话就结束的小任务；没有 Node >= 22 或无法常驻 `taskd`/supervisor 的环境；不接受 Agent 直接读写同一块看板的团队。

## 典型场景

- **触发语句**：「建张卡让 agent 去做」「这卡谁负责、为什么卡住了」「接受这张交付」「把需求拆成 epic 和子卡」。
- **要点**：先 `setup-meerkat`；建卡时把验收基线冻结清楚；worker 交付必须带报告与 commit 锚点；审查由另一个 Agent 给 VERDICT；`human` 卡等人关。

## 注意点

- 场景里按子 skill 名称引用（`meerkat`、`jobs` 等），索引只保留本条目；不要为角色另建重复条目。
- 交付门在数据库层生效：没有当轮报告进不了 `in_review`；self-review 不算验收；`acceptance_mode` 建卡时冻结为 `off` / `auto` / `human`。
- 心跳有效期 10 分钟；claim 对本人 30 分钟、对所有人 6 小时过期；一次只持一张卡，不抢别人的卡、`backlog` 卡、`epic` 或还有未完成阻塞的卡。
- `meerkat-director`、`meerkat-chat`、`setup-meerkat` 与角色技能不通过 marketplace 分发，由 `install.sh` 装到 primary kind；supervisor 需要显式 `--supervisor=enable` 才加载。
- 看板 UI 用来观察，不用来驱动；调度属于 supervisor，Agent 不要自己轮询或改 loop 状态。

## 来源

- 地址：https://github.com/tanyu216/meerkat-taskpanel
- 许可证：MIT
- 安装：`npx meerkat-taskpanel`（源码仓内可用 `bash install.sh --target claude,server`）
