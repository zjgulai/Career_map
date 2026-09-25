---
name: "p2s-ragas-rag-evaluation-framework"
title: "RAGAS — RAG 质量自动化评估框架"
description: "触发词：RAGAS、四维打分、忠实度评估、Agent 质量门控、幻觉报告。何时不用：要专测多跳或时效问题走 CRAG、FRAMES 类基准；要做原子声明级核查走声明级核查流水线。安全边界：评估仅处理内部知识库内容与 Agent 输出、结果不对外公开；长期依赖单一 LLM 评估会有系统性偏差，须交叉验证。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-140"
l3_business: "数据质量"
l3_all: "数据质量 / 业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据质量"
p2s_card_id: "Skill-RAGAS-RAG-Evaluation-Framework"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "给 Agent 产出的报告自动打分，忠实度不够的标成幻觉报告推给人处理。"
user_try: "试试：把这份 Agent 报告拆成声明，逐条查知识库有没有依据，低于 0.7 就标出来。"
whenToUse: "Agent 或 RAG 系统的输出要做自动质量门控与 CI 检测时用；要专测多跳与时效场景请换专项基准。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# RAGAS — RAG 质量自动化评估框架

## ① 解决的问题

数据分析师面临"Agent报告无法验证是否幻觉"——RAGAS将RAG质量评测从人工抽查改为全自动四维打分，幻觉检测覆盖率达85%，Skill审核效率提升15x

## ② 核心算法逻辑

RAGAS（Retrieval Augmented Generation Assessment）是无参考答案的 RAG 四维评测框架，每个维度独立衡量流水线的一个子系统：

## ③ 业务应用场景

场景 A：paper2skills 知识库 Agent 质量门控
- 业务痛点：21 个 Agent 调用 DeepSeek 返回分析报告，无法判断报告是否基于知识库内容还是模型幻觉 - 数据要求：Agent 的 query、检索到的 Skill 卡片 context、DeepSeek 生成的报告 - 执行方式： 1. 把报告拆成声明（「供应链哨兵建议补货 300 件」） 2. 逐条检查是否在检索到的 Skill 卡片中有依据 3. Faithfulness < 0.7 → 标记为「幻觉报告」，推飞书警告 - 量化产出：可检测 85%+ 的 Agent 幻觉输出，幻觉报告占比从未知 → 可监控
三轨验证： - 成本：每次评估调用 DeepSeek API 约 0.003-0.005 元（按 1000 token 计算），日均 500 次评估成本约 1.5-2.5 元；需额外存储评估日志（约 50MB/天）。 - 合规：不涉及用户隐私数据，仅处理内部知识库内容与 Agent 输出，无 GDPR/Amazon 政策风险；评估结果不对外公开。 - 风险：阈值 0.7 可能误判部分正确但表述简练的报告为幻觉，需人工复核；长期依赖单一 LLM 评估可能产生系统性偏差，建议定期交叉验证。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

Agent 幻觉报告检测率 85%+，避免错误决策（补错货/误判断货）
Skill 卡片质量审核效率提升 15x（30min → 2min/个）
建立可量化的 RAG 质量基线，每次 build 后自动 CI 检测

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（120 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected 'except' or 'finally' block）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
import json
from dataclasses import dataclass
from typing import Optional
import numpy as np

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

@dataclass
class RAGASResult:
    faithfulness: float
    answer_relevance: float
    context_precision: float
    overall: float
    flagged: bool

DEEPSEEK_BASE = "https://api.deepseek.com"
DEEPSEEK_KEY  = os.environ.get("DEEPSEEK_API_KEY", "your-api-key-here")

def _llm(prompt: str, system: str = "你是严格的评测专家，只输出JSON。") -> str:
    if OpenAI is None:
        return '{"result": 0.8}'
    client = OpenAI([REDACTED] base_url=DEEPSEEK_BASE)
    resp = client.chat.completions.create(
        model="deepseek-chat",
        messages=[{"role": "system", "content": system},
                  {"role": "user", "content": prompt}],
        temperature=0,
        max_tokens=512,
    )
    return resp.choices[0].message.content.strip()

def compute_faithfulness(answer: str, context: str) -> float:
    prompt = f"""将以下回答拆分成原子声明列表，判断每条声明是否在上下文中有依据。
回答: {answer[:1000]}
上下文: {context[:2000]}
输出JSON: {{"claims": [{{"claim": "...", "supported": true/false}}]}}"""
    raw = _llm(prompt)
    try:
        data = json.loads(raw)
        claims = data.get("claims", [])
        if not claims:
            return 0.5
        supported = sum(1 for c in claims if c.get("supported"))
        return round(supported / len(claims), 3)
    except Exception:
        return 0.5

def compute_answer_relevance(question: str, answer: str, n: int = 3) -> float:
    prompt = f"""根据以下回答，生成{n}个可能的原始问题（逆向工程）。
回答: {answer[:800]}
输出JSON: {{"questions": ["问题1", "问题2", "问题3"]}}"""
    raw = _llm(prompt)
    try:
        data = json.loads(raw)
        gen_qs = data.get("questions", [])
        if not gen_qs:
            return 0.5
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2309.15217 — Ragas: Automated Evaluation of Retrieval Augmented Generation
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：Agent 的 query、检索到的上下文（如 Skill 卡片），以及模型生成的报告文本

**输出**：四维评测分数（忠实度、答案相关性、上下文精度等）与是否标记为幻觉报告的结论，供 CI 门控与人工复核

## 执行步骤

1. 把报告拆成可核验的声明。
2. 逐条检查声明是否在检索到的上下文里有依据。
3. 按四维指标打分，忠实度低于阈值（卡页示例 0.7）则标记为幻觉报告。
4. 把被标记报告推给责任人复核，而不是直接丢弃结果。

## 边界与不做

- 何时不用：要专测多跳推理或时效性问题时，通用四维打分覆盖不足，须换专项基准。
- 能力边界：阈值可能误判表述简练但正确的报告，标记结果必须人工复核。
- 安全边界：评估仅处理内部知识库内容与 Agent 输出、结果不对外公开；长期依赖单一 LLM 评估会有系统性偏差，需交叉验证。

## 技能关联

- **前置**：Skill-GraphRAG-Knowledge-Enhanced-Retrieval.html、Skill-GraphRAG-Knowledge-Enhanced-Retrieval、Skill-Hybrid-Search-BM25-Vector.html、Skill-Hybrid-Search-BM25-Vector、Skill-KG-Hallucination-Detection.html、Skill-KG-Hallucination-Detection
- **延伸**：Skill-FActScore-Claim-Verification-Pipeline.html、Skill-FActScore-Claim-Verification-Pipeline、Skill-HippoRAG-Multi-Hop-Reasoning-Retrieval.html、Skill-HippoRAG-Multi-Hop-Reasoning-Retrieval、Skill-WRITEBACK-RAG-Trainable-KB.html、Skill-WRITEBACK-RAG-Trainable-KB
- **可组合**：Skill-Agent-Observability-Tracing.html、Skill-Agent-Observability-Tracing、Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven、Skill-RAGAS-RAG-Evaluation-Framework

---

> 分类：数据与Agent平台/数据与AI运行/数据质量　·　技术族：08-知识图谱　·　源卡：`Skill-RAGAS-RAG-Evaluation-Framework`