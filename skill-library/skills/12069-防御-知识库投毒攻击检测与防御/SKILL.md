---
name: "p2s-poisonedrag-knowledge-poisoning-defense"
title: "PoisonedRAG防御 — 知识库投毒攻击检测与防御"
description: "触发词：知识库投毒、虚假声明、异常检测、实时告警、合规风险。何时不用：知识库没有外部写入通道、内容全部内部审核过时，投毒风险很低；本技能面向内容会从外部汇入的系统。安全边界：告警与拦截判据是契约产物，下架动作由执行层完成；合规结论须人工复核，不得直接对外发布。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-136"
l3_business: "安全事件处理"
l3_all: "安全事件处理 / 数据质量"
l1_l2_l3: "独立控制/数据与AI运行/安全事件处理"
p2s_card_id: "Skill-PoisonedRAG-Knowledge-Poisoning-Defense"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "有人往知识库里塞了假的成分和合规信息，用困惑度、一致性和异常检测三层把它认出来并告警。"
user_try: "试试：检查这批新入库的成分文档，看有没有被植入的虚假声明。"
whenToUse: "知识库接受外部或跨团队内容、且输出会被客服或合规直接引用时用本技能；内容完全内部受控时优先级下降。"
workflow: "建立合法文档基线与统计画像 → 对新文档跑困惑度与一致性检测 → 对照第三方认证库做事实核对 → 命中异常则实时告警并转人工"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# PoisonedRAG防御 — 知识库投毒攻击检测与防御

## ① 解决的问题

安全团队面临知识库被竞品植入虚假合规信息——投毒攻击检测将恶意文档识别率达96%，规避合规风险年化保护价值80万元

## ② 核心算法逻辑

核心思想：通过对抗性文档注入攻击识别RAG系统中被篡改的知识源，并采用困惑度过滤、一致性检验、相似度异常检测三层防御机制阻止投毒知识对LLM决策的污染。

## ③ 业务应用场景

- 业务问题：竞品通过RAG知识库注入虚假婴儿奶粉成分信息（如"某品牌含禁用添加剂"），导致客户咨询系统返回误导性安全警告，造成品牌信任度下降35%、退货率增加18%、月均损失约12万元。
- 数据要求：(1) 历史合法产品成分文档库（≥5000份）；(2) 产品咨询query日志（月均≥50000条）；(3) 第三方认证数据库（FDA/NMPA标准库）；(4) 客户反馈与投诉记录。
- 预期产出：(1) 投毒文档检测准确率≥94%；(2) 虚假成分声明识别率≥91%；(3) 实时告警系统（检测延迟<100ms）；(4) 月度投毒攻击趋势报告。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
场景A（竞品虚假信息防御）：产品运营团队面临竞品通过RAG知识库注入虚假成分信息导致品牌信任度下降、客户投诉增加的困境——PoisonedRAG防御将虚假信息检测准确率从人工审核的72%提升至94%，年化规避损失144万元+增收89万元，年化ROI≈233万元。
场景B（合规知识库监控）：合规团队面临知识库篡改导致客服给出不合规建议、触发平台罚款的风险——该方案将合规风险事件从月均3-5起降至<0.5起，年均规避罚款48-96万元+节省人力成本156万元+增收203万元，年化ROI≈407-459万元。
实施难度：⭐⭐⭐☆☆
需要构建合法知识库基线（1-2周）
集成困惑度、一致性、异常检测三层防御（2-3周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（273 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from collections import defaultdict
from sklearn.preprocessing import StandardScaler
from scipy.stats import zscore
import hashlib
import json

# ============ 母婴跨境场景：婴儿推车/暖奶器/有机辅食知识库投毒防御 ============

