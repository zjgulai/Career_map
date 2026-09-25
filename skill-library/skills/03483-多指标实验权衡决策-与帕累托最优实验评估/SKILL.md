---
name: "p2s-multi-metric-experiment-tradeoff"
title: "多指标实验权衡决策 — OEC与帕累托最优实验评估"
description: "触发词：多指标权衡、OEC、护栏指标、帕累托最优、指标加权、发布裁定。何时不用：只关心单一北极星指标且无体验副作用时用常规显著性检验；尚未定义指标体系与权重时先做指标设计，不要套 OEC。安全边界：促销与价格实验须遵守平台限制（不得对同一用户展示不同价格）；OEC 权重应由跨部门委员会决定并定期回顾，避免指标操纵。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计 / 体验分析"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
p2s_card_id: "Skill-Multi-Metric-Experiment-Tradeoff"
p2s_src_domain: "02-A_B实验"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "多个指标互有胜负时，用加权 OEC 和护栏指标裁定该不该发布，避免只看 GMV 犯错。"
user_try: "试试：降价方案 GMV 高但满意度低、赠品方案相反，用 OEC 和护栏指标帮我裁定发哪个。"
whenToUse: "实验结果多指标互有胜负、需要统一裁定口径时用 OEC 加护栏框架；只判断单指标显著性时用常规检验；护栏指标尚未达成共识时先做指标设计。"
workflow: "定义成功指标与护栏指标及各自方向 → 设定 OEC 权重与护栏可接受退化阈值 → 汇总各组指标数据并校验置信区间 → 先判定护栏是否被击穿，再看加权得分 → 输出推荐方案与保留意见"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 多指标实验权衡决策 — OEC与帕累托最优实验评估

## ① 解决的问题

运营面临"GMV上升但用户体验下降的A/B结果团队争论无标准"——OEC+护栏框架量化多指标权衡，避免错误发布，年化LTV增量约80万元

## ② 核心算法逻辑

实际业务A/B实验几乎从不只看单一指标。"B方案GMV+3%但用户体验评分2%，是否上线？"这类多指标冲突决策，是工业界A/B测试的核心难题。

## ③ 业务应用场景

场景A：价格促销策略多指标评估 - 业务问题：吸奶器降价10% vs 买1送1赠品，两种促销方案：降价方案GMV+5%但单价下降，赠品方案GMV+3%但用户满意度+8%。运营团队争论不休，需要客观框架裁定 - 数据要求：实验组A/B的多个指标数据（GMV、订单量、平均单价、退货率、复购率、NPS分） - 预期产出：多指标权衡报告：赠品方案通过护栏（退货率不升），且在加权OEC（GMV权重0.5 + 复购权重0.3 + NPS权重0.2）上得分更高 → 推荐赠品方案 - 业务价值：避免因单指标决策损失长期价值；赠品方案复购率+4%对应年化LTV增量约80万元，远超单次GMV差异
三轨对抗验证： 1. 成本验证：多指标分析是数据处理问题，无额外边际成本；主要投入是指标体系设计和权重确定（一次性2-3天） 2. 合规验证：促销实验不涉及平台合规风险；注意亚马逊限制某些类型的价格实验（不能对同一用户展示不同价格） 3. 风险验证：OEC权重设置不当会导致"指标操纵"（团队优化权重高的指标而忽视真实价值）；建议权重由跨部门委员会决定，且每季度回顾一次
场景B：新功能上线多指标评估（护栏实验） - 业务问题：推出"月龄智能推荐"功能，对点击转化有提升但加载时间增加200ms - 护栏指标（不可降）：页面加载时间 < 3s（P95），退货率、客诉率 - 成功指标：点击转化率、复购率 - 预期产出：加载时间+200ms但仍<3s（护栏通过）；点击转化率+2.3%（成功指标显著）→ 推荐上线

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：避免因单指标优化导致的长期价值损失（如只看GMV忽视复购），估算年化LTV提升约80万元；OEC框架减少因团队利益争议导致的决策延迟约3天/次，每月节省约30%的讨论成本
实施难度：⭐⭐☆☆☆（核心是业务讨论（权重确定），技术实现简单）
优先级：⭐⭐⭐⭐☆（任何同时关注GMV和用户体验的团队必备框架）
评估依据：KDD 2013 Deng等人论文揭示微软Bing采用OEC后减少约30%的错误发布；KDD 2015 展示多指标实验在大规模社交网络的应用；LinkedIn、Netflix、Amazon均有公开的多指标实验框架

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（169 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-Multi-Metric-Experiment-Tradeoff
多指标A/B实验权衡决策 — OEC框架与帕累托分析

