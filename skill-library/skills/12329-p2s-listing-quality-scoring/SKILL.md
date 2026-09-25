---
name: "p2s-listing-quality-scoring"
title: "Skill-Listing-Quality-Scoring"
description: "触发词：Listing 质量分、上架门控、文本与图像质量、改进建议、存量巡检。何时不用：要含合规与竞争力的全面体检用「Listing 健康诊断」；本技能聚焦文本与图像质量对转化的贡献。安全边界：质量分仅作内部上架门控参考，不得对外作为产品评价或宣传依据。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-067"
l3_business: "Listing优化"
l3_all: "Listing优化 / 转化优化"
l1_l2_l3: "业务运营/渠道经营/Listing优化"
p2s_card_id: "Skill-Listing-Quality-Scoring"
p2s_src_domain: "13-广告分析"
quality_tier: "preview"
user_summary: "上架前给 Listing 打一个 0-100 的质量分，指出改哪里能最多地提升转化。"
user_try: "试试：给这个 baby sterilizer 新品 Listing 打分，告诉我能不能直接开始投广告。"
whenToUse: "当要用一个可量化分数决定新品能否进入投放、并定位标题图片描述短板时用；要含合规与竞争力的全面体检用「Listing 健康诊断」。"
workflow: "录入标题、主图、要点与竞品对照字段 → 按标题、要点、描述、图片、完整度分维度评分 → 汇总 0-100 综合分并给出 A/B/C/D 等级 → 输出 Top 3 具体改进建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Listing-Quality-Scoring

## ① 解决的问题

业务问题：baby sterilizer 新品上架前，无法量化判断 Listing 质量是否达到投放标准

## ② 核心算法逻辑

核心思想：把 Amazon Listing 的「吸引力」分解为文本质量 + 图像质量两个可量化维度，用神经网络预测每个内容位置（标题/主图/描述/bullet points）对转化成功率的贡献，并反向输出"改哪里能提升最多"的可操作建议。

## ③ 业务应用场景

场景 A：新品上架前的 Listing 质量门控
- 业务问题：baby sterilizer 新品上架前，无法量化判断 Listing 质量是否达到投放标准。广告烧钱但 CVR 低，不知道是广告问题还是 Listing 问题。 - 数据要求： - 标题文本（英文，≤200字符） - 主图 URL（≥1000×1000px） - Bullet points（5条） - 竞品 Top 10 ASIN 的同等字段（用于 exemplar 对比） - 预期产出： - `listing_score`：0-100 分的综合质量分 - 分维度得分（标题/图片/描述各自评分） - Top 3 改进建议（具体到"第2个 bullet point 缺少量化数字
场景 B：存量 SKU 定期 Listing 健康度巡检

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
基准：baby sterilizer 品类 ACoS 25%，日广告预算 $200，当前 CVR 8%
Listing 质量从 D 级（<55分）优化至 B 级（70+分）：CVR 提升约 4-6pp（参考 MetaSynth A/B：CTR +10.26%；Mercari 图片优化：ATPU +7%）
CVR 8% → 12%：等效广告效率提升 50%，月节省无效广告支出约 $1,800
上架审核人工成本：从 30分钟/SKU → <5分钟/SKU，10 个 SKU 每月节省 ~8小时
实施难度：⭐⭐☆☆☆（2/5）— 纯规则+NLP，无需训练，直接可运行

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（377 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：5」并记录位置 `paper2skills-code/advertising/listing_quality_scoring` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-Listing-Quality-Scoring.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Skill-Listing-Quality-Scoring
基于 KDD'23 Amazon + EMNLP'24 IPL + IEEE Big Data 2025 MetaSynth
母婴跨境电商 Amazon Listing 质量评分工具
"""

import re
import numpy as np
from dataclasses import dataclass, field
from typing import Optional
import warnings
warnings.filterwarnings("ignore")


# ── 数据结构 ───────────────────────────────────────────────
@dataclass
class ListingInput:
    asin: str
    title: str
    bullet_points: list[str]          # 最多5条
    description: str = ""
    main_image_url: Optional[str] = None
    has_aplus: bool = False
    has_video: bool = False
    price: float = 0.0
    category: str = "baby"
    review_count: int = 0
    rating: float = 0.0


@dataclass
class ListingScore:
    asin: str
    total_score: float                # 0-100
    title_score: float
    bullets_score: float
    description_score: float
    image_score: float
    completeness_score: float
    grade: str                        # A/B/C/D
    top_issues: list[str] = field(default_factory=list)
    recommendations: list[str] = field(default_factory=list)


# ── 标题质量评分 ───────────────────────────────────────────
def score_title(title: str, category: str = "baby") -> tuple[float, list[str]]:
    """
    评分维度（参考 KDD'23 Amazon 框架）：
    - 长度合规性（Amazon 推荐 150-200 字符）
    - 关键词密度（品类核心词覆盖率）
    - 数字/规格信息（量化描述）
    - 可读性（避免堆砌关键词）
    """
    issues = []
    score = 100.0

    # 1. 长度检查
    length = len(title)
    if length < 80:
        score -= 20
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2302.01416。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：标题文本（英文，不超过 200 字符）、主图 URL（不小于 1000 乘 1000 像素）、五条要点、描述，以及竞品 Top10 ASIN 的同等字段用于对照。

**输出**：0-100 综合质量分与分维度得分、A/B/C/D 等级、Top 3 具体改进建议，供上架门控与投放决策。

## 执行步骤

1. 录入 Listing 文本、主图与竞品对照字段
2. 按标题、要点、描述、图片、完整度分维度评分
3. 汇总综合分并给出等级
4. 定位拖低总分的关键项
5. 输出 Top 3 改进建议并复评

## 边界与不做

- 何时不用：主图 URL 不可访问或缺少竞品对照时图片与对比维度不可评，结论需打折
- 能力边界：只做质量评分与改进建议，不替代投放效果验证，也不保证转化率提升幅度

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Competitor-Product-Intelligence.html、Skill-Competitor-Product-Intelligence、Skill-Creative-Fatigue-Detection.html、Skill-Creative-Fatigue-Detection、Skill-Dense-Retrieval-Ecommerce-Semantic-Search.html、Skill-Dense-Retrieval-Ecommerce-Semantic-Search、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Hierarchical-Search-Intent-Classification.html、Skill-Hierarchical-Search-Intent-Classification、Skill-Multimodal-Table-Understanding.html、Skill-Multimodal-Table-Understanding、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **延伸**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Competitor-Product-Intelligence.html、Skill-Competitor-Product-Intelligence、Skill-Creative-Fatigue-Detection.html、Skill-Creative-Fatigue-Detection、Skill-Dense-Retrieval-Ecommerce-Semantic-Search.html、Skill-Dense-Retrieval-Ecommerce-Semantic-Search、Skill-Multimodal-Table-Understanding.html、Skill-Multimodal-Table-Understanding、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-Competitor-Product-Intelligence.html、Skill-Competitor-Product-Intelligence、Skill-Creative-Fatigue-Detection.html、Skill-Creative-Fatigue-Detection、Skill-Dense-Retrieval-Ecommerce-Semantic-Search.html、Skill-Dense-Retrieval-Ecommerce-Semantic-Search、Skill-Multimodal-Table-Understanding.html、Skill-Multimodal-Table-Understanding、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-Listing-Quality-Scoring

---

> 分类：业务运营/渠道经营/Listing优化　·　技术族：13-广告分析　·　源卡：`Skill-Listing-Quality-Scoring`