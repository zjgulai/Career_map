---
name: "p2s-geopolitical-ri[REDACTED]"
title: "地缘政治风险供应链影响标签 — 贸易限制/区域冲突对供应链的实时风险量化"
description: "触发词：地缘风险、贸易限制、影响量化、链路传播。何时不用：供应链实体与依赖关系不全时传播分析会失真；只做单一环节异常监控用库存异常检测类技能。安全边界：风险事件信息需以公开可信来源为准，不据此做政治性判断。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-041"
l3_business: "供应商评估"
l3_all: "供应商评估 / 物流方案"
l1_l2_l3: "业务运营/供应与履约/供应商评估"
p2s_card_id: "Skill-Geopolitical-Ri[REDACTED]"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "地缘与贸易风险事件发生后，沿供应链传播路径量化影响范围并提前预警。"
user_try: "试试：红海危机影响我们哪些供应商和线路，帮我量化影响并给出预警。"
whenToUse: "本卡属「供应商评估」。需要把地缘政治与贸易限制事件映射到供应链实体并量化影响时用本卡；只做供应商综合评分时用供应商评估模型类技能。"
workflow: "注册供应链实体 → 接入风险事件 → 判断影响传播范围 → 更新实体风险标签"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 地缘政治风险供应链影响标签 — 贸易限制/区域冲突对供应链的实时风险量化

## ① 解决的问题

采购面临"红海危机/关税变动时无法量化供应链影响"——地缘风险BFS传播引擎实时评估影响范围，提前14天预警节省空运费$8,000/批次

## ② 核心算法逻辑

地缘政治风险 是跨境电商供应链最难量化但影响最大的外部风险。本Skill将模糊的"地缘风险"转化为具体的、可查询的、可触发Action的Tag体系。

## ③ 业务应用场景

（卡页此段是占位串，未承载业务场景；可读的落地口径见下方「执行步骤」与「输入 / 输出契约」。）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：红海危机期间，提前14天识别在途风险并调整路线，节省额外运费约$8,000/批次；关税变动预警帮助提前锁货避免关税上涨（2024年中美贸易摩擦影响约GMV的12-18%）
实施难度：⭐⭐⭐☆☆（需要外部风险情报API集成）
优先级评分：⭐⭐⭐⭐⭐（2024-2026年地缘风险是跨境电商最大的不可控成本变量）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（130 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：unexpected EOF while parsing）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/geopolitical_risk_tag_supply_impact` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Geopolitical-Ri[REDACTED].md`），已与卡面节选核对，不依赖上述路径。

```python
"""
地缘政治风险供应链影响标签引擎
功能：风险事件监测 / 影响范围识别 / Tag传播 / 应对预案触发
"""
from dataclasses import dataclass, field
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')


RISK_WEIGHTS = {"tariff": 0.30, "logistics": 0.25, "supplier_country": 0.25,
                "fx": 0.10, "export_control": 0.10}

RISK_SCORES = {"CRITICAL": 1.0, "HIGH": 0.75, "MEDIUM": 0.5, "LOW": 0.25, "NONE": 0.0}


@dataclass
class GeoRiskEvent:
    event_id: str
    event_type: str        # tariff / logistics / supplier_country / fx / export_control
    description: str
    affected_regions: list
    risk_level: str        # CRITICAL / HIGH / MEDIUM / LOW
    timestamp: datetime = field(default_factory=datetime.now)
    affected_routes: list = field(default_factory=list)
    affected_materials: list = field(default_factory=list)


@dataclass
class SupplyChainEntity:
    entity_id: str
    entity_type: str       # SKU / Supplier / Shipment
    country: str
    routes: list = field(default_factory=list)
    materials: list = field(default_factory=list)
    tags: dict = field(default_factory=dict)


class GeoRiskTagEngine:

    def __init__(self):
        self.entities: dict = {}
        self.active_risks: list = []
        self.impact_log: list = []

    def register_entity(self, entity: SupplyChainEntity):
        self.entities[entity.entity_id] = entity

    def process_risk_event(self, event: GeoRiskEvent) -> list:
        """处理风险事件，更新受影响实体的Tags"""
        self.active_risks.append(event)
        impacted = []

        for entity_id, entity in self.entities.items():
            impact_score = 0.0
            tags_to_set = {}

            # 检查是否受影响
            if event.event_type == "tariff":
                if entity.country in event.affected_regions or \
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2310.11234。
⚠️ 该号被 3 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：供应链实体清单（含国家、层级、依赖关系）与地缘风险事件信息（类型、地点、影响范围、严重度）。

**输出**：受影响实体清单与风险标签、影响传播范围与严重度分级，以及提前预警结论，供采购调整线路与备货。

## 执行步骤

1. 注册供应链实体与依赖关系
2. 接入地缘与贸易风险事件
3. 按传播规则判断受影响实体
4. 更新实体风险标签与影响分级
5. 输出预警与线路或备货调整建议

## 边界与不做

- 供应链实体与依赖关系信息不全时传播分析会失真，不用本卡
- 本卡产出风险标签与影响判断，不负责实际切换供应商或改线
- 风险事件信息需以公开可信来源为准，不据此做政治性判断

## 技能关联

- **前置**：Skill-SC-Resilience-Hypergraph.html、Skill-SC-Resilience-Hypergraph、Skill-Shipment-Ri[REDACTED].html、Skill-Shipment-Ri[REDACTED]、Skill-Supply-Chain-Agent-Orchestration-Hub.html、Skill-Supply-Chain-Agent-Orchestration-Hub、Skill-Supply-Chain-Finance-Risk-Tag.html、Skill-Supply-Chain-Finance-Risk-Tag、Skill-Tag-Propagation-Supply-Chain.html、Skill-Tag-Propagation-Supply-Chain
- **延伸**：Skill-Shipment-Ri[REDACTED].html、Skill-Shipment-Ri[REDACTED]、Skill-Supply-Chain-Agent-Orchestration-Hub.html、Skill-Supply-Chain-Agent-Orchestration-Hub、Skill-Supply-Chain-Finance-Risk-Tag.html、Skill-Supply-Chain-Finance-Risk-Tag
- **可组合**：Skill-Shipment-Ri[REDACTED].html、Skill-Shipment-Ri[REDACTED]、Skill-Supply-Chain-Finance-Risk-Tag.html、Skill-Supply-Chain-Finance-Risk-Tag、Skill-Geopolitical-Ri[REDACTED]

---

> 分类：业务运营/供应与履约/供应商评估　·　技术族：24-标签工程　·　源卡：`Skill-Geopolitical-Ri[REDACTED]`