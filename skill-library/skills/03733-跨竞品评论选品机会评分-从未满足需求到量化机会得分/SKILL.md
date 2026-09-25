---
name: "p2s-review-driven-growth-opportunity-scorer"
title: "跨竞品评论选品机会评分 — 从未满足需求到量化机会得分"
description: "触发词：未满足需求、竞品评论、机会得分、切入价格带、选品研究。何时不用：只看自家差评排改进优先级时用「VOC 产品迭代信号提取」；要判断品类整体容量时用「Market Size Estimation」。安全边界：评论抓取须遵守平台条款与 robots.txt、禁止大规模爬虫；产出报告不得直接引用评论原文。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-022"
l3_business: "市场机会评估"
l3_all: "市场机会评估 / 竞品研究"
l1_l2_l3: "业务运营/产品与创新/市场机会评估"
p2s_card_id: "Skill-Review-Driven-Growth-Opportunity-Scorer"
p2s_src_domain: "07-NLP-VOC"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "从多个竞品的评论里找出高频痛点、竞品没解决的需求和用户愿意加价的点，直接给出建议切入的价格带。"
user_try: "试试：用 5 个竞品婴儿推车配件的评论，找出 Top5 未满足需求并给出建议切入价格带。"
whenToUse: "要从竞品评论里找新品方向、并需要量化机会得分时用本技能；若分析对象是自家产品的差评改进顺序，用「VOC 产品迭代信号提取」；若要判断品类容量与可达市场，用「Market Size Estimation」。"
workflow: "采集 3-5 个竞品 ASIN 的全量评论（各不少于 200 条，1-3 星占比不低于 15%） → 按需求维度提取高频痛点短语 → 计算竞品对每个痛点的解决率与溢价意愿 → 合成机会得分并排出 Top5 未满足需求 → 输出建议切入的价格带与差异化点"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 跨竞品评论选品机会评分 — 从未满足需求到量化机会得分

## ① 解决的问题

选品负责人面临"新品方向不确定"——跨竞品评论机会评分将选品研究周期从3个月→3天，每个新品节省试错成本50-150万元

## ② 核心算法逻辑

选品机会来自「高频痛点 × 低竞争满足度 × 高溢价意愿」的交叉区域。

## ③ 业务应用场景

场景A：婴儿推车附件产品线挖掘 - 业务问题：婴儿推车品牌想扩展配件SKU，但不知道哪个方向市场空白最大 - 数据要求：3-5个竞品ASIN的全量评论（各≥200条），1-3星评论占比≥15% - 预期产出：Top5未满足需求 + 各需求机会得分 + 建议切入价格带 - 业务价值：选品决策时间从3个月→2周，避免试错成本约 15-30万元
三轨验证： - 成本：数据采集需购买3-5个竞品ASIN评论（约300-500元/ASIN，通过第三方工具如Helium10或Jungle Scout），计算资源使用单台云服务器（约200元/天），人力投入为1名数据分析师2天，总显性成本约2000-3000元。 - 合规：Amazon评论抓取需遵守其robots.txt及服务条款，禁止大规模爬虫；若使用第三方API需确保数据来源合法；评论内容不涉及用户个人身份信息（PII），不触发GDPR；输出报告不得直接引用评论原文，避免版权风险。 - 风险：若机会方向被多个竞品同时识别，可能引发同质化价格战；高频抓取评论可能导致IP被封或账号受限；基于少
场景B：奶瓶市场新入口发现 - 业务问题：奶瓶市场竞争激烈，需要找到特定细分机会（如「硅胶材质易清洁」缺口） - 数据要求：类目下Top30 ASIN评论，关键词：清洁/消毒/材质/耐用性 - 预期产出：「清洁便利性」维度满足率仅23%，机会得分Top1，建议切入点为「一体成型易拆洗」

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：母婴品牌每个新品研发周期耗资50-200万元，准确的选品信号可将研发成功率从35%提升至60%，节省试错成本约 80-150万元/新品
速度优势：传统选品调研需6-12周，本方法在有评论数据的情况下可在 3天内 出结论
实施难度：⭐⭐⭐☆☆（需要竞品评论抓取工具，Amazon评论获取有限制）
优先级：⭐⭐⭐⭐⭐（核心决策场景，直接影响选品ROI）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（167 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import re
from collections import Counter
from math import log

