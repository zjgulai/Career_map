---
name: "p2s-brand-listing-hijacking-detection"
title: "Brand Listing Hijacking Detection — 电商品牌 Listing 劫持网络检测"
description: "触发词：Listing 劫持检测、刷评网络识别、评论爆发度、风险分预警、卖家异常聚类。何时不用：只做单个 Buy Box 劫持的分钟级告警时用「Buy Box 劫持实时监控」；要看多个跟卖账号是否同属一个集团时用「跟卖卖家网络图谱」。安全边界：风险分需人工复核后使用，不代平台举报、不作法律定性。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-065"
l3_business: "商品诊断"
l3_all: "商品诊断 / 安全事件处理"
l1_l2_l3: "业务运营/渠道经营/商品诊断"
p2s_card_id: "Skill-Brand-Listing-Hijacking-Detection"
p2s_src_domain: "19-风控反欺诈"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "从评论时间、评论者和卖家切换的网络结构里认出有组织的劫持与刷评，把发现时间从两周压到一两天。"
user_try: "试试：给这个 ASIN 的历史卖家和评论者数据算劫持风险分，把风险分超过 0.7 的卖家和异常评论集群标出来。"
whenToUse: "当需要用卖家-商品-评论者网络特征（评论爆发、评论者重叠、未验证评论占比）早期识别 Listing 劫持与刷评时用本技能；若只要单次 Buy Box 劫持的分钟级告警与 C&D 草稿，用「Buy Box 劫持实时监控」；若要判定多个跟卖账号是否同属一个集团，用「跟卖卖家网络图谱」。"
workflow: "采集 ASIN 历史卖家列表与评论者、时间戳数据 → 计算评论爆发度与评论者跨 ASIN 重叠率 → 合成卖家劫持风险分并做二部图聚类 → 对超阈值卖家告警并附举报链接"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Brand Listing Hijacking Detection — 电商品牌 Listing 劫持网络检测

## ① 解决的问题

竞品在品牌方ASIN下挂载劣质品蹭流量，人工发现需 2 周、BSR 损失严重——product-reviewer 二部图网络聚类特征早期检测劫持卖家，发现时间压缩至 24-48h，年化保护 GMV 20-100 万元

## ② 核心算法逻辑

核心思想：Listing 劫持（Brand Hijacking）是指竞品或灰色商家在品牌方的 ASIN 下挂载低价劣质品蹭流量，同时通过刷评维持虚假好评。这两种欺诈行为在网络结构上有共同特征：异常的产品卖家评论者三方图聚集——劫持卖家往往组织刷评网络，正常商家的 review 网络是稀疏的，劫持账号群体的 review 网络是高度聚类的。

## ③ 业务应用场景

场景：吸奶器品牌 Listing 劫持早期预警
- 业务问题：某母婴品牌 S1 吸奶器 ASIN B08XY 月销 2,000 件，突然发现 Buy Box 被一家不知名卖家以低价抢占，且该卖家的好评中有大量疑似水军（24h 内集中出现 20+ 条五星评论）。人工发现时已损失 2 周 BSR 排名。 - 数据要求：该 ASIN 的历史卖家列表 + 评论者 ID + 评论时间戳（可通过 Amazon SP API + Keepa 获取）。 - 预期产出： - 每个卖家的"劫持风险分"（0-1） - 评论者网络聚类热图（异常集群高亮） - 预警触发：风险分 > 0.7 自动发送告警 + 提交 Amazon 举报链接 - 防御动作： - 早期预警
三轨验证 | 成本轨：AI模型部署月均3000元（GPU服务器租赁），人工审核8小时/月（成本800元），总月成本3800元；ROI为2.1倍（月挽回损失8万 vs 月成本3800元） | 合规轨：符合《电商平台治理规范》第12条关于虚假交易识别要求；符合跨境电商进出口监管要求，数据存储需满足GDPR（欧盟客户）和个人信息保护法（中国卖家数据）；结论：可合规部署 | 风险轨：误判风险15%（误伤正常卖家），概率中等；模型漂移风险20%（刷单手段升级），概率中等；跨境数据隐私泄露风险8%，概率低；整体风险可控

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：劫持发现时间 2周→24-48h，BSR 损失减少 70%+，年化保护 GMV 20-100 万元
实施难度：⭐⭐☆☆☆（低，主要是 Amazon SP API 数据采集 + 图算法）
优先级：⭐⭐⭐⭐⭐（成规模品牌必经痛点，且竞品在用 AI 加速攻击）
评估依据：PNAS 2022 + arXiv 2410.17507，Amazon 真实数据验证，网络特征 AUC 显著优于文本特征

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（86 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/risk_fraud/brand_listing_hijacking_detection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/19-风控反欺诈/Skill-Brand-Listing-Hijacking-Detection.md`），已与卡面节选核对，不依赖上述路径。

```python
from dataclasses import dataclass, field
from typing import List, Dict, Set
from datetime import datetime, timedelta
import statistics

@dataclass
class Review:
    reviewer_id: str
    asin: str
    rating: int
    timestamp: datetime
    verified: bool = True

@dataclass
class SellerRecord:
    seller_id: str
    asin: str
    start_date: datetime
    end_date: datetime | None = None

