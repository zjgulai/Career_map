---
name: "p2s-agentic-rag-active-retrieval"
title: "Agentic RAG主动检索 — 自主规划多轮检索的知识增强Agent"
description: "触发词：主动检索、按需检索、Self-RAG、多跳问答、知识溯源、合规审查自动化。何时不用：知识库小、单轮固定检索已够用时不要上；要按角色过滤文档可见性用「知识库RBAC」；要治理知识源权限与新鲜度用「知识库声明式编排」。安全边界：检索结果不得包含未授权的第三方品牌信息（如竞品配方对比），避免违反《反不正当竞争法》；不得存储用户个人数据（GDPR）；功效类声明须有官方来源支撑以应对 FTC 审查。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-107"
l3_business: "产品问答"
l3_all: "产品问答 / 知识溯源"
l1_l2_l3: "业务运营/服务与体验/产品问答"
p2s_card_id: "Skill-Agentic-RAG-Active-Retrieval"
p2s_src_domain: "09-DataAgent-LLM"
quality_tier: "preview"
user_summary: "简单问题一次都不检索，复杂问题自己决定多跳查两三轮——答得更准，检索成本还降四成。"
user_try: "试试：把客服问答改成按需检索，简单问题不检索，复杂多跳问题自己决定查几轮。"
whenToUse: "当知识库规模大、固定 RAG 每次全库召回噪声多且成本高时用本技能；若可见性控制是主要诉求，用「知识库RBAC」；若知识过期与跨域治理是主要诉求，用「知识库声明式编排」。"
workflow: "判断当前问题是否需要检索，简单问题直接作答 → 需要时规划检索轮次与待查子问题 → 执行检索并对结果做相关性与支持度自评 → 证据不足时补充检索（复杂多跳问题 2-3 次） → 生成带引用来源的答案并记录检索成本与溯源"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Agentic RAG主动检索 — 自主规划多轮检索的知识增强Agent

## ① 解决的问题

客服AI团队面临"固定RAG每次检索全库噪声多回答错误率15%且API成本高"——Self-RAG按需精准检索准确率提升至95%同时检索成本降低40%，年化35万元

## ② 核心算法逻辑

传统RAG的局限：

## ③ 业务应用场景

场景A：母婴产品智能客服知识增强 - 业务问题：客服AI回答"这款奶粉适合几个月的宝宝"时，因为知识库中有200+款奶粉，固定RAG每次都检索全部奶粉信息（噪声多），导致回答错误率15% - 数据要求：母婴产品知识库（认证/月龄/成分/规格）+ Agentic RAG框架 - 预期产出：Self-RAG按需检索（简单问题0次检索，复杂多跳问题2-3次），回答准确率从85%提升至95%；平均检索次数从1次降至0.6次（降低成本40%） - 业务价值：客服准确率提升10%减少客诉约20%（约30万元/年）；检索成本降低40%节省API费用约5万元/年
三轨验证： - 成本：显性成本包括向量数据库部署（约2万元/年）、LLM API调用（按需检索后约3万元/年）、人力维护知识库更新（约1人月/季度）。总成本约10万元/年，低于传统RAG的15万元/年。 - 合规：需确保检索结果不包含未授权的第三方品牌信息（如竞品奶粉配方对比），避免违反《反不正当竞争法》；在欧盟市场需确保知识库内容符合GDPR（不存储用户个人数据）；美国市场需注意FTC对产品功效声明的审查（如"有机"认证需有官方来源）。 - 风险：若检索策略过于激进（频繁检索），可能触发知识库API限流或增加延迟（>2秒），影响用户体验；若检索策略过于保守（不检索），则退回LLM幻觉风险；需
场景B：母婴产品合规审查自动化 - 业务问题：出海母婴产品（婴儿车/奶瓶/奶粉）需同时满足欧盟CE、美国CPSC、中国GB标准，人工审查一份产品说明书需2小时，且漏检率约8% - 数据要求：多国法规知识库（EN1888/ASTM F833/GB 6675）+ 产品说明书PDF解析结果 - 预期产出：Agentic RAG自动提取说明书中的关键参数（如"适用月龄""材质""承重"），与法规库按需比对，生成合规报告；审查时间从2小时降至10分钟，漏检率降至1% - 业务价值：合规审查效率提升12倍，减少人工成本约80万元/年；降低因不合规导致的罚款风险（欧盟罚款可达全球营收4%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：客服准确率85%→95%（减少客诉约30万元/年）；检索成本降低40%（约5万元/年）；按需检索减少噪声使回答质量更稳定
实施难度：⭐⭐⭐☆☆（FLARE实现约80行代码；Self-RAG完整实现需要微调LLM；轻量级版本接入标准RAG系统约1周）
优先级：⭐⭐⭐⭐⭐（填补09-DataAgent重要方法盲区；客服知识库更新频繁，按需精准检索是核心需求）
评估依据：EMNLP 2023 FLARE和ICLR 2024 Self-RAG均是检索增强生成的顶级论文；Langchain/LlamaIndex均已内置Agentic RAG框架；Anthropic的工业实践显示Self-RAG将幻觉率降低45%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（172 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-Agentic-RAG-Active-Retrieval
Agentic RAG主动检索 — 按需精准检索的知识增强Agent

