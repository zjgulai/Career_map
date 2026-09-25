---
name: "p2s-cross-validation-strategies"
title: "Cross-Validation Strategies（交叉验证策略）"
description: "触发词：交叉验证、时序验证、数据泄漏、滚动验证、模型评估。何时不用：模型已定只需上线后纠偏用「自适应预测精准化」，要定义精度指标口径用「预测准确率MAPE体系」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 算法评估设计"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Cross-Validation-Strategies"
p2s_src_domain: "12-ML基础"
quality_tier: "preview"
user_summary: "别再用随机切分评估时序模型，按时间顺序滚动验证，避免模型偷看未来把效果评虚高。"
user_try: "试试：我这 24 个月 × 30 个 SKU 的日销量要做模型评估，帮我选合适的交叉验证策略并给出评估结果。"
whenToUse: "本卡属需求预测的评估设计侧：需要为时序、分组或不平衡数据选对验证策略以防泄漏时用；指标口径本身的定义用预测准确率体系类技能。"
workflow: "判断数据属于时序、分组还是不平衡结构 → 选择对应验证策略（时序滚动、分组防泄漏） → 执行多折验证并汇总指标均值与置信区间 → 在同一验证协议下对比候选模型"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Cross-Validation Strategies（交叉验证策略）

## ① 解决的问题

业务问题：我们用过去 24 个月数据训练 Prophet 预测下月销量

## ② 核心算法逻辑

论文：Nested versus nonnested crossvalidation for machine learning | arXiv：1809.09446

## ③ 业务应用场景

业务问题：我们用过去 24 个月数据训练 Prophet 预测下月销量。用随机 K-Fold 会导致"用 12 月数据预测 6 月销量"的荒谬情况——模型看到了未来信息。
数据要求：24 个月 × 30 SKU 的日销量数据，需按月份做 TimeSeries Split
预期产出：正确的时序 CV 评估——3 折滚动验证（每次用前 18 个月训、后 3 个月验），MAPE 稳定在 15-20%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：正确的 CV 策略可避免数据泄漏导致的模型虚高评估。母婴场景下，一次错误的模型选型导致上线后表现差，营销预算浪费 3-5 万/次。年化避免损失 30-80 万元。
实施难度：⭐⭐☆☆☆（2 星）— scikit-learn 原生支持，仅需理解业务数据特征后选择对应策略
优先级评分：⭐⭐⭐⭐☆（4 星）— 所有模型的正确评估前提，ML 基础层第二核心
评估依据：Model Evaluation 教你"看什么指标"，Cross Validation 教你"怎么看才对"。二者互补。不平衡数据 + 时序数据场景在母婴电商中极为常见（流失率 5%、月度/季度周期性），必须掌握对应 CV 策略

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（181 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/ml_fundamentals/cross_validation_strategies` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/12-ML基础/Skill-Cross-Validation-Strategies.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Cross-Validation Strategies Toolkit
适用场景：模型稳健评估、时序验证、分组数据防泄漏
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import (
    KFold, StratifiedKFold, TimeSeriesSplit, GroupKFold,
    cross_val_score, cross_validate
)
from sklearn.metrics import make_scorer, roc_auc_score
from sklearn.ensemble import RandomForestClassifier
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass


@dataclass
class CVResult:
    """交叉验证结果"""
    strategy: str
    fold_scores: List[float]
    
    @property
    def mean(self) -> float:
        return np.mean(self.fold_scores)
    
    @property
    def std(self) -> float:
        return np.std(self.fold_scores)
    
    @property
    def ci95(self) -> Tuple[float, float]:
        se = self.std / np.sqrt(len(self.fold_scores))
        return (self.mean - 1.96 * se, self.mean + 1.96 * se)
    
    def summary(self) -> str:
        return f"{self.strategy}: {self.mean:.4f} ± {self.std:.4f} [95%CI: {self.ci95[0]:.4f}, {self.ci95[1]:.4f}]"


def select_cv_strategy(
    X: np.ndarray,
    y: np.ndarray,
    problem_type: str = 'classification',
    groups: Optional[np.ndarray] = None,
    is_time_series: bool = False,
    n_splits: int = 5
) -> object:
    """
    根据数据特征自动选择交叉验证策略
    
    Args:
        X: 特征矩阵
        y: 标签
        problem_type: 'classification' | 'regression'
        groups: 分组标签（如 user_id），用于 GroupKFold
        is_time_series: 是否为时序数据
        n_splits: 折数
    """
    if is_time_series:
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:1809.09446 — Nested cross-validation when selecting classifiers is overzealous for most practical applications
⚠️ 卡页 ② 段点名的论文是《Nested versus nonnested crossvalidation for machine learning》，与这个号指的不是同一篇。

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0.408）。引用前请自行确认。

## 输入 / 输出契约

**输入**：24 个月×30 个 SKU 的日销量数据（需保留时间顺序）、分组字段（如 SKU、门店）用于防泄漏；按月份切分做滚动验证。

**输出**：选定的交叉验证策略、多折评估的指标均值与 95% 置信区间、模型对比结论，输出给建模团队与模型选型决策。

## 执行步骤

1. 判断数据属于时序、分组还是不平衡结构。
2. 选择对应验证策略，避免随机切分引入未来信息。
3. 执行多折验证并汇总指标均值、标准差与置信区间。
4. 在同一验证协议下对比候选模型，给出选型结论。

## 边界与不做

- 何时不用：样本量太小，或没有时间与分组字段时无法构造有意义的验证折，不适用本技能。
- 能力边界：验证只能降低评估偏差，不保证上线表现；折数与切分方式仍需结合业务周期标定。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-AIGP-LLM-Dynamic-Pricing.html、Skill-AIGP-LLM-Dynamic-Pricing、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Conformal-Prediction-Demand-UQ.html、Skill-Conformal-Prediction-Demand-UQ、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Ensemble-Methods.html、Skill-Ensemble-Methods、Skill-Hyperparameter-Optimization.html、Skill-Hyperparameter-Optimization、Skill-Imbalanced-Data-Handling.html、Skill-Imbalanced-Data-Handling、Skill-Model-Evaluation-Metrics.html、Skill-Model-Evaluation-Metrics、Skill-Model-Performance-Monitor.html、Skill-Model-Performance-Monitor、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting
- **延伸**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-AIGP-LLM-Dynamic-Pricing.html、Skill-AIGP-LLM-Dynamic-Pricing、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Conformal-Prediction-Demand-UQ.html、Skill-Conformal-Prediction-Demand-UQ、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Ensemble-Methods.html、Skill-Ensemble-Methods、Skill-Hyperparameter-Optimization.html、Skill-Hyperparameter-Optimization、Skill-Imbalanced-Data-Handling.html、Skill-Imbalanced-Data-Handling、Skill-Model-Performance-Monitor.html、Skill-Model-Performance-Monitor、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting
- **可组合**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-AIGP-LLM-Dynamic-Pricing.html、Skill-AIGP-LLM-Dynamic-Pricing、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Conformal-Prediction-Demand-UQ.html、Skill-Conformal-Prediction-Demand-UQ、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Ensemble-Methods.html、Skill-Ensemble-Methods、Skill-Model-Performance-Monitor.html、Skill-Model-Performance-Monitor、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting、Skill-Cross-Validation-Strategies

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：12-ML基础　·　源卡：`Skill-Cross-Validation-Strategies`