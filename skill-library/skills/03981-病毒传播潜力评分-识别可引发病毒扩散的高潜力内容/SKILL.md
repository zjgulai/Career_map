---
name: "p2s-ugc-viral-content-potential-scorer"
title: "UGC病毒传播潜力评分 — 识别可引发病毒扩散的高潜力内容"
description: "触发词：UGC 潜力评分、病毒传播预测、晒单开箱筛选、种草内容质检、放大素材挑选。何时不用：判断付费素材的转化特征用短视频内容归因技能，本技能只评估内容本身的传播潜力，不预测成交转化。安全边界：二次推流原生素材须取得用户明确授权并覆盖商业推广用途，走官方创作者合作通道，不得擅自搬运用户内容。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-089"
l3_business: "内容策划"
l3_all: "内容策划 / 传播规划"
l1_l2_l3: "业务运营/品牌与增长/内容策划"
p2s_card_id: "Skill-UGC-Viral-Content-Potential-Scorer"
p2s_src_domain: "07-NLP-VOC"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "从用户晒单和开箱内容里挑出最有传播潜力的几条，值得联系授权放大的先放大。"
user_try: "试试：从这 50 条用户晒单视频里挑出病毒潜力 Top10，并说明每条强在哪个维度。"
whenToUse: "每月收到大量用户晒单、开箱、评测内容需要挑选放大对象时用本技能；发布前预判笔记或视频会不会爆、要按维度补强内容时同样适用；判断付费素材转化特征用内容归因类技能。"
workflow: "用病毒潜力模型给文本打分 → 按情感强度、叙事结构、社交信号拆解得分 → 输出高潜力内容清单与特征分析 → 联系用户取得商业推广授权 → 走官方合作通道做二次推流"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# UGC病毒传播潜力评分 — 识别可引发病毒扩散的高潜力内容

## ① 解决的问题

内容运营面临"不知道哪个UGC值得推广"——病毒潜力评分将内容放大精准度提升至70%+，同等预算曝光量提升3-5倍

## ② 核心算法逻辑

并非所有UGC（晒单/开箱/评测）都值得放大传播。病毒传播潜力由内容的情感强度 × 叙事结构 × 社交信号共同决定。

## ③ 业务应用场景

场景A：TikTok开箱视频筛选放大 - 业务问题：吸奶器品牌每月收到50+用户晒单/开箱视频，不知道哪个值得联系用户授权并推广 - 数据要求：视频配文/字幕文本 + 初始24小时的点赞/评论/分享数据（可选） - 预期产出：Top10高病毒潜力视频列表 + 各视频的病毒特征分析 - 业务价值：精准投放放大的UGC内容，CPM比普通广告低60%，自然传播ROI约 3-8倍
三轨验证： - 成本：每条视频文本分析耗时<0.1秒（CPU即可），人力成本集中在联系授权环节（约0.5人天/10条）；若接入TikTok API获取24h数据，需支付API调用费（约$0.01/次） - 合规：需确保用户授权协议明确包含“商业推广用途”，避免侵犯肖像权；TikTok平台禁止未经授权的商业内容二次推流，需走官方Creator Marketplace合作通道 - 风险：高潜力内容被竞品反向追踪并截流；过度放大可能导致用户反感（“被广告淹没”），引发评论区负面舆情；平台算法可能将推流内容标记为“低质量重复内容”降低权重
场景B：小红书种草内容质检 - 业务问题：KOC投放内容质量参差不齐，事前难以判断哪篇笔记会爆 - 数据要求：笔记文本（发布前），或发布后24小时数据 - 预期产出：笔记病毒分打分，指导内容修改方向（哪个维度弱就加强哪个维度） - 业务价值：内容投放精准度提升，同等预算下曝光量提升 30-50%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：主动放大高病毒潜力UGC（授权费500-2000元/条），相比付费广告（CPM 50-100元），自然传播CPM可降至 10-20元，同等预算曝光量3-5倍
TikTok/小红书场景：内容投放精准度提升使转化率提高20-30%，月均节省无效投放成本约 5-15万元
实施难度：⭐⭐☆☆☆（纯文本分析，无需模型训练，可立即部署）
优先级：⭐⭐⭐⭐☆（内容营销高频场景，效果可量化）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（187 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
import re
import numpy as np

