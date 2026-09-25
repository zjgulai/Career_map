---
name: "p2s-voc-aspect-sentiment-extraction"
title: "InstructABSA — 指令微调驱动的方面级情感分析与评论解构"
description: "触发词：评论方面拆解、差评维度定位、方面级情感分析、评论三元组抽取、改版方向定位。何时不用：要看整体情绪走势与新兴主题聚类时用「BERTopic 主题建模」或「Review 时序趋势挖掘」，本技能只做单条评论的方面级情感拆解。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-114"
l3_business: "体验分析"
l3_all: "体验分析 / 客诉聚类"
l1_l2_l3: "业务运营/服务与体验/体验分析"
p2s_card_id: "Skill-VOC-Aspect-Sentiment-Extraction"
p2s_src_domain: "07-NLP-VOC"
quality_tier: "preview"
user_summary: "把成百上千条评论拆成哪个方面被夸、哪个方面被骂，用一张方面情感热力图告诉你先改哪里。"
user_try: "试试：把这 3000 条吸奶器评论跑一遍方面级情感分析，告诉我差评最集中在哪几个方面。"
whenToUse: "当你要定位具体哪个使用方面在拖评分、需要方面级差评占比与负面意见词时用；只要整体情绪或主题聚类，改用「BERTopic 主题建模」「Review 时序趋势挖掘」。"
workflow: "对全量评论跑 ATSC 方面情感分类，提取（方面，情感，意见词）三元组 → 统计各方面的差评占比与情感强度（负面词权重） → 输出方面情感热力图，定位差评最集中的方面"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# InstructABSA — 指令微调驱动的方面级情感分析与评论解构

## ① 解决的问题

母婴品类改版方向不明——InstructABSA 方面级情感分析将差评维度拆解从 2 周人工 → 2 小时自动完成，精准定位高差评方面（噪音/尺寸），避免错误改版投入 ¥5 万+ MOQ 成本

## ② 核心算法逻辑

论文：InstructABSA: Instruction Tuning for Aspect Based Sentiment Analysis | 年份：2024

## ③ 业务应用场景

