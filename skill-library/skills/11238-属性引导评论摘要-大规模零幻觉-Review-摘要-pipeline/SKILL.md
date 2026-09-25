---
name: "p2s-agrs-aspect-guided-review-summarization"
title: "AGRS 属性引导评论摘要 - 大规模零幻觉 Review 摘要 pipeline"
description: "触发词：评论摘要、属性情感提取、零幻觉摘要、多市场评论汇总、季度评论复盘。何时不用：只需要给单条评论打情感或做客诉分诊时用「Tag-Driven VOC 信号路由」；要输出改进建议与优先级清单时用「MAA 评论到行动决策」。安全边界：遵守 Amazon 开发者协议，禁止转售原始评论或用于竞品分析；评论需脱敏，不得据评论内容反向识别个人。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-019"
l3_business: "VOC编码"
l3_all: "VOC编码 / 用户反馈"
l1_l2_l3: "业务运营/产品与创新/VOC编码"
p2s_card_id: "Skill-AGRS-Aspect-Guided-Review-Summarization"
p2s_src_domain: "14-用户分析"
quality_tier: "preview"
user_summary: "把上千条多市场评论在半小时内汇总成结构化摘要，只写评论里真实出现的属性，让运营和管理层快速看清优缺点。"
user_try: "试试：把这季度 Amazon US/DE 的紫外线消毒器评论汇总成一份属性级摘要，标出正面和负面最集中的属性。"
whenToUse: "需要把大批量评论压成可读摘要、且要求摘要不出现评论里没有的属性时用本技能；若已明确要产出改进建议与 ROI 排序，用「MAA 评论到行动决策」；若要做竞品之间的评论主题对比，用「Competitive VOC Benchmarking」。"
workflow: "拉取季度评论（文本+评分+市场标记），为每条评论提取至多 5 个 aspect-sentiment 对 → 归一化同义 aspect（如 UV_sanitize 并入 disinfection_effect），维护 canonical 映射表 → 按代表性加权采样评论并组装结构化 prompt → 生成完全基于真实评论的属性引导摘要 → 评论累计达 10 条或增长 ≥10% 时自动刷新摘要，并按周推送运营群"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AGRS 属性引导评论摘要 - 大规模零幻觉 Review 摘要 pipeline

## ① 解决的问题

