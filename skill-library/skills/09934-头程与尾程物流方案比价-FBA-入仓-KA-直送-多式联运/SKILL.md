---
id: logistics-route-optimizer
title: 头程与尾程物流方案比价（FBA 入仓 / KA 直送 / 多式联运）
description: 当已有补货量与仓配约束、需比较海运/空运/铁路/卡派等路径的时效、成本与风险时调用；输出供决策报告与 PO 附件。
skill_version: "0.1.0"
l2_pillar: 供应链
ref_domain:
  - E
risk_tier: P1_standard
execution_boundary: hybrid
market_profile: both
supply_focus: logistics
---

## 目标

为每批次给出 **2～3 套可选方案**（主推荐 + 备选），含 **含税/费口径**、**ETA 区间**、**风险标签**。

## 前置条件

- `fba-capacity-planner` 或等价批次表；或明确 **KA 直送** 需求。  
- **货好日期**、**起运港/集货地**、**目的港/FC**；北美与欧洲 **关税/VAT 责任** 边界声明。

## 步骤

1. 枚举可行 **运输方式** 与 **承运人类型**（整柜/LCL/空运）。  
2. 对每方案估算：**运费+燃油+清关+港杂+内陆**（用费率表或历史均价，缺则区间）。  
3. **ETA** 用行业区间 + 缓冲；标 **旺季** 延迟风险。  
4. **KA 直送** 与 **FBA 入仓** 分场景，不混算为一条。  
5. 输出 **推荐方案** 及 **选择理由**（成本/时效/风险权衡）。

## 输出格式

- 表：`batch_id | option | mode | est_cost_range | ETA | risk | recommended`  
- **附件清单**：PO/Booking 所需字段列表。

## When NOT to use

- 仅询价未定量 — 先补 `demand-forecast-engine` 输出。  
- 需要承运人合同价 — `execution_boundary: external` 货代确认。

## 相关 Skill

- 上游：`fba-capacity-planner`（`next`）  
- 下游：`replenishment-decision-report`（`next`）
