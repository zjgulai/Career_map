---
name: "p2s-rfm-campaign-auto-dispatcher"
title: "RFM Campaign Auto Dispatcher — 按RFM分群自动映射并触发差异化营销序列"
description: "触发词：RFM 分群、营销序列映射、自动触发、流失唤醒、触达上限、会员运营。何时不用：只做分群不派发时不必用本卡；要考虑个体因果增量时用 Uplift 定向卡；本卡负责把分群结果自动映射成差异化营销序列。安全边界：须设触达频次上限与低价值过滤，遵守隐私与促销法规，不得夸大宣传或对不同人群做价格歧视。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 分群"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-RFM-Campaign-Auto-Dispatcher"
p2s_src_domain: "14-用户分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "RFM 一分好群就自动配上对应的营销序列，让不同价值的人收到不同的话术和权益。"
user_try: "试试：这是我本季度的 RFM 分群结果，帮我映射到对应的营销序列并设置触达频次上限。"
whenToUse: "与「队列挽回调度」相比：按队列留存分层用那张卡；按 RFM 价值分层并自动匹配营销序列时用本卡。"
workflow: "完成季度 RFM 评分与分群（Champions、At Risk、Lost、New 等） → 为每个分群映射对应的营销序列与权益力度 → 设置低价值跳过规则与月度触达次数上限 → 批量派发并跟踪各群挽回率与增量 LTV"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# RFM Campaign Auto Dispatcher — 按RFM分群自动映射并触发差异化营销序列

## ① 解决的问题

营销团队面临"RFM分群完成后手动匹配营销序列效率低"——规则引擎自动映射触发，At Risk群体挽回率从12%提升至28%，年化增量LTV $65,000

## ② 核心算法逻辑

论文：RFMBased Campaign Optimization via Rule Engine | 年份：2020

## ③ 业务应用场景

场景：母婴品牌季度RFM更新后的批量营销调度 - 触发条件：季度RFM批量评分完成，识别出：Champions 320人，At Risk 180人，Lost 450人，New 210人 - 执行动作：Champions→「新品首发专属邀请」邮件序列；At Risk→「限时唤醒30%折扣券」；Lost→「我们改变了，来看看」再接触序列；New→「宝宝成长5步攻略」教育序列 - 安全护栏：Lost群体历史均值M<$50者跳过（低价值不值得成本投入）；每用户本月触达不超过3次 - 业务价值：At Risk群体挽回率提升至28%，年化增量LTV约$65,000
三轨验证 | 成本轨：月均成本1200元（AI模型调用费用800元/月+人工审核4小时/月×100元/小时），ROI预期3.5倍（复购率提升28%带动客单价增长15%，月均GMV增长约18万元） | 合规轨：符合《电商法》第十七条用户信息保护规范，RFM数据处理需获得用户隐私授权，建议建立数据使用协议并通过ISO27001认证，合规度95% | 风险轨：①数据泄露风险（概率8%），涉及用户消费行为数据；②模型偏差风险（概率12%），RFM分层不准确导致营销转化率下降；③平台政策变动风险（概率5%），跨境电商监管趋严
**三轨验证** | 成本轨：月均成本2800元（多渠道集成费用1500元/月+数据分析师0.5人×2500元/月+技术维护6小时/月×100元/小时），ROI预期2.8倍（支持多平台协同，覆盖eBay/Wish/AmazonGlobal，复购率提升32%） | 合规轨：需满足GDPR（欧盟用户数据）、CCPA（美国加州）、《个人信息保护法》（中国用户）三重合规要求，建议部署数据分类分级系统，合规度88% | 风险轨：①跨境数据流转风险（概率15%），涉及多国用户隐私法规冲突；②汇率波动风险（概率10%），影响客单价计算准确性；③平台API变更风险（概率18%），第三方平台接口调整导致数据同步

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：At Risk群体挽回率提升至25-35%，年化增量LTV $50,000-$80,000
实施难度：⭐⭐☆☆☆（RFM计算标准化，需对接CRM和邮件平台API）
优先级：⭐⭐⭐⭐⭐

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（187 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Tuple

