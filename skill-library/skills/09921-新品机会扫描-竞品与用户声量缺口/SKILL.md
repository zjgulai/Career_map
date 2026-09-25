---
id: new-sku-opportunity-scanner
title: 新品机会扫描（竞品与用户声量缺口）
description: 当需要结合竞品卖点矩阵、价格带与用户评论主题识别货盘空白点并输出可立项的新品方向清单（非具体开模指令）时调用；须与合规与供应链可行性人工确认。
skill_version: "0.1.0"
l2_pillar: 产品
ref_domain:
  - A
risk_tier: P1_standard
execution_boundary: hybrid
market_profile: both
---

## 目标

生成 **机会卡** 列表：细分需求、竞品覆盖缺口、证据来源（评论主题/搜索趋势/卖场观察）、**建议优先级**；与 `assortment-structure-analyzer` 的结构结论对齐。

## 前置条件

- 已有结构分析或明确的 **品类边界**（如吸奶器主机 vs 配件）。  
- 可粘贴 **竞品 ASIN/链接样本** 或第三方导出；无则基于公开 Listing 手工表。  
- 目标市场 **语言** 与 **合规敏感点**（母婴电器）已知。

## 步骤

1. 从评论与问答抽取 **未满足需求**（夜奶静音、便携、清洗等）聚类为标签。  
2. 对照自有货盘 **标签覆盖矩阵**，标 **空白/弱覆盖**。  
3. 估算 **价格带与毛利可行性**（粗算，引用 `pricing-strategy-advisor` 精神，不重复算表）。  
4. 每条机会标注 **证据强度**（高/中/低）与 **重复度**（与现有 SKU 可替代性）。  
5. 输出 **不做清单**（合规高风险、供应链 MOQ 不可达等）。

## 输出格式

- 表：`OppID | Theme | Evidence | Competitor_hint | Priority | Risks`  
- **一页路线图**：建议 Q 内验证动作（调研/样品/小测）。

## When NOT to use

- 已锁定 SKU 只做 Listing — Listing 链。  
- KA 独占款谈判 — `ka-buyer-proposal-generator`。

## 相关 Skill

- 上游：`assortment-structure-analyzer`（`next`）  
- 下游：`ka-vs-online-assortment-planner`（`next`）；客服侧可引用 `feedback-insight-extractor` 作辅证
