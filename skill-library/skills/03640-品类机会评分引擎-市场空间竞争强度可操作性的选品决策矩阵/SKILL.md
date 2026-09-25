---
name: "p2s-product-category-opportunity-scoring"
title: "品类机会评分引擎 — 市场空间×竞争强度×可操作性的选品决策矩阵"
description: "触发词：品类机会评分、市场空间、竞争强度、可操作性、选品决策矩阵。何时不用：要估算品类 TAM/SAM/SOM 的绝对数字用「Market Size Estimation」；只给单个新品做加权评分卡用「Product Opportunity Scoring」。安全边界：权重与阈值须按业务校准并留档，评分不是唯一决策依据，输入数据来源必须可追溯。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-022"
l3_business: "市场机会评估"
l3_all: "市场机会评估 / 组合取舍"
l1_l2_l3: "业务运营/产品与创新/市场机会评估"
p2s_card_id: "Skill-Product-Category-Opportunity-Scoring"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用市场空间、竞争强度、可操作性三个维度给候选品类打分，把选品从凭感觉变成可比较的 GO/NO-GO 决策。"
user_try: "试试：把这三个候选品类按市场空间×竞争强度×可操作性打分，给出 GO/NO-GO 和优先级。"
whenToUse: "在多个候选品类之间做初筛与优先级排序时用本技能；若需要市场规模的绝对数字区间，用「Market Size Estimation」；若品类已定、只评估单个新品，用「Product Opportunity Scoring」。"
workflow: "采集品类的月 GMV、同比增速、月搜索量等市场空间字段 → 计算头部集中度、价格战强度与头尾评分差距等竞争指标 → 计算供应链复杂度、认证壁垒与资金需求等可操作性指标 → 合成三维综合评分并给出 GO/NO-GO 与优先级排序"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 品类机会评分引擎 — 市场空间×竞争强度×可操作性的选品决策矩阵

## ① 解决的问题

选品团队面临"新品选择靠感觉导致30%失败率"——三维评分(市场×竞争×可操作性)将新品失败率从30%降至15%，防止错误选品损失约90万元/年

## ② 核心算法逻辑

品类机会评分 将选品从"凭感觉"转化为数据驱动的"可量化决策"。三个核心维度：

## ③ 业务应用场景

（卡页此段是占位串，未承载业务场景；可读的落地口径见下方「执行步骤」与「输入 / 输出契约」。）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：数据驱动选品减少新品失败率从30%→15%；每次新品投入约¥30万，选品精准化每年防止2-3次错误决策，节省约60-90万元
实施难度：⭐⭐⭐☆☆（数据来源：Amazon/Shopify分析工具+第三方选品工具）
优先级评分：⭐⭐⭐⭐⭐（选品是所有供应链工作的起点，选错品=所有后续工作白费）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（110 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/product_category_opportunity_scoring` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Product-Category-Opportunity-Scoring.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
品类机会评分引擎
功能：多维度评分 / GO/NO-GO决策 / 风险因子识别 / 选品优先级排序
"""
import numpy as np
from dataclasses import dataclass, field
import warnings
warnings.filterwarnings('ignore')


@dataclass
class CategoryData:
    category_name: str
    monthly_gmv_usd: float
    yoy_growth_pct: float
    search_volume_monthly: int
    top3_market_share_pct: float    # 头部3家的市场份额
    avg_rating_gap: float           # 头部评分 vs 尾部评分差距
    price_war_intensity: float      # 0-1 价格战激烈度
    supply_chain_complexity: float  # 0-1 供应链复杂度
    certification_barriers: float   # 0-1 认证壁垒
    capital_requirement_usd: float  # 启动资金需求


def score_market_size(cat: CategoryData) -> float:
    """市场规模评分（0-1）"""
    gmv_score = min(1.0, cat.monthly_gmv_usd / 5_000_000)
    growth_score = min(1.0, max(0, cat.yoy_growth_pct) / 50.0)
    search_score = min(1.0, cat.search_volume_monthly / 1_000_000)
    return 0.5 * gmv_score + 0.3 * growth_score + 0.2 * search_score


def score_competition(cat: CategoryData) -> float:
    """竞争强度（0-1，越低越好进入）"""
    concentration = cat.top3_market_share_pct / 100.0
    rating_gap = min(1.0, cat.avg_rating_gap / 1.5)
    price_war = cat.price_war_intensity
    return 0.5 * concentration + 0.3 * price_war + 0.2 * rating_gap


def score_operability(cat: CategoryData) -> float:
    """可操作性（0=难操作，1=容易操作）"""
    supply_ok = 1.0 - cat.supply_chain_complexity
    cert_ok = 1.0 - cat.certification_barriers
    capital_ok = 1.0 - min(1.0, cat.capital_requirement_usd / 500_000)
    return 0.4 * supply_ok + 0.3 * cert_ok + 0.3 * capital_ok


def compute_opportunity_score(cat: CategoryData) -> dict:
    market = score_market_size(cat)
    competition = score_competition(cat)
    operability = score_operability(cat)

    score = (0.35 * market + 0.30 * (1 - competition) + 0.35 * operability) * 100

    # GO/NOGO
    if score >= 65:
        rec = "GO"
    elif score >= 45:
        rec = "WATCH"
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2309.11823。
⚠️ 该号被 3 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：品类级字段：月 GMV、同比增速、月搜索量、头部三家市场份额、头部与尾部评分差距、价格战激烈度、供应链复杂度、认证壁垒、启动资金需求。

**输出**：市场空间 / 竞争强度 / 可操作性三维得分与综合评分、GO/NO-GO 决策、风险因子识别与选品优先级排序，供选品团队决策使用。

## 执行步骤

1. 采集品类的市场空间字段
2. 计算竞争强度指标
3. 计算可操作性指标
4. 合成三维综合评分
5. 输出 GO/NO-GO 与选品优先级

## 边界与不做

- 缺品类级 GMV、份额或认证壁垒数据时不适用，评分会退化为主观估计
- 三维评分是相对比较工具，不含合规、物流与现金流测算，不能替代完整立项评审
- 权重与阈值须按业务校准并留档，输入数据来源必须可追溯

## 技能关联

- **前置**：Skill-New-SKU-Launch-Readiness-Gate.html、Skill-New-SKU-Launch-Readiness-Gate、Skill-PASTA-Offline-Assortment.html、Skill-PASTA-Offline-Assortment、Skill-Predictive-Tag-Engine-Supply-Chain.html、Skill-Predictive-Tag-Engine-Supply-Chain、Skill-Product-Lifecycle-Stage.html、Skill-Product-Lifecycle-Stage
- **延伸**：Skill-New-SKU-Launch-Readiness-Gate.html、Skill-New-SKU-Launch-Readiness-Gate、Skill-Predictive-Tag-Engine-Supply-Chain.html、Skill-Predictive-Tag-Engine-Supply-Chain、Skill-Product-Lifecycle-Stage.html、Skill-Product-Lifecycle-Stage
- **可组合**：Skill-Predictive-Tag-Engine-Supply-Chain.html、Skill-Predictive-Tag-Engine-Supply-Chain、Skill-Product-Lifecycle-Stage.html、Skill-Product-Lifecycle-Stage、Skill-Product-Category-Opportunity-Scoring

---

> 分类：业务运营/产品与创新/市场机会评估　·　技术族：04-供应链　·　源卡：`Skill-Product-Category-Opportunity-Scoring`