---
name: "p2s-points-expiry-redemption-liability-model"
title: "Points Expiry Redemption Liability Model — 积分过期负债精算与兑换率动态定价"
description: "触发词：积分负债、兑换率精算、Breakage、过期策略、递延收入。何时不用：要算用户流失的财务损失用「流失财务影响量化」；要算促销活动的真实 ROI 用「促销供应侧 ROI」。安全边界：积分负债与收入确认涉及会计准则，须经财务与审计确认；结论不代替会计判断。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-016"
l3_business: "经济性分析"
l3_all: "经济性分析 / 会员活动"
l1_l2_l3: "经营管理/财务与合规/经济性分析"
p2s_card_id: "Skill-Points-Expiry-Redemption-Liability-Model"
p2s_src_domain: "06-增长模型"
quality_tier: "preview"
user_summary: "用历史兑换率估算积分负债的真实区间，并比较提前提醒、延期和静默过期三种策略对利润的影响。"
user_try: "试试：按 150 万积分和历史兑换记录估算负债区间，比较提前 30 天提醒与静默过期的 P&L 影响。"
whenToUse: "需要估算积分负债区间并为过期策略做 P&L 模拟时用本技能；流失损失量化用「流失财务影响量化」；促销真实 ROI 用「促销供应侧 ROI」。"
workflow: "汇总历史积分发放、兑换与过期记录 → 按用户分群估算兑换率分布 → 计算悲观、基准与乐观三情景下的真实负债区间 → 模拟提醒、延期与静默过期策略对 P&L 的影响"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Points Expiry Redemption Liability Model — 积分过期负债精算与兑换率动态定价

## ① 解决的问题

CFO面临"积分负债估算误差±$3000影响月度P&L准确性、过期策略不当导致积分成本倒挂"——贝叶斯兑换率精算+动态积分价值调整将负债估算误差降至±$800，年化节省积分成本3-5万元

## ② 核心算法逻辑

积分计划的财务核心被大多数运营人员忽视：每发出 100 分，就在资产负债表上产生一笔负债——这 100 分未来可能被兑换成价值 $1 的优惠券，意味着 $1 的递延收入（Deferred Revenue）被挂在账上。当积分负债规模过大时，会直接压缩利润空间。

## ③ 业务应用场景

业务问题：独立站运营 12 个月积分体系，积累了 150 万积分（1积分=1美分），账面积分负债 $15,000。但会计发现这 $15,000 其实可能是 $8,000（按历史 53% 兑换率）或 $15,000（若突然搞积分促销导致兑换率跳升到 100%）。当前财务不确定性严重影响月度 P&L 准确性。
数据要求： - 历史积分发放记录（每条购买产生的积分） - 历史积分兑换记录（用于估算兑换率） - 积分过期日志（过期未兑换的积分）
分析步骤： 1. 估算用户级别的兑换率分布（高价值用户兑换率高达 85%，低活跃用户仅 20%） 2. 计算当前真实积分负债区间（悲观/基准/乐观三情景） 3. 设计过期策略：提前 30 天提醒（提升兑换，降低负债不确定性）vs 延期（保留用户）vs 静默过期（提高 Breakage） 4. 模拟不同过期策略对 P&L 的影响

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：积分体系年化发放成本 $10 万规模，精算优化后 Breakage 控制在 25-30%（vs 随意设计的 10% 或 50%），年化节省积分成本 $3-5 万；同时避免 IFRS 15 合规风险（积分负债误报可能触发审计）
实施难度：⭐⭐☆☆☆（主要工作是数据清洗和分析建模，无工程实现难度，1-2 周可出完整分析）
优先级：⭐⭐⭐⭐☆（积分体系上线前必做的精算工作，避免"体系越成功、亏损越多"的反直觉陷阱）
评估依据：MSOM 2019 MIT/Stanford 实证研究显示动态积分价值调整比静态定价利润提升 8-15%；IJRM 2025 在航空里程数据上验证，Breakage 估算误差 < 3%（vs 行业常用简单方法误差 15-30%）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（262 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Points Expiry Redemption Liability Model
积分过期负债精算 + 兑换率预测 + 动态积分价值调整

