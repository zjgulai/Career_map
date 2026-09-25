---
id: multi-warehouse-allocation
title: 多仓分配优化器（FBA/海外仓/渠道仓）
description: 当多仓库存不均衡或跨区履约成本上升时，输出库存分配与调拨建议。
skill_version: "0.1.0"
l2_pillar: 供应链
ref_domain:
  - E
  - B
risk_tier: P1_standard
execution_boundary: internal
data_from: erp
---

## 目标

在服务水平和履约成本之间找到可执行平衡方案。

## 前置条件

- 多仓库存快照
- 区域需求与时效要求
- 物流成本参数

## 步骤

1. 评估仓间供需差异
2. 计算调拨与履约成本
3. 生成多仓分配方案
4. 输出服务水平影响与风险

## 输出格式

表：`仓库 | SKU | 当前库存 | 建议分配 | 调拨量 | 成本影响 | 风险`

## When NOT to use

- 仓库库存数据延迟严重时

## 相关 Skill

- 上游：`fba-capacity-planner`（`next`）
- 下游：`inventory-sync-validator`（`next`）
