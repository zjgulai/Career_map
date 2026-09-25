---
id: amazon-ad-optimizer
title: 亚马逊广告解读与 ACOS 异常（NA / EU 分轨）
description: 当需要解读搜索词/投放报告、识别 ACOS 或转化率异常并给出关键词与出价调整草稿（含预算再分配建议）时调用；不替代广告 API 自动规则与品牌独家数据权限。
skill_version: "0.1.0"
l2_pillar: 渠道
ref_domain:
  - B
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
channel_type: online_3p
data_from: erp
---

## 目标

输出 **可执行调整表**：高花费低转化词、潜力词、否词建议、活动/组级预算倾斜；**北美与欧洲分文件**，货币与 VAT 语境分开备注。

## 前置条件

- 已导出 **至少 14 天** 广告报告（搜索词 + 投放位若可得）。  
- 已知 **毛利底线** 或目标 ACOS 区间（可占位「待财务确认」）。  
- SKU 与 ASIN 映射一致。

## 步骤

1. 汇总 **曝光-点击-订单-花费**，算 ACOS、CPC、转化率。  
2. 分层：**收割** / **拓词** / **否词** / **观察**（数据不足）。  
3. 与 `keyword-matrix-builder` 种子词 **对照**，标「矩阵未覆盖但跑出单」的词。  
4. 标注 **异常类型**：点击虚高、转化暴跌、跟卖/比价干扰（仅备注）。  
5. 给出 **7 日实验计划**：预算上限、单次调价幅度上限（保守默认 10–15%）。

## 输出格式

- 表：`Action | Target | Current | Suggested | Rationale | Risk`  
- **摘要**：Top 5 动作与预期影响（定性）。

## When NOT to use

- 仅写 Listing 文案 — Listing 链上游 Skill。  
- 全渠道战略定价 — `pricing-strategy-advisor`。

## 相关 Skill

- 上游：`platform-formatter`（`next`）；常与 `keyword-matrix-builder` 交叉引用  
- 异常联动：经营侧可经 `anomaly-detector` 触发复盘（图外可选）
