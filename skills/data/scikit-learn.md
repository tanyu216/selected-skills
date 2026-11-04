---
name: Scikit-learn
category: data
source: https://github.com/K-Dense-AI/scientific-agent-skills/blob/HEAD/skills/scikit-learn/SKILL.md
license: BSD-3-Clause
tags: [machine-learning, python, pipeline, model-evaluation]
summary: 监督与无监督学习、模型评估、调参与 Pipeline 的 Python 实现指南。
---

# Scikit-learn

## 用途

需要训练和评估预测模型时使用：分类、回归、聚类、降维、预处理、模型评估、超参数调优，以及把预处理与模型串成可复现的 Pipeline。SKILL 提供算法选择、预处理方式、评估指标与最佳实践参考。

## 适用 / 不适用

- **适用**：分类 / 回归 / 聚类任务；搭可复现的预处理 + 模型 Pipeline；交叉验证与调参；需要在统一 API 下比较多个模型。
- **不适用**：只做描述统计或假设检验（转 `statistical-analysis`）；需要系数推断、边际效应或时序模型（转 `statsmodels`）；深度学习与大规模神经网络。

## 典型场景

- **触发语句**：「训练一个流失预测模型并评估」「搭一个预处理 + 模型 Pipeline」「做交叉验证调参」。
- **要点**：先划分训练 / 验证 / 测试集，预处理必须放进 Pipeline 防止泄漏；类别不平衡时同时确定采样策略与评估指标，不要只看准确率。

## 注意点

需要 Python 3.11+ 与 scikit-learn 1.9.1；依赖 NumPy、SciPy、joblib，示例另需 pandas 与 matplotlib。最常见的误用是在划分前做全局标准化或缺失值填补，导致数据泄漏。需要解释模型时，同源上游还有 `shap`，本次未单独收录。

## 来源

- 地址：https://github.com/K-Dense-AI/scientific-agent-skills/blob/HEAD/skills/scikit-learn/SKILL.md
- 许可证：BSD-3-Clause
