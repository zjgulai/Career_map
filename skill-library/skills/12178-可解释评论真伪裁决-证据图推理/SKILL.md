---
name: "p2s-explainable-review-adjudication"
title: "可解释评论真伪裁决 — 证据图+LLM推理"
description: "触发词：评论真伪裁决、证据图、可解释裁定、刷评申诉、账号关联分析、裁决书。何时不用：要做整店刷评网络与风险打分用「虚假评论检测」；要做差评维度根因排序用「差评根因分析」。安全边界：裁决结论必须附证据引用才可用于申诉，不得只给真或假的二元标签；存在误判率（卡页口径 8-12%），须保留人工复审与买家申诉通道，评论与账号数据处理须符合个人信息保护法与平台规则。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-114"
l3_business: "体验分析"
l3_all: "体验分析 / 证据复核"
l1_l2_l3: "业务运营/服务与体验/体验分析"
p2s_card_id: "Skill-Explainable-Review-Adjudication"
p2s_src_domain: "19-风控反欺诈"
quality_tier: "preview"
user_summary: "12 条措辞雷同的 1 星差评，原先要花 2 天整理证据，现在 15 分钟出带引用的申诉材料，申诉成功率从 31% 提到 58%。"
user_try: "试试：这 12 条差评疑似竞品刷评，帮我出一份带证据引用的申诉摘要。"
whenToUse: "当需要向平台申诉、必须拿出可解释证据链证明某批评论异常时用本技能；若要做的是整店范围的刷评网络检测与风险打分，用「虚假评论检测」；若要做的是差评内容本身的根因排序，用「差评根因分析」。"
workflow: "收集可疑评论文本与历史已标注刷评样本库 → 用混合检索找出高度相似的历史刷评案例 → 构建证据图并做买家账号注册时间等关联分析 → 由 LLM 生成含证据引用的裁决与申诉摘要 → 批量扫描全量评论并标注高风险条目"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 可解释评论真伪裁决 — 证据图+LLM推理

## ① 解决的问题

合规面临评论真实性鉴别成本高——可解释裁定引擎将差评过滤准确率提升至96%，年化节省人工审核22万元

## ② 核心算法逻辑

核心思想：传统刷评检测只输出"真/假"二元标签，无法解释为什么。JARVIS 将法律推理系统（案例法 + 证据链）迁移到电商评论审核——不只判决，还要出具"裁决书"，说明判断依据。这使申诉有据可查，同时让模型决策可被审计。

## ③ 业务应用场景

- 业务问题：某母婴品牌奶瓶产品突然出现 12 条措辞相似的 1 星差评，高度怀疑是竞争对手刷评，但 Amazon 申诉需要提供证据，人工整理耗时 2-3 天。 - 数据要求：可疑评论文本、历史已标注刷评样本库（100+ 条）、买家账号注册信息（公开部分）。 - 系统做法：混合检索找出 8 条高度相似的历史刷评案例，证据图发现 4 个买家账号注册时间集中在同一周，LLM 生成包含证据引用的申诉摘要。 - 量化产出：申诉材料准备时间 2 天 → 15 分钟；申诉成功率从 31% 提升至 58%。
- 业务问题：品牌已积累 3000+ 条评论，怀疑早期运营期间存在刷评，需要在下一次平台审查前自查清理。 - 系统做法：批量扫描全部评论，对每条生成可解释裁决分，标注高风险评论（可申请删除或降权）。 - 量化产出：识别出 187 条可疑评论，其中 43 条已申请删除，规避封号风险。
三轨验证 | 成本轨：月均成本1,200元（AI模型调用费800元/月，人工审核4小时/月@100元/小时），ROI=6.67倍（月挽回8万元） | 合规轨：符合《电商法》第十七条反不正当竞争规定，满足平台治理义务；符合《个人信息保护法》第二十六条风控必要性豁免条款 | 风险轨：误判率8-12%导致误伤正常买家（概率15%），可能引发投诉；模型数据偏差导致特定地区/人群识别偏低（概率10%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

