---
name: "p2s-multi-ta[REDACTED]"
title: "Multi-Task User Representation — 多任务用户表示学习：统一用户画像驱动全业务"
description: "触发词：统一用户表示、多任务学习、共享编码、信号复用、画像打通。何时不用：只有一个下游任务、没有跨系统信号复用需求时不用；本技能解决推荐、广告、流失、LTV 各自建模型的重复与孤岛。安全边界：行为数据须匿名化；广告定向不得使用敏感属性（如生育状态），禁止基于用户脆弱状态定向。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-139"
l3_business: "主数据治理"
l3_all: "主数据治理 / 分群"
l1_l2_l3: "数据与Agent平台/数据与AI运行/主数据治理"
p2s_card_id: "Skill-Multi-Ta[REDACTED]"
p2s_src_domain: "14-用户分析"
quality_tier: "preview"
user_summary: "一次编码算出用户表示，推荐、广告、流失、LTV 四个系统共用，精度上去、算力省下来。"
user_try: "试试：把推荐和广告的用户表示合成一个共享编码器，看两边精度和推理成本的变化。"
whenToUse: "同一批用户信号要在多个下游任务复用、各系统重复训练时用本技能；单个任务独立建模够用时不需要。"
workflow: "整合行为、曝光、订单等用户信号 → 训练共享编码器并接多任务输出头 → 平衡各任务梯度避免相互拖累 → 把统一表示分发到各业务系统复用"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Multi-Task User Representation — 多任务用户表示学习：统一用户画像驱动全业务

## ① 解决的问题

推荐广告流失LTV四个系统各自维护用户模型导致「安静偏好」信号无法跨系统复用——多任务统一用户表示一次编码服务四个任务，各任务精度提升5-12%推理成本节省30-50%年化15-40万元

## ② 核心算法逻辑

各自为政 vs 统一表示：

## ③ 业务应用场景

