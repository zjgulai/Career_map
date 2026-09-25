---
name: "p2s-multilingual-listing-localization"
title: "Multilingual Listing Localization — LLM 驱动的多语言 Listing 本地化与文化适配"
description: "触发词：Listing 本地化、多语言 Listing、标题五点改写、文化适配、目标市场文案、母语化翻译。何时不用：只做搜索词迁移不重写文案用「多市场搜索词本地化」；只给现有 Listing 打分用「Listing 质量评分」；只写原创英文文案用「Listing-AI 文案生成」。安全边界：本地化文案不得虚构 GS-geprüft、PSE 認証 等认证或夸大功效，须经本地合规与母语者复核后再上架。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-083"
l3_business: "本地化"
l3_all: "本地化 / Listing优化 / 市场语境审查"
l1_l2_l3: "业务运营/渠道经营/本地化"
p2s_card_id: "Skill-Multilingual-Listing-Localization"
p2s_src_domain: "13-广告分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "在没有母语者的情况下，把英文 Listing 的标题、五点与描述改写成目标市场用户会搜、会信的本地版本。"
user_try: "试试：把这款吸奶器的英文 Listing 改写成德语版本，标题按德国用户的实际搜索习惯写，并给出本地关键词和本地化质量分。"
whenToUse: "要把英文 Listing 的标题、五点、描述改成目标市场母语可用版本时用；只做搜索词迁移用「多市场搜索词本地化」，只给 Listing 打分排序用「Listing 质量评分」，只写原创英文文案用「Listing-AI 文案生成」。"
workflow: "接收英文 Listing 的结构化字段与目标市场代码 → 套用该市场文化适配规则：认证写法、单位制式、强调点、本地术语映射 → 生成目标语言的标题、五点与描述，替换直译词 → 抽取本地化关键词并给出 0 到 1 的本地化质量评分 → 按市场批量输出可上架的本地化 Listing"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Multilingual Listing Localization — LLM 驱动的多语言 Listing 本地化与文化适配

## ① 解决的问题

M5 吸奶器打算进 Amazon.de，Google 翻译的 Listing 德国搜索流量几乎为零——神经机器翻译 + 母语者语料微调将德语 Listing 自然搜索排名从首页底部提升至 Top 5，转化率提升 30-60%

## ② 核心算法逻辑

简单的机器翻译（Google Translate）在 Listing 本地化上失败的原因不是语言，而是文化和搜索习惯的差异：

## ③ 业务应用场景

