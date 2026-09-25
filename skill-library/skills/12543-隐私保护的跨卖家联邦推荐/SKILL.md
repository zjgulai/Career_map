---
name: "p2s-federated-cross-seller-recommendation"
title: "Federated Cross-Seller Recommendation — 隐私保护的跨卖家联邦推荐"
description: "触发词：联邦推荐、跨卖家协作、数据不出本地、梯度聚合、隐私预算追踪。何时不用：自有多站点数据联合训练时用「联邦学习隐私保护」；只做单站点端侧加噪推荐时用「差分隐私推荐系统」。安全边界：只上传梯度不上传用户数据，但仍须签数据处理协议；须防梯度泄漏，必要时配合安全聚合。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-133"
l3_business: "隐私需求分析"
l3_all: "隐私需求分析 / 转化优化"
l1_l2_l3: "独立控制/财务与合规/隐私需求分析"
p2s_card_id: "Skill-Federated-Cross-Seller-Recommendation"
p2s_src_domain: "05-推荐系统"
quality_tier: "preview"
user_summary: "几家数据都不够的卖家联合训练推荐模型，各自的用户数据留在本地，效果却能大幅提升。"
user_try: "试试：模拟 5 家独立站的联邦训练，对比本地单独训练与联邦训练的推荐精度差异。"
whenToUse: "多家中小卖家各自数据不足、又不愿共享用户数据时用；自有多站点联合建模用联邦学习类技能；单站点端侧加噪个性化用差分隐私推荐类技能。"
workflow: "对齐各方商品编码 → 各方本地训练并上传梯度 → 聚合更新全局模型 → 本地评估精度提升并输出协作建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Federated Cross-Seller Recommendation — 隐私保护的跨卖家联邦推荐

## ① 解决的问题

中小独立站用户行为数据不足1万无法训练好的推荐模型但又不愿意共享用户数据——联邦学习框架允许多卖家协同训练推荐模型数据不出本地，推荐召回率提升15-30%满足GDPR合规年化增益20-50万元

## ② 核心算法逻辑

核心矛盾：独立站推荐系统需要大量用户行为数据，但中小卖家数据量不足。解决方案有两个极端：

## ③ 业务应用场景

