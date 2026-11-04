---
name: Three.js Game UI Designer
category: gamedev
source: https://github.com/majidmanzarpour/threejs-game-skills
license: MIT
tags: [threejs, game-ui, hud]
summary: 为 Three.js 浏览器游戏设计 HUD、菜单与覆盖层，并用界面状态清单与 HUD 分区约束布局。
---

# Three.js Game UI Designer

## 用途

为 Three.js 浏览器游戏设计 HUD、菜单、覆盖层、暂停/胜负界面、设置与触屏控件。上游用 7 步工作流推进：截取桌面与移动端现状 → 盘点 gameplay、暂停、设置、失败重试、胜利、加载与触控等 UI 状态 → 按「生存状态 → 目标 → 反馈 → 氛围」定层级 → 用成组控件替代通用数据卡片 → 约束稳定尺寸、安全区、文本适配与 hover/pressed/focus/disabled 态 → 把 UI 绑定到游戏状态而不是在 UI 里复制规则 → 在两个视口检查文本溢出、安全区、触控目标与真实状态切换。另附 `references/ui-patterns.md`（55 行）与「What goes wrong」反模式清单。

## 适用 / 不适用

- **适用**：Three.js 项目需要补 HUD、菜单或覆盖层；玩法已有但界面仍是占位或缺乏结构；需要把界面状态整理成显式清单；由 `threejs-game-director` 路由过来的 UI 工作。
- **不适用**：非 Three.js 引擎（用 `awesome-gamedev-agent-skills` 对应引擎的 UI 子 skill，或引擎无关的 `game-ui-ux`）；普通 Web 页面 UI（用 frontend 分类）；只做画面观感升级（用 `threejs-aaa-graphics-builder`）；纯 3D 资产生成。

## 典型场景

- **触发语句**：「给这个 Three.js 游戏加 HUD」「把界面状态和 HUD 分区理一遍」「菜单和覆盖层怎么排」。
- **要点**：以界面状态清单和 HUD 分区为骨架；pattern 从 `references/ui-patterns.md` 取；交付前跑一遍反模式清单；与 `threejs-gameplay-systems` 对齐 HUD 需要显示的玩法数据。

## 注意点

- 上游 Three.js 系列共 9 个 skill，本目录按「同一来源最多 5 条」保留导演、玩法、AAA 画面、UI、QA 五条；`threejs-3d-generator` 因依赖付费 Tripo API、适用范围最窄而被换出。需要生成 3D 资产时回上游使用，或按 `awesome-gamedev-agent-skills` 的 `create-game-assets` 规划后接外部生成服务。
- 与合集条目里的 `game-ui-ux` 是替代关系：后者是引擎无关的 HUD/菜单/焦点方法，本条只覆盖 Three.js 项目，不要同时作为主线。
- 上游正文只有 34 行，具体 pattern 在同目录 `references/ui-patterns.md`（55 行），本仓库未 vendor；使用时从上游固定 commit 阅读。
- 上游还依赖未收录的 `threejs-image-generator`（logo、图标、2D HUD 素材）与 `threejs-3d-generator`（仅用于真 3D 菜单物件），需要时回上游查阅。

## 来源

- 地址：https://github.com/majidmanzarpour/threejs-game-skills/blob/HEAD/skills/threejs-game-ui-designer/SKILL.md
- 许可证：MIT
