---
name: "p2s-ai-fake-review-detection"
title: "AI Fake Review Detection — 多模态虚假评论检测与可解释风控"
description: "触发词：虚假评论检测、AI 生成好评识别、刷评举报、触发词证据、多模态评论风控、评论异常监测。何时不用：要联合图文一致性与账号行为图检测用「Multimodal-Fake-Review-Detection」；要叠文本+行为+网络团伙三层取证用「VOC-Fraud-Review-Detection」；本技能只出单条评论的虚假概率与可解释触发词。安全边界：仅用于自有或已授权评论数据的质量审查与平台申诉，不得用于刷评或攻击竞品；须取得用户数据处理同意并留存审查日志，高置信判定仍要人工复核后再举报。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-082"
l3_business: "申诉材料准备"
l3_all: "申诉材料准备 / 规则监测"
l1_l2_l3: "业务运营/渠道经营/申诉材料准备"
p2s_card_id: "Skill-AI-Fake-Review-Detection"
p2s_src_domain: "11-AI人文"
quality_tier: "preview"
user_summary: "自动给每条评论打 0-1 虚假概率，超阈值标红并给出 Top-3 触发词证据，让差评举报有据可依。"
user_try: "试试：帮我扫描这个 ASIN 最近的评论文本和附图，标出虚假概率 ≥0.75 的评论，并给出每条可直接截图的 Top-3 触发词证据。"
whenToUse: "有评论文本（标题与正文）与评论附图、要逐条判定虚假概率并出可解释证据时用本技能；要联合图文一致性与行为图检测用「Multimodal-Fake-Review-Detection」，要叠加团伙关联取证用「VOC-Fraud-Review-Detection」，要撰写账号或 Listing 申诉文案用「Amazon-Account-Appeal-Strategy」。"
workflow: "采集目标 ASIN 的评论文本与评论附图，构建带标注的样本库 → 抽取文本特征与图像特征并做融合分类 → 输出每条评论 0-1 的虚假概率，≥0.75 自动标红 → 用 SHAP 生成 Top-3 触发词证据，供截图举报 → 留存审查日志并对高置信度以外的判定做人工复核"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AI Fake Review Detection — 多模态虚假评论检测与可解释风控

## ① 解决的问题

母婴跨境卖家竞品批量刷好评、自品被刷 AI 差评难以举报——多模态 BERT+ResNet-50 虚假评论检测器准确率 93%+，SHAP 触发词证据报告将差评举报成功率从 30% 提升至 65%，年化保护 GMV 损失 5-30 万元

## ② 核心算法逻辑

核心问题：AI 生成工具（ChatGPT、Gemini）批量生产的虚假评论与真实用户评论在语法上已无明显区别，单纯依靠文本关键词过滤误判率极高。

## ③ 业务应用场景

- 业务问题：竞争对手用 AI 批量生成大量五星好评，快速拉升 BSR 排名，压制正常商家；人工识别 100 条评论需 2 小时，误判率 20%+。 - 数据要求：目标 ASIN 的评论文本（title + body）+ 评论附图（URL 可公开抓取），各 1000 条以上标注样本用于微调。 - 接入方式：每日凌晨批量扫描竞品新增评论，或通过 Amazon Seller Central API 实时监听自品 ASIN 新评论。 - 预期产出：虚假评论概率分 0-1，≥0.75 自动标红，输出 Top-3 触发词证据（可截图举报）。 - 业务价值：月均识别竞品刷评 500-2000 条，缩短举报
- 业务问题：被竞品刷 1-2 星差评是常见攻击，每批 50-200 条，人工举报成功率仅 30%（缺乏证据）。 - 数据要求：历史差评文本 + 图片，构建"AI 差评样本库"（可用 ChatGPT 自动生成反例标注）。 - 预期产出：批量输出可疑差评列表 + SHAP 证据报告（截图用于向平台申诉），提升举报成功率至 65%+。 - 业务价值：每批次成功移除 AI 差评 30-80 条，星级评分恢复 0.1-0.3 星，对应转化率提升 3-8%，月均保护营收 1-5 万元；年化 GMV 保护 10-30 万元。
三轨验证 | 成本轨：月均成本3,500元（AI模型API调用2,000元/月+人工审核8小时/月×200元/小时=1,600元+数据标注500元），年度投入42,000元 | 合规轨：符合《电子商务法》第17条虚假评价禁止条款、《消费者权益保护法》第8条知情权规定、平台《打击虚假评价规范》；需获得用户数据处理同意书，建立审查日志留存 | 风险轨：误判率8-12%导致用户投诉（概率中等30%）、模型偏差识别虚假评价不足（概率低15%）、用户隐私数据泄露风险（概率低5%但影响严重）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

