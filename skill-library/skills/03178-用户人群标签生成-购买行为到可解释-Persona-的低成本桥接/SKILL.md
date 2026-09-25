---
name: "p2s-gplr-persona-generation"
title: "GPLR 用户人群标签生成 - 购买行为到可解释 Persona 的低成本桥接"
description: "触发词：人群标签生成、Persona 标注、随机游走传播、少量标注全量覆盖、新品人群识别。何时不用：要估计某种干预对不同人群的因果效应用 DML 群体异质性技能，本技能只做人群标签的生成与传播。安全边界：Persona 标签不得包含种族、宗教、健康等敏感类别，订单数据仅限内部使用不得转售，广告定向须遵守平台反歧视政策。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-101"
l3_business: "分群"
l3_all: "分群 / 需求分群"
l1_l2_l3: "业务运营/品牌与增长/分群"
p2s_card_id: "Skill-GPLR-Persona-Generation"
p2s_src_domain: "14-用户分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "只用少量人工标注，把几十万用户自动打上能看懂的人群标签。"
user_try: "试试：用我们的订单数据生成几类人群标签，并告诉我新上市的静音款主要卖给了哪类妈妈。"
whenToUse: "现有 RFM 只能区分高消费与低消费、需要可解释的人群标签且标注预算有限时用本技能；需要按人群估计因果效应用 DML 类技能，需要从购买序列推断生命周期阶段用月龄推断类技能。"
workflow: "构建用户与产品交互图 → 用不确定性采样选原型用户 → 调用大模型为原型用户标注 Persona → 在图上游走把标签传播到全量用户 → 输出 Persona 分布与素材建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# GPLR 用户人群标签生成 - 购买行为到可解释 Persona 的低成本桥接

## ① 解决的问题

业务问题：Momcozy 在 Amazon US 有 10 万+ 活跃用户，现有 RFM 分群只能区分"高消费/低消费"，营销团队无法针对"出差妈妈""新手妈妈"制定差异化素材；人工打标既慢又贵 - 数据要求：Amazon 订单数据（`user_id`, `product_id`, `purchase_date`）+ 预定义 Persona 集合（如：职场背奶妈妈 / 全职新手妈妈 / 出差旅行妈妈 / 静音敏感型 / 价格敏感型） -

## ② 核心算法逻辑

用户购买行为包含丰富的人群信号，但直接为百万用户调用 LLM 标注成本极高。GPLR 解决这个矛盾：用少量 LLM 标注 + 图结构传播覆盖全量用户。三步流程：① DiversityUncertainty（DU）采样选出最有代表性的"原型用户"做 LLM 标注；② LLM 基于购买历史为原型用户赋予 Persona 标签；③ 在用户产品交互图上随机游走，将标签从有标注用户传播至全量未标注用户。

## ③ 业务应用场景

- 业务问题：Momcozy 在 Amazon US 有 10 万+ 活跃用户，现有 RFM 分群只能区分"高消费/低消费"，营销团队无法针对"出差妈妈""新手妈妈"制定差异化素材；人工打标既慢又贵 - 数据要求：Amazon 订单数据（`user_id`, `product_id`, `purchase_date`）+ 预定义 Persona 集合（如：职场背奶妈妈 / 全职新手妈妈 / 出差旅行妈妈 / 静音敏感型 / 价格敏感型） - GPLR 配置： - 构建用户-产品交互图（购买=1.0，浏览=0.3） - DU 采样 5,000 名原型用户（5 万用户 5% 预算）→ LLM 基于
三轨验证： - 成本：LLM API 调用费约 10 元（5,000 用户 × 0.002 元/次）；图计算在单台 8 核服务器上 2 小时内完成；人力投入为 1 名数据分析师 2 天定义 Persona 集合 + 0.5 天接入 API。总显性成本 < 2,000 元。 - 合规：使用 Amazon 订单数据需确保已获得用户授权（Amazon 卖家条款通常允许内部分析，但不可用于第三方共享或再销售）；Persona 标签不得包含种族、宗教、健康等敏感类别（GDPR 第 9 条）；广告定向投放需遵守 Amazon 广告政策（禁止基于受保护特征进行歧视性投放）。 - 风险：若 Persona 标
- 业务问题：Momcozy 静音款 S12 Pro 上市 1 个月，仅有 800 条购买记录，运营不确定核心人群是"职场妈妈"还是"夜晚哺乳妈妈"；若判断错误，亚马逊广告关键词投放偏差，前 2 个月 ROI 极低 - 数据要求：新品 800 条购买记录 + 已有成熟产品 5 万条历史购买记录（图传播底座） - GPLR 配置： - 使用全品类历史用户图作为传播底座（已包含各 Persona 原型） - 新品购买用户作为待推断节点加入图 - 无需额外 LLM 标注（复用历史原型），直接随机游走 2 步得出 Persona 分布 - 输出：新品用户 Persona 分布饼图 + 主导人群推荐广告

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

