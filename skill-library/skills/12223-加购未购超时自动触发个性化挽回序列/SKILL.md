---
name: "p2s-abandoned-cart-recovery-trigger"
title: "Abandoned-Cart-Recovery-Trigger — 加购未购超时自动触发个性化挽回序列"
description: "触发词：加购未购、超时触发、挽回序列、定时触达、冷却期。何时不用：要先给弃购用户分型再决定策略用「弃购挽回机器学习」；要给用户算购买意图分档用「购买意图预测」。安全边界：同一用户 24 小时内触达不超过 1 次，支付成功后必须立即终止序列；WhatsApp 营销需显式 opt-in 且消息模板预先审核。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-070"
l3_business: "转化优化"
l3_all: "转化优化 / 生命周期触达"
l1_l2_l3: "业务运营/渠道经营/转化优化"
p2s_card_id: "Skill-Abandoned-Cart-Recovery-Trigger"
p2s_src_domain: "14-用户分析"
quality_tier: "preview"
user_summary: "用户把商品加进购物车却没付款，按 2 小时、24 小时、48 小时三步自动追回来，一旦付款立刻停。"
user_try: "试试：给加购 2 小时未支付、购物车金额 $220 的用户配一条 T+2h、T+24h、T+48h 的挽回序列。"
whenToUse: "当挽回动作是加购后固定时间点的自动化序列（邮件、WhatsApp、短信）时用本技能；要先按用户类型决定给不给折扣用「弃购挽回机器学习」；要按 0-1 意图概率分档决定触达强度用「购买意图预测」。"
workflow: "监听购物车事件流，识别加购未支付会话 → 按 T+2h、T+24h、T+48h 挂载触达内容与优惠 → 设置安全护栏：支付成功立即终止、48h 无响应归档 → 统计挽回率与优惠券成本 → 按效果迭代话术与优惠力度"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Abandoned-Cart-Recovery-Trigger — 加购未购超时自动触发个性化挽回序列

## ① 解决的问题

运营面临"加购未购用户大量流失"——加购后2h自动触发挽回序列将加购转化率从8%提升至14%，年化增收50万元

## ② 核心算法逻辑

论文：Personalized Abandoned Cart Recovery via MultiChannel Reinforcement Learning | 年份：2021

## ③ 业务应用场景

场景：婴儿安全座椅弃购挽回（客单价 $180-350） - 触发条件：用户将某款婴儿座椅加购 2.5h 未支付，购物车金额 $220，首次弃购 - 执行动作： - T+2h：发送邮件「您的购物车还在等你——专属优惠 10% off」，含产品评测对比 - T+24h：WhatsApp 推送「安全认证详情 + 免费安装指导」 - T+48h：邮件「限时：本周内下单赠送儿童安全检查套装」 - 安全护栏：用户支付后立即终止序列；48h 无响应自动归档 - 业务价值：弃购挽回率从 12% 提升至 29%，月均挽回 GMV 约 $18,000，年化约 $216,000
成本轨： - 数据采集：购物车事件流采集成本 $500/月（服务器日志存储 + ETL 管道） - 计算资源：触发引擎轮询 + 序列调度，约 $800/月（云函数 + 消息队列） - WhatsApp Business API：$0.0075/条消息，月均 5,000 条触发 × 2 条/用户 = $75/月 - 邮件服务：SendGrid/Mailgun 约 $50/月（10,000 条/月额度） - 短信服务（高客单）：$0.01/条，月均 1,000 条 = $10/月 - 人力投入：初期配置 40h（$2,000），月度优化维护 8h（$400） - 总成本：首月 $3,835，月度稳
合规轨： - ✅ Amazon 政策：符合。Amazon 允许自动化邮件挽回，但禁止过度频繁（>1次/24h）；本方案遵守 24h 冷却期，合规 - ✅ GDPR：符合。用户已同意营销邮件（购物车加购即隐含同意），WhatsApp 需显式 opt-in；建议在注册/首单时获取 WhatsApp 营销授权，保存同意记录 - ✅ 中国广告法：符合。优惠券标注真实折扣率，无虚假宣传；邮件/短信需标注"退订"链接 - ✅ 跨境贸易法规：符合。不涉及受限商品，优惠政策透明，无价格歧视 - ⚠️ WhatsApp 政策：需注意 WhatsApp Business API 禁止营销滥用；建议消息模板预先审核

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI量化：弃购挽回率从 12% → 29%，月均挽回 GMV $18,000，年化 $216,000；优惠券成本约$3,000/月，ROI 6:1
实施难度：⭐⭐☆☆☆（需对接购物车事件流 + WhatsApp Business API）
优先级：⭐⭐⭐⭐⭐（高频高价值，直接影响转化率）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（162 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import json

