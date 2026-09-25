---
name: "p2s-caster-context-aware-model-routing"
title: "CASTER上下文感知模型路由 — 任务步骤级强弱LLM动态调度以破解性能-成本铁三角"
description: "触发词：模型路由、强弱模型调度、步骤级降本、质量成本平衡、延迟优化。何时不用：整体账单治理与语义缓存走「Agent 成本优化」；上下文太长需要压缩走「上下文 Token 压缩」。安全边界：合规、财务等关键决策步骤不得降级到弱模型，路由决策须保留日志以支持审计。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-150"
l3_business: "容量管理"
l3_all: "容量管理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/容量管理"
p2s_card_id: "Skill-CASTER-Context-Aware-Model-Routing"
p2s_src_domain: "10-MAS"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "一条工作流里有的步骤简单有的步骤难，简单的交给便宜模型、关键的留给强模型，成本和延迟一起降。"
user_try: "试试：把这条 20 步选品流程按复杂度分一下，哪些步骤可以换用便宜模型？"
whenToUse: "当工作流步骤复杂度差异大、想在不牺牲关键步骤质量的前提下省钱时用；若做全局成本治理与缓存，用「Agent 成本优化」；若瓶颈是上下文长度，用「上下文 Token 压缩」。"
workflow: "拆解工作流步骤并标注各步骤复杂度特征 → 为每类步骤配置强模型与弱模型候选 → 用历史质量记录训练或校准路由策略 → 按步骤路由执行并记录质量与延迟 → 复盘误路由并更新路由阈值"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# CASTER上下文感知模型路由 — 任务步骤级强弱LLM动态调度以破解性能-成本铁三角

## ① 解决的问题

用同一个昂贵LLM处理所有Agent任务导致成本失控——CASTER步骤级神经路由将75%低复杂度步骤路由到弱模型，在保持质量的同时降低23-54%成本（2026 arXiv:2601.19793）

## ② 核心算法逻辑

反直觉洞察：Denis Rothman书中默认用同一个模型（GPT5.1/5.4）处理所有Agent任务。但跨境电商MAS中，"帮我写一个商品标题"（简单）和"分析这个产品的法规合规风险"（复杂）不应该用同一个昂贵模型。CASTER的关键发现：MAS工作流中75%的子任务可以用弱模型（GPT4omini）完成，节省60%+成本，而不影响整体质量。关键是"动态决策哪步用强模型"，而非静态分配。

## ③ 业务应用场景

