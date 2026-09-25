---
name: "p2s-forecast-to-pl-bridge"
title: "Forecast-to-PL-Bridge — 需求预测误差的财务损失量化与成本优化"
description: "触发词：预测误差量化、Newsvendor 模型、持货成本、缺货成本、分位数订货。何时不用：要决定具体订多少货用补货与库存优化类技能；要做成本因子因果归因用「供应链成本因果归因」。安全边界：成本与服务参数须来自真实财务口径，假设变更要留痕；结论用于内部决策，不构成财务承诺。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-016"
l3_business: "经济性分析"
l3_all: "经济性分析 / 需求预测"
l1_l2_l3: "经营管理/财务与合规/经济性分析"
p2s_card_id: "Skill-Forecast-to-PL-Bridge"
p2s_src_domain: "23-运营财务"
quality_tier: "preview"
user_summary: "把预测精度提升翻译成钱：算出持货与缺货成本差多少，告诉管理层 MAPE 降低到底值多少预算。"
user_try: "试试：按持货成本率 25%、缺货率 40% 算出 MAPE 从 18% 降到 12% 对应的年化节省金额。"
whenToUse: "需要把预测精度改善折算成财务 ROI、给预算审批做依据时用本技能；决定订货量本身用补货与库存优化类技能；成本因子归因用「供应链成本因果归因」。"
workflow: "设定持货成本率、缺货惩罚率、售价与补货周期 → 算出临界比率与最优库存分位数 → 按需求分布计算期望持货成本与缺货成本 → 对比不同预测误差水平下的总成本差并折算年化节省"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Forecast-to-PL-Bridge — 需求预测误差的财务损失量化与成本优化

## ① 解决的问题

供应链团队无法向 CFO 证明预测精度提升的价值——Newsvendor 成本函数将 MAPE 18%→12% 的改善转化为年化 ¥80-120 万节省，打通技术指标到财务语言的翻译层

## ② 核心算法逻辑

大多数供应链团队用 MAPE、RMSE 等精度指标评估预测模型，但这些指标和钱没有直接关系——MAPE 从 12% 降到 10% 到底值多少钱？没人说得清。更危险的是：精度更高的模型在财务上未必更优，因为过高库存的持货成本（holding cost）可能比缺货损失更贵。

## ③ 业务应用场景

