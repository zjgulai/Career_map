---
name: "p2s-decision-confidence-calibration-sc"
title: "供应链决策置信度校准与分层触发 — 从置信度到人机分工的动态决策框架"
description: "触发词：置信度校准、分层触发、人机分工、低置信升级、温度缩放。何时不用：需要把不确定性表达成预测区间而不是校准置信分数时用信号不确定性量化技能；要设计审批流与留痕而不只是校准分数时用人工审批门控技能。安全边界：校准只使用模型输出 logits 与标签，不涉及用户隐私数据；校准数据分布漂移时须重新校准后再恢复自动执行。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-135"
l3_business: "授权审查"
l3_all: "授权审查 / 业务工具实现"
l1_l2_l3: "独立控制/数据与AI运行/授权审查"
p2s_card_id: "Skill-Decision-Confidence-Calibration-SC"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "把模型说过头的置信度校准回真实水平，再按校准后的档位决定哪些自动执行、哪些交给人。"
user_try: "试试：把补货模型的历史预测日志做一次温度缩放校准，并按校准后的置信度给出自动执行、通知、人工审批的分档阈值。"
whenToUse: "已有系统性偏高的置信度输出、需要校准到能支撑自动执行分档时用本技能；需要的是预测区间宽度而非置信分数时，用信号不确定性量化技能。"
workflow: "收集历史预测 logits 与真实标签 → 拟合温度参数完成置信度校准 → 按校准后置信度划分自动执行、自动加通知、人工审批三档 → 生成带 Action Type 映射的校准决策对象"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 供应链决策置信度校准与分层触发 — 从置信度到人机分工的动态决策框架

## ① 解决的问题

决策经理面临系统建议没把握——置信校准将低置信误用率从19%降到5%，年化省11万元

## ② 核心算法逻辑

置信度校准解决的核心问题：AI说"85%把握补货"，但实际上每次说85%时，真正正确的只有60%——这叫"过度自信（Overconfidence）"。未校准的置信度会导致Palantir分层决策体系的整体失效。

## ③ 业务应用场景

