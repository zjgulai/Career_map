---
name: "p2s-llm-augmented-recommendation"
title: "LLM Augmented Recommendation — 大语言模型增强个性化推荐：自然语言驱动的跨域用户意图理解"
description: "触发词：LLM 推荐、自然语言意图、新用户冷启动、语义相似度、澄清追问。何时不用：要做多语言语义 ID 检索用「语义 ID 检索 RPG」；要生成商品嵌入做新品推荐用「扩散模型推荐」。安全边界：用户自然语言输入属个人信息，采集与使用须告知并获同意；语义相似度阈值低于卡页建议下限时会引入噪声商品，不得直接上线。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-070"
l3_business: "转化优化"
l3_all: "转化优化 / 搜索意图分析"
l1_l2_l3: "业务运营/渠道经营/转化优化"
p2s_card_id: "Skill-LLM-Augmented-Recommendation"
p2s_src_domain: "05-推荐系统"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "新用户还没行为数据也没关系：让他一句话说想要什么，系统按语义把商品排出来。"
user_try: "试试：给这位只注册没下单的用户，用他填的一句需求做语义召回并排出首屏推荐。"
whenToUse: "当新用户缺历史行为（卡页示例约 65% 新用户首屏浏览不超过 3 个商品就跳出）、需要靠自然语言与商品文本对齐意图时用本技能；要做多语言语义 ID 检索用「语义 ID 检索 RPG」；要生成嵌入做新品推荐用「扩散模型推荐」。"
workflow: "收集用户自然语言需求与商品 Title、Description、Category → 把商品与需求文本编码到同一语义空间 → 用语义权重 α 调冷启动与热启动的融合比例 → 澄清熵偏高时先生成澄清问题再推荐 → 按 Grounding 相似度阈值过滤噪声商品"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLM Augmented Recommendation — 大语言模型增强个性化推荐：自然语言驱动的跨域用户意图理解

## ① 解决的问题

母婴跨境电商新用户注册率高但转化低，约 65% 新用户第一屏浏览 ≤3 个商品后跳出

## ② 核心算法逻辑

传统推荐系统（Matrix Factorization、深度 CTR 模型）将用户行为编码为稠密向量，擅长捕捉行为规律，但无法理解用户用自然语言表达的复杂意图（如"适合3个月宝宝添加辅食前的益智玩具"）。LLM 增强推荐的核心思路是：以 LLM 为语义桥梁，将自然语言偏好、物品描述、上下文对话统一嵌入到推荐打分过程中，而非单独依赖协同过滤信号。

## ③ 业务应用场景

业务背景：母婴跨境电商新用户注册率高但转化低，约 65% 新用户第一屏浏览 ≤3 个商品后跳出。原因是传统推荐依赖历史行为，新用户无行为数据，只能展示热销榜单，命中率低。
量化 ROI：以月均 5000 新用户计算，首单转化率提升 4.7pp，平均客单价 $85， 额外月增收入：5000 × 4.7% × $85 ≈ $20,000/月
数据要求： - 注册时用户自然语言输入（可选） - 物品 Title/Description/Category（标准 Feed） - 可选：用户历史（冷启动场景无需）

## ④ 输入数据要求

`alpha`（语义权重）：冷启动用 0.7-0.9，热启动用 0.2-0.4
`CLARIFICATION_ENTROPY_THRESHOLD`：调低 → 更多澄清问题（精准但体验差），调高 → 更快推荐（体验好但不精准）
Grounding 相似度阈值：建议 0.3 以上，过低会引入噪声物品

## ⑤ 输出结果

`alpha`（语义权重）：冷启动用 0.7-0.9，热启动用 0.2-0.4
`CLARIFICATION_ENTROPY_THRESHOLD`：调低 → 更多澄清问题（精准但体验差），调高 → 更快推荐（体验好但不精准）
Grounding 相似度阈值：建议 0.3 以上，过低会引入噪声物品

## ⑥ 业务价值 / ROI

