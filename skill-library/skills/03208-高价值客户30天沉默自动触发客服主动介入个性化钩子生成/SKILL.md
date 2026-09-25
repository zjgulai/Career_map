---
name: "p2s-high-value-customer-alert-action"
title: "High-Value-Customer-Alert-Action — RFM高价值客户30天沉默自动触发客服主动介入+个性化钩子生成"
description: "触发词：高价值客户、沉默预警、RFM、WhatsApp 介入、个性化钩子、主动挽留。何时不用：只要沉默信号检测与工单触发用高价值客户告警那张基础卡；要按 LTV 分级把客服、邮件、轻触达落到具体人时用本卡。安全边界：触达前必须查重（CRM 触达记录），同一客户近 30 天不重复生成工单；画像须脱敏并获授权，不得虚假宣传。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 会员活动"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-High-Value-Customer-Alert-Action"
p2s_src_domain: "14-用户分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "高价值客户一旦沉默就自动分级触达：大客户由客服直接介入，中小客户走邮件序列。"
user_try: "试试：这是我本周的 RFM 分群结果和 CRM 触达记录，帮我找出沉默的高价值客户并给出分级触达动作和话术。"
whenToUse: "与「RFM 分群自动调度」相比：全群按 RFM 匹配序列用那张卡；聚焦 Champions 与 Loyal 的沉默预警与人工介入时用本卡。"
workflow: "按 RFM 更新识别 Champions/Loyal 且超过沉默阈值的客户 → 按 LTV 分档映射触达渠道（WhatsApp+客服、邮件序列、单封邮件） → 结合宝宝月龄生成个性化沟通钩子 → 查重 CRM 触达记录后生成工单与话术并跟踪挽留结果"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# High-Value-Customer-Alert-Action — RFM高价值客户30天沉默自动触发客服主动介入+个性化钩子生成

## ① 解决的问题

客户成功经理面临"Champions客户沉默25天后流失但全靠人工盯单无法规模化预警"——15天沉默自动触发WhatsApp+客服介入将高LTV流失率降低28%，年化挽回GMV约4-6万美元

## ② 核心算法逻辑

论文：Deep Interest Network for ClickThrough Rate Prediction | 年份：2018

## ③ 业务应用场景

场景：母婴品牌高价值客户流失前预警与主动挽留 - 触发条件：本周RFM模型更新，识别出23名Champions/Loyal客户超过15/30天未购买 - 其中LTV>$300者：8名（WhatsApp介入级别） - $150-300者：11名（邮件级别） - <$150者：4名（轻量邮件） - 执行动作： - 8名高LTV客户：WhatsApp模板「[客服名]：Hi [姓名]，您的宝宝应该进入9个月辅食期了，我们新到了一批有机泥糊产品，给您留了VIP优先购链接」 - 11名中LTV：2封邮件序列，Day0主题「您的VIP专属新品推荐」，Day5主题「宝宝成长必备清单」 - 安全护栏：检查CRM
**三轨验证** | 成本轨：AI模型调用成本月均800元（日均高价值客户识别100-150人×0.05元/次），人工审核8小时/月（成本1200元），系统维护2小时/周（成本400元/月），合计月均2400元 | 合规轨：符合《个人信息保护法》第二十三条（用户画像需脱敏处理）、《电商法》第十七条（不得虚假宣传），需获得用户数据使用授权，建议在APP隐私政策中明确RFM分析用途，合规结论：可实施 | 风险轨：用户隐私泄露风险（概率15%，涉及数据安全责任）、高价值客户过度营销导致流失风险（概率20%，影响复购率）、算法偏见风险（概率10%，可能遗漏潜力客户）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI量化：Champions群主动介入挽留率约25-30%，年化对50名Champions客户主动介入×28%挽留×$400 LTV = 增量GMV约$56,000；额外规避了高LTV客户流失的品牌口碑风险
实施难度：⭐⭐☆☆☆（WhatsApp Business API对接约1周工程量；邮件平台对接更简单；个性化钩子逻辑规则清晰）
优先级：⭐⭐⭐⭐⭐（高LTV客户是品牌最核心资产，每失去一位Champions意味着失去数百美元长期价值；主动预防远优于被动挽回）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（257 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
from datetime import datetime, timedelta
from typing import Dict, List, Optional

# 各分群沉默预警阈值（天）
SILENCE_THRESHOLDS = {
    "Champions": 15,
    "Loyal":     30,
}

