---
name: "p2s-nps-proxy-retention-predictor"
title: "NPS-Proxy-Retention-Predictor — 评论语言特征构建NPS代理指标与次月留存预测"
description: "触发词：NPS代理指标、评论语言特征、留存预测、复购信号、无调研估算、激励投放。何时不用：已有完整 NPS 调研体系时不需要代理指标；要做差评维度优先级排序用「差评根因分析」。安全边界：代理指标不得冒充正式 NPS 调研结论对外披露；评论采集须遵守平台数据政策与隐私法规；冷启动阶段评论量不足（卡页口径低于 100 条）误差较大，结果须标注不确定性。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-114"
l3_business: "体验分析"
l3_all: "体验分析 / 生命周期触达"
l1_l2_l3: "业务运营/服务与体验/体验分析"
p2s_card_id: "Skill-NPS-Proxy-Retention-Predictor"
p2s_src_domain: "07-NLP-VOC"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "没有 NPS 调研也能估满意度：从评论里的推荐与复购措辞算出代理分 58，判断复购激励该加码还是收缩。"
user_try: "试试：用近 60 天 380 条评论算一下 NPS 代理分和 30 日留存预测，看复购激励要不要加码。"
whenToUse: "当品类没有历史 NPS 调研数据、却又需要判断满意度与复购意向时用本技能；若已有正式调研体系，直接使用调研数据；若要排定差评修复优先级，用「差评根因分析」。"
workflow: "采集近 60 天评论并做文本预处理 → 用词典提取推荐密度、复购信号、忠诚标记与负面强度四维特征 → 加权计算 NPS 代理分 → 用映射函数预测 30 日留存率并与行业基准比较 → 据此决定复购激励投放范围与力度"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# NPS-Proxy-Retention-Predictor — 评论语言特征构建NPS代理指标与次月留存预测

## ① 解决的问题

运营面临无NPS调研数据无法判断用户满意度、复购激励预算盲目投放——评论语言特征构建NPS代理分替代季度调研，年化节省调研成本$36,000+减少无效促销浪费$8,000

## ② 核心算法逻辑

论文：AspectBased Sentiment Analysis for Predicting Customer Retention | 年份：2019

## ③ 业务应用场景

场景：婴儿益智玩具无NPS调研情况下估算用户满意度
- 痛点：新进品类没有历史NPS调研数据，无法判断用户是否满意，复购激励预算不知道应该加码还是收缩。 - 数据：近60天评论共380条。 - 计算结果：recommend_density=0.31，repurchase_signal=0.18，loyalty_marker=0.09，NPS_proxy=58（良好），预测30日留存率62%（行业基准55%）。 - 决策：高于行业基准，确认复购激励有效，当月把「第二件8折」邮件发送给所有购买用户（预测留存≥60%用户），实际复购率61%（预测误差<2pp）。 - 业务价值：省去NPS调研成本（$3,000/次），月均运营决策准确率提升，减少无效促
成本轨 - 数据采集：评论爬取/API调用成本 $200/月（Amazon Product API或第三方数据源） - 计算资源：词典匹配+Sigmoid计算，单次处理380条评论<100ms，云函数成本$50/月 - 人力投入：初期词典构建与权重校准 40小时（$2,000），后续月度维护 4小时（$200/月） - 月度总成本：$450/月（$5,400/年），相比NPS调研$3,000/次×12次=$36,000/年，成本节省85%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

决策速度：每周自动更新 vs 每季度调研，实时性提升12倍
实施难度：⭐⭐（词典+线性模型，无需历史标注数据）
优先级：⭐⭐⭐（中优先级，适合无调研体系的初期品牌）
局限性：权重需定期用实际复购数据校准，冷启动阶段评论量<100条误差较大

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（146 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import re
import numpy as np
from typing import List, Dict, Optional


# 语言特征词典
RECOMMEND_WORDS = {
    "recommend", "love", "must have", "perfect for", "great for", "best",
    "推荐", "必买", "强烈推荐", "非常好", "宝宝爱", "excellent"
}
REPURCHASE_WORDS = {
    "buy again", "reorder", "subscribe", "bought again", "second time",
    "third time", "will order", "keep buying", "再买", "继续购买", "回购", "复购"
}
LOYALTY_WORDS = {
    "always buy", "brand loyal", "only brand", "trust", "been using",
    "years", "loyal customer", "一直买", "只买这个", "信任", "老客户"
}
NEGATIVE_INTENSITY_WORDS = {
    "terrible", "awful", "horrible", "bad", "worst", "never", "hate",
    "差", "难用", "垃圾", "太差", "失望", "退货"
}


