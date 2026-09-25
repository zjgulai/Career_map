---
id: supplier-performance-tracker
title: 供应商绩效跟踪（交期/质量/价格）
description: 当需要按供应商维度滚动评分、识别高风险供应商并反哺补货与寻源决策时调用；通常月更，可与 PO 到货数据联动。
skill_version: "0.1.0"
l2_pillar: 供应链
ref_domain:
  - E
risk_tier: P2_nice
execution_boundary: internal
market_profile: both
data_from: erp
supply_focus: scheduling
---

## 目标

输出 **供应商评分卡**（交期达成率、来料不良、价格竞争力、响应速度）与 **行动建议**（加订单/减份额/审计）。

## 前置条件

- 历史 **PO、到货、质检、退货** 记录（可从 ERP 导出）。  
- 评分权重 **显式声明**（可配置）。

## 步骤

1. 对齐 **供应商 ID** 与工厂/贸易商层级。  
2. 计算各维度 **滚动 3/6 个月指标**。  
3. **综合分** 与 **红绿灯**；红区必须 **缓解计划**（备选供应商、加验货）。  
4. 与 `purchase-order-generator` 新单 **联动**：红区供应商提高审批级别。  
5. 输出 **会议用一页纸**。

## 输出格式

- 表：`supplier_id | on_time_rate | defect_ppm | price_index | score | tier | action`  
- **Top risks**：3 条。

## When NOT to use

- 仅单一订单争议 — 走工单与质量 8D，不全量评分。  
- 数据严重缺失 — 只做定性列表并标数据债。

## 相关 Skill

- 消费方：`demand-forecast-engine`（寻源约束）、`purchase-order-generator`  
- 战略侧：大额切换供应商需 **战略（含财务）** 背书