# LTV分级和触达渠道
LTV_TIERS = [
    {"min_ltv": 300,  "channel": "whatsapp+cs", "label": "高LTV-人工介入"},
    {"min_ltv": 150,  "channel": "email_2step",  "label": "中LTV-邮件序列"},
    {"min_ltv": 0,    "channel": "email_1step",  "label": "低LTV-单封邮件"},
]

# 宝宝月龄成长钩子映射
BABY_AGE_HOOKS = {
    (0, 3):   "新生儿期，产后恢复和初乳准备",
    (3, 6):   "宝宝3-6个月，奶粉/吸奶器核心需求期",
    (6, 9):   "宝宝6-9个月，辅食启蒙阶段",
    (9, 12):  "宝宝9-12个月，手指食物和学步期",
    (12, 18): "宝宝1-1.5岁，断奶过渡和自主进食培养",
    (18, 36): "宝宝1.5-3岁，学前营养和早教玩具期",
    (36, 99): "宝宝3岁以上，进入幼儿成长阶段",
}


def get_baby_age_hook(baby_birth_month: Optional[str], today: datetime) -> str:
    """根据宝宝出生月份生成成长阶段钩子"""
    if not baby_birth_month:
        return "宝宝成长关键期，精选必备好物"
    try:
        birth = datetime.strptime(baby_birth_month, "%Y-%m")
        months = (today.year - birth.year) * 12 + (today.month - birth.month)
        for (lo, hi), hook in BABY_AGE_HOOKS.items():
            if lo <= months < hi:
                return f"宝宝{months}个月大，{hook}"
        return f"宝宝{months}个月大，持续成长中"
    except Exception:
        return "宝宝成长每个阶段都有新需求"


def get_ltv_tier(ltv: float) -> Dict:
    """按LTV分级确定触达渠道"""
    for tier in LTV_TIERS:
        if ltv >= tier["min_ltv"]:
            return tier
    return LTV_TIERS[-1]


def high_value_customer_alert_action(
    customers: List[Dict],
    today: Optional[datetime] = None,
    max_monthly_contacts: int = 1,  # 每月最大主动接触次数
) -> Dict:
    """
    RFM高价值客户沉默预警+主动介入动作生成器
    
    参数:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2006.06878，但该号在 arXiv 上是《Optimization Theory for ReLU Neural Networks Trained with Normalization Layers》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《Deep Interest Network for ClickThrough Rate Prediction》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：RFM 分群结果、客户 LTV 与购买次数、最近购买或活跃距今天数、CRM 历史触达记录，以及可用的触达渠道（WhatsApp Business、邮件平台）。

**输出**：沉默高价值客户清单与触达档位（卡页：LTV>$300 走 WhatsApp+客服、$150–300 走两封邮件、<$150 走单封邮件）、个性化话术钩子与工单，供客服与 CRM 执行。

## 执行步骤

1. 筛出 RFM 为 Champions/Loyal 且超过沉默阈值的客户。
2. 映射 LTV 分档到触达渠道与优先级。
3. 结合月龄与购买历史生成个性化沟通钩子。
4. 查重 CRM 触达记录，避免重复打扰后生成工单。
5. 跟踪挽留结果并回看分档阈值与话术效果。

## 边界与不做

- 何时不用：没有 CRM 触达记录或 LTV 字段缺失时不要用；只有流失概率、没有价值分层时先补分层。
- 能力边界：产出清单、档位与话术，不代发消息也不代建工单；年化增量 GMV $56,000 等为卡页案例值。
- 安全边界：触达前必须查重，同一客户 30 天内不重复生成工单，画像须脱敏并获授权。

## 技能关联

- **前置**：Skill-Customer-Journey-Analytics.html、Skill-Customer-Journey-Analytics、Skill-Post-Purchase-Review-Request-Dispatcher.html、Skill-Post-Purchase-Review-Request-Dispatcher、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-RFM-Segment-Campaign-Dispatcher.html、Skill-RFM-Segment-Campaign-Dispatcher
- **延伸**：Skill-Customer-Journey-Analytics.html、Skill-Customer-Journey-Analytics、Skill-Post-Purchase-Review-Request-Dispatcher.html、Skill-Post-Purchase-Review-Request-Dispatcher、Skill-RFM-Segment-Campaign-Dispatcher.html、Skill-RFM-Segment-Campaign-Dispatcher
- **可组合**：Skill-Post-Purchase-Review-Request-Dispatcher.html、Skill-Post-Purchase-Review-Request-Dispatcher、Skill-RFM-Segment-Campaign-Dispatcher.html、Skill-RFM-Segment-Campaign-Dispatcher、Skill-High-Value-Customer-Alert-Action

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：14-用户分析　·　源卡：`Skill-High-Value-Customer-Alert-Action`