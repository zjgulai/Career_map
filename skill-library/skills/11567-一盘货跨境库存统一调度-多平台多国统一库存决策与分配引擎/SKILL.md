---
name: "p2s-unified-cross-border-inventory-dispatch"
title: "一盘货跨境库存统一调度 — 多平台多国统一库存决策与分配引擎"
description: "触发词：一盘货、跨境库存调度、多平台统一分配、聚合采购、池化安全库存。何时不用：按渠道优先级分单防超卖用「全渠道订单编排」；同一市场内多渠道池化用「多渠道库存池化」。安全边界：跨国调拨须符合目的地海关与进口规定，库存不得虚标。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-052"
l3_business: "调拨清货建议"
l3_all: "调拨清货建议 / 供需协调"
l1_l2_l3: "业务运营/供应与履约/调拨清货建议"
p2s_card_id: "Skill-Unified-Cross-Border-Inventory-Dispatch"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "几个平台、几个国家的货当成一盘棋统一调度，别让一个平台缺货、另一个压着。"
user_try: "试试：Amazon、Shopee、TikTok 三渠道库存不均，给出统一分配与调拨方案。"
whenToUse: "同时运营多个平台或多国仓、各渠道各自备货造成缺货与积压并存时用；单一渠道场景不需要。"
workflow: "聚合各渠道库存与需求强度形成全局视图 → 按需求强度分配库存并留安全水位 → 对跨渠道缺口给出物理调拨方案 → 评估聚合采购与仓租的节省"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 一盘货跨境库存统一调度 — 多平台多国统一库存决策与分配引擎

## ① 解决的问题

三渠道各自备货造成A平台缺货B平台积压的荒诞并存——统一库存池优化将跨渠道缺货率从18%降至5%，总库存减少22%，年化价值$17万

## ② 核心算法逻辑

业务背景（陈凤霞实战经验）：书中第8章专节阐述"一盘货"是东南亚跨境电商供应链的最大创新——不同卖家、不同平台、不同渠道的库存统一集中在一个仓库，按需调配。从中国直发到东南亚的模式下，每个卖家各自管库存效率极低，而"一盘货"让库存共享，整体周转率提升3050%。

## ③ 业务应用场景

