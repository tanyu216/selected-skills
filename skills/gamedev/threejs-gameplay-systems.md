---
name: Three.js Gameplay Systems
category: gamedev
source: https://github.com/majidmanzarpour/threejs-game-skills
license: MIT
tags: [threejs, gamedev, gameplay]
summary: 搭建和迭代 Three.js 可玩系统：核心循环、关卡、输入、相机、碰撞与手感。
---

# Three.js Gameplay Systems

## 用途

从零或按迭代搭建可玩的 Three.js 系统：Vite/TypeScript/Three.js 脚手架、架构与设计简报、核心循环、关卡与遭遇设计、实体、输入、相机、碰撞与物理、计分、目标，以及 game feel。

## 适用 / 不适用

- **适用**：做第一个可玩切片；设计关卡、竞技场、赛道、波次或谜题；调战斗、难度与手感。
- **不适用**：只做画面升级（用 `threejs-aaa-graphics-builder`）；只做发布验证（用 `threejs-qa-release`）。

## 典型场景

- **触发语句**：「把这个 Three.js 原型做出核心玩法」「设计三关的节奏」。
- **要点**：先定核心循环与胜负条件，再接输入/相机/碰撞；每加一个系统都回看手感。

## 注意点

默认脚手架是 Vite + TypeScript；接入既有工程时先对齐目录与渲染循环，不要重复造入口。

## 来源

- 地址：https://github.com/majidmanzarpour/threejs-game-skills/blob/HEAD/skills/threejs-gameplay-systems/SKILL.md
- 许可证：MIT
