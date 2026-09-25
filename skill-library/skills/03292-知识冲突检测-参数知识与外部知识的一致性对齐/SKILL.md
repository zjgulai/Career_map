---
name: "p2s-knowledge-conflict-detection-llm"
title: "知识冲突检测 — 参数知识与外部知识的一致性对齐"
description: "触发词：知识冲突、版本矛盾、一致性校验、字段级定位、修复建议、知识对齐。何时不用：要修正检索到的过期文档时用「Corrective-RAG 纠错检索」，要抽文档跨句关系时用「文档级关系抽取」。安全边界：冲突判定与修复建议须保留新旧条款出处，不得直接覆盖原始法规文本。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-131"
l3_business: "产品准入核对"
l3_all: "产品准入核对 / 知识溯源"
l1_l2_l3: "独立控制/财务与合规/产品准入核对"
p2s_card_id: "Skill-Knowledge-Conflict-Detection-LLM"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "知识库里 2023 版和新版法规打架，哪些条目标矛盾、该按哪版改，一次定位到字段级。"
user_try: "试试：扫一遍我的合规知识库，找出新旧版本法规互相矛盾的条目，并给出按新版修复的建议。"
whenToUse: "知识库里同时存在新旧版本法规或参数知识、需要定位矛盾条目时用；要修正检索到的过期文档时用「Corrective-RAG 纠错检索」；要抽文档跨句关系时用「文档级关系抽取」。"
workflow: "收集新旧版本配对文档与历史 listing 文本 → 对同一问题取参数知识与文档证据 → 用对比解码找概率分歧并打一致性分 → 把冲突定位到字段级 → 输出修复建议并推荐采用新版标准"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 知识冲突检测 — 参数知识与外部知识的一致性对齐

## ① 解决的问题

合规团队面临新旧版本法规在知识库中冲突——知识冲突检测将矛盾条目识别率95%，法规审查效率提升8倍，年化节省32万元

## ② 核心算法逻辑

三层冲突检测框架：LLM参数知识、外部文档、时间维度的一致性对齐。

## ③ 业务应用场景

- 业务问题：欧盟REACH法规、美国FDA婴儿配方奶粉标准频繁更新。知识库中存在2023年旧版要求与2026年新版要求的矛盾描述，导致商品listing中营养成分声称、过敏原标注不一致，触发平台审核拒绝率8.3%，月均影响SKU 240个。
- 数据要求：(1)合规文档库：新旧版本配对文档≥500对；(2)历史listing数据：12个月×2000+SKU的描述文本；(3)审核反馈日志：驳回原因分类标签。
- 预期产出：(1)冲突知识对识别准确率≥92%；(2)冲突位置精确到字段级（如"蛋白质含量范围"）；(3)自动生成修复建议（推荐采用新版标准）。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：采购与合规团队面临知识库版本冲突导致的审核拒绝与采购延迟——知识冲突检测将合规审核驳回率从8.3%改善至1.2%，采购决策周期从3.2天缩短至0.8天，年化收益42万元（合规场景）+ 180万元（采购场景）= 222万元，系统年成本约30万元，ROI达640%。
实施难度：⭐⭐⭐☆☆（需要文档标准化、LLM集成、实时数据源对接）
优先级：⭐⭐⭐⭐☆（高频业务痛点，直接影响合规与成本）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（322 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from collections import defaultdict
from sklearn.metrics.pairwise import cosine_similarity
import json

# ============ 母婴跨境场景：婴儿推车/暖奶器/有机辅食 ============

