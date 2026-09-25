---
name: "p2s-graph-attention-network-recommendation"
title: "Graph Attention Network Recommendation — 图注意力网络推荐：动态权重的高精度图推荐"
description: "触发词：图注意力网络、GAT 推荐、邻居权重、注意力可视化、交叉销售精度、NDCG 对比。何时不用：只要一版图卷积基线推荐用「GNN Ecommerce Recommendation」，只挑互补捆绑组合用「Bundle Recommendation Complementary」；本技能解决的是邻居权重该有高有低而不是一视同仁。安全边界：注意力解释输出须人工复核，不能替代合规认证；模型不直接覆盖线上推荐位。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-079"
l3_business: "组合设计"
l3_all: "组合设计 / 转化优化"
l1_l2_l3: "业务运营/渠道经营/组合设计"
p2s_card_id: "Skill-Graph-Attention-Network-Recommendation"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "让推荐系统学会分辨哪些配套关系更值钱——比如买吸奶器后买储奶袋的概率远高于汽车座椅，并把权重分布讲清楚。"
user_try: "试试：我们的推荐给「婴儿汽车座椅」和「储奶袋」同样权重，帮我用图注意力模型重算，看能不能把储奶袋的权重提上来，并给出注意力权重分布。"
whenToUse: "已有用户购买序列与商品属性（卡页建议 ≥10 万用户交互），需要动态学习邻居权重、把精度做到高于 LightGCN 并要权重可解释时用；只要一版图卷积基线用「GNN Ecommerce Recommendation」，只挑互补捆绑组合用「Bundle Recommendation Complementary」。"
workflow: "汇总用户购买序列与商品属性（品类／价格／评分） → 按 30 天半衰期的时序衰减与品类相关性算邻居注意力权重 → 对权重做 softmax 归一化后聚合邻居嵌入 → 训练 GAT 得到用户与商品嵌入 → 输出注意力权重可视化并与 LightGCN 对比 NDCG@10／Recall@20"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Graph Attention Network Recommendation — 图注意力网络推荐：动态权重的高精度图推荐

## ① 解决的问题

LightGCN推荐对吸奶器和汽车座椅给予相同权重但实际购买吸奶器后买储奶袋概率是汽车座椅8倍——GAT图注意力机制动态学习邻居权重，推荐精度比LightGCN提升8-15%配件交叉销售客单价提升10-20%

## ② 核心算法逻辑

LightGCN vs GAT 的区别：

## ③ 业务应用场景

