---
name: "p2s-causalrag-knowledge-retrieval"
title: "CausalRAG - 因果图驱动的检索增强生成"
description: "触发词：因果检索、根因问答、因果图构建、售后排障、因果链溯源、答非所问纠正。何时不用：只做一般语义相似度问答用「主动检索」；要按角色控制文档可见性用「知识库RBAC」。安全边界：因果链结论必须标注置信度并保留原文出处，低置信链条不得作为唯一处置依据；含用户信息的工单语料须脱敏后再用于建图。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-107"
l3_business: "产品问答"
l3_all: "产品问答 / 售后处理"
l1_l2_l3: "业务运营/服务与体验/产品问答"
p2s_card_id: "Skill-CausalRAG-Knowledge-Retrieval"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "用户说机器转两圈停下闪红灯，别把所有提到红灯的内容全倒出来——顺着因果链定位到传感器积灰。"
user_try: "试试：用维修手册和历史工单建因果图，用户报故障时给出根因溯源链和处置建议。"
whenToUse: "当用户提问是问为什么坏、根因是什么这类归因类问题、语义检索总是答非所问时用本技能；若只是一般事实型问答，用「主动检索」即可；若要控制知识可见范围，用「知识库RBAC」。"
workflow: "收集含因果表达的维修手册与工程师标注工单 → 抽取因果表达构建因果图（节点与有向边） → 对用户故障描述做因果路径追踪 → 输出带置信度的根因溯源链 → 拼接为 LLM 上下文生成排障建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# CausalRAG - 因果图驱动的检索增强生成

## ① 解决的问题

用户反馈"机器转了两圈突然停下并闪红灯"，传统 FAQ 机器人把所有带"红灯"的内容（充电时亮红灯/故障码等）全部返回，答非所问，最终用户申请退货

## ② 核心算法逻辑

传统 RAG 和 GraphRAG 的召回逻辑都基于"语义相似度"，本质是在问「谁和我长得像？」而非「谁是我的根因？」。当用户问"为什么机器突然停了"时，向量检索会把所有提到"停机"的文本块全部塞给大模型，因果关系被肢解在各个文本块中，幻觉无法避免。

## ③ 业务应用场景

