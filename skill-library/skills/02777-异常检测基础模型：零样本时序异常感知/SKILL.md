---
name: "p2s-anomaly-detection-foundation-model"
title: "Anomaly Detection Foundation Model — 异常检测基础模型：零样本时序异常感知"
description: "触发词：时序异常检测、零样本异常感知、SKU 指标巡检、异常优先级排序、缺货预警。何时不用：只判断自然流量骤降而广告流量正常这类单点突变时用「Listing 压制检测」；只判断核心词是否跌出 Page1 并触发恢复动作时用「排名跌出自动恢复」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-065"
l3_business: "商品诊断"
l3_all: "商品诊断 / 渠道经营分析"
l1_l2_l3: "业务运营/渠道经营/商品诊断"
p2s_card_id: "Skill-Anomaly-Detection-Foundation-Model"
p2s_src_domain: "19-风控反欺诈"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把几十个 SKU 的上百条指标序列一次扫完，异常按严重度排队，运营只看最该先处理的那几条。"
user_try: "试试：对 35 个 SKU 的销量、ROAS、退货率、评论分、CTR 做一次全域巡检，按优先级排出今天必须处理的异常。"
whenToUse: "当需要对多 SKU × 多指标（销量/ROAS/退货率/评论分/CTR）的日度序列做全域巡检、按严重度排队异常时用本技能；若只盯自然流量与广告流量的解耦来判定 Listing 被压制，用「Listing 压制检测」；若只判断核心词是否跌出 Page1 并触发恢复，用「排名跌出自动恢复」。"
workflow: "接入 SKU × 指标的日度序列，备齐 14 天以上历史 → 用基础模型滚动预测基线并计算异常分数 → 汇总全域异常热力图与优先级队列 → 分类异常类型并分派处置"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Anomaly Detection Foundation Model — 异常检测基础模型：零样本时序异常感知

## ① 解决的问题

运营每天需手动检查35个SKU×8个指标共280个时序数据点是否异常——时序基础模型零样本异常检测1小时内自动发现全域异常按优先级排队处理，提前发现缺货/竞品攻击/点击欺诈年化挽回20-60万元

## ② 核心算法逻辑

ChronosAD 的反直觉设计：

## ③ 业务应用场景

