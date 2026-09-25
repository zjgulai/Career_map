---
name: "p2s-llm-review-structured-extraction"
title: "LLM Review Structured Extraction — 方面情感 JSON 批量提取与语义聚类"
description: "触发词：评论结构化抽取、方面情感、JSON批量提取、语义聚类、差评维度排行、跨SKU热力矩阵。何时不用：要判断差评由哪次改动造成用「因果VOC归因」；要做事件框架与论元抽取用「语义角色标注事件抽取」。安全边界：提取结果须保留原始评论证据片段并建立人工复审机制（卡页口径要求人工复审确保准确率不低于 95%）；用户隐私数据处理须符合 GDPR 与个人信息保护法，不得因模型偏见不公正过滤特定用户评价。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-114"
l3_business: "体验分析"
l3_all: "体验分析 / 客诉聚类"
l1_l2_l3: "业务运营/服务与体验/体验分析"
p2s_card_id: "Skill-LLM-Review-Structured-Extraction"
p2s_src_domain: "07-NLP-VOC"
quality_tier: "preview"
user_summary: "一季度 3 万条吸奶器评论，2 小时抽出 Top10 差评维度排行并附证据片段，不用再花 3 人天人工总结。"
user_try: "试试：把这批吸奶器评论做方面情感提取和聚类，给我 Top10 差评维度排行。"
whenToUse: "当评论量在数万级、需要把文本转成可统计的方面与情感结构时用本技能；若要回答是哪次改动导致差评上涨，用「因果VOC归因」；若要抽取事件框架与论元，用「语义角色标注事件抽取」。"
workflow: "读取评论 CSV（文本、星级、是否已验证购买） → 用 LLM 批量抽取 aspect、sentiment 与 evidence 的 JSON → 用向量模型做语义聚类压缩维度 → 统计各维度差评率并排名 → 输出 Top-N 排行与代表性评论片段"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLM Review Structured Extraction — 方面情感 JSON 批量提取与语义聚类

## ① 解决的问题

母婴运营每季度面对 3 万条吸奶器评论却无从下手——LLM JSON 批量提取将评论结构化时间压缩至 2 小时，自动生成 Top10 差评维度排行，年化节省人力约 18 万元并加速产品迭代 4 周

## ② 核心算法逻辑

核心思路是把评论结构化拆解为三层流水线：

## ③ 业务应用场景

- 业务问题：某跨境母婴品牌 `BabyBreeze` 吸奶器 ASIN 每季度积累 30,000+ 条 Amazon 评论，人工总结产品缺陷需 2 名运营 3 个工作日，且主观性强、遗漏率高达 30%。 - 数据要求：Amazon 评论 CSV（含 `review_text`, `star_rating`, `verified_purchase`），最少 500 条，建议 2,000 条以上 - 预期产出：Top10 差评维度排行榜（如：吸力不足 34% → 噪音大 28% → 配件漏奶 21% → ...），每维度附代表性评论片段 - 业务价值：将季度痛点总结从 3 人天压缩至 2 小时，
- 业务问题：品牌同时运营婴儿监视器、湿巾加热器、消毒锅共 12 个 SKU，需要跨品类对比核心差评维度，找出共性工程问题（如"连接稳定性"可能跨越多品类）。 - 数据要求：每个 SKU 的评论 CSV，总量 5,000–20,000 条 - 预期产出：跨 SKU 差评维度热力矩阵（横轴：SKU，纵轴：语义概念，值：差评率），识别共性工程缺陷集中投入整改 - 业务价值：共性工程问题一次整改可同步修复 3–5 个 SKU 的差评痛点，一次产品迭代 ROI 提升 3x（单 SKU 迭代成本约 8 万元，一次覆盖 4 个 SKU 则边际成本降至 2 万元/SKU）。
**三轨验证** | 成本轨：月均成本1200元（LLM API调用费用800元/月，人工审核12小时/月×50元/小时=600元，系统维护200元/月），首期投入5000元（模型微调+集成开发） | 合规轨：符合《电商法》第17条商品信息真实性要求，符合《消费者权益保护法》第8条知情权规定，需建立人工复审机制确保NLP提取准确率≥95%，合规结论：可行，需补充人工审核SOP | 风险轨：主要风险为NLP误提取率（概率15-20%，影响：虚假差评识别错误导致合规风险），其次为用户隐私数据处理不当（概率5%，影响：GDPR/个人信息保护法违规），第三为模型偏见导致特定用户评价被不公正过滤（概率1

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

