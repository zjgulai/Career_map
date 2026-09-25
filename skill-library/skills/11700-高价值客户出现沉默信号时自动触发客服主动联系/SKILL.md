---
name: "p2s-high-value-customer-proactive-alert"
title: "High Value Customer Proactive Alert — 高价值客户出现沉默信号时自动触发客服主动联系"
description: "触发词：沉默告警、高价值客户、P0 工单、间隔倍数、冷却期、主动联系。何时不用：要做 RFM 全群分级触达用高价值客户告警动作那张卡；本卡只做沉默信号检测与工单触发，不做全群营销编排。安全边界：必须设置冷却期避免重复打扰，触达须获用户授权并遵守反骚扰要求，不得对同一客户短期内反复外呼。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 会员活动"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-High-Value-Customer-Proactive-Alert"
p2s_src_domain: "14-用户分析"
quality_tier: "preview"
user_summary: "高价值客户沉默超过自身购买间隔的 1.3 倍就触发 P0 工单，让客服在 48 小时内主动联系。"
user_try: "试试：这是我的高价值客户活跃数据，帮我按历史购买间隔判断谁出现沉默信号，并生成 P0 工单和话术。"
whenToUse: "与「高价值客户告警动作」相比：要按 LTV 分级并绑定多渠道编排用那张卡；只要沉默信号检测、工单触发与冷却控制时用本卡。"
workflow: "设定高价值门槛（LTV、购买次数、账户时长）与沉默窗口 → 用历史平均购买间隔乘以倍数判断沉默异常 → 生成 P0 工单并按已触达记录选择渠道 → 设置 30 天冷却期，跟踪挽回结果"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# High Value Customer Proactive Alert — 高价值客户出现沉默信号时自动触发客服主动联系

## ① 解决的问题

客服团队面临"高价值客户沉默14天无主动触达机制"——沉默检测告警将高价值客户主动挽回率从22%提升至58%，年化减少高LTV流失$85,000

## ② 核心算法逻辑

核心是「高价值客户定义 + 沉默检测 + 自动告警调度」：

## ③ 业务应用场景

场景：吸奶器+婴儿护肤品高价值客户沉默预警 - 触发条件：客户Alice，历史LTV $1,200（F=5次，M=$1,200），最近一次活跃28天前，超过其历史平均间隔21天×1.3=27天，触发P0告警 - 执行动作：生成P0级客服工单，分配给高级客服，话术钩子「Alice上次购买了XXL吸奶器配件，新款防漏护垫上市了，是否需要了解？」，48小时内联系 - 安全护栏：Alice本月已收到2次邮件，工单标注「邮件已触达2次，电话优先」；30天内不二次生成工单 - 业务价值：高价值客户主动挽回率58%（vs 被动等待22%），年化减少高价值客户流失LTV损失$85,000
三轨验证 | 成本轨：AI模型调用成本月均800元（日均25万条用户数据处理×0.032元/千条），人工审核4小时/月，系统维护2小时/月，总月成本约1200元 | 合规轨：符合《个人信息保护法》第六条（告知同意原则），需获得用户推送通知授权，符合《反不正当竞争法》第八条，不构成骚扰。建议：用户端显示
**三轨验证** | 成本轨：采用本地化部署方案，初期投入15000元（服务器+模型部署），月均运维成本300元，人工标注高价值客户特征6小时/月，总月成本约500元 | 合规轨：符合《电子商务法》第十九条（个性化推荐需标注），需在推送文案中明示

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：高价值客户主动挽回率提升至50-60%（vs 被动20%），年化减少高LTV流失$60,000-$100,000
实施难度：⭐⭐☆☆☆（规则清晰，需接入CRM和活跃度数据）
优先级：⭐⭐⭐⭐⭐

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（186 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional
import heapq

