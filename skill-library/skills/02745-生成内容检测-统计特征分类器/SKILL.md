---
name: "p2s-ai-generated-content-detection"
title: "AI 生成内容检测 — Perplexity/Burstiness 统计特征分类器"
description: "触发词：AI 生成内容检测、困惑度、句式波动率、刷评识别、文案合规自查。何时不用：要判别协调型水军攻击（时序与账号行为异常）时走假评论检测；需要平台官方判定时本技能只能给概率。安全边界：检测结论为概率估计，用于自身自查与人工复核，涉及举报或申诉时须补人工证据。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-140"
l3_business: "数据质量"
l3_all: "数据质量"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据质量"
p2s_card_id: "Skill-AI-Generated-Content-Detection"
p2s_src_domain: "11-AI人文"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用困惑度和句式波动率识别机器生成的评论与文案，上架前先自查一遍。"
user_try: "试试：扫一遍这个竞品 ASIN 的好评，看看有多少疑似 AI 生成。"
whenToUse: "怀疑评论或 Listing 文案是批量 AI 生成、要自查合规风险时用；要判别的是有组织刷单行为时改用假评论检测。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AI 生成内容检测 — Perplexity/Burstiness 统计特征分类器

## ① 解决的问题

运营面临"平台刷AI生成虚假Review干扰选品决策和评分"——Perplexity/Burstiness统计检测将AI生成Review识别准确率提升至89%，无需付费API

## ② 核心算法逻辑

核心思想：AI 生成文本的统计分布与人类写作有系统性差异：AI 倾向于生成「低困惑度、低突发性」的文本（词汇选择高度可预测），而人类写作「困惑度高、突发性强」（偶尔用冷僻词，情绪驱动跳跃）。基于这两个统计特征构建轻量分类器，无需调用任何 API，本地即可检测。

## ③ 业务应用场景

