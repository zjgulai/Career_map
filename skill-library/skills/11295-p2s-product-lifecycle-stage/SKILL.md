---
name: "p2s-product-lifecycle-stage"
title: "Skill-Product-Lifecycle-Stage"
description: "触发词：生命周期阶段、进入时机、换代预警、BSR 趋势、成长与衰退。何时不用：只需品类容量数字用「Market Size Estimation」；要在品类之间排机会优先级用「品类机会评分引擎」。安全边界：时序长度不足时必须输出数据不足而非猜测；阶段标签只是判断依据，退出与换代动作由业务决策层执行。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-022"
l3_business: "市场机会评估"
l3_all: "市场机会评估 / 生命周期分析"
l1_l2_l3: "业务运营/产品与创新/市场机会评估"
p2s_card_id: "Skill-Product-Lifecycle-Stage"
p2s_src_domain: "06-增长模型"
quality_tier: "preview"
user_summary: "把品类的销量与排名时间序列分解成趋势和季节，判断它处在引入、成长、成熟还是衰退期，并给出进场或换代时机建议。"
user_try: "试试：判断 baby UV-C sterilizer 现在处于生命周期哪个阶段，现在进场是 GO 还是 WAIT。"
whenToUse: "要判断品类或主力 SKU 处于哪个生命周期阶段、该不该现在进场、要不要启动换代时用本技能；若只需品类容量与可达市场，用「Market Size Estimation」；若要做品类间机会排序，用「品类机会评分引擎」。"
workflow: "收集品类月度搜索量、Top 10 竞品 BSR 或 Review 增速与竞品数量（近 24 个月） → 用 STL 分解剥离大促季节性并提取趋势项 → 用微分分析定位成长、成熟、衰退的阶段边界并计算 AVM 代理特征 → 输出阶段标签与置信度 → 给出 GO/WAIT/NO-GO 时机建议或换代预警"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Product-Lifecycle-Stage

## ① 解决的问题

业务问题：考虑进入 baby UV-C sterilizer 品类，不知道该品类处于哪个 PLC 阶段，是该现在进还是已经过了最佳时机

## ② 核心算法逻辑

核心思想：把一个 SKU 或品类的销量时间序列，分解为趋势+季节+残差三层信号，通过微分分析（斜率变化率）自动定位「成长→成熟→衰退」的阶段边界，并用年龄销量矩（AVM）作为阶段状态的低成本代理特征，最终输出四阶段标签（引入/成长/成熟/衰退）+ 进入时机决策建议。

## ③ 业务应用场景

- 业务问题：考虑进入 baby UV-C sterilizer 品类，不知道该品类处于哪个 PLC 阶段，是该现在进还是已经过了最佳时机。 - 数据要求： - 品类月度搜索量（Google Trends 指数，近 24 个月） - Top 10 竞品的月度 BSR 排名或 Review 增速（近 24 个月） - 竞品数量（同类 ASIN 数，近 24 个月） - 预期产出： - 当前阶段标签（引入/成长/成熟/衰退） - 阶段置信度（基于斜率比和 AVM 特征） - 进入时机建议（GO/WAIT/NO-GO + 理由） - 业务价值：避免在衰退期进入，节省产品开发 + 认证 + 首批备货成
场景 B：在售 SKU 生命周期监控（换代预警）
- 业务问题：主力 SKU baby sterilizer Pro 已上市 18 个月，近 3 个月 BSR 在下滑，不确定是暂时性的还是进入衰退期，是否该启动换代新品研发。 - 数据要求：该 SKU 每周 BSR 排名（或 Review 增速）近 24 个月 - 预期产出： - 当前阶段 + 进入该阶段的月份数 - 衰退斜率/成熟斜率比值（>3× 触发换代预警） - 预测剩余「有效生命期」（基于历史同类 SKU 衰退速度） - 业务价值：新品研发周期约 8-12 个月，提前 6 个月发出换代预警可确保无断档期

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
避免衰退期进入：baby UV wand 品类已进入衰退（FDA 召回 + 竞品清仓），若误判为成长期进入，首批备货+认证成本损失约 $20,000-$50,000
准确判断成长期进入时机：UV-C 密闭消毒器品类当前成长期，提前 6-12 个月进入比成熟期进入预期 LTV 高 2-3×
换代预警价值：提前 6 个月发出衰退预警，节省新品研发断档期销售损失约 $5,000-$15,000/月
实施难度：⭐⭐☆☆☆（2/5）— STL+微分分析，纯数值计算，无需 GPU/大数据
优先级评分：⭐⭐⭐⭐⭐（5/5）— WF-D 选品扫描的核心前置决策，缺失此 Skill 等于盲目进入品类

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（319 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：6」并记录位置 `paper2skills-code/growth_model/product_lifecycle_stage` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-Product-Lifecycle-Stage.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Skill-Product-Lifecycle-Stage
基于 arXiv:2511.16248 (PhaseFormer, AAAI 2025) + arXiv:2511.17275 (AVM, 2025)
母婴跨境电商品类/SKU 生命周期阶段检测
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Optional
from enum import Enum

