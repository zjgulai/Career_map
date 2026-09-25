---
name: "p2s-hijacker-seller-network-analysis"
title: "Hijacker Seller Network Analysis — 跟卖卖家网络图谱识别有组织的跟卖集团"
description: "触发词：跟卖集团识别、卖家网络图谱、社群发现、共享图片取证、批量举报。何时不用：只做单次 Buy Box 劫持的分钟级告警时用「Buy Box 劫持实时监控」；只给单个 ASIN 算卖家风险分时用「Listing 劫持网络检测」。安全边界：只输出集团识别与证据整理，不代平台举报、不作法律定性。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-065"
l3_business: "商品诊断"
l3_all: "商品诊断 / 安全事件处理 / 申诉材料准备"
l1_l2_l3: "业务运营/渠道经营/商品诊断"
p2s_card_id: "Skill-Hijacker-Seller-Network-Analysis"
p2s_src_domain: "19-风控反欺诈"
quality_tier: "preview"
user_summary: "把处理完又换号回来的跟卖账号串成一张网，一次举报整个集团，而不是一个个打地鼠。"
user_try: "试试：分析这批跟卖卖家记录，看哪些账号可能同属一个集团，并整理出共享图片等证据。"
whenToUse: "当跟卖打掉一个又冒一个、需要按共享 ASIN/图片/定价把账号聚成集团并一次性举报时用本技能；若只要单次劫持的分钟级告警，用「Buy Box 劫持实时监控」；只要单 ASIN 的卖家风险分与评论聚类，用「Listing 劫持网络检测」。"
workflow: "汇总跟卖卖家记录（Seller ID/ASIN/图片/价格/时间） → 按共同 ASIN、共享图片与价格相似度建邻接矩阵 → 用连通分量或社群发现切出跟卖集团 → 整理集团证据并一次性举报"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Hijacker Seller Network Analysis — 跟卖卖家网络图谱识别有组织的跟卖集团

## ① 解决的问题

品牌方面临"跟卖处理完一个3天后换号再来无法从根源解决"——跟卖集团图谱分析一次性向Amazon举报12人集团，Buy Box损失率从35%降至8%，年化保护GMV 50-100万元

## ② 核心算法逻辑

论文：Fast unfolding of communities in large networks (Louvain method) | 年份：2008

## ③ 业务应用场景

场景：某母婴品牌旗舰 ASIN 持续遭遇跟卖，处理完一个 3 天后又出现新的，发现这些跟卖卖家都来自同一供应商（共享产品图片）。图谱分析识别出 12 个账号组成的集团。
数据要求：跟卖卖家 Seller ID、ASIN 跟卖时间记录、产品图片 URL（Keepa 历史）、价格历史。
应用：一次性向 Amazon 举报整个 12 人集团，成功率从单个举报的 60% 提升至 85%，处理周期从 3 周缩短至 1 周。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

50-100 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（95 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from collections import defaultdict

def build_hijacker_graph(
    hijacker_records: list,  # [{'seller_id': str, 'asin': str, 'image_hash': str, 'price': float, 'date': int}]
) -> dict:
    """
    构建跟卖卖家图谱
    返回相似度邻接矩阵和卖家列表
    """
    sellers = list({r['seller_id'] for r in hijacker_records})
    n = len(sellers)
    sid_idx = {s: i for i, s in enumerate(sellers)}

    # 构建特征字典
    seller_asins = defaultdict(set)
    seller_images = defaultdict(set)
    seller_prices = defaultdict(list)

    for r in hijacker_records:
        sid = r['seller_id']
        seller_asins[sid].add(r['asin'])
        seller_images[sid].add(r.get('image_hash', ''))
        seller_prices[sid].append(r['price'])

    # 构建相似度矩阵
    adjacency = np.zeros((n, n))
    for i, s1 in enumerate(sellers):
        for j, s2 in enumerate(sellers):
            if i >= j:
                continue
            score = 0
            # 共同跟卖的 ASIN 数量
            common_asins = seller_asins[s1] & seller_asins[s2]
            score += len(common_asins) * 2
            # 共同图片
            common_imgs = seller_images[s1] & seller_images[s2]
            score += len(common_imgs - {''}) * 5
            if score > 0:
                adjacency[i, j] = adjacency[j, i] = score

    # 简化版聚类（连通分量）
    def find_clusters(adj, threshold=2):
        n = len(adj)
        visited = [False] * n
        clusters = []

        def dfs(node, cluster):
            visited[node] = True
            cluster.append(node)
            for neighbor in range(n):
                if not visited[neighbor] and adj[node, neighbor] >= threshold:
                    dfs(neighbor, cluster)

        for i in range(n):
            if not visited[i]:
                cluster = []
                dfs(i, cluster)
                clusters.append(cluster)
        return clusters
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1810.05997，但该号在 arXiv 上是《Predict then Propagate: Graph Neural Networks meet Personalized PageRank》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Fast unfolding of communities in large networks (Louvain method)》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：跟卖卖家 Seller ID、ASIN 跟卖时间记录、卖家上传的产品图片 URL 或 hash（Keepa 历史）、价格历史；粒度为卖家 × ASIN × 时间。

**输出**：卖家相似度邻接矩阵与聚类出的集团名单（卡页案例识别出 12 个账号组成的集团）、每组的共同特征（共享 ASIN/图片/定价）与举报材料清单；供品牌保护与申诉材料准备使用。

## 执行步骤

1. 汇总跟卖卖家记录：Seller ID、ASIN、图片 hash、价格与时间
2. 按共同跟卖 ASIN、共享图片与价格相似度构建卖家相似度邻接矩阵
3. 用连通分量或社群发现（Louvain）切出跟卖集团
4. 为每个集团整理共同证据（共享图片、同步换号时间线）
5. 一次性向平台举报整个集团，并跟踪处理周期与 Buy Box 损失率

## 边界与不做

- 数据不满足：没有图片历史（Keepa）或跟卖时间记录时算不出相似度，图谱会退化成孤立点，先补历史数据。
- 何时不用：只是要分钟级告警单次 Buy Box 劫持并出 C&D 草稿，用「Buy Box 劫持实时监控」；只想给单个 ASIN 算卖家风险分与评论网络聚类，用「Listing 劫持网络检测」。
- 能力边界：只输出集团识别与证据整理，不代平台举报、不做法律定性；卡页的举报成功率 60%→85%、Buy Box 损失率 35%→8% 为案例口径。

## 技能关联

- **可组合**：Skill-Hijacker-Seller-Network-Analysis

---

> 分类：业务运营/渠道经营/商品诊断　·　技术族：19-风控反欺诈　·　源卡：`Skill-Hijacker-Seller-Network-Analysis`