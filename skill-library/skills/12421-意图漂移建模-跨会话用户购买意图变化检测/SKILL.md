---
name: "p2s-session-intent-shift"
title: "Session意图漂移建模 - 跨会话用户购买意图变化检测"
description: "触发词：意图漂移、意图树、路径语义标签、跨会话意图、探索型比价型。何时不用：只做页面级漏斗流失定量定位时用「用户旅程分析」；只做旅程序列原型聚类与流失风险名单时用「客户旅程序列原型检测」。安全边界：跨会话行为与商品偏好属个人信息，须获授权并去标识化后建模，标签仅用于流量结构理解与合规触达。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-068"
l3_business: "漏斗诊断"
l3_all: "漏斗诊断 / 转化优化"
l1_l2_l3: "业务运营/渠道经营/漏斗诊断"
p2s_card_id: "Skill-Session-Intent-Shift"
p2s_src_domain: "14-用户分析"
quality_tier: "preview"
user_summary: "给每条流量路径贴上意图标签，说明用户是目标型、探索型还是比价型，让桑基图讲得出人话。"
user_try: "试试：给我这张桑基图的每条路径标注意图语义标签，并按探索型、比较型、目标购买分阶段，说明哪类意图在加购后流失。"
whenToUse: "需要给桑基图路径边补上为什么走这条路的语义标签、并检测跨会话意图漂移时用本技能；只做定量流失节点定位时用「用户旅程分析」；只做旅程序列原型聚类与风险名单时用「客户旅程序列原型检测」；需要用户画像分群时用「PersonaBot RAG画像生成」。"
workflow: "按用户跨会话整理事件序列并关联商品属性 → 为每个会话逐步构建意图条目（意图描述、驱动属性、与上一商品的比较依据） → 生成意图向量并计算余弦相似度与属性变化得到漂移分 → 把意图语义标签回写到桑基图各条路径边 → 汇总意图演化阶段（探索、比较、目标购买）分布并输出运营解读"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Session意图漂移建模 - 跨会话用户购买意图变化检测

## ① 解决的问题

业务问题：桑基图展示了页面间流量（如"首页→分类页→PDP→加购→支付"），但缺少"为什么用户走这条路"的语义信息

## ② 核心算法逻辑

现有电商推荐系统多依赖商品标题、价格等表层属性推断用户意图，且只关注单次购买或单会话内的短期偏好变化。SessionIntentBench 的核心创新在于：提出意图树（Intention Tree）概念，通过跨会话建模用户意图的时序演化，构建大规模多模态意图基准。

## ③ 业务应用场景

业务问题：桑基图展示了页面间流量（如"首页→分类页→PDP→加购→支付"），但缺少"为什么用户走这条路"的语义信息。例如同样是"PDP → 加购"路径，有的用户是目标型（直接搜索特定型号奶粉来购买），有的是探索型（随机浏览发现心仪产品），有的是比价型（连续访问多个 PDP 后才加购）。意图漂移检测可以为桑基图每条路径的"边"标注语义标签，让运营人员直观理解流量结构。
| 字段 | 类型 | 示例 | |------|------|------| | user_id | string | "usr_abc123" | | session_id | string | "sess_2026042001" | | event_type | category | "view" / "click" / "add_cart" / "purchase" | | page_type | category | "homepage" / "category" / "pdp" / "cart" / "checkout" | | product_id | string | "ASI
最低要求：至少3个连续商品访问构成一个完整会话，有可提取的商品属性信息。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

