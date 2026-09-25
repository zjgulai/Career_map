---
name: "p2s-referral-viral-loop-trigger"
title: "Referral-Viral-Loop-Trigger — 高NPS用户自动触发裂变邀请优惠分享码"
description: "触发词：裂变触发、NPS 门槛、分享码、老带新、推荐奖励发放。何时不用：要设计奖励额度与 K 因子结构时用病毒传播建模技能；本技能负责把高满意度老客挑出来触发裂变邀请。安全边界：不得在平台店铺内诱导站外分享；分享码优惠须标明有效期与新用户限制，并配防刷规则。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-099"
l3_business: "联盟运营"
l3_all: "联盟运营 / 生命周期触达"
l1_l2_l3: "业务运营/品牌与增长/联盟运营"
p2s_card_id: "Skill-Referral-Viral-Loop-Trigger"
p2s_src_domain: "06-增长模型"
quality_tier: "preview"
user_summary: "把复购多次、口碑好的老客户自动识别出来，发专属分享码，让他们把身边的朋友带进来。"
user_try: "试试：按 NPS 代理分高于 8 且复购不少于 2 次的条件，输出本批应触发裂变的用户与分享码方案。"
whenToUse: "已有满意度或 NPS 代理分、要触发老带新时用本技能；奖励结构设计用病毒传播建模技能。"
workflow: "接入预测 NPS、购买次数与联系方式 → 按 NPS 门槛与复购次数筛出裂变候选人 → 生成唯一分享码并设置有效期与使用上限 → 触发邀请消息并在被推荐人下单后结算奖励"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Referral-Viral-Loop-Trigger — 高NPS用户自动触发裂变邀请优惠分享码

## ① 解决的问题

增长负责人面临"高满意度用户未被转化为传播节点"——NPS>8+复购≥2次自动触发裂变邀请将老带新转化率提升至8%，年化新增GMV70万元

## ② 核心算法逻辑

论文：Deep Viral Marketing: A Reinforcement Learning Approach to Referral Campaigns | 年份：2021

## ③ 业务应用场景

场景：婴儿配方奶粉复购用户裂变运营 - 触发条件：用户 U-3341（购买 3 次奶粉，预测 NPS 代理分 9.1） - 执行动作： - 生成唯一裂变码「MOM-3341-JUNE」，有效期 30 天 - 发送 WhatsApp 消息「您在妈妈圈的好口碑很重要——分享给身边的妈妈们，您和她都可以享受专属优惠」 - 被推荐人使用裂变码下单时，推荐人自动获得 $15 积分 - 结果：当月裂变触发 2,200 人，带来新注册 680 人（K=0.31），首月转化 180 人，获客成本 $8.5（vs 广告获客 $42） - 年化价值：裂变获客成本仅为广告获客的 1/5，年化节省获客成本 $85,0
成本轨： - NPS 代理模型训练与维护：$2,500/月（数据标注 + 模型迭代） - WhatsApp Business API 调用费用：$0.0079/条消息，月均 2,200 条触发 × $0.0079 = $17.4/月 - 裂变码生成与管理系统：$800/月（云服务器 + 数据库存储） - 积分系统对账与结算：$1,200/月（人力审核 + 财务对账） - 欺诈检测系统（防刷）：$600/月（规则引擎 + 异常监控） - 总显性成本：$5,117/月（年化 $61,404） - 成本占裂变获客收益比：$61,404 / $85,000 = 72.2%，净收益 $23,596/年
合规轨： - ✅ GDPR 合规：用户已主动购买 2 次以上，属于已有商业关系，WhatsApp 消息符合"已有客户营销"豁免条款；需在消息中提供一键取消订阅链接 - ✅ Amazon 政策：若在 Amazon 平台运营，需遵守"不得在平台外诱导用户"政策；建议裂变码仅在官网/App 使用，不在 Amazon 店铺推广 - ✅ 广告法合规：分享码优惠需明确标注"有效期 30 天""限新用户首单"等条款，避免虚假宣传 - ✅ 跨境贸易法规：积分奖励属于营销费用，需在各国税务申报中列示（美国、欧盟、东南亚税务要求不同） - ⚠️ 平台政策风险：WhatsApp 对营销消息频率有限制（每用户每天最多

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI量化：裂变获客成本 $8.5 vs 广告获客 $42，月增量新用户 180 人，年化节省获客成本 $85,000；扣除显性成本 $61,404 后，净收益 $23,596/年
实施难度：⭐⭐☆☆☆（需裂变码生成系统 + WhatsApp Business API + 积分系统）
优先级：⭐⭐⭐⭐☆（低成本获客是跨境电商增长的核心杠杆，但需重点关注平台政策与竞品风险）
风险调整后 ROI：考虑 35% 竞品价格战风险与 20% 平台审查风险，预期年化净收益下降至 $12,000-$18,000，仍具投资价值

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（135 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import uuid
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional

