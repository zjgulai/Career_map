---
name: "p2s-llm-as-judge-evaluator"
title: "LLM-as-Judge — 用大模型自动评估生成内容质量"
description: "触发词：自动质检、评分标准、评审流水线、内容抽检、质量趋势监控。何时不用：评估对象是检索召回质量时用检索评测；需要平台级终审结论时不能只靠模型判分。安全边界：评审结果只作内部质控，不等于平台审核通过；不得上传用户隐私数据，并需定期用人工标注校验判分与人工的一致性。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / Playbook评估"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-LLM-as-Judge-Evaluator"
p2s_src_domain: "09-DataAgent-LLM"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用大模型按评分标准逐条给生成内容打分并给修改建议，人工只抽查高风险项，质检从抽检变成全量。"
user_try: "试试：按母婴安全词和关键词覆盖标准，给今天这 50 条 Listing 打分并标出必须退回修改的。"
whenToUse: "属于「业务工具实现」：AI 产出速度超过人工审核能力、需要全量质检与趋势监控时用；若评估对象是检索召回质量，用检索评测；若要平台级终审结论，仍须人工或平台流程。"
workflow: "定义评分标准：合规性、关键词覆盖、可读性、安全词、行动召唤等维度 → 准备待评审内容与可选的历史人工标注数据 → 调用模型按标准逐条打多维分并输出修改建议 → 按阈值分流：高分放行、低分退回或转人工抽查 → 定期用人工标注校验判分一致性，监控质量趋势"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLM-as-Judge — 用大模型自动评估生成内容质量

## ① 解决的问题

团队面临"AI每天生成50条Listing人工审核不够用"——LLM-as-Judge实现100%自动化质检，合规风险发现率提升50%，年化节省人力+避免下架损失共140万元

## ② 核心算法逻辑

LLMasJudge利用大语言模型自动评估其他LLM（或系统）的输出质量，解决核心工程问题：人工标注速度远慢于AI生产速度，无法规模化评估。

## ③ 业务应用场景

场景A：Listing质量自动化评审 - 业务问题：AI生成的亚马逊Listing需要人工审核（标题/Bullet Points/描述），每天产出50条，审核人员不够用 - 数据要求：Listing文本（标题+Bullet Points+描述）+ 评审Rubric（母婴安全词库、关键词覆盖、可读性标准）+ 可选：历史人工评审标注数据 - 预期产出：每条Listing的多维评分（合规性/关键词覆盖/可读性/母婴安全词/CTA强度）+ 修改建议，整体评分8分以上可直接上架，<6分退回修改 - 业务价值：人工审核工作量减少70%（从50条到15条高风险抽查），Listing上架速度从3天压缩到4小时
三轨对抗验证： 1. 成本验证：使用DeepSeek-V3评审每条Listing约0.02元（2000 tokens），每天50条=1元/天，全年365元，极低成本 2. 合规验证：LLM Judge本身不上传用户数据（Listing是公开内容）；注意Judge的评审结果不可作为"平台审核通过"的等价证明，仅是内部质控 3. 风险验证：LLM Judge存在系统性偏差（总偏好正式语言，可能低评非正式风格的Listing）；需定期用人工标注数据校验Judge与人工的相关系数（目标>0.75）
场景B：客服AI回复质量监控 - 业务问题：DeepSeek驱动的客服AI每天产生3000条回复，人工抽检100条（3.3%），无法监控整体质量趋势 - 数据要求：客服对话（用户消息+AI回复）+ 质量rubric（专业度/准确性/同理心/解决率） - 预期产出：每条对话的质量评分（0-10分）+ 质量趋势日报 + 低分对话（<6分）的问题分类 - 业务价值：质量监控覆盖率从3.3%提升到100%；提前发现AI回复质量下降趋势（如因知识库更新导致的错误率上升），节省客诉处理成本约30万元/年

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：Listing审核人力成本降低70%（年化节省约60万元）；质检覆盖率从5%提升到100%，合规风险下降约50%（避免下架损失约80万元）；DeepSeek API成本不超过365元/年，ROI超过100:1
实施难度：⭐⭐☆☆☆（核心逻辑极简，1天可接入；主要工作是Rubric设计和人工标注校验）
优先级：⭐⭐⭐⭐⭐（每个使用LLM生成内容的团队的必备工具，零替代方案）
评估依据：NeurIPS 2023 MT-Bench证明GPT-4-as-Judge与人工评判相关系数0.88；ICLR 2024 PROMETHEUS证明专用Judge可用小模型实现，大幅降低成本；工业界Anthropic/Google/OpenAI均用LLM-as-Judge做自身模型评估

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（221 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-LLM-as-Judge-Evaluator
用LLM自动评估AI生成内容质量 — 母婴Listing质量自动审核

