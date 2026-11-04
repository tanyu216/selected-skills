---
title: 通用场景（文档处理、搜索）
skills: [pdf, docx, pptx, xlsx, tavily-search, tavily-research, tavily-list, tavily-entity, tavily-monitor, design-system, research, grilling]
---

# 通用场景（文档处理、搜索）

## 目标

交付一份可直接使用的办公文档，或一份带引用、可核对的调研结论。

## 推荐组合与顺序

1. `pdf` —— 读取、提取或 OCR 本地 PDF，先把已有材料变成可检索的文本。
2. `tavily-search` —— 补充外部事实、读取指定 URL，必要时遍历站点地图或抓取页面。
3. `tavily-research` —— 把多来源信息综合成带引用的调研报告。
4. `xlsx` —— 把表格结果落地，做清洗、公式与图表。
5. `docx` 或 `pptx` —— 按最终交付物选择 Word 文档或演示文稿。

## 分支与替代

- 需要候选清单或去重表：用 `tavily-list`，并在表里标明「搜索结果而非全集」。
- 已知公司、人物或组织，要补 CRM 字段或已有 CSV：用 `tavily-entity`。
- 周期性跟踪同一主题的变化：用 `tavily-monitor`，用 `max_age_hours` 控制间隔并保存基线。
- 要把调研落成仓库内的 Markdown 笔记：用 `mattpocock-skills` 的 `research`（见 WEB开发）。
- 要做 HTML 幻灯片：用 `design-system` 的幻灯片能力（见产品原型设计）。
- 纯数据分析或多维可视化：见数据分析场景；因子研究与回测见量化研究场景。
- 需求、范围或输出格式不清：用 `mattpocock-skills` 的 `grilling` 做压力测试（主流程见 WEB开发）。

## 注意事项

- 先读后写；没有读源就动笔，会产出无法核对的文档。
- Tavily 返回的是候选，不是全集；结论里写清检索范围与时间。
- 按最终交付物选格式，避免在 docx、pptx、xlsx 之间反复转换。
