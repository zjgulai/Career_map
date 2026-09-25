---
id: ka-financial-model
title: KA 财务测算（毛利、促销 ROI、账期与条款敏感性）
description: 在提案已有多语言初稿后，对条款组合进行财务建模：毛利率、滚动费用、促销 ROI、账期资金占用；输出供买手谈判与内部审批，属战略（含财务）域。
skill_version: "0.1.0"
l2_pillar: 财务
ref_domain:
  - C
risk_tier: P1_standard
execution_boundary: hybrid
market_profile: both
channel_type: offline_ka
data_from: erp
---

## 目标

输出 **可谈判区间** 与 **底线**：在给定销量假设下，**账期延长 / 退货率 / 促销折扣 / MDF** 对 **现金流与净利** 的敏感性；**不**作为对外报价的唯一依据。

## 前置条件

- `multilingual-localizer-ka` 后已定稿的 **商业条款占位** 或谈判草稿。  
- **成本**：出厂价、到岸分摊、KA 扣点、物流、预计退货损耗。  
- **销量假设**：Base / Upside / Downside 三档。

## 步骤

1. 建立 **单位经济模型**（每 SKU 或每货架米数，口径与 KA 对齐）。  
2. 叠加 **促销日历** 与 **费率**（列表费、数据费若已知）。  
3. **账期**：将 DSO 映射为 **资金占用成本**（使用内部 WACC 或简化利率）。  
4. **ROI 阈值**：标出「低于 X% 需 CGO 特批」的行。  
5. **输出谈判备忘录**：优先换什么条款换什么让步。

## 输出格式

- `假设表 | P&L 摘要 | 敏感性图（文字描述）| 谈判优先级`  
- **红线**：列明不可突破项（需财务签字）。

## When NOT to use

- 仅有线索无成本 — 只做 **区间与缺口**，禁止假填精确毛利。  
- 已签年度合同仅做单票订单 — 用订单级计算器即可。

## 相关 Skill

- 上游：`multilingual-localizer-ka`（`next`）  
- 关联：`ka-jbp-generator`（年度目标需与本模型一致）  
- 下游：`ka-ar-tracker`（执行后置）
