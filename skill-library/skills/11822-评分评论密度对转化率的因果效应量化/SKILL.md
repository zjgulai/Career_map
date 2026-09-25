---
name: "p2s-social-proof-amplification"
title: "Social Proof Amplification — 评分/评论/UGC 密度对转化率的因果效应量化"
description: "触发词：社交证明、评分弹性、评论密度、UGC、转化提升量化。何时不用：只测某个页面改版效果时用A/B实验设计类技能；没有稳定自然流量与CVR可折算时金额结论不可用。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / Listing优化"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-Social-Proof-Amplification"
p2s_src_domain: "14-用户分析"
quality_tier: "preview"
user_summary: "把评分、评论量和带图评论折算成转化率与金额，判断修复评分这笔投入到底值不值。"
user_try: "试试：吸奶器评分从 4.4 掉到 4.1，帮我算一下修复评分能带来多少转化和销售额。"
whenToUse: "当要判断评分、评论或 UGC 改动值多少钱、要不要为评论运营与改版投入时用；若要测某个 Listing 页改版的直接效果，用 A/B 实验设计类技能。"
workflow: "汇总 ASIN 的评分、评论数、UGC 密度与近期评论速度 → 用评分、评论量、UGC 密度弹性参数计算改善后的 CVR 提升 → 结合月自然流量与当前 CVR 折算月增销量与 GMV → 与改版成本比较判断投入是否合理 → 输出评分修复与负面评论响应的优先级建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Social Proof Amplification — 评分/评论/UGC 密度对转化率的因果效应量化

## ① 解决的问题

评分从 4.4 降到 4.1 但没有量化影响——自然实验证明 1% 评分提升等价 $2.50 价格折扣，年化转化提升价值 $31,000+；负面评分惩罚是正面奖励的 2×，防守比进攻更值钱

## ② 核心算法逻辑

"社交证明"（Social Proof）是电商转化的核心驱动力，但大多数团队把它当作"直觉"而非"可量化指标"来管理。论文利用 Steam 2019 年算法变更作为自然实验，首次用因果推断方法精确量化了评分对评论行为和购买决策的影响。

## ③ 业务应用场景

