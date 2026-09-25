---
name: "p2s-real-time-streaming-recommendation"
title: "Real-Time Streaming Recommendation — 流式实时推荐：毫秒级个性化更新架构"
description: "触发词：流式推荐、实时特征、毫秒级更新、会话内推荐、推荐延迟。何时不用：要做三层意图缓存的首页个性化用「LLM 会话个性化缓存」；要按匿名会话图预测下一件商品用「SR-GNN 会话推荐」。安全边界：实时行为流须按授权范围采集并脱敏，不得留存不必要的个人信息；延迟与吞吐须按容量规划设上限，不得为压延迟牺牲数据完整性。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-070"
l3_business: "转化优化"
l3_all: "转化优化 / 数据管道"
l1_l2_l3: "业务运营/渠道经营/转化优化"
p2s_card_id: "Skill-Real-Time-Streaming-Recommendation"
p2s_src_domain: "05-推荐系统"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用户刚点完静音吸奶器，下一秒推荐就跟着变，不用等第二天批量任务跑完。"
user_try: "试试：把点击行为流接进实时推荐引擎，让用户点完立即刷新后续推荐，并测出响应延迟。"
whenToUse: "当用户行为需要立即影响接下来看到的推荐（卡页示例要求推荐延迟低于 100ms）时用本技能；要做离线生成的三层意图缓存用「LLM 会话个性化缓存」；要按匿名会话图预测下一件商品用「SR-GNN 会话推荐」。"
workflow: "接入实时用户行为流：点击、停留、搜索、加购 → 离线预计算商品嵌入向量 → 用 Redis 存实时特征并更新会话状态 → 在线推理输出实时推荐列表 → 监控推荐延迟与会话内 CTR"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Real-Time Streaming Recommendation — 流式实时推荐：毫秒级个性化更新架构

## ① 解决的问题

用户点击了便携吸奶器后首页推荐还是旧的因为批量系统明天才更新——流式推荐每次用户行为后毫秒级更新推荐结果，session内CTR提升15-25%年化GMV增益15-40万元

## ② 核心算法逻辑

批处理推荐 vs 实时流式推荐：

## ③ 业务应用场景

