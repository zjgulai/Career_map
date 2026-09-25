---
name: "p2s-tiktok-repurchase-from-live-audience"
title: "TikTok Live Audience Repurchase—直播首购用户复购转化"
description: "触发词：直播首购复购、渠道分层、生存曲线对比、7 天复购窗口、差异化触达。何时不用：不做来源区分、统一经营全渠道复购节奏时用通用复购时点技能；本技能专治直播冲动购买后的低复购。安全边界：首购渠道与复购行为属一方数据，须符合平台营销政策与合法利益基础；7 天内最多触达 2 条。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 分群"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-TikTok-Repurchase-From-Live-Audience"
p2s_src_domain: "06-增长模型"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "直播带来的首购用户复购更慢，这套方法把直播与搜索用户的复购曲线分开看，再给不同节奏的跟进。"
user_try: "试试：对比我的直播首购与搜索首购用户的复购曲线，给出各自的触达节奏与 7 天窗口策略。"
whenToUse: "需要按首购渠道区分复购干预节奏时用本技能；不区分来源的全量复购经营用通用复购时点技能。"
workflow: "收集首购渠道、下单时间、复购时间与触达记录 → 分别拟合直播与搜索首购的生存曲线 → 标注各自的复购窗口并计算 7 天复购率 → 生成渠道差异化的触达节奏与内容触达表"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# TikTok Live Audience Repurchase—直播首购用户复购转化

## ① 解决的问题

用户运营面临"直播首购用户冲动购买后复购率远低于搜索购买用户"——生存分析揭示直播用户7天复购窗口特性，差异化干预序列年化增收$5.2万

## ② 核心算法逻辑

论文：Survival Analysis for Customer Repurchase Prediction | 年份：2019

## ③ 业务应用场景

场景A：直播首购奶瓶用户 7 天复购 - 业务问题：直播间爆发流量带来首购，但复购跟不上 - 数据要求：首购渠道、下单时间、复购时间、品类、触达记录 - 预期产出：7 天复购窗口、渠道差异化触达策略 - 业务价值：提高直播流量的 LTV
三轨验证： - 成本轨：数据采集与清洗 $800/月（ETL 工程师 0.2FTE）；生存分析计算资源 $200/月（云计算）；触达系统集成 $1,200（一次性）；总月度成本约 $1,000。预期 ROI 周期 2-3 个月。 - 合规轨：✓ 合规。用户首购渠道与复购行为属于一方数据，符合 GDPR 合法利益基础；TikTok Shop 政策允许基于购买历史的营销触达；母婴品类无特殊监管限制。 - 风险轨：低风险（概率 15%）。次生风险包括：(1) 过度触达导致用户投诉率上升 2-3%；(2) 竞品跟风降价，边际利润下降 5-8%。缓解措施：设置触达频率上限（7 天内最多 2 条），A/B
场景B：搜索首购用户的慢热培育 - 业务问题：搜索进店用户客单高，但转化链路长 - 数据要求：搜索词、浏览深度、首购品类、复购周期 - 预期产出：30/60 天复购节奏与内容触达表 - 业务价值：提升高意图用户的长期价值

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：针对直播首购用户做 7 天差异化干预，复购率提升约 28%，年化增收约 $5.2 万
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐☆
评估依据：能快速放大短周期直播流量的价值，见效快

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（42 行）。**下面 42 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **42 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，42 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/growth_model/tiktok_repurchase_from_live_audience` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-TikTok-Repurchase-From-Live-Audience.md`），已与卡面节选核对，不依赖上述路径。

```python
from collections import defaultdict
from typing import List, Dict


def survival_curve(days_to_repurchase: List[int], horizon: int = 30) -> List[float]:
    n = len(days_to_repurchase)
    curve = []
    for day in range(1, horizon + 1):
        survivors = sum(1 for d in days_to_repurchase if d > day)
        curve.append(round(survivors / n if n else 0.0, 3))
    return curve


def cohort_analysis(live_days: List[int], search_days: List[int]) -> Dict[str, List[float]]:
    return {
        "live": survival_curve(live_days),
        "search": survival_curve(search_days),
    }


def seven_day_repurchase_rate(days: List[int]) -> float:
    if not days:
        return 0.0
    return sum(1 for d in days if d <= 7) / len(days)


def main():
    live = [2, 3, 4, 5, 6, 7, 8, 10, 12, 14]
    search = [5, 8, 9, 12, 15, 18, 20, 24, 28, 31]
    curves = cohort_analysis(live, search)
    live_7 = seven_day_repurchase_rate(live)
    search_7 = seven_day_repurchase_rate(search)
    print({"live_7_day": round(live_7, 3), "search_7_day": round(search_7, 3)})
    print("day1-day10 live curve:", curves["live"][:10])
    print("day1-day10 search curve:", curves["search"][:10])
    assert live_7 > search_7
    assert curves["live"][6] < curves["search"][6]
    print("[✓] TikTok 复购测试通过")


if __name__ == "__main__":
    main()
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1906.04711，但该号在 arXiv 上是《ProPublica's COMPAS Data Revisited》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Survival Analysis for Customer Repurchase Prediction》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：用户级记录：首购渠道、下单时间、复购时间、品类、历史触达记录；粒度到单个用户与其首购订单。

**输出**：直播与搜索两条渠道的复购生存曲线、各自的复购窗口（直播约 7 天）与渠道差异化触达策略表；供用户运营排期使用。

## 执行步骤

1. 收集首购渠道与复购时间数据
2. 对直播与搜索来源分别拟合生存曲线
3. 识别各自复购窗口并计算 7 天复购率
4. 生成渠道差异化的触达节奏与内容计划
5. 设置触达频率上限并输出排期

## 边界与不做

- 首购渠道字段缺失或样本量过小时不用本技能，两条曲线不可比。
- 本技能只产出分渠道复购节奏与触达建议，不执行消息发送。
- 安全边界：触达须符合平台营销政策，7 天内最多 2 条，避免投诉率上升。

## 技能关联

- **可组合**：Skill-TikTok-Repurchase-From-Live-Audience

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：06-增长模型　·　源卡：`Skill-TikTok-Repurchase-From-Live-Audience`