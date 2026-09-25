---
name: "p2s-viral-marketing-model"
title: "Viral Marketing Model — 病毒式传播建模：K 因子裂变增长的量化设计"
description: "触发词：K 因子、老带新设计、奖励结构、增长曲线、病毒系数。何时不用：已有推荐关系数据、要精算单个用户价值来定价时用网络价值归因技能；本技能做的是推荐计划的整体增长设计。安全边界：奖励规则须明示条件与上限，避免虚假宣传与刷单套利。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-099"
l3_business: "联盟运营"
l3_all: "联盟运营 / 传播规划"
l1_l2_l3: "业务运营/品牌与增长/联盟运营"
p2s_card_id: "Skill-Viral-Marketing-Model"
p2s_src_domain: "06-增长模型"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "算清一个老客平均能带来几个新客，再据此设计奖励结构，让推荐计划不再靠拍脑袋定奖励。"
user_try: "试试：用我的历史推荐数据估算 K 因子，给出最优奖励结构和未来 6 个月的用户增长曲线。"
whenToUse: "推荐计划还没上线或要重构规则时用本技能；已有关系数据要精算激励额度，用网络价值归因技能。"
workflow: "接入无激励状态下的自然推荐行为与推荐人 LTV 数据 → 计算有激励与无激励两种情形的 K 因子 → 在不同奖励结构下模拟 6 个月用户增长曲线 → 输出推荐人与被推荐人的最优奖励比例"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Viral Marketing Model — 病毒式传播建模：K 因子裂变增长的量化设计

## ① 解决的问题

品牌想设计老带新推荐计划但不知道奖励多少合适也不清楚K因子——K因子量化每个用户带来的新用户数并找到最优奖励结构，K从0.2提升到0.5后月新增用户提升50%年化低成本增长15-50万元

## ② 核心算法逻辑

K 因子（Viral Coefficient）：

## ③ 业务应用场景

业务问题：品牌想设计"老带新"推荐计划。参数不清楚：奖励 $10 还是 $20？给推荐人还是给被推荐人还是两边都给？推荐计划的 ROI 怎么算？
数据要求： - 历史用户的自然推荐行为（无激励时） - 推荐人的 LTV 数据 - 被推荐用户的首单转化率（参考）
预期产出： - 当前 K 因子估算（有激励 vs 无激励） - 最优奖励结构（推荐人/被推荐人的奖励比例） - 预计增长速度：不同 K 因子下的 6 个月用户增长曲线

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
K 因子从 0.2 → 0.5：月新增用户提升 50%（无额外广告预算）
推荐用户 LTV 高 20-30%（购买意愿更强）
最优奖励设计避免"反向亏损"（奖励过高但转化率不提升）
年化综合 ROI：¥15-50 万（视用户基数）
实施难度：⭐⭐☆☆☆（K 因子计算简单；推荐计划系统约 2-3 周；需要跟踪推荐来源）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（151 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/growth_model/viral_marketing_model` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-Viral-Marketing-Model.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Viral Marketing Model
K因子裂变增长建模 + 推荐计划优化
"""
import numpy as np
from dataclasses import dataclass


@dataclass
class ViralGrowthConfig:
    """病毒增长配置"""
    initial_users: int = 500
    organic_acquisition_per_month: int = 100
    avg_invites_per_user: float = 3.0       # 每用户平均发出邀请数
    invitation_conversion_rate: float = 0.12  # 邀请转化率（无激励）
    user_lifetime_months: float = 18          # 平均用户生命周期
    avg_order_value: float = 149.99
    margin_rate: float = 0.38


def compute_k_factor(invites_per_user: float, conversion_rate: float) -> float:
    """计算K因子"""
    return invites_per_user * conversion_rate


def project_viral_growth(config: ViralGrowthConfig,
                          k_factor: float,
                          months: int = 12,
                          referral_program_start: int = 0) -> list:
    """模拟病毒增长曲线"""
    users = config.initial_users
    history = [{'month': 0, 'users': users, 'new_from_referral': 0, 'new_organic': 0}]

    for m in range(1, months + 1):
        # 有机增长
        new_organic = config.organic_acquisition_per_month

        # 病毒增长
        effective_k = k_factor if m >= referral_program_start else compute_k_factor(
            config.avg_invites_per_user, config.invitation_conversion_rate)
        new_from_referral = int(users * effective_k / 12)  # 月均

        # 用户流失（生命周期结束）
        churned = int(users / config.user_lifetime_months)

        users = users + new_organic + new_from_referral - churned
        users = max(0, users)

        history.append({
            'month': m,
            'users': users,
            'new_from_referral': new_from_referral,
            'new_organic': new_organic,
        })

    return history


def optimize_referral_reward(config: ViralGrowthConfig,
                               ltv_per_user: float,
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.11234，但该号在 arXiv 上是《MiniConGTS: A Near Ultimate Minimalist Contrastive Grid Tagging Scheme for Aspect Sentiment Triplet Extraction》，与本卡主题无关。
⚠️ 该号被 3 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：历史用户自然推荐行为记录、推荐人 LTV 数据、被推荐用户首单转化率；前提是能跟踪推荐来源。

**输出**：当前 K 因子估算、最优奖励结构建议与不同 K 值下的 6 个月用户增长曲线；供增长负责人设计推荐计划。

## 执行步骤

1. 接入自然推荐行为与推荐人 LTV 数据
2. 计算无激励与有激励两种情形的 K 因子
3. 模拟不同奖励结构下的 6 个月增长曲线
4. 输出最优奖励比例与推荐计划参数
5. 标注奖励过高导致反向亏损的阈值

## 边界与不做

- 没有自然推荐行为记录时无法校准 K 因子，测算只能作为假设推演。
- 本技能输出增长模型与奖励结构建议，不搭建推荐系统，也不发放奖励。
- 安全边界：奖励规则须明示条件与上限，防止虚假宣传与刷单套利。

## 技能关联

- **前置**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Brand-Penetration-Modeling.html、Skill-Brand-Penetration-Modeling、Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Email-Sequence-RL-Optimizer.html、Skill-Email-Sequence-RL-Optimizer、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD
- **延伸**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Brand-Penetration-Modeling.html、Skill-Brand-Penetration-Modeling、Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-Email-Sequence-RL-Optimizer.html、Skill-Email-Sequence-RL-Optimizer
- **可组合**：Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-Email-Sequence-RL-Optimizer.html、Skill-Email-Sequence-RL-Optimizer、Skill-Viral-Marketing-Model

---

> 分类：业务运营/品牌与增长/联盟运营　·　技术族：06-增长模型　·　源卡：`Skill-Viral-Marketing-Model`