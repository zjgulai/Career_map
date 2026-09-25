---
name: "p2s-channel-budget-reallocation-trigger"
title: "Channel Budget Reallocation Trigger — 饱和度超阈值时自动削减并重分配渠道预算"
description: "触发词：渠道饱和度、预算再分配、连续超载判定、回滚快照、投放诊断。何时不用：渠道饱和度历史不足或各渠道口径不可比时不触发；只做日内时段节奏控制时用跨渠道预算节奏控制器。安全边界：单渠道单次调整不超过30%，调整必须留存回滚快照，不涉及用户级数据处理。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 投放诊断"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
p2s_card_id: "Skill-Channel-Budget-Reallocation-Trigger"
p2s_src_domain: "15-营销投放分析"
quality_tier: "preview"
user_summary: "渠道饱和度连续超标时自动削减该渠道预算并转投低饱和渠道，带变动上限与回滚快照。"
user_try: "试试：Facebook饱和度连续两周85%以上、Google Shopping只有38%，帮我削减并重分配本周预算。"
whenToUse: "当已有各渠道饱和度时序、要在超载与低载渠道之间做阈值触发的预算腾挪时用本卡；问题在一天内的时段节奏（早耗尽、末期停投）用跨渠道预算节奏控制器；按 LTV/CAC 决定渠道去留用获客预算门控。"
workflow: "汇总各渠道预算与饱和度历史序列 → 连续 N 期超上限判超载、低于下限判低载 → 按削减比例释放预算并受单次变动上限约束 → 按权重转移给低载渠道并生成新预算表 → 留回滚快照，7 天 ROI 跌幅超 10% 则回滚"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Channel Budget Reallocation Trigger — 饱和度超阈值时自动削减并重分配渠道预算

## ① 解决的问题

投放运营面临"渠道饱和CPM上涨30%但预算未调"——饱和度门控将无效渠道预算削减20%重分配至低饱和渠道，年化节省无效投放$50,000

## ② 核心算法逻辑

论文：Budget Allocation via Online Convex Optimization with Threshold Triggers | 年份：2021

## ③ 业务应用场景

场景：吸奶器品类跨平台广告预算自动优化 - 触发条件：Facebook广告饱和度连续2周达到85%（CPM上涨30%，CTR下降至1.2%），Google Shopping饱和度38%（流量池仍充裕） - 执行动作：Facebook预算削减20%（-$2,000/周），将$2,000按权重转移到Google Shopping（$1,400）和Pinterest（$600） - 安全护栏：单渠道预算变动不超过30%；调整后7天ROI监控，跌幅>10%自动回滚 - 业务价值：整体ROAS从2.8提升至3.4，年化节省无效投放约$48,000
三轨验证 | 成本轨：MMM模型月均API调用成本约1200元（数据处理+模型推理），人工预算审核6小时/周，年度成本约18万元 | 合规轨：符合Amazon广告政策、TikTok商业数据使用协议，用户数据脱敏处理，不涉及跨境数据传输违规 | 风险轨：预算分配滞后性风险（模型延迟1-2周），建议引入实时竞价数据；季节性波动导致模型准确度下降8-12%，需每月重训练；渠道间数据孤岛风险，需建立统一数据仓库
**三轨验证** | 成本轨：集成第三方MMM工具（如Measured/Adstock）月费3000-5000元，内部数据工程师维护成本约30万/年，总年度成本约66万元 | 合规轨：需签署数据处理协议(DPA)，确保广告数据不用于模型训练以外用途；符合CCPA/GDPR要求（若涉及欧洲消费者）；TikTok/Amazon平台API调用需获得明确授权 | 风险轨：多渠道归因模型存在10-15%的不确定性，ROI提升可能被高估；预算过度集中于高ROI渠道导致市场份额丧失风险；竞对投放变化未纳入模型，建议建立竞争情报预警机制；婴儿产品季节性强（春夏旺季），模型需按季度调参

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：整体ROAS提升15-20%，年化节省无效投放$40,000-$80,000
实施难度：⭐⭐☆☆☆（规则明确，接入渠道API即可）
优先级：⭐⭐⭐⭐⭐

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（128 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from typing import Dict, List, Tuple

