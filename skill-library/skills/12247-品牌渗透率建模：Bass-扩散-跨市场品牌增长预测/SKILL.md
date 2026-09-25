---
name: "p2s-brand-penetration-modeling"
title: "Brand Penetration Modeling — 品牌渗透率建模：Bass 扩散 × 跨市场品牌增长预测"
description: "触发词：品牌渗透率、Bass 扩散、跨市场参数迁移、销量预测曲线、备货与投放节奏。何时不用：要判断的是单品在目标市场能不能卖的适配性时用「跨市场产品适配性预测」；要做五维就绪度裁决时用「多市场拓展就绪度评分」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-072"
l3_business: "市场进入"
l3_all: "市场进入 / 经营预测"
l1_l2_l3: "业务运营/渠道经营/市场进入"
p2s_card_id: "Skill-Brand-Penetration-Modeling"
p2s_src_domain: "15-营销投放分析"
quality_tier: "preview"
user_summary: "用母市场的增长曲线推测新市场怎么起量、什么时候到高峰，帮第一年备货和广告预算定节奏。"
user_try: "试试：用美国站三年销量拟合 Bass 参数，预测德国站未来 3 年的销量曲线和高峰月份。"
whenToUse: "当要预测新市场的渗透节奏、决定第一年备多少货与广告什么时候加大投放时用本技能；若要判断单品在目标市场能不能卖，用「跨市场产品适配性预测」；要做新市场整体 GO/WAIT/NO-GO 裁决，用「多市场拓展就绪度评分」。"
workflow: "用源市场历史销量拟合 Bass 参数 p/q/M → 估算目标市场与源市场的规模与参数比例 → 迁移参数并求解目标市场扩散曲线 → 输出预测区间与备货投放建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Brand Penetration Modeling — 品牌渗透率建模：Bass 扩散 × 跨市场品牌增长预测

## ① 解决的问题

品牌进入德国市场不知道应该备货多少第一年广告应该大投还是稳步——贝叶斯Bass扩散从美国迁移先验预测德国渗透曲线，备货决策准确度提升30-40%，年化减少备货失误10-30万元

## ② 核心算法逻辑

Bass 扩散模型（经典产品生命周期预测）：

## ③ 业务应用场景

