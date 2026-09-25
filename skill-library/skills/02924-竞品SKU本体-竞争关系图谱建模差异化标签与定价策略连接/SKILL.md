---
name: "p2s-competitor-sku-ontology"
title: "竞品SKU本体 — 竞争关系图谱建模、差异化标签与定价策略连接"
description: "触发词：竞品本体、竞争关系图谱、价格位置、差异化标签、SKU 对标。何时不用：要监测竞品上新动向用「Competitor Product Intelligence」；要融合多源数据建属性图谱用「KG Data Fusion Pipeline」。安全边界：竞品价格为公开数据、不得用于价格协同；标签判断需人工复核，不得作为对外贬损竞品的依据。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-020"
l3_business: "竞品研究"
l3_all: "竞品研究"
l1_l2_l3: "业务运营/产品与创新/竞品研究"
p2s_card_id: "Skill-Competitor-SKU-Ontology"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把竞品 SKU 按价格、评分、排名和竞争类型建成一张结构化图谱，随时看出自己在市场里处在哪个价格位置。"
user_try: "试试：把我们的 SKU 和这几个竞品建成竞争图谱，标出价格位置和差异化机会标签。"
whenToUse: "竞品清单需要结构化管理、要判断自家价格位置与差异化标签时用本技能；若要监测竞品上新动向，用「Competitor Product Intelligence」；若要融合多源数据构建属性图谱，用「KG Data Fusion Pipeline」。"
workflow: "为每个竞品 SKU 录入价格、评分、评论数、BSR 与月销量估算 → 标注竞争类型（直接竞争 / 替代品 / 价格领导者）与质量档位 → 计算自身价格相对直接竞品均价的位置 → 输出差异化标签与竞争机会标签"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 竞品SKU本体 — 竞争关系图谱建模、差异化标签与定价策略连接

## ① 解决的问题

运营面临"竞品价格变动要1周后才知道"——竞品本体实时监控将价格响应从1周→实时，抓住提价窗口年化增收5-8万元

## ② 核心算法逻辑

竞品SKU本体 将竞争关系从"人工跟踪"升级为"结构化图谱+Tag查询"。

## ③ 业务应用场景

