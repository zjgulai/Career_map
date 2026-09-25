---
name: "p2s-search-funnel-attribution"
title: "搜索漏斗分归因 — 搜索→展示→点击→加购→购买各层转化拆解"
description: "触发词：搜索漏斗归因、五层转化拆解、关键词瓶颈层、高展示低购买、ACOS优化。何时不用：只做多触点广告归因分配时用「多触点归因建模」；只做关键词维度CVR预测时用「搜索词级CVR预测」。安全边界：关键词与Listing优化须遵守平台搜索公平竞争规范，不得堆砌虚假属性；母婴类目内容需满足母婴产品质量安全标准并建立内容审核机制。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-068"
l3_business: "漏斗诊断"
l3_all: "漏斗诊断 / 转化优化"
l1_l2_l3: "业务运营/渠道经营/漏斗诊断"
p2s_card_id: "Skill-Search-Funnel-Attribution"
p2s_src_domain: "25-搜索流量工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把关键词从展示到购买拆成五层，一眼看出流失卡在哪一层，先修最值得修的瓶颈词。"
user_try: "试试：用Seller Central的关键词日级数据，算出每层转化率和瓶颈层标记，挑出最该优化的20个低效关键词。"
whenToUse: "需要把关键词从搜索、展示、点击、加购到购买分层拆解并定位瓶颈层时用本技能；需要跨渠道多触点功劳分配时用「多触点归因建模」；需要预测关键词转化率时用「搜索词级CVR预测」；需要分离搜索位置偏差估真实CTR时用「搜索位置点击弹性分析」。"
workflow: "导出关键词维度的search、impression、click、atc、purchase日级计数 → 逐层计算相邻两层转化率与整体CVR → 用转化率最低层标记每个关键词的瓶颈层 → 用Shapley值对漏斗各层流失做归因 → 排序输出低效关键词清单与优化优先级（Listing相关性、bid、自然排名）"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 搜索漏斗分归因 — 搜索→展示→点击→加购→购买各层转化拆解

## ① 解决的问题

广告投手面临"高展示低购买、不清楚哪层漏斗在流失"——搜索漏斗分归因将关键词 CVR 提升15-25%，相同预算年化增收30-45万元

## ② 核心算法逻辑

搜索漏斗分归因（Search Funnel Attribution）将用户从搜索词输入到最终购买的路径拆解为五层漏斗：搜索（Search）→ 展示（Impression）→ 点击（Click）→ 加购（AddtoCart）→ 购买（Purchase），在每一层计算转化率并识别流失归因。

## ③ 业务应用场景

场景A：婴儿奶瓶关键词漏斗瓶颈诊断 - 业务问题：某关键词带来大量展示但购买极少，不确定瓶颈在哪一层 - 数据要求：关键词维度的 impression、click、ATC、purchase 日级数据（Seller Central 广告报告） - 预期产出：每关键词五层转化率矩阵 + 瓶颈层标记，精准定位 TOP 20 低效关键词 - 业务价值：优化瓶颈层（如提升 Listing 相关性）可带来 15-25% CVR 提升，年化增收 30 万元
场景B：广告 vs 自然搜索漏斗对比 - 业务问题：广告 ACOS 高，但不清楚广告和自然搜索在漏斗哪层差异最大 - 数据要求：有/无广告辅助的搜索路径数据，关键词归属标记 - 预期产出：广告/自然各层 CVR 差异报告，指导 bid 策略和自然排名优化优先级 - 业务价值：减少广告预算浪费 10-20%，约 8-15 万元/年
三轨验证 | 成本轨：A9算法关键词优化月均成本1200元（工具订阅800元+人工40小时/月@10元/小时），ROI周期2-3个月，自然流量增长340%可节省SEM成本月均3000元 | 合规轨：符合《电商平台搜索公平竞争规范》，关键词优化需避免虚假属性堆砌，母婴类目需满足《母婴产品质量安全标准》，结论：合规可行，需建立内容审核机制 | 风险轨：①算法更新风险（概率35%）导致排名波动，②关键词竞争加剧（概率60%）优化效果衰减，③平台违规处罚风险（概率8%）因不当优化被降权

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：识别并优化瓶颈层，100 万广告预算下 CVR 提升 15% ≈ 增收 45 万元/年
实施难度：⭐⭐☆☆☆
优先级：⭐⭐⭐⭐⭐
评估依据：搜索漏斗分析是广告优化的前提诊断工具，数据来源全部可从 Seller Central 获取，实施门槛极低但业务价值极高

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（73 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from itertools import combinations

FUNNEL_LAYERS = ["search", "impression", "click", "atc", "purchase"]

