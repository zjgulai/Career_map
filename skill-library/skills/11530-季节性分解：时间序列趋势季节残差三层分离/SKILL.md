---
name: "p2s-stl-seasonal-decomposition"
title: "STL Seasonal Decomposition — STL 季节性分解：时间序列趋势×季节×残差三层分离"
description: "触发词：STL 分解、季节性指数、趋势提取、残差异常、去季节化。何时不用：要把节日脉冲单独剥离并修正增长率时用「节日峰值分解」；要用状态空间建模促销干预时用「状态空间库存信号平滑」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 运行监测"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-STL-Seasonal-Decomposition"
p2s_src_domain: "03-时间序列"
quality_tier: "preview"
user_summary: "把销量拆成趋势、季节和残差三块，说清 11 月比年均高多少，也能指出哪个月是真正的异常。"
user_try: "试试：用 STL 分解我三年月销，给出每个月的季节指数和真正的异常月份。"
whenToUse: "需要量化每月相对年均的倍率、把趋势与残差分开时用；要剥离节日脉冲修正增长率用节日峰值分解；要在状态空间框架下分离促销干预用状态空间库存信号平滑。"
workflow: "准备 2-3 年月度销量与节假日日历 → 运行 STL 分解得到趋势、季节与残差 → 输出月度季节指数与趋势斜率 → 用残差识别真实异常并对备货做去季节化修正"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# STL Seasonal Decomposition — STL 季节性分解：时间序列趋势×季节×残差三层分离

## ① 解决的问题

16个时序Skill居然没有STL季节性分解导致备货计划无法量化圣诞季高多少——STL将时序分解为趋势×季节×残差三层，季节性指数精确量化后备货误差降低30%异常检测误报率降低60%年化减少备货失误10-30万元

## ② 核心算法逻辑

为什么先做季节性分解：

## ③ 业务应用场景

业务问题：吸奶器的年销量有明显的季节性（圣诞/母亲节/开学季会有高峰），但运营不确定每个月应该比基准高多少。STL 分解后可以精确量化："11月圣诞季比年均高 45%，2月情人节前后低 15%"。
数据要求： - 过去 2-3 年的月度销量数据 - 节假日日历（用于解释残差）
预期产出： - 趋势成分：品牌真实的增长斜率 - 季节性指数：每月相对年均的倍率 - 残差：哪些月份有"真正的异常"（超出季节性预期）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
备货计划精确量化季节性：减少过度备货 ¥5-15 万/年
促销效果评估去季节化：正确计算 ROI，优化预算分配 ¥3-10 万
异常检测减少误报：运营精力集中在真实异常
年化综合 ROI：¥10-30 万
实施难度：⭐⭐☆☆☆（statsmodels 有成熟 STL 实现；需要 2 年以上历史数据；约 1-2 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（158 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/time_series/stl_seasonal_decomposition` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/03-时间序列/Skill-STL-Seasonal-Decomposition.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
STL Seasonal Decomposition
时间序列季节性分解：趋势×季节×残差三层分离
"""
import numpy as np
from collections import defaultdict


def loess_smooth(y: np.ndarray, span: float = 0.3) -> np.ndarray:
    """
    LOESS 局部加权回归（简化版）
    生产用: from statsmodels.tsa.seasonal import STL
    """
    n = len(y)
    smoothed = np.zeros(n)
    window = max(3, int(span * n))

    for i in range(n):
        start = max(0, i - window // 2)
        end = min(n, i + window // 2 + 1)
        x_local = np.arange(start, end)
        y_local = y[start:end]
        # 距离权重（三次方核）
        distances = np.abs(x_local - i) / max(np.abs(x_local - i).max(), 1)
        weights = (1 - distances ** 3) ** 3

        if weights.sum() > 0:
            # 加权最小二乘
            X = np.column_stack([x_local, np.ones(len(x_local))])
            W = np.diag(weights)
            beta = np.linalg.lstsq(X.T @ W @ X, X.T @ W @ y_local, rcond=None)[0]
            smoothed[i] = beta[0] * i + beta[1]
        else:
            smoothed[i] = y_local.mean()

    return smoothed


def stl_decompose(y: np.ndarray, period: int = 12,
                  robust: bool = True, n_iter: int = 3) -> dict:
    """
    STL 分解：趋势 + 季节性 + 残差
    y: 时序数据
    period: 季节周期（月度数据=12，周度数据=52，日度=7）
    robust: 是否使用鲁棒权重（减少异常值影响）
    """
    n = len(y)
    # 初始趋势估计
    trend = loess_smooth(y, span=0.5)
    seasonal = np.zeros(n)
    weights = np.ones(n)

    for iteration in range(n_iter):
        # 去趋势
        detrended = y - trend

        # 季节性估计：对每个季节位置取 LOESS 平均
        for s in range(period):
            indices = np.arange(s, n, period)
            if len(indices) >= 2:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.09234，但该号在 arXiv 上是《Determination of the distance from a projection to nilpotents》，与本卡主题无关。
⚠️ 该号被 4 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：过去 2-3 年月度销量数据、节假日日历（用于解释残差）；粒度：SKU×月。

**输出**：趋势分量、月度季节性指数与残差异常识别结果，供备货量化调整与促销效果去季节化评估使用。

## 执行步骤

1. 整理月销序列并检查缺失月份
2. 运行 STL 分解得到三层分量
3. 输出季节指数与趋势斜率
4. 用残差定位真实异常月
5. 按季节指数修正备货计划

## 边界与不做

- 数据不满足时不用：历史不足 2 年时季节指数不稳定，残差也无法解释。
- 能力边界：只做分解与解释，不直接给出补货量或下单建议。
- 能力边界：趋势项是平滑估计，不能当作因果增长结论使用。

## 技能关联

- **前置**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Online-Incremental-Learning.html、Skill-Online-Incremental-Learning、Skill-Prophet-Forecasting.html、Skill-Prophet-Forecasting、Skill-Time-Series-Anomaly-Detection.html、Skill-Time-Series-Anomaly-Detection、Skill-Time-Series-Foundation-Model.html、Skill-Time-Series-Foundation-Model、Skill-VOC-Trend-Signal-Forecasting.html、Skill-VOC-Trend-Signal-Forecasting
- **延伸**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Online-Incremental-Learning.html、Skill-Online-Incremental-Learning、Skill-Time-Series-Foundation-Model.html、Skill-Time-Series-Foundation-Model、Skill-VOC-Trend-Signal-Forecasting.html、Skill-VOC-Trend-Signal-Forecasting
- **可组合**：Skill-Online-Incremental-Learning.html、Skill-Online-Incremental-Learning、Skill-VOC-Trend-Signal-Forecasting.html、Skill-VOC-Trend-Signal-Forecasting、Skill-STL-Seasonal-Decomposition

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：03-时间序列　·　源卡：`Skill-STL-Seasonal-Decomposition`