1-5 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（350 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 55 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/ai_humanities/ai_fake_review_detection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/11-AI人文/Skill-AI-Fake-Review-Detection.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
多模态虚假评论检测器（简化版）
技术：文本 BERT-like 特征 + 图像 ResNet-like 特征 → 融合分类
场景：母婴电商评论虚假检测，输出虚假概率 + Top-3 触发词

注意：本版本使用 numpy 模拟特征提取（避免下载大模型），
      生产环境替换为真实 BERT/ResNet-50 即可。
"""

import numpy as np
import re
from typing import List, Dict, Tuple

np.random.seed(42)


# ── 1. 数据：10 条母婴评论（真实/AI 生成混合）──────────────────────────────

REVIEWS = [
    {
        "id": "r001",
        "text": "这款奶瓶真的很好用，我家宝宝喝得很开心，瓶身没有异味，清洗也方便。",
        "has_image": True,
        "label": 0,  # 真实
        "img_authentic_score": 0.85,  # 模拟图像真实性分数
    },
    {
        "id": "r002",
        "text": "完美的产品！强烈推荐给所有妈妈！质量无与伦比，绝对物超所值！售后服务也非常专业！",
        "has_image": True,
        "label": 1,  # AI 生成
        "img_authentic_score": 0.20,
    },
    {
        "id": "r003",
        "text": "收到货后发现密封圈有点松，联系客服换了一个，整体还可以，就是等待时间稍长。",
        "has_image": False,
        "label": 0,
        "img_authentic_score": 0.5,
    },
    {
        "id": "r004",
        "text": "这是我购买过的最好的婴儿湿巾！成分安全天然，气味清香怡人，宝宝皮肤超级嫩滑！",
        "has_image": True,
        "label": 1,
        "img_authentic_score": 0.15,
    },
    {
        "id": "r005",
        "text": "吸奶器吸力一般，用了两周感觉功率下降了，不过价格便宜，将就用吧。",
        "has_image": True,
        "label": 0,
        "img_authentic_score": 0.78,
    },
    {
        "id": "r006",
        "text": "卓越品质！无可挑剔！每一个细节都体现了工匠精神！是送给新生妈妈的绝佳礼物！",
        "has_image": True,
        "label": 1,
        "img_authentic_score": 0.12,
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2401.08825 — AiGen-FoodReview: A Multimodal Dataset of Machine-Generated Restaurant Reviews and Images on Social Media

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：目标 ASIN 的评论明细：评论文本（title + body）与评论附图（可公开抓取的图片 URL）；微调需要各 1000 条以上标注样本，并含真实与 AI 生成两类反例（差评场景每批 50-200 条）。增量接入方式为每日凌晨批量扫描竞品新增评论，或通过 Amazon Seller Central API 实时监听自品 ASIN 新评论。

**输出**：每条评论 0-1 的虚假概率分（≥0.75 自动标红）与 Top-3 触发词证据（可截图举报），以及批量可疑评论列表与 SHAP 证据报告；供评论风控与申诉团队向平台提交举报。

## 执行步骤

1. 采集目标 ASIN 的评论文本与评论附图，整理为标注样本
2. 抽取文本特征与图像特征并做融合分类
3. 输出每条评论 0-1 的虚假概率并标出 ≥0.75 的高风险评论
4. 生成 Top-3 触发词证据与可直接截图的举报材料
5. 留存审查日志，对高置信度以外的判定做人工复核

## 边界与不做

- 数据不满足时不用：无标注样本或样本量远低于千条量级时模型无法微调，先补标注；评论无附图时图像通道失效，只能退化为纯文本判断。
- 何时不用：要联合图文一致性与账号行为图检测用「Multimodal-Fake-Review-Detection」；要叠文本+行为+网络团伙三层取证用「VOC-Fraud-Review-Detection」；要撰写账号或 Listing 申诉文案用「Amazon-Account-Appeal-Strategy」。
- 能力边界：只输出虚假概率与可解释证据，不代替平台裁决；卡页口径下误判率约 8%-12%，机器判定必须人工复核后才可作为举报依据。
- 安全边界：仅用于自有或已授权评论数据的质量审查与申诉，不得用于刷评、攻击竞品或推断用户隐私；数据处理须获同意并保留审查日志。

## 技能关联

- **前置**：Skill-AI-Consumer-Wellbeing-Ethics.html、Skill-AI-Consumer-Wellbeing-Ethics、Skill-AIGC-Content-Detection.html、Skill-AIGC-Content-Detection、Skill-NLP-Text-Classification.html、Skill-NLP-Text-Classification、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-AI-Consumer-Wellbeing-Ethics.html、Skill-AI-Consumer-Wellbeing-Ethics、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-AI-Fake-Review-Detection

---

> 分类：业务运营/渠道经营/申诉材料准备　·　技术族：11-AI人文　·　源卡：`Skill-AI-Fake-Review-Detection`