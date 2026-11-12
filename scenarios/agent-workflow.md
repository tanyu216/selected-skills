---
title: 智能体场景（任务看板、工作流）
skills: [setup-meerkat, meerkat, meerkat-chat, meerkat-director, jobs, linus, turing, reviewer, worker, wizard, chief-of-staff, handoff, claude-handoff]
---

# 智能体场景（任务看板、工作流）

## 目标

把工作交给智能体团队后，手上留下可追溯的看板记录：带依赖与 epic 的卡片、每张卡的交付报告与验收映射、独立审查结论，以及只等人回答的问题与人做的验收决定。工作能跨会话、跨 Agent 接力，而不是随会话结束消失。

## 推荐组合与顺序

1. `setup-meerkat` —— 第一次先装 `taskctl` / `taskd` 与技能包，按六步配置项目目录、decision policy 与角色放置；不要跳步。
2. `meerkat` —— 看板操作契约：建卡与拆卡（可把 plan / spec 上传为附件）、连 `depends_on` 与父子关系、claim、heartbeat、评论、交付报告、导出 `card.md` 简报。
3. 按卡片类型选角色：`jobs`（产品简报、原型验证、PRD）→ `linus`（架构、实现、重构、修 bug）→ `turing`（测试设计、回归与证据）→ 都不匹配时用 `worker`。
4. `reviewer` —— 独立审查：九步审计底线加交付形态细化，核对需求台账，给出一个 VERDICT；审查者必须不是交付者。
5. `meerkat-director` —— 由 supervisor 打开：回答 worker 问题、给无主卡路由、处理 required handoff 的 triage、把 E1–E5 升级给人。
6. `meerkat-chat` —— 人看进度、待答问题、待验收卡与 loop 健康；写入前先展示确切评论。
7. `wizard` —— 只有人才能做的外部步骤（账号、凭据、第三方后台）生成交互式向导。

## 分支与替代

- 只在一个会话内协调子 Agent、不需要看板：用 `mattpocock-skills` 的 `chief-of-staff`。
- 跨会话或跨 Agent 交接但不建卡：用 `handoff` 或 `claude-handoff`，写清目标、已完成、未决问题与下一步。
- 只要读看板、不写入：走 `meerkat-chat` 的只读路径，或直接 `taskctl issue list/get` 与 `export md`。
- 已经在用 Jira / Linear / Plane：不要并行再建一套卡；Meerkat 的 claim 与候选契约是可替换的，迁移前先确认团队愿意换板。
- 需要新角色：用 `setup-meerkat` 第 6 步从 role-template 建，不要复制已有角色的正文。
- 卡片需求本身不清：先用 `grilling` 澄清再建卡，否则验收基线写不出来。
- 普通开发交付流程：见开发。

## 注意事项

- 交付门是硬约束：没有当轮报告不能进 `in_review`；报告要带 commit 锚点与验收逐条映射；self-review 不算验收。
- 验收模式建卡时冻结：`off`（交付者自己关）、`auto`（独立审查 APPROVE 后由 loop 关）、`human`（审查跑完仍要人关）。关卡前先确认归属者。
- 一次只持一张卡；心跳每 ≤10 分钟；claim 对本人 30 分钟、对所有人 6 小时过期。不抢别人的卡、`backlog` 卡、`epic`，也不抢还有未完成 `depends_on` 的卡。
- 调度属于 supervisor（`taskctl loop`）：agent 不要自己轮询、抢卡或改 loop 状态；看板 UI 只用于观察。
- `meerkat-director` 与 `setup-meerkat` 是 command-only；人不要直接调用 director，问题交给 `meerkat-chat`。
