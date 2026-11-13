---
title: 游戏开发
skills: [router, game-jam, prototype-fast, game-ui-ux, threejs-gltf-loading, create-game-assets, canvas-design, threejs-game-director, threejs-gameplay-systems, threejs-aaa-graphics-builder, threejs-game-ui-designer, threejs-qa-release, vitest, grilling]
---

# 游戏开发

## 目标

一个可玩、可部署的浏览器游戏（默认 Three.js 路线），含核心循环、基础资产、HUD、QA 记录与生产构建。

## 推荐组合与顺序

1. `awesome-gamedev-agent-skills` 的 `router` —— 先按引擎与任务路由；确定走 Three.js 后继续下面几步。
2. `threejs-game-director` —— 定范围，并把玩法、美术、UI、资产与发布分派到同系列 skill。
3. `threejs-gameplay-systems` —— 核心循环、输入、相机、碰撞、计分与手感。
4. `threejs-aaa-graphics-builder` —— 核心循环可玩后，再升级材质、着色器、VFX、光照与 LOD。
5. `threejs-game-ui-designer` —— HUD 分区、菜单、覆盖层与界面状态清单。
6. `threejs-qa-release` —— 移动端与响应式检查、生产构建、静态托管与视觉回归。

## 分支与替代

- 用 Godot / Unity / Unreal / Phaser：走 `awesome-gamedev-agent-skills` 对应引擎组，不用 Three.js 系列。
- Game jam：用 `awesome-gamedev-agent-skills` 的 `game-jam` 或 `prototype-fast` 锁范围。
- 非 Three.js 引擎的 HUD 与菜单：用 `game-ui-ux` 或对应引擎的 UI 子 skill。
- 已有现成 GLB 资产：用 `threejs-gltf-loading` 直接加载，不必走生成。
- 需要生成 3D 资产：`threejs-3d-generator` 已从本目录移除（依赖付费 Tripo API）；回上游使用，或按 `create-game-assets` 规划后接外部生成服务。
- 需要封面、宣传海报或商店页主视觉：用 `canvas-design` 先定一套设计哲学，再直出 PNG / PDF；产出是静态视觉作品，不进入游戏内资产管线。
- 需要静态部署：按 `threejs-qa-release` 的生产构建与静态托管步骤处理。
- 需要单元测试：用 `vitest`（见开发）。
- 玩法、范围或目标平台不清：用 `mattpocock-skills` 的 `grilling` 做压力测试（主流程见开发）。

## 注意事项

- 先打开合集条目的子 skill 表，不要凭名字猜用途。
- 上游 Three.js 系列共 9 个 skill，本目录只保留 5 个代表条目；资产生成类不单独收录，需要时回上游查阅。
- `canvas-design` 只负责封面、海报与主视觉这类静态视觉成品；游戏内 HUD、菜单与图标仍走 `threejs-game-ui-designer` 与 `create-game-assets`。
- 不要混用 Three.js 与 Godot / Unity 的资产管线。
- WebGL 移动端先定性能预算，再决定是否上后处理。