def high_value_customer_proactive_alert(
    customers: List[Dict],
    min_ltv_threshold: float = 5000.0,
    min_purchase_count: int = 3,
    min_account_age_days: int = 60,
    silence_window_days: int = 14,
    silence_multiplier: float = 1.3,
    cooldown_days: int = 30,
    today: Optional[date] = None
) -> Dict:
    """
    高价值客户沉默告警触发器
    
    参数:
        customers: [{
            "customer_id": str,
            "total_spend": float,        # 历史累计消费（人民币元）
            "purchase_count": int,        # 累计购买次数
            "account_age_days": int,      # 账户注册天数
            "last_active_days": int,      # 距上次活跃天数（浏览/加购/购买）
            "avg_purchase_interval": float, # 历史平均购买间隔（天）
            "last_alert_days": int,       # 距上次告警天数（-1表示从未告警）
            "active_campaign": bool,      # 是否在营销序列中
            "last_purchase_category": str # 最近购买品类（话术钩子）
        }]
        min_ltv_threshold: 最低累计消费门槛（默认5000元）
        min_purchase_count: 最低购买次数
        min_account_age_days: 账户最小年龄
        silence_window_days: 沉默基准天数（14天）
        silence_multiplier: 沉默倍数（超过avg_interval×multiplier才算异常）
        cooldown_days: 告警冷却期
    
    返回:
        按优先级排序的告警工单列表
    """
    if today is None:
        today = date.today()
    
    alert_queue = []  # (−priority_score, customer_id, alert)
    skipped = []
    
    for cust in customers:
        cid = cust["customer_id"]
        spend = cust["total_spend"]
        f_count = cust["purchase_count"]
        acc_age = cust["account_age_days"]
        last_active = cust["last_active_days"]
        avg_interval = cust.get("avg_purchase_interval", 30)
        last_alert = cust.get("last_alert_days", -1)
        in_campaign = cust.get("active_campaign", False)
        
        # 高价值客户定义检查
        is_high_value = (
            spend >= min_ltv_threshold
            and f_count >= min_purchase_count
            and acc_age >= min_account_age_days
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1904.07780，但该号在 arXiv 上是《Quantifying cancer epithelial-mesenchymal plasticity and its association with stemness and immune response》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：客户累计消费、购买次数、账户时长、最近活跃日期与历史平均购买间隔；卡页参数为沉默窗口 14 天、间隔倍数 1.3、冷却期 30 天。

**输出**：P0 级客服工单与优先级、沉默判定依据（超额天数）与话术钩子、渠道选择建议（如本月邮件已 2 次则电话优先），供客服团队执行跟进。

## 执行步骤

1. 核定高价值门槛与沉默判定参数。
2. 用历史平均购买间隔乘以倍数判断沉默异常客户。
3. 结合已触达记录选定渠道并生成 P0 工单。
4. 设置冷却期防止 30 天内重复生成工单。
5. 跟踪主动联系后的挽回结果并调整阈值。

## 边界与不做

- 何时不用：缺少历史购买间隔或活跃日期字段时不要用；未达高价值门槛的客户不进本流程。
- 能力边界：产出告警与工单建议，不直接外呼、不代发消息；挽回率 58%、年化减少 $85,000 为卡页案例值。
- 安全边界：冷却期与触达授权是硬约束，反复打扰会违反反骚扰要求。

## 技能关联

- **前置**：Skill-Cohort-Churn-Intervention-Dispatcher.html、Skill-Cohort-Churn-Intervention-Dispatcher、Skill-RFM-Campaign-Auto-Dispatcher.html、Skill-RFM-Campaign-Auto-Dispatcher、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **延伸**：Skill-Cohort-Churn-Intervention-Dispatcher.html、Skill-Cohort-Churn-Intervention-Dispatcher、Skill-RFM-Campaign-Auto-Dispatcher.html、Skill-RFM-Campaign-Auto-Dispatcher
- **可组合**：Skill-Cohort-Churn-Intervention-Dispatcher.html、Skill-Cohort-Churn-Intervention-Dispatcher、Skill-High-Value-Customer-Proactive-Alert

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：14-用户分析　·　源卡：`Skill-High-Value-Customer-Proactive-Alert`