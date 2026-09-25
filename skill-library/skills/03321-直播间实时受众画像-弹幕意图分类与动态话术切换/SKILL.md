---
name: "p2s-live-audience-real-time-personalization"
title: "直播间实时受众画像 — 弹幕意图分类与动态话术切换"
description: "触发词：直播弹幕、意图分类、话术切换、实时受众画像、直播运营。何时不用：要预测直播间转化率下滑并预警用「直播转化率实时预测」；要事后挖掘话术与成交的因果时机用「直播话术优化 NLP」。安全边界：弹幕仅用于实时意图分析、不存储用户个人身份信息；话术模板不得含虚假宣传或价格误导内容。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-070"
l3_business: "转化优化"
l3_all: "转化优化 / 分群"
l1_l2_l3: "业务运营/渠道经营/转化优化"
p2s_card_id: "Skill-Live-Audience-Real-Time-Personalization"
p2s_src_domain: "14-用户分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "弹幕里一半人在问价、一半人在问安全：实时认出当前主导意图，提示主播下一句该说什么。"
user_try: "试试：接上这场直播的弹幕流，实时判断当前主导意图并给出下一段话术建议。"
whenToUse: "当直播间弹幕同时存在价格敏感与品质导向人群、需要实时判断主导意图并切换话术时用本技能；要预测 CVR 下滑并预警用「直播转化率实时预测」；要做事后话术归因用「直播话术优化 NLP」。"
workflow: "接入直播弹幕流 → 用品类意图词典对弹幕做意图分类 → 统计当前主导意图与强度 → 从话术模板库匹配下一段台词与展示品 → 生成整场意图转变时间线并复盘"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 直播间实时受众画像 — 弹幕意图分类与动态话术切换

## ① 解决的问题

直播运营面临"不同类型观众混在一起用同一套话术导致大量用户流失"——弹幕意图分类+话术切换规则将转化率提升18%，年化$6.4万

## ② 核心算法逻辑

直播间弹幕流是用户实时意图的高密度信号源。本方法通过弹幕词频 TFIDF 实时分析将观众动态分类为4种意图画像，再由规则引擎触发对应话术切换，实现主播实时个性化表达。

## ③ 业务应用场景

