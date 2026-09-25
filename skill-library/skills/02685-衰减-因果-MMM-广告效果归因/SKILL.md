---
name: "p2s-ad-spend-time-series-attribution"
title: "Ad Spend Time Series Attribution — Adstock 衰减 + 因果 MMM 广告效果归因"
description: "触发词：Adstock 衰减、carryover、饱和曲线、因果 MMM、渠道贡献拆分、大促延续投放。何时不用：只有一两周数据时无法拟合衰减率；要判断个体级归因时用多触点归因。安全边界：使用渠道级聚合数据、不涉及用户级隐私，平台数据获取需走官方导出或 API。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / GMV归因分析"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Ad-Spend-Time-Series-Attribution"
p2s_src_domain: "13-广告分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "看清广告效果在几周内如何衰减，避免大促后误判效果而错误关停广告。"
user_try: "试试：黑五后 ROAS 回落，帮我算各渠道的 carryover 窗口，判断该不该继续投。"
whenToUse: "需要判断投放的滞后与累计效应、或做渠道级预算分配时用本技能；需要个体级触点归因时用多触点归因；只有单渠道且序列不足 8 周时不适用。"
workflow: "对齐渠道级周度投放与销售额数据 → 对投放做 Adstock 几何衰减变换 → 拟合 Hill 饱和曲线估计边际递减 → 拆分当周贡献与 carryover 贡献 → 模拟预算方案并输出 Pareto 最优分配"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Ad Spend Time Series Attribution — Adstock 衰减 + 因果 MMM 广告效果归因

## ① 解决的问题

母婴跨境运营黑五大促后不知道广告效果是当周还是前 6 周积累所致，导致次日关停广告恰是最高 ROI 时段——Adstock 时序衰减模型识别各渠道 carryover 窗口，ROAS 计算准确率提升 40%，年化避免错误关停损失 20-80 万元

## ② 核心算法逻辑

广告投放存在强烈的时序滞后效应（carryover effect）：今天曝光的广告可能要 26 周后才完成最终转化。传统 LastClick 或周级 ROAS 完全忽略这一现象，导致大促后关停广告的决策恰好在 ROI 最高时段。

## ③ 业务应用场景

