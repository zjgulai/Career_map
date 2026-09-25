---
name: "p2s-ai-product-video-script-generator"
title: "Skill-AI-Product-Video-Script-Generator — AI 母婴产品视频脚本自动生成"
description: "触发词：视频脚本生成、痛点驱动文案、脚本模板套用、创意简报、多时长版本适配。何时不用：要按真实转化率训练并生成广告文案用强化学习文案技能，只优化已有开场留存用钩子优化技能，本技能从评论痛点生成结构化视频脚本。安全边界：脚本不得使用无依据的统计数字与功效宣称，AI 生成内容须按规定标注，不得违反虚假宣传相关规定。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-090"
l3_business: "创意简报"
l3_all: "创意简报 / 内容策划"
l1_l2_l3: "业务运营/品牌与增长/创意简报"
p2s_card_id: "Skill-AI-Product-Video-Script-Generator"
p2s_src_domain: "20-AI视频生成"
quality_tier: "preview"
user_summary: "把差评里的痛点变成视频脚本，30 秒和 60 秒两个版本一起出。"
user_try: "试试：从竞品差评里提取前 5 个痛点，生成 30 秒和 60 秒两版视频脚本。"
whenToUse: "需要批量产出结构化产品视频脚本、把买家痛点转成开场与卖点表达时用本技能；要按真实转化率训练生成广告文案用强化学习文案技能，只优化已有开场留存用钩子优化类技能。"
workflow: "从评论提取 Top5 痛点词 → 套用痛点、方案、行动召唤模板 → 规则校验字数、情感与号召 → 输出 30 秒与 60 秒两版 → 交付剪辑与投放使用"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-AI-Product-Video-Script-Generator — AI 母婴产品视频脚本自动生成

## ① 解决的问题

内容创作面临"母婴产品视频脚本耗时耗力"——VOC痛点驱动自动生成将视频生产效率提升5倍，月均多产出20条内容

## ② 核心算法逻辑

AI 产品视频脚本生成器（AI Product Video Script Generator）将买家痛点数据（VOC）、产品卖点矩阵和视频时序约束融合为结构化脚本生成流程，核心是痛点解决方案行动召唤（PSA）三段式框架。

## ③ 业务应用场景

场景：婴儿白噪音机 TikTok/Amazon 视频脚本自动生成
- 业务问题：运营每月需要产出 8-10 条新视频脚本，人工撰写每条需要 4-6 小时，月均消耗 50 小时运营时间 - 数据要求：竞品 TOP5 差评关键词、产品 3 大卖点、目标受众画像（新手父母 25-35 岁） - 执行方案： - 从评论数据提取 Top 5 痛点词 - 套用 PSA 模板生成初始脚本 - 规则校验（字数/情感/CTA）自动修正 - 输出 30s/60s 两个版本 - 量化产出：脚本生成时间从 6 小时/条 → 15 分钟/条，月节省 50 小时运营时间 - 业务价值：每月多产 6 条视频，年化内容产量提升 75%，月 GMV 贡献增加约 8-15%
三轨验证 | 成本轨：传统真人主播月均成本8000-15000元（含出镜费、后期剪辑12小时/月），AI虚拟主播月均成本1200-1500元（含平台订阅、渲染计算），成本降低85-90%，年度节省9.6-16.2万元 | 合规轨：符合《电商法》第十五条（不违反虚假宣传），需在视频明显位置标注

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：脚本生成时间从 6h → 15min/条，月节省 50 小时运营时间，年化内容产量提升 75%
实施难度：⭐⭐☆☆☆（模板驱动，无需 LLM API，规则引擎即可）
优先级：⭐⭐⭐⭐⭐（内容产量是 TikTok 算法的核心驱动力，每月 10 条 > 每月 2 条）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（152 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 55 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import re
import numpy as np
import pandas as pd
from typing import List, Dict
from collections import Counter

