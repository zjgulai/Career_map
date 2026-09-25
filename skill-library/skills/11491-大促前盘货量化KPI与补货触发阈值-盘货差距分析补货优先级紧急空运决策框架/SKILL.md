---
name: "p2s-pre-promo-stocktaking-kpi"
title: "大促前盘货量化KPI与补货触发阈值 — 盘货差距分析/补货优先级/紧急空运决策框架"
description: "触发词：大促前盘货、库存缺口、补货优先级、空运ROI、大促触发阈值。何时不用：日常稳态补货用「自动补货决策」；大促中要自动降广告出价护库存时用「大促库存脉冲触发」。安全边界：空运等应急物流支出须按预算与 ROI 阈值人工批准。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟 / 需求预测"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
p2s_card_id: "Skill-Pre-Promo-Stocktaking-KPI"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "大促前把每个 SKU 的缺口算清楚，再按 ROI 决定谁走空运、谁放弃。"
user_try: "试试：Prime Day 前 28 天盘一遍库存缺口，按空运 ROI 排出补货优先级。"
whenToUse: "大促前需要系统化盘货、决定补货优先级与是否紧急空运时用；平时按补货点下单即可。"
workflow: "汇总当前库存与已确认在途 → 按上期大促销量与增长系数预测需求 → 计算各 SKU 差距件数与缺口比例 → 用空运 ROI 判断是否紧急空运 → 在预算内按缺货损失与空运成本之比排序"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 大促前盘货量化KPI与补货触发阈值 — 盘货差距分析/补货优先级/紧急空运决策框架

## ① 解决的问题

大促备货靠感觉导致爆款缺货35%且次品积压——四要素盘货量化（当前库存/预测件数/差距件数/补货触发阈值）+空运ROI决策矩阵，大促缺货率从35%降至8%

## ② 核心算法逻辑

书籍核心洞察（陈凤霞）：大促前的盘货不是简单地"看看有多少货"，而是一个系统性的差距分析→补货决策→紧急处理流程。书中给出了精确的量化框架，将盘货从"感觉备够了"升级为"数据驱动的备货决策"。

## ③ 业务应用场景

