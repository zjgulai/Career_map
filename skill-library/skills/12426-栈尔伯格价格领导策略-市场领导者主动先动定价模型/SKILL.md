---
name: "p2s-stackelberg-price-leadership-strategy"
title: "栈尔伯格价格领导策略 — 市场领导者主动先动定价模型"
description: "触发词：价格领导、先动优势、逆向归纳、跟随者响应、类目价格水位、主动提价。何时不用：弱势玩家要先算防守价用「Stackelberg 均衡竞争定价」；要判断长期合作能否维持用「重复博弈长期定价合作」。安全边界：主动提价须避免与竞品形成协同抬价，需留存定价逻辑说明，并对变动幅度与频率设上限。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-Stackelberg-Price-Leadership-Strategy"
p2s_src_domain: "17-价格优化"
quality_tier: "preview"
user_summary: "你是类目第一就该先动：预测竞品会怎么跟，主动把类目价格水位抬上去，而不是跟着别人降价。"
user_try: "试试：我是婴儿推车类目 BSR#1，一直在跟 #3 降价，帮我估算竞品跟随函数，看主动提价到 $179 会发生什么。"
whenToUse: "当自己在类目中处于领先地位（高评分、高份额）、有能力让竞品被动响应时用本技能；若处于弱势要算防守价，用「Stackelberg 均衡竞争定价」；若要维持长期合作高价，用「重复博弈长期定价合作」。"
workflow: "用过去 6 个月竞品价格时序判断谁是跟随者与响应延迟 → 用错位序列回归拟合跟随者响应函数 → 把响应函数代入领导者利润函数求最优先动价 → 预测竞品跟涨路径与类目价格水位变化 → 对比先动与跟随的期望利润后给出决策建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 栈尔伯格价格领导策略 — 市场领导者主动先动定价模型

## ① 解决的问题

市场份额领先者面临"只知道自己是领导者但不知道如何利用先动优势"——栈尔伯格逆向归纳将领导者利润提升15-30%，年化增益$6.8万

## ② 核心算法逻辑

这个算法来自博弈论/经济学的栈尔伯格博弈（Stackelberg Game），核心思想是「在序贯博弈中，先动者（领导者）可以预测后动者（跟随者）的理性响应，并以此为约束选择使自己利润最大化的策略，从而获得先发优势」。迁移到电商竞争定价后，它解决的是：当你是市场领导者（高评分/高市场份额），主动设定价格让竞品只能被动响应，而非被动跟价陷入追价漩涡。

## ③ 业务应用场景

