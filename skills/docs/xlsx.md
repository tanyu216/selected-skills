---
name: XLSX
category: docs
source: https://github.com/anthropics/skills
license: source-available（专有；见 skills/xlsx/LICENSE.txt）
tags: [excel, spreadsheet, office]
summary: 创建、读取、编辑 Excel 工作簿与 CSV / TSV。
---

# XLSX

## 用途

当表格文件是主要输入或输出时使用：打开、读取、编辑和修复 .xlsx / .xlsm / .xltx / .csv / .tsv，加列、算公式、排版、图表、清洗脏数据，以及在表格格式之间转换。

## 适用 / 不适用

- **适用**：交付物必须是电子表格；需要公式、图表或多工作表；清洗不规范的行列。
- **不适用**：交付物是 Word / PDF / HTML 报告；纯数据库流水线。

## 典型场景

- **触发语句**：「把这个 CSV 清洗成规范的 xlsx」「加一列汇总公式并出图」。
- **要点**：先看表头和脏数据分布，再决定清洗策略；公式与值的写入方式不同。

## 注意点

该 skill 的许可为 Anthropic 专有条款，不是开源许可；.xlsm 宏文件编辑要保留 VBA 部分。

## 来源

- 地址：https://github.com/anthropics/skills/blob/HEAD/skills/xlsx/SKILL.md
- 许可证：source-available（专有；见 skills/xlsx/LICENSE.txt）