18 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（558 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 48 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/nlp_voc/llm_review_structured_extraction` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/07-NLP-VOC/Skill-LLM-Review-Structured-Extraction.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
LLM Review Structured Extraction — 方面情感 JSON 批量提取与语义聚类
参考论文: arXiv:2509.26103 (Wayfair 2025)

三阶段流水线:
  1. LLM JSON 提取 (aspect, sentiment, evidence)
  2. 语义聚类 (sentence-transformers + HDBSCAN 压缩)
  3. 差评率统计 (Top-N 排名输出)

依赖: pip install sentence-transformers scikit-learn numpy
API 依赖: openai 或 anthropic (测试模式下用 mock 无需真实 key)
"""

from __future__ import annotations
import json
import re
from collections import defaultdict
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
import numpy as np


# ─────────────────────────────────────────────────────────────────────────────
# 数据结构
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class AspectTriple:
    """单个 aspect-sentiment-evidence 三元组"""
    aspect: str
    sentiment: str  # "positive" | "negative" | "neutral"
    evidence: str

@dataclass
class ReviewExtraction:
    """单条评论的提取结果"""
    review_id: str
    review_text: str
    star_rating: int
    aspects: List[AspectTriple] = field(default_factory=list)
    error: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# 阶段 1: LLM JSON 提取
# ─────────────────────────────────────────────────────────────────────────────

EXTRACTION_PROMPT = """\
你是一名专业的产品评论分析师。请从以下产品评论中提取关键方面（aspect）及其情感（sentiment）。

规则：
1. 每条评论最多提取 5 个最重要的 aspect
2. sentiment 只能是 "positive"、"negative"、"neutral" 之一
3. evidence 是原文中直接支持该判断的片段（≤20字）
4. 输出必须是合法 JSON，不要有额外说明

输出格式：
{"aspects": [{"aspect": "...", "sentiment": "...", "evidence": "..."}, ...]}

评论文本：
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2509.26103 — End-to-End Aspect-Guided Review Summarization at Scale
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：评论 CSV（含 review_text、star_rating、verified_purchase），卡页口径最少 500 条、建议 2000 条以上；跨 SKU 对比场景需各 SKU 评论文件（总量 5000-20000 条）。

**输出**：方面情感 JSON 明细、Top10 差评维度排行（含占比与代表性评论片段）与跨 SKU 差评维度热力矩阵；供产品与运营决定整改优先级。

## 执行步骤

1. 读取并校验评论数据（文本、星级、是否已验证购买）
2. 用 LLM 批量抽取方面、情感与证据的 JSON 结构化记录
3. 用向量模型对方面表述做语义聚类，压缩同义维度
4. 统计各维度的差评率并排序取 Top-N
5. 输出排行与代表性评论片段，并交人工复审确认

## 边界与不做

- 数据不满足：评论量低于数百条时维度统计不稳，需先积累样本或标注不确定性。
- 何时不用：因果归因判断用「因果VOC归因」，事件框架抽取用「语义角色标注事件抽取」。
- 能力边界：只做结构化提取与聚类统计，不判断因果，也不自动生成整改方案。
- 安全边界：须保留证据片段与人工复审机制，防止模型偏见不公正过滤用户评价。

## 技能关联

- **前置**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-InstructUIE-Unified-Information-Extraction.html、Skill-InstructUIE-Unified-Information-Extraction、Skill-LLM-Annotation-Weak-Supervision.html、Skill-LLM-Annotation-Weak-Supervision、Skill-NLP-Text-Classification.html、Skill-NLP-Text-Classification、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-Review-QA-Extraction.html、Skill-Review-QA-Extraction、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-InstructUIE-Unified-Information-Extraction.html、Skill-InstructUIE-Unified-Information-Extraction、Skill-LLM-Annotation-Weak-Supervision.html、Skill-LLM-Annotation-Weak-Supervision、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-Review-QA-Extraction.html、Skill-Review-QA-Extraction
- **可组合**：Skill-InstructUIE-Unified-Information-Extraction.html、Skill-InstructUIE-Unified-Information-Extraction、Skill-LLM-Annotation-Weak-Supervision.html、Skill-LLM-Annotation-Weak-Supervision、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-Review-QA-Extraction.html、Skill-Review-QA-Extraction、Skill-LLM-Review-Structured-Extraction

---

> 分类：业务运营/服务与体验/体验分析　·　技术族：07-NLP-VOC　·　源卡：`Skill-LLM-Review-Structured-Extraction`