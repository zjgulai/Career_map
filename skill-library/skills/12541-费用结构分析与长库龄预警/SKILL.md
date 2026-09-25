---
name: "p2s-fba-fee-intelligence"
title: "FBA Fee Intelligence（FBA 费用结构分析与长库龄预警）"
description: "触发词：FBA 费用分析、长库龄预警、五层费用拆解、费用率异常、LTSF 预警。何时不用：要看费用瀑布各层占比并锁定高费用集群用「FBA 费用瀑布归因」；要算库存持有全口径成本与 EOQ 用「库存持有成本模型」。安全边界：费用率与预警阈值须与最新平台费率表核对，不能据本卡结论直接清货或移仓。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-120"
l3_business: "收入与费用核对"
l3_all: "收入与费用核对 / 差异追踪 / 生命周期分析"
l1_l2_l3: "业务运营/财务与合规/收入与费用核对"
p2s_card_id: "Skill-FBA-Fee-Intelligence"
p2s_src_domain: "23-运营财务"
quality_tier: "preview"
user_summary: "把每月 FBA 账单拆到 ASIN 粒度，提前预警长库龄与超额费用，告诉你哪些 SKU 该清仓或减少备货。"
user_try: "试试：拉本月 FBA 库存报告，按 ASIN 算仓储费和长库龄费占比，标出费用率超过 25% 和接近 LTSF 的 SKU 并给处理建议。"
whenToUse: "要把 FBA 账单拆到 ASIN 并对长库龄做提前预警时用本技能；看费用在瀑布各层的占比与高费用集群用「FBA 费用瀑布归因」；把资金占用与持有成本纳入决策用「库存持有成本模型」。"
workflow: "从 Amazon SP API 拉取 GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA 报告 → 逐 ASIN 计算五层费用结构 → 识别费用率高于 25% GMV 的异常 SKU，行业健康值为 15% 以下 → 触发长库龄预警并生成清仓或转 FBM 建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# FBA Fee Intelligence（FBA 费用结构分析与长库龄预警）

## ① 解决的问题

FBA 月账单 15 万元但不知道哪些 SKU 费用异常——五层费用拆解（头程/仓储/长库龄/移仓/退货）到 SKU 粒度，长库龄 270 天提前预警，年化减少 LTSF 5-20 万元

## ② 核心算法逻辑

论文：Inventory Cost Attribution via MultiLayer Fee Decomposition for ECommerce Fulfillment | 年份：2021

## ③ 业务应用场景

业务痛点：某母婴品牌月度 FBA 账单 15 万元，但不知道哪些 SKU 的费用占比异常高。人工核查需要 2-3 天，等发现长库龄时已经产生了 LTSF。
应用流程： 1. 从 Amazon SP API 拉取 `GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA` 报告 2. 逐 ASIN 计算五层费用结构 3. 识别费用率 > 25% GMV 的异常 SKU（行业健康值 < 15%） 4. 触发长库龄预警，生成清仓/转 FBM 建议
典型发现： - 婴儿推车（大件）：仓储费占 GMV 18%，高于均值 → 建议减少 FBA 库存深度，改用第三方仓调拨 - 奶嘴套装（滞销）：库龄 310 天，预计 55 天后触发 LTSF → 立即以成本价清仓，避免 LTSF 2400 元/月

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

5-20 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（62 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/growth_model/fba_fee_intelligence` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/23-运营财务/Skill-FBA-Fee-Intelligence.md`），已与卡面节选核对，不依赖上述路径。

