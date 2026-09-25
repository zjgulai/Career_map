---
name: "p2s-competitive-price-monitoring"
title: "Competitive Price Monitoring（竞品价格监测与响应）"
description: "触发词：竞品价格、PCI 指数、交叉弹性、跟价预警、价格热力图。何时不用：需要自动检测突变并执行预设响应用「竞品价格情报」；本技能侧重监测、预警与响应建议。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性 / 商品诊断"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-Competitive-Price-Monitoring"
p2s_src_domain: "17-价格优化"
quality_tier: "preview"
user_summary: "每天盯着竞品价格变动，超阈值就预警，同时告诉你跟不跟的得失。"
user_try: "试试：监控这 5 个竞品的价格，PCI 超阈值时给出跟价与否的损失对比。"
whenToUse: "当需要日常监测多竞品多变体价格、输出预警与响应建议时用；需自动检测突变并执行预设规则用「竞品价格情报」。"
workflow: "每日采集竞品各变体价格 → 计算价格竞争力指数与滚动交叉弹性 → 按阈值规则触发分级预警 → 测算跟价与不跟价的销量和利润率变化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Competitive Price Monitoring（竞品价格监测与响应）

## ① 解决的问题

价格经理面临竞品调价反应慢——竞价监控将跟价时延从24小时缩到30分，年化省15万元

## ② 核心算法逻辑

论文：Causal Inference Using Invariant Predictions | arXiv：1502.04637

## ③ 业务应用场景

业务问题：5 个竞品（Momcozy/Medela/Spectra/Bellababy/Elvie）在 Amazon US 频繁调价。需要每日监测+自动预警+响应建议。
数据要求：每日竞品价格爬虫 + 我们的日销量数据（用于估计交叉弹性）
预期产出： - 竞品价格仪表盘：5 竞品 × 3 变体（单边/双边/穿戴式）价格热力图 - 预警规则：PCI > 1.10 且竞品降价 > 10% 时触发橙色预警 - 响应建议：预计不跟降损失 15-20% 日销量 vs 跟降 10% 保护份额但利润率降 3pp

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：优化竞品响应决策，每月节约 $2,000-5,000；年化 25-60 万元
实施难度：⭐⭐☆☆☆（2 星）— 爬虫 + PCI 计算简单
优先级评分：⭐⭐⭐⭐☆（4 星）— 跨境价格战是日常挑战

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（82 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/pricing/competitive_price_monitoring` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/17-价格优化/Skill-Competitive-Price-Monitoring.md`），已与卡面节选核对，不依赖上述路径。

```python
"""Competitive Price Monitoring — PCI 计算 + 响应决策"""

import numpy as np
from typing import List, Dict, Tuple


def price_competitiveness_index(
    our_price: float, competitor_prices: List[float]
) -> float:
    """价格竞争力指数"""
    if not competitor_prices:
        return 1.0
    return our_price / np.median(competitor_prices)


def estimate_cross_elasticity(
    our_sales: List[float], competitor_prices: List[float],
    window: int = 7
) -> float:
    """用滚动窗口估计交叉价格弹性"""
    if len(our_sales) < window * 2:
        return -0.8  # 默认值
    
    elasticities = []
    for t in range(window, len(our_sales) - window):
        comp_change = (competitor_prices[t] - competitor_prices[t-window]) / competitor_prices[t-window]
        sales_change = (our_sales[t+window] - our_sales[t]) / max(our_sales[t], 0.01)
        if abs(comp_change) > 0.01:
            elasticities.append(sales_change / comp_change)
    
    return np.median(elasticities) if elasticities else -0.8


def price_response_decision(
    our_price: float, our_cost: float, our_sales: float,
    competitor_prices: List[float], cross_elasticity: float = -0.8,
) -> Dict:
    """竞品响应决策"""
    pci = price_competitiveness_index(our_price, competitor_prices)
    min_comp = min(competitor_prices)
    
    # 场景分析
    if pci < 1.03:
        return {'action': 'maintain', 'pci': pci, 'reason': '价格有竞争力'}
    
    # 跟降 10% 的效果
    target_price = min_comp * 1.02
    price_drop_pct = (our_price - target_price) / our_price
    expected_sales_gain = cross_elasticity * (-price_drop_pct) * our_sales
    profit_change = (target_price - our_cost) * (our_sales + expected_sales_gain) - \
                    (our_price - our_cost) * our_sales
    
    if profit_change > 0 and price_drop_pct > 0.03:
        return {
            'action': 'match', 'target_price': round(target_price, 2),
            'pci': pci, 'expected_sales_gain': round(expected_sales_gain),
            'profit_change': round(profit_change), 'drop_pct': f'{price_drop_pct:.1%}'
        }
    elif pci > 1.10:
        return {'action': 'partial_match', 'pci': pci,
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1502.04637，但该号在 arXiv 上是《Orientation of the linear polarization plane of H-alpha emission in prominences》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Causal Inference Using Invariant Predictions》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：每日竞品价格爬取数据（多竞品乘多变体）、自有日销量数据用于估计交叉弹性、成本与利润率。

**输出**：竞品价格仪表盘与热力图、价格竞争力指数预警（如指数高于 1.10 且竞品降价超 10%）、跟价与不跟价的损益对比建议，供价格经理决策。

## 执行步骤

1. 每日采集竞品各变体价格
2. 计算价格竞争力指数与滚动交叉弹性
3. 按阈值规则触发分级预警
4. 测算不跟降的销量损失与跟降的利润率变化
5. 输出响应建议并跟踪执行结果

## 边界与不做

- 何时不用：拿不到稳定的竞品价格数据时，指数与预警会失真
- 能力边界：只做监测、预警与建议，不自动改价，也不得使用违反平台条款的采集手段

## 技能关联

- **前置**：Skill-AIGP-LLM-Dynamic-Pricing.html、Skill-AIGP-LLM-Dynamic-Pricing、Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-CABB-Cross-Category-Attribution.html、Skill-CABB-Cross-Category-Attribution、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Competitor-Product-Intelligence.html、Skill-Competitor-Product-Intelligence、Skill-Contextual-Dynamic-Pricing-Optimal.html、Skill-Contextual-Dynamic-Pricing-Optimal、Skill-Cross-Border-Price-Harmonization.html、Skill-Cross-Border-Price-Harmonization、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Markdown-Optimization.html、Skill-Markdown-Optimization
- **延伸**：Skill-AIGP-LLM-Dynamic-Pricing.html、Skill-AIGP-LLM-Dynamic-Pricing、Skill-CABB-Cross-Category-Attribution.html、Skill-CABB-Cross-Category-Attribution、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Competitor-Product-Intelligence.html、Skill-Competitor-Product-Intelligence、Skill-Contextual-Dynamic-Pricing-Optimal.html、Skill-Contextual-Dynamic-Pricing-Optimal、Skill-Cross-Border-Price-Harmonization.html、Skill-Cross-Border-Price-Harmonization、Skill-Markdown-Optimization.html、Skill-Markdown-Optimization
- **可组合**：Skill-AIGP-LLM-Dynamic-Pricing.html、Skill-AIGP-LLM-Dynamic-Pricing、Skill-CABB-Cross-Category-Attribution.html、Skill-CABB-Cross-Category-Attribution、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Competitor-Product-Intelligence.html、Skill-Competitor-Product-Intelligence、Skill-Contextual-Dynamic-Pricing-Optimal.html、Skill-Contextual-Dynamic-Pricing-Optimal、Skill-Competitive-Price-Monitoring

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：17-价格优化　·　源卡：`Skill-Competitive-Price-Monitoring`