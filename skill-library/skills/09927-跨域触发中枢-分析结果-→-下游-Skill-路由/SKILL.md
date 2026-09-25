---
id: cross-domain-trigger-hub
title: 跨域触发中枢（分析结果 → 下游 Skill 路由）
description: 当 anomaly-detector 或其它 H 域分析产出异常事件、需要映射到产品/供应链/渠道/客服等具体 Skill id 并去重时调用；不自动执行下游，只输出路由建议与优先级。
skill_version: "0.1.0"
l2_pillar: 战略
ref_domain:
  - H
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
---

## 目标

将 **异常事件** 转为 **(target_skill_id, reason, severity, suggested_order)** 列表，供人工或编排器执行，避免重复触发与域间打架。

## 前置条件

- 输入为结构化 **异常列表**（可来自 `anomaly-detector`）。  
- 已维护 **路由表**：异常类型 → 候选 Skill（可在 YAML 块中粘贴）。

## 步骤

1. 逐条匹配路由表；无匹配标 **unmapped** 并建议新建 Skill 或人工工单。  
2. **去重**：同一根因合并为一条主触发。  
3. **冲突检测**：若同时建议「大补货」与「清仓」— 标 CONFLICT 并需战略输入。  
4. 输出 **执行顺序**：合规 P0 > 安全客服 > 库存 > 增长类。  
5. 可选：生成 **一行摘要** 给 `strategic-review-generator`。

## 输出格式

- 表：`event_id | target_skill_id | severity | reason | depends_on | auto_eligible`  
- **summary**：供周会朗读用 5 行内。

## When NOT to use

- 单一明确工单（如单票客服）— 直达客服 Skill。  
- 无异常列表 — 不跑空路由。

## 相关 Skill

- 上游：`anomaly-detector`（`next`）、`ka-performance-analyzer`（`triggers`）  
- 下游：各领域 Skill；汇总 `strategic-review-generator`
