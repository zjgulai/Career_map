---
id: compliance-calendar
title: 合规认证到期与复审日历
description: 当需要维护证书/检测报告/DoC 等到期日、并生成 90/60/30 天提醒与复盘任务时调用；适合周例会与供应商/公告机构跟催。
skill_version: "0.1.0"
l2_pillar: 渠道
ref_domain:
  - F
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
data_from: erp
---

## 目标

基于 ERP 或表格中的 **认证与到期字段**，生成 **按时间排序的日历视图** 与 **分级提醒任务**，减少「过期未续导致批量下架」风险。

## 前置条件

- 数据源含：证书/报告名称、编号、签发机构、**到期日**、覆盖 SKU/型号、适用市场。  
- 时区与「工作日」定义一致（用于「提前 N 天」计算）。

## 步骤

1. 导入数据并 **标准化日期**（ISO 8601）。  
2. 计算每条记录的 **T-90 / T-60 / T-30** 节点；已过期标 **OVERDUE**。  
3. 与 `certification-gap-analyzer` 最新缺口表 **去重合并**（同一证不重复开任务）。  
4. 为每个即将到期项生成 **任务卡**：负责人、`execution_boundary`（内/外）、依赖交付物（检测报告草稿、标签稿等）。  
5. 输出 **下一季度滚动摘要** 供战略复盘引用（链到战略域，非本 Skill 内展开）。

## 输出格式

- iCal 可选；默认 **Markdown 表格**：`事项 | 到期日 | 状态 | T-90 日期 | 建议动作 | Owner`  
- **OVERDUE 区块**单独置顶。

## When NOT to use

- 无任何到期字段仅有「长期有效」声明 — 先人工确认法律效力再录入系统。  
- 单次单一证书咨询 — 直接日历提醒即可，不必全量跑批。

## 相关 Skill

- 上游：`certification-gap-analyzer`、`listing-compliance-scanner`、`product-label-generator`（`next` 链）  
- 触发入口：`regulatory-update-monitor`、`crisis-response-planner`（`triggers`）
