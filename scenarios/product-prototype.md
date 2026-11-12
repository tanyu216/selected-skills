---
title: 产品原型设计（网页设计）
skills: [finesse-term, brand, design, design-taste-frontend, ui-ux-pro-max, design-system, interface-design, finesse-ui, impeccable, playwright-cli, daisyui, ui-styling, prototype, grilling]
---

# 产品原型设计（网页设计）

## 目标

一套可评审、可交付实现的页面原型：视觉方向、三层 design token，以及关键状态的截图或说明。

## 推荐组合与顺序

1. `finesse-term` —— 用户描述含糊时，先把口语化说法翻译成准确术语和可执行需求。
2. `brand` —— 已有品牌规范或资产时，先取品牌语调、视觉识别与一致性约束。
3. `design` —— 原型需要 Logo、CIP、图标、海报或社交图时，先生产品牌物料。
4. `design-taste-frontend` —— 定美术方向：构图、字体、配色与反模板化规则。
5. `ui-ux-pro-max` —— 设计主导：信息架构、组件方向、无障碍与响应式检查。
6. `design-system` —— 把颜色、间距、字体收敛成三层 token 与组件规范。
7. `finesse-ui` —— 按既定方向把页面做到高完成度，覆盖视觉、无障碍与动效。
8. `impeccable` —— 最后一轮 critique：边界状态、动效、无障碍与简化打磨。

## 分支与替代

- 后台、仪表盘或 SaaS 工具：以 `interface-design` 为主导，`design-taste-frontend` 只做局部参考。
- 只想修局部问题：直接从 `impeccable` 开始，不必重做设计方向。
- 品牌从零开始：先 `design` 产出 Logo / CIP，再进入 `brand` 与设计方向。
- 要一次性验证设计问题：用 `mattpocock-skills` 的 `prototype`（见开发）。
- 要可点击原型或真实截图：用 `playwright-cli`（见前端开发）。
- 组件与样式落地：用 `daisyui` 或 `ui-styling`（见前端开发）。
- 用户说不清界面问题：先用 `finesse-term` 或 `finesse-ui` 把描述转成可执行需求。
- 需求、范围或设计目标不清：用 `mattpocock-skills` 的 `grilling` 做压力测试（主流程见开发）。

## 注意事项

- `design-taste-frontend`、`ui-ux-pro-max`、`interface-design`、`impeccable` 都能当视觉主导；同一轮只选一个 lead，其余只做检查。
- 不要覆盖既有设计 token；先确认 token 的语义层。
- daisyUI 5 依赖 Tailwind CSS 4；版本不匹配时类名会静默失效。
- Playwright 首次使用先安装浏览器。
- 本仓库的 `figma` 条目只服务 HyperFrames 视频资产（见视频制作）；网页实现仍从 `finesse-ui` 开始。
