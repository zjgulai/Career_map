---
name: "p2s-business-problem-to-skill-retrieval"
title: "业务问题→Skill 检索 — Sentence-BERT + RRF 多路召回引擎"
description: "触发词：技能检索、找方法、问题匹配技能、多路召回、Top-K 推荐。何时不用：要按前置/延伸关系规划学习路径时用「知识图谱技能管理」，要在多工具 Agent 内部选调用哪个工具时用「LLM 工具路由」。安全边界：只索引内部 Skill 元数据（problem_solved 文本），不引入外部数据，也不越权读取业务表。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-005"
l3_business: "能力匹配"
l3_all: "能力匹配 / 技能版本"
l1_l2_l3: "经营管理/经营与组织/能力匹配"
p2s_card_id: "Skill-Business-Problem-to-Skill-Retrieval"
p2s_src_domain: "16-智能体工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "运营和数据新人说一句业务问题，几秒内拿到最该用的 3 个技能和上手步骤，不用再逐页翻技能库。"
user_try: "试试：吸奶器备货积压、卖不动了，该用哪个分析方法？把 Top-3 技能和应用步骤给我。"
whenToUse: "业务方用自然语言描述问题、要定位该用哪个技能时用；要按技能间前置/延伸关系排学习路径时用知识图谱技能管理；要在 Agent 内部完成工具级路由时用 LLM 工具路由。"
workflow: "整理技能库的 problem_solved 文本并一次性离线建索引 → 运营用自然语言描述业务问题作为查询 → 语义向量与 TF-IDF 两路召回候选技能 → 用 RRF 融合多路排名并取 Top-K → 返回 Top-3 技能、相似度分数与应用步骤摘要"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 业务问题→Skill 检索 — Sentence-BERT + RRF 多路召回引擎

## ① 解决的问题

业务用户面临"726个Skill不知道哪个解决我的问题只能逐页翻"——Sentence-BERT向量检索将业务问题到匹配Skill的发现时间从30分钟压缩至3秒

## ② 核心算法逻辑

核心思想：把"自然语言描述的业务问题"和"Skill 卡片 problem_solved 字段"都映射到同一语义向量空间，用余弦相似度召回最相关 Skill 组合，再用 RRF（Reciprocal Rank Fusion）对多路召回结果重排序，最终输出 TopK 推荐。

## ③ 业务应用场景

