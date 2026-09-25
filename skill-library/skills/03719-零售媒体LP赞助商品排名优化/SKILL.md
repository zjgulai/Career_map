---
name: "p2s-retail-media-lp-ranking"
title: "零售媒体LP赞助商品排名优化"
description: "触发词：线性规划、广告位分配、影子价格、分时预算、零售媒体、排名优化。何时不用：单一广告位的手动竞价不必建模；要在多广告位、多广告主、预算与时段约束下求最优分配时用本卡。安全边界：只把自家可支配预算与出价作为决策变量，不得通过合谋或虚假点击影响他人排名。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Retail-Media-LP-Ranking"
p2s_src_domain: "13-广告分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把有限的广告预算按时段和广告位用线性规划分好，让每一块钱都花在出价最值的位置。"
user_try: "试试：这是我的广告位、出价、预算和分时段流量数据，帮我用线性规划分配 24 小时预算，并解释影子价格最高的时段。"
whenToUse: "与「搜索位置点击弹性」相比：位置弹性回答从第 3 页提到第 1 页值不值；在多个广告位与时段之间分配固定预算时用本卡的 LP 分配。"
workflow: "准备广告位数量、各广告主出价与预算约束 → 以位置 CTR 与出价构造收益与成本矩阵 → 用线性规划求解各时段各位置的预算分配 → 读影子价格识别流量价值最高的时段并优先冲顶"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 零售媒体LP赞助商品排名优化

## ① 解决的问题

运营面临站内广告位ROI低——LP排序算法将零售媒体点击收益提升37%，年化增收50万元

## ② 核心算法逻辑

零售媒体LP排名将广告位分配问题建模为线性规划（Linear Programming），在满足广告主预算约束的前提下，最大化平台总收益（或加权目标：收入/点击/相关性）。

## ③ 业务应用场景

场景A：Amazon SP广告关键词竞价排名
痛点：多个母婴品牌同时竞争"baby bottle sterilizer"首位，简单的最高出价者优先（greedy）策略导致预算集中消耗在头部时段，尾部时段流量空置。
LP方案：以小时级时段为约束单元，将24小时预算在不同时段、不同关键词位置间LP分配。影子价格揭示"下午2-4点婴儿用品搜索流量影子价格最高"，优先该时段冲顶排名。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

1800万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（165 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'for' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
零售媒体LP赞助商品排名优化
依赖: numpy, pandas, scipy, PuLP
安装: pip install pulp scipy numpy pandas
"""
import numpy as np
import pandas as pd
from scipy.optimize import linprog

np.random.seed(42)

# ── 问题设置：5个广告位，3个广告主 ───────────────────────────────
N_SLOTS = 5   # 广告位数量（位置1-5，CTR递减）
N_ADV = 3     # 广告主数量

# 位置CTR（由高到低）
slot_ctr = np.array([0.12, 0.08, 0.05, 0.03, 0.02])

# 广告主出价（每次点击CPC，美元）
bids = np.array([1.5, 2.0, 0.8])  # 广告主A/B/C

# 日预算约束（美元）
budgets = np.array([50.0, 30.0, 40.0])

# 预计每次展示成本（简化：CPC × CTR）
# r_ij = bid_j × ctr_i（展示收益）
# c_ij = bid_j × ctr_i（展示成本，同r_ij）
R = np.outer(slot_ctr, bids)   # shape: (N_SLOTS, N_ADV) — 收益矩阵
C = R.copy()                    # 成本矩阵（简化为同收益）

print("=" * 50)
print("收益矩阵 R[位置][广告主]:")
print(pd.DataFrame(R, 
    index=[f"位置{i+1}(CTR={slot_ctr[i]:.2f})" for i in range(N_SLOTS)],
    columns=[f"广告主{c}(出价${bids[j]:.1f})" for j, c in enumerate("ABC")]
).round(4).to_string())

# ── 使用PuLP构建LP（完整约束版）────────────────────────────────
try:
    import pulp

    prob = pulp.LpProblem("RetailMedia_LP_Ranking", pulp.LpMaximize)

    # 决策变量 x_ij: 广告主j是否占据位置i（连续松弛，0-1之间）
    x = pulp.LpVariable.dicts("x",
        [(i, j) for i in range(N_SLOTS) for j in range(N_ADV)],
        lowBound=0, upBound=1, cat='Continuous'
    )

    # 目标函数：最大化总收益
    prob += pulp.lpSum(R[i][j] * x[(i, j)]
                       for i in range(N_SLOTS)
                       for j in range(N_ADV))

    # 约束1：每个位置最多1个广告主
    for i in range(N_SLOTS):
        prob += pulp.lpSum(x[(i, j)] for j in range(N_ADV)) <= 1, f"slot_{i}"

    # 约束2：每个广告主最多占1个位置
    for j in range(N_ADV):
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2403.14862。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：广告位集合及各位置 CTR、自身出价与日预算约束、分时段的流量与竞争数据；卡页以小时为约束单元，需能拆到时段粒度。

**输出**：各时段与各广告位的最优预算分配方案、影子价格解读（哪一时段流量影子价格最高）与冲顶时段建议，供广告运营按时段执行。

## 执行步骤

1. 列出可选广告位、各位置 CTR 与自家预算上限。
2. 构造位置×广告主的收益与成本矩阵。
3. 用线性规划求预算在时段与位置间的最优分配。
4. 读取影子价格，找出流量价值最高的时段。
5. 输出分配方案与重点冲顶时段，落地后复盘点击收益。

## 边界与不做

- 何时不用：只有一个广告位、或没有时段级流量数据时不要用；纯手动竞价场景不必建模。
- 能力边界：产出分配方案与影子价格解读，不代投、不代改价；卡页年化增收 50 万元等来自单案例，需按自身预算重估。
- 安全边界：不得以任何方式干扰其他广告主的正常竞价或排名。

## 技能关联

- **前置**：Skill-Auction-Theory-Advertising-Bidding.html、Skill-Auction-Theory-Advertising-Bidding、Skill-Autobidding-Budget-Allocation-Optimization.html、Skill-Autobidding-Budget-Allocation-Optimization、Skill-QUBO-Ad-Budget-Allocation.html、Skill-QUBO-Ad-Budget-Allocation
- **延伸**：Skill-Constrained-Multi-Objective-Ad-Delivery.html、Skill-Constrained-Multi-Objective-Ad-Delivery、Skill-Keyword-Bid-Auto-Adjuster.html、Skill-Keyword-Bid-Auto-Adjuster、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Geo-Incrementality-DML.html、Skill-Geo-Incrementality-DML、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Retail-Media-LP-Ranking

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：13-广告分析　·　源卡：`Skill-Retail-Media-LP-Ranking`