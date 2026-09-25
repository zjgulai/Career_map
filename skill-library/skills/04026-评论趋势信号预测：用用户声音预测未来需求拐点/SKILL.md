---
name: "p2s-voc-trend-signal-forecasting"
title: "VOC Trend Signal Forecasting — 评论趋势信号预测：用用户声音预测未来需求拐点"
description: "触发词：VOC 情感、领先指标、Granger 检验、需求拐点、高峰预测。何时不用：只要缺货与竞品迁移的规则信号时用「VOC 供应链信号桥」；没有评论数据时用常规时序预测。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-VOC-Trend-Signal-Forecasting"
p2s_src_domain: "07-NLP-VOC"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用评论情感当领先指标，比只看销量早两到三周发现需求高峰，圣诞备货不再赌时间点。"
user_try: "试试：对这款推车做情感序列与销量的 Granger 检验，告诉我高峰会不会提前，并给出 4 周预测。"
whenToUse: "高峰时点每年漂移、需要领先指标增强预测时用；只做缺货规则信号用 VOC 供应链信号桥；无评论数据则用常规时序预测。"
workflow: "对齐近 12 个月评论（含日期与文本）与每日销量 → 计算每日情感得分作为领先指标序列 → 用 Granger 检验确认情感是否显著领先销量 → 把 VOC 信号并入预测模型输出未来 4 周预测"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# VOC Trend Signal Forecasting — 评论趋势信号预测：用用户声音预测未来需求拐点

## ① 解决的问题

圣诞节前推车需求高峰时间每年不固定用历史销量预测总缺货或积压——评论情感领先指标（提前7-14天）增强时序预测精度8-15%，提前准确识别高峰备货减少缺货损失年化25-80万元

## ② 核心算法逻辑

传统时序预测（Prophet/LSTM）只用历史销量数据——但销量是滞后信号（销量已经发生才能观测到）。评论信号是领先信号：

## ③ 业务应用场景

业务问题：婴儿推车每年圣诞前有一次需求高峰，但历年高峰时间不完全固定（有时在 11 月中、有时在 12 月初）。只用历史销量预测会缺货或过度备货。
数据要求： - 近 12 个月 ASIN 评论（含日期+文本） - 同期每日销量数据 - 目标：预测未来 4 周的每日销量
预期产出： - VOC 情感领先指标序列（每日情感得分） - Granger 因果检验结果（情感是否显著领先销量） - 加入 VOC 信号后的预测误差改善 - 圣诞高峰预测：何时开始、峰值规模

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
提前 2-3 周发现需求高峰趋势：提前备货减少缺货损失 ¥10-30 万/年
预测精度提升 8-15%：库存持有成本降低 ¥5-15 万/年
圣诞/大促季精准备货：旺季 GMV 增益 ¥15-40 万
年化综合 ROI：¥25-80 万
实施难度：⭐⭐☆☆☆（Granger 检验 + 简单回归 1 周可实现；需要历史评论+销量数据对齐；完整 LSTM+VOC 版约 3-4 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（197 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/nlp_voc/voc_trend_signal_forecasting` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/07-NLP-VOC/Skill-VOC-Trend-Signal-Forecasting.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
VOC Trend Signal Forecasting
评论情感领先指标 + 时序预测融合：VOC-NLP × 时间序列
"""
import numpy as np
from collections import deque

# 情感词典（母婴品类）
POSITIVE_WORDS = [
    'love', 'great', 'amazing', 'perfect', 'recommend', 'excellent',
    'best', 'gift', 'birthday', 'worth', 'happy', 'satisfied',
    '好', '棒', '推荐', '送礼', '满意', '很好',
]
NEGATIVE_WORDS = [
    'disappointed', 'broke', 'poor', 'waste', 'return', 'refund',
    'terrible', 'avoid', 'worst', 'cheap', 'broken', 'noise',
    '差', '坏', '退', '失望', '噪音', '不值',
]


def compute_daily_sentiment(reviews: list[dict]) -> dict:
    """计算每日情感得分（-1到+1）"""
    daily_sentiment = {}
    for r in reviews:
        date = r.get('date', '2025-01-01')
        text = r.get('text', '').lower()
        pos = sum(1 for w in POSITIVE_WORDS if w.lower() in text)
        neg = sum(1 for w in NEGATIVE_WORDS if w.lower() in text)
        total = pos + neg
        score = (pos - neg) / (total + 1e-8) if total > 0 else None
        if score is not None:
            if date not in daily_sentiment:
                daily_sentiment[date] = []
            daily_sentiment[date].append(score)

    return {date: np.mean(scores) for date, scores in daily_sentiment.items()}


def granger_causality_test(x: np.ndarray, y: np.ndarray, max_lag: int = 14) -> dict:
    """
    简化版 Granger 因果检验
    检验 x（VOC 情感）是否 Granger-导致 y（销量）
    通过比较 VAR 模型 vs AR 模型的 RSS 降低幅度
    """
    n = min(len(x), len(y))
    x, y = x[-n:], y[-n:]

    results = {}
    for lag in range(1, min(max_lag + 1, n // 4)):
        # AR 模型：仅用 y 的滞后预测 y
        X_ar = np.column_stack([y[lag - k - 1:-k - 1] for k in range(lag)] + [np.ones(n - lag)])
        # VAR 模型：用 y + x 的滞后预测 y
        X_var = np.column_stack([
            y[lag - k - 1:-k - 1] for k in range(lag)
        ] + [
            x[lag - k - 1:-k - 1] for k in range(lag)
        ] + [np.ones(n - lag)])

        y_target = y[lag:]
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2407.08341，但该号在 arXiv 上是《Adaptive Deep Iris Feature Extractor at Arbitrary Resolutions》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：近 12 个月 ASIN 评论（含日期与文本）与同期每日销量，预测目标为未来 4 周每日销量；粒度：ASIN×日。

**输出**：VOC 情感领先指标序列、Granger 因果检验结果与加入 VOC 后的预测误差改善（卡页：精度提升 8-15%）、高峰开始时间与峰值规模预测，供旺季备货使用。

## 执行步骤

1. 对齐评论与销量时间轴
2. 计算每日情感得分序列
3. 做 Granger 检验确认领先关系
4. 把信号并入模型预测未来 4 周
5. 输出高峰时点与备货建议

## 边界与不做

- 数据不满足时不用：评论与销量无法按日对齐、或评论量不足以形成稳定情感序列时，领先关系无法检验。
- 能力边界：只做领先性检验与预测增强，不解释评论背后的产品问题。
- 能力边界：Granger 领先关系不等于因果，需结合业务判断使用。

## 技能关联

- **前置**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-EventCast-LLM-Event-Forecasting.html、Skill-EventCast-LLM-Event-Forecasting、Skill-Prophet-Forecasting.html、Skill-Prophet-Forecasting、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-VOC-Supply-Chain-Signal-Bridge.html、Skill-VOC-Supply-Chain-Signal-Bridge
- **延伸**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-EventCast-LLM-Event-Forecasting.html、Skill-EventCast-LLM-Event-Forecasting、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-VOC-Supply-Chain-Signal-Bridge.html、Skill-VOC-Supply-Chain-Signal-Bridge
- **可组合**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-VOC-Supply-Chain-Signal-Bridge.html、Skill-VOC-Supply-Chain-Signal-Bridge、Skill-VOC-Trend-Signal-Forecasting

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：07-NLP-VOC　·　源卡：`Skill-VOC-Trend-Signal-Forecasting`