```python
from dataclasses import dataclass
from datetime import date

@dataclass
class FBAInventoryRecord:
    asin: str
    sku: str
    units: int
    cubic_feet: float
    days_in_storage: int
    price: float
    monthly_units_sold: int

def compute_fba_fees(rec: FBAInventoryRecord, is_peak_season: bool = False) -> dict:
    storage_rate = 2.40 if is_peak_season else 0.87
    monthly_storage = rec.cubic_feet * rec.units * storage_rate

    ltsf = 0.0
    if rec.days_in_storage > 365:
        ltsf = rec.cubic_feet * rec.units * 6.90

    monthly_revenue = rec.price * rec.monthly_units_sold
    total_fee = monthly_storage + ltsf
    fee_pct = (total_fee / monthly_revenue * 100) if monthly_revenue > 0 else 0.0

    alert = "green"
    if rec.days_in_storage > 330:
        alert = "red"
    elif rec.days_in_storage > 270:
        alert = "orange"
    elif fee_pct > 25:
        alert = "yellow"

    return {
        "asin": rec.asin,
        "monthly_storage_fee": round(monthly_storage, 2),
        "ltsf": round(ltsf, 2),
        "total_fee_cny": round(total_fee * 7.2, 0),
        "fee_pct_of_revenue": round(fee_pct, 1),
        "days_in_storage": rec.days_in_storage,
        "alert": alert,
        "recommendation": (
            "立即移仓或清仓" if alert == "red" else
            "预警: 90天内触发LTSF，建议清仓" if alert == "orange" else
            "费用率偏高，检查定价或减少备货" if alert == "yellow" else
            "健康"
        ),
    }

inventory = [
    FBAInventoryRecord("B08XY", "PUMP-S1", 200, 0.5, 45,  89.99, 150),
    FBAInventoryRecord("B09AB", "CART-L1",  50, 8.0, 310, 299.99,  10),
    FBAInventoryRecord("B07CD", "NIPP-S3", 500, 0.1, 340,  12.99,   5),
]
print(f"{'ASIN':<8} {'天数':>5} {'仓储费$':>8} {'LTSF$':>7} {'费率%':>6} {'状态':<8} 建议")
print("-" * 75)
for rec in inventory:
    r = compute_fba_fees(rec)
    print(f"{r['asin']:<8} {r['days_in_storage']:>5} {r['monthly_storage_fee']:>8} "
          f"{r['ltsf']:>7} {r['fee_pct_of_revenue']:>6} {r['alert']:<8} {r['recommendation']}")
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.08947，但该号在 arXiv 上是《Integrals of differences of subharmonic functions. I. An integral inequality with Nevanlinna characteristic and modulus of continuity of measure》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《Inventory Cost Attribution via MultiLayer Fee Decomposition for ECommerce Fulfillment》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：Amazon SP API 库存报告 GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA，字段含 ASIN 与 SKU、在库件数、体积（立方英尺）、库龄天数、售价与月销量，粒度到 ASIN 与 SKU。

**输出**：每 ASIN 的月仓储费、长库龄费、费用占收入比例、库龄天数与红黄绿预警状态，附立即移仓、清仓或减少备货的处理建议，供运营与库存计划调整。

## 执行步骤

1. 拉取 FBA 库存报告并逐 ASIN 汇总在库件数、体积与库龄
2. 计算五层费用结构与费用占收入比
3. 标记费用率超过 25% GMV 的异常 SKU
4. 按库龄与费用率给出清仓、移仓或减少备货的建议

## 边界与不做

- 报告缺失体积或库龄字段时无法计算费用率与长库龄预警，数据不满足即不适用
- 只做费用归因与预警，不执行清仓、移仓或调价动作
- 费率与旺季系数须与最新平台费率表核对，跨站点不能套用同一套参数

## 技能关联

- **前置**：Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-Inventory-Health-Aging-Attribution.html、Skill-Inventory-Health-Aging-Attribution、Skill-Markdown-Optimization.html、Skill-Markdown-Optimization、Skill-Multi-Channel-Inventory-Pooling.html、Skill-Multi-Channel-Inventory-Pooling、Skill-PL-Attribution-Analysis.html、Skill-PL-Attribution-Analysis
- **延伸**：Skill-PL-Attribution-Analysis.html、Skill-PL-Attribution-Analysis
- **可组合**：Skill-Markdown-Optimization.html、Skill-Markdown-Optimization、Skill-Multi-Channel-Inventory-Pooling.html、Skill-Multi-Channel-Inventory-Pooling、Skill-PL-Attribution-Analysis.html、Skill-PL-Attribution-Analysis、Skill-FBA-Fee-Intelligence

---

> 分类：业务运营/财务与合规/收入与费用核对　·　技术族：23-运营财务　·　源卡：`Skill-FBA-Fee-Intelligence`