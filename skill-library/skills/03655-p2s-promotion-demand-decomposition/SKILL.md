---
name: "p2s-promotion-demand-decomposition"
title: "Demand Forecasting During Grand Promotion for Online Retailing (JD.com)"
description: "触发词：大促分解、Base-Lift、促销 lift、PPE、过量备货。何时不用：只需剥离历史节日脉冲修正增长率时用「节日峰值分解」；只按季节因子调整时用「STL 季节性分解」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Promotion-Demand-Decomposition"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把大促的额外需求和日常基线分开算，并专门扣掉大促后需求虚高的那段，避免大促后备一堆货。"
user_try: "试试：拆出 618 的基线需求和促销 lift，并按大促后虚高修正接下来三个月的备货量。"
whenToUse: "大促备货要区分基线需求与促销 lift、且需处理大促后需求虚高（PPE）时用；只剥离历史节日脉冲修正增长用节日峰值分解；只做季节因子用 STL 季节性分解。"
workflow: "准备 2 年日销量与大促日期区间 → 分解基线需求与促销 lift 两路信号 → 识别并量化大促后需求虚高（PPE） → 分别备货并与按大促均值备货的量作对比"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Demand Forecasting During Grand Promotion for Online Retailing (JD.com)

## ① 解决的问题

场景 A：Momcozy 618 大促备货拆解（5 月初下单，lead time 6 周）

## ② 核心算法逻辑

核心思想：把任意一个 SKU 的历史销量分解为两个互相独立的信号——「基线需求」（正常销售节奏）和「促销 lift」（大促拉动的额外需求）——分别建模、分别备货，并专门处理大促结束后需求虚高的「PostPromotion Elevation（PPE）」问题，避免系统在大促后 3 个月内持续过量备货。

## ③ 业务应用场景

场景 A：Momcozy 618 大促备货拆解（5 月初下单，lead time 6 周）
- 业务问题：吸奶器 SKU 日常基线销量 80 件/天，历史 618 大促期间销量 350 件/天（lift = 4.4x）。但大促后 3 周销量仅 45 件/天（post-dip）。传统方法按大促均值备货导致大促后积压 6 周。 - 数据要求：过去 2 年日销量（含促销标志位）、大促日历（618 日期区间） - 预期产出： - 业务价值：避免过量备货 5,345 件，按 $35/件 × 20% 持有成本 = 节省约 $37,415 仓储资金占用
场景 B：黑五/Prime Day 四次大促的 lift 系数标定

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
Momcozy 四次大促（618/双11/黑五/Prime Day），以 S12 Pro 主力 SKU 估算：
传统"3倍均值备货"年均过量备货约 8,000-12,000 件
促销分解法节省过量备货约 60%，按 $35 × 20% 持有成本 = 年节省约 $33,600-$50,400
同时降低大促后 3 个月的 FBA 长期仓储费约 $2,000-$4,000
实施难度：⭐⭐☆☆☆（2/5）— pandas + scipy，无需 GPU

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（240 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：unterminated triple-quoted string literal (detected at line 59)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：6」并记录位置 `paper2skills-code/supply_chain/promotion_demand_decomposition` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Promotion-Demand-Decomposition.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Skill-Promotion-Demand-Decomposition
基于 SPADE (arXiv:2411.05852, NeurIPS 2024) +
    Hewage et al. (Journal of Forecasting 2025) +
    Chi et al. JD.com (SSRN:4777632, 2024)
母婴跨境电商大促需求分解与备货量计算
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Optional


@dataclass
class PromoPlan:
    sku_id: str
    promo_name: str
    baseline_daily: float
    lift_multiplier: float
    promo_days: int
    post_dip_ratio: float
    post_dip_days: int
    pre_dip_ratio: float
    pre_dip_days: int

    @property
    def baseline_stock(self) -> float:
        return self.baseline_daily * (self.pre_dip_days + self.promo_days + self.post_dip_days)

    @property
    def lift_stock(self) -> float:
        return (self.lift_multiplier - 1) * self.baseline_daily * self.promo_days

    @property
    def post_dip_reduction(self) -> float:
        return self.post_dip_ratio * self.baseline_daily * self.post_dip_days

    @property
    def optimal_stock(self) -> float:
        return self.baseline_stock + self.lift_stock - self.post_dip_reduction

    @property
    def naive_stock(self) -> float:
        return self.lift_multiplier * self.baseline_daily * (self.pre_dip_days + self.promo_days + self.post_dip_days)

    @property
    def saving_vs_naive(self) -> float:
        return self.naive_stock - self.optimal_stock


# ── Base-Lift 分解（Hewage 2025 方法）──────────────────────
def decompose_baseline_lift(
    sales: pd.Series,
    promo_flags: pd.Series,
    method: str = "rolling_median",
) -> tuple[pd.Series, pd.Series, pd.Series]:
    """
    Base-Lift 分解：total = baseline + lift + post_dip
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2411.05852 — $\spadesuit$ SPADE $\spadesuit$ Split Peak Attention DEcomposition

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：过去 2 年日销量（含促销标志位）、大促日历（如 618 日期区间）、持有成本参数；粒度：SKU×日。

**输出**：基线备货量与促销 lift 备货量的拆分、经 PPE 修正的最优备货量，以及相对按大促均值备货的节省测算，供大促下单使用。

## 执行步骤

1. 标注大促区间并整理日销量序列
2. 分解基线需求与促销 lift 两路信号
3. 量化大促后需求回落并修正后续备货
4. 输出拆分后的备货量与总量
5. 对比短视策略给出节省测算

## 边界与不做

- 数据不满足时不用：历史未覆盖至少一次完整大促、或缺少大促日期标注时，lift 与 PPE 无法分离。
- 能力边界：只做备货量拆分与建议，不涉及定价与促销力度设计。

## 技能关联

- **前置**：Skill-Causal-Time-Series-Forecasting-GCF.html、Skill-Causal-Time-Series-Forecasting-GCF、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Inventory-Health-Aging-Attribution.html、Skill-Inventory-Health-Aging-Attribution、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-Multi-SKU-Procurement-Budget-Allocation.html、Skill-Multi-SKU-Procurement-Budget-Allocation、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-Supplier-Capacity-Planning.html、Skill-Supplier-Capacity-Planning
- **延伸**：Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Inventory-Health-Aging-Attribution.html、Skill-Inventory-Health-Aging-Attribution、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-Multi-SKU-Procurement-Budget-Allocation.html、Skill-Multi-SKU-Procurement-Budget-Allocation、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-Supplier-Capacity-Planning.html、Skill-Supplier-Capacity-Planning
- **可组合**：Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Inventory-Health-Aging-Attribution.html、Skill-Inventory-Health-Aging-Attribution、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-Supplier-Capacity-Planning.html、Skill-Supplier-Capacity-Planning、Skill-Promotion-Demand-Decomposition

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：04-供应链　·　源卡：`Skill-Promotion-Demand-Decomposition`