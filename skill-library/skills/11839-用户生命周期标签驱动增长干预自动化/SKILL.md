---
name: "p2s-tag-driven-user-growth-trigger"
title: "Tag-Driven User Growth Trigger — 用户生命周期标签驱动增长干预自动化"
description: "触发词：生命周期标签、状态机触发、沉睡召回、干预自动化、标签驱动增长。何时不用：标签口径尚未定义、需要先做标签体系时用标签工程类技能；本技能消费已定义好的状态标签。安全边界：宝宝出生日期属敏感个人信息须获明确同意并可随时撤回；同一用户 7 天内最多触发 1 次，内容不得含医疗建议。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 分群"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-Tag-Driven-User-Growth-Trigger"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "用户一进入新的生命周期阶段就自动触发对应的增长动作，把过去两天的人工判断变成实时响应。"
user_try: "试试：按『首购后 15-29 天无复购』和『沉睡 30-90 天』两套规则，输出本批需要触发的用户名单与干预动作。"
whenToUse: "状态标签已定义、需要决定触发哪套干预时用本技能；标签口径本身还没定稿，先做标签工程再回来。"
workflow: "接入购买时间戳、浏览行为、开率与出生日期等标签输入 → 按状态机规则判断用户当前生命周期状态 → 为每个状态匹配干预动作与渠道（Push、优惠码、外呼清单） → 套用冷却期与频次上限后输出触发名单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Tag-Driven User Growth Trigger — 用户生命周期标签驱动增长干预自动化

## ① 解决的问题

增长负责人面临"用户生命周期阶段变化无法实时触发对应增长干预"——状态机标签事件驱动将增长干预响应从2天手工决策压缩至实时触发，复购率提升23%，年化增收43万元

## ② 核心算法逻辑

本 Skill 将用户生命周期抽象为状态机标签（新客/活跃/沉睡/流失），利用标签状态转换事件自动触发对应的 Growth Action Pipeline，实现「标签变化即干预信号」的全自动增长运营。

## ③ 业务应用场景

