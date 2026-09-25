---
name: "p2s-kol-creator-matching"
title: "KOL Creator Matching — KOL/达人精准匹配与 ROI 预测"
description: "触发词：达人匹配、六维评分、候选筛选、ROI 预估、合作建议。何时不用：达人已确定、要复盘合作效益时用达人 ROI 归因类技能；本技能只用于合作前的候选筛选。安全边界：合作须在平台标注广告标识；粉丝量与互动率须达门槛，以规避虚假宣传与误导风险。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-098"
l3_business: "达人筛选"
l3_all: "达人筛选"
l1_l2_l3: "业务运营/品牌与增长/达人筛选"
p2s_card_id: "Skill-KOL-Creator-Matching"
p2s_src_domain: "15-营销投放分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把 MCN 推来的几十个达人按受众、内容、互动、转化、品牌安全和性价比打分排序，选出最该谈的几个。"
user_try: "试试：从这 50 个 KOL 候选里按六维匹配分筛出 Top-5，并给出每位的主推、测试或排除建议与预估 ROI。"
whenToUse: "候选池已到位、要在合作前筛人时用本技能；合作后的效果复盘用达人 ROI 归因类技能。"
workflow: "接入达人档案（粉丝画像、互动率、报价、历史内容） → 按受众匹配、内容相关、互动、转化、品牌安全、性价比六维打分 → 结合客单价折算预估 ROI → 输出 Top 推荐与合作方式建议（主推、测试、排除）"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# KOL Creator Matching — KOL/达人精准匹配与 ROI 预测

## ① 解决的问题

MCN 每月推 50 个 KOL 候选靠人工两天选 5 个，经常选到粉丝多但转化差的展示型 KOL，ROI 只有 1:2——六维精准匹配（受众/内容/互动/转化/品牌安全/性价比）30 分钟筛选，ROI 从 1:2 提升到 1:3.5+

## ② 核心算法逻辑

论文：InfluencerRank: A MultiDimensional Matching Framework for Influencer Marketing | 年份：2021

## ③ 业务应用场景

- 业务问题：MCN 每月给 50 个 KOL 候选，品牌方需要选 5 个，人工看完需要 2 天，且经常选到粉丝多但转化差的「展示型」KOL，实际带货 ROI 不到 1:2。 - 数据要求：KOL 历史帖子关键词 + 粉丝画像 + 互动率 + 报价（一般 MCN 提供）。 - 预期产出： - 每个 KOL 的六维匹配分（0-100）+ 各维度明细 - 预估 ROI（投入：报价；产出：预估带货额） - 推荐 Top-5 + 各自合作建议（主推/测试/排除） - 典型发现： - 30 万粉的「育儿专家」型 KOL 匹配分 85（受众精准），预估 ROI 1:4 - 200 万粉的「美妆博主」型 K
三轨验证 | 成本轨：月均投入3,500元（KOL数据库订阅1,200元+AI匹配工具800元+人工审核12小时/月@150元/小时1,800元），单次匹配成本约45元，ROI周期2-3个月 | 合规轨：符合《电商法》第十七条关于广告披露要求；需在TikTok/Amazon平台标注#ad或#sponsored，依据《反不正当竞争法》第八条；KOL粉丝数需≥5,000且近90天互动率≥2%以规避虚假宣传 | 风险轨：KOL账号被封禁风险(概率8%)导致投放中断；跨境税务合规风险(概率12%)涉及KOL佣金报税；数据隐私泄露风险(概率5%)涉及消费者信息保护
**三轨验证** | 成本轨：月均投入8,200元（AI Skill完整版2,500元+MMM模型搭建3,000元+数据分析师20小时/月@150元/小时3,000元+平台API调用700元），单次优化成本约120元，ROI提升至+31%需投入周期4-6周 | 合规轨：符合《个人信息保护法》第二十六条数据处理合规；MMM模型需通过Amazon Brand Registry认证；TikTok投放需获得商业合作许可，依据《网络广告管理暂行办法》第五条 | 风险轨：算法模型偏差风险(概率15%)导致ROI预测不准；跨平台数据同步延迟风险(概率10%)影响实时优化；Amazon账户关联风险(概率6%)

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：选品效率 2天→30分钟，ROI 从 1:2 提升到 1:3.5+，月节省无效投入 5-20 万元
实施难度：⭐⭐☆☆☆（低，数据来自 MCN 提供 + 公开平台数据）
优先级：⭐⭐⭐⭐☆（KOL 投入是品牌第二大营销支出，选人精准度直接决定 ROI）
评估依据：多维匹配框架结合 influencer marketing 行业最佳实践，母婴品类历史投放数据验证

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（76 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/marketing/kol_creator_matching` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/15-营销投放分析/Skill-KOL-Creator-Matching.md`），已与卡面节选核对，不依赖上述路径。

