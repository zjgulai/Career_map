---
name: "p2s-guardrailed-uplift-targeting"
title: "Guardrailed Uplift Targeting — 约束优化 CATE：业务护栏驱动的精准干预"
description: "触发词：Uplift 定向、CATE、约束优化、业务护栏、Qini 曲线、可说服用户。何时不用：没有随机对照数据时改用流失预测或因果归因卡；要在成本与覆盖约束下选出真正会被优惠券说动的用户时用本卡。安全边界：护栏约束（预算、触达上限、排除人群）须先与业务确认，不得用敏感属性定向，结论须附置信区间。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 分群"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-Guardrailed-Uplift-Targeting"
p2s_src_domain: "01-因果推断"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "在预算和触达上限的约束下，只对真正会被优惠券说动的人发券，把钱花在增量上。"
user_try: "试试：这是我 5,000 用户的随机发券 A/B 数据，帮我在预算约束下估计 CATE 并给出定向名单。"
whenToUse: "与「因果流失归因」相比：要分解流失因子贡献用那张卡；要在业务护栏约束下产出可执行定向名单时用本卡。"
workflow: "确认随机对照数据与业务护栏（预算、触达上限、排除人群） → 用 Uplift 模型估计每位用户的 CATE → 在约束下求最优定向集合，只覆盖高 CATE 群体 → 用 Qini 曲线对比全量策略并输出名单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Guardrailed Uplift Targeting — 约束优化 CATE：业务护栏驱动的精准干预

## ① 解决的问题

当前做法是向所有"高流失风险"用户统一发"免费延长30天"优惠券，ROI 极低——很多用户即使不发券也会续订

## ② 核心算法逻辑

核心思想：不是问"谁会流失"，而是问"谁会因为我的干预而改变行为"——并且在预算和收入保护约束下，只精准打击这批人。

## ③ 业务应用场景

业务问题：奶粉/纸尿裤订阅用户次月流失预警。当前做法是向所有"高流失风险"用户统一发"免费延长30天"优惠券，ROI 极低——很多用户即使不发券也会续订。
数据要求： - 历史 A/B 测试数据（有无发券的随机对照）：最少 5,000 用户，干预组/对照组各占50% - 特征：`purchase_freq`（近30天下单次数）、`days_since_last`（最近购买距今天数）、`ltv`（历史累计消费）、`has_subscription`（是否当前订阅）、`category_loyalty`（品类粘性）、`price_sensitivity`（促销响应历史） - 结果变量：`renewed`（30天内续订标志 0/1）
预期产出： - 每个用户的 CATE 分数（个体优惠券响应增量） - 最优定向名单：只覆盖 6-12% 用户，优先 CATE > 0.05 的 persuadables - Qini 曲线对比（全量 vs 约束优化策略）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

