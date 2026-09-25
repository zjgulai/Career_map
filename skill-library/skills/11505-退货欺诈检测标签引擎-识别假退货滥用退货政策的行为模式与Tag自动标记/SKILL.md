---
name: "p2s-return-fraud-detection-tag-engine"
title: "退货欺诈检测标签引擎 — 识别假退货/滥用退货政策的行为模式与Tag自动标记"
description: "触发词：退货欺诈、薅退滥用、欺诈评分、高风险退货标记、退货自动审核。何时不用：正常退货的品质定级用「退货品质分级引擎」，退货原因文本归因用「VOC退货成本驱动因子」。安全边界：欺诈评分只作人工核查线索，不得单独作为拒绝消费者退货的依据，须保留申诉通道。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-060"
l3_business: "退货分流"
l3_all: "退货分流 / 售后处理"
l1_l2_l3: "业务运营/供应与履约/退货分流"
p2s_card_id: "Skill-Return-Fraud-Detection-Tag-Engine"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "从客户退货行为里找出异常的薅退模式，自动打标转人工核查，减少被恶意退货吃掉的利润。"
whenToUse: "与相邻售后处理技能的边界：本技能负责退货环节的行为欺诈识别与打标；退货件到手后的品质定级与再售分流走退货品质分级类技能。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 退货欺诈检测标签引擎 — 识别假退货/滥用退货政策的行为模式与Tag自动标记

## ① 解决的问题

逆向物流面临"退货欺诈占总退货3-8%无法识别"——多维行为特征检测自动标记高风险退货，停止自动批准，年化减少欺诈损失2万元

## ② 核心算法逻辑

退货欺诈（Return Fraud） 是电商卖家的隐性成本杀手。主要模式：

## ③ 业务应用场景

（卡页此段是占位串，未承载业务场景；可读的落地口径见下方「执行步骤」与「输入 / 输出契约」。）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：欺诈退货通常占总退货量的3-8%，以年退货额50万元计算，每减少欺诈1% = 节省5,000元；暂停高风险退货自动批准，通过人工核查减少欺诈损失约2万元/年
实施难度：⭐⭐⭐☆☆（需要客户历史行为数据，主要是特征工程）
优先级评分：⭐⭐⭐⭐☆（德国/美国退货欺诈问题日益严重，平台（Amazon）要求卖家自行管控）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（103 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/return_fraud_detection_tag_engine` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Return-Fraud-Detection-Tag-Engine.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
退货欺诈检测标签引擎
功能：多维度行为特征提取 / 欺诈评分 / Tag生成 / 自动审核建议
"""
import numpy as np
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')


@dataclass
class ReturnRequest:
    request_id: str
    customer_id: str
    sku_id: str
    order_date: datetime
    return_date: datetime
    claimed_reason: str
    return_weight_kg: float
    original_weight_kg: float
    order_value_usd: float
    account_age_days: int
    customer_return_count_30d: int
    customer_complaint_count_30d: int
    tags: dict = field(default_factory=dict)


def compute_fraud_score(req: ReturnRequest) -> dict:
    signals = []
    score = 0.0

    # 信号1：高频退货
    if req.customer_return_count_30d >= 5:
        score += 0.35
        signals.append(f"高频退货({req.customer_return_count_30d}次/30天)")
    elif req.customer_return_count_30d >= 3:
        score += 0.20
        signals.append(f"频繁退货({req.customer_return_count_30d}次/30天)")

    # 信号2：重量异常
    weight_ratio = req.return_weight_kg / max(0.01, req.original_weight_kg)
    if weight_ratio < 0.75:
        score += 0.30
        signals.append(f"重量异常({weight_ratio:.0%}，疑似空包)")
    elif weight_ratio < 0.90:
        score += 0.15
        signals.append(f"重量偏低({weight_ratio:.0%})")

    # 信号3：新账号+高价值退货
    if req.account_age_days < 30 and req.order_value_usd > 100:
        score += 0.25
        signals.append(f"新账号({req.account_age_days}天)+高价值(${req.order_value_usd:.0f})")

    # 信号4：频繁投诉
    if req.customer_complaint_count_30d >= 3:
        score += 0.15
        signals.append(f"投诉频繁({req.customer_complaint_count_30d}次/30天)")

    # 信号5：使用周期末退货（季节性）
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2309.09823，但该号在 arXiv 上是《Integration of Quantum, Statistical, and Irreversible Thermodynamics in A Coherent Framework》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：客户历史行为与退货记录（退货频次、退货原因、退款金额、下单与退货时间间隔等行为特征）；客户×订单粒度。

**输出**：每条退货的多维行为特征与欺诈评分、高风险 Tag 与自动审核建议（是否转人工核查），输出给售后审核人员调整自动批准策略。

## 执行步骤

1. 提取客户退货行为的多维特征。
2. 计算每条退货的欺诈评分。
3. 对超阈值退货生成高风险 Tag 与人工核查建议。
4. 汇总标注结果，调整高风险退货的自动批准策略。

## 边界与不做

- 何时不用：没有客户历史行为数据，或只需判断退货商品品相时，不适用本技能。
- 能力边界：欺诈判定是概率性线索，须人工复核确认；缺少长期客户行为数据时评分可靠性明显下降。

## 技能关联

- **前置**：Skill-Cross-Border-Return-Rate-By-Country-KPI.html、Skill-Cross-Border-Return-Rate-By-Country-KPI、Skill-Predictive-Tag-Engine-Supply-Chain.html、Skill-Predictive-Tag-Engine-Supply-Chain、Skill-Return-Root-Cause-Attribution-Graph.html、Skill-Return-Root-Cause-Attribution-Graph、Skill-Returnformer-Returns-Prediction.html、Skill-Returnformer-Returns-Prediction、Skill-Reverse-Logistics-Disposition-Optimization.html、Skill-Reverse-Logistics-Disposition-Optimization
- **延伸**：Skill-Cross-Border-Return-Rate-By-Country-KPI.html、Skill-Cross-Border-Return-Rate-By-Country-KPI、Skill-Predictive-Tag-Engine-Supply-Chain.html、Skill-Predictive-Tag-Engine-Supply-Chain、Skill-Return-Root-Cause-Attribution-Graph.html、Skill-Return-Root-Cause-Attribution-Graph、Skill-Reverse-Logistics-Disposition-Optimization.html、Skill-Reverse-Logistics-Disposition-Optimization
- **可组合**：Skill-Cross-Border-Return-Rate-By-Country-KPI.html、Skill-Cross-Border-Return-Rate-By-Country-KPI、Skill-Predictive-Tag-Engine-Supply-Chain.html、Skill-Predictive-Tag-Engine-Supply-Chain、Skill-Reverse-Logistics-Disposition-Optimization.html、Skill-Reverse-Logistics-Disposition-Optimization、Skill-Return-Fraud-Detection-Tag-Engine

---

> 分类：业务运营/供应与履约/退货分流　·　技术族：24-标签工程　·　源卡：`Skill-Return-Fraud-Detection-Tag-Engine`