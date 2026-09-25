---
name: "p2s-ares-rag-evaluation"
title: "ARES — 自动化RAG系统评测框架"
description: "触发词：RAG 评测、ARES、知识库质检、幻觉率排序、自动评测。何时不用：要专测多跳或时效类问题时通用评测覆盖不足，须换专项基准；只需判断单条回答有无幻觉走幻觉检测。安全边界：评测结果可追溯并满足质量体系要求，LLM 判断存在偏差，须对高风险样本人工抽检。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-140"
l3_business: "数据质量"
l3_all: "数据质量 / 业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据质量"
p2s_card_id: "Skill-ARES-RAG-Evaluation"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "每周自动给知识库做质检，按类别排出幻觉率，告诉编辑先修哪一条。"
user_try: "试试：用过去 30 天的真实提问跑一遍 RAG 评测，按类别排出幻觉率。"
whenToUse: "知识库上线后要做常态化质量巡检、并排出更新优先级时用；要专测多跳或时效类问题时改用对应专项基准。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# ARES — 自动化RAG系统评测框架

## ① 解决的问题

AI团队面临知识库质量缺乏自动化评测——ARES将人工评测成本降低90%，评测周期从2周→2小时，年化节省评测成本25万元

## ② 核心算法逻辑

核心思想：用LLMasjudge替代人工标注，通过三维评测框架自动量化RAG系统质量，实现零人工成本的持续评估。

## ③ 业务应用场景

场景A：知识库每周自动质检，识别高幻觉类别
- 业务问题：母婴知识库覆盖2000+条目（婴儿推车、暖奶器、有机辅食等），客服每月收到50+投诉涉及"知识库回复不准确"，人工逐条复审需200小时/月，成本¥12000/月，且存在3-5天审核延迟 - 数据要求：过去30天的1500条真实用户查询、检索到的文档片段、系统生成的答案、用户反馈标签 - 预期产出：周报告显示各类别幻觉率排序（如"暖奶器温度设置"幻觉率18%、"有机辅食过敏源"幻觉率8%），自动标记高风险条目，指导知识库编辑优先更新 - 业务价值：年化节省人工成本¥144000，投诉率下降65%，知识库更新效率提升3倍，年化ROI约¥280000
三轨验证 | 成本轨：月均成本¥800（API调用费用），相比人工¥12000降低93% | 合规轨：评测结果可追溯、符合ISO 9001质量管理体系要求 | 风险轨：LLM判断偏差（概率5%）可通过人工抽检20%高风险样本规避

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：知识库运营团队面临"人工QA成本高、评测覆盖率低、更新优先级不清"的困境——ARES将月均人工成本从¥12000降至¥800，评测覆盖率从60%提升至95%，年化节省¥280000+；Agent发布团队通过三维自动化验收测试，上线周期缩短3天，年化节省¥260000+；合计年化ROI约¥700000
实施难度：⭐⭐⭐☆☆（需集成LLM API、构建测试集、配置评测流程）
优先级：⭐⭐⭐⭐☆（直接降本增效，ROI清晰，技术成熟度高）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（253 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple
import json
from datetime import datetime

# ============ ARES RAG Evaluation Framework ============
# 应用场景：母婴跨境电商知识库与Agent质检

