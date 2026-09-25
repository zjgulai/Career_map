---
name: "p2s-causal-ml-feature-engineering"
title: "Causal ML Feature Engineering — 因果驱动的特征工程：消除混淆提升模型可靠性"
description: "触发词：因果特征工程、混淆变量、特征泄漏、因果DAG、模型可靠性。何时不用：要按口径衡量预测精度用「预测准确率MAPE体系」，做上线后的漂移修正用「自适应预测精准化」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Causal-ML-Feature-Engineering"
p2s_src_domain: "12-ML基础"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用因果图把广告花费、排名这类会骗模型的假相关特征挑出来，别让大促期间预测跑偏。"
user_try: "试试：帮我用因果 DAG 检查这批预测特征，标出哪些是混淆变量或下游变量并给出剔除建议。"
whenToUse: "本卡属需求预测的特征侧：离线指标好看但线上失真、怀疑特征里混入混淆或下游变量时用；评估已上线预测的准确率口径，用预测准确率体系类技能。"
workflow: "列出候选特征与促销日历等业务事件 → 绘制 DAG 判定混淆、下游与碰撞变量 → 剔除或改造问题特征并重训模型 → 对比剔除前后的离线与线上效果"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Causal ML Feature Engineering — 因果驱动的特征工程：消除混淆提升模型可靠性

## ① 解决的问题

需求预测模型加入广告花费特征后大促期预测严重失真——因果DAG识别广告花费是混淆变量而非需求原因，去除后大促期预测误差降低30-50%，年化减少备货决策失误10-40万元

## ② 核心算法逻辑

因果 DAG（有向无环图） 引导特征选择：

## ③ 业务应用场景

业务问题：吸奶器需求预测模型加入了广告花费、评论数量、BSR 排名等特征，训练集 R² = 0.87 很好——但实际预测时大促期间预测严重低估（促销期广告花费暴增，但销量增长比模型预测低）。
根本原因：广告花费是混淆变量（促销日历同时决定广告花费和销量），BSR 是下游变量（被销量决定），加入后模型学到了虚假相关。
数据要求： - 历史销量 + 候选特征（广告花费/BSR/评论数/价格/季节） - 至少 6 个月数据

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
大促期需求预测误差降低 30-50%：减少备货失误 ¥10-30 万/年
财务预测模型去除混淆变量：P&L 预测偏差减少，资金规划更准确
避免"特征泄漏"导致的模型过拟合：减少模型维护成本
年化综合 ROI：¥10-40 万
实施难度：⭐⭐☆☆☆（特征分类是思维工具，不需要复杂算法；DAG 绘制约 1 天，模型对比 1 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（141 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/ml_fundamentals/causal_ml_feature_engineering` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/12-ML基础/Skill-Causal-ML-Feature-Engineering.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Causal ML Feature Engineering
因果特征工程：识别混淆/碰撞变量，提升模型可靠性
"""
import numpy as np
from dataclasses import dataclass
from typing import Literal


@dataclass
class CausalFeature:
    """因果特征元数据"""
    name: str
    causal_role: Literal['direct_cause', 'confounder', 'collider', 'proxy', 'irrelevant']
    include_in_model: bool
    note: str


# 母婴电商需求预测的因果特征分类
DEMAND_FORECAST_FEATURES = [
    CausalFeature('price',           'direct_cause', True,  '价格直接影响销量'),
    CausalFeature('seasonality',     'direct_cause', True,  '季节直接影响需求'),
    CausalFeature('inventory_level', 'direct_cause', True,  '库存可用量限制销量'),
    CausalFeature('promo_event',     'direct_cause', True,  '促销活动直接驱动销量'),
    CausalFeature('holiday_flag',    'confounder',   True,  '节假日同时影响广告和销量，需控制'),
    CausalFeature('ad_spend',        'confounder',   False, '广告花费与销量共同受促销预算驱动，不加入'),
    CausalFeature('bsr_rank',        'proxy',        False, 'BSR是销量下游，非原因'),
    CausalFeature('review_count',    'proxy',        False, '评论数是历史销量代理，非原因'),
    CausalFeature('return_rate',     'collider',     False, '退货率被销量和质量共同决定，加入会产生碰撞偏差'),
]


def validate_causal_features(features: list[CausalFeature]) -> dict:
    """验证特征集合并生成报告"""
    included = [f for f in features if f.include_in_model]
    excluded = [f for f in features if not f.include_in_model]
    confounders_uncontrolled = [
        f for f in features
        if f.causal_role == 'confounder' and not f.include_in_model
    ]
    return {
        'included_features': [f.name for f in included],
        'excluded_features': [f.name for f in excluded],
        'causal_roles': {f.name: f.causal_role for f in features},
        'warnings': [
            f"WARNING: 混淆变量 '{f.name}' 未被控制，可能导致估计偏差"
            for f in confounders_uncontrolled
        ],
    }


def simulate_model_comparison(n_train: int = 500, n_promo: int = 100, seed: int = 42):
    """
    模拟对比：
    - 相关特征集（包含 ad_spend, bsr）
    - 因果特征集（只含直接原因和受控混淆）
    在大促期预测误差对比
    """
    np.random.seed(seed)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2405.11833，但该号在 arXiv 上是《Determination of the Néel vector in rutile altermagnets through x-ray magnetic circular dichroism: the case of MnF$_2$》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：历史销量与候选特征（广告花费、BSR、评论数、价格、季节等），至少 6 个月数据；需带促销日历等事件信息以识别混淆来源。

**输出**：特征因果角色判定报告（混淆、下游、有效特征）、剔除或改造后的特征集合与模型对比结果，输出给建模与需求计划团队。

## 执行步骤

1. 列出候选特征与促销日历等业务事件。
2. 绘制因果 DAG，判定混淆变量、下游变量与碰撞变量。
3. 剔除或改造问题特征并重训模型。
4. 对比剔除前后的离线指标与大促期预测误差。

## 边界与不做

- 何时不用：不足 6 个月数据或缺少促销日历等事件信息时无法识别混淆，不适用本技能。
- 能力边界：因果判定依赖业务假设，DAG 画错会误删有效特征；本技能只做特征层修正，不解决数据质量问题。

## 技能关联

- **前置**：Skill-Causal-Discovery-PC-Algorithm.html、Skill-Causal-Discovery-PC-Algorithm、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Operating-Cash-Flow-Forecast.html、Skill-Operating-Cash-Flow-Forecast、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard、Skill-Supply-Chain-ML-Features.html、Skill-Supply-Chain-ML-Features、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling
- **延伸**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Operating-Cash-Flow-Forecast.html、Skill-Operating-Cash-Flow-Forecast、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard、Skill-Supply-Chain-ML-Features.html、Skill-Supply-Chain-ML-Features、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling
- **可组合**：Skill-Operating-Cash-Flow-Forecast.html、Skill-Operating-Cash-Flow-Forecast、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard、Skill-Supply-Chain-ML-Features.html、Skill-Supply-Chain-ML-Features、Skill-Causal-ML-Feature-Engineering

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：12-ML基础　·　源卡：`Skill-Causal-ML-Feature-Engineering`