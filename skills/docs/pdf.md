---
name: PDF
category: docs
source: https://github.com/anthropics/skills
license: source-available（专有；见 skills/pdf/LICENSE.txt）
tags: [pdf, document, ocr]
summary: PDF 读取、合并拆分、表单、加密、水印与扫描件 OCR。
---

# PDF

## 用途

处理 PDF 的全套操作：提取文本与表格、合并、拆分、旋转、加水印、新建、填表、加解密、抽图，以及对扫描件做 OCR 使其可检索。

## 适用 / 不适用

- **适用**：需要读取或改写 PDF；处理表单与加密；把扫描件变成可搜索文本。
- **不适用**：需要可编辑的 Word 交付（用 `docx`）；表格计算（用 `xlsx`）。

## 典型场景

- **触发语句**：「把这两个 PDF 合并」「这个扫描件能搜吗」「填一下这份表单」。
- **要点**：先判断是文本型还是扫描型 PDF，再决定直接抽取还是走 OCR。

## 注意点

该 skill 的许可为 Anthropic 专有条款，不是开源许可；OCR 质量依赖扫描分辨率。

## 来源

- 地址：https://github.com/anthropics/skills/blob/HEAD/skills/pdf/SKILL.md
- 许可证：source-available（专有；见 skills/pdf/LICENSE.txt）
