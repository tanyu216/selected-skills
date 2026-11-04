---
title: 视频制作
skills: [hyperframes, remotion, video-downloader, video-use, figma, media-use, frame-smith, hyperframes-cli, remotion-video-toolkit, remotion-to-hyperframes, manim-video, grilling]
---

# 视频制作

## 目标

一条可交付的成片或竖屏短视频；或剪辑、数学动画等分支产物。

## 推荐组合与顺序

1. 先选路线：`hyperframes` 适合文字片、宣传片、卡点与口播包装的单条视频；`remotion` 适合表格批量、多场景长片或实时换内容；已有素材走 `video-downloader` → `video-use`。
2. `video-downloader` —— 下载或打开源视频，并生成带时间戳的多模态转写。
3. `video-use` —— 对话式剪辑：剪切、调色、字幕与叠加动画。
4. `figma` —— 把 Figma 资源、品牌 token、组件与 storyboard 带进 HyperFrames。
5. `media-use` —— 获取或生成音乐、音效、图像、配音，并做调色与混音。
6. `frame-smith` —— 导演层：定 register、只选一个效果引擎、排 beat timeline、写 composition。
7. `hyperframes-cli` —— 脚手架、预览、渲染、发布与故障恢复；走 Remotion 路线时改用 `remotion-video-toolkit` 的规则与渲染方式。

## 分支与替代

- 按表格批量出片、多场景长片（每个画面是独立零件），或网页 / App 直播实时换内容：用 `remotion` + `remotion-video-toolkit`；`frame-smith` 仍可在 Remotion 运行时上工作。
- 数学、算法或公式解释：用 `manim-video`。
- 已有 Remotion 工程要迁到 HTML 渲染：用 `remotion-to-hyperframes`；只是想继续用 Remotion 出片则不必迁移。
- 只需要源视频或转写：用 `video-downloader`，先确认平台条款与版权。
- 只做已有素材的剪辑：用 `video-use`，不要引入生成运行时。
- 设计资产在 Figma：用 `figma`。
- 视频目标、受众或时长不清：用 `mattpocock-skills` 的 `grilling` 做压力测试（主流程见 WEB开发）。

## 注意事项

- `frame-smith` 需要 `hyperframes` 或 `remotion` 之一作为运行时，只装一个。
- 不要混用多个效果引擎；30fps 与 beat timeline 是硬约束。
- Remotion 使用自定义许可，不是 OSI 开源许可；商用前确认授权。
- 竖屏必须遵守抖音 / 小红书安全区。