业务问题：品牌吸奶器在美国 3 年内从 0 到月销 2000 件。进入德国市场，应该第一年备货多少？广告预算分配怎么规划（早期大投还是稳步提升）？
数据要求： - 美国市场历史销量（用于拟合 p/q 参数） - 德国市场特征：目标人口/生育率/平均可支配收入/竞品数量 - 德美市场相似度估算
预期产出： - 德国市场 3 年销量预测曲线（P10/P50/P90） - 高峰到来时间预测（何时准备充足库存） - 营销预算建议：高 p 市场（媒体驱动）vs 高 q 市场（口碑驱动）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
新市场第一年备货决策准确度提升 30-40%：减少库存积压/缺货损失 ¥10-30 万
营销预算时序优化（Bass 参数决定何时大投）：ROI 提升 15-25%
多市场同时展开：共享 Bass 参数迁移，节省每市场独立分析成本
年化综合 ROI：¥15-50 万
实施难度：⭐⭐⭐☆☆（scipy.optimize 可实现拟合；贝叶斯扩展需要 PyMC/Stan；需要 1-3 年历史数据；约 3-4 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（147 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/marketing/brand_penetration_modeling` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/15-营销投放分析/Skill-Brand-Penetration-Modeling.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Brand Penetration Modeling
贝叶斯 Bass 扩散模型：跨市场品牌渗透率预测
"""
import numpy as np
from scipy.integrate import odeint
from scipy.optimize import minimize


def bass_model(N, t, p, q, M):
    """Bass 扩散微分方程"""
    dN = (p + q * N / M) * (M - N)
    return dN


def solve_bass(p, q, M, t_max=48, dt=1):
    """求解 Bass ODE，返回每月累计采购者数"""
    t = np.linspace(0, t_max, int(t_max/dt)+1)
    N0 = [0]
    N_t = odeint(bass_model, N0, t, args=(p, q, M)).flatten()
    # 月增量（非累计）
    increments = np.diff(N_t, prepend=0)
    return t, N_t, increments


def fit_bass_from_history(historical_sales: np.ndarray) -> dict:
    """从历史销量数据拟合 Bass 参数 (p, q, M)"""
    cumulative = np.cumsum(historical_sales)
    n = len(historical_sales)
    t = np.arange(n)

    def objective(params):
        p, q, M = params
        if p <= 0 or q <= 0 or M <= cumulative[-1]:
            return 1e10
        _, _, inc = solve_bass(p, q, M, t_max=n-1, dt=1)
        predicted = inc[1:n+1]
        return float(np.mean((historical_sales[:len(predicted)] - predicted[:len(historical_sales)]) ** 2))

    # 初始猜测：基于历史数据
    M_init = cumulative[-1] * 3
    result = minimize(objective, x0=[0.01, 0.3, M_init],
                      bounds=[(0.001, 0.5), (0.01, 1.0), (cumulative[-1]*1.5, M_init*5)],
                      method='L-BFGS-B')
    p, q, M = result.x
    peak_time = np.log(q / p) / (p + q) if q > p else 0

    return {
        'p': round(p, 4), 'q': round(q, 4), 'M': round(M, 1),
        'peak_month': round(peak_time, 1),
        'fit_mse': round(result.fun, 4),
    }


def transfer_bass_to_new_market(source_params: dict, market_ratio: dict) -> dict:
    """
    跨市场迁移：基于市场相似度调整参数
    market_ratio: {'M': 0.3, 'p': 0.8, 'q': 1.1} (新市场/源市场比例)
    """
    return {
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.07823，但该号在 arXiv 上是《PRoDeliberation: Parallel Robust Deliberation for End-to-End Spoken Language Understanding》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：源市场历史销量序列（卡页需 1-3 年，用于拟合 p/q/M）、目标市场特征（目标人口、生育率、人均可支配收入、竞品数量）与两市场相似度比例；粒度为 市场 × 月。

**输出**：目标市场 3 年销量预测曲线（P10/P50/P90）、渗透高峰到来时间、备货与营销预算时序建议（高 p 媒体驱动 vs 高 q 口碑驱动）；供选品/供应链与投放规划使用。

## 执行步骤

1. 收集源市场（如美国）历史销量序列并拟合 Bass 参数 p、q、M
2. 估算目标市场与源市场的规模与扩散参数比例
3. 把参数迁移到新市场并求解扩散曲线
4. 输出 3 年销量预测区间（P10/P50/P90）与高峰时间
5. 按参数特征给出备货节奏与广告投放时序建议

## 边界与不做

- 数据不满足：源市场历史不足（卡页建议 1-3 年）时 p/q 拟合不可靠，不要直接外推备货量。
- 何时不用：要判断的是单品在目标市场的适销性，用「跨市场产品适配性预测」；要做多市场整体就绪度的 GO/WAIT/NO-GO 裁决，用「多市场拓展就绪度评分」。
- 能力边界：只输出预测曲线与预算时序建议，不代替备货决策与供应链约束；卡页的备货准确度 +30-40%、年化综合 ROI ¥15-50 万为案例口径。

## 技能关联

- **前置**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Category-Trend-Forecasting.html、Skill-Category-Trend-Forecasting、Skill-DTC-Customer-Acquisition-Attribution.html、Skill-DTC-Customer-Acquisition-Attribution、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Multimarket-Expansion-Readiness-Scorer.html、Skill-Multimarket-Expansion-Readiness-Scorer、Skill-Time-Series-Foundation-Model.html、Skill-Time-Series-Foundation-Model
- **延伸**：Skill-Category-Trend-Forecasting.html、Skill-Category-Trend-Forecasting、Skill-DTC-Customer-Acquisition-Attribution.html、Skill-DTC-Customer-Acquisition-Attribution、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Multimarket-Expansion-Readiness-Scorer.html、Skill-Multimarket-Expansion-Readiness-Scorer
- **可组合**：Skill-DTC-Customer-Acquisition-Attribution.html、Skill-DTC-Customer-Acquisition-Attribution、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Brand-Penetration-Modeling

---

> 分类：业务运营/渠道经营/市场进入　·　技术族：15-营销投放分析　·　源卡：`Skill-Brand-Penetration-Modeling`