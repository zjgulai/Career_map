---
name: "p2s-causal-forest-hte-experiment"
title: "因果森林异质处理效应 — 实验数据挖掘个体级 CATE"
description: "触发词：因果森林、异质处理效应、个体效应估计、实验分群、精准投放、效应放大。何时不用：只需判断实验整体是否有效用「促销效果因果评估」；要从观测数据学策略用「观测数据策略学习」。安全边界：效应估计基于聚合特征，不得输出个体识别信息，也不得基于个人身份信息定价。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-078"
l3_business: "促销规划"
l3_all: "促销规划 / 分群"
l1_l2_l3: "业务运营/渠道经营/促销规划"
p2s_card_id: "Skill-Causal-Forest-HTE-Experiment"
p2s_src_domain: "02-A_B实验"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "同一张主图对不同人效果差很多：把实验数据挖到子群层面，只对真正有效的人群投放。"
user_try: "试试：我的主图 A/B 实验平均只涨 2%，帮我用因果森林看看哪些人群涨得多、该重点投给谁。"
whenToUse: "当 A/B 实验只给出平均效应、而你想知道谁对处理最敏感以做精准投放时用本技能；若只需判断实验整体是否有效，用「促销效果因果评估」；若要从观测数据（非实验）学习策略，用「观测数据策略学习」。"
workflow: "整理实验分组、结果变量与用户特征矩阵 → 用因果森林（诚实分裂）估计个体条件平均处理效应与区间 → 输出效应分布与特征重要性排序 → 按效应阈值圈出高响应用户群 → 只对该群体投放并复核平均转化率变化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 因果森林异质处理效应 — 实验数据挖掘个体级 CATE

## ① 解决的问题

运营面临"全量用户施同一促销力度导致高价值用户补贴过度浪费"——因果森林HTE精准识别异质处理效应将促销ROI提升35%，年化节省无效补贴40-80万元

## ② 核心算法逻辑

异质处理效应（Heterogeneous Treatment Effects, HTE） 指不同用户群体对同一处理的响应程度不同。传统 A/B 测试只报告平均处理效应（ATE），而因果森林（Causal Forest, Wager & Athey 2018）估计每个用户的条件平均处理效应 $\tau(x) = E[Y(1) Y(0) | X = x]$。

## ③ 业务应用场景

