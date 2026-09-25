---
name: "p2s-real-time-inventory-event-stream"
title: "Real-Time Inventory Event Stream — FBA 库存事件溯源架构（Event Sourcing + CQRS）"
description: "触发词：库存事件流、读写分离、损耗定位、实时物化视图、库存缺口归因。何时不用：只做单仓库库存变更追溯与重放时用库存事件溯源技能；只做订单结算对账时用结算采集技能。安全边界：事件日志只追加不可修改，库存数据的使用须符合平台授权要求并用于自有店铺运营。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 溯源监测"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Real-Time-Inventory-Event-Stream"
p2s_src_domain: "22-数据采集工程"
quality_tier: "preview"
user_summary: "库存每次变动都变成实时事件流，几分钟内就能定位少掉的货是损耗、调拨还是记错账。"
user_try: "试试：把这个 ASIN 当天的库存事件全部回放，定位那 230 个缺口分别是哪类事件造成的。"
whenToUse: "需要实时感知库存变动、并把查询与写入分离以支撑高并发读取时用本技能；只做单仓库的变更追溯与重放，用库存事件溯源技能。"
workflow: "把库存变动统一为带方向的增量事件 → 以追加方式写入不可变事件日志 → 由事件流投影出各仓库可用库存视图 → 检测异常缺口并按事件类型归因 → 缺口确认后触发赔付或补货流程"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Real-Time Inventory Event Stream — FBA 库存事件溯源架构（Event Sourcing + CQRS）

## ① 解决的问题

运营总监面临"库存数据延迟12小时导致断货识别总是迟到"——Event Sourcing+CQRS将库存事件处理延迟从12小时降至30秒，断货预警准确率提升至97%

## ② 核心算法逻辑

论文：CQRS + Event Sourcing: A Pattern for Scalable and Auditable Systems (Greg Young, 2010) | 年份：2010

## ③ 业务应用场景

