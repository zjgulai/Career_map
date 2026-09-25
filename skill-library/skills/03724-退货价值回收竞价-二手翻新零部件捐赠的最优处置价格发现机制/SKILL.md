---
name: "p2s-return-value-recovery-auction"
title: "退货价值回收竞价 — 二手/翻新/零部件/捐赠的最优处置价格发现机制"
description: "触发词：退货处置、回收率、处置渠道选择、二手翻新定价、退货竞价。何时不用：判定退货件品相等级本身用「退货品质分级引擎」，决定退货件走哪条运输线路用「退货批量逆向路由」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-060"
l3_business: "退货分流"
l3_all: "退货分流"
l1_l2_l3: "业务运营/供应与履约/退货分流"
p2s_card_id: "Skill-Return-Value-Recovery-Auction"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把退回来的货按品相匹到最值钱的处置渠道，别一律当废品卖，把回收率提上去。"
whenToUse: "与相邻退货分流技能的边界：已有品质分级结果、要比较二手转售/翻新/拆件/捐赠哪个回收价最高时用本技能；品相等级还没定，先用品质分级类技能。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 退货价值回收竞价 — 二手/翻新/零部件/捐赠的最优处置价格发现机制

## ① 解决的问题

逆向物流面临"退货一律当废品处理30%回收率"——最优渠道选择将回收率从30%提升至55%，年化退货额50万×25%提升=多回收12.5万元

## ② 核心算法逻辑

退货价值回收 将退货从"成本中心"转变为"价值回收机会"。关键在于：不同质量状态的退货，最优处置渠道不同。

## ③ 业务应用场景

（卡页此段是占位串，未承载业务场景；可读的落地口径见下方「执行步骤」与「输入 / 输出契约」。）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：通过最优渠道选择，退货回收率从平均30%提升至55%，以年退货额50万元计算，年化多回收约12.5万元
实施难度：⭐⭐☆☆☆（算法简单，主要是建立处置渠道合作关系）
优先级评分：⭐⭐⭐⭐☆（退货是P&L的隐性成本，精细化处置是提升利润率的杠杆）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（87 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/return_value_recovery_auction` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Return-Value-Recovery-Auction.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
退货价值回收竞价系统
功能：退货质检分级 / 最优处置渠道选择 / 回收ROI计算 / 处置批量优化
"""
from dataclasses import dataclass, field
import warnings
warnings.filterwarnings('ignore')


DISPOSAL_CHANNELS = {
    "amazon_warehouse": {"recovery_rate": 0.75, "refurb_cost_pct": 0.05, "days": 3},
    "open_box_sale":    {"recovery_rate": 0.70, "refurb_cost_pct": 0.03, "days": 2},
    "refurbished_sale": {"recovery_rate": 0.55, "refurb_cost_pct": 0.15, "days": 7},
    "parts_sale":       {"recovery_rate": 0.25, "refurb_cost_pct": 0.10, "days": 14},
    "donation":         {"recovery_rate": 0.05, "refurb_cost_pct": 0.02, "days": 1},
    "scrap":            {"recovery_rate": 0.03, "refurb_cost_pct": 0.0,  "days": 1},
}

CONDITION_CHANNELS = {
    "NEW_SEALED": ["amazon_warehouse", "open_box_sale"],
    "OPEN_BOX":   ["amazon_warehouse", "open_box_sale", "refurbished_sale"],
    "FUNCTIONAL": ["refurbished_sale", "parts_sale"],
    "DAMAGED":    ["parts_sale", "donation", "scrap"],
    "SCRAP":      ["donation", "scrap"],
}


@dataclass
class ReturnItem:
    return_id: str
    sku_id: str
    condition: str
    original_price_usd: float
    cost_usd: float
    qty: int = 1


def compute_best_disposal(item: ReturnItem) -> dict:
    channels = CONDITION_CHANNELS.get(item.condition, ["scrap"])
    best_channel = None
    best_roi = -999

    results = []
    for channel in channels:
        ch = DISPOSAL_CHANNELS[channel]
        recovery = item.original_price_usd * ch["recovery_rate"]
        refurb = item.cost_usd * ch["refurb_cost_pct"]
        net_recovery = (recovery - refurb) * item.qty
        roi = (recovery - refurb - item.cost_usd) / max(0.01, item.cost_usd) * 100
        results.append({"channel": channel, "net_recovery_usd": round(net_recovery, 2),
                        "roi_pct": round(roi, 1), "days": ch["days"]})
        if roi > best_roi:
            best_roi = roi
            best_channel = channel

    return {
        "return_id": item.return_id, "condition": item.condition,
        "best_channel": best_channel, "best_roi": best_roi,
        "all_options": sorted(results, key=lambda x: x["roi_pct"], reverse=True),
        "tags": {
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2310.09823。
⚠️ 该号被 4 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：退货件的质检分级结果与可售状态、各处置渠道的报价与费用结构、退货批次规模；批次×SKU×品相粒度。

**输出**：每个批次的最优处置渠道与回收价测算、期望回收率与回收 ROI、批量处置建议，输出给逆向物流与财务损益负责人。

## 执行步骤

1. 汇总退货件的质检分级结果与批次规模。
2. 拉齐二手、翻新、拆件、捐赠等渠道的报价与成本。
3. 逐批计算各渠道净回收额并选出最优渠道。
4. 汇总回收率提升与 ROI，输出批量处置建议。

## 边界与不做

- 何时不用：退货件尚未做品质分级，或缺少处置渠道报价时无法比价，不适用本技能。
- 能力边界：结果是基于报价表的收益测算，不承诺渠道实际成交价；处置渠道合作关系需要线下建立。

## 技能关联

- **前置**：Skill-Dynamic-Payment-Terms-Tag-Engine.html、Skill-Dynamic-Payment-Terms-Tag-Engine、Skill-FBA-Stranded-Unfulfillable-Inventory-KPI.html、Skill-FBA-Stranded-Unfulfillable-Inventory-KPI、Skill-Return-Root-Cause-Attribution-Graph.html、Skill-Return-Root-Cause-Attribution-Graph、Skill-Reverse-Logistics-Disposition-Optimization.html、Skill-Reverse-Logistics-Disposition-Optimization
- **延伸**：Skill-Dynamic-Payment-Terms-Tag-Engine.html、Skill-Dynamic-Payment-Terms-Tag-Engine、Skill-FBA-Stranded-Unfulfillable-Inventory-KPI.html、Skill-FBA-Stranded-Unfulfillable-Inventory-KPI、Skill-Return-Root-Cause-Attribution-Graph.html、Skill-Return-Root-Cause-Attribution-Graph
- **可组合**：Skill-Dynamic-Payment-Terms-Tag-Engine.html、Skill-Dynamic-Payment-Terms-Tag-Engine、Skill-FBA-Stranded-Unfulfillable-Inventory-KPI.html、Skill-FBA-Stranded-Unfulfillable-Inventory-KPI、Skill-Return-Value-Recovery-Auction

---

> 分类：业务运营/供应与履约/退货分流　·　技术族：04-供应链　·　源卡：`Skill-Return-Value-Recovery-Auction`