依赖：pip install numpy pandas scipy
"""

import numpy as np
import pandas as pd
from scipy import stats
from dataclasses import dataclass
from typing import Literal

np.random.seed(42)

# ── 1. 实验指标配置 ────────────────────────────────────────────────
@dataclass
class Metric:
    name: str
    display: str
    category: Literal['guardrail', 'success', 'secondary']
    direction: Literal['higher', 'lower']  # 哪个方向是好的
    oec_weight: float  # OEC权重（仅success指标有效）
    guardrail_max_degradation: float = 0.0  # 护栏指标允许的最大下降（比例）

METRICS = [
    Metric('gmv',           'GMV',        'success',   'higher', 0.40),
    Metric('repurchase_rate','复购率',     'success',   'higher', 0.30),
    Metric('nps',           'NPS分',      'success',   'higher', 0.20),
    Metric('ctr',           '点击转化率', 'success',   'higher', 0.10),
    Metric('return_rate',   '退货率',     'guardrail', 'lower',  0.0,  0.02),
    Metric('load_time_p95', '加载时间P95','guardrail', 'lower',  0.0,  0.05),
    Metric('complaint_rate','客诉率',     'guardrail', 'lower',  0.0,  0.01),
    Metric('cpc',           'CPC',        'secondary', 'lower',  0.0),
]

# ── 2. 生成模拟实验数据 ────────────────────────────────────────────
def generate_experiment_data(n_users=2000, true_effects=None):
    """生成A/B实验观测数据（多指标）"""
    if true_effects is None:
        true_effects = {}
    base = {
        'gmv': 120, 'repurchase_rate': 0.25, 'nps': 65,
        'ctr': 0.034, 'return_rate': 0.082, 'load_time_p95': 2.1,
        'complaint_rate': 0.018, 'cpc': 1.8
    }
    noise_scale = {
        'gmv': 30, 'repurchase_rate': 0.08, 'nps': 12,
        'ctr': 0.01, 'return_rate': 0.015, 'load_time_p95': 0.2,
        'complaint_rate': 0.005, 'cpc': 0.3
    }
    data = {}
    for group in ['A', 'B']:
        effect = true_effects if group == 'B' else {}
        data[group] = {}
        for m_name, m_base in base.items():
            delta  = effect.get(m_name, 0.0)
            sample = np.random.normal(m_base * (1 + delta), noise_scale[m_name], n_users)
            data[group][m_name] = np.maximum(sample, 0)
    return data
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：实验组与对照组的多个指标数据（GMV、订单量、平均单价、退货率、复购率、NPS 等），需标明指标方向（越高越好或越低越好）、护栏阈值与 OEC 权重，粒度到实验组级别。

**输出**：指标对照表、护栏是否通过的判定、加权 OEC 得分与帕累托前沿、推荐发布的方案及理由；供运营与产品团队在发布评审会上作裁定依据。

## 执行步骤

1. 定义成功指标、护栏指标及各自方向
2. 设定 OEC 权重与护栏最大可接受退化
3. 汇总各组指标数据并校验置信区间
4. 先判定护栏是否被击穿，再比较加权 OEC 得分
5. 输出推荐方案与需要保留的分歧意见

## 边界与不做

- 何时不用：单指标决策已足够，或团队对护栏指标本身没有共识时，先补指标体系设计，不要用加权得分掩盖分歧。
- 能力边界：本技能产出裁定建议与权重方案，不做线上放量、回滚和实验开关操作。
- 风险边界：权重设置不当会诱导团队优化高权重指标而忽视真实价值，权重需由跨部门委员会决定并每季度回顾。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Bayesian-AB-Testing.html、Skill-Bayesian-AB-Testing、Skill-Guardrailed-Uplift-Targeting.html、Skill-Guardrailed-Uplift-Targeting、Skill-Power-Analysis-Sample-Size.html、Skill-Power-Analysis-Sample-Size、Skill-STATE-Robust-Variance-Reduction.html、Skill-STATE-Robust-Variance-Reduction、Skill-Sequential-AB-Testing.html、Skill-Sequential-AB-Testing
- **延伸**：Skill-Bayesian-AB-Testing.html、Skill-Bayesian-AB-Testing、Skill-Guardrailed-Uplift-Targeting.html、Skill-Guardrailed-Uplift-Targeting、Skill-STATE-Robust-Variance-Reduction.html、Skill-STATE-Robust-Variance-Reduction、Skill-Sequential-AB-Testing.html、Skill-Sequential-AB-Testing
- **可组合**：Skill-Guardrailed-Uplift-Targeting.html、Skill-Guardrailed-Uplift-Targeting、Skill-STATE-Robust-Variance-Reduction.html、Skill-STATE-Robust-Variance-Reduction、Skill-Multi-Metric-Experiment-Tradeoff

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：02-A_B实验　·　源卡：`Skill-Multi-Metric-Experiment-Tradeoff`