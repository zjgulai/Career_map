---
id: sku-exit-decision-tree
title: SKU 退场决策树（清仓/下架/迁移/捆绑）
description: 当 SKU 为 C 级危险或生命周期衰退且归因后仍无改善路径、需输出可执行的退场方案与时间表时调用；重大财务影响需战略侧确认。
skill_version: "0.1.0"
l2_pillar: 产品
ref_domain:
  - A
risk_tier: P1_standard
execution_boundary: hybrid
market_profile: both
data_from: erp
---

## 目标

在 **库存、毛利、仓储费、品牌风险** 约束下，输出 **单一推荐路径** 与 **备选路径**，避免「只建议清仓」而无数字支撑。

## 前置条件

- `sku-health-scanner` / `sku-lifecycle-classifier` / `attribution-analyzer` 中至少一项结论支持「退场或收缩」。  
- 具备：当前库存、在途、采购成本、近 90 天毛利、平台费用假设。

## 步骤

1. **决策树分支**：清仓折扣梯度 → 捆绑销售 → 迁移渠道（如转 KA/独立站）→ 区域下架 → 全球下架。  
2. 每条路径估算 **回收现金、耗时、对品牌/渠道冲突**。  
3. **P0 风险**：合规、保质期、医疗器械宣称 — 触发 `listing-compliance-scanner` 或法务。  
4. 与 **供应链** 对齐：处置库存与停产的 **最后下单日**。  
5. 输出 **执行清单**（谁、何时、依赖系统工单）。

## 输出格式

- `推荐方案 | 备选 | 财务测算摘要 | 时间表 | 风险与缓解`  
- 附 **SKU 清单表** 供 ERP/运营批量执行。

## When NOT to use

- SKU 为战略形象款或合约约束不可退 — 改走「维持+限量」策略，本 Skill 仅输出约束说明。  
- 数据不全 — 只输出「需补数据项」，不强行选方案。

## 相关 Skill

- 上游：`attribution-analyzer`、`sku-lifecycle-classifier`  
- 联动：`replenishment-predictor`（减量/停单时与供应链协同）；战略侧定价（`pricing-strategy-advisor` 待建）
