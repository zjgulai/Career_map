---
name: "p2s-amazon-a10-algorithm-ranking"
title: "Amazon A10 Algorithm Ranking — 亚马逊搜索排名因子建模与 Listing 可见度优化"
description: "触发词：A10 排名、排名因子诊断、自然排名下降、外部流量权重、Listing 体检。何时不用：站外引流执行与提速归因用「站外流量加速」；本技能是排名因子诊断与打分。安全边界：仅使用 Amazon 官方业务报告数据，不得使用或模仿竞品的刷单等违规手段。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-067"
l3_business: "Listing优化"
l3_all: "Listing优化 / 商品诊断"
l1_l2_l3: "业务运营/渠道经营/Listing优化"
p2s_card_id: "Skill-Amazon-A10-Algorithm-Ranking"
p2s_src_domain: "13-广告分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "排名掉了先别急着改文案，按 A10 的因子逐项体检，指出最拖后腿的那一项。"
user_try: "试试：我们主词从第 5 掉到第 18，帮我按 A10 因子诊断出最可能的瓶颈。"
whenToUse: "当自然排名下滑、需要定位是语义相关性、转化率、外部流量还是评论速度出的问题时用；站外流量归因与提速用「站外流量加速」。"
workflow: "采集 Listing 信号快照与近 30 天业务报告 → 按 A10 因子权重逐项打分并汇总 → 定位分值最低的瓶颈因子 → 输出按优先级排序的动作清单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Amazon A10 Algorithm Ranking — 亚马逊搜索排名因子建模与 Listing 可见度优化

## ① 解决的问题

Listing 排名从第 18 跌到 25 位但不知道哪里出了问题——PP-GLAM 可解释排名模型揭示 A10 外部流量权重大幅提升，针对性优化可将自然排名提升 8-12 位，广告 ACOS 降低 30-40%

## ② 核心算法逻辑

Amazon A10 算法是 A9 的进化版，核心变化是更重视购买者意图（Buyer Intent）而非纯关键词匹配，并且大幅提高了外部流量信号的权重。理解 A10 的关键是把它看作两层模型的组合：

## ③ 业务应用场景

