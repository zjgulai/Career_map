---
name: "p2s-llm-search-query-expansion"
title: "LLM搜索词语义扩展 — 用大模型覆盖长尾搜索意图提升Listing覆盖面"
description: "触发词：搜索词扩展、长尾覆盖、种子词、多语言词包、Listing 覆盖面。何时不用：要从竞品排名反查缺口词时用「竞品关键词缺口分析」；要把 SKU 标签批量映射成词包时用「标签→关键词自动映射矩阵」。安全边界：扩展词必须与产品实际功能一致，不得为凑覆盖堆砌属性词。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-066"
l3_business: "搜索意图分析"
l3_all: "搜索意图分析 / Listing优化"
l1_l2_l3: "业务运营/渠道经营/搜索意图分析"
p2s_card_id: "Skill-LLM-Search-Query-Expansion"
p2s_src_domain: "25-搜索流量工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "给几个种子词就能扩出一两百个长尾表达，把用户真正会说的写法都覆盖到 Listing 里。"
user_try: "试试：以「防胀气奶瓶」为种子词，扩展 100-200 个长尾搜索词并标出哪些适合写进 Listing。"
whenToUse: "当 Listing 覆盖词偏少、需要按语义与场景扩展长尾表达（含多语言市场）时用本技能；要从竞品排名反查缺口，用「竞品关键词缺口分析」；要把标签体系批量映射成词包，用「标签→关键词自动映射矩阵」。"
workflow: "选定种子词并整理现有 Listing 文本 → 调 LLM 按语义与场景扩展长尾表达 → 过滤与产品功能不符或违规的词 → 审核后写入标题、要点与后端词"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLM搜索词语义扩展 — 用大模型覆盖长尾搜索意图提升Listing覆盖面

## ① 解决的问题

Listing运营面临"长尾搜索词覆盖不足导致大量有购买意图的流量看不到Listing"——LLM语义扩展将Listing关键词覆盖面提升3.2倍，自然流量增量年化$5.6万

## ② 核心算法逻辑

传统搜索词扩展依赖关键词工具（Helium10/Jungle Scout）提供的搜索量榜单，局限在「已知热词」范围内，对长尾意图（占总搜索量 60% 以上）覆盖不足。核心问题是：买家搜索「哪款奶瓶换成婴儿不哭」时，Listing 里没有这个表达，但语义完全匹配。

## ③ 业务应用场景