# 脚本模板库
SCRIPT_TEMPLATES = {
    "hook": [
        "Tired of {pain_point}?",
        "Still struggling with {pain_point}?",
        "What if {pain_point} was finally over?",
        "{stat} parents deal with {pain_point} every night."
    ],
    "problem": [
        "Most babies {problem_behavior}, leaving parents exhausted.",
        "{stat}% of new parents say {pain_point} is their #1 challenge.",
        "Traditional solutions for {pain_point} just don't work."
    ],
    "solution": [
        "Introducing {product_name}: {main_feature}.",
        "{product_name} uses {technology} to {benefit_1} and {benefit_2}.",
        "With {product_name}, {pain_point} becomes {positive_outcome}."
    ],
    "proof": [
        "{rating}★ from {review_count} verified parents.",
        "Recommended by {authority}.",
        "{percentage}% of parents saw results in {timeframe}."
    ],
    "cta": [
        "Order now — {offer}.",
        "Get yours today. Link in bio.",
        "Limited time: {offer}. Don't miss out."
    ]
}

def extract_pain_points(reviews: List[str], top_n: int = 5) -> List[str]:
    """从负面评论提取痛点关键词"""
    pain_words = []
    for review in reviews:
        words = re.findall(r'\b[a-z]{4,}\b', review.lower())
        stop = {"this", "that", "with", "have", "very", "just", "baby", "product"}
        pain_words.extend([w for w in words if w not in stop])
    
    count = Counter(pain_words)
    return [word for word, _ in count.most_common(top_n)]

def fill_template(template: str, variables: Dict[str, str]) -> str:
    """用变量填充模板"""
    result = template
    for key, value in variables.items():
        result = result.replace(f"{{{key}}}", str(value))
    return result

def generate_script(
    product_name: str,
    pain_points: List[str],
    features: List[str],
    proof_data: Dict[str, str],
    duration_seconds: int = 30
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2305.18290。
⚠️ 该号被 3 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：从评论数据提取的 Top5 差评痛点关键词、产品三大卖点、目标受众画像（卡页口径为 25-35 岁新手父母）。

**输出**：结构化视频脚本，含开场钩子、问题段、方案段与行动召唤，输出 30 秒与 60 秒两个时长版本，供剪辑与投放直接使用；卡页口径脚本产出从 6 小时每条压缩到 15 分钟每条、年化内容产量提升 75%。

## 执行步骤

1. 从评论数据中提取 Top5 痛点关键词。
2. 套用痛点、方案、行动召唤三段式模板生成初始脚本。
3. 用规则校验字数、情感与行动召唤并自动修正。
4. 输出 30 秒与 60 秒两个版本。
5. 交付剪辑与投放使用，并按反馈迭代模板。

## 边界与不做

- 评论数据不足或痛点不明确时不要用，模板只能填空、无法凭空产生洞察。
- 能力边界：本技能产出脚本文本与模板填充结果，不做成片、不保证 GMV 贡献；卡页的时间节省与产量提升为特定口径。
- 合规红线：脚本不得使用无依据的统计数字与功效宣称，AI 生成内容须按要求标注，避免虚假宣传。

## 技能关联

- **前置**：Skill-AI-Video-Script-Generation.html、Skill-AI-Video-Script-Generation、Skill-Product-Unboxing-Video-Generator.html、Skill-Product-Unboxing-Video-Generator、Skill-Search-VOC-Signal-Loop.html、Skill-Search-VOC-Signal-Loop、Skill-Shoppable-Video-CTA-Optimizer.html、Skill-Shoppable-Video-CTA-Optimizer、Skill-TikTok-Hook-Optimizer.html、Skill-TikTok-Hook-Optimizer、Skill-Video-Sentiment-Analysis-VOC.html、Skill-Video-Sentiment-Analysis-VOC
- **延伸**：Skill-Product-Unboxing-Video-Generator.html、Skill-Product-Unboxing-Video-Generator、Skill-Shoppable-Video-CTA-Optimizer.html、Skill-Shoppable-Video-CTA-Optimizer、Skill-TikTok-Hook-Optimizer.html、Skill-TikTok-Hook-Optimizer、Skill-Video-Sentiment-Analysis-VOC.html、Skill-Video-Sentiment-Analysis-VOC
- **可组合**：Skill-Shoppable-Video-CTA-Optimizer.html、Skill-Shoppable-Video-CTA-Optimizer、Skill-Video-Sentiment-Analysis-VOC.html、Skill-Video-Sentiment-Analysis-VOC、Skill-AI-Product-Video-Script-Generator

---

> 分类：业务运营/品牌与增长/创意简报　·　技术族：20-AI视频生成　·　源卡：`Skill-AI-Product-Video-Script-Generator`