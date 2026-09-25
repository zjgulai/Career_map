---
name: "p2s-voc-churn-signal-extraction"
title: "VOC-Churn-Signal-Extraction — 差评文本语义流失信号提取与流失概率预测"
description: "触发词：差评语义流失、竞品提及、双通道召回、流失预警提前量、文本流失概率。何时不用：需要同时纳入客服工单等多源信号时用较全的 VOC 预警技能；本技能聚焦差评文本到流失概率这一条通道。安全边界：差评数据须脱敏且仅用于产品缺陷与流失分析；跨境传输须符合数据出境规定。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 分群"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-VOC-Churn-Signal-Extraction"
p2s_src_domain: "07-NLP-VOC"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "行为数据要等几十天才看出下滑，差评区早就有人在说要换品牌了，用文本把预警提前到三周内。"
user_try: "试试：对近 30 天 1-3 星评论做词典加语义双通道提取，输出高流失风险用户名单与挽回序列建议。"
whenToUse: "预警只能靠评论文本、行为数据滞后时用本技能；要一并纳入客服工单等多源信号，用较全的 VOC 预警技能。"
workflow: "接入近 30 天 1-3 星评论并关联用户 ID → 词典通道与语义通道并行提取竞品提及与流失措辞 → 合并双通道信号计算流失得分并按阈值筛选 → 输出预警名单并触发挽回邮件序列"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# VOC-Churn-Signal-Extraction — 差评文本语义流失信号提取与流失概率预测

## ① 解决的问题

运营面临差评区出现大量「换品牌」「推荐竞品」信号但行为数据滞后45天——双通道语义流失信号提取将流失预警时间从45天压缩到19天，挽回高危用户年化GMV约$98,400

## ② 核心算法逻辑

论文：Churn Prediction via Semantic Signal Extraction from User Reviews | 年份：2020

## ③ 业务应用场景

- 痛点：月度复购率下滑5%，行为数据滞后45天才能感知，等发现时用户已流失。评论区大量出现「换Pampers了」「试试Huggies」等竞品提及。 - 数据要求：近30天1-3星评论（至少200条），用户ID关联。 - 执行：规则词典命中率28%，语义通道额外召回17%，合并后CSD>0.3用户143人（占1-3星评论用户的31%）。 - 产出：提前19天识别流失预警，触发「婴儿湿巾满减+竞品对比内容」邮件序列，14天挽回率22%，挽回GMV约$8,200。
三轨验证 | 成本轨：VOC自动化提取系统月均成本1200元（云服务器800元+NLP模型API调用400元），人工审核8小时/月，较传统人工审核成本降低65% | 合规轨：符合《电商平台商品评价规范》和《个人信息保护法》，差评数据脱敏处理，仅提取产品缺陷信息不涉及用户隐私，已通过母婴行业数据安全认证 | 风险轨：模型误识别率8-12%（概率中等），可能遗漏长尾缺陷信号（概率15%），需人工复审机制补充
**三轨验证** | 成本轨：集成第三方VOC平台（如Brandwatch）月费3500元，减少内部开发投入，人工配置4小时/月，总体成本较自建方案高192% | 合规轨：第三方平台需签署《数据处理协议DPA》，确保跨境数据传输符合GDPR和中国《数据出境安全评估办法》，母婴产品敏感属性需额外隐私评估 | 风险轨：供应商依赖风险（概率20%），平台服务中断影响差评预警时效（概率8%），数据跨境传输合规成本增加（概率中等）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

相比行为数据优势：语义信号比行为停购提前2-3周，赢得干预时间窗口
实施难度：⭐⭐（词典维护+TF-IDF，无需GPU）
优先级：⭐⭐⭐⭐（直接接入复购运营系统，ROI清晰）
数据要求：月均≥200条1-3星评论，用户ID可关联

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（137 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import re
import numpy as np
from collections import defaultdict
from typing import List, Dict, Tuple

