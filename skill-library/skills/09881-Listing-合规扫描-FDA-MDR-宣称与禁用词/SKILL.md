---
id: listing-compliance-scanner
title: Listing 合规扫描（FDA/MDR 宣称与禁用词）
description: 当需要上架或批量更新标题/五点/描述/A+ 文案时调用；按北美或欧洲规则扫描医疗宣称与禁用表述，未通过则不得进入 listing-bulk-generator 定稿环节。
skill_version: "0.1.0"
l2_pillar: 渠道
ref_domain:
  - F
  - B
risk_tier: P0_gate
execution_boundary: internal
market_profile: both
---

## 目标

对 **待发布 Listing 文本** 做规则扫描，识别 **FDA 禁用医疗宣称**（NA）或 **MDR 禁止/高风险表述**（EU），输出 **必须修改项** 与 **修订后可直接粘贴的句子级建议**（建议需人工最终确认）。

## 前置条件

- 已选定 `market_profile`：**NA** 与 **EU 不得混用同一扫描表**。  
- 已具备经批准的 **品牌宣称边界**（可由法务提供关键词白/黑名单）；本 Skill 可挂载附录占位。  
- 吸奶器等 **医疗器械** 品类：欧盟文案默认按 **IIa** 严口径扫描。

## 步骤

1. **分轨加载规则**  
   - NA：疗效、治愈、最佳、医生替代诊断等高风险模式 + 你方维护的禁用词库。  
   - EU：与 MDR 宣称、通用安全与性能要求（GSPR）冲突的表述 + 各语禁忌词（DE/EN/FR/IT/ES 分段处理）。

2. **解析输入结构**：标题、五点、长描述、A+ 模块文本分区扫描，记录 **字段路径**（便于批量改 ERP→Listing 流水线）。

3. **分级标注**  
   - **Block**：必须删改否则不建议发布（计入 P0）。  
   - **Warn**：建议弱化或加脚注/认证引用。  
   - **Info**：风格或 SEO 提示，不影响合规门禁。

4. **输出修订草案**：每条 Block 给 1～2 个替代表述，避免空洞「请修改」。

5. **门禁标记**：若存在任一 Block，在对话或下游系统中置 `listing_compliance_pass: false`（由编排层消费，与 `graph/skills.yaml` 中 `blocks_until` 一致）。

## 输出格式

- `摘要：PASS | FAIL（Block 数量）`  
- 表格：`位置 | 原文片段 | 级别 | 规则依据（简写）| 建议替换`  
- **FAIL 时**：禁止输出「可上架」结论。

## When NOT to use

- 仅检查图片/视频 — 需另配视觉合规流程。  
- 纯翻译润色、无合规语义变更 — 用营销域本地化 Skill。

## 相关 Skill

- 上一环：`certification-gap-analyzer`  
- 下一环：`compliance-calendar`（证书到期与文案改版联动）  
- **门禁**：对 `listing-bulk-generator` 为 `blocks_until`（图已配置）