业务问题：5 家月 GMV 50-200 万的中型母婴独立站卖家，各自的用户数量不足以训练好的推荐模型（协同过滤需要至少 10 万用户-商品交互才稳定），但又不愿意共享用户数据（隐私 + 竞争）。
数据要求： - 各卖家的本地用户-商品交互数据（无需共享） - 统一的商品 embedding 空间（品类编码需对齐）
预期产出： - 联邦训练的推荐模型（各卖家本地部署） - 相比纯本地训练的推荐精度提升（NDCG/Recall） - 隐私预算消耗追踪（ε-differential privacy）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
推荐精度提升 15-30%（相当于数据量扩大 5-10 倍效果）：月增 GMV ¥5-15 万
满足 GDPR/隐私合规：避免欧洲市场数据违规罚款（最高营收 4%）
独立站联盟合作：降低各方独立建设推荐系统的成本 ¥10-30 万/年
年化综合 ROI：¥20-50 万
实施难度：⭐⭐⭐⭐☆（联邦学习基础设施建设需要 4-8 周；需要多个卖家达成合作协议；Flower/PySyft 等框架可加速）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（182 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/recommendation/federated_cross_seller_recommendation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/05-推荐系统/Skill-Federated-Cross-Seller-Recommendation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Federated Cross-Seller Recommendation
联邦学习跨卖家推荐系统：隐私保护 + 协同训练
"""
import numpy as np
from dataclasses import dataclass, field


@dataclass
class SellerLocalData:
    """单个卖家的本地数据（不共享）"""
    seller_id: str
    user_item_interactions: list   # [(user_id, item_id, rating)]
    n_users: int
    n_items: int


class LocalRecommender:
    """单卖家本地推荐模型（矩阵分解简化版）"""

    def __init__(self, n_users: int, n_items: int, embed_dim: int = 16):
        self.embed_dim = embed_dim
        # 初始化嵌入
        self.user_emb = np.random.normal(0, 0.1, (n_users, embed_dim))
        self.item_emb = np.random.normal(0, 0.1, (n_items, embed_dim))

    def predict(self, user_id: int, item_id: int) -> float:
        return float(np.dot(self.user_emb[user_id], self.item_emb[item_id]))

    def compute_gradients(self, interactions: list, lr: float = 0.01,
                          l2: float = 0.001) -> dict:
        """计算本地梯度（只上传梯度，不上传数据或嵌入）"""
        user_grads = np.zeros_like(self.user_emb)
        item_grads = np.zeros_like(self.item_emb)

        for user_id, item_id, rating in interactions:
            if user_id >= len(self.user_emb) or item_id >= len(self.item_emb):
                continue
            pred = self.predict(user_id, item_id)
            err = pred - rating
            user_grads[user_id] += err * self.item_emb[item_id] + l2 * self.user_emb[user_id]
            item_grads[item_id] += err * self.user_emb[user_id] + l2 * self.item_emb[item_id]

        # 归一化（避免梯度爆炸）
        n = max(len(interactions), 1)
        return {
            'item_grad': item_grads / n,  # 只共享 item 梯度（与用户无关）
            'n_interactions': n,
        }

    def update_from_global(self, global_item_emb: np.ndarray):
        """接收聚合后的全局 item 嵌入更新"""
        self.item_emb = 0.7 * self.item_emb + 0.3 * global_item_emb


def add_differential_privacy_noise(gradient: np.ndarray, epsilon: float = 1.0,
                                    sensitivity: float = 1.0) -> np.ndarray:
    """添加差分隐私噪声（Gaussian Mechanism）"""
    sigma = np.sqrt(2 * np.log(1.25 / 0.1)) * sensitivity / epsilon
    noise = np.random.normal(0, sigma, gradient.shape)
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2605.22924 — Building a privacy-preserving Federated Recommender system for mobile devices

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：各参与方的本地用户-商品交互数据（不上传）、对齐后的商品与品类编码、本地模型配置与隐私预算；粒度：参与方本地用户-商品交互，仅上传梯度或参数。

**输出**：联邦训练后的全局模型与各参与方精度对比（NDCG/Recall）、隐私预算消耗追踪与部署建议，供协作各方评估收益。

## 执行步骤

1. 对齐各参与方的商品与品类编码
2. 各方本地训练并仅计算梯度
3. 聚合梯度并更新全局模型
4. 下发全局模型并在本地评估精度提升
5. 输出隐私预算消耗与协作方式建议

## 边界与不做

- 数据不满足时不用：各方商品编码无法对齐，或本地交互量过低时，联邦训练收益无法体现。
- 能力边界：只做联邦训练与评估，不代签多方协议、不代托管各方数据；须防梯度泄漏并配合安全聚合。

## 技能关联

- **前置**：Skill-Causal-ML-Feature-Engineering.html、Skill-Causal-ML-Feature-Engineering、Skill-DTC-Customer-Acquisition-Attribution.html、Skill-DTC-Customer-Acquisition-Attribution、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-Online-Incremental-Learning.html、Skill-Online-Incremental-Learning、Skill-Privacy-Preserving-Federated-Collection.html、Skill-Privacy-Preserving-Federated-Collection
- **延伸**：Skill-Causal-ML-Feature-Engineering.html、Skill-Causal-ML-Feature-Engineering、Skill-DTC-Customer-Acquisition-Attribution.html、Skill-DTC-Customer-Acquisition-Attribution、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-Online-Incremental-Learning.html、Skill-Online-Incremental-Learning
- **可组合**：Skill-Causal-ML-Feature-Engineering.html、Skill-Causal-ML-Feature-Engineering、Skill-DTC-Customer-Acquisition-Attribution.html、Skill-DTC-Customer-Acquisition-Attribution、Skill-Federated-Cross-Seller-Recommendation

---

> 分类：独立控制/财务与合规/隐私需求分析　·　技术族：05-推荐系统　·　源卡：`Skill-Federated-Cross-Seller-Recommendation`