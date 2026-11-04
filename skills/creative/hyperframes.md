---
name: HyperFrames
category: creative
source: https://github.com/heygen-com/hyperframes
license: Apache-2.0
tags: [video, html, rendering]
summary: 用 HTML 渲染视频的 HyperFrames 入口；适合缺素材的文字片、宣传片、音乐卡点与口播包装。
---

# HyperFrames

## 用途

用 HyperFrames 制作、编辑、加动效和渲染视频：发布片、讲解片、音乐视频、图表、地图、竖屏短片、标题卡、字幕与叠加。它持有渲染契约、工作循环，以及每类视频各自的必备要素。

它擅长「以文字和现成特效块为主、缺少实拍素材」的成片，与 `remotion` 是不同场景的分工，不是替换关系。

## 适用 / 不适用

- **适用**：只有文字内容、缺少素材的需求；产品宣传片；音乐卡点；给口播视频加字幕和包装（调色 + 特效）；直接调用现成特效块（数字滚动、社交卡片、地图导航等）；用 HTML / CSS / JS 直接产出视频；需要精确控制帧与时间轴。
- **不适用**：按表格批量视频（同一模板换数据、一次出多条，用 `remotion`）；多场景长片、每个画面是独立零件各改各的（用 `remotion`）；在网页或 App 内直播并实时换内容（用 `remotion`）；纯剪辑（用 `video-use`）。

## 典型场景

- **触发语句**：「用 HTML 做一个 15 秒成片」「把这份数据渲染成动态图表视频」「给这条口播加字幕和包装」「用数字滚动 / 社交卡片 / 地图导航特效」。
- **要点**：先读渲染契约，再定工程结构与视频类型；每类视频的必备要素不同。判断是否该用它，看成片是「单条包装」还是「批量 / 多场景 / 实时」。

## 注意点

这是入口 skill；具体脚手架与渲染用 `hyperframes-cli`，素材用 `media-use`，设计资产用 `figma`，旧工程迁移用 `remotion-to-hyperframes`。

不要因为「已有 Remotion 工程」才选它；选型看场景：单条文字片 / 宣传片 / 卡点 / 口播包装选 HyperFrames，批量出片 / 多场景长片 / 直播实时换内容选 Remotion。

## 来源

- 地址：https://github.com/heygen-com/hyperframes/blob/HEAD/skills/hyperframes/SKILL.md
- 许可证：Apache-2.0
