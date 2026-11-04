---
name: UI Styling
category: frontend
source: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
license: MIT
tags: [shadcn-ui, tailwind, accessibility]
summary: 用 shadcn/ui、Tailwind 与 canvas 构建可访问的响应式界面。
---

# UI Styling

## 用途

用 shadcn/ui（基于 Radix UI + Tailwind）实现界面：组件选型、响应式布局、主题与暗色模式、可访问的弹窗/下拉/表单/表格，以及 canvas 视觉设计。

## 适用 / 不适用

- **适用**：React 项目用 shadcn/ui；需要可访问的交互组件；需要 Tailwind 工具类实现响应式布局。
- **不适用**：用 daisyUI 的项目（用 `daisyui`）；只需要设计方向而不落地代码（用 `ui-ux-pro-max`）。

## 典型场景

- **触发语句**：「用 shadcn 搭一个设置页」「这个 Dialog 的焦点管理有问题」。
- **要点**：优先用现成组件的可访问行为，不要自己重写键盘与 ARIA。

## 注意点

shadcn/ui 是复制到项目里的源码而非 npm 依赖，升级要手动同步；Radix 组件的样式覆盖需从 token 入手。

## 来源

- 地址：https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/HEAD/.claude/skills/ui-styling/SKILL.md
- 许可证：MIT
