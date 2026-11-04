---
name: Video Downloader
category: creative
source: https://github.com/kangarooking/kangarooking-skills/tree/main/video-downloader
license: unknown（仓库无 LICENSE 文件）
tags: [video, transcription, download]
summary: 下载或打开多平台视频，并生成带时间戳的多模态转写稿。
---

# Video Downloader

## 用途

下载或打开视频，并恢复平台字幕、音频转写、关键帧、画面文字、视觉事实与剪辑观察，输出一份 `multimodal_transcript.md`。支持抖音、B 站、YouTube、小红书、实验性的微信视频号链接，以及本地视频文件。

## 适用 / 不适用

- **适用**：做视频分析前准备完整素材；需要带时间戳的转写；下游要做拆解或二次创作。
- **不适用**：直接剪辑（用 `video-use`）；从代码生成视频（用 `hyperframes` / `remotion`）。

## 典型场景

- **触发语句**：「把这个 B 站视频的文案和画面整理出来」「下载这个抖音视频并转写」。
- **要点**：先确认平台与链接可用性，再选字幕优先还是音频转写；保留时间戳便于后续定位。

## 注意点

- 仓库没有 LICENSE 文件，许可证为 `unknown`，默认按「保留所有权利」处理。
- 下载与转写需遵守平台条款与版权；微信视频号为实验性支持。
- 该仓库共 16 个 skill，本条目只收录 `video-downloader`。

## 来源

- 地址：https://github.com/kangarooking/kangarooking-skills/blob/HEAD/video-downloader/SKILL.md
- 许可证：unknown（仓库无 LICENSE 文件）