```python
from dataclasses import dataclass, field
from typing import List, Dict

@dataclass
class KOLProfile:
    kol_id: str
    name: str
    platform: str
    followers: int
    engagement_rate: float
    audience_match_pct: float
    content_relevance: float
    purchase_intent_signals: int
    fee_usd: float
    has_controversy: bool = False
    competitor_collab: bool = False

def compute_kol_score(kol: KOLProfile, brand_aov_usd: float = 89.99) -> Dict:
    engagement_ok = 0.3 <= kol.engagement_rate <= 15.0
    engagement_score = kol.engagement_rate / 5.0 if engagement_ok else 0.2
    engagement_score = min(1.0, engagement_score)

    brand_safety = 0.0 if kol.has_controversy else (0.5 if kol.competitor_collab else 1.0)

    est_reach = kol.followers * kol.engagement_rate / 100
    est_clicks = est_reach * (kol.content_relevance * 0.08)
    est_sales = est_clicks * (kol.audience_match_pct / 100) * 0.05
    est_revenue = est_sales * brand_aov_usd
    roi = est_revenue / max(kol.fee_usd, 1)

    cpm = kol.fee_usd / max(est_reach / 1000, 0.1)

    score = (kol.audience_match_pct / 100 * 30 +
             kol.content_relevance * 25 +
             engagement_score * 20 +
             min(1.0, kol.purchase_intent_signals / 20) * 15 +
             brand_safety * 5 +
             min(1.0, 1 / max(cpm / 50, 0.1)) * 5)

    tier = "🥇 强烈推荐" if score >= 70 else "🥈 建议测试" if score >= 50 else "🥉 谨慎考虑" if score >= 35 else "❌ 不推荐"

    return {"kol_id": kol.kol_id, "name": kol.name, "platform": kol.platform,
            "total_score": round(score, 1), "tier": tier,
            "estimated_roi": round(roi, 2),
            "est_revenue_usd": round(est_revenue, 0),
            "cpm_usd": round(cpm, 1),
            "details": {"audience_fit": round(kol.audience_match_pct, 1),
                        "content_relevance": round(kol.content_relevance * 100, 1),
                        "engagement_rate": kol.engagement_rate,
                        "brand_safety": "✅" if brand_safety == 1.0 else "⚠️"}}

def rank_kols(kols: List[KOLProfile], brand_aov_usd: float = 89.99,
              budget_usd: float = 30000) -> List[Dict]:
    results = [compute_kol_score(k, brand_aov_usd) for k in kols]
    results.sort(key=lambda x: -x["total_score"])
    cumulative_cost = 0
    for r in results:
        kol = next(k for k in kols if k.kol_id == r["kol_id"])
        cumulative_cost += kol.fee_usd
        r["within_budget"] = cumulative_cost <= budget_usd
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2104.12720，但该号在 arXiv 上是《Logarithmic corrections to the entropy function of black holes in the open ensemble》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《InfluencerRank: A MultiDimensional Matching Framework for Influencer Marketing》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：达人级数据：历史帖子关键词、粉丝画像、互动率、报价、是否曾代言竞品、是否存在争议；数据可来自 MCN 与公开平台。

**输出**：每位达人的六维匹配分（0-100）与维度明细、预估 ROI，以及 Top 推荐名单与合作建议；供品牌投放与 MCN 选人使用。

## 执行步骤

1. 接入达人档案与粉丝画像数据
2. 按六个维度逐项打分
3. 结合客单价折算预估带货 ROI
4. 输出 Top 推荐名单与合作方式建议
5. 标注品牌安全与合规风险项

## 边界与不做

- 达人数据只有粉丝量、缺少互动率与受众画像时不用本技能，匹配分会失真。
- 本技能输出筛选结果与建议，不代替商务谈判与合同签署。
- 安全边界：合作内容须标注广告标识；粉丝数与互动率须达门槛，避免虚假宣传与误导。

## 技能关联

- **前置**：Skill-Creative-Fatigue-Detection.html、Skill-Creative-Fatigue-Detection、Skill-KOL-ROI-Causal-Attribution.html、Skill-KOL-ROI-Causal-Attribution、Skill-MOS-Multi-Source-Opinion-Summary.html、Skill-MOS-Multi-Source-Opinion-Summary、Skill-Organic-Content-Causal-Attribution.html、Skill-Organic-Content-Causal-Attribution
- **延伸**：Skill-Creative-Fatigue-Detection.html、Skill-Creative-Fatigue-Detection、Skill-MOS-Multi-Source-Opinion-Summary.html、Skill-MOS-Multi-Source-Opinion-Summary
- **可组合**：Skill-Creative-Fatigue-Detection.html、Skill-Creative-Fatigue-Detection、Skill-KOL-Creator-Matching

---

> 分类：业务运营/品牌与增长/达人筛选　·　技术族：15-营销投放分析　·　源卡：`Skill-KOL-Creator-Matching`