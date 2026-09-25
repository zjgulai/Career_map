---
name: "p2s-multi-objective-budget-allocation"
title: "Multi-Objective Budget Allocation（多目标预算分配）"
description: "触发词：多目标预算、Pareto前沿、目标权重、品牌搜索量、新品冷启动曝光。何时不用：只有一个优化目标或渠道贡献系数无法估计时不适用；冲突只在毛利口径时用MMM预算利润对齐。安全边界：目标权重是业务价值判断须跨部门对齐，本卡只产出分配方案不执行投放，也不替业务方决定权重。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 资源情景比较"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
p2s_card_id: "Skill-Multi-Objective-Budget-Allocation"
p2s_src_domain: "15-营销投放分析"
quality_tier: "preview"
user_summary: "让预算同时服务短期 ROI、品牌搜索量和新品曝光三个目标，扫描 Pareto 前沿找平衡点。"
user_try: "试试：Q4黑五预算50万元，要同时满足当周销售额、品牌搜索量提升和新推车首月曝光，帮我做多目标分配。"
whenToUse: "当同一笔预算要同时满足两三个互相制约的目标（短期 ROI、品牌资产、新品冷启动）时用本卡；只有单一目标时用常规预算优化；需要按渠道饱和度做阈值触发调整用再分配触发器。"
workflow: "汇总各渠道三项目标贡献系数与半饱和点 → 设定本期各目标权重并跨部门对齐 → 计算各渠道饱和度调整后的三项效能 → 在总预算约束下做加权多目标优化 → 扫描 Pareto 前沿输出推荐分配与预期达成"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Multi-Objective Budget Allocation（多目标预算分配）

## ① 解决的问题

$30 万月预算要同时做三件事——黑五冲销量（短期 ROI）、母婴博主种草（品牌搜索量）、新款吸奶器 S2 预热（新品曝光）

## ② 核心算法逻辑

跨境母婴电商的广告预算分配必须同时优化三个相互制约的目标：短期转化ROI（现金流）、品牌搜索量提升（长期资产）、新品冷启动曝光（增长引擎），而非单一目标最大化。多目标优化通过Pareto前沿扫描找到三维目标空间中的最优tradeoff曲面。

## ③ 业务应用场景

业务问题： 某母婴跨境品牌（婴儿推车品类）获得Q4黑五预算50万元，需同时完成三个KPI： - 黑五当周销售额目标 150万元（ROI ≥ 3:1） - 品牌搜索词"best baby stroller"月搜索量从500增至2000（+300%） - 新款轻便推车S3冷启动，首月曝光量达500万次
| 渠道 | ROI贡献系数 | 品牌搜索提升系数 | 新品曝光系数 | 历史半饱和点 | |------|-----------|--------------|----------|---------| | Facebook | 2.8 | 0.15 | 0.08 | 12万 | | Google Shopping | 3.5 | 0.45 | 0.05 | 8万 | | Amazon DSP | 2.2 | 0.35 | 0.12 | 10万 | | TikTok Shop | 1.8 | 0.08 | 0.65 | 15万 | | YouTube Pre-roll | 1.2 | 0.2
多目标权重设定（黑五期）： - $w_1=0.55$（短期ROI优先，现金流压力大） - $w_2=0.25$（品牌搜索量，为双11蓄力） - $w_3=0.20$（新品曝光，S3作为高毛利产品）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

直接收益：避免单目标短视决策导致的品牌价值损失，年化隐性品牌资产增值 50-80万元
间接收益：通过平衡投资，新品上市成功率提升 35-45%，相比单ROI优化模式，年度新品贡献额外 120-180万元
长期收益：品牌搜索词积累形成的SEO资产，3年内贡献 300-500万元（无需持续投放）
数据准备难度中等（需6个月历史数据）
算法实现难度低（标准优化库）
业务协调难度中等（需跨部门对齐权重设定）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（345 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/marketing/multi_objective_budget_allocation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/15-营销投放分析/Skill-Multi-Objective-Budget-Allocation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Multi-Objective Budget Allocation for Cross-Border Baby E-commerce
基于Pareto前沿的多目标预算分配优化框架
"""

import numpy as np
import pandas as pd
from scipy.optimize import minimize, LinearConstraint, Bounds
from typing import Dict, Tuple, List
import json


class MultiObjectiveBudgetAllocator:
    """多目标预算分配优化器"""
    
    def __init__(
        self,
        channel_names: List[str],
        contribution_matrix: np.ndarray,
        saturation_points: np.ndarray,
        total_budget: float
    ):
        """
        初始化
        
        Args:
            channel_names: 渠道名称列表，如['Facebook', 'Google', 'TikTok']
            contribution_matrix: (n_channels, 3) 矩阵，三列分别为ROI/Brand/NewProduct贡献系数
            saturation_points: (n_channels,) 各渠道半饱和预算点（万元）
            total_budget: 总预算（万元）
        """
        self.channel_names = channel_names
        self.contribution_matrix = contribution_matrix
        self.saturation_points = saturation_points
        self.total_budget = total_budget
        self.n_channels = len(channel_names)
        self.n_objectives = 3
        
    def _saturation_adjustment(self, budget_allocation: np.ndarray) -> np.ndarray:
        """
        计算饱和度调整系数
        效能系数 = 1 - exp(-x_i / λ_i)
        
        Args:
            budget_allocation: (n_channels,) 预算分配向量
            
        Returns:
            (n_channels,) 饱和度调整系数
        """
        return 1 - np.exp(-budget_allocation / self.saturation_points)
    
    def _objective_function(
        self,
        budget_allocation: np.ndarray,
        weights: np.ndarray
    ) -> float:
        """
        计算加权多目标函数值（负值，用于最小化）
        
        Args:
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：渠道清单、各渠道对三项目标（ROI、品牌搜索、新品曝光）的贡献系数矩阵、各渠道历史半饱和预算点与总预算，以及本期三项目标权重（如黑五期 0.55、0.25、0.20）。

**输出**：各渠道的最优预算分配向量、各目标的预期达成度，以及不同权重或风险水平下的 Pareto 前沿方案，供跨部门决策会选定最终方案。

## 执行步骤

1. 汇总各渠道对 ROI、品牌搜索与新品曝光的贡献系数
2. 采集各渠道历史半饱和预算点与本期总预算
3. 设定本期三项目标权重并与相关部门对齐
4. 用饱和度调整系数构造各渠道三项效能函数
5. 在总预算约束下求解加权多目标最优分配
6. 扫描 Pareto 前沿给出推荐分配与各目标预期达成

## 边界与不做

- 何时不用：只有单一目标、或渠道对某项目标的贡献系数无法估计时不适用。
- 能力边界：权重设定属业务价值判断，须跨部门对齐，本卡不替业务方决定权重；只产出分配方案，不执行投放。
- 数据边界：需要至少 6 个月历史数据估计半饱和点，数据不足时前沿扫描结果不可靠。

## 技能关联

- **前置**：Skill-Channel-Saturation-Curve.html、Skill-Channel-Saturation-Curve、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **延伸**：Skill-DARA-Agentic-MMM-Optimizer.html、Skill-DARA-Agentic-MMM-Optimizer、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Geo-Level-Marketing-Effectiveness.html、Skill-Geo-Level-Marketing-Effectiveness、Skill-Multi-Objective-Budget-Allocation

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：15-营销投放分析　·　源卡：`Skill-Multi-Objective-Budget-Allocation`