---
name: "p2s-ltv-acquisition-budget-gate"
title: "LTV-Acquisition-Budget-Gate — LTV/CAC比值驱动的获客预算自动开闸/熔断决策器"
description: "触发词：LTV/CAC比值、获客熔断、预算开闸、LTV分位数、样本量门控。何时不用：没有LTV预测输出或新客样本不足时不评估；只按渠道饱和度削预算走再分配触发器。安全边界：熔断只暂停新客获取预算，已有客户再营销与品牌最低预算不受影响，扩增须受连续扩增次数上限约束。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 异常冻结与恢复"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
p2s_card_id: "Skill-LTV-Acquisition-Budget-Gate"
p2s_src_domain: "06-增长模型"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "按 LTV/CAC 比值自动决定哪些渠道熔断新客投放、哪些加预算，并带样本量与连续扩增护栏。"
user_try: "试试：这月 LTV 预测更新完了，Facebook 比值4.0、Google 6.4、TikTok 2.1，帮我给出开闸与熔断决策。"
whenToUse: "当已有渠道级 LTV 预测与 CAC、要按比值决定开闸或熔断时用本卡；只按饱和度做渠道间腾挪用渠道预算再分配触发器；要输出多档预算情景方案用贝叶斯 MMM 情景技能。"
workflow: "汇总各渠道预算、30天CAC与LTV分位数 → 校验新客样本量是否达门槛 → 比值低于熔断阈值判熔断、高于开闸阈值判扩增 → 按扩增比例调整预算并受连续扩增上限约束 → 输出渠道决策与新预算表"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LTV-Acquisition-Budget-Gate — LTV/CAC比值驱动的获客预算自动开闸/熔断决策器

## ① 解决的问题

增长负责人面临"TikTok获客LTV/CAC比值跌至2.1但无自动熔断机制每月白烧$6800"——LTV/CAC双向阈值门控将低效渠道预算自动归零，年化节省无效获客费用15-30万元

## ② 核心算法逻辑

论文：Deep Bayesian LTV Prediction for Ecommerce | 年份：2019

## ③ 业务应用场景

场景：跨境母婴品牌多渠道获客预算月度自动调控 - 触发条件：本月ZILN模型LTV更新完成，覆盖Facebook/Google/TikTok三渠道近1000个新客 - Facebook：LTV_P25=$210, CAC=$52，比值4.04（健康，维持） - Google：LTV_P25=$180, CAC=$28，LTV_P75=$320，比值6.4（P75>5，开闸+20%） - TikTok：LTV_P25=$95, CAC=$45，比值2.1（<3，熔断） - 执行动作：Google预算从$18,000→$21,600；TikTok新客投放暂停（已有客户再营销不受影响）；Facebo
三轨验证 | 成本轨：LTV预测模型开发月均3,500元（算力500元+人工160小时/月@15元/小时），流失预警系统月均2,000元（数据处理+API调用），干预运营月均8,000元（客服人工成本），总月均13,500元；ROI预期为35万LTV增量÷(13,500×12)=2.16倍 | 合规轨：符合《个人信息保护法》第二十四条（个性化推荐需告知），符合《反不正当竞争法》第八条（不构成虚假宣传），需获用户明示同意进行行为分析，建议在APP隐私政策中补充
**三轨验证** | 成本轨：轻量化方案月均6,800元（预测模型外包2,000元+规则引擎维护1,500元+人工干预4,300元），相比方案1降低50%成本；但LTV增量预期降至20万，ROI为1.23倍 | 合规轨：规则引擎干预（如优惠券推送）属营销行为，需符合《电子商务法》第十九条（不得强制交易），干预频次需≤3次/周避免骚扰，合规风险低于方案1 | 风险轨：预测精度下降至60%（概率70%），干预有效率仅40%；竞品对标压力（概率40%），用户可能流向其他平台；14天干预周期可能过长，实际流失率已达30%（概率35%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI量化：典型场景下每月识别并停止1-2个低效渠道，释放$5,000-15,000预算；同时扩增高ROI渠道带来增量GMV，综合月度获客效率提升10-25%
实施难度：⭐⭐☆☆☆（依赖LTV模型上游，但决策逻辑本身规则清晰，实施门槛低）
优先级：⭐⭐⭐⭐⭐（获客预算是跨境卖家最大可控成本项，LTV/CAC比值优化直接影响盈利能力）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（207 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
from typing import Dict, List, Optional

# 阈值配置
GATE_THRESHOLDS = {
    "freeze": 3.0,   # LTV/CAC < 3.0 → 熔断暂停
    "healthy_low": 3.0,
    "healthy_high": 5.0,
    "expand": 5.0,   # LTV/CAC > 5.0 → 开闸扩增
}
EXPAND_RATE = 0.20        # 单次扩增比例
MIN_SAMPLE_SIZE = 100     # 最小有效样本量
MAX_EXPAND_CONSECUTIVE = 3  # 连续扩增上限（季度内）