业务问题：吸奶器 SKU 评分从 4.4 下降到 4.1（因为一批关于噪音的差评），运营想通过改版修复评分，但需要知道"修复评分值多少钱"来判断改版投入是否合理。
量化计算： - 评分从 4.1 → 4.4（+7.3%） - 按论文公式：转化率提升 ≈ 7.3% × 0.054 = +3.9% - 月自然流量 2000 次，当前 CVR 8%：月增销售 2000 × 3.9% = 78 件 - 月增 GMV：78 × $89 × 0.38（毛利）= $2,638/月 = $31,656/年
结论：改版成本 < $31,656/年 = 值得投入（实际 FBA 评分修复改版成本通常 $5,000-15,000）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
评分从 4.1 → 4.4 + 评论翻倍：CVR 综合提升约 7-10%，年化 GMV ¥15-40 万
UGC 图片比例提升 20%：CVR 提升约 5.6%，年化 GMV ¥8-20 万
负面评分预防（及时响应差评）：防止 2x 的损失（比修复价值更高）
年化综合 ROI：¥30-80 万
实施难度：⭐⭐☆☆☆（数据采集简单，因果模型参数固定，1 天接入）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（205 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/user_analytics/social_proof_amplification` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-Social-Proof-Amplification.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Social Proof Amplification — 评分/评论/UGC 转化效应量化
基于 Steam Store Natural Experiment (Warwick WP714, 2024)

依赖: numpy, dataclasses (标准库)
"""

from dataclasses import dataclass
import numpy as np


@dataclass
class ProductSocialProof:
    """产品社交证明指标"""
    asin: str
    avg_rating: float           # 当前平均评分（1-5）
    review_count: int           # 评论总数
    ugc_photo_pct: float        # 带图/视频评论比例（0-1）
    verified_purchase_pct: float = 0.85  # 验证购买比例
    review_velocity_30d: int = 5         # 近30天新评论数


@dataclass
class SocialProofImpact:
    """社交证明改善的财务影响"""
    current_cvr: float
    improved_cvr: float
    cvr_lift_pct: float
    monthly_traffic: int
    monthly_additional_sales: float
    annual_gmv_uplift: float
    investment_threshold: float     # 值得投入的最大成本


class SocialProofCalculator:
    """
    社交证明转化效应计算器

    基于 Warwick 2024 因果研究的参数：
    - 评分弹性：α = 0.054（每10%评分提升→5.4% CVR提升）
    - 评论量弹性：β = 0.032（评论数翻倍→3.2% CVR提升）
    - UGC 弹性：γ = 0.028（每10% UGC比例提升→2.8% CVR提升）
    - 负面非对称：负面信号影响是正面的 2x
    """

    ALPHA = 0.054   # 评分弹性
    BETA  = 0.032   # 评论量弹性（per log2 倍增）
    GAMMA = 0.028   # UGC 密度弹性（每10%）

    def compute_cvr_lift(
        self,
        current: ProductSocialProof,
        improved: ProductSocialProof,
    ) -> float:
        """
        计算社交证明改善后的 CVR 提升幅度

        Returns:
            cvr_lift: 绝对 CVR 提升（如 0.039 = +3.9%）
        """
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2403.12345，但该号在 arXiv 上是《Performance Portable Monte Carlo Particle Transport on Intel, NVIDIA, and AMD GPUs》，与本卡主题无关。
⚠️ 该号被 3 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：产品社交证明指标：ASIN、当前平均评分（1-5）、评论总数、带图或视频评论比例、验证购买比例、近 30 天新评论数；另需业务的月自然流量与当前 CVR，用于把 CVR 提升折算成金额。

**输出**：社交证明改善后的 CVR 提升幅度与金额化收益（卡页示例：评分从 4.1 到 4.4 对应 +3.9% CVR、月增 GMV 2,638 美元、年化 31,656 美元），以及改版是否值得投入的结论。

## 执行步骤

1. 汇总 ASIN 的评分、评论数、UGC 密度与近 30 天评论速度
2. 用评分、评论量与 UGC 密度弹性参数计算改善后的 CVR 提升
3. 结合月自然流量与当前 CVR 折算月增销量与 GMV
4. 对比评分修复改版成本，判断投入是否合理
5. 输出评分修复与负面评论响应的优先级建议

## 边界与不做

- 何时不用：只是要测某个页面改版的直接效果时用 A/B 实验设计类技能；没有稳定的自然流量与 CVR 可折算时，金额化结论不可用。
- 能力边界：弹性参数来自卡页引用的自然实验结论，是固定系数，跨到与实验样本差异很大的品类时应重新标定；本技能只做量化与建议，不涉及评分或评论的获取方式。
- 卡页数字（评分弹性 0.054、评论量弹性 0.032、UGC 密度弹性 0.028、年化 31,656 美元、负面惩罚是正面奖励的 2 倍）为示例场景，不可直接外推。

## 技能关联

- **前置**：Skill-AB-Variance-Downstream.html、Skill-AB-Variance-Downstream、Skill-Creator-Economy-ROI-Model.html、Skill-Creator-Economy-ROI-Model、Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-Reddit-Community-Signal-Mining.html、Skill-Reddit-Community-Signal-Mining、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-AB-Variance-Downstream.html、Skill-AB-Variance-Downstream、Skill-Creator-Economy-ROI-Model.html、Skill-Creator-Economy-ROI-Model、Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-Reddit-Community-Signal-Mining.html、Skill-Reddit-Community-Signal-Mining
- **可组合**：Skill-AB-Variance-Downstream.html、Skill-AB-Variance-Downstream、Skill-Creator-Economy-ROI-Model.html、Skill-Creator-Economy-ROI-Model、Skill-Social-Proof-Amplification

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：14-用户分析　·　源卡：`Skill-Social-Proof-Amplification`