---
name: Three.js QA Release
category: gamedev
source: https://github.com/majidmanzarpour/threejs-game-skills
license: MIT
tags: [threejs, qa, release]
summary: Three.js 游戏的 QA、移动端适配、生产构建、静态托管与视觉回归。
---

# Three.js QA Release

## 用途

验证并发布 Three.js 浏览器游戏：试玩 QA、自动化机器人试玩、移动端与响应式检查、生产构建、静态托管 base path、调试开关、包体审查、截图、视觉回归基线、canvas 像素测量指标与发布风险报告。

## 适用 / 不适用

- **适用**：准备上线或交付前；需要移动端适配与性能检查；需要可重复的视觉回归。
- **不适用**：玩法与画面尚未成型（先做 gameplay / graphics）；非浏览器游戏。

## 典型场景

- **触发语句**：「这个游戏能发布了吗」「加一套视觉回归测试」。
- **要点**：先跑自动化试玩与移动端检查，再看构建与 base path；视觉基线要固定视口与设备像素比。

## 注意点

静态托管的 base path 配置错误是常见上线事故；调试开关必须在生产构建中关闭。

## 来源

- 地址：https://github.com/majidmanzarpour/threejs-game-skills/blob/HEAD/skills/threejs-qa-release/SKILL.md
- 许可证：MIT
