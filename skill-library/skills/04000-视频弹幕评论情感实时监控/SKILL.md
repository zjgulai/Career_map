---
name: "p2s-video-sentiment-analysis-voc"
title: "Skill-Video-Sentiment-Analysis-VOC — 视频弹幕/评论情感实时监控"
description: "触发词：评论情感监控、弹幕舆情、负面预警、评论维度分析、内容信号提取。何时不用：做竞品属性的定位对比用竞争定位地图技能，做内容合规分级用品牌安全过滤技能，本技能只做评论情感的实时监控与维度挖掘。安全边界：评论数据须按平台条款与授权方式获取，涉用户个人信息须脱敏，不得删改用户评论。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-088"
l3_business: "品牌反馈"
l3_all: "品牌反馈 / VOC编码"
l1_l2_l3: "业务运营/品牌与增长/品牌反馈"
p2s_card_id: "Skill-Video-Sentiment-Analysis-VOC"
p2s_src_domain: "20-AI视频生成"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "盯住视频评论里的情绪变化，负面苗头两小时内就能报出来。"
user_try: "试试：监控这条湿巾视频的评论情感，把负面集中的维度和高频正面词都列给我。"
whenToUse: "爆款视频或直播期间需要实时发现负面舆情、并从中提取内容优化信号时用本技能；做竞品属性的定位对比用竞争定位地图技能，做内容合规分级用品牌安全过滤技能。"
workflow: "实时拉取评论数据 → 按维度做情感分析 → 定位负面集中的属性 → 触发预警并回复热门负面评论 → 提取正面高频词回喂内容"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Video-Sentiment-Analysis-VOC — 视频弹幕/评论情感实时监控

## ① 解决的问题

运营面临"直播/短视频评论情感趋势无法实时监控"——实时情感监控将负面舆情响应时间从24h缩短至2h，年化减少危机处理成本15万元

## ② 核心算法逻辑

视频评论情感分析（Video Sentiment Analysis VOC）对 TikTok/YouTube/Instagram 视频评论和弹幕进行多维情感挖掘，实时监控品牌声誉并提取内容优化信号。

## ③ 业务应用场景

场景：婴儿湿巾 TikTok 病毒视频评论情感监控
- 业务问题：一条婴儿湿巾 TikTok 视频 48 小时播放量 200 万，评论涌入 800 条，运营无法逐条查看，不知道是否有负面舆情风险 - 数据要求：TikTok 评论 API 数据（或手动导出）、品类情感基准数据 - 执行方案： - 实时拉取评论，批量 ABSA 分析 - 发现「packaging」维度负面集中（38 条提到「flimsy packaging」「lid broken」） - 触发警报：立即回复热门负面评论，同时通知供应链团队排查包装问题 - 提取正面高频词（「soft」「gentle」「no rash」）用于后续视频内容 - 量化产出：负面舆情在 2 小时内发现并响应
**三轨验证** | 成本轨：月均成本1200元（虚拟主播视频生成工具订阅800元/月+人工审核4小时/月@100元/小时），相比真人主播月均8000元成本降低85% | 合规轨：需符合《网络直播营销管理办法》第8条

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：2 小时内发现负面舆情（vs 传统 24-48h），避免差评升级，保护年化 GMV 5-15 万元
实施难度：⭐⭐⭐☆☆（NLP 流水线，可用规则引擎代替模型，开发周期 1-2 天）
优先级：⭐⭐⭐⭐☆（爆款视频期间必开监控，正常期月度复盘即可）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（137 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import re
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple
from collections import Counter, defaultdict

# 情感词典（简化版，真实场景用 VADER 或 TextBlob）
POSITIVE_WORDS = {
    "love", "great", "amazing", "perfect", "excellent", "wonderful", "soft",
    "gentle", "recommend", "best", "nice", "good", "happy", "works", "smooth"
}
NEGATIVE_WORDS = {
    "hate", "terrible", "broken", "waste", "cheap", "flimsy", "bad", "poor",
    "worst", "awful", "disappointed", "return", "refund", "leak", "rash"
}
QUESTION_WORDS = {"where", "how", "what", "when", "why", "price", "available", "link"}

