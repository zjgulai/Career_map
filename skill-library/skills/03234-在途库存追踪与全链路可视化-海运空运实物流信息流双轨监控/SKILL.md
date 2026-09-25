---
name: "p2s-in-transit-inventory-tracking-visibility"
title: "在途库存追踪与全链路可视化 — 海运/空运实物流信息流双轨监控"
description: "触发词：在途库存、ETA预测、在途可视化、到港延误、虚拟ATP。何时不用：需要把 ETA 准确率等过程指标做成 KPI 体系时用在途ETA准确率与到货履约率KPI；需要做港口拥堵的多因子到港预测时用港口拥堵ETA预测。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-058"
l3_business: "到货异常追踪"
l3_all: "到货异常追踪 / 履约跟踪"
l1_l2_l3: "业务运营/供应与履约/到货异常追踪"
p2s_card_id: "Skill-In-Transit-Inventory-Tracking-Visibility"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把海运在途批次的状态和预计到港时间盯起来，延误提前预警，避免重复采购和断货。"
user_try: "试试：帮我接入这两批海运提单，预测到港时间并标出受港口拥堵影响的批次和补货建议。"
whenToUse: "多批在途货物需要统一看板、ETA 预测与异常响应时用本技能；把在途过程指标做成 KPI 用在途ETA准确率与到货履约率KPI。"
workflow: "接入物流商 API 与船舶位置数据 → 预测各批次到港时间并检测异常 → 按紧迫度与异常等级生成在途看板 → 输出虚拟可用量与空运补货评估建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 在途库存追踪与全链路可视化 — 海运/空运实物流信息流双轨监控

## ① 解决的问题

海运35天是信息黑洞导致重复采购和断货——ETA预测+虚拟ATP将在途异常响应时间从5天压缩至24小时，年化防损$8-15万

## ② 核心算法逻辑

业务背景（陈凤霞实战经验）：书中强调：在途库存是电商供应链中最大的"信息黑洞"——货物从工厂出发到进入FBA/海外仓，这段时间（海运3550天）内的库存状态对销售端完全不透明。卖家不知道货在哪、什么时候到、有没有异常，导致两大问题：(1) 因为看不到在途就重复下单，造成货物到港时库存过多；(2) 因为看不到延误，等到库存告急才发现货还在海上漂。书中指出：全链路必须"实物流与信息流对齐，异常立即跟进"。

## ③ 业务应用场景

