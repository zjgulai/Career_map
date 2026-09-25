---
name: "p2s-concept-drift-detection"
title: "Concept Drift Detection — 在线监控模型分布漂移"
description: "触发词：概念漂移、在线漂移监控、ADWIN/DDM、预测失准预警、出价策略失准、重训触发。何时不用：要盯输入特征分布是否偏移时用「数据漂移检测」；要看模型输出指标是否衰减时用「模型性能监控」。安全边界：漂移告警只作为重训与降级建议，不得直接改写出价或预算策略，须由运营确认后执行。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-149"
l3_business: "运行监测"
l3_all: "运行监测 / 投放诊断"
l1_l2_l3: "数据与Agent平台/数据与AI运行/运行监测"
p2s_card_id: "Skill-Concept-Drift-Detection"
p2s_src_domain: "12-ML基础"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "模型上线后会悄悄失准，ADWIN 在漂移发生后 6-12 小时内报警，比等到月底重训提前 20 天发现问题。"
user_try: "试试：监控大促后 CTR 预测模型的误差流，一出现漂移就告警并给出重训建议。"
whenToUse: "当模型预测误差在大促、季节切换后系统性变差、需要在线感知漂移时用本技能；若要判断的是输入特征分布有没有偏移，改用「数据漂移检测」；若要盯的是 AUC、MAPE 一类输出指标衰减，改用「模型性能监控」。"
workflow: "采集模型每日预测值与实际观测值，构成误差流 → 用 ADWIN 自适应窗口检测误差流的均值漂移 → 结合大促与季节日历区分真实漂移与季节性波动 → 触发漂移告警并给出重训或降级建议 → 重训后回看目标指标是否恢复到正常水平"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Concept Drift Detection — 在线监控模型分布漂移

## ① 解决的问题

广告运营面临"大促后CTR预测模型漂移未被感知、出价策略失准导致月均5-8万元广告损耗"——ADWIN/DDM在漂移后6-12小时内触发告警，比月度再训练提前20天感知，年化节省80-110万元

## ② 核心算法逻辑

模型在训练时学习的是历史数据分布 P_train(X, Y)，但生产环境中数据分布会随时间变化——这种现象称为概念漂移（Concept Drift）。分为三类：

## ③ 业务应用场景

场景A：黑五/Prime Day 后广告 CTR 预测模型漂移监控
- 业务问题：大促后 3 天内消费者行为模式剧变，广告 CTR 预测偏差 > 30%，自动出价策略严重失准 - 数据要求：每日模型预测值 + 实际 CTR 日志；模型上线后的预测误差流 - 预期产出：ADWIN 在大促后 6-12 小时内触发漂移告警，比传统月度再训练提前 20 天感知 - 业务价值：及时重训后广告 ROAS 恢复至正常水平，避免约 5-8 万元/月的出价损耗
场景B：退货率预测模型季节性漂移（Q4 旺季）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：大促后及时重训，避免广告出价损耗约 5-8 万元/月；退货模型持续有效，Q4 额外减损约 15-20 万元；年化综合约 80-110 万元（以中型 DTC 为基准）
实施难度：⭐⭐⭐☆☆（需有模型预测日志基础设施，检测器本身轻量）
优先级：⭐⭐⭐⭐☆
评估依据：跨境母婴行业季节性强（Q4、Prime Day、黑五），漂移是常态；检测器一次部署持续收益

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（150 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：3」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from collections import deque

np.random.seed(42)


# ===== 模拟母婴广告 CTR 预测误差流（含漂移点）=====
def simulate_error_stream(n_normal=500, n_drift=300, drift_increase=0.15):
    """模拟广告大促后 CTR 预测误差流"""
    errors_normal = np.random.binomial(1, 0.1, n_normal).astype(float)  # 正常期误差率 10%
    errors_drift = np.random.binomial(1, 0.1 + drift_increase, n_drift).astype(float)  # 漂移后 25%
    return np.concatenate([errors_normal, errors_drift]), n_normal


error_stream, true_drift_point = simulate_error_stream()
print(f"数据流长度: {len(error_stream)}, 真实漂移点: t={true_drift_point}")


# ===== ADWIN 漂移检测器（核心实现）=====
class ADWIN:
    """自适应窗口漂移检测，无需预设窗口大小"""

    def __init__(self, delta=0.002):
        self.delta = delta
        self.window = deque()
        self.total = 0.0
        self.n = 0

    def add_element(self, value):
        self.window.append(value)
        self.total += value
        self.n += 1
        drift_detected = self._check_drift()
        return drift_detected

    def _check_drift(self):
        n = self.n
        total = self.total
        # 检查所有可能的分割点
        n1, sum1 = 0, 0.0
        window_list = list(self.window)
        for i in range(len(window_list) - 1, 0, -1):
            n1 += 1
            sum1 += window_list[i]
            n0 = n - n1
            sum0 = total - sum1
            if n0 < 5 or n1 < 5:
                continue
            mu0 = sum0 / n0
            mu1 = sum1 / n1
            m = 1.0 / (1.0 / n0 + 1.0 / n1)
            eps_cut = np.sqrt(np.log(4 * n / self.delta) / (2 * m))
            if abs(mu0 - mu1) >= eps_cut:
                # 漂移：截断旧数据
                cut = len(window_list) - n1
                for _ in range(cut):
                    removed = self.window.popleft()
                    self.total -= removed
                    self.n -= 1
                return True
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2004.05718，但该号在 arXiv 上是《Principal Neighbourhood Aggregation for Graph Nets》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：每日模型预测值与实际观测值日志（如 CTR 预测 vs 实际 CTR）、模型上线后的预测误差流、大促与季节日历；粒度为日级误差点构成的时间序列。

**输出**：漂移告警（含触发时间与受影响指标）、漂移类型判断与重训建议；供算法与广告运营决定何时重训、何时调整策略。

## 执行步骤

1. 采集每日预测值与真实结果，形成连续的预测误差流
2. 用 ADWIN 自适应窗口持续检测误差分布是否发生均值漂移
3. 结合大促日历判定是季节性正常波动还是真实漂移
4. 触发漂移告警并向算法与运营给出重训建议
5. 跟踪重训上线后的准确率与广告 ROAS 是否恢复正常

## 边界与不做

- 数据不满足：拿不到每日预测值与实际结果的配对日志时无法构造误差流，先补模型预测日志基础设施。
- 何时不用：输入特征分布偏移用「数据漂移检测」，输出指标衰减告警用「模型性能监控」。
- 能力边界：只做漂移检测与告警，不自动重训模型，也不改写出价或预算策略。
- 安全边界：告警只能作为建议，实际策略调整须由运营确认后执行。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-AutoML-Pipeline-Design.html、Skill-AutoML-Pipeline-Design、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Model-Calibration.html、Skill-Model-Calibration、Skill-Model-Performance-Monitor.html、Skill-Model-Performance-Monitor、Skill-Online-Incremental-Learning.html、Skill-Online-Incremental-Learning
- **延伸**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-AutoML-Pipeline-Design.html、Skill-AutoML-Pipeline-Design、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Model-Calibration.html、Skill-Model-Calibration、Skill-Online-Incremental-Learning.html、Skill-Online-Incremental-Learning
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-AutoML-Pipeline-Design.html、Skill-AutoML-Pipeline-Design、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Model-Calibration.html、Skill-Model-Calibration、Skill-Concept-Drift-Detection

---

> 分类：数据与Agent平台/数据与AI运行/运行监测　·　技术族：12-ML基础　·　源卡：`Skill-Concept-Drift-Detection`