# 流失信号词典（中英双语）
CHURN_KEYWORDS = [
    "换品牌", "不再购买", "推荐竞品", "退款", "再也不买", "最后一次",
    "switch brand", "last purchase", "won't buy again", "switching to",
    "never buying", "moving to", "recommend competitor", "refund"
]

# 竞品品牌名（触发竞品提及信号）
COMPETITOR_BRANDS = [
    "pampers", "huggies", "luvs", "seventh generation", "coterie",
    "好奇", "帮宝适", "花王", "merries"
]


def build_tfidf_matrix(texts: List[str]) -> Tuple[np.ndarray, List[str]]:
    """简版TF-IDF，只用标准库+numpy"""
    import math
    # 分词（简单空格/标点分割）
    def tokenize(t):
        return re.findall(r'\b[a-zA-Z\u4e00-\u9fff]+\b', t.lower())
    
    tokenized = [tokenize(t) for t in texts]
    # 词表
    vocab = sorted(set(w for doc in tokenized for w in doc))
    word2idx = {w: i for i, w in enumerate(vocab)}
    n_docs = len(texts)
    
    # TF
    tf = np.zeros((n_docs, len(vocab)), dtype=np.float32)
    for di, doc in enumerate(tokenized):
        for w in doc:
            tf[di, word2idx[w]] += 1
        if len(doc) > 0:
            tf[di] /= len(doc)
    
    # IDF
    df = np.sum(tf > 0, axis=0)
    idf = np.log((n_docs + 1) / (df + 1)) + 1.0
    tfidf = tf * idf
    # L2 归一化
    norms = np.linalg.norm(tfidf, axis=1, keepdims=True) + 1e-9
    return tfidf / norms, vocab


def extract_churn_signals(
    reviews: List[Dict],   # [{"user_id": str, "text": str, "rating": int}]
    csd_threshold_red: float = 0.30,
    csd_threshold_yellow: float = 0.15,
    semantic_sim_threshold: float = 0.35
) -> Dict:
    """
    双通道流失信号提取 + CSD 计算
    返回: {user_id: {"csd": float, "alert_level": str, "signal_count": int}}
    """
    # Step 1: 规则通道
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2005.11870，但该号在 arXiv 上是《Spooky Action at a Distance》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Churn Prediction via Semantic Signal Extraction from User Reviews》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：近 30 天 1-3 星评论文本（建议不少于 200 条）与可关联的用户 ID；跨境场景需先完成数据脱敏。

**输出**：提前的流失预警名单（含双通道信号命中项与流失得分）与建议挽回动作；供复购运营与内容团队使用。

## 执行步骤

1. 接入差评文本并做分词与脱敏
2. 运行规则词典通道命中流失与竞品措辞
3. 运行语义通道额外召回隐含信号
4. 合并双通道得分并按阈值筛出预警名单
5. 输出挽回动作建议与效果口径

## 边界与不做

- 差评量不足或无法关联用户 ID 时不用本技能，只能退化为整体口碑分析。
- 本技能输出预警名单与信号解释，不做自动触达与客服工单流转。
- 安全边界：差评数据须脱敏且仅用于产品缺陷与流失分析；跨境传输须符合数据出境评估要求。

## 技能关联

- **前置**：Skill-Cohort-Churn-Intervention-Dispatcher.html、Skill-Cohort-Churn-Intervention-Dispatcher、Skill-NLP-Sentiment-ML-Pipeline.html、Skill-NLP-Sentiment-ML-Pipeline、Skill-Review-Pain-Point-Mining.html、Skill-Review-Pain-Point-Mining、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-Cohort-Churn-Intervention-Dispatcher.html、Skill-Cohort-Churn-Intervention-Dispatcher、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-Cohort-Churn-Intervention-Dispatcher.html、Skill-Cohort-Churn-Intervention-Dispatcher、Skill-VOC-Churn-Signal-Extraction

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：07-NLP-VOC　·　源卡：`Skill-VOC-Churn-Signal-Extraction`