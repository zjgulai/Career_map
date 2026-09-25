---
name: "p2s-conformal-roi-prediction"
title: "共形预测ROI区间估计 - 小样本下的可信转化贡献量化"
description: "触发词：共形预测、ROI区间、置信区间、桑基图、小样本。何时不用：还能做用户级或地区级增量实验、或只想要渠道排序时不用本技能（改走实验设计与因果森林）。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 漏斗诊断"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-Conformal-ROI-Prediction"
p2s_src_domain: "01-因果推断"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "给桑基图里每条路径的 ROI 补上可信区间，区间太宽的先别急着砍预算，避免凭一个点估计砍错渠道。"
user_try: "试试：帮我给这张桑基图各路径的 ROI 标上置信区间，指出哪些渠道现在还不该砍投放。"
whenToUse: "当渠道/路径的 ROI 只有点估计（如桑基图显示某路径贡献 35%）、样本小又无法扩量验证，却要据此判断砍不砍预算时用；若能做 RCT 或地区增量实验，走实验设计类技能；若只要渠道间效应排序，用因果森林类技能。"
workflow: "汇总历史 2-4 周渠道-页面路径-转化 RCT 数据并提取用户特征与页面行为序列 → 训练 DRP 模型得到各路径 ROI 点估计 → 用 1-2 天新鲜 RCT 数据做共形分数校准 → 为桑基图每个节点/边输出 ROI 区间并标注宽度 → 按区间下界决定加投、按区间宽度决定是否先补数据再决策"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 共形预测ROI区间估计 - 小样本下的可信转化贡献量化

## ① 解决的问题

业务问题：桑基图显示 "Google Ads → 首页 → 搜索 → PDP → 支付" 这条路径贡献了 35% 的转化

## ② 核心算法逻辑

rDRP（robust Direct ROI Prediction）在标准 DRP (Direct ROI Prediction, AAAI 2023) 基础上，用共形预测 + MC Dropout 做 ROI 区间估计，再通过启发式校准将区间信息融回点估计。

## ③ 业务应用场景

业务问题：桑基图显示 "Google Ads → 首页 → 搜索 → PDP → 支付" 这条路径贡献了 35% 的转化。但这是一个点估计——如果实际只有 25% 怎么办？砍掉 Google Ads 预算会不会是致命错误？需要为桑基图的每个节点/边标注置信区间。
数据要求： - 训练集：历史 2-4 周的 RCT 数据（渠道-页面路径-转化标签），用于训练 DRP 模型 - 校准集：1-2 天新鲜 RCT 数据（与当前部署期分布一致），用于共形分数校准 - 特征：用户特征（设备、国家、来源渠道）+ 页面行为序列（停留时长、点击路径）
业务价值： - 避免误砍高效渠道：区间宽度作为"不确定性预警"，宽区间渠道先收集更多数据再决策 - 精准加投：区间下界仍高的渠道（如 Google Ads）才是真正可信的高 ROI 路径 - 月广告预算 30 万时，避免一次错误决策潜在损失 5-10 万

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

