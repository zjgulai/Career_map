---
name: "p2s-llm-generative-product-search"
title: "LLM Generative Product Search — LLM 生成式商品搜索：超越关键词的意图理解"
description: "触发词：生成式搜索、自然语言查询、意图理解、场景化推荐、幻觉兜底。何时不用：需要确定性可控的精确检索时用「稀疏+稠密混合检索」或「密集段落检索」。安全边界：生成的商品 ID 必须校验真实存在，并保留传统搜索 fallback。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-066"
l3_business: "搜索意图分析"
l3_all: "搜索意图分析 / 转化优化"
l1_l2_l3: "业务运营/渠道经营/搜索意图分析"
p2s_card_id: "Skill-LLM-Generative-Product-Search"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用户把处境整段说出来也能搜到东西，比如「上班泵奶开会不能出声」这种关键词根本覆盖不了的查询。"
user_try: "试试：用自然语言理解「上班泵奶、开会不能有声音」这种查询，直接给出匹配商品。"
whenToUse: "当用户用整段自然语言描述场景与约束、传统关键词检索无法处理这类复杂查询时用本技能；若要的是确定性可控、零幻觉的精确检索，用「稀疏+稠密混合检索」或「密集段落检索」。"
workflow: "整理商品库与属性说明 → 用 LLM 解析查询中的场景与约束 → 结合向量检索生成候选并排序 → 校验商品 ID 并用传统搜索兜底"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLM Generative Product Search — LLM 生成式商品搜索：超越关键词的意图理解

## ① 解决的问题

用户说「上班偷偷泵奶开会不能发声」传统关键词搜索无法处理这种自然语言意图——LLM生成式搜索理解「安静+便携+工作场景」直接生成匹配商品，复杂查询转化率提升20-30%年化增益10-30万元

## ② 核心算法逻辑

检索式 vs 生成式搜索：

## ③ 业务应用场景

