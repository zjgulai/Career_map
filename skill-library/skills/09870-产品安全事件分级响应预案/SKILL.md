---
id: crisis-response-planner
title: 产品安全事件分级响应预案
description: 当发生或预判产品安全事件（平台下架、海关扣押、主动召回）需要输出分级响应步骤、对内 RACI 与对外沟通占位稿时调用；不替代法务定稿与监管报送。
skill_version: "0.1.0"
l2_pillar: 渠道
ref_domain:
  - F
risk_tier: P0_gate
execution_boundary: hybrid
market_profile: both
---

## 目标

按 **三级场景** 生成可执行预案：**L1 平台下架/链接冻结**、**L2 海关或口岸滞留**、**L3 主动召回或监管指令**；每级含时间线、证据包、渠道动作与升级阈值。

## 前置条件

- 已知 **事件类型**（安全投诉升级、抽检不合格、批量退货异常等）与 **涉及 SKU/批次**。  
- 已能联系 **质量/法务/客服负责人**（角色名即可）。  
- 若来自客服安全通道，应已有 `safety-flag-detector` 的 **ESCALATE** 上下文。

## 步骤

1. **定级**：按影响面（市场数、在途库存、是否伤人）映射到 L1–L3。  
2. **对内**：RACI、24/72h 里程碑、数据需求（ERP 批次、在途单证）。  
3. **对外**：消费者/平台/KA/监管沟通 **占位模板**（无结论性法律陈述）。  
4. **库存与物流**：隔离、停发、转运决策占位（与供应链域人工协同）。  
5. **闭环**：将关键节点写入 `compliance-calendar`（复审、再上架条件）。

## 输出格式

- `CrisisPlan_v0`：`Level | Timeline | Actions | Owner | Evidence | Comms_draft_ref`  
- **升级条件**：何时从 L1 升到 L2/L3（量化阈值占位）。

## When NOT to use

- 一般退换货 — `return-decision-tree`。  
- 非安全类差评 — `review-response-writer`。

## 相关 Skill

- 可由：`safety-flag-detector`（`triggers`，严重安全升级）  
- 下游：`compliance-calendar`（`triggers`）
