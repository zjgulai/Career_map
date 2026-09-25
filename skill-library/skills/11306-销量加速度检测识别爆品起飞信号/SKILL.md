---
name: "p2s-sales-velocity-momentum-detection"
title: "Sales Velocity Momentum Detection — BSR 销量加速度检测识别爆品起飞信号"
description: "触发词：销量加速度、BSR动量、起飞信号、竞品预警。何时不用：只有单次排名快照、没有连续时序时无法计算加速度；判断品类整体趋势用趋势预测类技能。安全边界：历史销量与排名数据应使用合规授权的数据源。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-021"
l3_business: "趋势监测"
l3_all: "趋势监测 / 竞品研究"
l1_l2_l3: "业务运营/产品与创新/趋势监测"
p2s_card_id: "Skill-Sales-Velocity-Momentum-Detection"
p2s_src_domain: "03-时间序列"
quality_tier: "preview"
user_summary: "用速度、加速度与排名动量三层信号，在竞品真正起飞之前发出预警。"
user_try: "试试：帮我监控这批竞品 ASIN，哪些 SKU 正在起飞、需要提前调整广告出价。"
whenToUse: "本卡属「趋势监测」。需要从连续 BSR 与销量序列中识别单个 SKU 的起飞信号时用本卡；判断品类级趋势方向时用品类趋势预测类技能。"
workflow: "采集每日 BSR 与销量 → 计算近 7 日速度 → 计算加速度与排名动量 → 输出起飞预警"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Sales Velocity Momentum Detection — BSR 销量加速度检测识别爆品起飞信号

## ① 解决的问题

竞品监控人员面临"爆品销量已翻倍才发现反应已经来不及"——三层动量信号检测在爆品真正起飞前7-14天发出预警，广告防御响应窗口扩大保护年化GMV 50万元

## ② 核心算法逻辑

论文：Momentum Detection in Time Series: A VelocityAcceleration Framework for Early Trend Identification | 年份：2020

## ③ 业务应用场景

场景：某卖家追踪竞品母乳储奶袋品类，需要提前识别哪些 SKU 正在起飞（可能成为潜在竞争威胁或跟品机会）。
数据要求：竞品 ASIN 的每日 BSR、Keepa 历史销量估算，持续 60 天追踪。
应用：系统识别到某 SKU 连续 5 天速度加速 + BSR 从 5000 → 800，提前 10 天预警。竞品分析团队及时调整广告出价防御，避免份额被蚕食。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

50 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（72 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np

def sales_momentum_detector(
    daily_sales: np.ndarray,
    bsr_ranks: np.ndarray,
    velocity_threshold: float = 1.5,
    bsr_threshold: float = 1.2
) -> dict:
    """
    销量动量检测器
    daily_sales: 日销量序列 (T,)
    bsr_ranks: 对应 BSR 排名序列 (T,)，越小越好
    velocity_threshold: 速度异常阈值（标准差倍数）
    bsr_threshold: BSR 改善比率阈值
    """
    n = len(daily_sales)
    assert n >= 14, "至少需要 14 天数据"

    velocities = []
    accelerations = []
    bsr_momentums = []
    signals = []

    for t in range(14, n):
        # 速度：近7日 vs 前7日
        v = np.mean(daily_sales[t-7:t]) - np.mean(daily_sales[t-14:t-7])
        velocities.append(v)

        # 加速度
        if len(velocities) >= 2:
            a = velocities[-1] - velocities[-2]
        else:
            a = 0
        accelerations.append(a)

        # BSR 动量（排名改善）
        bsr_m = bsr_ranks[t-14] / (bsr_ranks[t] + 1e-6)
        bsr_momentums.append(bsr_m)

    velocities = np.array(velocities)
    mu_v = np.mean(velocities)
    sigma_v = np.std(velocities) + 1e-8

    for i, (v, a, bsr_m) in enumerate(zip(velocities, accelerations, bsr_momentums)):
        sig = (v > mu_v + velocity_threshold * sigma_v) and (a > 0) and (bsr_m > bsr_threshold)
        signals.append(sig)

    signal_dates = [i + 14 for i, s in enumerate(signals) if s]
    return {
        'velocities': velocities,
        'accelerations': np.array(accelerations),
        'bsr_momentums': np.array(bsr_momentums),
        'signal_days': signal_dates,
        'latest_signal': signals[-1] if signals else False
    }

# 测试：模拟爆品起飞场景
np.random.seed(42)
n = 60
sales = np.random.poisson(50, n).astype(float)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2006.11287，但该号在 arXiv 上是《Discovering Symbolic Models from Deep Learning with Inductive Biases》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《Momentum Detection in Time Series: A VelocityAcceleration Framework for Early Trend Identification》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：竞品 ASIN 的每日 BSR 与历史销量估算，需要连续 60 天以上的追踪数据。

**输出**：每个 SKU 的速度、加速度与动量得分，输出起飞预警清单与预警提前天数，供广告与备货团队响应。

## 执行步骤

1. 采集竞品 ASIN 的每日 BSR 与销量估算
2. 计算近 7 日与前 7 日的速度差
3. 计算加速度与 BSR 排名动量
4. 命中三层信号时输出起飞预警
5. 给出广告防御或跟品的响应建议

## 边界与不做

- 只有单次排名快照、没有连续时序数据时不用本卡
- 本卡只产出信号与预警，不自动执行广告出价调整
- 历史销量与排名数据应使用合规授权的数据源

## 技能关联

- **可组合**：Skill-Sales-Velocity-Momentum-Detection

---

> 分类：业务运营/产品与创新/趋势监测　·　技术族：03-时间序列　·　源卡：`Skill-Sales-Velocity-Momentum-Detection`