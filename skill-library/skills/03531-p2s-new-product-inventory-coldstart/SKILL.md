---
name: "p2s-new-product-inventory-coldstart"
title: "Pre-launch new product demand forecasting using Bass model with ML"
description: "触发词：Bass 模型、上市前预测、类比 SKU、协变量、首批订货量。何时不用：没有类比品且要求零样本预测时用「时序基础模型」类技能；要按相似品做分位数概率备货时用「新品需求冷启动」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-New-Product-Inventory-Coldstart"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "必须提前六周锁量时，用最像的老品历史加上协变量修正，给出比按平均数订货更稳的首批量。"
user_try: "试试：按 UV-C Pro X100 的历史，帮我把新款 X200 的首批订货量和缺货风险算出来。"
whenToUse: "上市前需提前锁定首批量、存在强类比 SKU 或需 Bass 参数估计时用；完全无类比要求零样本时用时序基础模型类技能；要概率分位数备货用新品需求冷启动。"
workflow: "筛选类比 SKU 并计算均值、标准差与变异系数 → 按协变量（价格、类目、价位）修正类比需求 → 对无类比的新品类用 Bass 参数估计扩散曲线 → 比较按均值订货与贝叶斯策略的缺货代价"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Pre-launch new product demand forecasting using Bass model with ML

## ① 解决的问题

场景 A：新款 UV-C 密闭消毒器上市首批备货（强相似 SKU 存在）

## ② 核心算法逻辑

论文：Dynamic Procurement of New Products with Covariate Information: The Residual Tree Method | 年份：2019

## ③ 业务应用场景

场景 A：新款 UV-C 密闭消毒器上市首批备货（强相似 SKU 存在）
- 业务问题：全新 SKU「UV-C Pro X200」即将上市，lead time 6 周（需提前 6 周锁定首批量）。类比品：已有 UV-C Pro X100（上市 8 个月，月均销量 320 件，系数变异 CV=35%）。 - 预期产出： - 业务价值：相比"按均值订320件"的短视策略，贝叶斯策略在高不确定性场景下减少缺货损失约 $8,000-$15,000（前 6 周）
场景 B：全新品类（无历史类比SKU）—— Bass 参数估计

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
Ban et al. 实证：忽略协变量 → 成本上升 6-15%，换算 $50K 首批采购 = 节省 $3,000-$7,500
Keskin 探索加成：避免短视策略在高不确定性场景的"任意大损失"，实践估算避免缺货损失 $8,000-$15,000
年均 3-4 个新品上市：年化价值 $33,000-$90,000
实施难度：⭐⭐⭐☆☆（3/5）— 需要历史 SKU 数据整理和相似度建模
优先级评分：⭐⭐⭐⭐☆（4/5）— 高风险决策，但频率低于日常补货

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（218 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：6」并记录位置 `paper2skills-code/supply_chain/new_product_inventory_coldstart` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-New-Product-Inventory-Coldstart.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Skill-New-Product-Inventory-Coldstart
基于 Ban, Gallien & Mersereau M&SOM 2019 (类比SKU残差树) +
    Keskin, Li & Song OR 2023 (Bayesian探索加成) +
    Lee et al. TF&SC 2014 (Bass参数ML估计)
母婴跨境 DTC 新品冷启动库存策略
"""

import numpy as np
from dataclasses import dataclass
from scipy import stats
from scipy.optimize import minimize_scalar


@dataclass
class AnalogSKU:
    sku_id: str
    monthly_sales: list[float]
    unit_price: float
    category: str
    launch_month: int
    price_tier: str

    @property
    def demand_mean(self) -> float:
        return float(np.mean(self.monthly_sales))

    @property
    def demand_std(self) -> float:
        return float(np.std(self.monthly_sales))

    @property
    def cv(self) -> float:
        return self.demand_std / max(self.demand_mean, 1)


@dataclass
class NewProductSpec:
    sku_id: str
    unit_price: float
    category: str
    price_tier: str
    launch_month: int
    lead_time_months: float = 1.5
    holding_cost_rate: float = 0.20
    stockout_cost_multiplier: float = 2.0


def find_analog_skus(
    new_product: NewProductSpec,
    catalog: list[AnalogSKU],
    n_analogs: int = 3,
) -> list[tuple[AnalogSKU, float]]:
    """
    按相似度匹配类比 SKU（Ban et al. 协变量回归的简化版）。
    相似度 = 类别匹配 × 价格段距离 × 上市季节对齐
    """
    scored = []
    for sku in catalog:
        sim = 0.0
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1904.04567，但该号在 arXiv 上是《Angular momentum compensation manipulation to room temperature of the ferrimagnet Ho$_{3-x}$Dy$_x$Fe$_5$O$_{12}$ detected by the Barnett effect》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Dynamic Procurement of New Products with Covariate Information: The Residual Tree Method》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：类比 SKU 历史销量（卡页示例：上市 8 个月、月均 320 件、CV=35%）、新品规格与协变量、前置期（卡页示例 6 周）；粒度：SKU×周或月。

**输出**：上市前首批订货量建议与策略对比（含相对按均值订货的缺货损失差异，卡页示例 $8,000-$15,000 前 6 周），供首批采购锁定使用。

## 执行步骤

1. 挑选并校验类比 SKU 的相似度与数据完整性
2. 计算类比需求的均值、波动与变异系数
3. 按协变量或 Bass 扩散修正需求水平
4. 比较不同订货策略的缺货与积压代价
5. 输出首批订货量建议

## 边界与不做

- 数据不满足时不用：既没有强相似类比 SKU、又无法估计 Bass 参数时，只能退回零样本基础模型或人工判断。
- 能力边界：只输出订货量建议与风险对比，不承担 MOQ、账期与供应商产能约束的取舍。

## 技能关联

- **前置**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Cold-Start-Product-Recommendation.html、Skill-Cold-Start-Product-Recommendation、Skill-Multi-SKU-Procurement-Budget-Allocation.html、Skill-Multi-SKU-Procurement-Budget-Allocation、Skill-Product-Lifecycle-Stage.html、Skill-Product-Lifecycle-Stage、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **延伸**：Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Cold-Start-Product-Recommendation.html、Skill-Cold-Start-Product-Recommendation、Skill-Multi-SKU-Procurement-Budget-Allocation.html、Skill-Multi-SKU-Procurement-Budget-Allocation、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **可组合**：Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Cold-Start-Product-Recommendation.html、Skill-Cold-Start-Product-Recommendation、Skill-New-Product-Inventory-Coldstart

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：04-供应链　·　源卡：`Skill-New-Product-Inventory-Coldstart`