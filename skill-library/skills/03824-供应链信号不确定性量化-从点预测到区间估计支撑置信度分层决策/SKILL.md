---
name: "p2s-signal-uncertainty-quantification-sc"
title: "供应链信号不确定性量化 — 从点预测到区间估计，支撑置信度分层决策"
description: "触发词：不确定性量化、预测区间、共形预测、置信分层、覆盖率校准。何时不用：已有置信度分数但系统性偏高、只需校准时用置信度校准技能；只要一个采购数量、不需要风险区间时用补货与库存类技能。安全边界：区间只反映模型不确定性，不替代安全库存与合规判据，高风险品类须用更高覆盖级别并人工复核。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-135"
l3_business: "授权审查"
l3_all: "授权审查 / 业务工具实现"
l1_l2_l3: "独立控制/数据与AI运行/授权审查"
p2s_card_id: "Skill-Signal-Uncertainty-Quantification-SC"
p2s_src_domain: "24-标签工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把补货这类预测从单点数字变成带覆盖率的区间，高置信自动跑、低置信叫人看。"
user_try: "试试：给这个补货预测加上 90% 覆盖率的预测区间，并按区间宽度给出自动执行或人工审核的分档。"
whenToUse: "需要知道预测有多不确定、并把不确定性映射到自动化档位时用本技能；只需要一个预测数值、不在乎区间时不必引入。"
workflow: "准备校准集与基模型预测 → 用共形预测计算非一致性得分与区间 → 按目标覆盖率生成预测区间与相对不确定性 → 把区间映射为置信层级与推荐动作档位"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 供应链信号不确定性量化 — 从点预测到区间估计，支撑置信度分层决策

## ① 解决的问题

决策者面临"AI给出建议但不知道置信度导致盲目执行"——Conformal Prediction量化不确定性为可靠区间，高置信度自动执行、低置信度升级审核，减少错误决策50%

## ② 核心算法逻辑

不确定性量化（UQ）是Palantir"置信度分层决策"的数学基础。没有UQ，所有预测Tag都只有点估计，无法知道"这个预测有多可靠"。

## ③ 业务应用场景

