---
name: "p2s-social-voc-viral-potential-score"
title: "Social-VOC-Viral-Potential-Score — 社媒UGC传播特征分析与爆品传播潜力评分"
description: "触发词：社媒UGC、传播潜力分、爆单预警、情感强度、可分享性、视觉密度。何时不用：已有稳定预测模型、只想算补货量时用「自动补货决策」；直播闪购的分钟级脉冲走「直播闪购库存脉冲」。安全边界：只用脱敏的公开 UGC 与评价文本，不做用户画像，不采集个人信息。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟 / 需求预测"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
p2s_card_id: "Skill-Social-VOC-Viral-Potential-Score"
p2s_src_domain: "07-NLP-VOC"
quality_tier: "preview"
user_summary: "在社媒内容里提前发现要爆的苗头，抢在断货前把备货单发出去。"
user_try: "试试：把这批 TikTok 和 Reddit 的 UGC 文本按三维特征打传播潜力分，标出预警日期。"
whenToUse: "视觉系母婴品靠社媒引流、爆单来得快去得也快、需要提前 3-5 天预警时用；常规需求预测用「需求预测」类技能。"
workflow: "接入社媒 UGC 文本流并按日聚合 → 计算情感强度、可分享性与视觉密度三维特征 → 按乘积得到传播潜力分并连续两日确认 → 触发备货工单并追加加急备货"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Social-VOC-Viral-Potential-Score — 社媒UGC传播特征分析与爆品传播潜力评分

## ① 解决的问题

运营面临TikTok爆单前3天无预警导致断货损失$28,000/次——UGC三维传播潜力分（情感强度×可分享性×视觉密度）提前3-5天触发备货，年化减少断货损失约$168,000

## ② 核心算法逻辑

论文：Viral Prediction via Social Media Content Features | 年份：2021

## ③ 业务应用场景

场景：硅胶婴儿辅食餐盘社媒UGC爆单前置预警
- 痛点：某款硅胶吸盘餐盘在TikTok上被KOC分享后3天爆单，但备货提前量不足导致断货5天，损失约$28,000 GMV。 - 监控：接入TikTok/Reddit UGC文本流，每日计算传播潜力分。 - 信号：Day 1: E=0.71, S=0.68, V=0.83 → 潜力分=0.702（触发预警）；Day 2: 潜力分=0.731（确认）。 - 执行：自动推送备货工单，追加2,000个加急备货（7天到仓），实际爆单在Day 4出现。 - 结果：本次无断货，完整承接爆单需求，GMV $42,000，断货损失降低60%；若无预警系统损失约$25,200。
三轨验证 | 成本轨：VOC数据采集与标注月均1200元（数据爬取工具200元/月+人工标注40小时/月×200元/小时=8000元，但可复用降至1200元），NLP模型微调与部署月均800元（GPU算力300元+工程师维护500元），合计月均2000元 | 合规轨：符合《电商平台商品评价管理规范》和《个人信息保护法》，VOC分析仅涉及脱敏评价数据，无需用户二次授权；建议建立数据安全协议和评价来源审计机制 | 风险轨：①评价数据质量不稳定导致模型漂移（概率35%），②竞对恶意差评干扰准确性（概率25%），③模型过度优化导致忽视真实问题（概率20%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

预警精度：提前3-5天，供应链响应窗口充足，备货命中率约75%（部分预警因竞争或活动因素未爆单）
实施难度：⭐⭐（词典规则，接入UGC文本流即可运行）
优先级：⭐⭐⭐⭐⭐（对爆品品牌ROI极高，断货损失远超建设成本）
适用场景：Instagram/TikTok/小红书引流为主的视觉系母婴品（辅食餐具/玩具/服装）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（146 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import re
import numpy as np
from typing import List, Dict
from datetime import datetime, timedelta
from collections import defaultdict


# 三维特征词典
EMOTION_INTENSE_WORDS = {
    "obsessed", "amazing", "omg", "wow", "incredible", "life-changing",
    "literally", "absolutely", "insane", "game changer", "must have",
    "种草", "惊艳", "绝了", "太好用了", "爱死了", "无敌", "神器"
}

