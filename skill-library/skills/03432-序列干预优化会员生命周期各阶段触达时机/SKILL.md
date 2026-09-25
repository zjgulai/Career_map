---
name: "p2s-member-lifecycle-intervention-sequencing"
title: "Member Lifecycle Intervention Sequencing — RL 序列干预优化会员生命周期各阶段触达时机"
description: "触发词：序列干预、强化学习、会员生命周期、折扣分层、干预成本、ROAS。何时不用：只做单次触达择优用多臂老虎机卡；要按会员所处阶段与历史响应学一串干预动作（含不干预）时用本卡。安全边界：折扣上限与干预预算须设约束，避免长期依赖折扣培养等券习惯，须遵守平台促销与消费者权益相关规范。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 会员活动"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-Member-Lifecycle-Intervention-Sequencing"
p2s_src_domain: "06-增长模型"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "不再对所有会员发同一张券，而是按阶段和历史响应决定给谁发什么、甚至不发。"
user_try: "试试：这是我的会员购买序列和历次干预记录，帮我用离线强化学习排出每个阶段的最优干预动作。"
whenToUse: "与「Uplift 定向」相比：只决定发不发券用 Uplift 那张卡；要决定在生命周期各阶段依次给予哪种干预时用本卡的序列优化。"
workflow: "整理会员购买序列、干预记录与响应结果 → 定义会员状态（阶段、活跃度、价格敏感度）与动作空间（不同力度券、积分、内容、不干预） → 用离线强化学习学策略并评估累计收益 → 按策略分配干预并监控成本与折扣依赖"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Member Lifecycle Intervention Sequencing — RL 序列干预优化会员生命周期各阶段触达时机

## ① 解决的问题

私域运营面临"统一折扣券激活率22%、不同生命周期阶段用户响应差异巨大"——RL序列干预将干预触点ROAS从3x提升至5x，干预成本节省30%，年化净收益80-120万元

## ② 核心算法逻辑

传统会员干预是独立触发的：流失风险高 → 发优惠券；生日 → 发祝福；沉默 30 天 → push。每个触点单独优化，但忽略了一个关键问题：给用户发了 20% 折扣券，是否影响他下次对 10% 折扣券的响应？序列干预的长期效果 ≠ 单次干预效果之和。

## ③ 业务应用场景

业务问题：新用户首购后 30 天内发一张 15% 折扣券（成本 $5/用户），激活率 22%。但不同用户对相同干预的响应差异巨大：浏览记录丰富的用户不需要大折扣，而价格敏感用户 15% 不够，需要 20%+。统一策略导致折扣成本浪费 30-40%。
数据要求： - 历史购买序列（用户级别，含时间戳） - 历史干预记录（发什么券、什么时间、用户响应结果） - 用户特征：首购品类、首购金额、来源渠道、设备类型
干预动作空间（5 种）： 1. 高折扣券（20% off，成本 $8） 2. 标准折扣券（15% off，成本 $5） 3. 积分双倍奖励（成本 $2） 4. 专属内容（母婴指南 PDF，成本 $0.2） 5. 不干预（成本 $0）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：10000 活跃会员的母婴 DTC 站，RL 序列干预将干预触点 ROAS 从 3x 提升至 5x，干预成本节省 30%，年化净收益约 80-120 万元
实施难度：⭐⭐⭐☆☆（需要历史干预实验数据 ≥ 6 个月，状态特征工程，无需 GPU，1-3 周可实现离线版）
优先级：⭐⭐⭐⭐☆（比单次触发策略显著优越，但需要历史数据积累，新店不适用）
评估依据：Management Science 2024 真实零售实验显示，RL 序列策略 vs 独立实验策略，累计收入提升 18-27%；PPO 智能体在零售优惠券场景下显著优于随机和静态 baseline

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（229 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Member Lifecycle Intervention Sequencing
会员生命周期 RL 干预序列优化

