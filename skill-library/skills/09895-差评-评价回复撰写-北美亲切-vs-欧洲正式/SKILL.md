---
id: review-response-writer
title: 差评/评价回复撰写（北美亲切 vs 欧洲正式）
description: 当需回复亚马逊/独立站/社媒上的公开评价、尤其是差评时调用；区分北美与欧洲语气，并避免引发法律与平台二次违规。
skill_version: "0.1.0"
l2_pillar: 客服
ref_domain:
  - G
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
---

## 目标

输出 **公开可见** 的回复草稿：**致谢/道歉（若适用）/ 事实澄清 / 解决路径 / 联系方式**，长度符合平台限制。

## 前置条件

- **评价原文**、**星级**、**站点与市场**（NA 偏亲切；EU 不少国家偏正式、少表情）。  
- **是否核实订单**；未核实标「待核实」不写死事实。  
- **安全指控** — 先走 `safety-flag-detector`，不直接发公关稿。

## 步骤

1. **分类**：产品问题 / 服务 / 误解 / 恶意。  
2. **语气模板**：欧洲避免过度美式感叹号；德国市场注意正式称谓。  
3. **不** 在公开渠道争论医疗效果；引导私信。  
4. **合规**：不泄露用户隐私；不承诺未授权赔偿。  
5. 提供 **英文主稿 + 本地语**（若站点需要）。

## 输出格式

- `public_reply | lang | platform_limits | escalate_if`  
- **内部备注**（不公开）：是否建议联系修改评价。

## When NOT to use

- 评价含诽谤或需律师函 — 不自动生成公开回复。  
- 五星好评仅致谢 — 简化模板即可。

## 相关 Skill

- 关联：`safety-flag-detector`、`listing-compliance-scanner`（宣称一致性）