- 业务问题：某卖家每月2-3批海运货物（华南→美国Amazon FBA），运输周期35-45天。每次都是"等货、等货、等到货了才发现延误了10天"，造成断货损售额$5万 - 数据要求：每批货物的提单(B/L)号、集装箱号、出发日期、SKU明细和数量、历史同航线时效数据 - 算法应用： 1. 建立在途追踪系统：接入主流物流商API（Maersk/COSCO/DHL）自动拉取状态 2. ETA预测：对当前2批货物预测到港时间（基于实时船舶位置+港口拥堵） 3. 批次A（预计11月1日）：检测到LA港拥堵，Z-score=2.3，预警延误5-7天 4. 立即响应：提前触发空运补货100件（关键爆款
- 业务问题：同时管理5批在途货物，手工管理Excel混乱，经常漏跟进，有一批延误了14天才发现 - 算法应用：统一在途看板，按"到港紧迫度+异常等级"自动排序，每日8:00推送Top3需跟进批次给运营团队 - 预期产出：平均异常响应时间从5天缩短至24小时，在途信息及时率从60%提升至95%
**三轨验证** | 成本轨：WMS系统部署月均3,500元（含云服务费2,000元、数据处理1,200元、人工运维300元），年化42,000元；缺货率从12%降至3%，年增收益约45万元，ROI达10.7倍；人工成本从月均40小时降至8小时，月均节省人力成本2,400元 | 合规轨：符合《跨境电商进出口商品质量安全监督管理办法》第12条关于库存管理的要求；满足FBA备货合规标准（AWS官方认证）；符合GB/T 16986婴幼儿食品追溯要求 | 风险轨：系统集成风险（概率15%）—与现有ERP兼容性问题导致数据延迟1-2周；数据准确性风险（概率8%）—传感器故障导致库存偏差2-3%；供应商配

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：年均断货2-4次（每次$3-5万损失）来自在途信息不透明；追踪系统将响应提前到5天内，防损$8-15万/年；避免重复采购$5-10万；系统成本$4万，ROI≈325%
实施难度：⭐⭐⭐☆☆（ETA预测需要历史数据和物流商API接入；最难的是获取实时船舶位置数据，可用MarineTraffic/Flexport等API）
优先级：⭐⭐⭐⭐☆（凡是走海运的跨境卖家（占90%）都面临在途黑洞问题，ROI高且痛点真实）
适用规模：每月海运批次≥2批次的卖家
数据依赖：物流商API（提单追踪）、船舶AIS数据（MarineTraffic API）、历史同航线时效数据

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（313 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/in_transit_inventory_tracking_visibility` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-In-Transit-Inventory-Tracking-Visibility.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
在途库存追踪与全链路可视化系统
功能：ETA预测 + 异常检测 + 虚拟库存计算 + 全链路状态机
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from enum import Enum
import warnings
warnings.filterwarnings('ignore')


class TransitStatus(Enum):
    """在途状态"""
    FACTORY_PICKUP = "工厂提货"
    DOMESTIC_CUSTOMS = "国内清关"
    VESSEL_LOADED = "已装船"
    IN_OCEAN = "海运中"
    DESTINATION_ARRIVED = "目的港到达"
    CUSTOMS_CLEARANCE = "目的港清关"
    WAREHOUSE_RECEIVED = "已入仓"
    DELAYED = "延误"
    EXCEPTION = "异常"


@dataclass
class TransitBatch:
    """在途批次"""
    batch_id: str
    bl_number: str              # 提单号
    container_id: str           # 集装箱号
    carrier: str                # 船公司
    origin_port: str            # 出发港
    dest_port: str              # 目的港
    departure_date: datetime    # 出发日期
    planned_eta: datetime       # 计划到港日期
    skus: Dict[str, int]        # {sku_id: qty}
    unit_costs: Dict[str, float] # {sku_id: unit_cost}
    current_status: TransitStatus = TransitStatus.IN_OCEAN
    last_position_update: Optional[datetime] = None
    current_location: str = ""
    actual_arrival: Optional[datetime] = None


class ETAPredictor:
    """ETA预测模型（简化版GBT）"""
    
    # 航线历史均值和标准差（天）
    ROUTE_STATS = {
        ('YANTIAN', 'LOS_ANGELES'): (32, 3.5),
        ('SHANGHAI', 'LOS_ANGELES'): (28, 4.0),
        ('GUANGZHOU', 'LONG_BEACH'): (30, 3.8),
        ('NINGBO', 'SEATTLE'): (25, 3.2),
        ('SHENZHEN', 'NEW_YORK'): (38, 5.0),
        ('QINGDAO', 'LOS_ANGELES'): (28, 4.2),
    }
    
    # 港口拥堵指数影响（额外天数）
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2403.05819。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：每批货物的提单号、集装箱号、出发日期、SKU 明细与数量、历史同航线时效数据，以及物流商追踪 API 与船舶位置数据源。

**输出**：在途批次状态与 ETA 预测、异常等级排序看板（含每日需跟进的批次）、虚拟库存与补货建议，供运营与采购团队使用。

## 执行步骤

1. 接入物流商 API 与船舶位置数据
2. 预测各批次到港时间并检测异常
3. 按紧迫度与异常等级生成在途看板
4. 输出虚拟可用量与空运补货评估建议

## 边界与不做

- 何时不用：需要把 ETA 准确率、异常率做成过程 KPI 并归因缺货时用在途ETA准确率与到货履约率KPI；需要做港口拥堵多因子预测时用港口拥堵ETA预测。
- 能力边界：输出在途可见性与预测结果，不代替货代订舱、清关与入仓预约的实际执行。
- 数据边界：实时船舶位置与港口拥堵数据依赖第三方接口，接入未完成时 ETA 精度显著下降。

## 技能关联

- **前置**：Skill-Automated-Replenishment-Decision-Engine.html、Skill-Automated-Replenishment-Decision-Engine、Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-Logistics-Fraud-Detection.html、Skill-Logistics-Fraud-Detection、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Supply-Chain-Resilience-Modeling.html、Skill-Supply-Chain-Resilience-Modeling
- **延伸**：Skill-Automated-Replenishment-Decision-Engine.html、Skill-Automated-Replenishment-Decision-Engine、Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-Logistics-Fraud-Detection.html、Skill-Logistics-Fraud-Detection、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning
- **可组合**：Skill-Logistics-Fraud-Detection.html、Skill-Logistics-Fraud-Detection、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-In-Transit-Inventory-Tracking-Visibility

---

> 分类：业务运营/供应与履约/到货异常追踪　·　技术族：04-供应链　·　源卡：`Skill-In-Transit-Inventory-Tracking-Visibility`