---
name: "p2s-contrastive-sequential-recommendation"
title: "Contrastive Sequential Recommendation — 对比学习序列推荐：高质量自监督训练"
description: "触发词：对比学习、序列推荐、自监督、数据增强、稀疏行为。何时不用：要 session 内实时刷新推荐用「流式实时推荐」；要按匿名会话图预测下一件商品用「SR-GNN 会话推荐」。安全边界：序列增强只允许对真实行为做掩码、截取、打乱，不得伪造用户行为；预训练产物须用真实数据验证后再上线。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-070"
l3_business: "转化优化"
l3_all: "转化优化 / 生命周期触达"
l1_l2_l3: "业务运营/渠道经营/转化优化"
p2s_card_id: "Skill-Contrastive-Sequential-Recommendation"
p2s_src_domain: "05-推荐系统"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "行为数据太少也能训出像样的推荐：把用户序列做增强，自己给自己造监督信号。"
user_try: "试试：用我们每天 300-500 次购买的行为序列做对比学习预训练，给出商品嵌入并对比纯监督的效果。"
whenToUse: "当站内交互稀疏（卡页示例日购买 300-500 次量级）导致序列推荐训不动、且没有标注数据时用本技能；要 session 内毫秒级更新用「流式实时推荐」；要按匿名会话图预测下一件商品用「SR-GNN 会话推荐」。"
workflow: "整理用户行为序列（点击、加购、购买） → 对序列做掩码、截取、打乱等增强 → 用对比损失训练序列编码器 → 输出商品嵌入并接入推荐打分 → 与纯监督基线对比精度后再上线"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Contrastive Sequential Recommendation — 对比学习序列推荐：高质量自监督训练

## ① 解决的问题

独立站月均购买仅500次数据稀疏无法训练高质量推荐模型——对比学习通过序列增强（掩码/截取/打乱）从稀疏行为中提取自监督信号，无需标注数据精度提升8-15%冷启动推荐质量大幅改善年化15-40万元

## ② 核心算法逻辑

为什么用对比学习训练序列推荐：

## ③ 业务应用场景

