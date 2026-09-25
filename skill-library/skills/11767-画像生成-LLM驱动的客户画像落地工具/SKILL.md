---
name: "p2s-personabot-rag-profiling"
title: "PersonaBot RAG画像生成 - LLM+RAG驱动的客户画像落地工具"
description: "触发词：评论画像生成、RAG 画像、需求分群、痛点提炼、画像证据溯源。何时不用：只做购买行为分层用 RFM 类技能，从购买序列推断生命周期阶段用月龄推断技能，本技能从评论文本生成可溯源的人群画像。安全边界：评论数据获取须遵守平台服务条款与授权范围，画像不得用于差异化定价，广告宣称须有实测数据支撑。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-101"
l3_business: "分群"
l3_all: "分群 / 需求分群 / 用户访谈分析"
l1_l2_l3: "业务运营/品牌与增长/分群"
p2s_card_id: "Skill-PersonaBot-RAG-Profiling"
p2s_src_domain: "14-用户分析"
quality_tier: "preview"
user_summary: "把几万条评论变成带证据的用户画像，看清不同妈妈各自在意什么。"
user_try: "试试：用 S9 系列的评论生成职场背奶妈妈和新手妈妈两份画像，每条结论都给出评论出处。"
whenToUse: "有足量评论或访谈文本、需要识别不同人群的需求与痛点差异时用本技能；只按购买行为分层用 RFM 类技能，做购买序列的生命周期推断用月龄推断类技能。"
workflow: "按用户聚合评论 → 用关键词切出人群分群 → 检索证据并生成结构化画像 → 输出话题分布与痛点清单 → 把画像交给文案与产品迭代"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# PersonaBot RAG画像生成 - LLM+RAG驱动的客户画像落地工具

## ① 解决的问题

Momcozy 在 Amazon US 的 S9/S12 系列累积数万条评论，但产品团队只能依赖人工抽查了解用户诉求，无法识别"职场背奶妈妈"与"新手妈妈"在痛点上的差异，导致广告文案和详情页对所有人说同样的话，转化率损耗严重 - 数据要求： - Amazon Review 数据（user_id、product_id、评论文本、评分、时间戳），CSV 格式 - 数量：每 SKU ≥ 50

## ② 核心算法逻辑

传统用户画像依赖人工访谈或问卷，周期长（数周）、主观性强、难以规模化更新。PersonaBot 的核心创新是：把 RAG（检索增强生成）与 LLM 结合，将原始评论/调研文本自动转化为结构化画像。RAG 负责"锚定事实"——从真实数据中检索支撑证据，LLM 负责"语义理解"——识别需求、痛点、场景并组织成可读画像。两者结合既保证画像可溯源（每个维度都有评论证据），又保证语义理解深度（超越关键词匹配）。

## ③ 业务应用场景

