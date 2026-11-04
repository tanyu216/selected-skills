---
name: Video Use
category: creative
source: https://github.com/browser-use/video-use
license: MIT
tags: [video-editing, transcription, agent]
summary: 通过对话剪辑视频：转写、剪切、调色、字幕与叠加动画。
---

# Video Use

## 用途

用对话完成剪辑：转写、剪切、调色、生成叠加动画、烧录字幕。适用于口播、混剪、教程、旅行、访谈。没有预设和菜单，流程是提问、确认方案、执行、迭代、保存。

## 适用 / 不适用

- **适用**：已有素材需要剪辑；需要按转写内容定位剪切点；需要字幕与简单动效。
- **不适用**：从代码生成成片（用 `hyperframes` / `remotion`）；纯数学动画（用 `manim-video`）。

## 典型场景

- **触发语句**：「把这段访谈剪成 60 秒」「删掉所有口误并加字幕」。
- **要点**：先转写并确认剪辑方案，再执行；生产正确性规则是硬约束，其余留给创作自由。

## 注意点

依赖 ffmpeg 与 ElevenLabs 等外部工具/密钥，按仓库 `install.md` 安装；上游无 `skills/` 目录结构，根目录即 SKILL.md。

## 来源

- 地址：https://github.com/browser-use/video-use/blob/HEAD/SKILL.md
- 许可证：MIT
