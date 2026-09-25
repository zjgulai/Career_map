---
name: "p2s-sc-digital-twin-sync-architecture"
title: "供应链数字孪生同步架构 — 物理→数字实时镜像与仿真决策支持"
description: "触发词：数字孪生、实时镜像、停产仿真、损失区间、替代供应商。何时不用：参数化多方案对比用「供应链 What-If 情景分析引擎」；网络级中断压测与备用路由用「供应链弹性压力测试」。安全边界：孪生体仅做推演，不得直接向物理世界下发改单、改产、改路由等指令。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-010"
l3_business: "情景模拟"
l3_all: "情景模拟 / 业务工具实现"
l1_l2_l3: "经营管理/经营与组织/情景模拟"
p2s_card_id: "Skill-SC-Digital-Twin-Sync-Architecture"
p2s_src_domain: "24-标签工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "让物理供应链在数字世界实时镜像，工厂一停产就能在半小时内算出损失区间和替代方案。"
user_try: "试试：深圳代工厂突然停产，用数字孪生跑一遍传播仿真，给我 30 天 GMV 损失区间和替代供应商排序。"
whenToUse: "当已有 CDC 数据管道与图数据库、需要把物理事件实时映射成可仿真的对象图时用本技能；只做参数化方案对比，用「供应链 What-If 情景分析引擎」；做网络级中断压测，用「供应链弹性压力测试」。"
workflow: "把供应链节点、在途货物与库存批次建成对象并同步至数字孪生 → 接入停产或延误事件流触发传播仿真 → 推演未来 30 天的 GMV 损失区间（P10/P50/P90） → 给出受影响 SKU 与替代供应商可行性排序"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 供应链数字孪生同步架构 — 物理→数字实时镜像与仿真决策支持

## ① 解决的问题

供应商停产/FBA延误需要实时量化影响——数字孪生7层仿真引擎将What-if响应从3天人工协调→30分钟自动推演，防止断货GMV损失30-50万元/次

## ② 核心算法逻辑

供应链数字孪生（SCDT）是 Palantir"物理世界→数字世界"桥接的核心机制。与静态 BI 不同，SCDT 是可变更、可仿真、可写回的活体模型，实现四大能力：实时镜像（物理状态同步）、Whatif 仿真（风险传播推演）、决策支持（最优行动建议）、写回执行（触发 ERP/WMS 操作）。

## ③ 业务应用场景

