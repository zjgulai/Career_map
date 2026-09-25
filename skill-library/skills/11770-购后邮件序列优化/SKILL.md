---
name: "p2s-post-purchase-email-sequence-optimizer"
title: "Post-Purchase Email Sequence Optimizer（购后邮件序列优化）"
description: "触发词：购后邮件、换段提醒、复购序列、月龄引导、邮件自动化、首购激活。何时不用：跨版本文案择优用多臂老虎机卡；要在购后按时间与月龄节点编排一串邮件（评价、交叉销售、换段、召回）时用本卡。安全边界：Amazon 站内只能走 Buyer-Seller Messaging 等合规渠道，不得夹带外部链接；邮件须可退订并遵守发送频率限制。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 复购实验"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-Post-Purchase-Email-Sequence-Optimizer"
p2s_src_domain: "15-营销投放分析"
quality_tier: "preview"
user_summary: "购后按节奏发一串邮件：先要评价、再荐配件、到月龄换段前提醒复购。"
user_try: "试试：这是我的用户购后数据，帮我设计一套吸奶器与奶粉的购后邮件序列和触发规则。"
whenToUse: "与「邮件序列 RL 优化」相比：数据不足先用规则引擎时用本卡；有 6 个月以上数据要做个性化策略时再上 RL 那张卡。"
workflow: "划分购后邮件类型（评价邀请、交叉销售、教育内容、复购提醒、会员邀请） → 按购买日期与月龄预测换段节点等关键时点 → 在节点前提前触达（卡页提前 2 周发换段提醒） → 用 A/B 对照评估复购率提升并迭代序列"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Post-Purchase Email Sequence Optimizer（购后邮件序列优化）

## ① 解决的问题

私域运营面临邮件跟进打不开——邮件序列优化将复购率从8%提到12%，年化增收13万元

## ② 核心算法逻辑

核心思想：购后邮件序列（PostPurchase Email Flow）是 DTC 品牌成本最低、ROI 最高的 LTV 工具。但大多数团队发送的是时间驱动的固定序列（下单后 D+3/D+7/D+30 自动发），而非行为驱动的个性化路径。基于强化学习的邮件序列优化，通过 Contextual Bandit 算法动态选择每个用户的最优触达时机、主题和内容组合。

## ③ 业务应用场景

场景 A：吸奶器购后序列（首购用户 LTV 激活）
场景 B：奶粉订阅用户（复购提醒 + 换月龄引导）
- 奶粉有自然的「月龄换段」节点（1段→2段→3段→4段） - 系统基于购买日期 + 儿童年龄预测下次换段时机 - 提前 2 周发送「你的宝宝快到换段年龄了」邮件 + 新段产品推荐 - 复购率可比随机发送提升 35-50%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

DTC 独立站：接入 Klaviyo/Attentive，规则引擎 2 周上线
Amazon 店铺：受限于平台邮件规范（只能发 Buyer-Seller Messaging），合规版本
Bandit 模型：需要 3-6 个月数据积累，前期建议纯规则引擎

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（133 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：6」并记录位置 `paper2skills-code/marketing/post_purchase_email_sequence_optimizer` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/15-营销投放分析/Skill-Post-Purchase-Email-Sequence-Optimizer.md`），已与卡面节选核对，不依赖上述路径。

```python
from dataclasses import dataclass, field
from typing import Literal, Optional
import random
import math

# 邮件类型定义
EmailType = Literal[
    "review_request", "cross_sell", "educational",
    "reorder_prompt", "loyalty_invite", "discount_offer", "silence"
]

@dataclass
class UserState:
    user_id: str
    days_since_purchase: int
    product_category: str       # "breast_pump" / "formula" / "toy"
    purchase_count: int          # 1=首购, 2+=复购
    last_email_action: str      # "open" / "click" / "ignore" / "unsubscribe"
    rfm_segment: str            # "champion" / "at_risk" / "hibernating"
    predicted_ltv: float        # 预测 LTV（美元）
    is_near_reorder: bool       # 消耗品是否接近复购时间

