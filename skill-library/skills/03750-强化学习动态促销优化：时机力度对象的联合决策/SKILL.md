---
name: "p2s-rl-dynamic-promotion-optimization"
title: "RL Dynamic Promotion Optimization — 强化学习动态促销优化：时机×力度×对象的联合决策"
description: "触发词：强化学习促销、时机力度对象、折扣动作空间、预算精准投放、退订率、增量成交。何时不用：只按增量响应分群分配预算用「个性化促销定向」；要把效应写成可读规则用「观测数据策略学习」。安全边界：折扣上限受 SKU 利润率约束，不得超出最大折扣空间；触达频次须合规，退订与骚扰须计入奖励惩罚。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-078"
l3_business: "促销规划"
l3_all: "促销规划 / 价格敏感性 / 分群"
l1_l2_l3: "业务运营/渠道经营/促销规划"
p2s_card_id: "Skill-RL-Dynamic-Promotion-Optimization"
p2s_src_domain: "15-营销投放分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把促销当成一个连续决策：什么时候发、发多大折扣、发给谁，一次学出来，预算不再平摊。"
user_try: "试试：我每月 $5,000 券预算平摊给 2,000 人，帮我用强化学习算出该给谁发、发多大折扣。"
whenToUse: "当促销的时机、力度与对象需要联合优化、且能持续拿到发券与不发券的对照反馈时用本技能；若只需在分群间分配预算，用「个性化促销定向」；若要产出可读规则交给运营，用「观测数据策略学习」。"
workflow: "整理历史发券与不发券的对照数据以及用户行为、生命周期价值特征 → 按 SKU 利润率确定各用户段的最大折扣空间 → 把促销动作离散成动作空间：不发、等待、10%、15%、20% 折扣 → 用强化学习以因果增量奖励训练策略 → 输出个性化折扣与时机建议并核对增量产出与退订率"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# RL Dynamic Promotion Optimization — 强化学习动态促销优化：时机×力度×对象的联合决策

## ① 解决的问题

每月平摊$5000优惠券给2000用户其中80%用户根本不会因券而改变购买决策——强化学习联合优化促销时机折扣力度和目标人群，增量GMV提升20-35%退订率降低30%年化ROI提升20-60万元

## ② 核心算法逻辑

静态促销 vs RL 动态促销：

## ③ 业务应用场景

