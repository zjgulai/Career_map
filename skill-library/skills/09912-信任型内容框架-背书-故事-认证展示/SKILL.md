---
id: trust-content-generator
title: 信任型内容框架（背书/故事/认证展示）
description: 当需要按母婴「信任优先」逻辑搭建可复用的内容模块（IBCLC 背书要点、真实用户故事结构、安全与认证可见性）并落到章节级 brief 时调用；不替代医学建议或法务审阅。
skill_version: "0.1.0"
l2_pillar: 营销
ref_domain:
  - D
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
---

## 目标

输出 **可复用信任框架**：北美侧重 IBCLC/真实故事链路，欧洲侧重认证与材料安全可见性；供 Hook、达人简报与广告矩阵共用同一事实底座。

## 前置条件

- 已有 `content-calendar-planner` 或等效「周主题/战役」输入。  
- 已掌握可引用事实：**注册证/DoC 编号**、**可公开引用的专家关系**（禁止虚构背书）。

## 步骤

1. **事实层**：列出可引用认证与禁区（不得出现治愈/医疗承诺表述，指向后续 `ftc-gdpr-compliance-checker`）。  
2. **结构层**：为「专家背书 / 用户故事 / 产品演示」各给 **一节大纲**（标题 + 3–5 个要点）。  
3. **市场差异**：NA 强化场景叙事与第三方背书；EU 强化标签语言与环保/BPA-free 等可验证点（按目标国语言分轨）。  
4. 标注 **需素材**：证言授权级别、图片/视频授权范围。

## 输出格式

- `TrustBrief_v1`：Markdown；含 `Facts | NA_modules | EU_modules | Assets_needed | Compliance_flags`  
- 表格：`模块ID | 类型 | 要点 | 证据来源 | 语言/市场 | 状态`

## When NOT to use

- 单平台前 3 秒 Hook — 用 `tiktok-hook-writer`。  
- Listing 正文合规扫描 — 用 `listing-compliance-scanner`。

## 相关 Skill

- 上游：`content-calendar-planner`（`next`）  
- 下游：`tiktok-hook-writer`、`ad-copy-matrix`、`influencer-brief-generator`（`next`）；`ftc-gdpr-compliance-checker`（合规门）