场景A：Prime Day前4周系统化盘货
- 业务问题：某卖家每年Prime Day前"凭感觉"备货，结果爆款总是缺货而次要品积压 - 盘货KPI应用（大促前30天）： 1. 汇总所有SKU的当前库存+确认在途 2. 基于上年Prime Day销量×增长系数（×1.3）估算预测件数 3. 计算每个SKU的差距件数和缺口比例 4. 爆款（吸奶器）缺口45%，距大促28天→评估空运： - 空运额外成本：500件×$12/件=$6000 - 缺货损失：500件×45%×$38毛利×1.5大促溢价≈$12,825 - ROI=2.14→必须空运！ - 预期产出：大促爆款缺货率从35%降至8%，大促GMV提升22%
- 业务问题：预算有限（只有$20000空运预算），需要决定哪些SKU空运哪些放弃 - 优先级算法：按"不空运缺货损失/空运额外成本"降序排列，依次填入空运，直到预算用完

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：大促爆款缺货率从35%降至8%，Prime Day额外挽回GMV约$5-15万；空运决策ROI量化避免"不该空运的空运了/该空运的没空运"两种错误，节省约$3000-8000/次大促；系统$1.5万，ROI>1000%
实施难度：⭐⭐☆☆☆（逻辑直接，主要工作是整合FBA库存+在途库存数据；空运ROI计算需要准确的物流成本和毛利数据）
优先级：⭐⭐⭐⭐⭐（书中第六章首节，大促是全年最高ROI时段，系统化盘货KPI直接影响大促业绩）
适用规模：参与大促的所有卖家；月销>$3万且有大促的卖家
数据依赖：FBA库存报告、在途确认清单、历史大促销量、物流成本数据

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（210 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 53 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/supply_chain/pre_promo_stocktaking_kpi` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Pre-Promo-Stocktaking-KPI.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
大促前盘货量化KPI与补货触发阈值
基于《全链路管理》陈凤霞 第六章第二节
差距分析 + 空运ROI决策 + 补货优先级排序
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import Dict, List, Optional
import warnings
warnings.filterwarnings('ignore')


@dataclass
class PromoSKUProfile:
    """大促SKU档案"""
    sku_id: str
    sku_name: str
    abc_class: str
    unit_margin: float              # 单品毛利
    promo_price_premium: float      # 大促期间相对日常的价格溢价系数（通常>1因为大促期间需求高）

    # 当前库存状态
    current_stock_fba: int
    current_stock_own_wh: int
    confirmed_inbound_units: int    # 已确认海运到货
    days_to_promo: int              # 距大促天数

    # 需求预测
    last_promo_actual_sales: int    # 上次大促实际销量
    yoy_growth_factor: float = 1.3  # 增长系数

    # 物流成本
    sea_freight_unit: float = 3.5   # 海运单件成本
    air_freight_unit: float = 15.0  # 空运单件成本


class PrePromoStocktakingAnalyzer:
    """大促前盘货分析器"""

    def forecast_promo_demand(self, sku: PromoSKUProfile) -> int:
        """预测大促需求件数"""
        return int(sku.last_promo_actual_sales * sku.yoy_growth_factor)

    def compute_inventory_gap(self, sku: PromoSKUProfile) -> Dict:
        """计算库存缺口"""
        total_available = (sku.current_stock_fba + sku.current_stock_own_wh
                           + sku.confirmed_inbound_units)
        forecast = self.forecast_promo_demand(sku)
        gap_units = max(forecast - total_available, 0)
        gap_ratio = gap_units / max(forecast, 1)

        return {
            'sku_id': sku.sku_id,
            'total_available': total_available,
            'forecast_demand': forecast,
            'gap_units': gap_units,
            'gap_ratio': gap_ratio,
            'gap_ratio_pct': f"{gap_ratio:.0%}",
            'has_gap': gap_units > 0,
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：FBA 库存报告、在途确认清单、历史大促销量、海运与空运单件成本、单品毛利与大促价格溢价系数、距大促天数，按 SKU 组织。

**输出**：各 SKU 的缺口件数与比例、补货优先级排序、空运 ROI 判定与预算内的空运清单，供大促备货与物流决策。

## 执行步骤

1. 汇总当前库存与已确认在途件数
2. 按上年大促销量乘增长系数预测需求
3. 计算差距件数与缺口比例
4. 对缺口大的 SKU 计算空运 ROI
5. 按 ROI 排序并在预算内确定空运清单

## 边界与不做

- 数据不满足时不适用：拿不到在途确认清单或准确的物流与毛利数据时，缺口与空运 ROI 都会算错。
- 能力边界：只给缺口、优先级与 ROI 判定，空运订舱、预算审批与实际调拨由人工执行。

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Flash-Sale-Realtime-Sellthrough-Forecast.html、Skill-Flash-Sale-Realtime-Sellthrough-Forecast、Skill-ITO-Three-Phase-Health-Tracking.html、Skill-ITO-Three-Phase-Health-Tracking、Skill-In-Transit-Inventory-Tracking-Visibility.html、Skill-In-Transit-Inventory-Tracking-Visibility、Skill-Logistics-Cost-Structure-Decomposition.html、Skill-Logistics-Cost-Structure-Decomposition、Skill-Promo-Stocktaking-SOP-Automation.html、Skill-Promo-Stocktaking-SOP-Automation、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Flash-Sale-Realtime-Sellthrough-Forecast.html、Skill-Flash-Sale-Realtime-Sellthrough-Forecast、Skill-In-Transit-Inventory-Tracking-Visibility.html、Skill-In-Transit-Inventory-Tracking-Visibility、Skill-Logistics-Cost-Structure-Decomposition.html、Skill-Logistics-Cost-Structure-Decomposition、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-In-Transit-Inventory-Tracking-Visibility.html、Skill-In-Transit-Inventory-Tracking-Visibility、Skill-Logistics-Cost-Structure-Decomposition.html、Skill-Logistics-Cost-Structure-Decomposition、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Pre-Promo-Stocktaking-KPI

---

> 分类：业务运营/供应与履约/补货模拟　·　技术族：04-供应链　·　源卡：`Skill-Pre-Promo-Stocktaking-KPI`