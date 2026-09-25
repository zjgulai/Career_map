---
name: "p2s-organic-paid-rank-synergy-model"
title: "自然排名与广告排名协同效应建模 — 用 Panel DiD 量化广告飞轮 ROI"
description: "触发词：广告飞轮、自然排名溢出、Panel DiD、增量分析、广告真实 ROI、平行趋势。何时不用：只算直接归因 ROAS 或关键词效率时用投放诊断；本卡量化广告对自然排名的滞后溢出，要求面板数据与平行趋势假设。安全边界：不得据此推断或操纵平台排名算法，结论仅用于自家预算决策。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 增量分析"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Organic-Paid-Rank-Synergy-Model"
p2s_src_domain: "25-搜索流量工程"
quality_tier: "preview"
user_summary: "算清广告到底有没有把自然排名带起来，避免因为只看直接 ROAS 而砍掉真正有效的预算。"
user_try: "试试：这是我过去 180 天按周汇总的广告花费、广告排名、自然排名和自然点击，帮我用 Panel DiD 估算溢出效应和综合真实 ROI。"
whenToUse: "与「搜索位置点击弹性」相比：位置弹性算单关键词位置变化的点击与 GMV 增量；判断广告预算是否值得保留、有没有飞轮效应时用本卡。"
workflow: "整理多 ASIN×多周的面板数据（广告花费、广告排名、自然排名、自然点击） → 用 Panel DiD 拟合广告花费对自然排名的溢出系数并检验平行趋势 → 按溢出系数重算综合真实 ROAS，与直接 ROAS 对比 → 据此调整词组配置（提高品牌词与高溢出词比例）而非直接砍预算"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 自然排名与广告排名协同效应建模 — 用 Panel DiD 量化广告飞轮 ROI

## ① 解决的问题

运营总监面临"广告烧了钱但自然排名没有长期增长飞轮"——Panel DiD量化广告飞轮溢出ROI，自然流量长期贡献度年化提升$14.4万

## ② 核心算法逻辑

飞轮效应（Flywheel）：在 Amazon 生态中，广告投放 → 提升销量 → 算法认为产品受欢迎 → 自然排名提升 → 更多自然流量 → 更多销量。这个正反馈循环使得广告的「真实 ROI」远高于直接可见的广告 ROAS。

## ③ 业务应用场景

