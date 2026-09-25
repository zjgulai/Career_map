---
id: listing-compliance-checker
title: Listing 上架前合规复核（双市场清单式）
description: 在「多语言本土化之后」对整套 Listing 做北美/欧洲双轨合规复核，作为进入 A+ 与 platform-formatter 前的门禁；与 listing-compliance-scanner 互补（scanner 偏全文规则扫描，checker 偏清单与一致性）。
skill_version: "0.1.0"
l2_pillar: 渠道
ref_domain:
  - F
  - B
risk_tier: P0_gate
execution_boundary: hybrid
market_profile: both
---

## 目标

按 **清单** 核对：宣称与认证是否一致、是否含禁用医疗表述、标签与包装信息是否在各语版本中 **同源**，输出 **PASS/FAIL** 与 **阻塞项**。

## 前置条件

- 已完成 `multilingual-localizer` 输出或等价终稿。  
- 已具备 `market-compliance-checker` 对该 SKU 市场的 **必须项列表**（可摘要）。  
- 复杂案例并行运行 `listing-compliance-scanner` 做全文扫描，本 Skill 负责 **发布前 gate**。

## 步骤

1. 加载清单：**认证引用**、**禁忌宣称**、**对比/最高级用语**、**目标国标签要素**。  
2. 逐模块勾选；FAIL 项必须引用 **具体模块与句段**。  
3. 与 ERP 中 **认证编号与范围** 交叉核对（字段见 `docs/erp-skill-interface.md`）。  
4. 输出 **可签字表**（角色：运营负责人/合规联络人）。

## 输出格式

- `结果：PASS | FAIL`  
- 表：`检查项 | 证据位置 | 状态 | 备注`  
- FAIL 时 **禁止** 声明可上架。

## When NOT to use

- 仅有英文初稿未本地化 — 先用 `multilingual-localizer`。  
- 需法律意见书 — `execution_boundary: external`。

## 相关 Skill

- 上游：`multilingual-localizer`（`next`）  
- 辅助：`listing-compliance-scanner`、`certification-gap-analyzer`  
- 下游：`aplus-content-generator`（`next`）
