---
name: "p2s-auction-theory-advertising-bidding"
title: "拍卖理论广告竞价优化 — GSP 拍卖机制下的最优出价策略"
description: "触发词：拍卖竞价、最优出价、真实点击价值、ACOS 优化、位置边际价值。何时不用：需要跨活动整体预算重分配时用自动竞价与预算优化技能；本技能算的是单个关键词的出价上限。安全边界：竞价数据须按要求留存备查；母婴等类目须备齐资质证明，关键词不得使用虚假宣传词汇。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 投放诊断"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
p2s_card_id: "Skill-Auction-Theory-Advertising-Bidding"
p2s_src_domain: "13-广告分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用拍卖理论算出每个关键词最多该出多少钱，别再凭感觉把出价定得系统性地偏高。"
user_try: "试试：用这个关键词的转化率、客单价和利润率算出真实点击价值与最优出价上限，指出哪些词出价超标。"
whenToUse: "有单关键词的转化与利润数据、要调出价上限时用本技能；跨活动预算分配用自动竞价与预算优化技能。"
workflow: "接入关键词转化率、客单价、利润率、历史 CPC 与点击量 → 计算每次点击的真实价值与最优出价上限 → 对比现行出价识别超标词与可加价词 → 按广告位边际价值决定是否抢核心位置"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 拍卖理论广告竞价优化 — GSP 拍卖机制下的最优出价策略

## ① 解决的问题

广告投手面临"Amazon广告竞价全靠经验和感觉导致出价系统性偏高"——GSP拍卖理论最优出价公式将广告费节省18-25%，年化$9.6万

## ② 核心算法逻辑

这个算法来自经济学的拍卖理论（Auction Theory），特别是 Edelman、Ostrovsky 和 Schwarz 于 2007 年 AER 上发表的 GSP 拍卖均衡分析，核心思想是「广告位拍卖使用广义第二价格（Generalized Second Price, GSP）机制——你出 $1 但只需支付下一名出价者的价格，理性最优出价等于你对该广告位的真实价值（转化率 × 客单价 × 利润率）」。迁移到电商广告竞价后，它解决的

## ③ 业务应用场景

