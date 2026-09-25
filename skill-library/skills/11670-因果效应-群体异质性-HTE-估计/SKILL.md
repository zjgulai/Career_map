---
name: "p2s-dml-cohort-causal-effect"
title: "DML Cohort 因果效应 - 群体异质性 HTE 估计"
description: "触发词：异质性处理效应、CATE 估计、双机器学习、分群响应差异、促销分层投放。何时不用：只看整体活动增量用增量分析与合成控制类技能，本技能估计的是不同人群之间的效应差异。安全边界：宝宝生日等注册信息采集须获明确授权并遵守儿童数据保护规定，促销券发放不得涉及虚假宣传或价格欺诈。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-101"
l3_business: "分群"
l3_all: "分群 / 促销规划"
l1_l2_l3: "业务运营/品牌与增长/分群"
p2s_card_id: "Skill-DML-Cohort-Causal-Effect"
p2s_src_domain: "01-因果推断"
quality_tier: "preview"
user_summary: "算清楚同一张券对不同人群到底带来多少增量，别再一刀切发券。"
user_try: "试试：估计新生儿满减券在不同月龄与客单价人群上的 CATE，告诉我们该优先投哪一群。"
whenToUse: "干预（发券、拉新、订阅）总体 ROI 平平、怀疑不同人群响应差异大且需要分群估计时用本技能；只估整体增量用增量分析类技能，只做人群切分不做因果估计用分群类技能。"
workflow: "准备高维协变量与干预、结果变量 → 双模型残差化消除混杂 → PCA 降维后聚类成 cohort → 估计每个 cohort 的 CATE → 按效应强度重配投放"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# DML Cohort 因果效应 - 群体异质性 HTE 估计

## ① 解决的问题

平台对所有新妈妈用户统一发放"新生儿满减券",ROI 整体回归到 1.2-1.5x,猜测某些群体响应强、某些群体弱,但不知如何切分 - 数据要求:用户注册时填写宝宝生日 + 高维行为日志(2000 维:RFM、品类偏好、渠道、地理) - DML 配置: - 第一阶段:XGBoost 拟合 $E[Y|X]$,LightGBM 拟合 $E[D|X]$ - PCA 降维至 10 维,K-mea

## ② 核心算法逻辑

电商场景中"促销/拉新/订阅"等干预对不同用户群体(cohort)效应差异巨大,但传统 A/B 难以分群估计。DML(Double Machine Learning)通过双稳健残差化消除高维混杂,Neyman 正交性保证 ML 估计偏差对因果参数为二阶小量,PCA+Kmeans cohort 特征化给出每个客户的个体 CATE。

## ③ 业务应用场景

- 业务问题:平台对所有新妈妈用户统一发放"新生儿满减券",ROI 整体回归到 1.2-1.5x,猜测某些群体响应强、某些群体弱,但不知如何切分 - 数据要求:用户注册时填写宝宝生日 + 高维行为日志(2000 维:RFM、品类偏好、渠道、地理) - DML 配置: - 第一阶段:XGBoost 拟合 $E[Y|X]$,LightGBM 拟合 $E[D|X]$ - PCA 降维至 10 维,K-means K=5 群体(囤货型/品牌敏感型/价格敏感型/全品类型/跨境首购型) - 输出每个 cohort 的 CATE β_k - 业务价值:识别"0-3 月龄高客单价用户响应最强 (CATE 75
三轨验证： - 成本：数据采集需接入用户注册信息及 2000 维行为日志，数据清洗与特征工程约 2 人月；计算资源需 Spark 集群（日均 500 核时），人力含 1 名数据科学家 + 1 名工程师，年成本约 80-120 万元。 - 合规：需确保用户注册信息（宝宝生日）采集获得明确授权，符合《个人信息保护法》及 GDPR 关于儿童数据保护的特殊规定；促销券发放不得涉及虚假宣传或价格欺诈，需符合《广告法》及 Amazon 平台公平定价政策。 - 风险：若过度聚焦高 CATE 群体（0-3 月龄高客单价用户），可能导致该群体促销疲劳，引发用户反感或投诉；竞品可能针对性跟进，引发局部价格战；平台
- 业务问题:评估"首单立减"对不同孕/育阶段用户 12 月 LTV 的因果效应,以确定是按月龄分层投放还是统一投放 - 数据要求:用户月龄分段 + 12 月消费 LTV + 高维控制变量 - BGATE 配置(扩展):平衡协变量分布消除"用户质量差异",分离纯月龄效应 - 业务价值:发现 7-12 月龄用户 LTV CATE 最高(刚需密集期),集中投放该群体使首单优惠 ROI 提升 40-60%;年化拉新成本节省 800-1200 万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

