---
name: Manim Video
category: creative
source: https://github.com/browser-use/video-use
license: MIT
tags: [animation, math, manim]
summary: 用 Manim CE 制作 3Blue1Brown 风格的数学与技术动画。
---

# Manim Video

## 用途

用 Manim Community Edition 做数学与技术动画：3Blue1Brown 风格讲解、算法可视化、公式推导、架构图与数据故事。

## 适用 / 不适用

- **适用**：需要精确的数学/算法动画；需要用代码控制每个元素；技术讲解视频。
- **不适用**：营销片与动效包装（用 `hyperframes` / `frame-smith`）；已有素材的剪辑（用 `video-use`）。

## 典型场景

- **触发语句**：「做一个解释快速排序的动画」「把这个公式推导做成视频」。
- **要点**：先写分镜与数学步骤，再写 Scene；渲染时间长，先用低质量预览。

## 注意点

Manim CE 与旧版 ManimGL API 不同；渲染依赖 LaTeX 与 ffmpeg，环境较重。

## 来源

- 地址：https://github.com/browser-use/video-use/blob/HEAD/skills/manim-video/SKILL.md
- 许可证：MIT
