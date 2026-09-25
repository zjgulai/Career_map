---
name: "p2s-post-purchase-review-request-dispatcher"
title: "Post-Purchase-Review-Request-Dispatcher — 订单完成后按满意度预测分层分发评论邀请"
description: "触发词：评论邀请、CSAT 预测、分层触达、购后跟进、补偿前置。何时不用：差评已产生要回复用「差评回复生成」；本技能管的是评论写出来之前的触达。安全边界：严禁以奖励换好评或诱导修改评价，邀请须符合平台政策与用户 opt-in 授权。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-118"
l3_business: "用户反馈"
l3_all: "用户反馈 / 分群"
l1_l2_l3: "业务运营/服务与体验/用户反馈"
p2s_card_id: "Skill-Post-Purchase-Review-Request-Dispatcher"
p2s_src_domain: "14-用户分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "先预测这单买家满不满意，满意的直接邀请评论，可能不满的先解决问题再邀请。"
user_try: "试试：按预测满意度把这批已签收订单分层，安排评论邀请和前置客服跟进。"
whenToUse: "当订单已签收、需要在合适时机分层发起评论邀请时用；已产生差评的回复处理用「差评回复生成」。"
workflow: "按预测 CSAT 给已签收订单分层 → 对低分订单先派客服联系并解决问题 → 解决后按时间窗口触发带激励的评论邀请 → 对高分订单在交付后固定天数直接邀请"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Post-Purchase-Review-Request-Dispatcher — 订单完成后按满意度预测分层分发评论邀请

## ① 解决的问题

运营面临"评论邀请请求被忽略或引发差评"——CSAT预测分层分发将评论响应率从12%提升至28%，年化新增300+条4-5星评论

## ② 核心算法逻辑

论文：Deep Learning for Customer Satisfaction Prediction in ECommerce | 年份：2021

## ③ 业务应用场景

场景：婴儿吸奶器购后评论管理（目标评分 ≥ 4.5★） - 触发条件：订单 ORD-20260615 配送 7 天，预测 CSAT 3.2（配送延误 3 天 + 包装破损投诉记录） - 执行动作： - T+0h：客服主动联系「我们关注到您的配送体验，能否告知问题？提供补偿方案」 - T+48h：客服确认问题解决后，系统自动触发评论邀请（附 $5 积分） - 对照组（预测 CSAT 4.6）：订单完成 7 天后直接发评论邀请邮件 - 业务价值：将差评率从 18% 降至 6%，平均评分从 4.1→4.6★，年化转化率提升 ~3 个百分点（评分 4.5→4.8 对应 CTR 增加 12%）
三轨验证 | 成本轨：月均成本1,200元（AI模型调用费用800元/月+人工审核4小时/月@100元/小时=400元），年度投入14,400元 | 合规轨：符合《电子商务法》第17条商家信息真实性要求+《消费者权益保护法》第8条知情权规定，需获得用户明确同意进行评价邀请，建议部署opt-in机制 | 风险轨：邮件/短信疲劳导致用户投诉率上升（概率35%），可能触发平台限流；数据隐私合规风险（概率15%），需完善用户数据授权文档
**三轨验证** | 成本轨：月均成本2,800元（AI智能分层+个性化文案生成1,500元/月+人工运营6小时/月=600元+第三方评价管理平台700元/月），年度投入33,600元 | 合规轨：需符合《网络交易管理办法》第27条关于虚假评价禁止条款，严禁激励用户撰写好评，建议建立评价真实性声明机制和黑名单管理 | 风险轨：高价值客群邀请过度导致品牌信任度下降（概率25%）；竞对恶意投诉虚假邀请行为（概率20%），需建立完整的邀请记录和用户反馈追溯体系；RFM复购率预期+28%若未达成可能影响ROI（概率40%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI量化：差评率从 18% → 6%，平均评分 4.1 → 4.6★，CTR 提升约 12%，年化 GMV 增量 $50,000+
实施难度：⭐⭐☆☆☆（需配送 API + 客服 CRM + 邮件平台对接）
优先级：⭐⭐⭐⭐⭐（评分直接影响搜索排名和转化率，核心竞争力）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（174 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
from datetime import datetime, timedelta
from typing import Dict, List, Optional

