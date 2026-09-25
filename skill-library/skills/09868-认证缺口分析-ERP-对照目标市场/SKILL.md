---
id: certification-gap-analyzer
title: 认证缺口分析（ERP 对照目标市场）
description: 当已有「目标市场合规清单」且可从 ERP/主数据读取现有认证与到期字段时调用；输出缺口排序与补证优先级。
skill_version: "0.1.0"
l2_pillar: 渠道
ref_domain:
  - F
risk_tier: P0_gate
execution_boundary: hybrid
market_profile: both
data_from: erp
---

## 目标

对比 **目标市场要求**（来自 `market-compliance-checker` 或等价输入）与 **ERP/主数据中已有认证与日期**，输出 **缺口列表** 与 **优先级（P0/P1/P2）**，供排期与外包（公告机构、实验室）使用。

## 前置条件

- 输入包含：`market_profile`、产品 SKU/型号、以及 ERP 导出片段或字段映射（见 `docs/erp-skill-interface.md` 中 `certification_ids` / `expiry` 等）。  
- 若 ERP 无结构化认证字段，先约定手工表列再运行本 Skill，避免「假自动化」。

## 步骤

1. 将 `market-compliance-checker` 输出中的「必须持有」项转为可比对 **检查项 ID**。  
2. 从 ERP 行中读取：证书类型、编号、签发机构、覆盖型号、有效期、适用市场。  
3. **逐条匹配**：完全满足 / 部分满足（范围不足）/ 缺失 / 已过期。  
4. **排序规则建议**：  
   - P0：无法合法销售或清关的缺失（如 EU IIa 无有效 CE 路径证据）。  
   - P1：平台 Listing 会下架的高风险宣称或标签缺失。  
   - P2：可并行优化的环保、包装声明等。  
5. 对每条缺口给出 **建议动作**（补测、扩证、换新证、标签改版）与 **依赖外部角色** 标记。

## 输出格式

- 表格：`缺口项 | 当前 ERP 值 | 状态 | 优先级 | 建议动作 | 建议负责人 | 目标完成周`  
- **执行摘要**：给 CGO 的 5 行以内，只含 P0+P1。

## When NOT to use

- 尚未跑 `market-compliance-checker` 或等价清单 — 先补输入。  
- 单一文档审核且数据不在 ERP — 可降级为人工表，不必声明 `data_from: erp`。

## 相关 Skill

- 上一环：`market-compliance-checker`  
- 下一环：`listing-compliance-scanner`、`product-label-generator`（`next`，与 Listing/包装并行）  
- 排期联动：`compliance-calendar`；法规更新可经 `regulatory-update-monitor`（`triggers`）重跑本 Skill
