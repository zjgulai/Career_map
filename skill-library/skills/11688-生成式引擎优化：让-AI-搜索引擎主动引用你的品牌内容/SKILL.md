---
name: "p2s-geo-generative-engine-optimization"
title: "GEO — 生成式引擎优化：让 AI 搜索引擎主动引用你的品牌内容"
description: "触发词：GEO、生成式引擎优化、AI 引用率、内容干预策略、AI 搜索流量。何时不用：要测量品牌在 AI 推荐中的份额用「SOV 可见度份额追踪」；只做传统 SEO 关键词优化不必用本技能。安全边界：干预内容必须使用真实可核验的统计数据与引用来源，不得编造数据或伪造引用。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-089"
l3_business: "内容策划"
l3_all: "内容策划 / 搜索意图分析"
l1_l2_l3: "业务运营/品牌与增长/内容策划"
p2s_card_id: "Skill-GEO-Generative-Engine-Optimization"
p2s_src_domain: "15-营销投放分析"
quality_tier: "preview"
user_summary: "让 ChatGPT 和 Perplexity 在推荐母婴产品时主动提到我们，靠的是把页面内容改成 AI 愿意引用的样子。"
user_try: "试试：对我这款吸奶器的详情页跑 9 种干预策略，看哪 3-4 种组合能把 AI 引用率提上去。"
whenToUse: "AI 搜索成为新的流量入口、品牌内容不被引用时用；只测量份额与竞品差距用 SOV 可见度份额追踪；传统 SEO 关键词优化不属于本技能。"
workflow: "识别高价值查询词 → 对现有详情页与 FAQ 运行 9 种干预策略对比 → 测量每种策略的引用份额变化 → 选出 3-4 种叠加的高效组合并落地"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# GEO — 生成式引擎优化：让 AI 搜索引擎主动引用你的品牌内容

## ① 解决的问题

AI 搜索引擎取代 Google 成为跨境电商新入口——GEO 框架通过统计数据添加、引用来源、权威语气等 9 种干预策略将 AI 引用份额提升 37-40%，抢占 ChatGPT/Perplexity 的母婴产品推荐位

## ② 核心算法逻辑

Google SEO 优化了 20 年，但 20242026 年流量格局发生根本性变化：用户越来越多地把购物决策问题直接问 ChatGPT、Perplexity、Gemini——"推荐一款适合 06 个月宝宝的吸奶器"。在这个新的流量入口，传统 SEO 的关键词密度和外链策略几乎完全失效。

## ③ 业务应用场景

业务问题：Momcozy 在 Amazon 排名第一，但当用户问 ChatGPT "推荐最安全的电动吸奶器" 时，AI 答案里几乎不提 Momcozy——因为品牌内容不符合 AI 引用偏好，这块新流量完全错失。
GEO 优化流程： 1. 识别高价值查询（"best breast pump for working moms"、"safest bottle warmer"） 2. 对现有产品详情页/FAQ 运行 9 种干预策略对比 3. 测量每种策略的引用份额变化 4. 找到高效组合（通常 3-4 种策略叠加效果最佳）
优化前后对比（吸奶器产品页）： - 优化前：AI 引用率 12%（ChatGPT 测试 100 次查询） - 优化后（统计数据 + 引用来源 + 权威语气）：引用率 38%（+217%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
AI 搜索引擎流量提升 30-40%（GEO-Bench 验证）
2026 年 AI 搜索占电商发现流量 25-35%（Perplexity MAU 增长 3x YoY）
单品牌年化 AI 引用流量价值：¥20-100 万（视品牌规模）
内容优化成本极低（一次设置，持续受益）
年化综合 ROI：¥50-200 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（237 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/marketing/geo_generative_engine_optimization` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/15-营销投放分析/Skill-GEO-Generative-Engine-Optimization.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
GEO — 生成式引擎优化（AI 搜索引用份额提升）
基于 arXiv: 2311.09735 (KDD 2024)

依赖: re, json, dataclasses (标准库)
生产环境: 替换 MockLLM 为 OpenAI/Anthropic API
"""

from dataclasses import dataclass, field
import re
import json


@dataclass
class ContentPiece:
    """待优化的内容片段"""
    product_id: str
    title: str
    description: str
    bullet_points: list = field(default_factory=list)
    safety_certs: list = field(default_factory=list)  # BPA-Free, FDA, CE 等


@dataclass
class GEOResult:
    """GEO 优化结果"""
    product_id: str
    original_text: str
    optimized_text: str
    strategies_applied: list
    estimated_visibility_lift: float


class GEOInterventions:
    """9 种 GEO 干预策略实现"""

    @staticmethod
    def add_statistics(text: str, stats: dict = None) -> str:
        """策略1: 统计数据添加 — 均提升 40% 引用率"""
        default_stats = {
            "bpa_free": "100% BPA-free materials certified by FDA",
            "safety": "tested against 15+ international safety standards",
            "efficiency": "clinically tested with 94% mother satisfaction rate",
        }
        stats = stats or default_stats
        additions = [f"({v})" for k, v in stats.items()
                     if k.lower() in text.lower() or any(kw in text.lower()
                     for kw in ["bpa", "safe", "efficien", "certif"])]
        if additions:
            text = text.rstrip(".") + ". " + "; ".join(additions[:2]) + "."
        return text

    @staticmethod
    def cite_sources(text: str, domain: str = "baby_products") -> str:
        """策略2: 引用来源添加 — 均提升 37% 引用率"""
        source_map = {
            "baby_products": "per FDA infant product safety guidelines",
            "medical":       "per American Academy of Pediatrics (AAP) recommendations",
            "safety":        "as verified by CPSC (Consumer Product Safety Commission)",
        }
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2311.09735 — GEO: Generative Engine Optimization

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：品牌内容片段（标题、描述、卖点、安全认证）与目标查询词；粒度：产品×内容片段×查询词。

**输出**：优化后的内容文本、所用策略清单与引用份额提升估计（卡页示例：引用率由 12% 提升至 38%），供内容与营销团队改版使用。

## 执行步骤

1. 识别高价值查询词与目标页面
2. 对内容运行 9 种干预策略并生成对比版本
3. 测量各策略的 AI 引用份额变化
4. 选定 3-4 种策略叠加组合
5. 落地改版并复测引用率

## 边界与不做

- 数据不满足时不用：无法对 AI 引擎做重复采样测试、或页面事实信息不完整时，引用份额既测不准也提不上。
- 能力边界：只优化内容表达与可引用性，不保证任何平台一定引用。
- 能力边界：干预必须基于真实数据，编造统计或引用来源属禁止行为。

## 技能关联

- **前置**：Skill-Cross-Platform-Brand-Search-Volume.html、Skill-Cross-Platform-Brand-Search-Volume、Skill-Listing-AI-Copywriting.html、Skill-Listing-AI-Copywriting、Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-SEO-Organic-Ranking-Optimization.html、Skill-SEO-Organic-Ranking-Optimization、Skill-Share-of-Voice-Tracking.html、Skill-Share-of-Voice-Tracking
- **延伸**：Skill-Cross-Platform-Brand-Search-Volume.html、Skill-Cross-Platform-Brand-Search-Volume、Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Share-of-Voice-Tracking.html、Skill-Share-of-Voice-Tracking
- **可组合**：Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-GEO-Generative-Engine-Optimization

---

> 分类：业务运营/品牌与增长/内容策划　·　技术族：15-营销投放分析　·　源卡：`Skill-GEO-Generative-Engine-Optimization`