def channel_budget_reallocation_trigger(
    channel_data: List[Dict],
    total_budget: float,
    saturation_high_threshold: float = 0.8,
    saturation_low_threshold: float = 0.5,
    reduction_ratio: float = 0.2,
    max_change_ratio: float = 0.3,
    consecutive_periods: int = 2
) -> Dict:
    """
    渠道预算再分配决策触发器
    
    参数:
        channel_data: [{"name": str, "budget": float, "saturation_history": [float, ...]}]
        total_budget: 总预算（用于验证恒等式）
        saturation_high_threshold: 超载阈值（默认0.8）
        saturation_low_threshold: 低载阈值（默认0.5）
        reduction_ratio: 超载渠道削减比例（默认0.2）
        max_change_ratio: 单次最大调整比例（默认0.3）
        consecutive_periods: 连续触发周期数（防误触发）
    
    返回:
        {"actions": [...], "new_budgets": {...}, "rollback_snapshot": {...}}
    """
    # 1. 阈值门控：识别超载和低载渠道
    overloaded = []
    underloaded = []
    
    for ch in channel_data:
        history = ch["saturation_history"]
        # 连续N期判断（防误触发）
        is_overloaded = all(s > saturation_high_threshold for s in history[-consecutive_periods:])
        current_sat = history[-1]
        
        if is_overloaded:
            overloaded.append(ch)
        elif current_sat < saturation_low_threshold:
            underloaded.append({"name": ch["name"], "budget": ch["budget"], 
                                 "saturation": current_sat, "gap": saturation_low_threshold - current_sat})
    
    if not overloaded or not underloaded:
        return {
            "trigger": False,
            "reason": f"无超载渠道={len(overloaded)}, 无低载渠道={len(underloaded)}，不触发调整",
            "actions": [],
            "new_budgets": {ch["name"]: ch["budget"] for ch in channel_data}
        }
    
    # 2. 计算削减金额（含最大变动约束）
    reduction_pool = 0.0
    new_budgets = {ch["name"]: ch["budget"] for ch in channel_data}
    actions = []
    rollback_snapshot = {ch["name"]: ch["budget"] for ch in channel_data}
    
    for ch in overloaded:
        raw_reduction = ch["budget"] * reduction_ratio
        # 约束：不超过max_change_ratio
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.06809，但该号在 arXiv 上是《Chimera states for directed networks》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Budget Allocation via Online Convex Optimization with Threshold Triggers》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各渠道当前预算与饱和度历史序列（[{渠道, 预算, 饱和度历史}]）、总预算（用于校验恒等式），以及超载阈值（默认 0.8）、低载阈值（默认 0.5）、削减比例（默认 0.2）、单次最大变动比例（默认 0.3）与连续触发周期数（默认 2）。

**输出**：调整动作清单（削减渠道与接收渠道、金额）、调整后的新预算表与回滚快照，供投放运营确认后在各平台落地。

## 执行步骤

1. 汇总各渠道当前预算与饱和度历史序列
2. 按连续 N 期超上限识别超载渠道、低于下限识别低载渠道
3. 无超载或无低载渠道时判定不触发并返回原因
4. 按削减比例计算可释放预算，并受单次最大变动比例约束
5. 按权重把释放预算分给低载渠道，生成调整动作与新预算表
6. 留存回滚快照，调整后 7 天监控 ROI，跌幅超 10% 触发回滚

## 边界与不做

- 何时不用：缺少连续多期饱和度历史、或各渠道饱和度口径不可比时不适用；预算主因在日内节奏或 LTV/CAC 结构时改用对应技能。
- 能力边界：只产出调整动作、新预算与回滚快照，不直接调用平台 API 改预算，也不重新建模渠道饱和度。
- 触发纪律：未达连续周期数的抖动不应触发，单次变动不得超过给定的最大变动比例。

## 技能关联

- **前置**：Skill-Channel-Saturation-Curve.html、Skill-Channel-Saturation-Curve、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-DARA-Agentic-MMM-Optimizer.html、Skill-DARA-Agentic-MMM-Optimizer、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-MMM-Budget-Reallocation-Executor.html、Skill-MMM-Budget-Reallocation-Executor
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-DARA-Agentic-MMM-Optimizer.html、Skill-DARA-Agentic-MMM-Optimizer、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-MMM-Budget-Reallocation-Executor.html、Skill-MMM-Budget-Reallocation-Executor
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-DARA-Agentic-MMM-Optimizer.html、Skill-DARA-Agentic-MMM-Optimizer、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Channel-Budget-Reallocation-Trigger

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：15-营销投放分析　·　源卡：`Skill-Channel-Budget-Reallocation-Trigger`