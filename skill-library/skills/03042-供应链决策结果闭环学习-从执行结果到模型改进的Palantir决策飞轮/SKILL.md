---
name: "p2s-decision-outcome-closed-loop-learning"
title: "供应链决策结果闭环学习 — 从执行结果到模型改进的Palantir决策飞轮"
description: "触发词：决策闭环、结果回流、倾向得分、双稳健估计、策略迭代。何时不用：只需给决策加审批留痕时用人工审批门控技能；只校准置信度分数时用置信度校准技能。安全边界：决策日志只含业务数据、不得包含个人隐私信息，模型更新须保留回滚与对照，避免过拟合放大偏差。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Decision-Outcome-Closed-Loop-Learning"
p2s_src_domain: "24-标签工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把每次决策执行后的结果收回来，从历史决策日志里反推哪种选择更好，让策略迭代快起来。"
user_try: "试试：把补货决策日志整理成决策记录，用双稳健估计评估不同补货量的结果，给出下一轮策略建议。"
whenToUse: "已有带执行结果与选择概率的决策日志、希望闭环改进策略时用本技能；只想加审批门控或校准置信度，用对应技能。"
workflow: "从审计日志提取决策记录与结果 → 计算每个决策被选择的倾向得分 → 拟合结果模型估计不同动作的结果 → 用双稳健估计评估策略并更新模型 → 回放验证后小步上线"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 供应链决策结果闭环学习 — 从执行结果到模型改进的Palantir决策飞轮

## ① 解决的问题

运营负责人面临决策学不会复盘——闭环学习将策略迭代周期从30天缩到7天，年化增利20万元

## ② 核心算法逻辑

决策结果闭环学习是Palantir"持续改进"的核心机制——不是每年一次模型更新，而是每次决策执行后都向系统学习。这形成了Palantir的"决策飞轮"：更好决策→更好结果→更好学习→更好模型→更好决策。

## ③ 业务应用场景

