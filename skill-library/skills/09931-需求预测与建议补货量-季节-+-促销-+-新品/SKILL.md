---
id: demand-forecast-engine
title: 需求预测与建议补货量（季节 + 促销 + 新品）
description: 当 replenishment-predictor 判定存在断货风险或需滚动补货量时，结合季节因子、促销计划、新品爬坡生成建议采购/调拨量区间。
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

输出 **建议补货量区间**（min/max）与 **时间窗**，并显式列出 **假设**；**不**自动下单。

## 前置条件

- `replenishment-predictor` 输出或等价预警列表。  
- 可选输入：**促销计划表**、**季节指数**、**新品爬坡曲线**（无则标为 1.0）。

## 步骤

1. 对预警 SKU 做 **基线需求**（来自历史 + 趋势）。  
2. 叠乘 **季节因子**、**促销 uplift**（需区间与置信度）。  
3. **新品**：用上架周数与类比 SKU 曲线估算。  
4. 结合 **目标库存天数策略**（如覆盖 45 天）计算 **建议量**。  
5. 与 **战略（含财务）** 约束对齐：最小订单金额、现金流（在报告中列「需战略确认」项）。

## 输出格式

- 表：`sku | market | suggested_qty_min | suggested_qty_max | arrival_window | assumptions | finance_flag`  
- **敏感性**：促销误差 ±x% 对库存的影响一行。

## When NOT to use

- 供应商长期停供 — 走寻源与 `supplier-performance-tracker`，不单靠预测。  
- 无 MOQ/倍数约束数据 — 输出前声明需采购侧补全。

## 相关 Skill

- 上游：`replenishment-predictor`（`next`）  
- 下游：`fba-capacity-planner`（`next`）
