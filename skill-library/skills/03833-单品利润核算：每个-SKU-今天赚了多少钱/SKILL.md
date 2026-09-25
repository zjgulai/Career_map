---
name: "p2s-sku-level-pl-dashboard"
title: "SKU-Level PL Dashboard — 单品利润核算：每个 SKU 今天赚了多少钱"
description: "触发词：单品利润核算、五层成本、贡献毛利、亏损配件、现金流诊断。何时不用：要对海量 SKU 做标签化利润诊断用「SKU 利润归因本体」；要按渠道比较贡献毛利用「渠道贡献毛利分析」。安全边界：佣金率、仓储费与旺季系数须按最新费率表维护；结论只作内部运营决策依据。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-016"
l3_business: "经济性分析"
l3_all: "经济性分析 / 收入与费用核对"
l1_l2_l3: "经营管理/财务与合规/经济性分析"
p2s_card_id: "Skill-SKU-Level-PL-Dashboard"
p2s_src_domain: "23-运营财务"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "每个 SKU 每卖一件赚多少钱算到分，把毛利看似正常但现金流紧张背后的亏损件找出来。"
user_try: "试试：按五层成本算出 M5 吸奶器、储奶袋和 UV 消毒器每件的贡献毛利，标出亏损的配件 SKU。"
whenToUse: "需要按 SKU 算出每件真实贡献毛利并定位隐性亏损件时用本技能；大规模标签化诊断用「SKU 利润归因本体」；按渠道比较用「渠道贡献毛利分析」。"
workflow: "录入各 SKU 售价、COGS、退货率、广告费每件与月销量 → 按佣金、配送、仓储、入库与退货处理费逐层扣减 → 算出每件贡献毛利与贡献毛利率 → 排出亏损 SKU 并给出停投、提价或清退建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# SKU-Level PL Dashboard — 单品利润核算：每个 SKU 今天赚了多少钱

## ① 解决的问题

账号整体毛利率 22% 看似正常，但 CFO 发现现金流持续很紧，不知道哪些 SKU 在拖后腿——SKU 粒度五层 P&L 拆解（FBA/广告/退货/仓储/关税）识别亏损 SKU，清退后整体毛利率提升至 28-32%，年化释放现金流 15-40 万元

## ② 核心算法逻辑

跨境电商的 P&L 核算有一个普遍性问题：财务报表在品牌/账号层面，但决策需要在 SKU 层面——不知道吸奶器 M5 今天赚了多少钱，就无法判断是否要继续备货、调整定价、增减广告。

## ③ 业务应用场景

