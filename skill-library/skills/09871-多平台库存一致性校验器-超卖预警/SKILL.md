---
id: inventory-sync-validator
title: 多平台库存一致性校验器（超卖预警）
description: 当多平台库存出现差异或超卖风险时，输出差异定位结果与修正动作建议。
skill_version: "0.1.0"
l2_pillar: 渠道
ref_domain:
  - B
  - E
risk_tier: P1_standard
execution_boundary: internal
data_from: erp
---

## 目标

降低超卖与缺货导致的履约与客服风险。

## 前置条件

- Amazon/TikTok/Shopify 库存快照
- ERP 库存与锁库规则

## 步骤

1. 对齐多平台与 ERP 库存口径
2. 识别库存差异与异常 SKU
3. 评估超卖/断货风险等级
4. 输出修正顺序与执行建议

## 输出格式

表：`SKU | 平台库存 | ERP库存 | 差异值 | 风险等级 | 修正建议`

## When NOT to use

- 库存数据未完成同步时

## 相关 Skill

- 上游：`multi-warehouse-allocation`（`next`）
- 下游：`platform-formatter`（`triggers`）