try:
    from statsmodels.tsa.seasonal import STL
    HAS_STATSMODELS = True
except ImportError:
    HAS_STATSMODELS = False
    print("提示: pip install statsmodels 启用 STL 分解，当前使用简化版")


class PLCStage(Enum):
    INTRODUCTION = "引入期"
    GROWTH       = "成长期"
    MATURITY     = "成熟期"
    DECLINE      = "衰退期"
    UNKNOWN      = "数据不足"


@dataclass
class PLCResult:
    sku_id: str
    current_stage: PLCStage
    confidence: float          # 0-1
    months_in_stage: int
    growth_rate_mom: float     # 最近3个月平均月增速
    slope_ratio: Optional[float]  # 衰退斜率/成熟斜率，>3× 为强衰退信号
    avm_score: float           # 年龄-销量矩归一化值
    decision: str              # GO / WAIT / NO-GO
    rationale: str
    warning: Optional[str] = None


# ── STL 分解（剥离大促季节性）─────────────────────────────
def decompose_trend(sales: np.ndarray, period: int = 12) -> np.ndarray:
    """
    STL 分解提取趋势项，剥离促销季节性噪声。
    Y_t = T_t + S_t + R_t，返回 T_t。
    """
    if len(sales) < period * 2:
        # 数据不足时用移动平均代替
        window = min(3, len(sales))
        return pd.Series(sales).rolling(window, center=True, min_periods=1).mean().values

    if HAS_STATSMODELS:
        stl = STL(sales, period=period, robust=True)
        result = stl.fit()
        return result.trend
    else:
        # 简化版：中心移动平均
        return pd.Series(sales).rolling(period, center=True, min_periods=1).mean().values
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2511.16248。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：品类月度搜索量（Google Trends 指数，近 24 个月）、Top 10 竞品的月度 BSR 排名或 Review 增速（近 24 个月）、同类 ASIN 竞品数量；监控在售 SKU 时需该 SKU 近 24 个月的每周 BSR 或 Review 增速。

**输出**：当前阶段标签（引入/成长/成熟/衰退）、阶段置信度、进入该阶段的月份数、衰退斜率与成熟斜率比值，以及 GO/WAIT/NO-GO 时机建议或换代预警与剩余有效生命期估计。

## 执行步骤

1. 收集品类或 SKU 近 24 个月的时序数据
2. 用 STL 分解剥离季节性并提取趋势项
3. 用斜率变化率定位成长、成熟与衰退边界
4. 计算 AVM 特征并给出阶段置信度
5. 输出进入时机建议或换代预警

## 边界与不做

- 时序不足 24 个月或竞品样本过少时不适用，会返回数据不足而不是给出结论
- 输出的是阶段标签与时机建议，不含成败归因，也不执行退出或换代动作
- BSR 与搜索量只是代理指标，平台口径变化会影响阶段判定，需交叉验证

## 技能关联

- **前置**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Category-Trend-Forecasting.html、Skill-Category-Trend-Forecasting、Skill-Competitor-Product-Intelligence.html、Skill-Competitor-Product-Intelligence、Skill-Market-Size-Estimation.html、Skill-Market-Size-Estimation、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-Time-Series-Anomaly-Detection.html、Skill-Time-Series-Anomaly-Detection
- **延伸**：Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Category-Trend-Forecasting.html、Skill-Category-Trend-Forecasting、Skill-Competitor-Product-Intelligence.html、Skill-Competitor-Product-Intelligence、Skill-Market-Size-Estimation.html、Skill-Market-Size-Estimation、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring
- **可组合**：Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Competitor-Product-Intelligence.html、Skill-Competitor-Product-Intelligence、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-Product-Lifecycle-Stage

---

> 分类：业务运营/产品与创新/市场机会评估　·　技术族：06-增长模型　·　源卡：`Skill-Product-Lifecycle-Stage`