---
name: "p2s-holiday-spike-demand-decomposition"
title: "Holiday Spike Demand Decomposition — 节假日需求峰值分解（Prime Day/黑五）"
description: "触发词：节日脉冲分解、Prime Day 峰值、黑五备货、高斯脉冲、增长率剥离。何时不用：品类全年平稳无大促脉冲时不必分解；要把大促 lift 与基线分别建模分别备货时用「大促需求分解（Base-Lift）」，只量化每月季节倍率时用「STL 季节性分解」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟 / 经营预测"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Holiday-Spike-Demand-Decomposition"
p2s_src_domain: "03-时间序列"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把 Prime Day、黑五这类节日脉冲从销量里剥出来，看清真实增长速度，别再按被抬高的趋势过量备货。"
user_try: "试试：用高斯脉冲分解我近 36 个月的日销，告诉我剥掉节日峰值后的真实年增长率。"
whenToUse: "怀疑节日峰值被误算进年度增长趋势、需要还原真实增长率时用；要把大促 lift 与基线分别备货时用大促需求分解；只做季节因子量化时用 STL 季节性分解。"
workflow: "标注历年节日日期，准备 36 个月日度或周度销量 → 为每个节日配置高斯脉冲参数（日期、幅度、扩散 σ） → 分解出趋势、节日脉冲与残差并剔除脉冲 → 用剔除脉冲后的序列重估增长率并修正当季补货量"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Holiday Spike Demand Decomposition — 节假日需求峰值分解（Prime Day/黑五）

## ① 解决的问题

采购面临"Prime Day后连续3年过度备货因为把节日峰值误算入年度增长趋势"——节日脉冲分解剥离真实增长率从35%修正为18%，年化降低FBA长库龄费用15-25万元

## ② 核心算法逻辑

论文：Time Series Decomposition with Gaussian Pulse Modeling for Holiday Effects | 年份：2016

## ③ 业务应用场景

场景：某母婴卖家连续 3 年 Prime Day 后过度备货，因为模型把「Prime Day 需求高峰」算入了年度增长趋势，导致第四季度常规补货量虚高 20%。
数据要求：36 个月日度/周度销量，历年节日日期标注，前置期数据。
分解应用：剥离 Prime Day/黑五脉冲后，真实年增长率从看似 35% 修正为 18%，第四季度常规补货量下调 15%，减少滞销库存。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

15-25 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（77 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np

def gaussian_holiday_effect(t: np.ndarray, holiday_day: int, amplitude: float, sigma: float) -> np.ndarray:
    """高斯脉冲节日效应"""
    return amplitude * np.exp(-0.5 * ((t - holiday_day) / sigma) ** 2)

def decompose_holiday_spike(
    y: np.ndarray,
    holiday_days: list,  # [(day_index, amplitude_prior, sigma), ...]
    trend_window: int = 30
) -> dict:
    """
    节日脉冲分解
    y: 日度销量序列
    holiday_days: 节日配置列表
    trend_window: 趋势平滑窗口
    """
    t = np.arange(len(y))

    # 构建节日脉冲矩阵
    H = np.zeros(len(y))
    holiday_components = {}
    for hday, amp, sigma in holiday_days:
        h_comp = gaussian_holiday_effect(t, hday, amp, sigma)
        # 节后抑制（购买提前，节后低谷）
        post_suppress = gaussian_holiday_effect(t, hday + int(sigma * 1.5), -amp * 0.25, sigma * 0.8)
        H += h_comp + post_suppress
        holiday_components[hday] = h_comp + post_suppress

    # 剥离节日效应后的序列
    y_deholiday = y - H

    # 简单移动平均提取趋势
    def moving_avg(x, w):
        result = np.zeros(len(x))
        for i in range(len(x)):
            lo = max(0, i - w // 2)
            hi = min(len(x), i + w // 2 + 1)
            result[i] = np.mean(x[lo:hi])
        return result

    trend = moving_avg(y_deholiday, trend_window)
    seasonal = y_deholiday - trend
    residual = y - trend - seasonal - H

    return {
        'trend': trend,
        'seasonal': seasonal,
        'holiday': H,
        'residual': residual,
        'holiday_components': holiday_components,
        'y_deholiday': y_deholiday
    }

# 测试：模拟 365 天含 Prime Day + 黑五的销量
np.random.seed(42)
t = np.arange(365)
base = 50 + t * 0.05  # 趋势
seasonal = 10 * np.sin(2 * np.pi * t / 365)  # 年周期
prime_day = gaussian_holiday_effect(t, 200, 300, 5)   # Prime Day（第200天，前后5天窗口）
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1609.07528，但该号在 arXiv 上是《Compressed Hypothesis Testing: To Mix or Not to Mix?》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Time Series Decomposition with Gaussian Pulse Modeling for Holiday Effects》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：36 个月日度或周度销量，历年节日日期标注，前置期数据；粒度：SKU×日，可按周聚合。

**输出**：剥离节日脉冲后的真实增长率、各节日脉冲幅度与修正后的季度常规补货量建议，供备货计划与增长复盘使用。

## 执行步骤

1. 为每个节日配置脉冲参数并构建节日脉冲矩阵
2. 把序列拆成趋势、节日脉冲与残差三层
3. 剔除脉冲后重估年度增长趋势
4. 按修正增长率下调节日后常规补货量
5. 输出增长率修正说明与年度备货调整建议

## 边界与不做

- 数据不满足时不用：历史不足 2 年、或没有历年节日日期标注时，脉冲与趋势无法稳定分离。
- 能力边界：只做历史分解与增长率修正，不预测今年节日峰值的大小与持续天数。

## 技能关联

- **可组合**：Skill-Holiday-Spike-Demand-Decomposition

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：03-时间序列　·　源卡：`Skill-Holiday-Spike-Demand-Decomposition`