---
name: "p2s-shopee-lazada-sea-market-intelligence"
title: "东南亚市场情报与选品分群 — Shopee/Lazada 热搜词 + K-Means 价格带定位"
description: "触发词：东南亚选品、价格带定位、Shopee、Lazada、市场分群。何时不用：估算品类整体容量用「Market Size Estimation」；判断品类所处生命周期阶段用「Product Lifecycle Stage」。安全边界：Shopee 反爬协议禁止未授权自动化抓取，须用官方 API 或合规数据供应商；只收集公开商品信息，不采集用户个人数据。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-022"
l3_business: "市场机会评估"
l3_all: "市场机会评估 / 市场进入 / 价格敏感性"
l1_l2_l3: "业务运营/产品与创新/市场机会评估"
p2s_card_id: "Skill-Shopee-Lazada-SEA-Market-Intelligence"
p2s_src_domain: "14-用户分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把 Shopee、Lazada 的热销商品按价格、销量、评分聚成价格带，看清某个定价落在哪一层，再决定硬打主流带还是做差异化。"
user_try: "试试：把 Shopee 菲律宾 baby bottle 的 Top 200 商品做价格带分群，看 18 美元落在哪一层、该怎么定价。"
whenToUse: "要进入东南亚某个国家、需要知道主力价格带与竞争密度时用本技能；若要估算品类整体容量，用「Market Size Estimation」；若要判断品类处于哪个生命周期阶段，用「Product Lifecycle Stage」。"
workflow: "采集目标国家站点的 Top 200 商品价格、月销量、评分与主图风格 → 标准化特征并用 K-Means 分群 → 识别各价格带的商品数量与头部市占率 → 定位目标价点所属分群并评估竞争密度 → 输出差异化入市与定价建议，或对比两国的市场机会矩阵"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 东南亚市场情报与选品分群 — Shopee/Lazada 热搜词 + K-Means 价格带定位

## ① 解决的问题

东南亚选品负责人面临"不知道Shopee哪个国家哪个价格带最有机会"——K-means市场聚类将最优价格带定位精度提升至87%，新品首月GMV超预期35%

## ② 核心算法逻辑

核心思想：东南亚各国母婴市场在价格敏感度、品牌认知和本地监管上差异巨大（新加坡 vs 菲律宾 vs 泰国价格带相差 35 倍）。用 KMeans 聚类对 Shopee/Lazada 热销商品按「价格区间 × 月销量 × 评分」三维特征进行分群，识别每个市场的主力价格带和竞争密度，为选品定价和差异化入市提供数据依据。

## ③ 业务应用场景