class ReviewDrivenOpportunityScorer:
    """从竞品评论挖掘选品机会并量化得分"""
    
    def __init__(self):
        # 常见母婴产品需求维度关键词
        self.need_dimensions = {
            '清洁便利': ['easy to clean', 'dishwasher safe', '好清洗', '消毒', 'washable', 'hygiene'],
            '耐用性': ['durable', 'broke', 'cracked', '耐用', 'quality', 'fell apart', 'lasted'],
            '便携性': ['portable', 'compact', 'lightweight', '便携', 'travel', 'carry'],
            '操作简单': ['easy to use', 'simple', '好用', 'intuitive', 'complicated', 'confusing'],
            '性价比': ['worth', 'overpriced', 'expensive', '贵', 'value', 'price'],
            '安全性': ['safe', 'bpa free', '安全', 'chemical', 'toxic', 'certified'],
            '噪音': ['noisy', 'quiet', '噪音', 'loud', 'silent'],
        }
        
        self.negative_indicators = ['not', "doesn't", 'poor', 'bad', 'worst', 'terrible', 
                                     '不', '差', '烂', '失望', 'hate', 'broken']
    
    def _is_negative_context(self, text, keyword):
        """判断关键词是否出现在负面上下文"""
        # 找到关键词位置，检查前后10个词
        text_lower = text.lower()
        keyword_lower = keyword.lower()
        pos = text_lower.find(keyword_lower)
        if pos == -1:
            return False
        context_start = max(0, pos - 60)
        context = text_lower[context_start:pos + len(keyword) + 60]
        return any(neg in context for neg in self.negative_indicators)
    
    def extract_dimension_mentions(self, reviews):
        """提取每个需求维度的正/负面提及"""
        results = {}
        
        for dim, keywords in self.need_dimensions.items():
            positive_mentions = 0
            negative_mentions = 0
            total_reviews = len(reviews)
            
            for review in reviews:
                text = review['text']
                rating = review.get('rating', 3)
                
                for kw in keywords:
                    if kw.lower() in text.lower():
                        if self._is_negative_context(text, kw) or rating <= 2:
                            negative_mentions += 1
                        else:
                            positive_mentions += 1
                        break  # 每条评论每个维度只计一次
            
            results[dim] = {
                'total_mentions': positive_mentions + negative_mentions,
                'positive_mentions': positive_mentions,
                'negative_mentions': negative_mentions,
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2405.12234。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：3-5 个竞品 ASIN 的全量评论（各不少于 200 条，1-3 星评论占比不低于 15%），需含文本与评分；细分场景下按类目 Top30 ASIN 与关键词（清洁/消毒/材质/耐用性）取数。

**输出**：Top5 未满足需求 + 每个需求的机会得分 + 建议切入价格带，以及各需求维度的满足率对比（如清洁便利性满足率 23%），供选品与产品定义使用。

## 执行步骤

1. 采集竞品 ASIN 的全量评论并清洗
2. 按需求维度提取高频痛点短语
3. 计算竞品对每个痛点的解决率
4. 结合痛点频率与溢价意愿合成机会得分
5. 输出 Top5 未满足需求与建议切入价格带

## 边界与不做

- 竞品评论不足（少于 3 个 ASIN 或单 ASIN 不足 200 条）、1-3 星占比过低时结论不稳
- 输出的是需求机会排序，不含成本、认证与供应链可行性，最终立项仍须走完整评审
- 评论抓取须遵守平台服务条款与 robots.txt，产出报告不得直接引用评论原文

## 技能关联

- **前置**：Skill-Blue-Ocean-Category-Discovery.html、Skill-Blue-Ocean-Category-Discovery、Skill-LLM-Review-Structured-Extraction.html、Skill-LLM-Review-Structured-Extraction、Skill-New-Product-Opportunity-Mining.html、Skill-New-Product-Opportunity-Mining、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-Blue-Ocean-Category-Discovery.html、Skill-Blue-Ocean-Category-Discovery、Skill-New-Product-Opportunity-Mining.html、Skill-New-Product-Opportunity-Mining、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring
- **可组合**：Skill-Blue-Ocean-Category-Discovery.html、Skill-Blue-Ocean-Category-Discovery、Skill-Review-Driven-Growth-Opportunity-Scorer

---

> 分类：业务运营/产品与创新/市场机会评估　·　技术族：07-NLP-VOC　·　源卡：`Skill-Review-Driven-Growth-Opportunity-Scorer`