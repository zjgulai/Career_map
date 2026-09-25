---
name: "p2s-sequential-user-behavior-modeling"
title: "Sequential User Behavior Modeling — 用户行为序列建模：时序上下文驱动的意图理解"
description: "触发词：行为序列建模、自注意力、意图识别、决策阶段、转化干预。何时不用：要把点击流切成会话图预测下一件商品用「SR-GNN 会话推荐」；要按月龄分群切换推荐用「月龄感知推荐」。安全边界：行为事件流属个人信息，采集与建模须在授权范围内并做用户标识脱敏；行为模式判定只用于服务用户，不得用于对个人差别定价。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-070"
l3_business: "转化优化"
l3_all: "转化优化 / 漏斗诊断"
l1_l2_l3: "业务运营/渠道经营/转化优化"
p2s_card_id: "Skill-Sequential-User-Behavior-Modeling"
p2s_src_domain: "14-用户分析"
quality_tier: "preview"
user_summary: "先看 A、再搜便携、又回看 A、然后加购：识别出这是在下决心，该给推动而不是当普通浏览。"
user_try: "试试：分析这个用户 A 到 B 到 C 回看 A 再加购的序列，判断他正处在比较决策阶段并给出干预建议。"
whenToUse: "当要把同一会话内的行为先后顺序（而非集合）用于意图判断与转化干预时用本技能；要按会话图预测下一件商品用「SR-GNN 会话推荐」；要按月龄分群切换推荐用「月龄感知推荐」。"
workflow: "采集行为事件流：事件类型、商品 ID、时间戳 → 关联商品属性特征 → 用序列模型输出当前意图向量 → 把行为模式分为浏览探索、主动比较、决策锁定 → 对高意图阶段触发干预并评估转化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Sequential User Behavior Modeling — 用户行为序列建模：时序上下文驱动的意图理解

## ① 解决的问题

用户分析把行为当集合处理忽略顺序信息导致意图预测不准——「先看A款→搜便携→再看A款→加购」这个序列表明高意图决策阶段，Self-Attention序列建模精度提升15-30%识别比较决策阶段触发转化干预年化20-60万元

## ② 核心算法逻辑

集合表示 vs 序列建模：

## ③ 业务应用场景

业务问题：用户在独立站同一 session 内看了3款吸奶器（A→B→C→A→加购A），这个序列强烈表明用户在主动比较，决策意图极高。但现有系统把他当成"普通浏览用户"，没有触发任何加速决策的干预。
数据要求： - 用户行为事件流（event_type/product_id/timestamp） - 商品属性（品类/价格/特征）
预期产出： - 用户当前意图向量（可用于推荐/广告/客服触发） - 行为模式分类：浏览探索 / 主动比较 / 决策锁定 - 下一步最可能的行为预测

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
意图预测精度提升 15-30%：推荐 CTR 提升，月增 GMV ¥5-15 万
识别"比较决策"阶段触发干预：转化率提升 20-35%
行为序列特征提升广告定向精度
年化综合 ROI：¥20-60 万
实施难度：⭐⭐⭐☆☆（SASRec 有成熟实现；需要行为事件流；约 3-4 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（148 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/user_analytics/sequential_user_behavior_modeling` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-Sequential-User-Behavior-Modeling.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Sequential User Behavior Modeling
用户行为序列建模：Self-Attention意图理解
"""
import numpy as np
from collections import deque
from dataclasses import dataclass, field


@dataclass
class BehaviorEvent:
    item_id: str
    event_type: str   # view/click/cart/purchase/search
    timestamp: float
    dwell_sec: float = 0.0


@dataclass
class UserBehaviorSequence:
    user_id: str
    events: deque = field(default_factory=lambda: deque(maxlen=20))

    def add_event(self, event: BehaviorEvent):
        self.events.appendleft(event)  # 最新在前

    @property
    def pattern(self) -> str:
        """识别行为模式"""
        types = [e.event_type for e in self.events]
        unique_items = len(set(e.item_id for e in self.events if e.event_type != 'search'))
        cart_count = types.count('cart')
        view_count = types.count('view') + types.count('click')

        if cart_count >= 1 and unique_items <= 2:
            return 'decision_locked'      # 锁定决策
        elif unique_items >= 3 and view_count >= 5:
            return 'active_comparison'    # 主动比较
        elif view_count >= 3 and unique_items >= 2:
            return 'exploring'            # 探索浏览
        else:
            return 'casual'               # 随意浏览


class SelfAttentionSequenceModel:
    """
    Self-Attention 用户序列模型（轻量近似版）
    生产用: pip install torch + 完整 SASRec 实现
    """

    def __init__(self, embed_dim: int = 32, n_heads: int = 4, seq_len: int = 20):
        self.embed_dim = embed_dim
        self.n_heads = n_heads
        self.seq_len = seq_len
        self.item_embeddings = {}
        np.random.seed(42)

    def get_or_create_item_emb(self, item_id: str) -> np.ndarray:
        if item_id not in self.item_embeddings:
            emb = np.random.normal(0, 0.1, self.embed_dim)
            self.item_embeddings[item_id] = emb / (np.linalg.norm(emb) + 1e-8)
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2510.10102 — PANTHER: Generative Pretraining Beyond Language for Sequential User Behavior Modeling

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：用户行为事件流（事件类型、商品 ID、时间戳）与商品属性（品类、价格、特征）；粒度为单用户 × 单会话序列。

**输出**：用户当前意图向量、行为模式分类（浏览探索、主动比较、决策锁定）与下一步最可能行为预测；供推荐、广告与客服触发转化干预。

## 执行步骤

1. 采集行为事件流并做会话切分
2. 关联商品属性特征并构造序列输入
3. 用自注意力序列模型输出意图向量
4. 按行为模式判定当前所处决策阶段
5. 在比较或锁定阶段触发干预并评估转化

## 边界与不做

- 数据不满足：事件缺少类型、商品 ID 或时间戳时序列建不起来，先补齐埋点字段。
- 何时不用：要按会话图预测下一件商品用「SR-GNN 会话推荐」；要按月龄分群切换推荐用「月龄感知推荐」。
- 能力边界：只做序列建模与阶段判定，不负责干预动作执行，也不保证卡页口径的精度提升。
- 安全边界：行为流属个人信息，须在授权范围内采集并脱敏；行为模式只用于服务用户，不得用于对个人差别定价。

## 技能关联

- **前置**：Skill-Conversational-Commerce-Agent.html、Skill-Conversational-Commerce-Agent、Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-Multi-Ta[REDACTED].html、Skill-Multi-Ta[REDACTED]、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction、Skill-Real-Time-Streaming-Recommendation.html、Skill-Real-Time-Streaming-Recommendation、Skill-TRACE-Clickstream-Embedding.html、Skill-TRACE-Clickstream-Embedding
- **延伸**：Skill-Conversational-Commerce-Agent.html、Skill-Conversational-Commerce-Agent、Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-Multi-Ta[REDACTED].html、Skill-Multi-Ta[REDACTED]、Skill-Real-Time-Streaming-Recommendation.html、Skill-Real-Time-Streaming-Recommendation
- **可组合**：Skill-Conversational-Commerce-Agent.html、Skill-Conversational-Commerce-Agent、Skill-Multi-Ta[REDACTED].html、Skill-Multi-Ta[REDACTED]、Skill-Real-Time-Streaming-Recommendation.html、Skill-Real-Time-Streaming-Recommendation、Skill-Sequential-User-Behavior-Modeling

---

> 分类：业务运营/渠道经营/转化优化　·　技术族：14-用户分析　·　源卡：`Skill-Sequential-User-Behavior-Modeling`