易处:EconML 开源 + sklearn,工程实现成熟
难处:需要严格保证 SUTVA、unconfoundedness,业务团队需要因果推断 sense
难处:亿级数据需要 Spark 分布式实现(EconML 单机可跑千万级)

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（76 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/causal_inference/dml_cohort_causal_effect` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/01-因果推断/Skill-DML-Cohort-Causal-Effect.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
DML Cohort CATE 最小骨架
论文 arXiv:2409.02332 (Amazon, ECML PKDD 2023)
基于 EconML (开源) + sklearn
"""
from __future__ import annotations
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, GradientBoostingClassifier
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans

try:
    from econml.dml import LinearDML
    HAS_ECONML = True
except ImportError:
    HAS_ECONML = False


def simulate_baby_ecom_data(n: int = 5000, seed: int = 42) -> tuple:
    rng = np.random.default_rng(seed)
    X = rng.standard_normal((n, 50))
    baby_age_months = rng.integers(0, 24, n)
    X[:, 0] = baby_age_months / 24.0

    propensity = 1.0 / (1.0 + np.exp(-0.3 * X[:, 0] - 0.5 * X[:, 1]))
    D = (rng.random(n) < propensity).astype(int)

    true_cate = 50.0 + 30.0 * (1 - baby_age_months / 24.0)
    Y = 200.0 + true_cate * D + 20.0 * X[:, 0] + rng.standard_normal(n) * 50.0
    return X, D, Y, baby_age_months, true_cate


def build_cohort_features(X: np.ndarray, n_components: int = 10, n_clusters: int = 5) -> np.ndarray:
    pca = PCA(n_components=n_components).fit_transform(X)
    kmeans = KMeans(n_clusters=n_clusters, random_state=0, n_init=10).fit(pca)
    dists = kmeans.transform(pca)
    psi = 1.0 / (dists + 1e-8)
    psi = psi / psi.sum(axis=1, keepdims=True)
    return psi


def fit_dml_cohort_cate(X: np.ndarray, D: np.ndarray, Y: np.ndarray, psi: np.ndarray):
    if not HAS_ECONML:
        raise ImportError("Install econml: pip install econml")
    model = LinearDML(
        model_y=GradientBoostingRegressor(n_estimators=100),
        model_t=GradientBoostingClassifier(n_estimators=100),
        featurizer=None,
        cv=3,
        random_state=42,
    )
    model.fit(Y, D, X=psi, W=X)
    return model


def main() -> None:
    X, D, Y, ages, true_cate = simulate_baby_ecom_data()
    psi = build_cohort_features(X)
    print(f"Cohort feature shape: {psi.shape}")
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2409.02332 — Double Machine Learning at Scale to Predict Causal Impact of Customer Actions

核验口径：主题指向成立但强度不足（词重合 0.25／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：用户注册信息（如宝宝生日）与高维行为日志（卡页口径 2000 维：RFM、品类偏好、渠道、地理）、干预变量与结果变量的历史数据；亿级数据需要分布式计算资源。

**输出**：每个 cohort 的 CATE 估计与人群画像（如囤货型、品牌敏感型、价格敏感型），以及按效应强度重配的促销投放建议；卡页口径把首单优惠集中投放给最高效应人群可使 ROI 提升 40-60%。

## 执行步骤

1. 准备高维协变量、干预变量与结果变量数据。
2. 分别拟合结果与干预的期望并做残差化处理，消除高维混杂。
3. 用 PCA 降维并对用户聚类，得到 cohort 划分。
4. 估计每个 cohort 的条件平均处理效应 CATE。
5. 按 CATE 强度重配券与预算投放，并跟踪效应衰减。

## 边界与不做

- 不满足 SUTVA 与无混淆假设、或拿不到协变量与干预记录时不要用，效应估计不可信。
- 能力边界：本技能输出效应估计与人群排序，不自动发券、不保证 ROI；过度聚焦高效应人群可能引发促销疲劳。卡页的 ROI 提升与成本节省为特定平台口径，外推需重新验证。
- 合规红线：宝宝生日等儿童相关数据采集须获明确授权，券与优惠发放不得涉及虚假宣传或价格欺诈。

## 技能关联

- **前置**：Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Intelligent-Prediction-Doubly-Robust.html、Skill-Intelligent-Prediction-Doubly-Robust
- **延伸**：Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling
- **可组合**：Skill-Cohort-Retention-Analysis.html、Skill-Cohort-Retention-Analysis、Skill-Promotion-Effectiveness.html、Skill-Promotion-Effectiveness、Skill-DML-Cohort-Causal-Effect

---

> 分类：业务运营/品牌与增长/分群　·　技术族：01-因果推断　·　源卡：`Skill-DML-Cohort-Causal-Effect`