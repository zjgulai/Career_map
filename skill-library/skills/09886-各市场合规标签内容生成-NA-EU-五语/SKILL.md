---
id: product-label-generator
title: 各市场合规标签内容生成（NA / EU 五语）
description: 当需要为包装与说明书生成各目标市场法规定位的标签文案草稿（符号、警示语、制造商信息、语言组合）且已具备认证缺口或技术文件要点时调用；印刷前须法务与公告机构确认。
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

输出 **分市场、分语种** 的标签内容块（非美术稿）：北美英法双语场景与 **欧盟五语**（DE/EN/FR/IT/ES）占位表，与 ERP 中型号、UDI/批次规则字段对齐。

## 前置条件

- 已有 `certification-gap-analyzer` 或等效 **适用法规与符号清单**（CE、MDR、WEEE、电池等按 SKU 实际）。  
- 已知 **目标销售国** 与 **标签载体**（彩盒、机身镭雕、说明书折页）。  
- **禁止**在无 DoC/技术文件编号时编造公告机构声明。

## 步骤

1. 从 ERP 拉 **型号、序列化规则、制造商/欧代地址占位**（缺字段标 TBD）。  
2. 按市场拆分：**NA**（英语为主 + 加拿大法语若适用）；**EU** 各国官方语言要求（至少五语表，单列「主展示面语言」）。  
3. 填入 **通用符号与警示**（参考 IFU，不扩展疗效宣称）。  
4. 输出 **不可印清单**：在法务确认前不得出现的词汇与图案。  
5. 与 `compliance-calendar` 对齐 **标签再版日期**（与证到期/标准换版联动）。

## 输出格式

- 表：`BlockID | 市场 | 语言 | 正文/符号说明 | 依据(法规条款占位) | ERP字段绑定 | 状态`  
- 附 **一页签发检查表**（Owner / NB 意见 / 生效批次）。

## When NOT to use

- 仅改 Listing 在线文案 — 用 `listing-compliance-scanner`。  
- 已发生召回或平台紧急下架 — 先 `crisis-response-planner`。

## 相关 Skill

- 上游：`certification-gap-analyzer`（`next`）  
- 下游：`compliance-calendar`（`next`）
