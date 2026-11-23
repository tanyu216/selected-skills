---
name: pixelfx
category: gamedev
source: https://github.com/patch-gg/pixelfx
license: MIT
tags: [pixel-art, vfx, sprite-sheets, gamedev]
summary: 用代码生成像素风特效与精灵动画：244 个现成效果，可接入浏览器游戏或导出精灵表给任意引擎。
---

# pixelfx

## 用途

像素风特效与精灵动画的代码库与制作流程。上游共 244 个现成效果，按火焰、爆炸、水、冰、闪电、科幻、近战、命中、投射物、生成与死亡、奥术、神圣、暗影、状态、自然、天气、UI、拾取、转场、小生物分类，另有 12 个由特效串成的完整招式。每个效果是一个画进 color / light 双缓冲的 JS 文件，没有图片依赖，所以能实时播放、换色、镜像、换种子，也能渲染成精灵表给任意引擎。

skill 负责四件事：先在库里搜现有效果并调参（`palette`、`seed`、`flip`、`angle`、`light` 及各自旋钮）；接进浏览器游戏或导出精灵表；为带角色的效果补 `act`（蓄力、命中顿帧、受击与恢复）；用「草稿 → 渲染 → 看图 → 精修」循环制作库里没有的新效果。

## 适用 / 不适用

- **适用**：2D 像素风游戏的攻击命中、法术、天气、UI 反馈、拾取与转场等 VFX；需要把特效导出成 Aseprite 风格精灵表给 Godot、Unity、GameMaker、Defold、LÖVE、Bevy、Phaser；想补齐蓄力、命中顿帧与受击反应这类手感；想要一套能改代码、能换色的效果而不是固定素材。
- **不适用**：3D 特效、材质、着色器与后处理（用 `threejs-aaa-graphics-builder`）；非像素风的高精度视觉资产；需要现成图片 / 视频素材而非代码生成时。

## 典型场景

- **触发语句**：「给法师的终极技能加一个霜冻新星」「金币拾取闪光做五个版本，挑最好的两个给我看」「把火焰和爆炸两类导出成精灵表给 Godot」「这个受击特效太飘了，做扎实一点」。
- **要点**：先用 `node tools/list.mjs <关键词>` 搜现有效果，渲染 `contact.png` 看过再决定是调参、接入还是新做；新做时至少三轮「渲染 → 看 contact sheet / `--mp4` → 修最差的一处」，并从最接近的现有效果里借技法。

## 注意点

- 需要在 pixelfx 仓库副本里工作（`tools/` 是 Node 脚本）；Node 18+，ffmpeg 可选（GIF / MP4 预览）。没有需要全局安装的 CLI。
- 浏览器游戏直接引用 `src/core` 与所需效果文件（无第三方依赖），或 `npm i github:patch-gg/pixelfx`；非 JS 引擎走 `--sheet` 导出的透明 PNG + Aseprite 风格 JSON，用最近邻过滤、不压缩，按 `meta.pixelfx.fps` 播放，并把 pivot 设到 `meta.pixelfx.pivot`。
- 带角色的效果带 `act` 时序（`windup`、`hits[].t` / `freeze`、`poses`）；换成游戏自己的角色时必须按这些数据自己起手、命中顿帧与恢复，否则命中会脱节。
- 效果单独播放像贴纸，命中要有身体：没有角色时也要在目标侧做受击与镜头抖动。
- 代码与效果是 MIT，可商用；`gallery/fonts` 里的 Patch Pixel 字体不在此许可内。
- 不要重绘具体游戏的精灵、角色或 logo。

## 来源

- 地址：https://github.com/patch-gg/pixelfx/blob/HEAD/skills/pixelfx/SKILL.md
- 许可证：MIT
- 安装：`/plugin marketplace add patch-gg/pixelfx`，或复制 `skills/pixelfx` 到 `~/.claude/skills/`