class KnowledgeConflictDetector:
    """
    三层冲突检测：参数知识 vs 外部文档 vs 时间维度
    """
    
    def __init__(self, consistency_threshold=0.7, prob_diff_threshold=0.15):
        self.consistency_threshold = consistency_threshold
        self.prob_diff_threshold = prob_diff_threshold
        self.conflict_log = []
    
    def simulate_llm_outputs(self, query, param_knowledge, external_docs):
        """
        模拟LLM参数知识与文档基础答案的生成
        返回：(参数知识答案, 文档答案列表, token概率)
        """
        # 参数知识答案（模拟LLM内置知识）
        param_answer = param_knowledge.get("answer", "")
        param_prob = param_knowledge.get("confidence", 0.85)
        
        # 文档基础答案
        doc_answers = [doc.get("answer", "") for doc in external_docs]
        doc_probs = [doc.get("confidence", 0.90) for doc in external_docs]
        
        return param_answer, doc_answers, param_prob, doc_probs
    
    def calculate_consistency_score(self, param_answer, doc_answers):
        """
        计算一致性评分：基于ROUGE-L相似度的简化版本
        """
        if not doc_answers:
            return 0.0
        
        # 简化ROUGE-L：基于共同词汇比例
        def rouge_l_similarity(s1, s2):
            words1 = set(s1.lower().split())
            words2 = set(s2.lower().split())
            if not words1 or not words2:
                return 0.0
            intersection = len(words1 & words2)
            union = len(words1 | words2)
            return intersection / union if union > 0 else 0.0
        
        scores = [rouge_l_similarity(param_answer, doc_ans) for doc_ans in doc_answers]
        return np.mean(scores) if scores else 0.0
    
    def detect_probability_divergence(self, param_prob, doc_probs):
        """
        对比解码：检测token级别概率差异
        """
        doc_prob_mean = np.mean(doc_probs)
        prob_diff = abs(param_prob - doc_prob_mean)
        is_divergent = prob_diff > self.prob_diff_threshold
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2403.08319。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：合规文档库（新旧版本配对文档 ≥500 对）、历史 listing 数据（12 个月 × 2000+ SKU 的描述文本）、审核反馈日志（驳回原因分类标签）；阈值默认一致性 0.7、概率差 0.15；粒度：字段级。

**输出**：冲突知识对清单与字段级冲突位置（如蛋白质含量范围）、冲突识别准确率与自动修复建议（推荐采用新版标准）；目标为审核驳回率由 8.3% 降至 1.2%，供合规与采购修正知识库与线上 listing。

## 执行步骤

1. 收集新旧版本配对文档与 listing 文本
2. 对同一问题取参数知识与文档证据
3. 用对比解码找概率分歧并打一致性分
4. 把冲突定位到具体字段
5. 输出修复建议并推荐采用新版

## 边界与不做

- 数据不满足时不用：没有新旧版本配对文档、或审核反馈日志缺驳回原因标签时，冲突定位不准。
- 能力边界：只做冲突识别与修复建议，不自动改写法规原文或线上 listing，覆盖与采纳须经人工确认。
- 时效边界：法规更新频繁，需持续接入新版本文档并重跑检测，否则冲突判定会滞后于最新版本。

## 技能关联

- **前置**：Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-KG-Hallucination-Detection.html、Skill-KG-Hallucination-Detection、Skill-Knowledge-Conflict-Detection-Resolution.html、Skill-Knowledge-Conflict-Detection-Resolution、Skill-Multi-Source-Fact-Verification、Skill-PoisonedRAG-Knowledge-Poisoning-Defense.html、Skill-PoisonedRAG-Knowledge-Poisoning-Defense、Skill-TG-RAG-Temporal-Knowledge-Graph.html、Skill-TG-RAG-Temporal-Knowledge-Graph、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-WRITEBACK-RAG-Trainable-KB.html、Skill-WRITEBACK-RAG-Trainable-KB
- **延伸**：Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Multi-Source-Fact-Verification、Skill-PoisonedRAG-Knowledge-Poisoning-Defense.html、Skill-PoisonedRAG-Knowledge-Poisoning-Defense、Skill-TG-RAG-Temporal-Knowledge-Graph.html、Skill-TG-RAG-Temporal-Knowledge-Graph、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-WRITEBACK-RAG-Trainable-KB.html、Skill-WRITEBACK-RAG-Trainable-KB
- **可组合**：Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Multi-Source-Fact-Verification、Skill-TG-RAG-Temporal-Knowledge-Graph.html、Skill-TG-RAG-Temporal-Knowledge-Graph、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Knowledge-Conflict-Detection-LLM

---

> 分类：独立控制/财务与合规/产品准入核对　·　技术族：08-知识图谱　·　源卡：`Skill-Knowledge-Conflict-Detection-LLM`