场景1：婴儿推车 Listing 优化——按买家属性个性化方案 - 业务问题：A/B 测试显示新主图 ATE = +2% CVR，但运营怀疑对"二胎家庭"效果更好 - 数据要求：用户特征（设备类型、历史类目、购买周期、评价行为）+ 实验分组 + CVR - 方法：Causal Forest 估计各子群 CATE，输出个体重要性特征排序 - 预期产出：发现"历史购买>2次婴儿车" 子群 CATE = +8%，首购用户 CATE = +0.5%（接近无效） - 业务价值：仅对高 CATE 用户推送新主图，平均 CVR 提升 5%（vs 全量 2%），年化 GMV +40 万元
场景2：复购激励金额 A/B 测试——找最优个性化金额 - 业务问题：5 元 vs 10 元优惠券哪个最优？ATE 差异不显著 - 数据要求：用户 LTV 分层、购买间隔、品类偏好、历史折扣敏感度 - 方法：Causal Forest 分析处理效应异质性，识别"价格敏感"子群 vs "忠实用户"子群 - 预期产出：价格敏感群体对 10 元券 CATE=+15%，忠实用户对 5 元券 CATE=+8%（浪费更少） - 业务价值：差异化优惠策略节省优惠券成本 30%，同时提升整体复购率 6%
**三轨验证**： - 成本：`grf` 包（R）或 `econml` 包（Python），无需额外数据采集 - 合规：CATE 估计基于聚合特征，不输出个体识别信息；符合 Amazon ToS（不基于 PII 定价） - 风险：样本量 < 1000 时因果森林不稳定，需 bootstrap 置信区间验证

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：HTE 精准分组可将 A/B 测试价值放大 2-3×，对高响应群体集中投放，每次实验额外 GMV 贡献 20-60 万元
实施难度：⭐⭐⭐⭐⭐（需 econml 或 grf，样本量要求高，推理计算重）
优先级：⭐⭐⭐⭐☆（适合月交易量 > 5,000 单的成熟卖家）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（154 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
因果森林 HTE 估计 — 母婴 A/B 实验个体处理效应
依赖：pip install econml numpy pandas scipy scikit-learn
"""
import numpy as np
import pandas as pd
from econml.grf import CausalForest
from econml.dml import CausalForestDML
from sklearn.ensemble import GradientBoostingRegressor, GradientBoostingClassifier
from scipy.stats import norm


def estimate_hte_causal_forest(
    Y: np.ndarray,
    T: np.ndarray,
    X: np.ndarray,
    n_estimators: int = 500,
    min_samples_leaf: int = 20,
) -> dict:
    """
    使用 Causal Forest 估计条件平均处理效应 (CATE)。
    返回：个体 CATE、ATE、置信区间、特征重要性
    """
    cf = CausalForest(
        n_estimators=n_estimators,
        min_samples_leaf=min_samples_leaf,
        honest=True,         # 诚实分裂
        inference=True,      # 开启推断（置信区间）
        random_state=42,
    )
    cf.fit(X, T, Y)

    tau_hat = cf.predict(X)           # 个体 CATE
    tau_lb, tau_ub = cf.predict_interval(X, alpha=0.1)  # 90% CI

    ate = float(np.mean(tau_hat))
    ate_se = float(np.std(tau_hat) / np.sqrt(len(tau_hat)))

    return {
        "cate": tau_hat,
        "cate_lower": tau_lb,
        "cate_upper": tau_ub,
        "ate": round(ate, 5),
        "ate_se": round(ate_se, 5),
        "ate_ci_95": (round(ate - 1.96 * ate_se, 5), round(ate + 1.96 * ate_se, 5)),
        "feature_importances": cf.feature_importances_,
    }


def estimate_hte_dr_learner(
    Y: np.ndarray,
    T: np.ndarray,
    X: np.ndarray,
) -> dict:
    """
    Double-Robust Causal Forest（DML 框架）
    适合处理倾向得分不均匀或结果方差大的情况
    """
    model_y = GradientBoostingRegressor(n_estimators=100, max_depth=3, random_state=42)
    model_t = GradientBoostingClassifier(n_estimators=100, max_depth=3, random_state=42)
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：实验数据：处理分配、结果变量（如转化率或购买）、用户特征矩阵（设备、历史类目、购买周期、评价行为等）；卡页建议样本量不低于 1000；粒度为用户 × 实验。

**输出**：每个用户的条件平均处理效应估计与置信区间、特征重要性排序与高响应子群清单；供运营把投放集中到高效应人群，放大实验收益。

## 执行步骤

1. 整理实验分组、结果变量与用户特征
2. 用因果森林估计个体效应与置信区间
3. 输出效应分布与特征重要性排序
4. 按效应阈值圈出高响应子群
5. 对该子群投放并复核整体转化率变化

## 边界与不做

- 数据不满足：样本量低于 1000 时因果森林不稳定，需用自助法置信区间验证后再用。
- 何时不用：只看平均效应用「促销效果因果评估」；观测数据学策略用「观测数据策略学习」。
- 能力边界：只做效应估计与分群，不含投放系统改造与线上评分服务。
- 安全边界：效应估计基于聚合特征，不输出个体识别信息，不得基于个人身份信息定价。

## 技能关联

- **可组合**：Skill-Causal-Forest-HTE-Experiment

---

> 分类：业务运营/渠道经营/促销规划　·　技术族：02-A_B实验　·　源卡：`Skill-Causal-Forest-HTE-Experiment`