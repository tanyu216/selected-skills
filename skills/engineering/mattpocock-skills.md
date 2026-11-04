---
name: Matt Pocock Skills
category: engineering
source: https://github.com/mattpocock/skills
license: MIT
tags: [workflow, engineering, collection]
summary: 39 个工程流程 skill 的合集：规格、拆分、实现、审查、调试与架构。
---

# Matt Pocock Skills

## 用途

一套围绕「规格 → 拆分 → 实现 → 审查」组织的工程工作流 skill，共 39 个，分四个目录。多数 skill 依赖仓库里配置好的 issue tracker 与领域文档布局，因此第一次使用前要先跑 `setup-matt-pocock-skills`。

推荐标记：`首选` = 第一次使用先读或先跑；`常用` = 高频；`—` = 特定场景。

### engineering（20）

| 子 skill | 用途 | 推荐 |
| --- | --- | --- |
| `setup-matt-pocock-skills` | 配置仓库的 issue tracker、triage 标签与领域文档布局。 | 首选 |
| `ask-matt` | 按当前处境推荐该用哪个 skill 或流程。 | 首选 |
| `to-spec` | 把当前对话综合成 spec 并发布到 tracker，不做二次访谈。 | 首选 |
| `to-tickets` | 把计划或 spec 拆成带阻塞边的 tracer-bullet tickets。 | 首选 |
| `implement-spec` | 实现 `/to-spec` 与 `/to-tickets` 的产物。 | 首选 |
| `code-review` | 对照 Standards 与 Spec 两条轴审查某个固定点之后的改动。 | 首选 |
| `tdd` | 测试先行的红-绿-重构流程。 | 常用 |
| `diagnosing-bugs` | 难 bug 与性能回归的诊断循环。 | 常用 |
| `grill-with-docs` | 追问式打磨计划或设计，同时产出 ADR 与术语表。 | 常用 |
| `domain-modeling` | 建立和维护项目领域模型、GLOSSARY.md 与 ADR。 | 常用 |
| `pr` | 撰写 PR 描述。 | 常用 |
| `triage` | 用状态机推动 issue 与外部 PR：分类、验证、追问、写简报。 | 常用 |
| `codebase-design` | 深模块设计的共享词汇：接口、接缝、可测试性。 | — |
| `improve-codebase-architecture` | 扫描可加深的模块，输出 HTML 报告并逐个追问。 | — |
| `implement` | 按 spec 或 tickets 实现一块工作。 | — |
| `prototype` | 做一次性原型来回答设计问题。 | — |
| `research` | 针对高可信一手来源做调研，落成仓库里的 Markdown。 | — |
| `retro` | 对一次编码会话做复盘。 | — |
| `wayfinder` | 把超过一个会话规模的工作规划成决策 ticket 地图。 | — |
| `wizard` | 生成交互式 bash 向导，带人完成只有人能做的步骤。 | — |

### in-progress（8）

这些仍在演进，生产使用前先读变更。

| 子 skill | 用途 | 推荐 |
| --- | --- | --- |
| `chief-of-staff` | 在单个会话里协调子 Agent 追求长期目标。 | — |
| `claude-handoff` | 把当前对话交给新的后台 Agent 立即接手。 | — |
| `loop-me` | 针对想构建的工作流追问 spec。 | — |
| `setup-ts-deep-modules` | 用 dependency-cruiser 把 TypeScript 包约束成深模块。 | — |
| `software-factory` | 设计软件工厂的任务与服务插件的共享语言。 | — |
| `writing-beats` | 写作的 exploit 阶段：把素材组装成一段段 beat。 | — |
| `writing-fragments` | 写作的 explore 阶段：只挖原始片段，不建结构。 | — |
| `writing-shape` | 写作的 exploit 阶段：逐段把素材塑造成文章。 | — |

### misc（4）

| 子 skill | 用途 | 推荐 |
| --- | --- | --- |
| `git-guardrails-claude-code` | 用 Claude Code hooks 拦截 push、reset --hard、clean 等危险 git 命令。 | — |
| `setup-pre-commit` | 配置 Husky + lint-staged、类型检查与测试。 | — |
| `migrate-to-shoehorn` | 把测试里的 `as` 断言迁移到 @total-typescript/shoehorn。 | — |
| `scaffold-exercises` | 生成带 section、题目、答案与讲解的练习目录。 | — |

### productivity（7）

| 子 skill | 用途 | 推荐 |
| --- | --- | --- |
| `handoff` | 把当前对话压缩成交接文档，供另一个 Agent 接手。 | 常用 |
| `grilling` | 就计划、决策或想法持续追问，压力测试思路。 | — |
| `grill-me` | 对计划或设计做不留情面的追问。 | — |
| `teach` | 在项目语境里教用户一个新技能或概念。 | — |
| `to-questionnaire` | 把答不了的决策变成给他人的问卷。 | — |
| `wait-what` | 喊停：上一条没讲清楚，重新讲一遍。 | — |
| `writing-for-agents` | 写给人看还是给 Agent 看：skill、AGENTS.md、CLAUDE.md 的写法。 | — |

## 适用 / 不适用

- **适用**：希望用一条固定链路（spec → tickets → 实现 → 审查）推进中型以上需求；团队需要共享的工程词汇和 issue 状态机。
- **不适用**：一次性小改动；没有 issue tracker 的仓库；只需要单点能力（如只做 TDD）。

## 典型场景

- **触发语句**：「把这个需求拆成 ticket 再实现」「review since main」「诊断这个 bug」。
- **要点**：先跑 `setup-matt-pocock-skills`，再用 `ask-matt` 路由；`to-spec` 之前不要跳过澄清。

## 注意点

- 以插件形式安装，部分 skill 标记为 `disable-model-invocation`，需要显式斜杠调用。
- `in-progress` 目录的 8 个 skill 接口可能变化。
- 插件安装与 skills.sh 复制二选一，同时装会出现重复 skill。
- 本条目未单独收录其余子 skill，按上表直接使用上游名称即可。

## 来源

- 地址：https://github.com/mattpocock/skills
- 许可证：MIT
- 安装：`claude plugin install mattpocock-skills@claude-plugins-official`