依赖：pip install numpy pandas
注意：生产环境需接入 DeepSeek/OpenAI API
"""

import json
import re
import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Optional

# ── 1. 评分Rubric定义（母婴Listing专用）─────────────────────────────
LISTING_RUBRIC = """
请你作为母婴跨境电商专家，对以下亚马逊Listing进行质量评审。

评审维度（每项0-2分，总分0-10分）：
1. 标题关键词覆盖 (0-2分)：包含核心关键词（产品名+主要特征+使用场景），不超过200字符
2. Bullet Point清晰度 (0-2分)：5条bullet，每条突出一个核心卖点，有量化数据支撑
3. 母婴安全合规 (0-2分)：无"最安全/治疗/100%"等违禁词，有安全认证信息
4. 目标用户匹配度 (0-2分)：明确适用月龄/年龄，场景描述与母婴用户痛点匹配
5. 行动召唤强度 (0-2分)：有Purchase Driver（限时/独家/品牌承诺）

请按如下JSON格式输出：
{
  "scores": {
    "keyword_coverage": <0-2>,
    "bullet_clarity": <0-2>,
    "safety_compliance": <0-2>,
    "target_match": <0-2>,
    "cta_strength": <0-2>
  },
  "total_score": <0-10>,
  "verdict": "APPROVE" | "REVIEW" | "REJECT",
  "issues": ["问题1", "问题2"],
  "suggestions": ["建议1", "建议2"]
}

Listing内容：
"""

# ── 2. LLM Judge评估器 ─────────────────────────────────────────────
@dataclass
class ListingEvalResult:
    listing_id: str
    total_score: float
    scores: dict
    verdict: str
    issues: list
    suggestions: list
    raw_response: str

class LLMListingJudge:
    """
    LLM-as-Judge 母婴Listing质量评审器
    生产环境：接入 DeepSeek API
    Demo环境：使用规则+关键词启发式评估（零依赖）
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2310.08491，但该号在 arXiv 上是《Prometheus: Inducing Fine-grained Evaluation Capability in Language Models》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：待评审文本（卡页示例：Listing 标题加 Bullet Points 加描述；客服场景为用户消息加 AI 回复）、评审 rubric（母婴安全词库、关键词覆盖、可读性标准）与可选的历史人工评审标注数据。

**输出**：每条内容的多维评分与修改建议（卡页示例：总分 8 分以上可直接上架、低于 6 分退回修改）、质量趋势日报与低分问题分类，供内容与客服团队使用。

## 执行步骤

1. 定义评审标准：合规性、关键词覆盖、可读性、安全词、行动召唤等维度
2. 准备待评审内容与 rubric，尽量补上历史人工标注
3. 调用模型按标准逐条打多维分并输出修改建议
4. 按阈值分流：高分放行、低分退回或转人工抽查
5. 定期用人工标注校验判分一致性，监控质量趋势

## 边界与不做

- 数据不满足时不用：没有成文的评审标准（rubric）时打分不可复现，应先请业务方把标准写出来。
- 能力边界：本卡产出打分与建议，不替代人工终审与平台规则判定；模型存在系统性偏好，需定期校准。
- 评审结果只作内部质控，不等于平台审核通过；不得上传用户隐私数据，并需用人工标注校验判分一致性。

## 技能关联

- **前置**：Skill-Agent-Capability-Evaluation.html、Skill-Agent-Capability-Evaluation、Skill-Amazon-ToS-Compliance-Guardrail.html、Skill-Amazon-ToS-Compliance-Guardrail、Skill-LLM-Business-Intelligence-Reasoning.html、Skill-LLM-Business-Intelligence-Reasoning、Skill-LLM-Hallucination-Detection-BI.html、Skill-LLM-Hallucination-Detection-BI、Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-NLP-Copy-AB-Test-Optimizer.html、Skill-NLP-Copy-AB-Test-Optimizer
- **延伸**：Skill-Agent-Capability-Evaluation.html、Skill-Agent-Capability-Evaluation、Skill-Amazon-ToS-Compliance-Guardrail.html、Skill-Amazon-ToS-Compliance-Guardrail、Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-NLP-Copy-AB-Test-Optimizer.html、Skill-NLP-Copy-AB-Test-Optimizer
- **可组合**：Skill-Amazon-ToS-Compliance-Guardrail.html、Skill-Amazon-ToS-Compliance-Guardrail、Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-NLP-Copy-AB-Test-Optimizer.html、Skill-NLP-Copy-AB-Test-Optimizer、Skill-LLM-as-Judge-Evaluator

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-LLM-as-Judge-Evaluator`