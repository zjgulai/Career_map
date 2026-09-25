---
name: "p2s-fraud-signal-collection"
title: "Fraud Signal Collection — 欺诈信号数据采集（刷单行为、虚假评论、异常流量）"
description: "触发词：欺诈信号采集、刷单识别、虚假评论、Bot流量、证据包整理。何时不用：事件已确认、要执行处置流程时走安全事件处理流程；只做评论情感分析时用情感 ML 管道技能。安全边界：采集只针对公开或已授权数据，不得侵入他人系统或获取个人信息，举报材料须基于可核验证据。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 安全事件处理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Fraud-Signal-Collection"
p2s_src_domain: "19-风控反欺诈"
quality_tier: "preview"
user_summary: "把刷单、假评论和异常流量的线索系统性收集起来，整理成能提交平台举报的证据包。"
user_try: "试试：采集这个竞品的刷单信号，整理成可提交品牌保护的证据包，并给出我们自己的防御监控规则。"
whenToUse: "怀疑存在刷单、虚假评论或机器人流量、需要先拿到证据时用本技能；事件已经明确、要执行处置流程，走安全事件处理流程。"
workflow: "确定监测对象与欺诈类型 → 采集订单、评论与会话层面的行为特征 → 计算欺诈得分并分级 → 汇总为可核验的信号包 → 提交平台并同步自身监控规则"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Fraud Signal Collection — 欺诈信号数据采集（刷单行为、虚假评论、异常流量）

## ① 解决的问题

风控分析师面临欺诈线索散乱——欺诈信号采集将线索覆盖率提38%，年化省12万元

## ② 核心算法逻辑

欺诈检测系统的核心上限由欺诈信号采集的覆盖度和质量决定。母婴电商面临的三类典型欺诈：

## ③ 业务应用场景

业务背景：品牌 A 的婴儿安全座椅 BSR 被竞品 B 通过刷单超越，损失 Buy Box 和自然流量。需要采集竞品 B 的刷单信号，向 Amazon 品牌保护部门举报，并建立自身防御监控。
行动成果： - 将采集的欺诈信号包（PDF报告 + 原始数据）提交 Amazon 品牌保护 - 竞品 B 的 68 条虚假评论被删除，BSR 下滑 - 品牌 A 恢复 Buy Box，月均 GMV 回升 +¥48 万
业务背景：DTC 独立站发现 Meta 广告 CTR 异常偏高（3.8%，正常 1.2%），但转化率极低（0.03%），怀疑存在大量 Bot 点击消耗广告预算。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

48 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（443 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：5」并记录位置 `paper2skills-code/risk_fraud/fraud_signal_collection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/19-风控反欺诈/Skill-Fraud-Signal-Collection.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Fraud Signal Collection Pipeline
整合 FraudGraph-Collect (刷单图特征) + ReviewSignal (虚假评论) + BotTrafficDetect (Bot流量)
使用 mock 数据，可直接运行
"""

import re
import math
import random
import hashlib
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple, Set
from datetime import datetime, timedelta
from collections import defaultdict


# ── 数据结构 ────────────────────────────────────────────────────────────

@dataclass
class OrderRecord:
    """订单记录"""
    order_id: str
    user_id: str
    device_fp: str       # 设备指纹
    ip_addr: str
    shipping_addr: str   # 标准化收货地址
    order_time: datetime
    review_time: Optional[datetime]  # 评论时间（若有）
    review_text: str
    rating: int


@dataclass
class SessionRecord:
    """会话记录（用于 Bot 检测）"""
    session_id: str
    ip_addr: str
    user_agent: str
    page_view_count: int
    dwell_time_sec: float      # 总停留时间
    mouse_events: int          # 鼠标事件数
    scroll_depth_pct: float    # 滚动深度（0-100%）
    request_interval_cv: float # 请求间隔变异系数
    asn_type: str              # residential / datacenter / vpn


@dataclass
class FraudSignal:
    """欺诈信号汇总"""
    entity_id: str
    entity_type: str            # order / review / session
    fraud_score: float          # 0-1
    fraud_type: str             # order_fraud / fake_review / bot_traffic
    signals: Dict[str, float]   # 各维度信号值
    is_fraud: bool
    confidence: str             # HIGH / MEDIUM / LOW


# ── FraudGraph-Collect：刷单行为特征采集 ────────────────────────────────
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.14891，但该号在 arXiv 上是《Generate-then-Ground in Retrieval-Augmented Generation for Multi-hop Question Answering》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：订单记录（订单号、用户、设备指纹、IP、收货地址、评论、评分）与会话记录（页面浏览数、停留时长、鼠标事件、滚动深度、请求间隔变异系数、网络类型）等行为数据，粒度到单条订单与单次会话。

**输出**：结构化欺诈信号（实体 id、欺诈类型、欺诈得分、是否判定为欺诈、置信级别）与证据包，供品牌保护举报与自建风控监控使用。

## 执行步骤

1. 确定监测对象与要识别的欺诈类型
2. 采集订单、评论与会话维度的行为特征
3. 计算欺诈得分并给出高、中、低置信分级
4. 汇总成含原始数据的证据包
5. 提交平台并沉淀自身监控规则

## 边界与不做

- 拿不到订单、会话等行为数据时无法计算得分；只有主观怀疑、没有可核验数据支撑的场景不适用。
- 本技能只做信号采集与证据整理，不执行账号处置，也不保证平台一定采纳举报结论。

## 技能关联

- **前置**：Skill-Clickstream-Persona-Pipeline.html、Skill-Clickstream-Persona-Pipeline、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **延伸**：Skill-Fake-Review-Detection.html、Skill-Fake-Review-Detection
- **可组合**：Skill-Data-Provenance-Lineage.html、Skill-Data-Provenance-Lineage、Skill-Review-Dedup-Quality-Filter.html、Skill-Review-Dedup-Quality-Filter、Skill-Fraud-Signal-Collection

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：19-风控反欺诈　·　源卡：`Skill-Fraud-Signal-Collection`