def abandoned_cart_recovery_trigger(
    cart_events: List[Dict],
    now: Optional[datetime] = None,
    timeout_hours: float = 2.0,
    cooldown_hours: float = 24.0,
    high_value_threshold: float = 100.0
) -> Dict:
    """
    加购弃单挽回触发器
    
    参数:
        cart_events: [{
            "user_id": str, "cart_id": str,
            "added_at": str (ISO8601), "cart_value": float,
            "abandoned_count": int, "paid": bool,
            "last_triggered_at": str | None
        }]
        timeout_hours: 加购后多少小时未支付触发（默认2h）
        cooldown_hours: 同用户触发冷却时间（默认24h）
        high_value_threshold: 高客单价阈值（默认$100）
    
    返回:
        {"triggers": [...], "skipped": [...], "stats": {...}}
    """
    if now is None:
        now = datetime.now()
    
    triggers = []
    skipped = []
    
    for event in cart_events:
        uid = event["user_id"]
        cid = event["cart_id"]
        added_at = datetime.fromisoformat(event["added_at"])
        cart_value = event.get("cart_value", 0)
        abandoned_count = event.get("abandoned_count", 0)
        paid = event.get("paid", False)
        last_triggered_at = event.get("last_triggered_at")
        
        # 已支付：跳过
        if paid:
            skipped.append({"cart_id": cid, "reason": "已完成支付"})
            continue
        
        # 未超时：跳过
        hours_since_add = (now - added_at).total_seconds() / 3600
        if hours_since_add < timeout_hours:
            skipped.append({"cart_id": cid, "reason": f"仅加购{hours_since_add:.1f}h，未到{timeout_hours}h阈值"})
            continue
        
        # 冷却期检查
        if last_triggered_at:
            last_ts = datetime.fromisoformat(last_triggered_at)
            hours_since_trigger = (now - last_ts).total_seconds() / 3600
            if hours_since_trigger < cooldown_hours:
                skipped.append({"cart_id": cid, "reason": f"冷却中（{hours_since_trigger:.1f}h < {cooldown_hours}h）"})
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.04567，但该号在 arXiv 上是《Non-Hermitian skin effect of dislocations and its topological origin》，与本卡主题无关。
⚠️ 该号被 4 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《Personalized Abandoned Cart Recovery via MultiChannel Reinforcement Learning》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：购物车事件流（加购时间、金额、是否支付）、用户联系方式与渠道许可状态（邮件、WhatsApp opt-in、短信）；粒度为单个加购会话。

**输出**：分时间点的触达序列执行记录（每步内容与优惠）与挽回结果统计；供运营与 CRM 评估序列效果并调整。

## 执行步骤

1. 接入购物车事件流，识别加购未支付会话
2. 按 T+2h、T+24h、T+48h 配置每步触达内容
3. 首次弃购给 10% 优惠并附评测对比，后续改推认证资料与赠品
4. 设置支付后立即终止、48 小时无响应归档的护栏
5. 统计挽回率与券成本，按结果迭代话术

## 边界与不做

- 数据不满足：拿不到购物车事件流或用户渠道许可状态时无法安全触发序列，先补齐埋点与 opt-in 记录。
- 何时不用：要先做弃购分型再决定给不给折扣用「弃购挽回机器学习」；要算购买意图分档用「购买意图预测」。
- 能力边界：只设计触发规则与序列内容，不替代营销自动化平台，也不保证达到卡页口径的挽回率。
- 安全边界：同一用户 24 小时内触达不超过 1 次，支付成功后立即终止；WhatsApp 营销须显式 opt-in，消息模板需预先审核。

## 技能关联

- **前置**：Skill-Abandoned-Cart-Recovery-ML.html、Skill-Abandoned-Cart-Recovery-ML、Skill-Cohort-Churn-Intervention-Dispatcher.html、Skill-Cohort-Churn-Intervention-Dispatcher、Skill-RFM-Segment-Campaign-Dispatcher.html、Skill-RFM-Segment-Campaign-Dispatcher、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting、Skill-User-Funnel-Analysis.html、Skill-User-Funnel-Analysis
- **延伸**：Skill-Abandoned-Cart-Recovery-ML.html、Skill-Abandoned-Cart-Recovery-ML、Skill-Cohort-Churn-Intervention-Dispatcher.html、Skill-Cohort-Churn-Intervention-Dispatcher、Skill-RFM-Segment-Campaign-Dispatcher.html、Skill-RFM-Segment-Campaign-Dispatcher、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting
- **可组合**：Skill-Abandoned-Cart-Recovery-ML.html、Skill-Abandoned-Cart-Recovery-ML、Skill-Cohort-Churn-Intervention-Dispatcher.html、Skill-Cohort-Churn-Intervention-Dispatcher、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting、Skill-Abandoned-Cart-Recovery-Trigger

---

> 分类：业务运营/渠道经营/转化优化　·　技术族：14-用户分析　·　源卡：`Skill-Abandoned-Cart-Recovery-Trigger`