业务问题：M5 吸奶器在 US 热销，想进军 Amazon.de，但团队没有德语母语者，用 Google 翻译的 Listing 在德国几乎没有流量。
本地化问题诊断： - 标题直译："Tragbare Doppelbrustpumpe"（Portable Double Breast Pump） - 实际德国用户搜索："elektrische Milchpumpe tragbar"（elektrisch = 电动） - 关键词缺失：德国妈妈搜索 "BPA-frei" 不是 "BPA-free"，"GS-geprüft" 而非仅 "CE"
效果：DE 站点击率从 1.2% → 3.8%，自然流量 +180%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
德国市场本地化后点击率从 1.2% → 3.8%：自然流量 +180%，年化 GMV ¥30-80 万/市场
批量 6 市场本地化成本从 $15,000-60,000 → $500-1,500（节省 97%）
时间从 4-8 周 → 3 天（加速新市场进入速度）
年化综合 ROI：¥100-300 万（视扩展市场数量）
实施难度：⭐⭐☆☆☆（LLM API + 规则库，2-3 天接入）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（265 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/advertising/multilingual_listing_localization` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-Multilingual-Listing-Localization.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Multilingual Listing Localization — LLM 驱动的多语言本地化
基于 arXiv: 2604.27410 (LLM Attribute Graphs) + arXiv: 2606.04909 (BEATS)

依赖: re, json, dataclasses (标准库)
生产环境: 替换 MockLLM 为 GPT-4o / Claude
"""

from dataclasses import dataclass, field
import re
import json


@dataclass
class ProductListing:
    """原始英文 Listing"""
    sku_id: str
    title: str
    bullet_points: list
    description: str
    category: str


@dataclass
class LocalizedListing:
    """本地化后的 Listing"""
    sku_id: str
    market: str                 # DE / FR / JP / IT / ES / UK
    language: str               # de / fr / ja / it / es / en-gb
    title: str
    bullet_points: list
    description: str
    local_keywords: list        # 本地化关键词列表
    quality_score: float        # 本地化质量评分（0-1）


# 各市场的文化适配规则
MARKET_RULES = {
    "DE": {
        "language": "de",
        "safety_cert": "GS-geprüft, CE-Kennzeichnung",
        "unit_style": "metrisch (cm, ml, dB, mmHg)",
        "emphasis": "Präzision, Qualität, Sicherheitsstandards",
        "local_terms": {
            "breast pump": "Milchpumpe",
            "BPA-free": "BPA-frei",
            "portable": "tragbar",
            "electric": "elektrisch",
            "silent": "geräuscharm",
            "suction": "Saugkraft",
        },
    },
    "JP": {
        "language": "ja",
        "safety_cert": "PSE認証, FDA認証取得済み",
        "unit_style": "cm/g, 日本語表記",
        "emphasis": "安全性, 認証, 清潔感",
        "local_terms": {
            "breast pump": "搾乳機",
            "BPA-free": "BPAフリー",
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2604.27410 — From Unstructured to Structured: LLM-Guided Attribute Graphs for Entity Search and Ranking

核验口径：主题指向成立但强度不足（词重合 0.2／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：单 SKU 乘单市场粒度：原始英文 Listing 结构化字段（sku_id、title、bullet_points、description、category），目标市场代码（DE / FR / JP / IT / ES / UK 及对应语言 de / fr / ja / it / es / en-gb），该市场本地规则（本地安全认证写法如 GS-geprüft、CE-Kennzeichnung、PSE認証，单位制式，强调点，本地术语映射表如 breast pump → Milchpumpe），可选母语者语料用于微调。下限：Listing 字段与目标市场必须齐全，缺市场代码无法套规则。

**输出**：本地化 Listing 结构：sku_id、market、language、title、bullet_points、description、local_keywords（本地化关键词列表）、quality_score（本地化质量评分，0 到 1）；供目标市场 Listing 上架与广告填词使用，可按市场批量产出多份。

## 执行步骤

1. 提供英文 Listing 的 sku_id、标题、五点、描述与类目
2. 选定目标市场并加载该市场规则（认证写法、公制单位、本地术语映射）
3. 生成目标语言的标题、五点与描述，把直译词换成当地搜索习惯用词
4. 抽取本地化关键词并给出 0 到 1 的本地化质量评分
5. 按市场输出可批量上架的本地化 Listing

## 边界与不做

- 数据不满足：缺原始英文 Listing 的结构化字段或未指定目标市场时无法套规则生成，先补齐 SKU 标题、五点、描述与市场代码。
- 何时不用：只换搜索词不重写文案用「多市场搜索词本地化」，只做 Listing 打分用「Listing 质量评分」，只写原创文案用「Listing-AI 文案生成」。
- 能力边界：只产出本地化文案、关键词建议与质量分，不代上架、不改线上 Listing，也不替代目标市场母语者终审。
- 安全边界：本地认证写法与安全宣称必须有真实依据，不得编造 GS、PSE 等认证；上架前须经本地合规复核。

## 技能关联

- **前置**：Skill-Amazon-A10-Algorithm-Ranking.html、Skill-Amazon-A10-Algorithm-Ranking、Skill-AutoPKG-Multimodal-Product-Attribute-KG.html、Skill-AutoPKG-Multimodal-Product-Attribute-KG、Skill-Listing-AI-Copywriting.html、Skill-Listing-AI-Copywriting、Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-NLP-Text-Classification.html、Skill-NLP-Text-Classification、Skill-SEO-Organic-Ranking-Optimization.html、Skill-SEO-Organic-Ranking-Optimization
- **延伸**：Skill-Amazon-A10-Algorithm-Ranking.html、Skill-Amazon-A10-Algorithm-Ranking、Skill-Listing-AI-Copywriting.html、Skill-Listing-AI-Copywriting、Skill-NLP-Text-Classification.html、Skill-NLP-Text-Classification、Skill-SEO-Organic-Ranking-Optimization.html、Skill-SEO-Organic-Ranking-Optimization
- **可组合**：Skill-Listing-AI-Copywriting.html、Skill-Listing-AI-Copywriting、Skill-NLP-Text-Classification.html、Skill-NLP-Text-Classification、Skill-Multilingual-Listing-Localization

---

> 分类：业务运营/渠道经营/本地化　·　技术族：13-广告分析　·　源卡：`Skill-Multilingual-Listing-Localization`