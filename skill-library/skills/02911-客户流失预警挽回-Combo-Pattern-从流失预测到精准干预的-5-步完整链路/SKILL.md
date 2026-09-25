---
name: "p2s-combo-customer-churn-recovery"
title: "客户流失预警→挽回 Combo Pattern — 从流失预测到精准干预的 5 步完整链路"
description: "触发词：流失挽回链路、流失评分、RFM 分层、触达时机、文案优化、Combo。何时不用：只做单点流失预测或单次触达用流失预测卡；要把预测、分层、时机、文案、激励串成完整挽回链路时用本卡。安全边界：激励成本与触达频率须设上限，遵守邮件与隐私法规并提供退订，不得对已退订用户重复触达。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 分群"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-Combo-Customer-Churn-Recovery"
p2s_src_domain: "06-增长模型"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把流失预测、人群分层、触达时机、文案和激励串成一条链路，一次把高危用户捞回来。"
user_try: "试试：这是我 5,000 名首购用户的行为与购买数据，帮我跑完整的流失预警到挽回 5 步链路，并估算挽回收益。"
whenToUse: "与「流失预测」相比：只要风险评分用那张卡；要一条从评分到触达执行的完整链路、并核算激励成本时用本卡。"
workflow: "按流失概率给首购用户打风险分，筛出高风险群体 → 对高风险群体做 RFM 分层，区分低价值与高价值首购 → 结合历史打开率确定最优触达时机（发送时段与间隔） → 按分层匹配激励与文案（小额促销或专属顾问回访） → 回收挽回率与激励成本，迭代阈值与话术"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 客户流失预警→挽回 Combo Pattern — 从流失预测到精准干预的 5 步完整链路

## ① 解决的问题

用户运营面临"用户流失了但流失预测/触达策略/最优时机/文案优化是四个孤立系统没有联动"——5步精准干预链路将高危用户挽回率从12%提升至34%，年化增收$8.6万

## ② 核心算法逻辑

论文：XGBoost: A Scalable Tree Boosting System | 年份：2016

## ③ 业务应用场景

