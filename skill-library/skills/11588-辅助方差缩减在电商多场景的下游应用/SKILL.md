---
name: "p2s-ab-variance-downstream"
title: "AB-Variance-Downstream — AI 辅助方差缩减在电商多场景的下游应用"
description: "触发词：文本协变量、LLM嵌入、方差缩减、实验提速、小流量。何时不用：协变量都是结构化数字且历史数据齐全时用标准CUPED即可。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
p2s_card_id: "Skill-AB-Variance-Downstream"
p2s_src_domain: "02-A_B实验"
quality_tier: "preview"
user_summary: "把搜索词、评论、素材这类文本信息变成协变量来压掉实验噪声，让小流量卖家也能早点跑出结论。"
user_try: "试试：我月流量只有 2000 点击、6 周才能出结论太久了，帮我用文本协变量把实验周期压短。"
whenToUse: "当协变量主要来自非结构化文本（产品描述、评论情感、广告素材内容）、流量不足导致实验周期过长时用；协变量都是结构化数字、历史数据也齐全时用标准 CUPED（CUPED 方差缩减类技能）即可。"
workflow: "收集实验单元的处理分组、结果指标与文本特征 → 用 LLM 把文本特征转成语义嵌入并做 PCA 降维 → 用降维后的文本协变量做回归调整（CUPED 原理） → 计算相关系数与方差缩减率，调整无效时退化为朴素估计 → 按缩减后的方差重算实验周期与所需样本量"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AB-Variance-Downstream — AI 辅助方差缩减在电商多场景的下游应用

## ① 解决的问题

小卖家流量不足导致 A/B 实验需要 6 周才显著——AI 文本协变量将方差缩减 25%，实验周期从 6 周压缩至 4.5 周，每年多跑 2-3 轮测试，年化 GMV 增量 ¥30-80 万

## ② 核心算法逻辑

传统 CUPED（使用历史数据做协变量调整）要求提前知道哪些协变量有效，且只支持结构化数字特征。但现实中大量协变量是文本（产品描述、评论情感、广告素材内容）。AI 辅助方差缩减用 LLM 把这些非结构化文本转化为协变量，大幅降低实验所需样本量。

## ③ 业务应用场景