依赖：numpy, pandas, scipy
"""

import numpy as np
import pandas as pd
from scipy.stats import beta as beta_dist
from typing import List, Dict, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')


# ─────────────────────────────────────────────
# 1. 模拟积分历史数据
# ─────────────────────────────────────────────

def generate_points_history(n_users: int = 800, n_months: int = 12) -> pd.DataFrame:
    """生成积分发放/兑换/过期历史记录"""
    np.random.seed(42)
    records = []

    for uid in range(n_users):
        # 用户类型：高活跃(20%) / 中等(50%) / 低活跃(30%)
        user_type = np.random.choice(['high', 'mid', 'low'], p=[0.2, 0.5, 0.3])
        monthly_earn = {'high': 200, 'mid': 80, 'low': 25}[user_type]
        redeem_prob = {'high': 0.85, 'mid': 0.55, 'low': 0.20}[user_type]

        for month in range(n_months):
            # 每月积分发放（随购买行为）
            if np.random.random() < {'high': 0.9, 'mid': 0.65, 'low': 0.35}[user_type]:
                earned = max(0, int(np.random.normal(monthly_earn, monthly_earn * 0.3)))
                redeemed = 0
                expired = 0

                # 3 个月前发放的积分（到期）
                if month >= 3:
                    old_earn_ref = earned  # 简化：以当月为参考
                    if np.random.random() < redeem_prob:
                        redeemed = int(old_earn_ref * np.random.uniform(0.5, 1.0))
                    else:
                        expired = int(old_earn_ref * np.random.uniform(0.3, 0.8))

                records.append({
                    'user_id': f'U{uid:04d}',
                    'user_type': user_type,
                    'month': month,
                    'points_earned': earned,
                    'points_redeemed': min(redeemed, earned),
                    'points_expired': expired,
                })

    return pd.DataFrame(records)


# ─────────────────────────────────────────────
# 2. 兑换率分布估算（贝叶斯）
# ─────────────────────────────────────────────
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2506.03911 — Learning Fair And Effective Points-Based Rewards Programs

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：历史积分发放记录（每笔购买产生的积分）、历史兑换记录与过期日志，需可按用户分群与月份归集。

**输出**：用户分群兑换率分布、三情景积分负债区间，以及不同过期策略下的 P&L 影响对比与 Breakage 控制建议。

## 执行步骤

1. 汇总积分发放、兑换与过期历史记录
2. 按用户分群估算兑换率分布
3. 算出悲观、基准与乐观三情景负债区间
4. 模拟三种过期策略对 P&L 与 Breakage 的影响
5. 给出积分价值与过期策略建议

## 边界与不做

- 积分历史不足 3 个月或缺少过期日志时不适用，兑换率分布无法估计
- 只做精算与策略模拟，负债确认与收入分摊须经财务与审计按准则判断
- 积分促销会显著跳升兑换率，情景假设须标注并在促销后重新校准

## 技能关联

- **前置**：Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-FBA-Fee-Waterfall-Attribution.html、Skill-FBA-Fee-Waterfall-Attribution、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-Loyalty-Program-ROI-Modeling.html、Skill-Loyalty-Program-ROI-Modeling、Skill-Member-Lifecycle-Intervention-Sequencing.html、Skill-Member-Lifecycle-Intervention-Sequencing、Skill-Membership-Tier-Design-Optimization.html、Skill-Membership-Tier-Design-Optimization
- **延伸**：Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-FBA-Fee-Waterfall-Attribution.html、Skill-FBA-Fee-Waterfall-Attribution、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-Member-Lifecycle-Intervention-Sequencing.html、Skill-Member-Lifecycle-Intervention-Sequencing
- **可组合**：Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-Points-Expiry-Redemption-Liability-Model

---

> 分类：经营管理/财务与合规/经济性分析　·　技术族：06-增长模型　·　源卡：`Skill-Points-Expiry-Redemption-Liability-Model`