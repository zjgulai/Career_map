---
name: "p2s-combo-ad-roi-maximizer"
title: "广告ROI最大化 Combo Pattern — 从归因分析到预算自动重分配的 6 步优化链路"
description: "触发词：广告 ROI 链路、归因修正、价格弹性、MMM 饱和、自我蚕食、预算重分配。何时不用：只有单渠道、小额投放时不必串整条链路；分渠道数据不足 90 天时先补数据。安全边界：自动化调价与预算调整需符合平台算法政策、不使用黑帽工具，涉及价格的动作需与定价策略协同并避开违规价格实验。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 预算分配"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Combo-Ad-ROI-Maximizer"
p2s_src_domain: "15-营销投放分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把归因修正、价格弹性、饱和分析和蚕食检查串成一条链路，直接给出预算重分配方案。"
user_try: "试试：我的月广告预算 2 万美元综合 ROAS 只有 2.1，帮我跑一遍 6 步优化链路。"
whenToUse: "多渠道投放、多个优化环节各自为政需要串成一条链路时用本技能；单渠道或小预算时用单项技能即可；分渠道数据不足 90 天时先补数据。"
workflow: "归因修正得到各渠道真实 ROAS → 估算主推品价格弹性并评估降价配合空间 → 用 MMM 判断各渠道当前饱和度 → 计算最优预算并检查渠道间自我蚕食 → 输出 6 步链路结论与预算重分配方案"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 广告ROI最大化 Combo Pattern — 从归因分析到预算自动重分配的 6 步优化链路

## ① 解决的问题

广告负责人面临"广告归因/预算分配/MMM/搜索协同是四个独立工具每次优化都要手动对齐"——6步优化链路将广告总ROI提升24%，ACoS降低18%，年化效率提升$11.4万

## ② 核心算法逻辑

论文：Budget Allocation via Online Learning with Saturation Effects | 年份：2023

## ③ 业务应用场景