现状：10 万用户 RFM 分层 3 档，广告 ROAS ≈ 3.0
GPLR 后：6 档

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（258 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after class definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/nlp_voc/gplr_persona_generation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-GPLR-Persona-Generation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
GPLR: Generating Personas with LLM and Random Walk
论文 arXiv:2504.17304 (SIGIR 2025)
完整实现见 paper2skills-code/nlp_voc/gplr_persona_generation/model.py
"""
from __future__ import annotations
import numpy as np
from typing import List, Dict, Tuple
from collections import defaultdict
from dataclasses import dataclass


@dataclass
class UserInteraction:
    user_id: str
    product_id: str
    interaction_type: str  # 'purchase', 'view', 'review'
    timestamp: str
    value: float = 1.0


class InteractionGraph:
    """用户-产品交互图"""

    def __init__(self):
        self.interactions: Dict[str, List[UserInteraction]] = defaultdict(list)
        self._user_set: set = set()

    def add_interaction(self, interaction: UserInteraction):
        self.interactions[interaction.user_id].append(interaction)
        self._user_set.add(interaction.user_id)

    def build_index(self):
        self.user_ids = list(self._user_set)
        self.user_to_idx = {u: i for i, u in enumerate(self.user_ids)}

    def get_user_interactions(self, user_id: str) -> List[UserInteraction]:
        return self.interactions.get(user_id, [])

    def get_user_index(self, user_id: str) -> int:
        return self.user_to_idx.get(user_id, -1)

    def get_similar_users(self, user_idx: int, top_k: int = 10) -> List[Tuple[int, float]]:
        """Jaccard 相似度找相似用户"""
        user_id = self.user_ids[user_idx]
        user_products = set(i.product_id for i in self.interactions[user_id])
        sims = []
        for other_id, other_idx in self.user_to_idx.items():
            if other_id == user_id:
                continue
            other_products = set(i.product_id for i in self.interactions[other_id])
            union = user_products | other_products
            if union:
                sim = len(user_products & other_products) / len(union)
                sims.append((other_idx, sim))
        sims.sort(key=lambda x: -x[1])
        return sims[:top_k]


class GPLRProfiler:
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2504.17304 — You Are What You Bought: Generating Customer Personas for E-commerce Applications

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：订单数据（用户、商品、购买时间）与浏览等交互记录、预定义 Persona 集合（如职场背奶妈妈、全职新手妈妈、出差旅行妈妈、静音敏感型、价格敏感型）；新品场景另需成熟产品的历史购买记录作为图传播底座。

**输出**：全量用户的 Persona 标签与人群分布（新品场景输出 Persona 分布饼图与主导人群推荐），供营销团队做差异化素材与广告关键词投放；卡页口径把 10 万用户的 RFM 三档细化为六档。

## 执行步骤

1. 构建用户与产品交互图，按购买、浏览等行为分配边权重。
2. 用不确定性采样选出少量原型用户做标注。
3. 由大模型依据购买历史为原型用户赋予 Persona 标签。
4. 在交互图上随机游走，把标签传播至全量未标注用户。
5. 输出 Persona 分布与主导人群的素材、关键词投放建议。

## 边界与不做

- 交互图中购买与浏览记录过于稀疏、或没有预定义 Persona 集合时不要用，标签传播无法收敛到稳定人群。
- 能力边界：传播得到的标签是概率推断，不等于用户真实身份，不能作为个体级决策依据；卡页的分层数量与 ROAS 为特定口径。
- 合规红线：Persona 标签不得包含种族、宗教、健康等敏感类别，订单数据仅限内部使用不得转售，广告定向须遵守平台反歧视政策。

## 技能关联

- **前置**：Skill-Cohort-Retention-Analysis.html、Skill-Cohort-Retention-Analysis、Skill-User-Funnel-Analysis.html、Skill-User-Funnel-Analysis
- **延伸**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-MAA-Review-to-Action-Decision.html、Skill-MAA-Review-to-Action-Decision
- **可组合**：Skill-DARA-Agentic-MMM-Optimizer.html、Skill-DARA-Agentic-MMM-Optimizer、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling、Skill-GPLR-Persona-Generation

---

> 分类：业务运营/品牌与增长/分群　·　技术族：14-用户分析　·　源卡：`Skill-GPLR-Persona-Generation`