场景A：Amazon/Shopee/TikTok Shop三渠道统一库存
- 业务问题：某母婴卖家同时运营3个平台，吸奶器SKU在Amazon FBA有100件（偏低），Shopee海外仓有250件（偏高），TikTok Shop仓有80件（正常）。Amazon频繁缺货，Shopee积压，不敢统一调配怕"调走后Shopee也缺货" - 数据要求：3个平台实时库存数据、各平台日均销量、调拨成本 - 算法应用： 1. 统一库存视图：总可用430件，Amazon需求强度最高（日均25件），Shopee仅10件 2. 最优分配：Amazon调配至180件（7天安全库存）、Shopee降至160件、TikTok 90件 3. 物理调拨：从Shopee海外仓转80件至FBA（调
- 业务问题：3个母婴卖家各自在泰国建独立库存，每家月营业额$20万，各自维持$5万安全库存（共$15万），利用率仅60% - 算法应用：三家合用一个仓，统一安全库存池$9万（池化降低40%），按各家实时订单量动态分配发货优先级；集中采购降低头程成本15% - 预期产出：三家合计节省$6万安全库存占压 + 仓租降低50% = 每月节省$1.5万

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：3渠道卖家年销$200万，池化节省30%安全库存约$3万资金占压，跨渠道调拨避免缺货$5万，聚合采购节省$5万，合计$13万/年；系统成本$4万，ROI≈325%
实施难度：⭐⭐⭐⭐☆（技术上需要对接3+个平台API实时库存，跨国物理调拨的海关合规是难点）
优先级：⭐⭐⭐⭐☆（同时经营3+平台或东南亚多国市场的卖家强烈推荐）
适用规模：同时运营3个以上平台渠道、或东南亚多国布局的卖家
数据依赖：各平台实时库存API、订单数据、调拨成本记录

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（250 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 55 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/unified_cross_border_inventory_dispatch` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Unified-Cross-Border-Inventory-Dispatch.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
一盘货跨境库存统一调度系统
功能：多渠道库存聚合 + 最优分配 + 快拨决策 + 聚合采购
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional
from scipy.optimize import linprog
import warnings
warnings.filterwarnings('ignore')


@dataclass
class ChannelInventory:
    """渠道库存状态"""
    channel_id: str           # 'amazon_us', 'shopee_sg', 'tiktok_uk'
    sku_id: str
    stock: int                # 当前库存
    daily_sales: float        # 日均销量
    min_service_level: float  # 最低服务水平（fill rate）
    unit_margin: float        # 单位毛利($)
    reallocation_cost: float  # 从其他渠道调拨成本($件)
    lead_time_days: int       # 从中央仓调拨时间
    
    @property
    def doi(self) -> float:
        return self.stock / max(self.daily_sales, 0.01)
    
    @property
    def safety_stock_needed(self) -> float:
        return self.daily_sales * (self.lead_time_days + 7)  # 提前期+7天安全


class UnifiedInventoryEngine:
    """统一库存调度引擎"""
    
    def __init__(self):
        self.channels: Dict[str, List[ChannelInventory]] = {}
    
    def add_channel_inventory(self, inv: ChannelInventory):
        if inv.sku_id not in self.channels:
            self.channels[inv.sku_id] = []
        self.channels[inv.sku_id].append(inv)
    
    def compute_global_atp(self, sku_id: str) -> Dict:
        """计算全局可用库存"""
        if sku_id not in self.channels:
            return {}
        
        channels = self.channels[sku_id]
        total_stock = sum(c.stock for c in channels)
        total_demand = sum(c.daily_sales for c in channels)
        
        return {
            'sku_id': sku_id,
            'total_stock': total_stock,
            'total_daily_demand': total_demand,
            'global_doi': total_stock / max(total_demand, 0.01),
            'channels': len(channels),
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2405.11234。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：各渠道实时库存、日均销量、最低服务水平、单位毛利、调拨成本与调拨前置期，按渠道与 SKU 组织。

**输出**：各渠道分配后的库存与安全水位、跨渠道调拨方案、聚合采购与仓租节省估算，以及缺货率与总库存改善预期。

## 执行步骤

1. 聚合多渠道库存与需求强度
2. 按需求强度分配库存并留出安全库存
3. 识别跨渠道缺口并生成调拨方案
4. 估算聚合采购与仓租节省
5. 输出分配结果与改善预期

## 边界与不做

- 数据不满足时不适用：拿不到多平台实时库存 API 或跨境调拨成本时，统一调度退化为各自备货。
- 能力边界：只给分配与调拨建议，跨国清关、头程运输与平台库存同步由人工或第三方执行。

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-FDC-RDC-Inventory-Allocation.html、Skill-FDC-RDC-Inventory-Allocation、Skill-ITO-DOI-Inventory-Turnover-Optimizer.html、Skill-ITO-DOI-Inventory-Turnover-Optimizer、Skill-In-Transit-Inventory-Tracking-Visibility.html、Skill-In-Transit-Inventory-Tracking-Visibility、Skill-Multi-Channel-Inventory-Pooling.html、Skill-Multi-Channel-Inventory-Pooling、Skill-Multi-Channel-Inventory-Sync.html、Skill-Multi-Channel-Inventory-Sync、Skill-OT-Cross-Market-Demand-Transfer.html、Skill-OT-Cross-Market-Demand-Transfer、Skill-Omnichannel-Inventory-Sync.html、Skill-Omnichannel-Inventory-Sync、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-FDC-RDC-Inventory-Allocation.html、Skill-FDC-RDC-Inventory-Allocation、Skill-ITO-DOI-Inventory-Turnover-Optimizer.html、Skill-ITO-DOI-Inventory-Turnover-Optimizer、Skill-In-Transit-Inventory-Tracking-Visibility.html、Skill-In-Transit-Inventory-Tracking-Visibility、Skill-Multi-Channel-Inventory-Pooling.html、Skill-Multi-Channel-Inventory-Pooling、Skill-OT-Cross-Market-Demand-Transfer.html、Skill-OT-Cross-Market-Demand-Transfer、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-ITO-DOI-Inventory-Turnover-Optimizer.html、Skill-ITO-DOI-Inventory-Turnover-Optimizer、Skill-In-Transit-Inventory-Tracking-Visibility.html、Skill-In-Transit-Inventory-Tracking-Visibility、Skill-OT-Cross-Market-Demand-Transfer.html、Skill-OT-Cross-Market-Demand-Transfer、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Unified-Cross-Border-Inventory-Dispatch

---

> 分类：业务运营/供应与履约/调拨清货建议　·　技术族：04-供应链　·　源卡：`Skill-Unified-Cross-Border-Inventory-Dispatch`