---
name: "p2s-ds-dga-gcn-fake-review-group"
title: "DS-DGA-GCN — 动态图假评论群组检测：冷启动新品防刷评"
description: "触发词：假评论群组、动态图检测、冷启动防刷、账号群图谱、新品评分。何时不用：只需要判断单条评论真伪时用评论级检测模型；本技能面向评论者账号之间的协同结构。安全边界：检测结果只能标记可疑并转人工复核，不得自动删评或对用户做报复性操作。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-136"
l3_business: "安全事件处理"
l3_all: "安全事件处理 / 体验分析"
l1_l2_l3: "独立控制/数据与AI运行/安全事件处理"
p2s_card_id: "Skill-DS-DGA-GCN-Fake-Review-Group"
p2s_src_domain: "19-风控反欺诈"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "新品上架几小时内冒出一堆五星、账号还互相买过同一批货，用账号关系图把刷评团伙圈出来。"
user_try: "试试：这款新品上架 6 小时就有 38 条五星，帮我看看这些账号是不是一个团伙。"
whenToUse: "新品或冷启动阶段评论突增、怀疑账号协同刷评时用本技能；需要判断单条评论是否由大模型生成用生成式刷评检测类技能。"
workflow: "采集评论、评论者与产品三方数据 → 构建评论者、评论、产品的动态图 → 计算网络特征分与自相似性 → 把账号群分类为正常、可疑与虚假团伙"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# DS-DGA-GCN — 动态图假评论群组检测：冷启动新品防刷评

## ① 解决的问题

业务问题：新款奶瓶（ASIN B0XXXX）上架后 6 小时内突现 38 条 5 星评论，评论者账号注册时间集中在近 7 天、互相之间都购买过同一批产品

## ② 核心算法逻辑

核心思想：在"产品 → 评论 → 评论者"三方动态异构图上检测刷评团伙群组。不看单条评论文本质量，而是看评论者之间的网络行为模式——真实用户构成稀疏随机网络，刷评团伙则共现密集、行为高度同步。

## ③ 业务应用场景

业务问题：新款奶瓶（ASIN B0XXXX）上架后 6 小时内突现 38 条 5 星评论，评论者账号注册时间集中在近 7 天、互相之间都购买过同一批产品。肉眼难辨，但网络结构异常明显。
数据要求： | 类型 | 字段 | 来源 | |------|------|------| | 评论 | reviewer_id, product_id, rating, timestamp | Amazon API | | 评论者 | account_age, review_count, verified | 爬取 | | 产品 | asin, category, launch_date | 内部数据 |
预期产出： - 评论者群组分类：正常 / 可疑 / 虚假团伙 - 可疑群组图谱（哪些账号构成一个团伙） - NFS 得分热力图（团伙成员的网络指纹）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（452 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/risk_fraud/ds_dga_gcn_fake_review_group` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/19-风控反欺诈/Skill-DS-DGA-GCN-Fake-Review-Group.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
DS-DGA-GCN: 动态图假评论群组检测
论文: Detecting Fake Reviewer Groups in Dynamic Networks (arXiv 2603.08332)
场景: 母婴新品上架刷评检测 + 选品评论质量过滤
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, List, Tuple
import numpy as np
from collections import defaultdict


# ─── 数据结构 ────────────────────────────────────────────────────────────────

@dataclass
class Review:
    reviewer_id: str
    product_id: str
    rating: float
    timestamp: float       # Unix 时间戳
    verified: bool = False
    review_text: str = ""


@dataclass
class ReviewerNode:
    reviewer_id: str
    account_age_days: int
    total_review_count: int
    reviews: List[Review] = field(default_factory=list)


# ─── 三方动态图 ──────────────────────────────────────────────────────────────

class ReviewerNetworkGraph:
    """产品-评论-评论者 三方动态图（支持时序边添加）"""

    def __init__(self):
        self.reviewer_nodes: Dict[str, ReviewerNode] = {}
        self.product_ids: set = set()
        # 边: reviewer_id -> set of product_ids（co-review 边）
        self.coview_edges: Dict[str, set] = defaultdict(set)
        # 时序边: (reviewer_id, product_id) -> timestamp
        self.temporal_edges: Dict[Tuple[str, str], List[float]] = defaultdict(list)

    def add_review(self, review: Review, reviewer_node: ReviewerNode) -> None:
        """动态添加一条评论（时序边扩展）"""
        rid = review.reviewer_id
        pid = review.product_id

        self.reviewer_nodes[rid] = reviewer_node
        self.product_ids.add(pid)
        self.coview_edges[rid].add(pid)
        self.temporal_edges[(rid, pid)].append(review.timestamp)
        reviewer_node.reviews.append(review)

    def get_co_reviewers(self, reviewer_id: str) -> List[str]:
        """找出与该评论者评论过同一产品的所有评论者（共现关系）"""
        target_products = self.coview_edges.get(reviewer_id, set())
        co_reviewers = []
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2603.08332 — Detecting Fake Reviewer Groups in Dynamic Networks: An Adaptive Graph Learning Method
⚠️ 该号被 3 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：评论数据（reviewer_id、product_id、rating、timestamp，来自平台接口）、评论者数据（account_age、review_count、verified，来自页面采集）、产品数据（asin、category、launch_date，来自内部）。

**输出**：评论者群组分类（正常、可疑、虚假团伙）、可疑群组图谱与网络特征得分，供评论运营与申诉团队使用。

## 执行步骤

1. 采集三方数据并对齐账号与产品
2. 构建动态评论者网络图
3. 计算网络指纹与自相似性得分
4. 按得分把账号群分类
5. 输出可疑群组图谱并转人工复核

## 边界与不做

- 只需判断单条评论真伪时，群组检测方法过重。
- 本技能产出可疑群组与评分，不执行删评等处置动作。
- 冷启动阶段历史数据少、图特征不稳定，结论必须人工复核后再行动。

## 技能关联

- **前置**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Click-Fraud-Detection.html、Skill-Click-Fraud-Detection、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-FraudSquad-LLM-Review-Detection.html、Skill-FraudSquad-LLM-Review-Detection、Skill-HGT-Heterogeneous-Graph-Transformer.html、Skill-HGT-Heterogeneous-Graph-Transformer、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **延伸**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Click-Fraud-Detection.html、Skill-Click-Fraud-Detection、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **可组合**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-DS-DGA-GCN-Fake-Review-Group

---

> 分类：独立控制/数据与AI运行/安全事件处理　·　技术族：19-风控反欺诈　·　源卡：`Skill-DS-DGA-GCN-Fake-Review-Group`