场景A：母婴品牌跨境 DTC 站首购用户 60 天内复购挽回
- 业务问题：DTC 站首购用户 60 天复购率仅 14%，行业均值 28%，每流失 1 个首购用户损失 CLV ≈ $85（按 3 年生命周期估算） - 数据要求：用户 ID、购买日期、购买品类、购买金额、浏览行为、邮件 open 记录 - 执行过程： - Step1 流失概率评分：5,000 名首购用户中，1,850 人评分 > 0.7（高风险），召回率 0.81 - Step2 RFM 分层：F=1、M < $30 → 「低价值首购」策略（促销小礼品）；F=1、M > $80 → 「高价值首购」策略（专属顾问电话回访） - Step3 最优触达时机：该用户群 email open_rat
场景B：亚马逊老客户流失前主动干预（站外私域触达）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：DTC 品牌月均 5,000 名活跃用户，60 天流失率假设 22%（=1,100 人），本 Combo 挽回率提升 8 个百分点（1,100×8% = 88 人），人均 CLV $85，年化增量收益 = 88 × $85 × 12 ≈ 89.8 万元；激励成本约 15 万元，净 ROI ≈ 5x
关键指标：60 天复购率 +8pp（14% → 22%），邮件 CTR +34%（文案优化），激励成本 / 挽回用户 < $15（vs 新客获客成本 $45-$80）
实施难度：⭐⭐⭐☆☆（需要 CRM 数据接口 + 邮件平台 API，2-3 周工程化）
优先级：⭐⭐⭐⭐☆（复购增长是 DTC 品牌 LTV 最高杠杆点，ROI 极为确定）
适用规模：月活用户 ≥ 1,000 人，有历史购买数据 ≥ 6 个月

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（201 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'for' statement on line 59）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/growth_model/combo_customer_churn_recovery` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-Combo-Customer-Churn-Recovery.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
客户流失预警→挽回 Combo Pattern — 5 步精准干预链路
"""
from dataclasses import dataclass, field
from typing import Optional
import random
import math

random.seed(42)

# ──────────────────────────────────────────────
# 客户数据结构
# ──────────────────────────────────────────────
@dataclass
class Customer:
    user_id: str
    days_since_last_purchase: int
    total_purchases: int
    total_spend_usd: float
    email_open_rate: float  # 历史邮件开率 0~1
    baby_age_months: Optional[int] = None  # 宝宝月龄（用于个性化）
    # Combo 结果
    churn_probability: float = 0.0       # Step1
    rfm_segment: str = ""                # Step2
    optimal_send_hour: int = 9           # Step3
    best_message_variant: str = ""       # Step4
    incentive_offer: str = ""            # Step5
    expected_roi: float = 0.0

@dataclass
class ChurnRecoveryContext:
    customers: list[Customer]
    brand_avg_clv_usd: float = 85.0
    max_incentive_pct: float = 0.15
    results: dict = field(default_factory=dict)

# ──────────────────────────────────────────────
# Step1: 流失预测 — Skill-Customer-Churn-Prediction
# ──────────────────────────────────────────────
def step1_churn_prediction(ctx: ChurnRecoveryContext) -> ChurnRecoveryContext:
    """XGBoost 流失概率打分（简化为启发式函数）"""
    high_risk_count = 0
    for c in ctx.customers:
        # 特征：沉默天数 + 购买次数 + 消费金额（反向）
        silence_score = min(c.days_since_last_purchase / 90, 1.0)
        frequency_score = 1.0 - min(c.total_purchases / 5, 1.0)
        spend_score = 1.0 - min(c.total_spend_usd / 200, 1.0)
        c.churn_probability = round(silence_score * 0.5 + frequency_score * 0.3 + spend_score * 0.2, 3)
        if c.churn_probability > 0.7:
            high_risk_count += 1
    print(f"  [Step1] 流失评分完成: {len(ctx.customers)} 用户, 高风险(>0.7) {high_risk_count} 人")
    return ctx

# ──────────────────────────────────────────────
# Step2: RFM 分层策略 — Skill-RFM-to-Action-Policy-Engine
# ──────────────────────────────────────────────
def step2_rfm_segmentation(ctx: ChurnRecoveryContext) -> ChurnRecoveryContext:
    segment_counts = {}
    for c in ctx.customers:
        # R: 沉默天数, F: 购买次数, M: 消费金额
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:1603.02754 — XGBoost: A Scalable Tree Boosting System

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：用户 ID、购买日期与品类金额、浏览行为、邮件打开记录；卡页以 5,000 名首购用户、60 天复购窗口为口径，要求至少 6 个月历史购买数据。

**输出**：高风险用户清单与风险分、RFM 分层结果、最优触达时机与文案/激励方案，以及挽回率与净 ROI 估算（卡页净 ROI≈5x），供 CRM 与运营执行。

## 执行步骤

1. 评分首购用户的流失概率，筛出高风险群体。
2. 做高风险群体的 RFM 分层，区分价值高低与策略差异。
3. 依据历史打开与响应规律确定最优触达时机。
4. 匹配分层激励与文案，并设置触达频率上限。
5. 回收挽回率、激励成本与复购率，迭代阈值与话术。

## 边界与不做

- 何时不用：活跃用户规模过小（低于 1,000 人）或历史购买不足 6 个月时不要用；只想要一份流失名单不必跑全链路。
- 能力边界：产出链路方案与估算，不代发消息、不代发券；净 ROI≈5x、复购率 14%→22% 为卡页案例值。
- 安全边界：激励成本与触达频次必须设上限，须提供退订并遵守邮件合规要求。

## 技能关联

- **前置**：Skill-Brand-Penetration-Modeling.html、Skill-Brand-Penetration-Modeling、Skill-CC-OR-Net-LTV-Prediction.html、Skill-CC-OR-Net-LTV-Prediction、Skill-Combo-Ad-ROI-Maximizer.html、Skill-Combo-Ad-ROI-Maximizer、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Email-Sequence-Multiarm-Optimizer.html、Skill-Email-Sequence-Multiarm-Optimizer、Skill-Loyalty-Program-ROI-Modeling.html、Skill-Loyalty-Program-ROI-Modeling、Skill-RFM-to-Action-Policy-Engine.html、Skill-RFM-to-Action-Policy-Engine、Skill-Repurchase-Trigger-Timing-Model.html、Skill-Repurchase-Trigger-Timing-Model
- **延伸**：Skill-Brand-Penetration-Modeling.html、Skill-Brand-Penetration-Modeling、Skill-CC-OR-Net-LTV-Prediction.html、Skill-CC-OR-Net-LTV-Prediction、Skill-Combo-Ad-ROI-Maximizer.html、Skill-Combo-Ad-ROI-Maximizer
- **可组合**：Skill-Brand-Penetration-Modeling.html、Skill-Brand-Penetration-Modeling、Skill-CC-OR-Net-LTV-Prediction.html、Skill-CC-OR-Net-LTV-Prediction、Skill-Combo-Ad-ROI-Maximizer.html、Skill-Combo-Ad-ROI-Maximizer、Skill-Email-Sequence-Multiarm-Optimizer.html、Skill-Email-Sequence-Multiarm-Optimizer、Skill-Loyalty-Program-ROI-Modeling.html、Skill-Loyalty-Program-ROI-Modeling、Skill-Repurchase-Trigger-Timing-Model.html、Skill-Repurchase-Trigger-Timing-Model、Skill-Combo-Customer-Churn-Recovery

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：06-增长模型　·　源卡：`Skill-Combo-Customer-Churn-Recovery`