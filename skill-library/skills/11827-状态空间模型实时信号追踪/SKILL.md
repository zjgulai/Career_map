---
name: "p2s-ssm-realtime-signal-tracking"
title: "SSM Realtime Signal Tracking — 状态空间模型实时信号追踪"
description: "触发词：实时出价、卡尔曼滤波、竞争强度、胜率信号、状态空间、ACoS 波动。何时不用：每天或每几小时一次的粗粒度调价用常规预算分配；需要分钟级跟随竞争强度、抑制时段性 ACoS 飙升时用本卡。安全边界：调价幅度须设上下限与冷却期，避免频繁改价触发平台风控，不得用于探测或干扰竞品投放。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 预算分配"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-SSM-Realtime-Signal-Tracking"
p2s_src_domain: "03-时间序列"
quality_tier: "preview"
user_summary: "用卡尔曼滤波实时盯住竞争强度，在竞争高峰自动收价、低谷自动提价，压住 ACoS。"
user_try: "试试：这是我每 5 分钟的竞价胜率和花费数据，帮我用状态空间模型追踪竞争强度并给出调价阈值。"
whenToUse: "与「多目标出价」相比：按大促阶段切换目标用那张卡；需要分钟级实时跟随竞争强度、抑制时段性 ACoS 飙升时用本卡。"
workflow: "按 5 分钟粒度接入竞价胜率等信号 → 用卡尔曼滤波估计竞争强度潜变量（水平 + 趋势） → 设定阈值：超过则下调出价、低于则上调 → 回测高峰时段与全天综合 ACoS 的改善"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# SSM Realtime Signal Tracking — 状态空间模型实时信号追踪

## ① 解决的问题

广告优化面临"5分钟批量出价错过竞价高峰段"——卡尔曼滤波<1ms实时追踪竞争强度，动态调价使综合ACoS从18%降至15.5%，年化节省14-20万元

## ② 核心算法逻辑

论文：Kalman Filter for RealTime Signal Tracking | 年份：1960

## ③ 业务应用场景

场景：某母婴卖家（婴儿奶瓶，月销 2,000+）在 Amazon 自动广告上使用规则出价，每 4 小时更新一次 bid。分析发现：竞品在工作日 10-12 点加大投放，自己的 bid 跟不上，这段时间 ACoS 从正常 18% 飙升到 34%，CPC 高出 60%。
SSM 实时追踪方案： 1. 每 5 分钟接收一次广告竞价胜率信号（win rate） 2. 卡尔曼滤波追踪"竞争强度"潜变量的实时状态 3. 当预测竞争强度超过阈值，自动下调 bid 10-15%（降低竞争时段的无效消耗） 4. 竞争强度低于阈值，自动上调 bid（抓住低成本时段）
效果：竞争高峰段 ACoS 从 34% → 22%，全天综合 ACoS 从 18% → 15.5%，广告预算节省 ~15%。月广告费 $8,000 场景下，年化节省约 14-20 万元。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

14-20 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（138 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from dataclasses import dataclass
from typing import Tuple

@dataclass
class KalmanState:
    """卡尔曼滤波器状态"""
    x: np.ndarray      # 状态向量 [level, trend]
    P: np.ndarray      # 状态协方差矩阵

class KalmanSignalTracker:
    """
    实时信号追踪的卡尔曼滤波器
    追踪广告竞争强度的隐状态（level + trend）
    """
    def __init__(self, process_noise_level=0.1, process_noise_trend=0.02, obs_noise=0.5):
        # 状态转移矩阵（局部线性趋势模型）
        self.F = np.array([[1, 1],   # level_t = level_{t-1} + trend_{t-1}
                           [0, 1]])  # trend_t = trend_{t-1}
        # 观测矩阵（只观测 level）
        self.H = np.array([[1, 0]])
        # 过程噪声协方差
        self.Q = np.diag([process_noise_level**2, process_noise_trend**2])
        # 观测噪声协方差
        self.R = np.array([[obs_noise**2]])

    def initialize(self, y0: float) -> KalmanState:
        """初始化滤波器"""
        x0 = np.array([y0, 0.0])
        P0 = np.eye(2) * 1.0
        return KalmanState(x=x0, P=P0)

    def predict(self, state: KalmanState) -> KalmanState:
        """预测步骤"""
        x_pred = self.F @ state.x
        P_pred = self.F @ state.P @ self.F.T + self.Q
        return KalmanState(x=x_pred, P=P_pred)

    def update(self, pred_state: KalmanState, y: float) -> Tuple[KalmanState, float]:
        """更新步骤，返回新状态和创新值"""
        y_vec = np.array([[y]])
        # 创新（预测误差）
        innovation = y_vec - self.H @ pred_state.x
        # 创新协方差
        S = self.H @ pred_state.P @ self.H.T + self.R
        # 卡尔曼增益
        K = pred_state.P @ self.H.T @ np.linalg.inv(S)
        # 状态更新
        x_new = pred_state.x + (K @ innovation).flatten()
        P_new = (np.eye(2) - K @ self.H) @ pred_state.P
        return KalmanState(x=x_new, P=P_new), float(innovation[0, 0])

    def step(self, state: KalmanState, y: float) -> Tuple[KalmanState, dict]:
        """完整的预测+更新步骤"""
        pred = self.predict(state)
        new_state, innovation = self.update(pred, y)
        uncertainty = np.sqrt(pred.P[0, 0])
        return new_state, {
            'estimated_level': new_state.x[0],
            'estimated_trend': new_state.x[1],
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2003.00744，但该号在 arXiv 上是《PhoBERT: Pre-trained language models for Vietnamese》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Kalman Filter for RealTime Signal Tracking》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：分钟级竞价胜率、点击、花费与 ACoS 数据（卡页为每 5 分钟一次更新），以及历史正常 ACoS 基准（案例 18%）与当前出价规则。

**输出**：竞争强度潜变量的实时估计与趋势、调价触发建议（卡页为超过阈值下调 10–15%）、高峰时段 ACoS 改善评估，供广告优化师配置出价规则。

## 执行步骤

1. 接入分钟级竞价胜率与花费信号，确认更新频率稳定。
2. 建立局部线性趋势状态空间模型，初始化水平与趋势状态。
3. 逐步预测与更新，输出竞争强度的实时估计。
4. 设定上下调价阈值与幅度（卡页 10–15%）并配置冷却期。
5. 回测高峰时段与全天 ACoS，验证改善后再上线。

## 边界与不做

- 何时不用：拿不到分钟级胜率信号、或预算规模小到无需日内调价时不要用；粗粒度日调价不必上状态空间模型。
- 能力边界：产出信号估计与调价阈值规则，不直接改价；ACoS 18%→15.5% 等为卡页案例值，不保证复现。
- 安全边界：调价必须设上下限，频繁改价可能触发平台风控。

## 技能关联

- **可组合**：Skill-SSM-Realtime-Signal-Tracking

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：03-时间序列　·　源卡：`Skill-SSM-Realtime-Signal-Tracking`