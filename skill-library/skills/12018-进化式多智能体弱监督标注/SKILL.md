---
name: "p2s-llm-annotation-weak-supervision"
title: "EvoPool — 进化式多智能体弱监督标注"
description: "触发词：进化式弱监督、标注函数池、软标签聚合、多语言标注、标注降本。何时不用：数据量小于 1 万条、或任务需要极高精度（如医疗诊断）时不适用；标注规范未定前也不用。安全边界：无。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-140"
l3_business: "数据质量"
l3_all: "数据质量 / 运行监测"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据质量"
p2s_card_id: "Skill-LLM-Annotation-Weak-Supervision"
p2s_src_domain: "09-DataAgent-LLM"
quality_tier: "preview"
user_summary: "让 LLM 生成一批标注函数并自动进化，把海量多语言评论的标注成本压到极低。"
user_try: "试试：用进化式弱监督给这三十万条多语言评论打上四个业务标签。"
whenToUse: "评论或工单量很大（月均 10 万条以上）且有持续标注需求时用；数据量小或任务要求极高精度时不用。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# EvoPool — 进化式多智能体弱监督标注

## ① 解决的问题

母婴跨境卖家面临海量多语言评论与工单需标注的成本困境——EvoPool 进化式弱监督框架将 LLM 直接标注 10 万条的 10 万次 API 调用压缩为 50 次，标注速度提升 4500x，年化节省标注人力成本 80-150 万元

## ② 核心算法逻辑

EvoPool 的核心洞察：LLM 直接标注 100K 条数据成本极高（每条需一次 API 调用），但 LLM 能以极低成本生成标注规则代码，而规则代码运行几乎零成本。

## ③ 业务应用场景

业务问题：某母婴跨境品牌每月积累 30 万条全球买家评论（英/德/法），需要对每条评论打「质量投诉」「安全隐患」「正向体验」「物流问题」四个标签，用于训练合规预警模型。人工标注 10 条/人/小时，30 万条需 3 万人时（约 90 万元/轮）。
数据要求： - 原始评论文本（无需预处理） - 500 条人工验证集（用于 Fitness Gate 评估） - 可选：产品类目标签（奶瓶/推车/睡袋等）
执行流程： 1. LLM 生成初代 20 个标注函数（关键词匹配 + 正则 + 简单分类器） 2. 经 3-5 代进化，池扩充至 40-60 个函数 3. EvoAgg 聚合软标签，训练下游 BERT 分类器 4. 下游模型上线后持续接收新评论，零成本标注

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

需要 200-500 条高质量种子标注数据（可由业务专家一次性标注）
初代标注函数需要领域专家参与设计（半天工作量）
进化迭代需要调参经验
高优先级场景：评论/工单数据量 > 10 万条/月，且有持续标注需求
中优先级场景：数据量 1-10 万条/月，可考虑与人工标注混合使用
不适用场景：任务需要极高精度（医疗诊断），或数据量 < 1 万条

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（350 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/data_agent_llm/llm_annotation_weak_supervision` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/09-DataAgent-LLM/Skill-LLM-Annotation-Weak-Supervision.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
EvoPool 简化实现：母婴评论弱监督标注
场景：亚马逊母婴产品评论的安全合规 + 情感二分类

核心思路：
1. 生成多个基于关键词/规则的标注函数（模拟进化池）
2. Fitness Gate 过滤低质量/冗余函数
3. EvoAgg 软标签聚合（加权投票 + 语义特征）
4. 输出软标签用于下游分类器训练
"""

import re
import numpy as np
from collections import Counter
from typing import List, Tuple, Optional

# ==============================================================
# 1. 标注函数定义（模拟 LLM 进化生成的函数池）
# ==============================================================

def annotate_safety_concern(text: str) -> int:
    """检测安全隐患相关评论 (1=有隐患, 0=无, -1=弃权)"""
    safety_keywords = [
        "choke", "choking", "hazard", "danger", "injury", "hurt",
        "recall", "toxic", "sharp", "unsafe", "accident", "warning",
        "危险", "安全", "割伤", "吞咽", "有毒", "召回"
    ]
    text_lower = text.lower()
    hits = sum(1 for kw in safety_keywords if kw in text_lower)
    if hits >= 2:
        return 1
    if hits == 1:
        return -1  # 弃权（不确定）
    return 0

def annotate_quality_complaint(text: str) -> int:
    """检测质量投诉 (1=投诉, 0=无, -1=弃权)"""
    complaint_patterns = [
        r"broke? (after|in|within)",
        r"stopped? work",
        r"poor quality",
        r"cheap|cheaply made",
        r"fell apart",
        r"doesn'?t? work",
        r"defect",
        r"broken|crack",
    ]
    text_lower = text.lower()
    for pat in complaint_patterns:
        if re.search(pat, text_lower):
            return 1
    negative_words = ["disappointed", "waste", "terrible", "awful", "horrible"]
    if any(w in text_lower for w in negative_words):
        return 1
    return -1  # 大多数情况弃权，让其他函数决定

def annotate_positive_sentiment(text: str) -> int:
    """检测正向情感 (1=正向, 0=负向, -1=弃权)"""
    positive_strong = ["love", "excellent", "perfect", "amazing", "wonderful", "great", "best"]
    negative_strong = ["hate", "terrible", "awful", "horrible", "worst", "never again"]
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2606.01617 — EvoPool: Evolutionary Programmatic Annotation for Label-Efficient Specialized Supervision

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：原始待标注文本（无需预处理）、200-500 条人工验证集、可选的类目或业务标签体系

**输出**：聚合后的软标签数据集与标注函数池质量报告（含用于 Fitness Gate 的评估结果），供下游分类器训练

## 执行步骤

1. 用 LLM 生成初代标注函数（关键词、正则、简单分类器）。
2. 用人工验证集做 Fitness Gate 评估，淘汰低质与冗余函数。
3. 经多代进化扩充函数池，再用软标签聚合（加权投票）产出标注。
4. 用软标签训练下游分类器，上线后持续接收新数据做低成本标注。

## 边界与不做

- 何时不用：卡页原文明示数据量小于 1 万条、或任务需要极高精度（如医疗诊断）时不适用。
- 能力边界：产出是软标签与函数池，不是最终业务结论，仍需人工验证集把关。
- 能力边界：初代标注函数需要领域专家参与设计，进化迭代需要调参经验。

## 技能关联

- **前置**：Skill-Ecommerce-Data-Quality-Assessment.html、Skill-Ecommerce-Data-Quality-Assessment、Skill-InstructUIE-Unified-Information-Extraction.html、Skill-InstructUIE-Unified-Information-Extraction、Skill-NLP-Text-Classification.html、Skill-NLP-Text-Classification、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-Ecommerce-Data-Quality-Assessment.html、Skill-Ecommerce-Data-Quality-Assessment、Skill-InstructUIE-Unified-Information-Extraction.html、Skill-InstructUIE-Unified-Information-Extraction
- **可组合**：Skill-Ecommerce-Data-Quality-Assessment.html、Skill-Ecommerce-Data-Quality-Assessment、Skill-LLM-Annotation-Weak-Supervision

---

> 分类：数据与Agent平台/数据与AI运行/数据质量　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-LLM-Annotation-Weak-Supervision`