+18%而非+28%；技术维护成本隐性增加

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（623 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/user_analytics/session_intent_shift` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-Session-Intent-Shift.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Session Intent Shift Detection — 跨会话意图漂移检测
arXiv: 2507.20185 | SessionIntentBench (ACL 2026 Findings)

功能：
  1. 从会话数据构建意图树（规则+embedding模拟LLM意图推断）
  2. 跨会话意图漂移检测（余弦相似度 + 属性变化追踪）
  3. 为桑基图路径标注意图语义标签
  4. 意图演化阶段预测（探索/比较/目标购买）

环境依赖: pip install numpy scikit-learn
可选依赖: pip install openai  # 如需接入真实LLM意图推断
"""

import math
import random
import hashlib
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# ─────────────────────────────────────────────
# 1. 数据结构
# ─────────────────────────────────────────────

@dataclass
class Product:
    """电商商品（母婴品类）"""
    product_id: str
    title: str
    category: str          # 品类：如 "Baby Formula", "Stroller", "Diaper"
    price: float
    attributes: Dict[str, str] = field(default_factory=dict)
    # 例：{"material": "organic", "age_range": "0-6m", "brand": "Similac"}

    def get_embedding(self, dim: int = 32) -> np.ndarray:
        """
        模拟商品向量表示（真实场景可替换为 text-embedding-ada-002 等）
        用商品属性的哈希值生成确定性伪随机向量
        """
        seed_str = f"{self.category}|{self.price:.0f}|" + "|".join(
            f"{k}:{v}" for k, v in sorted(self.attributes.items())
        )
        seed = int(hashlib.md5(seed_str.encode()).hexdigest(), 16) % (2**31)
        rng = np.random.RandomState(seed)
        vec = rng.randn(dim).astype(np.float32)
        return vec / (np.linalg.norm(vec) + 1e-9)


@dataclass
class IntentionEntry:
    """单步意图条目（对应论文中 Intention Tree 的一个节点）"""
    step: int               # 在会话中的时间步
    intent_text: str        # 意图描述，如 "寻找有机奶粉，追求性价比"
    key_attribute: str      # 驱动此意图的关键属性，如 "price: affordable"
    comparison: str         # 与上一商品的比较依据（Task3 输入）
    intent_vector: np.ndarray = field(default_factory=lambda: np.zeros(32))

    def drift_score(self, other: "IntentionEntry") -> float:
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2507.20185 — SessionIntentBench: A Multi-task Inter-session Intention-shift Modeling Benchmark for E-commerce Customer Behavior Understanding

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：跨会话行为数据：user_id、session_id、event_type（view/click/add_cart/purchase）、page_type（homepage/category/pdp/cart/checkout）、product_id，以及商品属性（category、price、attributes如material、age_range、brand）；格式为按用户跨会话、会话内按时间排序的事件序列；必要下限为每个会话至少3个连续商品访问且商品属性可提取，否则无法构建意图树。

**输出**：每个会话的意图树（每步的意图描述intent_text、驱动属性key_attribute、与上一商品的比较依据comparison、意图向量）、跨会话意图漂移分（drift_score）、桑基图路径边的意图语义标签，以及会话所处的意图演化阶段（探索、比较、目标购买）；供运营理解流量结构与路径成因，支撑针对性的推荐与干预。

## 执行步骤

1. 采集跨会话行为事件并关联商品属性
2. 逐会话构建意图树并生成意图条目
3. 计算相邻条目与跨会话的意图漂移分
4. 判定每个会话所处的意图阶段（探索、比较、目标购买）
5. 为桑基图路径边标注意图语义标签
6. 输出漂移显著的用户与路径清单供运营解读

## 边界与不做

- 数据不满足：会话内商品访问少于3次、缺少event_type与page_type，或商品属性无法提取时构建不出意图树与漂移分，需先补齐事件埋点与商品属性字段。
- 何时不用：只需页面级流失节点定量定位时用「用户旅程分析」；只需旅程序列原型聚类与流失风险名单时用「客户旅程序列原型检测」；需要用户画像分群时用「PersonaBot RAG画像生成」。
- 能力边界：输出意图树、漂移分与语义标签，属解读与标注层，不做推荐排序，也不替代推荐系统或CRM触达。
- 安全边界：跨会话行为与商品偏好属个人信息，须获授权并去标识化后建模，标签仅用于流量结构理解与合规触达。

## 技能关联

- **前置**：Skill-Cohort-Retention-Analysis.html、Skill-Cohort-Retention-Analysis、Skill-PersonaBot-RAG-Profiling.html、Skill-PersonaBot-RAG-Profiling、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-TRACE-Clickstream-Embedding.html、Skill-TRACE-Clickstream-Embedding、Skill-Trajectory-Pattern-Mining.html、Skill-Trajectory-Pattern-Mining
- **延伸**：Skill-Cohort-Retention-Analysis.html、Skill-Cohort-Retention-Analysis、Skill-PersonaBot-RAG-Profiling.html、Skill-PersonaBot-RAG-Profiling、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **可组合**：Skill-Cohort-Retention-Analysis.html、Skill-Cohort-Retention-Analysis、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Session-Intent-Shift

---

> 分类：业务运营/渠道经营/漏斗诊断　·　技术族：14-用户分析　·　源卡：`Skill-Session-Intent-Shift`