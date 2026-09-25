---
name: "p2s-agent-decision-confidence-threshold"
title: "Agent 置信度决策门控 — 高置信自动执行，低置信升级人工，防止 AI 乱操作"
description: "触发词：置信度门控、决策校准、低置信升级人工、Platt校准、自动执行阈值、高风险确认。何时不用：要按 SLO 与错误预算动态升降 Agent 自主权时用「Agent错误预算」；要定位能力短板做阶段评估时用「Agent阶段评估」；要盯运行链路与 Token 成本时用「Agent可观测性追踪」。安全边界：低置信决策不得静默自动执行，高风险动作必须人工确认后才放行；校准参数必须用带真实结果的历史决策拟合，禁止拿未校准的模型原始置信度直接设阈值。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-149"
l3_business: "运行监测"
l3_all: "运行监测 / 异常冻结与恢复"
l1_l2_l3: "数据与Agent平台/数据与AI运行/运行监测"
p2s_card_id: "Skill-Agent-Decision-Confidence-Threshold"
p2s_src_domain: "16-智能体工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "给 Agent 的每个决策装三档开关：够确定的自动做，拿不准的先告警，很不确定的直接交给人。"
user_try: "试试：给定价 Agent 加置信度门控，校准后置信度低于 0.75 的调价先暂停并告警给我审核。"
whenToUse: "当 Agent 已经在自动执行定价、补货一类有风险的决策、需要按置信度决定自动还是人工时用本技能；若要做的是按 SLO 与错误预算整体升降自主权水位，改用「Agent错误预算」；若只是要看清它每一步做了什么，改用「Agent可观测性追踪」。"
workflow: "采集历史决策记录（原始置信度 + 实际结果）拟合校准参数 → 用 Platt Scaling 与 Temperature Scaling 把原始置信度校准为真实置信度 → 按三档路由：高置信自动执行、中间档通知确认、低置信升级人工 → 对高风险决策强制人工确认后再放行 → 回收执行结果回流校准并跟踪事故率变化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Agent 置信度决策门控 — 高置信自动执行，低置信升级人工，防止 AI 乱操作

## ① 解决的问题

风控负责人面临"AI自动执行了低置信度决策导致错误PO锁定大额资金"——三档置信度门控将AI乱操作导致的损失年化降低$6.8万，高风险操作人工确认率100%

## ② 核心算法逻辑

解决「AI Agent 做了错误决策，把价格改成了竞品的十分之一，损失 $50,000」的业务问题。

## ③ 业务应用场景

