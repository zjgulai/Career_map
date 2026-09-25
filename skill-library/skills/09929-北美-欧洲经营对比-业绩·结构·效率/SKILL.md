---
id: north-america-europe-comparison
title: 北美 / 欧洲经营对比（业绩·结构·效率）
description: 当需要按同一时间窗对比 NA 与 EU 的营收、毛利、广告效率、库存效率与退货结构，并提炼可迁移策略时调用；用于战略复盘输入，不替代财务关账。
skill_version: "0.1.0"
l2_pillar: 战略
ref_domain:
  - H
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
data_from: erp
---

## 目标

输出一份可直接进入复盘会的 NA/EU 对照稿：哪里差异显著、差异可能由什么驱动、下周期该优先试什么动作。

## 前置条件

- 同口径指标已准备：销售、毛利、广告花费、库存周转、退货率等，且币种换算规则已声明。  
- 时间窗一致（周/月/季其一），并明确是否含大促周。

## 步骤

1. 统一口径与币种：先做可比，再做结论。  
2. 指标分层对比：规模（GMV/订单）、效率（CAC/ACOS/转化）、健康（周转/退货）。  
3. 提取差异驱动：价格带、渠道结构、内容策略、履约时效等。  
4. 形成迁移建议：NA 可借鉴 EU 的动作，或 EU 可借鉴 NA 的动作。  
5. 标注数据债：缺失字段、延迟口径、异常值处理。

## 输出格式

- 表：`Metric | NA | EU | Delta | Possible_driver | Suggested_action`  
- 摘要：`Top 3 差异 | Top 3 动作 | 风险与假设`

## When NOT to use

- 仅单市场单渠道复盘，不需要跨市场结论。  
- 指标口径未统一，易得出误导性对比。

## 相关 Skill

- 下游：`strategic-review-generator`（`next`）  
- 并列输入：`anomaly-detector`、`pricing-strategy-advisor`
