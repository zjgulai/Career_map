---
name: "p2s-voc-fraud-review-detection"
title: "VOC Fraud Review Detection — 评论质量与虚假评论识别：NLP-VOC×风控桥梁"
description: "触发词：虚假评论识别、恶意差评取证、评论团伙检测、BSR 异常下滑、申诉证据包、自有评论自查。何时不用：只看单条评论的文本或图文虚假概率用「AI-Fake-Review-Detection」或「Multimodal-Fake-Review-Detection」；要撰写 POA 申诉文案用「Amazon-Account-Appeal-Strategy」；本技能做文本+行为+网络三层联合检测与证据打包。安全边界：仅用于自有 ASIN 的防御性取证与平台申诉，不得用于攻击竞品或操纵评论；评论者信息须按合规要求处理，证据须真实可核验。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-082"
l3_business: "申诉材料准备"
l3_all: "申诉材料准备 / 账号诊断"
l1_l2_l3: "业务运营/渠道经营/申诉材料准备"
p2s_card_id: "Skill-VOC-Fraud-Review-Detection"
p2s_src_domain: "07-NLP-VOC"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用文本相似度、账号行为与账号关联三层检测，判定差评是否为竞品恶意刷评，并打包成 Amazon 申诉证据。"
user_try: "试试：这个 ASIN 黑五前突然多了 20 条一星差评，内容高度雷同但售后投诉没涨，帮我判断是不是恶意刷评，并出一份带文本相似度截图和账号关联图的申诉证据包。"
whenToUse: "自有 ASIN 评论异常涌入、要判断是否竞品恶意刷评并出申诉证据时用本技能；只要单条评论的虚假概率用「AI-Fake-Review-Detection」，要联合图文一致性检测用「Multimodal-Fake-Review-Detection」，要写账号或 Listing 申诉文案用「Amazon-Account-Appeal-Strategy」。"
workflow: "拉取目标 ASIN 近 30 天评论文本与评论者账号信息 → 按模板化短语、过度正面、极端情感与评论长度给文本真实性打分 → 按评论者历史记录与集中发布特征给账号行为真实性打分 → 用文本相似度与共享设备/IP 识别团伙账号集群 → 用同期售后/退货数据对照验证，汇总申诉证据包"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# VOC Fraud Review Detection — 评论质量与虚假评论识别：NLP-VOC×风控桥梁

## ① 解决的问题

竞品在黑五前刷20条1星差评导致BSR暴跌但卖家无法证明是恶意——三层虚假评论检测（文本+行为+网络团伙）生成申诉证据包，成功删除恶意差评保护旺季GMV20-80万元，同时扫描自有评论防封号

## ② 核心算法逻辑

虚假评论的识别需要同时分析三个维度：

## ③ 业务应用场景

