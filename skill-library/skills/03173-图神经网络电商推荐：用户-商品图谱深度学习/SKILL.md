---
name: "p2s-gnn-ecommerce-recommendation"
title: "GNN Ecommerce Recommendation — 图神经网络电商推荐：用户-商品图谱深度学习"
description: "触发词：图神经网络推荐、用户商品图谱、LightGCN、高阶配套效应、嵌入向量、关联推荐 CTR。何时不用：要动态学习邻居权重、追求比 LightGCN 更高精度用「Graph Attention Network Recommendation」，只挑互补捆绑组合用「Bundle Recommendation Complementary」；本技能只做图卷积嵌入与 Top-K 排序。安全边界：推荐结果上线前须人工抽检，模型不直接覆盖线上推荐位或改动商品数据。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-079"
l3_business: "组合设计"
l3_all: "组合设计 / 转化优化"
l1_l2_l3: "业务运营/渠道经营/组合设计"
p2s_card_id: "Skill-GNN-Ecommerce-Recommendation"
p2s_src_domain: "05-推荐系统"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "让站内相关商品推荐不再只推同品类热销榜，而是沿用户-商品关系图找到真正会被一起买的配套商品，顺带把长尾货带出来。"
user_try: "试试：这是我们的用户购买记录（user_id／product_id／timestamp／quantity）和商品属性表，帮我跑一版图卷积推荐，看能不能捕捉到「买吸奶器的人后来会买储奶袋」这种配套关系，并给出 Top-K 列表。"
whenToUse: "有用户-商品交互图（卡页建议 ≥5,000 用户、≥500 商品）与商品属性，要产出嵌入向量与 Top-K 配套推荐、发现不明显的商品关联时用；要动态学习邻居权重的更高精度图推荐用「Graph Attention Network Recommendation」，只挑互补捆绑组合用「Bundle Recommendation Complementary」。"
workflow: "用 user_id／product_id／timestamp／quantity 交互构建用户-商品图 → 初始化用户与商品嵌入向量 → 做 K 层图卷积消息传递并按度归一化聚合邻居嵌入 → 按 GNN 评分生成 Top-K 推荐列表 → 导出配套关系图谱，挑出未明显但高分的商品关联"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# GNN Ecommerce Recommendation — 图神经网络电商推荐：用户-商品图谱深度学习

## ① 解决的问题

独立站关联推荐只显示同品类热销榜CTR仅2%未利用婴儿推车用户60%会购买安全座椅的配套关系——LightGCN图神经网络消息传递捕捉高阶配套效应，关联推荐CTR从2%提升到5-8%AOV提升15-25%年化增益20-60万元

## ② 核心算法逻辑

节点: 用户 U + 商品 I

## ③ 业务应用场景

