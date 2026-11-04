---
name: Remotion (Framework)
category: creative
source: https://github.com/remotion-dev/remotion
license: Remotion License（自定义，非 OSI）
tags: [video, react, framework]
summary: 用 React 以代码制作视频的框架；适合表格批量、多场景长片与实时换内容的直播。
---

# Remotion (Framework)

## 用途

Remotion 是「用 React 写视频」的框架：composition、帧驱动动画、参数化渲染，通过 CLI / Node.js / Lambda / Cloud Run 出片。它本身不是 skill 集合；仓库里的 90 多个 SKILL.md 是维护者内部的贡献工作流，不面向使用者。

它擅长需要工程化扩展的成片形态，与 `hyperframes` 是不同场景的分工，不是替换关系。

## 适用 / 不适用

- **适用**：按表格批量视频（同一个模板换数据、一次出多个视频）；多场景长片（每个画面是单独的零件，各改各的）；用户在网页或 App 上直播，还能实时换内容；需要 React 组件级的视频控制；把现有 Web 组件直接变成视频。
- **不适用**：只有文字、缺素材的单条宣传片 / 音乐卡点 / 口播字幕包装（用 `hyperframes` 更省事）；不想引入 React 工程（用 `hyperframes` 的 HTML 路线）；只想做剪辑（用 `video-use`）；数学解释动画（用 `manim-video`）。

## 典型场景

- **触发语句**：「按这张表批量出视频」「多场景长片，每个画面单独改」「网页 / App 直播里实时换内容」「用 React 做一个可参数化的视频模板」。
- **要点**：先跑 `npx create-video@latest` 起项目，再装 `frame-smith` 或 `remotion-video-toolkit` 作为导演/工具层。判断是否该用它，看成片是否需要批量、多零件并行修改或运行时换内容。

## 注意点

- 许可证是自定义的 Remotion License，不是 OSI 开源许可；公司规模超过阈值需要商业授权。
- 仓库内 `.agents/skills/` 的 skill 不要当作用户技能安装。
- `frame-smith` 依赖它作为运行时之一，二者只需装一个；选哪个运行时按场景，不按「谁替代谁」。

## 来源

- 地址：https://github.com/remotion-dev/remotion
- 许可证：Remotion License（自定义，非 OSI）
- 安装：`npx create-video@latest`
