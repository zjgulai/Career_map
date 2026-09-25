---
name: "p2s-hyperparameter-optimization"
title: "Hyperparameter Optimization（超参调优）"
description: "触发词：超参调优、Optuna、贝叶斯优化、网格搜索、加权损失、销量预测。何时不用：模型结构选型或特征工程问题不要用调参掩盖；要在给定模型上按业务损失（如库存成本）搜出更优超参时用本卡。安全边界：调参须在固定验证集与业务约束下进行，不得用测试集反复试参造成过拟合，业务损失函数须经业务确认。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 业务工具实现"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-Hyperparameter-Optimization"
p2s_src_domain: "12-ML基础"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把模型超参按业务损失调优，让销量预测更准，直接减少备货积压和缺货。"
user_try: "试试：这是我的 6 个月销量、促销日历和竞品价格数据，帮我用 Optuna 调 XGBoost 和 LightGBM 的超参，目标是把 RMSE 压下来。"
whenToUse: "与「不平衡数据处理」相比：样本分布问题走那张卡；模型表现已合理但需要按业务损失进一步榨精度时用本卡。"
workflow: "准备历史销量、促销日历、竞品价格等特征与固定验证集 → 定义超参空间（树深度、学习率、采样比、叶子数、集成权重） → 以业务加权损失为目标跑贝叶斯或 Hyperband 搜索 → 对比调优前后指标并评估对备货与缺货的业务影响"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Hyperparameter Optimization（超参调优）

## ① 解决的问题

默认参数的 XGBoost 流失预测 AUC=0.78，希望通过超参调优提升到 0.82+

## ② 核心算法逻辑

模型的"超参"是调控性能的旋钮——系统化搜索最优组合，比手动试错快 10100 倍。 超参调优通过智能采样策略，在有限计算预算内找到接近全局最优的配置。

## ③ 业务应用场景

业务问题： - 母婴品类销量预测直接影响备货决策。某头部品牌纸尿裤 SKU 众多（>500），默认 XGBoost+LightGBM 集成模型 RMSE=12.5 件/天，导致： - 过度备货：积压资金 ¥240 万/月（按 ¥20/件、库存周期 30 天） - 缺货风险：每缺货 1 件损失 ¥8 毛利 + ¥50 品牌信誉成本
调优方案： - 数据：6 个月历史销量 + 促销日历 + 竞品价格，共 15K 样本 - 超参空间：XGBoost 的 `max_depth`、`learning_rate`、`subsample`；LightGBM 的 `num_leaves`、`feature_fraction`；集成权重 `w_xgb`、`w_lgb` - 调优策略：Optuna + 自定义损失函数（加权 RMSE，考虑库存成本） - 50 trials，耗时 8 小时（每 trial 10 分钟 CV 训练）
量化产出： - RMSE 从 12.5 → 9.6 件/天，降低 23% - 备货成本节省 ¥12.4 万/月（库存周期缩短 6 天，资金占用减少） - 缺货率从 8.2% → 3.1%，新增销售 ¥18.6 万/月 - 总 ROI：(18.6 + 12.4) / 调优成本(¥0.5 万人力) = 620% / 月

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

易：Grid Search / Random Search（无需额外库，sklearn 内置）
中：Bayesian Optimization（需理解采集函数，建议用 Optuna）
难：Hyperband + 业务约束（需自定义损失函数、分层 CV）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（347 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 55 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/ml_fundamentals/hyperparameter_optimization` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/12-ML基础/Skill-Hyperparameter-Optimization.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Hyperparameter Optimization Toolkit
超参调优工具集 — Grid / Random / Bayesian (Optuna) / Hyperband
母婴跨境电商应用：销量预测、转化率预测
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import GridSearchCV, RandomizedSearchCV, StratifiedKFold, cross_val_score
from sklearn.metrics import roc_auc_score, mean_squared_error
from sklearn.ensemble import RandomForestClassifier
from scipy.stats import uniform, randint
import warnings
warnings.filterwarnings('ignore')


# ============================================================================
# 1. 生成母婴电商示例数据
# ============================================================================

def generate_ecommerce_data(n_samples=1000, n_features=20, random_state=42):
    """
    生成母婴电商数据集
    - 分类任务：转化率预测（y=0/1）
    - 特征：用户行为、商品属性、季节性等
    """
    np.random.seed(random_state)
    
    X = np.random.randn(n_samples, n_features)
    # 模拟真实转化率：某些特征强相关
    y = (X[:, 0] + 0.5 * X[:, 1] - 0.3 * X[:, 2] + 0.2 * np.random.randn(n_samples) > 0).astype(int)
    
    feature_names = [f'feature_{i}' for i in range(n_features)]
    return X, y, feature_names


# ============================================================================
# 2. Grid Search（超参 < 5 个时推荐）
# ============================================================================

def grid_search_baseline(X, y, cv=3, n_jobs=-1):
    """
    Grid Search：遍历所有指定超参组合
    - 优点：保证找到网格内最优
    - 缺点：维度灾难（10 个参数各 3 个值 = 3^10 = 59049 次训练）
    """
    print("\n[Grid Search] 开始遍历所有超参组合...")
    
    param_grid = {
        'max_depth': [3, 5, 7],
        'min_samples_split': [2, 5, 10],
        'min_samples_leaf': [1, 2, 4],
    }
    
    gs = GridSearchCV(
        RandomForestClassifier(n_estimators=50, random_state=42),
        param_grid,
        cv=cv,
        scoring='roc_auc',
        n_jobs=n_jobs,
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：建模数据与标签（卡页 6 个月历史销量 + 促销日历 + 竞品价格，共 15K 样本）、固定验证与测试切分、业务损失函数定义（卡页为考虑库存成本的加权 RMSE）。

**输出**：最优超参组合与搜索结果记录、调优前后误差对比（卡页 RMSE 12.5→9.6，降 23%）与对备货成本、缺货率的业务影响评估，供算法与供应链团队使用。

## 执行步骤

1. 固定验证与测试切分，明确业务损失函数。
2. 定义超参搜索空间与预算（卡页 50 trials）。
3. 用 Optuna 或 Hyperband 执行搜索并记录每轮结果。
4. 用同一验证协议对比调优前后指标，规避过拟合。
5. 输出最优参数与业务影响评估（备货、缺货）。

## 边界与不做

- 何时不用：数据量过小、验证集不独立或损失函数未与业务对齐时不要用；特征缺陷或标签错误无法靠调参解决。
- 能力边界：产出参数与评估结论，不负责上线；RMSE 12.5→9.6、ROI 620%/月为卡页单案例测算。
- 安全边界：不得用测试集反复试参，业务损失函数须业务确认。

## 技能关联

- **前置**：Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Model-Selection
- **延伸**：Skill-AutoML、Skill-Ensemble-Learning
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Business-Metric-Design、Skill-Cross-Validation、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Hyperparameter-Optimization.html、Skill-Hyperparameter-Optimization

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：12-ML基础　·　源卡：`Skill-Hyperparameter-Optimization`