业务问题：用户购买吸奶器后，推荐系统建议"婴儿汽车座椅"和"储奶袋"各有 50% 的权重（因为都是母婴品类）。但实际上购买吸奶器的用户在 30 天内购买储奶袋的概率是汽车座椅的 8 倍。GAT 的注意力机制会学到这种品类相关性，给储奶袋更高权重。
数据要求： - 用户购买序列（user_id, product_id, timestamp） - 商品属性（品类/价格/评分） - 建议样本量：≥ 10 万用户交互
预期产出： - GAT 模型：用户和商品嵌入（64维） - 注意力权重可视化：某商品对某用户推荐的权重分布 - 与 LightGCN 的性能对比（NDCG@10/Recall@20）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
推荐精度提升 8-15%（vs LightGCN）：月增 GMV ¥3-10 万
配件交叉销售提升：客单价提升 10-20%
注意力权重可解释性：满足 EU AI Act 推荐解释要求
年化综合 ROI：¥15-40 万
实施难度：⭐⭐⭐⭐☆（PyG/DGL 框架；需要 GPU 训练；完整实现约 6-8 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（179 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/knowledge_graph/graph_attention_network_recommendation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-Graph-Attention-Network-Recommendation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Graph Attention Network Recommendation
GAT图注意力推荐：动态权重的高精度图推荐
简化版（生产用PyG/DGL框架）
"""
import numpy as np
from collections import defaultdict


class SimpleGATRecommender:
    """
    简化的 GAT 推荐器（不需要 PyTorch）
    生产代码:
    from torch_geometric.nn import GATConv
    class GATRec(torch.nn.Module):
        def __init__(self, in_channels, out_channels, heads=4):
            super().__init__()
            self.gat = GATConv(in_channels, out_channels, heads=heads)
    """

    def __init__(self, embed_dim: int = 32, n_heads: int = 4):
        self.embed_dim = embed_dim
        self.n_heads = n_heads
        self.user_emb = {}
        self.item_emb = {}
        self.attention_weights = defaultdict(dict)

    def _compute_attention(self, user_history: list, item_features: dict) -> dict:
        """
        计算用户历史中各商品的注意力权重（简化版）
        考虑时序衰减 + 品类相关性
        """
        if not user_history:
            return {}

        weights = {}
        max_ts = max(ts for _, ts in user_history)

        for item_id, timestamp in user_history:
            # 时序衰减
            days_ago = (max_ts - timestamp) / 86400
            time_weight = np.exp(-days_ago / 30)  # 30天半衰期

            # 品类相似度（同品类权重更高）
            cat = item_features.get(item_id, {}).get('category', '')
            cat_weight = 1.0  # 简化：实际应计算品类对相似度

            weights[item_id] = time_weight * cat_weight

        # Softmax 归一化
        total = sum(weights.values())
        return {k: v / total for k, v in weights.items()} if total > 0 else weights

    def fit(self, interactions: list, item_features: dict, epochs: int = 10):
        """
        训练 GAT 推荐器
        interactions: [(user_id, item_id, timestamp), ...]
        """
        np.random.seed(42)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.09234，但该号在 arXiv 上是《Determination of the distance from a projection to nilpotents》，与本卡主题无关。
⚠️ 该号被 4 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：用户购买序列数据：user_id、product_id、timestamp（用于算时序衰减）；商品侧要品类／价格／评分属性；卡页建议样本量 ≥10 万用户交互。模型参数为模板与生产两档口径：简化版 embed_dim 32、n_heads 4，卡页生产产出为 64 维用户与商品嵌入。

**输出**：用户与商品级产出：GAT 用户／商品嵌入（卡页口径 64 维）、某商品对某用户推荐的注意力权重分布（可可视化），以及与 LightGCN 的 NDCG@10／Recall@20 性能对比；供推荐算法选型与需要推荐解释的合规场景使用。

## 执行步骤

1. 整理用户购买序列与商品品类／价格／评分属性
2. 按 30 天半衰期的时序衰减与品类相关性算邻居注意力权重
3. softmax 归一化后聚合邻居嵌入
4. 训练 GAT 得到用户与商品嵌入
5. 可视化注意力权重并与 LightGCN 对比 NDCG@10／Recall@20

## 边界与不做

- 数据不满足：交互量少于卡页建议的 ≥10 万条，或缺 timestamp 与商品属性时不要用——注意力权重学不稳，退回「GNN Ecommerce Recommendation」的图卷积基线。
- 何时不用：只需要一版图卷积基线推荐用「GNN Ecommerce Recommendation」，只挑互补捆绑组合用「Bundle Recommendation Complementary」。
- 能力边界：只做图注意力建模、嵌入与权重解释，不负责定价、套餐上架与广告投放；实施需 PyG／DGL 与 GPU 训练（卡页口径约 6-8 周）。
- 安全边界：注意力可解释性对应卡页提到的 EU AI Act 推荐解释要求，但解释输出须人工复核，不能当作合规认证结论；卡页指标（精度比 LightGCN 提升 8-15%、客单价提升 10-20%、年化 ¥15-40 万）为估算口径，落地须用本店实际数据重算。

## 技能关联

- **前置**：Skill-Federated-Cross-Seller-Recommendation.html、Skill-Federated-Cross-Seller-Recommendation、Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-Graph-Foundation-Model-Recommendation.html、Skill-Graph-Foundation-Model-Recommendation、Skill-Graph-Knowledge-Distillation-Recommendation.html、Skill-Graph-Knowledge-Distillation-Recommendation、Skill-HGT-Heterogeneous-Graph-Transformer.html、Skill-HGT-Heterogeneous-Graph-Transformer、Skill-Multimodal-Product-Understanding.html、Skill-Multimodal-Product-Understanding、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction
- **延伸**：Skill-Federated-Cross-Seller-Recommendation.html、Skill-Federated-Cross-Seller-Recommendation、Skill-Graph-Foundation-Model-Recommendation.html、Skill-Graph-Foundation-Model-Recommendation、Skill-Graph-Knowledge-Distillation-Recommendation.html、Skill-Graph-Knowledge-Distillation-Recommendation、Skill-Multimodal-Product-Understanding.html、Skill-Multimodal-Product-Understanding、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction
- **可组合**：Skill-Graph-Knowledge-Distillation-Recommendation.html、Skill-Graph-Knowledge-Distillation-Recommendation、Skill-Multimodal-Product-Understanding.html、Skill-Multimodal-Product-Understanding、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction、Skill-Graph-Attention-Network-Recommendation

---

> 分类：业务运营/渠道经营/组合设计　·　技术族：08-知识图谱　·　源卡：`Skill-Graph-Attention-Network-Recommendation`