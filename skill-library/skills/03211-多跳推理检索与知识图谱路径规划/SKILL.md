---
name: "p2s-hipporag-multi-hop-reasoning-retrieval"
title: "HippoRAG — 多跳推理检索与知识图谱路径规划"
description: "触发词：多跳推理、跨域诊断、查询分解、路径规划、检索串联。何时不用：答案是单一事实时用普通检索更快；只是同义改写原查询时用查询扩展或多查询融合。安全边界：无。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 知识溯源"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-HippoRAG-Multi-Hop-Reasoning-Retrieval"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把广告变差、库存又积压这类跨域问题拆成多跳路径，沿着知识图谱把散落的线索串成可解释的诊断。"
user_try: "试试：帮我诊断最近 ROAS 下降和库存积压是否有共同原因，给出多跳推理路径。"
whenToUse: "属于「业务工具实现」：问题跨多个知识域、需要多跳串联才能回答时用；若答案是单一事实，用普通检索更省；若只是同义改写原查询，用查询扩展或多查询融合。"
workflow: "查询分解：把复合问题拆成若干可单独验证的单跳子问题 → 在图谱上做实体识别与路径检索，串联跨域节点 → 聚合多跳路径上的证据与相关技能卡片 → 按路径置信度排序，形成可解释的诊断结论 → 把新发现的关联沉淀回知识库，扩充可检索路径"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# HippoRAG — 多跳推理检索与知识图谱路径规划

## ① 解决的问题

运营面临"跨域业务问题（供应链→广告→定价）无法一次诊断"——HippoRAG多跳推理将跨域诊断覆盖率从45%提升至78%，年化减少跨部门沟通成本30万元

## ② 核心算法逻辑

论文：HippoRAG: Longterm Memory for Large Language Models | 年份：2024

## ③ 业务应用场景

场景 A：跨域业务诊断（supply chain → ads → pricing 链路）
- 业务痛点：「最近广告 ROAS 下降，但是库存也出现积压，这两件事有关联吗？」— 这是典型的多跳问题，需要跨供应链、广告、定价三个知识域推理 - 方案： 1. 查询分解：Q1「ROAS下降原因」Q2「库存积压影响广告」 2. 在 paper2skills KG 上检索：ROAS → 广告归因 → 竞品降价 → 弹性效应 → 库存囤积 3. 聚合多跳路径上的 Skill 卡片（供应链哨兵 + 广告归因侦探 + 定价顾问） - 量化产出：跨域问题的诊断覆盖率从 45%（单跳）→ 78%（多跳），缺失关联原因从 55% → 22%
三轨验证： - 成本轨： - 数据采集：构建初始 KG 需要 2-3 周人力（1 名 KG 工程师 + 1 名业务分析师），成本约 ¥15,000-20,000 - 计算资源：向量嵌入 + HNSW 索引维护，单月约 ¥3,000-5,000（GPU 计算 + 存储） - 持续维护：每月新增 Skill 卡片的 KG 更新，约 ¥5,000/月 - 总成本：初期 ¥20,000，月运维 ¥8,000-10,000 - 合规轨：✅ 完全合规 - 数据来源为内部 Skill 库，无第三方隐私数据 - 跨域诊断不涉及用户个人信息，符合 GDPR - 业务建议不构成广告投放决策，无广告法风险 - 跨境

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

跨域业务诊断覆盖率：单跳 45% → 多跳 78%（+73%）
HotpotQA / 2WikiMultiHopQA F1：0.42 → 0.56（+33%）
Playbook 自动规划 Skill 完整度：60% → 85%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（154 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'for' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：4」，但**未记录代码位置**（源站写「未检测到」）。

