---
name: "p2s-feature-selection"
title: "Feature Selection（特征选择）"
description: "触发词：特征选择、降维去冗、重要特征排序、过拟合控制、训练成本优化。何时不用：特征还没造出来时用特征工程；要解释单次预测的归因时用 SHAP。安全边界：无。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-Feature-Selection"
p2s_src_domain: "12-ML基础"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "从上百个特征里挑出真正有用的那一小撮，让模型训练更快、过拟合更少、结果更好解释。"
user_try: "试试：从这 200 个特征里选出 top-20，并用 SHAP 与 RFE 交叉验证选得对不对。"
whenToUse: "属于「业务工具实现」：特征数量多、想砍冗余又要保住效果时用；若还停在原始字段阶段，先用特征工程；若要解释某个预测结果，用 SHAP 归因；卡页也提示 50 个特征以下收益有限。"
workflow: "准备宽表数据与标签，确认训练与验证切分 → 用过滤法做初筛，得到互信息等重要性排序 → 用 SHAP 做全局重要性排序，锁定候选特征 → 用 RFE 或嵌入法交叉验证，确认最终特征子集 → 对比精简前后训练速度与 AUC，确认收益后固化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Feature Selection（特征选择）

## ① 解决的问题

我们从多个数据源（CRM、广告平台、网站分析、客服系统）汇总了 200+ 特征

## ② 核心算法逻辑

少即是多——从大量特征中筛选出真正有用的子集，提升模型性能、降低过拟合风险、减少训练/推理成本、增强可解释性。

## ③ 业务应用场景

业务问题：我们从多个数据源（CRM、广告平台、网站分析、客服系统）汇总了 200+ 特征。但很多冗余特征不仅没用，还拖慢训练速度和增加过拟合。需要筛选出真正影响流失的 top-20 特征。
数据要求：100K 用户 × 200 特征。先用 SHAP 做全局重要性排序，再用 RFE 验证
预期产出：SHAP 识别出 top-20 特征贡献了 90% 的预测力。精简后模型：训练速度快 3x，AUC 仅下降 0.005

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：特征精简可降低训练成本 60%+、推理成本 70%+、数据采集成本 50%+。月省 $5,000-10,000；同时更好的特征集提升模型 AUC 1-3pp。年化贡献 30-60 万元。
实施难度：⭐⭐⭐⭐☆（4 星）— 需要理解不同方法的适用场景和局限性
优先级评分：⭐⭐⭐☆☆（3 星）— 模型已经有 200 特征时才紧迫，50 特征以下收益有限
评估依据：特征工程是图谱 #1 被依赖节点，特征选择是其下游最自然的延伸

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（142 行）。**下面 58 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，58 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/ml_fundamentals/feature_selection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/12-ML基础/Skill-Feature-Selection.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Feature Selection Toolkit
特征选择工具集 — Filter / Wrapper / Embedded / SHAP
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_selection import (
    mutual_info_classif, RFE, RFECV, SelectKBest, SelectFromModel
)
from sklearn.linear_model import LassoCV
from xgboost import XGBClassifier
from typing import List, Dict, Tuple


def filter_features(
    X: pd.DataFrame, y: np.ndarray, 
    k: int = 20, method: str = 'mutual_info'
) -> Tuple[List[str], pd.DataFrame]:
    """
    过滤法特征选择
    
    Returns:
        (selected_columns, importance_scores)
    """
    if method == 'mutual_info':
        scores = mutual_info_classif(X, y, random_state=42)
    elif method == 'variance':
        scores = X.var().values
    else:
        raise ValueError(f"Unknown method: {method}")
    
    importance = pd.DataFrame({
        'feature': X.columns, 'score': scores
    }).sort_values('score', ascending=False)
    
    selected = importance.head(k)['feature'].tolist()
    return selected, importance


def rfe_feature_selection(
    X: np.ndarray, y: np.ndarray,
    estimator=None, n_features: int = 20, cv: bool = True
) -> List[int]:
    """
    RFE (Recursive Feature Elimination) 特征选择
    """
    estimator = estimator or RandomForestClassifier(n_estimators=50, random_state=42)
    
    if cv:
        selector = RFECV(estimator, min_features_to_select=n_features, 
                         cv=3, scoring='roc_auc')
    else:
        selector = RFE(estimator, n_features_to_select=n_features)
    
    selector.fit(X, y)
    return list(np.where(selector.support_)[0])
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：宽表训练数据（卡页示例 100K 用户乘 200 特征量级）与标签，以及特征字典；卡页第 4 段未给字段级规格，落地前需确认标签定义与训练验证切分方式。

**输出**：精简后的特征子集与重要性排序（卡页示例 SHAP 选出的 top-20 特征贡献约 90% 预测力）以及精简前后模型对比结果，供建模团队使用。

## 执行步骤

1. 准备宽表数据与标签，确认训练与验证切分
2. 用过滤法做初筛，得到互信息等重要性排序
3. 用 SHAP 做全局重要性排序，锁定候选特征
4. 用 RFE 或嵌入法交叉验证，确认最终特征子集
5. 对比精简前后训练速度与 AUC，确认收益后固化特征集

## 边界与不做

- 数据不满足时不用：特征数量本身不多时收益有限，卡页提示 50 个特征以下不必做特征选择。
- 能力边界：本卡产出特征子集与评估结果，不含模型调参与上线部署，也不保证业务解释成立。

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Ensemble-Methods.html、Skill-Ensemble-Methods、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Hyperparameter-Optimization.html、Skill-Hyperparameter-Optimization、Skill-Imbalanced-Data-Handling.html、Skill-Imbalanced-Data-Handling、Skill-Model-Evaluation-Metrics.html、Skill-Model-Evaluation-Metrics、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Ensemble-Methods.html、Skill-Ensemble-Methods、Skill-Hyperparameter-Optimization.html、Skill-Hyperparameter-Optimization、Skill-Imbalanced-Data-Handling.html、Skill-Imbalanced-Data-Handling、Skill-Model-Evaluation-Metrics.html、Skill-Model-Evaluation-Metrics、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Hyperparameter-Optimization.html、Skill-Hyperparameter-Optimization、Skill-Imbalanced-Data-Handling.html、Skill-Imbalanced-Data-Handling、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Feature-Selection

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：12-ML基础　·　源卡：`Skill-Feature-Selection`