@dataclass
class EmailConfig:
    email_type: EmailType
    subject_template: str
    personalization_vars: list[str]
    optimal_send_time: str      # "morning_9am" / "evening_8pm" / "weekend_11am"
    max_frequency_days: int     # 该类型邮件最小间隔天数

# 规则优先引擎（确定性规则 + bandit 兜底）
EMAIL_RULES = [
    # 规则 1：有 unsubscribe 迹象 → 立即静默
    {"condition": lambda s: s.last_email_action == "unsubscribe",
     "action": "silence", "priority": 1},
    
    # 规则 2：使用第 7 天 + 上封邮件有打开 → 请求评论黄金窗口
    {"condition": lambda s: 5 <= s.days_since_purchase <= 10 
                            and s.last_email_action in ["open", "click"],
     "action": "review_request", "priority": 2},
    
    # 规则 3：奶粉/消耗品接近复购周期 → 复购提醒
    {"condition": lambda s: s.is_near_reorder and s.product_category == "formula",
     "action": "reorder_prompt", "priority": 3},
    
    # 规则 4：高 LTV 用户 30 天未复购 → 忠诚度邀请
    {"condition": lambda s: s.predicted_ltv > 200 
                            and s.days_since_purchase > 30 
                            and s.purchase_count == 1,
     "action": "loyalty_invite", "priority": 4},
    
    # 规则 5：流失风险用户（rfm + 长时间无响应）→ 折扣激活
    {"condition": lambda s: s.rfm_segment == "at_risk" 
                            and s.days_since_purchase > 45,
     "action": "discount_offer", "priority": 5},
]

class LinUCBEmailBandit:
    """线性 UCB Contextual Bandit，用于剩余场景的动态选择。"""
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：用户购后状态（距购买天数、品类、购买次数、最近邮件动作、RFM 分段）与购买日期、儿童月龄信息；卡页按吸奶器与奶粉两类场景设计。

**输出**：分序列的邮件类型、发送时点与文案方向（卡页含换段前 2 周的月龄提醒），以及复购率提升评估（卡页比随机发送提升 35–50%），供私域运营在邮件平台配置。

## 执行步骤

1. 定义购后邮件类型与优先级顺序。
2. 依据购买日期与品类、月龄推算关键节点。
3. 在节点前设定触达时点与内容（换段提醒等）。
4. 接入邮件平台并做 A/B 对照。
5. 迭代序列与频率，并跟踪复购率与退订率。

## 边界与不做

- 何时不用：没有购后行为或月龄信息、用户量过小时不要用；需要个性化策略但数据不足 3–6 个月时先用规则版而非 Bandit。
- 能力边界：产出序列设计与评估，不代发邮件；复购率提升 35–50% 为卡页案例值。
- 安全边界：Amazon 渠道只能用平台允许的消息方式，不得夹带外部链接，邮件须可退订。

## 技能关联

- **前置**：Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-MAA-Review-to-Action-Decision.html、Skill-MAA-Review-to-Action-Decision、Skill-Personalized-Promotion-Targeting.html、Skill-Personalized-Promotion-Targeting、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Session-Intent-Shift.html、Skill-Session-Intent-Shift、Skill-Uplift-Churn-Prediction.html、Skill-Uplift-Churn-Prediction、Skill-User-Lifecycle-STAN.html、Skill-User-Lifecycle-STAN
- **延伸**：Skill-MAA-Review-to-Action-Decision.html、Skill-MAA-Review-to-Action-Decision、Skill-Personalized-Promotion-Targeting.html、Skill-Personalized-Promotion-Targeting
- **可组合**：Skill-MAA-Review-to-Action-Decision.html、Skill-MAA-Review-to-Action-Decision、Skill-Personalized-Promotion-Targeting.html、Skill-Personalized-Promotion-Targeting、Skill-Session-Intent-Shift.html、Skill-Session-Intent-Shift、Skill-Uplift-Churn-Prediction.html、Skill-Uplift-Churn-Prediction、Skill-Post-Purchase-Email-Sequence-Optimizer

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：15-营销投放分析　·　源卡：`Skill-Post-Purchase-Email-Sequence-Optimizer`