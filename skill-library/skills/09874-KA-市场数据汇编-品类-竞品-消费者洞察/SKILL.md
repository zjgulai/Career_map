---
id: ka-market-data-compiler
title: KA 市场数据汇编（品类/竞品/消费者洞察）
description: 在撰写买手年度提案或新品进场前，将分散的内部销售数据与外部品类增长、竞品份额、消费者洞察汇编为统一数据包，供 ka-buyer-proposal-generator 使用。
skill_version: "0.1.0"
l2_pillar: 渠道
ref_domain:
  - C
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
channel_type: offline_ka
data_from: erp
---

## 目标

输出 **单一 Markdown/表格结构** 的「市场数据包」：**品类规模与增速**、**我方与核心竞品份额（若可得）**、**渠道结构**、**消费者痛点与购买驱动（来自评论/VOC/调研摘要）**，并标注 **数据来源与日期**。

## 前置条件

- 已明确 **目标 KA**（如 Walmart US、Boots UK、dm DE）与 **类目边界**（吸奶器/配件等）。  
- 内部数据：历史 POS/ sell-out、退货、促销（若有）。  
- 外部数据：可来自第三方报告摘要、公开财报、爬虫榜单——**每条标注可信度**。

## 步骤

1. **时间窗**：通常滚动 12 个月 + YTD；大促周单独标注。  
2. **品类**：TAM/SAM 可用自上而下估算时写清假设。  
3. **竞品**：列 Top 3～5，写价格带、主打卖点、渠道侧重。  
4. **消费者**：北美 vs 欧洲分小节；母婴敏感点（安全认证、噪音、便携）单独列。  
5. **数据缺口清单**：明确哪些买手会追问但当前没有数。

## 输出格式

- `一、品类与增长` / `二、竞争格局` / `三、消费者洞察` / `四、我方表现摘要` / `五、数据缺口`  
- 所有数字 **带单位与币种**。

## When NOT to use

- 已有一份当年 JBP 定稿数据包且仅做小修 — 做 diff 即可。  
- 纯线上亚马逊数据、无 KA 维度 — 用 B 域运营 Skill。

## 相关 Skill

- 下游：`ka-buyer-proposal-generator`（`next`）