**三轨验证**： - **成本**：显性成本包括数据采集（审计日志存储、倾向得分计算，约¥3-5万/年）、计算资源（DR估计与在线模型更新，约¥1-2万/年）、人力（数据工程师与算法工程师维护，约¥15万/年）。总成本约¥20万/年，但自动化率提升40%可节省人力成本约¥20万/年，ROI为正。 - **合规**：不触碰Amazon政策、GDPR或广告法红线。决策日志仅包含业务数据（库存、需求、服务水平），不涉及个人隐私信息。倾向得分计算基于历史决策行为，无歧视性风险。需注意数据存储合规（如数据本地化要求）。 - **风险**：次生风险包括：①模型过度拟合导致决策偏差放大（如持续推荐高补货量

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：Palantir客户案例显示，实施决策闭环学习后，预测准确率每季度平均提升4-8%，6-12个月后整体决策自动化率从30%提升至70%+；以每次人工决策成本¥500元计算，年决策1000次的企业，自动化率提升40% = 节省人力成本约¥20万；更重要的是：模型持续改进避免了"模型腐化"——没有闭环学习的模型每年精度下降约15%
实施难度：⭐⭐⭐⭐☆（双重鲁棒估计在理论上成熟，关键难点是倾向得分估计的准确性；需要确保决策日志记录了选择概率）
优先级评分：⭐⭐⭐⭐⭐（Palantir"持续改进"的核心技术——没有闭环学习，Ontology系统会随时间退化；这是让"决策飞轮"真正转起来的机制）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（273 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：5」并记录位置 `paper2skills-code/data_collection/decision_outcome_closed_loop_learning` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Decision-Outcome-Closed-Loop-Learning.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
供应链决策结果闭环学习系统
功能：选择偏差纠正 / 双重鲁棒估计 / 在线模型更新 / 决策飞轮监控
输入：历史决策日志（含倾向得分）
输出：无偏因果效应估计 + 更新后模型 + 飞轮健康度报告
"""
import numpy as np
from dataclasses import dataclass, field
from collections import deque
import warnings
warnings.filterwarnings('ignore')


@dataclass
class DecisionRecord:
    """决策记录——从Palantir Audit Log中提取"""
    decision_id: str
    context: dict           # 特征向量（库存水平、需求预测等）
    action_taken: float     # 执行的决策值（如补货量）
    propensity_score: float # 该决策被选择的概率（e分数）
    outcome: float          # 实际结果（如服务水平）
    predicted_outcome: float # 模型预测的结果
    confidence_at_decision: float # 决策时的置信度


class DoublyRobustLearner:
    """
    双重鲁棒学习器
    纠正供应链历史数据中的选择偏差
    """
    
    def __init__(self, n_components: int = 5):
        self.n_components = n_components
        # 结果模型（预测不同action下的结果）
        self._outcome_params_treated = np.zeros(n_components)
        self._outcome_params_control = np.zeros(n_components)
        self._fitted = False
    
    def _extract_features(self, context: dict) -> np.ndarray:
        """从决策上下文中提取特征"""
        features = [
            context.get('inventory_level', 0) / 1000,
            context.get('predicted_demand', 0) / 1000,
            context.get('service_level_history', 0.9),
            context.get('season_index', 0.5),
            context.get('lead_time_days', 28) / 60,
        ]
        return np.array(features[:self.n_components])
    
    def fit(self, records: list):
        """用历史记录拟合结果模型"""
        if len(records) < 10:
            return self
        
        # 简化的线性结果模型
        treated = [r for r in records if r.action_taken > np.median([r.action_taken for r in records])]
        control = [r for r in records if r.action_taken <= np.median([r.action_taken for r in records])]
        
        if treated and control:
            X_treated = np.array([self._extract_features(r.context) for r in treated])
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2309.11823，但该号在 arXiv 上是《Low luminosity observation of BeXRB source IGR J21347+4737》，与本卡主题无关。
⚠️ 该号被 3 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：历史决策记录（决策 id、上下文特征、实际动作、倾向得分、实际结果、模型预测结果、决策时置信度）与业务结果指标，粒度到单条决策。

**输出**：策略评估结果、更新后的模型参数与改进建议（如补货量调整方向），供运营与算法团队迭代决策策略。

## 执行步骤

1. 从审计日志中提取决策记录与执行结果
2. 提取上下文特征并计算倾向得分
3. 拟合结果模型，估计不同动作下的结果
4. 用双稳健估计评估策略收益
5. 回放验证后用新策略替换旧策略

## 边界与不做

- 缺少倾向得分或结果回填的决策日志无法做闭环评估；决策频繁变动、日志不完整的场景不适用。
- 本技能产出策略评估与模型更新建议，不直接改写线上决策规则，也不对结果做因果之外的业务承诺。

## 技能关联

- **前置**：Skill-Causal-Decision-Graph-SC-Inference.html、Skill-Causal-Decision-Graph-SC-Inference、Skill-Decision-Audit-Trail-Ontology.html、Skill-Decision-Audit-Trail-Ontology、Skill-Decision-Confidence-Calibration-SC.html、Skill-Decision-Confidence-Calibration-SC、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Real-Time-Supply-Chain-Drift-Detection.html、Skill-Real-Time-Supply-Chain-Drift-Detection、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Supply-Chain-RLHF-Preference-Align
- **延伸**：Skill-Decision-Confidence-Calibration-SC.html、Skill-Decision-Confidence-Calibration-SC、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Real-Time-Supply-Chain-Drift-Detection.html、Skill-Real-Time-Supply-Chain-Drift-Detection、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Supply-Chain-RLHF-Preference-Align
- **可组合**：Skill-Decision-Confidence-Calibration-SC.html、Skill-Decision-Confidence-Calibration-SC、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Decision-Outcome-Closed-Loop-Learning

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：24-标签工程　·　源卡：`Skill-Decision-Outcome-Closed-Loop-Learning`