业务问题：某母婴团队的吸奶器 SKU 在 Amazon 积累了 3,000 条评论，整体评分 3.8 星，但不清楚"哪些具体问题在拖评分"。靠人工阅读要花 2 周，且不同运营的判断标准不一。
InstructABSA 处理流程： 1. 对全量评论跑 ATSC（方面情感分类），提取 `(方面, 情感, 意见词)` 三元组 2. 统计各方面的差评占比和情感强度（负面词权重） 3. 输出"方面-情感热力图"：哪些方面差评最集中
| 方面 | 正面率 | 负面率 | Top 负面意见词 | |---|---|---|---| | 吸力 | 45% | 38% | "too weak", "not strong enough" | | 噪音 | 22% | 65% | "loud", "noisy", "not quiet" | | 充电 | 71% | 15% | — | | 尺寸/重量 | 38% | 45% | "too big", "bulky" |

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
差评维度拆解决策加速：避免错误产品改版，每次节省 ¥50,000+（MOQ 生产改版成本）
客服工单自动路由：人工分类时间减少 60%，年化节省 ¥20,000-50,000
选品改版命中率提升：精准定位高差评方面，假设改版成功率从 40% → 65%，年化 GMV 增量 ¥50-150 万
年化综合 ROI：¥100-200 万
实施难度：⭐⭐☆☆☆（规则版直接可用；生产版 InstructABSA 模型推理需 GPU 或调用 API）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（216 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after class definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/nlp_voc/voc_aspect_sentiment_extraction` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/07-NLP-VOC/Skill-VOC-Aspect-Sentiment-Extraction.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
VOC Aspect Sentiment Extraction — 基于 InstructABSA 的方面级情感分析
简化实现：规则+词典方法，生产环境替换为 InstructABSA 模型推理

依赖: re, dataclasses (标准库)
"""

from dataclasses import dataclass, field
import re


@dataclass
class AspectSentimentTuple:
    """方面-意见-情感三元组"""
    aspect: str
    opinion: str
    sentiment: str          # positive / negative / neutral
    confidence: float = 1.0
    raw_span: str = ""      # 原始文本片段


@dataclass
class ABSAResult:
    """单条评论的 ABSA 结果"""
    review_id: str
    text: str
    tuples: list = field(default_factory=list)
    overall_sentiment: str = "neutral"


# ─── 领域词典（母婴吸奶器，可扩展） ───

ASPECT_KEYWORDS = {
    "吸力":    ["suction", "suction power", "pump strength", "suction level", "pumping power"],
    "噪音":    ["noise", "sound", "loud", "quiet", "silent", "noisy", "decibel"],
    "充电":    ["battery", "charge", "charging", "USB", "battery life", "power"],
    "尺寸重量": ["size", "bulky", "heavy", "weight", "portable", "compact", "large", "small"],
    "舒适度":  ["comfortable", "comfort", "pain", "hurt", "fit", "flange", "sore"],
    "易用性":  ["easy", "simple", "difficult", "complicated", "setup", "assemble"],
    "客服":    ["customer service", "support", "response", "refund", "return", "help"],
    "物流":    ["shipping", "delivery", "arrived", "package", "late", "fast", "slow"],
    "价格":    ["price", "worth", "value", "expensive", "cheap", "affordable", "cost"],
}

POSITIVE_WORDS = {
    "excellent", "great", "good", "amazing", "wonderful", "perfect", "love",
    "quiet", "strong", "easy", "comfortable", "efficient", "powerful", "fast",
    "affordable", "worth", "recommend", "happy", "satisfied", "awesome",
}

NEGATIVE_WORDS = {
    "bad", "terrible", "awful", "poor", "weak", "loud", "noisy", "painful",
    "difficult", "complicated", "disappointing", "slow", "expensive", "broken",
    "leaking", "uncomfortable", "useless", "waste", "regret", "return",
}

NEGATION_WORDS = {"not", "no", "never", "n't", "dont", "doesnt", "wouldnt", "cant", "hardly"}


class RuleBasedABSA:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2310.01427，但该号在 arXiv 上是《Attention Sorting Combats Recency Bias In Long Context Language Models》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《InstructABSA: Instruction Tuning for Aspect Based Sentiment Analysis》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：评论文本（含评分与提交日期）加领域方面词典或方面表；粒度为单条评论，批量建议数百条以上以形成稳定统计。

**输出**：每条评论的（方面，情感，意见词）三元组、各方面正负面率与 Top 负面意见词热力图，供运营定位改版方向与客服工单路由使用。

## 执行步骤

1. 批量导入评论并做去重与语言归一
2. 按领域词典或模型抽取（方面，情感，意见词）三元组
3. 汇总各方面正面率与负面率
4. 输出方面情感热力图并标出高差评方面
5. 把负面集中的方面交给产品改版与客服分诊环节

## 边界与不做

- 何时不用：评论量太少或缺少领域方面词典时，方面统计不稳且无法解释
- 能力边界：只输出方面级情感证据与热力图，不下达改版方案，也不替代产品评审判断

## 技能关联

- **前置**：Skill-BERT-SRL-Event-Frame-Extraction.html、Skill-BERT-SRL-Event-Frame-Extraction、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-InstructUIE-Unified-Information-Extraction.html、Skill-InstructUIE-Unified-Information-Extraction、Skill-Review-Pain-Point-Mining.html、Skill-Review-Pain-Point-Mining、Skill-Semantic-Blueprint-Compiler.html、Skill-Semantic-Blueprint-Compiler、Skill-VOC-Proxy-NPS-AIPL-统一萃取引擎.html、Skill-VOC-Proxy-NPS-AIPL-统一萃取引擎
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Review-Pain-Point-Mining.html、Skill-Review-Pain-Point-Mining、Skill-Semantic-Blueprint-Compiler.html、Skill-Semantic-Blueprint-Compiler、Skill-VOC-Proxy-NPS-AIPL-统一萃取引擎.html、Skill-VOC-Proxy-NPS-AIPL-统一萃取引擎
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Review-Pain-Point-Mining.html、Skill-Review-Pain-Point-Mining、Skill-VOC-Aspect-Sentiment-Extraction

---

> 分类：业务运营/服务与体验/体验分析　·　技术族：07-NLP-VOC　·　源卡：`Skill-VOC-Aspect-Sentiment-Extraction`