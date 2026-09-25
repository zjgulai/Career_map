---
name: "p2s-mteb-embedding-benchmark-selection"
title: "Skill-MTEB-Embedding-Benchmark-Selection"
description: "触发词：嵌入模型选型、MTEB、检索评测、多语言检索、成本对比。何时不用：评估长上下文 LLM 的理解边界用「HELMET 长上下文 RAG 评估」；评估分类或预测模型指标用「Model Evaluation Metrics」。安全边界：评测语料须用可授权数据，业务敏感语料不得外传给第三方 API；成本对比须同时给出 API 与本地部署口径。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-036"
l3_business: "算法评估设计"
l3_all: "算法评估设计"
l1_l2_l3: "业务运营/产品与创新/算法评估设计"
p2s_card_id: "Skill-MTEB-Embedding-Benchmark-Selection"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用 MTEB、MMTEB 的公开基准加上自己的检索集对比候选嵌入模型，几天内选出中英双语准确率与成本都合适的那个。"
user_try: "试试：给我们的 Amazon 母婴商品语义搜索选一个嵌入模型，中英双语、百万级商品库，给出 NDCG 与成本对比。"
whenToUse: "要在多个嵌入模型之间做检索质量与成本权衡时用本技能；若选型对象是长上下文 LLM，用「HELMET 长上下文 RAG 评估」；若评估的是分类或预测模型的指标与阈值，用「Model Evaluation Metrics」。"
workflow: "确定候选嵌入模型与业务检索场景（如中英双语商品语义搜索） → 用 MTEB / MMTEB 任务集做横向评测 → 在自有检索集上计算 NDCG@k、Recall@k、MRR → 对比 API 与本地部署的成本 → 输出选型结论与迁移建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-MTEB-Embedding-Benchmark-Selection

## ① 解决的问题

AI工程师面临"嵌入模型选型拍脑袋导致查询准确率低15%且API成本超标10倍"——MTEB/MMTEB(ICLR2025)基准评测3天科学选型，避免模型迁移成本50万元，中英双语检索准确率最优

## ② 核心算法逻辑

MTEB（Massive Text Embedding Benchmark）是嵌入模型选型的工业标准基准，涵盖8大任务类型和1000+数据集，使AI团队能基于数据驱动的方式选择最适合业务场景的嵌入模型。

## ③ 业务应用场景

场景1：电商搜索嵌入模型选型 需求：Amazon母婴商品语义搜索，中英双语，百万级商品库
决策：bge-m3（中英双语最优，成本可控）
**场景2：多语言合规文档检索** 覆盖中/英/马来/印尼语的东南亚市场，用MMTEB多语言任务评测。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

嵌入模型选型失误成本：错选API模型 vs 本地模型，百万次查询成本差10-100倍
基于MTEB科学选型：避免盲目选型，决策时间从2周压缩至3天
准确率提升：最优模型vs随机选型，检索准确率平均差15-25%
年化ROI：避免模型迁移成本约50万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（205 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：3」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
MTEB-guided Embedding Model Selection
基于MTEB的嵌入模型选型与评估框架
"""
from typing import List, Dict, Tuple
import numpy as np
import time

class EmbeddingModelEvaluator:
    """
    基于MTEB思路的嵌入模型评估器
    用于母婴跨境场景的模型选型
    """
    
    def __init__(self):
        self.results = {}
        self.model_registry = {
            "bge-m3": {"dim": 1024, "lang": ["zh","en","multilingual"], "size_mb": 2200},
            "multilingual-e5-large": {"dim": 1024, "lang": ["multilingual"], "size_mb": 1400},
            "bge-small-en-v1.5": {"dim": 384, "lang": ["en"], "size_mb": 130},
            "text-embedding-3-small": {"dim": 1536, "lang": ["multilingual"], "size_mb": 0},  # API
        }
    
    def evaluate_retrieval(
        self,
        model_name: str,
        embed_fn,
        queries: List[str],
        corpus: List[Dict],  # [{"id": ..., "text": ...}]
        relevant_docs: Dict[str, List[str]],  # query_id -> [relevant_doc_ids]
        k_values: List[int] = [1, 5, 10]
    ) -> Dict:
        """
        评估检索任务（NDCG@k, Recall@k, MRR@k）
        """
        # 编码语料库
        start = time.time()
        corpus_embeddings = np.array([embed_fn(doc["text"]) for doc in corpus])
        corpus_embeddings = corpus_embeddings / np.linalg.norm(corpus_embeddings, axis=1, keepdims=True)
        corpus_time = time.time() - start
        
        # 评估每个查询
        ndcg_scores = {k: [] for k in k_values}
        recall_scores = {k: [] for k in k_values}
        
        for q_idx, query in enumerate(queries):
            q_embed = np.array(embed_fn(query))
            q_embed = q_embed / np.linalg.norm(q_embed)
            
            # 计算相似度
            scores = corpus_embeddings @ q_embed
            ranked_indices = np.argsort(-scores)
            
            # 获取相关文档
            q_id = f"q{q_idx}"
            rel_docs = set(relevant_docs.get(q_id, []))
            
            for k in k_values:
                top_k = [corpus[i]["id"] for i in ranked_indices[:k]]
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2210.07316。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：候选嵌入模型清单（含维度、支持语种、体积等属性）、业务查询与语料库（如百万级商品库的 id 与文本）、相关性标注（query_id → 相关文档 id），以及各模型的调用方式（API 或本地部署）。

**输出**：各候选模型的检索指标（NDCG@k、Recall@k、MRR）与耗时、成本对比和选型结论（如中英双语场景选 bge-m3），作为避免后续模型迁移成本的评估依据。

## 执行步骤

1. 确定候选嵌入模型与目标检索场景
2. 用 MTEB / MMTEB 任务集做横向评测
3. 在自有检索集上计算 NDCG、Recall 与 MRR
4. 对比 API 与本地部署成本
5. 输出选型结论与迁移建议

## 边界与不做

- 缺少业务相关性标注、或语料不能用于评测时不适用，只能参考公开榜单做粗筛
- 评测覆盖检索质量与成本，不含线上 A/B 效果与工程稳定性验证
- 评测语料须使用可授权数据，业务敏感语料不得外传给第三方 API

## 技能关联

- **可组合**：Skill-MTEB-Embedding-Benchmark-Selection

---

> 分类：业务运营/产品与创新/算法评估设计　·　技术族：08-知识图谱　·　源卡：`Skill-MTEB-Embedding-Benchmark-Selection`