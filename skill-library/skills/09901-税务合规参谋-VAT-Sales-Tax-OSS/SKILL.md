---
id: tax-compliance-advisor
title: 税务合规参谋（VAT/Sales Tax/OSS）
description: 当进入新市场或税制发生变化时，基于交易与税率规则输出税务合规差距清单、截止风险与整改建议。
skill_version: "0.1.0"
l2_pillar: 财务
ref_domain:
  - H
  - F
risk_tier: P0_gate
execution_boundary: hybrid
data_from: erp
---

## 目标

在北美/欧洲/东南亚市场下，形成可执行的税务合规检查清单和风险分级。

## 前置条件

- 国家维度交易流水与发票摘要
- 税率规则与平台代扣规则版本
- 历史申报记录（如有）

## 步骤

1. 对齐目标市场税务规则与阈值
2. 比对交易与申报口径差异
3. 识别高风险截止日和缺口项
4. 输出整改动作与责任人建议

## 输出格式

表：`市场 | 税种 | 当前状态 | 缺口 | 截止日 | 风险等级 | 处理建议`

## When NOT to use

- 法律争议定责场景（需税务顾问/法务）

## 相关 Skill

- 上游：`pricing-strategy-advisor`（`next`）
- 下游：`tax-filing-assistant`（`next`）
