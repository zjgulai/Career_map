---
name: "p2s-healthy-inventory-three-layer-kpi"
title: "健康库存三层数字化KPI体系 — 可视层/分析层/应用层的量化指标与联通机制"
description: "触发词：健康库存、三层架构、库存健康评分、可视层分析层、行动触发。何时不用：需要精确口径的多仓在架率矩阵时用在架率多仓SKU矩阵；需要做库龄分段与持有成本精算时用库龄分段管理与资金成本化。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-050"
l3_business: "库存分层"
l3_all: "库存分层"
l1_l2_l3: "业务运营/供应与履约/库存分层"
p2s_card_id: "Skill-Healthy-Inventory-Three-Layer-KPI"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "把多仓库存做成可视、分析、行动三层，看清全局并按系统提示直接处置，别靠人天天手工汇总。"
user_try: "试试：把我 FBA 和英德两仓的库存做成三层看板，给出断货与积压预测以及可一键确认的补货清仓建议。"
whenToUse: "需要把多系统库存整合为可视层、分析层、应用层并自动触发行动时用本技能；单一口径的在架率矩阵用在架率多仓SKU矩阵。"
workflow: "整合多系统库存与销量数据统一视图 → 可视层输出库存价值与 DOI 灯号分布 → 分析层预测未来数周缺货与积压 → 应用层推送补货清仓建议供确认"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 健康库存三层数字化KPI体系 — 可视层/分析层/应用层的量化指标与联通机制

## ① 解决的问题

库存数据分散在3个系统每天2小时手工汇总仍然看不清全局——三层数字化架构（可视层现状+分析层趋势预测+应用层自动触发行动），书中终极数字化形态使决策时间从2小时降至20分钟

## ② 核心算法逻辑

书籍核心洞察（陈凤霞）：书中专节阐述了健康库存管理系统的三层数字化架构，这是比单一KPI更高层次的系统性框架——将库存管理从"指标监控"升级为"数字化决策支持"。

## ③ 业务应用场景