# Aspect 关键词
ASPECT_KEYWORDS = {
    "quality": {"quality", "material", "soft", "gentle", "durable", "cheap", "flimsy", "broken"},
    "price": {"price", "expensive", "cheap", "value", "worth", "cost", "deal", "discount"},
    "experience": {"easy", "use", "smell", "feels", "texture", "rash", "reaction", "works"},
    "shipping": {"shipping", "delivery", "packaging", "package", "box", "lid", "arrived"},
    "content": {"video", "helpful", "clear", "honest", "funny", "creative", "boring"}
}

def simple_sentiment(text: str) -> str:
    """简单情感分类（正面/负面/中立/疑问）"""
    tokens = set(text.lower().split())
    
    if tokens & QUESTION_WORDS and "?" in text:
        return "QUESTION"
    
    pos_count = len(tokens & POSITIVE_WORDS)
    neg_count = len(tokens & NEGATIVE_WORDS)
    
    if neg_count > pos_count:
        return "NEGATIVE"
    elif pos_count > neg_count:
        return "POSITIVE"
    else:
        return "NEUTRAL"

def detect_aspects(text: str) -> List[str]:
    """检测评论涉及的 Aspect"""
    tokens = set(text.lower().split())
    detected = []
    for aspect, keywords in ASPECT_KEYWORDS.items():
        if tokens & keywords:
            detected.append(aspect)
    return detected if detected else ["general"]

def analyze_comments_batch(comments: List[str]) -> pd.DataFrame:
    """批量分析评论情感"""
    rows = []
    for i, comment in enumerate(comments):
        sentiment = simple_sentiment(comment)
        aspects = detect_aspects(comment)
        rows.append({
            "comment_id": i + 1,
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：评论数据（平台评论接口或手动导出）与品类情感基准数据，文本粒度到单条评论。

**输出**：评论情感分布与属性维度（如包装、品质）拆解、负面集中的属性清单与预警信号、正面高频词清单；卡页口径负面舆情在 2 小时内发现并响应，避免差评升级。

## 执行步骤

1. 实时拉取视频评论并按维度做情感分析。
2. 定位负面集中出现的属性维度与高频负面词。
3. 触发预警并回复热门负面评论。
4. 同步通知相关团队排查问题。
5. 提取正面高频词回喂后续视频内容。

## 边界与不做

- 拿不到评论接口或评论量过少时不要用，情感趋势没有统计意义。
- 能力边界：词典或模型判断存在误判，负面识别结果需人工确认后再对外回应；正常期做月度复盘即可，卡页的响应时间与 GMV 保护为特定口径。
- 合规红线：评论数据须按平台条款与授权方式获取，涉用户个人信息须脱敏，不得删改用户评论。

## 技能关联

- **前置**：Skill-AI-Product-Video-Script-Generator.html、Skill-AI-Product-Video-Script-Generator、Skill-Brand-Safety-Video-Content-Filter.html、Skill-Brand-Safety-Video-Content-Filter、Skill-Review-Keyword-Mining-SEO.html、Skill-Review-Keyword-Mining-SEO、Skill-Search-VOC-Signal-Loop.html、Skill-Search-VOC-Signal-Loop、Skill-TikTok-Content-Lifecycle-Analytics.html、Skill-TikTok-Content-Lifecycle-Analytics、Skill-TikTok-Hook-Optimizer.html、Skill-TikTok-Hook-Optimizer
- **延伸**：Skill-AI-Product-Video-Script-Generator.html、Skill-AI-Product-Video-Script-Generator、Skill-Brand-Safety-Video-Content-Filter.html、Skill-Brand-Safety-Video-Content-Filter、Skill-Review-Keyword-Mining-SEO.html、Skill-Review-Keyword-Mining-SEO、Skill-TikTok-Hook-Optimizer.html、Skill-TikTok-Hook-Optimizer
- **可组合**：Skill-Review-Keyword-Mining-SEO.html、Skill-Review-Keyword-Mining-SEO、Skill-TikTok-Hook-Optimizer.html、Skill-TikTok-Hook-Optimizer、Skill-Video-Sentiment-Analysis-VOC

---

> 分类：业务运营/品牌与增长/品牌反馈　·　技术族：20-AI视频生成　·　源卡：`Skill-Video-Sentiment-Analysis-VOC`