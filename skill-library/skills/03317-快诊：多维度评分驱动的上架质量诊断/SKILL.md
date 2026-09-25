---
name: "p2s-listing-health-diagnostic"
title: "Listing Health Diagnostic — Listing 快诊：多维度评分驱动的上架质量诊断"
description: "触发词：Listing 体检、五维评分、上架前检查、问题清单、修改优先级。何时不用：已定位违规点需要改写用「Listing 合规自动修复」；本技能给的是整体体检报告。安全边界：诊断仅基于 Listing 文本与图片信息，不得据此编造平台规则之外的结论。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-067"
l3_business: "Listing优化"
l3_all: "Listing优化 / 商品诊断"
l1_l2_l3: "业务运营/渠道经营/Listing优化"
p2s_card_id: "Skill-Listing-Health-Diagnostic"
p2s_src_domain: "13-广告分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "十五分钟给 Listing 出一份体检报告，五个维度打分并告诉你先改哪一项。"
user_try: "试试：给这款吸奶器 Listing 做一次快诊，按投入产出排出一份优先修改清单。"
whenToUse: "当小卖家或新 SKU 上架前需要整体质量评估与修改优先级时用；已定位到违规点需要改写，用「Listing 合规自动修复」。"
workflow: "录入标题、要点、描述与图片信息 → 按 SEO、内容、图片、合规、竞争力五维打分 → 汇总 0-100 综合评分并定位最低分维度 → 输出按优先修改顺序排列的建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Listing Health Diagnostic — Listing 快诊：多维度评分驱动的上架质量诊断

## ① 解决的问题

小型卖家不知道Listing哪里有问题Amazon排名持续低迷——五维度评分（SEO/内容/图片/合规/竞争力）给出0-100分并附具体修改建议，15分钟诊断上架质量提升后搜索曝光增加15-25%年化10-30万元

## ② 核心算法逻辑

五维度 Listing 健康评分：

## ③ 业务应用场景

业务问题：小型卖家准备上架新款吸奶器，花了很多时间写文案，但不知道和竞品相比差在哪里。Listing 快诊在 15 分钟内给出详细诊断报告，上架前就能修复关键问题。
数据要求： - 自己的 Listing 文本（标题/要点/描述） - 图片数量和类型（人工确认） - 竞品参考（可选）
预期产出： - 0-100 分的综合评分 - 每个维度的具体问题清单 - 优先修改建议（按 ROI 排序）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
上架质量提升：搜索曝光+15-25%，转化率+8-12%
避免违规词导致下架：每次保护 ¥5-50 万 GMV
运营决策效率：15分钟诊断 vs 人工3-4小时
年化综合 ROI：¥10-30 万
实施难度：⭐⭐☆☆☆（规则引擎 1-2 周可实现；需要品类属性模板；2 周完整版）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（235 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/advertising/listing_health_diagnostic` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-Listing-Health-Diagnostic.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Listing Health Diagnostic
Listing 快诊：多维度评分 + 优先修改建议
"""
import re
from dataclasses import dataclass
from typing import Optional


@dataclass
class ListingContent:
    asin: str
    title: str
    bullet_points: list[str]
    description: str = ''
    search_terms: str = ''      # 后台关键词（最多250字节）
    num_images: int = 0
    has_main_image_white_bg: bool = True
    has_lifestyle_image: bool = False
    has_infographic: bool = False
    price: float = 0.0
    review_count: int = 0
    review_rating: float = 0.0
    category: str = 'breast_pump'


# 合规违禁词
FORBIDDEN_WORDS = ['fda approved', 'clinically proven', 'guaranteed to', '#1 best',
                   'cure', 'treat', 'medical grade', 'scientifically proven',
                   'visit our website', 'contact us before', 'leave a review']

# 核心关键词（母婴品类示例）
CORE_KEYWORDS = {'breast pump': 4.0, 'electric': 2.0, 'portable': 2.0,
                  'hospital grade': 1.5, 'wearable': 1.5, 'quiet': 2.0,
                  'bpa free': 1.5, 'rechargeable': 1.5, 'hands free': 1.5}


def score_seo(listing: ListingContent) -> dict:
    """SEO 覆盖度评分 (0-25)"""
    score = 0
    issues = []
    text_all = f"{listing.title} {' '.join(listing.bullet_points)} {listing.search_terms}".lower()

    # 关键词覆盖
    covered = sum(1 for kw in CORE_KEYWORDS if kw in text_all)
    kw_score = min(12, covered * 1.5)
    score += kw_score
    if covered < 5:
        issues.append(f'核心关键词覆盖不足（{covered}/{len(CORE_KEYWORDS)}个），补充：'
                       + '、'.join([k for k in CORE_KEYWORDS if k not in text_all][:3]))

    # Search Terms 利用率
    st_bytes = len(listing.search_terms.encode())
    st_score = min(8, st_bytes / 250 * 8)
    score += st_score
    if st_bytes < 200:
        issues.append(f'Search Terms 字段仅用 {st_bytes}/250 字节，仍有 {250-st_bytes} 字节可补充长尾词')

    # 标题关键词位置（前80字最重要）
    if any(kw in listing.title[:80].lower() for kw in ['breast pump', 'electric', 'quiet']):
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.09234，但该号在 arXiv 上是《Determination of the distance from a projection to nilpotents》，与本卡主题无关。
⚠️ 该号被 4 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：自有 Listing 文本（标题、要点、描述、后台词）、图片数量与类型（人工确认）、可选竞品参考与价格评论字段。

**输出**：0-100 综合评分与各维度问题清单、按优先修改顺序排列的建议，供运营在上架前修复。

## 执行步骤

1. 录入 Listing 文本、图片与后台关键词信息
2. 按 SEO、内容、图片、合规、竞争力五个维度打分
3. 汇总综合评分并定位最低分维度
4. 输出具体问题清单
5. 按修改优先级给出改动建议

## 边界与不做

- 何时不用：Listing 文本不完整或图片信息未确认时评分会失真，需先补数据
- 能力边界：只做诊断与建议，不做实际改写，也不保证曝光与转化提升

## 技能关联

- **前置**：Skill-Amazon-A10-Algorithm-Ranking.html、Skill-Amazon-A10-Algorithm-Ranking、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Compliance-ML-Risk-Scoring.html、Skill-Compliance-ML-Risk-Scoring、Skill-Listing-AI-Copywriting.html、Skill-Listing-AI-Copywriting、Skill-Listing-Compliance-Auto-Repair.html、Skill-Listing-Compliance-Auto-Repair、Skill-SEO-Organic-Ranking-Optimization.html、Skill-SEO-Organic-Ranking-Optimization
- **延伸**：Skill-Amazon-A10-Algorithm-Ranking.html、Skill-Amazon-A10-Algorithm-Ranking、Skill-Compliance-ML-Risk-Scoring.html、Skill-Compliance-ML-Risk-Scoring、Skill-Listing-AI-Copywriting.html、Skill-Listing-AI-Copywriting、Skill-Listing-Compliance-Auto-Repair.html、Skill-Listing-Compliance-Auto-Repair
- **可组合**：Skill-Amazon-A10-Algorithm-Ranking.html、Skill-Amazon-A10-Algorithm-Ranking、Skill-Compliance-ML-Risk-Scoring.html、Skill-Compliance-ML-Risk-Scoring、Skill-Listing-Health-Diagnostic

---

> 分类：业务运营/渠道经营/Listing优化　·　技术族：13-广告分析　·　源卡：`Skill-Listing-Health-Diagnostic`