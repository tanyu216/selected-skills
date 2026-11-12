---
title: 前端开发
skills: [finesse-term, grilling, design-taste-frontend, ui-ux-pro-max, design-system, interface-design, vue, nuxt, vite, daisyui, ui-styling, finesse-ui, impeccable, vitest, playwright-cli]
---

# 前端开发

## 目标

一个可交付的前端界面改动：按框架约定实现、组件与样式落地、视觉与可访问性打磨，并用真实浏览器验证。

## 推荐组合与顺序

1. `finesse-term` —— 需求是口语化描述时，先翻译成准确术语与可执行需求（布局、交互、状态、组件、动效）。
2. `grilling` —— 目标、范围或验收标准不清时，动手前做压力测试。
3. `design-taste-frontend` 或 `ui-ux-pro-max` —— 定美术与设计方向：构图、字体、配色、可检索的风格与色板。二选一，不要同时开。
4. `design-system` —— 把颜色、间距、字体收敛成三层 token 与组件规范；已有 token 时跳过。
5. `vue` 或 `nuxt` —— 按框架约定实现；Nuxt 额外处理 SSR、服务端路由与 `useFetch`。
6. `vite` —— 只在改构建配置、插件、SSR 或做 Vite 8 迁移时介入。
7. `daisyui` 或 `ui-styling` —— 组件与样式落地，按技术栈二选一。
8. `interface-design` —— 仪表盘、后台、SaaS 工具等产品型界面用它定布局层级与状态。
9. `finesse-ui` 或 `impeccable` —— 最后一公里打磨：层级、排版、配色、动效、UX 文案、无障碍、响应式与边界状态。
10. `vitest` —— 为组件与交互补单元/集成测试，处理 mock 与覆盖率。
11. `playwright-cli` —— 真浏览器 E2E、关键状态截图与响应式验证。

## 分支与替代

- React + shadcn/ui：用 `ui-styling`；Tailwind + daisyUI：用 `daisyui`；不要混用。
- 只定美术方向、不写实现：用 `design-taste-frontend`，产出一页方向说明即可。
- 只做视觉、无障碍或动效审查：用 `impeccable` 或 `finesse-ui`，不要重写整个页面。
- 品牌识别、Logo、CIP、海报与社交图：用 `design`（见产品原型设计）。
- 要一次性验证设计问题：用 `prototype`（见产品原型设计）。
- 从页面原型进入实现：先按产品原型设计定方向，再用本场景落地。
- 需要完整的 spec、tickets、PR 与代码审查流程：接开发。
- 组件拆分或模块边界拿不准：用 `codebase-design`（见开发）。
- 需求本身不清楚：用 `grilling` 做压力测试。

## 注意事项

- 同一轮只选一个视觉主导：`design-taste-frontend`、`ui-ux-pro-max`、`interface-design`、`impeccable` 不要互相覆盖。
- `daisyui` 与 `ui-styling` 的类名体系冲突，混用会让样式难以覆盖。
- daisyUI 5 依赖 Tailwind CSS 4；版本不匹配时类名会静默失效。
- `finesse-ui` / `impeccable` 是打磨阶段，不替代框架约定与设计系统。
- Playwright 首次使用先跑安装并装好浏览器。
