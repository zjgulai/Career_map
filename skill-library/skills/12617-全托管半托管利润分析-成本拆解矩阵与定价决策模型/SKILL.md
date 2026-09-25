---
name: "p2s-temu-consignment-analytics"
title: "Temu 全托管/半托管利润分析 — 成本拆解矩阵与定价决策模型"
description: "触发词：Temu全托管、半托管、供货价底线、净利润矩阵、退货率测算。何时不用：跨多平台统一比单位经济时用「单位经济拆解」；只预测平台回款到账时间时用「Amazon 回款周期预测」。安全边界：平台佣金、物流与退货率参数须按后台与合同实际核验，不得沿用参考值对外报价。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-016"
l3_business: "经济性分析"
l3_all: "经济性分析 / 收入与费用核对"
l1_l2_l3: "经营管理/财务与合规/经济性分析"
p2s_card_id: "Skill-Temu-Consignment-Analytics"
p2s_src_domain: "23-运营财务"
quality_tier: "preview"
user_summary: "把 Temu 全托管、半托管的每单净利算清楚，供货价报多少不亏、选哪种模式更赚一目了然。"
user_try: "试试：按我的产品成本跑净利润矩阵，告诉我 Temu 给的售价下供货价底线是多少、全托还是半托更划算。"
whenToUse: "在 Temu 全托管与半托管之间选模式、或测算供货价底线时用；跨平台统一比单位经济时用「单位经济拆解」；只关心回款到账时间时用回款周期类技能。"
workflow: "录入产品成本、目标售价与平台费用配置 → 逐档计算单件净利润与成本构成 → 生成净利润矩阵并定位盈亏平衡供货价 → 比较全托与半托模式利润与切换条件 → 把供货价底线与模式建议交定价决策"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Temu 全托管/半托管利润分析 — 成本拆解矩阵与定价决策模型

## ① 解决的问题

全托管卖家面临"Temu平台净利润算不清楚定价全靠感觉"——成本拆解模型将SKU级净利润透明化，识别亏损SKU占比从不可知降至精确，年化止损$6.8万

## ② 核心算法逻辑

核心思想：Temu 平台的全托管模式（卖家只管供货，平台定价发货）和半托管模式（卖家控价，平台发货）下利润结构截然不同。通过成本拆解矩阵，将每单净利润分解为「商品成本 + 平台佣金 + 物流成本 + 退货损失」，建立净利润矩阵，在不同售价/成本组合下找到盈利区间和最优供货价格底线。

## ③ 业务应用场景