场景A：婴儿奶瓶进入菲律宾 Shopee 的价格带定位 - 业务问题：品牌方准备把 Amazon 上 $18 的奶瓶打入菲律宾 Shopee，但不知道 $18 在菲律宾是哪个竞争层，是否需要重新定价或推出差异化版本。 - 数据要求：Shopee 菲律宾「baby bottle」Top 200 商品的价格/月销量/评分/主图风格 - 预期产出： - K-Means 分群（通常 3-4 群：低端大众、中端主流、高端精品、进口溢价） - $18 价格点落在哪个群，该群的竞争密度（商品数量/头部市占率） - 差异化入市建议：是硬打主流价格带，还是定位「进口溢价」细分群 - 业务价值：精准定价避免直面低
三轨验证： - 成本：数据采集需购买 Shopee 爬虫服务或第三方数据 API（如 DataHive、SimilarWeb），月费约 2000-5000 元；计算资源几乎免费（单次 K-Means 在笔记本上秒级完成）；人力投入约 2-3 天（数据清洗 + 聚类调参 + 报告撰写）。 - 合规：Shopee 反爬协议禁止未经授权的自动化数据抓取，需使用官方 API 或合规数据供应商；不涉及 GDPR（东南亚非欧盟区域），但需遵守菲律宾《数据隐私法》（RA 10173）——仅收集公开商品信息，不涉及用户个人数据，风险较低。 - 风险：若公开定价策略（如直接对标竞品价格带），可能引发竞品价格战，
场景B：泰国 vs 马来西亚母婴品类机会对比 - 业务问题：新财年扩张 1 个东南亚国家，泰国和马来西亚哪个市场机会更大？ - 数据要求：两个国家的婴儿推车/学步鞋/奶瓶三品类的市场数据 - 预期产出：市场机会矩阵（市场规模 × 竞争密度 × 价格带匹配度），推荐优先进入市场 - 业务价值：正确选国家可节省 3-6 个月试错成本，年化战略价值约 100 万元以上

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：精准定价策略避免直面低价内卷，进口溢价群平均净利率比中端群高 15-20%；正确选择国家市场节省 3-6 个月试错成本，年化战略价值约 80-150 万元
实施难度：⭐⭐☆☆☆（数据依赖爬虫或第三方数据服务，K-Means 算法标准化，sklearn 实现成本极低）
优先级评分：⭐⭐⭐⭐☆
评估依据：东南亚母婴市场 2025-2026 年是最重要的增量市场，但 SEA 内部差异极大，不做国家级市场情报直接入市会导致选品/定价严重偏差；该工具复用成本极低（换品类/换国家几分钟）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（191 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 56）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/user_analytics/shopee_lazada_sea_market_intelligence` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-Shopee-Lazada-SEA-Market-Intelligence.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
东南亚 Shopee/Lazada 市场情报 K-Means 分群分析
- 输入：商品价格/销量/评分数据（从爬虫或 API 获取）
- 输出：市场分群、价格带定位、竞争密度分析
"""

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
from typing import Dict, List, Tuple


# ── 1. 模拟 Shopee 菲律宾婴儿奶瓶市场数据 ──────────────────────
def generate_sea_market_data(
    country: str = "Philippines",
    category: str = "baby_bottle",
    n_products: int = 200,
    seed: int = 42,
) -> pd.DataFrame:
    """生成模拟的东南亚电商市场数据（真实场景从爬虫获取）"""
    np.random.seed(seed)
    
    # 模拟三个价格层次（低/中/高）
    low_n, mid_n, high_n = 80, 90, 30
    
    prices = np.concatenate([
        np.random.uniform(1.5, 6.0, low_n),    # 低端：$1.5-6 (PH peso × 0.018)
        np.random.uniform(6.0, 15.0, mid_n),   # 中端：$6-15
        np.random.uniform(15.0, 35.0, high_n), # 高端：$15-35
    ])
    monthly_sales = np.concatenate([
        np.random.randint(500, 5000, low_n),   # 低端高销量
        np.random.randint(100, 1500, mid_n),
        np.random.randint(10, 200, high_n),    # 高端低销量
    ])
    ratings = np.concatenate([
        np.random.uniform(3.5, 4.5, low_n),
        np.random.uniform(4.0, 4.8, mid_n),
        np.random.uniform(4.2, 5.0, high_n),
    ])
    
    df = pd.DataFrame({
        "商品名": [f"{category}_{i:03d}" for i in range(n_products)],
        "价格_USD": prices.round(2),
        "月销量":   monthly_sales,
        "评分":     ratings.round(1),
        "国家":     country,
        "品类":     category,
    })
    return df.sample(frac=1, random_state=seed).reset_index(drop=True)


# ── 2. K-Means 分群 ────────────────────────────────────────────
def kmeans_market_segmentation(
    df: pd.DataFrame,
    n_clusters: int = None,
    max_k: int = 6,
) -> Tuple[pd.DataFrame, KMeans, int]:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2404.09733，但该号在 arXiv 上是《Semiconductor Devices Condition Monitoring Using Harmonics in Inverter Control Variables》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：目标国家站点（如 Shopee 菲律宾）某品类的 Top 200 商品数据：价格、月销量、评分、主图风格；做多国对比时需两个国家的同类目数据。

**输出**：K-Means 价格带分群（如低端大众 / 中端主流 / 高端精品 / 进口溢价）、目标价点所属分群与竞争密度、差异化入市建议，或市场规模×竞争密度×价格带匹配度的国别机会矩阵。

## 执行步骤

1. 采集目标站点的商品价格、销量与评分数据
2. 标准化特征并做 K-Means 分群
3. 计算各价格带的商品数量与头部市占率
4. 定位目标价点所属分群并评估竞争
5. 输出定价与差异化入市建议

## 边界与不做

- 拿不到合规的商品价格与销量数据时不适用，聚类结果会被样本偏差主导
- 分群给出的是价格带与竞争格局，不含物流成本、关税与本地监管门槛
- 禁止使用未授权的自动化抓取，只收集公开商品信息、不采集用户个人数据

## 技能关联

- **前置**：Skill-Clickstream-Persona-Pipeline.html、Skill-Clickstream-Persona-Pipeline、Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Cross-Platform-Listing-Sync-Optimizer.html、Skill-Cross-Platform-Listing-Sync-Optimizer、Skill-Multi-Platform-Ad-Budget-Allocator.html、Skill-Multi-Platform-Ad-Budget-Allocator
- **延伸**：Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Cross-Platform-Listing-Sync-Optimizer.html、Skill-Cross-Platform-Listing-Sync-Optimizer、Skill-Multi-Platform-Ad-Budget-Allocator.html、Skill-Multi-Platform-Ad-Budget-Allocator
- **可组合**：Skill-Cross-Platform-Listing-Sync-Optimizer.html、Skill-Cross-Platform-Listing-Sync-Optimizer、Skill-Multi-Platform-Ad-Budget-Allocator.html、Skill-Multi-Platform-Ad-Budget-Allocator、Skill-Shopee-Lazada-SEA-Market-Intelligence

---

> 分类：业务运营/产品与创新/市场机会评估　·　技术族：14-用户分析　·　源卡：`Skill-Shopee-Lazada-SEA-Market-Intelligence`