def ltv_acquisition_budget_gate(
    channels: List[Dict],
    freeze_threshold: float = GATE_THRESHOLDS["freeze"],
    expand_threshold: float = GATE_THRESHOLDS["expand"],
    expand_rate: float = EXPAND_RATE,
    min_sample: int = MIN_SAMPLE_SIZE
) -> Dict:
    """
    LTV/CAC比值驱动的获客预算开闸/熔断决策器
    
    参数:
        channels: [{
            "channel_id": str,
            "current_budget": float,    # 当前月预算（美元）
            "cac_30d": float,           # 近30天平均CAC
            "ltv_p25": float,           # LTV P25估计（保守，用于熔断）
            "ltv_p50": float,           # LTV P50估计（基准）
            "ltv_p75": float,           # LTV P75估计（乐观，用于开闸）
            "new_customer_count": int,  # 近30天新客数（样本量）
            "consecutive_expand_count": int,  # 本季度已连续扩增次数
        }]
        freeze_threshold: 熔断比值阈值
        expand_threshold: 扩增比值阈值（基于P75）
        expand_rate: 单次扩增比例
        min_sample: 最小有效样本量
    
    返回:
        {"decisions": [...], "budget_changes": {...}, "summary": {...}}
    """
    decisions = []
    budget_changes = {}
    
    for ch in channels:
        cid = ch["channel_id"]
        budget = ch["current_budget"]
        cac = ch["cac_30d"]
        ltv_p25 = ch["ltv_p25"]
        ltv_p50 = ch["ltv_p50"]
        ltv_p75 = ch["ltv_p75"]
        n_samples = ch["new_customer_count"]
        consec_expand = ch.get("consecutive_expand_count", 0)
        
        # 样本量门控
        if n_samples < min_sample:
            decisions.append({
                "channel_id": cid,
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1906.09686，但该号在 arXiv 上是《Quality of Uncertainty Quantification for Bayesian Neural Network Inference》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Deep Bayesian LTV Prediction for Ecommerce》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各渠道当前月预算、近 30 天平均 CAC、LTV 的 P25/P50/P75 估计、近 30 天新客数（样本量）与本季度已连续扩增次数，以及熔断阈值（默认 3.0）、开闸阈值（默认 5.0）、单次扩增比例（默认 20%）与最小样本量（默认 100）。

**输出**：各渠道的决策（熔断、维持或扩增）、对应预算变动表与决策摘要，供增长负责人确认后调整渠道预算。

## 执行步骤

1. 汇总各渠道当前预算、近 30 天 CAC 与 LTV 分位数估计
2. 校验新客数是否达到最小样本量，不足则不做评估
3. 用 P25 比值判断是否低于熔断阈值并给出熔断决策
4. 用 P75 比值判断是否高于开闸阈值并按比例扩增
5. 施加连续扩增次数上限，避免单渠道过度集中
6. 输出各渠道决策与调整后的预算表

## 边界与不做

- 何时不用：没有渠道级 LTV 预测输出、或新客样本数低于门槛时不应触发决策；纯饱和度或日内节奏问题走对应技能。
- 能力边界：只产出熔断与开闸决策及预算变动建议，不执行平台侧停投或改预算动作；LTV 精度受上游预测模型限制。
- 本技能承载的是规则与契约产物（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。
- 安全护栏：熔断仅暂停新客获取预算，已有客户再营销与品牌最低预算不受影响。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Bayesian-MMM-Scenario-Action-Plan.html、Skill-Bayesian-MMM-Scenario-Action-Plan、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-MTL-Churn-LTV-Joint-Prediction.html、Skill-MTL-Churn-LTV-Joint-Prediction、Skill-Referral-Viral-Loop-Trigger.html、Skill-Referral-Viral-Loop-Trigger
- **延伸**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Bayesian-MMM-Scenario-Action-Plan.html、Skill-Bayesian-MMM-Scenario-Action-Plan、Skill-MTL-Churn-LTV-Joint-Prediction.html、Skill-MTL-Churn-LTV-Joint-Prediction、Skill-Referral-Viral-Loop-Trigger.html、Skill-Referral-Viral-Loop-Trigger
- **可组合**：Skill-Bayesian-MMM-Scenario-Action-Plan.html、Skill-Bayesian-MMM-Scenario-Action-Plan、Skill-MTL-Churn-LTV-Joint-Prediction.html、Skill-MTL-Churn-LTV-Joint-Prediction、Skill-Referral-Viral-Loop-Trigger.html、Skill-Referral-Viral-Loop-Trigger、Skill-LTV-Acquisition-Budget-Gate

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：06-增长模型　·　源卡：`Skill-LTV-Acquisition-Budget-Gate`