业务痛点：用户输入"我婆婆说用吸奶器不好，但我需要上班，有没有安静一点的"，传统关键词搜索完全无法处理这个包含语境的复杂查询。LLM 生成式搜索理解核心需求是"安静+上班族"，直接推荐对应商品。
业务价值： - 复杂查询转化率提升 20-30%（关键词搜索失败的那些查询） - 多语言搜索无需专门优化 - 年化 GMV 增益：¥10-30 万
三轨验证： - 成本：LLM API 调用成本约 ¥0.01-0.05/次查询（GPT-4o-mini）；需搭建缓存层减少重复调用；初期人力投入 2-3 周开发 + 1 周测试 - 合规：独立站场景无 Amazon 政策限制；需确保生成结果不包含虚假宣传（如"医院级"需有认证）；GDPR 下需明确告知用户搜索由 AI 驱动 - 风险：LLM 可能生成不存在或已下架的商品 ID（幻觉风险）；需设置 fallback 到传统搜索；用户对"AI 推荐"的信任度可能低于人工编辑推荐

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：复杂查询转化率+20-30%；多语言搜索免额外开发；年化 ¥10-30 万
实施难度：⭐⭐⭐☆☆（LLM API 调用 2-3 周；需要 API 成本预算）
优先级评分：⭐⭐⭐⭐⭐（生成式搜索是 2024-2026 搜索技术最重要范式转变；填补 知识图谱↔智能体↔广告 桥梁）
评估依据：LLMSearch (arXiv 2408.09826) 在电商搜索基准超越 DPR 20-30%；ChatGPT Shopping 模式已验证生成式搜索的商业可行性

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（136 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/knowledge_graph/llm_generative_product_search` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-LLM-Generative-Product-Search.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
LLM Generative Product Search
生成式商品搜索：超越关键词的意图理解
生产用: OpenAI/Claude API + FAISS 向量索引
"""
import re
import numpy as np
from dataclasses import dataclass


@dataclass
class Product:
    product_id: str
    title: str
    key_features: list[str]
    category: str


# 商品库
PRODUCT_CATALOG = [
    Product('B08QUIET01', 'Ultra-Quiet Breast Pump <40dB',
            ['under 40dB', 'USB rechargeable', 'hospital strength', 'portable'],
            'electric_breast_pump'),
    Product('B08WEAR01', 'Wearable Hands-Free Breast Pump',
            ['hands-free', 'wearable', 'quiet', 'office-friendly'],
            'wearable_breast_pump'),
    Product('B08HOSP01', 'Hospital-Grade Double Electric Pump',
            ['hospital grade', 'double electric', 'strong suction'],
            'electric_breast_pump'),
    Product('B08SEAT01', 'Infant Car Seat 0-12 months',
            ['safety certified', 'newborn compatible', 'easy install'],
            'car_seat'),
]

# 意图解析规则（生产用 LLM API）
INTENT_PATTERNS = {
    'quiet': [r'安静|噪音|吵|quiet|silent|noise|dB',
              r'宝宝睡觉|夜间|深夜|night|baby sleeping'],
    'office': [r'上班|办公室|工作|office|work|meeting',
               r'偷偷|不想让人知道|隐蔽'],
    'portable': [r'便携|携带|旅行|travel|portable|出门',
                 r'包包|随身'],
    'hospital_grade': [r'医院级|hospital|专业|clinical',
                       r'低供|催乳|吸力强|strong suction'],
    'hands_free': [r'解放双手|hands.free|wearable|穿戴'],
}


def extract_intents(query: str) -> dict:
    """
    从查询文本提取购买意图（生产用 LLM）
    这里用规则近似，实际应调用 GPT/Claude 解析意图
    """
    query_lower = query.lower()
    intents = {}
    for intent, patterns in INTENT_PATTERNS.items():
        if any(re.search(p, query_lower) for p in patterns):
            intents[intent] = True
    return intents
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2408.09826，但该号在 arXiv 上是《Unconventional and robust light-matter interactions based on the non-Hermitian skin effect》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：商品库（含标题/要点/类目）与可检索的属性说明、用户自然语言查询（可含语境与场景描述）、可选的向量索引或传统搜索接口作为兜底；粒度为 查询。

**输出**：对复杂自然语言查询的意图解析结果与推荐商品集合（卡页口径复杂查询转化率提升 20-30%）；供独立站搜索服务使用，并需保留传统搜索 fallback。

## 执行步骤

1. 整理商品库与属性说明供生成式检索使用
2. 用 LLM 解析查询中的场景与约束（如安静 + 上班族）
3. 结合向量检索或商品库生成候选商品并排序
4. 校验生成结果中的商品 ID 真实存在，否则降级到传统搜索
5. 监控复杂查询转化率与多语言查询表现

## 边界与不做

- 数据不满足：商品库没有结构化属性或要点文本时 LLM 无从匹配，先补语料。
- 何时不用：要的是稳定可控的确定性检索（精确型号、零幻觉），用「稀疏+稠密混合检索」或「密集段落检索」。
- 能力边界：LLM 存在生成不存在或已下架商品 ID 的幻觉风险，必须设 fallback；生成结果不得含无认证的宣称（如医院级）；卡页的转化率 +20-30%、年化 10-30 万元为案例口径。

## 技能关联

- **前置**：Skill-Conversational-Commerce-Agent.html、Skill-Conversational-Commerce-Agent、Skill-Dense-Passage-Retrieval.html、Skill-Dense-Passage-Retrieval、Skill-GEO-Generative-Engine-Optimization.html、Skill-GEO-Generative-Engine-Optimization、Skill-Graph-RAG-Knowledge-Retrieval.html、Skill-Graph-RAG-Knowledge-Retrieval、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-Multimodal-Product-Understanding.html、Skill-Multimodal-Product-Understanding、Skill-Personalized-Search-Ranking.html、Skill-Personalized-Search-Ranking
- **延伸**：Skill-Conversational-Commerce-Agent.html、Skill-Conversational-Commerce-Agent、Skill-GEO-Generative-Engine-Optimization.html、Skill-GEO-Generative-Engine-Optimization、Skill-Graph-RAG-Knowledge-Retrieval.html、Skill-Graph-RAG-Knowledge-Retrieval、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-Multimodal-Product-Understanding.html、Skill-Multimodal-Product-Understanding
- **可组合**：Skill-GEO-Generative-Engine-Optimization.html、Skill-GEO-Generative-Engine-Optimization、Skill-Graph-RAG-Knowledge-Retrieval.html、Skill-Graph-RAG-Knowledge-Retrieval、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-LLM-Generative-Product-Search

---

> 分类：业务运营/渠道经营/搜索意图分析　·　技术族：08-知识图谱　·　源卡：`Skill-LLM-Generative-Product-Search`