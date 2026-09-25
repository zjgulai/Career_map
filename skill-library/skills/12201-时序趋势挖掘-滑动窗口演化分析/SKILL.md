---
name: "p2s-review-temporal-trend-mining"
title: "Review 时序趋势挖掘 — LDA 滑动窗口演化分析"
description: "触发词：时序趋势、滑动窗口、LDA、新兴投诉、竞品评论监控。何时不用：一次性看当期主题全貌用「BERTopic 主题建模」；本技能只看已知主题跨时间的涨落。安全边界：竞品评论须通过合规第三方渠道获取，不得违反平台数据采集条款。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-113"
l3_business: "客诉聚类"
l3_all: "客诉聚类 / 体验分析"
l1_l2_l3: "业务运营/服务与体验/客诉聚类"
p2s_card_id: "Skill-Review-Temporal-Trend-Mining"
p2s_src_domain: "07-NLP-VOC"
quality_tier: "preview"
user_summary: "按月切开评论看主题怎么变，把悄悄恶化的新投诉点提前几周捞出来，并指向可疑批次。"
user_try: "试试：把这 12 个月的评论按月切窗跑 LDA，告诉我最近三个月哪个投诉主题在涨。"
whenToUse: "当要判断某个投诉主题是近期新出现还是已经缓解、需要周级或月级预警时用；只要当期主题全貌用「BERTopic 主题建模」。"
workflow: "按月把评论切成时间窗口 → 对每个窗口独立训练 LDA 主题模型 → 追踪同一主题跨窗口的概率变化 → 输出趋势报告并定位新兴问题来源"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Review 时序趋势挖掘 — LDA 滑动窗口演化分析

## ① 解决的问题

产品负责人面临"最近新出现的用户投诉点淹没在历史评论里发现太慢"——LDA时序滑动窗口将新兴问题发现时效从季度回顾压缩至周级预警，年化避免差评损失$7.2万

## ② 核心算法逻辑

核心思想：将产品 Review 按时间窗口分组，对每个窗口独立训练 LDA 主题模型，追踪同一主题（如「漏液问题」）随时间的概率变化，识别出「近期新出现的投诉点」和「已解决的历史问题」，为产品迭代决策提供时序 VOC 证据。

## ③ 业务应用场景

