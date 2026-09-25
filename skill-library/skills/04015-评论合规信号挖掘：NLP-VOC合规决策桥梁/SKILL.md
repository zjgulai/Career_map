---
name: "p2s-voc-compliance-signal-mining"
title: "VOC Compliance Signal Mining — 评论合规信号挖掘：NLP-VOC×合规决策桥梁"
description: "触发词：评论挖掘、合规信号、安全事故、召回门槛、违规宣称、周频预警。何时不用：要在推荐候选集里实时剔除违规品时用「推荐合规过滤」，要审自家素材宣称时用「AIGC 内容合规审查」。安全边界：预警属内部风险提示，不构成召回认定，也不得据此对外否认评论反映的问题。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-131"
l3_business: "产品准入核对"
l3_all: "产品准入核对 / 宣称审查"
l1_l2_l3: "独立控制/财务与合规/产品准入核对"
p2s_card_id: "Skill-VOC-Compliance-Signal-Mining"
p2s_src_domain: "07-NLP-VOC"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "评论里出现夹扣突然断裂这类话时，自动分清是偶发还是系统性问题，离召回门槛还有多远。"
user_try: "试试：把这款婴儿推车的全部评论跑一遍合规信号挖掘，画出安全事件周频趋势并给出预警等级。"
whenToUse: "要从评论中提前发现安全事故、宣传违规与化学风险信号时用；要在推荐候选集里实时过滤违规品时用「推荐合规过滤」；要审自家素材宣称时用「AIGC 内容合规审查」。"
workflow: "导入产品全部评论与合规信号词典 → 按安全、材料、宣传三类对评论分类 → 统计安全事故类评论的周频率与占比 → 对照 CPSC/FDA 阈值判定风险等级 → 生成结构化合规预警报告"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# VOC Compliance Signal Mining — 评论合规信号挖掘：NLP-VOC×合规决策桥梁

## ① 解决的问题

婴儿推车收到5条「夹扣突然断裂」评论但卖家不知道是否触发CPSC召回门槛——评论合规信号挖掘自动分类安全事故/宣传违规/化学风险并实时预警，提前4-8周发现召回风险避免损失100-500万元

## ② 核心算法逻辑

用户评论是产品安全风险的早期预警系统——消费者在亚马逊评论里描述的产品缺陷、安全事故、法规疑问往往比官方投诉早 28 周出现。从评论中自动挖掘合规信号：

## ③ 业务应用场景

