---
name: "p2s-tag-ml-causal-feature-selection"
title: "标签驱动因果特征选择 — 用业务标签指导ML特征工程的因果框架"
description: "触发词：因果特征选择、分布不变、跨季节稳定、特征筛选、标签环境。何时不用：只追单季精度、不管跨环境稳定性时收益有限；标签质量本身未受控时先做标签质量监控。安全边界：无。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 需求预测"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Tag-ML-Causal-Feature-Selection"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "用业务标签切出不同环境，挑出跨季节都稳的特征，别让大促伪相关特征带偏模型。"
user_try: "试试：用旺季/淡季标签做环境切分，帮我筛掉只在双 11 有效的那几个伪相关特征。"
whenToUse: "模型换季就劣化、怀疑伪相关特征在作祟时用；标签环境本身没定义清楚或标签质量未受控时，先解决标签侧问题。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 标签驱动因果特征选择 — 用业务标签指导ML特征工程的因果框架

## ① 解决的问题

算法团队面临"跨季节模型MAPE从12%劣化至28%因大促伪相关特征失效"——分布不变因果特征选择使跨季节稳定性显著提升，年化减少备货错误约100万元

## ② 核心算法逻辑

传统特征选择的局限：SHAP/互信息等方法发现的"重要特征"可能是相关但非因果的特征，在数据分布变化时（如大促期/新季节），这些伪相关特征会导致模型性能急剧下降。

## ③ 业务应用场景

场景A：LTV预测模型的跨季节稳定特征选择 - 业务问题：LTV预测模型在旺季（Q4）训练的特征（如"购物车放弃率"在大促期非常重要），在平时效果很差（MAPE从12%上升到28%），导致平时备货决策错误 - 数据要求：用户行为特征矩阵 + 业务标签（旺季/淡季/新用户/老用户）+ LTV标签 - 预期产出：分布不变特征选择后，保留在所有标签环境稳定的8个特征（如账号年龄/历史购买频次/宝宝月龄）；去掉5个在大促期才有效的伪相关特征；模型在跨季节评估中MAPE从28%降至15% - 业务价值：跨季节预测稳定性提升，减少季节切换期的备货错误，年化节省约80万元
**三轨验证**： - **成本**：显性成本约15万元/年（数据采集与标签清洗5万 + 计算资源3万 + 数据科学家人力7万）；需额外维护标签环境定义（约0.5人月/季度） - **合规**：不触碰Amazon政策红线（仅使用用户行为聚合特征，无个人身份信息）；GDPR合规（特征均为聚合统计量，不涉及敏感数据）；广告法无直接关联 - **风险**：低风险。主要次生风险为标签环境定义偏差导致特征选择错误（如错误将旺季标签定义为环境，导致丢失真实因果特征），可通过业务专家评审缓解；不会引发竞品价格战或平台审查

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：跨季节模型稳定性提升（MAPE 28%→15%），备货错误减少，年化约80万元；减少特征工程人力（不再手工筛选季节性特征）约20万元；合计约100万元
实施难度：⭐⭐⭐☆☆（分布不变检验约50行代码；难点在标签环境的合理定义）
优先级：⭐⭐⭐⭐⭐（修复24-标签↔12-ML断层 规模93；标签体系是ML特征工程的最佳先验知识来源）
评估依据：NeurIPS 2022顶会论文；IRM（Invariant Risk Minimization，Arjovsky 2019）是该方向开山之作；Shopify/Booking.com均发表了类似的稳定特征工程实践

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（138 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-Tag-ML-Causal-Feature-Selection
标签驱动因果特征选择

依赖：pip install numpy pandas scikit-learn scipy
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
from scipy import stats

np.random.seed(42)

# ── 1. 生成含伪相关特征的数据（跨标签环境）─────────────────────────
n = 4000

# 用户标签（定义不同"环境"）
label_promo    = np.random.binomial(1, 0.25, n)  # 25%是大促期用户
label_new_user = np.random.binomial(1, 0.30, n)

# 真正的因果特征（跨环境稳定）
baby_age_months  = np.random.randint(0, 18, n).astype(float)
account_age_days = np.random.uniform(30, 1500, n)
purchase_history = np.random.exponential(3, n)

