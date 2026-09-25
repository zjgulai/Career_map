---
name: "p2s-star-review-statement-ranking"
title: "StaR 观点语句排序 - 排序而非生成的可解释评论分析"
description: "触发词：原子语句、观点排序、可解释分析、跨市场差异、排序而非生成。何时不用：需要 LLM 自由生成摘要时用「AGRS 属性引导评论摘要」；要输出带 ROI 排序的改进清单用「MAA 评论到行动决策」。安全边界：输出必须限定在评论中真实出现的语句、不得由模型补写；跨市场对齐依赖的多语种 embedding 须先验证语种覆盖。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-019"
l3_business: "VOC编码"
l3_all: "VOC编码 / 产品需求定义"
l1_l2_l3: "业务运营/产品与创新/VOC编码"
p2s_card_id: "Skill-StaR-Review-Statement-Ranking"
p2s_src_domain: "14-用户分析"
quality_tier: "preview"
user_summary: "把评论拆成一条条真实存在的原子观点再排序，不靠模型自由生成，既避开幻觉又能用 IR 指标客观评估。"
user_try: "试试：把这批暖奶器差评拆成原子语句并排序，告诉我最该改的三个点各是什么。"
whenToUse: "要求结果可解释、可评估、且不能出现评论里没有的内容时用本技能；若要一份自然语言摘要，用「AGRS 属性引导评论摘要」；若要直接得到带 ROI 排序的改进行动清单，用「MAA 评论到行动决策」。"
workflow: "从评论中高召回提取候选原子语句 → 用判别器过滤评论中不存在的虚构语句 → 做语义聚类并按 IR 指标排序 → 按市场输出 Top 语句或跨市场差异矩阵"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# StaR 观点语句排序 - 排序而非生成的可解释评论分析

## ① 解决的问题

Momcozy 暖奶器在 Amazon US/DE 各 5000+ 评论,差评包含细碎复合表达(如"加热慢又不均匀,温控也不准"). 传统 ABSA 把整句标注为"加热问题",丢失了 3 个独立改进点;直接用 LLM 总结容易生成评论中不存在的属性(如"接口设计差") - 数据要求:Amazon Review API 双市场评论 - StaR 配置: - Step 1 Candidate

## ② 核心算法逻辑

传统可解释推荐让 LLM 生成自由文本解释,有 3 大问题:① 幻觉(生成评论中不存在的属性)、② 难以评估(自由文本只能用主观打分)、③ 粒度不可控. StaR 把任务重构为对评论中真实出现的"原子语句(statement)"做排序,只输出真实存在的内容,可用 IR 指标客观评估.

## ③ 业务应用场景

- 业务问题:Momcozy 暖奶器在 Amazon US/DE 各 5000+ 评论,差评包含细碎复合表达(如"加热慢又不均匀,温控也不准"). 传统 ABSA 把整句标注为"加热问题",丢失了 3 个独立改进点;直接用 LLM 总结容易生成评论中不存在的属性(如"接口设计差") - 数据要求:Amazon Review API 双市场评论 - StaR 配置: - Step 1 Candidate Extract(高召回): "加热慢又不均匀,温控也不准" → ["加热速度慢","加热不均匀","温控不准确"] - Step 2 Verify(过滤虚构语句) - Step 3 语义聚类:"
- 业务问题:三市场(US/DE/CN)的用户痛点分布完全不同,但传统差评分析只能产出"差评列表",无法量化比较"德国用户对噪音的敏感度 vs 美国用户的便携性偏好" - 数据要求:三市场评论 + StaR 提取结果 - StaR 配置: - 各市场分别跑 StaR pipeline → 各得 Top 50 statements - 跨市场用 BGE-M3 多语种 embedding 做语义对齐 - 输出"跨市场差异矩阵":同义 statement 在各市场的频率/排名差异 - 业务价值: - 选品决策:发现新品 SKU 在哪个市场最具竞争力(德国注重静音 = 主推静音吸奶器) - 营销 li
**三轨验证** | 成本轨：RFM分层模型月均成本约800元（数据标签工具200元+分析师工时12小时/月@50元/小时=600元+系统维护200元），年度成本9600元 | 合规轨：符合《个人信息保护法》第四条数据分类处理要求，RFM标签属于衍生数据范畴，需获得用户隐私授权；符合跨境电商数据出境规范，涉及境外用户数据需签署DPA协议 | 风险轨：①数据泄露风险（概率15%）导致用户隐私纠纷，罚款50-100万；②RFM模型偏差风险（概率25%）造成高价值客户误分类，影响复购转化；③跨境数据合规风险（概率20%）因标签数据不当传输被监管部门处罚

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