场景A：定价 Agent 置信度门控——防止错误调价 - 业务问题：竞品爬虫数据错误（竞品促销 -80%），定价 Agent 跟价导致 ASIN 亏本卖出 200 单 - 数据要求：历史决策记录（含 Agent 置信度分数 + 实际结果）+ 当前决策上下文 - 部署方案：定价决策置信度 < 0.75 时暂停自动调价，发送告警给运营审核 - 预期产出：错误调价事故从 12 次/月 → 1-2 次/月，年化避免损失 $68,000 - 三轨验证： - 成本：需采集历史定价决策日志（约 5000+ 条/月）用于校准参数拟合；Platt Scaling 推理增加 0.5ms/次，无额外 GPU 开销；
**场景B：库存补货 Agent 不确定情景识别** - 业务问题：旺季预测置信度低的情况下，Agent 自动大量补货导致滞销积压 $30,000 - 数据要求：销售预测置信区间 + 历史预测准确率分布 - 部署方案：预测 MAPE > 35% 时补货决策降级为「人工复核模式」，只提建议不执行 - 预期产出：旺季滞销风险降低 60%，库存周转率提升 22% - **三轨验证**： - **成本**：需接入销售预测系统的置信区间输出（API 调用成本约 $0.001/次）；人工复核模式增加采购团队工作量约 4 小时/周（旺季）；需维护 MAPE 阈值动态调整脚本 - **合规**：不触碰 Ama

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：母婴跨境卖家，部署置信度门控后：
防止错误调价事故：从 12 次/月 → 1-2 次/月，年化避免损失 $68,000
防止错误大量补货：滞销库存风险降低 60%，年化挽回 $18,000-30,000
运营信任度：Agent 「乱操作」投诉消失，运营愿意授权更多决策给 Agent 自动执行，自动化率提升 40%
实施难度：⭐⭐☆☆☆（在现有 Agent 决策节点插入校准层即可，工程改动小）
优先级：⭐⭐⭐⭐⭐（Agent 规模化部署的安全前提，缺少此机制容易发生灾难性错误）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（218 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/llm_agent_engineering/agent_decision_confidence_threshold` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-Agent-Decision-Confidence-Threshold.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Agent 置信度校准与三档执行门控
Platt Scaling + Temperature Scaling + 决策路由
"""
import math
import random
from dataclasses import dataclass
from enum import Enum
from typing import List, Tuple, Dict


class ExecutionTier(Enum):
    AUTO = "auto"           # 全自动执行（p >= 0.85）
    NOTIFY = "notify"       # 通知确认（0.6 <= p < 0.85）
    ESCALATE = "escalate"   # 升级人工（p < 0.6）


@dataclass
class Decision:
    """Agent 决策"""
    decision_id: str
    action: str
    raw_confidence: float     # 模型原始置信度（未校准）
    calibrated_confidence: float = 0.0
    tier: ExecutionTier = ExecutionTier.ESCALATE
    executed: bool = False
    actual_outcome: float = 0.0  # 事后结果（1=正确，0=错误）


class PlattScaler:
    """Platt Scaling 置信度校准器"""
    
    def __init__(self, a: float = 1.5, b: float = -0.3):
        """
        sigmoid(a * x + b) 校准曲线
        a > 1: 压缩过度自信；a < 1: 放大保守估计
        需要用历史数据拟合 a, b
        """
        self.a = a
        self.b = b
    
    def calibrate(self, raw_prob: float) -> float:
        """将原始概率校准到实际置信度"""
        logit = math.log(raw_prob / max(1 - raw_prob, 1e-6))
        cal_logit = self.a * logit + self.b
        return 1 / (1 + math.exp(-cal_logit))
    
    @staticmethod
    def temperature_scale(logits: List[float], temperature: float = 1.5) -> List[float]:
        """Temperature Scaling：降低过度自信"""
        scaled = [l / temperature for l in logits]
        max_val = max(scaled)
        exp_vals = [math.exp(l - max_val) for l in scaled]
        total = sum(exp_vals)
        return [e / total for e in exp_vals]
    
    def fit_from_history(self, decisions: List[Decision]):
        """从历史决策中拟合校准参数（简化版梯度下降）"""
        if len(decisions) < 20:
            print("  ⚠️  历史数据不足（<20 条），使用默认参数")
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2402.07927，但该号在 arXiv 上是《A Systematic Survey of Prompt Engineering in Large Language Models: Techniques and Applications》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：历史决策记录（Agent 原始置信度分数与真实结果，用于拟合校准参数）、当前决策上下文与动作类型、业务侧设定的风险等级与阈值；粒度为单条决策。

**输出**：每条决策的校准后置信度、执行档位（自动 / 通知确认 / 升级人工）与是否需人工确认的判决；供 Agent 执行层与运营审核人使用。

## 执行步骤

1. 采集带真实结果标签的历史决策日志，拟合校准曲线参数
2. 对当前决策的原始置信度做校准，得到可比较的真实置信度
3. 按三档阈值路由：高置信自动执行、中间档通知确认、低置信升级人工
4. 对高风险动作（大额采购、调价）强制人工确认后再执行
5. 回收执行结果回流校准，并监控错误决策事故率

## 边界与不做

- 数据不满足：没有带真实结果标签的历史决策记录就无法拟合校准曲线，此时只能沿用保守阈值并保留人工兜底。
- 何时不用：按 SLO 和错误预算整体调整自主权用「Agent错误预算」，定位能力短板用「Agent阶段评估」。
- 能力边界：只产出置信度判据与路由档位，不改进模型本身的判断能力，也不承担执行与回滚。
- 本技能承载的是规则与契约产物（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-Agent-Safety-Guardrails.html、Skill-Agent-Safety-Guardrails、Skill-Decision-Confidence-Calibration-SC.html、Skill-Decision-Confidence-Calibration-SC、Skill-Human-in-Loop-Approval-Gate-Tag.html、Skill-Human-in-Loop-Approval-Gate-Tag、Skill-MAS-Ecommerce-Ops-Automation.html、Skill-MAS-Ecommerce-Ops-Automation
- **延伸**：Skill-Human-in-Loop-Approval-Gate-Tag.html、Skill-Human-in-Loop-Approval-Gate-Tag、Skill-MAS-Ecommerce-Ops-Automation.html、Skill-MAS-Ecommerce-Ops-Automation
- **可组合**：Skill-MAS-Ecommerce-Ops-Automation.html、Skill-MAS-Ecommerce-Ops-Automation、Skill-Agent-Decision-Confidence-Threshold

---

> 分类：数据与Agent平台/数据与AI运行/运行监测　·　技术族：16-智能体工程　·　源卡：`Skill-Agent-Decision-Confidence-Threshold`