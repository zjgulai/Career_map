---
name: "p2s-factscore-claim-verification-pipeline"
title: "FActScore — 原子声明级事实核查流水线"
description: "触发词：原子声明核查、FActScore、入库门控、事实核验、参数幻觉。何时不用：要评整个问答链路的质量走 RAG 评测；要核对报表数字与数据库是否一致走 BI 幻觉检测。安全边界：检索与引用须遵守论文版权规范，避免全文抓取造成侵权。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-146"
l3_business: "知识溯源"
l3_all: "知识溯源 / 数据质量"
l1_l2_l3: "数据与Agent平台/数据与AI运行/知识溯源"
p2s_card_id: "Skill-FActScore-Claim-Verification-Pipeline"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把待入库内容拆成一条条原子声明逐条求证，分数不够的不许自动进库。"
user_try: "试试：给这批论文卡片做入库前事实核查，把参数写错的挑出来。"
whenToUse: "知识资产（卡片、报告）要入库、必须确认参数与结论有出处时用；要评整个问答链路的质量请转 RAG 评测。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# FActScore — 原子声明级事实核查流水线

## ① 解决的问题

知识库运营面临"萃取的Skill卡片参数可能存在幻觉污染知识图谱"——FActScore原子声明级核查将入库错误率从未知→可量化，人工审核成本降低95%

## ② 核心算法逻辑

FActScore（Factual precision Score） 把文本分解为原子声明（atomic claims），每条独立核查，精度细化到句子粒度：

## ③ 业务应用场景

场景 A：Skill 卡片入库前的事实门控
- 业务痛点：从论文萃取的 Skill 卡片中，算法原理和数据参数可能存在幻觉，污染知识图谱 - 数据要求：Skill 卡片文本 + 原始论文摘要/正文（作为事实来源） - 流程： 1. 把 Skill 卡片「算法原理」段拆成原子声明（平均 8-15 条） 2. 每条声明在 ArXiv 摘要库 + Skill 知识库中检索 3. FActScore < 0.75 → 标记「需人工复核」，不自动入库 - 量化产出：每个 Skill 卡片 FActScore 平均 0.82，发现 ~12% 的卡片存在参数幻觉（数字引用错误）
三轨验证： - 成本：每次核查约 2-3 次 LLM 调用（原子分解 + 检索 + 验证），单卡片成本 < 0.1 元；需维护 ArXiv 摘要库索引，存储成本约 50 元/月 - 合规：不涉及用户隐私数据，仅处理公开论文摘要与内部知识库，无 GDPR/广告法风险；但需注意论文版权引用规范，避免全文抓取侵权 - 风险：若阈值设置过低（如 0.6），可能导致大量误判，人工复核积压；若阈值过高（如 0.9），可能漏放真实但表述新颖的卡片，降低知识库更新效率

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

Skill 卡片入库错误率从未知 → 可量化（预期 ~12% 存在参数幻觉）
每个卡片自动核查成本 < 0.1 元（2-3 次 LLM 调用），vs 人工复核 30 分钟
Agent 报告错误数字标注，避免运营基于幻觉数据做补货决策

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（145 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：3」，但**未记录代码位置**（源站写「未检测到」）。

```python
import json
import re
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
class ClaimVerification:
    claim: str
    retrieved_evidence: str
    verdict: str          # "supported" | "refuted" | "not_enough_info"
    confidence: float

@dataclass
class FActScoreResult:
    text: str
    claims: list[ClaimVerification]
    factscore: float
    flagged: bool
    flagged_claims: list[str]

def _llm_call(prompt: str, max_tokens: int = 512) -> str:
    if not LLM_OK:
        return '{"claims": ["声明A", "声明B"]}'
    resp = _CLIENT.chat.completions.create(
        model="deepseek-chat",
        messages=[{"role": "system", "content": "只输出JSON，不含markdown。"},
                  {"role": "user", "content": prompt}],
        temperature=0, max_tokens=max_tokens,
    )
    return resp.choices[0].message.content.strip()

def atomize(text: str) -> list[str]:
    prompt = f"""将以下文本拆分为原子事实声明（每条只含一个可独立核查的事实）。
文本：{text[:1500]}
输出JSON：{{"claims": ["声明1", "声明2", ...]}}"""
    raw = _llm_call(prompt)
    try:
        return json.loads(raw).get("claims", [text])
    except Exception:
        sentences = re.split(r'[。！？\n]', text)
        return [s.strip() for s in sentences if len(s.strip()) > 5]

def retrieve_evidence(claim: str, knowledge_base: list[str]) -> str:
    if not knowledge_base:
        return ""
    claim_lower = claim.lower()
    scored = []
    for doc in knowledge_base:
        words = set(re.findall(r'\w+', claim_lower))
        doc_lower = doc.lower()
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：待核查文本（如卡片的算法原理段）与可作为事实来源的原始材料（论文摘要或正文、知识库）

**输出**：逐条声明的核查结论与整体事实性分数、需人工复核的清单，作为入库门控的放行判据

## 执行步骤

1. 把待核查文本拆成原子声明（卡页场景平均 8-15 条）。
2. 为每条声明在论文摘要库与知识库中检索证据。
3. 逐条判定支持与否，汇总成整体事实性分数。
4. 低于阈值（卡页示例 0.75）的标记为需人工复核，不自动入库。

## 边界与不做

- 何时不用：要评的是检索与生成链路的整体质量，请转 RAG 评测；要核对报表数字请转 BI 幻觉检测。
- 能力边界：阈值过高会漏放真实但表述新颖的内容，过低会让复核积压，须按业务调校。
- 安全边界：检索与引用须遵守论文版权规范，避免全文抓取造成侵权。

## 技能关联

- **前置**：Skill-Hybrid-Search-BM25-Vector.html、Skill-Hybrid-Search-BM25-Vector、Skill-KG-Hallucination-Detection.html、Skill-KG-Hallucination-Detection、Skill-Semantic-Chunking-Strategy.html、Skill-Semantic-Chunking-Strategy
- **延伸**：Skill-KG-Incremental-Update.html、Skill-KG-Incremental-Update、Skill-RAGAS-RAG-Evaluation-Framework.html、Skill-RAGAS-RAG-Evaluation-Framework、Skill-WRITEBACK-RAG-Trainable-KB.html、Skill-WRITEBACK-RAG-Trainable-KB
- **可组合**：Skill-Agent-Knowledge-Distillation-SOP.html、Skill-Agent-Knowledge-Distillation-SOP、Skill-Demand-Driven-KB-Construction.html、Skill-Demand-Driven-KB-Construction、Skill-FActScore-Claim-Verification-Pipeline

---

> 分类：数据与Agent平台/数据与AI运行/知识溯源　·　技术族：08-知识图谱　·　源卡：`Skill-FActScore-Claim-Verification-Pipeline`