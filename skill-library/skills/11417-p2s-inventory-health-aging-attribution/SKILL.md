---
name: "p2s-inventory-health-aging-attribution"
title: "Business Metric-Aware Forecasting for Inventory Management"
description: "触发词：库存健康诊断、库龄分析、死库识别、供应计划方差归因。何时不用：要预测未来销量用「需求预测」类技能，要算补多少货用「补货模拟」；本技能只诊断现状与归因偏差。安全边界：清货与调拨建议须人工复核后执行，模型不直接改动库存或价格。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-050"
l3_business: "库存分层"
l3_all: "库存分层 / 调拨清货建议"
l1_l2_l3: "业务运营/供应与履约/库存分层"
p2s_card_id: "Skill-Inventory-Health-Aging-Attribution"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "一眼看清哪些 SKU 快变成死库、哪些已经过库，并把库存与计划的差额归因到需求或供应等根因。"
user_try: "试试：这 10 个在售 SKU 里哪些是死库高风险？顺便告诉我 618 的库存缺口是预测问题还是供应商没按时交货。"
whenToUse: "已有 SKU 级库存与销售数据、需要判断分层与偏差归因时用；要决定补多少货用「补货模拟」，要预测销量用「需求预测」。"
workflow: "按动销速度把 SKU 分为 F 快动／S 慢动／N 死库三层 → 判定欠库、正常、过库三态并算出 cover_days 与库存金额 → 用 FBA 库龄费率估算库龄费并挑出高价值死库 → 把期末库存与计划差额归因到 4 类根因 → 输出清货与调拨建议清单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Business Metric-Aware Forecasting for Inventory Management

## ① 解决的问题

业务问题：618 大促结束后，某 SKU 实际期末库存比计划低 800 件，导致大促期间断货 3 天

## ② 核心算法逻辑

核心思想：库存健康诊断不是"某个 SKU 库存多少"，而是回答三个问题：① 这批货还能动吗（FSN分级）？② 过多还是过少（Over/Under stock 三态）？③ 为什么和计划不一样（供应计划方差归因到4类根因）。同时严格区分「预测准确率（Forecast Accuracy）」和「计划准确率（Plan Accuracy）」——两者可以完全脱钩。

## ③ 业务应用场景

- 业务问题：10 个在售 SKU，哪些是死库高风险？哪些已经过库？ - 预期产出：
- 业务问题：618 大促结束后，某 SKU 实际期末库存比计划低 800 件，导致大促期间断货 3 天。是需求预测问题、还是供应商没按时交货？ - 归因输出：
三轨验证 | 成本轨：AI库存预测模型月均成本3,500元（云服务2,000元+数据标注1,500元），人工干预8小时/月，年化成本42,000元；相比缺货损失（年化45万）和过度备货成本（估算月均15,000元），ROI达10.7倍 | 合规轨：符合《跨境电商进出口商品质量安全监督管理办法》库存管理要求；FBA备货需符合亚马逊库存政策（IPI评分≥400），AI预测结果可追溯审计；满足进出口食品安全法规 | 风险轨：模型偏差风险（概率15%，季节性需求预测不准导致库存波动）；数据质量风险（概率8%，历史销售数据缺失或异常）；供应链中断风险（概率12%，物流延迟影响补货周期）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
FBA 库龄费优化：识别 Steam-Old 类高价值死库，提前 60 天清仓可节省 $890/月×3 月 = $2,670
供应计划归因精度提升：快速定位主因后，下次大促的缺口可减少约 50%，对应保护 BSR 排名价值约 $20,000-$50,000
Forecast vs Plan Accuracy 对齐：将 MAPE 优化改为 TC 优化，按 Google Research 实测可降低库存成本 30-54%
实施难度：⭐⭐☆☆☆（2/5）— 规则+统计，可接入现有 ERP/数据仓库
优先级评分：⭐⭐⭐⭐⭐（5/5）— 每月必做的运营诊断，且是供应计划优化的起点

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（244 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：9」并记录位置 `paper2skills-code/supply_chain/inventory_health_aging_attribution` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Inventory-Health-Aging-Attribution.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Skill-Inventory-Health-Aging-Attribution
基于 JSCDM 2024 (FSN+ML) + OSCM Forum 2023 (Gradient Boosting) +
    ACM ICGAIB 2025 (慢动库+库龄) + arXiv:2404.07523 (供应计划归因) +
    arXiv:2308.13118 Google Research (Forecast vs Plan Accuracy)
