---
name: "p2s-causal-sentiment-attribution"
title: "DINER — 因果去偏的方面级情感分析"
description: "触发词：情感因果去偏、方面级情感、差评归因、标注偏置、TDE 反事实。何时不用：只需要粗粒度正负情感或摘要时用「AGRS 属性引导评论摘要」；要比较竞品之间的评论主题差异用「Competitive VOC Benchmarking」。安全边界：偏置先验必须来自验证集统计而非人工假设，结论不得单独作为降价等定价决策依据，不得据评论反向识别个人。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-019"
l3_business: "VOC编码"
l3_all: "VOC编码 / 体验分析"
l1_l2_l3: "业务运营/产品与创新/VOC编码"
p2s_card_id: "Skill-Causal-Sentiment-Attribution"
p2s_src_domain: "01-因果推断"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把评论里的方面情感做因果去偏，区分用户真正的不满和只是顺带提到的词，避免因为误判方向做错产品改进。"
user_try: "试试：这 2,400 条吸奶器评论里「价格」的负面率很高，帮我用因果去偏判断这是真不满还是标注偏置造成的伪负面。"
whenToUse: "已有方面级情感结果、但要防止「价格」「物流」这类高频共现词制造伪负面时用本技能；若还没有 ABSA 基础，先做方面情感抽取；若问题是跨市场评分口径差异，用「跨文化 VOC 对齐」。"
workflow: "对目标方面（如价格）相关的评论运行 DINER 的 TDE 分类 → 把 TDE 结果与朴素 ABSA 的预测逐条对比 → 过滤掉由方面词直接偏置贡献的伪负面 → 把保留下来的真实负面方向交给产品迭代议题"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# DINER — 因果去偏的方面级情感分析

## ① 解决的问题

母婴产品运营面临差评方向归因失真困境——DINER 多变量因果推断（Backdoor Adjustment + TDE 反事实）消除价格/物流等方面词的标注偏置，将方面情感归因准确率提升约30%，避免1-3次错误产品迭代决策，年化规避成本50-200万元

## ② 核心算法逻辑

普通 ABSA（方面级情感分析）存在两类混淆偏差，导致在跨境电商评论中频繁误判：

## ③ 业务应用场景