业务问题：独立站月 UV 5,000，每天只有 300-500 个真实购买行为，数据量不足以训练高质量序列推荐模型。对比学习通过数据增强从稀疏数据中提取更多监督信号。
数据要求： - 用户行为序列（点击/加购/购买） - 无需额外标注数据（自监督）
预期产出： - 基于对比学习预训练的商品嵌入 - 推荐精度对比：纯监督 vs 对比学习增强

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
数据稀疏场景推荐精度提升 8-15%：月增 GMV ¥3-10 万
减少冷启动期推荐质量损失
无需额外标注数据：节省标注成本 ¥5-15 万/年
年化综合 ROI：¥15-40 万
实施难度：⭐⭐⭐⭐☆（需要 PyTorch + SASRec 完整实现；约 6-8 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（154 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 59）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/recommendation/contrastive_sequential_recommendation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/05-推荐系统/Skill-Contrastive-Sequential-Recommendation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Contrastive Sequential Recommendation
对比学习序列推荐：质量感知自监督训练
"""
import numpy as np
from collections import defaultdict


class ContrastiveSeqRec:
    """
    对比学习序列推荐（简化版）
    生产用: PyTorch + SASRec backbone + 对比损失
    """

    def __init__(self, embed_dim: int = 32, temperature: float = 0.1):
        self.embed_dim = embed_dim
        self.temperature = temperature
        self.item_emb = {}
        np.random.seed(42)

    def _get_emb(self, item_id: str) -> np.ndarray:
        if item_id not in self.item_emb:
            e = np.random.normal(0, 0.1, self.embed_dim)
            self.item_emb[item_id] = e / (np.linalg.norm(e) + 1e-8)
        return self.item_emb[item_id]

    def augment_sequence(self, seq: list, method: str = 'mask') -> list:
        """序列数据增强（生成对比学习的正例视角）"""
        if len(seq) < 2:
            return seq
        seq = seq.copy()
        if method == 'mask':
            # 随机遮盖20%商品
            mask_idx = np.random.choice(len(seq), max(1, len(seq)//5), replace=False)
            for i in mask_idx: seq[i] = '[MASK]'
        elif method == 'crop':
            # 随机截取子序列
            start = np.random.randint(0, len(seq)//2)
            end = start + len(seq)//2
            seq = seq[start:end]
        elif method == 'reorder':
            # 局部随机打乱（只打乱中间段）
            mid = len(seq) // 3
            segment = seq[mid:2*mid]
            np.random.shuffle(segment)
            seq[mid:2*mid] = segment
        return seq

    def encode_sequence(self, seq: list) -> np.ndarray:
        """将序列编码为向量（时间加权平均）"""
        valid = [s for s in seq if s != '[MASK]']
        if not valid:
            return np.zeros(self.embed_dim)
        weights = np.exp(-0.1 * np.arange(len(valid)))[::-1]
        weights /= weights.sum()
        vec = sum(w * self._get_emb(item) for w, item in zip(weights, valid))
        return vec / (np.linalg.norm(vec) + 1e-8)

    def contrastive_loss(self, z1: np.ndarray, z2: np.ndarray,
                          negatives: list[np.ndarray]) -> float:
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2605.11707 — Quality-Aware Collaborative Multi-Positive Contrastive Learning for Sequential Recommendation

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：用户行为序列（点击、加购、购买及其时间顺序），无需额外标注数据；粒度为单用户行为序列。

**输出**：对比学习预训练得到的商品嵌入与序列编码器，以及相对纯监督的精度对比结论；供推荐工程接入召回或精排。

## 执行步骤

1. 整理用户点击、加购、购买的时序序列
2. 对序列做掩码、截取、打乱等多种增强
3. 用对比损失训练序列编码器与商品嵌入
4. 把嵌入接入召回或精排打分
5. 与纯监督基线对比精度后决定上线

## 边界与不做

- 数据不满足：行为序列过短、点击与加购事件都不全时，增强也造不出信号，先补齐埋点。
- 何时不用：要 session 内实时刷新用「流式实时推荐」；要按匿名会话图预测下一件商品用「SR-GNN 会话推荐」。
- 能力边界：只产出预训练嵌入与编码器，不负责线上服务工程，也不保证卡页口径的精度提升。
- 安全边界：序列增强只允许对真实行为做掩码、截取、打乱，不得伪造用户行为；预训练产物须用真实数据验证后再上线。

## 技能关联

- **前置**：Skill-Diffusion-Model-Recommendation.html、Skill-Diffusion-Model-Recommendation、Skill-Federated-Cross-Seller-Recommendation.html、Skill-Federated-Cross-Seller-Recommendation、Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-Real-Time-Streaming-Recommendation.html、Skill-Real-Time-Streaming-Recommendation、Skill-Sequential-User-Behavior-Modeling.html、Skill-Sequential-User-Behavior-Modeling、Skill-Weak-Supervision-Data-Labeling.html、Skill-Weak-Supervision-Data-Labeling
- **延伸**：Skill-Diffusion-Model-Recommendation.html、Skill-Diffusion-Model-Recommendation、Skill-Federated-Cross-Seller-Recommendation.html、Skill-Federated-Cross-Seller-Recommendation、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-Real-Time-Streaming-Recommendation.html、Skill-Real-Time-Streaming-Recommendation、Skill-Weak-Supervision-Data-Labeling.html、Skill-Weak-Supervision-Data-Labeling
- **可组合**：Skill-Diffusion-Model-Recommendation.html、Skill-Diffusion-Model-Recommendation、Skill-Real-Time-Streaming-Recommendation.html、Skill-Real-Time-Streaming-Recommendation、Skill-Weak-Supervision-Data-Labeling.html、Skill-Weak-Supervision-Data-Labeling、Skill-Contrastive-Sequential-Recommendation

---

> 分类：业务运营/渠道经营/转化优化　·　技术族：05-推荐系统　·　源卡：`Skill-Contrastive-Sequential-Recommendation`