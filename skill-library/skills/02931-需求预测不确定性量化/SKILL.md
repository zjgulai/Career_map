---
name: "p2s-conformal-prediction-demand-uq"
title: "Conformal Prediction Demand UQ（需求预测不确定性量化）"
description: "触发词：预测不确定性、预测区间、共形预测、安全库存下调、覆盖率追踪。何时不用：要建模波动率过程本身用「需求波动率建模」，要统一预测精度口径用「预测准确率MAPE体系」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Conformal-Prediction-Demand-UQ"
p2s_src_domain: "03-时间序列"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "给点预测配上有覆盖保证的区间，据此把安全库存压下来，缺口少了仓储也没白花。"
user_try: "试试：Prophet 预测下月 2000 件，帮我算 90% 预测区间和对应的安全库存建议。"
whenToUse: "本卡属需求预测的区间量化侧：已有可靠点预测、要转成有覆盖保证的区间来定安全库存时用；要建模波动率动态或只做点估计的，用其他预测类技能。"
workflow: "准备历史销量序列与点预测残差 → 校准分位数得到给定覆盖率的预测区间 → 按区间上界重算安全库存 → 追踪实际值落入区间的覆盖率"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Conformal Prediction Demand UQ（需求预测不确定性量化）

## ① 解决的问题

供应链经理面临需求预测没把握——共形预测将库存缺口从18%降至6%，年化省20万元

## ② 核心算法逻辑

传统需求预测只给点估计（"下月卖 1000 件"），业务需要区间估计（"95% 置信区间: 8501200 件"）。Conformal Prediction 提供分布无关的、有限样本有效的预测区间，无需假设误差分布。

## ③ 业务应用场景

业务问题：Prophet 预测下月销量 2000 件，但点估计无法指导安全库存。FBA 仓储费高（$0.75/立方英尺/月），过度备货导致仓储成本飙升；缺货则损失 Prime 标和排名。
数据要求：24 个月月度销量（SKU: B0BN123XYZ），历史缺货记录 18 次/年，平均缺货损失 $22/件
预期产出： - 90% 预测区间：[1720, 2280]（vs Prophet 点估计 2000） - 安全库存策略：按区间上界 2280 备货，安全库存从 400 件降至 280 件（减少 30%） - 覆盖率追踪：实际值落在区间内的频率维持在 90%±2%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：三个场景合计年化节省 45 万元人民币（暖奶器 22 万 + 推车 11 万 + 辅食 12 万）
实施难度：⭐⭐☆☆☆（2 星）— PID Conformal 有开源实现，即插即用
优先级评分：⭐⭐⭐☆☆（3 星）— 需求预测的第二阶能力（先有点估计，再要区间估计）
评估依据：NeurIPS 2023 顶级团队（Angelopoulos/Candès/Tibshirani），代码已开源 pip 可用

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（91 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'[' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/time_series/conformal_prediction_demand_uq` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/03-时间序列/Skill-Conformal-Prediction-Demand-UQ.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Conformal Prediction for Demand UQ — PID 自适应预测区间
基于 Conformal PID Control (arXiv:2307.16895)
"""

import numpy as np
from typing import Tuple, List


class ConformalPID:
    """Conformal PID 控制器 — 自适应预测区间"""
    
    def __init__(self, alpha: float = 0.1,  # 目标误覆盖率
                 kp: float = 0.5, ki: float = 0.1, kd: float = 0.05):
        self.alpha = alpha
        self.kp, self.ki, self.kd = kp, ki, kd
        self.integral_error = 0.0
        self.prev_error = 0.0
        self.quantile = 1.0  # 初始 quantile
    
    def update(self, actual: float, predicted: float, 
               score: float) -> float:
        """PID 更新 quantile，返回调整后的预测区间半宽"""
        error = (1 - self.alpha) - (abs(actual - predicted) <= self.quantile * score)
        self.integral_error = 0.9 * self.integral_error + error
        derivative = error - self.prev_error
        adjustment = self.kp * error + self.ki * self.integral_error + self.kd * derivative
        self.quantile = max(0.5, min(3.0, self.quantile + adjustment))
        self.prev_error = error
        return self.quantile * score


def conformal_forecast_intervals(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    scores: np.ndarray,
    alpha: float = 0.1
) -> Tuple[np.ndarray, np.ndarray, List[float]]:
    """
    生成 conformal 预测区间
    
    Returns:
        (lower_bounds, upper_bounds, coverages)
    """
    pid = ConformalPID(alpha=alpha)
    n = len(y_true)
    lower = np.zeros(n)
    upper = np.zeros(n)
    coverages = []
    
    for t in range(n):
        half_width = pid.update(y_true[t], y_pred[t], scores[t])
        lower[t] = y_pred[t] - half_width
        upper[t] = y_pred[t] + half_width
        covered = 1.0 if lower[t] <= y_true[t] <= upper[t] else 0.0
        coverages.append(covered)
    
    # 滚动覆盖率
    window = 30
    rolling_cov = [np.mean(coverages[max(0,i-window):i+1])
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2307.16895 — Conformal PID Control for Time Series Prediction

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：历史月度或日度销量序列、点预测值与其残差、缺货与缺货损失口径；SKU×周期粒度。

**输出**：给定覆盖率（如 90%）的预测区间、可下调的安全库存建议与覆盖率追踪结果，输出给供应链经理做备货与库存决策。

## 执行步骤

1. 准备历史销量序列与点预测残差。
2. 用共形预测校准分位数，输出给定覆盖率的预测区间。
3. 按区间上界重算安全库存。
4. 追踪实际值落入区间的覆盖率并滚动更新。

## 边界与不做

- 何时不用：没有历史残差、或点预测本身不可靠时区间校准失去基础，不适用本技能。
- 能力边界：区间建立在历史可交换性假设上，分布剧烈变化时覆盖率会短期失守；只给区间与库存建议，不保证业务不缺货。

## 技能关联

- **前置**：Skill-Conformal-TS-Intervals.html、Skill-Conformal-TS-Intervals、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Forecast-Driven-Inventory.html、Skill-Forecast-Driven-Inventory、Skill-Hierarchical-Demand-Forecasting-Reconciliation.html、Skill-Hierarchical-Demand-Forecasting-Reconciliation、Skill-Multivariate-Cointegration.html、Skill-Multivariate-Cointegration、Skill-Prophet-Forecasting.html、Skill-Prophet-Forecasting、Skill-SSBC-Small-Sample-Conformal.html、Skill-SSBC-Small-Sample-Conformal、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting
- **延伸**：Skill-Conformal-TS-Intervals.html、Skill-Conformal-TS-Intervals、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Forecast-Driven-Inventory.html、Skill-Forecast-Driven-Inventory、Skill-Hierarchical-Demand-Forecasting-Reconciliation.html、Skill-Hierarchical-Demand-Forecasting-Reconciliation、Skill-Multivariate-Cointegration.html、Skill-Multivariate-Cointegration、Skill-SSBC-Small-Sample-Conformal.html、Skill-SSBC-Small-Sample-Conformal
- **可组合**：Skill-Conformal-TS-Intervals.html、Skill-Conformal-TS-Intervals、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Forecast-Driven-Inventory.html、Skill-Forecast-Driven-Inventory、Skill-Multivariate-Cointegration.html、Skill-Multivariate-Cointegration、Skill-SSBC-Small-Sample-Conformal.html、Skill-SSBC-Small-Sample-Conformal、Skill-Conformal-Prediction-Demand-UQ

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：03-时间序列　·　源卡：`Skill-Conformal-Prediction-Demand-UQ`