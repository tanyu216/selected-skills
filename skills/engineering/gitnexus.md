---
name: GitNexus
category: engineering
source: https://github.com/abhigyanpatwari/GitNexus
license: source-available（PolyForm Noncommercial 1.0.0，非 OSI）
tags: [code-intelligence, knowledge-graph, mcp, cli]
summary: 把代码库索引成本地知识图谱的代码智能引擎，用 MCP 与 CLI 查询调用关系、影响面与执行流。
---

# GitNexus

## 用途

CLI + 内置 skill 条目：GitNexus 在本机把代码库索引成符号、调用、依赖与执行流的知识图谱，存进嵌入式图数据库，再由 MCP 工具、CLI 或 Web 图浏览器查询。索引过程不调用 LLM；只有可选的远端 embeddings、wiki 生成与 AI 对话才使用你配置的 provider。它面向「改代码前先看影响面」的工作流：找符号与执行流、查调用者、算改动的爆炸半径、追踪两个符号之间的路径、审查 diff 的影响、预览并应用语义重命名。索引支持 C、C++、C#、COBOL、Dart、Go、Java、JavaScript、Kotlin、Objective-C、PHP、Python、Ruby、Rust、Swift、TypeScript、Vue、Zig 等语言，各语言按构造的支持程度不同。

### 内置 skill（12）

| 子 skill | 用途 | 推荐 |
| --- | --- | --- |
| `gitnexus-cli` | analyze / status / query / impact / serve 等 CLI 命令与索引维护。 | 首选 |
| `gitnexus-guide` | MCP 工具、资源与图 schema 的速查；涉及代码理解的任务先读。 | 首选 |
| `gitnexus-exploring` | 理解代码如何工作、架构与执行流，探索陌生仓库。 | 常用 |
| `gitnexus-impact-analysis` | 改动前的爆炸半径与依赖安全检查。 | 常用 |
| `gitnexus-debugging` | 追 bug 与错误来源，定位调用链。 | 常用 |
| `gitnexus-refactoring` | 重命名、抽取、拆分、移动等安全重构。 | 常用 |
| `gitnexus-review` | 从 PR、分支/提交区间或本地改动做风险与回归审查。 | 常用 |
| `gitnexus-plan` | 用图与 PDG 证据产出可直接实现的工程计划。 | 常用 |
| `gitnexus-work` | 按计划逐步实现，每次改符号前过 impact 检查。 | 常用 |
| `gitnexus-lfg` | 把 plan → 人工 gate → work → review 串成一条流水线。 | — |
| `gitnexus-pdg-query` | 查询 `pdg_query` 与 CDG / REACHING_DEF 边的控制与数据依赖。 | — |
| `gitnexus-taint-analysis` | 维护 CFG / 污点 / PDG 子系统，解释 source→sink 数据流。 | — |

## 适用 / 不适用

- **适用**：接手陌生或大型仓库；改公共接口前评估影响面；跨文件追踪调用链和执行流；多语言单仓；给编码 Agent 一个可查询的结构层。
- **不适用**：跨仓库统一图谱与自动重索引（企业版功能）；只看单个文件、改动很小（直接读源码更快）；需要编译器级的类型证明（结果带 ambiguity 与覆盖限制）；运行时行为、配置与外部服务依赖；要求 OSI 许可证或直接商用。

## 典型场景

- **触发语句**：「这个函数被谁调用」「改这里会炸什么」「带我读一遍这个仓库」「review 这个 PR 的爆炸半径」。
- **要点**：在仓库根目录跑 `npx gitnexus analyze` 建索引，它会同时安装 skill、注册 hooks 并写 `AGENTS.md` / `CLAUDE.md`，只要索引用 `--index-only`；`npx gitnexus setup` 配置编辑器 MCP；多 Agent 并发时起一个 `gitnexus mcp --http --port 3111`，客户端连 `http://127.0.0.1:3111/mcp`；查询前用 `gitnexus status` 确认索引新鲜。

## 注意点

- 需要 Node.js 22.x（22.18+）或 24.11+；Linux / Windows 的原生依赖另有要求。
- 索引是快照：文件改动后用 `gitnexus analyze` 或 `--watch` 刷新，过期索引会给出错误的图结论。
- 语言支持按构造有差异，结果要核对 ambiguity、coverage 与未解析项，不能当作完整证明。
- `gitnexus-pdg-query` 与 `gitnexus-taint-analysis` 主要写给维护 GitNexus 自身 PDG / 污点子系统的人，日常代码理解用不到。
- 仓库 `.claude/skills/` 下另有一个 `gitnexus-pr-swarm-review`，只用于审查 GitNexus 自己的 PR，未随发布插件分发，因此未列入上表。
- 许可证为 PolyForm Noncommercial 1.0.0：个人与非商业用途可用，商业使用需向 Akon Labs 取得授权，不要写成 MIT / Apache-2.0。
- 与 `open-code-review` 定位不同：GitNexus 用结构图证据判断改动影响，OCR 用外部 LLM 做行级审查；可以组合，但不要重复产出评论。

## 来源

- 地址：https://github.com/abhigyanpatwari/GitNexus
- 许可证：PolyForm Noncommercial 1.0.0（source-available，非 OSI；商业授权见 akonlabs.com）
- 安装：仓库根目录 `npx gitnexus analyze`；或 `npm install -g gitnexus`；`npx gitnexus setup` 配置编辑器 MCP。