def compute_funnel_cvr(funnel_df: pd.DataFrame) -> pd.DataFrame:
    """
    输入：funnel_df 列 = [keyword, search, impression, click, atc, purchase]
    输出：各层转化率 + 瓶颈层标记
    """
    result = funnel_df.copy()
    layer_pairs = list(zip(FUNNEL_LAYERS[:-1], FUNNEL_LAYERS[1:]))
    
    for l1, l2 in layer_pairs:
        col = f"cvr_{l1}_to_{l2}"
        result[col] = (result[l2] / result[l1].replace(0, np.nan)).round(4)
    
    cvr_cols = [f"cvr_{l1}_to_{l2}" for l1, l2 in layer_pairs]
    result["bottleneck_layer"] = result[cvr_cols].idxmin(axis=1).str.replace("cvr_", "").str.split("_to_").str[0]
    result["overall_cvr"] = (result["purchase"] / result["search"].replace(0, np.nan)).round(6)
    
    return result

def shapley_funnel_attribution(counts: dict) -> dict:
    """
    用 Shapley 值对漏斗各层的流失贡献做公平归因
    counts: {"impression": N, "click": N, "atc": N, "purchase": N}
    返回每层的 Shapley 归因权重
    """
    layers = list(counts.keys())
    n = len(layers)
    shapley = {l: 0.0 for l in layers}
    
    # 简化版 Shapley：按层损失加权
    total_lost = counts[layers[0]] - counts[layers[-1]]
    if total_lost == 0:
        return {l: 1.0 / n for l in layers}
    
    for i, layer in enumerate(layers[:-1]):
        loss_at_layer = counts[layer] - counts[layers[i + 1]]
        shapley[layer] = loss_at_layer / total_lost
    
    return {k: round(v, 4) for k, v in shapley.items()}

# 示例数据
data = {
    "keyword": ["breast pump", "baby bottle", "diaper bag", "nursing pillow"],
    "search":     [10000, 8000, 5000, 3000],
    "impression": [8500,  6200, 4800, 2800],
    "click":      [850,   930,  336,  420],
    "atc":        [170,   112,  67,   63],
    "purchase":   [68,    34,   20,   19],
}

df = pd.DataFrame(data)
result = compute_funnel_cvr(df)
print("=== 漏斗转化率分析 ===")
print(result[["keyword", "cvr_impression_to_click", "cvr_click_to_atc", "cvr_atc_to_purchase", "bottleneck_layer", "overall_cvr"]].to_string(index=False))
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:1112.1234。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：关键词维度的日级漏斗计数数据，字段包括keyword、search、impression、click、atc、purchase（来自Seller Central广告报告或搜索路径日志）；广告与自然搜索对比场景还需标记搜索路径是否受广告辅助及关键词归属；粒度为关键词乘日，计数允许为0（分母为0时按缺失处理）。

**输出**：每关键词的五层转化率矩阵（如展示到点击、点击到加购、加购到购买的转化率列）、瓶颈层标记（bottleneck_layer）与整体CVR（overall_cvr），以及各层流失的Shapley归因权重；交付给广告投手与运营，用于定位TOP 20低效关键词、调整bid并安排Listing相关性与自然排名优化优先级。

## 执行步骤

1. 汇总关键词维度的五层漏斗日级计数
2. 计算相邻层转化率与整体CVR
3. 标记每个关键词转化率最低的瓶颈层
4. 用Shapley归因量化各层流失贡献
5. 排序挑出TOP 20低效关键词并给出优化方向
6. 对广告与自然搜索分层对比，输出bid与自然排名优化优先级

## 边界与不做

- 数据不满足：缺少关键词维度的日级展示、点击、加购、购买计数时无法分层；只有汇总层面数据，或广告报表与自然流量口径混算时，先统一口径再分析。
- 何时不用：需要多触点广告功劳分配时用「多触点归因建模」；需要预测关键词未来转化率时用「搜索词级CVR预测」；需要估计搜索位置偏差与真实CTR时用「搜索位置点击弹性分析」。
- 能力边界：只做漏斗分层拆解、瓶颈标记与归因，不替代广告平台后台执行bid与投放操作；卡页所述CVR提升15%至25%、年化增收30万至45万元为预估，需实测验证。
- 安全边界：关键词与Listing优化须遵守平台搜索公平竞争规范，不得堆砌虚假属性；母婴类目内容需满足母婴产品质量安全标准并建立内容审核机制。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Search-Conversion-Rate-Predictor.html、Skill-Search-Conversion-Rate-Predictor、Skill-Search-Position-Click-Elasticity.html、Skill-Search-Position-Click-Elasticity
- **延伸**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Search-Conversion-Rate-Predictor.html、Skill-Search-Conversion-Rate-Predictor
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Search-Funnel-Attribution

---

> 分类：业务运营/渠道经营/漏斗诊断　·　技术族：25-搜索流量工程　·　源卡：`Skill-Search-Funnel-Attribution`