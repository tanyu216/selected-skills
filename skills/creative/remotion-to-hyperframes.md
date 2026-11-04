---
name: Remotion to HyperFrames
category: creative
source: https://github.com/heygen-com/hyperframes
license: Apache-2.0
tags: [video, migration, remotion]
summary: 把 Remotion 等既有视频代码或素材迁移到 HyperFrames 并逐帧校验。
---

# Remotion to HyperFrames

## 用途

把已有视频代码或素材搬进 HyperFrames，并对照原片逐帧验证。Priority 是 Remotion，也支持 Motion Canvas、Lottie、Three.js、p5.js、canvas、纯 HTML/CSS 动画，以及 Manim、After Effects、Blender 的渲染结果。

## 适用 / 不适用

- **适用**：已有 Remotion 工程但想换到 HTML 渲染；需要复用旧素材；迁移后必须保持画面一致。
- **不适用**：从零做片（用 `hyperframes`）；不需要迁移、只想继续用 Remotion（用 `remotion`）。

## 典型场景

- **触发语句**：「把这个 Remotion composition 迁到 HyperFrames」「迁移后逐帧对一下」。
- **要点**：先建立原片基准帧，再迁移；每轮都做逐帧对比，不要只看首帧。

## 注意点

时间轴语义和单位（帧 / 秒）可能不同；动画库的缓动曲线需要重新映射。

## 来源

- 地址：https://github.com/heygen-com/hyperframes/blob/HEAD/skills/remotion-to-hyperframes/SKILL.md
- 许可证：Apache-2.0
