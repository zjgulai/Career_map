---
name: "p2s-supplier-evaluation-model"
title: "Supplier Evaluation Model（供应商评估模型）"
description: "触发词：供应商选型、多准则评分、权重设计、可解释排序。何时不用：候选供应商只有一个、或准则取值缺失时无法比较；已合作供应商的长期培育用路线图追踪类技能。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-041"
l3_business: "供应商评估"
l3_all: "供应商评估"
l1_l2_l3: "业务运营/供应与履约/供应商评估"
p2s_card_id: "Skill-Supplier-Evaluation-Model"
p2s_src_domain: "06-增长模型"
quality_tier: "preview"
user_summary: "把质量、价格、交期、合规等准则量化加权，给出可解释的供应商综合选型评分。"
user_try: "试试：帮我用多准则评分比较这 3 家 OEM 供应商，选出主供应商。"
whenToUse: "本卡属「供应商评估」。需要在多家候选供应商之间做多准则综合评分与选型时用本卡；对已合作供应商做长期培育与升降级用供应商发展路线图追踪类技能。"
workflow: "定义准则与权重 → 构造决策矩阵 → 计算与理想解的距离 → 输出综合得分排序"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Supplier Evaluation Model（供应商评估模型）

## ① 解决的问题

对比 3 家吸奶器 OEM 供应商时靠主观印象决策，忽视交期稳定性和质量风险的量化权重——TOPSIS 多准则供应商评分模型将定性评估转为可解释综合评分，选型准确率可溯源，避免因供应商质量风险造成的批量召回损失

## ② 核心算法逻辑

多准则决策（MCDM）——TOPSIS 方法评估供应商。综合质量、价格、交期、合规、沟通五个维度。

## ③ 业务应用场景

品类：婴儿暖奶器（美国站） 背景：2024年Q3，团队需从3家OEM供应商中选择主供应商，目标日销50件，库存周转率控制在30天以内。
- 供应商A（广东）：质量评分92/100，单价$18.50，交期45天，合规评分95，沟通响应评分90。 - 供应商B（浙江）：质量评分78/100，单价$14.00，交期25天，合规评分88，沟通响应评分75。 - 供应商C（江苏）：质量评分65/100，单价$11.20，交期20天，合规评分70，沟通响应评分60。
TOPSIS 评估（权重：质量0.30，价格0.25，交期0.15，合规0.20，沟通0.10）： - 供应商B综合得分0.672（最优），供应商A得分0.581，供应商C得分0.347。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：避免供应商踩坑（一次失败选品损失 $10-30K）；年化 45 万元
难度：⭐⭐☆☆☆ | 优先级：⭐⭐⭐☆☆

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（22 行）。**下面 22 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **22 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，22 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/growth_model/supplier_evaluation_model` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-Supplier-Evaluation-Model.md`），已与卡面节选核对，不依赖上述路径。

```python
"""Supplier Evaluation — TOPSIS"""

import numpy as np

def topsis(matrix: np.ndarray, weights: np.ndarray, benefits: list):
    """benefits: True=越高越好, False=越低越好"""
    norm = matrix / np.sqrt((matrix**2).sum(axis=0))
    weighted = norm * weights
    ideal = np.array([weighted[:,i].max() if b else weighted[:,i].min() for i,b in enumerate(benefits)])
    anti_ideal = np.array([weighted[:,i].min() if b else weighted[:,i].max() for i,b in enumerate(benefits)])
    d_pos = np.sqrt(((weighted - ideal)**2).sum(axis=1))
    d_neg = np.sqrt(((weighted - anti_ideal)**2).sum(axis=1))
    return d_neg / (d_pos + d_neg)

# test: 3 suppliers × 5 criteria (quality,price,lead_time,compliance,communication)
m = np.array([[92, 18.5, 45, 95, 90], [78, 14.0, 25, 88, 75], [65, 11.2, 20, 70, 60]])
# higher better for quality, compliance, comm; lower for price, lead_time
scores = topsis(m, [0.30,0.25,0.15,0.20,0.10], [True,False,False,True,True])
for i, s in enumerate(scores):
    print(f"  Supplier {chr(65+i)}: {s:.3f}")
print(f"Best: Supplier {chr(65+np.argmax(scores))}")
print("[✓] Supplier Evaluation 测试通过")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：候选供应商在质量、价格、交期、合规、沟通等准则上的量化取值，以及各准则的权重设置。

**输出**：各供应商的综合得分与排序、与理想解的贴近度对比，用于主供应商选择与风险可溯源说明。

## 执行步骤

1. 确定评估准则与权重
2. 采集各候选供应商的准则取值
3. 构造决策矩阵并做归一化
4. 计算与正负理想解的距离得出综合得分
5. 输出排序与选型建议并说明敏感项

## 边界与不做

- 候选供应商只有一个、或准则取值缺失时无法比较，不用本卡
- 本卡产出评分与排序，不负责商务谈判与合同签署
- 权重设定变化会改变排序结论，需与业务方确认口径

## 技能关联

- **前置**：Skill-Amazon-ToS-Compliance-Guardrail.html、Skill-Amazon-ToS-Compliance-Guardrail、Skill-Competitor-Product-Intelligence.html、Skill-Competitor-Product-Intelligence、Skill-Cross-Border-Price-Harmonization.html、Skill-Cross-Border-Price-Harmonization、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring
- **可组合**：Skill-Amazon-ToS-Compliance-Guardrail.html、Skill-Amazon-ToS-Compliance-Guardrail、Skill-Competitor-Product-Intelligence.html、Skill-Competitor-Product-Intelligence、Skill-Cross-Border-Price-Harmonization.html、Skill-Cross-Border-Price-Harmonization、Skill-Supplier-Evaluation-Model

---

> 分类：业务运营/供应与履约/供应商评估　·　技术族：06-增长模型　·　源卡：`Skill-Supplier-Evaluation-Model`