---
name: Skill Creator
category: agent
source: https://github.com/anthropics/skills
license: Apache-2.0
tags: [skill, meta, evaluation, packaging]
summary: 创建、评测、迭代优化并打包 skill 的元 skill。
---

# Skill Creator

## 用途

把「想做一个 skill」变成一条可验证的反馈回路：梳理意图与触发条件，写 `SKILL.md`，生成真实测试提示，分别跑带 skill 与不带 skill 的对照，评分并聚合基准，按用户反馈迭代，最后优化 frontmatter description 的触发准确率并打包成 `.skill`。

覆盖 skill 的完整生命周期：从零创建、改现有 skill、把一段对话或工作流沉淀成 skill、跑 eval、做基准对比、优化触发描述、打包分发。

## 适用 / 不适用

- **适用**：从零写 skill；修改或优化已有 skill；想用对照实验判断 skill 是否真的有效；description 触发不稳需要系统优化；需要把成品打包分发。
- **不适用**：只写一段普通提示词；纯文档写作（用 `writing-for-agents`）；不打算做评测、只要一个静态的说明文件；没有子 Agent 或 `claude` CLI 却想跑并行基准与描述优化（会自动降级，见注意点）。

## 典型场景

- **触发语句**：「把我的工作流做成一个 skill」「这个 skill 怎么改才更稳」「测一下这个 skill 到底有没有用」「让它更容易被触发」「打包成 .skill」。
- **要点**：先确认四件事——要让 Claude 能做什么、什么时候触发、期望输出格式、是否需要测试用例；客观可验证的 skill 才做量化 eval，主观类（文风、美术）以定性评审为主。

## 注意点

- 运行时需要 Python 与可用的子 Agent；并行对照、基准聚合、盲测与 description 优化都依赖子 Agent，Claude.ai 环境需退化为顺序执行并跳过基线、基准与描述优化。
- 目录约定：`SKILL.md` 必需，可选 `scripts/`、`references/`、`assets/`；`SKILL.md` 正文建议控制在 500 行内，大段材料放 `references/` 按需加载。
- eval 产物写到 skill 同级的 `<skill-name>-workspace/iteration-N/`，`grading.json` 必须用 `text`、`passed`、`evidence` 三个字段；timing 数据只在子 Agent 完成通知里出现，要及时落盘。
- 改进时避免过拟合少数测试用例；重复出现的辅助脚本应移入 `scripts/`，不要留在单次运行里。
- 上游为 Apache-2.0，可修改与再分发；保留许可证与归属声明。

## 来源

- 地址：https://github.com/anthropics/skills/blob/HEAD/skills/skill-creator/SKILL.md
- 许可证：Apache-2.0
