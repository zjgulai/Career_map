---
name: "p2s-marketing-data-pipeline"
title: "Marketing Data Pipeline — 营销归因多渠道数据采集管道"
description: "触发词：营销归因采集、身份拼接、多渠道触点、因果增量、去重归因。何时不用：只做广告字段跨平台统一模型时用广告统一数据模型技能；只处理归因窗口口径差异时用归因窗口统一技能。安全边界：用户标识须哈希化处理并遵守各平台接口条款与隐私政策，不得跨平台明文传输个人信息。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 数据质量"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Marketing-Data-Pipeline"
p2s_src_domain: "15-营销投放分析"
quality_tier: "preview"
user_summary: "把各渠道的曝光点击转化按用户拼成完整旅程，看清哪个渠道真带来增量，而不是只看末次点击。"
user_try: "试试：把 Meta、TikTok、Amazon 和 Shopify 的数据按用户拼成触点旅程，算出各渠道的因果增量和去重后的归属。"
whenToUse: "需要跨渠道识别同一用户并计算增量贡献时用本技能；只解决字段口径或窗口差异，用广告统一数据模型与归因窗口统一技能。"
workflow: "接入各渠道广告与订单数据 → 按邮箱哈希与设备指纹做身份拼接 → 还原每个用户的触点旅程 → 分别计算末次点击、线性与因果增量归因 → 输出渠道归因对照与预算建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Marketing Data Pipeline — 营销归因多渠道数据采集管道

## ① 解决的问题

业务背景：某母婴 DTC 品牌月均广告支出 ¥85 万，分配在 Meta（40%）、TikTok（35%）、Amazon Sponsored（25%）

## ② 核心算法逻辑

营销归因的核心难题是数据孤岛：广告平台（Meta/Google/TikTok）、CRM（Salesforce/HubSpot）、电商平台（Amazon/Shopify）、社交媒体各持一方数据，无法直接关联。数据管道需要解决：

## ③ 业务应用场景

业务背景：某母婴 DTC 品牌月均广告支出 ¥85 万，分配在 Meta（40%）、TikTok（35%）、Amazon Sponsored（25%）。末次点击归因显示 Amazon 广告 ROAS=8.2（最高），团队准备大幅增加 Amazon 投入，削减 TikTok。
业务决策校正： - 维持 TikTok 预算（因果归因下增量最大） - 削减 Amazon Sponsored 20%（高 ROAS 主要来自已有意向用户） - 预计年度广告效率提升：节省 ¥12 万 + 增量 GMV +¥65 万
业务背景：品牌在小红书投放 KOL 种草内容（月均 ¥15 万），但小红书没有标准转化 API，无法直接归因到 DTC 站销售。

## ④ 输入数据要求

Meta: `facebook-business` SDK → `AdInsights` API
TikTok: TikTok for Business API → `/reports/integrated/get/`
Amazon: Amazon Attribution API → `attributionReports`
Shopify: Webhook → `orders/create` 事件

## ⑤ 输出结果

Meta: `facebook-business` SDK → `AdInsights` API
TikTok: TikTok for Business API → `/reports/integrated/get/`
Amazon: Amazon Attribution API → `attributionReports`
Shopify: Webhook → `orders/create` 事件

## ⑥ 业务价值 / ROI

12 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（385 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：5」并记录位置 `paper2skills-code/marketing/marketing_data_pipeline` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/15-营销投放分析/Skill-Marketing-Data-Pipeline.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Marketing Attribution Data Pipeline
整合 UniMTA (身份拼接) + StreamAttrib (实时聚合) + CausalAttrib (因果归因)
使用 mock 数据，可直接运行
"""

import re
import hashlib
import random
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple, Set
from datetime import datetime, timedelta
from collections import defaultdict


# ── 数据结构 ────────────────────────────────────────────────────────────

@dataclass
class AdEvent:
    """广告事件（曝光/点击/转化）"""
    event_id: str
    channel: str          # meta / tiktok / amazon / xiaohongshu
    event_type: str       # impression / click / conversion
    user_id_raw: str      # 各平台原始 ID
    email_hash: str       # SHA256 邮箱（若有）
    ip_fingerprint: str   # IP + UA fingerprint
    timestamp: datetime
    value: float          # 广告花费 / 转化金额（视 event_type）
    creative_id: str      # 广告创意 ID


@dataclass
class UserJourney:
    """单用户完整触点旅程"""
    unified_user_id: str
    touchpoints: List[AdEvent]
    converted: bool
    conversion_value: float
    conversion_time: Optional[datetime]


@dataclass
class ChannelAttribution:
    """渠道归因结果"""
    channel: str
    last_click_credit: float    # 末次点击归因
    linear_credit: float        # 线性归因
    causal_cate: float          # 因果增量 CATE
    impression_count: int
    click_count: int
    attributed_gmv: float


# ── UniMTA：身份拼接 ──────────────────────────────────────────────────────

class IdentityGraph:
    """
    跨平台用户身份图谱
    三级匹配：邮箱 hash（确定性）→ IP fingerprint（概率）→ 行为模型
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2407.14521，但该号在 arXiv 上是《Towards Automated Functional Equation Proving: A Benchmark Dataset and A Domain-Specific In-Context Agent》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各渠道接口数据（Meta 广告洞察、TikTok 报表、Amazon Attribution、Shopify 订单 Webhook）与可用于拼接的身份字段（邮箱哈希、IP 与 UA 指纹、平台原始用户 id），粒度到单条广告事件与单笔订单。

**输出**：统一用户旅程与渠道归因结果（末次点击、线性、因果增量三类口径对照），供营销团队校正预算分配与评估渠道效率。

## 执行步骤

1. 接入各渠道的广告与订单数据
2. 用邮箱哈希与设备指纹做跨渠道身份拼接
3. 还原每个用户的完整触点旅程
4. 计算末次点击、线性与因果增量三类归因
5. 输出渠道归因对照表与预算调整建议

## 边界与不做

- 渠道没有开放接口或没有可拼接的身份标识时归因不完整（如无标准转化接口的种草平台）；只用单渠道数据时无需本技能。
- 本技能产出归因结果与建议，不做预算执行动作，也不保证因果估计在样本不足时稳定。

## 技能关联

- **前置**：Skill-LLM-Focused-Web-Crawling.html、Skill-LLM-Focused-Web-Crawling、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling
- **延伸**：Skill-DARA-Agentic-MMM.html、Skill-DARA-Agentic-MMM
- **可组合**：Skill-Data-Provenance-Lineage.html、Skill-Data-Provenance-Lineage、Skill-Procurement-Email-Extraction.html、Skill-Procurement-Email-Extraction、Skill-Marketing-Data-Pipeline

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：15-营销投放分析　·　源卡：`Skill-Marketing-Data-Pipeline`