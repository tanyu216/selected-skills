---
name: Vite
category: engineering
source: https://github.com/antfu/skills
license: MIT
tags: [vite, build, bundler]
summary: Vite 配置、插件 API、SSR 与 Vite 8 Rolldown 迁移。
---

# Vite

## 用途

处理 Vite 项目与构建链：`vite.config.ts`、插件 API、库模式、SSR，以及 Vite 8 向 Rolldown 的迁移差异。

## 适用 / 不适用

- **适用**：配置或调试 Vite；写 Vite 插件；用 Vite 构建库或 SSR 应用；升级到 Vite 8。
- **不适用**：Webpack / Rspack 项目；只写业务代码且不碰构建配置。

## 典型场景

- **触发语句**：「这个插件在 build 时不生效」「从 Vite 7 升到 8 要改什么」。
- **要点**：先区分 dev 与 build 两条链路，再定位是插件 hook、SSR external 还是产物格式问题。

## 注意点

Vite 8 的 Rolldown 迁移会改变部分插件行为；升级前先读上游迁移说明，不要照搬旧配置。

## 来源

- 地址：https://github.com/antfu/skills/blob/HEAD/skills/vite/SKILL.md
- 许可证：MIT
