---
name: "p2s-tag-driven-user-behavior-analytics"
title: "Tag-Driven User Behavior Analytics — 实时行为事件流标签化与动态用户画像"
description: "触发词：实时画像、行为事件打标、高意图捕获、动态标签、漏斗诊断。何时不用：只需离线价值分层用 RFM 类技能，判断渠道真实增量用增量分析类技能，本技能把行为事件流实时转成可用标签与画像。安全边界：埋点采集须在隐私政策范围内并取得营销授权，折扣表述须有价格对比依据，触达频次须受控。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-101"
l3_business: "分群"
l3_all: "分群 / 漏斗诊断"
l1_l2_l3: "业务运营/品牌与增长/分群"
p2s_card_id: "Skill-Tag-Driven-User-Behavior-Analytics"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "把点击、加购这些行为实时打成标签，用户画像从隔天更新变成几秒内更新。"
user_try: "试试：基于我们的埋点数据实时识别加购 3 件以上同品类的高意图用户，并给出即时触达话术。"
whenToUse: "需要实时识别高意图用户并即时干预，或要按宝宝成长阶段做 Cohort 分析时用本技能；只需离线价值分层用 RFM 类技能，判断渠道与活动的真实增量用增量分析类技能。"
workflow: "接入行为埋点事件流 → 按事件类型加权打标签 → 标签按时间衰减并滚动更新 → 按阈值输出高意图人群 → 触发即时触达或跑 Cohort 分析"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Tag-Driven User Behavior Analytics — 实时行为事件流标签化与动态用户画像

## ① 解决的问题

数据分析师面临"用户行为事件流无法实时更新用户画像分析总是滞后"——流式标签打标+实时OLAP将用户画像更新延迟从T+1降至秒级，精细化运营效率年化提升63万元

## ② 核心算法逻辑

本 Skill 将用户行为事件流（点击/浏览/加购/购买）实时打标签，构建动态更新的用户画像，用于精细化运营分析（漏斗分析/Cohort 分析/RFM 分级）。

## ③ 业务应用场景

