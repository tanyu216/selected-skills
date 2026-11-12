---
title: 开发
skills: [antfu, gitnexus, setup-matt-pocock-skills, grill-with-docs, to-spec, to-tickets, implement, implement-spec, pr, ask-matt, grilling, code-review, wayfinder, codebase-design, improve-codebase-architecture, vitest, playwright-cli, open-code-review, open-code-review-delegate]
---

# 开发

## 目标

一个可构建、可测试、可审查并合并的 Web 应用改动，附带 spec、tickets、测试与 PR 描述。界面实现、组件样式与视觉打磨见前端开发。

## 推荐组合与顺序

1. `antfu` —— 新项目先定工具链与代码组织：pnpm、monorepo、lint、库发布。
2. `gitnexus` —— 接手陌生仓库或改公共接口前先建索引，用 impact / trace 看清影响面与调用链。
3. `mattpocock-skills` —— 按 `setup-matt-pocock-skills` → `grill-with-docs` → `to-spec` → `to-tickets` → `implement` 推进；逐 ticket 实现时每次清空上下文，需要整包并行编排时改用 `implement-spec`。
4. 前端实现 —— 框架、构建、组件与样式按前端开发的流程执行。
5. `vitest` —— 为改动补单元/集成测试，处理 mock 与覆盖率。
6. `playwright-cli` —— 真浏览器 E2E、关键路径回归与响应式验证。
7. `open-code-review` 或 `open-code-review-delegate` —— 对 git diff 或 PR 做行级审查。
8. `mattpocock-skills` 的 `pr` —— 生成 PR 描述。

## 分支与替代

- 小改动：跳过第 1–3 步，直接实现 + `vitest` + 代码审查。
- 只想知道改动会波及什么：跳过其余步骤，直接用 `gitnexus` 的 impact / detect_changes。
- 只做审查：直接 `open-code-review` 或 `open-code-review-delegate`。
- 不知道从哪开始：用 `mattpocock-skills` 的 `ask-matt`，按当前处境推荐流程。
- 只做页面、组件与样式：直接用前端开发，不必走完整交付流程。
- 没有可用的 LLM endpoint 或合规限制：用 `open-code-review-delegate`，由宿主模型自己审查。
- 要 spec 感知审查：用 `mattpocock-skills` 的 `code-review`，与 OCR 二选一，避免重复评论。
- 需求本身不清楚：用 `mattpocock-skills` 的 `grilling` 做压力测试。
- 工作量超过一个会话：用 `wayfinder` 替代 `to-tickets`，把工作铺成决策地图。
- 问题在架构而不是实现：用 `codebase-design` 或 `improve-codebase-architecture`。
- 需要子 Agent 并行实现：必须使用独立 worktree，否则会互相覆盖。

## 注意事项

- 第一次使用前跑一次 `setup-matt-pocock-skills`。
- `gitnexus` 的索引是快照，改完代码先 `gitnexus analyze` 再查影响面，否则图结论会过期。
- `to-spec` 之前不要跳过澄清，否则拆出来的 ticket 是空的。
- `open-code-review` 与 `mattpocock-skills` 的 `code-review` 不要同时开。
- 前端框架约定、组件库与视觉打磨不在本场景展开，统一见前端开发。
- Playwright 首次使用先跑安装并装好浏览器。
