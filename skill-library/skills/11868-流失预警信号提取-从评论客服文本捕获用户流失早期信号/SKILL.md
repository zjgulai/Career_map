---
name: "p2s-voc-churn-early-warning-signal"
title: "VOC流失预警信号提取 — 从评论/客服文本捕获用户流失早期信号"
description: "触发词：VOC 流失预警、评论信号、客服工单、流失概率、提前拦截。何时不用：只做评论情感聚合与口碑摘要时用 VOC 摘要类技能；本技能要把文本信号映射成流失风险。安全边界：平台评论用户 ID 不得直接关联订单数据；站内触达可能被判定操纵评论，须走站外渠道。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 分群"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-VOC-Churn-Early-Warning-Signal"
p2s_src_domain: "07-NLP-VOC"
quality_tier: "preview"
user_summary: "从评论和客服对话里读出『这个人快走了』的早期信号，比销量下滑早几周把人拦下来。"
user_try: "试试：用吸奶器用户的历史评论与客服工单，输出 30 天内高风险流失名单（P(churn) 高于 0.65）与挽回动作。"
whenToUse: "有评论文本或客服工单、需要提前锁定流失风险用户时用本技能；纯行为数据的流失预测用行为模型即可。"
workflow: "接入用户历史评论、客服工单与订单历史 → 用流失关键词与竞品提及规则提取语义信号 → 计算流失概率并筛出高风险名单 → 区分可干预流失与自然流失后生成差异化挽回动作"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# VOC流失预警信号提取 — 从评论/客服文本捕获用户流失早期信号

## ① 解决的问题

运营面临"用户流失却无预警"——VOC信号将流失预测窗口从销量下滑后1-2周提前至4-8周，年化挽回留存价值30-50万元

## ② 核心算法逻辑

传统流失预测依赖行为数据（购买频次、活跃度），但行为信号滞后——用户已决定离开后才体现在购买数据上，此时已错过干预窗口。

## ③ 业务应用场景

场景A：吸奶器复购流失预警 - 业务问题：吸奶器主力用户（产后0-18个月）复购率仅22%，团队不知道哪批用户在流失 - 数据要求：用户历史评论（≥3条）、客服工单记录、Amazon/Shopify订单历史 - 预期产出：30天内高风险流失用户名单（P(churn) > 0.65），约占活跃用户8-12% - 业务价值：对该批用户发送专属优惠+内容，可挽回15-20%，年化留存价值约 30-50万元
三轨验证： - 成本：数据采集需接入Amazon SP-API获取评论用户ID（约$500/月API费），NLP模型推理需GPU实例（约$200/月），人力成本约0.5个数据工程师（月薪1.5万）。总月成本约2.2万元。 - 合规：Amazon评论用户ID不可直接关联订单数据（违反Amazon数据使用政策），需通过用户授权或匿名化处理；GDPR下需用户同意用于流失分析，否则只能使用聚合信号。 - 风险：对高风险用户发送专属优惠可能被Amazon判定为操纵评论（违反TOS），建议通过站外邮件（Shopify渠道）触达；若竞品提及信号误判（如用户正常比较），可能引发不必要干预，导致用户反感。
场景B：奶粉阶段切换期流失拦截 - 业务问题：奶粉用户随宝宝成长自然流失（从配方奶升级到固体食物），但抱怨类流失可提前干预 - 数据要求：评论中阶段性关键词（月龄提及）+ 情感时序 - 预期产出：区分「自然流失」vs「可干预流失」，精准营销仅针对后者

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：吸奶器品牌（月均复购用户500人），识别并挽回8%高风险用户（约40人），客单价200美元，年化增量营收约 96,000元；若扩展至全品线，年化价值 30-80万元
vs 纯行为模型优势：预警窗口提前4-8周，干预成本（折扣率）从15%降至8%，因为用户尚未完全决定离开
实施难度：⭐⭐⭐☆☆（需要历史评论数据归因到用户，Amazon原生不支持，需第三方工具）
优先级：⭐⭐⭐⭐☆（高频痛点，数据可获取，ROI明确）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（152 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import re
from collections import defaultdict
from datetime import datetime, timedelta

