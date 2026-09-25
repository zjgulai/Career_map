---
name: "p2s-amazon-search-ranking-factor-model"
title: "Amazon 搜索排名因子权重建模 — 用 LightGBM+SHAP 解构 A9/A10 算法"
description: "触发词：排名因子建模、排名下滑归因、SHAP 因子权重、搜索曝光提升、关键词排名诊断。何时不用：只需找出竞品有排名而自家未覆盖的词时用「竞品关键词缺口分析」；要按意图或月龄给搜索词分桶投广告时用「搜索层次化意图分类」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-065"
l3_business: "商品诊断"
l3_all: "商品诊断 / 搜索意图分析"
l1_l2_l3: "业务运营/渠道经营/商品诊断"
p2s_card_id: "Skill-Amazon-Search-Ranking-Factor-Model"
p2s_src_domain: "25-搜索流量工程"
quality_tier: "preview"
user_summary: "把关键词排名下滑拆成可量化的因子权重，看清到底是转化、库存还是评论拖了后腿，再定向把排名拉回来。"
user_try: "试试：分析「electric breast pump」这个词下我的 ASIN 为什么从第 2 页掉到第 4 页，并按因子重要性列出短板。"
whenToUse: "当某个关键词下自家 ASIN 排名下滑、需要量化各因子（CVR/CTR/销量速度/评论综合分/库存可用率/Listing 完整度/关键词相关性）的贡献并定位短板时用本技能；若要找的是竞品有排名而自己没覆盖的词，用「竞品关键词缺口分析」；若要判断查询属于哪个意图桶以分流广告，用「搜索层次化意图分类」。"
workflow: "采集 90 天竞品与自家 ASIN 的每日排名、BSR、评论与评分快照 → 构建因子矩阵并训练排名模型 → 用 SHAP 归因定位自家 ASIN 的短板因子 → 输出恢复策略并复盘排名与 GMV 变化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Amazon 搜索排名因子权重建模 — 用 LightGBM+SHAP 解构 A9/A10 算法

## ① 解决的问题

运营负责人面临"目标关键词卡在第3页无法突破"——LightGBM+SHAP排名因子建模将自然搜索曝光量提升3倍，年化GMV增量$21.6万

## ② 核心算法逻辑

A9/A10 是 Amazon 的搜索排名算法，综合多维度信号决定 ASIN 在关键词下的自然位置。核心因子权重：

## ③ 业务应用场景

