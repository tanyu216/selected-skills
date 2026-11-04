---
name: Vue
category: frontend
source: https://github.com/antfu/skills
license: MIT
tags: [vue, frontend, composition-api]
summary: Vue 3 Composition API、script setup、响应式与内置组件的写法约定。
---

# Vue

## 用途

编写和修改 Vue 3 单文件组件时提供准确的 API 与惯用法：Composition API、`script setup` 宏、响应式系统，以及 Transition / Teleport / Suspense / KeepAlive 等内置组件。

## 适用 / 不适用

- **适用**：写或改 `.vue` 文件；使用 `defineProps` / `defineEmits` / `defineModel`；实现 `watch` / `watchEffect`；需要内置组件的边界行为。
- **不适用**：React、Svelte 等其他框架；只调构建配置（用 `vite`）；需要 store 设计（用 `pinia`）。

## 典型场景

- **触发语句**：「写一个支持 v-model 的组件」「这个 watch 为什么不触发」。
- **要点**：默认用 `script setup` + 类型化 props；先确认响应式丢失的层级，再改代码。

## 注意点

上游技能随 Vue 版本更新，遇到 3.5+ 的新 API 以官方文档为准。

## 来源

- 地址：https://github.com/antfu/skills/blob/HEAD/skills/vue/SKILL.md
- 许可证：MIT
