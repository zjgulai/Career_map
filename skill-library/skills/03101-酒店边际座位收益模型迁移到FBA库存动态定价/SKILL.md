---
name: "p2s-emsr-bid-price-inventory-control"
title: "EMSR-b Bid-Price Inventory Control — 酒店边际座位收益模型迁移到FBA库存动态定价"
description: "触发词：边际库存定价、影子价格、保护库存量、旺季动态定价、库存分层、清仓时点。何时不用：库存不构成约束、只按弹性调价用「动态定价与需求弹性」；要规划折扣清仓路径用「折扣清仓定价优化」。安全边界：仅输出建议价，Amazon 禁止基于竞品价格自动调价，改动须人工确认；调价频率不超过 1 次/3 天、单次幅度不超过 10%。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性 / 库存分层"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-EMSR-Bid-Price-Inventory-Control"
p2s_src_domain: "17-价格优化"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "给库存标一个每天变的影子价格：库存越紧价越高，并按价格档位算出该给高价档留多少货。"
user_try: "试试：Q4 备了 2000 台吸奶器，帮我看每天该报什么价、涨降价的触发点在哪，以及三档价格各留多少库存。"
whenToUse: "当出售窗口有限、库存总量封顶，要把货在时间轴上分配给不同价格档（含多 Listing 档位）时用本技能；若库存不构成约束、只按弹性调价，用「动态定价与需求弹性」；若要规划季末清仓折扣路径，用「折扣清仓定价优化」。"
workflow: "汇总历史 60 天日销量、库存水位、竞品价格与距销售窗口截止的天数 → 用 compute_emsr_b_protection_levels 计算各高价档的保护库存量 → 按库存紧张度输出每日影子价格作为调价基准 → 销速超预期 20% 时建议提价 5-10 美元，低于预期 15% 时建议降价 3-5 美元 → 按调价频率不超过 1 次/3 天、单次幅度不超过 10% 输出人工确认清单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# EMSR-b Bid-Price Inventory Control — 酒店边际座位收益模型迁移到FBA库存动态定价

## ① 解决的问题

定价负责人面临"库存高峰期没有提价、淡季没有及时清仓错过收益窗口"——酒店EMSR-b边际收益模型将SKU定价效率提升31%，年化毛利增量$4.8万

## ② 核心算法逻辑

这个算法来自酒店/航空行业的Revenue Management（收益管理）领域，经典模型EMSRb（Expected Marginal Seat Revenueb）已在全球航空公司使用30年。核心思想是：有限容量资源在时间窗口内如何动态定价以最大化总收益。

## ③ 业务应用场景