场景A：高意图用户实时捕获 + 即时触达 - 业务问题：用户「浏览→加购→离开」的转化漏斗流失率 68%，无法实时识别高意图用户并即时干预 - 数据要求：用户行为埋点（点击/加购/收藏）+ 事件时间戳，延迟 ≤5分钟 - 预期产出：实时识别「高意图标签（加购≥3同品类）」用户，5分钟内触发「立即购买省$X」弹窗/Push - 业务价值：加购→购买转化率从 32% 提升至 47%，年化 GMV 增量约 38 万元
三轨验证： - 成本：数据采集需接入埋点 SDK（约 0.5 人月开发），实时计算资源（Flink 集群约 $800/月），Push 通道费用（按发送量计约 $0.01/条），合计首年成本约 3.2 万元 - 合规：Push 弹窗需遵守 Amazon 站内信政策（禁止过度营销/误导性折扣），需确保用户已授权营销通知（GDPR 第 7 条），折扣表述需符合广告法「最低价」「省$X」需有价格对比依据 - 风险：高频 Push 可能导致用户卸载/投诉（品牌损伤），若竞品同步跟进折扣可能引发价格战，平台可能审查「立即购买省$X」的折扣真实性
场景B：宝宝成长阶段 Cohort 运营分析 - 业务问题：育儿用户需求随宝宝月龄动态变化，传统按注册时间 Cohort 分析无法捕捉成长阶段迁移 - 数据要求：用户宝宝月龄标签（动态更新）+ 购买品类历史 - 预期产出：「宝宝0-6月 Cohort」→「宝宝6-12月 Cohort」迁移分析，识别品类需求迁移规律 - 业务价值：精准在用户宝宝进入新阶段时推送对应品类，年化复购 GMV 提升约 25 万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：高意图实时触达使加购→购买转化率 32%→47%，年化 GMV 增量约 38 万元；成长 Cohort 分析精准匹配品类需求，年化复购 GMV 提升约 25 万元，合计年化价值约 63 万元
实施难度：⭐⭐⭐☆☆（批量版本 1 周可用，实时流处理需 Flink/Kafka 基础设施）
优先级：⭐⭐⭐⭐⭐（用户行为分析是所有精细化运营的数据底座，优先级最高）
数据门槛：行为埋点完整度 ≥95%，事件延迟 ≤5分钟（实时干预场景）
风险：标签更新频率过高导致系统压力，建议批量版本先验证业务价值再投资流处理基础设施

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（268 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/tag_driven_user_behavior_analytics` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Tag-Driven-User-Behavior-Analytics.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Tag-Driven User Behavior Analytics
实时行为事件流标签化与动态用户画像

依赖：numpy, pandas
"""
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import math


# ─── 1. 事件类型与标签权重定义 ────────────────────────────────────────────────

EVENT_TAG_WEIGHTS = {
    # event_type: {tag_key: weight, ...}
    "view":        {"品类兴趣": 0.3,  "高意图": 0.1,  "活跃度": 0.2},
    "click":       {"品类兴趣": 0.5,  "高意图": 0.2,  "活跃度": 0.4},
    "add_to_cart": {"品类兴趣": 0.8,  "高意图": 0.9,  "活跃度": 0.6},
    "favorite":    {"品类兴趣": 0.7,  "高意图": 0.7,  "活跃度": 0.5},
    "purchase":    {"品类兴趣": 1.0,  "高意图": 1.0,  "活跃度": 1.0, "忠诚度": 0.8},
    "coupon_use":  {"价格敏感": 1.0,  "活跃度": 0.3},
}

TAG_DECAY_RATES = {
    "品类兴趣": 0.05,   # 缓慢衰减（7天半衰期≈0.05×ln2/天）
    "高意图":   0.20,   # 快速衰减（1天半衰期）
    "活跃度":   0.10,   # 中等衰减
    "忠诚度":   0.01,   # 极慢衰减（长期标签）
    "价格敏感": 0.03,   # 慢衰减（行为特征相对稳定）
}

TAG_THRESHOLDS = {
    "高意图":   0.7,    # 超过此阈值触发即时干预
    "品类兴趣": 0.5,
    "活跃度":   0.4,
    "忠诚度":   0.3,
    "价格敏感": 0.5,
}


# ─── 2. 数据结构 ──────────────────────────────────────────────────────────────

@dataclass
class BehaviorEvent:
    user_id: str
    event_type: str
    category: str
    timestamp: datetime
    amount: float = 0.0
    coupon_used: bool = False


@dataclass
class UserProfile:
    user_id: str
    tag_scores: Dict[str, float] = field(default_factory=dict)
    category_scores: Dict[str, float] = field(default_factory=dict)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2403.07562，但该号在 arXiv 上是《A Flexible Cell Classification for ML Projects in Jupyter Notebooks》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：用户行为埋点事件（点击、浏览、加购、收藏、购买）与事件时间戳，卡页口径埋点完整度不低于 95%、事件延迟不超过 5 分钟；成长阶段 Cohort 场景另需宝宝月龄标签与购买品类历史。

**输出**：实时更新的用户标签与动态画像（如加购 3 件以上同品类的高意图标签）、可用于漏斗与 Cohort 分析的分群结果，以及即时触达触发信号；卡页口径加购到购买转化率从 32% 提升到 47%、画像更新延迟从 T+1 降到秒级。

## 执行步骤

1. 接入行为埋点事件流，校验埋点完整度与事件延迟。
2. 按事件类型权重为浏览、点击、加购、收藏、购买打标签。
3. 让标签随时间衰减并滚动刷新用户画像。
4. 按标签阈值输出高意图人群并触发即时触达。
5. 用标签体系跑漏斗分析与成长阶段 Cohort 分析。

## 边界与不做

- 埋点完整度不足或事件延迟超过 5 分钟时不要用于实时干预，只能先跑离线批版本。
- 能力边界：标签由规则权重与衰减率决定；卡页建议先用批量版本验证业务价值再投流处理基础设施，标签更新频率过高会带来系统压力。卡页的转化率与 GMV 数字为特定口径。
- 合规红线：埋点采集须在隐私政策范围内并取得营销授权，折扣表述（如立省金额）须有价格对比依据，触达频次须受控以免用户卸载与投诉。

## 技能关联

- **前置**：Skill-Abandoned-Cart-Recovery-ML.html、Skill-Abandoned-Cart-Recovery-ML、Skill-Auto-Tagging-Pipeline-Rule-ML-LLM.html、Skill-Auto-Tagging-Pipeline-Rule-ML-LLM、Skill-CASE-Cadence-Aware-Repurchase-Prediction.html、Skill-CASE-Cadence-Aware-Repurchase-Prediction、Skill-Online-Feature-Store-SC-Realtime.html、Skill-Online-Feature-Store-SC-Realtime、Skill-Tag-Driven-User-Growth-Trigger.html、Skill-Tag-Driven-User-Growth-Trigger、Skill-Tag-Enhanced-Personalized-Recommendation.html、Skill-Tag-Enhanced-Personalized-Recommendation
- **延伸**：Skill-Abandoned-Cart-Recovery-ML.html、Skill-Abandoned-Cart-Recovery-ML、Skill-CASE-Cadence-Aware-Repurchase-Prediction.html、Skill-CASE-Cadence-Aware-Repurchase-Prediction、Skill-Tag-Driven-User-Growth-Trigger.html、Skill-Tag-Driven-User-Growth-Trigger、Skill-Tag-Enhanced-Personalized-Recommendation.html、Skill-Tag-Enhanced-Personalized-Recommendation
- **可组合**：Skill-Tag-Driven-User-Growth-Trigger.html、Skill-Tag-Driven-User-Growth-Trigger、Skill-Tag-Enhanced-Personalized-Recommendation.html、Skill-Tag-Enhanced-Personalized-Recommendation、Skill-Tag-Driven-User-Behavior-Analytics

---

> 分类：业务运营/品牌与增长/分群　·　技术族：24-标签工程　·　源卡：`Skill-Tag-Driven-User-Behavior-Analytics`