场景A：新品 Listing 关键词盲区覆盖 - 业务问题：「防胀气奶瓶」Listing 仅覆盖 40 个词，大量用户用「colic solution bottle」「baby gas bottle」搜索时搜不到 - 数据要求：种子关键词 5-10 个，现有 Listing 文本（title + bullets + description） - 预期产出：扩展词包 100-200 个，Listing 覆盖词从 40 个提升到 130 个 - 业务价值：自然搜索覆盖词 +3 倍，假设每个新覆盖词月均带来 3 次额外搜索曝光，130 个词月均新增 390 次曝光，转化率 4%，客单价 30 元 →
三轨验证： - 成本：每次 LLM API 调用约 0.01-0.05 元（按 4o-mini 计），每 SKU 扩展 100-200 词需 3-5 次调用，总成本 < 0.25 元/SKU；人力成本约 0.5 小时/SKU（审核+注入），按 50 元/小时计约 25 元/SKU。显性成本极低。 - 合规：不涉及用户隐私数据，仅处理公开 Listing 文本和通用搜索词；不触碰 Amazon 关键词注入政策（后台搜索词字段允许合理扩展）；不涉及广告法虚假宣传（扩展词需与产品实际功能一致）。 - 风险：低风险。主要风险是扩展词与产品实际功能不匹配导致差评（如将「防胀气」扩展为「防过敏」但产品无此
场景B：多语言市场扩展（美/墨西哥/巴西） - 业务问题：进入西班牙语/葡语市场，不知道当地用什么词搜索婴儿用品 - 数据要求：英文种子词列表，目标市场语言（es/pt） - 预期产出：三语词包，覆盖本地化搜索意图（墨西哥妈妈用「biberón anti-cólico」搜索） - 业务价值：进入新语言市场，初始自然流量覆盖面提升 2-3 倍，节省本地化词库人工成本约 2 万元/市场

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
覆盖词提升：每 SKU 覆盖词从 40 → 130 个，+225%，假设 50 个主力 SKU 每个月均自然流量价值增量 3,000 元 → 年化约 180 万元
人工节省：人工词库扩展每 SKU 需 2-3 天，本算法 30 分钟，50 SKU 节省约 10 人天/季度，年化约 6 万元
多语言市场：进入西/葡语市场初始覆盖成本降低 80%，节省本地化费用约 4 万元/市场
综合年化 ROI ≈ 190-200 万元（主要来自覆盖词扩张带动的自然流量增量）
实施难度：⭐⭐☆☆☆（低，LLM API 调用即可，无需训练）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（209 行）。**下面 58 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，58 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/llm_search_query_expansion` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/25-搜索流量工程/Skill-LLM-Search-Query-Expansion.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
LLM 搜索词语义扩展（本地模拟版，不需要真实 API Key）
LLM-Enhanced Query Expansion for E-commerce Search Coverage
"""

import re
from collections import defaultdict

# ─── 模拟 LLM 响应（生产中替换为实际 LLM 调用，如 OpenAI/DeepSeek）───
# 格式：种子词 → LLM 扩展词列表
LLM_EXPANSION_DB = {
    "anti-colic bottle": [
        "gas reducer bottle", "colic relief bottle", "no-gas baby bottle",
        "gassy baby bottle", "anti-gas feeding bottle", "colicky baby bottle",
        "baby bottle for gas", "stomach pain relief bottle", "less gas bottle",
        "fussy baby bottle", "reduce crying baby bottle", "gripe water bottle",
        "infant bottle gas free", "baby bottle no cry", "comfort feeding bottle"
    ],
    "overnight diapers": [
        "12 hour diapers", "nighttime diapers", "sleep dry diapers",
        "all night diaper", "heavy wetters diapers", "leak proof night diapers",
        "no leak overnight diaper", "bedtime diapers", "extended wear diapers",
        "stay dry night diapers", "super absorbent overnight", "diapers for sleeping"
    ],
    "breast pump portable": [
        "wearable breast pump", "hands free breast pump", "cordless breast pump",
        "rechargeable breast pump", "on the go breast pump", "travel breast pump",
        "wireless breast pump", "silent breast pump work", "discreet breast pump",
        "pump at work", "pump while driving", "mobile breast pump"
    ],
}

# 意图分类规则
INTENT_PATTERNS = {
    "functional": ["best", "top", "how to", "what is", "which"],
    "problem_solving": ["help", "stop", "prevent", "fix", "reduce", "no more"],
    "comparison": ["vs", "versus", "compare", "better than", "alternative"],
    "attribute": ["size", "type", "color", "material", "age", "weight"],
}

# 现有 Listing 文本（示例）
LISTING_TEXTS = {
    "anti-colic-bottle": """
    Dr. Brown's Natural Flow Anti-Colic Baby Bottle
    - Anti-Colic Internal Vent System reduces colic, spit-up, burping, and gas
    - Slow flow nipple ideal for newborns and breastfeeding transition
    - Wide neck bottle easy to clean, BPA free
    - Recommended by pediatricians for babies with colic
    - Works with all Dr. Brown's bottle accessories
    """,
    "overnight-diaper": """
    Pampers Swaddlers Overnight Diapers
    - 2x more absorb than regular Pampers diapers
    - Comfort Fit for overnight protection
    - Hypoallergenic gentle on skin
    - Wetness indicator for easy check
    """,
}
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2403.18252，但该号在 arXiv 上是《Beyond Embeddings: The Promise of Visual Table in Visual Reasoning》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：种子关键词（卡页 5-10 个）、现有 Listing 文本（标题 + Bullet Points + 描述）、目标市场语言（可选，用于多语言扩展）；粒度为 SKU。

**输出**：每 SKU 100-200 个扩展词包（含多语言版本，卡页口径覆盖词从 40 提升到 130）；供 Listing 运营审核后写入标题、要点与后端 Search Terms。

## 执行步骤

1. 选定 5-10 个种子关键词并整理现有 Listing 文本
2. 调用 LLM 按语义与场景扩展长尾表达（含多语言市场版本）
3. 过滤与产品实际功能不符或违规的词
4. 审核后把扩展词写入标题、Bullet Points 与后端 Search Terms
5. 跟踪覆盖词数、曝光增量与后续差评风险

## 边界与不做

- 数据不满足：种子词过少或产品功能信息不足时扩展词容易失真，先补齐产品事实。
- 何时不用：要从竞品排名反查缺口词，用「竞品关键词缺口分析」；要把 SKU 标签体系批量映射成词包，用「标签→关键词自动映射矩阵」。
- 能力边界：只产出候选词包，注入与合规审核由人工完成；扩展词必须与产品实际功能一致；卡页的综合年化 ROI ≈190-200 万元为案例口径。

## 技能关联

- **前置**：Skill-Keyword-Demand-Gap-Analysis.html、Skill-Keyword-Demand-Gap-Analysis、Skill-LLM-Annotation-Weak-Supervision.html、Skill-LLM-Annotation-Weak-Supervision、Skill-LLM-Business-Intelligence-Reasoning.html、Skill-LLM-Business-Intelligence-Reasoning、Skill-Listing-Semantic-Relevance-Scoring.html、Skill-Listing-Semantic-Relevance-Scoring、Skill-Search-Tag-Keyword-Auto-Mapping.html、Skill-Search-Tag-Keyword-Auto-Mapping
- **延伸**：Skill-Keyword-Demand-Gap-Analysis.html、Skill-Keyword-Demand-Gap-Analysis、Skill-LLM-Annotation-Weak-Supervision.html、Skill-LLM-Annotation-Weak-Supervision、Skill-Search-Tag-Keyword-Auto-Mapping.html、Skill-Search-Tag-Keyword-Auto-Mapping
- **可组合**：Skill-Search-Tag-Keyword-Auto-Mapping.html、Skill-Search-Tag-Keyword-Auto-Mapping、Skill-LLM-Search-Query-Expansion

---

> 分类：业务运营/渠道经营/搜索意图分析　·　技术族：25-搜索流量工程　·　源卡：`Skill-LLM-Search-Query-Expansion`