依赖：pip install numpy pandas
注意：生产环境需接入向量数据库（Chroma/FAISS）和LLM API
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Optional
import re

np.random.seed(42)

# ── 1. 母婴产品知识库 ────────────────────────────────────────────────
KNOWLEDGE_BASE = [
    {'id': 'K001', 'title': '婴儿配方奶粉分段指南',
     'content': '0段(0-6月):以母乳为主; 1段(6-12月):蛋白质1.8-3.0g/100kcal; 2段(12-18月):添加辅食辅助'},
    {'id': 'K002', 'title': 'CE认证标准-婴儿车',
     'content': 'EN1888婴儿车欧盟安全标准；测试包括：稳定性/折叠机构/制动系统；有效期3年'},
    {'id': 'K003', 'title': '有机奶粉认证标准',
     'content': 'EU Organic认证：95%有机成分；禁用人工添加剂；每年农场审核'},
    {'id': 'K004', 'title': '婴儿推车月龄适用指南',
     'content': '0-6月：必须平躺位（躺角<165度）；6-12月：坐躺两用；12月+：坐姿可前向后向'},
    {'id': 'K005', 'title': 'CPSC儿童产品安全标准-美国',
     'content': 'ASTM F833婴儿推车标准；铅含量<300ppm；小零件测试；负重测试'},
    {'id': 'K006', 'title': '奶瓶材质安全指南',
     'content': 'BPA-Free必需；PPSU耐高温可消毒；硅胶奶嘴流量分级；洗碗机安全认证'},
]

# ── 2. 简化向量检索（模拟FAISS/Chroma）────────────────────────────
def simple_retrieval(query: str, top_k: int = 2) -> list[dict]:
    """关键词匹配模拟向量检索（生产环境用FAISS语义检索）"""
    query_words = set(query.lower().split())
    scores = []
    for doc in KNOWLEDGE_BASE:
        doc_words = set((doc['title'] + ' ' + doc['content']).lower().split())
        overlap   = len(query_words & doc_words)
        if overlap > 0: scores.append((overlap, doc))
    scores.sort(key=lambda x: -x[0])
    return [doc for _, doc in scores[:top_k]]

# ── 3. FLARE：前瞻性主动检索 ────────────────────────────────────────
@dataclass
class GenerationState:
    query:           str
    generated_text:  str = ''
    retrieval_count: int = 0
    used_docs:       list = None

    def __post_init__(self):
        if self.used_docs is None: self.used_docs = []

class FLAREAgent:
    """FLARE：当生成置信度低时主动触发检索"""
    UNCERTAINTY_KEYWORDS = ['多少', '什么时候', '几个月', '是否需要', '认证', '标准', '要求']
    MAX_RETRIEVALS = 3
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2310.11511 — Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：主题指向成立但强度不足（词重合 0.25／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：母婴产品知识库（认证、月龄、成分、规格等）与向量索引、用户问题（含需要多跳的复杂问题）；合规场景另需多国法规知识库与产品说明书解析结果。

**输出**：按需检索后的答案与引用来源（含检索次数与成本记录）；合规场景输出参数与法规比对结论的审查报告；供客服与合规审查使用。

## 执行步骤

1. 判断问题难度，决定是否检索以及需要几轮检索
2. 对需要检索的问题做子问题拆解与检索规划
3. 执行检索并自评证据是否足以支撑回答
4. 对证据不足的问题自动追加检索轮次
5. 生成带来源引用的答案并记录检索次数与成本

## 边界与不做

- 数据不满足：知识库未建索引或文档缺少结构化标签时，按需检索退化为盲目检索，先补索引与标签。
- 何时不用：文档级可见性控制用「知识库RBAC」，知识源权限与新鲜度治理用「知识库声明式编排」。
- 能力边界：只优化检索时机与轮次，不提升知识库本身覆盖率，也不替代合规人工终审。
- 安全边界：检索结果不得含未授权第三方品牌信息，不存储用户个人数据，功效声明须有官方来源支撑。

## 技能关联

- **前置**：Skill-GraphRAG-Knowledge-Enhanced-Retrieval.html、Skill-GraphRAG-Knowledge-Enhanced-Retrieval、Skill-LLM-Hallucination-Detection-BI.html、Skill-LLM-Hallucination-Detection-BI、Skill-LLM-as-Judge-Evaluator.html、Skill-LLM-as-Judge-Evaluator、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-Streaming-Analytics-Agent.html、Skill-Streaming-Analytics-Agent
- **延伸**：Skill-LLM-Hallucination-Detection-BI.html、Skill-LLM-Hallucination-Detection-BI、Skill-LLM-as-Judge-Evaluator.html、Skill-LLM-as-Judge-Evaluator、Skill-Streaming-Analytics-Agent.html、Skill-Streaming-Analytics-Agent
- **可组合**：Skill-LLM-as-Judge-Evaluator.html、Skill-LLM-as-Judge-Evaluator、Skill-Streaming-Analytics-Agent.html、Skill-Streaming-Analytics-Agent、Skill-Agentic-RAG-Active-Retrieval

---

> 分类：业务运营/服务与体验/产品问答　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-Agentic-RAG-Active-Retrieval`