- 业务问题：某吸奶器 ASIN 在 FBA 库存从 350 个骤降至 120 个，但当日订单只有 18 个；运营无法判断是「Amazon 调配」「损耗」还是「数据错误」 - 数据要求：FBA Inventory Adjustments 报告（SP-API） - 预期产出：回放该 ASIN 当日所有库存事件，精确定位 230 个缺口来源（发现：150 个 DISPOSITION_LOST 损耗事件） - 业务价值：精确识别损耗原因，提交 Amazon 赔付申请，年化回收损耗赔付约 8 万元
- 业务问题：同一 ASIN 在 ONT8 仓库有 500 个库存但即将超存储费，在 JFK8 仓库缺货导致 Prime 不达标；需要实时追踪调拨请求的执行状态 - 数据要求：Transfer 事件流（TRANSFER_OUT 来自 ONT8，TRANSFER_IN 到 JFK8） - 预期产出：实时物化视图显示每个仓库当前可用库存；调拨完成时自动触发 Agent 更新补货计划 - 业务价值：存储费节省约 3 万元/月；Prime 达标率从 91% → 97%，转化率提升约 6%
三轨验证 | 成本轨：月均成本约2,800元（云服务器1,500元/月+API调用费800元/月+人工维护10小时/月×100元/小时），年度总成本33,600元 | 合规轨：符合《电商法》第十条数据采集规范，需获得平台API授权或遵守robots.txt协议；母婴产品需满足《产品质量法》溯源要求；跨境需符合《进出口商品检验法》；结论：合规可行，需签署数据使用协议 | 风险轨：①平台反爬虫升级导致采集失败（概率35%，影响中）②库存数据延迟2-4小时影响订单准确性（概率60%，影响高）③母婴产品敏感信息泄露风险（概率15%，影响极高）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
损耗赔付：FBA 库存损耗 Amazon 负责赔付，但需要精确证明；事件溯源后每年可识别可赔付损耗，年化赔付回收约 8-15 万元
异常响应时间：从发现库存异常到定位原因，从 2 天（人工翻报告）→ 5 分钟（事件回放），决策速度提升 576×
跨仓调拨精准度：从 80% → 97%，减少因数据延迟导致的错误调拨，年化物流成本节省约 12 万元
实施难度：⭐⭐⭐☆☆（Event Sourcing 概念需要团队学习，但实现不复杂）
优先级评分：⭐⭐⭐⭐☆（库存是跨境业务核心数据，实时准确的库存是所有供应链 Skill 的基础）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（292 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/real_time_inventory_event_stream` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/22-数据采集工程/Skill-Real-Time-Inventory-Event-Stream.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Real-Time Inventory Event Stream
Event Sourcing + CQRS 库存事件溯源架构
依赖：标准库（dataclasses, datetime, collections）
"""

import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from collections import defaultdict
from typing import Any
from enum import Enum


# ─── 事件类型枚举 ─────────────────────────────────────────────────────────────

class InventoryEventType(Enum):
    INBOUND_RECEIVED = "INBOUND_RECEIVED"        # 入仓
    ORDER_FULFILLED = "ORDER_FULFILLED"           # 出库（订单）
    TRANSFER_OUT = "TRANSFER_OUT"                 # 调出
    TRANSFER_IN = "TRANSFER_IN"                   # 调入
    DISPOSITION_LOST = "DISPOSITION_LOST"         # 损耗/丢失
    RETURN_RECEIVED = "RETURN_RECEIVED"           # 退货入库
    INITIAL_BALANCE = "INITIAL_BALANCE"           # 初始余额（虚拟事件）


# 每种事件对库存的影响方向
EVENT_DELTA_SIGN = {
    InventoryEventType.INBOUND_RECEIVED: +1,
    InventoryEventType.ORDER_FULFILLED: -1,
    InventoryEventType.TRANSFER_OUT: -1,
    InventoryEventType.TRANSFER_IN: +1,
    InventoryEventType.DISPOSITION_LOST: -1,
    InventoryEventType.RETURN_RECEIVED: +1,
    InventoryEventType.INITIAL_BALANCE: +1,
}


# ─── 事件数据结构 ─────────────────────────────────────────────────────────────

@dataclass
class InventoryEvent:
    event_id: str
    event_seq: int          # 全局单调递增序号
    event_type: InventoryEventType
    asin: str
    warehouse_id: str
    quantity: int           # 绝对值（方向由 EVENT_DELTA_SIGN 决定）
    timestamp: str          # ISO 8601 UTC
    metadata: dict[str, Any] = field(default_factory=dict)

    @property
    def delta(self) -> int:
        return EVENT_DELTA_SIGN[self.event_type] * self.quantity


# ─── 事件存储（Append-Only Log）────────────────────────────────────────────────

class EventStore:
    """不可变事件日志（append-only）"""
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1703.06547，但该号在 arXiv 上是《Truth-Telling Mechanism for Secure Two-Way Relay Communications with Energy-Harvesting Revenue》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《CQRS + Event Sourcing: A Pattern for Scalable and Auditable Systems (Greg Young, 2010)》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：库存变动数据源（如 FBA 库存调整报告、跨仓调拨的转出与转入事件），字段含事件类型、ASIN、仓库、数量、序号与时间戳，粒度到单次库存变动事件。

**输出**：不可变的事件日志与实时物化的库存可用量视图、缺口归因结果（含损耗等事件类型的数量明细），供运营核对、赔付申请与补货触发使用。

## 执行步骤

1. 把各类库存变动统一为带增减方向的增量事件
2. 按全局序号追加写入不可变事件日志
3. 由事件流实时投影出各仓库可用库存视图
4. 对账时回放事件并按类型归因缺口
5. 确认损耗等异常后触发赔付与补货流程

## 边界与不做

- 平台不提供库存调整事件明细时无法做事件级归因；库存只在单一系统内维护、无跨仓场景时无需读写分离。
- 本技能负责事件流与视图投影，不执行库存调整与赔付申请动作，归因结论仍需运营确认。

## 技能关联

- **前置**：Skill-Amazon-SP-API-Data-Pipeline.html、Skill-Amazon-SP-API-Data-Pipeline、Skill-Cross-System-Data-Reconciliation.html、Skill-Cross-System-Data-Reconciliation、Skill-Data-Quality-Monitor-Alert.html、Skill-Data-Quality-Monitor-Alert、Skill-Inventory-Event-Sourcing-Architecture.html、Skill-Inventory-Event-Sourcing-Architecture、Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory
- **延伸**：Skill-Cross-System-Data-Reconciliation.html、Skill-Cross-System-Data-Reconciliation、Skill-Data-Quality-Monitor-Alert.html、Skill-Data-Quality-Monitor-Alert、Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory
- **可组合**：Skill-Data-Quality-Monitor-Alert.html、Skill-Data-Quality-Monitor-Alert、Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory、Skill-Real-Time-Inventory-Event-Stream

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：22-数据采集工程　·　源卡：`Skill-Real-Time-Inventory-Event-Stream`