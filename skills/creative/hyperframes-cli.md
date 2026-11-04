---
name: HyperFrames CLI
category: creative
source: https://github.com/heygen-com/hyperframes
license: Apache-2.0
tags: [video, cli, rendering]
summary: HyperFrames 的命令行工作流：脚手架、检查、预览、渲染、发布与故障恢复。
---

# HyperFrames CLI

## 用途

按任务驱动 HyperFrames 工程：脚手架、检查、逐帧查看、编辑时间轴、预览、本地或云端渲染、发布、查看工程历史，以及读取 CLI 的 JSON 输出、从构建或渲染失败中恢复。

## 适用 / 不适用

- **适用**：需要真正跑起 HyperFrames 工程；排查渲染失败；接 CI 做自动化渲染与发布。
- **不适用**：只需要视频创意与时间轴设计（用 `hyperframes` 与 `frame-smith`）。

## 典型场景

- **触发语句**：「渲染这个 HyperFrames 工程」「这个 render 报错了」。
- **要点**：先看 JSON 输出里的错误阶段，再决定重试、清理缓存还是改工程。

## 注意点

云端渲染与本地渲染的失败模式不同；发布前确认目标平台与权限。

## 来源

- 地址：https://github.com/heygen-com/hyperframes/blob/HEAD/skills/hyperframes-cli/SKILL.md
- 许可证：Apache-2.0
