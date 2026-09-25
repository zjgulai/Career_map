---
name: "p2s-rankgpt-listwise-reranking"
title: "RankGPT — LLM 驱动 Listwise 重排序"
description: "触发词：列表重排、整表排序、候选排序、引用质量、跨域查询。何时不用：候选很少或只需逐条打分时用 Cross-Encoder 精排；只做召回不做排序时用普通检索。安全边界：代码模板内含明文 API Key，禁止复制进仓库或生产环境，须改为环境变量或凭证托管；调用外部模型前必须脱敏业务数值。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 知识溯源"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-RankGPT-Listwise-Reranking"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "让大模型一次性把整个候选列表按相关性重排，把最相关的条目从靠后的位置提到前面，提升引用质量。"
user_try: "试试：这 50 个候选里最相关的排在第 20 位，帮我用整表重排把 Top-5 提准。"
whenToUse: "属于「业务工具实现」：候选列表较长、逐对打分成本高，需要一次性整表排序时用；若候选很少，用 Cross-Encoder 逐条精排即可；若只要召回候选，用基础检索。"
workflow: "取第一阶段召回候选列表（卡页示例每查询约 50 个） → 滑动窗口分批把候选摘要与查询交给 LLM → 接收 LLM 输出的从最相关到最不相关的排列 → 按新排名截取 Top-N 供下游使用 → 保留原始排序兜底，并加缓存降低重复调用成本"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# RankGPT — LLM 驱动 Listwise 重排序

## ① 解决的问题

运营面临"复杂跨域查询第一阶段检索排序混乱最相关Skill排在第20位"——RankGPT Listwise重排序将Top-5精准率从61%提升至84%，Agent报告引用质量从6.2→8.1分

## ② 核心算法逻辑

RankGPT 用 LLM 一次性对整个候选列表排序（Listwise），输出排列结果，而不是逐对评分：

## ③ 业务应用场景

场景 A：Skill 知识库复杂查询重排序
- 业务痛点：「我的广告 ROAS 下降，同时库存积压，如何诊断？」→ 第一阶段检索召回 50 个 Skill，但排序混乱，最相关的「供应链断货→广告影响」路径被排在第 20 位 - 方案：RankGPT Sliding Window，每次 20 个 Skill 摘要，LLM 按查询业务语义重排序 - 量化产出：Top-5 精准率从 Dense 的 0.61 → RankGPT 的 0.84（+38%）
三轨验证： - 成本：每次重排序调用 DeepSeek API，50 个 Skill 约 9 次推理，单次成本约 $0.003，日均 1000 次查询成本约 $27/天；需额外缓存机制降低高频重复查询开销。 - 合规：Skill 摘要中不包含用户 PII（个人身份信息）或亚马逊销售数据，仅涉及业务逻辑文本，不违反 GDPR/CCPA；但需确保 API 调用不将客户业务数据（如 ROAS 具体数值）传入第三方模型，建议在摘要层脱敏。 - 风险：LLM 排序结果不可解释，若将错误 Skill 排在首位，可能导致运营决策偏差（如误判断货原因）；建议保留原始 Dense 排序作为 fallback，并

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

Top-5 精准率：Dense 0.61 → RankGPT 0.84（+38%）
vs monoBERT nDCG@10 提升 +7%（TREC-DL 2019）
Agent 报告引用质量评分：6.2/10 → 8.1/10

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（103 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：4」，但**未记录代码位置**（源站写「未检测到」）。

```python
import re
import json
from dataclasses import dataclass
from typing import Optional

try:
    from openai import OpenAI
    _CLIENT = OpenAI(
        [REDACTED] references/SECURITY.md>",
        base_url="https://api.deepseek.com"
    )
    LLM_OK = True
except Exception:
    LLM_OK = False

@dataclass
class RankedDocument:
    doc_id: str
    text: str
    original_rank: int
    new_rank: int
    score: float = 0.0

def _llm_rank(query: str, docs: list[dict]) -> list[int]:
    doc_list = "\n".join(
        f"[{i+1}] {d['text'][:200]}" for i, d in enumerate(docs)
    )
    prompt = f"""根据以下查询，将文档列表从最相关到最不相关排序。
查询：{query}
文档列表：
{doc_list}
只输出数字列表，最相关排第一，格式：[3, 1, 2, ...]
不要解释。"""
    if not LLM_OK:
        return list(range(1, len(docs) + 1))
    resp = _CLIENT.chat.completions.create(
        model="deepseek-chat",
        messages=[{"role": "user", "content": prompt}],
        temperature=0, max_tokens=200,
    )
    raw = resp.choices[0].message.content.strip()
    nums = re.findall(r'\d+', raw)
    ranks = [int(n) - 1 for n in nums if 0 < int(n) <= len(docs)]
    seen = set()
    deduped = []
    for r in ranks:
        if r not in seen:
            seen.add(r)
            deduped.append(r)
    missing = [i for i in range(len(docs)) if i not in seen]
    return deduped + missing

def rankgpt_sliding_window(
    query: str,
    documents: list[dict],
    window_size: int = 20,
    step: int = 10,
) -> list[RankedDocument]:
    n = len(documents)
    ranked_indices = list(range(n))
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：第一阶段召回的候选列表（卡页示例每查询约 50 个候选的摘要文本）与查询语句；调用前须确认候选摘要中不含个人隐私与业务敏感数值。

**输出**：重排后的候选排序与引用结果：卡页示例把 Top-5 精准率从 0.61 提升至 0.84、Agent 报告引用质量评分从 6.2/10 提升至 8.1/10；排序结果需保留原始 Dense 排序作兜底。

## 执行步骤

1. 取第一阶段召回的候选列表（卡页示例约 50 个）
2. 按滑动窗口分批把候选摘要与查询交给 LLM 排序
3. 接收 LLM 输出的完整排列结果
4. 按新排名截取 Top-N 供下游使用
5. 保留原始排序兜底并加缓存，控制调用成本

## 边界与不做

- 数据不满足时不用：候选数量很少时整表排序的必要性不大，逐条精排更省。
- 能力边界：本卡产出候选排序，排序结果本身不可解释，必须保留原始排序兜底，避免错误排序误导决策。
- 代码模板内含明文 API Key，禁止复制进仓库或生产环境，须改为环境变量或凭证托管；调用外部模型前必须脱敏业务数值（如具体 ROAS 数字）。

## 技能关联

- **前置**：Skill-Hybrid-Search-BM25-Vector.html、Skill-Hybrid-Search-BM25-Vector、Skill-RAG-Reranking-CrossEncoder.html、Skill-RAG-Reranking-CrossEncoder
- **延伸**：Skill-ColBERTv2-Multi-Vector-Late-Interaction.html、Skill-ColBERTv2-Multi-Vector-Late-Interaction、Skill-HippoRAG-Multi-Hop-Reasoning-Retrieval.html、Skill-HippoRAG-Multi-Hop-Reasoning-Retrieval、Skill-RAGAS-RAG-Evaluation-Framework.html、Skill-RAGAS-RAG-Evaluation-Framework
- **可组合**：Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-Graph-RAG-Knowledge-Retrieval.html、Skill-Graph-RAG-Knowledge-Retrieval、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-SmartVector-Self-Aware-Embeddings.html、Skill-SmartVector-Self-Aware-Embeddings、Skill-RankGPT-Listwise-Reranking

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：08-知识图谱　·　源卡：`Skill-RankGPT-Listwise-Reranking`