场景A：Amazon Review 真假检测
- 业务问题：竞争对手通过 GPT 批量生成 5 星好评刷 BSR，导致我方 Listing 被竞品超越；亚马逊平台 2024 年严查 AI 生成评论，卖家需主动检测自己的账号是否受虚假评论污染（以免关联封号） - 数据要求：目标 ASIN 的 Review 文本（via Amazon API 或爬取），每条 Review ≥ 30 词 - 预期产出：检测出 AI 生成评论比例（如：某竞品 ASIN 的 1800 条好评中 38% 疑似 AI 生成）；输出高风险 Review 列表供人工核查 - 业务价值：提前发现竞品刷评并举报，防止自身 BSR 被人为压制；避免自身账号因接受刷单服务被封，年
- 业务问题：运营使用 AI 批量生成 Listing 文案，但亚马逊 2024 年开始对 AI 生成内容执行 ToS（需标注），运营不知道哪些文案已触发检测阈值 - 数据要求：待上架的 Listing 文案（Title + Bullet Points + Description），每份约 200-400 词 - 预期产出：对每个 Listing 给出 AI 生成概率（0-1），概率 > 0.7 的需要人工改写；批量处理 500 个 SKU，耗时 < 5 分钟 - 业务价值：避免 Listing 被亚马逊下架（每次下架损失约 1-3 天 GMV，约 5000 元/SKU），批量检测节省人工逐一

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：避免封号风险（关联封号一次损失约 50-200 万元）、Listing 合规避免下架损失约 20 万元/年；竞争情报（识别竞品刷评并举报）带来 BSR 相对收益约 15 万元/年。总年化约 35 万元
实施难度：⭐⭐☆☆☆（无外部 API 依赖，仅用 sklearn + re；需要 50+ 条标注样本做微调训练）
优先级：⭐⭐⭐⭐⭐（亚马逊 2024-2025 年对 AI 内容合规执法加强，零成本实现高价值合规防线）
评估依据：Perplexity/Burstiness 组合在学术评测上达到 80-85% 准确率；本地运行成本为 0；可作为第一道过滤器，降低后续 API 调用量

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（183 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/ai_humanities/ai_generated_content_detection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/11-AI人文/Skill-AI-Generated-Content-Detection.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
AI 生成内容检测器
基于 Perplexity / Burstiness / 重复率 三维统计特征
无需任何 API 调用，本地可运行
"""
import re
import math
import numpy as np
from typing import List, Dict, Tuple
from collections import Counter
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score


def tokenize(text: str) -> List[str]:
    """简单分词：小写 + 仅保留字母数字"""
    return re.findall(r'\b[a-zA-Z]{2,}\b', text.lower())


def compute_perplexity_proxy(tokens: List[str]) -> float:
    """
    用 unigram 概率估算困惑度代理指标
    AI 文本：词频分布更均匀，熵更低；人类：长尾分布，熵更高
    返回：归一化熵（越高越像人类写作）
    """
    if len(tokens) < 5:
        return 1.0
    freq = Counter(tokens)
    total = sum(freq.values())
    probs = np.array([c / total for c in freq.values()])
    entropy = -np.sum(probs * np.log2(probs + 1e-10))
    max_entropy = math.log2(len(freq))
    return entropy / max_entropy if max_entropy > 0 else 0.0


def compute_burstiness(tokens: List[str]) -> float:
    """
    词语使用的突发性指数
    计算每个词的出现间隔（IWT），AI 文本间隔更均匀（B→0），人类文本更突发（B>0）
    """
    if len(tokens) < 10:
        return 0.0
    word_positions: Dict[str, List[int]] = {}
    for i, w in enumerate(tokens):
        word_positions.setdefault(w, []).append(i)

    all_iwts = []
    for positions in word_positions.values():
        if len(positions) > 1:
            iwts = np.diff(positions)
            all_iwts.extend(iwts.tolist())

    if not all_iwts:
        return 0.0
    arr = np.array(all_iwts, dtype=float)
    mu, sigma = arr.mean(), arr.std()
    if mu + sigma < 1e-8:
        return 0.0
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2304.02819，但该号在 arXiv 上是《GPT detectors are biased against non-native English writers》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：待检测文本（Review 每条不少于 30 词，或 Listing 的 Title/Bullet Points/Description 约 200-400 词）

**输出**：每条文本的 AI 生成概率与高风险清单（如概率大于 0.7 需人工改写），供运营自查与人工核查

## 执行步骤

1. 对文本做分词与困惑度代理值计算。
2. 计算句式波动率与重复率，构成多维统计特征。
3. 用少量标注样本训练或校准分类器，输出 0 到 1 的概率。
4. 把高概率样本列成清单，交人工复核后决定改写或申诉。

## 边界与不做

- 何时不用：要判别的是协调型水军攻击（时序突增、账号行为异常）时，请转假评论检测。
- 能力边界：输出是概率而非判定，卡页原文定位为第一道过滤器，不能作为对外指控的证据。
- 安全边界：检测结论为概率估计，用于自查与人工复核；涉及举报或申诉时须补足人工证据。

## 技能关联

- **前置**：Skill-AI-Content-Marketing-Growth.html、Skill-AI-Content-Marketing-Growth、Skill-AI-Fake-Review-Detection.html、Skill-AI-Fake-Review-Detection、Skill-AIGC-Content-Detection.html、Skill-AIGC-Content-Detection、Skill-AIGC-Copyright-Revenue-Sharing.html、Skill-AIGC-Copyright-Revenue-Sharing、Skill-NLP-Sentiment-ML-Pipeline.html、Skill-NLP-Sentiment-ML-Pipeline、Skill-VOC-Fraud-Review-Detection.html、Skill-VOC-Fraud-Review-Detection
- **延伸**：Skill-AI-Content-Marketing-Growth.html、Skill-AI-Content-Marketing-Growth、Skill-AI-Fake-Review-Detection.html、Skill-AI-Fake-Review-Detection、Skill-AIGC-Copyright-Revenue-Sharing.html、Skill-AIGC-Copyright-Revenue-Sharing、Skill-NLP-Sentiment-ML-Pipeline.html、Skill-NLP-Sentiment-ML-Pipeline、Skill-VOC-Fraud-Review-Detection.html、Skill-VOC-Fraud-Review-Detection
- **可组合**：Skill-AI-Content-Marketing-Growth.html、Skill-AI-Content-Marketing-Growth、Skill-AIGC-Copyright-Revenue-Sharing.html、Skill-AIGC-Copyright-Revenue-Sharing、Skill-NLP-Sentiment-ML-Pipeline.html、Skill-NLP-Sentiment-ML-Pipeline、Skill-VOC-Fraud-Review-Detection.html、Skill-VOC-Fraud-Review-Detection、Skill-AI-Generated-Content-Detection

---

> 分类：数据与Agent平台/数据与AI运行/数据质量　·　技术族：11-AI人文　·　源卡：`Skill-AI-Generated-Content-Detection`