---
name: Statistical Analysis (K-Dense)
category: data
source: https://github.com/K-Dense-AI/scientific-agent-skills/blob/HEAD/skills/statistical-analysis/SKILL.md
license: MIT
tags: [statistics, hypothesis-testing, effect-size, apa]
summary: 统计检验选择、假设检查、效应量、功效与 APA 风格报告。
---

# Statistical Analysis (K-Dense)

## 用途

需要比较组间差异、检验假设、分析实验或问卷数据、检查统计假设、计算样本量，或把结果写成统计结论时使用。SKILL 覆盖 t 检验、ANOVA、卡方、相关、回归、非参数与贝叶斯方法，强调先定义 estimand 与抽样单位，再做假设诊断，最后报告效应量与不确定性，输出 APA 风格结果。

## 适用 / 不适用

- **适用**：研究或实验数据；需要选择检验并解释结果；需要效应量、统计功效与报告文本。
- **不适用**：需要底层模型 API（转 `statsmodels` 或 `pymc`）；纯预测建模（转 `scikit-learn`）；业务指标口径尚未定义、且不属于研究设计的数据。

## 典型场景

- **触发语句**：「这两组差异显著吗」「帮我选检验并写结论」「算一下需要多少样本」。
- **要点**：先定 estimand、比较对象与抽样单位，再选检验；假设检查不通过时给出替代方案；结论同时给效应量与置信区间，多重比较要校正。

## 注意点

与 `statsmodels` 分工：本 skill 负责检验选择、假设检查与报告，`statsmodels` 负责模型拟合与系数推断。数值筛查不能证明假设成立，也不能替代研究设计；同源的 `statistical-power` 未单独收录，样本量与功效需求可在本 skill 内处理。

## 来源

- 地址：https://github.com/K-Dense-AI/scientific-agent-skills/blob/HEAD/skills/statistical-analysis/SKILL.md
- 许可证：MIT