场景A：新生儿家庭30天沉睡激活 - 业务问题：母婴用户首购后 30 天复购率仅 12%，生命周期价值（LTV）严重浪费 - 数据要求：用户购买时间戳、浏览行为、邮件/Push 开率、宝宝出生日期（如有） - 预期产出：「首购后15-29天无复购」触发标签转换 → 自动发送「宝宝成长阶段推荐」邮件序列 - 业务价值：30天复购率从 12% 提升至 23%，人均 LTV 增加 $38，年化新客 LTV 提升约 28 万元
三轨验证： - 成本：数据采集需埋点宝宝出生日期（需用户授权），邮件序列设计及自动化部署约 2 人月，单用户触发成本约 $0.03（邮件+Push） - 合规：需遵守 GDPR/CCPA，宝宝出生日期属于敏感个人信息，必须获得明确同意并支持随时撤回；邮件退订链接必须一键生效 - 风险：过度推送可能导致用户反感或投诉，需设置冷却期（同一用户7天内最多1次触发）；若邮件内容涉及「宝宝发育阶段」需避免医疗建议表述，防止法律风险
场景B：6个月沉睡用户精准召回 - 业务问题：沉睡用户占用户库 42%，营销预算浪费在无差别轰炸 - 数据要求：最近访问时间、历史购买品类、召回偏好（折扣敏感/内容敏感） - 预期产出：按「沉睡深度」分层触发：30-60天→Push，60-90天→优惠码，>90天→人工外呼清单 - 业务价值：沉睡召回率从 3% 提升至 11%，精准营销 ROI 提升 3.2 倍，年化节省无效营销支出约 15 万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：新客30天复购率 12%→23%，人均 LTV+$38，年化新客 LTV 提升约 28 万元；沉睡召回率 3%→11%，精准营销 ROI 提升 3.2 倍，年化节省无效营销支出约 15 万元，合计年化价值约 43 万元
实施难度：⭐⭐⭐☆☆（需要用户行为埋点完整，营销系统 API 接入）
优先级：⭐⭐⭐⭐⭐（用户生命周期管理是增长核心，立竿见影）
数据门槛：用户行为日志完整度 ≥95%，历史购买记录 ≥6 个月
风险：触发频率过高导致用户骚扰，需设置冷却期（同一用户7天内最多1次触发）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（226 行）。**下面 58 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，58 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/data_collection/tag_driven_user_growth_trigger` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Tag-Driven-User-Growth-Trigger.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Tag-Driven User Growth Trigger
用户生命周期标签状态机 + 增长干预自动触发

依赖：numpy, pandas
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import json


# ─── 1. 用户状态枚举 & 标签定义 ───────────────────────────────────────────────

LIFECYCLE_STATES = ["新客", "活跃", "沉睡风险", "沉睡", "流失", "VIP候选"]

TRANSITION_RULES = [
    # (当前状态, 条件描述, 触发条件函数, 目标状态)
    ("新客",     "首购后15天无复购",      lambda u: u["days_since_first_purchase"] >= 15 and u["purchase_count"] < 2, "沉睡风险"),
    ("活跃",     "60天未购买",            lambda u: u["days_since_last_purchase"] >= 60, "沉睡风险"),
    ("沉睡风险", "30天内未挽回",          lambda u: u["days_since_last_purchase"] >= 90, "沉睡"),
    ("沉睡",     "90天无任何访问",        lambda u: u["days_since_last_visit"] >= 90, "流失"),
    ("活跃",     "连续3月高消费",         lambda u: u["recent_3m_spend"] >= 500, "VIP候选"),
    ("沉睡风险", "触发重要事件后复购",    lambda u: u["purchase_count"] >= 2 and u["days_since_last_purchase"] < 7, "活跃"),
]

ACTION_MAP = {
    "沉睡风险": [
        {"channel": "email",  "template": "首购感谢+成长阶段推荐", "discount": "首单9折券"},
        {"channel": "push",   "template": "你关注的商品有新活动",  "discount": None},
    ],
    "沉睡": [
        {"channel": "email",  "template": "我们想念你",            "discount": "满200减40券"},
        {"channel": "sms",    "template": "专属召回礼包",          "discount": "8折优惠码"},
    ],
    "流失": [
        {"channel": "manual_call", "template": "人工客服挽回",     "discount": "最高7折"},
    ],
    "VIP候选": [
        {"channel": "email",  "template": "专属会员邀请",          "discount": "VIP会员权益包"},
    ],
}


# ─── 2. 数据结构 ──────────────────────────────────────────────────────────────

@dataclass
class UserProfile:
    user_id: str
    current_state: str
    purchase_count: int
    days_since_first_purchase: int
    days_since_last_purchase: int
    days_since_last_visit: int
    recent_3m_spend: float
    history_states: List[str] = field(default_factory=list)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2401.09823，但该号在 arXiv 上是《Enhancing Small Object Encoding in Deep Neural Networks: Introducing Fast&Focused-Net with Volume-wise Dot Product Layer》，与本卡主题无关。
⚠️ 该号被 7 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：用户级明细：购买时间戳、浏览行为、邮件/Push 开率、宝宝出生日期（如有授权）、最近访问时间、历史购买品类与召回偏好。要求行为日志完整度较高。

**输出**：状态机驱动的干预触发名单（用户、目标状态、干预动作、渠道）与触发统计；供营销自动化系统按批执行。

## 执行步骤

1. 接入用户行为与交易标签输入
2. 按状态机规则计算用户当前生命周期状态
3. 匹配各状态的干预动作与触达渠道
4. 套用冷却期与频次上限过滤名单
5. 输出本批触发清单与预期增量口径

## 边界与不做

- 用户行为埋点不完整或标签口径未定稿时不用本技能。
- 本技能输出触发规则与名单，不代替营销系统完成真实发送与外呼。
- 安全边界：出生日期等敏感信息须获授权且可随时撤回；推送内容不得出现医疗建议表述。

## 技能关联

- **前置**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-CC-OR-Net-LTV-Prediction.html、Skill-CC-OR-Net-LTV-Prediction、Skill-Human-in-Loop-Approval-Gate-Tag.html、Skill-Human-in-Loop-Approval-Gate-Tag、Skill-Predictive-Tag-Engine-Supply-Chain.html、Skill-Predictive-Tag-Engine-Supply-Chain、Skill-Tag-Driven-Marketing-Attribution.html、Skill-Tag-Driven-Marketing-Attribution、Skill-Tag-Schema-Engineering-Lifecycle.html、Skill-Tag-Schema-Engineering-Lifecycle
- **延伸**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-CC-OR-Net-LTV-Prediction.html、Skill-CC-OR-Net-LTV-Prediction、Skill-Human-in-Loop-Approval-Gate-Tag.html、Skill-Human-in-Loop-Approval-Gate-Tag、Skill-Tag-Driven-Marketing-Attribution.html、Skill-Tag-Driven-Marketing-Attribution
- **可组合**：Skill-Human-in-Loop-Approval-Gate-Tag.html、Skill-Human-in-Loop-Approval-Gate-Tag、Skill-Tag-Driven-Marketing-Attribution.html、Skill-Tag-Driven-Marketing-Attribution、Skill-Tag-Driven-User-Growth-Trigger

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：24-标签工程　·　源卡：`Skill-Tag-Driven-User-Growth-Trigger`