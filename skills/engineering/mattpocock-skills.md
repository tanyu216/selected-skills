---
name: Matt Pocock Skills
category: engineering
source: https://github.com/mattpocock/skills
license: MIT
tags: [workflow, engineering, collection]
summary: 推荐的 16 个工程流程 skill：规格、拆分、实现、调试与交接。
---

# Matt Pocock Skills

## 用途

一套围绕「规格 → 拆分 → 实现 → 交付」组织的工程工作流。上游共 39 个 skill，本条目只收录推荐的 16 个（首选 5 个、常用 7 个、通用 1 个、按需 3 个）；`in-progress`、`misc` 与其余特定场景 skill 不逐一收录。

多数 skill 依赖仓库里配置好的 issue tracker 与领域文档布局，因此第一次使用前要先跑 `setup-matt-pocock-skills`。

推荐标记：`首选` = 第一次使用先读或先跑；`常用` = 高频；`通用` = 所有场景都适用；`按需` = 特定任务才用。

### engineering（14）

| 子 skill | 用途 | 推荐 |
| --- | --- | --- |
| `setup-matt-pocock-skills` | 配置仓库的 issue tracker、triage 标签与领域文档布局。 | 首选 |
| `ask-matt` | 按当前处境推荐该用哪个 skill 或流程。 | 首选 |
| `to-spec` | 把当前对话综合成 spec 并发布到 tracker，不做二次访谈。 | 首选 |
| `to-tickets` | 把计划或 spec 拆成带阻塞边的 tracer-bullet tickets。 | 首选 |
| `implement-spec` | 实现 `/to-spec` 与 `/to-tickets` 的产物。 | 首选 |
| `tdd` | 测试先行的红-绿-重构流程。 | 常用 |
| `diagnosing-bugs` | 难 bug 与性能回归的诊断循环。 | 常用 |
| `grill-with-docs` | 追问式打磨计划或设计，同时产出 ADR 与术语表。 | 常用 |
| `domain-modeling` | 建立和维护项目领域模型、GLOSSARY.md 与 ADR。 | 常用 |
| `pr` | 撰写 PR 描述。 | 常用 |
| `triage` | 用状态机推动 issue 与外部 PR：分类、验证、追问、写简报。 | 常用 |
| `codebase-design` | 深模块设计的共享词汇：接口、接缝、可测试性。 | 按需 |
| `improve-codebase-architecture` | 扫描可加深的模块，输出 HTML 报告并逐个追问。 | 按需 |
| `prototype` | 做一次性原型来回答设计问题。 | 按需 |

### productivity（2）

| 子 skill | 用途 | 推荐 |
| --- | --- | --- |
| `handoff` | 把当前对话压缩成交接文档，供另一个 Agent 接手。 | 常用 |
| `grilling` | 就计划、决策或想法持续追问，压力测试思路。 | 通用 |

## 未收录的 skill

上游还有 `in-progress`、`misc` 与只在特定场景使用的 skill。本条目不逐一展开，需要时回上游查阅；场景里偶尔引用的个别条目由 [extra-sources.json](../../tools/installer/extra-sources.json) 单独解析。

## 适用 / 不适用

- **适用**：希望用一条固定链路（spec → tickets → 实现 → 交付）推进中型以上需求；团队需要共享的工程词汇和 issue 状态机。
- **不适用**：一次性小改动；没有 issue tracker 的仓库；只需要单点能力（如只做 TDD）。

## 典型场景

- **触发语句**：「把这个需求拆成 ticket 再实现」「诊断这个 bug」「给这块逻辑补测试」。
- **要点**：先跑 `setup-matt-pocock-skills`，再用 `ask-matt` 路由；`to-spec` 之前不要跳过澄清。

## 注意点

- 以插件形式安装，部分 skill 标记为 `disable-model-invocation`，需要显式斜杠调用。
- 整包安装会带入上游全部子 skill；只需要推荐集时按上表名称逐个安装。
- 未收录的 `in-progress` skill 接口可能变化；不要在流程里硬依赖。
- 本条目不收录 `code-review`；代码审查用 `open-code-review` 或 `open-code-review-delegate`。
- 插件安装与 skills.sh 复制二选一，同时装会出现重复 skill。

## 来源

- 地址：https://github.com/mattpocock/skills
- 许可证：MIT
- 安装：`claude plugin install mattpocock-skills@claude-plugins-official`
