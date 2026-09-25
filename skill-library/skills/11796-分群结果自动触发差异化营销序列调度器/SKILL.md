---
name: "p2s-rfm-segment-campaign-dispatcher"
title: "RFM-Segment-Campaign-Dispatcher — RFM分群结果自动触发差异化营销序列调度器"
description: "触发词：RFM分群触达、营销序列调度、挽回邮件编排、VIP礼遇触发、分层差异化触达。何时不用：分群结果尚未产出、只想拿到 R/F/M 分层名单时，先用『RFM 客户分群』；本技能只负责把既有分群转成触达序列。安全边界：触达须符合《个人信息保护法》并提供一键退订；对近 3 天内已被客服联系的客户跳过本批次，避免重复触达。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 分群"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-RFM-Segment-Campaign-Dispatcher"
p2s_src_domain: "14-用户分析"
quality_tier: "preview"
user_summary: "把 RFM 分群结果自动变成差异化营销序列：高价值客户走 VIP 礼遇，流失风险客户走挽回优惠，不用再人工手动发信。"
user_try: "试试：本季度 RFM 分群已完成（Champions 342 人、At-Risk 158 人、Lost 890 人），帮我生成三个群各自的触达序列、优先级与防打扰护栏。"
whenToUse: "分群标签已经算好、要决定『对哪个群、按什么节奏、发什么』时用本技能；若分群本身还没产出，先用『分群』类技能得到分层名单。"
workflow: "读取 RFM 分群结果与各群人数 → 把每个分群映射到活动类型、优先级与发送序列 → 设定冷却期、单批上限并排除近 3 天已被客服联系的客户 → 输出各群触达计划交邮件/短信平台执行"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# RFM-Segment-Campaign-Dispatcher — RFM分群结果自动触发差异化营销序列调度器

## ① 解决的问题

母婴品牌运营面临"RFM分群完成但挽回邮件/VIP礼遇仍靠人工手动发送"——自动调度器将At-Risk群挽回率稳定在12%，年化增量复购GMV约6-10万元

## ② 核心算法逻辑

论文：MultiTouch Attribution and Campaign Optimization via Reinforcement Learning | 年份：2021

## ③ 业务应用场景

场景：母婴品牌季度RFM分析完成，驱动差异化邮件营销 - 触发条件：本季度RFM分群完成，Champions=342人，At-Risk=158人，Lost=890人 - 执行动作： - At-Risk 158人（高M近期流失）：P0优先，发送「专属回购礼遇」+15%优惠码，3封序列（Day0/Day5/Day12） - Champions 342人：发送「VIP会员专属新品预览」+免费样品邀请 - Lost 890人：微信/邮件单封唤醒「宝宝成长里程碑」场景关联推送，预算最低 - 安全护栏：At-Risk客户中若近3天内已被客服联系，跳过本批次（对接CRM防重复） - 业务价值：At-Risk
三轨验证 | 成本轨：RFM模型月均API调用成本约450元（数据处理+分析），人工标签校验12小时/月（约1200元），总月成本1650元 | 合规轨：符合《个人信息保护法》，用户行为数据本地存储不出境，分层结果仅用于营销触达，已获用户隐私授权 | 风险轨：RFM权重偏差导致分层不准确概率12%，建议每月动态调整R/F/M系数；高价值用户过度营销触达可能导致流失率上升3-5%，需设置接触频率上限
**三轨验证** | 成本轨：Campaign自动化执行成本月均280元（邮件/短信/推送渠道），A/B测试数据分析成本约320元，总月成本600元 | 合规轨：符合《反不正当竞争法》，营销文案需审核避免虚假宣传；用户可随时退出营销名单，需提供一键取消订阅功能 | 风险轨：模型过拟合概率18%（高价值用户样本量偏小），建议每季度用新数据重训练；跨平台投放时数据同步延迟可能导致重复触达，需建立去重机制

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI量化：At-Risk群挽回率约10-15%，年化4季度×160人×12%挽回×$220 LTV = 年增量GMV约$16,896；Champions群VIP序列复购率提升约8%，年化LTV增量约$30,000
实施难度：⭐⭐☆☆☆（主要工作是对接邮件/短信平台API，业务规则简洁明确）
优先级：⭐⭐⭐⭐⭐（母婴复购率是核心增长指标，RFM调度是存量运营的标配基础设施）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（224 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 55 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现同样未能通过 `ast.parse`，请以实际文件为准。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from collections import defaultdict

