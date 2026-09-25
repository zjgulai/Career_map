---
name: "p2s-double-debiased-ml-price"
title: "双重去偏机器学习价格弹性 — 高维混淆下的价格因果效应估计"
description: "触发词：双重去偏、DML 弹性、高维混淆、因果弹性估计、残差回归、弹性纠偏。何时不用：只想快速拿一条 log-log 基线弹性时用「需求价格弹性估算」；识别力量来自外生冲击时用「工具变量 IV 识别价格弹性」。安全边界：DML 结果不得直接用于自动定价或产生价格歧视，最终价格决策须人工审核。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性 / 组合设计"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-Double-Debiased-ML-Price"
p2s_src_domain: "01-因果推断"
quality_tier: "preview"
user_summary: "把方向都搞反的弹性估计拉回来：先剥离季节、竞品与促销的混淆，再问价格到底带来多少销量变化。"
user_try: "试试：我有 3 个月的每日价格、销量和竞品价格、促销标记，帮我用双重去偏机器学习估一版不被季节混淆的价格弹性。"
whenToUse: "当价格与销量之间存在高维混淆（季节、竞品行为、促销、用户构成）导致朴素回归方向都错时用本技能；若只要一条快速基线弹性，用「需求价格弹性估算」；若识别力量来自外生冲击，用「工具变量 IV 识别价格弹性」。"
workflow: "整理日级价格与销量面板，补齐竞品价格、搜索指数、促销标签、周几与月份等控制变量 → 按 K 折交叉拟合分别预测结果变量与处理变量 → 在残差上回归得到去偏弹性与其置信区间 → 与朴素 OLS 结果做偏差对照，判断原定价策略是否被误导 → 分价格区间复核弹性非线性，输出定价区间建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 双重去偏机器学习价格弹性 — 高维混淆下的价格因果效应估计

## ① 解决的问题

定价团队面临"OLS弹性估计-0.23而真实弹性-1.8导致定价策略反向"——DML高维去偏将弹性估计误差从1.57降至0.12，年化定价优化GMV约120万元

## ② 核心算法逻辑

问题：估计价格对销量的弹性时，直接用价格对销量做OLS回归会严重偏误。原因：价格与销量之间有大量混淆变量（促销季节、竞品行为、用户构成变化等），且这些混淆变量维度高（数十个特征），传统线性控制不够。

## ③ 业务应用场景

场景A：婴儿奶粉跨平台价格弹性估计 - 业务问题：历史数据显示高价期销量也高（因为旺季），低价期销量反而低（淡季），简单回归显示"价格升→销量升"的错误正相关。需要去除季节混淆估计真实弹性 - 数据要求：每日价格序列 + 每日销量序列（3个月以上）+ 控制变量（竞品价格/搜索指数/促销标签/周几/月份） - 预期产出：DML估计价格弹性 = -1.6（区间[-2.1, -1.1]），意味着降价10%可使销量净增16%；朴素OLS估计为+0.3（严重偏误，指向相反方向） - 业务价值：准确弹性指导定价策略：当弹性|-1.6|>1时，降价有利于总收益；优化价格区间可提升年化GMV约120万元
三轨对抗验证： 1. 成本验证：DML计算量是OLS的K倍（K=5折），约10-30分钟/次；scikit-learn即可实现，无特殊硬件需求 2. 合规验证：价格弹性估计是内部分析；注意不可用DML结果自动定价产生价格歧视（需人工审核最终价格决策） 3. 风险验证：交叉拟合中的ML模型过于复杂会导致残差过拟合；建议底层模型不超过100棵树；弹性在不同价格区间可能非线性，建议分区间估计
场景B：广告价格对销量增量的因果估计 - 业务问题：提高CPC出价后销量增加，但同期也做了促销，两者混淆严重 - 方案：DML控制促销、季节、竞品等混淆变量，单独估计广告出价对销量的因果弹性 - 业务价值：精准广告弹性指导出价策略，ROAS提升约10%，年化约40万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：弹性估计精度提升（从有偏OLS到无偏DML），指导降价/提价决策减少错误，年化定价优化GMV增量约120万元；广告出价弹性准确估计ROAS提升约10%（约40万元）
实施难度：⭐⭐⭐☆☆（DML框架理解需要一定计量基础；Python实现约150行；econml库内置DML支持）
优先级：⭐⭐⭐⭐⭐（价格弹性是电商最核心的因果参数，几乎所有定价决策都依赖它；传统OLS估计几乎必然有偏）
评估依据：Econometrica 2018年经济学顶刊，引用量5000+；Victor Chernozhukov（MIT）是计量经济学当代大师；econml/DoubleML库已在工业界广泛应用

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（139 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-Double-Debiased-ML-Price
双重去偏机器学习价格弹性估计

