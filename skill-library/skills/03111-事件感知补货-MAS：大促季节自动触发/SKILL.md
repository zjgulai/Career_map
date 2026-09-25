---
name: "p2s-event-driven-demand-mas"
title: "Event-Driven Demand MAS — 事件感知补货 MAS：大促/季节自动触发"
description: "触发词：事件驱动补货、大促备货触发、需求事件、多Agent并行响应、紧急补货。何时不用：按日常节奏算补货量时用「自动补货决策」；需要跨仓调拨库存时走「调拨清货建议」。安全边界：事件阈值（安全库存线、影响百分比）须业务标定，向供应商锁产能锁价的对外动作须人工确认。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟 / 供需协调"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
p2s_card_id: "Skill-Event-Driven-Demand-MAS"
p2s_src_domain: "10-MAS"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把大促、季节和突发断货变成自动触发器，提前几十天让采购和仓储同时动起来。"
user_try: "试试：618 前 60 天按历史放大倍数生成备货事件，分派给采购和仓储给出备货计划。"
whenToUse: "存在可预知的大促或季节事件、突发断货，需要提前触发多方并行响应时用；稳态补货用「自动补货决策」即可。"
workflow: "产出需求事件（类型、影响幅度、剩余天数） → 计算事件紧迫度并按类型分流 → 推送给供应、仓储、采购 Agent 并行响应 → 汇总各方响应与备货计划并标出待人工确认项"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Event-Driven Demand MAS — 事件感知补货 MAS：大促/季节自动触发

## ① 解决的问题

供应链经理面临促销需求突发波动——Event-Driven Demand MAS将缺货率6%降到2%，年化增收22万元

## ② 核心算法逻辑

事件驱动架构（EDA）在 Agent 系统中的应用

## ③ 业务应用场景

业务背景：每年618是母婴品类最大销售节点，历史数据显示618当周需求激增 3-5 倍。如果等到促销期才意识到缺货，物流提前期（lead time）约 30-45 天，已经来不及。
事件驱动流程： 1. T-60天：`EventCast` 预测模型产出618需求预测，生成 `DemandEvent(event_type="预知型", expected_impact_pct=3.5, lead_days=60)` 2. EventBus 路由：事件推送给 `SupplyChainAgent`、`WarehouseAgent`、`ProcurementAgent` 3. Agent 并行响应： - `SupplyChainAgent`：生成分 SKU 备货计划 - `ProcurementAgent`：向供应商发出预订请求（锁定产能和价格） - `WarehouseAgent
业务价值：历史上因备货不足导致的618断货率从 18% 降至 3%；提前锁单节省采购成本约 8%（规模效应）。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

易处：EventBus 发布订阅模式是成熟模式；纯 Python 实现，无外部依赖
难处：事件阈值参数（安全库存线、impact_pct 阈值）需要业务标定；生产部署需要消息队列（Kafka/RabbitMQ）替代本地 EventBus
前提：需要库存实时监控数据源；需要 EventCast 提供大促需求预测

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（335 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/mas/event_driven_demand_mas` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-Event-Driven-Demand-MAS.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Event-Driven Demand MAS — 事件感知补货多 Agent 系统
大促/季节/断货事件自动触发 Agent 工作流

纯 Python 标准库，无外部依赖
Python 3.14 兼容
"""
from __future__ import annotations

import time
from collections import defaultdict
from dataclasses import dataclass, field
from enum import Enum
from typing import Callable


# ─── 事件类型 & 数据结构 ──────────────────────────────────────────────────────

class EventType(Enum):
    PLANNED    = "预知型"   # 大促/节假日
    PERIODIC   = "周期型"   # 月末/季节
    EMERGENCY  = "突发型"   # 断货/爆款
    DERIVATIVE = "衍生型"   # 促销连锁


class EventSeverity(Enum):
    LOW    = "low"
    MEDIUM = "medium"
    HIGH   = "high"
    CRITICAL = "critical"


@dataclass
class DemandEvent:
    """需求驱动事件"""
    event_id: str
    event_type: EventType
    trigger_condition: str            # 触发条件描述
    expected_impact_pct: float        # 预期需求变化百分比（如 3.5 = 350%）
    lead_days: int                    # 距离事件剩余天数
    severity: EventSeverity = EventSeverity.MEDIUM
    affected_skus: list[str] = field(default_factory=list)
    metadata: dict[str, float] = field(default_factory=dict)

    @property
    def urgency_score(self) -> float:
        """urgency = impact × (1/lead_days)^0.5 × severity_weight"""
        severity_w = {"low": 0.5, "medium": 1.0, "high": 2.0, "critical": 4.0}
        w = severity_w.get(self.severity.value, 1.0)
        time_factor = 1.0 / max(self.lead_days, 1) ** 0.5
        return round(self.expected_impact_pct * time_factor * w, 3)


@dataclass
class AgentResponse:
    """Agent 响应结果"""
    agent_name: str
    event_id: str
    action_taken: str
    success: bool
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：需求事件定义：事件编号、类型（预知型/周期型/突发型/衍生型）、触发条件、预期需求变化百分比、距事件剩余天数、严重度与受影响 SKU 列表，另需库存实时监控数据源。

**输出**：各 Agent 的响应记录（动作、是否成功）与分 SKU 备货计划、预订请求，供人工确认后执行；生产环境以消息队列替代本地事件总线。

## 执行步骤

1. 产出大促或季节事件并给出影响幅度与剩余天数
2. 按紧迫度评分给事件分级并路由
3. 驱动供应、采购、仓储三方并行生成响应动作
4. 汇总备货计划与预订请求
5. 标出需要人工确认的对外动作

## 边界与不做

- 数据不满足时不适用：没有库存实时监控数据源、或拿不到事件期的需求预测输入时，事件无法触发。
- 能力边界：只产出事件、路由与响应建议，消息队列、下单锁产能等动作由模型外的系统执行；阈值参数需业务标定后才可用。

## 技能关联

- **前置**：Skill-Dynamic-DAG-Orchestration.html、Skill-Dynamic-DAG-Orchestration、Skill-EventCast-LLM-Event-Forecasting.html、Skill-EventCast-LLM-Event-Forecasting、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS
- **延伸**：Skill-Agent-Registry-Discovery.html、Skill-Agent-Registry-Discovery、Skill-Agent-SLO-Manager.html、Skill-Agent-SLO-Manager
- **可组合**：Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-Promotion-Demand-Decomposition.html、Skill-Promotion-Demand-Decomposition、Skill-Event-Driven-Demand-MAS

---

> 分类：业务运营/供应与履约/补货模拟　·　技术族：10-MAS　·　源卡：`Skill-Event-Driven-Demand-MAS`