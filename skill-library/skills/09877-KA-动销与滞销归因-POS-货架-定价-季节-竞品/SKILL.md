---
id: ka-sell-through-analyzer
title: KA 动销与滞销归因（POS/货架/定价/季节/竞品）
description: 当需要解读 KA 门店 POS 或零售商报表、识别动销慢的原因并给出可执行改善建议时调用；输出供补货、陈列与谈判使用。
skill_version: "0.1.0"
l2_pillar: 渠道
ref_domain:
  - C
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
channel_type: offline_ka
data_from: erp
---

## 目标

按 **SKU×门店/区域** 输出 **动销率、周转天数、与品类对比**，并给出 **Top 归因假设**（陈列/定价/库存可得性/季节/竞品促销）。

## 前置条件

- 零售商提供 **POS/库存** 或 **我方 sell-in + 对方估算 sell-out**；口径在任务头声明。  
- **日历**：节假日、促销周、当地竞品大促（若知）。

## 步骤

1. 清洗数据：处理退货、缺货天数、断货周。  
2. 计算 **sell-through**、**库存周转**，与 **目标** 或 **上年同期** 对比。  
3. **分层**：健康 / 观察 / 预警 / 危险。  
4. **归因**：对每个预警 SKU 列 2～3 条假设与 **验证动作**（暗访、改价、补陈列照）。  
5. 与 **线上同 SKU** 对比（若有），识别 **渠道冲突**。

## 输出格式

- 表：`sku | region | sell_through | weeks_on_hand | vs_ly | tier | top_cause | action`  
- **会议用 5 行摘要**。

## When NOT to use

- 仅有总量无 SKU 粒度 — 只能做方向性结论并标数据债。  
- 新店铺货期不足 4 周 — 标「培育期」不判死刑。

## 相关 Skill

- 下游：`ka-replenishment-planner`（`next`）、`ka-planogram-checker`（陈列问题时 `triggers`）；`ka-vs-online-assortment-planner`（渠道货盘协同时 `triggers`）
