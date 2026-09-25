---
name: "p2s-competitor-negative-campaign-detection"
title: "Competitor Negative Campaign Detection — 竞品恶意投诉攻击检测（批量举报模式）"
description: "触发词：恶意差评、批量举报、攻击评分、新账号评论、申诉材料。何时不用：单条差评或真实体验问题不适用，本技能识别的是有组织的批量攻击；需要逐条判断评论真伪时用刷评检测类模型。安全边界：检测结论只能用于平台举报与内部决策，不得用于报复性操作或公开指控。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-136"
l3_business: "安全事件处理"
l3_all: "安全事件处理 / 体验分析"
l1_l2_l3: "独立控制/数据与AI运行/安全事件处理"
p2s_card_id: "Skill-Competitor-Negative-Campaign-Detection"
p2s_src_domain: "19-风控反欺诈"
quality_tier: "preview"
user_summary: "大促前突然来一批新账号的 1 星评价，先判断是不是有组织攻击，再自动准备举报材料。"
user_try: "试试：看看这批 1 星差评是不是竞品组织的攻击，并生成举报材料。"
whenToUse: "短时间内集中出现疑似组织化差评、需要判定与举证时用本技能；需要模型级的逐条真伪判断用图模型刷评检测类技能。"
workflow: "汇总评论时间戳、账号注册时间、Verified 标注与文本 → 从时间集中度、账号新鲜度、文本相似度三维度打分 → 评分超阈值触发预警并生成申诉材料 → 跟踪举报结果与星评恢复"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Competitor Negative Campaign Detection — 竞品恶意投诉攻击检测（批量举报模式）

## ① 解决的问题

运营面临"Prime Day前2周突然23条1星差评全是新账号文本高度相似但不确定是否是攻击"——三维度恶意差评攻击检测识别攻击并向Amazon举报，Star Rating恢复保护Prime Day GMV 30-60万元

## ② 核心算法逻辑

论文：Catching the Fraud: Detecting Anomalous Reviews in ECommerce via MultiDimensional Time Series | 年份：2019

## ③ 业务应用场景

场景：某奶瓶品牌在 Prime Day 前 2 周突然收到 23 条 1 星差评，其中 18 条来自注册 < 30 天账号，文本相似度 0.82，内容均提及「材料有毒风险」（与品牌主要关键词竞争相关）。
数据要求：评论时间戳、账号注册时间、Verified/Unverified 标注、评论文本。
检测应用：攻击评分 87 分（>70 触发预警），自动生成 Appeal 材料，向 Amazon 举报获批删除 16 条，平均星评从 3.8 恢复至 4.3。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

30-60 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（106 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from collections import Counter

def compute_text_similarity(texts: list) -> float:
    """计算文本集合内的平均两两余弦相似度（TF-IDF 简化版）"""
    if len(texts) < 2:
        return 0.0

    # 词频统计
    word_sets = [set(t.lower().split()) for t in texts]
    vocab = set().union(*word_sets)
    vocab = list(vocab)

    # 词向量
    vectors = []
    for ws in word_sets:
        vec = np.array([1 if w in ws else 0 for w in vocab], dtype=float)
        norm = np.linalg.norm(vec)
        vectors.append(vec / (norm + 1e-8))

    # 平均两两余弦相似度
    sims = []
    for i in range(len(vectors)):
        for j in range(i + 1, len(vectors)):
            sims.append(np.dot(vectors[i], vectors[j]))
    return float(np.mean(sims)) if sims else 0.0

def detect_negative_campaign(
    reviews: list,  # [{'date': int, 'rating': int, 'account_age_days': int, 'verified': bool, 'text': str}]
    baseline_neg_rate: float = 0.05,
    time_window: int = 7  # 聚集时间窗口（天）
) -> dict:
    """
    竞品恶意差评攻击检测
    reviews: 最近一段时间的评论列表
    """
    n = len(reviews)
    if n == 0:
        return {'attack_detected': False, 'attack_score': 0}

    neg_reviews = [r for r in reviews if r['rating'] <= 2]
    if len(neg_reviews) < 3:
        return {'attack_detected': False, 'attack_score': 0, 'neg_count': len(neg_reviews)}

    # 维度1：突发性评分
    neg_rate = len(neg_reviews) / n
    burst_score = min(100, max(0, (neg_rate - baseline_neg_rate) / (baseline_neg_rate + 0.01) * 50))

    # 维度2：账号异常评分
    new_accounts = sum(1 for r in neg_reviews if r.get('account_age_days', 999) < 90)
    unverified = sum(1 for r in neg_reviews if not r.get('verified', True))
    account_score = min(100, (new_accounts / len(neg_reviews) * 60 + unverified / len(neg_reviews) * 40))

    # 维度3：文本相似性评分
    texts = [r.get('text', '') for r in neg_reviews if r.get('text')]
    sim = compute_text_similarity(texts) if len(texts) >= 2 else 0
    content_score = min(100, sim * 150)

    # 综合攻击分
    attack_score = 0.35 * burst_score + 0.35 * account_score + 0.30 * content_score
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1906.09209，但该号在 arXiv 上是《Applications of Backscatter Communications for Healthcare Networks》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Catching the Fraud: Detecting Anomalous Reviews in ECommerce via MultiDimensional Time Series》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：评论时间戳、账号注册时间、Verified 或 Unverified 标注、评论文本，按评论条目粒度；判定动机时需结合品牌关键词与竞品关系。

**输出**：攻击评分与维度拆解、疑似攻击评论清单、可提交平台的申诉材料，供运营与合规团队举报使用。

## 执行步骤

1. 采集评论时间、账号年龄、Verified 与文本
2. 计算时间集中度、新账号占比与文本相似度
3. 汇总为攻击评分并按阈值预警
4. 生成举报材料并提交平台
5. 跟踪删除结果与星评恢复情况

## 边界与不做

- 单条或零散差评、真实体验反馈不适用本技能。
- 本技能产出攻击判定与举报材料，不保证平台受理或删除结果。
- 结论只能用于平台举报与内部决策，不得用于报复性操作或公开指控。

## 技能关联

- **可组合**：Skill-Competitor-Negative-Campaign-Detection

---

> 分类：独立控制/数据与AI运行/安全事件处理　·　技术族：19-风控反欺诈　·　源卡：`Skill-Competitor-Negative-Campaign-Detection`