25-28万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（334 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/causal_inference/guardrailed_uplift_targeting` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/01-因果推断/Skill-Guardrailed-Uplift-Targeting.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Guardrailed Uplift Targeting — 约束优化 CATE 实现
论文: arXiv:2512.19805 | 场景: 母婴订阅用户挽留
"""

from __future__ import annotations

import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import Optional, Tuple
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler


# ────────────────────────────────────────────
# 数据结构
# ────────────────────────────────────────────

@dataclass
class CustomerFeatures:
    """母婴客户特征"""
    purchase_freq: float        # 近30天下单次数
    days_since_last: float      # 最近购买距今天数
    ltv: float                  # 历史累计消费金额(¥)
    has_subscription: int       # 是否当前订阅 (0/1)
    category_loyalty: float     # 品类粘性分 (0-1)
    price_sensitivity: float    # 促销响应历史分 (0-1)


@dataclass
class TargetingPolicy:
    """定向策略输出"""
    targeting_mask: np.ndarray          # 布尔数组：哪些客户被选中
    targeting_rate: float               # 定向比例
    expected_lift: float                # 预期增量挽留率
    expected_cost_saving: float         # 相比全量发券节省成本比例
    roi: float                          # ROI 倍数
    persuadables_count: int             # persuadables 数量
    sleeping_dogs_excluded: int         # 排除的 sleeping dogs 数量
    cate_scores: np.ndarray             # 每个客户的 CATE 分数


# ────────────────────────────────────────────
# CATE 估计器（X-Learner 简化版）
# ────────────────────────────────────────────

class CATEEstimator:
    """
    X-Learner CATE 估计器
    阶段1: 分别训练干预组/对照组响应模型
    阶段2: 用交叉预测估计个体处理效应
    阶段3: 倾向得分加权融合
    """

    def __init__(self, n_estimators: int = 100, random_state: int = 42):
        self.n_estimators = n_estimators
        self.random_state = random_state
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2512.19805 — Guardrailed Uplift Targeting: A Causal Optimization Playbook for Marketing Strategy
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：历史 A/B 测试数据（干预组与对照组各约 50%，卡页最少 5,000 用户）、特征（近 30 天下单次数、最近购买距今天数、历史累计消费、是否订阅、品类粘性、促销敏感度）与结果变量（30 天内是否续订）。

**输出**：每位用户的 CATE 分数、满足业务护栏的最优定向名单（卡页仅覆盖 6–12% 用户）、Qini 曲线对比与预期增量收益，供增长团队执行发券。

## 执行步骤

1. 校验对照数据随机性与业务护栏约束。
2. 训练 Uplift 模型，输出每位用户的 CATE。
3. 在预算与覆盖约束下求解最优定向集合。
4. 用 Qini 曲线对比全量发券与约束优化策略。
5. 输出定向名单与增量收益估算，安排实验复核。

## 边界与不做

- 何时不用：没有随机对照数据、或干预组与对照组严重不均衡时不要用；只要风险排序可用流失预测。
- 能力边界：产出定向名单与增量估算，不代发券；卡页收益区间为案例测算值，须以自有实验复核。
- 安全边界：护栏约束须业务确认，严禁用敏感属性定向。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-AIGP-LLM-Dynamic-Pricing.html、Skill-AIGP-LLM-Dynamic-Pricing、Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-DAWN-Talking-Head-Review.html、Skill-DAWN-Talking-Head-Review、Skill-GraphDeepAR-Demand-Forecasting.html、Skill-GraphDeepAR-Demand-Forecasting、Skill-Intelligent-Attribution-Causal-Forest.html、Skill-Intelligent-Attribution-Causal-Forest、Skill-Multimodal-Table-Understanding.html、Skill-Multimodal-Table-Understanding、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-ReliabilityBench-Agent-Reliability.html、Skill-ReliabilityBench-Agent-Reliability、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection、Skill-Uplift-Churn-Prediction.html、Skill-Uplift-Churn-Prediction、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling
- **延伸**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-AIGP-LLM-Dynamic-Pricing.html、Skill-AIGP-LLM-Dynamic-Pricing、Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-DAWN-Talking-Head-Review.html、Skill-DAWN-Talking-Head-Review、Skill-GraphDeepAR-Demand-Forecasting.html、Skill-GraphDeepAR-Demand-Forecasting、Skill-Multimodal-Table-Understanding.html、Skill-Multimodal-Table-Understanding、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-ReliabilityBench-Agent-Reliability.html、Skill-ReliabilityBench-Agent-Reliability、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection、Skill-Uplift-Churn-Prediction.html、Skill-Uplift-Churn-Prediction
- **可组合**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-DAWN-Talking-Head-Review.html、Skill-DAWN-Talking-Head-Review、Skill-GraphDeepAR-Demand-Forecasting.html、Skill-GraphDeepAR-Demand-Forecasting、Skill-Multimodal-Table-Understanding.html、Skill-Multimodal-Table-Understanding、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-ReliabilityBench-Agent-Reliability.html、Skill-ReliabilityBench-Agent-Reliability、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection、Skill-Guardrailed-Uplift-Targeting

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：01-因果推断　·　源卡：`Skill-Guardrailed-Uplift-Targeting`