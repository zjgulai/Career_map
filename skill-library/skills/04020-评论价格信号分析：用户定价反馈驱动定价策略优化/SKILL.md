---
name: "p2s-voc-price-signal-analysis"
title: "VOC Price Signal Analysis — 评论价格信号分析：用户定价反馈驱动定价策略优化"
description: "触发词：评论价格信号、太贵分析、支付意愿代理、价格阻力、价值感知、降价判断。何时不用：要用实验定量验证价格形式效果用「心理定价 A/B 测试」；要估弹性系数用「需求价格弹性估算」。安全边界：评论数据使用须符合平台条款与个人信息保护要求，不得据此对评论者做歧视性定价。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性 / VOC编码"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-VOC-Price-Signal-Analysis"
p2s_src_domain: "17-价格优化"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "评论里的太贵到底是价格问题还是价值没说清：把价格信号量化成指数，再决定降不降价。"
user_try: "试试：我的吸奶器 $149，每月 15% 的评论说太贵，帮我从近 90 天评论里算价格信号指数，看该降价还是改文案。"
whenToUse: "当评论中出现价格抱怨、需要区分真实价格阻力与价值感知不足时用本技能；若要用实验直接量化价格形式效果，用「心理定价 A/B 测试」；要估弹性系数，用「需求价格弹性估算」。"
workflow: "采集近 90 天评论文本与星级 → 用价格信号词典提取正向、负向、犹豫与竞品对比信号 → 计算支付意愿代理指数并输出每周趋势 → 拆分负向价格评论的具体诉求：纯价格高还是性价比感知不足 → 据此给出降价或强化价值传达的判断依据"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# VOC Price Signal Analysis — 评论价格信号分析：用户定价反馈驱动定价策略优化

## ① 解决的问题

卖家知道有人说吸奶器"太贵"但无法量化这对定价策略意味着什么——WTP代理模型从评论提取价格信号指数，区分真实价格阻力和价值感知不足，避免盲目降价年化保护毛利20-60万元

## ② 核心算法逻辑

用户评论是隐性的价格弹性信号：

## ③ 业务应用场景

业务问题：吸奶器定价 $149，每月收到 15% 的评论提到"太贵"，但 Amazon 畅销榜同类产品均价 $129。不确定是应该降价还是通过内容传达更强价值感。
数据要求： - 近90天产品评论（含文本和星级） - 竞品评论的价格信号分析对比 - 近期 BSR 与价格变动历史
预期产出： - 每周价格信号指数（WTP代理分）趋势图 - 负向价格评论的具体诉求分析（纯价格高 vs 性价比感知不足） - 定价建议：降价 or 加强价值传达的量化判断依据

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
识别提价窗口（WTP 正向时）避免错过：月增利润 ¥3-10 万
避免盲目降价（价值感问题而非价格问题）：保护月毛利 ¥5-20 万
精准指导 Listing 价值传达优化：CVR 提升 5-10%
年化综合 ROI：¥20-60 万
实施难度：⭐⭐☆☆☆（规则型关键词分类 1 周可实现；需要评论 API 接入）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（168 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/pricing/voc_price_signal_analysis` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/17-价格优化/Skill-VOC-Price-Signal-Analysis.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
VOC Price Signal Analysis
从用户评论提取价格信号，驱动定价策略决策
"""
import re
import numpy as np
from collections import defaultdict

# 价格信号词典（母婴品类定制）
PRICE_SIGNALS = {
    'positive': [
        'worth it', 'worth every penny', 'great value', 'good price',
        'affordable', 'reasonable price', 'value for money', 'well priced',
        '性价比', '值这个价', '不贵', '划算', '实惠',
    ],
    'negative': [
        'too expensive', 'overpriced', 'way too much', 'not worth the price',
        'too pricey', 'cheaper elsewhere', 'price too high', 'cost too much',
        '太贵', '不值', '贵了', '价格高', '性价比低',
    ],
    'hesitation': [
        'almost didn\'t buy', 'hesitated', 'pricey but', 'expensive but',
        'despite the price', 'reluctant',
        '虽然贵', '虽贵', '有点贵但',
    ],
    'competitor': [
        'cheaper on amazon', 'half the price', 'found cheaper', 'similar product cheaper',
        'competitor', '竞品', '别家便宜',
    ],
}


def extract_price_signals(review_text: str) -> dict:
    """从单条评论提取价格信号"""
    text = review_text.lower()
    signals = {cat: 0 for cat in PRICE_SIGNALS}
    for cat, keywords in PRICE_SIGNALS.items():
        for kw in keywords:
            if kw.lower() in text:
                signals[cat] += 1
    return signals


def compute_wtp_proxy(reviews: list) -> dict:
    """
    计算支付意愿代理指数（WTP proxy）
    WTP_signal = (正向 - 负向) / 总 × 平均星级
    正值 = 提价空间，负值 = 价格阻力
    """
    total_pos = total_neg = total_hes = 0
    ratings = []
    price_reviews = []

    for r in reviews:
        sigs = extract_price_signals(r.get('text', ''))
        has_price_signal = any(v > 0 for v in sigs.values())
        if has_price_signal:
            total_pos += sigs['positive']
            total_neg += sigs['negative']
            total_hes += sigs['hesitation']
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2403.08920，但该号在 arXiv 上是《Timed Strategies for Real-Time Rewrite Theories》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：近 90 天产品评论（文本与星级）、竞品评论的价格信号对比结果，以及近期 BSR 与价格变动历史；粒度为 SKU × 周。

**输出**：每周价格信号指数（支付意愿代理分）趋势、负向价格评论的诉求拆解与定价建议（降价或加强价值传达）；供定价与 Listing 内容团队使用。

## 执行步骤

1. 采集近 90 天评论文本与星级数据
2. 用价格信号词典提取四类信号
3. 计算支付意愿代理指数并输出趋势
4. 拆解负向价格评论的具体诉求
5. 输出降价或强化价值传达的判断依据

## 边界与不做

- 数据不满足：评论量不足或缺少文本时信号噪声大，不足以支撑定价判断。
- 何时不用：需要实验证据用「心理定价 A/B 测试」；弹性系数用「需求价格弹性估算」。
- 能力边界：只做评论信号提取与建议，不含 Listing 改稿执行与评论采集接口接入。
- 安全边界：评论数据使用须符合平台条款与个人信息保护要求，不得据此做歧视性定价。

## 技能关联

- **前置**：Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-LLM-Negotiation-Conversion-Agent.html、Skill-LLM-Negotiation-Conversion-Agent、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-Price-Signal-Collection.html、Skill-Price-Signal-Collection、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-LLM-Negotiation-Conversion-Agent.html、Skill-LLM-Negotiation-Conversion-Agent、Skill-Price-Signal-Collection.html、Skill-Price-Signal-Collection、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing
- **可组合**：Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Price-Signal-Collection.html、Skill-Price-Signal-Collection、Skill-VOC-Price-Signal-Analysis

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：17-价格优化　·　源卡：`Skill-VOC-Price-Signal-Analysis`