def compute_rfm_score(
    last_purchase_days: int,
    purchase_count: int,
    total_spend: float,
    r_breakpoints: List[float] = None,
    f_breakpoints: List[float] = None,
    m_breakpoints: List[float] = None
) -> Tuple[int, int, int]:
    """将原始RFM值转换为1-5分"""
    if r_breakpoints is None:
        r_breakpoints = [7, 14, 30, 60]  # 天数越小R越高
    if f_breakpoints is None:
        f_breakpoints = [1, 2, 4, 8]
    if m_breakpoints is None:
        m_breakpoints = [50, 200, 500, 1000]
    
    def score_metric(value, breakpoints, reverse=False):
        score = 5
        for bp in sorted(breakpoints):
            if value <= bp:
                break
            score -= 1
        return max(1, score) if not reverse else min(5, 6 - score)
    
    r = score_metric(last_purchase_days, r_breakpoints)  # 天数越小越好
    f = score_metric(purchase_count, f_breakpoints, reverse=True)  # 次数越多越好
    m = score_metric(total_spend, m_breakpoints, reverse=True)
    return r, f, m


def classify_rfm_segment(r: int, f: int, m: int) -> Tuple[str, int]:
    """RFM分群映射，返回(分群名, 优先级)"""
    rfm = (r, f, m)
    if r >= 4 and f >= 4 and m >= 4:
        return "Champions", 1
    elif r >= 4 and f >= 4:
        return "Loyal_Customers", 2
    elif r >= 4 and f <= 2:
        return "New_Customers", 3
    elif r >= 3 and f >= 3 and m >= 3:
        return "Promising", 4
    elif r >= 3 and f >= 3:
        return "Potential_Loyalists", 5
    elif r <= 2 and f >= 4 and m >= 4:
        return "At_Risk", 6
    elif r <= 2 and f >= 3:
        return "Cant_Lose_Them", 7
    elif r <= 2 and f <= 2 and m >= 2:
        return "Hibernating", 8
    else:
        return "Lost", 9


SEGMENT_CAMPAIGN_MAP = {
    "Champions":         {"campaign": "VIP_EARLY_ACCESS",       "channel": ["email", "sms"],  "priority": 1, "template": "新品首发专属邀请+优先购权益"},
    "Loyal_Customers":   {"campaign": "LOYALTY_REWARD",         "channel": ["email"],         "priority": 2, "template": "忠诚积分兑换+专属会员日"},
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2006.06878，但该号在 arXiv 上是《Optimization Theory for ReLU Neural Networks Trained with Normalization Layers》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《RFMBased Campaign Optimization via Rule Engine》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：用户最近购买距今天数、购买次数、累计消费金额（用于 RFM 打分与分群），以及 CRM 与邮件平台接口；卡页为季度批量评分场景。

**输出**：分群到营销序列的映射方案（卡页 Champions→新品首发邀请、At Risk→限时唤醒券、Lost→再接触、New→教育序列）、触达护栏配置与效果评估（卡页 At Risk 挽回率→28%、年化增量 LTV 约 $65,000）。

## 执行步骤

1. 完成 R/F/M 阈值评分并输出分群名单。
2. 匹配每个分群的营销序列、权益与文案。
3. 配置低价值跳过规则与月度触达上限。
4. 通过 CRM 与邮件平台批量派发。
5. 跟踪各分群挽回率与增量 LTV 并迭代阈值。

## 边界与不做

- 何时不用：RFM 字段缺失、分群规模过小或没有 CRM 与邮件通道时不要用；需要个体因果增量判断时改用 Uplift 定向。
- 能力边界：产出映射方案与派发规则，不代执行群发；挽回率 28%、年化增量 LTV $65,000 为卡页案例值。
- 安全边界：必须设触达上限与低价值过滤，不得价格歧视或夸大宣传。

## 技能关联

- **前置**：Skill-Cohort-Churn-Intervention-Dispatcher.html、Skill-Cohort-Churn-Intervention-Dispatcher、Skill-High-Value-Customer-Proactive-Alert.html、Skill-High-Value-Customer-Proactive-Alert、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **延伸**：Skill-Cohort-Churn-Intervention-Dispatcher.html、Skill-Cohort-Churn-Intervention-Dispatcher、Skill-High-Value-Customer-Proactive-Alert.html、Skill-High-Value-Customer-Proactive-Alert
- **可组合**：Skill-High-Value-Customer-Proactive-Alert.html、Skill-High-Value-Customer-Proactive-Alert、Skill-RFM-Campaign-Auto-Dispatcher

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：14-用户分析　·　源卡：`Skill-RFM-Campaign-Auto-Dispatcher`