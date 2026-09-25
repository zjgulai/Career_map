---
name: "p2s-category-tree-placement-optimizer"
title: "Skill-Category-Tree-Placement-Optimizer — 品类树节点竞争密度优化"
description: "触发词：品类节点选择、竞争密度分析、BSR 徽章、Browse Node、节点机会评分。何时不用：要判断的是关键词层面高需求低竞争的蓝海词而非品类节点归属时用「关键词需求缺口矩阵分析」。安全边界：只输出节点分析与申请清单，不代为提交平台 Case。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-065"
l3_business: "商品诊断"
l3_all: "商品诊断 / 站点运营"
l1_l2_l3: "业务运营/渠道经营/商品诊断"
p2s_card_id: "Skill-Category-Tree-Placement-Optimizer"
p2s_src_domain: "25-搜索流量工程"
quality_tier: "preview"
user_summary: "帮新品挑一个竞争最松的品类子节点去争 BSR 徽章，用最小竞争换最大的品类流量入口。"
user_try: "试试：对比 Baby 类目下几个子节点的竞争密度，推荐 1-3 个最适合挂载的精准子节点。"
whenToUse: "当要决定商品挂到哪个品类节点、用竞争密度与流量潜力挑选最容易拿到 BSR 徽章的归属时用本技能；若要判断的是关键词层面的蓝海机会，用「关键词需求缺口矩阵分析」。"
workflow: "拉取品类树结构与各节点产品数、月销估算 → 计算竞争密度与节点机会得分 → 按得分把节点分为黄金细分、机会节点等四类 → 选出精准子节点并保留父节点做多节点覆盖"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Category-Tree-Placement-Optimizer — 品类树节点竞争密度优化

## ① 解决的问题

选品负责人面临"品类节点竞争激烈排名难突破"——最低竞争密度节点识别将新品首月BSR均值提升40%，上架成功率提高25%

## ② 核心算法逻辑

品类树节点优化（Category Tree Placement Optimizer）通过分析 Amazon 品类节点的竞争密度和流量潜力，选择最有利的品类归属，以最小竞争摘取 BSR（Best Seller Rank）徽章和品类流量。

## ③ 业务应用场景

- 业务问题：产品当前归属「Baby → Carriers」，竞争产品 8,000+，BSR Top 100 需要月销 500+，难度极高 - 数据要求：目标品类树结构、各节点产品数、月销估算数据 - 执行方案： - 分析「Baby → Carriers → Hip Seats」子节点：产品仅 320 个，Top 100 只需月销 80 - 申请添加 Browse Node ID 至精准子节点 - 同时保留父节点，实现多节点覆盖 - 量化产出：3 周内获得「Hip Seats」子品类 BSR #15，BSR 徽章带来额外 8-12% CTR 提升 - 业务价值：品类 BSR 徽章年化带来流量增
三轨验证 | 成本轨：月均成本1,200元（A9算法数据分析工具600元/月+人工优化12小时/月×100元/小时），ROI周期2个月 | 合规轨：符合《跨境电商平台商品信息规范》和亚马逊A9搜索政策，需备案商品关键词库和优化日志，合规度95% | 风险轨：关键词堆砌被降权（概率12%）、算法更新导致流量波动（概率18%）、竞品恶意举报（概率8%）
**三轨验证** | 成本轨：月均成本2,800元（专业SEO团队外包2,000元/月+A9工具订阅800元/月），ROI周期1.5个月 | 合规轨：需通过第三方合规审计，获得《跨境电商搜索优化合规证书》，符合eBay、Wish等多平台政策，合规度98% | 风险轨：外包团队泄露商业数据（概率6%）、优化手段被平台识别为作弊（概率5%）、流量增长不达预期（概率15%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：获得细分品类 BSR 徽章 → CTR 提升 8-12% → 年化流量增量 5-10 万元
实施难度：⭐⭐☆☆☆（主要是调研和 Case 申请，无技术门槛）
优先级：⭐⭐⭐⭐☆（新品必做，成熟品若无 BSR 也应执行）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（102 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from typing import List, Dict, Optional
import math

def compute_node_score(
    demand_index: float,
    n_products: int,
    bsr_threshold_difficulty: float,
    alpha: float = 0.5,
    beta: float = 0.4,
    gamma: float = 0.1
) -> float:
    """
    计算品类节点选择得分
    demand_index: 月搜索量指数（归一化 0-100）
    n_products: 该节点产品数
    bsr_threshold_difficulty: 进入 BSR Top 100 的难度（0=容易, 1=极难）
    """
    demand_score = alpha * math.log1p(demand_index)
    competition_penalty = beta * math.log1p(n_products)
    bsr_score = gamma * (1 - bsr_threshold_difficulty)
    
    return round(demand_score - competition_penalty + bsr_score, 4)

def compute_density(n_products: int, demand_index: float) -> float:
    """竞争密度：产品数/需求指数"""
    if demand_index <= 0:
        return float('inf')
    return round(n_products / demand_index, 2)

