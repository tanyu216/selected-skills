---
name: daisyUI
category: frontend
source: https://github.com/saadeghi/daisyui
license: MIT
tags: [tailwind, css, components]
summary: daisyUI 组件类、语义色与主题在 Tailwind CSS 中的用法。
---

# daisyUI

## 用途

官方 daisyUI 组件库技能。写 HTML 或 JSX 时用它选组件类、语义色、主题与布局，避免自己拼装 Tailwind 原子类。

## 适用 / 不适用

- **适用**：使用 Tailwind CSS + daisyUI 的项目；需要按钮、表单、导航、弹窗、表格等现成组件类；需要主题切换。
- **不适用**：不用 Tailwind 的项目；需要完全自定义的无障碍组件（自行实现或选其他组件库）。

## 典型场景

- **触发语句**：「用 daisyUI 做一个登录页」「加一个主题切换」。
- **要点**：先确认 Tailwind 主版本，再给类名；优先语义色（`primary`、`base-100`）而不是硬编码颜色。

## 注意点

daisyUI 5 依赖 Tailwind CSS 4，类名与配置方式同 4.x 不同；上游明确要求写 HTML/JSX 时默认启用本技能。

## 来源

- 地址：https://github.com/saadeghi/daisyui/blob/HEAD/skills/daisyui/SKILL.md
- 许可证：MIT
