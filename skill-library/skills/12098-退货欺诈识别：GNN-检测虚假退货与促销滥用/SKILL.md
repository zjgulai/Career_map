---
name: "p2s-return-fraud-detection"
title: "Return Fraud Detection — 退货欺诈识别：GNN 检测虚假退货与促销滥用"
description: "触发词：退货欺诈、异常退货率、账号关联、地址聚类、虚假损坏。何时不用：促销券套利与批量注册小号走「促销欺诈检测」；支付环节盗刷的单笔拦截走「异常交易检测」。安全边界：只输出风险评分与证据线索，不代替平台做拒绝退货或封号决定；收货地址与设备指纹须脱敏并限内部风控使用。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-136"
l3_business: "安全事件处理"
l3_all: "安全事件处理 / 退货分流"
l1_l2_l3: "独立控制/数据与AI运行/安全事件处理"
p2s_card_id: "Skill-Return-Fraud-Detection"
p2s_src_domain: "19-风控反欺诈"
quality_tier: "preview"
user_summary: "退货率高得反常却查不出原因时，从账号共享的地址和设备入手，找出有组织的欺诈退货团伙。"
user_try: "试试：这款推车退货率 18% 但质检合格率 99.5%，帮我从退货账号里找出可能是团伙的集群。"
whenToUse: "当退货率显著高于品类均值、怀疑有组织欺诈时用；若损失来自优惠券或新客补贴被套取，用「促销欺诈检测」；若是支付环节盗刷需要毫秒级拦截，用「异常交易检测」。"
workflow: "整理退货订单明细与账号历史退货行为 → 按账号聚合退货率、高价品退货、促销后短期退货等信号 → 用共享地址与设备指纹构建账号关联图谱 → 输出欺诈风险评分并圈出关联集群 → 生成高风险账号清单与举报、审核建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Return Fraud Detection — 退货欺诈识别：GNN 检测虚假退货与促销滥用

## ① 解决的问题

某款299美元婴儿推车退货率18%但工厂QC合格率99.5%怀疑有组织欺诈却无法证明——账号关联图谱识别共享地址设备的欺诈团伙，拦截30-50%欺诈退货年化节省10-40万元

## ② 核心算法逻辑

退货欺诈的三大模式：

## ③ 业务应用场景

