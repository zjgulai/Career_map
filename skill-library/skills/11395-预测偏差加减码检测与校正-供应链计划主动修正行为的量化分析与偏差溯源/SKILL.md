---
name: "p2s-forecast-bias-adjustment-detection"
title: "预测偏差加减码检测与校正 — 供应链计划主动修正行为的量化分析与偏差溯源"
description: "触发词：人工修正评估、加减码分析、修正TheilU、系统性偏差、最优修正系数。何时不用：要建立准确率口径与行业对标用「预测准确率MAPE体系」，做上线后漂移修正用「自适应预测精准化」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 供需协调"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Forecast-Bias-Adjustment-Detection"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "算清楚人工给预测打折加码到底有没有用，有害的修正就停掉，把最优修正系数写进流程。"
user_try: "试试：把我 12 个月的原始预测、修正后计划和实际销量拿来，评估人工修正是否有益并给出最优修正系数。"
whenToUse: "本卡属需求预测的供需协调侧：需要评估人工加减码的盈亏、给预测修正流程定规则时用；建立准确率口径与行业对标用准确率体系类技能。"
workflow: "收集原始预测（修正前）、执行计划（修正后）与实际销量 → 计算预测准确率与系统性偏差 → 计算修正 Theil's U，判断修正有益还是有害 → 量化最优修正系数并更新预测 SOP"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 预测偏差加减码检测与校正 — 供应链计划主动修正行为的量化分析与偏差溯源

## ① 解决的问题

供应链团队凭经验打折预测反而可能比直接使用原始预测更差——修正Theil's U量化人工修正价值（>1说明修正有害），发现有害修正后停止此类干预使计划准确率提升约5-8%

## ② 核心算法逻辑

书籍核心洞察（陈凤霞）：供应链团队在拿到销售预测后，往往会主动"打折"（认为预测偏高而缩减）或"加码"（认为保险起见而扩大）。书中将这种行为称为加减码（Supply Chain Adjustment），并明确指出：加减码本身不是问题，问题是加减码行为是否有依据、是否带来正向效果。如果供应链团队的历史修正总是让预测变得更差（即修正后的计划准确率低于原始预测准确率），那么这种"经验调整"实际上是在增加误差而非减少。

## ③ 业务应用场景

