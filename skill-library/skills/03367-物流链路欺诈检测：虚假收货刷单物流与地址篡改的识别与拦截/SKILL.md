---
name: "p2s-logistics-fraud-detection"
title: "Logistics Fraud Detection — 物流链路欺诈检测：虚假收货、刷单物流与地址篡改的识别与拦截"
description: "触发词：物流欺诈、未收货纠纷、拒付拦截、地址篡改、欺诈阈值。何时不用：需要从轨迹异常识别刷单与虚假签收特征时用物流轨迹欺诈信号；需要预测包裹破损概率时用包裹破损预测。安全边界：阈值须用标注数据定期校准以避免误伤正常买家；买家个人信息须按隐私法规最小化使用，拦截与拒付处置需保留人工申诉通道。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-059"
l3_business: "履约异常"
l3_all: "履约异常 / 售后处理"
l1_l2_l3: "业务运营/供应与履约/履约异常"
p2s_card_id: "Skill-Logistics-Fraud-Detection"
p2s_src_domain: "18-物流履约"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "识别未收货拒付、刷单物流与地址篡改，在发货前后拦截高风险订单，减少拒付损失。"
user_try: "试试：用我的订单轨迹和地址数据跑一遍欺诈检测，标出高风险订单并给出拦截与人工复核建议。"
whenToUse: "需要识别买家侧未收货欺诈、地址篡改与刷单物流并做拦截决策时用本技能；竞品刷单的轨迹特征提取用物流轨迹欺诈信号。"
workflow: "整理轨迹、地址与订单行为序列数据 → 运行轨迹异常、地址图与行为序列三类模型 → 按阈值分级输出拦截与放行建议 → 用标注数据定期校准阈值"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Logistics Fraud Detection — 物流链路欺诈检测：虚假收货、刷单物流与地址篡改的识别与拦截

## ① 解决的问题

"Item Not Received"（INR）欺诈是跨境母婴电商最常见的纠纷类型，占纠纷总量约 35%

## ② 核心算法逻辑

传统风控系统关注交易环节（支付欺诈、账号盗用），但物流链路中存在独特的欺诈模式，具有时序性（需要跟踪包裹生命周期）和图结构性（欺诈团伙共用地址/设备/收货网络）。物流欺诈检测的核心是：利用物流轨迹的时空异常、收货地址网络的拓扑特征和用户行为的序列模式，在包裹签收前后拦截欺诈行为。

## ③ 业务应用场景

业务背景："Item Not Received"（INR）欺诈是跨境母婴电商最常见的纠纷类型，占纠纷总量约 35%。欺诈者购买高价母婴商品（婴儿奶粉、高端推车），物流显示已签收后声称未收到，申请 PayPal/Stripe 拒付（Chargeback）。每次 Chargeback 除退款外还有 $15-25 的处理手续费，且影响支付通道评分。
LogisticsFD + AddressNet 应用：
量化 ROI：月均 800 笔高风险订单，原 INR 率 4.2%（约 33 笔），客单价 $150， 每笔 Chargeback 成本 $150 + $20 手续费；减少 57% 后：月节省约 $6,600

## ④ 输入数据要求

严格模式（大促期间高风险）：`RISK_THRESHOLD_HIGH = 0.55`
宽松模式（新市场冷启动）：`RISK_THRESHOLD_HIGH = 0.75`
建议每月用标注数据重新校准阈值，避免 False Positive 影响正常买家体验

## ⑤ 输出结果

严格模式（大促期间高风险）：`RISK_THRESHOLD_HIGH = 0.55`
宽松模式（新市场冷启动）：`RISK_THRESHOLD_HIGH = 0.75`
建议每月用标注数据重新校准阈值，避免 False Positive 影响正常买家体验

## ⑥ 业务价值 / ROI

月均 -$3,200

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（608 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/logistics/logistics_fraud_detection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/18-物流履约/Skill-Logistics-Fraud-Detection.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Logistics Fraud Detection
整合 LogisticsFD (时空轨迹异常) + AddressNet (地址图风险) + FraudSeq (行为序列)
母婴跨境电商场景 mock 实现，含完整测试
"""

from __future__ import annotations

import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set, Tuple
from collections import defaultdict
from enum import Enum
import math


# ── 数据模型 ─────────────────────────────────────────────────────────────

class FraudType(Enum):
    FAKE_DELIVERY = "fake_delivery"          # 虚假收货
    BRUSHING = "brushing"                    # 刷单
    ADDRESS_MANIPULATION = "address_manip"   # 地址篡改
    RETURN_FRAUD = "return_fraud"            # 退货欺诈


@dataclass
class LogisticsNode:
    """物流节点"""
    node_id: str
    node_type: str      # "origin", "hub", "last_mile", "destination"
    lat: float
    lng: float
    timestamp: float    # Unix 时间戳（秒）


@dataclass
class Order:
    """订单"""
    order_id: str
    user_id: str
    seller_id: str
    item_name: str
    declared_weight_kg: float
    price: float
    shipping_address_hash: str
    trajectory: List[LogisticsNode] = field(default_factory=list)
    # 行为事件序列
    events: List[dict] = field(default_factory=list)  # [{type, timestamp}, ...]
    actual_weight_kg: Optional[float] = None  # 实际揽收重量
    is_fraud: Optional[bool] = None  # 标签（用于评估）


# ── LogisticsFD：时空轨迹异常检测 ─────────────────────────────────────────

class TrajectoryAnomalyDetector:
    """
    基于物流轨迹的异常检测
    核心指标：skip_score, temporal_gap, geo_backtrack, weight_discrepancy
    """
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2309.14782，但该号在 arXiv 上是《Perturbative computation of thermal characteristics of the Stoner phase transition》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：订单物流轨迹数据（节点、时间戳、状态）、收件地址关系数据、订单行为序列与历史拒付标注结果。

**输出**：订单欺诈风险评分与类型判定（未收货欺诈、刷单物流、地址篡改）、拦截与人工复核建议及阈值配置，供风控与客服团队使用。

## 执行步骤

1. 整理轨迹、地址与订单行为序列数据
2. 运行轨迹异常、地址图与行为序列三类模型
3. 按阈值分级输出拦截与放行建议
4. 用标注数据定期校准阈值

## 边界与不做

- 何时不用：需要从轨迹物理约束识别竞品刷单证据时用物流轨迹欺诈信号；需要预测包裹破损时用包裹破损预测。
- 能力边界：输出风险评分与拦截建议，误判申诉与最终拒付裁定仍需人工处理。
- 数据边界：大促等高峰期需切换到更严格的阈值模式，新市场冷启动需放宽阈值，阈值须持续用标注数据校准。

## 技能关联

- **前置**：Skill-Cross-Border-Last-Mile-Routing.html、Skill-Cross-Border-Last-Mile-Routing、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **延伸**：Skill-Fake-Review-Detection.html、Skill-Fake-Review-Detection
- **可组合**：Skill-Click-Fraud-Detection.html、Skill-Click-Fraud-Detection、Skill-Returns-Reverse-Logistics.html、Skill-Returns-Reverse-Logistics、Skill-Logistics-Fraud-Detection

---

> 分类：业务运营/供应与履约/履约异常　·　技术族：18-物流履约　·　源卡：`Skill-Logistics-Fraud-Detection`