场景A：吸奶器 SP 广告 — 计算真实出价上限，消除过度出价 - 业务问题：某关键词 CPC $1.8，ROAS 只有 2.4，但直觉告诉你这个关键词很重要不敢降价 - 数据要求：关键词转化率（CVR）、客单价、利润率、历史 CPC、展示量和点击量数据（Amazon 广告后台导出） - 预期产出：计算每个关键词的最优出价上限（b*），识别哪些词出价超标，哪些词可以加价抢位 - 业务价值：将关键词出价调整至 GSP 均衡区间，ROAS 从 2.4 提升至 3.8，月广告费节省约 ¥2.1 万
场景B：婴儿车 SB 广告 — 位置边际价值分析，决策是否值得抢 Top of Search - 业务问题：Top of Search 位置 CPC $3.2，普通位置 CPC $1.4，该不该出价抢 Top？ - 数据要求：不同广告位的 CTR 差异数据（可从 Placement 报告获取），各位置的 CVR 差异 - 预期产出：计算 Top vs 普通位置的边际价值差，得出"最多愿意为 Top 额外支付 $X"的决策依据 - 业务价值：基于拍卖均衡理论的出价，消除情绪化出价，广告 ACoS 从 28% 降至 19%，季节性广告预算节省约 ¥5 万
**三轨验证** | 成本轨：竞价策略优化月均投入3200元（AI工具订阅800元+人工分析12小时/月×200元/小时=2400元），通过动态竞价模型可实现ROAS从2.8→3.5，ROI提升25%，6个月内回本周期 | 合规轨：符合《反不正当竞争法》第8条，竞价数据需留存90天备查；遵守平台广告政策，母婴产品需提供资质证明（营业执照+产品检测报告），竞价关键词需避免虚假宣传词汇 | 风险轨：竞价恶意点击风险概率12%（可通过IP黑名单+点击质量评分规则降至3%）；平台算法更新导致模型失效风险8%；关键词合规审核延迟风险15%（需提前7天提交审核）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：以月广告费 ¥8 万的母婴卖家为例，GSP 均衡出价将过度出价的关键词调整后，月节省 15-25%，即 ¥1.2-2 万/月；同时将出价不足的高 CVR 关键词加价后，月额外销售额增加约 ¥3-5 万（对应利润 ¥0.8-1.5 万）；综合每月净收益 ¥2-3.5 万
实施难度：⭐⭐☆☆☆（数据来自 Amazon 广告后台，直接导出 Excel 即可，无需额外数据采集）
优先级：⭐⭐⭐⭐⭐（广告费是母婴出海的最大可控成本，几乎所有卖家都有广告优化空间）
评估依据：Edelman et al. (2007) AER 经典论文证明 GSP 均衡出价定理；Amazon SP 广告明确采用 GSP 机制（支付第二价格）；实战数据显示平均 30-40% 的关键词存在过度出价

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（178 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/advertising/auction_theory_advertising_bidding` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-Auction-Theory-Advertising-Bidding.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
拍卖理论广告竞价优化 — GSP 均衡出价计算器
来源：广义第二价格拍卖理论（GSP Auction Theory）迁移，用于 Amazon/Google 广告最优出价
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple


def calculate_true_value_per_click(
        selling_price: float,
        unit_cost: float,
        fba_fee: float,
        referral_fee_pct: float,
        conversion_rate: float,
        target_acos: float = None) -> Dict[str, float]:
    """
    计算每次点击的真实价值（GSP 均衡出价的基础）
    V = (selling_price - unit_cost - fba_fee - referral_fee) × conversion_rate
    """
    referral_fee = selling_price * referral_fee_pct
    gross_profit_per_sale = selling_price - unit_cost - fba_fee - referral_fee
    value_per_click = gross_profit_per_sale * conversion_rate

    # 如果设定了目标 ACoS，出价上限 = 客单价 × CVR × 目标ACoS
    bid_ceiling_by_acos = selling_price * conversion_rate * target_acos if target_acos else None

    return {
        "gross_profit_per_sale": round(gross_profit_per_sale, 2),
        "true_value_per_click": round(value_per_click, 2),
        "bid_ceiling_by_acos": round(bid_ceiling_by_acos, 2) if bid_ceiling_by_acos else None,
        "max_bid": round(min(value_per_click, bid_ceiling_by_acos or value_per_click), 2),
        "gross_margin_pct": round(gross_profit_per_sale / selling_price * 100, 1)
    }


def calculate_position_marginal_value(
        position_ctr_map: Dict[int, float],
        conversion_rate: float,
        gross_profit_per_sale: float) -> List[Dict]:
    """
    计算各广告位的边际价值（从第 k 位到第 k-1 位额外能带来的利润）
    GSP 理论：你只应该为边际价值内的差价付费
    """
    positions = sorted(position_ctr_map.keys())
    results = []

    for i in range(1, len(positions)):
        pos_better = positions[i - 1]
        pos_worse = positions[i]
        ctr_diff = position_ctr_map[pos_better] - position_ctr_map[pos_worse]
        
        # 每1000次展示，从 pos_worse 升级到 pos_better 的额外收益
        extra_clicks_per_1k = ctr_diff * 1000 / 100  # CTR 是百分比
        extra_profit_per_1k = extra_clicks_per_1k * conversion_rate * gross_profit_per_sale

        max_extra_cpc = 0.0
        if extra_clicks_per_1k > 0.001:
            max_extra_cpc = extra_profit_per_1k / extra_clicks_per_1k
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:0704.1859，但该号在 arXiv 上是《Weak type radial convolution operators on free group》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：关键词级数据：转化率、客单价、利润率、历史 CPC、展现量与点击量；可直接从广告后台导出，无需额外数据采集。

**输出**：每个关键词的真实点击价值与最优出价上限、出价超标与可加价词清单、广告位边际价值判断依据；供广告投手调整出价。

## 执行步骤

1. 接入关键词转化、成本与竞价数据
2. 计算每次点击真实价值（毛利乘以转化率）
3. 求解拍卖均衡下的最优出价上限
4. 识别出价超标与出价不足的关键词
5. 按位置边际价值给出抢位建议

## 边界与不做

- 缺少转化率与利润数据时无法计算真实点击价值，不用本技能给出价结论。
- 本技能输出出价上限与调整建议，不直接修改广告后台出价。
- 安全边界：竞价数据须按要求留存备查；母婴等类目须备齐资质证明，关键词不得含虚假宣传词汇。

## 技能关联

- **前置**：Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Contextual-Dynamic-Pricing-Optimal.html、Skill-Contextual-Dynamic-Pricing-Optimal、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation
- **延伸**：Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Contextual-Dynamic-Pricing-Optimal.html、Skill-Contextual-Dynamic-Pricing-Optimal
- **可组合**：Skill-Contextual-Dynamic-Pricing-Optimal.html、Skill-Contextual-Dynamic-Pricing-Optimal、Skill-Auction-Theory-Advertising-Bidding

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：13-广告分析　·　源卡：`Skill-Auction-Theory-Advertising-Bidding`