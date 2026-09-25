---
name: "p2s-subscription-renewal-intervention-gate"
title: "Subscription-Renewal-Intervention-Gate — 订阅到期前14天沉默用户自动触发个性化续订挽回"
description: "触发词：订阅续费挽回、到期前触达、沉默分层、续订折扣门控、流失拦截。何时不用：一次性买断客户没有续订概念，改用复购时点或裂变类技能；本技能只面向有到期日的订阅制业务。安全边界：邮件发送前须取得用户同意并提供一键退订；折扣信息须标注适用人群，避免虚假宣传。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-Subscription-Renewal-Intervention-Gate"
p2s_src_domain: "06-增长模型"
quality_tier: "preview"
user_summary: "在订阅到期前盯着那些悄悄不登录的客户，按沉默程度自动发提醒和折扣，把要走的续费留下来。"
user_try: "试试：按到期前 14 天加近 45 天无登录的条件筛出需要挽回的订阅客户，生成三封挽回序列与折扣梯度。"
whenToUse: "有明确订阅到期日与活跃度信号时用本技能；非订阅制的一次性复购经营用复购时点预测技能。"
workflow: "接入订阅到期时间、最近活跃时间与月均 ARR → 按沉默天数把订阅分为轻/中/重三档 → 为每档匹配折扣力度与邮件内容方向 → 生成到期前 T+0/T+3/T+7 的挽回序列并输出清单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Subscription-Renewal-Intervention-Gate — 订阅到期前14天沉默用户自动触发个性化续订挽回

## ① 解决的问题

运营面临"订阅用户到期前默默流失"——到期前14天+近30天无登录自动触发续订挽回序列将续订率从64%提升至78%，年化保护订阅收入45万元

## ② 核心算法逻辑

核心是「到期预警 + 沉默识别 + 分层挽回序列」：

## ③ 业务应用场景

场景：母婴选品工具 SaaS 订阅续费挽回 - 触发条件：企业订阅用户「某跨境电商公司」，订阅到期 T-12天，近 45 天无登录（沉默中度） - 执行动作： - T+0h：邮件「您的订阅还有12天到期——查看您过去 3 个月分析报告的亮点」（个性化回顾） - T+3day：邮件「专属续订折扣：8折优惠（72h有效）+ 新功能预览」 - T+7day：邮件「续订最后提醒：我们的客服随时为您答疑」 - 挽回率：沉默中度用户挽回率从 18% → 34%，年化 ARR 挽回 $85,000
成本轨： - 数据采集：订阅系统 API 调用成本 $200/月（日均 50K 订阅查询） - 计算资源：干预决策引擎运行成本 $150/月（云函数 + 数据库查询） - 邮件发送：第三方邮件平台成本 $0.005/封，月均 8,000 封 = $40/月 - 人力投入：初期配置 + 优化迭代 40h/月 × $50/h = $2,000/月 - 总显性成本：$2,390/月（年化 $28,680） - 对标 $85,000 年化挽回额，成本占比 33.7%，净收益 $56,320/年
合规轨： - ✅ GDPR 合规：邮件发送前获取用户明确同意，提供一键取消订阅选项，不涉及跨境数据转移风险 - ✅ Amazon 政策：若在 Amazon Appstore 分发，需遵守「不得虚假宣传续订优惠」原则，本方案基于真实用户行为触发，合规 - ✅ 广告法合规：折扣信息需标注「仅限沉默用户」，避免虚假宣传；邮件内容不涉及医疗/金融声称 - ✅ 跨境贸易法规：若涉及跨境电商客户，折扣政策需符合当地税务申报要求（如欧盟 VAT），建议与财务部门确认 - 风险等级：低风险，无政策触碰点

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI量化：沉默中度用户续订率从 18% → 34%，年化 ARR 挽回 $85,000；挽回成本（折扣+人工）约 $12,000，净收益 $73,000
实施难度：⭐⭐☆☆☆（需订阅系统 API + 用户活跃度追踪 + 邮件平台）
优先级：⭐⭐⭐⭐⭐（订阅续费率是 SaaS 型业务的核心 ARR 保障指标）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（202 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
from datetime import datetime, timedelta
from typing import Dict, List, Optional

