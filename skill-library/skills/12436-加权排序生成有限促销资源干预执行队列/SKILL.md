---
name: "p2s-uplift-intervention-priority-queue"
title: "Uplift-Intervention-Priority-Queue — Uplift×LTV加权排序生成有限促销资源干预执行队列"
description: "触发词：干预队列、增量与价值加权、资源约束、分层触达、负效应过滤、发券名单。何时不用：要单独估个体效应本身用「因果提升模型」或「X-Learner 异质处理效应」；要在分群间分预算用「个性化促销定向」。安全边界：本技能承载的是排序与筛选规则，不是执行器；发券与触达由模型外的确定性控制层执行，用户数据处理须符合个人信息保护要求。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-078"
l3_business: "促销规划"
l3_all: "促销规划 / 增量分析"
l1_l2_l3: "业务运营/渠道经营/促销规划"
p2s_card_id: "Skill-Uplift-Intervention-Priority-Queue"
p2s_src_domain: "14-用户分析"
quality_tier: "preview"
user_summary: "券只有 500 张、候选 1500 人：按增量效应和用户价值排序，把负效应的人剔掉，剩下的分层发。"
user_try: "试试：618 前我有 500 张 15% 券和 1500 名候选用户，帮我按增量效应与用户价值生成发放队列和分层方案。"
whenToUse: "当促销资源有限（券数或客服名额）且已有提升模型评分、需要产出可执行名单时用本技能；若还要估计效应本身，用「因果提升模型」或「X-Learner 异质处理效应」；若在分群间分预算，用「个性化促销定向」。"
workflow: "汇总候选用户的增量效应得分、置信区间宽度、预测价值与距上次购买天数 → 过滤负效应与高不确定性用户，归入排除或观察名单 → 按效应与价值加权计算优先级分并排序 → 按资源约束截断生成执行队列与候补名单 → 按分位分层匹配触达力度并写入安全护栏"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Uplift-Intervention-Priority-Queue — Uplift×LTV加权排序生成有限促销资源干预执行队列

## ① 解决的问题

促销运营面临"618前500张优惠券随机分发给1500名候选用户导致增量GMV损失"——Uplift×LTV加权排序将同等预算下增量GMV提升40-70%，单次大促多产出$2000-4000

## ② 核心算法逻辑

核心是「双维度加权排序 + 资源约束截断 + 负Uplift过滤」三步执行流程：

## ③ 业务应用场景

场景：618大促前，有限促销券分配给最有潜力的流失预防用户 - 触发条件：Uplift模型完成评分，1,500名30天内未购买候选用户；促销预算=500张15%优惠券 - 执行动作：按Priority Score排序，取Top 500名生成执行队列 - TOP_20%（100人）：Uplift×LTV Top，获VIP礼包+15%券+专属客服 - MID_60%（300人）：标准15%优惠券+自动邮件 - BOTTOM_20%（100人）：仅轻量推送，不消耗优惠券 - 安全护栏：排除Uplift<0的115名"抵触型"用户（发券反而会退订），实际可干预=1,385人 - 业务价值：相比随机发券
三轨验证 | 成本轨：AI模型调用成本月均800元（日均50万条用户数据处理×0.0016元/千条），人工标注与验证12小时/月，系统维护成本月均1200元，总计月均2000元 | 合规轨：符合《个人信息保护法》第四章数据使用规范，RFM分层属合法数据分析范畴，需获得用户隐私授权书面确认，建议部署数据脱敏机制 | 风险轨：高价值用户识别偏差导致营销转化率下降（概率15%），跨境支付数据合规风险在欧盟GDPR下可能面临罚款（概率8%），模型漂移导致复购预测准确度下降至70%以下（概率12%）
**三轨验证** | 成本轨：采用第三方RFM工具集成方案月均1500元（含API调用费600元、SaaS订阅900元），人工审核6小时/月，无额外系统维护成本 | 合规轨：第三方工具需具备SOC2认证或ISO27001资质，与供应商签署数据处理协议（DPA），母婴产品涉及未成年人数据需特别保护，建议建立儿童信息保护合规清单 | 风险轨：第三方服务商数据泄露风险（概率6%），API依赖导致系统可用性受限（概率10%），高价值用户流失到竞品的识别滞后性（概率18%），跨境数据传输合规审查周期长（概率20%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI量化：相比随机发券，Uplift×LTV排序在相同预算下可提升增量GMV约40-70%；500张优惠券场景下，典型增量GMV提升$2,000-4,000/次
实施难度：⭐⭐☆☆☆（主要依赖Uplift模型上游，执行逻辑为简单排序截断）
优先级：⭐⭐⭐⭐⭐（促销资源永远有限，排序效率直接决定营销ROI；是运营自动化的高频核心场景）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（173 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 56 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import heapq
from typing import Dict, List, Optional, Tuple