业务问题：母婴独立站的"相关商品"推荐只显示同品类热销榜，推荐准确率低（CTR 仅 2%）。实际上购买吸奶器的用户 60% 会在 30 天内购买储奶袋/消毒器，这些配套关系没有被利用。
数据要求： - 用户购买历史（user_id, product_id, timestamp, quantity） - 商品属性（品类/价格/品牌） - 建议数据量：≥ 5,000 用户，≥ 500 商品
预期产出： - 用户嵌入向量（用于个性化推荐） - 商品嵌入向量（用于相似商品推荐） - Top-K 推荐列表（按 GNN 评分排序） - 配套关系图谱（发现未明显的商品关联）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
关联推荐 CTR 提升（配套关系捕捉）：从 2% → 5-8%，月增 GMV ¥5-15 万
客单价提升（配套商品同时推荐）：AOV 提升 15-25%
长尾商品曝光（GNN 传播低频但相关商品）：减少库存积压
年化综合 ROI：¥20-60 万
实施难度：⭐⭐⭐☆☆（LightGCN 有成熟实现（RecBole/DGL）；需要历史购买图数据；约 3-4 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（174 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/recommendation/gnn_ecommerce_recommendation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/05-推荐系统/Skill-GNN-Ecommerce-Recommendation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
GNN Ecommerce Recommendation (LightGCN-style)
图神经网络推荐：用户-商品图消息传递
"""
import numpy as np
from collections import defaultdict


class LightGCNRecommender:
    """
    LightGCN 风格的轻量图卷积推荐
    简化版本（无需 PyTorch/TensorFlow）
    生产环境: pip install recbole 或 dgl
    """

    def __init__(self, n_users: int, n_items: int, embed_dim: int = 32,
                 n_layers: int = 3, lr: float = 0.01):
        self.n_users = n_users
        self.n_items = n_items
        self.embed_dim = embed_dim
        self.n_layers = n_layers
        self.lr = lr
        # 初始化嵌入
        scale = 0.1
        self.user_emb = np.random.normal(0, scale, (n_users, embed_dim))
        self.item_emb = np.random.normal(0, scale, (n_items, embed_dim))
        # 图结构
        self.user_items = defaultdict(set)   # user -> items
        self.item_users = defaultdict(set)   # item -> users

    def build_graph(self, interactions: list):
        """构建用户-商品交互图"""
        for user_id, item_id, _ in interactions:
            self.user_items[user_id].add(item_id)
            self.item_users[item_id].add(user_id)

    def propagate(self) -> tuple:
        """
        LightGCN 消息传递：K 层图卷积
        聚合邻居嵌入更新当前嵌入
        """
        all_user_embs = [self.user_emb.copy()]
        all_item_embs = [self.item_emb.copy()]

        cur_user_emb = self.user_emb.copy()
        cur_item_emb = self.item_emb.copy()

        for _ in range(self.n_layers):
            # 用户从购买商品聚合
            new_user_emb = np.zeros_like(cur_user_emb)
            for u in range(self.n_users):
                neighbors = list(self.user_items.get(u, []))
                if neighbors:
                    neighbor_embs = cur_item_emb[neighbors]
                    # 归一化聚合
                    deg_u = np.sqrt(len(neighbors))
                    for i in neighbors:
                        deg_i = np.sqrt(max(len(self.item_users.get(i, [])), 1))
                        new_user_emb[u] += cur_item_emb[i] / (deg_u * deg_i)
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2511.20564 — E2E-GRec: An End-to-End Joint Training Framework for Graph Neural Networks and Recommender Systems

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：交互级数据：user_id、product_id、timestamp、quantity 的购买历史；商品侧要品类／价格／品牌等属性；卡页建议数据量 ≥5,000 用户、≥500 商品。嵌入维度与层数为模板参数（默认 embed_dim 32、n_layers 3、lr 0.01），数据量不足时高阶邻居传播不可靠。

**输出**：用户与商品级产出：用户嵌入向量与商品嵌入向量（分别用于个性化推荐与相似商品推荐）、按 GNN 评分排序的 Top-K 推荐列表，以及配套关系图谱（发现未明显的商品关联）；供独立站推荐位配置与长尾商品曝光使用。

## 执行步骤

1. 整理 user_id／product_id／timestamp／quantity 交互并构建用户-商品图
2. 初始化用户与商品嵌入向量
3. 做多层图卷积，按度归一化聚合邻居嵌入
4. 用最终嵌入算 GNN 评分并生成 Top-K 推荐列表
5. 导出配套关系图谱并标注未明显但高分的商品关联

## 边界与不做

- 数据不满足：交互量与商品数不足时不要用——卡页建议 ≥5,000 用户、≥500 商品，否则高阶配套关系学不出来。
- 何时不用：要动态学习邻居权重、追求比 LightGCN 更高精度的图推荐用「Graph Attention Network Recommendation」，只挑互补捆绑组合做套餐用「Bundle Recommendation Complementary」。
- 能力边界：只产出嵌入、Top-K 推荐与配套图谱，不负责定价与套餐上架；卡页指标（关联推荐 CTR 2%→5-8%、AOV 提升 15-25%、年化 ¥20-60 万）为估算口径，落地须用本店实际数据重算。
- 安全边界：推荐结果上线前须人工抽检，模型不直接覆盖线上推荐位或改动商品数据。

## 技能关联

- **前置**：Skill-Federated-Cross-Seller-Recommendation.html、Skill-Federated-Cross-Seller-Recommendation、Skill-GNN-Foundations.html、Skill-GNN-Foundations、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-Multimodal-Product-Understanding.html、Skill-Multimodal-Product-Understanding、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction
- **延伸**：Skill-Federated-Cross-Seller-Recommendation.html、Skill-Federated-Cross-Seller-Recommendation、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-Multimodal-Product-Understanding.html、Skill-Multimodal-Product-Understanding、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction
- **可组合**：Skill-Multimodal-Product-Understanding.html、Skill-Multimodal-Product-Understanding、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction、Skill-GNN-Ecommerce-Recommendation

---

> 分类：业务运营/渠道经营/组合设计　·　技术族：05-推荐系统　·　源卡：`Skill-GNN-Ecommerce-Recommendation`