- 业务问题：吸奶器 V2 版上市 6 个月后，近 3 个月差评率突然从 5% 上升到 12%，运营不知道是哪个具体问题恶化了，无法定位到产品缺陷 - 数据要求：该 ASIN 近 12 个月 Review（约 2000 条），含评论文本和提交日期；按月切分为 12 个窗口 - 预期产出：发现「马达噪音投诉」主题在最近 3 个月激增（从月均 5% → 22%），指向「第 6 周生产批次的马达供应商变更」，提供精确溯源 - 业务价值：从发现问题到定位原因时间从 3 周 → 2 天，避免问题持续恶化损失约 20 万元（差评率继续上升的 GMV 损失）；精准召回问题批次，节省售后成本约 5 万元 - 
- 业务问题：竞品 ASIN 上市 4 个月，运营想监控竞品的 Review 动态，判断竞品是否存在质量下坡路（从而抓住机会窗口） - 数据要求：竞品 ASIN 近 6 个月 Review（按月分组，每月至少 50 条） - 预期产出：竞品 Review 趋势报告：「防漏性能」主题 2 个月前开始下滑，「包装损坏」主题近 1 个月新出现，竞品开始走下坡 - 业务价值：提前 2-3 个月发现竞品弱点，及时加大广告投入抢占市场份额，预计增量 GMV 约 30 万元 - 三轨验证： - 成本：数据采集需通过第三方工具（如 Helium10、Jungle Scout）获取竞品 Review，月费约 3

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：产品质量问题早发现（快 2 周）避免持续差评损失约 20 万元；竞品弱点早发现带来增量 GMV 约 30 万元。总年化约 50 万元
实施难度：⭐⭐⭐☆☆（LDA 需要一定调参经验；每月 50+ 条 Review 才能稳定运行；代码已封装，直接调用 `analyze_temporal_trends` 即可）
优先级：⭐⭐⭐⭐☆（有 Review 历史数据的 ASIN 立即可用，无冷启动问题）
评估依据：LDA 是 VOC 分析标准方法，行业验证充分；时序窗口方法已在电商质量监控中广泛应用；问题提前发现的 ROI 显著

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（225 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/nlp_voc/review_temporal_trend_mining` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/07-NLP-VOC/Skill-Review-Temporal-Trend-Mining.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Review 时序趋势挖掘
LDA Topic Model + 时间窗口滑动 → 演化趋势分析
"""
import numpy as np
from typing import List, Dict, Tuple
from collections import Counter, defaultdict
import re


# ─── 轻量 LDA 实现（无需 gensim，纯 numpy）──────────────────────────────────────
class LightLDA:
    """
    轻量版 Latent Dirichlet Allocation
    用 Gibbs Sampling 实现
    """

    def __init__(self, n_topics: int = 8, alpha: float = 0.1, beta: float = 0.01,
                 n_iter: int = 50, random_state: int = 42):
        self.K = n_topics
        self.alpha = alpha
        self.beta = beta
        self.n_iter = n_iter
        self.rng = np.random.default_rng(random_state)

    def fit(self, docs: List[List[int]], vocab_size: int):
        """
        训练 LDA
        docs: 词 id 列表的列表
        vocab_size: 词汇表大小
        """
        self.V = vocab_size
        D = len(docs)

        # 初始化计数矩阵
        n_dt = np.zeros((D, self.K), dtype=np.int32)    # 文档-主题计数
        n_kt = np.zeros((self.K, self.V), dtype=np.int32)  # 主题-词计数
        n_k = np.zeros(self.K, dtype=np.int32)             # 主题总词数

        # 随机初始化主题分配
        z_assignments = []
        for d, doc in enumerate(docs):
            z = self.rng.integers(0, self.K, size=len(doc))
            z_assignments.append(z.tolist())
            for w, k in zip(doc, z):
                n_dt[d, k] += 1
                n_kt[k, w] += 1
                n_k[k] += 1

        # Gibbs 采样
        for _ in range(self.n_iter):
            for d, doc in enumerate(docs):
                for i, w in enumerate(doc):
                    k_old = z_assignments[d][i]
                    # 移除当前词的贡献
                    n_dt[d, k_old] -= 1
                    n_kt[k_old, w] -= 1
                    n_k[k_old] -= 1

                    # 计算新主题分布
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2308.07019，但该号在 arXiv 上是《A class of entanglement witnesses and a realignment-like criterion》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：单 ASIN 近 12 个月评论（文本与提交日期）约 2000 条并按月切分；竞品监控场景要求每月至少 50 条。

**输出**：逐主题的时序概率变化、新兴或已缓解判断与可疑批次或竞品弱点线索，供产品迭代与竞品机会判断。

## 执行步骤

1. 按月把评论切成时间窗口
2. 对每个窗口独立训练 LDA 主题模型
3. 追踪同一主题跨窗口的概率变化
4. 标出近期激增的新兴投诉主题
5. 输出趋势报告并给出批次或竞品弱点线索

## 边界与不做

- 何时不用：每月评论量不足 50 条时主题概率不稳，需延长窗口或累积数据
- 能力边界：只输出主题时序证据与线索指向，不做批次定责，也不替代质检结论

## 技能关联

- **前置**：Skill-BERTopic-Neural-Topic-Modeling.html、Skill-BERTopic-Neural-Topic-Modeling、Skill-Epidemiological-Viral-Traffic-SIR.html、Skill-Epidemiological-Viral-Traffic-SIR、Skill-Multilingual-NLP-Pipeline.html、Skill-Multilingual-NLP-Pipeline、Skill-NLP-Sentiment-ML-Pipeline.html、Skill-NLP-Sentiment-ML-Pipeline、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-VOC-Trend-Signal-Forecasting.html、Skill-VOC-Trend-Signal-Forecasting
- **延伸**：Skill-BERTopic-Neural-Topic-Modeling.html、Skill-BERTopic-Neural-Topic-Modeling、Skill-Epidemiological-Viral-Traffic-SIR.html、Skill-Epidemiological-Viral-Traffic-SIR、Skill-Multilingual-NLP-Pipeline.html、Skill-Multilingual-NLP-Pipeline、Skill-NLP-Sentiment-ML-Pipeline.html、Skill-NLP-Sentiment-ML-Pipeline、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-BERTopic-Neural-Topic-Modeling.html、Skill-BERTopic-Neural-Topic-Modeling、Skill-Epidemiological-Viral-Traffic-SIR.html、Skill-Epidemiological-Viral-Traffic-SIR、Skill-Multilingual-NLP-Pipeline.html、Skill-Multilingual-NLP-Pipeline、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Review-Temporal-Trend-Mining

---

> 分类：业务运营/服务与体验/客诉聚类　·　技术族：07-NLP-VOC　·　源卡：`Skill-Review-Temporal-Trend-Mining`