# 伪相关特征（只在大促期有效）
cart_abandon_promo = (label_promo * np.random.beta(3, 2, n) +
                       (1-label_promo) * np.random.beta(1, 5, n))  # 大促期高相关，平时低相关
promo_sensitivity  = label_promo * np.random.uniform(0.5, 1.0, n)  # 仅大促期有效

X = pd.DataFrame({
    'baby_age_months':  baby_age_months,
    'account_age_days': account_age_days,
    'purchase_history': purchase_history,
    'cart_abandon_promo': cart_abandon_promo,
    'promo_sensitivity':  promo_sensitivity,
})
feature_names = list(X.columns)

# 真实LTV（只受因果特征驱动）
ltv = (500
    + 40 * (baby_age_months < 6)     # 月龄因果效应
    + 0.3 * account_age_days
    + 60 * purchase_history
    + np.random.normal(0, 80, n))

# ── 2. 分布不变特征选择（标签环境稳定性检验）────────────────────────
def invariant_feature_selection(X: pd.DataFrame, y: np.ndarray,
                                  env_labels: list, alpha: float = 0.05) -> dict:
    """
    基于环境不变性的因果特征选择
    env_labels: 定义不同环境的标签列表（如 [label_promo, label_new_user]）
    """
    results = {}
    # 定义环境组合
    envs = [np.ones(len(y), dtype=bool)]  # 全量
    for label in env_labels:
        envs.append(label == 1)
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2207.09786。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：用户行为特征矩阵，加上业务标签（旺季/淡季、新用户/老用户等环境定义）与预测目标标签（如 LTV）

**输出**：在各标签环境下都稳定的特征清单（保留项与剔除项，卡页场景为保留 8 个、去掉 5 个）与跨季节评估结果，供建模团队直接使用

## 执行步骤

1. 用业务标签把样本切成多个环境（旺季/淡季、新老用户等）。
2. 做分布不变检验（IRM 一类），筛掉只在单一环境有效的伪相关特征。
3. 在跨环境评估集上比对误差指标，确认稳定性改善。
4. 把标签环境定义交业务专家评审，避免定义偏差带偏特征选择。

## 边界与不做

- 何时不用：只追单季模型精度、不关心跨环境稳定性时，本技能收益有限。
- 能力边界：产出的是特征清单与环境定义，不负责标签本身的采集与质量治理。
- 能力边界：卡页原文提示标签环境定义偏差会漏掉真实因果特征，需业务专家评审兜底。

## 技能关联

- **前置**：Skill-Conformal-Prediction-Framework.html、Skill-Conformal-Prediction-Framework、Skill-Continual-Learning-Production.html、Skill-Continual-Learning-Production、Skill-Feature-Selection.html、Skill-Feature-Selection、Skill-SHAP-Shapley-Feature-Attribution.html、Skill-SHAP-Shapley-Feature-Attribution、Skill-Tag-AB-Experiment-Design.html、Skill-Tag-AB-Experiment-Design、Skill-Tag-Causal-Treatment-Effect.html、Skill-Tag-Causal-Treatment-Effect、Skill-Tag-Fraud-Ri[REDACTED].html、Skill-Tag-Fraud-Ri[REDACTED]
- **延伸**：Skill-Conformal-Prediction-Framework.html、Skill-Conformal-Prediction-Framework、Skill-Continual-Learning-Production.html、Skill-Continual-Learning-Production、Skill-SHAP-Shapley-Feature-Attribution.html、Skill-SHAP-Shapley-Feature-Attribution、Skill-Tag-AB-Experiment-Design.html、Skill-Tag-AB-Experiment-Design、Skill-Tag-Fraud-Ri[REDACTED].html、Skill-Tag-Fraud-Ri[REDACTED]
- **可组合**：Skill-Conformal-Prediction-Framework.html、Skill-Conformal-Prediction-Framework、Skill-Continual-Learning-Production.html、Skill-Continual-Learning-Production、Skill-Tag-AB-Experiment-Design.html、Skill-Tag-AB-Experiment-Design、Skill-Tag-Fraud-Ri[REDACTED].html、Skill-Tag-Fraud-Ri[REDACTED]、Skill-Tag-ML-Causal-Feature-Selection

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：24-标签工程　·　源卡：`Skill-Tag-ML-Causal-Feature-Selection`