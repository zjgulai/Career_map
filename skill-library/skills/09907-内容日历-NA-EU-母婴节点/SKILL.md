---
id: content-calendar-planner
title: 内容日历（NA/EU 母婴节点）
description: 当需要按北美与欧洲市场分别排布月度或季度内容主题、大促与节日节点（含哺乳周、母亲节等）并输出可执行日历表时调用；不替代具体脚本与合规审阅。
skill_version: "0.1.0"
l2_pillar: 营销
ref_domain:
  - D
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
---

## 目标

输出 **分市场** 的内容日历：主题行、日期窗、优先级、关联 SKU/系列，供 `trust-content-generator` 与短视频/达人工作流消费。

## 前置条件

- 已明确 **market_profile**（`NA` / `EU` / 双轨分表）。  
- 已知本阶段主推 SKU 或系列（可从 ERP 或货盘会摘要粘贴）。

## 步骤

1. 载入 **固定节日与行业节点**：如 World Breastfeeding Week、Mother’s Day、Baby Shower 季、Prime Day / BFCM（NA）、圣诞/返校季等；欧洲单独列各国差异（如 DE 与 UK 节日不完全重合）。  
2. 将 **品牌战役**（上新、清仓、KA 联动）叠加到日历，标注「硬截止」与「可滑动」。  
3. 为每周生成 **主题标签**（教育 / 信任故事 / 产品演示 / UGC）与 **内容形式**（短视频 / 图文 / 直播）占位。  
4. 输出 **资源冲突检查**：同一周不超过 N 条高成本制作（按团队约定）。

## 输出格式

- 表：`周次 | 日期范围 | 市场 | 主题 | 节点类型(节日/战役/常设) | 关联SKU/系列 | 优先级 | 备注`  
- 附 **一页摘要**：本月 Top 3 主题与风险（合规敏感周单独标黄）。

## When NOT to use

- 仅写单条 TikTok 脚本 — 用 `tiktok-hook-writer`。  
- 未分 NA/EU — 禁止混在一张总表无标注。

## 相关 Skill

- 下游：`trust-content-generator`（`next`）
