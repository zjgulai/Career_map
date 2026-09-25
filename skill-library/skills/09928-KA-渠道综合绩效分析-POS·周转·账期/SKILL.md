---
id: ka-performance-analyzer
title: KA 渠道综合绩效分析（POS·周转·账期）
description: 当需要从 KA 视角汇总 POS 动销、货架效率、库存周转与应收账期健康度，形成可执行改进清单并触发跨域动作时调用；不替代单店动销归因或会计核销。
skill_version: "0.1.0"
l2_pillar: 战略
ref_domain:
  - H
  - C
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
channel_type: offline_ka
data_from: erp
---

## 目标

输出 KA 客户/区域级绩效雷达：销售达成、周转效率、陈列执行、回款健康，并给出优先级动作用于跨域编排。

## 前置条件

- 已有 KA POS 或 sell-in/sell-out 口径说明。  
- 可用账期数据（应收余额、逾期分布）用于健康度评分。  
- 至少有一个完整对比周期（建议 4 周以上）。

## 步骤

1. 汇总 KA KPI：sell-through、weeks on hand、缺货率、退货率、应收逾期占比。  
2. 客户/区域分层：健康、观察、预警、危险。  
3. 识别主因：陈列执行、补货节奏、价盘冲突、账期压力。  
4. 生成动作包：渠道（陈列/促销）、供应链（补货/配额）、战略（条款/资源）分工。  
5. 将可执行动作输出到 `cross-domain-trigger-hub`，由中枢路由到下游 Skill。

## 输出格式

- 表：`KA_account | region | KPI_score | cash_score | risk_level | top_issue | next_action`  
- 摘要：`本期红灯账户 | 关键动作 | 负责人`

## When NOT to use

- 仅分析单 SKU 门店动销细节：用 `ka-sell-through-analyzer`。  
- 仅做应收账龄追踪：用 `ka-ar-tracker`。

## 相关 Skill

- 输入参考：`ka-sell-through-analyzer`、`ka-ar-tracker`  
- 下游：`cross-domain-trigger-hub`（`triggers`）  
- 复盘：`strategic-review-generator`