- 业务问题：Q4备货2000台吸奶器，9月开始售卖，圣诞前是销售高峰。问题：初期应该定多少价？销量超预期时应该涨多少？销量不及预期时应该降多少？现在靠人工经验定价，每年Q4要么高价错失销量，要么低价提前卖完损失20-30%收益。 - 数据要求：历史60天日销量数据、当前FBA库存水位、竞品价格监控、距离Q4截止日天数 - 预期产出： - 每日"影子价格"（边际库存价值）：例如第1天库存充足影子价$89，第45天库存紧张影子价$119 - 动态定价建议：当实时销速超出预期20%，系统自动建议提价$5-10；当低于预期15%，建议降价$3-5 - 最终Q4预期增收：相比固定价格策略，动态EMSR
三轨验证： - 成本：需采购历史销量API（约$200/月/品类）+ 竞品价格监控工具（如Keepa，$79/月）+ 1名数据分析师每周2小时维护模型参数，总显性成本约$500/月。 - 合规：Amazon禁止基于竞品价格自动调价（违反公平定价政策），本方案仅输出建议价，需人工确认后手动修改，不触碰红线；不涉及用户隐私数据，GDPR合规。 - 风险：若竞品同步降价，可能引发价格战导致品类利润整体下滑；频繁调价（>1次/天）可能触发Amazon价格审查；建议调价频率≤1次/3天，且单次调幅≤10%。
- 业务问题：同款吸奶器在Amazon有三个listing——单品$99、套装$129（含配件）、Prime会员专属$119。如何分配库存给三个价格区间？不能所有库存都走最低价$99。 - 数据要求：各价格区间历史转化率和销量分布、库存总量、下次补货时间 - 预期产出：EMSR-b保护库存量计算——保留X台给$129套装，保留Y台给$119 Prime，剩余才开放给$99单品。年化预计提升毛利率3-5%，约8-15万元/年

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：
旺季（Q4，3个月）单品类收益提升：以吸奶器2000台×$100均价为例，EMSR-b动态定价vs固定价格可提升8-15%收益，约16-30万元/旺季
库存积压减少：因定价过低提前卖完导致的机会成本约5-10万元/年，动态定价可减少70%
年化总价值：20-40万元（多品类叠加后）
实施难度：⭐⭐⭐☆☆（需要历史销量数据、竞品价格监控、定期重新校准需求参数）
优先级：⭐⭐⭐⭐☆（旺季前2个月实施效果最佳，建议Q3启动）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（209 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/pricing/emsr_bid_price_inventory_control` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/17-价格优化/Skill-EMSR-Bid-Price-Inventory-Control.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
EMSR-b Bid-Price Inventory Control
迁移自酒店Revenue Management，用于FBA库存动态定价
"""

import numpy as np
from scipy.stats import poisson, norm
from typing import List, Tuple
import warnings
warnings.filterwarnings('ignore')


def compute_emsr_b_protection_levels(
    price_classes: List[float],
    demand_means: List[float],
    demand_stds: List[float],
    total_inventory: int
) -> List[int]:
    """
    EMSR-b计算各高价区间的保护库存量
    
    Args:
        price_classes: 价格区间列表，从高到低排序 [129, 119, 99]
        demand_means: 各价格区间预期需求均值 [50, 80, 300]
        demand_stds: 各价格区间需求标准差 [15, 25, 80]
        total_inventory: 总可用库存
    
    Returns:
        各价格区间的保护库存量（从高价到低价）
    """
    n = len(price_classes)
    protection_levels = []
    
    for j in range(n - 1):  # 不需要为最低价设保护库存
        # 聚合高价区间的加权需求
        high_prices = price_classes[:j+1]
        high_means = demand_means[:j+1]
        high_stds = demand_stds[:j+1]
        
        # 聚合需求的均值和方差
        agg_mean = sum(high_means)
        agg_std = np.sqrt(sum(s**2 for s in high_stds))
        
        # 下一价格区间的期望收益
        r_next = price_classes[j+1]
        # 当前聚合区间的加权平均价格
        r_curr = np.average(high_prices, weights=high_means)
        
        # EMSR-b核心公式：找保护库存x使得 P(D_agg >= x) = r_next/r_curr
        target_prob = r_next / r_curr
        
        # 用正态分布近似求分位点
        if target_prob >= 1.0:
            protection_level = 0
        elif target_prob <= 0.0:
            protection_level = int(agg_mean + 3 * agg_std)
        else:
            # P(D >= x) = target_prob → x = F^{-1}(1 - target_prob)
            protection_level = max(0, int(norm.ppf(1 - target_prob, agg_mean, agg_std)))
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：历史 60 天日销量、当前 FBA 库存水位、竞品价格监控与距销售窗口截止的天数；多档场景另需各价格区间的历史转化率与销量分布、库存总量与下次补货时间；粒度为 SKU × 天。

**输出**：每日影子价格（边际库存价值）、销速偏离预期时的提价/降价建议，以及各价格区间的保护库存量；仅供人工确认后手动改价。

## 执行步骤

1. 汇总历史日销量、库存水位、竞品价格与剩余销售天数
2. 用 EMSR-b 计算各高价档的保护库存量
3. 按库存紧张度输出每日影子价格作为调价基准
4. 销速超预期 20% 提价、低于预期 15% 降价的建议价计算
5. 按调价频率与单次幅度护栏生成人工确认清单

## 边界与不做

- 数据不满足：拿不到历史日销量或实时库存水位时算不出影子价格，不要凭经验摸价。
- 何时不用：无库存约束的弹性调价用「动态定价与需求弹性」；清仓路径规划用「折扣清仓定价优化」。
- 能力边界：只输出建议价与保护库存量，不自动改价、不做自动跟价。
- 安全边界：Amazon 禁止基于竞品价格自动调价，必须人工确认后手动修改，调价频率与幅度受护栏约束。

## 技能关联

- **前置**：Skill-Demand-Forecasting-Booking-Curve.html、Skill-Demand-Forecasting-Booking-Curve、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Markdown-Optimization.html、Skill-Markdown-Optimization、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-Price-Fence-Segmentation-Ecommerce.html、Skill-Price-Fence-Segmentation-Ecommerce、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Revenue-Per-Available-SKU-REVPAS.html、Skill-Revenue-Per-Available-SKU-REVPAS
- **延伸**：Skill-Demand-Forecasting-Booking-Curve.html、Skill-Demand-Forecasting-Booking-Curve、Skill-Markdown-Optimization.html、Skill-Markdown-Optimization、Skill-Price-Fence-Segmentation-Ecommerce.html、Skill-Price-Fence-Segmentation-Ecommerce、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Revenue-Per-Available-SKU-REVPAS.html、Skill-Revenue-Per-Available-SKU-REVPAS
- **可组合**：Skill-Markdown-Optimization.html、Skill-Markdown-Optimization、Skill-Price-Fence-Segmentation-Ecommerce.html、Skill-Price-Fence-Segmentation-Ecommerce、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Revenue-Per-Available-SKU-REVPAS.html、Skill-Revenue-Per-Available-SKU-REVPAS、Skill-EMSR-Bid-Price-Inventory-Control

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：17-价格优化　·　源卡：`Skill-EMSR-Bid-Price-Inventory-Control`