业务问题：每月 $5,000 的优惠券预算，平均分给 2,000 名用户，人均 $2.5 的优惠。实际上只有 20% 的用户对优惠券敏感，其他 80% 的用户根本不会因为收到优惠券而改变购买决策。RL 将预算集中给最有可能被说服的用户，同时调整折扣力度。
数据要求： - 历史促销实验数据（发/未发券的 A/B 对照） - 用户行为特征（购买意图/距上次购买天数/CLV） - SKU 利润率（决定最大折扣空间）
预期产出： - 个性化促销策略：每个用户段的最优折扣和时机 - 预算分配优化：从"平摊"到"精准集中" - 增量 ROI：相比静态规则的真实增量收益对比

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
促销 ROI 提升 20-35%（同等预算，增量 GMV 更高）：月增 ¥3-10 万
退订率降低 30%（精准触达）：长期邮件营销健康度提升
促销预算节省（不发无效券）：月均节省 ¥2-5 万
年化综合 ROI：¥20-60 万
实施难度：⭐⭐⭐☆☆（需要历史 A/B 实验数据；Q-Learning 实现简单；因果奖励函数约 3-4 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（199 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/marketing/rl_dynamic_promotion_optimization` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/15-营销投放分析/Skill-RL-Dynamic-Promotion-Optimization.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
RL Dynamic Promotion Optimization
强化学习动态促销：时机×力度×目标三维联合优化
"""
import numpy as np
from dataclasses import dataclass
from collections import defaultdict


@dataclass
class UserPromotionState:
    """用户促销状态"""
    user_id: str
    purchase_intent: float    # 0-1，购买意图
    days_since_purchase: int
    clv_score: float          # 0-1，客户生命周期价值
    emails_sent_30d: int
    last_promo_response: str  # 'purchased'/'clicked'/'ignored'/'unsubscribed'


# 促销动作空间
PROMOTION_ACTIONS = {
    0: {'label': '不发促销', 'discount': 0.0, 'message': None},
    1: {'label': '等待观察', 'discount': 0.0, 'message': None},
    2: {'label': '10%折扣', 'discount': 0.10, 'message': '专属折扣10%'},
    3: {'label': '15%折扣', 'discount': 0.15, 'message': '限时48h折扣15%'},
    4: {'label': '20%折扣', 'discount': 0.20, 'message': '会员专属折扣20%'},
}

# 奖励参数
REWARD_PARAMS = {
    'avg_order_value': 149.99,
    'margin_rate': 0.40,       # 40% 毛利率
    'unsubscribe_penalty': -5.0,
    'discount_cost_multiplier': 1.0,
}


def simulate_user_response(state: UserPromotionState, action_id: int) -> tuple:
    """
    模拟用户对促销动作的响应
    返回 (response_type, causal_incremental_purchase)
    """
    action = PROMOTION_ACTIONS[action_id]

    if action['discount'] == 0:
        # 不发促销，自然购买概率
        natural_prob = 0.05 + 0.15 * state.purchase_intent
        purchased = np.random.random() < natural_prob
        return ('natural_purchase' if purchased else 'no_action', int(purchased))

    # 发促销时
    # 骚扰效应（发太多会减弱效果）
    frequency_penalty = max(0, state.emails_sent_30d - 3) * 0.05

    # 折扣效应（折扣越大触发越容易，但递减）
    discount_boost = action['discount'] * 2.5 * (1 - action['discount'])

    # 意图×折扣联合触发
    purchase_prob = (state.purchase_intent * 0.6 + discount_boost * 0.4) * (1 - frequency_penalty)
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2406.17823 — Quantum-Inspired Fluid Simulation of 2D Turbulence with GPU Acceleration

核验口径：主题指向成立但强度不足（词重合 0.25／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：历史促销实验数据（发券与未发券的 A/B 对照）、用户行为特征（购买意图、距上次购买天数、生命周期价值、近 30 天触达次数）与 SKU 利润率（决定最大折扣空间）；粒度为用户 × 触达机会。

**输出**：各用户段的最优折扣与触达时机、预算分配方案，以及相对静态规则的增量产出、退订率与预算节省测算；供用户运营执行。

## 执行步骤

1. 整理发券对照数据与用户行为特征
2. 按利润率确定各用户段的最大折扣空间
3. 把促销动作离散成动作空间
4. 用因果增量奖励训练强化学习策略
5. 输出折扣时机建议并核对增量与退订率

## 边界与不做

- 数据不满足：没有发券与不发券的对照数据时无法构造因果奖励，学到的只是相关关系。
- 何时不用：分群预算分配用「个性化促销定向」；可读规则导出用「观测数据策略学习」。
- 能力边界：只输出策略与预算方案，不含邮件与推送系统对接、发送执行。
- 安全边界：折扣不得超过利润率允许的最大折扣空间；触达频次须合规，退订与骚扰计入惩罚。

## 技能关联

- **前置**：Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Email-Sequence-RL-Optimizer.html、Skill-Email-Sequence-RL-Optimizer、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction、Skill-RTB-Multi-Objective-Bidding.html、Skill-RTB-Multi-Objective-Bidding
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Email-Sequence-RL-Optimizer.html、Skill-Email-Sequence-RL-Optimizer、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-RTB-Multi-Objective-Bidding.html、Skill-RTB-Multi-Objective-Bidding
- **可组合**：Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-RTB-Multi-Objective-Bidding.html、Skill-RTB-Multi-Objective-Bidding、Skill-RL-Dynamic-Promotion-Optimization

---

> 分类：业务运营/渠道经营/促销规划　·　技术族：15-营销投放分析　·　源卡：`Skill-RL-Dynamic-Promotion-Optimization`