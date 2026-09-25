---
id: assortment-structure-analyzer
title: 货盘结构分析（引流·利润·形象款比例）
description: 当需要基于 ERP 销售与毛利数据评估 SKU 组合中引流款/利润款/形象款占比、与品类经验区间对比并输出结构调整建议时调用；不替代选品会最终拍板。
skill_version: "0.1.0"
l2_pillar: 产品
ref_domain:
  - A
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
data_from: erp
---

## 目标

输出 **结构仪表盘**：各角色标签（引流/利润/形象/长尾）SKU 数与 **销售额/毛利贡献** 占比；标出 **失衡项**（如引流占比过高侵蚀毛利）与 **可执行动作占位**（加码/维持/收缩）。

## 前置条件

- 已有 `sku-lifecycle-classifier` 或等效 **S/A/B/C 分级** 与本期扫描时间窗。  
- ERP 可提供 **销量、净收入、毛利或贡献毛利**（缺一则用占位并标 TBD）。  
- 已约定 **角色定义规则**（按价格带、margin%、或内部标签字段）。

## 步骤

1. 将 SKU 映射到 **四象限或三角色**（规则表随附）。  
2. 按 **市场**（NA/EU）与 **渠道粗分**（亚马逊/其他线上）切片；若数据不足则全渠道合一并备注。  
3. 与 **行业参考区间**（内部基准或公开研报摘要）对比，仅作 **方向性** 提示。  
4. 输出 **Top 风险**：结构单一、季节集中度、新品未起量等。  
5. 将缺口导向 `new-sku-opportunity-scanner` 的输入字段。

## 输出格式

- 表：`Role | SKU_count | Rev_share | Margin_share | Flag`  
- **摘要**：3 条结论 + 2 条「需数据补全」。

## When NOT to use

- 单 SKU 退场 — `sku-exit-decision-tree`。  
- 补货与仓配 — 供应链 E 域。

## 相关 Skill

- 上游：`sku-lifecycle-classifier`（`next`）  
- 下游：`new-sku-opportunity-scanner`（`next`）