def referral_viral_loop_trigger(
    users: List[Dict],
    now: Optional[datetime] = None,
    nps_threshold: float = 8.0,
    nps_high_threshold: float = 9.0,
    min_purchases: int = 2,
    referral_validity_days: int = 30,
    max_referral_uses: int = 5,
    cooldown_days: int = 90
) -> Dict:
    """
    裂变病毒循环触发器
    
    参数:
        users: [{
            "user_id": str, "predicted_nps": float,
            "purchase_count": int, "preferred_channel": str,
            "last_referral_triggered_at": str | None
        }]
        nps_threshold: 触发裂变的最低NPS代理分
        min_purchases: 最低购买次数
        cooldown_days: 触发冷却天数
    
    返回:
        {"triggers": [...], "skipped": [...], "stats": {...}}
    """
    if now is None:
        now = datetime.now()
    
    triggers = []
    skipped = []
    
    for user in users:
        uid = user["user_id"]
        nps = user.get("predicted_nps", 0)
        purchases = user.get("purchase_count", 0)
        channel = user.get("preferred_channel", "email")
        last_triggered = user.get("last_referral_triggered_at")
        
        # 冷却期检查
        if last_triggered:
            last_ts = datetime.fromisoformat(last_triggered)
            if (now - last_ts).days < cooldown_days:
                skipped.append({"user_id": uid, "reason": f"冷却期内（{cooldown_days}天）"})
                continue
        
        # 条件检查
        if nps < nps_threshold:
            skipped.append({"user_id": uid, "reason": f"NPS代理分{nps:.1f}<{nps_threshold}（非Promoter）"})
            continue
        
        if purchases < min_purchases:
            skipped.append({"user_id": uid, "reason": f"购买次数{purchases}<{min_purchases}（需真实体验）"})
            continue
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.07704，但该号在 arXiv 上是《Efficient (Soft) Q-Learning for Text Generation with Limited Good Data》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Deep Viral Marketing: A Reinforcement Learning Approach to Referral Campaigns》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：用户级明细：user_id、预测 NPS 分、历史购买次数、渠道联系方式、上次触发时间（用于冷却）。前提是已具备裂变码生成与积分系统。

**输出**：本批裂变触发的用户名单与分享码参数（有效期、使用上限、奖励额）及触发统计；供增长运营与积分系统执行发放。

## 执行步骤

1. 接入 NPS 代理分与购买次数数据
2. 按门槛筛出高满意度裂变候选人
3. 生成唯一分享码并设定有效期与使用上限
4. 触发邀请消息并跟踪被推荐人转化
5. 在被推荐人下单后结算推荐人奖励

## 边界与不做

- 没有满意度或 NPS 代理分、也没有购买次数数据时无法定位候选人，不用本技能。
- 本技能输出触发名单与分享码规则，不代替消息平台发送，也不做积分到账执行。
- 安全边界：不得在平台店铺内诱导站外分享；须配防刷规则，分享码优惠须明确适用范围与有效期。

## 技能关联

- **前置**：Skill-Customer-Survival-Analysis.html、Skill-Customer-Survival-Analysis、Skill-LTV-Acquisition-Budget-Gate.html、Skill-LTV-Acquisition-Budget-Gate、Skill-LTV-CAC-Acquisition-Gate.html、Skill-LTV-CAC-Acquisition-Gate、Skill-User-LTV-Financial-Bridge.html、Skill-User-LTV-Financial-Bridge、Skill-VIP-Tier-Upgrade-Action.html、Skill-VIP-Tier-Upgrade-Action
- **延伸**：Skill-LTV-Acquisition-Budget-Gate.html、Skill-LTV-Acquisition-Budget-Gate、Skill-LTV-CAC-Acquisition-Gate.html、Skill-LTV-CAC-Acquisition-Gate、Skill-User-LTV-Financial-Bridge.html、Skill-User-LTV-Financial-Bridge、Skill-VIP-Tier-Upgrade-Action.html、Skill-VIP-Tier-Upgrade-Action
- **可组合**：Skill-LTV-Acquisition-Budget-Gate.html、Skill-LTV-Acquisition-Budget-Gate、Skill-LTV-CAC-Acquisition-Gate.html、Skill-LTV-CAC-Acquisition-Gate、Skill-VIP-Tier-Upgrade-Action.html、Skill-VIP-Tier-Upgrade-Action、Skill-Referral-Viral-Loop-Trigger

---

> 分类：业务运营/品牌与增长/联盟运营　·　技术族：06-增长模型　·　源卡：`Skill-Referral-Viral-Loop-Trigger`