---
name: "p2s-time-series-foundation-model"
title: "Time Series Foundation Model — 时序基础模型：零样本跨品类需求预测"
description: "触发词：基础模型、零样本、冷启动、分位备货、跨品类迁移。何时不用：历史充足、追求最优精度时用精调模型；要一次批量预测数千长尾 SKU 时用「时序基础模型零样本预测」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Time-Series-Foundation-Model"
p2s_src_domain: "03-时间序列"
quality_tier: "preview"
user_summary: "上架两周、只有十四天数据也能直接出预测，还能给出保守、基准、激进三套备货方案。"
user_try: "试试：用 Chronos 零样本预测这款配件未来 8 周需求，给我 P10/P50/P90 三套备货方案。"
whenToUse: "新品只有 2-4 周数据、无法训练专用模型时用；历史充足时优先精调模型；批量长尾零样本预测用时序基础模型零样本预测。"
workflow: "整理新品 2-4 周实际销量（可选叠加同品类成熟品历史） → 调用预训练基础模型做零样本推理 → 输出未来 8 周 P10/P50/P90 预测 → 给出保守、基准、激进三套备货方案并与 Prophet 对比"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Time Series Foundation Model — 时序基础模型：零样本跨品类需求预测

## ① 解决的问题

新品上架仅2周只有14天销量数据无法训练需求预测模型——时序基础模型Chronos零样本直接预测新品未来需求给出P10/P50/P90备货方案，新品冷启动预测误差从±60%降至±25%年化减少备货失误20-60万元

## ② 核心算法逻辑

时序基础模型 vs 传统时序模型：

## ③ 业务应用场景

业务问题：新款吸奶器配件上架 Amazon 2 周，只有 14 天销量数据（日均销量 8-12 件），需要决定 60 天后的备货量。传统 Prophet 在此数据量下预测误差 > 60%，而 Chronos 可以利用预训练知识迁移相似品类的季节性模式。
数据要求： - 仅需 2-4 周实际销量数据 - （可选）同品类成熟产品的历史数据作为参考
预期产出： - 未来 8 周每日需求预测（P10/P50/P90） - 三种备货方案：保守/基准/激进 - 基础模型 vs Prophet 的预测对比（量化改善）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
新品冷启动预测精度提升（±60% → ±25%）：减少首批备货损失 ¥5-20 万
新市场进入备货优化：首年损失降低 40%，¥10-30 万
零样本跨品类迁移：省去 3-6 个月等待数据期，加快决策周期
年化综合 ROI：¥20-60 万
实施难度：⭐⭐⭐☆☆（`pip install chronos-forecasting` 或 `timesfm` 即可使用；需要 GPU 推理但 CPU 模式也可运行；约 1-2 周接入）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（145 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/time_series/time_series_foundation_model` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/03-时间序列/Skill-Time-Series-Foundation-Model.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Time Series Foundation Model for E-Commerce
Chronos/TimesFM 风格的时序基础模型：轻量本地实现演示
生产环境推荐使用: pip install chronos-forecasting 或 pip install timesfm
"""
import numpy as np
from scipy import stats


class MinimalFoundationForecaster:
    """
    时序基础模型的轻量近似实现（无需GPU/大模型）
    生产环境用: from chronos import ChronosPipeline
    """

    def __init__(self, context_len: int = 512, pred_len: int = 28):
        self.context_len = context_len
        self.pred_len = pred_len
        # 模拟预训练学到的季节性先验知识
        self._seasonal_priors = {
            'weekly': [0.8, 1.0, 1.1, 1.2, 1.3, 1.5, 0.9],   # 周一到周日
            'monthly_peak': [0.9, 0.95, 1.0, 0.95, 1.0, 1.1, 1.2,  # 月初到月末
                             1.1, 1.0, 0.95, 0.9, 0.95, 1.0, 1.05,
                             1.1, 1.15, 1.1, 1.0, 0.95, 0.9, 0.85,
                             0.9, 0.95, 1.0, 1.05, 1.1, 1.2, 1.15,
                             1.0, 0.9, 0.85],
        }

    def _extract_patterns(self, ts: np.ndarray) -> dict:
        """从历史时序中提取模式（趋势+季节性）"""
        n = len(ts)
        t = np.arange(n)

        # 线性趋势
        slope, intercept, r, p, se = stats.linregress(t, ts)

        # 去趋势后的季节性
        detrended = ts - (slope * t + intercept)
        weekly_pattern = np.zeros(7)
        for i in range(n):
            weekly_pattern[i % 7] += detrended[i]
        weekly_counts = np.array([sum(1 for i in range(n) if i % 7 == j) for j in range(7)])
        weekly_pattern /= (weekly_counts + 1e-8)

        return {
            'trend_slope': slope,
            'trend_intercept': intercept,
            'level': ts[-min(7, n):].mean(),
            'volatility': ts.std() / (ts.mean() + 1e-8),
            'weekly_pattern': weekly_pattern,
        }

    def predict(self, history: np.ndarray, num_samples: int = 100) -> dict:
        """
        概率预测：输出未来 pred_len 步的 P10/P50/P90
        模拟 Chronos 的不确定性量化
        """
        if len(history) < 7:
            level = history.mean()
            noise = history.std() if len(history) > 1 else level * 0.2
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2403.07815 — Chronos: Learning the Language of Time Series

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：新品 2-4 周实际销量；可选同品类成熟产品历史作为参考序列；粒度：SKU×日。

**输出**：未来 8 周每日需求预测（P10/P50/P90）与三套备货方案，附与 Prophet 的误差对比，供新品冷启动备货使用。

## 执行步骤

1. 准备最短 2-4 周的新品销量序列
2. 用基础模型做零样本推理
3. 输出分位数预测并在新品数据上校验
4. 生成三套备货方案供选择

## 边界与不做

- 数据不满足时不用：连 2 周销量都没有、也没有同品类参考序列时，零样本只能靠先验，误差显著上升。
- 能力边界：只输出预测与备货方案，不负责定价与上架节奏。

## 技能关联

- **前置**：Skill-Conformal-Prediction-Demand-UQ.html、Skill-Conformal-Prediction-Demand-UQ、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-New-Product-Demand-Cold-Start.html、Skill-New-Product-Demand-Cold-Start、Skill-Online-Incremental-Learning.html、Skill-Online-Incremental-Learning、Skill-Prophet-Forecasting.html、Skill-Prophet-Forecasting、Skill-VOC-Trend-Signal-Forecasting.html、Skill-VOC-Trend-Signal-Forecasting
- **延伸**：Skill-Conformal-Prediction-Demand-UQ.html、Skill-Conformal-Prediction-Demand-UQ、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Online-Incremental-Learning.html、Skill-Online-Incremental-Learning、Skill-VOC-Trend-Signal-Forecasting.html、Skill-VOC-Trend-Signal-Forecasting
- **可组合**：Skill-Conformal-Prediction-Demand-UQ.html、Skill-Conformal-Prediction-Demand-UQ、Skill-Online-Incremental-Learning.html、Skill-Online-Incremental-Learning、Skill-Time-Series-Foundation-Model

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：03-时间序列　·　源卡：`Skill-Time-Series-Foundation-Model`