SHAREABLE_WORDS = {
    "tell everyone", "show off", "gift idea", "gift for", "recommend",
    "sharing this", "you need this", "get this", "buy this now",
    "分享给", "推荐给", "种草", "宝妈必看", "晒娃", "安利"
}

VISUAL_WORDS = {
    "cute", "adorable", "beautiful", "lovely", "pretty", "pink", "tiny",
    "colorful", "aesthetic", "instagram", "photo", "picture",
    "可爱", "好看", "颜值", "萌", "粉色", "拍照", "出片"
}


def compute_vps_features(text: str) -> Dict[str, float]:
    """计算单条UGC的三维传播潜力特征"""
    text_lower = text.lower()
    words = text_lower.split()
    n = max(len(words), 1)
    
    # 情感强度E：极端词频率
    e = sum(1 for kw in EMOTION_INTENSE_WORDS if kw in text_lower) / n * 10
    e = min(1.0, e)
    
    # 可分享性S：分享意图词频率  
    s = sum(1 for kw in SHAREABLE_WORDS if kw in text_lower) / n * 10
    s = min(1.0, s)
    
    # 视觉描述密度V
    v = sum(1 for kw in VISUAL_WORDS if kw in text_lower) / n * 10
    v = min(1.0, v)
    
    vps = e * s * v  # 三维乘积
    
    return {"E": round(e, 3), "S": round(s, 3), "V": round(v, 3), "vps": round(vps, 4)}


def compute_daily_vps(
    ugc_stream: List[Dict],  # [{"date": str, "text": str, "platform": str}]
) -> Dict[str, float]:
    """按日聚合传播潜力分"""
    daily = defaultdict(list)
    for item in ugc_stream:
        feat = compute_vps_features(item["text"])
        daily[item["date"]].append(feat["vps"])
    
    return {d: float(np.mean(scores)) for d, scores in daily.items()}
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2104.05281，但该号在 arXiv 上是《Shapes In A Box -- Disassembling 3D objects for efficient packing and fabrication》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Viral Prediction via Social Media Content Features》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：社媒 UGC 文本流（每条含日期、文本、平台），来自 TikTok、Reddit 等公开渠道，按日聚合。

**输出**：单条 UGC 的三维特征与传播潜力分、按日聚合的潜力分曲线与预警触发点，以及建议的备货工单与追加量，供运营提前备货。

## 执行步骤

1. 接入并清洗社媒 UGC 文本流
2. 用词典规则计算情感强度、可分享性与视觉密度
3. 按日聚合得到传播潜力分并连续两日确认
4. 触发预警并推送备货工单
5. 输出预警提前量与建议追加量

## 边界与不做

- 数据不满足时不适用：没有稳定的 UGC 文本来源，或品类不适合视觉传播时，潜力分没有区分度。
- 能力边界：只作触发信号，不替代需求预测与人工判断；卡页给出的备货命中率约 75%、提前量 3-5 天。

## 技能关联

- **前置**：Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-Reddit-Community-Signal-Mining.html、Skill-Reddit-Community-Signal-Mining、Skill-UGC-Viral-Content-Potential-Scorer.html、Skill-UGC-Viral-Content-Potential-Scorer、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-VOC-Churn-Signal-Extraction.html、Skill-VOC-Churn-Signal-Extraction
- **延伸**：Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-UGC-Viral-Content-Potential-Scorer.html、Skill-UGC-Viral-Content-Potential-Scorer、Skill-VOC-Churn-Signal-Extraction.html、Skill-VOC-Churn-Signal-Extraction
- **可组合**：Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-UGC-Viral-Content-Potential-Scorer.html、Skill-UGC-Viral-Content-Potential-Scorer、Skill-Social-VOC-Viral-Potential-Score

---

> 分类：业务运营/供应与履约/补货模拟　·　技术族：07-NLP-VOC　·　源卡：`Skill-Social-VOC-Viral-Potential-Score`