100万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（463 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：7」并记录位置 `paper2skills-code/recommendation/llm_augmented_recommendation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/05-推荐系统/Skill-LLM-Augmented-Recommendation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
LLM Augmented Recommendation
整合 LLMRec (语义增强) + BIGRec (LLM直接生成) + RecAgent (多轮对话)
母婴电商场景 mock 实现，含完整测试
"""

from __future__ import annotations

import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from collections import defaultdict


# ── 数据模型 ─────────────────────────────────────────────────────────────

@dataclass
class Item:
    """母婴商品"""
    item_id: str
    title: str
    category: str
    age_range: str          # 如 "0-6months", "6-12months"
    price: float
    safety_cert: str        # 如 "ASTM", "EN71", "CPSC"
    embedding: Optional[np.ndarray] = None  # 语义向量（LLM 生成）

    def to_text(self) -> str:
        return f"{self.title}，适用{self.age_range}，{self.category}，${self.price}，{self.safety_cert}"


@dataclass
class User:
    """用户"""
    user_id: str
    history: List[str] = field(default_factory=list)     # item_id 列表（时间倒序）
    cf_embedding: Optional[np.ndarray] = None            # 协同过滤向量
    sem_embedding: Optional[np.ndarray] = None           # 语义向量（LLM 增强）
    natural_language_pref: str = ""                      # 自然语言偏好描述


# ── LLMRec：语义增强推荐 ──────────────────────────────────────────────────

class LLMRecModel:
    """
    LLMRec：三类 Augmentation + 融合推荐
    简化版：用 TF-IDF 语义相似度模拟 LLM Embedding
    """

    def __init__(self, embedding_dim: int = 64):
        self.embedding_dim = embedding_dim
        self._item_registry: Dict[str, Item] = {}
        self._vocab: Dict[str, int] = {}

    def register_items(self, items: List[Item]):
        """注册物品库，构建词汇表并生成 mock Embedding"""
        for item in items:
            self._item_registry[item.item_id] = item
            for word in item.to_text().lower().split():
                if word not in self._vocab:
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2310.10108 — On Generative Agents in Recommendation

核验口径：主题指向成立但强度不足（词重合 0.25／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：用户注册时的自然语言输入（可选）、商品 Title/Description/Category 标准 Feed、可选的用户历史（冷启动场景无需），以及语义权重 α、澄清熵阈值、Grounding 相似度阈值等配置（卡页建议冷启动 α 取 0.7-0.9、热启动 0.2-0.4，Grounding 阈值 0.3 以上）；粒度为单用户 × 单次请求。

**输出**：语义对齐后的推荐列表与必要的澄清问题；供推荐工程与产品在冷启动场景上线。

## 执行步骤

1. 收集用户自然语言需求与商品文本 Feed
2. 把商品与需求编码到同一语义空间
3. 按冷启动 0.7-0.9、热启动 0.2-0.4 设置语义权重
4. 熵值偏高时先向用户抛一两个澄清问题
5. 用 Grounding 阈值过滤噪声并输出推荐

## 边界与不做

- 数据不满足：商品 Feed 缺 Title、Description、Category 时文本无法对齐，先补齐商品内容。
- 何时不用：要多语言语义 ID 检索用「语义 ID 检索 RPG」；要生成商品嵌入用「扩散模型推荐」。
- 能力边界：只做语义对齐与澄清追问，不做商品知识补全，也不保证卡页口径的转化提升。
- 安全边界：用户自然语言输入属个人信息，采集使用须告知并获同意；语义阈值低于卡页建议的 0.3 量级时不得直接上线。

## 技能关联

- **前置**：Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-SQL-Agent-Text-to-SQL.html、Skill-SQL-Agent-Text-to-SQL
- **延伸**：Skill-Cold-Start-Product-Recommendation.html、Skill-Cold-Start-Product-Recommendation
- **可组合**：Skill-DeepAnalyze-Autonomous-Data-Science-Agent.html、Skill-DeepAnalyze-Autonomous-Data-Science-Agent、Skill-KG-Augmented-Recommendation-CoLaKG.html、Skill-KG-Augmented-Recommendation-CoLaKG、Skill-LLM-Augmented-Recommendation

---

> 分类：业务运营/渠道经营/转化优化　·　技术族：05-推荐系统　·　源卡：`Skill-LLM-Augmented-Recommendation`