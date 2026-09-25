---
name: "p2s-dynamic-payment-terms-tag-engine"
title: "动态账期标签引擎 — 基于现金流预测的供应商账期智能优化与动态调整"
description: "触发词：动态账期、供应商账期调整、早付折扣、现金流压力等级、账期标签。何时不用：只压缩 CCC 阶段天数与测算资金释放时用「现金转换周期优化」；只做采购预算偏差重测时用「采购预算滚动重测」。安全边界：账期变更须与供应商书面确认后再执行；不得单方违约或恶意拖欠，付款决定须走财务审批。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-014"
l3_business: "资金预测"
l3_all: "资金预测 / 采购比价"
l1_l2_l3: "经营管理/财务与合规/资金预测"
p2s_card_id: "Skill-Dynamic-Payment-Terms-Tag-Engine"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "现金紧张时把账期谈长一点、宽裕时早付拿折扣，账期跟着现金流走而不是合同写死。"
user_try: "试试：按我当前现金覆盖天数和各家供应商条款，给出最优账期与早付折扣建议。"
whenToUse: "需要按现金流状态动态调整供应商账期、并判断早付折扣是否划算时用；只做 CCC 压缩测算时用现金转换周期类技能；只做采购预算偏差管理时用采购预算滚动重测。"
workflow: "评估现金覆盖天数与压力等级 → 汇总供应商账期与早付折扣条款 → 计算目标账期与折扣取舍 → 生成账期标签并输出协商建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 动态账期标签引擎 — 基于现金流预测的供应商账期智能优化与动态调整

## ① 解决的问题

财务面临"现金流紧张但账期还是固定Net30"——现金流驱动的动态账期决策，紧张时延长释放5万元资金，充裕时早付获折扣1万元/年

## ② 核心算法逻辑

动态账期 将账期决策从"固定合同"升级为"基于实时现金流预测的动态调整"。

## ③ 业务应用场景

（卡页此段是占位串，未承载业务场景；可读的落地口径见下方「执行步骤」与「输入 / 输出契约」。）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：现金紧张时延长账期30天 = 释放约5万元流动资金（以月采购额50万×6%利率计算）；充裕时获取早付折扣2% = 节省约1万元/年；动态调整vs固定账期，年化资金效率提升约3-5%
实施难度：⭐⭐⭐☆☆（需要现金流预测数据，主要依赖ERP财务数据）
优先级评分：⭐⭐⭐⭐☆（中小跨境品牌现金流管理是生死线，动态账期是低成本的财务工具）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（130 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/dynamic_payment_terms_tag_engine` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Dynamic-Payment-Terms-Tag-Engine.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
动态账期标签引擎
功能：现金流状态评估 / 最优账期计算 / 早付折扣分析 / Tag动态更新
"""
from dataclasses import dataclass, field
from typing import Optional
import warnings
warnings.filterwarnings('ignore')


@dataclass
class CashFlowContext:
    current_cash_usd: float
    monthly_gmv_usd: float
    monthly_cogs_usd: float
    upcoming_large_payments_usd: float  # 未来30天大额支出
    financing_rate_annual: float = 0.08  # 融资年利率

    @property
    def cash_coverage_days(self) -> float:
        """现金能覆盖多少天的运营"""
        daily_burn = self.monthly_cogs_usd / 30
        return self.current_cash_usd / max(1, daily_burn)

    @property
    def cash_stress_level(self) -> str:
        days = self.cash_coverage_days
        if days < 15: return "CRITICAL"
        elif days < 30: return "TIGHT"
        elif days < 60: return "NORMAL"
        else: return "ABUNDANT"


@dataclass
class SupplierPaymentTerms:
    supplier_id: str
    current_terms_days: int
    min_terms_days: int = 0
    max_terms_days: int = 90
    early_pay_discount_pct: float = 0.0   # 提前付款折扣%
    early_pay_trigger_days: int = 10      # 提前多少天付款触发折扣
    monthly_purchase_usd: float = 10_000
    # Tags
    recommended_terms: int = 30
    terms_tag: dict = field(default_factory=dict)


def compute_optimal_payment_terms(context: CashFlowContext,
                                    supplier: SupplierPaymentTerms) -> dict:
    """计算最优账期和账期价值"""
    fin_rate = context.financing_rate_annual

    # 账期延长的资金价值（以融资利率计算）
    def term_value(days: int) -> float:
        return supplier.monthly_purchase_usd * fin_rate * (days / 365)

    # 早付折扣净收益
    def early_pay_benefit(trigger_days: int) -> float:
        discount_value = supplier.monthly_purchase_usd * supplier.early_pay_discount_pct / 100
        opp_cost = supplier.monthly_purchase_usd * fin_rate * (supplier.current_terms_days - trigger_days) / 365
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2308.14923。
⚠️ 该号被 4 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：现金流上下文（当前现金、月 GMV、月 COGS、未来 30 天大额支出、融资年利率）与供应商账期条款（当前账期、上下限、早付折扣率与触发天数、月采购额）；粒度：供应商级。

**输出**：现金流压力等级、各供应商的目标账期与早付折扣建议、账期标签更新结果与资金释放估算，供财务与采购执行。

## 执行步骤

1. 评估现金覆盖天数并判定现金流压力等级
2. 汇总各供应商当前账期、上下限与早付折扣条款
3. 按压力等级计算目标账期与折扣取舍
4. 生成账期标签并估算资金释放或折扣收益
5. 输出与供应商协商的建议口径

## 边界与不做

- 数据不满足时不用：现金头寸与月 COGS 未按同一口径提供时，压力等级判定失真，账期建议不可用。
- 能力边界：本技能承载的是账期规则与标签，不是执行器；不代改合同、不代付款，账期变更须供应商书面确认。

## 技能关联

- **前置**：Skill-BOM-Cost-Rollup-Tag-Engine.html、Skill-BOM-Cost-Rollup-Tag-Engine、Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-MOQ-Payment-Terms-Optimization.html、Skill-MOQ-Payment-Terms-Optimization、Skill-SKU-Level-Margin-Attribution-Ontology.html、Skill-SKU-Level-Margin-Attribution-Ontology、Skill-Supply-Chain-Working-Capital-Optimization.html、Skill-Supply-Chain-Working-Capital-Optimization
- **延伸**：Skill-BOM-Cost-Rollup-Tag-Engine.html、Skill-BOM-Cost-Rollup-Tag-Engine、Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-SKU-Level-Margin-Attribution-Ontology.html、Skill-SKU-Level-Margin-Attribution-Ontology
- **可组合**：Skill-BOM-Cost-Rollup-Tag-Engine.html、Skill-BOM-Cost-Rollup-Tag-Engine、Skill-SKU-Level-Margin-Attribution-Ontology.html、Skill-SKU-Level-Margin-Attribution-Ontology、Skill-Dynamic-Payment-Terms-Tag-Engine

---

> 分类：经营管理/财务与合规/资金预测　·　技术族：04-供应链　·　源卡：`Skill-Dynamic-Payment-Terms-Tag-Engine`