# 分层阈值
TIER_THRESHOLDS = {
    "TOP": 0.80,    # 前20%
    "MID": 0.20,    # 20%-80%
    "BOTTOM": 0.0   # 后20%
}


def uplift_intervention_priority_queue(
    users: List[Dict],
    resource_budget: int,
    uplift_ci_threshold: float = 0.3,
    negative_uplift_filter: bool = True
) -> Dict:
    """
    Uplift×LTV加权干预优先级队列生成器
    
    参数:
        users: [{
            "user_id": str,
            "uplift_score": float,      # 干预增量购买概率 [-1, 1]
            "uplift_ci_width": float,   # Uplift置信区间宽度（不确定性）
            "ltv_estimate": float,      # 预测LTV（美元）
            "last_purchase_days": int,  # 距最近购买天数
        }]
        resource_budget: 可用干预资源数量（优惠券数/客服名额）
        uplift_ci_threshold: Uplift不确定性过滤阈值
        negative_uplift_filter: 是否过滤负Uplift用户
    
    返回:
        {"execution_queue": [...], "waitlist": [...], "excluded": [...], "summary": {...}}
    """
    excluded = []
    candidates = []
    
    for u in users:
        uid = u["user_id"]
        uplift = u["uplift_score"]
        ci_width = u.get("uplift_ci_width", 0.0)
        ltv = u["ltv_estimate"]
        
        # 过滤1：负Uplift（干预抵触型用户）
        if negative_uplift_filter and uplift < 0:
            excluded.append({
                "user_id": uid,
                "reason": f"负Uplift={uplift:.3f}，干预可能导致退订，已排除",
                "uplift_score": uplift
            })
            continue
        
        # 过滤2：高不确定性（置信区间过宽）
        if ci_width > uplift_ci_threshold:
            excluded.append({
                "user_id": uid,
                "reason": f"Uplift不确定性过高（CI宽={ci_width:.2f}>{uplift_ci_threshold}），降级为观察态",
                "uplift_score": uplift,
                "ci_width": ci_width
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：候选用户列表：用户标识、增量效应得分、置信区间宽度、预测生命周期价值、距最近购买天数，以及可用资源数量（券数或名额）与不确定性过滤阈值；粒度为用户 × 一次活动。

**输出**：执行队列（含分层与触达方式）、候补名单、被排除名单及理由，以及汇总统计；供运营按队列发券与分派资源。

## 执行步骤

1. 汇总候选用户的效应得分、区间宽度与预测价值
2. 过滤负效应与高不确定性用户
3. 按效应与价值加权计算优先级并排序
4. 按资源约束截断生成执行队列与候补
5. 按分位分层匹配触达力度并写入护栏

## 边界与不做

- 数据不满足：没有效应得分或置信区间时排序无依据；不确定性过宽的用户应降级为观察态。
- 何时不用：效应估计本身用「因果提升模型」或「X-Learner 异质处理效应」；分群预算分配用「个性化促销定向」。
- 能力边界：本技能承载的是排序与筛选规则，不是执行器；发券与触达动作由模型外的确定性控制层执行。
- 安全边界：用户数据处理须符合个人信息保护要求，第三方工具需具备安全资质并签署数据处理协议。

## 技能关联

- **前置**：Skill-AB-Test-Sequential-Design、Skill-Cohort-Churn-Intervention-Dispatcher.html、Skill-Cohort-Churn-Intervention-Dispatcher、Skill-RFM-Segment-Campaign-Dispatcher.html、Skill-RFM-Segment-Campaign-Dispatcher、Skill-Uplift-Churn-Prediction.html、Skill-Uplift-Churn-Prediction、Skill-VIP-Tier-Upgrade-Action.html、Skill-VIP-Tier-Upgrade-Action
- **延伸**：Skill-AB-Test-Sequential-Design、Skill-Cohort-Churn-Intervention-Dispatcher.html、Skill-Cohort-Churn-Intervention-Dispatcher、Skill-RFM-Segment-Campaign-Dispatcher.html、Skill-RFM-Segment-Campaign-Dispatcher、Skill-VIP-Tier-Upgrade-Action.html、Skill-VIP-Tier-Upgrade-Action
- **可组合**：Skill-Cohort-Churn-Intervention-Dispatcher.html、Skill-Cohort-Churn-Intervention-Dispatcher、Skill-RFM-Segment-Campaign-Dispatcher.html、Skill-RFM-Segment-Campaign-Dispatcher、Skill-VIP-Tier-Upgrade-Action.html、Skill-VIP-Tier-Upgrade-Action、Skill-Uplift-Intervention-Priority-Queue

---

> 分类：业务运营/渠道经营/促销规划　·　技术族：14-用户分析　·　源卡：`Skill-Uplift-Intervention-Priority-Queue`