def post_purchase_review_request_dispatcher(
    orders: List[Dict],
    now: Optional[datetime] = None,
    trigger_days: int = 7,
    high_csat_threshold: float = 4.2,
    low_csat_threshold: float = 3.5,
    review_window_days: int = 90
) -> Dict:
    """
    购后评论邀请分层分发器
    
    参数:
        orders: [{
            "order_id": str, "user_id": str,
            "delivered_at": str (ISO8601),
            "predicted_csat": float (1-5),
            "has_reviewed": bool,
            "cs_contacted": bool,
            "cs_resolved": bool
        }]
        trigger_days: 交付后多少天触发（默认7天）
        high_csat_threshold: 高满意度阈值（直接邀请评论）
        low_csat_threshold: 低满意度阈值（先处理问题）
        review_window_days: 评论邀请有效窗口（Amazon政策90天）
    
    返回:
        {"dispatches": [...], "stats": {...}}
    """
    if now is None:
        now = datetime.now()
    
    dispatches = []
    
    for order in orders:
        oid = order["order_id"]
        uid = order["user_id"]
        delivered_at = datetime.fromisoformat(order["delivered_at"])
        predicted_csat = order.get("predicted_csat", 4.0)
        has_reviewed = order.get("has_reviewed", False)
        cs_contacted = order.get("cs_contacted", False)
        cs_resolved = order.get("cs_resolved", False)
        
        days_since_delivery = (now - delivered_at).days
        
        # 已评论：跳过
        if has_reviewed:
            dispatches.append({"order_id": oid, "action": "SKIP", "reason": "用户已自行评论"})
            continue
        
        # 未到触发时间
        if days_since_delivery < trigger_days:
            dispatches.append({"order_id": oid, "action": "WAIT",
                                "reason": f"仅{days_since_delivery}天，等待{trigger_days}天触发"})
            continue
        
        # 超出评论窗口
        if days_since_delivery > review_window_days:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.04554，但该号在 arXiv 上是《A Survey of Transformers》，与本卡主题无关。
⚠️ 该号被 3 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《Deep Learning for Customer Satisfaction Prediction in ECommerce》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：订单数据（订单号、送达时间、预测 CSAT、是否已评论、客服是否已联系与已解决）与评论邀请有效窗口参数；粒度为单个订单。

**输出**：分层派发动作清单（跳过、先处理、直接邀请）与统计结果，供客服与运营按时间轴执行。

## 执行步骤

1. 接入订单与配送数据并计算交付后天数
2. 用预测 CSAT 给订单分层
3. 对低分订单先派客服联系并解决
4. 解决后按固定窗口触发评论邀请
5. 对高分订单交付后直接邀请并统计回复率

## 边界与不做

- 何时不用：缺少预测 CSAT 或配送数据时，分层无从谈起
- 能力边界：只做邀请分层与时机安排，不代写评论，也不得用奖励换取好评或诱导修改差评

## 技能关联

- **前置**：Skill-Customer-Survival-Analysis.html、Skill-Customer-Survival-Analysis、Skill-High-Value-Customer-Alert-Action.html、Skill-High-Value-Customer-Alert-Action、Skill-RFM-Segment-Campaign-Dispatcher.html、Skill-RFM-Segment-Campaign-Dispatcher、Skill-VOC-Sentiment-Dispatcher
- **延伸**：Skill-High-Value-Customer-Alert-Action.html、Skill-High-Value-Customer-Alert-Action、Skill-RFM-Segment-Campaign-Dispatcher.html、Skill-RFM-Segment-Campaign-Dispatcher、Skill-VOC-Sentiment-Dispatcher
- **可组合**：Skill-RFM-Segment-Campaign-Dispatcher.html、Skill-RFM-Segment-Campaign-Dispatcher、Skill-VOC-Sentiment-Dispatcher、Skill-Post-Purchase-Review-Request-Dispatcher

---

> 分类：业务运营/服务与体验/用户反馈　·　技术族：14-用户分析　·　源卡：`Skill-Post-Purchase-Review-Request-Dispatcher`