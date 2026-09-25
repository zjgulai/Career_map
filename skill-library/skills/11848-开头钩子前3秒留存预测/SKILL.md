---
name: "p2s-tiktok-hook-optimizer"
title: "Skill-TikTok-Hook-Optimizer — TikTok 开头钩子前3秒留存预测"
description: "触发词：开头钩子、前 3 秒留存、完播率提升、钩子打分排序、开场文案 A/B。何时不用：诊断整条视频为何被限流、要不要换发布时段用 FYP 内容助推类技能，本技能只针对开场文案做留存预测与排序。安全边界：钩子不得使用虚假承诺、恐吓式表述或医疗功效暗示，AI 生成的开场须符合平台内容规范后再投放。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-089"
l3_business: "内容策划"
l3_all: "内容策划 / 视频制作协作"
l1_l2_l3: "业务运营/品牌与增长/内容策划"
p2s_card_id: "Skill-TikTok-Hook-Optimizer"
p2s_src_domain: "20-AI视频生成"
quality_tier: "preview"
user_summary: "给几个开场文案打分，预测哪个能留住前 3 秒的观众，挑最高分的先投。"
user_try: "试试：给这 4 个婴儿辅食机开场钩子打分排序，告诉我哪个前 3 秒留存最高、为什么。"
whenToUse: "已经写好或准备写多条开场文案、需要在投放前排序取舍时用本技能；诊断整条视频的推流卡点、发布时段与互动策略用 FYP 内容助推类技能。"
workflow: "用留存模型给候选钩子打分 → 选最高分钩子先投 → 用实际 3 秒观看率校准权重 → 把最优钩子固化为后续视频模板"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-TikTok-Hook-Optimizer — TikTok 开头钩子前3秒留存预测

## ① 解决的问题

内容创作面临"短视频前3秒流失率高算法不推流"——留存率预测模型将完播率从28%提升至45%，自然流量增加2倍

## ② 核心算法逻辑

TikTok 开头钩子优化器（TikTok Hook Optimizer）通过对钩子特征的量化分析，预测前 3 秒的观众留存概率，指导内容创作者选择最优开场方式。

## ③ 业务应用场景

场景：婴儿辅食机 TikTok 钩子 A/B 测试
- 业务问题：婴儿辅食机 TikTok 视频平均 3 秒留存率 28%，低于平台均值 38%，流量池无法扩大 - 数据要求：历史 20 条视频的 TikTok Analytics 数据（3s View、完播率）、拟测试的 4 个钩子版本文案 - 执行方案： - 用留存预测模型对 4 个钩子打分 - 选出最高分钩子先投放（Day 1-7） - 对比实际 3s View Rate 与预测，校准模型权重 - 最优钩子用于后续所有视频 - 量化产出：3s 留存率从 28% → 47%，完播率从 15% → 24%，自然推荐流量增加 3.2 倍 - 业务价值：TikTok 自然流量 3.2 倍提升，年化
**三轨验证** | 成本轨：传统真人主播月均成本8000-15000元（含薪资、场景布置、设备），虚拟主播方案月均成本1200-2500元（AI视频生成SaaS订阅300-800元/月+内容策划4小时/月+审核2小时/月），成本降低85%；ROI周期从6个月缩短至1.5个月 | 合规轨：需符合《网络直播内容管理规定》和《互联网广告管理办法》，虚拟主播需在直播间明确标注

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：3s 留存率从 28% → 47%，自然推荐流量 3 倍提升，年化增量 GMV 8-15 万元
实施难度：⭐☆☆☆☆（纯文案分析，零技术门槛）
优先级：⭐⭐⭐⭐⭐（TikTok 分发的核心杠杆，每条视频必做优化）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（97 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import re
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple

# 钩子特征权重（基于母婴品类经验数据）
HOOK_FEATURE_WEIGHTS = {
    "question_format": 0.15,       # 问句格式
    "number_shock": 0.18,          # 震惊数字
    "pain_point_urgency": 0.22,    # 痛点紧迫
    "second_person": 0.10,         # 第二人称（You/Your）
    "negation_contrast": 0.12,     # 否定/对比词
    "curiosity_gap": 0.14,         # 好奇心缺口（什么/为什么/秘密）
    "authority_social_proof": 0.09  # 权威背书
}

# 特征词库
PAIN_WORDS = {"tired", "exhausted", "struggling", "failing", "never", "can't", 
              "worst", "hate", "afraid", "scared", "worried", "stressed"}
NUMBER_PATTERN = re.compile(r'\b\d+(?:\.\d+)?%?\b')
CURIOSITY_WORDS = {"secret", "never", "don't", "truth", "hack", "trick", 
                   "doctor", "pediatrician", "study", "research"}