业务问题：吸奶器卖家想测试两个 listing 版本（标题 A vs B），月流量 2000 次点击，按传统 CUPED 需要 6 周才能达到统计显著（80% 功效，5% 置信水平，0.5% 转化率提升）。但竞争环境 6 周内变化很大。
AI 辅助方差缩减： - 用 LLM 对每个 listing 访客的历史行为（搜索词、历史购买类目）生成语义嵌入 - 协变量 = 用户对吸奶器类目的"预期购买意愿" - $\rho^2 \approx 0.25$ → 方差降低 25% → 实验周期从 6 周缩短至 4.5 周
业务价值：测试周期压缩 25%，每次测试节省 1.5 周市场窗口；年均多跑 2-3 轮测试

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
实验周期压缩 25%（每年多跑 2-3 轮测试）：每次额外测试带来 ¥5-20 万 GMV 增量
小卖家流量不足时仍能做统计显著测试：解锁小规模精准实验能力
广告素材测试在创意疲劳前完成：避免用过期素材浪费 $500-2000 广告预算/次
年化综合 ROI：¥30-80 万
实施难度：⭐⭐☆☆☆（LLM 嵌入 + OLS，标准库即可实现，1 天接入）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（213 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/ab_testing/ab_variance_downstream` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/02-A_B实验/Skill-AB-Variance-Downstream.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
AI-Assisted Variance Reduction — 文本协变量辅助 A/B 方差缩减
基于 arXiv: 2606.08853 (KDD 2026)

依赖: numpy, scipy (标准科学计算库)
"""

import numpy as np
from scipy import stats
from dataclasses import dataclass


@dataclass
class ExperimentData:
    """A/B 实验数据结构"""
    unit_id: list          # 用户/SKU ID
    treatment: np.ndarray  # 0/1 分组
    outcome: np.ndarray    # 结果指标（如转化率/购买金额）
    text_features: list    # 文本数据（用于 LLM 嵌入）


class MockLLMEmbedder:
    """
    Mock LLM 嵌入器（生产环境替换为实际 LLM API）

    生产环境示例：
        import openai
        response = openai.embeddings.create(model="text-embedding-3-small", input=texts)
        embeddings = [r.embedding for r in response.data]
    """

    def embed(self, texts: list) -> np.ndarray:
        """将文本转为特征向量（这里用关键词匹配模拟）"""
        keywords = ["pump", "suction", "nursing", "wearable", "battery", "quiet", "BPA"]
        vectors = []
        for text in texts:
            text_lower = text.lower()
            vec = [1.0 if kw in text_lower else 0.0 for kw in keywords]
            # 加入随机噪声模拟语义特征
            np.random.seed(hash(text) % 2**31)
            vec = np.array(vec) + np.random.normal(0, 0.1, len(keywords))
            vectors.append(vec)
        return np.array(vectors)


class AIVarianceReducedABTest:
    """
    AI 辅助方差缩减 A/B 实验分析器

    核心思路：
    1. 用 LLM 把文本特征转为协变量向量
    2. 回归调整估计 ATE（CUPED 原理）
    3. 若调整无效，自动退化为朴素估计（do-no-harm）
    """

    def __init__(self, llm_embedder=None, n_pca_components: int = 5):
        self.embedder = llm_embedder or MockLLMEmbedder()
        self.n_components = n_pca_components

    def _regression_adjustment(self, treatment: np.ndarray, outcome: np.ndarray,
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2606.08853，但该号在 arXiv 上是《AI-Assisted Variance Reduction in Randomized Experiments》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：实验数据包含 unit_id 列表、处理分组（0/1）、结果指标（转化率或购买金额）、用于 LLM 嵌入的文本特征（历史搜索词、历史购买类目、素材内容等）；嵌入后可取 5 个左右主成分作为协变量。

**输出**：调整后的指标与方差缩减率（卡页示例：相关系数平方约 0.25 对应方差降低 25%，实验周期从 6 周缩短至 4.5 周），以及调整无效时自动退化为朴素估计的兜底结果。

## 执行步骤

1. 收集实验单元的处理分组、结果指标与文本特征
2. 用 LLM 把文本特征转成语义嵌入并做 PCA 降维
3. 用降维后的文本协变量做回归调整
4. 计算相关系数与方差缩减率，调整无效时退化为朴素估计
5. 按缩减后的方差重算实验周期与所需样本量

## 边界与不做

- 何时不用：协变量都是结构化数字、且已有 14-30 天实验前数据时，用标准 CUPED 即可；流量充足、实验周期本就够短时收益有限。
- 能力边界：只做方差缩减与周期估算，不改变实验设计与分流；缩减幅度取决于文本嵌入与业务结果的相关性，相关性弱时提升有限。
- 卡页数字（方差缩减 25%、周期从 6 周压缩至 4.5 周、年均多跑 2-3 轮、年化 30-80 万元）为示例场景，不可直接外推。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Agentic-AB-Testing.html、Skill-Agentic-AB-Testing、Skill-CUPED-Variance-Reduction.html、Skill-CUPED-Variance-Reduction、Skill-Creative-Fatigue-Detection.html、Skill-Creative-Fatigue-Detection、Skill-STATE-Robust-Variance-Reduction.html、Skill-STATE-Robust-Variance-Reduction、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-Agentic-AB-Testing.html、Skill-Agentic-AB-Testing、Skill-CUPED-Variance-Reduction.html、Skill-CUPED-Variance-Reduction、Skill-Creative-Fatigue-Detection.html、Skill-Creative-Fatigue-Detection、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-Creative-Fatigue-Detection.html、Skill-Creative-Fatigue-Detection、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-AB-Variance-Downstream

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：02-A_B实验　·　源卡：`Skill-AB-Variance-Downstream`