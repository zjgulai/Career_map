---
name: "p2s-knowledge-conflict-detection-resolution"
title: "Knowledge Conflict Detection — 知识冲突检测与消解"
description: "触发词：知识冲突、NLI 检测、条件声明、参数矛盾、一致性评分。何时不用：要判定回答中的事实是否编造走三元组幻觉检测；要清理重复文档走去重技能。安全边界：涉及用户评论的数据须脱敏处理，不得关联个人身份信息，须符合数据最小化原则。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-146"
l3_business: "知识溯源"
l3_all: "知识溯源 / 数据质量"
l1_l2_l3: "数据与Agent平台/数据与AI运行/知识溯源"
p2s_card_id: "Skill-Knowledge-Conflict-Detection-Resolution"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "发现知识库里互相打架的说法，补上适用条件，让 Agent 不再自相矛盾。"
user_try: "试试：查一下知识库里同一个算法参数的矛盾说法，帮我生成带条件的统一表述。"
whenToUse: "同一实体属性在知识库里有多个来源不同取值、直接拼在一起会让 Agent 自相矛盾时用；要检测回答本身的编造请转三元组幻觉检测。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Knowledge Conflict Detection — 知识冲突检测与消解

## ① 解决的问题

知识库运营面临"不同论文对同一参数给出矛盾值导致Agent输出矛盾建议"——三层冲突检测将参数声明冲突检出率达到91%，知识库一致性评分从5.2→8.4分

## ② 核心算法逻辑

三层冲突检测架构：

## ③ 业务应用场景

- 业务痛点：HNSW Skill 说「M=16 推荐值」，另一个 Skill 从不同论文说「M=32 才能达到 99% recall」——两者都正确但条件不同，直接拼在知识库里让 Agent 矛盾 - 数据要求：Skill 卡片中的数值声明（正则提取）+ 发表时间 + 论文引用数 - 执行： 1. 对同一算法参数的声明做 NLI 冲突检测 2. 发现矛盾 → 自动生成条件声明：「通用场景 M=16，高精度 M=32」 3. 推送飞书提醒人工确认 - 量化产出：知识库参数声明冲突检出率 91%，误报率 < 8% - 三轨验证： - 成本：需接入论文数据库 API（如 Semantic Scho
- 业务痛点：「暖奶器加热很快」(100 条) 和「暖奶器加热很慢」(30 条) 同时存在，VOC Agent 无法给出一致建议 - 方案：按用户属性分层（3-6月婴儿 vs 6-12月），发现意见差异来自使用场景不同（液体量不同） - 量化产出：VOC 报告一致性评分从 5.2/10 → 8.4/10，消除矛盾评论造成的决策困惑 - 三轨验证： - 成本：需存储和清洗用户评论数据，云存储成本约 0.01 美元/万条；分层分析需 NLP 模型处理，月均 200 美元 - 合规：用户评论数据需脱敏处理，不得关联个人身份信息，需符合 GDPR 数据最小化原则 - 风险：分层结论可能被误读为「产品有

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

知识库参数声明冲突检出率 91%，误报率 < 8%
VOC 报告一致性评分：5.2/10 → 8.4/10
避免 Agent 给出矛盾建议造成的运营决策损失（难以量化但影响极大）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（132 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'try' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：3」，但**未记录代码位置**（源站写「未检测到」）。

```python
import math
import re
from dataclasses import dataclass, field
from collections import defaultdict
from typing import Optional
from datetime import datetime

@dataclass
class KnowledgeClaim:
    claim_id: str
    entity: str
    attribute: str
    value: str
    source: str
    pub_year: int
    citation_count: int = 0
    confidence: float = 1.0

@dataclass
class ConflictReport:
    entity: str
    attribute: str
    claims: list[KnowledgeClaim]
    conflict_type: str  # "value_mismatch" | "contradiction" | "condition_split"
    resolution: str
    action: str         # "auto_merge" | "human_review" | "conditional_statement"

class ConflictDetector:
    def __init__(self, time_decay_lambda: float = 0.1,
                 min_sources_for_trust: int = 2):
        self.lambda_ = time_decay_lambda
        self.min_sources = min_sources_for_trust
        self.claims: dict[tuple, list[KnowledgeClaim]] = defaultdict(list)

    def _time_weight(self, pub_year: int) -> float:
        current_year = datetime.now().year
        age = current_year - pub_year
        return math.exp(-self.lambda_ * age)

    def _citation_weight(self, citations: int) -> float:
        return math.log(1 + citations) / math.log(1 + 1000)

    def _source_weight(self, claim: KnowledgeClaim) -> float:
        tw = self._time_weight(claim.pub_year)
        cw = self._citation_weight(claim.citation_count)
        return 0.6 * tw + 0.4 * cw

    def add_claim(self, claim: KnowledgeClaim) -> None:
        key = (claim.entity, claim.attribute)
        self.claims[key].append(claim)

    def _detect_value_conflict(self, claims: list[KnowledgeClaim]) -> bool:
        values = set(c.value.strip().lower() for c in claims)
        return len(values) > 1

    def _is_semantic_contradiction(self, v1: str, v2: str) -> bool:
        nums1 = re.findall(r'\d+\.?\d*', v1)
        nums2 = re.findall(r'\d+\.?\d*', v2)
        if nums1 and nums2:
            try:
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：知识库中的数值与事实声明（可正则提取），以及来源、发表时间、引用数等元信息

**输出**：冲突清单与消解后的条件化声明（卡页示例：通用场景取一个值、高精度场景取另一个值），推人工确认后入库

## 执行步骤

1. 抽取同一实体属性的多条声明，并保留来源、时间、引用数权重。
2. 做 NLI 类冲突检测，区分真冲突与条件差异。
3. 为条件差异生成条件化声明，而不是简单覆盖。
4. 把冲突与消解建议推给人工确认后再写回知识库。

## 边界与不做

- 何时不用：要判定回答中的事实是否编造时请转三元组幻觉检测；要清理重复文档请转去重技能。
- 能力边界：消解结果仍需人工确认，不能自动删除或覆盖原有声明。
- 安全边界：涉及用户评论的数据须脱敏处理，不得关联个人身份信息，须符合数据最小化原则。

## 技能关联

- **前置**：Skill-FActScore-Claim-Verification-Pipeline.html、Skill-FActScore-Claim-Verification-Pipeline、Skill-KG-Incremental-Update.html、Skill-KG-Incremental-Update
- **延伸**：Skill-DECRL-Temporal-KG-Evolution-Prediction.html、Skill-DECRL-Temporal-KG-Evolution-Prediction、Skill-FastKGE-Incremental-LoRA-KG-Embedding.html、Skill-FastKGE-Incremental-LoRA-KG-Embedding、Skill-RAGAS-RAG-Evaluation-Framework.html、Skill-RAGAS-RAG-Evaluation-Framework
- **可组合**：Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-WRITEBACK-RAG-Trainable-KB.html、Skill-WRITEBACK-RAG-Trainable-KB、Skill-iText2KG-Schema-Free-KG-Induction.html、Skill-iText2KG-Schema-Free-KG-Induction、Skill-Knowledge-Conflict-Detection-Resolution

---

> 分类：数据与Agent平台/数据与AI运行/知识溯源　·　技术族：08-知识图谱　·　源卡：`Skill-Knowledge-Conflict-Detection-Resolution`