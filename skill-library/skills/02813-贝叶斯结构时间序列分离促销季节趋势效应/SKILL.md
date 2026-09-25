---
name: "p2s-bayesian-structural-time-series"
title: "Bayesian Structural Time Series — 贝叶斯结构时间序列分离促销/季节/趋势效应"
description: "触发词：反事实预测、季节与活动分离、干预后增量、贝叶斯时序、投放复盘。何时不用：用多市场加权构造反事实用合成控制技能，判断达人层级真实回报用 KOL 因果归因技能，本技能用时间序列反事实分离季节与活动效应。安全边界：销售与花费数据须为自有数据，结论须给出不确定性区间，不得把反事实预测当作实际结果对外披露。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 合作复盘"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-Bayesian-Structural-Time-Series"
p2s_src_domain: "03-时间序列"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把季节和趋势先算清楚，再看这波投放到底带来多少真增量。"
user_try: "试试：用投放前 52 周的周销量做反事实，算出这次达人合作带来的真实增量销量。"
whenToUse: "需要把活动效果与季节、趋势分开，判断一波投放的真实净效果时用本技能；用多市场对照构造反事实用合成控制技能，评估达人层级回报用 KOL 因果归因技能。"
workflow: "准备干预前后周度序列 → 加入花费、排名与节假日协变量 → 拟合反事实预测 → 对比实际值与反事实区间 → 拆出活动与季节各自贡献"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Bayesian Structural Time Series — 贝叶斯结构时间序列分离促销/季节/趋势效应

## ① 解决的问题

品牌运营面临"30万美元Influencer Campaign后销量涨40%但不确定是Campaign效果还是季节旺季"——贝叶斯结构时序反事实分析将Campaign净iROAS从4.5修正为2.3，年化节省20-40万元无效投放

## ② 核心算法逻辑

论文：Bayesian Structural Time Series | 年份：2016

## ③ 业务应用场景

场景：某母婴卖家在某周投放了 Influencer Campaign（5 万美元），销量随即上涨 40%。但不确定是 Campaign 效果还是恰好赶上了季节旺季。用 CausalImpact/BSTS 做反事实分析。
数据要求：干预前 52 周周度销量，广告花费、BSR、节假日标记（协变量），干预后 8 周观测值。
BSTS 输出：干预期间实际值 vs 反事实预测（95% CI）。识别 Campaign 带来的增量销量约 +18%，季节效应贡献 +15%，实际 Campaign iROAS 约 2.3（远低于表面的 4.5）。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

20-40 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（83 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from scipy.linalg import solve

def bsts_local_level(
    y: np.ndarray,
    sigma_eps: float = 5.0,
    sigma_eta: float = 2.0,
    n_forecast: int = 8
) -> dict:
    """
    简化版局部水平 BSTS（卡尔曼滤波实现）
    y: 观测序列
    sigma_eps: 观测噪声标准差
    sigma_eta: 状态噪声标准差（趋势随机游走）
    n_forecast: 预测步数
    """
    n = len(y)
    # 卡尔曼滤波
    mu = np.zeros(n + n_forecast)
    P = np.zeros(n + n_forecast)
    mu[0] = y[0]
    P[0] = sigma_eta ** 2

    # 滤波阶段
    for t in range(1, n):
        # 预测
        mu_pred = mu[t - 1]
        P_pred = P[t - 1] + sigma_eta ** 2
        # 更新
        K = P_pred / (P_pred + sigma_eps ** 2)  # 卡尔曼增益
        mu[t] = mu_pred + K * (y[t] - mu_pred)
        P[t] = (1 - K) * P_pred

    # 预测阶段（外推）
    for t in range(n, n + n_forecast):
        mu[t] = mu[t - 1]
        P[t] = P[t - 1] + sigma_eta ** 2

    forecasts = mu[n:]
    forecast_ci = 1.96 * np.sqrt(P[n:] + sigma_eps ** 2)

    return {
        'filtered_states': mu[:n],
        'forecasts': forecasts,
        'forecast_lower': forecasts - forecast_ci,
        'forecast_upper': forecasts + forecast_ci,
        'state_variance': P
    }

def causal_impact_estimate(
    y_pre: np.ndarray,
    y_post: np.ndarray,
    sigma_eps: float = 5.0,
    sigma_eta: float = 2.0
) -> dict:
    """简化版因果影响估计"""
    result = bsts_local_level(y_pre, sigma_eps, sigma_eta, n_forecast=len(y_post))
    counterfactual = result['forecasts']
    impact = y_post - counterfactual
    cumulative_impact = np.cumsum(impact)
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:1606.00142 — Model selection consistency from the perspective of generalization ability and VC theory with an application to Lasso
⚠️ 卡页 ② 段点名的论文是《Bayesian Structural Time Series》，与这个号指的不是同一篇。

核验口径：主题指向成立但强度不足（词重合 0.2／点名相似 0.162）。引用前请自行确认。

## 输入 / 输出契约

**输入**：干预前 52 周周度销量、广告花费、类目排名与节假日标记等协变量，以及干预后 8 周观测值。

**输出**：干预期间实际值与反事实预测（含 95% 置信区间）、活动增量与季节效应的贡献拆解、修正后的真实投放回报；卡页案例把表面回报从 4.5 修正为 2.3，识别出活动增量约 18%、季节贡献约 15%。

## 执行步骤

1. 整理干预前后周度销量序列并标注干预时点。
2. 加入广告花费、类目排名与节假日等协变量。
3. 拟合反事实预测并给出置信区间。
4. 对比实际值与反事实值，拆出活动与季节各自的贡献。
5. 按净增量重算投放回报供复盘使用。

## 边界与不做

- 干预前历史序列过短（卡页口径为 52 周）、或同期还有其他大促叠加时不要用，反事实不可靠。
- 能力边界：结果是反事实推断而非实测，协变量遗漏会误导结论；卡页的回报修正与节省金额为特定案例口径。
- 合规红线：销售与花费数据须为自有数据，结论须给出不确定性区间，不得把反事实预测当作实际结果对外披露。

## 技能关联

- **可组合**：Skill-Bayesian-Structural-Time-Series

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：03-时间序列　·　源卡：`Skill-Bayesian-Structural-Time-Series`