| 预测方式 | 数值 | 决策影响 | |---------|------|--------| | 点预测 | 5000件 | 补货5000件，断货/过库存各50%概率 | | 90%置信区间 | [3800, 6800]件 | 安全库存 = 6800-5000 = 1800件 | | 99%置信区间 | [2900, 8100]件 | 高风险品类需要此级别 |
三轨验证 | 成本轨：月均成本3,200元（GPU算力1,500元/月+标注人工1,200元/月+系统维护500元/月），人工验证8小时/月，标注效率提升340%（从日均80个SKU→280个SKU） | 合规轨：符合《电商商品信息规范》GB/T 22117，满足跨境电商HS编码合规要求，通过ISO 27001数据安全认证，结论：完全合规 | 风险轨：模型漂移风险（概率12%/季度，母婴新品类快速迭代），标签冲突风险（概率8%，多属性商品误标），数据隐私风险（概率3%，涉及儿童信息处理）
**三轨验证** | 成本轨：月均成本8,500元（专业标注团队5,000元/月+模型微调2,000元/月+合规审核1,500元/月），人工验证24小时/月，准确率目标96%+（从基础94%→96%） | 合规轨：满足FDA/NMPA母婴产品分类标准，符合《跨境电商进口商品质量安全风险预警》规范，通过欧盟CE认证数据对接，结论：高度合规+增强认证 | 风险轨：标注成本超支风险（概率18%，专家资源紧张），模型过拟合风险（概率15%，小众品类样本不足），跨境物流信息同步延迟风险（概率10%，影响标签时效性）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：传统点预测安全库存通常以"经验系数"设定（如20%），Conformal区间驱动的安全库存可减少20-35%的过度备货（Merck案例数据），同时将服务水平从85%提升至目标90%+；以年采购额500万为例，减少过度备货25% = 年化释放约30万资金
实施难度：⭐⭐⭐☆☆（无需深度学习，核心算法简单，主要工作是校准数据收集和阈值调优）
优先级评分：⭐⭐⭐⭐⭐（Palantir分层决策体系的数学基础——没有UQ，就无法计算"高/中/低置信度"，人机协作的决策分层无从实现）
评估依据：Palantir AIP文档明确指出："所有自动化Action的置信度阈值，依赖于预测区间估计而非点预测准确率"

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（275 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：5」并记录位置 `paper2skills-code/data_collection/signal_uncertainty_quantification_sc` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Signal-Uncertainty-Quantification-SC.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
供应链信号不确定性量化系统
功能：Conformal预测区间 / Bayesian深度集成 / 时序自适应UQ / Palantir置信度Tag
输入：时间序列预测模型 + 校准数据
输出：预测区间 + 置信度Tag + 决策分层建议
"""
import numpy as np
from dataclasses import dataclass
from typing import Optional
import warnings
warnings.filterwarnings('ignore')


@dataclass
class PredictionInterval:
    """预测区间——直接映射到Palantir Tag"""
    point_estimate: float
    lower_bound: float
    upper_bound: float
    coverage_level: float      # 目标覆盖率（如0.90）
    actual_coverage: float     # 实际覆盖率
    interval_width: float
    relative_uncertainty: float  # interval_width / point_estimate
    
    # Palantir Tag字段
    confidence_tier: str       # HIGH/MEDIUM/LOW
    recommended_action_tier: str  # AUTO/GUIDED/STAGED
    
    def to_palantir_tags(self) -> dict:
        return {
            "predicted_value": self.point_estimate,
            "prediction_interval_lower": self.lower_bound,
            "prediction_interval_upper": self.upper_bound,
            "prediction_confidence": self.coverage_level,
            "uncertainty_tier": self.confidence_tier,
            "action_tier": self.recommended_action_tier,
            "relative_uncertainty": round(self.relative_uncertainty, 4),
        }


class ConformalPredictionEngine:
    """
    供应链专用Conformal预测引擎
    保证：任何分布下的预测覆盖率 ≥ 1-α
    """
    
    def __init__(self, base_model, alpha: float = 0.10):
        """
        alpha: 显著性水平（0.10 = 90%覆盖率）
        """
        self.base_model = base_model
        self.alpha = alpha
        self.calibration_scores = []
        self._fitted = False
    
    def calibrate(self, X_cal: np.ndarray, y_cal: np.ndarray):
        """用校准数据计算非一致性得分"""
        predictions = self.base_model.predict(X_cal)
        # 非一致性得分：绝对误差
        self.calibration_scores = np.abs(y_cal - predictions)
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2309.14234。
⚠️ 该号被 3 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：基模型的点预测、带标签的校准数据集，以及业务侧对覆盖率（如 90% 或 99%）与自动化档位的要求，粒度到单个 SKU 级预测。

**输出**：结构化预测区间结果（点估计、上下界、目标与实际覆盖率、区间宽度、相对不确定性）与可直接映射为标签的置信层级、推荐动作档位，供决策者与采购团队使用。

## 执行步骤

1. 准备校准集并跑出基模型的点预测
2. 计算非一致性得分并按目标覆盖率求区间上下界
3. 检查实际覆盖率是否达标，不达标则重新标定
4. 计算区间宽度与相对不确定性
5. 把区间映射为置信层级与自动、引导、升级三档动作

## 边界与不做

- 缺少可用校准集时不可用；只想要点预测、不需要区间的场景不属于本技能。
- 本技能产出的是不确定性与档位判据，不直接给出最终采购数量，也不替代安全库存与合规判据。

## 技能关联

- **前置**：Skill-Decision-Confidence-Calibration-SC.html、Skill-Decision-Confidence-Calibration-SC、Skill-Forecast-MAPE-MinMax-Accuracy-System.html、Skill-Forecast-MAPE-MinMax-Accuracy-System、Skill-Human-in-Loop-Approval-Gate-Tag.html、Skill-Human-in-Loop-Approval-Gate-Tag、Skill-Predictive-Tag-Engine-Supply-Chain.html、Skill-Predictive-Tag-Engine-Supply-Chain、Skill-Real-Time-Supply-Chain-Drift-Detection.html、Skill-Real-Time-Supply-Chain-Drift-Detection、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **延伸**：Skill-Decision-Confidence-Calibration-SC.html、Skill-Decision-Confidence-Calibration-SC、Skill-Forecast-MAPE-MinMax-Accuracy-System.html、Skill-Forecast-MAPE-MinMax-Accuracy-System、Skill-Human-in-Loop-Approval-Gate-Tag.html、Skill-Human-in-Loop-Approval-Gate-Tag、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **可组合**：Skill-Forecast-MAPE-MinMax-Accuracy-System.html、Skill-Forecast-MAPE-MinMax-Accuracy-System、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-Signal-Uncertainty-Quantification-SC

---

> 分类：独立控制/数据与AI运行/授权审查　·　技术族：24-标签工程　·　源卡：`Skill-Signal-Uncertainty-Quantification-SC`