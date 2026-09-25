---
id: ka-planogram-checker
title: KA 货架陈列规范检查清单（Planogram 对齐）
description: 当需要按零售商 planogram 或品类协议、检查门店实拍/巡检表是否满足陈列面位、价签、认证贴标与竞品对比时调用；输出整改清单与照片要求。
skill_version: "0.1.0"
l2_pillar: 渠道
ref_domain:
  - C
risk_tier: P2_nice
execution_boundary: internal
market_profile: both
channel_type: offline_ka
---

## 目标

生成 **可勾选的检查表** + **每店整改项**：**面位编号**、**高度层**、**邻柜品类**、**价签与促销信息**、**安全认证展示**（母婴类敏感）。

## 前置条件

- 零售商提供 **最新 planogram** PDF 或 **文字规范**（面数、货架类型）。  
- 现场照片或巡检表（按门店/区域）。

## 步骤

1. 将规范拆成 **可客观判定** 的条目（避免主观「美观」）。  
2. 对照照片：逐条 **Pass/Fail/无法判断**。  
3. **Fail** 项给 **整改动作**（补价签、换层板、补认证贴纸）。  
4. 与 **动销** 联动：若陈列位置与协议不符，标 **可能归因**。  
5. 输出 **巡店报告** 供渠道经理跟进。

## 输出格式

- `store_id | sku | check_item | result | evidence_photo | fix_by_date`  
- **汇总**：合格率、Top 3 问题类型。

## When NOT to use

- 无最新 planogram — 仅输出「待确认项」不判 Fail。  
- 纯线上渠道 — 不适用本 Skill。

## 相关 Skill

- 关联：`ka-sell-through-analyzer`（`triggers` 当陈列为疑似原因）
