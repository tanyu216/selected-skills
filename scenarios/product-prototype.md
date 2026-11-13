---
title: 产品原型设计（网页设计）
skills: [finesse-term, brand, canvas-design, design, design-taste-frontend, interface-design, design-system, finesse-ui, prototype, grilling, playwright-cli]
---

# 产品原型设计（网页设计）

## 目标

一套可评审、可直接进入实现的设计交付物：视觉方向、三层 design token，以及关键状态的截图或交互说明。工程实现见前端开发。

## 推荐组合与顺序

1. `grilling` —— 需求、范围或设计目标不清时，先做压力测试。
2. `finesse-term` —— 用户描述含糊时，先把口语化说法翻译成准确术语和可执行需求。
3. `brand` —— 已有品牌规范或资产时，先取品牌语调、视觉识别与一致性约束。
4. `canvas-design` —— 需要海报、封面、活动视觉等静态视觉成品时，先定一套设计哲学再直出 PNG / PDF；网页与交互原型不走它。
5. `design-taste-frontend` 或 `interface-design` —— 按页面类型定视觉方向：营销页用前者，后台/仪表盘/SaaS 用后者，二选一。
6. `design-system` —— 把颜色、间距、字体收敛成三层 token 与组件规范。
7. `finesse-ui` —— 按既定方向把页面做到高完成度，覆盖视觉、无障碍与动效。
8. `prototype` —— 需要一次性验证交互或状态模型时，做可丢弃原型。
9. `playwright-cli` —— 关键状态截图与交互验证。

## 分支与替代

- 营销页、落地页或品牌站：以 `design-taste-frontend` 为主导。
- 后台、仪表盘或 SaaS 工具：以 `interface-design` 为主导。
- 只想修局部问题：直接从 `finesse-ui` 开始，不必重做设计方向。
- 品牌从零开始：先 `design` 产出 Logo / CIP，再进入 `brand` 与设计方向。
- 要海报、封面、活动视觉等静态成品：用 `canvas-design` 直接出 PNG / PDF；它的产出是视觉作品，不接着做网页规格或前端落地。
- 要一次性验证交互或状态模型：用 `prototype`。
- 要可点击原型或真实截图：用 `playwright-cli`。
- 组件与样式落地：交给前端开发（默认 `daisyui`）；本场景只交付设计规格与原型，不绑定技术栈。
- 用户说不清界面问题：先用 `finesse-term`；需求本身不清楚时用 `grilling`。
- 从设计进入实现：把 token、组件规范、页面方向、状态清单与截图交给前端开发。

## 注意事项

- 同一轮只选一个视觉主导：`design-taste-frontend` 或 `interface-design`；`finesse-ui` 只做落地与打磨，不改方向。
- `canvas-design` 只负责静态视觉成品（PNG / PDF），不产出可实现的界面规格；页面仍由 `finesse-ui` 与 `prototype` 负责。
- 不要覆盖既有设计 token；先确认 token 的语义层。
- `design-system` 产出的 token 是交给前端开发的契约；前端开发只消费，不重新设计。
- 无障碍与响应式的“要求”在本场景定义并审计；“实现”由前端开发完成。
- Playwright 首次使用先安装浏览器。
- 本仓库的 `figma` 条目只服务 HyperFrames 视频资产（见视频制作）；网页设计从 `finesse-ui` 开始。