- 业务问题：品牌有FBA/UK仓/DE仓3个仓库，30个SKU，运营每天需要查3个系统才能了解库存状态，信息碎片化，无法做整体决策 - 三层架构应用： 1. 可视层：统一展示所有仓库库存价值$280,000，DOI均值42天，15个SKU绿灯，8个黄灯，5个红灯，2个黑灯 2. 分析层：预测4周后有3个SKU缺货（概率>70%）；有2个SKU如不干预将进入积压状态 3. 应用层：自动推送补货建议（3个SKU）、清仓建议（2个SKU），运营一键确认即可 - 预期产出：每日运营决策时间从2小时降至20分钟，库存健康评分从62分提升至81分
- 业务问题：供应链团队的绩效考核只看"有没有断货"，不关心库存质量 - 健康评分KPI应用：将三层架构的综合库存健康评分（0-100分）纳入月度考核，推动团队主动管理库龄、维护参数、及时清仓
**三轨验证** | 成本轨：FBA备货系统搭建月均成本3,200元（AWS云服务800元+数据分析工具1,200元+人工运维40小时×50元/小时=2,000元），首期投入15,000元；缺货率从12%降至3%，年化库存成本节省45万元，ROI周期4.8个月 | 合规轨：符合《跨境电商进出口商品质量安全监督管理办法》第12条备货规范要求；FBA物流符合《进出口食品安全管理规范》冷链追溯标准；依据：亚马逊FBA食品类目合规指南v2.3版本 | 风险轨：①预测模型偏差导致过度备货风险（概率18%）②奶粉保质期管理不当导致滞销（概率8%）③FBA仓储费用波动±15%（概率35%）④供应商交期延误影

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：运营决策时间从2小时降至20分钟（年节省240小时≈$6000工时）；系统化识别行动项使漏处理率从60%降至10%（避免约$1万+月度损失）；系统$3万，ROI>300%
实施难度：⭐⭐⭐⭐☆（三层系统需要整合多个数据源；最难的是应用层与实际系统的自动联通）
优先级：⭐⭐⭐⭐⭐（书中第七章收官之作，是所有供应链数字化的终极形态；是从"KPI追踪"到"数字化决策支持"的质的跨越）
适用规模：月GMV>$10万、SKU数>30个的卖家；越大越有价值
数据依赖：多系统数据整合（OMS+WMS+财务）；数据质量是最大挑战

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（262 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/healthy_inventory_three_layer_kpi` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Healthy-Inventory-Three-Layer-KPI.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
健康库存三层数字化KPI体系
基于《全链路管理》陈凤霞 第七章第六节
可视层 + 分析层 + 应用层的三层量化指标
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import Dict, List, Optional
import warnings
warnings.filterwarnings('ignore')


@dataclass
class SKUInventoryData:
    """SKU库存数据（整合多源）"""
    sku_id: str
    abc_class: str
    unit_cost: float
    unit_price: float
    current_stock: int
    in_transit: int
    sales_last_7d: float
    sales_last_14d: float
    sales_last_30d: float
    aging_0_30: int     # 0-30天库龄库存
    aging_31_60: int
    aging_61_90: int
    aging_90plus: int
    lead_time_days: int
    safety_stock_days: int


class HealthyInventoryThreeLayerKPI:
    """健康库存三层数字化KPI体系"""

    def layer1_visibility(self, sku: SKUInventoryData) -> Dict:
        """可视层 KPI"""
        total_stock = sku.current_stock + sku.in_transit
        inventory_value = sku.current_stock * sku.unit_cost
        avg_daily_sales = sku.sales_last_30d / 30

        # DOI
        doi = total_stock / max(avg_daily_sales, 0.01)

        # 动销率（近7天是否有销售）
        is_active = sku.sales_last_7d > 0

        # 库龄分布
        total = max(sku.current_stock, 1)
        aging_dist = {
            '0-30天': sku.aging_0_30 / total,
            '31-60天': sku.aging_31_60 / total,
            '61-90天': sku.aging_61_90 / total,
            '90天+': sku.aging_90plus / total,
        }

        # 五色灯
        target_doi = sku.lead_time_days + sku.safety_stock_days
        doi_ratio = doi / max(target_doi, 1)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.09278，但该号在 arXiv 上是《Precision Higgs Measurements at the 250 GeV ILC》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：多系统数据（OMS、WMS 与财务）的 SKU 库存、成本与销量数据，以及 SKU 分级与仓库范围定义。

**输出**：三层架构的库存健康看板与综合评分（0-100）、缺货与积压预测清单、补货与清仓行动建议，供运营与管理层决策。

## 执行步骤

1. 整合多系统库存与销量数据统一视图
2. 可视层输出库存价值与 DOI 灯号分布
3. 分析层预测未来数周缺货与积压
4. 应用层推送补货清仓建议供确认

## 边界与不做

- 何时不用：只需要矩阵口径在架率时用在架率多仓SKU矩阵；只需要库龄结构与持有成本精算时用库龄分段管理与资金成本化。
- 能力边界：输出看板、评分与行动建议，应用层与实际系统的自动联通需自行建设，本技能不直接改单。
- 数据边界：三层架构依赖多系统数据质量与口径统一，缺失系统接入时只能覆盖部分仓库。

## 技能关联

- **前置**：Skill-Demand-Driven-KB-Construction.html、Skill-Demand-Driven-KB-Construction、Skill-ITO-Three-Phase-Health-Tracking.html、Skill-ITO-Three-Phase-Health-Tracking、Skill-Replenishment-Parameter-Calibration.html、Skill-Replenishment-Parameter-Calibration、Skill-Supply-Chain-KPI-Health-Dashboard.html、Skill-Supply-Chain-KPI-Health-Dashboard
- **延伸**：Skill-Demand-Driven-KB-Construction.html、Skill-Demand-Driven-KB-Construction、Skill-Replenishment-Parameter-Calibration.html、Skill-Replenishment-Parameter-Calibration
- **可组合**：Skill-Demand-Driven-KB-Construction.html、Skill-Demand-Driven-KB-Construction、Skill-Replenishment-Parameter-Calibration.html、Skill-Replenishment-Parameter-Calibration、Skill-Healthy-Inventory-Three-Layer-KPI

---

> 分类：业务运营/供应与履约/库存分层　·　技术族：04-供应链　·　源卡：`Skill-Healthy-Inventory-Three-Layer-KPI`