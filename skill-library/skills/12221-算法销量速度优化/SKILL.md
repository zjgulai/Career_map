---
name: "p2s-a9-algorithm-sales-velocity-optimization"
title: "Skill-A9-Algorithm-Sales-Velocity-Optimization — A9 算法销量速度优化"
description: "触发词：搜索算法排名、销量速度、新品起量、关键词排名、广告打法、转化率提升。何时不用：要靠动态调价保 Buy Box 用「实时竞品重定价」；要优化促销文案点击率用「损失厌恶促销设计」。安全边界：不得使用黑帽 SEO 与关键词堆砌，须遵守平台搜索政策与母婴产品资质要求，广告与折扣投入按预算上限执行。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-065"
l3_business: "商品诊断"
l3_all: "商品诊断 / 站点运营"
l1_l2_l3: "业务运营/渠道经营/商品诊断"
p2s_card_id: "Skill-A9-Algorithm-Sales-Velocity-Optimization"
p2s_src_domain: "25-搜索流量工程"
quality_tier: "preview"
user_summary: "新品排名起不来多半是销量速度不够：用广告加限时折扣把速度推上去，再把流量交给自然排名。"
user_try: "试试：我的双边电动吸奶器目标词排名 #180，帮我排一版 30 天的销量速度打法与关键词优化节奏。"
whenToUse: "当新品或滞销款需要提升搜索排名、且可用广告与限时折扣撬动销量速度时用本技能；若要靠动态调价守 Buy Box，用「实时竞品重定价」；要优化促销文案点击率，用「损失厌恶促销设计」。"
workflow: "拉取近 7 天订单与 5-10 个目标关键词的排名快照，确定广告预算 → 第 1-7 天用自动广告加限时折扣推销量速度 → 第 8-14 天分析搜索词报告，把高转化词转为精确匹配 → 第 15-30 天排名进入前 50 后关闭折扣，维持速度稳态 → 用指数加权销量速度与排名得分持续复核节奏"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-A9-Algorithm-Sales-Velocity-Optimization — A9 算法销量速度优化

## ① 解决的问题

运营面临"新品上线后A9权重积累慢排名起不来"——销量速度优化将新品进入Top20时间从30天缩短至12天，年化多增GMV80万元

## ② 核心算法逻辑

A9 算法（Amazon Search Algorithm）的排名信号可分为两大类：相关性信号（关键词匹配度、品类节点精确度）和表现信号（销量速度、转化率、评分）。销量速度（Sales Velocity）是核心表现信号，定义为单位时间内的订单量，在 A9 中以指数衰减窗口（EWMA）方式累积：

## ③ 业务应用场景

- 业务问题：一款新款双边电动吸奶器上架，目标关键词「electric breast pump」当前排名 #180，月自然流量几乎为零 - 数据要求：历史7天订单数据、目标关键词列表（5-10个）、竞品排名快照、广告预算 - 执行方案： - Day 1-7：开启 Auto PPC（日预算 $50），同时申请 Lightning Deal 折扣 20% - Day 8-14：分析 Search Term Report，将高 CVR 词转为 Exact Match - Day 15-30：关键词排名 Top 50 后关闭折扣，维持广告提升 SV 稳态 - 量化产出：首月目标关键词排名从 #180 
**三轨验证** | 成本轨：A9关键词优化工具订阅月均1200元+数据分析师人工12小时/月（折合3000元/月），总计4200元/月；首月关键词库建设投入8000元 | 合规轨：符合亚马逊A9搜索算法官方优化指南，不涉及黑帽SEO；需遵守《跨境电商商品信息规范》和进口母婴产品资质要求（CCC认证、检验检疫证明），合规依据为亚马逊Seller Central政策+中国海关HS编码6402.99 | 风险轨：①算法更新导致优化策略失效（概率35%，影响中等）；②关键词堆砌被判违规降权（概率8%，影响高）；③母婴产品合规文件缺失导致Listing被移除（概率12%，影响高）；④竞争对手恶意举报（

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：前7天促销投入约 $2,000-3,000 → 拉动年化自然流量价值 15-25 万元（排名 Top 50 后 ACOS 降至 12-15%）
实施难度：⭐⭐☆☆☆（主要依赖 PPC 和闪购操作，无需复杂技术）
优先级：⭐⭐⭐⭐⭐（新品上架必做，投入产出比最高的搜索流量工程动作）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（104 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from typing import List, Dict

def compute_sales_velocity(
    daily_orders: List[float],
    alpha: float = 0.2
) -> List[float]:
    """EWMA 销量速度计算"""
    sv = [daily_orders[0]]
    for q in daily_orders[1:]:
        sv.append(alpha * q + (1 - alpha) * sv[-1])
    return sv