- 业务问题：某母婴品牌的选品MAS每月处理500次完整分析，每次包含20个步骤（数据收集、竞品对比、合规检查、财务建模、报告生成）。全部用GPT-4o，月成本$390；全部用GPT-4o-mini，质量下降40%不可接受 - CASTER路由策略： - 数据格式化/标准化步骤 → GPT-4o-mini（规则性强） - 竞品搜索/摘要步骤 → GPT-4o-mini（信息提取，低复杂度） - 法规合规分析步骤 → GPT-4o（需要专业推理） - 财务建模/预测步骤 → GPT-4o（定量推理） - 最终策略建议步骤 → GPT-4o（关键决策） - 结果：约65%的步骤用mini模型，月成
- 业务问题：大促期间MAS需要实时响应（<2秒），但GPT-4o延迟高（平均3-5秒） - CASTER方案：识别时间敏感步骤（实时监控/告警）→ 强制路由到GPT-4o-mini（<1秒响应），分析性步骤允许等待强模型。平均延迟从3.2秒降至1.4秒，满足实时要求
三轨验证 | 成本轨：月均成本1200元（Agent协同系统维护800元+模型调用API费用300元+人工监督4小时/月@100元/小时），年度成本14400元 | 合规轨：符合《跨境电商进出口商品质量安全监督管理办法》，Agent决策链需保留审计日志，满足平台溯源要求；多Agent投票机制确保决策透明度 | 风险轨：模型路由错误导致备货偏差（概率8%），可能造成滞销或缺货；Agent间协同延迟影响大促反应速度（概率5%）；跨境合规数据更新滞后（概率6%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：月调用500次完整MAS分析，平均每次20步骤，CASTER节省40%模型成本，年化节省约$2000-5000；同时关键步骤（合规/财务）用强模型保证质量；系统成本$3万，ROI≈600-1500%
实施难度：⭐⭐⭐☆☆（规则基础版本容易实现；学习路由器需要额外训练数据；关键是设计好每步骤的复杂度评估特征）
优先级：⭐⭐⭐⭐⭐（成本是MAS生产部署的最大障碍，CASTER直接攻克这个问题，2026年最新结果，论文已开源）
适用规模：有10+步骤的工作流，且包含不同复杂度的混合任务（既有格式化又有推理）
数据依赖：需要历史步骤质量记录来训练路由策略；冷启动用规则基础版，积累数据后升级为学习版

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（281 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/mas/caster_context_aware_model_routing` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-CASTER-Context-Aware-Model-Routing.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
CASTER上下文感知模型路由系统
功能：步骤级模型路由 + 上下文状态追踪 + 成本-质量优化
基于 arXiv:2601.19793 (2026)
"""
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple, Any
from enum import Enum
import warnings
warnings.filterwarnings('ignore')


class ModelTier(Enum):
    STRONG = "strong"   # GPT-4o, Claude-3-Opus
    WEAK = "weak"       # GPT-4o-mini, Claude-3-Haiku


@dataclass
class ModelConfig:
    """模型配置"""
    name: str
    tier: ModelTier
    cost_per_1k_tokens: float   # USD/1K tokens
    avg_latency_ms: float       # 平均延迟
    reasoning_score: float      # 推理能力评分 0-1


@dataclass
class WorkflowStep:
    """MAS工作流步骤"""
    step_id: str
    description: str
    agent_role: str
    # 复杂度特征
    requires_reasoning: bool = False     # 是否需要深度推理
    is_format_task: bool = False         # 是否是格式化/结构化任务
    has_error_risk: bool = False         # 是否有错误风险（前步失败可能影响此步）
    is_time_sensitive: bool = False      # 是否对延迟敏感
    complexity_score: float = 0.5       # 综合复杂度 0-1


@dataclass
class ContextState:
    """上下文状态（在步骤间传递）"""
    accumulated_errors: int = 0
    task_progress: float = 0.0          # 0-1
    remaining_budget_usd: float = 1.0
    quality_signals: List[float] = field(default_factory=list)
    latency_budget_ms: Optional[float] = None

    @property
    def error_rate(self) -> float:
        total_steps = max(len(self.quality_signals), 1)
        return self.accumulated_errors / total_steps

    @property
    def avg_quality(self) -> float:
        return np.mean(self.quality_signals) if self.quality_signals else 0.8
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2601.19793 — CASTER: Breaking the Cost-Performance Barrier in Multi-Agent Orchestration via Context-Aware Strategy for Task Efficient Routing

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：需工作流的步骤清单与各步骤输入特征、历史步骤质量记录以及延迟与成本数据，步骤级粒度，冷启动可先用规则基础版。

**输出**：产出步骤级路由策略（卡页示例：约 65% 步骤走轻量模型）、成本与延迟对比（卡页记录平均延迟从 3.2 秒降至 1.4 秒）、关键步骤质量保障说明，供工程与运营使用。

## 执行步骤

1. 拆解工作流并标注各步骤的复杂度特征
2. 配置步骤类型的强模型与弱模型候选
3. 训练或校准路由策略（基于历史质量记录）
4. 执行步骤级路由并记录质量、延迟与成本
5. 复盘误路由案例并更新路由阈值

## 边界与不做

- 步骤数少（十步以内）或各步骤复杂度相近时，路由收益有限
- 只产出路由规则，不替代模型能力评估，冷启动阶段的规则版效果有限
- 合规、财务等关键决策步骤不得降级，路由决策须留审计日志
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-AdaCtx-Dynamic-Context-Budget-Allocation.html、Skill-AdaCtx-Dynamic-Context-Budget-Allocation、Skill-Context-Engine-Architecture.html、Skill-Context-Engine-Architecture、Skill-ContextRL-Contrastive-Context-Selection.html、Skill-ContextRL-Contrastive-Context-Selection、Skill-Glass-Box-MAS-Observability.html、Skill-Glass-Box-MAS-Observability、Skill-Policy-Driven-Meta-Controller.html、Skill-Policy-Driven-Meta-Controller、Skill-QUBO-Ad-Budget-Allocation.html、Skill-QUBO-Ad-Budget-Allocation、Skill-Tool-Call-Decision-Framework.html、Skill-Tool-Call-Decision-Framework
- **延伸**：Skill-AdaCtx-Dynamic-Context-Budget-Allocation.html、Skill-AdaCtx-Dynamic-Context-Budget-Allocation、Skill-ContextRL-Contrastive-Context-Selection.html、Skill-ContextRL-Contrastive-Context-Selection、Skill-Glass-Box-MAS-Observability.html、Skill-Glass-Box-MAS-Observability、Skill-Policy-Driven-Meta-Controller.html、Skill-Policy-Driven-Meta-Controller、Skill-QUBO-Ad-Budget-Allocation.html、Skill-QUBO-Ad-Budget-Allocation
- **可组合**：Skill-ContextRL-Contrastive-Context-Selection.html、Skill-ContextRL-Contrastive-Context-Selection、Skill-Glass-Box-MAS-Observability.html、Skill-Glass-Box-MAS-Observability、Skill-QUBO-Ad-Budget-Allocation.html、Skill-QUBO-Ad-Budget-Allocation、Skill-CASTER-Context-Aware-Model-Routing

---

> 分类：数据与Agent平台/数据与AI运行/容量管理　·　技术族：10-MAS　·　源卡：`Skill-CASTER-Context-Aware-Model-Routing`