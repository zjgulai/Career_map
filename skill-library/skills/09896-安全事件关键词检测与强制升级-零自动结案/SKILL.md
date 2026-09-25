---
id: safety-flag-detector
title: 安全事件关键词检测与强制升级（零自动结案）
description: 当客服文本中出现人身伤害风险、产品安全、婴儿健康相关描述时调用；输出「升级人工」结论，禁止进入自动回复闭环。
skill_version: "0.1.0"
l2_pillar: 客服
ref_domain:
  - G
risk_tier: P0_gate
execution_boundary: hybrid
market_profile: both
---

## 目标

**二元输出**：`SAFE_TO_ASSIST`（可走标准回复流程）或 `ESCALATE_IMMEDIATE`（升级至指定负责人/医疗与合规通道）。

## 前置条件

- 输入为 **已分类工单**（来自 `inquiry-classifier-multilingual`）或原始文本。  
- **升级联系人表**（值班手机、邮件组）已配置在附录或外部 wiki。

## 步骤

1. 加载 **安全词库**（多语言）：电击、烫伤、窒息、过敏休克、婴儿送医等。  
2. **否定句处理**：「没有漏电」 vs 「担心漏电」— 降低误报规则写在头。  
3. 若 **ESCALATE**：生成 **升级简报**（事实、SKU、批次、用户联系方式、已采取措施）。  
4. **禁止** 输出「安抚性医疗建议」；可输出「请停止使用并就医/联系当地急救」等 **中性安全提示**（需与法务确认模板）。  
5. 记录 **ticket_id** 供审计。

## 输出格式

- `result: SAFE_TO_ASSIST | ESCALATE_IMMEDIATE`  
- `ESCALATE` 时：`brief | suggested_owner | compliance_refs`

## When NOT to use

- 纯物流延迟无安全语义 — 标 SAFE，走标准流程。  
- 已确认恶作剧/重复骚扰 — 人工策略，不单靠本 Skill。

## 相关 Skill

- 上游：`inquiry-classifier-multilingual`（`next`）  
- **若 SAFE**：`reply-generator-multilingual`（`next`）  
- **若 ESCALATE**：停止自动化；严重产品安全升级可 `triggers` `crisis-response-planner`
