---
name: "p2s-imbalanced-data-handling"
title: "Skill Card: Imbalanced Data Handling in Mother-Baby Cross-Border E-commerce"
description: "触发词：样本不平衡、类别权重、SMOTE、阈值调优、长尾 SKU、召回率。何时不用：指标不达标源于特征或标签问题时不要用重采样掩盖；要在极端不平衡下提升少数类召回与长尾预测精度时用本卡。安全边界：重采样只能用于训练集，验证与测试集必须保持真实分布，结果不得对外披露个体数据。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 抽样审计"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-Imbalanced-Data-Handling"
p2s_src_domain: "12-ML基础"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "让模型别只顾大头，把长尾和少数类也预测准，减少滞销和漏掉的流失用户。"
user_try: "试试：这是我的销量与流失样本，正负极度不平衡，帮我用类别权重、SMOTE 和阈值调优提升少数类召回。"
whenToUse: "与「超参调优」相比：样本分布问题是本卡的活；分布已合理、只想再压误差时用超参调优。"
workflow: "统计各 SKU 或类别的样本量与波动，定位不平衡来源 → 对训练集少数类应用 SMOTE 过采样并设置类别权重 → 采用按 SKU 分层的交叉验证保证每折覆盖头部与长尾 → 按业务代价调阈值并评估召回与精确率平衡"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill Card: Imbalanced Data Handling in Mother-Baby Cross-Border E-commerce

## ① 解决的问题

流失率 5%，直接用 XGBoost 训练，Recall 只有 0.3——70% 的流失用户没被识别

## ② 核心算法逻辑

在母婴跨境电商中，高价值事件（转化、复购、欺诈）往往占比 <5%，直接训练模型会严重偏向多数类，导致少数类 Recall 极低（<0.3），业务决策失效。不平衡数据处理通过重采样、成本加权或阈值调优，使模型在保持精准度的前提下大幅提升对稀有事件的识别能力。

## ③ 业务应用场景

业务问题： 某跨境电商平台销售 50+ SKU 婴儿奶粉。其中 3 款头部产品日销 500+ 件（占总销量 60%），其余 47 款日销 10-50 件。直接用 XGBoost 预测，模型优化目标自动向头部产品倾斜，导致长尾产品预测 RMSE 高达 45%，库存积压率 28%，每月滞销成本 ¥18 万。
具体数据规模： - 训练集：18 个月 × 50 SKU × 30 天 = 27,000 条样本 - 特征：价格、季节、促销、竞品、评价数、复购率等 12 维 - 标签分布：头部 SKU（60% 销量，占样本 12%）vs 长尾 SKU（40% 销量，占样本 88%）
处理方案： 1. 按 SKU 分组，计算每组销量标准差 2. 对长尾 SKU（σ > 平均值）应用 SMOTE 过采样，将长尾样本从 23,760 扩展至 32,400 3. 对头部 SKU 应用 类别权重 $w_{tail} = 0.6 / 0.4 = 1.5$ 4. 使用 分层 5 折交叉验证，按 SKU 分层保证每折都含头部+长尾

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

¥12 万/月 × 12 月 =

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（367 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/ml_fundamentals/imbalanced_data_handling` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/12-ML基础/Skill-Imbalanced-Data-Handling.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Imbalanced Data Handling Toolkit
不平衡数据处理工具集 — 类别权重 / SMOTE / 阈值调优

适用场景：高价值客户识别、流失预警、欺诈检测、稀有事件预警
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    classification_report, roc_auc_score, precision_recall_curve,
    f1_score, confusion_matrix
)
from sklearn.preprocessing import StandardScaler
from typing import Dict, Tuple, List


class ImbalancedDataHandler:
    """不平衡数据处理工具类"""
    
    def __init__(self, random_state: int = 42):
        self.random_state = random_state
        self.scaler = StandardScaler()
        self.model = None
        self.optimal_threshold = 0.5
    
    def generate_synthetic_imbalanced_data(
        self, 
        n_samples: int = 10000,
        imbalance_ratio: float = 0.03
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        生成合成不平衡数据集（模拟母婴电商高价值客户识别场景）
        
        Args:
            n_samples: 总样本数
            imbalance_ratio: 正例比例（默认 3%，对应高价值客户）
        
        Returns:
            X: 特征矩阵 (n_samples, 10)
            y: 标签 (n_samples,)
        """
        np.random.seed(self.random_state)
        
        # 正例（高价值客户）：特征均值较高
        n_pos = int(n_samples * imbalance_ratio)
        X_pos = np.random.normal(loc=2.0, scale=1.5, size=(n_pos, 10))
        y_pos = np.ones(n_pos)
        
        # 负例（低价值客户）：特征均值较低
        n_neg = n_samples - n_pos
        X_neg = np.random.normal(loc=0.0, scale=1.0, size=(n_neg, 10))
        y_neg = np.zeros(n_neg)
        
        # 合并并打乱
        X = np.vstack([X_pos, X_neg])
        y = np.hstack([y_pos, y_neg])
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：训练数据（卡页 18 个月×50 SKU×30 天=27,000 条）、价格、季节、促销、竞品、评价数、复购率等特征，以及明确的正负样本或长短尾分组标签。

**输出**：处理后的训练集与类别权重、分层验证方案、阈值建议与少数类召回及长尾误差评估（卡页基线含长尾 RMSE 45%、积压率 28%），供算法与供应链团队使用。

## 执行步骤

1. 统计类别与分组分布，确认不平衡的具体来源。
2. 只在训练集上做 SMOTE 过采样并设置类别权重。
3. 采用分层交叉验证，保证每折都含头部与长尾样本。
4. 调整判定阈值以匹配业务代价，权衡召回与精确率。
5. 在保持真实分布的测试集上评估并输出结论。

## 边界与不做

- 何时不用：不平衡并非主要矛盾（少数类样本量已足够）时不要用；标签错误或特征缺失要先修数据。
- 能力边界：产出训练方案与评估，不承诺具体收益；¥12 万/月等为卡页案例值。
- 安全边界：重采样仅限训练集，测试集必须保持真实分布，个体数据不得对外披露。

## 技能关联

- **前置**：Skill-Classification-Model-Evaluation、Skill-Data-Preprocessing-and-Cleaning
- **延伸**：Skill-Cost-Sensitive-Learning、Skill-Ensemble-Methods-for-Imbalanced-Data
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Cross-Validation-Strategy、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Hyperparameter-Tuning、Skill-Imbalanced-Data-Handling

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：12-ML基础　·　源卡：`Skill-Imbalanced-Data-Handling`