---
name: "p2s-sdpm-semantic-chunking"
title: "SDPM语义双阶段分块 — 边界感知的智能分块策略"
description: "触发词：语义分块、边界感知、检索召回、分块粒度、长文本切分。何时不用：需要识别文档版面区域并剔除图注时用版面理解技能；需要把文档解析成结构化字段时用文档智能解析技能。安全边界：分块只改变切分方式、不得删改原文条款内容，相似度阈值须用验证集校验后再上线。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 数据质量"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-SDPM-Semantic-Chunking"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "不再机械按字数切文档，而是按语义边界合并句子，让检索能完整召回一整条条款。"
user_try: "试试：把这批合规文档做语义分块，让蛋白质含量标准这类跨段内容落在同一个块里。"
whenToUse: "文档要进检索库、固定长度切分导致语义被截断时用本技能；需要识别版面区域或抽取表格，用版面理解与文档解析技能。"
workflow: "按句切分文本并计算句向量 → 按相邻句相似度合并语义完整段落 → 按 token 预算做二次细分 → 输出带边界的语义块 → 用检索评测验证召回效果"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# SDPM语义双阶段分块 — 边界感知的智能分块策略

## ① 解决的问题

数据团队面临合规文档固定分块破坏语义完整性——SDPM将RAG准确率从65%→81%，合规审查错误率-62%，年化规避风险38万元

## ② 核心算法逻辑

核心思想：通过两阶段边界优化，将语义相近的句子合并，再基于Token预算精修，突破固定长度分块的语义割裂问题。

## ③ 业务应用场景

场景A：合规文档语义完整分块提升RAG准确率 - 业务问题：母婴产品合规文档（FDA/CE认证、成分安全声明）采用固定512-token分块，导致「婴儿奶粉蛋白质含量标准」跨两个chunk，RAG召回准确率仅65%，合规审查耗时增加40% - 数据要求：500份母婴产品合规文档（平均3000-8000 tokens/文档）、FDA/GB标准库、历史RAG查询日志（含标注的相关性标签） - 预期产出：RAG召回准确率81%（+16%）、平均分块语义连贯度评分0.87/1.0、合规审查周期缩短至原来的65% - 业务价值：年化72万元（基础：合规审查人员成本月均3万×12月，效率提升35%）
三轨验证 | 成本轨：月均成本4800元（GPU算力租赁2000元+embedding API调用2800元），ROI周期3.2个月 | 合规轨：SDPM分块保留完整的FDA认证段落，符合《跨境电商产品信息溯源规范》，已通过杭州市场监管部门审核 | 风险轨：语义相似度阈值 $\tau$ 设置不当导致过度合并（概率15%），可通过验证集A/B测试规避
场景B：供应商协议长文本边界感知切分 - 业务问题：与海外供应商签署的产品采购协议（平均15000-25000 tokens）采用固定分块，导致「退货条款」与「质量保证期」分散在5个chunks，知识库检索时无法完整回答「产品质量纠纷处理流程」，客服响应准确率62% - 数据要求：200份供应商协议文本、客服常见问题库（500+QA对）、历史客服工单标注数据 - 预期产出：客服问题一次性解答准确率提升至88%（+26%）、平均分块数量从原来的32个降至18个、知识库检索延迟<200ms - 业务价值：年化58万元（基础：客服团队月均成本8万×12月，准确率提升26%减少返工+客户投诉处理成本）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：母婴跨境电商运营团队面临「合规文档检索准确率低+供应商协议管理低效」——SDPM语义分块将RAG召回准确率从65%改善至81%、客服问题解答准确率从62%提升至88%，年化130万元（合规审查效率+客服成本节省）
实施难度：⭐⭐⭐☆☆（需embedding模型部署、相似度阈值调优、Token预算设置）
优先级：⭐⭐⭐⭐☆（直接影响合规风险与客户体验，ROI周期<3个月）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（134 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
import re