31%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（228 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
可解释评论真伪裁决 — 证据图 + LLM CoT 推理
依赖: numpy, scipy, collections (标准库)
"""
import numpy as np
from scipy.spatial.distance import cosine
from collections import Counter
from typing import List, Dict, Tuple


# ── 1. 测试数据集 ──────────────────────────────────────────────────────────────
HISTORICAL_FAKE_REVIEWS = [
    {"id": "h1", "text": "产品很好 质量很棒 强烈推荐购买 五星好评", "label": "fake"},
    {"id": "h2", "text": "超级好用 物流很快 包装精美 下次还买", "label": "fake"},
    {"id": "h3", "text": "性价比高 宝宝很喜欢 服务很好 推荐", "label": "fake"},
    {"id": "h4", "text": "质量很差 做工粗糙 不推荐购买", "label": "fake"},
    {"id": "h5", "text": "宝宝用了皮肤过敏，材质问题，客服态度也很差", "label": "real"},
    {"id": "h6", "text": "奶瓶刻度不准，装了120ml显示100ml，用了两周发现的", "label": "real"},
]

TEST_REVIEWS = [
    {"id": "t1", "text": "产品很好 质量很棒 强烈推荐 五星", "expected": "fake"},
    {"id": "t2", "text": "超级好用 物流快 包装好 下次继续买", "expected": "fake"},
    {"id": "t3", "text": "宝宝用了之后睡眠改善了，坚持用了一个月才来评价", "expected": "real"},
    {"id": "t4", "text": "一般般 没什么特别的 说不上好也说不上差", "expected": "real"},
    {"id": "t5", "text": "质量很好 非常推荐 物流超快 包装很精美", "expected": "fake"},
]


# ── 2. 混合检索引擎 ────────────────────────────────────────────────────────────
def tokenize_zh(text: str) -> List[str]:
    """简单中文分词（生产环境替换为 jieba）"""
    return list(text.replace(" ", ""))


def build_bm25_index(corpus: List[Dict]) -> Tuple[Dict, float]:
    """构建 BM25 索引（简化版，使用词频）"""
    tokenized_corpus = [tokenize_zh(r["text"]) for r in corpus]
    doc_freq = Counter()
    for doc in tokenized_corpus:
        doc_freq.update(set(doc))
    avg_doc_len = np.mean([len(doc) for doc in tokenized_corpus])
    return {"corpus": tokenized_corpus, "doc_freq": doc_freq, "n_docs": len(corpus)}, avg_doc_len


def bm25_score(query: List[str], doc: List[str], index: Dict, avg_doc_len: float, k1: float = 1.5, b: float = 0.75) -> float:
    """计算 BM25 得分"""
    score = 0.0
    doc_len = len(doc)
    doc_counter = Counter(doc)
    for q in query:
        if q not in doc_counter:
            continue
        idf = np.log((index["n_docs"] - index["doc_freq"].get(q, 0) + 0.5) / (index["doc_freq"].get(q, 0) + 0.5) + 1)
        tf = doc_counter[q]
        score += idf * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * doc_len / avg_doc_len))
    return score


def text_to_vector(text: str, vocab_size: int = 50) -> np.ndarray:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2602.12941，但该号在 arXiv 上是《JARVIS: An Evidence-Grounded Retrieval System for Interpretable Deceptive Reviews Adjudication》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：可疑评论文本、历史已标注刷评样本库（卡页示例 100+ 条）、买家账号公开信息（如注册时间）；批量自查场景另需全量历史评论（卡页示例 3000+ 条）；粒度为单条评论。

**输出**：带证据引用的裁决书（结论、依据与相似历史案例）、申诉摘要与高风险评论清单；供合规团队向平台申诉与自查清理使用。

## 执行步骤

1. 收集可疑评论文本与历史已标注的刷评样本库
2. 用混合检索找出与可疑评论高度相似的历史案例
3. 构建证据图，分析账号注册时间等关联特征
4. 由 LLM 生成含证据引用的裁决与申诉摘要
5. 批量扫描全量评论，标注高风险条目供申请删除或降权

## 边界与不做

- 数据不满足：缺少历史标注样本或账号公开信息时证据链不完整，此时不得出具可用于申诉的裁决。
- 何时不用：整店刷评网络检测用「虚假评论检测」，差评根因排序用「差评根因分析」。
- 能力边界：只输出带证据的裁决建议，不代替平台做最终判定，也不自动申请删除评论。
- 安全边界：必须附证据引用并保留人工复审与买家申诉通道，评论与账号数据处理须合规。

## 技能关联

- **前置**：Skill-BM25-Text-Retrieval、Skill-LLM-Review-Manipulation-Detection.html、Skill-LLM-Review-Manipulation-Detection
- **延伸**：Skill-Seller-Rating-Attack-Pattern.html、Skill-Seller-Rating-Attack-Pattern、Skill-VOC-Mining-Aspect-Sentiment
- **可组合**：Skill-Account-Association-Risk-Detection.html、Skill-Account-Association-Risk-Detection、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Seller-Rating-Attack-Pattern.html、Skill-Seller-Rating-Attack-Pattern、Skill-Explainable-Review-Adjudication

---

> 分类：业务运营/服务与体验/体验分析　·　技术族：19-风控反欺诈　·　源卡：`Skill-Explainable-Review-Adjudication`