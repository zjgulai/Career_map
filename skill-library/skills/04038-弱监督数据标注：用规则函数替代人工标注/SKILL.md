---
name: "p2s-weak-supervision-data-labeling"
title: "Weak Supervision Data Labeling — 弱监督数据标注：用规则函数替代人工标注"
description: "触发词：弱监督、标注函数、规则打标、软标签、标注降本。何时不用：需要极高精度或标注必须由具资质人员完成时不能用弱监督；小样本场景收益有限。安全边界：无。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 数据质量"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Weak-Supervision-Data-Labeling"
p2s_src_domain: "22-数据采集工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用规则函数给全量数据打软标签，把上万元、三周的标注工作压到一天完成。"
user_try: "试试：写一组标注函数，把这一万条评论的软标签打出来，成本尽量接近零。"
whenToUse: "有大量未标注数据、且有领域知识可写成规则时用；要求极高精度或必须由具资质人员标注的场景不用。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Weak Supervision Data Labeling — 弱监督数据标注：用规则函数替代人工标注

## ① 解决的问题

训练评论分类AI需要10000条人工标注数据花3万元等3周——弱监督用15个规则函数自动标注全部数据1天完成成本近零，标注效率提升10-50倍支持多个AI项目年化节省数据标注成本20-50万元

## ② 核心算法逻辑

人工标注 vs 弱监督标注：

## ③ 业务应用场景

业务问题：要训练一个"母婴产品评论质量分类器"（高质量/低质量），需要 10,000 条标注数据。人工标注 ¥30,000 + 3 周时间。用弱监督：写 15 个标注函数，1 天完成标注，成本近零。
数据要求： - 未标注的评论数据（10,000+ 条） - 领域知识（用于设计标注函数）
预期产出： - 每条数据的软标签（P(高质量)=0.78） - 标注函数质量分析（哪个函数准确率最高） - 可用于训练的弱标签数据集

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
标注成本降低 90%（¥30,000 → ¥500）
标注时间缩短 95%（3周 → 1天）
实现多个 NLP/分类任务的快速数据准备
年化综合 ROI：¥20-50 万（多个AI项目的数据标注节省）
实施难度：⭐⭐⭐☆☆（Snorkel/Cleanlab 等库成熟；标注函数设计需要领域知识；约 2-3 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（179 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/data_collection/weak_supervision_data_labeling` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/22-数据采集工程/Skill-Weak-Supervision-Data-Labeling.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Weak Supervision Data Labeling
弱监督数据标注：Snorkel 风格的规则函数融合
"""
import re
import numpy as np
from dataclasses import dataclass
from collections import defaultdict


# 标签常量
POSITIVE = 1
NEGATIVE = 0
ABSTAIN = -1  # 该函数不确定，放弃投票


def lf_specific_details(text: str) -> int:
    """有具体细节（数字/场景/品类词）→ 高质量"""
    if len(re.findall(r'\d+', text)) >= 2 or len(text.split()) >= 50:
        return POSITIVE
    return ABSTAIN


def lf_empty_exclamation(text: str) -> int:
    """过多感叹号/空洞赞美 → 低质量"""
    exclaim_ratio = text.count('!') / max(len(text.split()), 1)
    generic = sum(1 for w in ['amazing', 'perfect', 'love it', 'great'] if w in text.lower())
    if exclaim_ratio > 0.15 or (generic >= 3 and len(text.split()) < 30):
        return NEGATIVE
    return ABSTAIN


def lf_balanced_review(text: str) -> int:
    """同时提优点和缺点 → 高质量"""
    positive_words = ['good', 'great', 'love', 'excellent', 'like', 'nice']
    negative_words = ['but', 'however', 'although', 'downside', 'issue', 'problem', 'cons']
    text_lower = text.lower()
    has_positive = any(w in text_lower for w in positive_words)
    has_negative = any(w in text_lower for w in negative_words)
    if has_positive and has_negative:
        return POSITIVE
    return ABSTAIN


def lf_verified_purchase_proxy(text: str) -> int:
    """提到使用时长/场景 → 可能是真实用户 → 高质量"""
    usage_patterns = [r'\d+\s*(month|week|day|hour)', r'(office|travel|night|morning|work)', r'(used|using) (for|it|since)']
    if any(re.search(p, text.lower()) for p in usage_patterns):
        return POSITIVE
    return ABSTAIN


def lf_too_short(text: str) -> int:
    """过短 → 低质量"""
    if len(text.split()) < 15:
        return NEGATIVE
    return ABSTAIN


def lf_competitor_mention(text: str) -> int:
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:1711.10160 — Snorkel: Rapid Training Data Creation with Weak Supervision

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：未标注的原始数据（卡页场景为 10,000+ 条评论）与设计标注函数所需的领域知识

**输出**：每条数据的软标签（卡页示例 P(高质量)=0.78）、标注函数质量分析与可用于训练的弱标签数据集

## 执行步骤

1. 把领域判断拆成多个相互独立的标注函数（含具体细节、过短、疑似竞品提及等）。
2. 让函数在不确定时放弃投票（abstain），保留三值输出。
3. 对标注函数做质量分析，找出准确率最高与最冗余的函数。
4. 融合多个函数输出软标签，形成可用于训练的数据集。

## 边界与不做

- 何时不用：任务需要极高精度（医疗、合规判定等）或必须由具资质人员标注时，弱监督不足以替代。
- 能力边界：软标签是训练信号不是业务结论，不能直接当作事实使用，须保留人工验证集抽查。
- 能力边界：标注函数依赖领域知识设计，卡页原文提示设计质量决定成败。

## 技能关联

- **前置**：Skill-Data-Collection-Agent-Pipeline.html、Skill-Data-Collection-Agent-Pipeline、Skill-Ecommerce-Data-Quality-Assessment.html、Skill-Ecommerce-Data-Quality-Assessment、Skill-LLM-Annotation-Weak-Supervision.html、Skill-LLM-Annotation-Weak-Supervision、Skill-NLP-Sentiment-ML-Pipeline.html、Skill-NLP-Sentiment-ML-Pipeline、Skill-Review-Helpfulness-Prediction.html、Skill-Review-Helpfulness-Prediction、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-Data-Collection-Agent-Pipeline.html、Skill-Data-Collection-Agent-Pipeline、Skill-LLM-Annotation-Weak-Supervision.html、Skill-LLM-Annotation-Weak-Supervision、Skill-Review-Helpfulness-Prediction.html、Skill-Review-Helpfulness-Prediction、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-Data-Collection-Agent-Pipeline.html、Skill-Data-Collection-Agent-Pipeline、Skill-LLM-Annotation-Weak-Supervision.html、Skill-LLM-Annotation-Weak-Supervision、Skill-Weak-Supervision-Data-Labeling

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：22-数据采集工程　·　源卡：`Skill-Weak-Supervision-Data-Labeling`