def analyze_category_nodes(nodes: pd.DataFrame) -> pd.DataFrame:
    """分析品类节点，计算各节点竞争度和机会得分"""
    df = nodes.copy()
    
    df["competition_density"] = df.apply(
        lambda r: compute_density(r["n_products"], r["demand_index"]), axis=1
    )
    df["node_score"] = df.apply(
        lambda r: compute_node_score(
            r["demand_index"], r["n_products"], r["bsr_difficulty"]
        ), axis=1
    )
    
    # 分类
    def categorize(row):
        if row["node_score"] > 0.3 and row["competition_density"] < 10:
            return "GOLDEN_NICHE"     # 黄金细分
        elif row["node_score"] > 0.1:
            return "OPPORTUNITY"      # 机会节点
        elif row["demand_index"] > 50:
            return "HIGH_DEMAND_COMPETITIVE"  # 高需求高竞争
        else:
            return "LOW_PRIORITY"
    
    df["strategy"] = df.apply(categorize, axis=1)
    return df.sort_values("node_score", ascending=False)

def recommend_node_placement(df: pd.DataFrame, max_nodes: int = 3) -> Dict:
    """推荐最优节点布局方案"""
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2005.12345。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：目标品类树结构（父/子节点层级）、各节点产品数量、月销估算与进入 BSR Top 100 的难度口径、节点需求指数（月搜索量指数，归一化 0-100）；粒度为品类节点。

**输出**：各节点机会得分与竞争密度排序、节点分类（黄金细分/机会节点/高需求高竞争/低优先）、最多 3 个推荐节点布局方案与申请 Browse Node ID 的行动清单；供选品与站点运营使用。

## 执行步骤

1. 拉取目标品类树结构及各节点产品数与月销估算数据
2. 计算各节点竞争密度（产品数/需求指数）与机会得分
3. 把节点分为黄金细分、机会节点、高需求高竞争、低优先四类
4. 选定 1-3 个最低竞争的精准子节点，同时保留父节点实现多节点覆盖
5. 提交 Browse Node ID 添加申请并跟踪 BSR 徽章与 CTR 变化

## 边界与不做

- 数据不满足：拿不到各节点产品数与月销估算时竞争密度算不出来，先用调研数据补齐再做决策。
- 何时不用：要判断的是关键词层面的高需求低竞争蓝海词，而非品类节点归属，用「关键词需求缺口矩阵分析」。
- 能力边界：只做节点分析与申请清单，不代提交平台 Case；卡页的首月 BSR 均值 +40%、CTR 提升 8-12% 为案例口径，且操作须符合平台商品信息规范。

## 技能关联

- **前置**：Skill-A9-Algorithm-Sales-Velocity-Optimization.html、Skill-A9-Algorithm-Sales-Velocity-Optimization、Skill-Amazon-Search-Ranking-Factor-Model.html、Skill-Amazon-Search-Ranking-Factor-Model、Skill-Brand-Defense-Search-Strategy.html、Skill-Brand-Defense-Search-Strategy、Skill-Competitor-Keyword-Gap-Analysis.html、Skill-Competitor-Keyword-Gap-Analysis、Skill-Listing-Semantic-Relevance-Scoring.html、Skill-Listing-Semantic-Relevance-Scoring、Skill-Seasonal-Keyword-Rotation-Strategy.html、Skill-Seasonal-Keyword-Rotation-Strategy、Skill-Tag-Propagation-Supply-Chain.html、Skill-Tag-Propagation-Supply-Chain、Skill-TagRAG-Hierarchical-Label-KG.html、Skill-TagRAG-Hierarchical-Label-KG
- **延伸**：Skill-A9-Algorithm-Sales-Velocity-Optimization.html、Skill-A9-Algorithm-Sales-Velocity-Optimization、Skill-Brand-Defense-Search-Strategy.html、Skill-Brand-Defense-Search-Strategy、Skill-Competitor-Keyword-Gap-Analysis.html、Skill-Competitor-Keyword-Gap-Analysis、Skill-Seasonal-Keyword-Rotation-Strategy.html、Skill-Seasonal-Keyword-Rotation-Strategy、Skill-Tag-Propagation-Supply-Chain.html、Skill-Tag-Propagation-Supply-Chain、Skill-TagRAG-Hierarchical-Label-KG.html、Skill-TagRAG-Hierarchical-Label-KG
- **可组合**：Skill-Competitor-Keyword-Gap-Analysis.html、Skill-Competitor-Keyword-Gap-Analysis、Skill-Seasonal-Keyword-Rotation-Strategy.html、Skill-Seasonal-Keyword-Rotation-Strategy、Skill-Tag-Propagation-Supply-Chain.html、Skill-Tag-Propagation-Supply-Chain、Skill-TagRAG-Hierarchical-Label-KG.html、Skill-TagRAG-Hierarchical-Label-KG、Skill-Category-Tree-Placement-Optimizer

---

> 分类：业务运营/渠道经营/商品诊断　·　技术族：25-搜索流量工程　·　源卡：`Skill-Category-Tree-Placement-Optimizer`