业务问题：账号整体毛利率 22%，看起来还行，但 CFO 发现实际现金流一直很紧。不知道哪些 SKU 在拖后腿。
| SKU | 售价 | COGS | FBA 费 | 广告费/件 | 退货损失 | 贡献毛利 | |---|---|---|---|---|---|---| | M5 吸奶器 | $89.99 | $28 | $4.45 | $8.20 | $3.20 | +$45.14 (50.2%) | | 储奶袋 50片 | $12.99 | $3.20 | $3.22 | $4.80 | $0.52 | -$0.75 (亏损) | | UV 消毒器 | $59.99 | $22 | $5.80 | $7.50 | $2.40 | +$19.29 (32.2%) |
发现：储奶袋配件 SKU 每卖一件亏损 $0.75——因为广告费/件过高，而低单价吸收不了 FBA 固定费用。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
发现隐性亏损 SKU：停止亏损广告投放，月节省 $500-3,000
定价情景分析：识别提价空间，月增 GMV ¥5-20 万
资源聚焦高贡献 SKU：FBA 仓储优化节省 $200-800/月
年化综合 ROI：¥30-100 万
实施难度：⭐☆☆☆☆（公式明确，数据来自 Amazon Seller Central，半天接入）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（240 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/23-运营财务/sku_level_pl_dashboard` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/23-运营财务/Skill-SKU-Level-PL-Dashboard.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
SKU-Level P&L Dashboard — 单品利润核算模型
基于 Amazon FBA 成本结构 + Contribution Margin 分析

依赖: dataclasses, statistics (标准库)
"""

from dataclasses import dataclass, field
from statistics import mean
from typing import Optional


@dataclass
class FBAConfig:
    """FBA 费用配置（2026 年标准）"""
    referral_fee_rate: float = 0.08       # Amazon 平台佣金率（母婴品类 8%）
    fulfillment_fee: float = 4.25         # 拣货配送费（标准件）
    storage_rate_monthly: float = 0.78   # 月度仓储费（$0.78/立方英尺，Q1-Q3）
    storage_rate_q4: float = 2.40        # Q4 旺季仓储费
    inbound_fee_per_unit: float = 0.50   # FBA 入库费
    return_processing_fee: float = 2.45  # 退货处理费
    product_cubic_feet: float = 0.20     # 商品体积（立方英尺）


@dataclass
class SKUCosts:
    """单 SKU 成本结构"""
    sku_id: str
    title: str
    selling_price: float
    cogs: float                          # 产品成本（含采购+头程）
    return_rate: float = 0.06            # 退货率
    is_q4: bool = False                  # 是否 Q4 旺季（影响仓储费）
    ad_spend_per_unit: float = 0.0       # 广告费/件（= 广告总花费/出货量）
    monthly_units_sold: int = 100        # 月销售量


@dataclass
class SKUPL:
    """单 SKU P&L 报表"""
    sku_id: str
    title: str
    # 收入层
    gross_revenue_per_unit: float
    return_loss_per_unit: float
    net_revenue_per_unit: float
    # 成本层
    cogs: float
    gross_profit: float
    gross_margin: float
    # FBA 层
    referral_fee: float
    fulfillment_fee: float
    storage_fee: float
    inbound_fee: float
    total_fba_fee: float
    post_fba_profit: float
    post_fba_margin: float
    # 广告层
    ad_spend_per_unit: float
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2211.09612，但该号在 arXiv 上是《Dynamic Pricing with Volume Discounts in Online Settings》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：单 SKU 成本结构：售价、COGS（含采购与头程）、退货率、广告费每件、月销量与体积，以及 FBA 费率配置（佣金率、配送费、仓储费与旺季系数、入库费与退货处理费）。

**输出**：单 SKU P&L 报表：收入层、成本层、FBA 层与广告层逐层利润与贡献毛利率，用于识别亏损 SKU 并指导停投、提价或清退。

## 执行步骤

1. 录入各 SKU 的售价、成本与销量等参数
2. 按佣金、配送、仓储、入库与退货费逐层扣减
3. 算出每件贡献毛利与贡献毛利率
4. 排出亏损 SKU 并给出停投或提价建议

## 边界与不做

- 广告费无法按件拆分、或退货率缺失时不适用，贡献毛利会失真
- 只做单品核算与建议，不自动改价、停投或清退 SKU
- 费率与旺季系数须按最新费率表维护，跨站点不能套用同一套参数

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-FBA-Fee-Intelligence.html、Skill-FBA-Fee-Intelligence、Skill-Forecast-to-PL-Bridge.html、Skill-Forecast-to-PL-Bridge、Skill-Inventory-Financing-Optimization.html、Skill-Inventory-Financing-Optimization、Skill-PL-Attribution-Analysis.html、Skill-PL-Attribution-Analysis、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing
- **延伸**：Skill-Forecast-to-PL-Bridge.html、Skill-Forecast-to-PL-Bridge、Skill-Inventory-Financing-Optimization.html、Skill-Inventory-Financing-Optimization、Skill-PL-Attribution-Analysis.html、Skill-PL-Attribution-Analysis、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing
- **可组合**：Skill-Inventory-Financing-Optimization.html、Skill-Inventory-Financing-Optimization、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing、Skill-SKU-Level-PL-Dashboard

---

> 分类：经营管理/财务与合规/经济性分析　·　技术族：23-运营财务　·　源卡：`Skill-SKU-Level-PL-Dashboard`