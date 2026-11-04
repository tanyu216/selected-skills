---
name: DOCX
category: docs
source: https://github.com/anthropics/skills
license: source-available（专有；见 skills/docx/LICENSE.txt）
tags: [word, document, office]
summary: 创建、读取、编辑 Word 文档与 .dotx 模板。
---

# DOCX

## 用途

处理 Word 文档与模板：新建 .docx / .dotx，读取与重组内容，编辑既有文档，生成带目录、标题、页码、表格与信头的正式文档。

## 适用 / 不适用

- **适用**：交付 Word 格式的报告、备忘录、信函、模板；需要保留样式与目录结构；从现有文档抽取并重组内容。
- **不适用**：PDF（用 `pdf`）；表格数据为主的交付（用 `xlsx`）；Google Docs。

## 典型场景

- **触发语句**：「把这份内容做成 Word 报告」「改一下这个 .docx 的页眉和目录」。
- **要点**：先确认交付物是 .docx 而不是 PDF；批量替换用脚本而不是逐段手改。

## 注意点

该 skill 的许可为 Anthropic 专有条款，不是开源许可；分发前先看 `LICENSE.txt`。

## 来源

- 地址：https://github.com/anthropics/skills/blob/HEAD/skills/docx/SKILL.md
- 许可证：source-available（专有；见 skills/docx/LICENSE.txt）