场景A：母婴品牌亚马逊+TikTok 双渠道广告 ROI 优化（月预算 $20,000）
- 业务问题：月度广告支出 $20,000，综合 ROAS = 2.1（行业均值 3.5），运营直觉是「TikTok 效果不好但老板要求继续投」 - 数据要求：各渠道广告消耗、点击量、转化量（至少 90 天）、商品价格历史、自然流量数据 - 执行过程： - Step1 归因修正：TikTok 末次点击归因虚报 40%（实际 view-through 转化多），修正后 TikTok 真实 ROAS = 1.8（非 3.2） - Step2 价格弹性：主推品弹性系数 ε = -1.8（高弹性），广告引流配合 -15% 降价可提升转化量 27% - Step3 MMM：亚马逊 SP 已达到 85% 
场景B：跨境婴儿推车品牌 Black Friday 广告预算冲刺

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：月广告预算 $20,000 的品牌，ROAS 从 2.1 提升至 3.4（+62%），同等预算额外增收 = ($20,000 × 3.4 - $20,000 × 2.1) = $26,000/月，年化 $312,000（约 220 万人民币）；实施成本约 3-5 万元（工程化），ROI > 40x
关键洞察：归因修正（Step1）通常是最大单一杠杆——TikTok 等渠道虚报 ROAS 高达 35-50%，修正后可立即重新分配 $3,000-$5,000/月
实施难度：⭐⭐⭐⭐☆（MMM 需要 90 天历史数据 + Python 建模能力，完整实施约 4 周）
优先级：⭐⭐⭐⭐⭐（广告费是跨境电商最大可变成本，任何优化都有直接底线影响）
适用规模：月广告支出 ≥ $5,000（< $5,000 MMM 样本量不足），跨 2+ 渠道投放

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（209 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/marketing/combo_ad_roi_maximizer` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/15-营销投放分析/Skill-Combo-Ad-ROI-Maximizer.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
广告 ROI 最大化 Combo Pattern — 6 步优化链路
"""
from dataclasses import dataclass, field
from typing import Optional
import math

# ──────────────────────────────────────────────
# 渠道数据结构
# ──────────────────────────────────────────────
@dataclass
class AdChannel:
    name: str                    # 渠道名（如 "Amazon_SP"）
    current_spend_usd: float     # 当前月度预算
    reported_roas: float         # 平台上报 ROAS（有偏）
    clicks: int
    conversions: int
    organic_conversions: int     # 同期自然转化量（用于协同分析）
    # Combo 填充
    corrected_roas: float = 0.0   # Step1 修正后真实 ROAS
    saturation_pct: float = 0.0   # Step3 当前饱和度
    optimal_spend_usd: float = 0.0  # Step4 最优预算
    cannibalization_rate: float = 0.0  # Step5 自我蚕食率

@dataclass
class AdOptContext:
    channels: list[AdChannel]
    total_budget_usd: float
    price_elasticity: float = -1.5  # Step2 填充
    final_plan: dict = field(default_factory=dict)

# ──────────────────────────────────────────────
# Step1: 多触点归因修正 — Skill-Ad-Attribution-Modeling
# ──────────────────────────────────────────────
def step1_attribution_correction(ctx: AdOptContext) -> AdOptContext:
    """修正平台归因偏差（末次点击 → Shapley 值近似）"""
    BIAS_FACTORS = {
        "Amazon_SP": 0.92,    # SP 相对准确
        "Amazon_SB": 0.88,    # SB 有 view-through 虚报
        "TikTok": 0.65,       # TikTok 末次点击严重虚报
        "Google": 0.78,       # Google 中等偏差
        "Meta": 0.72,         # Meta 类似 TikTok
    }
    for ch in ctx.channels:
        bias = BIAS_FACTORS.get(ch.name, 0.85)
        ch.corrected_roas = round(ch.reported_roas * bias, 3)
    corrections = [(c.name, f"{c.reported_roas:.2f}→{c.corrected_roas:.2f}") for c in ctx.channels]
    print(f"  [Step1] 归因修正: {corrections}")
    return ctx

# ──────────────────────────────────────────────
# Step2: 价格弹性校准 — Skill-Price-Elasticity-Estimation
# ──────────────────────────────────────────────
def step2_price_elasticity(ctx: AdOptContext) -> AdOptContext:
    """估计产品价格弹性（简化：基于历史 CPC vs 转化率相关性）"""
    total_clicks = sum(c.clicks for c in ctx.channels)
    total_conv = sum(c.conversions for c in ctx.channels)
    cvr = total_conv / max(total_clicks, 1)
    # 高转化率 + 高 CPC → 价格敏感型（弹性大）
    avg_cpc = sum(c.current_spend_usd for c in ctx.channels) / max(total_clicks, 1)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2305.11893，但该号在 arXiv 上是《Solutions of the (3 + 1) dimensional Charney-Obukhov equation for the ocean, Part I: case of "separation'' of variables》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Budget Allocation via Online Learning with Saturation Effects》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各渠道至少 90 天的广告消耗、点击与转化数据、商品价格历史、自然流量数据，以及平台上报 ROAS 与同期自然转化量用于协同分析。

**输出**：修正后的真实 ROAS、价格弹性系数、各渠道饱和度与最优预算、自我蚕食率，以及按 6 步链路产出的预算重分配方案；供广告负责人直接执行调整。卡页无代码模板，产出以分析报告与参数表为主。

## 执行步骤

1. 归因修正得到各渠道真实 ROAS
2. 估算主推品价格弹性并评估降价配合空间
3. 用 MMM 判断各渠道当前饱和度
4. 计算最优预算并检查渠道间自我蚕食
5. 输出 6 步链路结论与预算重分配方案

## 边界与不做

- 何时不用：只有单渠道、投放规模很小或数据不足 90 天时，用单项技能（归因、饱和、弹性）即可，不必串整条链路。
- 能力边界：本技能产出预算方案与参数，不直接调用广告后台改预算，也不承担定价决策。
- 合规边界：自动化调整需符合平台算法政策、不使用黑帽工具，涉及价格的动作需避开违规价格实验并与定价策略协同。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Channel-Saturation-Curve.html、Skill-Channel-Saturation-Curve、Skill-Combo-New-Product-Launch-Playbook.html、Skill-Combo-New-Product-Launch-Playbook、Skill-DARA-Agentic-MMM-Optimizer.html、Skill-DARA-Agentic-MMM-Optimizer、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Multi-Platform-Ad-Budget-Allocator.html、Skill-Multi-Platform-Ad-Budget-Allocator、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-Search-Ad-Budget-ROI-Integration.html、Skill-Search-Ad-Budget-ROI-Integration
- **延伸**：Skill-Channel-Saturation-Curve.html、Skill-Channel-Saturation-Curve、Skill-Combo-New-Product-Launch-Playbook.html、Skill-Combo-New-Product-Launch-Playbook
- **可组合**：Skill-Channel-Saturation-Curve.html、Skill-Channel-Saturation-Curve、Skill-Combo-New-Product-Launch-Playbook.html、Skill-Combo-New-Product-Launch-Playbook、Skill-DARA-Agentic-MMM-Optimizer.html、Skill-DARA-Agentic-MMM-Optimizer、Skill-Multi-Platform-Ad-Budget-Allocator.html、Skill-Multi-Platform-Ad-Budget-Allocator、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-Search-Ad-Budget-ROI-Integration.html、Skill-Search-Ad-Budget-ROI-Integration、Skill-Combo-Ad-ROI-Maximizer

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：15-营销投放分析　·　源卡：`Skill-Combo-Ad-ROI-Maximizer`