运营发现「electric breast pump」关键词下，主力 ASIN 从第 2 页跌至第 4 页，自然流量下降 60%。
- 业务问题：排名下滑原因不明，无法定向优化 - 数据要求：过去 90 天各竞品 ASIN 的排名快照（每日）、BSR 数据、评论数、评分、预估销量 - 执行步骤：构建因子矩阵 → LightGBM 训练排名模型 → SHAP 分析本 ASIN 短板 - 预期产出：发现 CVR 下降 8%（竞品上新更低价）是主因，库存断货 3 天是次因 - 业务价值：针对性恢复策略（补货 + 限时折扣），排名从第 4 页提升到第 1.5 页，月 GMV 增加 $2.8 万
新品上架前，预测在「baby bottle」竞争词下能在多少天内排进第 1 页。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：定向优化短板因子后，目标词排名平均提升 1.5 页，自然流量增加 35%，月均 GMV 增量 $3.2 万（以吸奶器品类均价 $89 测算）
实施难度：⭐⭐⭐☆☆（需要竞品数据抓取能力，3-5 天建立数据管道）
优先级：⭐⭐⭐⭐⭐（搜索是 Amazon 70%+ 流量来源，P0 核心能力）
评估依据：头部卖家平均 7 个月收回数据基础设施成本，长期 ROI > 500%；竞品抓取工具成本约 $200/月，收益远超投入

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（129 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/amazon_search_ranking_factor_model` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/25-搜索流量工程/Skill-Amazon-Search-Ranking-Factor-Model.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple

# ─────────────────────────────────────────────
# Amazon 搜索排名因子建模（LightGBM + SHAP 可解释）
# 无需外部文件，内置模拟数据
# ─────────────────────────────────────────────

# 模拟 ASIN 在某关键词下的因子数据（30 个竞品 × 历史 10 天）
np.random.seed(42)
N_ASINS = 30

def generate_asin_factors(n: int) -> pd.DataFrame:
    """生成模拟的 ASIN 排名因子数据"""
    data = {
        "asin": [f"B0{str(i).zfill(8)}" for i in range(n)],
        # 转化率 (0.02-0.25)
        "cvr": np.random.beta(2, 15, n).clip(0.02, 0.30),
        # 点击率 (0.01-0.15)
        "ctr": np.random.beta(1.5, 15, n).clip(0.01, 0.20),
        # 销量速度（近30天单日均销量）
        "sales_velocity": np.random.lognormal(3.0, 0.8, n).clip(1, 500),
        # Review 综合分 = rating × log1p(review_count)
        "review_score": np.random.uniform(3.5, 5.0, n) * np.log1p(np.random.randint(10, 5000, n)),
        # 库存可用率 (FBA in-stock rate 近30天)
        "inventory_rate": np.random.beta(8, 2, n).clip(0.3, 1.0),
        # Listing 完整度评分 (0-1)
        "listing_completeness": np.random.beta(5, 2, n).clip(0.3, 1.0),
        # 关键词相关性得分 (TF-IDF proxy)
        "keyword_relevance": np.random.beta(3, 2, n).clip(0.1, 1.0),
    }
    df = pd.DataFrame(data)
    
    # 模拟真实排名（综合因子加权，加噪声）
    score = (
        df["cvr"] * 0.35 +
        df["ctr"] * 0.20 +
        np.log1p(df["sales_velocity"]) / 10 * 0.25 +
        df["review_score"] / df["review_score"].max() * 0.10 +
        df["inventory_rate"] * 0.05 +
        df["keyword_relevance"] * 0.05
    )
    noise = np.random.normal(0, 0.02, n)
    df["rank_score"] = (score + noise).clip(0, 1)
    df["rank"] = df["rank_score"].rank(ascending=False).astype(int)
    return df.sort_values("rank")


def train_ranking_model(df: pd.DataFrame) -> Tuple:
    """训练 LightGBM 排名模型（不依赖 lightgbm 时用线性代理）"""
    feature_cols = ["cvr", "ctr", "sales_velocity", "review_score",
                    "inventory_rate", "listing_completeness", "keyword_relevance"]
    
    X = df[feature_cols].values
    y = df["rank"].values
    
    # 简化版：用相关系数作为"因子重要性"代理（生产环境替换为 lgb.train）
    from numpy.linalg import lstsq
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1706.03762，但该号在 arXiv 上是《Attention Is All You Need》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：目标关键词与对应 ASIN 清单；过去 90 天每日的竞品与自家 ASIN 排名快照、BSR、评论数、评分、预估销量；粒度为 ASIN × 关键词 × 日，汇总成因子矩阵（CVR、CTR、销量速度、评论综合分、库存可用率、Listing 完整度、关键词相关性）。

**输出**：因子重要性排序与单个 ASIN 的 SHAP 短板归因、排名提升路径预测（多久可进 Page1）；结果为结构化表格，供搜索运营与 Listing 优化人员定向恢复排名。

## 执行步骤

1. 拉取目标关键词下自家与竞品的每日排名、BSR、评论数、评分与预估销量
2. 把数据整理成 ASIN × 关键词因子矩阵（CVR/CTR/销量速度/评论分/库存可用率/Listing 完整度/关键词相关性）
3. 用 LightGBM 训练排名模型，再用 SHAP 分解各因子对当前排名的贡献
4. 定位自家短板因子（如 CVR 下滑、库存断货）并给出针对性恢复策略
5. 对新品做上架前排期预测，估算在竞争词下进入第 1 页所需时间

## 边界与不做

- 数据不满足：拿不到竞品每日排名快照、BSR 或预估销量时无法构建因子矩阵，不要硬做归因，先补齐数据管道（卡页口径需 3-5 天建管道）。
- 何时不用：只是要找出竞品有排名而自己未覆盖的词，用「竞品关键词缺口分析」；要按意图/月龄给搜索词分桶投广告，用「搜索层次化意图分类」。
- 能力边界：只输出因子权重与归因结论，不代改标题、不自动调广告出价；卡页的曝光 3 倍、年化 GMV 增量 $21.6 万、月 GMV +$3.2 万均为案例口径，不是承诺。

## 技能关联

- **前置**：Skill-Ad-Aware-Recommendation.html、Skill-Ad-Aware-Recommendation、Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-NeuralNDCG-Learning-to-Rank.html、Skill-NeuralNDCG-Learning-to-Rank、Skill-SKU-Entity-Unified-ID-Tagging.html、Skill-SKU-Entity-Unified-ID-Tagging、Skill-Tag-Schema-Engineering-Lifecycle.html、Skill-Tag-Schema-Engineering-Lifecycle
- **延伸**：Skill-Ad-Aware-Recommendation.html、Skill-Ad-Aware-Recommendation、Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-SKU-Entity-Unified-ID-Tagging.html、Skill-SKU-Entity-Unified-ID-Tagging、Skill-Tag-Schema-Engineering-Lifecycle.html、Skill-Tag-Schema-Engineering-Lifecycle
- **可组合**：Skill-Ad-Aware-Recommendation.html、Skill-Ad-Aware-Recommendation、Skill-SKU-Entity-Unified-ID-Tagging.html、Skill-SKU-Entity-Unified-ID-Tagging、Skill-Tag-Schema-Engineering-Lifecycle.html、Skill-Tag-Schema-Engineering-Lifecycle、Skill-Amazon-Search-Ranking-Factor-Model

---

> 分类：业务运营/渠道经营/商品诊断　·　技术族：25-搜索流量工程　·　源卡：`Skill-Amazon-Search-Ranking-Factor-Model`