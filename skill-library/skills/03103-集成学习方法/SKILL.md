---
name: "p2s-ensemble-methods"
title: "Skill Card: Ensemble Methods（集成学习方法）"
description: "触发词：集成学习、Boosting、Stacking、模型融合、销量与流失预测。何时不用：单模型已达标且样本量小，用「交叉验证策略」做稳健评估，做特征因果筛选用「因果特征工程」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 生命周期触达"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Ensemble-Methods"
p2s_src_domain: "12-ML基础"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把几个模型的结果集成起来，让销量预测和流失预测都比单模型更准，少缺货也少压货。"
user_try: "试试：我用单一 LightGBM 预测纸尿裤销量误差偏大，帮我做 Boosting 集成并对比 RMSE 改善。"
whenToUse: "本卡属需求预测的建模方法侧：单一模型效果到顶、样本量足够支撑多模型训练时用；样本不足或只想稳健评估模型表现，用交叉验证类技能。"
workflow: "准备商品属性、时间与平台特征的训练集 → 训练 XGBoost、LightGBM、CatBoost 等基模型 → 用 Bagging、Boosting 或 Stacking 集成并调参 → 对比 RMSE 与缺货率、积压率等业务指标后上线"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill Card: Ensemble Methods（集成学习方法）

## ① 解决的问题

单独用 XGBoost 预测流失 AUC=0.82，单独用 LightGBM AUC=0.81，单独用 Random Forest AUC=0.78

## ② 核心算法逻辑

一个模型的盲点，多个模型互补弥补——通过组合多个学习器的预测，利用"群体智慧"消除单一模型的系统性偏差或随机波动，在母婴电商的销量预测、流失预测中获得 1525% 的误差降低。

## ③ 业务应用场景

业务问题 某母婴跨境电商平台销售婴儿纸尿裤（SKU 数 500+），需预测未来 4 周销量以优化备货。单一 LightGBM 模型 RMSE=2,850 件/SKU，导致： - 畅销品缺货率 12%（损失销售额） - 滞销品积压率 18%（占用仓储成本 ¥8 万/月）
数据规模 - 训练集：36 个月历史销售数据，500 SKU × 156 周 = 78K 样本 - 特征：商品属性（品牌、规格、价格）+ 时间特征（周期、节假日）+ 平台特征（库存、评分、促销） - 基模型：XGBoost + LightGBM + CatBoost（处理类别特征）
量化产出 - Boosting 集成后 RMSE=2,180 件（↓23.4%） - 缺货率降至 6.2%（↓48%），额外销售额 ¥42 万/季度 - 积压率降至 9.1%（↓49%），仓储成本节省 ¥12 万/年 - 年化商业价值：¥168 万（销售额增长）+ ¥12 万（成本节省）= ¥180 万

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

销量预测：缺货率↓48% 增收 ¥168 万/年 + 积压率↓49% 节省 ¥12 万/年
流失预测：额外识别 120 用户/月 × 15% 挽留率 × ¥200 客单价 × 12 月 = ¥432 万/年
实施成本：GPU 训练 + 工程开发 ¥7 万一次性投入
✓ 易：代码实现相对标准化，sklearn/XGBoost 库成熟
需要 5-10K 样本量支撑多模型训练（母婴电商中小卖家可能数据不足）
线上推理延迟增加 50-100ms（需优化模型部署架构）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（364 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/ml_fundamentals/ensemble_methods` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/12-ML基础/Skill-Ensemble-Methods.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Ensemble Methods Toolkit for Mother-Baby E-commerce
母婴电商集成学习工具集 — Bagging / Boosting / Stacking
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, BaggingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.metrics import roc_auc_score, recall_score, precision_score, roc_curve
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')


# ============================================================================
# 1. 生成母婴电商模拟数据（用户流失预测）
# ============================================================================

def generate_motherbaby_data(n_samples=5000, random_state=42):
    """
    生成母婴平台用户流失预测数据集
    
    特征：
    - user_tenure: 用户注册时长（月）
    - purchase_frequency: 购买频率（次/月）
    - avg_order_value: 客单价（元）
    - browsing_hours: 月浏览时长（小时）
    - product_rating_avg: 购买产品平均评分
    - repurchase_rate: 复购率（%）
    - days_since_last_purchase: 距离最后购买天数
    
    标签：churn（1=流失，0=活跃）
    """
    np.random.seed(random_state)
    
    n = n_samples
    data = {
        'user_tenure': np.random.exponential(scale=12, size=n) + 1,  # 1-50月
        'purchase_frequency': np.random.gamma(shape=2, scale=1.5, size=n),  # 0-10次/月
        'avg_order_value': np.random.normal(loc=150, scale=80, size=n),  # 50-300元
        'browsing_hours': np.random.exponential(scale=5, size=n),  # 0-30小时
        'product_rating_avg': np.random.normal(loc=4.5, scale=0.6, size=n),  # 2-5分
        'repurchase_rate': np.random.beta(a=5, b=2, size=n) * 100,  # 0-100%
        'days_since_last_purchase': np.random.exponential(scale=20, size=n),  # 0-100天
    }
    
    X = pd.DataFrame(data)
    
    # 生成流失标签（逻辑：长时间未购买 + 低购买频率 → 高流失风险）
    churn_prob = (
        0.3 * (X['days_since_last_purchase'] > 60).astype(int) +
        0.25 * (X['purchase_frequency'] < 1).astype(int) +
        0.2 * (X['user_tenure'] < 3).astype(int) -
        0.15 * (X['repurchase_rate'] > 70).astype(int)
    )
    churn_prob = np.clip(churn_prob, 0, 1)
    y = (np.random.random(n) < churn_prob).astype(int)
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：36 个月历史销售数据（卡面示例为 500 SKU×156 周、78K 样本）、商品属性（品牌、规格、价格）、时间特征（周期、节假日）、平台特征（库存、评分、促销）；需 5-10K 以上样本量支撑多模型训练。

**输出**：集成模型的预测结果与 RMSE 改善、缺货率与积压率等业务指标变化、流失预测额外识别的用户数，输出给备货与用户运营决策。

## 执行步骤

1. 准备商品属性、时间与平台特征的训练集。
2. 训练 XGBoost、LightGBM、CatBoost 等基模型。
3. 用 Bagging、Boosting 或 Stacking 做集成并调参。
4. 对比 RMSE 与缺货率、积压率等业务指标后上线。

## 边界与不做

- 何时不用：样本量不足（少于约 5-10K）时多模型训练难以支撑，不建议用本技能。
- 能力边界：集成会带来约 50-100 毫秒的线上推理延迟，需配套部署优化；收益幅度随数据规模与基模型多样性变化。

## 技能关联

- **前置**：Skill-Cross-Validation-Techniques、Skill-Supervised-Learning-Fundamentals
- **延伸**：Skill-Feature-Engineering-for-Ecommerce、Skill-Hyperparameter-Tuning
- **可组合**：Skill-Anomaly-Detection、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting、Skill-Ensemble-Methods

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：12-ML基础　·　源卡：`Skill-Ensemble-Methods`