- 业务问题：Momcozy 在 Amazon US 的 S9/S12 系列累积数万条评论，但产品团队只能依赖人工抽查了解用户诉求，无法识别"职场背奶妈妈"与"新手妈妈"在痛点上的差异，导致广告文案和详情页对所有人说同样的话，转化率损耗严重 - 数据要求： - Amazon Review 数据（user_id、product_id、评论文本、评分、时间戳），CSV 格式 - 数量：每 SKU ≥ 500 条评论以覆盖多种用户类型 - 执行步骤： 1. 调用 `ReviewRetriever` 按用户聚合评论 2. 用关键词分群（`['上班', '公司', '背奶']` → 职场群体） 3. `
三轨验证： - 成本：显性成本包括 LLM API 调用费（约 100-500 元/月，按 10 万条评论/月计算）、数据存储费用（约 200 元/月）、1 名数据工程师 2 周开发人力（约 1.5 万元一次性）。总年化显性成本约 3-5 万元。 - 合规：Amazon 评论数据抓取需遵守 Amazon 服务条款（ToS），禁止未经授权的爬虫；使用公开 API 或授权数据源（如 Amazon Advertising API）合规；GDPR 要求用户画像生成需有合法利益基础，且用户有权要求删除画像数据；广告文案需避免虚假宣传（如"静音"需有实测数据支撑）。 - 风险：若分群画像被用于差异化定价（
- 业务问题：Momcozy 新品上市后，3 星以下评论散落在评论区，产品团队难以快速提炼"高频结构性缺陷"与"偶发性用户误操作"，导致产品迭代方向模糊 - 数据要求： - 评分 ≤ 3 的低分评论子集（最近 90 天），user_id + 评论文本 - 建议量：每 SKU ≥ 200 条负面评论 - 执行步骤： 1. 过滤低分评论构建"差评语料" 2. `generate_segment_persona(segment_name='低分用户', keywords=['差', '烂', '噪音', '坏'])` 3. 输出 `topic_distribution`（噪音/清洗/续航等维度频率）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

20-40 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（238 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/nlp_voc/personabot_rag_profiling` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-PersonaBot-RAG-Profiling.md`），已与卡面节选核对，不依赖上述路径。

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PersonaBot RAG用户画像生成 - 母婴出海业务模板
代码路径: paper2skills-code/nlp_voc/personabot_rag_profiling/model.py
"""

import numpy as np
from typing import List, Dict
from dataclasses import dataclass, asdict
from collections import defaultdict


@dataclass
class Review:
    """评论数据结构（对接 Amazon Review API 导出格式）"""
    review_id: str
    user_id: str
    product_id: str
    text: str
    rating: int
    timestamp: str


@dataclass
class PersonaSchema:
    """用户画像输出结构"""
    demographics: Dict[str, str]    # 人口统计/角色标签
    needs: List[str]                 # 核心需求列表
    pain_points: List[str]           # 痛点列表
    preferences: List[str]           # 产品偏好
    usage_scenarios: List[str]       # 使用场景
    persona_summary: str             # 一句话画像摘要


class ReviewRetriever:
    """
    RAG 检索器（简化版，生产环境替换为 FAISS/Chroma 向量检索）

    生产替换指南:
        from langchain_community.vectorstores import Chroma
        from langchain_openai import OpenAIEmbeddings
        vectorstore = Chroma.from_texts(review_texts, OpenAIEmbeddings())
        docs = vectorstore.similarity_search(query, k=5)
    """

    def __init__(self, reviews: List[Review]):
        self.reviews = reviews
        self.user_reviews = defaultdict(list)
        for r in reviews:
            self.user_reviews[r.user_id].append(r)

    def retrieve_by_user(self, user_id: str) -> List[Review]:
        return self.user_reviews.get(user_id, [])

    def retrieve_similar_users(self, user_id: str, top_k: int = 5) -> List[str]:
        """Jaccard相似度（生产环境替换为向量余弦相似度）"""
        user_reviews = self.retrieve_by_user(user_id)
        if not user_reviews:
            return []
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2505.17156 — PersonaBOT: Bringing Customer Personas to Life with LLMs and RAG

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：评论文本数据（用户 ID、商品 ID、评论内容、评分、时间戳，CSV 格式）；卡页口径每 SKU 至少 500 条评论以覆盖多类用户，差评分析取评分 3 分以下、近 90 天的负面评论且每 SKU 至少 200 条。

**输出**：结构化人群画像（角色标签、核心需求、痛点、产品偏好），每个维度附评论证据，并附话题分布；供文案、详情页与产品迭代使用；卡页口径年化价值 20-40 万元。

## 执行步骤

1. 按用户聚合评论，构建可检索的评论语料。
2. 用关键词把评论切成不同人群分群。
3. 检索证据并生成结构化画像，保证每个维度可溯源。
4. 输出话题分布与高频痛点清单。
5. 把画像交给文案、详情页与产品迭代使用。

## 边界与不做

- 每 SKU 评论量不足（低于数百条）或只有零星抽样时不要用，人群切分与痛点提炼都不稳定。
- 能力边界：画像是对评论文本的归纳，不代表全量用户分布，不能替代定量调研；卡页的价值数字为特定口径。
- 合规红线：评论数据获取须遵守平台服务条款与授权范围，画像不得用于差异化定价，广告宣称须有实测数据支撑。

## 技能关联

- **前置**：Skill-Cohort-Retention-Analysis.html、Skill-Cohort-Retention-Analysis、Skill-User-Funnel-Analysis.html、Skill-User-Funnel-Analysis
- **延伸**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-MAA-Review-to-Action-Decision.html、Skill-MAA-Review-to-Action-Decision
- **可组合**：Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting、Skill-PersonaBot-RAG-Profiling

---

> 分类：业务运营/品牌与增长/分群　·　技术族：14-用户分析　·　源卡：`Skill-PersonaBot-RAG-Profiling`