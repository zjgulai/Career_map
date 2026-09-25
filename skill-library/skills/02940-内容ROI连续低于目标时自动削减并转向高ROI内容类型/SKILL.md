---
name: "p2s-content-roi-budget-shift-trigger"
title: "Content ROI Budget Shift Trigger — 内容ROI连续低于目标时自动削减并转向高ROI内容类型"
description: "触发词：内容ROI、滑动窗口检测、内容类型转向、日预算削减、素材效率。何时不用：没有按内容类型拆分的分日ROI数据时不适用；渠道级饱和度或跨渠道节奏问题走对应技能。安全边界：须保留内容类型最低日预算保护线，单次转移不超过总预算10%，调整须符合平台广告披露要求。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 内容策划"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
p2s_card_id: "Skill-Content-ROI-Budget-Shift-Trigger"
p2s_src_domain: "13-广告分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "某类内容连续几天 ROI 不达标就自动削减它的日预算，转投近期 ROI 最高的内容类型。"
user_try: "试试：纯广告贴片连续三天 ROI 只有0.8左右，帮我削减20%并转给育儿教程这类高 ROI 内容。"
whenToUse: "当预算颗粒度已细到内容类型、且能用连续多日 ROI 判断低效时用本卡；渠道级超载重分配用渠道预算再分配触发器；需要日内时段节奏控制用预算节奏控制器。"
workflow: "汇总各内容类型日预算与 ROI 历史 → 按目标乘系数算阈值并判连续 N 天低于阈值 → 对触发类型按削减比例下调日预算 → 把释放预算转给回看期 ROI 最高类型 → 保留最低日预算与单次转移上限"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Content ROI Budget Shift Trigger — 内容ROI连续低于目标时自动削减并转向高ROI内容类型

## ① 解决的问题

内容团队面临"低ROI内容类型持续消耗预算无自动纠偏"——3天滑动窗口检测将内容投放效率提升25%，月节省无效投放$5,000

## ② 核心算法逻辑

核心是「滑动窗口ROI计算 + 内容类型分类 + 预算转移规则」：

## ③ 业务应用场景

场景：吸奶器TikTok Shop内容预算的动态调优 - 触发条件：「纯广告贴片」内容类型连续3天ROI 0.8/1.0/0.9（均<目标1.5×0.7=1.05），触发 - 执行动作：「纯广告贴片」预算$800/天→$640/天（-20%），$160/天转入「育儿教程」（近7天均ROI 2.8，最高） - 安全护栏：「纯广告贴片」最低保留$500/天；单次转移不超过总预算的10% - 业务价值：整体内容ROAS从1.9提升至2.4，月节省无效投放约$4,800
三轨验证 | 成本轨：月均投入3,200元（AI工具订阅800元+人工分析12小时/月@200元/小时=2,400元），ROI周期2.1个月，年度成本38,400元可撬动年增收益约45万元 | 合规轨：符合《电商平台广告投放规范》和《跨境电商广告披露要求》，需在广告素材标注
**三轨验证** | 成本轨：月均投入5,800元（专业代理团队外包2,000元+AI优化工具1,200元+数据分析师8小时/月@600元/小时=2,800元），ROI周期1.6个月，年度成本69,600元可撬动年增收益约68万元 | 合规轨：需建立《广告投放合规审查SOP》，每条素材需通过法务+平台双重审核，符合《跨境电商消费者权益保护条例》，依据：欧盟GDPR数据隐私要求+美国FTC广告真实性指南 | 风险轨：①团队管理风险（概率40%）导致执行偏差，ROAS下降至3.5；②平台封号风险（概率8%）因违规投放，损失月均15万元；③市场饱和风险（概率30%）竞争加剧导致CPC上升20-30%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：内容投放效率提升20-35%，月节省无效投放$3,000-$8,000
实施难度：⭐⭐☆☆☆（需TikTok Shop归因数据接入，逻辑清晰）
优先级：⭐⭐⭐⭐☆

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（172 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
from collections import deque
from typing import Dict, List, Optional
import numpy as np

