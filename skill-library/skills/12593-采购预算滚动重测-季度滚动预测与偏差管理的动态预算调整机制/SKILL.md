---
name: "p2s-procurement-budget-rolling-reforecast"
title: "采购预算滚动重测 — 季度滚动预测与偏差管理的动态预算调整机制"
description: "触发词：采购预算、季度滚动重测、预算偏差预警、超支发现、动态预算调整。何时不用：做全局收入与成本的滚动再预测时用「滚动预算再预测」；只做供应商比价与议价时用采购比价类技能。安全边界：预算与采购金额属敏感财务数据，仅限授权人员使用；不得据此擅自变更已签采购合同。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-015"
l3_business: "经营预算"
l3_all: "经营预算 / 采购比价"
l1_l2_l3: "经营管理/财务与合规/经营预算"
p2s_card_id: "Skill-Procurement-Budget-Rolling-Reforecast"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "采购超支不再等到年底才发现，按季度滚一遍就能提前预警、及时调预算。"
user_try: "试试：按最新需求变化把我的采购预算滚动重测一遍，标出超支的季度和需要调整的额度。"
whenToUse: "采购预算需要按季度滚动更新、要提前发现偏差并调整额度时用；做全局收入成本再预测时用「滚动预算再预测」；只做供应商比价时用采购比价类技能。"
workflow: "汇总各期预算、实际与预测值 → 按需求变化重算未来期预算 → 打偏差与利用率标签并标出超支期次 → 输出调整建议交财务与采购确认"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 采购预算滚动重测 — 季度滚动预测与偏差管理的动态预算调整机制

## ① 解决的问题

CFO面临"年末才发现采购预算超支无法纠正"——滚动重测将预算超支发现从年底→月度，及时干预年化减少超支约50万元

## ② 核心算法逻辑

滚动重测（Rolling Reforecast） 将固定年度采购预算升级为"每月滚动更新、实时预警偏差"的动态管理体系。

## ③ 业务应用场景

（卡页此段是占位串，未承载业务场景；可读的落地口径见下方「执行步骤」与「输入 / 输出契约」。）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：滚动重测将采购预算超支从"年底发现"→"月度发现"，及时干预减少年化超支约5%（以年采购额1000万计算=50万元）
实施难度：⭐⭐☆☆☆（主要是财务数据接入和Excel/BI报告替代）
优先级评分：⭐⭐⭐⭐☆（采购预算控制是CFO最关心的供应链KPI之一）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（67 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/procurement_budget_rolling_reforecast` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Procurement-Budget-Rolling-Reforecast.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
采购预算滚动重测系统
功能：滚动预测 / 偏差计算 / 预警Tag / 调整建议
"""
import numpy as np
from dataclasses import dataclass, field
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')


@dataclass
class ProcurementBudget:
    period: str           # 2026-Q3
    planned_usd: float
    actual_usd: float = 0.0
    forecast_usd: float = 0.0  # 滚动预测值
    tags: dict = field(default_factory=dict)

    @property
    def variance_pct(self) -> float:
        base = self.actual_usd if self.actual_usd > 0 else self.forecast_usd
        return (base - self.planned_usd) / max(1, self.planned_usd) * 100

    @property
    def utilization_pct(self) -> float:
        return (self.actual_usd / max(1, self.planned_usd)) * 100


def rolling_reforecast(budgets: list, demand_change_pct: float = 0.0) -> list:
    """滚动重测：基于需求变化调整未来期预算"""
    updated = []
    for b in budgets:
        new_forecast = b.forecast_usd * (1 + demand_change_pct / 100) if b.actual_usd == 0 else b.actual_usd
        variance = (new_forecast - b.planned_usd) / max(1, b.planned_usd) * 100

        b.forecast_usd = new_forecast
        b.tags = {
            "procurement.budget_variance_pct": round(variance, 1),
            "procurement.utilization_pct": round(b.utilization_pct, 1),
            "procurement.budget_status": "OVER" if variance > 10 else ("UNDER" if variance < -10 else "ON_TRACK"),
            "procurement.action_required": abs(variance) > 15,
        }
        updated.append(b)
    return updated


if __name__ == "__main__":
    print("【采购预算滚动重测系统】\n")
    budgets = [
        ProcurementBudget("2026-Q2", 800_000, actual_usd=880_000),  # 已发生，超支
        ProcurementBudget("2026-Q3", 900_000, forecast_usd=900_000),  # 预测中
        ProcurementBudget("2026-Q4", 1_200_000, forecast_usd=1_200_000),  # 旺季
    ]

    # 模拟：需求上调12%（黑五预期好于预期）
    updated = rolling_reforecast(budgets, demand_change_pct=12.0)

    print("=" * 60)
    print("【滚动重测结果（需求+12%调整后）】")
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2308.14923。
⚠️ 该号被 4 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：各期采购预算（计划额）、实际发生额与滚动预测值，以及需求变化幅度参数；粒度：按期（如季度），字段含期间、预算额、已用额与利用率。

**输出**：更新后的各期采购预算预测、预算偏差率与利用率、超支或结余状态标签与调整建议，供采购负责人与财务联动决策。

## 执行步骤

1. 汇总各期采购预算、实际发生额与初始预测值
2. 按需求变化幅度重算未来各期预测
3. 计算偏差率与预算利用率并打上状态标签
4. 标记超支期次并给出调整建议
5. 输出滚动重测结果供财务与采购确认

## 边界与不做

- 数据不满足时不用：实际发生额与预算口径不一致（含税、含运费与否混用）时，偏差率与状态标签不可信。
- 能力边界：只做重测与预警，不自动调拨预算、不改采购订单；预算调整须走财务审批。

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Demand-Supply-Matching-Gap-Analysis.html、Skill-Demand-Supply-Matching-Gap-Analysis、Skill-Dynamic-Payment-Terms-Tag-Engine.html、Skill-Dynamic-Payment-Terms-Tag-Engine、Skill-PO-Exception-Handling-Workflow.html、Skill-PO-Exception-Handling-Workflow、Skill-Procurement-Cost-KPI-Price-Achievement.html、Skill-Procurement-Cost-KPI-Price-Achievement、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Supply-Chain-Working-Capital-Optimization.html、Skill-Supply-Chain-Working-Capital-Optimization
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Demand-Supply-Matching-Gap-Analysis.html、Skill-Demand-Supply-Matching-Gap-Analysis、Skill-Dynamic-Payment-Terms-Tag-Engine.html、Skill-Dynamic-Payment-Terms-Tag-Engine、Skill-PO-Exception-Handling-Workflow.html、Skill-PO-Exception-Handling-Workflow、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Supply-Chain-Working-Capital-Optimization.html、Skill-Supply-Chain-Working-Capital-Optimization
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Demand-Supply-Matching-Gap-Analysis.html、Skill-Demand-Supply-Matching-Gap-Analysis、Skill-Dynamic-Payment-Terms-Tag-Engine.html、Skill-Dynamic-Payment-Terms-Tag-Engine、Skill-PO-Exception-Handling-Workflow.html、Skill-PO-Exception-Handling-Workflow、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Procurement-Budget-Rolling-Reforecast

---

> 分类：经营管理/财务与合规/经营预算　·　技术族：04-供应链　·　源卡：`Skill-Procurement-Budget-Rolling-Reforecast`