场景A：母婴品牌 TikTok LIVE 吸奶器销售专场
- 业务问题：某品牌 Spectra 吸奶器 TikTok LIVE 中，主播统一用同一套话术，无法应对弹幕区同时出现"多少钱"（价格敏感群体）和"对母乳喂养有帮助吗"（品质导向新妈妈）的混合受众，导致转化率只有 2.1%（行业均值 4-6%） - 数据要求： - 直播弹幕流（实时 WebSocket 接入，mock 演示用随机弹幕） - 预定义意图词典（品类专属，母婴维度扩充） - 话术模板库（每种意图 3-5 套话术，由运营预设） - 预期产出： - 实时意图仪表盘（当前主导意图 + 强度） - 下一话术建议（含台词文本 + 展示品推荐） - 每场直播意图转变时间线报告 - 业务价值：话术
三轨验证： - 成本：TikTok LIVE 弹幕 WebSocket API 接入费约 $200/月；计算资源（单台云服务器 $50/月）；人力成本（运营预设话术库 40 小时/季度 + 开发维护 80 小时/年），首年总成本约 $5,000。 - 合规：弹幕数据仅用于实时意图分析，不存储用户个人身份信息（PII），符合 TikTok 开发者协议；话术模板不包含虚假宣传或价格误导内容，未触碰 Amazon 政策或 GDPR 红线。 - 风险：价格敏感话术可能引发竞品跟风降价，导致品类价格战；若弹幕意图误判（如将品质导向误判为价格敏感），可能向品质型用户推送低价话术，损伤品牌高端形象。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
话术动态适配使转化率从 2.1% → 3.9%（+86%）
按月均直播 20 场 × 平均 500 观众 × 客单价 $39 估算
年化增量 GMV：500 × 20 × 12 × 39 × (3.9%-2.1%) ≈ $6.4 万
系统开发+维护成本约 $5,000/年
净ROI ≈ 1,180%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（269 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/user_analytics/live_audience_real_time_personalization` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-Live-Audience-Real-Time-Personalization.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
直播间实时受众画像 + 动态话术切换系统
基于弹幕 TF-IDF 意图分类 + 规则引擎
使用 mock 弹幕流演示实时分析流程
"""
import math
import re
import random
from collections import Counter, deque
from dataclasses import dataclass
from typing import List, Dict, Tuple, Optional


# ────── 意图词典定义（母婴跨境专属）──────

INTENT_KEYWORDS: Dict[str, List[str]] = {
    "新客探索": [
        "first", "new", "never", "what", "how", "explain", "introduce",
        "第一次", "不了解", "怎么用", "是什么", "介绍一下", "新来的",
    ],
    "老客回购": [
        "again", "back", "repurchase", "already", "last time", "bought before",
        "又来了", "还有没有", "上次买了", "老顾客", "回头客", "再买",
    ],
    "价格敏感": [
        "price", "cost", "cheap", "discount", "coupon", "deal", "link", "buy",
        "多少钱", "优惠吗", "发链接", "能便宜吗", "有券吗", "价格", "秒杀",
    ],
    "品质导向": [
        "safe", "material", "ingredient", "certificate", "test", "quality", "organic",
        "安全吗", "成分", "认证", "检测", "能用吗", "宝宝适合", "有没有害", "质量",
    ],
}

# 话术模板库
SCRIPT_TEMPLATES: Dict[str, List[str]] = {
    "新客探索": [
        "欢迎新朋友！我们这款产品专为6-36个月宝宝设计，让我从头给大家介绍……",
        "看到有朋友第一次来，给大家解释一下这个产品的核心功能……",
        "新来的宝妈们注意了，这款的使用方法很简单，我来演示……",
    ],
    "老客回购": [
        "感谢老朋友们的支持！今天有老顾客专属优惠，库存只剩最后50单……",
        "欢迎回来的宝妈们！上次买过的都说效果好，今天还有更优惠的套餐……",
        "老顾客们你们知道的，我们家品质一直在线，今天特别为你们备了……",
    ],
    "价格敏感": [
        "好！现在给大家报价！原价$49.99，直播间专属$34.99，点下方链接……",
        "价格透明！这是全网最低价，我们品牌官方直播保证！链接放上来……",
        "限时秒杀！接下来3分钟，前100单再减$5，快点链接！",
    ],
    "品质导向": [
        "关于安全性，这个产品通过了CPSC认证和FDA食品级材料认证，我来给大家看证书……",
        "成分这块，我们用的是医疗级硅胶，完全无BPA，宝宝接触100%安全……",
        "质检报告我们都公开！这款已经服务了超过10万个家庭，零安全投诉……",
    ],
}


# ────── TF-IDF 实时计算（弹幕窗口版）──────
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2403.08812。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：直播弹幕流（实时接入，卡页示例用 WebSocket）、品类专属意图词典、由运营预设的话术模板库（每种意图 3-5 套）；粒度为单条弹幕 × 时间窗。

**输出**：实时意图仪表盘（主导意图与强度）、下一段话术建议（台词与展示品），以及整场意图转变时间线报告；供主播与直播中控使用。

## 执行步骤

1. 接入直播弹幕流并做清洗
2. 用品类意图词典对弹幕分类并统计强度
3. 识别当前主导意图及其变化趋势
4. 从话术模板库匹配下一段台词与展示品
5. 输出整场意图转变时间线供复盘

## 边界与不做

- 数据不满足：拿不到弹幕流、或没有预设话术模板库时本技能跑不起来，先补接入与模板。
- 何时不用：要预测 CVR 下滑并预警用「直播转化率实时预测」；要做事后话术归因用「直播话术优化 NLP」。
- 能力边界：只做意图识别与话术建议，不代替主播临场表达，也不保证卡页口径的转化提升。
- 安全边界：弹幕仅用于实时意图分析、不存储用户个人身份信息；话术模板不得含虚假宣传或价格误导内容。

## 技能关联

- **前置**：Skill-Clickstream-Persona-Pipeline.html、Skill-Clickstream-Persona-Pipeline、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction、Skill-TikTok-Shop-Content-Commerce-Funnel.html、Skill-TikTok-Shop-Content-Commerce-Funnel、Skill-User-Analytics-Logistics-Bridge.html、Skill-User-Analytics-Logistics-Bridge、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction、Skill-TikTok-Shop-Content-Commerce-Funnel.html、Skill-TikTok-Shop-Content-Commerce-Funnel、Skill-User-Analytics-Logistics-Bridge.html、Skill-User-Analytics-Logistics-Bridge、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction、Skill-TikTok-Shop-Content-Commerce-Funnel.html、Skill-TikTok-Shop-Content-Commerce-Funnel、Skill-User-Analytics-Logistics-Bridge.html、Skill-User-Analytics-Logistics-Bridge、Skill-Live-Audience-Real-Time-Personalization

---

> 分类：业务运营/渠道经营/转化优化　·　技术族：14-用户分析　·　源卡：`Skill-Live-Audience-Real-Time-Personalization`