---
id: ka-buyer-proposal-generator
title: KA 买手提案框架生成（执行摘要/市场机会/产品方案/商业条款）
description: 当需要向海外 KA 买手提交年度或单品进场提案、且已具备 ka-market-data-compiler 数据包与目标 SKU 清单时调用；输出可转 PPT/PDF 的章节结构与要点，不替代法务条款审阅。
skill_version: "0.1.0"
l2_pillar: 渠道
ref_domain:
  - C
risk_tier: P1_standard
execution_boundary: hybrid
market_profile: both
channel_type: offline_ka
---

## 目标

生成 **买手语言** 的提案骨架：**执行摘要**（1 页）、**市场机会**、**产品方案与差异化**、**供应链与履约能力**、**营销与店内执行**、**商业条款要点**（占位符）、**附录（数据表引用）**。

## 前置条件

- `ka-market-data-compiler` 输出或等价材料。  
- **目标 SKU 清单**、**建议零售价/促销价区间**（可粗）、**上市窗口**。  
- 已知 KA **格式偏好**（如某客户要「执行摘要在前」）— 写入输入区。

## 步骤

1. **执行摘要**：3～5 条 bullet，量化机会与承诺级别（避免夸大）。  
2. **市场机会**：引用数据包，突出 **品类增长 + 我方增量空间**。  
3. **产品方案**：每 SKU：定位、目标人群、与竞品差异、包装/认证亮点。  
4. **履约**：MOQ、交期、补货频率、退换货政策摘要。  
5. **条款占位**：账期、退货 allowance、MDF/贸易条款 — **标「需法务/财务确认」**。  
6. **风险与缓解**：供应、合规、舆情各 1 条。

## 输出格式

- 分章节 Markdown；每节预留 **图表占位符** `[图：份额趋势]`。  
- 附 **术语表**（中英德法商务用语对照可选）。

## When NOT to use

- 买手已下发固定模板 — 严格套模板表，仅填本 Skill 的要点。  
- 无数据包仅有口头方向 — 先补 `ka-market-data-compiler`。

## 相关 Skill

- 上游：`ka-market-data-compiler`（`next`）  
- 下游：`multilingual-localizer-ka`（`next`）
