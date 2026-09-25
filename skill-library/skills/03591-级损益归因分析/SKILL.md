---
name: "p2s-pl-attribution-analysis"
title: "P&L Attribution Analysis（SKU 级损益归因分析）"
description: "触发词：损益归因、四层拆解、亏损 SKU、广告归因修正、预算转移。何时不用：要按费用层级做瀑布并锁定高费用集群用「ASIN 盈利瀑布」；要算广告费对净利率的归因用「广告 TACoS 与 P&L 集成」。安全边界：广告归因份额属假设参数，须标注并做敏感性；结论用于内部策略，不对外披露单 SKU 成本结构。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-016"
l3_business: "经济性分析"
l3_all: "经济性分析 / 差异追踪"
l1_l2_l3: "经营管理/财务与合规/经济性分析"
p2s_card_id: "Skill-PL-Attribution-Analysis"
p2s_src_domain: "23-运营财务"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把利润拆成毛利、运营利润和净利润四层，找出拖累整体的亏损 SKU，并把预算转给高利润款。"
user_try: "试试：拆解吸奶器、推车和奶粉款的四层利润率，找出亏损 SKU 并给出预算转移建议。"
whenToUse: "需要按四层口径归因并定位亏损 SKU 时用本技能；按费用层级做瀑布分析用「ASIN 盈利瀑布」；广告费归因用「广告 TACoS 与 P&L 集成」。"
workflow: "录入各 SKU 的收入、COGS、头程、平台佣金率、FBA 费、广告费与退货成本 → 逐层算出毛利、运营利润与净利润 → 按广告归因份额做因果修正得到调整后利润 → 标记亏损与微利 SKU 并给出预算转移建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# P&L Attribution Analysis（SKU 级损益归因分析）

## ① 解决的问题

月度总利润率 18% 但不知道是哪个 SKU 在拖累整体——P&L 四层拆解（毛利/运营/净利/因果归因修正）识别亏损 SKU，停止无效广告投放年节省 10-30 万元

## ② 核心算法逻辑

论文：Causal Attribution for Profit & Loss Decomposition in ECommerce | 年份：2021

## ③ 业务应用场景

业务痛点：某母婴品牌月度总利润率看起来 18%，但不知道是哪些 SKU 在拉高还是拖低。吸奶器主力款和配件款的真实利润完全不清楚。
分析结论示例： | SKU | 毛利率 | 运营利润率 | 净利润率 | 状态 | |-----|--------|-----------|---------|------| | 吸奶器 S1 主机 | 52% | 24% | 19% | ✅ 核心利润源 | | 吸奶器配件包 | 61% | 38% | 31% | ✅ 高利润，低广告依赖 | | 婴儿推车 L1 | 38% | 8% | 2% | ⚠️ 高运费侵蚀利润 | | 奶粉定制款 | 28% | -5% | -12%| ❌ 广告费过高，亏损 |
决策：停止奶粉定制款广告投放，将预算转移到配件包；推车单独计算物流方案。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

10-30 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（56 行）。**下面 56 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **56 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，56 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/growth_model/pl_attribution_analysis` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/23-运营财务/Skill-PL-Attribution-Analysis.md`），已与卡面节选核对，不依赖上述路径。

