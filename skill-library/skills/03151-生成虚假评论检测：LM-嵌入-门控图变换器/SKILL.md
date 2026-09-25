---
name: "p2s-fraudsquad-llm-review-detection"
title: "FraudSquad — LLM 生成虚假评论检测：LM 嵌入 + 门控图变换器"
description: "触发词：AI 刷评、语言模型嵌入、门控图变换器、欺诈概率、刷评团伙。何时不用：评论量不足五十条或完全没有可疑样本时半监督训练不成立，先人工核查；本技能面向大模型批量生成的高质量评论。安全边界：检测结果用于内部清洗与举报队列，不得自动删评或对用户报复；评论数据须脱敏。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-136"
l3_business: "安全事件处理"
l3_all: "安全事件处理 / 体验分析"
l1_l2_l3: "独立控制/数据与AI运行/安全事件处理"
p2s_card_id: "Skill-FraudSquad-LLM-Review-Detection"
p2s_src_domain: "19-风控反欺诈"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "竞品用大模型批量写的五星好评看着很自然，用语言嵌入加图特征把这类 AI 刷评挑出来。"
user_try: "试试：这批评论里哪些像是大模型批量生成的，把高置信的那批列出来。"
whenToUse: "怀疑评论由大模型批量生成、需要评论级概率时用本技能；需要识别账号群协同结构用群体检测类技能。"
workflow: "采集评论与评论者数据 → 构建评论者、评论、产品三方图 → 融合语言嵌入与图注意力算欺诈概率 → 输出高置信虚假评论与团伙聚类"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# FraudSquad — LLM 生成虚假评论检测：LM 嵌入 + 门控图变换器

## ① 解决的问题

业务问题：竞品通过 ChatGPT 批量生成高质量 5 星好评（语言自然流畅、细节丰富），注入自家 listing 的同时给我们的 listing 刷低评，导致： 1. 竞品 BSR 飙升 → 抢占 Featured Offer 2. 我们 listing 评分下降 → 转化率下滑 10-25% 3. Amazon 算法降权 → 广告 CVR 下降

## ② 核心算法逻辑

核心思想：LLM 生成的虚假评论文本质量极高（语法流畅、情感真实），传统文本特征工程（词频/情感/长度）已失效。FraudSquad 转变思路——不只看"单条评论写得怎样"，而是看"这个评论者在评论图中的行为模式是否异常"。

## ③ 业务应用场景

业务问题：竞品通过 ChatGPT 批量生成高质量 5 星好评（语言自然流畅、细节丰富），注入自家 listing 的同时给我们的 listing 刷低评，导致： 1. 竞品 BSR 飙升 → 抢占 Featured Offer 2. 我们 listing 评分下降 → 转化率下滑 10-25% 3. Amazon 算法降权 → 广告 CVR 下降
数据要求： - Amazon 评论爬虫数据：reviewer_id、product_asin、rating（1-5）、review_text、review_date、reviewer_join_date - 构建三方图：reviewer ↔ review ↔ product - 最少 50 条评论（含至少5条可疑评论）用于半监督训练 - 可选：reviewer 历史评论数量、verified_purchase 标志
预期产出： - 每条评论的欺诈概率分数（0-1） - 高置信度虚假评论列表（建议举报/屏蔽） - 刷评团伙聚类（识别哪些账号协同作战）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

2万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（407 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/risk_fraud/fraudsquad_llm_review_detection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/19-风控反欺诈/Skill-FraudSquad-LLM-Review-Detection.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
FraudSquad — LLM 生成虚假评论检测
论文: arXiv:2510.01801 (2025-10)
场景: Amazon 母婴品类刷评检测 / WF-E Review 清洗前置层
"""

from __future__ import annotations

import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from collections import defaultdict

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler


# ────────────────────────────────────────────
# 图数据结构
# ────────────────────────────────────────────

@dataclass
class ReviewGraph:
    """用户-产品-评论三方异构图"""
    review_ids: List[str] = field(default_factory=list)
    user_ids: List[str] = field(default_factory=list)
    product_ids: List[str] = field(default_factory=list)
    texts: List[str] = field(default_factory=list)
    ratings: List[float] = field(default_factory=list)
    timestamps: List[float] = field(default_factory=list)
    labels: Optional[np.ndarray] = None              # 1=虚假, 0=真实, -1=未知

    def add_review(
        self,
        review_id: str,
        user_id: str,
        product_id: str,
        text: str,
        rating: float,
        timestamp: float,
        label: int = -1,
    ) -> None:
        self.review_ids.append(review_id)
        self.user_ids.append(user_id)
        self.product_ids.append(product_id)
        self.texts.append(text)
        self.ratings.append(rating)
        self.timestamps.append(timestamp)
        if self.labels is None:
            self.labels = np.array([label])
        else:
            self.labels = np.append(self.labels, label)

    def __len__(self) -> int:
        return len(self.review_ids)


# ────────────────────────────────────────────
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2510.01801 — Detecting LLM-Generated Spam Reviews by Integrating Language Model Embeddings and Graph Neural Network
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：平台评论数据：reviewer_id、product_asin、rating、review_text、review_date、reviewer_join_date；三方图最少 50 条评论且含至少 5 条可疑样本用于半监督训练，可选 verified_purchase 与历史评论数。

**输出**：每条评论的欺诈概率（0 到 1）、高置信虚假评论清单与刷评团伙聚类结果，供评论清洗与举报流程使用。

## 执行步骤

1. 采集评论与评论者字段
2. 构建三方图并生成语言模型嵌入
3. 用门控图变换器输出欺诈概率
4. 按阈值筛出高置信虚假评论
5. 聚类识别协同刷评团伙

## 边界与不做

- 评论样本少于 50 条或完全没有可疑样本时，半监督训练不成立。
- 本技能产出概率与可疑清单，不执行删评或账号处置。
- 结论仅用于内部清洗与平台举报，数据须脱敏，不得对用户做报复性操作。

## 技能关联

- **前置**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-Agent-Payment-Security-Red-Team.html、Skill-Agent-Payment-Security-Red-Team、Skill-DS-DGA-GCN-Fake-Review-Group.html、Skill-DS-DGA-GCN-Fake-Review-Group、Skill-HGT-Heterogeneous-Graph-Transformer.html、Skill-HGT-Heterogeneous-Graph-Transformer、Skill-MUZZLE-Web-Agent-Red-Teaming.html、Skill-MUZZLE-Web-Agent-Red-Teaming、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **延伸**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-Agent-Payment-Security-Red-Team.html、Skill-Agent-Payment-Security-Red-Team、Skill-DS-DGA-GCN-Fake-Review-Group.html、Skill-DS-DGA-GCN-Fake-Review-Group、Skill-MUZZLE-Web-Agent-Red-Teaming.html、Skill-MUZZLE-Web-Agent-Red-Teaming
- **可组合**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-Agent-Payment-Security-Red-Team.html、Skill-Agent-Payment-Security-Red-Team、Skill-MUZZLE-Web-Agent-Red-Teaming.html、Skill-MUZZLE-Web-Agent-Red-Teaming、Skill-FraudSquad-LLM-Review-Detection

---

> 分类：独立控制/数据与AI运行/安全事件处理　·　技术族：19-风控反欺诈　·　源卡：`Skill-FraudSquad-LLM-Review-Detection`