# ============ 初始化 ============
class SDPMSemanticChunker:
    def __init__(self, similarity_threshold=0.65, token_budget=512, model_name='sentence-transformers/all-MiniLM-L6-v2'):
        """
        SDPM两阶段分块器
        Args:
            similarity_threshold: Phase1语义相似度阈值
            token_budget: Phase2 Token预算
            model_name: embedding模型
        """
        self.threshold = similarity_threshold
        self.budget = token_budget
        self.model = SentenceTransformer(model_name)
        self.token_counter = lambda x: len(x.split())
    
    def phase1_semantic_merge(self, sentences):
        """
        Phase1：基于语义相似度合并相邻句子
        """
        if len(sentences) <= 1:
            return sentences
        
        # 计算所有句子的embedding
        embeddings = self.model.encode(sentences, convert_to_numpy=True)
        
        # 计算相邻句子的余弦相似度
        merged_sentences = [sentences[0]]
        
        for i in range(len(sentences) - 1):
            similarity = cosine_similarity(
                embeddings[i].reshape(1, -1),
                embeddings[i + 1].reshape(1, -1)
            )[0][0]
            
            # 如果相似度高于阈值，合并到前一个句子
            if similarity > self.threshold:
                merged_sentences[-1] += " " + sentences[i + 1]
            else:
                merged_sentences.append(sentences[i + 1])
        
        return merged_sentences
    
    def phase2_token_budget_refinement(self, merged_sentences):
        """
        Phase2：基于Token预算精修分块边界
        """
        chunks = []
        current_chunk = ""
        
        for sentence in merged_sentences:
            sentence_tokens = self.token_counter(sentence)
            current_tokens = self.token_counter(current_chunk)
            
            # 如果加入该句子会超过预算，则开启新chunk
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.04053，但该号在 arXiv 上是《Floquet Analysis on an Irradiated Nodal Surface Semimetal with Non-Symmorphic Symmetry》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：待分块的长文档（合规文档、供应商协议等）与向量模型、相似度阈值、token 预算等参数，粒度到单个句子与最终语义块。

**输出**：语义完整的文本块及其边界信息（块数与跨度、语义连贯度），供检索增强生成与知识库问答使用。

## 执行步骤

1. 按句切分文档并计算句向量
2. 相邻句相似度高于阈值则合并到同一块
3. 按 token 预算做第二阶段细分，避免超长块
4. 输出带边界与元数据的语义块
5. 用历史查询做召回评测，必要时调整阈值

## 边界与不做

- 文档本身是短文本或结构极规整时收益有限；相似度阈值设置不当会导致过度合并或切碎，必须用验证集校验。
- 本技能只改变切分粒度、不改变原文内容，检索准确率的提升幅度以卡页原始口径为准。

## 技能关联

- **前置**：Skill-Adaptive-Chunk-Size-Optimization、Skill-BGE-M3-Multilingual-Embedding.html、Skill-BGE-M3-Multilingual-Embedding、Skill-ColBERT-Late-Interaction-Retrieval、Skill-Dense-Passage-Retrieval.html、Skill-Dense-Passage-Retrieval、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-NuggetIndex-Atomic-Knowledge-Management.html、Skill-NuggetIndex-Atomic-Knowledge-Management、Skill-RAPTOR-Hierarchical-RAG.html、Skill-RAPTOR-Hierarchical-RAG、Skill-Semantic-Chunking-Strategy.html、Skill-Semantic-Chunking-Strategy、Skill-Sentence-Embedding-Fundamentals、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-Adaptive-Chunk-Size-Optimization、Skill-BGE-M3-Multilingual-Embedding.html、Skill-BGE-M3-Multilingual-Embedding、Skill-ColBERT-Late-Interaction-Retrieval、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-NuggetIndex-Atomic-Knowledge-Management.html、Skill-NuggetIndex-Atomic-Knowledge-Management、Skill-RAPTOR-Hierarchical-RAG.html、Skill-RAPTOR-Hierarchical-RAG、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-BGE-M3-Multilingual-Embedding.html、Skill-BGE-M3-Multilingual-Embedding、Skill-ColBERT-Late-Interaction-Retrieval、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-SDPM-Semantic-Chunking

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：08-知识图谱　·　源卡：`Skill-SDPM-Semantic-Chunking`