业务问题：运营团队每天需要手动检查 35 个 SKU × 8 个关键指标 = 280 个时序数据点是否异常。大促期间异常更多，根本看不过来，重要异常被淹没在数据海洋中。
数据要求： - 各 SKU 的日度指标序列（销量/ROAS/退货率/评论分/CTR） - 历史数据（越多越好，但最少 14 天即可）
预期产出： - 全域异常热力图：哪个 SKU × 哪个指标今天异常 - 异常优先级队列：按异常严重程度排序，运营只需处理 Top 5 - 异常类型分类：缺货/竞品/质量/欺诈（基于异常方向和幅度）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
异常发现时间：人工每日巡检（可能 24h 延迟）→ 自动 1h 内预警
提前发现缺货/差评攻击/点击欺诈：每次挽回 ¥5-20 万
减少运营人工巡检工作量：每人每天节省 2-3 小时，年化 ¥5-15 万
年化综合 ROI：¥20-60 万
实施难度：⭐⭐⭐☆☆（需要 Chronos/TimesFM 集成；多指标实时监控需要数据管道；约 3-4 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（163 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/risk_fraud/anomaly_detection_foundation_model` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/19-风控反欺诈/Skill-Anomaly-Detection-Foundation-Model.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Anomaly Detection Foundation Model (ChronosAD-style)
时序基础模型驱动的零样本异常检测
"""
import numpy as np
from scipy import stats


class FoundationAnomalyDetector:
    """
    ChronosAD 风格的异常检测器
    核心：用预测误差量化异常程度
    生产环境推荐: pip install chronos-forecasting 后替换预测模块
    """

    def __init__(self, context_len: int = 30, sensitivity: float = 2.5):
        self.context_len = context_len
        self.sensitivity = sensitivity  # 异常阈值（σ倍数）

    def _foundation_predict(self, history: np.ndarray, steps: int = 1) -> tuple:
        """
        模拟基础模型预测（生产替换为 ChronosPipeline.predict()）
        返回 (预测中位数, 预测标准差)
        """
        if len(history) < 7:
            return history.mean(), history.std() + 1e-8

        # 简化预测：局部趋势 + 季节性
        recent = history[-min(14, len(history)):]
        trend = np.polyfit(range(len(recent)), recent, 1)[0]

        # 季节性（7天周期）
        if len(history) >= 14:
            weekly = np.array([history[i::7].mean() for i in range(7)])
            seasonal_factor = weekly[len(history) % 7] / (weekly.mean() + 1e-8)
        else:
            seasonal_factor = 1.0

        pred_mean = (recent[-1] + trend) * seasonal_factor
        # 不确定性：历史方差 + 预测步数（越远越不确定）
        pred_std = recent.std() * (1 + 0.1 * steps) + 1e-8

        return float(pred_mean), float(pred_std)

    def compute_anomaly_scores(self, timeseries: np.ndarray) -> np.ndarray:
        """
        计算每个时间点的异常分数
        使用滑动窗口：用历史预测当前值
        """
        n = len(timeseries)
        scores = np.zeros(n)

        for t in range(min(self.context_len, 7), n):
            history = timeseries[max(0, t - self.context_len):t]
            pred_mean, pred_std = self._foundation_predict(history)
            actual = timeseries[t]
            # 标准化异常分
            scores[t] = abs(actual - pred_mean) / pred_std

        return scores
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2606.01300 — ChronosAD: Leveraging Time Series Foundation Models for Accurate Anomaly Detection

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：各 SKU 的日度指标序列（销量、ROAS、退货率、评论分、CTR 等指标），历史序列最少 14 天、越长越准；粒度为 SKU × 指标 × 日。

**输出**：全域异常热力图（SKU × 指标）、按严重程度排序的异常优先级队列（运营只处理 Top 5）、异常类型分类（缺货/竞品/质量/欺诈）；供运营与风控值班按队列处置。

## 执行步骤

1. 汇总各 SKU 的日度指标序列（销量/ROAS/退货率/评论分/CTR），至少备齐 14 天历史
2. 用基础模型对每条时序做滚动预测，以预测误差（σ 倍数）作为异常分数
3. 汇总成 SKU × 指标的全域异常热力图
4. 按异常严重程度排序，输出只含 Top 5 的异常优先级队列
5. 按异常方向与幅度归类异常类型（缺货/竞品/质量/欺诈），派发给对应处置人

## 边界与不做

- 数据不满足：历史短于 14 天或指标口径不统一（如把促销期与平时混算）时基线不可信，先攒数据再检测。
- 何时不用：只想定位自然流量与广告流量解耦的单点突变，用「Listing 压制检测」；只想判断核心词跌出 Page1 并生成恢复动作，用「排名跌出自动恢复」。
- 能力边界：只做发现、排序与归类，不做根因确认与处置执行；灵敏度阈值需人工调整；卡页的年化 ¥20-60 万为案例估算。

## 技能关联

- **前置**：Skill-Account-Health-Proactive-Monitor.html、Skill-Account-Health-Proactive-Monitor、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Online-Incremental-Learning.html、Skill-Online-Incremental-Learning、Skill-Time-Series-Foundation-Model.html、Skill-Time-Series-Foundation-Model、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection、Skill-VOC-Supply-Chain-Signal-Bridge.html、Skill-VOC-Supply-Chain-Signal-Bridge
- **延伸**：Skill-Account-Health-Proactive-Monitor.html、Skill-Account-Health-Proactive-Monitor、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Online-Incremental-Learning.html、Skill-Online-Incremental-Learning、Skill-VOC-Supply-Chain-Signal-Bridge.html、Skill-VOC-Supply-Chain-Signal-Bridge
- **可组合**：Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Online-Incremental-Learning.html、Skill-Online-Incremental-Learning、Skill-Anomaly-Detection-Foundation-Model

---

> 分类：业务运营/渠道经营/商品诊断　·　技术族：19-风控反欺诈　·　源卡：`Skill-Anomaly-Detection-Foundation-Model`