场景A：婴儿推车广告策略优化（飞轮 ROI 量化）
卖家「baby stroller lightweight」关键词，月广告花费 $8,000，直接 ROAS=3.2，感觉收益有限，考虑缩减预算。
- 业务问题：只看直接 ROAS 低估了广告的真实价值；缩减预算可能导致已提升的自然排名回落 - 数据要求：过去 180 天（6个月）每周的广告花费、广告排名、自然排名、自然点击量（SP 报告可导出） - 执行步骤：Panel DiD 拟合溢出系数 → 计算广告对自然排名的持续贡献 → 综合 ROI 重算 - 预期产出：溢出系数 $\beta = -0.18$（广告花费每增加 $1,000，自然排名提升约 0.18 位），综合真实 ROAS=5.1（远高于直接可见的 3.2） - 业务价值：保持广告预算，改变词组配置（增加品牌词比例），月 GMV 增加 $3.1 万，避免错误缩减预算导致自然排

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：基于飞轮模型重新评估广告价值后，避免错误削减高溢出广告，12 个月累计 GMV 保住/增加约 $15-25 万（以年销 $100 万、广告占比 15% 的店铺测算）；同等预算向品牌词/高溢出词重新分配后月 GMV 增加约 $3 万
实施难度：⭐⭐⭐⭐☆（需要 6 个月以上历史面板数据；Panel DiD 有严格的平行趋势假设需要验证）
优先级：⭐⭐⭐⭐⭐（改变广告预算决策框架，从「直接 ROAS」到「综合飞轮 ROI」，是搜索流量工程的最高决策层）
评估依据：学术研究（Ghose & Yang, 2009）在搜索引擎领域证实广告溢出 ROI 平均比直接 ROI 高 1.4-2.1x；亚马逊卖家社区案例数据与此吻合，高品牌认知度品类溢出效应更强

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（206 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/organic_paid_rank_synergy_model` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/25-搜索流量工程/Skill-Organic-Paid-Rank-Synergy-Model.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple

# ─────────────────────────────────────────────
# 自然排名 × 广告协同效应建模（Panel DiD）
# 量化广告对自然排名的溢出 ROI（飞轮效应）
# ─────────────────────────────────────────────

np.random.seed(2025)


def generate_panel_data(n_asins: int = 8,
                        n_weeks: int = 26) -> pd.DataFrame:
    """
    生成多 ASIN × 多周的面板数据
    真实因果：广告花费 → 自然排名提升（滞后 1-2 周）
    """
    records = []
    
    for asin_id in range(n_asins):
        # ASIN 固有质量（影响基础自然排名）
        quality = np.random.uniform(0.4, 0.9)
        base_organic_rank = int(30 - quality * 20) + np.random.randint(-3, 4)
        
        # 广告策略：有的 ASIN 高预算，有的低预算（用于对照）
        is_high_budget = asin_id < n_asins // 2
        
        prev_organic_rank = base_organic_rank
        
        for week in range(n_weeks):
            # 广告花费（高预算组更多，加随机波动）
            if is_high_budget:
                ad_spend = max(0, np.random.normal(5000, 800))
            else:
                ad_spend = max(0, np.random.normal(1500, 400))
            
            # 广告排名（与花费正相关）
            ad_rank = max(1, int(np.random.normal(8 - ad_spend / 1000, 2)))
            
            # 自然排名的因果效应：
            # 1. 广告提升销量速度 → 自然排名改善（真实效应 β = -0.002 每$1 花费）
            # 2. 季节效应（Q4 提升）
            # 3. ASIN 固有品质
            true_beta = -0.0015  # 广告花费每 $1000 → 自然排名提升 1.5 位
            season_effect = -3 * np.sin(2 * np.pi * week / 52)  # 季节性
            noise = np.random.normal(0, 1.5)
            
            organic_rank = max(1, int(
                prev_organic_rank
                + true_beta * ad_spend  # 广告溢出效应（滞后）
                + season_effect
                + noise
            ))
            
            # 自然点击量（排名越高越多）
            organic_clicks = max(0, int(
                500 / organic_rank + np.random.normal(0, 20)
            ))
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2006.12345，但该号在 arXiv 上是《Generic Rotation Sets in Hyperbolic Surfaces》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：过去 180 天（6 个月）以上、按周聚合的多 ASIN 面板数据：广告花费、广告排名、自然排名、自然点击量，可从 SP 报告导出；需有高/低预算对照单元与前后对照。

**输出**：广告对自然排名的溢出系数、综合真实 ROAS 与直接 ROAS 的对比、维持或重分配预算的结论，供运营总监决策；卡页案例输出溢出系数 −0.18、综合 ROAS 5.1。

## 执行步骤

1. 汇总 SP 报告的多 ASIN、按周面板数据，补齐广告排名与自然排名两列。
2. 用 Panel DiD 拟合广告花费（滞后 1–2 周）对自然排名的溢出系数。
3. 检验平行趋势假设，确认高/低预算组在干预前走势一致。
4. 折算溢出贡献回广告，重算综合真实 ROAS。
5. 输出预算保留或重分配建议，并给出词组配置调整方向。

## 边界与不做

- 何时不用：历史面板不足 6 个月、或高/低预算组平行趋势不成立时不要用；只关心当期直接 ROAS 的日常优化不必用本卡。
- 能力边界：只产出溢出系数与综合 ROI 判断，不自动改预算、不替代增量实验；评估依据引自文献与社区案例，非本店实测。
- 数据边界：粒度若无法拆到 ASIN×周，结论不可信，应先补数据。

## 技能关联

- **前置**：Skill-Ad-Aware-Recommendation.html、Skill-Ad-Aware-Recommendation、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-NeuralNDCG-Learning-to-Rank.html、Skill-NeuralNDCG-Learning-to-Rank、Skill-Search-Position-Click-Elasticity.html、Skill-Search-Position-Click-Elasticity
- **延伸**：Skill-Ad-Aware-Recommendation.html、Skill-Ad-Aware-Recommendation、Skill-Search-Position-Click-Elasticity.html、Skill-Search-Position-Click-Elasticity
- **可组合**：Skill-Ad-Aware-Recommendation.html、Skill-Ad-Aware-Recommendation、Skill-Organic-Paid-Rank-Synergy-Model

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：25-搜索流量工程　·　源卡：`Skill-Organic-Paid-Rank-Synergy-Model`