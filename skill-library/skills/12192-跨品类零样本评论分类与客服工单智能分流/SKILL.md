---
name: "p2s-nlp-text-classification"
title: "NLP Text Classification — 跨品类零样本评论分类与客服工单智能分流"
description: "触发词：零样本分类、评论分类、工单分流、跨品类分类、分类 Schema。何时不用：要自动发现未知主题用「BERTopic 主题建模」；本技能是按给定 Schema 做分类。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-110"
l3_business: "客诉分诊"
l3_all: "客诉分诊 / 客诉聚类"
l1_l2_l3: "业务运营/服务与体验/客诉分诊"
p2s_card_id: "Skill-NLP-Text-Classification"
p2s_src_domain: "07-NLP-VOC"
quality_tier: "preview"
user_summary: "新品类上线不用重新标注数据，换几个示例就能把评论按统一标准分好，结果直接进看板。"
user_try: "试试：用统一的分类 Schema 把这 1000 条差评分成产品问题、物流、客服、使用问题，输出结构化 JSON。"
whenToUse: "当分类体系已定、需要跨品类零样本快速复用并输出结构化结果时用；需要发现未知主题或聚类时用「BERTopic 主题建模」。"
workflow: "定义覆盖全品类的分类 Schema 与标签描述 → 为每个品类挑选 3-5 条 in-context 示例 → 新品类上线时只替换示例即可投入使用 → 输出结构化 JSON 并写入 BI 看板"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# NLP Text Classification — 跨品类零样本评论分类与客服工单智能分流

## ① 解决的问题

客服工单人工分类耗时 4-6 小时/周且跨品类不可复用——LLM 零样本分类将分类一致性从 78% 提升至 93%，新品类 15 分钟投入使用，年化节省人力 ¥6-12 万

## ② 核心算法逻辑

跨境电商的品类扩展速度远快于 NLP 标注速度——今天卖吸奶器，明天上婴儿推车，后天做儿童益智玩具。每次新增品类都要重新收集标注数据和微调模型，这在业务上根本跑不过来。

## ③ 业务应用场景

业务问题：运营团队每周要手工从 Amazon / TikTok Shop / 独立站三个平台抓取 1,000+ 条差评，按"产品问题/物流/客服/使用问题"分类后才能给到各责任部门。这个工作每周耗时 4-6 小时，且新品类上线后要重新建分类标准。
解决方案： 1. 定义统一的分类 Schema（覆盖所有品类的通用问题维度） 2. 每个品类提供 3-5 个 in-context 示例（从已有差评中人工挑选） 3. 新品类上线时，只需更换示例，15 分钟即可投入使用 4. 输出结构化 JSON，直接写入 Superset BI 看板
| 一级类 | 二级类 | 描述 | |---|---|---| | 产品质量 | 核心性能 | 吸力不足、噪音、电池续航 | | 产品质量 | 材质安全 | BPA、硅胶气味、认证 | | 使用体验 | 舒适度 | 法兰尺寸、穿戴感 | | 物流体验 | 配送时效 | 发货慢、包装破损 | | 售后服务 | 客服响应 | 退换货、答复慢 |

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
差评分类自动化：运营节省 4-6 小时/周 × 52 周 × ¥150/小时 = ¥31,200-46,800/年
客服工单分流：40% 工单自动回复，客服人力效率提升 60%，年化节省 ¥60,000-120,000
差评响应加速 → 差评率下降 → 年化 GMV 防损 ¥30-80 万
年化综合 ROI：¥100-200 万
实施难度：⭐⭐☆☆☆（定义 Schema 1-2 小时，代码集成 1 天，无需标注数据）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（240 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/nlp_voc/nlp_text_classification` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/07-NLP-VOC/Skill-NLP-Text-Classification.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
NLP Text Classification — LLM 驱动的跨品类零样本评论分类
基于 arXiv 2501.08974 实现

依赖: json, re, dataclasses (标准库); 生产环境需要 LLM API
"""

from dataclasses import dataclass, field
from typing import Optional
import json
import re


@dataclass
class ClassificationSchema:
    """分类 Schema 定义"""
    name: str                                    # Schema 名称（如"吸奶器差评分类"）
    labels: list                                 # [{label, description, examples}]
    task_instruction: str = "请将以下文本分类"


@dataclass
class ClassificationResult:
    """单条文本的分类结果"""
    text_id: str
    text: str
    label: str
    sub_label: str = ""
    confidence: float = 1.0
    evidence: str = ""          # 支持分类决策的关键文本片段
    is_auto_resolved: bool = False   # 是否可自动处理（无需人工）


class PromptBuilder:
    """构造 LLM 分类 Prompt"""

    def build(self, text: str, schema: ClassificationSchema,
              examples: Optional[list] = None) -> str:
        """
        生成结构化分类 Prompt

        Args:
            text: 待分类文本
            schema: 分类 Schema
            examples: in-context 示例 [{text, label, sub_label}]
        """
        label_desc = "\n".join([
            f"  - {lb['label']}: {lb['description']}"
            for lb in schema.labels
        ])

        example_str = ""
        if examples:
            parts = []
            for ex in examples[:5]:
                parts.append(
                    f'  文本: "{ex["text"][:80]}"\n'
                    f'  分类: {ex["label"]} > {ex.get("sub_label", "")}'
                )
            example_str = "\n示例：\n" + "\n---\n".join(parts)
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2501.08974 — Learning to Extract Cross-Domain Aspects and Understanding Sentiments Using Large Language Models

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：待分类文本、分类 Schema（一级与二级类及描述）、每品类 3-5 条 in-context 示例；无需标注训练数据。

**输出**：每条文本的分类结果（一级与二级类、置信度、支持决策的关键片段、是否可自动处理）结构化 JSON，可写入 BI 看板。

## 执行步骤

1. 定义覆盖全品类的分类 Schema 与标签描述
2. 为每个品类挑选 3-5 条 in-context 示例
3. 批量分类并记录支持决策的关键文本片段
4. 标记可自动处理的工单并分流
5. 把结构化结果写入 BI 看板供各部门跟进

## 边界与不做

- 何时不用：分类 Schema 未定义或示例与品类严重不符时，分类会被误导
- 能力边界：只输出分类标签与依据，不做根因分析，也不替代责任部门的问题处理

## 技能关联

- **前置**：Skill-Agent-Safety-Guardrails.html、Skill-Agent-Safety-Guardrails、Skill-Amazon-ToS-Compliance-Guardrail.html、Skill-Amazon-ToS-Compliance-Guardrail、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-InstructUIE-Unified-Information-Extraction.html、Skill-InstructUIE-Unified-Information-Extraction、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-VOC-Proxy-NPS-AIPL-统一萃取引擎.html、Skill-VOC-Proxy-NPS-AIPL-统一萃取引擎
- **延伸**：Skill-Agent-Safety-Guardrails.html、Skill-Agent-Safety-Guardrails、Skill-Amazon-ToS-Compliance-Guardrail.html、Skill-Amazon-ToS-Compliance-Guardrail、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-VOC-Proxy-NPS-AIPL-统一萃取引擎.html、Skill-VOC-Proxy-NPS-AIPL-统一萃取引擎
- **可组合**：Skill-Agent-Safety-Guardrails.html、Skill-Agent-Safety-Guardrails、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-NLP-Text-Classification

---

> 分类：业务运营/服务与体验/客诉分诊　·　技术族：07-NLP-VOC　·　源卡：`Skill-NLP-Text-Classification`