（卡页此段是占位串，未承载业务场景；可读的落地口径见下方「执行步骤」与「输入 / 输出契约」。）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：结构化竞品监控使价格策略响应时间从"每周人工更新"→"实时自动"，抓住竞品价格上涨窗口提价，年化增收约5-8万元；及时发现竞品评分下降机会，加大广告投放
实施难度：⭐⭐☆☆☆（数据来源：Amazon API/第三方工具）
优先级评分：⭐⭐⭐⭐☆（跨境电商是高度竞争市场，不了解竞品动态就是闭门造车）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（83 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/competitor_sku_ontology` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Competitor-SKU-Ontology.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
竞品 SKU 本体
功能：竞品关系建模 / 价格监控 / 差异化分析 / 竞争机会标签
"""
from dataclasses import dataclass, field
from typing import Optional
import warnings
warnings.filterwarnings('ignore')


@dataclass
class CompetitorSKU:
    asin: str
    title: str
    brand: str
    price_usd: float
    rating: float
    review_count: int
    bsr: int                # Best Seller Rank
    monthly_sales_est: int
    competition_type: str   # DIRECT / SUBSTITUTE / PRICE_LEADER
    quality_tier: str       # HIGH / MEDIUM / LOW
    our_sku_id: Optional[str] = None  # 我们的哪个SKU在竞争
    tags: dict = field(default_factory=dict)


def analyze_competitive_position(our_sku: dict, competitors: list) -> dict:
    """分析竞争位置并生成标签"""
    our_price = our_sku["price_usd"]
    our_rating = our_sku["rating"]
    our_bsr = our_sku["bsr"]

    # 价格分析
    direct_prices = [c.price_usd for c in competitors if c.competition_type == "DIRECT"]
    price_leader = min(competitors, key=lambda c: c.price_usd)
    avg_comp_price = sum(direct_prices) / max(1, len(direct_prices)) if direct_prices else our_price
    price_position = "ABOVE_MARKET" if our_price > avg_comp_price * 1.1 else (
        "BELOW_MARKET" if our_price < avg_comp_price * 0.9 else "AT_MARKET")

    # 评分分析
    avg_comp_rating = sum(c.rating for c in competitors if c.competition_type == "DIRECT") / max(1, len(competitors))
    rating_advantage = our_rating - avg_comp_rating
    rating_position = "LEADER" if rating_advantage > 0.3 else ("COMPETITIVE" if rating_advantage > -0.1 else "LAGGING")

    # 最大威胁竞品
    biggest_threat = max(competitors, key=lambda c: c.monthly_sales_est)

    tags = {
        "market.price_position": price_position,
        "market.rating_position": rating_position,
        "market.biggest_threat_asin": biggest_threat.asin,
        "market.price_gap_pct": round((our_price - avg_comp_price) / avg_comp_price * 100, 1),
        "market.rating_gap": round(rating_advantage, 2),
        "competitor.price_leader_price": price_leader.price_usd,
    }

    opportunities = []
    if biggest_threat.rating < our_rating - 0.3:
        opportunities.append(f"竞品{biggest_threat.brand}评分低{our_rating-biggest_threat.rating:.1f}分，可强化差异化营销")
    if price_position == "ABOVE_MARKET":
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2310.11823，但该号在 arXiv 上是《Coulomb contribution to Shockley-Read-Hall (SRH) recombination》，与本卡主题无关。
⚠️ 该号被 3 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：竞品 SKU 明细：ASIN、标题、品牌、价格、评分、评论数、BSR、月销量估算，以及自家对应 SKU 的价格、评分与 BSR。

**输出**：竞品 SKU 本体图谱与标签：竞争类型、质量档位、自身价格位置（高于 / 低于市场均价）与竞争机会标签，供定价与差异化策略使用。

## 执行步骤

1. 录入竞品 SKU 的价格、评分、评论数与 BSR
2. 标注竞争类型与质量档位
3. 计算自身价格相对直接竞品均价的位置
4. 生成差异化标签与竞争机会标签
5. 把标签接入定价与广告响应流程

## 边界与不做

- 竞品字段缺失、或月销量只能粗估时不适用，标签判断会失真；卡页第 3 段未自动抽取，实施前需回看原始卡页确认应用场景
- 输出是结构化标签与位置判断，不含调价执行动作，价格策略仍须人工决策
- 竞品价格为公开数据，不得用于价格协同；标签不得作为对外贬损竞品的依据

## 技能关联

- **前置**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Monodense-单品价格弹性估计.html、Skill-Monodense-单品价格弹性估计、Skill-New-SKU-Launch-Readiness-Gate.html、Skill-New-SKU-Launch-Readiness-Gate、Skill-Product-Category-Opportunity-Scoring.html、Skill-Product-Category-Opportunity-Scoring、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Warehouse-Inbound-Quality-Accuracy-KPI.html、Skill-Warehouse-Inbound-Quality-Accuracy-KPI
- **延伸**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Monodense-单品价格弹性估计.html、Skill-Monodense-单品价格弹性估计、Skill-New-SKU-Launch-Readiness-Gate.html、Skill-New-SKU-Launch-Readiness-Gate、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Warehouse-Inbound-Quality-Accuracy-KPI.html、Skill-Warehouse-Inbound-Quality-Accuracy-KPI
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-New-SKU-Launch-Readiness-Gate.html、Skill-New-SKU-Launch-Readiness-Gate、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Warehouse-Inbound-Quality-Accuracy-KPI.html、Skill-Warehouse-Inbound-Quality-Accuracy-KPI、Skill-Competitor-SKU-Ontology

---

> 分类：业务运营/产品与创新/竞品研究　·　技术族：04-供应链　·　源卡：`Skill-Competitor-SKU-Ontology`