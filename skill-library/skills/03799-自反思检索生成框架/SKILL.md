---
name: "p2s-self-rag-reflective-retrieval"
title: "Self-RAG — 自反思检索生成框架"
description: "触发词：自反思检索、幻觉控制、检索时机判断、合规文档更新、答案支撑度。何时不用：知识库稳定、问题简单时普通 RAG 即可；要优化候选排序时用精排或 Listwise 重排。安全边界：涉合规与健康类的回答须给出来源文档与支撑度标记并保留人工复核通道，不得以模型自评替代事实核验。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 知识溯源"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-Self-RAG-Reflective-Retrieval"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "让模型自己判断该不该检索、检索来的内容够不够支撑答案，把过时信息导致的错误答复压下去。"
user_try: "试试：回答辅食过敏原问题前，先判断要不要检索最新合规文档，并标出每条结论的支撑度。"
whenToUse: "属于「业务工具实现」：知识更新频繁、答案必须有出处、需要控制幻觉时用；若知识库稳定且问题简单，普通 RAG 足够；若要优化候选排序，用精排或 Listwise 重排。"
workflow: "定义自反思信号：是否需要检索、文档是否相关、答案是否有支撑 → 对问题先判断是否需要检索，避免无谓调用 → 检索后评估文档相关性，不达标则重新检索或改写查询 → 生成时标注每条结论的支撑程度 → 对低支撑度结论转人工复核，并把标注回流训练数据"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Self-RAG — 自反思检索生成框架

## ① 解决的问题

知识库团队面临RAG生成幻觉率高达18%——Self-RAG自反思机制将幻觉率降至6%，决策准确率+34%，年化避免错误决策损失60万元

## ② 核心算法逻辑

核心思想：LLM在生成过程中动态决策何时检索、检索什么、生成质量是否达标，通过自我批评token（RETRIEVE、ISREL、ISSUP、ISUSE）形成自反思闭环，无需外部评估器。

## ③ 业务应用场景

- 业务问题：跨境母婴电商平台每日处理3000+条用户关于婴儿辅食添加、过敏原、营养搭配的问题。传统RAG系统无法判断何时需要检索最新合规文档，导致回答中包含过时信息（如已禁用的添加剂）的概率达18%，引发消费者投诉与平台罚款（月均5-8万元）。
- 数据要求： - 婴儿辅食知识库（1.2万条文档）：FDA/EFSA/中国GB标准、营养学论文、产品成分表 - 用户问题日志（过去6个月，12万条）：标注相关性、支撑度、最终有用性 - 合规文档更新流（周更新频率）
- 预期产出： - 自动判断何时需要检索：准确率94%（相比baseline 71%） - 生成内容的幻觉率：从18%降至3.2% - 平均检索次数：从100%降至42%（减少API成本） - 用户满意度提升：从3.1星→4.6星

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
婴儿辅食合规问答：运营团队面临"合规罚款+用户投诉"困境——Self-RAG将幻觉率从18%降至3.2%，年化减少罚款72万元、API成本42万元、用户流失损失42万元，总计年化156万元。
供应链备货建议：供应链经理面临"库存积压vs缺货"两难——Self-RAG将建议质量评分从3.1提升至4.6，年化减少库存损失384万元、人工审核成本78万元、缺货销售损失98.4万元，扣除实施成本276万元，年化净ROI 284万元。
实施难度：⭐⭐⭐☆☆
需要：LLM微调（2-3周）、标注数据集（1000-2000条）、推理基础设施（GPU）
不需要：复杂的外部评估器、强化学习框架

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（414 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple
from dataclasses import dataclass
from enum import Enum

# ============ 枚举定义 ============
class RelevanceScore(Enum):
    RELEVANT = 1
    IRRELEVANT = 0

class SupportScore(Enum):
    FULLY_SUPPORTED = 1.0
    PARTIALLY_SUPPORTED = 0.5
    NOT_SUPPORTED = 0.0