易处:无需 LLM 生成(避免幻觉),只需 embedding + 排序
易处:可用经典 IR 指标(P@k/NDCG@k)做训练监督
难处:Verify 阶段需要训练判别器(可用 cross-encoder 微调)
难处:跨语言 statement 对齐依赖高质量多语种 embedding(BGE-M3 / E5-multilingual)

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（108 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/user_analytics/star_review_statement_ranking` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-StaR-Review-Statement-Ranking.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
StaR Statement-level Ranking 最小骨架
论文 arXiv:2604.03724
完整实现见 paper2skills-code/nlp_voc/star_statement_ranking/model.py
"""
from __future__ import annotations
from collections import Counter
from dataclasses import dataclass
from typing import Dict, List
import re


@dataclass
class Statement:
    text: str
    aspect: str
    sentiment: str
    review_id: str = ""


def candidate_extraction(reviews: List[str]) -> List[Statement]:
    """Step 1: 高召回提取候选 atomic statements"""
    aspect_patterns = {
        "heating_speed": [r"加热.{0,5}(慢|快|秒|分钟)", "fast heat", "slow heat", "heats up"],
        "heating_uniformity": [r"加热.{0,5}(均匀|不均|底部|表面)", "uneven", "evenly heated"],
        "temperature_control": [r"温控.{0,5}(精准|准确|不准|不稳)", "temperature accuracy", "temp control"],
        "noise_level": [r"(噪音|声音|安静|吵)", "quiet", "loud", "silent"],
        "build_quality": [r"(做工|质量|耐用)", "build", "durable", "flimsy"],
    }
    sent_keywords_pos = {"好", "棒", "great", "love", "evenly", "fast", "quiet"}
    sent_keywords_neg = {"差", "慢", "loud", "uneven", "broken", "slow"}

    statements = []
    for idx, text in enumerate(reviews):
        text_low = text.lower()
        for aspect, patterns in aspect_patterns.items():
            for p in patterns:
                if re.search(p, text_low, re.IGNORECASE):
                    pos = sum(1 for w in sent_keywords_pos if w in text_low)
                    neg = sum(1 for w in sent_keywords_neg if w in text_low)
                    sent = "positive" if pos > neg else "negative" if neg > pos else "neutral"
                    statements.append(Statement(text=text[:100], aspect=aspect, sentiment=sent, review_id=f"r{idx}"))
                    break
    return statements


def verify_statements(statements: List[Statement]) -> List[Statement]:
    """Step 2: 验证过滤,删除模糊语句"""
    verified = []
    for s in statements:
        if len(s.text) > 5 and s.aspect != "":
            verified.append(s)
    return verified


def semantic_clustering(statements: List[Statement]) -> Dict[str, List[Statement]]:
    """Step 3: 语义聚类(按 aspect+sentiment canonical key)"""
    clusters: Dict[str, List[Statement]] = {}
    for s in statements:
        key = f"{s.aspect}|{s.sentiment}"
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2604.03724 — Rank, Don't Generate: Statement-level Ranking for Explainable Recommendation

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：双市场或多市场评论文本（如 Amazon US/DE 各 5,000+ 条），以及用于跨市场对齐的多语种 embedding（如 BGE-M3 / E5-multilingual）。

**输出**：排序后的原子语句清单（各市场 Top 50）与跨市场差异矩阵：同义语句在各市场的频率与排名差异，供选品与营销本地化决策使用。

## 执行步骤

1. 高召回提取评论中的候选原子语句
2. 用判别器过滤虚构语句
3. 对语句做语义聚类并按 IR 指标排序
4. 输出各市场 Top 语句或跨市场差异矩阵

## 边界与不做

- 评论中缺少可切分的复合表达、或语句样本过少时不适用，排序结果不稳定
- 输出严格限定在评论真实出现的内容，不生成新属性，也不含成本与可行性判断
- 跨市场对齐依赖多语种 embedding 的质量，语种覆盖不足时差异矩阵不可信

## 技能关联

- **前置**：Skill-Dense-Retrieval-Ecommerce-Semantic-Search.html、Skill-Dense-Retrieval-Ecommerce-Semantic-Search、Skill-Multilingual-NER-Universal-v2.html、Skill-Multilingual-NER-Universal-v2
- **延伸**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-MAA-Review-to-Action-Decision.html、Skill-MAA-Review-to-Action-Decision
- **可组合**：Skill-Cohort-Retention-Analysis.html、Skill-Cohort-Retention-Analysis、Skill-Explainable-Recommendation.html、Skill-Explainable-Recommendation、Skill-StaR-Review-Statement-Ranking

---

> 分类：业务运营/产品与创新/VOC编码　·　技术族：14-用户分析　·　源卡：`Skill-StaR-Review-Statement-Ranking`