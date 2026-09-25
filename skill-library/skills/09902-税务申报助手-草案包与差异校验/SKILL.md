---
id: tax-filing-assistant
title: 税务申报助手（草案包与差异校验）
description: 在税务申报窗口期，生成分国家申报草案包、差异日志和失败重提清单。
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

输出可复核的税务申报草案包，降低漏报/错报风险。

## 前置条件

- 已完成税务合规差距核查
- 已有国家聚合应税数据与抵扣信息

## 步骤

1. 按国家生成应税基础数据
2. 计算申报草案并做一致性校验
3. 标注异常差异与复核点
4. 生成失败重提清单

## 输出格式

表：`市场 | 申报期 | 草案税额 | 差异项 | 复核状态 | 备注`

## When NOT to use

- 缺失交易基础数据时

## 相关 Skill

- 上游：`tax-compliance-advisor`（`next`）
- 下游：`strategic-review-generator`（`triggers`，异常时）
