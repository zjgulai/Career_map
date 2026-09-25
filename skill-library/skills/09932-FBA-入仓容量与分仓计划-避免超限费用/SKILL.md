---
id: fba-capacity-planner
title: FBA 入仓容量与分仓计划（避免超限费用）
description: 当建议补货量与物流方案需要适配 FBA 容量限制、分仓入库与入库配置费时调用；北美/欧洲规则分轨。
skill_version: "0.1.0"
l2_pillar: 供应链
ref_domain:
  - E
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
data_from: erp
supply_focus: warehouse
---

## 目标

将 **建议补货量** 分解为 **可执行的入仓批次/仓点建议**，并标 **风险**（容量、低库存费、移除风险）。

## 前置条件

- `demand-forecast-engine` 或等价建议量。  
- 当前 **FBA 仓容/限制** 快照（手动粘贴或 API）；无则输出「需运营拉取」占位。

## 步骤

1. 按站点（NA/EU）应用 **容量与尺寸分段** 规则（阈值写在输出头）。  
2. 将总建议量拆为 **批次**（考虑集装箱/托盘/快递上限等业务约束）。  
3. 标注 **入库配置费/低量费** 敏感 SKU（若数据可得）。  
4. 与 **KA 直送** 路径互斥时标 CONFLICT，交 `logistics-route-optimizer`。  
5. 输出 **不可行项**（超容）与 **需减单/改期** 建议。

## 输出格式

- 表：`batch_id | qty | dest_fc | ship_window | capacity_risk | notes`  
- **摘要**：总可入 vs 建议量差异。

## When NOT to use

- 纯海外仓或自发货模式 — 改模板为「海外仓水位」Skill（待建）。  
- 无仓容数据 — 仅做数量拆分不承诺可入。

## 相关 Skill

- 上游：`demand-forecast-engine`（`next`）  
- 下游：`logistics-route-optimizer`（`next`）
