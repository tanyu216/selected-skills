---
name: Design System
category: frontend
source: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
license: MIT
tags: [design-tokens, design-system, slides]
summary: 三层 design token、组件规范与品牌一致性的系统化设计。
---

# Design System

## 用途

搭建设计系统：三层 token（primitive → semantic → component）、CSS 变量、间距与字体比例、组件规格，以及符合品牌规范的演示文稿。

## 适用 / 不适用

- **适用**：项目需要统一的设计 token 与主题；组件库要写规范；多产品要共享视觉语言。
- **不适用**：一次性页面（直接用 `ui-ux-pro-max`）；只需要组件实现（用 `ui-styling`）。

## 典型场景

- **触发语句**：「给这个项目定一套颜色和间距 token」「把散落的颜色收进语义变量」。
- **要点**：先建 primitive 层，再映射 semantic 层，最后才落到组件层；不要跳过中间层。

## 注意点

三层 token 的命名一旦发布就应保持稳定，改语义层比改组件层代价低。

## 来源

- 地址：https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/HEAD/.claude/skills/design-system/SKILL.md
- 许可证：MIT