```python
from dataclasses import dataclass

@dataclass
class SKUPLData:
    sku: str
    revenue: float
    cogs: float
    head_haul: float
    platform_commission_pct: float
    fba_fee: float
    ad_spend: float
    return_cost: float
    fx_adjustment: float = 0.0
    ad_attribution_fraction: float = 1.0

def compute_pl(d: SKUPLData) -> dict:
    gross_profit = d.revenue - d.cogs - d.head_haul
    platform_fee = d.revenue * d.platform_commission_pct
    operating_profit = gross_profit - platform_fee - d.fba_fee - d.ad_spend
    net_profit = operating_profit - d.return_cost + d.fx_adjustment

    causal_ad_revenue = d.ad_spend / max(d.ad_attribution_fraction, 0.01) * d.ad_attribution_fraction
    naive_ad_revenue  = d.ad_spend / max(d.ad_attribution_fraction, 0.01)
    attribution_adj   = -(naive_ad_revenue - causal_ad_revenue)
    adjusted_profit   = net_profit + attribution_adj

    def pct(v):
        return round(v / d.revenue * 100, 1) if d.revenue else 0.0

    status = "盈利" if adjusted_profit > 0 else "亏损"
    if pct(adjusted_profit) < 5 and adjusted_profit > 0:
        status = "微利"

    return {
        "sku": d.sku, "revenue": d.revenue,
        "gross_margin": pct(gross_profit),
        "operating_margin": pct(operating_profit),
        "net_margin": pct(net_profit),
        "adjusted_margin": pct(adjusted_profit),
        "status": status,
    }

skus = [
    SKUPLData("吸奶器S1", 100000, 28000, 5000, 0.15, 3000, 8000, 2000,  0,   0.85),
    SKUPLData("配件包",   30000,  8000, 1500, 0.15,  800, 1500,  500,  0,   0.95),
    SKUPLData("婴儿推车", 50000, 22000, 7000, 0.15, 4000, 5000, 3000,  0,   0.80),
    SKUPLData("奶粉定制", 20000, 10000, 2000, 0.15, 1500, 8000,  800,  0,   0.60),
]
print(f"{'SKU':<10} {'毛利%':>7} {'运营%':>7} {'净利%':>7} {'归因调整%':>9} {'状态'}")
print("-" * 55)
for s in skus:
    r = compute_pl(s)
    print(f"{r['sku']:<10} {r['gross_margin']:>7} {r['operating_margin']:>7} "
          f"{r['net_margin']:>7} {r['adjusted_margin']:>9} {r['status']}")

print("\n[✓] P&L Attribution Analysis 测试通过")
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.07715，但该号在 arXiv 上是《How to Test the Randomness from the Wireless Channel for Security?》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《Causal Attribution for Profit & Loss Decomposition in ECommerce》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：SKU 级数据：收入、COGS、头程、平台佣金率、FBA 费、广告费、退货成本与汇兑调整，可选广告归因份额参数。

**输出**：每个 SKU 的毛利率、运营利润率、净利润率与归因调整后利润率及状态标签，用于找出亏损 SKU 并调整投放预算。

## 执行步骤

1. 录入各 SKU 的收入与各项成本
2. 逐层计算毛利、运营利润与净利润
3. 按广告归因份额修正后得到调整后利润
4. 标注亏损与微利 SKU
5. 输出预算转移与物流方案优化建议

## 边界与不做

- 广告归因份额或退货成本口径缺失时不适用，调整后利润会被高估或低估
- 只做归因与建议，不自动调整广告预算或停售 SKU
- 单 SKU 成本结构属敏感信息，结论只作内部使用，不对外披露

## 技能关联

- **前置**：Skill-Causal-Attribution-Bridge.html、Skill-Causal-Attribution-Bridge、Skill-Compliant-Dynamic-Pricing-Guard.html、Skill-Compliant-Dynamic-Pricing-Guard、Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-FBA-Fee-Intelligence.html、Skill-FBA-Fee-Intelligence、Skill-HTS-Tariff-Classification.html、Skill-HTS-Tariff-Classification、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Temu-Consignment-Analytics.html、Skill-Temu-Consignment-Analytics
- **延伸**：Skill-Compliant-Dynamic-Pricing-Guard.html、Skill-Compliant-Dynamic-Pricing-Guard、Skill-HTS-Tariff-Classification.html、Skill-HTS-Tariff-Classification、Skill-Temu-Consignment-Analytics.html、Skill-Temu-Consignment-Analytics
- **可组合**：Skill-Causal-Attribution-Bridge.html、Skill-Causal-Attribution-Bridge、Skill-Compliant-Dynamic-Pricing-Guard.html、Skill-Compliant-Dynamic-Pricing-Guard、Skill-HTS-Tariff-Classification.html、Skill-HTS-Tariff-Classification、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Temu-Consignment-Analytics.html、Skill-Temu-Consignment-Analytics、Skill-PL-Attribution-Analysis

---

> 分类：经营管理/财务与合规/经济性分析　·　技术族：23-运营财务　·　源卡：`Skill-PL-Attribution-Analysis`