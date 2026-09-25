---
name: "p2s-mas-collaborative-recommendation"
title: "MAS Collaborative Recommendation — 多智能体协同个性化推荐：LLM Agent 异构协作框架"
description: "触发词：多智能体协同、异构Agent、多维评分、推荐融合。何时不用：单一目标即可决策时用常规评分模型；没有多智能体调用预算时不用本卡。安全边界：认证与合规维度（FDA、CE）的判断只作提示，准入结论须由合规负责人确认。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-023"
l3_business: "组合取舍"
l3_all: "组合取舍 / 转化优化"
l1_l2_l3: "业务运营/产品与创新/组合取舍"
p2s_card_id: "Skill-MAS-Collaborative-Recommendation"
p2s_src_domain: "05-推荐系统"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "让趋势、合规、价格、偏好四个方向的智能体协作打分，给出更均衡的推荐结论。"
user_try: "试试：帮我串一组智能体，同时从趋势、认证、价格和用户偏好四个角度评估这批新品。"
whenToUse: "本卡属「组合取舍」。选品或推荐需要同时平衡趋势、合规、价格与用户偏好多个维度时用本卡；只有单一目标（例如纯价格最优）时用常规评分模型。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# MAS Collaborative Recommendation — 多智能体协同个性化推荐：LLM Agent 异构协作框架

## ① 解决的问题

业务背景：跨境母婴电商选品需要同时考虑：① 当前趋势（TikTok热词）② 安全认证（FDA/CE）③ 价格竞争力 ④ 用户历史偏好

## ② 核心算法逻辑

传统推荐系统是单一模型的端到端优化，难以整合多维用户意图（价格敏感、品牌偏好、安全认证关注）。MAS Collaborative Recommendation 将推荐任务分解为多个专业化 LLM Agent 的协作问题：

## ③ 业务应用场景

业务背景：跨境母婴电商选品需要同时考虑：① 当前趋势（TikTok热词）② 安全认证（FDA/CE）③ 价格竞争力 ④ 用户历史偏好。单一模型无法均衡处理这四个维度。
MAS Collaborative Recommendation 应用：
业务背景：母婴跨境供应商评估新 SKU 时，需要同时考虑：市场需求预测、竞品分析、合规审查、利润测算。AIM 系统当前用人工判断，效率低、一致性差。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

`final_score`：综合所有 Agent 加权 + MF 锚定后的最终分
`explanation`：包含主要决策 Agent 和具体推理链，可直接展示给用户

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（530 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：5」并记录位置 `paper2skills-code/recommendation/mas_collaborative_recommendation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/05-推荐系统/Skill-MAS-Collaborative-Recommendation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
MAS Collaborative Recommendation: 多智能体协同个性化推荐
整合 MF 基础分 + 专业化 LLM Agent + Orchestrator 动态路由 + 协商机制
完全使用 mock 数据，无需真实 LLM API
"""

import numpy as np
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional, Tuple
from abc import ABC, abstractmethod


# ── 数据结构 ──────────────────────────────────────────────────────────────────

@dataclass
class UserQuery:
    """用户查询（含意图向量）"""
    user_id: str
    query_text: str
    age_group: str = "0-12m"       # 宝宝月龄段
    price_budget: float = 50.0     # 价格上限
    quality_concern: float = 0.7   # 质量关注度 [0,1]
    price_sensitivity: float = 0.5 # 价格敏感度 [0,1]
    trend_sensitivity: float = 0.3 # 趋势敏感度 [0,1]

    @property
    def intent_vector(self) -> np.ndarray:
        """3维意图向量：[质量, 价格, 趋势]"""
        return np.array([
            self.quality_concern,
            self.price_sensitivity,
            self.trend_sensitivity,
        ])


@dataclass
class Product:
    """商品信息（用于 Agent 评分）"""
    product_id: str
    name: str
    price: float
    category: str
    safety_cert: List[str] = field(default_factory=list)  # ["FDA", "BPA-free", "CE"]
    age_range: Tuple[int, int] = (0, 36)    # 适用月龄范围
    rating: float = 4.0
    bsr_rank: int = 1000                    # Amazon Best Seller Rank
    is_trending: bool = False


@dataclass
class AgentOutput:
    """单个 Agent 的推荐输出"""
    agent_name: str
    scores: Dict[str, float]            # {product_id: score}
    reasoning: Dict[str, str]           # {product_id: 推荐理由}
    confidence: float = 1.0             # Agent 对自身输出的置信度


# ── 专业化 Agent 基类 ─────────────────────────────────────────────────────────
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2310.09233 — AgentCF: Collaborative Learning with Autonomous Language Agents for Recommender Systems

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：用户查询与意图向量、候选商品信息（类目、价格、认证状态），以及各维度专家 Agent 的评分口径。

**输出**：各 Agent 的推荐输出与聚合后的协同推荐结论，含各维度得分、分歧点与最终推荐排序。

## 执行步骤

1. 定义用户查询与意图向量
2. 为趋势、合规、价格、偏好维度分别配置专业化 Agent
3. 各 Agent 独立输出推荐评分与理由
4. 聚合异构 Agent 结果生成协同推荐结论

## 边界与不做

- 单一维度即可决策、或没有多智能体调用预算时不用本卡
- 本卡只产出推荐结论与理由，认证与准入结论须由合规负责人复核

## 技能关联

- **前置**：Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization
- **延伸**：Skill-Cold-Start-Product-Recommendation.html、Skill-Cold-Start-Product-Recommendation
- **可组合**：Skill-LLM-AutoBidding-MAS.html、Skill-LLM-AutoBidding-MAS、Skill-MAS-Dynamic-KG-Collaboration.html、Skill-MAS-Dynamic-KG-Collaboration、Skill-MAS-Collaborative-Recommendation

---

> 分类：业务运营/产品与创新/组合取舍　·　技术族：05-推荐系统　·　源卡：`Skill-MAS-Collaborative-Recommendation`