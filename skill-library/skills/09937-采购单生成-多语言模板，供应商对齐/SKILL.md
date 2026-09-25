---
id: purchase-order-generator
title: 采购单生成（多语言模板，供应商对齐）
description: 在补货决策已书面/系统批准后，将批次与 SKU 行生成标准采购单（中/英/德等），便于发送供应商与留档；不自动发送除非对接系统。
skill_version: "0.1.0"
l2_pillar: 供应链
ref_domain:
  - E
risk_tier: P1_standard
execution_boundary: hybrid
market_profile: both
data_from: erp
supply_focus: scheduling
---

## 目标

输出 **PO 编号、行项目、单价、交期、收货地址、付款条款** 等标准字段；语言按供应商偏好选择。

## 前置条件

- **已批准**的补货决策（来自 `replenishment-decision-report` 或 ERP 审批流）。  
- 供应商主数据：**名称、税号、联系人、币种、MOQ、交期默认天数**。

## 步骤

1. 从批准量生成 **行项目**，合并同 SKU 多批次若业务允许。  
2. 套用 **合同价**；无合同价标 **TBD** 并阻塞发送。  
3. 生成 **中英/中德** 双语段落（条款引用标准模板）。  
4. 附件清单：**包装要求、合规标签版本、测试报告引用**（母婴类常需）。  
5. 输出 **CSV/PDF 占位** 与 **邮件正文模板**。

## 输出格式

- `PO_header | lines | incoterms | payment | ship_to | version`  
- **变更记录**：v0.1 草稿 / 正式版标记。

## When NOT to use

- 未获财务/战略对超额 PO 的授权 — 禁止生成可发送版本。  
- 样品/免费补货 — 用简化单或赠品流程。

## 相关 Skill

- 上游：`replenishment-decision-report`（`next`）  
- 闭环：`supplier-performance-tracker`（交期与质量回写）