- 业务问题：某卖家月末经常发现库存积压，运营声称"预测做得很好"，但实际供应链分析发现销售团队的月度预测平均高出实际28%（系统性乐观偏差） - 检测应用： 1. 计算过去12个月每月的FA：平均72%（28%偏差） 2. 计算修正后的PA（供应链后来打折了80%执行）：平均78%（修正有益！） 3. 但仍有22%误差，且修正系数本身也有偏差（打折80%基于经验，实际应打折74%） 4. 量化最优修正系数：0.74，更新供应链SOP - 预期产出：计划准确率从78%提升至84%，库存积压减少约20%
场景B：加减码行为影响评估（是否应该保留人工修正）
- 业务问题：管理层质疑"为什么需要人工修正预测？"，想了解供应链团队的修正到底有没有价值 - 算法评估：计算修正Theil's U： - 吸奶器品类：U=0.85（修正有益，保留） - 婴儿服装品类：U=1.12（修正有害！去掉人工修正） - 婴儿食品品类：U=0.97（基本无效，建议自动化替代）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：发现"有害修正"后停止此类人工干预，直接使计划准确率提升约5-8%；以月GMV$50万计算，准确率每提升1%≈$5000价值；系统$1万，ROI>400%
实施难度：⭐⭐☆☆☆（只需历史预测+实际数据；主要挑战是记录每次人工修正前后的原始预测值）
优先级：⭐⭐⭐⭐⭐（书中第五章专章讲解，是供应链计划管理的"元认知"——知道自己的决策质量）
适用规模：所有有人工预测修正流程的组织，特别是销售与供应链存在"博弈"的团队
数据依赖：原始销售预测（修正前）、最终执行计划（修正后）、实际销售数据（结果）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（207 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/supply_chain/forecast_bias_adjustment_detection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Forecast-Bias-Adjustment-Detection.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
预测偏差加减码检测与校正
基于《全链路管理》陈凤霞 第五章第一节
FA vs PA对比 + 修正Theil's U + 最优修正系数
"""
import numpy as np
import pandas as pd
from scipy import stats
from typing import Dict, List, Optional, Tuple
import warnings
warnings.filterwarnings('ignore')


class ForecastBiasAnalyzer:
    """预测偏差与加减码分析器"""

    @staticmethod
    def forecast_accuracy(forecasts: np.ndarray, actuals: np.ndarray) -> float:
        """计算预测准确率FA"""
        if len(actuals) == 0:
            return 0.0
        errors = np.abs(forecasts - actuals) / np.maximum(actuals, 1)
        return float(1 - np.mean(errors))

    @staticmethod
    def mean_bias(forecasts: np.ndarray, actuals: np.ndarray) -> float:
        """计算系统性偏差（正=乐观偏高，负=悲观偏低）"""
        biases = (forecasts - actuals) / np.maximum(actuals, 1)
        return float(np.mean(biases))

    @staticmethod
    def theil_u_ratio(forecasts: np.ndarray, plans: np.ndarray,
                       actuals: np.ndarray) -> float:
        """
        修正Theil's U统计量
        <1: 修正优于原始预测
        =1: 修正与原始预测等效
        >1: 修正劣于原始预测（有害修正）
        """
        rmse_forecast = np.sqrt(np.mean((forecasts - actuals) ** 2))
        rmse_plan = np.sqrt(np.mean((plans - actuals) ** 2))
        if rmse_forecast == 0:
            return 1.0
        return float(rmse_plan / rmse_forecast)

    def compute_optimal_adjustment_factor(self, forecasts: np.ndarray,
                                           actuals: np.ndarray,
                                           min_factor: float = 0.5,
                                           max_factor: float = 1.5) -> Dict:
        """
        计算历史最优修正系数
        通过网格搜索找到使PA最高的乘数因子
        """
        best_factor = 1.0
        best_pa = self.forecast_accuracy(forecasts, actuals)

        for factor in np.arange(min_factor, max_factor, 0.02):
            adjusted = forecasts * factor
            pa = self.forecast_accuracy(adjusted, actuals)
            if pa > best_pa:
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:1906.09237。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：原始销售预测（修正前）、最终执行计划（修正后）、实际销售数据；SKU 或品类×月粒度，卡面示例用过去 12 个月数据。

**输出**：原始预测准确率与修正后计划准确率的对比、系统性偏差量化、修正 Theil's U 判定（有益/有害/无效）与最优修正系数，输出给供应链计划与销售协同团队更新 SOP。

## 执行步骤

1. 收集原始预测、修正后计划与实际销量三类数据。
2. 计算预测准确率与系统性偏差（乐观或悲观方向）。
3. 计算修正 Theil's U，判断人工修正是否有益。
4. 量化最优修正系数，更新供应链预测 SOP。

## 边界与不做

- 何时不用：没有记录每次人工修正前后的原始预测值时无法归因，不适用本技能。
- 能力边界：Theil's U 判断的是历史修正效果，不保证未来同样成立；停掉有害修正后仍需重建预测评审机制。

## 技能关联

- **前置**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Logistics-Plan-Three-Dimension-Accuracy.html、Skill-Logistics-Plan-Three-Dimension-Accuracy、Skill-ML-AB-Randomization-Test.html、Skill-ML-AB-Randomization-Test、Skill-Promo-Stocktaking-SOP-Automation.html、Skill-Promo-Stocktaking-SOP-Automation、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning
- **延伸**：Skill-ML-AB-Randomization-Test.html、Skill-ML-AB-Randomization-Test、Skill-Promo-Stocktaking-SOP-Automation.html、Skill-Promo-Stocktaking-SOP-Automation、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning
- **可组合**：Skill-ML-AB-Randomization-Test.html、Skill-ML-AB-Randomization-Test、Skill-Promo-Stocktaking-SOP-Automation.html、Skill-Promo-Stocktaking-SOP-Automation、Skill-Forecast-Bias-Adjustment-Detection

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：04-供应链　·　源卡：`Skill-Forecast-Bias-Adjustment-Detection`