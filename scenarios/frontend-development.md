---
title: 前端开发
skills: [modern-web-guidance, vue, nuxt, vite, daisyui, finesse-ui, vitest, playwright-cli]
---

# 前端开发

## 目标

一个可构建、可测试、可交付的前端实现：按产品原型设计的设计交付物落地框架、组件与样式，并完成单元与 E2E 验证。

## 设计输入

本场景不重新做视觉或交互决策。开始前先拿到产品原型设计的交付物：视觉方向、三层 design token、组件规范、关键状态清单与截图。实现中遇到视觉、交互或 token 变更，回到产品原型设计更新规格后再继续。

## 推荐组合与顺序

1. 读取设计交付物 —— token、组件规范、页面方向、状态清单与截图；缺规格时先回产品原型设计。
2. `modern-web-guidance` —— 写任何 HTML、CSS 或客户端 JS 前先 `search` / `retrieve`，拿到平台写法、Baseline 状态与回退策略；组件库已有约定时以项目约定为准。
3. `vue` 或 `nuxt` —— 按框架约定实现；Nuxt 额外处理 SSR、服务端路由与 `useFetch`。
4. `vite` —— 只在改构建配置、插件、SSR 或做 Vite 8 迁移时介入。
5. `daisyui` —— 组件与样式落地，优先语义色与既有 token；不要自行引入第二套组件库。
6. `finesse-ui` —— 在既有设计方向与 token 下做成品打磨：排版、间距、状态与动效细节，并按需跑视觉、无障碍与动效审计；不重定视觉方向。
7. `vitest` —— 为组件与交互补单元/集成测试，处理 mock 与覆盖率。
8. `playwright-cli` —— 真浏览器 E2E、关键路径回归与响应式验证。

## 分支与替代

- 只做组件与样式落地：直接用 `daisyui`，但仍以设计 token 为准。
- 只做平台 API、兼容性、CWV 或无障碍实现问题：直接用 `modern-web-guidance`，不必走完整前端流程。
- 从页面原型进入实现：先按产品原型设计定方向与 token，再用本场景落地。
- 交付前的成品打磨、视觉 / 无障碍 / 动效审查：用 `finesse-ui`，但方向与 token 变更仍回产品原型设计更新规格。
- 需求、范围或验收标准不清：用 `grilling`（见开发）。
- 需要完整的 spec、tickets、PR 与代码审查流程：接开发。
- 组件拆分或模块边界拿不准：用 `codebase-design`（见开发）。
- 需要子 Agent 并行实现：必须使用独立 worktree，否则会互相覆盖。

## 注意事项

- 本场景不包含视觉方向与 token 设计；这两项统一见产品原型设计。交付前的成品打磨与审查由 `finesse-ui` 承担，方向或 token 需要变更时仍回产品原型设计。
- daisyUI 5 依赖 Tailwind CSS 4；版本不匹配时类名会静默失效。
- 组件选择服从项目约定（如 daisyUI）；`modern-web-guidance` 只补平台行为、无障碍与回退细节，不替换组件库。
- `modern-web-guidance` 的触发面很宽；与设计类 skill 同时启用时，由设计侧定方向，它只管平台写法与兼容性。
- 设计 token 是契约；不要在前端开发里新增语义色或改 token 命名。
- 无障碍：设计侧定义要求，本场景负责语义 HTML、键盘、焦点与 ARIA 实现。
- 响应式：设计侧定义断点与布局行为，本场景负责实现。
- Playwright 首次使用先跑安装并装好浏览器。