业务问题：数据团队花 3 个月把吸奶器需求预测 MAPE 从 18% 降到 12%，但管理层问"这值多少钱"，团队答不上来，项目价值无法量化，预算审批困难。
Forecast-to-PL 量化： - 设 h = 25%/年（含 FBA 仓储费 + 资金成本）、b = 40%（缺货 = 失去一次销售 + 差评风险溢价） - 分位数 $q^* = b/(b+h) = 0.615$（偏高备货） - MAPE 18% → 12%：需求分布标准差从 $0.18\bar{D}$ 降到 $0.12\bar{D}$ - 月销 1000 件、售价 $90：TC 降低 = $8,400/月 = $100,800/年
预期产出：每个预测改进项目有对应美元 ROI，管理层决策有数字依据

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
预测精度 MAPE 18%→12%：年化节省 ¥80-120 万（50 SKU × $100 均值节省/月）
大促备货决策优化：避免过度备货或缺货损失 ¥10-30 万/次大促
技术团队预算申请 ROI 量化：加速审批周期 1-2 个月
年化综合 ROI：¥100-200 万
实施难度：⭐⭐☆☆☆（公式明确，标准库实现，1-2 天接入）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（212 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/growth_model/forecast_to_pl_bridge` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/23-运营财务/Skill-Forecast-to-PL-Bridge.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Forecast-to-PL-Bridge — 需求预测误差财务损失量化
基于 Newsvendor 成本函数 (arXiv: 2603.16815)

依赖: numpy, scipy (标准科学计算库)
"""

from dataclasses import dataclass
import numpy as np
from scipy import stats


@dataclass
class CostParams:
    """成本参数"""
    holding_rate: float      # 年持货成本率（如 0.25 = 售价的 25%/年）
    stockout_rate: float     # 缺货惩罚率（如 0.40 = 售价的 40%）
    unit_price: float        # 产品售价（USD）
    review_period_days: int  # 补货周期（天）

    @property
    def h(self) -> float:
        """单位持货成本（每补货周期）"""
        return self.holding_rate * self.unit_price * self.review_period_days / 365

    @property
    def b(self) -> float:
        """单位缺货成本"""
        return self.stockout_rate * self.unit_price

    @property
    def critical_ratio(self) -> float:
        """临界比率（最优库存分位数）"""
        return self.b / (self.b + self.h)


def newsvendor_cost(demand_mean: float, demand_std: float,
                   order_qty: float, cost: CostParams) -> dict:
    """
    计算给定订货量的期望总成本

    Returns:
        dict: holding_cost, stockout_cost, total_cost, fill_rate
    """
    # 假设正态需求分布
    dist = stats.norm(loc=0, scale=1)  # 标准正态，z 已经标准化

    # 期望过剩库存 E[(Q-D)+] = (Q-μ)*Φ(z) + σ*φ(z)
    z = (order_qty - demand_mean) / demand_std
    expected_excess = (order_qty - demand_mean) * dist.cdf(z) + demand_std * dist.pdf(z)

    # 期望缺货量 E[(D-Q)+]
    expected_shortage = demand_mean - order_qty + expected_excess

    holding = cost.h * expected_excess
    stockout = cost.b * expected_shortage
    total = holding + stockout
    fill_rate = dist.cdf(order_qty)

    return {
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2603.16815，但该号在 arXiv 上是《Beyond Accuracy: Evaluating Forecasting Models by Multi-Echelon Inventory Cost》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：成本参数（年持货成本率、缺货惩罚率、单价、补货周期）与需求预测误差水平（如 MAPE 或需求标准差相对均值的比例），粒度到 SKU 或品类。

**输出**：给定订货量下的期望持货成本、缺货成本、总成本与服务率，以及预测误差改善对应的年化节省金额，供管理层做预算与模型投入决策。

## 执行步骤

1. 设定持货成本率、缺货率与补货周期等成本参数
2. 按缺货与持货成本比算出临界比率
3. 计算当前与改进后预测误差下的期望总成本
4. 把成本差折算为年化节省金额

## 边界与不做

- 持货与缺货成本参数无法估算、或需求严重偏离假设分布时不适用
- 只做误差到财务的翻译与参数计算，不产出具体订货决策
- 参数假设须来自真实财务口径并留痕，结论不构成对外财务承诺

## 技能关联

- **前置**：Skill-Conformal-Prediction-Demand-UQ.html、Skill-Conformal-Prediction-Demand-UQ、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Inventory-Financing-Optimization.html、Skill-Inventory-Financing-Optimization、Skill-LLMForecaster-Seasonal-Event.html、Skill-LLMForecaster-Seasonal-Event、Skill-PL-Attribution-Analysis.html、Skill-PL-Attribution-Analysis、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **延伸**：Skill-Conformal-Prediction-Demand-UQ.html、Skill-Conformal-Prediction-Demand-UQ、Skill-Inventory-Financing-Optimization.html、Skill-Inventory-Financing-Optimization、Skill-LLMForecaster-Seasonal-Event.html、Skill-LLMForecaster-Seasonal-Event、Skill-PL-Attribution-Analysis.html、Skill-PL-Attribution-Analysis
- **可组合**：Skill-Conformal-Prediction-Demand-UQ.html、Skill-Conformal-Prediction-Demand-UQ、Skill-LLMForecaster-Seasonal-Event.html、Skill-LLMForecaster-Seasonal-Event、Skill-Forecast-to-PL-Bridge

---

> 分类：经营管理/财务与合规/经济性分析　·　技术族：23-运营财务　·　源卡：`Skill-Forecast-to-PL-Bridge`