业务问题：吸奶器爆款在黑五前突然涌入20条1星评论，都说"suction stopped working after 2 days"——但售后记录显示同期投诉没有增加。判断是否为竞品恶意刷差评，若是则申诉 Amazon 删除。
数据要求： - 目标 ASIN 近30天评论文本 + 评论者账号信息 - 评论者的历史评论记录（via Amazon API） - 售后/退货数据（对照验证）
预期产出： - 可疑评论列表：文本相似度 > 0.85 的评论组 - 团伙账号识别：共享设备/IP 的评论集群 - Amazon 申诉材料：证据包（文本相似度截图 + 账号关联图）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
识别竞品差评申诉成功：恢复 BSR 排名，保护旺季 GMV ¥20-80 万/次
主动筛查风险评论防封号：避免账号封禁损失 ¥50-500 万
提升评论质量信号准确性：推荐系统和运营决策更可信
年化综合 ROI：¥30-100 万
实施难度：⭐⭐☆☆☆（文本特征规则版 1 周可实现；LLM 判别器接入约 2 周；GNN 团伙检测需要 3-4 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（190 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/nlp_voc/voc_fraud_review_detection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/07-NLP-VOC/Skill-VOC-Fraud-Review-Detection.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
VOC Fraud Review Detection
虚假评论识别：文本 + 行为 + 网络三层检测
"""
import re
import numpy as np
from collections import Counter, defaultdict
from datetime import datetime


# 虚假评论文本特征
SUSPICIOUS_PATTERNS = [
    r'absolutely (perfect|amazing|love)',
    r'(exactly|just) (what|as) (i|we) (expected|needed|wanted)',
    r'5 stars?\b.{0,20}highly recommend',
    r'would (definitely|absolutely|certainly) recommend',
    r'(best|greatest) purchase (ever|i\'ve ever made)',
]

TEMPLATE_PHRASES = [
    'highly recommend to everyone',
    'great product great price',
    'does exactly what it says',
    'very happy with this purchase',
    'exceeded my expectations',
]


def text_authenticity_score(review_text):
    """文本真实性评分（0=虚假, 1=真实）"""
    text = review_text.lower()
    score = 1.0

    # 模板化词汇惩罚
    for phrase in TEMPLATE_PHRASES:
        if phrase in text:
            score -= 0.15

    # 过度正面惩罚
    for pattern in SUSPICIOUS_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            score -= 0.10

    # 短评论 & 仅星级无内容（极短文本）
    words = text.split()
    if len(words) < 8:
        score -= 0.20
    if len(words) > 80:
        score += 0.10  # 详细评论更可信

    # 情感极端化
    extreme_pos = sum(1 for w in ['perfect', 'amazing', 'best ever', 'love'] if w in text)
    if extreme_pos >= 3:
        score -= 0.15

    return max(0.0, min(1.0, score))


def behavioral_authenticity_score(reviewer_info):
    """用户行为真实性评分"""
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2404.05961，但该号在 arXiv 上是《LLM2Vec: Large Language Models Are Secretly Powerful Text Encoders》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：目标 ASIN 近 30 天的评论文本与评论者账号信息、评论者历史评论记录（via Amazon API），以及同期售后/退货数据用于对照验证；一条记录是一条评论，粒度到「评论 × 评论者账号」，并需带发布时间与账号关联线索（共享设备/IP），否则团伙检测通道失效。

**输出**：三份产出：文本相似度 > 0.85 的可疑评论组列表、基于共享设备/IP 的团伙账号集群，以及可直接提交 Amazon 的申诉证据包（文本相似度截图 + 账号关联图）；另可对自有评论做风险自查，输出建议处理的评论清单；供评论风控与账号申诉团队使用。

## 执行步骤

1. 拉取目标 ASIN 近 30 天评论文本、评论者账号信息与历史评论记录
2. 按模板化短语、过度正面、评论长度、情感极端度给文本真实性打分
3. 按评论者行为特征给账号真实性打分
4. 用文本相似度与共享设备/IP 识别团伙账号集群
5. 用同期售后/退货数据对照验证评论真实性
6. 汇总输出带截图与账号关联图的申诉证据包

## 边界与不做

- 数据不满足时不用：缺评论者历史记录或账号关联线索时团伙检测通道失效；没有同期售后/退货数据就无法对照验证「差评集中但投诉未涨」这一判据，先补齐再下结论。
- 何时不用：只需单条评论的虚假概率与触发词证据用「AI-Fake-Review-Detection」；要联合图文一致性检测用「Multimodal-Fake-Review-Detection」；要撰写 POA 申诉文案用「Amazon-Account-Appeal-Strategy」。
- 能力边界：只输出可疑评论、团伙集群与证据包，不代替平台裁决、不保证申诉成功；文本特征规则版约 1 周、GNN 团伙检测约 3-4 周，落地前按工期选型。
- 安全边界：仅用于自有 ASIN 的防御性取证与平台申诉，不得用于刷评、攻击竞品或操纵评论；证据须真实可核验，评论者信息按合规要求处理。

## 技能关联

- **前置**：Skill-Amazon-Account-Appeal-Strategy.html、Skill-Amazon-Account-Appeal-Strategy、Skill-Brand-Listing-Hijacking-Detection.html、Skill-Brand-Listing-Hijacking-Detection、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-DS-DGA-GCN-Fake-Review-Group.html、Skill-DS-DGA-GCN-Fake-Review-Group、Skill-FraudSquad-LLM-Review-Detection.html、Skill-FraudSquad-LLM-Review-Detection、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-Amazon-Account-Appeal-Strategy.html、Skill-Amazon-Account-Appeal-Strategy、Skill-Brand-Listing-Hijacking-Detection.html、Skill-Brand-Listing-Hijacking-Detection、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-DS-DGA-GCN-Fake-Review-Group.html、Skill-DS-DGA-GCN-Fake-Review-Group、Skill-FraudSquad-LLM-Review-Detection.html、Skill-FraudSquad-LLM-Review-Detection
- **可组合**：Skill-Amazon-Account-Appeal-Strategy.html、Skill-Amazon-Account-Appeal-Strategy、Skill-Brand-Listing-Hijacking-Detection.html、Skill-Brand-Listing-Hijacking-Detection、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-VOC-Fraud-Review-Detection

---

> 分类：业务运营/渠道经营/申诉材料准备　·　技术族：07-NLP-VOC　·　源卡：`Skill-VOC-Fraud-Review-Detection`