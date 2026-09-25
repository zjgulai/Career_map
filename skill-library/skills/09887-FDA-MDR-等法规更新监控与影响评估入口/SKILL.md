---
id: regulatory-update-monitor
title: FDA / MDR 等法规更新监控与影响评估入口
description: 当需要定期汇总 FDA、EU MDR/CPSC 等公开更新线索、生成「影响 SKU/证书」初筛表并触发缺口重评与日历时调用；不替代订阅服务与律师解读。
skill_version: "0.1.0"
l2_pillar: 渠道
ref_domain:
  - F
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
---

## 目标

输出 **本期监控摘要**（来源链接、生效日、摘要）+ **影响评估表**（高/中/低 + 待确认项），并 **触发** `certification-gap-analyzer` 与 `compliance-calendar` 更新任务。

## 前置条件

- 已维护 **关注清单**（法规、指南、协调标准编号）。  
- ERP 或表中可关联 **证书类型 ↔ SKU/型号**（粗粒度即可）。  
- 明确 **评审周期**（如双周/月）。

## 步骤

1. 收集输入：官方公报、NB 通讯、行业协会摘要（标注 **一手/二手来源**）。  
2. 对每条更新做 **摘要与生效日**；无法确认生效日标 **TBD**。  
3. 与现有证书法域 **映射**：可能影响的 **标准/附录** 打标签。  
4. 输出 **影响等级**：高（可能需重测/技术文件变更）/中（标签或说明书修订）/低（信息性）。  
5. 生成 **行动项**：触发 `certification-gap-analyzer` 重跑；在 `compliance-calendar` 增加 **评审截止** 与 Owner。

## 输出格式

- 表：`UpdateID | 来源 | 主题 | 生效日 | 影响等级 | 涉及证书/标准 | 建议动作 | 截止`  
- **附录**：原文链接与存档说明（防链接失效）。

## When NOT to use

- 单一证书续证执行 — 直接走 `compliance-calendar` 任务流。  
- 具体 Listing 用词是否违规 — `listing-compliance-scanner`。

## 相关 Skill

- 触发：`certification-gap-analyzer`、`compliance-calendar`（`triggers`）