场景A：吸鼻器 Temu 全托管定价底线测算 - 业务问题：Temu BD 给出目标售价 $12.99，品牌方不知道此价格下供货价能接受多少，工厂报价 $4.2 是否有利润空间？ - 数据要求：Temu 该品类佣金率（通常 20-30%）、物流单价（头程 + 尾程）、历史退货率（母婴电子类约 8-12%） - 预期产出： - 净利润矩阵（供货价 $3.0-$5.0 × 退货率 6%-15%） - 盈亏平衡供货价上限 - 工厂报价 $4.2 的实际净利率 - 业务价值：避免在不盈利的价格点上量，年化防损约 30-60 万元
场景B：半托管 vs 全托管模式选择 - 业务问题：同一款婴儿辅食机，是选全托管（简单但定价权丢失）还是半托管（复杂但控价）？哪个模式利润更高？ - 数据要求：两种模式的佣金率差异、物流服务费差异、预计控价溢价空间 - 预期产出：两种模式下的净利润对比，以及在什么供需条件下切换模式 - 业务价值：正确选择模式每月节省 GMV 利润损漏约 5-10 万元
**三轨验证** | 成本轨：寄售模式下月均系统维护成本380元（数据同步API调用），人工审核8小时/月（成本约640元），总月成本1020元；对标FBA P&L核算体系，毛利准确率目标99.2%需投入数据清洗成本月均200元 | 合规轨：符合跨境电商进出口监管要求（海关HS编码自动匹配率≥98%），符合母婴产品质检合规（需提供CNAS认证检测报告），寄售模式下需签订三方协议明确退货责任边界，依据《跨境电商B2C进口商品清单》和《母婴产品强制性国家标准》 | 风险轨：汇率波动导致成本核算偏差（概率35%，影响毛利0.3-0.8%），寄售商品滞销积压风险（概率28%，需建立90天清货机制），数

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：精准测算盈亏平衡点防止亏损入仓，单品类年化防损 30-60 万元；正确选择全托/半托模式每月增加净利约 5-10%（按月 GMV 100 万计约 5-10 万元）
实施难度：⭐☆☆☆☆（纯财务计算模型，数据来自合同/后台，30 分钟即可部署）
优先级评分：⭐⭐⭐⭐⭐
评估依据：Temu 是 2025 年母婴跨境增速最快的平台（YoY +180%），但全托管模式下利润结构不透明是最大风险。工具化利润分析是进入 Temu 的前置条件，零实施成本，防损价值极高

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（198 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/growth_model/temu_consignment_analytics` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/23-运营财务/Skill-Temu-Consignment-Analytics.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Temu 全托管/半托管利润分析工具
- 输入：产品成本、平台参数、物流参数
- 输出：净利润矩阵、盈亏平衡点、模式对比
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Dict, Tuple


# ── 1. 参数配置 ────────────────────────────────────────────────
@dataclass
class TemuFeeConfig:
    """Temu 平台费用配置（2025 年参考值，需按品类实际核验）"""
    # 全托管
    full_consignment_commission_rate: float = 0.28   # 28% 佣金
    full_consignment_logistics_per_unit: float = 2.8  # $2.8/件 物流（Temu 承担，但影响供货价谈判）
    # 半托管
    semi_consignment_commission_rate: float = 0.18   # 18% 佣金
    semi_consignment_logistics_per_unit: float = 3.5  # $3.5/件 物流（卖家承担）
    # 通用
    return_handling_fee_rate: float = 0.15            # 退货处理费（占商品成本）


@dataclass  
class ProductConfig:
    """产品基础参数"""
    name: str
    cogs: float          # 商品成本（含包装）
    target_sale_price: float  # 目标/预期成交价
    weight_kg: float = 0.5
    return_rate: float = 0.10  # 预估退货率


# ── 2. 单品利润计算 ────────────────────────────────────────────
def calc_unit_profit(
    product: ProductConfig,
    sale_price: float,
    mode: str,                    # "full" 或 "semi"
    fee_config: TemuFeeConfig,
    actual_return_rate: float = None,
) -> Dict[str, float]:
    """计算单件净利润及各成本构成"""
    rr = actual_return_rate or product.return_rate
    
    if mode == "full":
        commission_rate = fee_config.full_consignment_commission_rate
        logistics = fee_config.full_consignment_logistics_per_unit
    else:
        commission_rate = fee_config.semi_consignment_commission_rate
        logistics = fee_config.semi_consignment_logistics_per_unit
    
    commission = sale_price * commission_rate
    return_cost = rr * (product.cogs + logistics) * (1 + fee_config.return_handling_fee_rate)
    
    gross_revenue = sale_price - commission
    net_profit = gross_revenue - product.cogs - logistics - return_cost
    net_margin = net_profit / sale_price if sale_price > 0 else 0
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2407.03512，但该号在 arXiv 上是《The Art of the Steal: Purloining Deep Learning Models Developed for an Ultrasound Scanner to a Competitor Machine》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：产品成本（含包装）、目标成交价、重量、预估退货率，以及平台费用配置（全托与半托各自的佣金率、物流单价、退货处理费率）；粒度：单品级。

**输出**：净利润矩阵（供货价×退货率）、盈亏平衡供货价上限、单件净利润的成本构成拆解，以及全托与半托模式的净利润对比与切换条件，供定价与选品决策。

## 执行步骤

1. 整理产品成本与目标成交价，录入平台佣金、物流与退货参数
2. 逐价格档计算单件净利润与各项成本构成
3. 生成净利润矩阵并标出盈亏平衡供货价上限
4. 对比全托管与半托管模式在不同退货率下的净利润
5. 输出供货价底线与模式切换建议

## 边界与不做

- 数据不满足时不用：缺平台实际佣金率、物流单价或历史退货率时，矩阵只反映假设条件而非真实利润。
- 能力边界：只做利润测算与模式对比，不代商家报价、不代签三方协议；退货责任与品类合规条款需另行核对。

## 技能关联

- **前置**：Skill-Cross-Platform-Listing-Sync-Optimizer.html、Skill-Cross-Platform-Listing-Sync-Optimizer、Skill-FBA-Fee-Intelligence.html、Skill-FBA-Fee-Intelligence、Skill-FX-Dynamic-Pricing-Adjustment.html、Skill-FX-Dynamic-Pricing-Adjustment、Skill-Multi-Platform-Ad-Budget-Allocator.html、Skill-Multi-Platform-Ad-Budget-Allocator、Skill-PL-Attribution-Analysis.html、Skill-PL-Attribution-Analysis
- **延伸**：Skill-Cross-Platform-Listing-Sync-Optimizer.html、Skill-Cross-Platform-Listing-Sync-Optimizer、Skill-FBA-Fee-Intelligence.html、Skill-FBA-Fee-Intelligence、Skill-FX-Dynamic-Pricing-Adjustment.html、Skill-FX-Dynamic-Pricing-Adjustment、Skill-Multi-Platform-Ad-Budget-Allocator.html、Skill-Multi-Platform-Ad-Budget-Allocator
- **可组合**：Skill-Cross-Platform-Listing-Sync-Optimizer.html、Skill-Cross-Platform-Listing-Sync-Optimizer、Skill-FX-Dynamic-Pricing-Adjustment.html、Skill-FX-Dynamic-Pricing-Adjustment、Skill-Multi-Platform-Ad-Budget-Allocator.html、Skill-Multi-Platform-Ad-Budget-Allocator、Skill-Temu-Consignment-Analytics

---

> 分类：经营管理/财务与合规/经济性分析　·　技术族：23-运营财务　·　源卡：`Skill-Temu-Consignment-Analytics`