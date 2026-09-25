---
name: "p2s-search-driven-logistics-promise"
title: "Search-Driven Logistics Promise — 搜索词意图信号驱动履约时效承诺优化"
description: "触发词：时效承诺优化、搜索词时效敏感度、FBA 库存分布、履约时效脱节、差评率下降、A9 排名保护。何时不用：要大促结束后的履约与售罄复盘用「Skill-PostPromo-Retrospective-KPI」，要定商品组合与套餐价格用「Skill-Bundle-Pricing-Strategy」；本技能只按搜索词时效意图与库存分布算每个 ASIN 该承诺几天。安全边界：时效承诺须真实可履约，虚假承诺违反 Amazon 卖家协议；调整承诺时效须先 A/B 测试确认，模型不直接改写线上承诺。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-069"
l3_business: "站点运营"
l3_all: "站点运营 / 物流方案"
l1_l2_l3: "业务运营/渠道经营/站点运营"
p2s_card_id: "Skill-Search-Driven-Logistics-Promise"
p2s_src_domain: "25-搜索流量工程"
quality_tier: "preview"
user_summary: "按每个关键词的时效敏感度和各仓实际库存，算出每个 ASIN 该承诺几天到货，既保住时效敏感词的转化，又不因超期承诺招差评。"
user_try: "试试：旺季美国东部仓奶粉库存紧张，帮我按各仓库存算出这个 ASIN 现在应该承诺几天到货，并告诉我哪些时效敏感词需要优先保库存。"
whenToUse: "有 FBA 库存位置报告、搜索词时效敏感度历史与实际履约时效记录，需要为每个 ASIN 定最优时效承诺，或挑出时效敏感词做 SKU 备货优先级时用；大促结束后的履约与售罄复盘用「Skill-PostPromo-Retrospective-KPI」，商品组合与价格决策用「Skill-Bundle-Pricing-Strategy」。"
workflow: "用时效信号模式给搜索词打敏感度分（当天／两日达／prime／快速等） → 汇总各仓 FBA 在库数量并按目标邮编前缀折算 ETA → 结合历史履约率与每日违约成本，算每个 ASIN 的最优承诺天数与置信度 → 输出时效敏感词 TOP50 与对应 SKU 的库存优先级 → 标注预计 CVR 变化，经 A/B 测试确认收益后再更新承诺"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Search-Driven Logistics Promise — 搜索词意图信号驱动履约时效承诺优化

## ① 解决的问题

运营面临"旺季FBA时效承诺与实际履约脱节导致差评激增和A9排名下滑"——搜索词时效意图驱动的动态承诺优化将差评率降低40%排名稳定，年化保护流量价值30-60万元

## ② 核心算法逻辑

核心思想：Amazon A9 算法将"准时交付率"和"预计到达日期准确性"纳入排名因子。搜索词意图与用户对时效的敏感度高度相关——搜索"婴儿奶粉 prime 两日达"的用户对时效要求远高于搜索"婴儿奶粉"的用户。本 Skill 构建搜索词→时效敏感度→最优承诺策略的完整链路。

## ③ 业务应用场景

场景1：婴儿奶粉 Prime 会员时效承诺优化 - 业务问题：旺季 FBA 仓库某地区库存紧张，Listing 仍显示"2 日达"，实际 4 天才到，导致 1 星差评激增，A9 排名下滑 - 数据要求：FBA 库存位置报告 + 搜索词时效敏感度历史 + 实际履约时效记录 - 预期产出：每个 ASIN 在当前库存状态下的最优时效承诺 + 预计 CVR 变化 - 业务价值：时效承诺准确后差评率降低 40%，A9 排名稳定，年化保护流量价值 30-60 万元
场景2：搜索流量时效敏感词监控 - 业务问题：不知道哪些关键词的买家对时效最敏感，无法优先保障对应 SKU 的 FBA 备货 - 数据要求：Amazon 广告搜索词报告 + 转化率 + 购买频率 - 预期产出：时效敏感词 TOP50 清单 + 对应 SKU 的库存优先级建议 - 业务价值：精准保障高敏感词 SKU 库存，减少时效导致的流量损失，年化增收 20-40 万元
**三轨验证**： - 成本：SP-API 调用约 500 元/月，承诺时效更新自动化开发约 5 人天 - 合规：时效承诺需真实可履约，虚假承诺违反 Amazon 卖家协议 - 风险：自动降低承诺时效可能短期影响 CVR，需 A/B 测试确认收益

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：时效承诺准确后差评率降低 40%，A9 排名稳定，年化保护流量价值 30-60 万元；高敏感词精准备货减少断货损失年化 20-40 万元
实施难度：⭐⭐⭐⭐☆
优先级：⭐⭐⭐⭐⭐
评估依据：Amazon A9 算法将时效准确性纳入排名，时效承诺与履约能力脱节是 BSR 下滑的常见隐性原因；搜索信号驱动的差异化承诺策略是大卖家的核心竞争力之一。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（128 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import re
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class SearchTermTimeSensitivity:
    keyword: str
    sensitivity_score: float  # 0-1，越高越敏感
    time_signals: List[str]