def extract_language_features(reviews: List[Dict]) -> Dict[str, float]:
    """
    提取4维语言特征
    reviews: [{"text": str, "rating": int}]
    """
    total_reviews = len(reviews)
    if total_reviews == 0:
        return {"recommend_density": 0, "sentiment_intensity": 0,
                "repurchase_signal": 0, "loyalty_marker": 0}
    
    recommend_count = 0
    repurchase_count = 0
    loyalty_count = 0
    intensity_scores = []
    
    for r in reviews:
        text = r["text"].lower()
        words = set(re.findall(r'\b[a-z\u4e00-\u9fff]+\b', text))
        
        # 推荐密度
        if any(kw.lower() in text for kw in RECOMMEND_WORDS):
            recommend_count += 1
        
        # 复购暗示
        if any(kw.lower() in text for kw in REPURCHASE_WORDS):
            repurchase_count += 1
        
        # 忠诚标记
        if any(kw.lower() in text for kw in LOYALTY_WORDS):
            loyalty_count += 1
        
        # 情感强度（正负词绝对数量）
        pos_neg = sum(1 for kw in NEGATIVE_INTENSITY_WORDS if kw in text)
        word_count = max(len(text.split()), 1)
        intensity_scores.append(1.0 - min(1.0, pos_neg / word_count * 10))
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1905.11946，但该号在 arXiv 上是《EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《AspectBased Sentiment Analysis for Predicting Customer Retention》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：近期评论文本与星级（卡页示例近 60 天 380 条）、语言特征词典与权重配置、行业留存基准值；粒度为单条评论。

**输出**：NPS 代理分、四维语言特征值与 30 日留存率预测；供运营决定复购激励预算加码还是收缩，并作为激励投放的筛选依据。

## 执行步骤

1. 采集近 60 天评论并做文本清洗与分句
2. 用词典提取推荐、复购、忠诚与负面强度四维语言特征
3. 按权重合成 NPS 代理分
4. 用映射函数预测 30 日留存率并对照行业基准
5. 按代理分确定复购激励的投放人群与力度

## 边界与不做

- 数据不满足：评论量低于 100 条时误差较大，不适合单独作为投放决策依据。
- 何时不用：已有正式 NPS 调研时直接用调研数据，差评修复排序用「差评根因分析」。
- 能力边界：给出的是代理指标与预测，不等同于真实调研结论，也需随复购数据定期校准权重。
- 安全边界：代理指标不得对外冒充正式 NPS 结论，评论采集须合规。

## 技能关联

- **前置**：Skill-Cohort-Churn-Intervention-Dispatcher.html、Skill-Cohort-Churn-Intervention-Dispatcher、Skill-NLP-Sentiment-ML-Pipeline.html、Skill-NLP-Sentiment-ML-Pipeline、Skill-Review-Sentiment-Growth-Trigger.html、Skill-Review-Sentiment-Growth-Trigger、Skill-VOC-Churn-Signal-Extraction.html、Skill-VOC-Churn-Signal-Extraction、Skill-VOC-New-Product-Gap-Scoring.html、Skill-VOC-New-Product-Gap-Scoring、Skill-VOC-Proxy-NPS-AIPL-统一萃取引擎.html、Skill-VOC-Proxy-NPS-AIPL-统一萃取引擎
- **延伸**：Skill-Cohort-Churn-Intervention-Dispatcher.html、Skill-Cohort-Churn-Intervention-Dispatcher、Skill-Review-Sentiment-Growth-Trigger.html、Skill-Review-Sentiment-Growth-Trigger、Skill-VOC-Churn-Signal-Extraction.html、Skill-VOC-Churn-Signal-Extraction、Skill-VOC-New-Product-Gap-Scoring.html、Skill-VOC-New-Product-Gap-Scoring
- **可组合**：Skill-Cohort-Churn-Intervention-Dispatcher.html、Skill-Cohort-Churn-Intervention-Dispatcher、Skill-Review-Sentiment-Growth-Trigger.html、Skill-Review-Sentiment-Growth-Trigger、Skill-VOC-New-Product-Gap-Scoring.html、Skill-VOC-New-Product-Gap-Scoring、Skill-NPS-Proxy-Retention-Predictor

---

> 分类：业务运营/服务与体验/体验分析　·　技术族：07-NLP-VOC　·　源卡：`Skill-NPS-Proxy-Retention-Predictor`