class ARESEvaluator:
    """ARES三维评测框架实现"""
    
    def __init__(self, model_name: str = "gpt-4"):
        self.model_name = model_name
        self.evaluation_results = []
        
    def evaluate_context_relevance(self, query: str, retrieved_docs: List[str]) -> float:
        """
        评测1：上下文相关性（检索质量）
        C_rel = 1/|D| * Σ I[LLM-judge(q, d) = relevant]
        """
        relevance_scores = []
        for doc in retrieved_docs:
            # 模拟LLM-judge判断：文档与查询的相关性
            score = self._llm_judge_relevance(query, doc)
            relevance_scores.append(score)
        
        context_relevance = np.mean(relevance_scores) if relevance_scores else 0.0
        return round(context_relevance, 3)
    
    def evaluate_answer_faithfulness(self, answer: str, context: str) -> float:
        """
        评测2：答案忠实度（幻觉检测）
        F_faith = I[LLM-judge(answer, context) = faithful]
        返回0-1，1表示完全忠实，0表示存在幻觉
        """
        # 模拟LLM-judge判断：答案是否基于上下文
        faithfulness_score = self._llm_judge_faithfulness(answer, context)
        return round(faithfulness_score, 3)
    
    def evaluate_answer_relevance(self, answer: str, reference_answer: str) -> float:
        """
        评测3：答案相关性（实用性）
        A_rel = semantic_similarity(answer, reference)
        """
        # 模拟语义相似度计算
        relevance_score = self._semantic_similarity(answer, reference_answer)
        return round(relevance_score, 3)
    
    def _llm_judge_relevance(self, query: str, doc: str) -> float:
        """LLM判断文档与查询相关性"""
        # 简化实现：基于关键词重叠度
        query_words = set(query.lower().split())
        doc_words = set(doc.lower().split())
        overlap = len(query_words & doc_words) / max(len(query_words), 1)
        return min(overlap * 1.2, 1.0)  # 归一化到0-1
    
    def _llm_judge_faithfulness(self, answer: str, context: str) -> float:
        """LLM判断答案是否基于上下文（幻觉检测）"""
        # 简化实现：检查答案关键词是否出现在上下文中
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2311.09476 — ARES: An Automated Evaluation Framework for Retrieval-Augmented Generation Systems

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：过去一段时间的真实用户查询、检索到的文档片段、系统生成的答案，以及用户反馈标签

**输出**：各类别幻觉率排序与高风险条目标记（周报告形式），供知识库编辑排优先级与 Agent 上线验收

## 执行步骤

1. 准备评测集：真实查询、检索片段、系统答案与反馈标签。
2. 按上下文相关性、答案忠实度、答案相关性三个维度自动打分。
3. 按业务类别汇总幻觉率并排序，标出高风险类别与条目。
4. 对高风险样本做人工抽检，纠正 LLM 判断偏差。
5. 把周报告推给知识库编辑，作为更新优先级依据。

## 边界与不做

- 何时不用：要专测多跳推理或时效类问题时，通用评测覆盖不足，须换专项基准。
- 能力边界：评测只给出质量信号与排序，不自动改写或修复知识库内容。
- 安全边界：评测结果可追溯并满足质量体系要求；LLM 判断存在偏差（卡页标注约 5%），高风险样本须人工抽检。

## 技能关联

- **前置**：Skill-CRAG-Comprehensive-RAG-Benchmark.html、Skill-CRAG-Comprehensive-RAG-Benchmark、Skill-Corrective-RAG-CRAG.html、Skill-Corrective-RAG-CRAG、Skill-LLM-as-Judge-Evaluator.html、Skill-LLM-as-Judge-Evaluator、Skill-RAG-Adversarial-Robustness-2025.html、Skill-RAG-Adversarial-Robustness-2025、Skill-RAGAS-RAG-Evaluation-Framework.html、Skill-RAGAS-RAG-Evaluation-Framework、Skill-ReliabilityBench-Agent-Reliability.html、Skill-ReliabilityBench-Agent-Reliability
- **延伸**：Skill-CRAG-Comprehensive-RAG-Benchmark.html、Skill-CRAG-Comprehensive-RAG-Benchmark、Skill-Corrective-RAG-CRAG.html、Skill-Corrective-RAG-CRAG、Skill-RAG-Adversarial-Robustness-2025.html、Skill-RAG-Adversarial-Robustness-2025、Skill-ReliabilityBench-Agent-Reliability.html、Skill-ReliabilityBench-Agent-Reliability
- **可组合**：Skill-Corrective-RAG-CRAG.html、Skill-Corrective-RAG-CRAG、Skill-RAG-Adversarial-Robustness-2025.html、Skill-RAG-Adversarial-Robustness-2025、Skill-ARES-RAG-Evaluation

---

> 分类：数据与Agent平台/数据与AI运行/数据质量　·　技术族：08-知识图谱　·　源卡：`Skill-ARES-RAG-Evaluation`