def subscription_renewal_intervention_gate(
    subscriptions: List[Dict],
    now: Optional[datetime] = None,
    trigger_days_before: int = 14,
    silence_light_days: int = 14,
    silence_medium_days: int = 30,
    silence_heavy_days: int = 60,
    light_discount: float = 0.0,
    medium_discount: float = 0.10,
    heavy_discount: float = 0.20
) -> Dict:
    """
    订阅续订挽回门控
    
    参数:
        subscriptions: [{
            "sub_id": str, "user_id": str, "company_name": str,
            "expires_at": str (ISO8601),
            "last_active_at": str (ISO8601),
            "monthly_arr": float,           # 月均 ARR
            "top_features": List[str],      # 最常用功能
            "auto_renew": bool
        }]
    
    返回:
        {"interventions": [...], "stats": {...}}
    """
    if now is None:
        now = datetime.now()
    
    interventions = []
    
    for sub in subscriptions:
        sid = sub["sub_id"]
        uid = sub["user_id"]
        company = sub.get("company_name", uid)
        expires_at = datetime.fromisoformat(sub["expires_at"])
        last_active_at = datetime.fromisoformat(sub["last_active_at"])
        arr = sub.get("monthly_arr", 0)
        top_features = sub.get("top_features", [])
        auto_renew = sub.get("auto_renew", False)
        
        # 已设置自动续订的跳过
        if auto_renew:
            interventions.append({"sub_id": sid, "action": "SKIP", "reason": "已设置自动续订"})
            continue
        
        # 计算到期天数
        days_to_expire = (expires_at - now).days
        
        # 未在触发窗口内
        if days_to_expire > trigger_days_before or days_to_expire < 0:
            interventions.append({
                "sub_id": sid, "action": "NOT_IN_WINDOW",
                "days_to_expire": days_to_expire
            })
            continue
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.12634，但该号在 arXiv 上是《Characterization of resistive Micromegas detectors for the upgrade of the T2K Near Detector Time Projection Chambers》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：订阅级明细：sub_id、user_id、到期时间（ISO8601）、最近活跃时间（ISO8601）、月均 ARR、最常用功能、是否自动续订；粒度到单个订阅。

**输出**：干预清单（每条订阅的沉默分层、折扣力度、触发时机与邮件方向）与汇总统计（挽回数、挽回率）；供订阅系统与邮件平台执行挽回序列。

## 执行步骤

1. 接入订阅到期日、最近活跃时间与 ARR 字段
2. 按沉默天数把订阅分层为轻/中/重三档
3. 为每档匹配折扣力度与邮件内容方向
4. 生成到期前 T+0/T+3/T+7 的触达序列
5. 输出干预清单与挽回率统计

## 边界与不做

- 非订阅制业务（没有到期日概念）不用本技能。
- 本技能产出干预决策与序列，不代替订阅系统的真实扣费、改价与邮件发送。
- 安全边界：邮件须基于用户同意且可一键退订；折扣须标明适用人群，避免虚假宣传。

## 技能关联

- **前置**：Skill-Cohort-Churn-Intervention-Dispatcher.html、Skill-Cohort-Churn-Intervention-Dispatcher、Skill-Combo-Customer-Churn-Recovery.html、Skill-Combo-Customer-Churn-Recovery、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-MTL-Churn-LTV-Joint-Prediction.html、Skill-MTL-Churn-LTV-Joint-Prediction、Skill-User-LTV-Financial-Bridge.html、Skill-User-LTV-Financial-Bridge
- **延伸**：Skill-Cohort-Churn-Intervention-Dispatcher.html、Skill-Cohort-Churn-Intervention-Dispatcher、Skill-Combo-Customer-Churn-Recovery.html、Skill-Combo-Customer-Churn-Recovery、Skill-MTL-Churn-LTV-Joint-Prediction.html、Skill-MTL-Churn-LTV-Joint-Prediction、Skill-User-LTV-Financial-Bridge.html、Skill-User-LTV-Financial-Bridge
- **可组合**：Skill-Combo-Customer-Churn-Recovery.html、Skill-Combo-Customer-Churn-Recovery、Skill-MTL-Churn-LTV-Joint-Prediction.html、Skill-MTL-Churn-LTV-Joint-Prediction、Skill-User-LTV-Financial-Bridge.html、Skill-User-LTV-Financial-Bridge、Skill-Subscription-Renewal-Intervention-Gate

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：06-增长模型　·　源卡：`Skill-Subscription-Renewal-Intervention-Gate`