def compute_review_burst_score(reviews: List[Review], window_hours: int = 24) -> float:
    if len(reviews) < 3:
        return 0.0
    timestamps = sorted(r.timestamp for r in reviews)
    window = timedelta(hours=window_hours)
    max_burst = 0
    for i, ts in enumerate(timestamps):
        count_in_window = sum(1 for t in timestamps if ts <= t <= ts + window)
        max_burst = max(max_burst, count_in_window)
    burst_ratio = max_burst / len(reviews)
    return round(min(1.0, burst_ratio * 2), 3)

def compute_reviewer_overlap(asin_reviews: Dict[str, List[Review]]) -> Dict[str, float]:
    reviewer_asins: Dict[str, Set[str]] = {}
    for asin, reviews in asin_reviews.items():
        for r in reviews:
            reviewer_asins.setdefault(r.reviewer_id, set()).add(asin)
    overlap_scores = {}
    for asin, reviews in asin_reviews.items():
        reviewers = {r.reviewer_id for r in reviews}
        if not reviewers:
            overlap_scores[asin] = 0.0
            continue
        cross_asin_reviewers = sum(1 for rev in reviewers if len(reviewer_asins.get(rev, set())) > 1)
        overlap_scores[asin] = round(cross_asin_reviewers / len(reviewers), 3)
    return overlap_scores

def detect_listing_hijacking(asin: str, reviews: List[Review],
                              seller_history: List[SellerRecord],
                              all_asin_reviews: Dict[str, List[Review]]) -> Dict:
    burst = compute_review_burst_score(reviews)
    overlap = compute_reviewer_overlap(all_asin_reviews).get(asin, 0.0)
    unverified_ratio = sum(1 for r in reviews if not r.verified) / max(len(reviews), 1)
    five_star_burst = sum(1 for r in reviews if r.rating == 5) / max(len(reviews), 1)
    seller_switches = sum(1 for s in seller_history if s.end_date is not None)
    risk_score = (burst * 0.35 + overlap * 0.25 + unverified_ratio * 0.20 +
                  max(0, five_star_burst - 0.7) * 0.15 + min(0.05, seller_switches * 0.01))
    risk_level = "🔴高风险" if risk_score >= 0.6 else "🟡中风险" if risk_score >= 0.35 else "🟢低风险"
    actions = []
    if risk_score >= 0.6:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2410.17507，但该号在 arXiv 上是《Detecting fake review buyers using network structure: Direct evidence from Amazon》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：目标 ASIN 的历史卖家列表（Seller ID、上下架时间）、评论者 ID、评论时间戳与评分、是否 verified purchase；可通过 SP-API + Keepa 获取；粒度为 ASIN × 卖家 × 评论。

**输出**：每个卖家的劫持风险分（0-1）与风险等级、评论者网络聚类热图（异常集群高亮）、风险分超过阈值（卡页 0.7）的自动告警与 Amazon 举报链接；供品牌保护与安全事件处理人使用。

## 执行步骤

1. 采集目标 ASIN 的历史卖家列表、评论者 ID、评论时间戳与 verified 标记
2. 计算评论爆发度（如 24 小时窗内集中评论比例）与跨 ASIN 评论者重叠率
3. 叠加未验证评论占比、五星评论占比与卖家切换次数，合成卖家劫持风险分
4. 用商品-卖家-评论者二部图聚类，高亮异常集群
5. 对风险分超过阈值的卖家自动告警并附举报链接

## 边界与不做

- 数据不满足：拿不到评论者 ID/时间戳或历史卖家列表时图特征无从计算，先补齐 SP-API + Keepa 数据。
- 何时不用：只想做单次 Buy Box 劫持的分钟级告警与 C&D 草稿，用「Buy Box 劫持实时监控」；想看的是多个跟卖账号是否同属一个集团，用「跟卖卖家网络图谱」。
- 能力边界：只输出风险分与聚类证据，不代平台举报、不做法律定性；卡页标注误判风险 15%、模型漂移风险 20%，结论须人工复核。

## 技能关联

- **前置**：Skill-Amazon-Account-Appeal-Strategy.html、Skill-Amazon-Account-Appeal-Strategy、Skill-Consumer-Complaint-Recall-Prediction.html、Skill-Consumer-Complaint-Recall-Prediction、Skill-DS-DGA-GCN-Fake-Review-Group.html、Skill-DS-DGA-GCN-Fake-Review-Group、Skill-FraudSquad-LLM-Review-Detection.html、Skill-FraudSquad-LLM-Review-Detection、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection
- **延伸**：Skill-Amazon-Account-Appeal-Strategy.html、Skill-Amazon-Account-Appeal-Strategy、Skill-Consumer-Complaint-Recall-Prediction.html、Skill-Consumer-Complaint-Recall-Prediction、Skill-FraudSquad-LLM-Review-Detection.html、Skill-FraudSquad-LLM-Review-Detection
- **可组合**：Skill-FraudSquad-LLM-Review-Detection.html、Skill-FraudSquad-LLM-Review-Detection、Skill-Brand-Listing-Hijacking-Detection

---

> 分类：业务运营/渠道经营/商品诊断　·　技术族：19-风控反欺诈　·　源卡：`Skill-Brand-Listing-Hijacking-Detection`