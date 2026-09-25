---
name: "p2s-model-evaluation-metrics"
title: "Skill Card: Model Evaluation Metrics（模型评估体系）"
description: "触发词：模型评估、混淆矩阵、AUC、阈值权衡、模型选型。何时不用：评估排序策略的在线胜负用「交叉实验」系列；评估嵌入模型的检索质量用「MTEB 嵌入模型选型」。安全边界：阈值选择须结合假正例与假负例的业务成本，不得只报单一指标；测试集须与训练集按时间切分，避免数据泄漏。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-036"
l3_business: "算法评估设计"
l3_all: "算法评估设计 / 生命周期触达"
l1_l2_l3: "业务运营/产品与创新/算法评估设计"
p2s_card_id: "Skill-Model-Evaluation-Metrics"
p2s_src_domain: "12-ML基础"
quality_tier: "preview"
user_summary: "用混淆矩阵衍生的指标比较几个候选模型，在真实业务阈值下权衡误判成本，决定哪个模型可以上线。"
user_try: "试试：对比这三个销量预测模型的 RMSE、MAE、MAPE 和 R²，告诉我哪个适合上智能补货系统。"
whenToUse: "训练完多个候选模型、需要按业务成本选一个上线时用本技能；若评估的是排序策略的在线胜负，用「交叉实验」系列；若评估的是嵌入模型的检索质量，用「MTEB 嵌入模型选型」。"
workflow: "准备训练/测试集与候选模型（如 XGBoost、LightGBM、Prophet） → 计算分类或回归指标（Precision/Recall/F1/AUC 或 RMSE/MAE/MAPE/R²） → 在不同阈值下权衡假正例与假负例的业务成本 → 选定部署模型与阈值并输出评估报告"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill Card: Model Evaluation Metrics（模型评估体系）

## ① 解决的问题

业务问题： 我们训练了 3 个流失预测模型（XGBoost / LightGBM / Logistic Regression），需要决定用哪个模型上线到 WF-A 智能补货系统，触发对高风险用户的挽留优惠券

## ② 核心算法逻辑

模型评估体系解决"模型在真实业务中的表现到底如何"这个问题——通过混淆矩阵衍生的多维度量化指标（Precision/Recall/F1/AUCROC），在不同业务阈值下权衡假正例与假负例成本，从而做出科学的模型选型与部署决策。这是 ML 工程中从实验到生产的关键卡点。

## ③ 业务应用场景

业务问题： 母婴跨境 SaaS 平台为中国卖家提供 WF-A 智能补货系统。我们训练了 3 个销量预测模型（XGBoost/LightGBM/Prophet），需要选择最优模型指导备货决策。备货过多积压成本高（仓储费 15%/月），备货过少缺货损失销售（毛利率 40%）。
具体数据规模： - 历史数据：500 个 SKU × 12 个月 = 6000 条样本 - 测试集：1500 条（最近 3 个月数据） - 预测目标：30 天销量（连续值） - 评估指标：RMSE、MAE、MAPE、R²
量化产出： - XGBoost 模型 RMSE 降低 23%（vs 基准 Prophet），MAPE 从 18% 降至 14% - 备货成本节省：年均 12 万元（通过减少 8% 的过度备货） - 缺货率从 12% 降至 6%，新增销售收入 28 万元/年 - 总 ROI：40 万元/年 ÷ 模型开发成本 8 万 = 5 倍

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

场景一（销量预测）：年均成本节省 40 万元（备货优化 12 万 + 新增销售 28 万）
场景二（流失预测）：月均净收益 30.6 万元，年均 367 万元
综合 ROI：(40 + 367×12) / 13 = 341 倍（13 万元开发投入）
从"凭感觉"到"数据驱动"的决策范式转变
建立可复用的模型评估框架，加速后续 ML 项目上线
降低模型部署风险（避免"假阳性"上线）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（282 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/ml_fundamentals/model_evaluation_metrics` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/12-ML基础/Skill-Model-Evaluation-Metrics.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Model Evaluation Toolkit - 分类模型多维度评估
适用场景：模型选型、A/B测试结果判读、生产模型健康监控
"""

import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, log_loss,
    confusion_matrix, roc_curve, precision_recall_curve,
    brier_score_loss
)
from sklearn.calibration import calibration_curve
from scipy import stats
from dataclasses import dataclass
from typing import Dict, Tuple, List
import warnings
warnings.filterwarnings('ignore')


@dataclass
class EvaluationMetrics:
    """模型评估指标集合"""
    accuracy: float
    precision: float
    recall: float
    f1: float
    auc_roc: float
    auc_pr: float
    log_loss: float
    brier_score: float
    confusion_matrix: np.ndarray
    
    def summary(self) -> str:
        tn, fp, fn, tp = self.confusion_matrix.ravel()
        return (
            f"\n{'='*60}\n"
            f"模型评估报告\n"
            f"{'='*60}\n"
            f"Accuracy  : {self.accuracy:.4f}\n"
            f"Precision : {self.precision:.4f}\n"
            f"Recall    : {self.recall:.4f}\n"
            f"F1-Score  : {self.f1:.4f}\n"
            f"AUC-ROC   : {self.auc_roc:.4f}\n"
            f"AUC-PR    : {self.auc_pr:.4f}\n"
            f"Log Loss  : {self.log_loss:.4f}\n"
            f"Brier     : {self.brier_score:.4f}\n"
            f"{'='*60}\n"
            f"混淆矩阵:\n"
            f"  TN={tn}, FP={fp}\n"
            f"  FN={fn}, TP={tp}\n"
            f"{'='*60}"
        )


def evaluate_classifier(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    threshold: float = 0.5
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：候选模型的预测输出与测试集真值（卡页示例：500 个 SKU × 12 个月共 6,000 条样本，测试集 1,500 条为最近 3 个月数据），以及假正例与假负例的业务成本口径（如仓储费、毛利损失）。

**输出**：多维评估指标报告（Precision/Recall/F1/AUC-ROC 或 RMSE/MAE/MAPE/R²）、不同阈值下的成本权衡与选型结论，供模型上线决策使用。

## 执行步骤

1. 准备训练/测试集与候选模型
2. 计算分类或回归的多维评估指标
3. 在不同阈值下权衡假正例与假负例成本
4. 选定上线模型与阈值
5. 输出评估报告与监控基准

## 边界与不做

- 测试集与训练集时间重叠、或样本量不足以覆盖业务分布时不适用，指标会虚高
- 指标只反映离线表现，上线前仍需灰度验证，也不替代业务侧收益测算
- 阈值选择必须结合业务误判成本，不得只报单一指标或最佳阈值下的最优结果

## 技能关联

- **前置**：Skill-Binary-Classification-Fundamentals、Skill-Data-Preprocessing-for-ML
- **延伸**：Skill-Imbalanced-Data-Handling.html、Skill-Imbalanced-Data-Handling、Skill-Model-Calibration.html、Skill-Model-Calibration、Skill-Production-Model-Monitoring
- **可组合**：Skill-AB-Testing-Design、Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Hyperparameter-Tuning、Skill-Model-Evaluation-Metrics.html、Skill-Model-Evaluation-Metrics、Skill-Model-Selection

---

> 分类：业务运营/产品与创新/算法评估设计　·　技术族：12-ML基础　·　源卡：`Skill-Model-Evaluation-Metrics`