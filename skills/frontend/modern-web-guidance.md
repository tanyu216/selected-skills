---
name: Modern Web Guidance
category: frontend
source: https://github.com/GoogleChrome/modern-web-guidance-src
license: Apache-2.0
tags: [web-platform, best-practices, accessibility, performance, css]
summary: 可检索的现代 Web 平台指南：先查写法与 Baseline 回退，再写 HTML / CSS / 客户端 JS。
---

# Modern Web Guidance

## 用途

GoogleChrome 维护的现代 Web 平台最佳实践库。通过 `npx modern-web-guidance@latest search` / `retrieve` 按需取回针对性指南，覆盖 HTML / CSS / JavaScript、表单、无障碍、性能（LCP / INP / CLS）、安全（passkeys、Trusted Types、HTML sanitization）、PWA、内建 AI、Web Components 与 Temporal 等。目标是让 Agent 在动手前先查一遍，避开训练数据里的旧写法与多余依赖。

## 适用 / 不适用

- **适用**：写或改 HTML、CSS、客户端 JS（含 Vue / Nuxt / React 里的平台 API）；需要 Baseline 状态与轻量回退策略；要 CWV 或无障碍的具体现代实现；把旧代码现代化（`legacy-scan`）。
- **不适用**：后端、SQL / ORM / API routes；CI、Docker 与运维脚本；工具链与测试（Vite、tsconfig、ESLint、vitest）；纯视觉方向与品牌设计；中文术语对齐。

## 典型场景

- **触发语句**：「点背景能关闭的确认框怎么做」「下拉菜单贴边被裁了」「这个页面 INP 很差」「日期和时区老出错」。
- **要点**：先 `search`（2–5 词英文，只描述单一能力），命中后 `retrieve`；按指南标注的 Baseline 状态决定是否回退；适配框架时保留现代特性，不要为了类型声明删掉新属性。

## 注意点

- 运行依赖 Node ≥ 22 与联网；首次 `npx -y modern-web-guidance@latest` 会下载，离线时检索不可用。
- 只放行精确命令 `npx -y modern-web-guidance@latest *`，不要放行裸 `npx *`。
- 上游 description 要求所有 HTML / CSS / 客户端 JS 任务先执行，触发面很宽；与 `finesse-ui`、`interface-design` 同时启用时，由设计类 skill 定方向，本 skill 只管平台写法与兼容性。
- 项目已有组件库（如 daisyUI）时，组件选择服从项目约定；本 skill 用于平台行为、无障碍与回退细节，不强行替换组件库。
- 安装必须用发布仓库的 `SKILL.md`；源仓库同路径文件含 `SKILL_VERSION` 占位符，直接安装会失效。
- 源仓库的 `.agents/skills/` 是维护者工作流，不是分发给用户的 skill；同一发布仓库另含 `chrome-extensions`（Manifest V3），本目录未单独收录。

## 来源

- 地址：https://github.com/GoogleChrome/modern-web-guidance/blob/HEAD/skills/modern-web-guidance/SKILL.md
- 源仓库：https://github.com/GoogleChrome/modern-web-guidance-src
- 许可证：Apache-2.0