业务问题： 用户反馈"机器转了两圈突然停下并闪红灯"，传统 FAQ 机器人把所有带"红灯"的内容（充电时亮红灯/故障码等）全部返回，答非所问，最终用户申请退货。每月此类高级故障人工介入客服成本超 20 万元。
数据要求： - 产品维修手册（PDF/TXT）：含因果表达的故障描述文档 - 历史工单数据库：工程师标注的「故障现象 → 根因 → 解决方案」记录（格式：jsonl/csv） - 结构：`{"doc_id": "ticket_001", "content": "底盘传感器积灰导致误判悬崖，引起停机闪红灯"}`
预期产出： - 因果图谱：32+ 节点，16+ 有向因果边（覆盖常见故障模式） - 自动排障指引：根因溯源链 `[传感器积灰] → [误判悬崖] → [停止运行] → [闪红灯]`，给出「请清洁底盘传感器」的精准建议 - 排障准确率提升：相比语义检索，在归因类问题上 Answer Faithfulness 提升 30-40%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ACL 2025 论文实验：CausalRAG 在归因类问答上 Answer Faithfulness 提升 35%、Context Precision 提升 28%（相比 GraphRAG baseline）
行业数据：售后诊断准确率提升 30% 对应退货率下降约 15-20%（3C 品类）
每月 200 件高级故障退货 × 200 美元/件 × 12 个月 = 年损 48 万美元，压降 15% = 约 120 万元
算法实现：中等（BFS + 正则抽取，无需 GPU，纯 Python 可运行）
数据准备：重点难点，需要语料中存在因果表达句式；历史工单质量高低直接决定图谱质量
集成成本：低，`CausalRAG.generate_context()` 直接输出 LLM Prompt 可用的字符串

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（40 行）。**下面 40 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **40 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，40 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/knowledge_graph/causalrag_knowledge_retrieval` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-CausalRAG-Knowledge-Retrieval.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
CausalRAG 核心使用示例
场景：扫地机器人售后排障
"""

from model import CausalRAG, build_demo_robot_vacuum_corpus

# Step 1: 准备语料（维修手册 + 历史工单）
corpus = [
    {
        "doc_id": "manual_001",
        "content": "底盘传感器积灰导致误判悬崖，从而停止运行，因此出现闪红灯报警。",
    },
    {
        "doc_id": "ticket_001",
        "content": "底盘积灰造成传感器遮挡，引起悬崖误判，从而停止运行。",
    },
    # ... 更多文档
]

# Step 2: 构建因果图（离线一次性构建）
rag = CausalRAG()
graph = rag.build_causal_graph(corpus)
stats = rag.get_graph_stats()
print(f"因果图: {stats['nodes']} 节点, {stats['edges']} 边")

# Step 3: 用户查询 → 因果路径追踪
user_query = "机器转了两圈突然停下并闪红灯"
chains = rag.retrieve(user_query, top_k=3)

for chain in chains:
    print(f"\n因果链（置信度 {chain.chain_confidence:.1%}）:")
    for step in chain.chain:
        print(f"  [{step.step_type}] {step.description}")

# Step 4: 生成 LLM 上下文
context = rag.generate_context(user_query)
# 将 context 拼入 LLM Prompt，实现因果增强问答
# answer = llm.chat(f"基于以下因果分析回答问题：\n{context}\n\n问题：{user_query}")
print(context)
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2503.19878 — CausalRAG: Integrating Causal Graphs into Retrieval-Augmented Generation
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：含因果表达的产品维修手册（PDF/TXT）、历史工单数据库（工程师标注的故障现象到根因再到解决方案，jsonl/csv 格式），以及用户故障描述文本；粒度为单条工单或文档。

**输出**：因果图谱（节点与有向因果边）、根因溯源链（含每步类型、描述与链条置信度），以及可直接拼入 LLM Prompt 的上下文文本；供售后客服与排障人员使用。

## 执行步骤

1. 收集维修手册与历史工单，筛出含因果表达的语料
2. 抽取因果句式构建因果图并统计节点与边
3. 把用户故障描述映射到因果图做路径追踪
4. 输出带置信度的根因溯源链与处置建议
5. 把因果上下文拼接进 LLM Prompt 生成排障答复

## 边界与不做

- 数据不满足：语料里没有因果表达句式时图谱建不起来，需先积累工程师标注工单。
- 何时不用：一般事实型问答用「主动检索」，文档可见性控制用「知识库RBAC」。
- 能力边界：只做因果抽取与路径追溯，不替代工程师的最终诊断，也不保证覆盖全部故障模式。
- 安全边界：因果链须标注置信度并保留出处，低置信链条不得作为唯一处置依据；工单语料须脱敏。

## 技能关联

- **前置**：Skill-GraphRAG-Knowledge-Enhanced-Retrieval.html、Skill-GraphRAG-Knowledge-Enhanced-Retrieval、Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven、Skill-KGQA-Question-Answering.html、Skill-KGQA-Question-Answering
- **延伸**：Skill-Agentic-SCKG-Risk.html、Skill-Agentic-SCKG-Risk、Skill-HGT-Heterogeneous-Graph-Transformer.html、Skill-HGT-Heterogeneous-Graph-Transformer
- **可组合**：Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-GraphRAG-Knowledge-Enhanced-Retrieval.html、Skill-GraphRAG-Knowledge-Enhanced-Retrieval、Skill-KG-Augmented-Recommendation-CoLaKG.html、Skill-KG-Augmented-Recommendation-CoLaKG、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-CausalRAG-Knowledge-Retrieval

---

> 分类：业务运营/服务与体验/产品问答　·　技术族：08-知识图谱　·　源卡：`Skill-CausalRAG-Knowledge-Retrieval`