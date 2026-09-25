---
name: "p2s-rtb-multi-objective-bidding"
title: "RTB Multi-Objective Bidding — 实时竞价多目标优化：广告出价的帕累托前沿策略"
description: "触发词：多目标出价、帕累托前沿、旺季增长、动态权重、RTB、预算约束。何时不用：单目标 ROAS 下的关键词调价用常规投放诊断；需要在大促前后切换增长与回收目标时用本卡。安全边界：出价上限与预算约束须人工确认，不得绕过平台出价规则或用敏感属性做定向。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-RTB-Multi-Objective-Bidding"
p2s_src_domain: "15-营销投放分析"
quality_tier: "preview"
user_summary: "旺季敢冲曝光、淡季守住 ROAS，让出价目标随季节自动切换而不是手动拍脑袋。"
user_try: "试试：这是我各关键词的历史出价、曝光、点击、转化和新客占比，帮我在 ROAS 与曝光之间画出帕累托前沿并给出每日出价建议。"
whenToUse: "与「实时信号追踪」相比：分钟级竞价信号跟随用卡尔曼滤波那张卡；要在大促前后切换增长/回收目标、权衡曝光与新客时用本卡。"
workflow: "按关键词/ASIN 整理历史出价、展示、点击、转化、成本数据 → 识别新客与老客，明确预算约束与分阶段 ROAS 目标 → 计算不同 ROAS 目标下的帕累托前沿与最优曝光量 → 按旺季/淡季切换权重，输出每日多目标出价建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# RTB Multi-Objective Bidding — 实时竞价多目标优化：广告出价的帕累托前沿策略

## ① 解决的问题

黑五期间单一ROAS目标限制出价导致曝光量不足错失旺季增长窗口——多目标帕累托优化在旺季自动切换到增长模式（最大化曝光/新客）淡季切换效率模式（最大化ROAS），年化GMV增益20-60万元

## ② 核心算法逻辑

单目标 vs 多目标竞价：

## ③ 业务应用场景

业务问题：黑五前 2 周（增长模式）需要最大化曝光和新客获取，哪怕 ROAS 降到 1.5 也可以接受；黑五后 2 周（回收模式）需要将 ROAS 提升到 3.0+。当前手动切换出价效率低，总是切换太慢或太激进。
数据要求： - 历史广告数据（出价/展示/点击/转化/成本）按关键词/ASIN - 新客 vs 老客 识别（Amazon Attribution 或像素） - 预算约束和 ROAS 目标
预期产出： - 帕累托前沿：不同 ROAS 目标下对应的最优曝光量 - 动态出价策略：旺季/淡季自动切换权重 - 每日出价建议：各关键词的多目标优化出价

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
旺季曝光量提升 20-35%（同预算）：旺季 GMV 增益 ¥15-40 万
淡季 ROAS 提升 15-25%：节省无效广告花费 ¥5-15 万/季度
自动化模式切换（旺季/淡季）：减少手动调价频率，节省运营时间
年化综合 ROI：¥20-60 万
实施难度：⭐⭐⭐☆☆（多目标优化概念清晰；Amazon 广告 API 提供实时数据；约 3-4 周实施）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（141 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/marketing/rtb_multi_objective_bidding` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/15-营销投放分析/Skill-RTB-Multi-Objective-Bidding.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
RTB Multi-Objective Bidding Optimization
实时竞价多目标优化：帕累托前沿出价策略
"""
import numpy as np
from dataclasses import dataclass
from typing import Callable


@dataclass
class AdKeyword:
    keyword_id: str
    base_cpc: float          # 基础 CPC（当前出价）
    expected_ctr: float      # 预期点击率
    expected_cvr: float      # 预期转化率
    avg_order_value: float   # 平均客单价
    new_customer_ratio: float  # 新客占比
    quality_score: float = 1.0  # 质量分（影响实际曝光量）


def compute_multi_objectives(keyword: AdKeyword, bid: float,
                              budget: float = 1000) -> dict:
    """
    计算给定出价下的多目标值
    """
    # 出价影响：出价越高，赢得的曝光机会越多（简化模型）
    win_rate = min(1.0, (bid / keyword.base_cpc) ** 0.6 * keyword.quality_score)
    impressions = win_rate * budget / max(bid, 0.01) * keyword.expected_ctr
    clicks = impressions * keyword.expected_ctr
    conversions = clicks * keyword.expected_cvr
    cost = clicks * bid
    revenue = conversions * keyword.avg_order_value

    roas = revenue / max(cost, 0.01)
    new_customers = conversions * keyword.new_customer_ratio
    impression_per_dollar = impressions / max(cost, 0.01)

    return {
        'bid': bid,
        'roas': round(roas, 3),
        'impressions': round(impressions, 1),
        'conversions': round(conversions, 2),
        'cost': round(cost, 2),
        'revenue': round(revenue, 2),
        'new_customers': round(new_customers, 2),
        'impression_per_dollar': round(impression_per_dollar, 2),
    }


def pareto_frontier(keyword: AdKeyword, budget: float = 1000) -> list:
    """
    计算帕累托前沿：遍历出价范围，找到非劣解集合
    """
    bid_range = np.linspace(0.1 * keyword.base_cpc, 3.0 * keyword.base_cpc, 50)
    points = [compute_multi_objectives(keyword, bid, budget) for bid in bid_range]

    # 帕累托前沿（ROAS vs Impressions 双目标）
    pareto = []
    for p in points:
        dominated = False
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2405.08756，但该号在 arXiv 上是《Stable Inverse Reinforcement Learning: Policies from Control Lyapunov Landscapes》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：关键词/ASIN 粒度的历史广告数据（出价、展示、点击、转化、成本）、新客与老客识别口径（Amazon Attribution 或像素）、预算上限与各阶段 ROAS 目标。

**输出**：不同 ROAS 目标下的帕累托前沿、旺季/淡季动态权重策略与每日关键词出价建议，供广告运营执行与复盘。

## 执行步骤

1. 整理关键词级历史出价、曝光、点击、转化与成本数据。
2. 标注新客与老客，明确预算约束与阶段 ROAS 目标。
3. 计算多目标函数并求帕累托前沿，得到不同目标下的最优曝光量。
4. 切换旺季增长与淡季回收的目标权重。
5. 输出每日出价建议并跟踪曝光与 ROAS 的实际偏差。

## 边界与不做

- 何时不用：没有新老客标识、或预算约束无法量化时不要用；只优化单一 ROAS 目标的日常调价不需要本卡。
- 能力边界：只产出策略与出价建议，不直接对接广告 API 改价；旺季曝光 +20–35% 等区间为卡页测算值。
- 安全边界：严禁规避平台出价规则或使用敏感属性定向。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Channel-Saturation-Curve.html、Skill-Channel-Saturation-Curve、Skill-DARA-Agentic-MMM-Optimizer.html、Skill-DARA-Agentic-MMM-Optimizer、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **延伸**：Skill-Channel-Saturation-Curve.html、Skill-Channel-Saturation-Curve、Skill-DARA-Agentic-MMM-Optimizer.html、Skill-DARA-Agentic-MMM-Optimizer、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction
- **可组合**：Skill-Channel-Saturation-Curve.html、Skill-Channel-Saturation-Curve、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction、Skill-RTB-Multi-Objective-Bidding

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：15-营销投放分析　·　源卡：`Skill-RTB-Multi-Objective-Bidding`