场景A：黑五大促 Adstock 衰减率估算（防错误关停）
- 业务问题：Momcozy 吸奶器每年黑五前 6 周在 TikTok/Amazon DSP/Google 全面铺量。大促结束次日 ROAS 数据回落，运营关停广告；但实际上前 6 周曝光的 carryover 效应在接下来 3-4 周仍持续驱动自然转化，关停导致年化损失 20-80 万元。 - 数据要求：8 周以上的渠道级周度投放金额 + 周度销售额（SKU 级），共 3-5 个渠道 - 预期产出：每个渠道的 λ（衰减率）、饱和阈值 β、当周真实贡献 vs. 累计 carryover 贡献拆分 - 业务价值：ROAS 计算准确率提升 40%，大促后正确延续投放窗口 2-3 周，年化增收 20
- 业务问题：手握 TikTok/Amazon/Google 三条渠道，预算 50 万，历史数据显示 TikTok 当周 ROAS 低但大促期间 Halo 效应明显，如何分配 Q4 预算？ - 数据要求：同上 + 促销节点标记（Prime Day、黑五、圣诞） - 预期产出：基于学习到的 λ 和饱和曲线，模拟 10 种预算分配方案的预期总销售额，输出 Pareto 最优方案 - 业务价值：在相同预算下销售额提升 8-15%，Q4 增量约 15-40 万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：ROAS 计算准确率提升 40%，大促后正确延续投放窗口 2-3 周，年化增收 20-80 万元（以 Momcozy 年广告预算 500 万元为基准，0.5% 效率提升即 = 2.5 万元）
实施难度：⭐⭐⭐☆☆（主要难点在历史数据清洗和渠道级日/周度归因粒度对齐）
优先级：⭐⭐⭐⭐⭐（黑五等大促期广告策略直接影响年度 P&L 的关键路径）
适用规模：月广告预算 ≥ 30 万元，3 个以上渠道，历史数据 ≥ 8 周
数据要求：渠道级周度花费 + SKU 级周度销售额（可从广告后台 + 财务系统导出）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（348 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/advertising/ad_spend_time_series_attribution` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-Ad-Spend-Time-Series-Attribution.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Ad Spend Time Series Attribution with Adstock + Hill Saturation + Simple MMM
场景: Momcozy 吸奶器 8 周三渠道广告数据归因
依赖: numpy, scipy (标准库，无需 deepcausalmmm)
"""
import numpy as np
from scipy.optimize import minimize
from scipy.stats import pearsonr

# ─────────────────────────────────────────
# 核心组件 1: Adstock 几何衰减
# ─────────────────────────────────────────

def adstock_transform(spend: np.ndarray, decay: float) -> np.ndarray:
    """
    Adstock 几何衰减变换
    
    Args:
        spend: 周度投放金额数组 shape=(T,)
        decay: 衰减率 λ ∈ [0, 1]，越大持续越久
    
    Returns:
        adstocked: 衰减后的有效曝光数组 shape=(T,)
    """
    T = len(spend)
    adstocked = np.zeros(T)
    adstocked[0] = spend[0]
    for t in range(1, T):
        adstocked[t] = spend[t] + decay * adstocked[t - 1]
    return adstocked


# ─────────────────────────────────────────
# 核心组件 2: Hill 饱和曲线
# ─────────────────────────────────────────

def hill_saturation(x: np.ndarray, alpha: float, beta: float) -> np.ndarray:
    """
    Hill 饱和曲线，捕捉边际递减效应
    
    Args:
        x: 输入投放量（已 Adstock 变换后）
        alpha: 形状参数 (>0)，控制 S 型曲线斜率
        beta: 半饱和点 (>0)，x=beta 时 Hill=0.5
    
    Returns:
        saturated: 饱和后效果值 ∈ [0, 1)
    """
    x_alpha = np.power(np.maximum(x, 1e-10), alpha)
    beta_alpha = np.power(beta, alpha)
    return x_alpha / (x_alpha + beta_alpha)


# ─────────────────────────────────────────
# 核心组件 3: 简化 MMM 模型（OLS）
# ─────────────────────────────────────────

class SimpleMMM:
    """
    简化版 Marketing Mix Model
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2510.13087 — DeepCausalMMM: A Deep Learning Framework for Marketing Mix Modeling with Causal Structure Learning

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：8 周以上的渠道级周度投放金额与周度销售额（SKU 级），覆盖 3-5 个渠道；另需促销节点标记（Prime Day、黑五、圣诞）用于识别外生冲击。

**输出**：各渠道的衰减率、饱和阈值与形状参数、当周贡献与累计 carryover 贡献的拆分、多方案预算模拟的 Pareto 最优结果；供运营与投放负责人决定延续或关停投放。

## 执行步骤

1. 对齐渠道级周度投放与销售额数据
2. 对投放做 Adstock 几何衰减变换
3. 拟合 Hill 饱和曲线估计边际递减效应
4. 拆分当周贡献与 carryover 贡献并校正 ROAS
5. 模拟预算方案并输出 Pareto 最优分配

## 边界与不做

- 何时不用：只有一两周投放数据、或渠道频繁变更导致序列断裂时无法拟合衰减率，先积累数据。
- 能力边界：本技能产出渠道级参数与预算模拟，不做投放执行，也不给出用户级归因。
- 数据边界：渠道日与周粒度对齐、促销节点标记缺失会让参数不可信，需先解决数据清洗与粒度对齐。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting
- **延伸**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Ad-Spend-Time-Series-Attribution

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：13-广告分析　·　源卡：`Skill-Ad-Spend-Time-Series-Attribution`