业务问题：某款吸奶器之前稳定在"breast pump"关键词第 5 名，最近 2 周掉到第 18 名，广告 ACOS 同步上升，不知道原因。
A10 排名因子诊断： 1. 语义相关性：检查 listing 属性是否覆盖了 A10 最新的意图匹配需求（月龄标注、使用场景标注） 2. 转化率变化：查看近 30 天转化率是否因价格/竞品上市而下降 3. 外部流量：检查近期外站引流是否中断（TikTok 视频下架？） 4. 评论速度：最新评论日期 vs 竞品评论速度对比
三轨验证： - 成本：数据采集需 Seller Central API 权限（约 $39.99/月专业销售计划），人力成本约 2 小时/次诊断（运营人员），无额外计算资源开销。 - 合规：完全合规，仅使用 Amazon 官方提供的业务报告数据（业务报告 → 详情页流量与销量），不触碰任何用户隐私或平台禁止数据采集手段。 - 风险：诊断结果可能暴露竞品通过刷单/违规手段获取排名，但自身不应模仿；过度关注排名波动可能导致频繁调整 listing，触发 Amazon 内容审核（每次修改后 24-72 小时重新索引）。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
A10 排名从第 18 → 第 5：自然流量增加 3-5×，广告 ACOS 降低 30-40%
外部流量策略实施（TikTok 引流）：A10 权重奖励带来排名提升
新品 90 天蜜月期利用：自然排名建立速度快 2-3×
年化综合 ROI：¥50-200 万（视 GMV 规模）
实施难度：⭐⭐☆☆☆（因子评分纯 Python，属性数据需 Seller Central API，1-2 天接入）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（212 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 56 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/advertising/amazon_a10_algorithm_ranking` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-Amazon-A10-Algorithm-Ranking.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Amazon A10 Algorithm Ranking — 排名因子评分与优化诊断
基于 PP-GLAM (arXiv: 2403.00923) + COSMO (Amazon Science 2024)

依赖: re, statistics, dataclasses (标准库)
"""

from dataclasses import dataclass, field
from statistics import mean
import re


@dataclass
class ListingSignals:
    """Listing 的 A10 排名信号快照"""
    asin: str
    title: str
    bullet_points: list
    # 转化信号
    conversion_rate_30d: float       # 30天转化率
    click_through_rate: float        # 点击率
    # 流量信号
    organic_sessions_30d: int        # 自然流量
    external_traffic_30d: int        # 外部流量
    # 内容信号
    review_count: int
    review_velocity_30d: int         # 近30天新评论数
    avg_rating: float
    # 账号信号
    seller_account_age_days: int
    fba_late_shipment_rate: float    # FBA 迟发货率
    # 属性完整度
    attribute_completeness: float    # 属性填写完整率（AutoPKG 输出）


@dataclass
class A10RankingScore:
    """A10 排名因子评分"""
    asin: str
    total_score: float
    factor_scores: dict
    top_bottleneck: str
    estimated_rank_position: int     # 预估自然排名
    action_items: list


class AmazonA10Scorer:
    """
    Amazon A10 排名因子评分器

    基于 PP-GLAM 语义相关性 + COSMO 意图匹配
    + A10 行为信号权重（逆向工程 + 业界共识）
    """

    # A10 各因子权重（基于 PP-GLAM 可解释性输出 + 行业研究）
    FACTOR_WEIGHTS = {
        "semantic_relevance":      0.22,  # 语义相关性（BERT 匹配度）
        "conversion_rate":         0.20,  # 转化率
        "click_through_rate":      0.15,  # 点击率
        "external_traffic_ratio":  0.15,  # 外部流量占比（A10 新增权重）
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2403.00923，但该号在 arXiv 上是《An Interpretable Ensemble of Graph and Language Models for Improving Search Relevance in E-Commerce》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：Listing 信号（标题与要点、30 天转化率与点击率、自然与外部流量、评论数量与近 30 天增速、平均评分、账号指标、属性完整度），来自 Seller Central 业务报告数据。

**输出**：A10 因子评分与总分、最大瓶颈项、动作清单与预估自然排名位次，供运营调整 Listing 与投放。

## 执行步骤

1. 采集 Listing 信号快照与近 30 天业务报告
2. 按 A10 因子权重逐项打分
3. 定位分值最低的瓶颈因子
4. 输出按优先级排序的动作清单
5. 修改后等重新索引再复测排名

## 边界与不做

- 何时不用：拿不到 Seller Central 业务报告数据时，因子无法打分
- 能力边界：只做因子诊断与建议，不保证排名结果，也不得使用或模仿违规排名手段

## 技能关联

- **前置**：Skill-Amazon-External-Traffic-Boost.html、Skill-Amazon-External-Traffic-Boost、Skill-AutoPKG-Multimodal-Product-Attribute-KG.html、Skill-AutoPKG-Multimodal-Product-Attribute-KG、Skill-Keyword-Competition-Scoring.html、Skill-Keyword-Competition-Scoring、Skill-Listing-AB-Testing-Automation.html、Skill-Listing-AB-Testing-Automation、Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-SEO-Organic-Ranking-Optimization.html、Skill-SEO-Organic-Ranking-Optimization
- **延伸**：Skill-Amazon-External-Traffic-Boost.html、Skill-Amazon-External-Traffic-Boost、Skill-Keyword-Competition-Scoring.html、Skill-Keyword-Competition-Scoring、Skill-Listing-AB-Testing-Automation.html、Skill-Listing-AB-Testing-Automation、Skill-SEO-Organic-Ranking-Optimization.html、Skill-SEO-Organic-Ranking-Optimization
- **可组合**：Skill-Listing-AB-Testing-Automation.html、Skill-Listing-AB-Testing-Automation、Skill-SEO-Organic-Ranking-Optimization.html、Skill-SEO-Organic-Ranking-Optimization、Skill-Amazon-A10-Algorithm-Ranking

---

> 分类：业务运营/渠道经营/Listing优化　·　技术族：13-广告分析　·　源卡：`Skill-Amazon-A10-Algorithm-Ranking`