---
id: ad-copy-matrix
title: 广告文案矩阵（NA 英语 × EU 多语 × 场景 × 版位）
description: 当需要批量生成可测试的广告标题/正文变体矩阵（搜索/信息流/购物广告等版位）且已有信任型 brief 与关键词种子时调用；须与 NA/EU 分轨并经合规门后投放。
skill_version: "0.1.0"
l2_pillar: 营销
ref_domain:
  - D
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
data_from: erp
---

## 目标

输出 **结构化文案矩阵**：市场 × 语言 × 痛点场景 × 版位字符限制，便于 A/B 与本地化；事实与认证引用与 `trust-content-generator` 对齐。

## 前置条件

- 已有 `trust-content-generator` 或等效 brief。  
- 建议已有 `keyword-matrix-builder` 的 **种子词**（可部分复用，广告需单独合规审）。  
- 各平台 **字符上限** 与 **政策类别**（如医疗类限制）已知或标注「待确认」。

## 步骤

1. 定义 **维度**：市场（NA / DE / FR…）、场景（夜奶/便携/静音…）、版位（标题 30 字符 / 长描述 / DSA 等）。  
2. 每个单元格生成 **2–3 条变体**，标注 **主张类型**（情感/功能/社会证明）。  
3. 标记 **需披露** 单元（比价、背书、促销）。  
4. 与 `listing-compliance-scanner` **禁词表交叉自检**（不替代 `ftc-gdpr-compliance-checker`）。

## 输出格式

- 大表：`Market | Lang | Placement | VariantID | Copy | Claim_type | Limits | Notes`  
- 附 **实验计划**：建议优先测的 5 个单元与指标（CTR/CVR）。

## When NOT to use

- 自然流量 Listing 正文 — 用 Listing 链上 Skill。  
- 仅 Hook — 用 `tiktok-hook-writer`。

## 相关 Skill

- 上游：`trust-content-generator`（`next`）；可选输入 `keyword-matrix-builder`  
- 下游：`ftc-gdpr-compliance-checker`（`next`）