业务痛点：独立站推荐系统知道用户喜欢"安静+便携"的产品，但广告重定向系统不知道，给这个用户投了噪音大的商品广告，用户点都不点。多任务统一表示让"安静偏好"这个信号同时服务推荐+广告。
业务价值： - 广告 CTR 提升 8-15%（用推荐知识增强广告定向） - 推荐精度提升 5-10%（用广告转化信号增强推荐） - 统一计算节省 30-50% 推理成本 - 年化 ROI：¥15-40 万
三轨验证： - 成本：显性成本包括：① 数据采集与清洗（行为日志、广告曝光、订单数据整合，约 ¥3-5 万/月）；② 计算资源（GPU 训练集群，约 ¥2 万/月）；③ 人力（1 名算法工程师 + 0.5 名数据工程师，约 ¥4 万/月）。总成本约 ¥9-11 万/月。 - 合规：① 用户行为数据需匿名化处理，避免关联个人身份信息（GDPR 第 5 条）；② 广告定向不得使用敏感属性（如健康状况、宗教信仰），需过滤掉"吸奶器"等可能暗示生育状态的标签；③ Amazon 政策禁止基于用户"脆弱状态"（如产后抑郁）的定向广告。 - 风险：① 统一表示可能放大推荐与广告的协同偏见（如只推荐高毛利商品

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：各任务精度提升 5-12%；推理成本节省 30-50%；年化 ¥15-40 万
实施难度：⭐⭐⭐⭐☆（需要联合训练框架；梯度平衡实现；约 6-8 周）
优先级评分：⭐⭐⭐⭐⭐（填补 用户分析↔推荐↔广告 三域知识孤岛问题；2024年工业界标配）
评估依据：M3Rec (SIGIR 2024)、美团/阿里联合推荐广告用户模型均验证多任务提升 5-15%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（132 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/user_analytics/multi_task_user_representation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-Multi-Ta[REDACTED].md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Multi-Task User Representation
多任务统一用户表示：共享编码器驱动全业务
"""
import numpy as np
from dataclasses import dataclass
from collections import defaultdict


@dataclass
class UserBehavior:
    user_id: str
    click_history: list
    purchase_history: list
    search_queries: list


class MultiTaskUserEncoder:
    """
    多任务用户编码器（共享底层表示）
    生产用: PyTorch + Transformer + 多任务损失
    """

    def __init__(self, embed_dim: int = 32):
        self.embed_dim = embed_dim
        self.item_emb = {}
        np.random.seed(42)
        # 任务特定头（线性投影）
        self.task_heads = {
            'rec':   np.random.normal(0, 0.1, (embed_dim, embed_dim)),
            'ads':   np.random.normal(0, 0.1, (embed_dim, embed_dim)),
            'churn': np.random.normal(0, 0.1, (embed_dim, 1)),
            'ltv':   np.random.normal(0, 0.1, (embed_dim, 1)),
        }

    def _item_emb(self, item_id: str) -> np.ndarray:
        if item_id not in self.item_emb:
            e = np.random.normal(0, 0.1, self.embed_dim)
            self.item_emb[item_id] = e / (np.linalg.norm(e) + 1e-8)
        return self.item_emb[item_id]

    def encode_user(self, behavior: UserBehavior) -> np.ndarray:
        """
        统一用户编码（共享表示层）
        生产用: Transformer 编码行为序列
        """
        all_items = behavior.click_history[-5:] + behavior.purchase_history[-3:]
        if not all_items:
            return np.zeros(self.embed_dim)
        # 时序加权聚合（近期权重更高）
        weights = np.exp(-0.2 * np.arange(len(all_items)))
        weights /= weights.sum()
        vec = sum(w * self._item_emb(item) for w, item in zip(weights, reversed(all_items)))
        # 搜索查询语义补充
        if behavior.search_queries:
            query_signal = np.mean([self._item_emb(f"QUERY_{q[:10]}") for q in behavior.search_queries[-3:]], axis=0)
            vec = 0.7 * vec + 0.3 * query_signal
        return vec / (np.linalg.norm(vec) + 1e-8)

    def predict_all_tasks(self, behavior: UserBehavior) -> dict:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.14823，但该号在 arXiv 上是《Converse Theorems for Certificates of Safety and Stability》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：用户行为日志、广告曝光、订单数据等，按用户粒度整合；训练前必须做匿名化处理。

**输出**：统一用户表示与各任务指标变化评估，供推荐、广告、流失预警、LTV 模型复用。

## 执行步骤

1. 整合多源用户行为与交易数据并匿名化
2. 构建共享编码器与多任务输出头
3. 按任务权重平衡梯度后联合训练
4. 评估各任务精度与推理成本变化
5. 把统一表示下发给下游系统

## 边界与不做

- 只有一个下游任务、无跨系统复用需求时不用本技能。
- 本技能产出用户表示与评估结果，不代替各业务系统的策略与投放决策。
- 行为数据须匿名化，定向不得使用敏感属性，也不得基于用户脆弱状态做投放。

## 技能关联

- **前置**：Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-Joint-Ads-Recommendation-Optimization.html、Skill-Joint-Ads-Recommendation-Optimization、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-Multi-Source-User-Identity-Unification.html、Skill-Multi-Source-User-Identity-Unification、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction、Skill-Sequential-User-Behavior-Modeling.html、Skill-Sequential-User-Behavior-Modeling
- **延伸**：Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-Joint-Ads-Recommendation-Optimization.html、Skill-Joint-Ads-Recommendation-Optimization、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-Multi-Source-User-Identity-Unification.html、Skill-Multi-Source-User-Identity-Unification、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction
- **可组合**：Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-Multi-Source-User-Identity-Unification.html、Skill-Multi-Source-User-Identity-Unification、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction、Skill-Multi-Ta[REDACTED]

---

> 分类：数据与Agent平台/数据与AI运行/主数据治理　·　技术族：14-用户分析　·　源卡：`Skill-Multi-Ta[REDACTED]`