def content_roi_budget_shift_trigger(
    content_type_data: List[Dict],
    target_roi: float,
    trigger_ratio: float = 0.7,
    consecutive_days_required: int = 3,
    reduction_ratio: float = 0.20,
    min_daily_budget: float = 500.0,
    max_consecutive_triggers: int = 3,
    lookback_days_for_best: int = 7
) -> Dict:
    """
    内容ROI预算转移触发器
    
    参数:
        content_type_data: [{
            "type_name": str,
            "daily_budget": float,
            "roi_history": [float, ...],  # 按时间顺序，最新在最后
            "trigger_count": int  # 历史触发次数
        }]
        target_roi: 目标ROI基准
        trigger_ratio: 触发阈值系数（默认0.7，即目标×0.7）
        consecutive_days_required: 连续低ROI天数（默认3天）
        reduction_ratio: 削减比例（默认20%）
        min_daily_budget: 最低日预算保护线
        max_consecutive_triggers: 最多连续触发次数（防过度集中）
    
    返回:
        预算转移决策
    """
    trigger_threshold = target_roi * trigger_ratio
    
    # 识别低ROI内容类型（触发方）
    low_roi_types = []
    for ct in content_type_data:
        history = ct["roi_history"]
        if len(history) < consecutive_days_required:
            continue
        recent_rois = history[-consecutive_days_required:]
        is_low = all(r < trigger_threshold for r in recent_rois)
        trigger_count = ct.get("trigger_count", 0)
        
        if is_low and trigger_count < max_consecutive_triggers:
            avg_recent_roi = np.mean(recent_rois)
            low_roi_types.append({
                "type_name": ct["type_name"],
                "daily_budget": ct["daily_budget"],
                "recent_roi": avg_recent_roi,
                "trigger_count": trigger_count
            })
    
    if not low_roi_types:
        return {
            "trigger": False,
            "reason": "无内容类型连续3天ROI低于阈值",
            "threshold": trigger_threshold,
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：各内容类型的日预算、按时间顺序的 ROI 历史与历史触发次数，加上目标 ROI、触发系数（默认 0.7）、连续天数（默认 3）、削减比例（默认 20%）、最低日预算保护线、最大连续触发次数与最优类型回看天数（默认 7）。

**输出**：预算转移决策（削减方、接收方、转移金额与理由），供内容投放团队在 TikTok Shop 等内容后台执行。

## 执行步骤

1. 汇总各内容类型的日预算与 ROI 历史序列
2. 按目标 ROI 乘触发系数算出低效阈值
3. 判定连续 N 天低于阈值且未超最大触发次数的内容类型
4. 对触发类型按削减比例下调日预算并保留最低保护线
5. 把释放预算转给近 7 天平均 ROI 最高的内容类型
6. 输出转移决策与理由供内容团队执行

## 边界与不做

- 何时不用：没有按内容类型拆分的分日 ROI 数据、或样本天数不足连续判定要求时不应触发。
- 能力边界：只产出预算转移决策，不生成也不投放内容素材；单次转移不超过总预算 10%，且不突破最低日预算保护线。
- 触发纪律：连续触发达到上限后应停止继续削减，避免预算过度集中到单一内容类型。

## 技能关联

- **前置**：Skill-Channel-Budget-Reallocation-Trigger.html、Skill-Channel-Budget-Reallocation-Trigger、Skill-Competitor-Ad-Surge-Defense-Trigger.html、Skill-Competitor-Ad-Surge-Defense-Trigger、Skill-Nonlinear-Multi-Touch-Attribution.html、Skill-Nonlinear-Multi-Touch-Attribution、Skill-ROAS-Below-Target-Budget-Freeze.html、Skill-ROAS-Below-Target-Budget-Freeze、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution
- **延伸**：Skill-Channel-Budget-Reallocation-Trigger.html、Skill-Channel-Budget-Reallocation-Trigger、Skill-Competitor-Ad-Surge-Defense-Trigger.html、Skill-Competitor-Ad-Surge-Defense-Trigger、Skill-Nonlinear-Multi-Touch-Attribution.html、Skill-Nonlinear-Multi-Touch-Attribution、Skill-ROAS-Below-Target-Budget-Freeze.html、Skill-ROAS-Below-Target-Budget-Freeze
- **可组合**：Skill-Channel-Budget-Reallocation-Trigger.html、Skill-Channel-Budget-Reallocation-Trigger、Skill-Competitor-Ad-Surge-Defense-Trigger.html、Skill-Competitor-Ad-Surge-Defense-Trigger、Skill-ROAS-Below-Target-Budget-Freeze.html、Skill-ROAS-Below-Target-Budget-Freeze、Skill-Content-ROI-Budget-Shift-Trigger

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：13-广告分析　·　源卡：`Skill-Content-ROI-Budget-Shift-Trigger`