```python
import re
from collections import defaultdict, deque
from dataclasses import dataclass, field
from typing import Optional

@dataclass
class KGNode:
    id: str
    text: str
    domain: str = ""
    score: float = 0.0

@dataclass
class KGEdge:
    source: str
    target: str
    relation: str
    weight: float = 1.0

class HippoRAGIndex:
    def __init__(self):
        self.nodes: dict[str, KGNode] = {}
        self.edges: list[KGEdge] = []
        self.adj: dict[str, list[tuple[str, str, float]]] = defaultdict(list)
        self.text_index: dict[str, list[str]] = defaultdict(list)

    def add_node(self, node_id: str, text: str, domain: str = "") -> None:
        self.nodes[node_id] = KGNode(id=node_id, text=text, domain=domain)
        for word in re.findall(r'\w+', text.lower()):
            if len(word) > 2:
                self.text_index[word].append(node_id)

    def add_edge(self, src: str, tgt: str, relation: str, weight: float = 1.0) -> None:
        self.edges.append(KGEdge(src, tgt, relation, weight))
        self.adj[src].append((tgt, relation, weight))
        self.adj[tgt].append((src, relation, weight))

    def text_search(self, query: str, k: int = 5) -> list[str]:
        words = [w for w in re.findall(r'\w+', query.lower()) if len(w) > 2]
        hit_count: dict[str, int] = defaultdict(int)
        for word in words:
            for node_id in self.text_index.get(word, []):
                hit_count[node_id] += 1
        return sorted(hit_count, key=hit_count.get, reverse=True)[:k]

    def bfs_paths(self, start_nodes: list[str],
                  max_hops: int = 3,
                  max_nodes: int = 20) -> dict[str, dict]:
        visited: dict[str, dict] = {}
        queue: deque = deque()
        for n in start_nodes:
            if n in self.nodes:
                visited[n] = {"hops": 0, "path": [n]}
                queue.append(n)
        while queue and len(visited) < max_nodes:
            current = queue.popleft()
            current_hops = visited[current]["hops"]
            if current_hops >= max_hops:
                continue
            for neighbor, relation, weight in self.adj.get(current, []):
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2405.14831 — HippoRAG: Neurobiologically Inspired Long-Term Memory for Large Language Models

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：已建好的知识图谱或技能卡片库（卡页示例使用内部 Skill 库，不涉及第三方隐私数据）与待诊断的复合业务问题；卡页第 4 段未给字段级规格，落地前需确认图谱规模与更新频率。

**输出**：多跳推理路径与诊断结论（卡页示例：跨域问题的诊断覆盖率从 45% 提升至 78%，缺失关联原因从 55% 降至 22%），路径可解释，供运营与跨部门诊断使用。

## 执行步骤

1. 把复合业务问题拆成可分别验证的单跳子问题
2. 在图谱上做实体识别与路径检索，串联跨域节点
3. 聚合路径上的证据与相关技能卡片
4. 按置信度排序路径，形成可解释的诊断结论
5. 把新发现的关联沉淀回知识库，持续扩充可检索路径

## 边界与不做

- 数据不满足时不用：知识图谱未建立或关系缺失时多跳路径断链，效果不如单跳检索。
- 能力边界：本卡产出推理路径与诊断结论，不替代业务决策，也不含图谱数据的持续采集与人工校验。

## 技能关联

- **前置**：Skill-Graph-RAG-Knowledge-Retrieval.html、Skill-Graph-RAG-Knowledge-Retrieval、Skill-HNSW-ANN-Vector-Index-Engineering.html、Skill-HNSW-ANN-Vector-Index-Engineering、Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven
- **延伸**：Skill-CausalRAG-Causal-Graph-Retrieval.html、Skill-CausalRAG-Causal-Graph-Retrieval、Skill-RAGAS-RAG-Evaluation-Framework.html、Skill-RAGAS-RAG-Evaluation-Framework、Skill-RankGPT-Listwise-Reranking.html、Skill-RankGPT-Listwise-Reranking
- **可组合**：Skill-AgentRouter-KG-Guided.html、Skill-AgentRouter-KG-Guided、Skill-DAG-Ta[REDACTED].html、Skill-DAG-Ta[REDACTED]、Skill-HippoRAG-Multi-Hop-Reasoning-Retrieval

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：08-知识图谱　·　源卡：`Skill-HippoRAG-Multi-Hop-Reasoning-Retrieval`