业务问题：某款 $299 婴儿推车连续三个月退货率 18%，远高于品类均值 6%。退货原因几乎都是"产品损坏收到"——但工厂QC合格率 99.5%。怀疑有组织化欺诈但无法证明。
数据要求： - 退货订单明细（账号ID/收货地址/退货原因/退货时间） - 账号历史行为（该账号历史订单总数/退货总数/退货率） - 设备指纹（如有）或 IP 地址
预期产出： - 欺诈账号风险评分（0-1） - 账号关联图谱（可视化共享地址/设备的账号集群） - 高风险账号列表（建议拒绝退货申请/拉黑/向 Amazon 举报）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
识别并拦截 30-50% 欺诈退货：月节省 ¥3-10 万（高价母婴品）
减少货损（欺诈退货货损率 80%+）：年化节省 ¥5-20 万
向 Amazon 提供欺诈证据改善账号健康度
年化综合 ROI：¥10-40 万
实施难度：⭐⭐☆☆☆（规则+图特征版 2 周实现；需要退货数据权限；完整 GNN 版约 4-6 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（170 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/risk_fraud/return_fraud_detection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/19-风控反欺诈/Skill-Return-Fraud-Detection.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Return Fraud Detection
基于规则 + 图特征的退货欺诈识别模型
"""
import numpy as np
from collections import defaultdict
from dataclasses import dataclass
from typing import Optional


@dataclass
class ReturnRecord:
    order_id: str
    account_id: str
    product_price: float
    return_reason: str
    return_days_after_purchase: int
    address_id: str
    device_fingerprint: Optional[str] = None


# 欺诈风险规则（启发式）
FRAUD_SIGNALS = {
    'high_return_rate': 0.25,          # 账号退货率超 25%
    'luxury_product_return': 0.20,     # 高价品（>$100）退货
    'post_promo_return': 0.15,         # 促销结束后 3 天内退货
    'address_hopping': 0.20,           # 近 30 天更换过收货地址
    'damage_claim_pattern': 0.10,      # 退货原因为"损坏/缺件"
    'repeat_account': 0.10,            # 该账号曾有欺诈记录
}


def compute_account_stats(records: list[ReturnRecord]) -> dict:
    """统计各账号的退货行为特征"""
    account_stats = defaultdict(lambda: {
        'total_orders': 0, 'total_returns': 0,
        'return_rate': 0.0, 'addresses': set(),
        'high_value_returns': 0, 'damage_claims': 0,
        'post_promo_returns': 0,
    })

    # 模拟订单数量（实际需从订单数据库获取）
    account_order_counts = defaultdict(lambda: np.random.randint(3, 30))

    for r in records:
        stats = account_stats[r.account_id]
        stats['total_returns'] += 1
        stats['addresses'].add(r.address_id)
        if r.product_price > 100:
            stats['high_value_returns'] += 1
        if 'damage' in r.return_reason.lower() or 'broken' in r.return_reason.lower():
            stats['damage_claims'] += 1
        if r.return_days_after_purchase <= 3:
            stats['post_promo_returns'] += 1

    for account_id, stats in account_stats.items():
        total_orders = account_order_counts[account_id]
        stats['total_orders'] = total_orders
        stats['return_rate'] = stats['total_returns'] / max(total_orders, 1)
        stats['address_count'] = len(stats['addresses'])
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2408.09812，但该号在 arXiv 上是《Magnetic exchange interaction in spin-valve with chiral spin-triplet superconductor》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：需退货订单明细（账号 ID、收货地址、退货原因、退货时间）、账号历史行为（订单总数、退货总数、退货率）、设备指纹或 IP，按账号粒度关联。

**输出**：产出账号级欺诈风险评分（0-1）、账号关联图谱（共享地址与设备的集群）、高风险账号清单与处置建议（拒绝退货、拉黑、向平台举报）。

## 执行步骤

1. 汇总退货订单明细与账号历史行为，计算各账号退货率
2. 打上高价品退货、促销后短期退货、地址更换等欺诈信号
3. 构建账号关联图谱，串联共享地址与设备指纹的账号
4. 输出账号欺诈风险评分并圈出强关联集群
5. 输出高风险账号清单与拒绝退货、举报等建议

## 边界与不做

- 退货率正常或退货原因集中在产品质量问题时，应先做质量根因分析而不是欺诈识别
- 只做评分与关联图谱，不解锁退货权限也不封号，处置由平台或人工执行
- 地址与设备指纹属个人信息，仅限内部风控使用，不得外传或用于营销

## 技能关联

- **前置**：Skill-Account-Association-Risk-Detection.html、Skill-Account-Association-Risk-Detection、Skill-Cross-Border-Payment-Fraud-Detection.html、Skill-Cross-Border-Payment-Fraud-Detection、Skill-Logistics-Cost-PL-Attribution.html、Skill-Logistics-Cost-PL-Attribution、Skill-PromoGuardian-Promotion-Fraud-GNN.html、Skill-PromoGuardian-Promotion-Fraud-GNN、Skill-Returns-Reverse-Logistics.html、Skill-Returns-Reverse-Logistics、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection、Skill-VOC-Returns-Cost-Driver.html、Skill-VOC-Returns-Cost-Driver
- **延伸**：Skill-Cross-Border-Payment-Fraud-Detection.html、Skill-Cross-Border-Payment-Fraud-Detection、Skill-Logistics-Cost-PL-Attribution.html、Skill-Logistics-Cost-PL-Attribution、Skill-PromoGuardian-Promotion-Fraud-GNN.html、Skill-PromoGuardian-Promotion-Fraud-GNN、Skill-Returns-Reverse-Logistics.html、Skill-Returns-Reverse-Logistics、Skill-VOC-Returns-Cost-Driver.html、Skill-VOC-Returns-Cost-Driver
- **可组合**：Skill-Cross-Border-Payment-Fraud-Detection.html、Skill-Cross-Border-Payment-Fraud-Detection、Skill-Logistics-Cost-PL-Attribution.html、Skill-Logistics-Cost-PL-Attribution、Skill-VOC-Returns-Cost-Driver.html、Skill-VOC-Returns-Cost-Driver、Skill-Return-Fraud-Detection

---

> 分类：独立控制/数据与AI运行/安全事件处理　·　技术族：19-风控反欺诈　·　源卡：`Skill-Return-Fraud-Detection`