class UGCViralPotentialScorer:
    """UGC病毒传播潜力评分器"""
    
    def __init__(self):
        # 情感激活词
        self.high_arousal_words = [
            'amazing', 'incredible', 'obsessed', 'blown away', 'cannot believe',
            'life changing', 'game changer', '惊艳', '绝了', '震惊', '爱了爱了',
            'worst', 'disgusting', 'scam', 'fraud', '踩雷', '差评', '坑人'
        ]
        
        # 叙事转折词（表示有故事弧）
        self.narrative_markers = [
            'but', 'however', 'until', 'then', 'finally', 'after',
            'used to', 'now i', 'before', 'changed my', '但是', '结果',
            '没想到', '终于', '原来', '一开始以为', '后来发现'
        ]
        
        # 社交认同信号
        self.social_proof_signals = [
            'my friend', 'recommend by', 'everyone is', 'trending', 'viral',
            'tiktok made me', 'saw this on', '闺蜜推荐', '博主同款', '爆款',
            'all the moms', 'mom group', '妈妈群', '宝妈都在用'
        ]
        
        # 视觉描述词
        self.visual_words = [
            'cute', 'beautiful', 'sleek', 'compact', 'color', 'design', 'looks',
            '好看', '颜值', '外观', '设计感', '质感', '颜色', '小巧'
        ]
        
        # 数字和具体实体检测
        self.number_pattern = re.compile(r'\b\d+(?:\.\d+)?(?:%|lbs?|oz|ml|months?|weeks?|days?|years?|times?|hours?)?\b')
        self.specific_brands = re.compile(r'\b(amazon|shopify|tiktok|instagram|xiaohongshu|medela|spectra)\b', re.IGNORECASE)
    
    def score_emotional_activation(self, text):
        """情感激活度：强烈情感词密度"""
        text_lower = text.lower()
        word_count = max(len(text.split()), 1)
        activation_count = sum(1 for w in self.high_arousal_words if w.lower() in text_lower)
        
        # 惊叹号也是信号
        exclamation_score = min(text.count('!') / word_count * 10, 1.0)
        density_score = min(activation_count / word_count * 15, 1.0)
        
        return min(density_score + exclamation_score * 0.3, 1.0)
    
    def score_narrative_completeness(self, text):
        """叙事完整性：是否有问题→解决的故事弧"""
        text_lower = text.lower()
        marker_count = sum(1 for m in self.narrative_markers if m.lower() in text_lower)
        
        # 文本长度也有关系（太短没有故事）
        length_score = min(len(text) / 200, 1.0)
        marker_score = min(marker_count / 3, 1.0)
        
        return length_score * 0.3 + marker_score * 0.7
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2403.17821，但该号在 arXiv 上是《Multiple solutions for quasilinear elliptic problems with concave and convex nonlinearities》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：视频配文或字幕文本（发布前即可打分），可选初始 24 小时的点赞、评论、分享数据作为社交信号；小红书场景为笔记文本。

**输出**：Top10 高病毒潜力内容清单与各维度特征分析（哪个维度弱就补哪个），供内容团队挑选授权放大对象与修改方向；卡页口径同预算曝光量提升 3-5 倍、投放精准度提升后曝光提升 30-50%。

## 执行步骤

1. 收集候选 UGC 的配文、字幕文本与可得的初始互动数据。
2. 用病毒潜力模型给每条内容打分，并拆解情感、叙事、社交三维贡献。
3. 输出高潜力内容清单与各维度短板分析。
4. 对入选内容联系用户取得商业推广授权。
5. 通过官方创作者合作通道做二次推流放大。

## 边界与不做

- 只有纯文本可分析、拿不到任何互动数据时评分偏保守；未取得授权时不要走放大流程，平台对未授权商业二推有硬限制。
- 能力边界：本技能评估传播潜力，不预测成交转化也不保证爆款；曝光倍数与 CPM 数字为卡页口径。
- 合规红线：二次推流必须取得用户明确授权（含商业推广用途）、尊重肖像权并走官方合作通道。

## 技能关联

- **前置**：Skill-Epidemiological-Viral-Traffic-SIR.html、Skill-Epidemiological-Viral-Traffic-SIR、Skill-NLP-Sentiment-ML-Pipeline.html、Skill-NLP-Sentiment-ML-Pipeline、Skill-Reddit-Community-Signal-Mining.html、Skill-Reddit-Community-Signal-Mining、Skill-Social-Network-Viral-Growth-Simulation.html、Skill-Social-Network-Viral-Growth-Simulation、Skill-Social-VOC-Viral-Potential-Score.html、Skill-Social-VOC-Viral-Potential-Score、Skill-VOC-Churn-Early-Warning-Signal.html、Skill-VOC-Churn-Early-Warning-Signal、Skill-Viral-Marketing-Model.html、Skill-Viral-Marketing-Model
- **延伸**：Skill-Epidemiological-Viral-Traffic-SIR.html、Skill-Epidemiological-Viral-Traffic-SIR、Skill-Social-Network-Viral-Growth-Simulation.html、Skill-Social-Network-Viral-Growth-Simulation、Skill-Social-VOC-Viral-Potential-Score.html、Skill-Social-VOC-Viral-Potential-Score、Skill-VOC-Churn-Early-Warning-Signal.html、Skill-VOC-Churn-Early-Warning-Signal、Skill-Viral-Marketing-Model.html、Skill-Viral-Marketing-Model
- **可组合**：Skill-Social-Network-Viral-Growth-Simulation.html、Skill-Social-Network-Viral-Growth-Simulation、Skill-Social-VOC-Viral-Potential-Score.html、Skill-Social-VOC-Viral-Potential-Score、Skill-VOC-Churn-Early-Warning-Signal.html、Skill-VOC-Churn-Early-Warning-Signal、Skill-UGC-Viral-Content-Potential-Scorer

---

> 分类：业务运营/品牌与增长/内容策划　·　技术族：07-NLP-VOC　·　源卡：`Skill-UGC-Viral-Content-Potential-Scorer`