class UsefulnessScore(Enum):
    EXCELLENT = 5
    GOOD = 4
    NEUTRAL = 3
    POOR = 2
    USELESS = 1

# ============ 数据结构 ============
@dataclass
class Document:
    doc_id: str
    content: str
    source: str  # e.g., "FDA_Standard", "EFSA_Guideline"
    timestamp: str

@dataclass
class Query:
    query_id: str
    text: str
    category: str  # e.g., "allergen_check", "nutrition_advice"

@dataclass
class GenerationStep:
    step_id: int
    [REDACTED]
    retrieve_decision: bool  # RETRIEVE token
    retrieved_docs: List[Document]
    relevance_scores: List[float]  # ISREL
    support_score: float  # ISSUP
    usefulness_score: int  # ISUSE

# ============ 母婴场景数据 ============
# 场景1：婴儿辅食合规问答
infant_formula_docs = [
    Document(
        doc_id="FDA_001",
        content="FDA禁止在婴儿食品中添加BPA，最新更新2024年6月",
        source="FDA_Standard",
        timestamp="2024-06-15"
    ),
    Document(
        doc_id="EFSA_002",
        content="欧盟规定婴儿谷物食品中砷含量不超过0.1mg/kg",
        source="EFSA_Guideline",
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2310.11511 — Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：领域知识库（卡页示例婴儿辅食 1.2 万条文档，含 FDA/EFSA/中国 GB 标准、营养学论文与产品成分表）、用户问题日志（示例过去 6 个月 12 万条，标注相关性、支撑度与有用性）与合规文档更新流（示例周更新）。

**输出**：带支撑度标记的答案与检索决策记录：卡页示例把幻觉率从 18% 降至 3.2%、检索触发比例从 100% 降至 42%、回答质量评分从 3.1 提升至 4.6。

## 执行步骤

1. 定义自反思信号：是否需要检索、文档是否相关、答案是否有支撑
2. 对问题先判断是否需要检索，避免无谓调用
3. 检索后评估文档相关性，不达标则重新检索或改写查询
4. 生成时标注每条结论的支撑程度
5. 对低支撑度结论转人工复核，并把标注回流训练数据

## 边界与不做

- 数据不满足时不用：缺少带支撑度标注的问题日志时反思信号无法校准，需先积累标注数据。
- 能力边界：本卡产出带支撑度标记的答案，不替代事实核验与合规审核，模型自评不能作为结论正确的证明。
- 涉合规与健康类的回答须给出来源文档与支撑度标记，并保留人工复核通道。

## 技能关联

- **前置**：Skill-Adaptive-RAG-Query-Routing.html、Skill-Adaptive-RAG-Query-Routing、Skill-Corrective-RAG-CRAG.html、Skill-Corrective-RAG-CRAG、Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-GraphRAG-Knowledge-Enhanced-Retrieval.html、Skill-GraphRAG-Knowledge-Enhanced-Retrieval、Skill-HippoRAG-Multi-Hop-Reasoning-Retrieval.html、Skill-HippoRAG-Multi-Hop-Reasoning-Retrieval、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-RAGAS-RAG-Evaluation-Framework.html、Skill-RAGAS-RAG-Evaluation-Framework
- **延伸**：Skill-Adaptive-RAG-Query-Routing.html、Skill-Adaptive-RAG-Query-Routing、Skill-Corrective-RAG-CRAG.html、Skill-Corrective-RAG-CRAG、Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-HippoRAG-Multi-Hop-Reasoning-Retrieval.html、Skill-HippoRAG-Multi-Hop-Reasoning-Retrieval、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis
- **可组合**：Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-HippoRAG-Multi-Hop-Reasoning-Retrieval.html、Skill-HippoRAG-Multi-Hop-Reasoning-Retrieval、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-Self-RAG-Reflective-Retrieval

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：08-知识图谱　·　源卡：`Skill-Self-RAG-Reflective-Retrieval`