业务问题:Momcozy 在 Amazon US/DE 同时销售紫外线消毒器,每季度 1-2 万条评论,人工汇总需要 2-3 个产品经理 × 1 周;管理层季度复盘和供应链/产品团队迭代输入严重滞后 - 数据要求:Amazon Review API 季度评论数据(评论文本 + 评分 + 市场标记) - AGRS 配置: - ABSA 提取每条评论的 ≤5 个 aspect-sentiment 对(如 `disinfection_effe

## ② 核心算法逻辑

传统 LLM 摘要"无约束自由生成"产生幻觉(摘要包含评论中不存在的属性). AGRS 把摘要任务结构化:ABSA 提取 aspectsentiment → canonical 归一化 → 代表性评论加权采样 → 结构化 prompt 引导 LLM 生成. 100% 基于真实评论,根本规避幻觉. 4 阶段 pipeline 端到端可扩展到百万产品.

## ③ 业务应用场景

- 业务问题:Momcozy 在 Amazon US/DE 同时销售紫外线消毒器,每季度 1-2 万条评论,人工汇总需要 2-3 个产品经理 × 1 周;管理层季度复盘和供应链/产品团队迭代输入严重滞后 - 数据要求:Amazon Review API 季度评论数据(评论文本 + 评分 + 市场标记) - AGRS 配置: - ABSA 提取每条评论的 ≤5 个 aspect-sentiment 对(如 `disinfection_effect:positive`, `noise_level:negative`) - Consolidate 同义 aspect(`UV_sanitize` → 
三轨验证： - 成本：显性成本包括 Amazon Review API 调用费（约 $0.01/1000 条）、LLM 推理成本（Gemini Flash $0.0003/产品/季度）、1 名数据工程师 2 天初始化 canonical 映射表。单品类年成本约 1.2 万元。 - 合规：Amazon Review API 使用需遵守 Amazon 开发者协议（禁止转售原始评论、禁止用于竞品分析）。GDPR 层面，评论数据不含 PII（用户 ID 脱敏），但需确保不通过评论内容反向识别个人。无广告法风险。 - 风险：若摘要被竞品爬取并反向推断供应链问题（如“漏液”投诉集中），可能引发竞对针对性营
- 业务问题:Momcozy 新品暖奶器 Amazon US 上市,第一个月评论量从 0 增长到 200+,运营需要每周捕捉用户反馈热点,但等不到攒够样本量做月度报告(Anker 案例:新品 8 周内的反馈直接决定改款决策) - 数据要求:实时评论增量 + 阈值触发器 - AGRS 配置: - 评论累计达 10 条 → 自动触发首轮 pipeline - 增长 ≥10% 时自动刷新摘要(避免低噪声重算) - 每周生成一次 aspect-guided 摘要,推送飞书运营群 - 业务价值: - 早期负面信号识别提速:从月度 → 周度,差评归因前置 3 周 - 早期反馈带动 R&D 改款:单款新品因

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

节省人工:2 人月 × 1.5 万/月 = 3 万/季度 × 4 = 12 万/年/品类
决策提速 2-4 周:管理层决策提前 → 库存/广告优化决策提前 → 净增 150-300 万/年
合计:单品类 162-312 万/年
早期负面信号识别提速 3 周:避免大批量召回单款节省 50-100 万
年化 20 款新品:1000-2000 万元/年潜力(取保守估算 30%-50% 兑现率 = 300-1000 万)
易处:Wayfair 开源 HuggingFace 数据集可直接训练/验证

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（136 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/user_analytics/agrs_aspect_guided_review_summarization` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-AGRS-Aspect-Guided-Review-Summarization.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
AGRS Aspect-Guided Review Summarization 最小骨架
论文 arXiv:2509.26103 (Wayfair, 2025)
完整实现见 paper2skills-code/nlp_voc/agrs_review_summarization/model.py (305 行)
HuggingFace 数据集: leBoytsov/review-summaries-68dab02e7b6a5bc8e29e81fa
"""
from __future__ import annotations
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from typing import Dict, List
import random


@dataclass
class Review:
    text: str
    review_id: str = ""
    rating: int = 5
    market: str = ""


@dataclass
class AspectSentiment:
    aspect: str
    sentiment: str
    review_id: str = ""


def extract_aspects(reviews: List[Review], max_per_review: int = 5) -> List[AspectSentiment]:
    """阶段 1: ABSA 提取(生产替换为 LLM 调用 with structured prompt)"""
    aspect_kw = {
        "disinfection_effect": ["uv", "sanitize", "disinfect", "kill germ"],
        "noise_level": ["noise", "loud", "quiet", "silent"],
        "ease_of_use": ["easy", "simple", "intuitive", "user friendly"],
        "build_quality": ["sturdy", "flimsy", "broken", "durable"],
        "value_for_money": ["price", "value", "worth", "expensive"],
    }
    positive_kw = {"great", "love", "amazing", "easy", "quiet", "sturdy", "worth"}
    negative_kw = {"bad", "broken", "loud", "flimsy", "expensive", "noisy"}

    results = []
    for r in reviews:
        text_low = r.text.lower()
        for aspect, kws in aspect_kw.items():
            if any(kw in text_low for kw in kws):
                pos = any(w in text_low for w in positive_kw)
                neg = any(w in text_low for w in negative_kw)
                sent = "mixed" if (pos and neg) else ("positive" if pos else "negative" if neg else "neutral")
                results.append(AspectSentiment(aspect=aspect, sentiment=sent, review_id=r.review_id))
    return results


def consolidate_aspects(aspects: List[AspectSentiment], freq_threshold: int = 30) -> List[AspectSentiment]:
    """阶段 2: 归一化"""
    canonical_map = {
        "uv_sanitize": "disinfection_effect",
        "noise": "noise_level",
        "easy_to_clean": "cleaning_convenience",
    }
    consolidated = []
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2509.26103 — End-to-End Aspect-Guided Review Summarization at Scale
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：主题指向成立但强度不足（词重合 0.25／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：Amazon Review API 季度评论数据：评论文本 + 评分 + 市场标记，单批 1-2 万条量级，覆盖 US/DE 等多市场；另需先初始化 aspect 的 canonical 同义映射表。

**输出**：结构化属性级摘要（各 aspect 的正负向分布与代表性评论依据），面向管理层季度复盘与供应链/产品团队迭代输入；可按周增量刷新后推送运营群。

## 执行步骤

1. 提取每条评论的至多 5 个 aspect-sentiment 对作为候选
2. 归一化同义 aspect，维护 canonical 映射关系
3. 按代表性与频次加权采样评论并组装结构化 prompt
4. 按结构化引导生成只引用真实评论内容的摘要
5. 按累计条数或增长阈值触发刷新并推送到运营群

## 边界与不做

- 只有聚合评分、拿不到评论正文时不适用（无法做属性级归因）
- 只产出摘要与属性分布，不产出改进建议、优先级与 ROI；映射表初始化需人工投入，出现映射表外的新 aspect 需先扩表
- 不转售原始评论、不用于竞品分析，输出不得包含可反向识别个人的信息

## 技能关联

- **前置**：Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Multilingual-NER-Universal-v2.html、Skill-Multilingual-NER-Universal-v2
- **延伸**：Skill-MAA-Review-to-Action-Decision.html、Skill-MAA-Review-to-Action-Decision、Skill-StaR-Review-Statement-Ranking.html、Skill-StaR-Review-Statement-Ranking
- **可组合**：Skill-Argos-Agentic-Anomaly-Detection.html、Skill-Argos-Agentic-Anomaly-Detection、Skill-Customer-Journey-Decision-Tree.html、Skill-Customer-Journey-Decision-Tree、Skill-AGRS-Aspect-Guided-Review-Summarization

---

> 分类：业务运营/产品与创新/VOC编码　·　技术族：14-用户分析　·　源卡：`Skill-AGRS-Aspect-Guided-Review-Summarization`