def estimate_rank_score(
    sales_velocity: float,
    conversion_rate: float,
    relevance_score: float,
    review_score: float,
    weights: Dict[str, float] = None
) -> float:
    """估算 A9 排名得分（越高越好）"""
    if weights is None:
        weights = {"sv": 0.4, "cvr": 0.3, "rel": 0.2, "rev": 0.1}
    
    # 归一化各分量（0-1）
    sv_norm = min(sales_velocity / 100, 1.0)   # 100单/天为基准
    cvr_norm = min(conversion_rate / 0.15, 1.0) # 15% 为优秀基准
    rel_norm = min(relevance_score, 1.0)
    rev_norm = min((review_score - 1) / 4, 1.0) # 1-5星映射
    
    score = (
        weights["sv"] * sv_norm +
        weights["cvr"] * cvr_norm +
        weights["rel"] * rel_norm +
        weights["rev"] * rev_norm
    )
    return round(score, 4)

def simulate_launch_strategy(
    initial_daily_orders: float = 2.0,
    promo_boost_orders: float = 15.0,
    promo_days: int = 7,
    organic_growth_rate: float = 0.05,
    total_days: int = 30
) -> pd.DataFrame:
    """模拟新品上架销量速度演变"""
    daily_orders = []
    for day in range(total_days):
        if day < promo_days:
            orders = promo_boost_orders + np.random.normal(0, 2)
        else:
            # 促销结束后有机增长
            base = initial_daily_orders * (1 + organic_growth_rate) ** (day - promo_days)
            orders = max(base + np.random.normal(0, 1), 0)
        daily_orders.append(max(orders, 0))
    
    sv_list = compute_sales_velocity(daily_orders)
    
    # 模拟排名（SV 越高排名越靠前）
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:1305.2828。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：近 7 天订单数据、5-10 个目标关键词、竞品排名快照与广告预算；粒度为 SKU × 关键词 × 天。

**输出**：新品上市的销量速度打法与关键词优化节奏（含折扣与广告的时间安排）、销量速度与排名得分跟踪；供运营按阶段执行。

## 执行步骤

1. 拉取订单数据、目标关键词与排名快照
2. 第 1-7 天用自动广告加限时折扣推销量速度
3. 第 8-14 天把高转化词转为精确匹配
4. 第 15-30 天关折扣维持速度稳态
5. 用指数加权速度与排名得分复核节奏

## 边界与不做

- 数据不满足：没有关键词排名快照与搜索词报告时无法判断节奏是否有效。
- 何时不用：动态调价保 Buy Box 用「实时竞品重定价」；促销文案优化用「损失厌恶促销设计」。
- 能力边界：只给打法与节奏建议，不含广告账户操作、活动报名与供应链备货。
- 安全边界：不得使用黑帽 SEO 与关键词堆砌；母婴品类资质文件须齐备，广告与折扣按预算上限执行。

## 技能关联

- **前置**：Skill-Auto-Tagging-Pipeline-Rule-ML-LLM.html、Skill-Auto-Tagging-Pipeline-Rule-ML-LLM、Skill-Click-Through-Rate-Title-Optimizer.html、Skill-Click-Through-Rate-Title-Optimizer、Skill-Keyword-Cannibalization-Detection.html、Skill-Keyword-Cannibalization-Detection、Skill-Listing-Semantic-Relevance-Scoring.html、Skill-Listing-Semantic-Relevance-Scoring、Skill-Search-Position-Click-Elasticity.html、Skill-Search-Position-Click-Elasticity、Skill-Search-Term-Negative-Optimization.html、Skill-Search-Term-Negative-Optimization、Skill-Seasonal-Keyword-Rotation-Strategy.html、Skill-Seasonal-Keyword-Rotation-Strategy、Skill-Sponsored-Organic-Rank-Synergy.html、Skill-Sponsored-Organic-Rank-Synergy
- **延伸**：Skill-Auto-Tagging-Pipeline-Rule-ML-LLM.html、Skill-Auto-Tagging-Pipeline-Rule-ML-LLM、Skill-Click-Through-Rate-Title-Optimizer.html、Skill-Click-Through-Rate-Title-Optimizer、Skill-Keyword-Cannibalization-Detection.html、Skill-Keyword-Cannibalization-Detection、Skill-Search-Term-Negative-Optimization.html、Skill-Search-Term-Negative-Optimization、Skill-Seasonal-Keyword-Rotation-Strategy.html、Skill-Seasonal-Keyword-Rotation-Strategy、Skill-Sponsored-Organic-Rank-Synergy.html、Skill-Sponsored-Organic-Rank-Synergy
- **可组合**：Skill-Auto-Tagging-Pipeline-Rule-ML-LLM.html、Skill-Auto-Tagging-Pipeline-Rule-ML-LLM、Skill-Keyword-Cannibalization-Detection.html、Skill-Keyword-Cannibalization-Detection、Skill-Search-Term-Negative-Optimization.html、Skill-Search-Term-Negative-Optimization、Skill-Seasonal-Keyword-Rotation-Strategy.html、Skill-Seasonal-Keyword-Rotation-Strategy、Skill-A9-Algorithm-Sales-Velocity-Optimization

---

> 分类：业务运营/渠道经营/商品诊断　·　技术族：25-搜索流量工程　·　源卡：`Skill-A9-Algorithm-Sales-Velocity-Optimization`