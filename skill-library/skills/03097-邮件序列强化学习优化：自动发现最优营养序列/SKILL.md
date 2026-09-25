---
name: "p2s-email-sequence-rl-optimizer"
title: "Email Sequence RL Optimizer — 邮件序列强化学习优化：自动发现最优营养序列"
description: "触发词：强化学习邮件、个性化序列、发送时机、退订预测、CTR 提升、CLV。何时不用：只做固定文案的在线择优用多臂老虎机那张卡；要按用户状态学何时发、发什么的最优序列时用本卡。安全边界：不得对已退订用户触达，发送频率须合规并可一键退订；训练只用营销响应数据，不得引入敏感个人信息。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 复购实验"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-Email-Sequence-RL-Optimizer"
p2s_src_domain: "15-营销投放分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "让模型学会对每个用户何时发、发什么，既不骚扰高频用户也不错过低频用户的时机。"
user_try: "试试：这是我 6 个月的邮件发送与响应记录，帮我训练强化学习策略，给出每个用户的发送时机和内容类型建议。"
whenToUse: "与「邮件多臂老虎机」相比：多版本文案在线择优走那张卡；需要按用户状态做序列级决策（含不发）时用本卡。"
workflow: "整理邮件发送与响应记录、用户属性与时序状态 → 定义动作空间（不发/教育/推荐/折扣等）与奖励（点击、复购、退订惩罚） → 用离线强化学习训练策略并做离线评估 → 对高风险退订用户降频，输出个性化发送策略"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Email Sequence RL Optimizer — 邮件序列强化学习优化：自动发现最优营养序列

## ① 解决的问题

静态邮件规则对所有用户相同序列导致CTR仅8%高频用户被骚扰低频用户错失时机——强化学习为每个用户学习个性化发送策略，CTR提升到12-15%复购率提升35%年化GMV增益20-60万元

## ② 核心算法逻辑

静态规则 vs RL 序列优化：

## ③ 业务应用场景

业务问题：独立站有 5,000 名邮件订阅用户（已购买一次），现有静态序列 CTR 仅 8%，复购率 12%。运营无法手动为每个用户调整序列。RL 自动发现每类用户的最优序列。
数据要求： - 历史邮件发送和用户响应记录（发送/打开/点击/购买/退订） - 用户属性（购买时间/金额/品类/邮件偏好） - 至少 6 个月数据
预期产出： - 个性化邮件策略：每个用户的最优发送时机和内容类型 - 高价值用户识别：CLV 高但邮件响应低的用户需要特殊策略 - 退订预测：在用户退订前提前调整策略

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
邮件 CTR 提升 50%（8%→12-15%）：月增邮件引流收入 ¥3-10 万
复购率提升 35%（12%→16-20%）：月增 GMV ¥8-20 万
退订率降低（减少骚扰）：用户生命周期价值提升
年化综合 ROI：¥20-60 万
实施难度：⭐⭐⭐☆☆（RL 训练需要历史邮件数据；邮件 API 接入（Klaviyo/Mailchimp）；约 4-6 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（199 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/marketing/email_sequence_rl_optimizer` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/15-营销投放分析/Skill-Email-Sequence-RL-Optimizer.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Email Sequence RL Optimizer
邮件序列强化学习优化：个性化发送策略
"""
import numpy as np
from dataclasses import dataclass
from collections import defaultdict


@dataclass
class UserEmailState:
    """用户邮件营销状态"""
    user_id: str
    days_since_purchase: int
    emails_sent_30d: int
    last_open_days_ago: int
    last_click_days_ago: int
    purchase_intent_score: float   # 0-1
    clv_score: float               # 0-1
    category_preference: str       # breast_pump / accessories / etc
    has_unsubscribed: bool = False


# 邮件动作类型
EMAIL_ACTIONS = {
    0: 'no_send',           # 不发送
    1: 'welcome_content',   # 欢迎/教育内容（低打扰）
    2: 'product_tips',      # 产品使用技巧
    3: 'repurchase_reminder',# 复购提醒
    4: 'discount_offer',    # 折扣优惠（高吸引力但高频退订风险）
    5: 'accessories_cross', # 配件交叉销售
}

# 奖励函数参数
REWARDS = {
    'open': 0.1,
    'click': 0.5,
    'purchase': 5.0,
    'unsubscribe': -3.0,
    'no_action': 0.0,
}

# 各状态下各动作的响应概率（简化模型，生产用历史数据训练）
def simulate_user_response(state: UserEmailState, action: int) -> str:
    """模拟用户对邮件的响应"""
    if action == 0:  # 不发送
        return 'no_action'

    # 基础打开率受意图分影响
    base_open_rate = 0.1 + 0.3 * state.purchase_intent_score
    # 高频发送降低打开率
    frequency_penalty = max(0, state.emails_sent_30d - 4) * 0.05
    open_rate = max(0.02, base_open_rate - frequency_penalty)

    if not np.random.random() < open_rate:
        return 'no_action'

    # 打开后的行动
    if action == 4:  # 折扣优惠
        click_rate = 0.5 if state.purchase_intent_score > 0.6 else 0.2
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2405.13892，但该号在 arXiv 上是《Emergence of Navier-Stokes hydrodynamics in chaotic quantum circuits》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：历史邮件发送与用户响应记录（发送、打开、点击、购买、退订）、用户属性（购买时间、金额、品类、邮件偏好），至少 6 个月数据。

**输出**：每位用户的发送时机与内容类型策略、高价值但低响应用户的特殊处理建议与退订风险预测，供邮件运营在 Klaviyo、Mailchimp 等平台落地。

## 执行步骤

1. 汇总发送与响应日志并构建用户状态特征。
2. 定义发送动作空间与以点击、复购、退订为核心的奖励。
3. 用离线强化学习训练策略并做离线回报评估。
4. 降低退订风险高用户的发送频率，输出个性化策略。
5. 上线后做在线小流量验证并持续更新策略。

## 边界与不做

- 何时不用：历史邮件数据不足 6 个月、响应信号稀疏或没有退订记录时不要用；固定文案择优不需要 RL。
- 能力边界：产出策略建议，不代发邮件；CTR 8%→12–15%、年化 ¥20–60 万为卡页案例值。
- 安全边界：不得触达已退订用户，频率与退订入口须合规，训练数据不得含敏感个人信息。

## 技能关联

- **前置**：Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-DTC-Customer-Acquisition-Attribution.html、Skill-DTC-Customer-Acquisition-Attribution、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-Post-Purchase-Email-Sequence-Optimizer.html、Skill-Post-Purchase-Email-Sequence-Optimizer、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction、Skill-RL-Dynamic-Promotion-Optimization.html、Skill-RL-Dynamic-Promotion-Optimization
- **延伸**：Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-DTC-Customer-Acquisition-Attribution.html、Skill-DTC-Customer-Acquisition-Attribution、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction、Skill-RL-Dynamic-Promotion-Optimization.html、Skill-RL-Dynamic-Promotion-Optimization
- **可组合**：Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-DTC-Customer-Acquisition-Attribution.html、Skill-DTC-Customer-Acquisition-Attribution、Skill-RL-Dynamic-Promotion-Optimization.html、Skill-RL-Dynamic-Promotion-Optimization、Skill-Email-Sequence-RL-Optimizer

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：15-营销投放分析　·　源卡：`Skill-Email-Sequence-RL-Optimizer`