- 业务问题：运营输入"吸奶器备货积压了很多，卖不动了"，不知道应该用哪个数据分析方法 - 数据要求：726 个 Skill 的 problem_solved 字段文本（约 50KB），一次性离线建索引；查询为运营的自然语言描述 - 预期产出：返回 Top-3 Skill：`Skill-Dynamic-ABC-Stratification`（相似度 0.87）、`Skill-Markdown-Optimization`（0.82）、`Skill-Demand-Forecasting-Supply-Chain`（0.79），附带每个 Skill 的应用步骤摘要 - 业务价值：运营找对方法的时间从
- 业务问题：数据新人不知道"我的 ACOS 超标了，该怎么分析"应该用什么模型 - 数据要求：同上，Skill 向量库已建好，查询为新人描述 - 预期产出：返回广告相关 Skill 链路：`Skill-Multi-Touch-Attribution`→`Skill-ROAS-Optimization`→`Skill-Bid-Adjustment`，附带学习路径建议 - 业务价值：新员工独立上手时间从 2 周 → 3 天，招聘成本降低 40%，年化节省培训费用约 8 万元 - 三轨验证： - 成本：无需新增数据采集；学习路径生成需额外调用 GPT API（每次约 0.02 元），年化成本约 2

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：全团队 10 人，每人每天节省 1 次找方法耗时（45min→30s），年化节省 600 人·天 ≈ 30 万元；新员工上手加速 5 天 × 年招 4 人 × 5000 元/天 = 10 万元。总年化价值约 40 万元
实施难度：⭐⭐☆☆☆（仅需 sentence-transformers + numpy，无需 GPU；离线建索引一次性）
优先级：⭐⭐⭐⭐⭐（可立即上线，依赖 problem_solved 字段已存在的 726 个 Skill）
评估依据：核心依赖已有数据（Skill 库），无冷启动问题；TF-IDF 降级方案保证零依赖运行

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（145 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
业务问题 → Skill 检索引擎
Sentence-BERT + RRF 多路召回
"""
import numpy as np
from typing import List, Dict, Tuple


# ─── 轻量 SBERT 替代（无需安装 sentence-transformers）─────────────────────────
def mock_sbert_encode(texts: List[str]) -> np.ndarray:
    """用 TF-IDF 向量模拟 SBERT，生产环境替换为真实 SBERT"""
    from sklearn.feature_extraction.text import TfidfVectorizer
    vectorizer = TfidfVectorizer(max_features=128, analyzer='char_wb', ngram_range=(2, 4))
    return vectorizer.fit_transform(texts).toarray().astype(np.float32)


def cosine_similarity_matrix(query_vec: np.ndarray, doc_vecs: np.ndarray) -> np.ndarray:
    """计算查询向量与文档向量矩阵的余弦相似度"""
    query_norm = query_vec / (np.linalg.norm(query_vec) + 1e-8)
    doc_norms = doc_vecs / (np.linalg.norm(doc_vecs, axis=1, keepdims=True) + 1e-8)
    return doc_norms @ query_norm


def rrf_fusion(
    rank_lists: List[List[int]],
    k: int = 60
) -> Dict[int, float]:
    """
    Reciprocal Rank Fusion
    rank_lists: 多路召回的文档 id 排序列表
    返回：{doc_id: rrf_score}
    """
    scores: Dict[int, float] = {}
    for ranked in rank_lists:
        for rank, doc_id in enumerate(ranked):
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank + 1)
    return scores


def build_skill_index(skills: List[Dict]) -> Tuple[np.ndarray, List[Dict]]:
    """
    构建 Skill 向量索引
    skills: [{"name": "Skill-XXX", "problem_solved": "...", "module": "..."}]
    """
    texts = [f"{s['name']} {s['problem_solved']}" for s in skills]
    vectors = mock_sbert_encode(texts)
    return vectors, skills


def retrieve_skills(
    query: str,
    skill_vectors: np.ndarray,
    skills: List[Dict],
    top_k: int = 3
) -> List[Dict]:
    """
    核心检索函数：自然语言查询 → Top-K Skill 推荐
    返回带相似度分数的 Skill 列表
    """
    # 路线1：语义向量召回
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2004.04906，但该号在 arXiv 上是《Dense Passage Retrieval for Open-Domain Question Answering》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：726 个 Skill 的 problem_solved 字段文本（约 50KB），用于一次性离线建索引；查询为运营或数据新人的自然语言描述（如「吸奶器备货积压了很多，卖不动了」）；粒度：Skill 卡片级。

**输出**：Top-3 匹配技能及相似度分数（如 Skill-Dynamic-ABC-Stratification 0.87、Skill-Markdown-Optimization 0.82、Skill-Demand-Forecasting-Supply-Chain 0.79）与每个技能的应用步骤摘要；广告类问题另返回技能链路（如 Multi-Touch-Attribution→ROAS-Optimization→Bid-Adjustment）与学习路径建议，供运营与数据新人使用。

## 执行步骤

1. 整理技能库的 problem_solved 文本并构建向量索引
2. 接收业务方的自然语言问题作为查询
3. 跑语义向量与 TF-IDF 两路召回
4. 用 RRF 融合多路排名并截取 Top-K
5. 返回 Top-3 技能、相似度分数与应用步骤摘要

## 边界与不做

- 数据不满足时不用：技能库缺 problem_solved 描述、或问题里没有任何可检索的业务线索时，召回质量无法保证。
- 能力边界：只做问题到技能的检索与推荐，不执行被召回的技能、不评估技能实际效果，也不生成新技能。

## 技能关联

- **前置**：Skill-Embedding-Fundamentals.html、Skill-Embedding-Fundamentals、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-ROI-Prioritized-Skill-Ranking.html、Skill-ROI-Prioritized-Skill-Ranking、Skill-Skill-Dependency-Path-Planner.html、Skill-Skill-Dependency-Path-Planner
- **延伸**：Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-ROI-Prioritized-Skill-Ranking.html、Skill-ROI-Prioritized-Skill-Ranking、Skill-Skill-Dependency-Path-Planner.html、Skill-Skill-Dependency-Path-Planner
- **可组合**：Skill-ROI-Prioritized-Skill-Ranking.html、Skill-ROI-Prioritized-Skill-Ranking、Skill-Skill-Dependency-Path-Planner.html、Skill-Skill-Dependency-Path-Planner、Skill-Business-Problem-to-Skill-Retrieval

---

> 分类：经营管理/经营与组织/能力匹配　·　技术族：16-智能体工程　·　源卡：`Skill-Business-Problem-to-Skill-Retrieval`