# 模拟VOC流失预警信号提取器
class VOCChurnEarlyWarningSignal:
    """从评论文本提取流失早期预警信号"""
    
    def __init__(self):
        # 流失预警关键词（简化版VADER扩展词典）
        self.churn_keywords = [
            '不再购买', '换品牌', '最后一次', '失望', '退款', '不值得',
            'last purchase', 'switching', 'disappointed', 'returning', 'never again',
            'competitor', 'alternative', 'cheaper option', 'better product'
        ]
        self.positive_keywords = ['推荐', '回购', '继续用', 'repurchase', 'recommend', 'love it']
        self.competitor_pattern = re.compile(
            r'\b(Medela|Spectra|Haakaa|Lansinoh|Philips Avent|NUK|Chicco)\b', 
            re.IGNORECASE
        )
    
    def extract_sentiment_score(self, text):
        """简化情感评分（-1到1）"""
        text_lower = text.lower()
        churn_count = sum(1 for k in self.churn_keywords if k.lower() in text_lower)
        positive_count = sum(1 for k in self.positive_keywords if k.lower() in text_lower)
        # 归一化到[-1, 1]
        total = churn_count + positive_count + 1e-6
        return (positive_count - churn_count * 1.5) / total
    
    def detect_silence_signal(self, review_timestamps, window_days=14):
        """检测沉默信号：近期活跃度下降"""
        now = datetime.now()
        recent_cutoff = now - timedelta(days=window_days)
        baseline_cutoff = now - timedelta(days=window_days * 3)
        
        baseline_count = sum(1 for t in review_timestamps if baseline_cutoff <= t < recent_cutoff)
        recent_count = sum(1 for t in review_timestamps if t >= recent_cutoff)
        
        baseline_rate = baseline_count / (window_days * 2)
        recent_rate = recent_count / window_days
        
        silence_signal = (baseline_rate > 0.1) and (recent_rate < baseline_rate * 0.5)
        return silence_signal, baseline_rate, recent_rate
    
    def detect_competitor_mention(self, text):
        """检测竞品提及"""
        matches = self.competitor_pattern.findall(text)
        return len(matches) > 0, matches
    
    def compute_churn_risk_score(self, user_data):
        """计算综合流失风险分"""
        signals = []
        
        # 信号1：情感趋势
        sentiment_scores = [self.extract_sentiment_score(r['text']) for r in user_data['reviews']]
        if len(sentiment_scores) >= 3:
            # 近期情感趋势（线性回归斜率）
            x = np.arange(len(sentiment_scores))
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2404.08821，但该号在 arXiv 上是《Constrained C-Test Generation via Mixed-Integer Programming》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：用户级文本与交易数据：历史评论（建议不少于 3 条）、客服工单记录、订单历史；评论需能归因到具体用户。

**输出**：30 天内高风险流失用户名单（按 P(churn) 阈值筛选）与占比、可干预与自然流失的区分、建议挽回动作；供留存运营使用。

## 执行步骤

1. 接入评论、工单与订单数据并归因到用户
2. 用关键词规则与语义打分提取流失信号
3. 输出流失概率并筛出高风险名单
4. 区分可干预流失与自然流失
5. 生成站外渠道的挽回动作建议

## 边界与不做

- 评论数据无法归因到用户、或文本量过少时不用本技能。
- 本技能输出风险名单与信号解释，不撰写文案、也不执行触达。
- 安全边界：平台评论用户 ID 不得与订单数据直接关联；避免站内评论相关触达以防被判操纵评论。

## 技能关联

- **前置**：Skill-Combo-Customer-Churn-Recovery.html、Skill-Combo-Customer-Churn-Recovery、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-NLP-Sentiment-ML-Pipeline.html、Skill-NLP-Sentiment-ML-Pipeline、Skill-Uplift-Churn-Prediction.html、Skill-Uplift-Churn-Prediction、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-VOC-NPS-Retention-Predictor.html、Skill-VOC-NPS-Retention-Predictor、Skill-VOC-Product-Iteration-Signal-Extractor.html、Skill-VOC-Product-Iteration-Signal-Extractor
- **延伸**：Skill-Combo-Customer-Churn-Recovery.html、Skill-Combo-Customer-Churn-Recovery、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Uplift-Churn-Prediction.html、Skill-Uplift-Churn-Prediction、Skill-VOC-NPS-Retention-Predictor.html、Skill-VOC-NPS-Retention-Predictor、Skill-VOC-Product-Iteration-Signal-Extractor.html、Skill-VOC-Product-Iteration-Signal-Extractor
- **可组合**：Skill-Uplift-Churn-Prediction.html、Skill-Uplift-Churn-Prediction、Skill-VOC-NPS-Retention-Predictor.html、Skill-VOC-NPS-Retention-Predictor、Skill-VOC-Product-Iteration-Signal-Extractor.html、Skill-VOC-Product-Iteration-Signal-Extractor、Skill-VOC-Churn-Early-Warning-Signal

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：07-NLP-VOC　·　源卡：`Skill-VOC-Churn-Early-Warning-Signal`