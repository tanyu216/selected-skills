---
name: Three.js Game Director
category: gamedev
source: https://github.com/majidmanzarpour/threejs-game-skills
license: MIT
tags: [threejs, gamedev, routing]
summary: Three.js 浏览器游戏的入口，把工作路由到玩法、美术、UI、资产、调试与发布。
---

# Three.js Game Director

## 用途

构建、升级与收尾 Three.js 浏览器游戏的总入口：判断当前处在哪个阶段，再把工作分派给同系列的 gameplay、graphics、UI、3D/图像/音频生成、调试与发布 skill。范围从小型街机原型到完整发行。

## 适用 / 不适用

- **适用**：任何「做一个 Three.js 游戏」的整包请求；不确定该先用哪个子 skill；多阶段项目需要串起来。
- **不适用**：Godot / Unity / Unreal 项目（用 `awesome-gamedev-agent-skills`）；只做单点优化（直接用对应专项）。

## 典型场景

- **触发语句**：「做一个 Three.js 游戏」「把这个原型升级到能发布」。
- **要点**：先说明目标范围与当前阶段，再让它路由；不要跳过它直接调子 skill。

## 注意点

它是编排层，不替代子 skill；同一项目里只让它担任一次主线编排。

## 来源

- 地址：https://github.com/majidmanzarpour/threejs-game-skills/blob/HEAD/skills/threejs-game-director/SKILL.md
- 许可证：MIT
