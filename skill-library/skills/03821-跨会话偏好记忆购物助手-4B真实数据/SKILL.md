---
name: "p2s-shopping-companion-agent"
title: "Shopping Companion — 跨会话偏好记忆购物助手（4B≈GPT-5，Lazada真实数据）"
description: "触发词：跨会话导购、偏好记忆、奶粉升阶、主动推荐、产品问答。何时不用：单次会话导购用「对话式商务 Agent」；本技能强调记忆驱动的阶段升级推荐。安全边界：涉及婴配食品与过敏信息时不得替代医生建议，须提示咨询专业人员。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-108"
l3_business: "选购指导"
l3_all: "选购指导 / 产品问答"
l1_l2_l3: "业务运营/服务与体验/选购指导"
p2s_card_id: "Skill-Shopping-Companion-Agent"
p2s_src_domain: "14-用户分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "记得你上次买的是哪段奶粉，宝宝满 6 个月时主动提醒升阶，并对齐同品牌有机配方。"
user_try: "试试：这位用户上个月买了 Stage 1 奶粉，宝宝快 6 个月了，帮她找 Stage 2 的合适款。"
whenToUse: "当需要把历史偏好结构化并在新会话主动调用、做阶段升级推荐时用；短期会话内导购用「对话式商务 Agent」。"
workflow: "首次会话提取偏好并写入记忆 → 后续会话调出记忆检索同品牌同阶段商品 → 校验有机、无添加糖与过敏排除项 → 输出推荐并更新偏好记忆"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Shopping Companion — 跨会话偏好记忆购物助手（4B≈GPT-5，Lazada真实数据）

## ① 解决的问题

业务痛点：用户上月购买 Stage 1 奶粉（0-6月龄），宝宝即将 6 个月，需要升阶

## ② 核心算法逻辑

传统推荐系统的致命缺陷：每次会话从零开始——用户上周告诉导购"我要有机配方奶"，下次进来又要重新解释，累计咨询成本极高，转化率低。Shopping Companion 的创新在于构建跨会话长期偏好记忆，将用户偏好结构化存储，Agent 可在后续会话中直接调用，像"私人导购"一样记住每位用户的长期喜好。

## ③ 业务应用场景

业务痛点：用户上月购买 Stage 1 奶粉（0-6月龄），宝宝即将 6 个月，需要升阶。传统推荐系统没有记忆——用户进来需要重新搜索，极易被竞品截流。
Shopping Companion 的工作方式：
| 时间节点 | Agent 行为 | 业务价值 | |---------|-----------|---------| | 会话 1（购买 Stage 1） | 偏好识别：`brand=Aptamil, organic=True, stage=1, price_max=80` | 写入偏好记忆 | | 会话 2（6周后） | 调出记忆 → 搜索 Stage 2 同品牌有机配方 → 验证符合偏好 → 推荐 | 主动推荐，无需用户重复说明 | | 会话 3（添加辅食） | 偏好扩展：`category_history=[formula], allergies=dairy_sensitive` →

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

导购成本节省：60% × 5人导购 × 年薪 15万 = 45万元/年
复购率提升 20%：年复购 GMV 假设 2000万 × 20% = 400万元/年
合计潜在 ROI：445万元/年
基础版（规则偏好提取 + 结构化存储）：1 周内可落地
进阶版（微调 4B 模型）：需要 1-3 个月的业务对话数据标注
基础设施：Redis/数据库存储偏好记忆，无需复杂 MLOps

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（345 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/user_analytics/shopping_companion_agent` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-Shopping-Companion-Agent.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Shopping Companion Agent — 跨会话偏好记忆购物助手
论文: Shopping Companion: Benchmarking and Training LLM Agents
      for Long-Horizon Preference-Grounded E-Commerce Tasks
arXiv:2603.14864 | 2026年3月 | 基于 Lazada.com 120万真实商品
核心结论: 4B 小模型 72.5% ≈ GPT-5 74.0%（双奖励 RL 定向训练）
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from datetime import datetime
import numpy as np


@dataclass
class UserPreference:
    """用户偏好维度数据类"""
    brand: Optional[str] = None                     # 偏好品牌
    organic: Optional[bool] = None                  # 有机认证需求
    price_range: tuple = (0, 999)                   # 价格区间 (min, max)
    category_history: List[str] = field(default_factory=list)  # 购买品类历史
    certifications: List[str] = field(default_factory=list)    # 证书偏好 (EU-organic, DIN EN)
    allergies: List[str] = field(default_factory=list)         # 过敏/排除成分
    no_added_sugar: Optional[bool] = None           # 无添加糖需求
    stage: Optional[int] = None                     # 婴儿月龄阶段 (1/2/3)
    last_updated: str = field(default_factory=lambda: datetime.now().isoformat())


@dataclass
class Product:
    """商品数据类"""
    product_id: str
    name: str
    brand: str
    price: float
    category: str
    organic: bool = False
    certifications: List[str] = field(default_factory=list)
    ingredients: List[str] = field(default_factory=list)
    stage: Optional[int] = None
    rating: float = 4.0


@dataclass
class RecommendationResult:
    """推荐结果"""
    products: List[Product]
    match_explanations: List[str]
    tool_reward: float
    result_reward: float
    total_reward: float


class PreferenceMemory:
    """
    跨会话用户偏好存储/更新/检索
    核心设计：结构化 key-value 存储（非向量），可解释可编辑
    """

    def __init__(self):
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2603.14864 — Shopping Companion: Benchmarking and Training LLM Agents for Long-Horizon Preference-Grounded E-Commerce Tasks
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：用户历史会话与购买记录、结构化商品库（品牌、价格、有机标识、成分、阶段、评分）。

**输出**：结构化用户偏好（品牌、有机、价格区间、品类历史、过敏排除、阶段）与带理由的推荐结果，供导购与复购触达使用。

## 执行步骤

1. 从历史会话抽取品牌、有机、价格区间与阶段偏好
2. 把偏好写入长期记忆并记录更新时间
3. 在新会话调出记忆并检索符合条件的商品
4. 校验成分与过敏排除项后给出推荐
5. 把本次交互的新偏好回写记忆

## 边界与不做

- 何时不用：历史会话与结构化商品库任一缺失时，冷启动用户无法主动推荐
- 能力边界：只做偏好驱动的推荐，不给医学或营养建议，过敏相关问题须提示咨询专业人员

## 技能关联

- **前置**：Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-Agent-Memory-Learning.html、Skill-Agent-Memory-Learning、Skill-Long-Term-Preference-Memory.html、Skill-Long-Term-Preference-Memory
- **延伸**：Skill-Counterfactual-Recommendation-DCE.html、Skill-Counterfactual-Recommendation-DCE、Skill-New-Product-Opportunity-Mining.html、Skill-New-Product-Opportunity-Mining
- **可组合**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-User-Lifecycle-STAN.html、Skill-User-Lifecycle-STAN、Skill-Shopping-Companion-Agent

---

> 分类：业务运营/服务与体验/选购指导　·　技术族：14-用户分析　·　源卡：`Skill-Shopping-Companion-Agent`