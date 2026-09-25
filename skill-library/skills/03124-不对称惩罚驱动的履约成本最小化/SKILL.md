---
name: "p2s-fba-cost-forecast-adjustment"
title: "FBA Cost Forecast Adjustment — 不对称惩罚驱动的履约成本最小化"
description: "触发词：不对称成本、分位数偏移、缺货惩罚、紧急空运、补货预测调整。何时不用：要定分级备货档位用「需求分位数预测」，要按精度口径评估预测用「预测准确率MAPE体系」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟 / 经济性分析"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-FBA-Cost-Forecast-Adjustment"
p2s_src_domain: "23-运营财务"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "欠载比超载贵得多时，把补货预测往高分位挪一点，少付几次紧急空运的钱。"
user_try: "试试：帮我按欠载和超载的成本比算出最优分位数，把 Q4 吸奶器的补货预测往上调。"
whenToUse: "本卡属需求预测的成本导向调整侧：补货的欠载与超载代价不对称、需要把预测偏移到最优分位数时用；要多档分位数备货策略的，用分位数预测类技能。"
workflow: "用近 52 周周销量拟合需求分布（正态或 Gamma） → 用历史欠载与超载记录标定惩罚比值 → 计算最优分位数并取值作为调整后预测 → 替换原对称预测值，输入现有补货公式"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# FBA Cost Forecast Adjustment — 不对称惩罚驱动的履约成本最小化

## ① 解决的问题

母婴吸奶器 Q4 补货用对称均值预测，欠载紧急空运成本是海运6倍，35% 的补货周期都要付出额外代价——不对称惩罚预测调整（CPP_L/CPP_H）将补货预测自动偏移至第 75 分位数，欠载概率从 35% 降至 15%，100 SKU 规模年化净节省 10-30 万元

## ② 核心算法逻辑

核心思想：传统需求预测假设对称损失函数——高估和低估产生相同代价，但 FBA 业务现实截然不同：

## ③ 业务应用场景

业务问题：母婴吸奶器 Q4 旺季需求波动大，使用对称预测（均值）补货时，约 35% 概率出现欠载，需临时空运补货；空运费用约 $6/kg，是海运的 6 倍，一次紧急补货额外成本 ¥2-5 万。
数据要求： - 历史周销量数据（近 52 周），拟合正态或 Gamma 分布 - 历史欠载/超载记录，标定 `CPP_L / CPP_H` 比值 - 当前库存水位、在途货量、提前期（lead time）
实施步骤： 1. 拟合需求分布参数（均值 μ、标准差 σ） 2. 计算业务场景下的惩罚比值 `q = CPP_L / (CPP_L + CPP_H)` 3. 取分位数 `f = F^{-1}(q)` 作为调整后预测 4. 以 `f` 替换对称预测值，输入现有补货公式

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

15-25 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（242 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/growth_model/fba_cost_forecast_adjustment` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/23-运营财务/Skill-FBA-Cost-Forecast-Adjustment.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
FBA 不对称成本预测调整 (Asymmetric Cost Forecast Adjustment)
基于 arXiv:2512.19722 — Amazon FBA 履约网络最后一英里成本优化

核心逻辑：最优预测 = 需求分布的 q 分位数，其中 q = CPP_L / (CPP_L + CPP_H)
"""

import numpy as np
from scipy import stats
from scipy.optimize import minimize_scalar
from typing import Tuple, Dict


def compute_optimal_quantile(cpp_l: float, cpp_h: float) -> float:
    """
    计算最优预测分位数。
    
    基于不对称成本函数最优条件：F(f*) = CPP_L / (CPP_L + CPP_H)
    
    参数:
        cpp_l: 欠载惩罚系数（Cost Per unit shortfall，紧急空运等）
        cpp_h: 超载惩罚系数（Cost Per unit excess，长库龄费等）
    
    返回:
        q: 最优分位数 [0, 1]
    
    示例:
        >>> compute_optimal_quantile(3.0, 1.0)  # 欠载惩罚3倍
        0.75
    """
    return cpp_l / (cpp_l + cpp_h)


def adjust_forecast_normal(
    mu: float,
    sigma: float,
    cpp_l: float,
    cpp_h: float
) -> Dict[str, float]:
    """
    正态分布假设下的不对称成本预测调整。
    
    参数:
        mu: 基础预测均值（对称预测值）
        sigma: 需求标准差
        cpp_l: 欠载惩罚系数
        cpp_h: 超载惩罚系数
    
    返回:
        dict 含:
            symmetric_forecast: 对称预测（均值）
            adjusted_forecast: 不对称调整后预测
            optimal_quantile: 最优分位数
            adjustment_delta: 调整量（f* - mu）
    """
    q = compute_optimal_quantile(cpp_l, cpp_h)
    adjusted = stats.norm.ppf(q, loc=mu, scale=sigma)
    return {
        "symmetric_forecast": mu,
        "adjusted_forecast": adjusted,
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2512.19722 — Node-Level Financial Optimization in Demand Forecasting Through Dynamic Cost Asymmetry and Feedback Mechanism

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：近 52 周历史周销量、历史欠载与超载记录（用于标定 CPP_L/CPP_H 比值）、当前库存水位、在途货量、提前期。

**输出**：调整后的补货预测值（最优分位数）与欠载概率变化、净节省测算，输出给补货决策与履约成本管理。

## 执行步骤

1. 用近 52 周周销量拟合需求分布（均值与标准差）。
2. 用历史欠载与超载记录标定欠载与超载的惩罚比值。
3. 计算最优分位数，取分位点作为调整后预测。
4. 用调整值替换对称预测，输入现有补货公式。

## 边界与不做

- 何时不用：缺少历史欠载与超载记录、无法标定惩罚比值时最优分位数无依据，不适用本技能。
- 能力边界：只调整预测的偏移量，不改变补货公式与库存策略；分布假设（正态或 Gamma）不成立时偏移方向需复核。

## 技能关联

- **前置**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-FBA-Fee-Intelligence.html、Skill-FBA-Fee-Intelligence、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **延伸**：Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **可组合**：Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard、Skill-FBA-Cost-Forecast-Adjustment

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：23-运营财务　·　源卡：`Skill-FBA-Cost-Forecast-Adjustment`