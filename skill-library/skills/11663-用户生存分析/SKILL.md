---
name: "p2s-customer-survival-analysis"
title: "Customer Survival Analysis — 用户生存分析"
description: "触发词：生存分析、Kaplan-Meier、Cox 比例风险、流失时点、月龄迁移、提前触达。何时不用：只想知道谁会流失用流失预测卡；要定位流失发生时点、判断在哪个生命周期节点提前介入时用本卡。安全边界：涉及宝宝月龄等育儿信息须最小化采集并获授权，不得用于推断儿童敏感信息或对外披露。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 分群"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-Customer-Survival-Analysis"
p2s_src_domain: "06-增长模型"
quality_tier: "preview"
user_summary: "算出用户在哪个阶段最容易流失，提前在那个节点做品类迁移的触达。"
user_try: "试试：这是我的用户首购、最近购买和宝宝月龄数据，帮我画生存曲线并找出流失高峰节点。"
whenToUse: "与「流失预测」相比：给个体风险分用那张卡；要按月龄或生命周期定位流失时点、设计提前触达窗口时用本卡。"
workflow: "整理首购日期、最近购买日期与月龄标签 → 用 Kaplan-Meier 估计各阶段生存曲线，定位流失高峰 → 用 Cox 模型量化月龄、购频等因子的风险比 → 在高峰节点前设计品类扩展触达并做对照验证"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Customer Survival Analysis — 用户生存分析

## ① 解决的问题

运营面临"母婴用户12月龄流失高峰无法提前预判"——KM存活曲线精确定位流失节点，提前触达品类扩展，复购率提升15-25%，年化价值20-40万元

## ② 核心算法逻辑

论文：The Concordance Index Decomposed: A Measure for Survival Model Predictive Performance | arXiv：1810.00048

## ③ 业务应用场景

场景：0-3岁母婴用户复购存活率建模，识别 12 月龄流失高峰
某母婴品牌拥有 5 万+ 历史用户，孩子从 0 岁开始购买婴儿奶粉/纸尿裤，随着孩子成长自然产生品类迁移需求（辅食、早教玩具、学步鞋）。但数据显示大量用户在宝宝 12 月龄前后（辅食添加期）静默流失。
数据要求：用户首购日期、最近一次购买日期、宝宝出生日期（或孩子月龄标签）、品类购买记录。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

复购率：55% → 74%（+19 pct）
年化新增营收：5000 名流失风险用户 × ¥380 = ¥190 万元
优惠券成本约 ¥30 万，净增 ROI ≈ 5.3x

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（284 行）。**下面 58 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，58 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-Customer-Survival-Analysis
生存分析：Kaplan-Meier + Cox PH 模型
母婴用户复购存活率建模
依赖：numpy, pandas, scipy
"""

import numpy as np
import pandas as pd
from scipy import stats
import warnings
warnings.filterwarnings('ignore')

# ─────────────────────────────────────────────
# 1. 生成 Mock 母婴用户数据
# ─────────────────────────────────────────────
np.random.seed(42)
N = 500

# 模拟用户特征
data = pd.DataFrame({
    'user_id': range(N),
    # 孩子月龄分组（0-6M / 6-12M / 12-24M / 24-36M）
    'age_group': np.random.choice(['0-6M', '6-12M', '12-24M', '24-36M'],
                                   N, p=[0.2, 0.25, 0.35, 0.2]),
    # 月均购买频次
    'monthly_freq': np.random.exponential(1.5, N).clip(0.1, 10),
    # 客单价（USD）
    'avg_order_value': np.random.normal(45, 15, N).clip(10, 120),
    # 是否购买过辅食
    'bought_solids': np.random.binomial(1, 0.35, N),
    # APP登录频次（周均）
    'app_logins_weekly': np.random.poisson(2.5, N),
})

# 生存时间：模拟不同月龄段流失风险不同
age_group_hazard = {'0-6M': 0.8, '6-12M': 1.2, '12-24M': 2.1, '24-36M': 1.5}
base_duration = np.random.exponential(180, N)

# 12月龄群体基础风险加倍
hazard_multiplier = data['age_group'].map(age_group_hazard).values
duration_adjusted = base_duration / hazard_multiplier

# 模拟删失（观察期未满）
observation_period = 365
data['duration'] = duration_adjusted.clip(1, observation_period)
data['event_observed'] = (duration_adjusted <= observation_period).astype(int)

# 辅食购买降低流失风险
data.loc[data['bought_solids'] == 1, 'duration'] *= 1.3
data['duration'] = data['duration'].clip(1, observation_period)

print("=" * 60)
print("📊 Mock 数据概览")
print(f"  总用户数: {N}")
print(f"  观测到流失事件: {data['event_observed'].sum()} ({data['event_observed'].mean():.1%})")
print(f"  平均存活时间: {data['duration'].mean():.1f} 天")
print("=" * 60)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1810.00048，但该号在 arXiv 上是《Power corrections and renormalons in parton quasi-distributions》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《The Concordance Index Decomposed: A Measure for Survival Model Predictive Performance》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：用户首购日期、最近一次购买日期、宝宝出生日期或月龄标签、品类购买记录；卡页为 5 万以上历史用户的 0–3 岁母婴场景。

**输出**：各月龄分组的生存曲线与流失高峰节点、风险比与提前触达建议（卡页复购率 55%→74%），供运营设计品类扩展与召回节奏。

## 执行步骤

1. 整理首购、末次购买与月龄标签，标注删失。
2. 用 Kaplan-Meier 估计生存曲线，找出流失高峰节点。
3. 用 Cox 模型估计月龄、购频等因子的风险比。
4. 在高峰节点前设定触达窗口与品类扩展内容。
5. 用对照实验评估复购率变化并迭代触达策略。

## 边界与不做

- 何时不用：缺少月龄或首购时间字段、删失比例过高时不要用；只需个体流失概率不必做生存建模。
- 能力边界：产出时点诊断与触达窗口建议，不代发触达；复购率 55%→74%、净 ROI≈5.3x 为卡页案例值。
- 安全边界：育儿与月龄信息须最小化采集并获授权，不得对外披露。

## 技能关联

- **可组合**：Skill-Customer-Survival-Analysis

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：06-增长模型　·　源卡：`Skill-Customer-Survival-Analysis`