依赖：numpy, pandas
实现：离线 Q-Learning（使用历史随机化实验数据）
"""

import numpy as np
import pandas as pd
from collections import defaultdict
from typing import List, Dict, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')


# ─────────────────────────────────────────────
# 1. 会员状态定义
# ─────────────────────────────────────────────

LIFECYCLE_STAGES = {
    0: '新会员激活 (0-30天)',
    1: '成长期 (31-90天)',
    2: '成熟高活 (91-365天, 购频高)',
    3: '成熟低活 (91-365天, 购频低)',
    4: '濒死期 (>365天或90天无购)',
}

INTERVENTION_ACTIONS = {
    0: ('不干预', 0.0),
    1: ('积分奖励', 2.0),       # 成本 $2
    2: ('专属内容', 0.2),       # 成本 $0.2
    3: ('标准折扣 15%', 5.0),   # 成本 $5
    4: ('高折扣 20%+', 8.0),    # 成本 $8
}


def get_lifecycle_stage(days_since_join: int, days_since_last_purchase: int,
                          monthly_purchase_freq: float) -> int:
    """根据用户特征判断生命周期阶段"""
    if days_since_join <= 30:
        return 0
    elif days_since_join <= 90:
        return 1
    elif days_since_last_purchase > 90 or (days_since_join > 365 and monthly_purchase_freq < 0.1):
        return 4
    elif monthly_purchase_freq >= 0.8:
        return 2
    else:
        return 3


# ─────────────────────────────────────────────
# 2. 模拟历史干预实验数据
# ─────────────────────────────────────────────

def generate_intervention_history(n_users: int = 500) -> pd.DataFrame:
    """生成模拟历史干预记录（模拟随机化实验的外生性）"""
    np.random.seed(42)
    records = []
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2405.10469，但该号在 arXiv 上是《Simulation-Based Benchmarking of Reinforcement Learning Agents for Personalized Retail Promotions》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：用户级历史购买序列（含时间戳）、历史干预记录（发什么券、何时、响应结果）、用户特征（首购品类、首购金额、来源渠道、设备类型）；卡页要求至少 6 个月干预实验数据。

**输出**：按生命周期阶段的最优干预策略与动作建议、干预成本与 ROAS 评估（卡页 ROAS 3x→5x、成本节省 30%），供私域运营与会员团队执行。

## 执行步骤

1. 整理购买序列与干预记录，构建状态特征。
2. 定义动作空间与成本函数（卡页 5 档，含不干预）。
3. 用离线强化学习训练策略并做离线回报评估。
4. 输出分阶段干预序列并设置折扣与预算上限。
5. 上线小流量验证，监控成本、激活率与折扣依赖。

## 边界与不做

- 何时不用：历史干预实验数据不足 6 个月、或新店无积累时不要用；只做单次触达择优用多臂老虎机。
- 能力边界：产出策略建议，不代发券；ROAS 3x→5x、年化净收益 80–120 万为卡页案例值。
- 安全边界：必须设折扣上限与预算约束，防止利润侵蚀与等券习惯。

## 技能关联

- **前置**：Skill-Customer-Survival-Analysis.html、Skill-Customer-Survival-Analysis、Skill-Email-Sequence-RL-Optimizer.html、Skill-Email-Sequence-RL-Optimizer、Skill-Guardrailed-CATE-NBA.html、Skill-Guardrailed-CATE-NBA、Skill-Loyalty-Program-ROI-Modeling.html、Skill-Loyalty-Program-ROI-Modeling、Skill-Membership-Tier-Design-Optimization.html、Skill-Membership-Tier-Design-Optimization、Skill-RFM-Campaign-Auto-Dispatcher.html、Skill-RFM-Campaign-Auto-Dispatcher、Skill-Uplift-Churn-Prediction.html、Skill-Uplift-Churn-Prediction
- **延伸**：Skill-Email-Sequence-RL-Optimizer.html、Skill-Email-Sequence-RL-Optimizer、Skill-Guardrailed-CATE-NBA.html、Skill-Guardrailed-CATE-NBA、Skill-Membership-Tier-Design-Optimization.html、Skill-Membership-Tier-Design-Optimization、Skill-RFM-Campaign-Auto-Dispatcher.html、Skill-RFM-Campaign-Auto-Dispatcher
- **可组合**：Skill-Guardrailed-CATE-NBA.html、Skill-Guardrailed-CATE-NBA、Skill-RFM-Campaign-Auto-Dispatcher.html、Skill-RFM-Campaign-Auto-Dispatcher、Skill-Member-Lifecycle-Intervention-Sequencing

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：06-增长模型　·　源卡：`Skill-Member-Lifecycle-Intervention-Sequencing`