---
name: Open Code Review (Delegate)
category: engineering
source: https://github.com/alibaba/open-code-review
license: Apache-2.0
tags: [code-review, delegation, cli]
summary: OCR 委托模式：宿主 Agent 自己审查，OCR 只做文件选择与规则解析。
---

# Open Code Review (Delegate)

## 用途

把 OCR 从「调用外部 LLM」改成「由当前宿主 Agent 自己审查」：OCR 只负责确定性的文件选择与规则解析，推理和评论由宿主模型完成。

## 适用 / 不适用

- **适用**：已有强模型但不希望把代码发给第三方 endpoint；需要 OCR 的规则解析能力；离线或合规受限环境。
- **不适用**：希望完全托管、零配置的审查（用 `open-code-review`）。

## 典型场景

- **触发语句**：「用当前模型审这个 diff，规则沿用 ocr」「不要调用外部 LLM」。
- **要点**：先让 OCR 选出文件和规则，再按宿主模型的能力逐文件审查。

## 注意点

审查质量取决于宿主模型；规则解析结果仍来自 OCR，规则文件缺失时效果会下降。

## 来源

- 地址：https://github.com/alibaba/open-code-review/blob/HEAD/skills/open-code-review-delegate/SKILL.md
- 许可证：Apache-2.0