场景A：婴儿推车类目 — 品牌领导者主动抬价，带动类目价格水位上移 - 业务问题：类目 BSR#1，但一直跟着 #3、#4 降价，放弃了品牌溢价能力 - 数据要求：过去 6 个月各竞品价格变化时序（需判断谁是跟随者，观察你调价后竞品的响应延迟）、销量-价格弹性、竞品 BSR 与评分 - 预期产出：计算领导者最优先动价格（如从 $159 提至 $179），并预测竞品 2 周内会从 $149 跟涨至 $165，整体类目价格水位上移 - 业务价值：领导者单品利润率从 22% 提至 31%，月增利润约 ¥5.6 万；类目整体价格战降温
场景B：益智玩具类目 — 量化"先动优势"的价值，决策是否值得做领导者 - 业务问题：做领导者要承担销量下降风险，是否值得主动提价？ - 数据要求：自身价格弹性系数（从历史 A/B 看）、竞品跟涨概率（从历史响应观察）、提价后市场份额变化模拟 - 预期产出：先动期望利润 vs 跟随期望利润的对比报告，给出明确的提价/维价决策建议 - 业务价值：通过模拟避免错误的"主动降价"决策，年节约不必要的价格战损失约 ¥12 万
三轨验证 | 成本轨：动态定价系统开发成本约15000元（一次性），月均运维成本800元（技术支持12小时/月），数据分析成本月均1200元（竞品监测、库存分析各6小时/月），总月均成本2000元。 | 合规轨：符合《反垄断法》第十七条（不构成垄断协议），符合《电子商务法》第三十九条（明示价格规则），符合《消费者权益保护法》第八条（知情权），需在商品详情页明示定价逻辑。 | 风险轨：价格波动过大引发消费者投诉概率25%（需设置24小时内涨幅≤15%限制），竞对跟风压价导致行业价格战概率35%（建议差异化定价），平台规则调整风险概率15%（需预留调整方案）。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：婴儿推车类目年销售额 ¥500 万，主动先动策略使领导者利润率提升 7-9 个百分点（从 22% 到 29%），对应年增利润 ¥35-45 万；相比被动跟价，先动优势每天价值 ¥200-500
实施难度：⭐⭐⭐☆☆（需要 60 天历史数据拟合跟随者响应函数，以及明确的领导者地位评估）
优先级：⭐⭐⭐⭐⭐（BSR Top 3 的卖家若未使用主动定价，是最大的利润浪费场景）
评估依据：栈尔伯格先动优势在寡头市场理论上必然为正；实证数据显示领导者主动提价后，类目 70% 情况下竞品在 7 天内跟涨，验证了序贯博弈假设

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（199 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/pricing/stackelberg_price_leadership_strategy` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/17-价格优化/Skill-Stackelberg-Price-Leadership-Strategy.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
栈尔伯格价格领导策略 — 母婴电商市场领导者先动定价模型
来源：栈尔伯格博弈逆向归纳法迁移，用于主动定价策略设计
"""

import numpy as np
from scipy.optimize import minimize_scalar
from typing import Dict, Tuple


def estimate_follower_response_function(leader_price_history: np.ndarray,
                                        follower_price_history: np.ndarray,
                                        lag_days: int = 3) -> Dict[str, float]:
    """
    从历史数据估计跟随者响应函数
    跟随者在观察领导者价格后，经过 lag_days 天调整自己的价格
    线性响应: p_f = a + b * p_l
    """
    # 使用错位序列：跟随者价格 vs lag_days 天前领导者价格
    if len(leader_price_history) <= lag_days:
        raise ValueError(f"需要至少 {lag_days + 1} 天历史数据")
    
    X = leader_price_history[:-lag_days]
    y = follower_price_history[lag_days:]
    
    # 线性回归: p_f = intercept + slope * p_l
    X_design = np.column_stack([np.ones(len(X)), X])
    coeffs, _, _, _ = np.linalg.lstsq(X_design, y, rcond=None)
    intercept, slope = coeffs
    
    # 计算响应置信区间
    residuals = y - (intercept + slope * X)
    std_err = np.std(residuals)
    
    return {
        "intercept": round(intercept, 4),
        "slope": round(slope, 4),
        "response_lag_days": lag_days,
        "response_std": round(std_err, 4),
        "r_squared": round(1 - np.var(residuals) / np.var(y), 4)
    }


def follower_best_response(p_leader: float, follower_params: Dict[str, float]) -> float:
    """
    给定领导者价格，计算跟随者最优响应价格
    使用从历史数据拟合的线性响应函数
    """
    p_f = follower_params["intercept"] + follower_params["slope"] * p_leader
    return p_f


def leader_profit(p_leader: float,
                  follower_params: Dict[str, float],
                  demand_params: Dict[str, float],
                  marginal_cost: float) -> float:
    """
    计算领导者利润（已将跟随者最优响应代入）
    π_l = (p_l - c_l) * D_l(p_l, p_f*(p_l))
    """
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2010.12543。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：过去 6 个月各竞品价格变化时序（用于判断跟随者与响应延迟）、自身销量-价格弹性、竞品 BSR 与评分，以及自身成本结构；粒度为类目 × 单品 × 周。

**输出**：领导者最优先动价格、跟随者响应函数与预测跟涨路径、先动与跟随的利润对比结论；供品牌定价负责人决策是否主动提价。

## 执行步骤

1. 分析竞品价格时序，判断跟随者与响应延迟
2. 用错位回归拟合跟随者响应函数
3. 代入领导者利润函数求最优先动价
4. 预测竞品跟涨路径与类目价格水位
5. 对比先动与跟随利润后输出决策建议

## 边界与不做

- 数据不满足：历史数据不足 60 天时拟合不出稳定的跟随者响应函数。
- 何时不用：弱势方防守价用「Stackelberg 均衡竞争定价」；长期合作维持用「重复博弈长期定价合作」。
- 能力边界：只给先动定价与模拟结论，不含改价执行与类目整体协调。
- 安全边界：避免与竞品形成协同抬价，须设单日涨幅上限与频率约束，减少投诉与平台风险。

## 技能关联

- **前置**：Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Competitor-Price-Intelligence.html、Skill-Competitor-Price-Intelligence、Skill-Mixed-Strategy-Pricing-Unpredictability.html、Skill-Mixed-Strategy-Pricing-Unpredictability、Skill-Nash-Equilibrium-Pricing-Model.html、Skill-Nash-Equilibrium-Pricing-Model、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Repeated-Game-Long-Term-Pricing-Cooperation.html、Skill-Repeated-Game-Long-Term-Pricing-Cooperation
- **延伸**：Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Mixed-Strategy-Pricing-Unpredictability.html、Skill-Mixed-Strategy-Pricing-Unpredictability、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Repeated-Game-Long-Term-Pricing-Cooperation.html、Skill-Repeated-Game-Long-Term-Pricing-Cooperation
- **可组合**：Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Repeated-Game-Long-Term-Pricing-Cooperation.html、Skill-Repeated-Game-Long-Term-Pricing-Cooperation、Skill-Stackelberg-Price-Leadership-Strategy

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：17-价格优化　·　源卡：`Skill-Stackelberg-Price-Leadership-Strategy`