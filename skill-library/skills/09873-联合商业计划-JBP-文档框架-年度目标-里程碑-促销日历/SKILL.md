---
id: ka-jbp-generator
title: 联合商业计划 JBP 文档框架（年度目标/里程碑/促销日历）
description: 当需与 KA 签署或更新年度 JBP、且财务与动销结论已对齐时调用；输出章节结构与可填表，与 ka-financial-model 数字一致。
skill_version: "0.1.0"
l2_pillar: 渠道
ref_domain:
  - C
risk_tier: P1_standard
execution_boundary: hybrid
market_profile: both
channel_type: offline_ka
---

## 目标

生成 **JBP 标准结构**：双方目标、品类角色、销售额与毛利目标、季度里程碑、**促销与媒体日历**、执行与复盘节奏、**KPI 与奖惩机制占位**。

## 前置条件

- `ka-financial-model` 中 **销量与毛利假设** 已冻结一版。  
- 零售商 JBP **模板或往年** 文档（若有）。  
- **组织内角色**：采购、品类、运营、财务联系人。

## 步骤

1. **对齐数字**：JBP 表内 GMV/毛利 与财务模型 **同一口径**。  
2. **季度节奏**：新品上架、大促、陈列重置。  
3. **资源交换**：货架、EDLP、广告位、培训 — 列 **给/取** 清单。  
4. **风险与依赖**：供应、合规、竞品。  
5. **复盘机制**：月度/季度会议 agenda 占位。

## 输出格式

- Word/Markdown 大纲 + **表格模板**（含公式说明）。  
- **版本号**：`JBP_v0.1_YYYYMMDD`。

## When NOT to use

- 仅意向书级别 — 用简化 LOI Skill（待建）。  
- 财务数字未对齐 — 禁止对外版本号。

## 相关 Skill

- 上游：`ka-financial-model`（`next`）  
- 执行跟踪：`ka-ar-tracker`（回款与账期）