当前痛点：桑基图中各渠道 ROI 是点估计，置信区间未知
错误决策风险：基于不可信点估计砍错渠道，潜在损失 20-30% 预算效率（6-9 万/月）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（695 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/causal_inference/conformal_roi_prediction` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/01-因果推断/Skill-Conformal-ROI-Prediction.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
rDRP (Robust Direct ROI Prediction) - 共形预测驱动的ROI区间估计
论文: arXiv:2407.01065 (ICDE 2024)
场景: 母婴出海桑基图可信度标注 + 小样本新市场ROI区间估计

依赖: numpy, pandas, scikit-learn, torch (可选，用MLP), scipy
"""

import numpy as np
import pandas as pd
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from scipy.optimize import brentq
import warnings
warnings.filterwarnings('ignore')


# ==================== DRP 点估计模型（简化版） ====================

class DRPModel:
    """
    Direct ROI Prediction 模型（简化版，使用 sklearn MLP 模拟）
    
    核心：凸损失函数保证损失收敛时 ROI 排序无偏
    注：生产环境建议用 PyTorch 实现带 Dropout 的深度网络
    """
    
    def __init__(self, hidden_layers=(64, 32), random_state=42):
        self.scaler = StandardScaler()
        self.model = MLPRegressor(
            hidden_layer_sizes=hidden_layers,
            activation='relu',
            max_iter=500,
            random_state=random_state,
            early_stopping=True,
            validation_fraction=0.1
        )
        self.is_fitted = False
    
    def fit(self, X, roi_labels):
        """
        训练 DRP 模型
        
        Args:
            X: 特征矩阵 (n_samples, n_features)
            roi_labels: ROI 标签 (n_samples,)，来自 RCT 数据
                        roi = (y_revenue_treated - y_revenue_control) / 
                              (y_cost_treated - y_cost_control)
        """
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, roi_labels)
        self.is_fitted = True
        return self
    
    def predict(self, X):
        """点估计：预测 ROI 分数"""
        if not self.is_fitted:
            raise ValueError("模型未训练，请先调用 fit()")
        X_scaled = self.scaler.transform(X)
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2407.01065 — Improve ROI with Causal Learning and Conformal Prediction

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：训练集：历史 2-4 周 RCT 数据（渠道-页面路径-转化标签）；校准集：1-2 天新鲜 RCT 数据，且与当前部署期分布一致；特征：用户特征（设备、国家、来源渠道）+ 页面行为序列（停留时长、点击路径），用户级粒度。

**输出**：桑基图每个节点/边的 ROI 点估计与置信区间、以区间宽度表示的渠道不确定性预警，供投放与预算决策使用（卡页示例场景为月广告预算 30 万时避免 5-10 万潜在损失）。

## 执行步骤

1. 汇总历史 2-4 周渠道-页面路径-转化 RCT 数据并提取用户特征与页面行为序列
2. 训练 DRP 模型得到各路径的 ROI 点估计
3. 用 1-2 天新鲜 RCT 数据校准共形分数区间
4. 输出桑基图每个节点/边的 ROI 区间并标注区间宽度
5. 按区间下界决定加投渠道、按区间宽度决定是否先收集更多数据

## 边界与不做

- 何时不用：没有近期 RCT 数据做校准、或样本量已足够跑正式增量实验时，不要用本技能。
- 能力边界：只输出 ROI 区间与不确定性预警，不替你决定砍不砍预算；区间有效性依赖校准集与部署期分布一致，分布漂移后需重新校准。
- 卡页数字（路径贡献 35%、月预算 30 万、潜在损失 5-10 万）来自示例场景，不可直接外推为通用提升幅度。

## 技能关联

- **前置**：Skill-DML-Cohort-Causal-Effect.html、Skill-DML-Cohort-Causal-Effect、Skill-EPICSCORE-Uncertainty.html、Skill-EPICSCORE-Uncertainty、Skill-Intelligent-Attribution-Causal-Forest.html、Skill-Intelligent-Attribution-Causal-Forest、Skill-SSBC-Small-Sample-Conformal.html、Skill-SSBC-Small-Sample-Conformal、Skill-TRACE-Delayed-CVR.html、Skill-TRACE-Delayed-CVR、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling
- **延伸**：Skill-DML-Cohort-Causal-Effect.html、Skill-DML-Cohort-Causal-Effect、Skill-EPICSCORE-Uncertainty.html、Skill-EPICSCORE-Uncertainty、Skill-SSBC-Small-Sample-Conformal.html、Skill-SSBC-Small-Sample-Conformal、Skill-TRACE-Delayed-CVR.html、Skill-TRACE-Delayed-CVR
- **可组合**：Skill-DML-Cohort-Causal-Effect.html、Skill-DML-Cohort-Causal-Effect、Skill-SSBC-Small-Sample-Conformal.html、Skill-SSBC-Small-Sample-Conformal、Skill-TRACE-Delayed-CVR.html、Skill-TRACE-Delayed-CVR、Skill-Conformal-ROI-Prediction

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：01-因果推断　·　源卡：`Skill-Conformal-ROI-Prediction`