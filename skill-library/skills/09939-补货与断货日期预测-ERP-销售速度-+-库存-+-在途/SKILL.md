---
id: replenishment-predictor
title: 补货与断货日期预测（ERP 销售速度 + 库存 + 在途）
description: 当需要按 SKU/站点计算可售天数、预计断货日与预警等级（如 30 天内断货）以驱动需求预测与补货链时调用。
skill_version: "0.1.0"
l2_pillar: 供应链
ref_domain:
  - E
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
data_from: erp
supply_focus: planning
---

## 目标

输出 **每个 SKU×市场** 的 **预计断货日期**、**可售天数**、**预警级别**，作为 `demand-forecast-engine` 的输入。

## 前置条件

- ERP 或合并表含：`sku`、**可售库存**、**在途量**、**近 7/30 天销量或日均**、**站点/渠道**。  
- 缺货在途拆分、不可售库存（冻结）需单独列或规则说明。

## 步骤

1. 计算 **日均消耗**（选加权或截尾均值，口径写在输出头）。  
2. **可售天数** = 可售库存 / 日均（无销量用「观察期」标黄）。  
3. **预计断货日** = 今天 + 可售天数（扣减在途到货日前的缺口若可建模）。  
4. **预警**：如 `>60` 天充足、`30～60` 关注、`<30` 进入下游预测链。  
5. 输出与 **促销日历** 的占位接口（日期、SKU 范围），供 `demand-forecast-engine` 叠加。

## 输出格式

- 表：`sku | market | sellable_qty | inbound | daily_rate | days_cover | est_stockout_date | alert`  
- **摘要**：30 天内断货 SKU 数量与 GMV 占比（若提供价格）。

## When NOT to use

- 新品无历史销量 — 用手工假设日均或暂不预测。  
- 仅看绝对库存不看渠道 — 先统一 **可售** 定义。

## 相关 Skill

- 下游：`demand-forecast-engine`（`next`）  
- 上游触发：`anomaly-detector`（库存类异常，`triggers`）