业务问题：用户第一次访问看到默认热销榜，点击了"静音吸奶器"后，接下来的推荐还是默认热销榜（因为批量系统要明天才更新）。用实时推荐，用户点击行为立即影响接下来的推荐。
数据要求： - 实时用户行为流（点击/停留/搜索/加购） - 商品嵌入向量（离线预计算） - Redis 实例（存储实时特征）
预期产出： - 基于当前 session 行为的实时推荐更新 - 推荐延迟 < 100ms（用户无感知） - Session 内 CTR 提升监控

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
Session 内推荐 CTR 提升 15-25%（行为立即生效）：月增收 ¥3-10 万
减少"推荐不相关"的跳出（用户留存提升）
大促期实时响应库存变化（缺货商品立即下推）
年化综合 ROI：¥15-40 万
实施难度：⭐⭐⭐⭐☆（需要 Kafka + Redis 基础设施；约 6-8 周工程量）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（166 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/recommendation/real_time_streaming_recommendation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/05-推荐系统/Skill-Real-Time-Streaming-Recommendation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Real-Time Streaming Recommendation
流式实时推荐：毫秒级个性化更新（简化版）
生产: Kafka + Redis + FAISS
"""
import numpy as np
from collections import deque
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class UserSession:
    """用户实时会话状态"""
    user_id: str
    click_history: deque = field(default_factory=lambda: deque(maxlen=10))  # 最近10次点击
    search_queries: deque = field(default_factory=lambda: deque(maxlen=5))
    cart_items: list = field(default_factory=list)
    session_intent: Optional[str] = None  # 推断的购买意图


class StreamingRecommendationEngine:
    """
    流式推荐引擎（简化版）
    生产代码需要 Kafka Consumer + Redis + FAISS
    """

    def __init__(self, embed_dim: int = 32):
        self.embed_dim = embed_dim
        self.item_embeddings = {}  # 离线预计算的商品向量
        self.user_sessions = {}    # 内存中的实时会话
        self.item_metadata = {}

    def load_item_embeddings(self, items: list[dict]):
        """加载预计算的商品嵌入（生产中从 Redis/Vector DB 加载）"""
        np.random.seed(42)
        # 模拟：同品类商品嵌入相近
        category_centers = {}
        for item in items:
            cat = item['category']
            if cat not in category_centers:
                category_centers[cat] = np.random.normal(0, 1, self.embed_dim)

        for item in items:
            cat = item['category']
            emb = category_centers[cat] + np.random.normal(0, 0.3, self.embed_dim)
            emb /= np.linalg.norm(emb) + 1e-8
            self.item_embeddings[item['product_id']] = emb
            self.item_metadata[item['product_id']] = item

    def process_event(self, user_id: str, event_type: str,
                       item_id: str = None, query: str = None):
        """
        实时处理用户行为事件（生产中由 Kafka Consumer 调用）
        event_type: 'click' | 'add_cart' | 'search' | 'dwell'
        """
        if user_id not in self.user_sessions:
            self.user_sessions[user_id] = UserSession(user_id)

        session = self.user_sessions[user_id]
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2407.13456，但该号在 arXiv 上是《Magnetic exponent for the long-range bond disordered Potts model》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：实时用户行为流（点击、停留、搜索、加购）、离线预计算的商品嵌入向量、Redis 实例（存实时特征）；粒度为单用户 × 单次事件。

**输出**：基于当前会话行为的实时推荐更新、推荐延迟指标（卡页口径低于 100ms）与会话内 CTR 监控；供推荐工程与站点运营上线实时链路。

## 执行步骤

1. 接入实时用户行为流并做事件清洗
2. 离线预计算商品嵌入并加载到在线服务
3. 用 Redis 维护实时特征与会话状态
4. 在线推理输出实时推荐并监控延迟
5. 跟踪会话内 CTR 与缺货等变化下的下推效果

## 边界与不做

- 数据不满足：没有实时行为流或缺少缓存等基础设施时链路跑不起来，先补基建（卡页口径约 6-8 周工程量）。
- 何时不用：要做离线意图缓存个性化用「LLM 会话个性化缓存」；要按会话图预测下一件商品用「SR-GNN 会话推荐」。
- 本技能承载的是规则与契约产物（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。
- 安全边界：实时行为流须按授权范围采集并脱敏；延迟与吞吐须按容量规划设上限，不得为压低延迟牺牲数据完整性。

## 技能关联

- **前置**：Skill-Anomaly-Detection-Foundation-Model.html、Skill-Anomaly-Detection-Foundation-Model、Skill-Data-Collection-Agent-Pipeline.html、Skill-Data-Collection-Agent-Pipeline、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-Online-Incremental-Learning.html、Skill-Online-Incremental-Learning、Skill-Personalized-Search-Ranking.html、Skill-Personalized-Search-Ranking、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction、Skill-Topological-Data-Analysis-Cross-Sell.html、Skill-Topological-Data-Analysis-Cross-Sell
- **延伸**：Skill-Anomaly-Detection-Foundation-Model.html、Skill-Anomaly-Detection-Foundation-Model、Skill-Data-Collection-Agent-Pipeline.html、Skill-Data-Collection-Agent-Pipeline、Skill-Personalized-Search-Ranking.html、Skill-Personalized-Search-Ranking、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction、Skill-Topological-Data-Analysis-Cross-Sell.html、Skill-Topological-Data-Analysis-Cross-Sell
- **可组合**：Skill-Anomaly-Detection-Foundation-Model.html、Skill-Anomaly-Detection-Foundation-Model、Skill-Data-Collection-Agent-Pipeline.html、Skill-Data-Collection-Agent-Pipeline、Skill-Topological-Data-Analysis-Cross-Sell.html、Skill-Topological-Data-Analysis-Cross-Sell、Skill-Real-Time-Streaming-Recommendation

---

> 分类：业务运营/渠道经营/转化优化　·　技术族：05-推荐系统　·　源卡：`Skill-Real-Time-Streaming-Recommendation`