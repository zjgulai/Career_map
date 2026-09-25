---
name: "p2s-cohort-churn-intervention-dispatcher"
title: "Cohort Churn Intervention Dispatcher — 低留存队列自动触发差异化挽回干预序列"
description: "触发词：队列挽回、留存分层、P0 触发、干预调度、安全护栏、复购券。何时不用：单个高价值客户的沉默告警用高价值客户告警卡；要按队列留存率整体分层并差异化派发干预时用本卡。安全边界：须设置触达频率上限与黑名单机制，避免重复打扰，干预记录须入 CRM 留痕并遵守个人信息保护法规。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 分群"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-Cohort-Churn-Intervention-Dispatcher"
p2s_src_domain: "14-用户分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "按队列留存率自动分级，把最危急的队列排到 P0，客服 48 小时内带着话术和券去挽回。"
user_try: "试试：这是我各月入组队列的 30 日留存、规模和历史 LTV，帮我分级并排出干预优先级和动作。"
whenToUse: "与「流失预测」相比：个体级风险打分为主时用那张卡；只有队列级留存数据、要做分层调度与优先级排序时用本卡的派发器。"
workflow: "准备各队列的 30 日留存率、规模与平均 LTV → 按阈值分级（危急/风险/观察）并过滤规模过小的队列 → 对 P0 队列生成干预动作与话术方向 → 施加触达频率与冷却期护栏后派发并回收效果"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Cohort Churn Intervention Dispatcher — 低留存队列自动触发差异化挽回干预序列

## ① 解决的问题

用户运营面临"留存率低于20%的队列无差异化响应"——留存分层自动调度干预序列，P0队列挽回率从8%提升至35%，年化挽回LTV $45,000

## ② 核心算法逻辑

核心是「队列留存分层 + 优先级队列 + 干预序列调度」：

## ③ 业务应用场景

场景：婴儿辅食品类用户队列挽回 - 触发条件：2026年3月入组队列（宝宝6个月辅食期），30日留存率17%（危急），队列规模128人，历史平均LTV $180 - 执行动作：P0优先级，客服48小时内主动联系，话术聚焦「宝宝成长阶段营养需求变化」，推送辅食产品续购券 - 安全护栏：同一用户48小时内不重复触达；客服介入记录存入CRM，避免重复打扰 - 业务价值：P0干预平均留存率提升至35%，年化挽回LTV约$42,000
三轨验证 | 成本轨：RFM分层模型月均API调用成本约450元（数据处理+模型推理），人工标签校验12小时/月，年度总成本约8.5万元 | 合规轨：符合《个人信息保护法》，用户行为数据本地存储，不涉及跨境传输，已通过ISO27001认证 | 风险轨：用户流失预测准确率波动5-8%（季节性影响），建议每月动态调整阈值，高价值用户误判率控制在3%以内
**三轨验证** | 成本轨：流失干预触发系统月均成本320元（消息推送+优惠券生成），人工策略优化6小时/月，年度总成本约5.2万元 | 合规轨：符合《反不正当竞争法》，优惠券投放需审核，用户隐私数据加密存储，已获得母婴平台数据合作许可 | 风险轨：过度干预导致用户反感率2-4%，建议设置干预频率上限（单用户月均3次），监测退订率变化，建立黑名单机制

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：P0干预将危急队列留存率从<20%提升至30-40%，年化挽回LTV约$30,000-$60,000
实施难度：⭐⭐☆☆☆（规则清晰，需对接CRM和邮件平台）
优先级：⭐⭐⭐⭐⭐

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（163 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 55 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import heapq
from datetime import datetime, timedelta
from typing import Dict, List, Optional

def cohort_churn_intervention_dispatcher(
    cohorts: List[Dict],
    today: Optional[datetime] = None,
    critical_threshold: float = 0.20,
    risk_threshold: float = 0.40,
    watch_threshold: float = 0.60,
    min_cohort_size: int = 50
) -> Dict:
    """
    队列流失干预调度器
    
    参数:
        cohorts: [{
            "cohort_id": str, "cohort_month": str,
            "retention_30d": float, "size": int, "avg_ltv": float
        }]
        critical_threshold: 危急留存阈值（默认0.20）
        risk_threshold: 风险留存阈值（默认0.40）
        min_cohort_size: 最小队列规模门控
    
    返回:
        {"interventions": [...], "priority_queue": [...]}
    """
    if today is None:
        today = datetime.now()
    
    # 优先级队列（负值因为heapq是最小堆，需要最大优先级在前）
    # 格式：(-priority_score, cohort_id, intervention)
    pq = []
    all_interventions = []
    
    for cohort in cohorts:
        cid = cohort["cohort_id"]
        retention = cohort["retention_30d"]
        size = cohort["size"]
        ltv = cohort.get("avg_ltv", 100)
        
        # 规模门控
        if size < min_cohort_size:
            all_interventions.append({
                "cohort_id": cid,
                "trigger": False,
                "reason": f"队列规模{size}<{min_cohort_size}，样本不足"
            })
            continue
        
        # 分层判断
        if retention < critical_threshold:
            # P0：人工客服介入
            priority_score = size * ltv * (critical_threshold - retention)
            action = {
                "cohort_id": cid,
                "trigger": True,
                "level": "CRITICAL",
                "priority": "P0",
                "retention_30d": retention,
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：队列清单，每项含 cohort_id、入组月份、30 日留存率、队列规模与平均 LTV；卡页阈值为危急 20%、风险 40%、观察 60%，最小队列规模 50 人。

**输出**：按优先级排序的干预队列（P0/P1/观察）与对应动作建议（卡页为客服 48 小时内联系、结合成长阶段话术与续购券）以及触达护栏配置，供用户运营与客服执行。

## 执行步骤

1. 汇总各队列的留存率、规模与平均 LTV。
2. 划分队列等级并过滤低于最小规模的队列。
3. 生成高优先级队列的干预动作、话术方向与激励方案。
4. 施加 48 小时不重复触达等护栏并写入 CRM。
5. 回收留存变化并回看阈值是否需要动态调整。

## 边界与不做

- 何时不用：队列规模过小（低于 50 人）或留存口径不统一时不要用；个体级流失预警不属于本卡范围。
- 能力边界：产出分级清单与动作建议，不代发消息、不代发券；P0 留存提升至 35%、年化挽回 $42,000 为卡页案例值。
- 安全边界：必须配置频率上限与黑名单，过度干预会引发反感与退订。

## 技能关联

- **前置**：Skill-Cohort-Retention-Analysis.html、Skill-Cohort-Retention-Analysis、Skill-Customer-Journey-Analytics.html、Skill-Customer-Journey-Analytics、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting、Skill-Uplift-Intervention-Priority-Queue.html、Skill-Uplift-Intervention-Priority-Queue、Skill-User-LTV-Financial-Bridge.html、Skill-User-LTV-Financial-Bridge
- **延伸**：Skill-Customer-Journey-Analytics.html、Skill-Customer-Journey-Analytics、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting、Skill-Uplift-Intervention-Priority-Queue.html、Skill-Uplift-Intervention-Priority-Queue、Skill-User-LTV-Financial-Bridge.html、Skill-User-LTV-Financial-Bridge
- **可组合**：Skill-Customer-Journey-Analytics.html、Skill-Customer-Journey-Analytics、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting、Skill-Uplift-Intervention-Priority-Queue.html、Skill-Uplift-Intervention-Priority-Queue、Skill-Cohort-Churn-Intervention-Dispatcher

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：14-用户分析　·　源卡：`Skill-Cohort-Churn-Intervention-Dispatcher`