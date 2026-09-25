---
id: market-compliance-checker
title: 目标市场合规要求清单生成器
description: 当输入「目标市场 + 产品型号/品类（如吸奶器）」需要一份可执行的合规检查清单（北美或欧洲轨）时调用；上架、改 Listing、进 KA 或新开站点前必用。
skill_version: "0.1.0"
l2_pillar: 渠道
ref_domain:
  - F
risk_tier: P0_gate
execution_boundary: internal
market_profile: both
---

## 目标

为指定 **市场（NA / EU 具体国）** 与 **产品** 输出结构化合规要求清单，作为后续 `certification-gap-analyzer` 与 `listing-compliance-scanner` 的基准，避免漏项导致下架或扣押风险。

## 前置条件

- 已明确：`market_profile`（`NA` | `EU`）及具体国家/站点（如 US、DE、UK）。
- 已知产品形态：是否带电、是否含无线（蓝牙）、是否按医疗器械管理（母婴吸奶器在欧盟多为 **Class IIa** 路径，北美需核对 FDA 分类与 510(k) 状态）。
- 不涉及替代官方法律意见；输出为 **内部检查清单**，重大结论需 `execution_boundary: external` 的法务/公告机构确认。

## 步骤

1. **确认监管轨**  
   - NA：FDA 21 CFR 分类、CPSC 适用性、FCC（若无线）、州销售税与广告（FTC）仅记「需单独 Skill」不在此展开。  
   - EU：MDR 2017/745 路径、CE、RoHS/WEEE、标签语言（目标国官方语言）。

2. **按品类列强制项**（吸奶器/母婴电器示例）  
   - 技术文件 / 510(k) 或豁免依据、符合性声明、检测报告引用、标签与说明书要素、宣称禁区（医疗疗效类）。

3. **输出「必须持有」与「上架前必须完成」** 两栏，每条附 **证据类型**（证书编号字段名建议对齐 ERP，见 `docs/erp-skill-interface.md`）。

4. **显式列出本 Skill 未覆盖项**（如海关 HS 编码、进口商信息），避免团队误以为已全覆盖。

## 输出格式

- **Markdown 表格**：`要求项 | 适用轨 | 证据/记录 | ERP 字段建议 | 责任人（内/外） | 备注`  
- **P0 摘要**：3～5 条「不满足则禁止上架/发货」的硬条件。

## When NOT to use

- 已拿到目标国律师/公告机构书面结论且仅需存档 — 不必重复生成清单，可只做增量 diff。  
- 纯客服话术纠纷、无新品类/新市场 — 用客服域 Skill。

## 相关 Skill

- 下一环：`certification-gap-analyzer`（`next`）  
- 后续门禁：`listing-compliance-scanner`、`compliance-calendar`