场景A：关键供应商停产 What-if 仿真
某母婴品牌的深圳代工厂突发停产（设备故障/海关查验），品牌需要在30分钟内知道： - 受影响的 SKU 及当前在途货物 - 未来 30 天的 GMV 损失区间（P10/P50/P90） - 可行的替代供应商方案（按可行性排序）
数字孪生接到停产告警 → 触发供应链传播仿真 → 输出量化决策建议。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：供应商中断响应时间 3天→30分钟（↓90%），防止断货GMV损失 30-50万元/次；FBA延误提前7天预警，空运决策准确率提升 60%
实施难度：⭐⭐⭐⭐☆（需要 CDC 数据管道 + 图数据库基础设施）
优先级：⭐⭐⭐⭐⭐（Palantir 方法论的核心缺口，0覆盖）
企业AI知识库依赖：高 — 需要 Object Store 持久化 + Ontology Schema 治理 + Event Stream 基础设施

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（237 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/data_collection/sc_digital_twin_sync_architecture` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-SC-Digital-Twin-Sync-Architecture.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
from dataclasses import dataclass, field
from typing import List, Optional, Dict
from datetime import datetime, timedelta
from enum import Enum
import networkx as nx

class NodeType(Enum):
    SUPPLIER = "supplier"
    WAREHOUSE = "warehouse"
    FBA_CENTER = "fba_center"
    PORT = "port"

@dataclass
class SupplyChainNode:
    """供应链节点 —— 数字孪生 Object"""
    node_id: str
    node_type: NodeType
    name: str
    location: tuple        # (lat, lng)
    capacity: float
    lead_time_days: float
    risk_score: float = 0.0       # 派生属性：因果模型计算
    utilization_rate: float = 0.0  # 派生属性：实时更新
    status: str = "active"
    upstream_nodes: List[str] = field(default_factory=list)
    downstream_nodes: List[str] = field(default_factory=list)

@dataclass
class ShipmentObject:
    """运输批次 —— 数字孪生 Object"""
    shipment_id: str
    origin_node: str
    destination_node: str
    sku_list: List[str]
    total_units: int
    departure_time: datetime
    eta_planned: datetime
    eta_actual: Optional[datetime] = None
    delay_probability: float = 0.0   # 派生属性：ML预测
    status: str = "planned"

@dataclass
class InventoryBatchObject:
    """库存批次 —— 数字孪生 Object"""
    batch_id: str
    sku: str
    quantity: int
    cost_per_unit: float
    storage_node: str
    arrival_date: datetime
    days_in_storage: int = 0
    expiry_date: Optional[datetime] = None
    reorder_trigger: bool = False   # Action触发标志

class SCDigitalTwinSimulator:
    """
    供应链数字孪生仿真引擎
    核心：What-if情景推演 + 风险传播 + 替代方案生成
    """
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2504.03692。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：供应链对象数据（节点、在途货物、库存批次）与事件流（停产、延误告警）；卡页口径下需要对象存储持久化与本体 Schema 治理。

**输出**：受影响 SKU 与在途货物清单、未来 30 天 GMV 损失区间（P10/P50/P90）、按可行性排序的替代供应商方案；供供应链负责人快速决策。

## 执行步骤

1. 把供应链节点、在途货物与库存批次建成对象并同步至数字孪生
2. 接入停产或延误事件流触发传播仿真
3. 推演未来 30 天的 GMV 损失区间（P10/P50/P90）
4. 给出受影响 SKU 与替代供应商可行性排序

## 边界与不做

- 数据不满足：没有实时数据管道与对象或本体治理时孪生体会失真，先补基础设施。
- 何时不用：参数化多方案对比用「供应链 What-If 情景分析引擎」；网络级中断压测与备用路由用「供应链弹性压力测试」；单点库存问题不必搭孪生。
- 能力边界：只做镜像与推演，不向物理系统下发指令，也不保证对象数据实时一致（受同步延迟约束）。
- 安全边界：孪生体仅做推演，改单、改产、改路由等动作必须由业务系统与人工确认后执行。

## 技能关联

- **前置**：Skill-Black-Swan-Scenario-Simulation-Tag.html、Skill-Black-Swan-Scenario-Simulation-Tag、Skill-Inventory-Event-Sourcing-Architecture.html、Skill-Inventory-Event-Sourcing-Architecture、Skill-SC-Causal-DAG-E2E-Attribution.html、Skill-SC-Causal-DAG-E2E-Attribution、Skill-SC-WhatIf-Scenario-Analysis-Engine.html、Skill-SC-WhatIf-Scenario-Analysis-Engine、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Supply-Chain-Resilience-Modeling.html、Skill-Supply-Chain-Resilience-Modeling
- **延伸**：Skill-Black-Swan-Scenario-Simulation-Tag.html、Skill-Black-Swan-Scenario-Simulation-Tag、Skill-SC-Causal-DAG-E2E-Attribution.html、Skill-SC-Causal-DAG-E2E-Attribution、Skill-SC-WhatIf-Scenario-Analysis-Engine.html、Skill-SC-WhatIf-Scenario-Analysis-Engine、Skill-Supply-Chain-Resilience-Modeling.html、Skill-Supply-Chain-Resilience-Modeling
- **可组合**：Skill-SC-Causal-DAG-E2E-Attribution.html、Skill-SC-Causal-DAG-E2E-Attribution、Skill-Supply-Chain-Resilience-Modeling.html、Skill-Supply-Chain-Resilience-Modeling、Skill-SC-Digital-Twin-Sync-Architecture

---

> 分类：经营管理/经营与组织/情景模拟　·　技术族：24-标签工程　·　源卡：`Skill-SC-Digital-Twin-Sync-Architecture`