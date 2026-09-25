---
id: attribution-analyzer
title: 货盘归因分析（流量/转化/客单/竞争）
description: 当 SKU 处于 B 级预警或生命周期衰退/成熟停滞、需要拆解是流量、转化、客单价还是竞争导致时调用；输出可行动的假设与数据缺口。
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

将业绩波动分解为 **曝光/点击（流量）**、**转化率**、**客单价**、**退货/评分**、**竞品价格或促销** 等可解释项，并给出 **下一步验证动作**（改 Listing、调价、广告、库存）。

## 前置条件

- 来自 `sku-health-scanner` 或 `sku-lifecycle-classifier` 的 **目标 SKU 列表** 与 **时间窗**。  
- 尽量提供：广告报表摘要、Sessions、转化率、Buy Box、星级、主要竞品 ASIN 价格快照（可部分缺失）。

## 步骤

1. **漏斗对齐**：同口径对比「本期 vs 上期」或「异常周 vs 基线」。  
2. **主因排序**：用贡献度或简单弹性表排序 Top 3 假设。  
3. **每条假设** 配 **验证方式**（A/B、调价测试、搜索词报告、VOC）。  
4. 标 **数据缺口**（如无广告花费）避免过度结论。  
5. 与 **渠道/运营** 域交接：哪些动作归广告优化、哪些归 Listing。

## 输出格式

- `sku | 主因Top1 | 证据 | 置信度 | 建议动作 | Owner 域`  
- **汇总**：可批量处理的共因（如整类目流量下滑）。

## When NOT to use

- 已明确单一事件（如 Listing 被删）— 直接记录事件，不必做全量归因。  
- 无对比基线 — 只做描述性统计并声明不可归因。

## 相关 Skill

- 上游：`sku-lifecycle-classifier`、`sku-health-scanner`  
- 下游：渠道侧广告/Listing Skill；供应链侧补货 Skill（按需）
