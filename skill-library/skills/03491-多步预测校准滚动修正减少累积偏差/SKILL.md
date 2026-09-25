---
name: "p2s-multi-step-ahead-forecast-calibration"
title: "Multi-Step-Ahead Forecast Calibration — 多步预测校准滚动修正减少累积偏差"
description: "触发词：多步校准、分步偏差、滚动修正、系统性低估、Conformal。何时不用：单步短期预测不需要分步校准；要修正大促脉冲本身时用「节日峰值分解」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Multi-Step-Ahead-Forecast-Calibration"
p2s_src_domain: "03-时间序列"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "发现第 6 到 8 周的预测总是偏低，就给每一步单独记偏差并自动上调，大促前不再因为低估而缺货。"
user_try: "试试：用分步偏差滚动校正我这份 8 周锁定预测，把系统性低估的步长修正过来。"
whenToUse: "向供应商锁单或多周滚动预测出现按步长系统性偏差时用；单步短期预测用不着；要剥离大促脉冲时用节日峰值分解。"
workflow: "按步长独立记录预测值与实际销量的偏差 → 用滑动窗口与衰减权重维护各步长偏差估计 → 对当前预测按步长上调或下调 → 输出校准后预测与分位区间"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Multi-Step-Ahead Forecast Calibration — 多步预测校准滚动修正减少累积偏差

## ① 解决的问题

供应链团队面临"大促前8周预测系统性低估18%导致每次缺货但不知道修正方法"——分步偏差滚动校正将大促缺货率从12%降至3%，年化减少缺货损失40-60万元

## ② 核心算法逻辑

论文：Conformal Time Series Forecasting | 年份：2020

## ③ 业务应用场景

场景：母婴卖家向供应商下 8 周预测锁单，每周末更新预测。发现第 6-8 周预测系统性低估 18%（促销备货不足），导致每次大促前 2 周缺货。
数据要求：52 周历史预测值 + 实际销量（用于计算分步偏差），每步独立记录。
校正应用：为步长 6/7/8 各维护独立偏差，识别到低估偏差后自动上调预测。缺货率从 12% 降至 3%。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

40-60 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（69 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from collections import defaultdict

class MultiStepCalibrator:
    """多步预测偏差校正器"""

    def __init__(self, max_horizon: int = 12, decay: float = 0.9, window: int = 20):
        self.max_horizon = max_horizon
        self.decay = decay
        self.window = window
        # 每个步长维护独立误差记录
        self.errors = defaultdict(list)

    def update(self, h: int, y_pred: float, y_actual: float):
        """记录第 h 步的预测误差"""
        self.errors[h].append(y_pred - y_actual)
        if len(self.errors[h]) > self.window:
            self.errors[h].pop(0)

    def bias(self, h: int) -> float:
        """计算第 h 步的加权平均偏差（近期权重更高）"""
        errs = self.errors.get(h, [])
        if not errs:
            return 0.0
        n = len(errs)
        weights = np.array([self.decay ** (n - 1 - i) for i in range(n)])
        weights /= weights.sum()
        return float(np.dot(weights, errs))

    def calibrate(self, forecasts: np.ndarray) -> np.ndarray:
        """校正多步预测序列"""
        calibrated = forecasts.copy()
        for h in range(len(forecasts)):
            step = h + 1  # 1-indexed
            calibrated[h] -= self.bias(step)
        return np.maximum(calibrated, 0)  # 不允许负值

    def quantile_interval(self, h: int, alpha: float = 0.1) -> tuple:
        """返回校正后的预测区间宽度"""
        errs = self.errors.get(h, [])
        if len(errs) < 5:
            return (0, 0)
        abs_errs = np.abs(errs)
        q_lo = np.quantile(abs_errs, alpha / 2)
        q_hi = np.quantile(abs_errs, 1 - alpha / 2)
        return (q_lo, q_hi)

# 测试
np.random.seed(42)
cal = MultiStepCalibrator(max_horizon=8)

# 模拟 30 周历史：第 6/7/8 步存在 +15% 低估偏差
for week in range(30):
    for h in range(1, 9):
        y_pred = 100.0
        bias = 15 if h >= 6 else 0
        y_actual = 100 + bias + np.random.randn() * 5
        cal.update(h, y_pred, y_actual)

# 验证偏差检测
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2002.10561，但该号在 arXiv 上是《Learning the mapping $\mathbf{x}\mapsto \sum_{i=1}^d x_i^2$: the cost of finding the needle in a haystack》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Conformal Time Series Forecasting》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：52 周历史预测值与实际销量，需按步长（如第 6/7/8 周）分别记录；粒度：SKU×周×步长。

**输出**：校准后的多步预测、各步长偏差估计与分位区间，供锁单量与安全库存设定使用。

## 执行步骤

1. 按步长对齐历史预测与实际销量
2. 估计每个步长的偏差与波动
3. 滚动更新偏差并校准当前预测
4. 输出校准结果与分步置信区间

## 边界与不做

- 数据不满足时不用：历史预测值未留档、无法按步长对齐时，偏差无从估计。
- 能力边界：只校正系统性偏差，不解释偏差的业务成因，也不改变下单向供应商的动作。

## 技能关联

- **可组合**：Skill-Multi-Step-Ahead-Forecast-Calibration

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：03-时间序列　·　源卡：`Skill-Multi-Step-Ahead-Forecast-Calibration`