@dataclass
class LogisticsPromise:
    asin: str
    promised_days: int
    confidence: float
    inventory_source: str  # FBA / overseas_warehouse / self_fulfill

# ── 搜索词时效意图分类 ───────────────────────────────────────
TIME_SENSITIVE_PATTERNS = {
    r"\bsame\s*day\b|\b当天\b": 1.0,
    r"\b2.?day\b|\bnext\s*day\b|\b两日达\b": 0.9,
    r"\bprime\b|\bfast\s*ship": 0.8,
    r"\bquick\b|\bexpress\b|\b急\b|\b快速\b": 0.7,
    r"\bfree\s*ship": 0.3,
}

def score_keyword_time_sensitivity(keyword: str) -> SearchTermTimeSensitivity:
    score = 0.0
    signals = []
    kw_lower = keyword.lower()
    for pattern, weight in TIME_SENSITIVE_PATTERNS.items():
        if re.search(pattern, kw_lower, re.IGNORECASE):
            score = max(score, weight)
            signals.append(pattern.split(r"\b")[1] if r"\b" in pattern else pattern)
    return SearchTermTimeSensitivity(keyword=keyword, sensitivity_score=score,
                                     time_signals=signals)

# ── 最优履约时效承诺 ─────────────────────────────────────────
def compute_optimal_promise(
    asin: str,
    fba_inventory: Dict[str, int],   # {warehouse_region: stock_qty}
    target_zip_prefix: str,
    historical_fulfillment_rate: float = 0.97,
    sla_penalty_per_day: float = 50.0,  # 每天违约成本（差评/赔偿）
) -> LogisticsPromise:
    # 模拟各仓到目标邮编的 ETA（生产中用 SP-API 实际数据）
    WAREHOUSE_ETA = {
        "US_EAST":  {"0": 1, "1": 2, "2": 2, "3": 3, "4": 4, "9": 5},
        "US_WEST":  {"0": 4, "1": 3, "2": 3, "3": 2, "4": 2, "9": 1},
        "US_CENTRAL": {"0": 3, "1": 2, "2": 1, "3": 2, "4": 3, "9": 3},
    }
    zip_key = target_zip_prefix[0] if target_zip_prefix else "5"
    best_eta = 999
    best_source = "self_fulfill"
    for region, stock in fba_inventory.items():
        if stock <= 0:
            continue
        eta_map = WAREHOUSE_ETA.get(region, {})
        eta = eta_map.get(zip_key, 7)
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：ASIN×仓粒度：FBA 库存位置报告（各 region 在库数量）、目标邮编前缀、历史履约率与每日违约成本（模板默认 0.97 与 50/天）；关键词侧要 Amazon 广告搜索词报告（关键词、转化率、购买频率），以及实际履约时效记录。搜索词需覆盖当天／两日达／prime／快速等时效信号，ASIN 要能映射到仓与邮编分区；缺库存分布或履约记录时算不出可信承诺。

**输出**：关键词级与 ASIN 级两份产出：关键词时效敏感度分与命中的时效信号；每个 ASIN 的最优承诺天数、置信度与库存来源（FBA／海外仓／自发货）；时效敏感词 TOP50 清单及对应 SKU 的库存优先级建议，并附预计 CVR 变化；供运营更新时效承诺与排 FBA 备货优先级使用。

## 执行步骤

1. 对广告搜索词逐个打时效敏感度分并记录命中的时效信号
2. 汇总各仓 FBA 在库数量，按目标邮编前缀折算各仓 ETA
3. 结合历史履约率与每日违约成本，算出每个 ASIN 的最优承诺天数与置信度
4. 排出时效敏感词 TOP50 并对齐到对应 SKU 的库存优先级
5. 给出预计 CVR 变化，标注须 A/B 测试确认后再改线上承诺

## 边界与不做

- 数据不满足：缺 FBA 库存位置报告、实际履约时效记录或搜索词报告时不要用——先补齐再算，否则承诺天数与敏感度都没有依据。
- 何时不用：要大促后的履约与售罄复盘用「Skill-PostPromo-Retrospective-KPI」，要定商品组合与套餐价格用「Skill-Bundle-Pricing-Strategy」。
- 能力边界：只做时效敏感度打分与最优承诺建议，不替代真实的补货与调拨决策；承诺时效由运营在后台人工更新，模型不直接改写 Listing。
- 安全边界：时效承诺须真实可履约，虚假承诺违反 Amazon 卖家协议；降低承诺时效可能短期影响 CVR，须 A/B 测试确认收益。卡页 ROI（差评率降低 40%、年化保护流量价值 30-60 万元与增收 20-40 万元）为估算口径，落地须用本店数据重算。

## 技能关联

- **可组合**：Skill-Search-Driven-Logistics-Promise

---

> 分类：业务运营/渠道经营/站点运营　·　技术族：25-搜索流量工程　·　源卡：`Skill-Search-Driven-Logistics-Promise`