原始模型：预测"断货风险高"的置信度分布过度集中在85-95%区间
三轨验证： - 成本：校准仅需存储历史预测日志（约500MB/月）和一次离线计算（CPU 2小时），无额外API调用成本；Temperature Scaling无需重训练模型，边际成本极低 - 合规：不涉及用户隐私数据，仅使用模型输出logits和标签；符合Amazon Vendor Central数据使用条款（仅用于内部模型优化） - 风险：若校准数据分布与生产分布不一致（如大促期间），校准可能失效导致过度自信回升；需每季度重新校准一次
Black Friday期间，系统每小时处理500+个补货决策： - 置信度>95%：全自动执行（约300个） - 置信度85-95%：自动执行+通知（约150个） - 置信度<85%：推送给采购经理（约50个，可在移动端快速批准）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：通过校准，采购团队从"每天审批500个AI决策"→"只审批50个低置信度决策"，效率提升90%；同时避免高置信度决策错误，Merck案例中校准后采购失误率从8%降至2.3%；以年500个高影响决策、平均失误成本¥10万计，每年防止损失约¥350万
实施难度：⭐⭐☆☆☆（Temperature Scaling是最简单的校准方法，需要校准数据但无需重训练基础模型）
优先级评分：⭐⭐⭐⭐⭐（Palantir分层决策体系的核心枢纽——没有置信度校准，所有"自动/推荐/审批"的边界都是任意的；这是人机协作可信赖的数学基础）
评估依据：Palantir的"Trusted AI"框架明确要求所有Autonomous Action的置信度阈值必须基于校准后的概率，而非原始模型输出

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（249 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/data_collection/decision_confidence_calibration_sc` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Decision-Confidence-Calibration-SC.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
供应链决策置信度校准与分层触发系统
功能：Temperature Scaling校准 / ECE评估 / 置信度分层 / Palantir Action路由
输入：原始模型置信度 + 历史校准数据
输出：校准后置信度 + 决策层级 + Palantir Action建议
"""
import numpy as np
from dataclasses import dataclass
from typing import Optional
from enum import Enum
import warnings
warnings.filterwarnings('ignore')


class ActionTier(Enum):
    AUTONOMOUS = ("autonomous", ">95%", "全自动执行，事后审计")
    AUTO_WATCH = ("auto_watch", "85-95%", "自动执行，Watch窗口24h")
    GUIDED = ("guided", "70-85%", "推荐+2h内确认")
    STAGED = ("staged", "50-70%", "人工审批，24h SLA")
    ESCALATE = ("escalate", "<50%", "升级专家，停止自动Action")
    
    def __init__(self, code, range_str, description):
        self.code = code
        self.range_str = range_str
        self.description = description


@dataclass
class CalibratedDecision:
    """校准后的决策对象——直接映射到Palantir Action Type"""
    original_confidence: float
    calibrated_confidence: float
    action_tier: ActionTier
    decision_id: str
    context: dict
    
    def to_palantir_action(self) -> dict:
        return {
            "action_tier": self.action_tier.code,
            "confidence": self.calibrated_confidence,
            "original_confidence": self.original_confidence,
            "calibration_applied": True,
            "approval_required": self.action_tier in [ActionTier.STAGED, ActionTier.ESCALATE],
            "auto_revert_window_hours": 24 if self.action_tier == ActionTier.AUTO_WATCH else None,
            "escalation_reason": (
                f"置信度{self.calibrated_confidence:.1%}低于阈值"
                if self.action_tier == ActionTier.ESCALATE else None
            ),
        }


class TemperatureScalingCalibrator:
    """Temperature Scaling置信度校准器"""
    
    def __init__(self):
        self.temperature = 1.0  # 初始无校准
        self._fitted = False
        self._calibration_history = []
    
    def fit(self, logits: np.ndarray, labels: np.ndarray,
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2310.08234。
⚠️ 该号被 7 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：历史预测日志（模型输出 logits 与对应标签，卡页量级约 500MB/月）与业务分档口径（高影响动作阈值、通知与审批角色），粒度到单条决策。

**输出**：校准后的置信度与分档结果（可直接映射到 Action Type 的校准决策对象），含每档的决策数量与推送对象，供决策经理与采购团队执行。

## 执行步骤

1. 收集历史预测日志中的 logits 与真实标签
2. 用温度缩放拟合校准参数（无需重训练原模型）
3. 把原始置信度映射为校准后置信度并划分动作层级
4. 为每条决策生成可映射到 Action Type 的决策对象
5. 按季度检查校准数据分布，必要时重新校准

## 边界与不做

- 历史预测日志缺失，或生产分布与校准分布明显不一致（如大促期间）时不可直接使用。
- 本技能只产出校准后的置信度与分档建议，不自动执行补货等业务动作，是否自动执行由业务侧按分档规则决定。

## 技能关联

- **前置**：Skill-Bayesian-Structural-Time-Series.html、Skill-Bayesian-Structural-Time-Series、Skill-Decision-Audit-Trail-Ontology.html、Skill-Decision-Audit-Trail-Ontology、Skill-Human-in-Loop-Approval-Gate-Tag.html、Skill-Human-in-Loop-Approval-Gate-Tag、Skill-Multi-Step-Ahead-Forecast-Calibration.html、Skill-Multi-Step-Ahead-Forecast-Calibration、Skill-Real-Time-Supply-Chain-Drift-Detection.html、Skill-Real-Time-Supply-Chain-Drift-Detection、Skill-Signal-Uncertainty-Quantification-SC.html、Skill-Signal-Uncertainty-Quantification-SC、Skill-Supply-Chain-Agent-Orchestration-Hub.html、Skill-Supply-Chain-Agent-Orchestration-Hub、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger
- **延伸**：Skill-Bayesian-Structural-Time-Series.html、Skill-Bayesian-Structural-Time-Series、Skill-Decision-Audit-Trail-Ontology.html、Skill-Decision-Audit-Trail-Ontology、Skill-Human-in-Loop-Approval-Gate-Tag.html、Skill-Human-in-Loop-Approval-Gate-Tag、Skill-Multi-Step-Ahead-Forecast-Calibration.html、Skill-Multi-Step-Ahead-Forecast-Calibration、Skill-Supply-Chain-Agent-Orchestration-Hub.html、Skill-Supply-Chain-Agent-Orchestration-Hub、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger
- **可组合**：Skill-Bayesian-Structural-Time-Series.html、Skill-Bayesian-Structural-Time-Series、Skill-Decision-Audit-Trail-Ontology.html、Skill-Decision-Audit-Trail-Ontology、Skill-Multi-Step-Ahead-Forecast-Calibration.html、Skill-Multi-Step-Ahead-Forecast-Calibration、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Decision-Confidence-Calibration-SC

---

> 分类：独立控制/数据与AI运行/授权审查　·　技术族：24-标签工程　·　源卡：`Skill-Decision-Confidence-Calibration-SC`