---
id: ka-ar-tracker
title: KA 应收账款与账期预警（多币种对账）
description: 当需按 KA 客户/发票维度跟踪应收、账期、逾期与对账差异时调用；输出供战略（含财务）与渠道对买手/财务结算；不替代会计记账。
skill_version: "0.1.0"
l2_pillar: 财务
ref_domain:
  - C
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
channel_type: offline_ka
data_from: erp
---

## 目标

输出 **应收账龄表**、**逾期清单**、**预计回款周**、**对账差异**（短溢、扣款、退货冲减），并 **红黄绿灯** 预警。

## 前置条件

- ERP 或导出：**发票号、币种、金额、到期日、已付、扣款原因码**。  
- **合同账期**（净 X 天）与 **争议联系人**。

## 步骤

1. 统一 **币种展示**（原币 + 折算可选）。  
2. 计算 **DSO**、**逾期天数**、**逾期金额占比**。  
3. 对差异项 **分类**：争议中、待补资料、已认款未核销。  
4. **预测现金流**：未来 8 周可回款（保守假设）。  
5. **升级规则**：逾期 >N 天 → CGO + 财务。

## 输出格式

- 表：`invoice | customer | due | open | aging_bucket | owner | next_action`  
- **周报摘要**：3 条。

## When NOT to use

- 仅一笔小额争议 — 走单票邮件。  
- 无发票号仅有银行流水 — 先对账匹配再进本 Skill。

## 相关 Skill

- 关联：`ka-financial-model`（条款敏感性）、`ka-jbp-generator`（目标与资源）
