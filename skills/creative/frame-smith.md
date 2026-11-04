---
name: Frame Smith
category: creative
source: https://github.com/mouse-lin/frame-smith
license: MIT
tags: [video, motion, remotion]
summary: 以 Remotion 或 HyperFrames 为运行时的宣传片与竖屏短视频导演 skill。
---

# Frame Smith

## 用途

做「不廉价」的动效成片：读 brief、定 register（横屏电影感 / 竖屏短视频）、挑一个做到 100% 的效果引擎、排 beat timeline、写 `.tsx` 合成并注册到 Remotion Root。覆盖 3D 海报立方体、胶囊主题翻转、架构数据脉冲、粒子相册，以及抖音 / 小红书 / 视频号的竖屏短片。

## 适用 / 不适用

- **适用**：产品宣传片、片头动画、动效包装、竖屏短视频；需要一个「导演」来统一视觉与节奏。
- **不适用**：纯剪辑已有素材（用 `video-use`）；数学解释动画（用 `manim-video`）；没有 Remotion / HyperFrames 运行时。

## 典型场景

- **触发语句**：「做个产品宣传片」「把这个页面做成 30 秒视频」「竖屏抖音片头」。
- **要点**：先确认 register 和时长，再选且只选一个效果引擎；30fps 与 beat timeline 是硬约束。

## 注意点

- 它是导演，不是渲染器：必须先装 `hyperframes` 或 `remotion` 之一。运行时按成片形态选：文字片 / 宣传片 / 卡点 / 口播包装走 `hyperframes`，批量出片 / 多场景长片 / 直播实时换内容走 `remotion`。
- 自带 motion craft 下限与反 slop 黑名单；不要同时上多个效果引擎。
- 竖屏要遵守抖音 / 小红书安全区。

## 来源

- 地址：https://github.com/mouse-lin/frame-smith/blob/HEAD/skills/frame-smith/SKILL.md
- 许可证：MIT