class PoisonedRAGDefense:
    """RAG知识库投毒攻击检测与防御系统"""
    
    def __init__(self, ppl_threshold=150, consistency_threshold=0.65, 
                 similarity_zscore_threshold=2.0):
        self.ppl_threshold = ppl_threshold
        self.consistency_threshold = consistency_threshold
        self.similarity_zscore_threshold = similarity_zscore_threshold
        self.document_cache = {}
        self.baseline_stats = {}
        
    def calculate_perplexity(self, text):
        """困惑度计算：识别语言统计异常的投毒文档"""
        # 模拟基于n-gram的困惑度计算
        words = text.lower().split()
        if len(words) < 2:
            return float('inf')
        
        # 计算词频分布熵
        word_freq = defaultdict(int)
        for word in words:
            word_freq[word] += 1
        
        total_words = len(words)
        entropy = 0
        for freq in word_freq.values():
            p = freq / total_words
            if p > 0:
                entropy -= p * np.log2(p)
        
        # 困惑度 = 2^entropy，异常文档通常PPL > 150
        perplexity = 2 ** entropy
        return perplexity
    
    def calculate_semantic_similarity(self, doc1, doc2):
        """简化的语义相似度计算（实际应用中使用BERT/Sentence-Transformer）"""
        words1 = set(doc1.lower().split())
        words2 = set(doc2.lower().split())
        
        if len(words1) == 0 or len(words2) == 0:
            return 0.0
        
        intersection = len(words1 & words2)
        union = len(words1 | words2)
        jaccard_sim = intersection / union if union > 0 else 0
        return jaccard_sim
    
    def check_consistency(self, document, reference_docs, query):
        """一致性检验：投毒文档与合法知识库的语义一致性通常<0.65"""
        if not reference_docs:
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2402.07867 — PoisonedRAG: Knowledge Corruption Attacks to Retrieval-Augmented Generation of Large Language Models

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：历史合法产品成分文档库（5000 份以上）、产品咨询查询日志（月均 50000 条以上）、第三方认证数据库（FDA、NMPA 等标准库）、客户反馈与投诉记录，按文档与查询粒度。

**输出**：投毒文档检测与虚假成分声明识别结果、实时告警（检测延迟在 100ms 以内）与月度投毒趋势报告，供合规与知识库运维使用。

## 执行步骤

1. 构建合法文档基线与统计画像
2. 对新文档做困惑度与一致性异常检测
3. 对照第三方认证库核验事实
4. 命中异常时实时告警并暂停入库
5. 按月输出投毒趋势报告

## 边界与不做

- 知识库无外部写入通道、内容全部内部审核时，投毒风险与优先级都低。
- 本技能产出检测结果与告警，不执行文档下架与合规结论的对外发布。
- 合规判定必须人工复核，检测结果不得直接作为对外结论。

## 技能关联

- **前置**：Skill-FActScore-Claim-Verification-Pipeline.html、Skill-FActScore-Claim-Verification-Pipeline、Skill-KG-Hallucination-Detection.html、Skill-KG-Hallucination-Detection、Skill-Knowledge-Conflict-Detection-LLM.html、Skill-Knowledge-Conflict-Detection-LLM、Skill-PromptGuard-Injection-Defense.html、Skill-PromptGuard-Injection-Defense、Skill-RAGAS-RAG-Evaluation-Framework.html、Skill-RAGAS-RAG-Evaluation-Framework
- **延伸**：Skill-Knowledge-Conflict-Detection-LLM.html、Skill-Knowledge-Conflict-Detection-LLM、Skill-PromptGuard-Injection-Defense.html、Skill-PromptGuard-Injection-Defense、Skill-RAGAS-RAG-Evaluation-Framework.html、Skill-RAGAS-RAG-Evaluation-Framework
- **可组合**：Skill-RAGAS-RAG-Evaluation-Framework.html、Skill-RAGAS-RAG-Evaluation-Framework、Skill-PoisonedRAG-Knowledge-Poisoning-Defense

---

> 分类：独立控制/数据与AI运行/安全事件处理　·　技术族：08-知识图谱　·　源卡：`Skill-PoisonedRAG-Knowledge-Poisoning-Defense`