依赖：pip install numpy pandas scikit-learn scipy
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import KFold
from sklearn.metrics import r2_score
from scipy import stats

np.random.seed(42)

# ── 1. 生成模拟价格-销量数据（含混淆）────────────────────────────────
n = 500  # 500天的数据

# 混淆变量（同时影响价格和销量）
season_index      = np.sin(2*np.pi*np.arange(n)/365)  # 季节性
competitor_price  = 120 + 10*season_index + np.random.normal(0, 5, n)  # 竞品价格
promo_intensity   = np.random.beta(1, 4, n)  # 促销力度
search_volume     = 100 + 20*season_index + np.random.normal(0, 10, n)
dow_fe            = np.random.normal(0, 2, 7)[np.arange(n) % 7]  # 周固定效应

X = np.column_stack([season_index, competitor_price, promo_intensity,
                     search_volume, dow_fe])
feature_names = ['season','comp_price','promo','search','dow']

# 真实价格弹性（对数-对数模型）
TRUE_ELASTICITY = -1.8

# 价格（受混淆影响）
log_price = (np.log(100)
    + 0.3 * season_index    # 旺季涨价
    - 0.01 * promo_intensity  # 促销降价
    + 0.5 * np.log(competitor_price/120)  # 跟随竞品
    + np.random.normal(0, 0.03, n))

# 销量（真实弹性 + 混淆影响）
log_sales = (np.log(50)
    + TRUE_ELASTICITY * log_price  # 真实弹性
    + 0.5 * season_index            # 旺季销量好
    + 0.3 * promo_intensity          # 促销提升销量
    + 0.2 * np.log(search_volume/100)
    + np.random.normal(0, 0.05, n))

price = np.exp(log_price)
sales = np.exp(log_sales)

print(f"数据: {n}天, 均价={price.mean():.1f}元, 均销量={sales.mean():.1f}件")
print(f"真实弹性: {TRUE_ELASTICITY}")

# ── 2. 朴素OLS（有偏，展示混淆问题）─────────────────────────────────
from numpy.linalg import lstsq
X_naive = np.column_stack([np.ones(n), log_price])
beta_ols, _, _, _ = lstsq(X_naive, log_sales, rcond=None)
ols_elasticity = beta_ols[1]
print(f"\n【朴素OLS（直接回归，有混淆偏误）】")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：每日价格序列与每日销量序列（3 个月以上），以及控制变量：竞品价格、搜索指数、促销标签、周几、月份等；同类面板也适用于广告出价与销量的因果估计；粒度为 SKU 的日级观测。

**输出**：价格弹性的去偏估计与置信区间（并附与朴素 OLS 的偏差对照），用于定价区间与降价/提价策略判断；计算量约为 OLS 的 K 倍（K 为交叉拟合折数）。

## 执行步骤

1. 整理日级价格-销量面板并补齐季节、竞品、促销等控制变量
2. 用 K 折交叉拟合预测结果与处理变量并取残差
3. 在残差上回归得到去偏弹性及置信区间
4. 与朴素 OLS 估计做偏差对照，判断原策略是否被误导
5. 分价格区间复核非线性，输出定价区间建议

## 边界与不做

- 数据不满足：不足 3 个月日级序列或缺控制变量时不要做；底层模型建议不超过 100 棵树，否则残差易过拟合。
- 何时不用：快速基线弹性用「需求价格弹性估算」；要看用户子群效应用「因果森林异质处理效应」。
- 能力边界：只估弹性并给出策略含义，不做自动改价，也不覆盖广告-销量因果之外的投放执行。
- 安全边界：不得用 DML 结果自动定价形成价格歧视，最终价格决策必须人工审核。

## 技能关联

- **前置**：Skill-Causal-Attribution-Bridge.html、Skill-Causal-Attribution-Bridge、Skill-DML-Cohort-Causal-Effect.html、Skill-DML-Cohort-Causal-Effect、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Heterogeneous-Treatment-Effect-XLearner.html、Skill-Heterogeneous-Treatment-Effect-XLearner、Skill-IV-Instrumental-Variables.html、Skill-IV-Instrumental-Variables、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation
- **延伸**：Skill-Causal-Attribution-Bridge.html、Skill-Causal-Attribution-Bridge、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Heterogeneous-Treatment-Effect-XLearner.html、Skill-Heterogeneous-Treatment-Effect-XLearner、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation
- **可组合**：Skill-Causal-Attribution-Bridge.html、Skill-Causal-Attribution-Bridge、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-Double-Debiased-ML-Price

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：01-因果推断　·　源卡：`Skill-Double-Debiased-ML-Price`