业务问题：某款婴儿推车的安全带夹扣收到5条评论提到"buckle broke suddenly while walking"。卖家不知道这是偶发还是系统性问题，更不知道是否触发 CPSC 召回门槛（15件投诉）。
数据要求： - 产品全部评论（来自 Seller Central 评论报告或 Jungle Scout） - 评论分类关键词库（安全/材料/宣传三类） - CPSC/FDA 合规阈值配置（可配置化）
预期产出： - 安全信号趋势图：安全事故类评论的周频率变化 - 风险等级预警：当频率超过阈值（如 0.5%）时自动告警 - 合规预警报告：可发送给产品/法务团队的结构化报告

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
提前发现安全事故信号并处理：避免 CPSC 召回损失 ¥100-500 万/次
主动发现宣传违规并修正：避免 Amazon 下架损失 ¥30-200 万
监控竞品违规词举报：潜在市场份额提升
年化综合 ROI：¥50-200 万（以避损为主）
实施难度：⭐⭐☆☆☆（关键词规则版本 1 周可实现；ML 分类器版本约 2-3 周；需要评论 API 接入）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（140 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/nlp_voc/voc_compliance_signal_mining` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/07-NLP-VOC/Skill-VOC-Compliance-Signal-Mining.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
VOC Compliance Signal Mining
从用户评论自动挖掘产品合规风险信号
"""
import re
from collections import Counter, defaultdict


# 合规信号词典（母婴品类）
COMPLIANCE_SIGNALS = {
    'safety_incident': {
        'critical': ['choke', 'choking', 'swallow', 'swallowed', 'burn', 'shock', 'electric shock',
                     'break off', 'broke off', 'sharp edge', 'cut', 'injury', 'hospitalize', 'ER'],
        'warning':  ['dangerous', 'unsafe', 'hazard', 'hurt', 'pain', 'scratch', 'crack', 'broke'],
    },
    'marketing_violation': {
        'critical': ['cure', 'treat', 'heals', 'clinically proven', 'fda approved', 'medical grade',
                     'guaranteed to increase', 'scientifically proven to boost'],
        'warning':  ['proven to', 'doctors recommend', 'clinically tested', 'pharmaceutical grade'],
    },
    'chemical_risk': {
        'critical': ['bpa', 'phthalate', 'formaldehyde', 'lead', 'toxic', 'chemical smell',
                     'chemical taste', 'smells like plastic', 'prop 65'],
        'warning':  ['smell', 'odor', 'taste', 'material concern', 'plastic smell'],
    },
    'physical_defect': {
        'critical': ['piece broke off', 'part fell off', 'broken after', 'cracked', 'shattered',
                     'came apart', 'fell apart', 'broke in half'],
        'warning':  ['loose', 'wobbly', 'flimsy', 'cheap material', 'poorly made'],
    },
}


def classify_review_compliance(text):
    """对单条评论进行合规信号分类"""
    text_lower = text.lower()
    signals = {}
    for category, levels in COMPLIANCE_SIGNALS.items():
        for level, keywords in levels.items():
            for kw in keywords:
                if kw in text_lower:
                    if category not in signals or level == 'critical':
                        signals[category] = level
                    break
    return signals


def analyze_product_reviews(reviews, threshold_pct=0.005):
    """
    分析产品全量评论的合规风险
    threshold_pct: 触发预警的信号频率阈值（默认0.5%）
    """
    total = len(reviews)
    signal_counts = defaultdict(lambda: defaultdict(int))
    flagged_reviews = []

    for rev in reviews:
        signals = classify_review_compliance(rev['text'])
        if signals:
            flagged_reviews.append({**rev, 'signals': signals})
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2312.11642，但该号在 arXiv 上是《The Challenge of Measuring Asteroid Masses with Gaia DR2 astrometry》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：产品全部评论（来自 Seller Central 评论报告或 Jungle Scout）、评论分类关键词库（安全/材料/宣传三类）、CPSC/FDA 合规阈值配置（可配置化）；粒度：单 SKU × 单条评论，按周统计。

**输出**：安全信号趋势（安全事故类评论的周频率变化）、风险等级预警（频率超过阈值如 0.5% 时自动告警）与结构化合规预警报告；可发给产品与法务团队，用于提前 4-8 周发现召回风险。

## 执行步骤

1. 导入评论数据与分类关键词库
2. 按安全、材料、宣传三类分类评论
3. 统计安全类信号周频与占比趋势
4. 对照 CPSC/FDA 阈值判定预警等级
5. 输出结构化合规预警报告

## 边界与不做

- 数据不满足时不用：拿不到完整评论数据、或阈值未按品类配置时，频率判断与预警都不可靠。
- 能力边界：只做信号分类、趋势统计与预警，不做召回认定、不代替法务判断；阈值触发后仍须人工确认事实。
- 合规边界：评论属用户生成内容，引用需脱敏并保留原文出处，不得用于对外否认问题或诱导用户删评。

## 技能关联

- **前置**：Skill-Amazon-Account-Appeal-Strategy.html、Skill-Amazon-Account-Appeal-Strategy、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Consumer-Complaint-Recall-Prediction.html、Skill-Consumer-Complaint-Recall-Prediction、Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-VOC-Fraud-Review-Detection.html、Skill-VOC-Fraud-Review-Detection、Skill-VOC-Triggered-Inventory-Signal.html、Skill-VOC-Triggered-Inventory-Signal
- **延伸**：Skill-Amazon-Account-Appeal-Strategy.html、Skill-Amazon-Account-Appeal-Strategy、Skill-Consumer-Complaint-Recall-Prediction.html、Skill-Consumer-Complaint-Recall-Prediction、Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-VOC-Fraud-Review-Detection.html、Skill-VOC-Fraud-Review-Detection、Skill-VOC-Triggered-Inventory-Signal.html、Skill-VOC-Triggered-Inventory-Signal
- **可组合**：Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-VOC-Fraud-Review-Detection.html、Skill-VOC-Fraud-Review-Detection、Skill-VOC-Triggered-Inventory-Signal.html、Skill-VOC-Triggered-Inventory-Signal、Skill-VOC-Compliance-Signal-Mining

---

> 分类：独立控制/财务与合规/产品准入核对　·　技术族：07-NLP-VOC　·　源卡：`Skill-VOC-Compliance-Signal-Mining`