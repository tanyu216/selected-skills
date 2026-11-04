---
name: Nuxt
category: frontend
source: https://github.com/antfu/skills
license: MIT
tags: [nuxt, vue, fullstack]
summary: Nuxt 全栈框架的 SSR、自动导入、文件路由与服务端路由用法。
---

# Nuxt

## 用途

在 Nuxt 应用里写页面、服务端路由与数据获取：SSR / 混合渲染、自动导入、基于文件的路由、`useFetch`、middleware 等。

## 适用 / 不适用

- **适用**：Nuxt 项目的页面与服务端逻辑；需要在 SSR、CSR、预渲染之间做取舍；使用 Nuxt 约定目录与自动导入。
- **不适用**：纯 Vue SPA（用 `vue`）；只需要构建工具本身（用 `vite`）。

## 典型场景

- **触发语句**：「这个页面为什么首屏没数据」「加一个服务端 API 路由」。
- **要点**：先判断渲染模式，再决定用 `useFetch`、`useAsyncData` 还是 server route。

## 注意点

Nuxt 的大版本差异明显（3 → 4），回答具体 API 前确认项目版本。

## 来源

- 地址：https://github.com/antfu/skills/blob/HEAD/skills/nuxt/SKILL.md
- 许可证：MIT