业务问题：某母婴品牌吸奶器在 Amazon US 积累 2,400 条评论，整体 3.6 星。运营初步用朴素 ABSA 分析，发现"价格"方面负面率高达 72%，计划降价 15%。但商品定价本已低于竞品，降价后利润空间不足 8%。
问题根源：朴素 ABSA 的"价格"高负面率实际是标注偏置——差评评论中"价格"一词和负面标签高度共现，与实际情感无关（用户抱怨的是续航或噪音，顺带提到"这个价位理应更好"）。
1. 对"价格"方面的评论运行 DINER 的 TDE 分类 2. 对比 TDE 结果 vs 朴素预测结果 3. 过滤掉"价格直接偏置"贡献的伪负面

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
差评方向归因准确率提升 ~30%（避免 1-3 次错误产品迭代，每次成本 50-200 万元）
选品竞品分析效率提升 5×，年化节省调研人力 20-40 万元
综合年化 ROI：70-240 万元（中位 ~150 万元）
实施难度：⭐⭐⭐⭐☆（需要 RoBERTa 级别编码器 + 方面偏置先验估算，有一定工程门槛）
优先级：⭐⭐⭐☆☆（适合已有 ABSA 基础的团队作为精度升级；新团队建议先跑 Skill-VOC-Aspect-Sentiment-Extraction）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（290 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/causal_inference/causal_sentiment_attribution` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/01-因果推断/Skill-Causal-Sentiment-Attribution.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
DINER 简化版因果 ABSA — 母婴评论方面情感因果去偏
依赖: transformers >= 4.35, torch >= 2.0, numpy
pip install transformers torch numpy
"""
import numpy as np
from typing import Dict, List, Tuple


# ──────────────────────────────────────────────
# 1. 轻量因果 ABSA 推理器（不依赖 GPU 的 mock 版，用于演示逻辑）
# ──────────────────────────────────────────────
class CausalABSAInference:
    """
    简化版 DINER 因果推理器
    原理：TDE = P(Y|review, aspect) - P(Y|review, [MASK_aspect])
    通过对比"有方面"和"无方面"的情感得分，消除方面词的直接偏置
    """

    def __init__(self, bias_prior: Dict[str, float] = None):
        """
        bias_prior: 已知方面词的标注偏置先验
        格式: {方面词: 直接偏置强度}，范围 [-1, 1]
        负值=偏向负面，正值=偏向正面
        通常通过在验证集上统计 label 分布估算
        """
        self.bias_prior = bias_prior or {
            "price": -0.35,    # 价格词倾向于触发负面偏置
            "价格": -0.35,
            "shipping": -0.25,
            "物流": -0.25,
            "quality": 0.10,   # 质量词轻微正偏（"high quality" 更常见）
            "safety": 0.20,    # 安全词倾向于触发正面偏置
            "安全": 0.20,
        }

    def _naive_sentiment_score(self, text: str, aspect: str) -> np.ndarray:
        """
        模拟朴素 ABSA 模型输出 logits
        真实场景替换为 RoBERTa / InstructABSA 的实际推理
        返回 shape=(3,) 的 softmax 概率: [负面, 中性, 正面]
        """
        # 简化规则：基于关键词模拟
        neg_words = ["bad", "terrible", "broken", "loud", "weak", "slow",
                     "expensive", "overpriced", "noisy", "poor", "awful",
                     "差", "贵", "噪音", "弱", "慢", "漏", "不好"]
        pos_words = ["good", "great", "excellent", "love", "quiet", "strong",
                     "safe", "comfortable", "perfect", "recommend", "amazing",
                     "好", "棒", "安全", "舒适", "推荐", "满意", "强"]

        text_lower = text.lower()
        neg_count = sum(1 for w in neg_words if w in text_lower)
        pos_count = sum(1 for w in pos_words if w in text_lower)

        # 基础得分
        base_neg = 0.2 + neg_count * 0.15
        base_pos = 0.2 + pos_count * 0.15
        base_neu = max(0.1, 1.0 - base_neg - base_pos)

        # 方面词直接偏置（朴素模型受此影响）
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2403.01166 — DINER: Debiasing Aspect-based Sentiment Analysis with Multi-variable Causal Inference

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：带方面共现的评论文本（如与「价格」「物流」共现的数千条评论），以及该方面的标注偏置先验（在验证集上统计 label 分布得到）；需要 RoBERTa 级编码器或等价的推理环境。

**输出**：去偏后的方面情感判定，以及 TDE 结果与朴素预测的对比明细（哪些条目被判为伪负面、哪些真实负面被保留），供产品迭代议题筛选使用。

## 执行步骤

1. 在验证集上统计目标方面的标注偏置先验
2. 对方面相关评论运行 TDE 分类得到去偏情感
3. 与朴素 ABSA 结果逐条对比并定位分歧
4. 过滤由方面词直接偏置贡献的伪负面
5. 输出真实负面方向作为产品改进依据

## 边界与不做

- 目标方面在语料中样本过少、或没有验证集可估偏置先验时不适用，此时先验只能靠人工假设、结论不可靠
- 本技能只做归因纠正，不替代定价与产品决策，TDE 结论需结合成本与竞品事实复核
- 不得把评论内容反向识别到个人，也不得把原始评论数据用于对外竞品分析

## 技能关联

- **前置**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-Causal-VOC-Sentiment-Attribution.html、Skill-Causal-VOC-Sentiment-Attribution、Skill-DiD-Difference-in-Differences.html、Skill-DiD-Difference-in-Differences、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-Causal-VOC-Sentiment-Attribution.html、Skill-Causal-VOC-Sentiment-Attribution、Skill-DiD-Difference-in-Differences.html、Skill-DiD-Difference-in-Differences
- **可组合**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-Causal-VOC-Sentiment-Attribution.html、Skill-Causal-VOC-Sentiment-Attribution、Skill-Causal-Sentiment-Attribution

---

> 分类：业务运营/产品与创新/VOC编码　·　技术族：01-因果推断　·　源卡：`Skill-Causal-Sentiment-Attribution`