# RFM分群到营销序列的映射规则
SEGMENT_CAMPAIGN_MAP = {
    "Champions": {
        "priority": 2,
        "campaign_type": "VIP_LOYALTY",
        "sequence": [
            {"day": 0, "channel": "email", "template": "vip_new_product_preview", "subject": "VIP专属：新品抢先看"},
            {"day": 7, "channel": "sms", "template": "vip_free_sample", "subject": "您的免费样品已备好"},
        ],
        "cooldown_days": 14,
        "max_per_batch": 500
    },
    "At-Risk": {
        "priority": 1,  # 最高优先级
        "campaign_type": "WINBACK_URGENCY",
        "sequence": [
            {"day": 0,  "channel": "email", "template": "winback_offer", "subject": "我们想念您！专属15%回购礼"},
            {"day": 5,  "channel": "email", "template": "winback_reminder", "subject": "宝宝成长，这些产品正合适"},
            {"day": 12, "channel": "email", "template": "winback_last", "subject": "最后机会：您的专属优惠码即将到期"},
        ],
        "cooldown_days": 7,
        "max_per_batch": 300
    },
    "Lost-Customers": {
        "priority": 3,
        "campaign_type": "REACTIVATION_LIGHT",
        "sequence": [
            {"day": 0, "channel": "push", "template": "reactivation_milestone", "subject": "宝宝成长记录：{baby_age_hint}"},
        ],
        "cooldown_days": 7,
        "max_per_batch": 2000
    },
    "Others": {
        "priority": 4,
        "campaign_type": "NEWSLETTER",
        "sequence": [
            {"day": 0, "channel": "email", "template": "weekly_newsletter", "subject": "本周母婴精选"},
        ],
        "cooldown_days": 7,
        "max_per_batch": 5000
    }
}


def rfm_segment_campaign_dispatcher(
    customers: List[Dict],
    today: Optional[datetime] = None,
    coupon_pool_size: int = 200,  # 可用优惠券数量
    cs_capacity_per_day: int = 50  # 客服每日可处理量
) -> Dict:
    """
    RFM分群营销序列调度器
    
    参数:
        customers: [{
            "customer_id": str, "rfm_segment": str,
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.04519，但该号在 arXiv 上是《Positive bound states to nonlinear Choquard equations in the presence of nonsymmetric potentials》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《MultiTouch Attribution and Campaign Optimization via Reinforcement Learning》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：客户级明细：customer_id、rfm_segment 分群标签、最近购买与交互时间；可选可用优惠券数量与客服每日处理量。粒度到单个客户，分群标签须来自已完成的 RFM 分析。

**输出**：分群级触达计划：每群的 priority、campaign_type、序列步骤（day/channel/template/subject）、cooldown_days 与 max_per_batch，附调度统计与跳过明细；供营销自动化或 CRM 平台按批下发。

## 执行步骤

1. 读取 RFM 分群结果并统计各群人数
2. 把每个分群映射到活动类型与优先级（At-Risk 最高、Lost 最低）
3. 为每个分群生成带 Day 偏移的多渠道触达序列
4. 设置冷却期、单批上限与客服防重复护栏
5. 输出调度计划与跳过明细供触达平台执行

## 边界与不做

- 分群标签未产出或分层口径仍在调整时不用本技能，应先用『RFM 客户分群』确定分层。
- 本技能只产出触达编排计划（序列、优先级、护栏），不代替邮件/短信/推送平台完成真实发送与投递。
- 安全边界：个人信息处理须已获用户授权并提供一键取消订阅；触达文案不得含虚假宣传。

## 技能关联

- **前置**：Skill-Abandoned-Cart-Recovery-Trigger.html、Skill-Abandoned-Cart-Recovery-Trigger、Skill-Customer-Journey-Analytics.html、Skill-Customer-Journey-Analytics、Skill-Email-Personalization-Engine、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **延伸**：Skill-Abandoned-Cart-Recovery-Trigger.html、Skill-Abandoned-Cart-Recovery-Trigger、Skill-Customer-Journey-Analytics.html、Skill-Customer-Journey-Analytics、Skill-Email-Personalization-Engine
- **可组合**：Skill-Abandoned-Cart-Recovery-Trigger.html、Skill-Abandoned-Cart-Recovery-Trigger、Skill-Customer-Journey-Analytics.html、Skill-Customer-Journey-Analytics、Skill-RFM-Segment-Campaign-Dispatcher

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：14-用户分析　·　源卡：`Skill-RFM-Segment-Campaign-Dispatcher`