def extract_hook_features(hook_text: str) -> Dict[str, float]:
    """提取钩子特征（0 或 1 为基础，部分为连续值）"""
    text_lower = hook_text.lower()
    words = set(text_lower.split())
    
    features = {
        "question_format": 1.0 if "?" in hook_text else 0.0,
        "number_shock": min(1.0, len(NUMBER_PATTERN.findall(hook_text)) * 0.5),
        "pain_point_urgency": 1.0 if words & PAIN_WORDS else 0.0,
        "second_person": 1.0 if any(w in text_lower for w in ["you", "your", "you're"]) else 0.0,
        "negation_contrast": 1.0 if any(w in text_lower for w in ["vs", "versus", "before", "after", "never", "don't"]) else 0.0,
        "curiosity_gap": 1.0 if words & CURIOSITY_WORDS else 0.0,
        "authority_social_proof": 1.0 if any(w in text_lower for w in ["doctor", "pediatrician", "study", "%", "million"]) else 0.0
    }
    return features

def predict_3s_retention(hook_text: str, base_retention: float = 0.30) -> Dict:
    """预测 3 秒留存率"""
    features = extract_hook_features(hook_text)
    
    # 加权得分
    score = sum(HOOK_FEATURE_WEIGHTS[k] * features[k] for k in HOOK_FEATURE_WEIGHTS)
    
    # 映射到留存率（基础留存 + 提升）
    predicted_retention = base_retention + score * 0.4  # score [0,1] → retention boost [0, 0.4]
    predicted_retention = min(0.75, max(0.15, predicted_retention))
    
    return {
        "hook_text": hook_text[:60] + "..." if len(hook_text) > 60 else hook_text,
        "features": features,
        "hook_score": round(score, 3),
        "predicted_3s_retention_pct": round(predicted_retention * 100, 1),
        "platform_recommendation": "BOOST" if predicted_retention >= 0.40 else "REVISE"
    }

def rank_hook_candidates(hooks: List[str], base_retention: float = 0.30) -> pd.DataFrame:
    """对多个钩子候选排名"""
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2104.06641，但该号在 arXiv 上是《FDG: A Precise Measurement of Fault Diagnosability Gain of Test Cases》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：历史视频的 TikTok 分析数据（3 秒观看率、完播率）作为基准留存，以及拟测试的钩子版本文案（可多条平行对比）。

**输出**：每个钩子的量化特征得分与前 3 秒留存预测、候选钩子排序表，供内容团队选投，并作为后续视频开场模板的依据。

## 执行步骤

1. 收集历史视频的 3 秒观看率与完播率，确定基准留存。
2. 提取候选钩子的量化特征（问句、数字冲击、痛点紧迫、第二人称、否定对比、好奇心缺口、权威背书）。
3. 用留存预测模型给各候选钩子打分并排序。
4. 选最高分钩子先投放，观察实际 3 秒观看率。
5. 用实测结果校准特征权重，把最优钩子固化为后续内容模板。

## 边界与不做

- 没有历史分析数据作基准、或钩子与母婴品类语料差异过大时不要直接套用，特征权重来自特定品类经验数据。
- 能力边界：本技能只预测开场留存并排序，不负责成片质量与投放执行；卡页的留存与流量涨幅为特定案例口径。
- 合规红线：钩子文案不得含虚假承诺、恐吓式表述或医疗功效暗示。

## 技能关联

- **前置**：Skill-AI-Product-Video-Script-Generator.html、Skill-AI-Product-Video-Script-Generator、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Shoppable-Video-CTA-Optimizer.html、Skill-Shoppable-Video-CTA-Optimizer、Skill-TikTok-Algorithm-Content-Boost.html、Skill-TikTok-Algorithm-Content-Boost、Skill-TikTok-Content-Lifecycle-Analytics.html、Skill-TikTok-Content-Lifecycle-Analytics、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Video-ROI-Attribution.html、Skill-Video-ROI-Attribution、Skill-Video-Sentiment-Analysis-VOC.html、Skill-Video-Sentiment-Analysis-VOC
- **延伸**：Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Shoppable-Video-CTA-Optimizer.html、Skill-Shoppable-Video-CTA-Optimizer、Skill-TikTok-Content-Lifecycle-Analytics.html、Skill-TikTok-Content-Lifecycle-Analytics、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Video-ROI-Attribution.html、Skill-Video-ROI-Attribution、Skill-Video-Sentiment-Analysis-VOC.html、Skill-Video-Sentiment-Analysis-VOC
- **可组合**：Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-TikTok-Content-Lifecycle-Analytics.html、Skill-TikTok-Content-Lifecycle-Analytics、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Video-Sentiment-Analysis-VOC.html、Skill-Video-Sentiment-Analysis-VOC、Skill-TikTok-Hook-Optimizer

---

> 分类：业务运营/品牌与增长/内容策划　·　技术族：20-AI视频生成　·　源卡：`Skill-TikTok-Hook-Optimizer`