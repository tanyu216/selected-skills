---
name: Playwright CLI
category: engineering
source: https://github.com/microsoft/playwright-cli
license: Apache-2.0
tags: [browser-automation, testing, cli]
summary: 用 playwright-cli 做浏览器自动化、网页测试与 Playwright 测试。
---

# Playwright CLI

## 用途

CLI 工具附带的内置 skill：用 `playwright-cli` 驱动浏览器、检查页面、跑 Playwright 测试，并把操作与断言落成可复用的测试代码。

## 适用 / 不适用

- **适用**：需要真实浏览器验证页面与交互；写或调 Playwright 测试；抓取渲染后的页面状态与截图。
- **不适用**：纯 HTTP 接口测试；只需要单元测试（用 `vitest`）。

## 典型场景

- **触发语句**：「打开这个页面点一遍并截图」「把这个流程写成 Playwright 测试」。
- **要点**：先用 CLI 探索选择器与状态，再固化到测试文件；优先 role / label 选择器。

## 注意点

- 条目类型是「CLI + 内置 skill」，不是纯 skill 文件。
- 安装：`npm install -g @playwright/cli@latest`，然后 `playwright-cli install --skills`。
- 浏览器二进制需另行安装、体积较大。

## 来源

- 地址：https://github.com/microsoft/playwright-cli/blob/HEAD/skills/playwright-cli/SKILL.md
- 许可证：Apache-2.0