母婴跨境 DTC 库存健康诊断 + 库龄分析 + 供应计划方差归因
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from enum import Enum


class FSNCategory(Enum):
    FAST    = "F-快动"
    SLOW    = "S-慢动"
    NONMOVE = "N-死库"


class StockStatus(Enum):
    UNDERSTOCK = "欠库"
    NORMAL     = "正常"
    OVERSTOCK  = "过库"


FBA_AGING_RATES = {
    (0, 90):   0.87,
    (91, 180):  1.58,
    (181, 270): 4.78,
    (271, 999): 7.95,
}


@dataclass
class SKUInventory:
    sku_id: str
    current_qty: int
    unit_cost: float
    cubic_feet_per_unit: float
    avg_daily_sales: float
    demand_forecast_30d: float
    days_in_fba: int
    planned_qty: int = 0
    actual_received_qty: int = 0
    planned_receive_date: str = ""
    actual_receive_date: str = ""

    @property
    def cover_days(self) -> float:
        return self.current_qty / max(self.avg_daily_sales, 0.1)

    @property
    def inventory_value(self) -> float:
        return self.current_qty * self.unit_cost

    @property
    def fsn_category(self) -> FSNCategory:
        if self.cover_days < 30:
            return FSNCategory.FAST
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2308.13118 — Business Metric-Aware Forecasting for Inventory Management

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：SKU×仓粒度明细：sku_id、当前库存量、单位成本、单件体积、日均销量、30 天需求预测、FBA 在库天数，以及供应计划字段（计划数量、实收数量、计划到货日、实际到货日）。

**输出**：每个 SKU 的 FSN 分层、欠库/正常/过库判定、cover_days 与库存金额、库龄费估算、供应计划方差根因归因，以及清货与调拨建议清单；供运营月度诊断和供应计划复盘使用。

## 执行步骤

1. 按动销速度把在售 SKU 分成 F 快动、S 慢动、N 死库三层
2. 逐 SKU 判定欠库、正常、过库三态并算出 cover_days 与库存金额
3. 按 FBA 库龄费率估算库龄费，挑出库龄高风险的高价值死库
4. 把实际期末库存与计划的差额归因到需求、供应等 4 类根因
5. 给出清货与调拨建议，标注需人工确认的动作

## 边界与不做

- 数据不满足时不用：缺日均销量或库龄字段的 SKU 无法分层与算库龄费。
- 只做诊断与归因，不直接执行清货、调拨或改价等动作。
- 卡页 ROI 数字为估算口径，落地前须用本店实际数据重算。

## 技能关联

- **前置**：Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-Model-Performance-Monitor.html、Skill-Model-Performance-Monitor、Skill-Promotion-Demand-Decomposition.html、Skill-Promotion-Demand-Decomposition、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-Supply-Chain-Causal-SCM-Attribution.html、Skill-Supply-Chain-Causal-SCM-Attribution
- **延伸**：Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-Model-Performance-Monitor.html、Skill-Model-Performance-Monitor、Skill-Promotion-Demand-Decomposition.html、Skill-Promotion-Demand-Decomposition、Skill-Supply-Chain-Causal-SCM-Attribution.html、Skill-Supply-Chain-Causal-SCM-Attribution
- **可组合**：Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-Promotion-Demand-Decomposition.html、Skill-Promotion-Demand-Decomposition、Skill-Supply-Chain-Causal-SCM-Attribution.html、Skill-Supply-Chain-Causal-SCM-Attribution、Skill-Inventory-Health-Aging-Attribution

---

> 分类：业务运营/供应与履约/库存分层　·　技术族：04-供应链　·　源卡：`Skill-Inventory-Health-Aging-Attribution`