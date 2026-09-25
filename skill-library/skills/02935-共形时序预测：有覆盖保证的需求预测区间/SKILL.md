---
name: "p2s-conformal-time-series-forecasting"
title: "Conformal Time Series Forecasting — 共形时序预测：有覆盖保证的需求预测区间"
description: "触发词：共形时序、滚动校准窗口、预测区间、补货决策规则、覆盖率回测。何时不用：需要分季节校准并重算安全库存用「共形时序预测区间」，要框架级校准集设计用「共形预测区间框架」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Conformal-Time-Series-Forecasting"
p2s_src_domain: "03-时间序列"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "给每周补货计划配上可信区间，用悲观量下单、乐观量留仓储，库存跌破下限就触发加急。"
user_try: "试试：用历史 28 天预测残差给我的补货计划输出 90% 区间，并给出补货量和加急触发线。"
whenToUse: "本卡面向每周滚动补货的区间落地：需要把区间直接翻译成补货量、仓储预留与加急触发规则时用；要分季节校准并重算安全库存的，用共形时序区间类技能。"
workflow: "用历史 28 天预测残差构建滚动校准窗口 → 输出目标覆盖率下的预测区间 → 把区间映射为补货量、仓储预留与加急触发线 → 回测覆盖率并按预测周期标定窗口长度"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Conformal Time Series Forecasting — 共形时序预测：有覆盖保证的需求预测区间

## ① 解决的问题

计划经理面临预测区间不可信——共形时序将超卖率降30%，年化省14万元

## ② 核心算法逻辑

时序共形预测的挑战

## ③ 业务应用场景

业务问题：WF-A 工作流每周生成补货计划。点预测告诉运营"下周需求 1000 件"，但这个数字没有置信度信息：是±50件的高置信度，还是±400件的高不确定度？不同置信度对应完全不同的补货策略。
共形预测应用： 1. 用历史28天的预测残差构建滚动校准窗口 2. 输出预测区间：`[800, 1200]`（90% 覆盖） 3. 业务决策规则： - 补货量 = P10（悲观量），避免过度库存 - 仓储预留 = P90（乐观量），避免仓储不足 - 加急物流触发 = 若当前库存 < P10，立即触发加急补货
关键指标验证：回测28天，90%区间的实际覆盖率应在 85-95% 之间（容忍±5%）。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

易处：纯 Python 实现，无依赖；滚动校准概念简单；任意预测模型均可使用
难处：窗口大小需要业务标定（推荐 2×预测周期）；强季节性数据需要季节性分层校准
前提：需要已有点预测模型（任意模型均可，本技能仅添加区间保证）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（376 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/time_series/conformal_time_series_forecasting` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/03-时间序列/Skill-Conformal-Time-Series-Forecasting.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Conformal Time Series Forecasting — 共形时序预测
滚动校准窗口 + EnbPI 集成引导预测区间

纯 Python 标准库 + statistics，无 sklearn/pandas 依赖
Python 3.14 兼容
"""
from __future__ import annotations

import math
import random
import statistics
from dataclasses import dataclass


# ─── 数据结构 ────────────────────────────────────────────────────────────────

@dataclass
class TimeSeriesRecord:
    """单步时序观测记录"""
    timestamp: int    # 时间步（整数索引或 Unix 时间戳）
    actual: float     # 真实值
    predicted: float  # 点预测值（来自任意预测模型）

    @property
    def residual(self) -> float:
        return self.actual - self.predicted


@dataclass
class PredictionInterval:
    """共形预测区间"""
    timestamp: int
    point_forecast: float
    lower: float           # 下界（P_alpha/2）
    upper: float           # 上界（P_{1-alpha/2}）
    alpha: float           # 显著性水平（0.10 = 90% 区间）
    calibration_size: int  # 实际使用的校准样本数

    @property
    def width(self) -> float:
        return round(self.upper - self.lower, 4)

    @property
    def coverage_ratio(self) -> float:
        """P90/P10 比值（越接近1越确定）"""
        if self.lower <= 0:
            return float("inf")
        return round(self.upper / self.lower, 4)

    def contains(self, actual: float) -> bool:
        return self.lower <= actual <= self.upper


# ─── 滚动共形预测器 ──────────────────────────────────────────────────────────

class RollingConformalForecaster:
    """
    滚动校准窗口共形预测器
    每步接收新的真实值，更新残差队列，输出下一步的预测区间
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：已有点预测模型的逐期预测值与实际值（用于构造残差）、预测周期长度；卡面示例用 28 天滚动校准窗口。

**输出**：目标覆盖率（如 90%）的预测区间、由区间派生的补货量、仓储预留量与加急物流触发线，以及区间覆盖率回测结果，输出给补货计划经理。

## 执行步骤

1. 用历史 28 天的预测残差构建滚动校准窗口。
2. 输出目标覆盖率下的预测区间。
3. 把区间映射为补货量、仓储预留与加急触发规则。
4. 回测 28 天覆盖率，并按预测周期标定窗口长度。

## 边界与不做

- 何时不用：没有已有点预测模型时区间无从锚定；强季节性数据未经分层校准时覆盖率不可信。
- 能力边界：窗口大小需按业务标定（推荐 2 倍预测周期），标定不当会牺牲覆盖率；本技能只加区间保证，不改进点预测本身。

## 技能关联

- **前置**：Skill-Conformal-Prediction-Demand-UQ.html、Skill-Conformal-Prediction-Demand-UQ、Skill-Conformal-Risk-Assessment.html、Skill-Conformal-Risk-Assessment、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting
- **延伸**：Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-EventCast-LLM-Event-Forecasting.html、Skill-EventCast-LLM-Event-Forecasting
- **可组合**：Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-Supplier-Lead-Time-Buffer.html、Skill-Supplier-Lead-Time-Buffer、Skill-Conformal-Time-Series-Forecasting

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：03-时间序列　·　源卡：`Skill-Conformal-Time-Series-Forecasting`