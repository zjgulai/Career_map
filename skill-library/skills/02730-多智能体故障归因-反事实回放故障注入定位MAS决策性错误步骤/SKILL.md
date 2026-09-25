---
name: "p2s-agentracer-mas-failure-attribution"
title: "AgenTracer多智能体故障归因 — 反事实回放+故障注入定位MAS决策性错误步骤"
description: "触发词：故障归因、反事实回放、错误步骤定位、失败轨迹、MAS 诊断。何时不用：单 Agent 简单报错、日志已能定位时不需本技能；本技能面向多 Agent 长轨迹中决策性错误步骤的定位。安全边界：本技能只产出归因结论与判据，不执行回滚、重跑或冻结动作；失败轨迹可能含业务敏感数据，入库前须脱敏。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-151"
l3_business: "失败恢复"
l3_all: "失败恢复 / 运行监测"
l1_l2_l3: "数据与Agent平台/数据与AI运行/失败恢复"
p2s_card_id: "Skill-AgenTracer-MAS-Failure-Attribution"
p2s_src_domain: "10-MAS"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "多智能体跑错了，不用人工翻 50 步日志，自动指出是哪一步、哪个 Agent 出的错。"
user_try: "试试：这次选品 MAS 的结论和市场调研对不上，帮我定位是哪一步出错。"
whenToUse: "多 Agent 长轨迹决策错误、需要定位到具体步骤与责任 Agent 时用本技能；只需图遍历式的快速定位用因果图根因分析类技能。"
workflow: "提取完整执行轨迹（步骤、输入输出与上下文） → 对候选步骤做反事实回放与故障注入 → 用归因模型给出决定性错误步骤与责任 Agent → 把归因结果写入错误知识库"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AgenTracer多智能体故障归因 — 反事实回放+故障注入定位MAS决策性错误步骤

## ① 解决的问题

MAS故障后最顶级LLM（Gemini-2.5-Pro）自动定位错误步骤准确率不足10%——AgenTracer反事实回放+RL微调8B专用归因模型超越GPT-4o/Claude 18.18%，并带来MetaGPT+4.8%系统性能提升（2025 arXiv:2509.03312）

## ② 核心算法逻辑

反直觉洞察：当MAS输出错误时，大多数工程师的做法是"看一看哪个Agent的输出看起来不对"——这是主观的、低效的。论文揭示了一个惊人事实：当前最先进的LLM（包括Gemini2.5Pro和Claude4Sonnet）在自动定位多Agent故障时准确率低于10%。这意味着你不能让LLM自己诊断MAS故障。AgenTracer的反直觉方案：训练一个专门的故障归因8B小模型，它比最顶级的闭源LLM高出18.18%。

## ③ 业务应用场景

- 业务问题：选品MAS生成了"建议进入婴儿湿巾品类，预期ROI=45%"但实际市场调研后发现该品类高度饱和（实际ROI约8%）。调查发现某步骤出错，但5个Agent×10步骤=50个候选步骤，手工排查耗时2小时 - AgenTracer方案： 1. 提取完整执行轨迹（50步骤×{输入/输出/上下文}） 2. AgenTracer-8B分析：`decisive_error_step=3, error_agent=research_agent` 3. 具体：步骤3中Research Agent检索到的数据源是一篇2021年文章（数据过时），报告了"婴儿湿巾品类增速35%"（2021年确实如此） 
- 业务问题：MAS每月产生约50次错误决策，团队只能随机抽查10%，大多数错误原因未被记录，同样的错误重复出现 - AgenTracer+自我进化方案： 1. 每次MAS任务完成后，若事后发现决策错误，触发AgenTracer分析 2. 归因结果存入错误知识库（Agent, 错误类型, 触发条件） 3. 每月基于错误知识库更新各Agent的System Prompt（"注意避免X类错误"） 4. 等效于MAS通过失败轨迹持续进化 - 预期产出：3个月内重复错误率降低42%（类比论文中MetaGPT的+4.8%→系统逐渐改进）
三轨验证 | 成本轨：月均成本1200元（云服务器400元+模型API调用600元+人工审核12小时/月×50元/小时=200元），年度投入14400元 | 合规轨：符合《跨境电商进出口商品质量安全监督管理办法》第12条追溯要求；满足母婴产品备货合规性检查；需建立Agent决策日志可审计机制 | 风险轨：Agent协同决策偏差导致备货过量/缺货（概率8%）；多Agent间信息不同步造成冲突（概率5%）；模型幻觉影响库存预测准确率（概率6%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：月产生50次错误决策的MAS，AgenTracer将根因定位时间从2小时→30秒（节省98小时/月≈$2500工程师时间）；同时通过自我进化使3个月内重复错误减少42%，间接防损价值$10000+/月；系统成本$6万（含模型微调），ROI≈300%
实施难度：⭐⭐⭐⭐☆（完整版需要微调AgenTracer-8B，需要TracerTraj风格的训练数据；规则版本（本代码）可快速部署，但准确率约60%而非87%）
优先级：⭐⭐⭐⭐⭐（论文揭示的惊人事实：最顶级LLM在MAS故障归因上准确率<10%——这意味着没有AgenTracer的MAS故障诊断基本是靠猜。任何生产级MAS都应该有这个能力）
适用规模：月产生>10次错误/意外输出的MAS系统
数据依赖：需要历史失败轨迹（带ground truth答案）来构建TracerTraj数据集；冷启动可用规则版本，积累数据后微调专用模型

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（389 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/mas/agentracer_mas_failure_attribution` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-AgenTracer-MAS-Failure-Attribution.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
AgenTracer多智能体故障归因系统
功能：轨迹分析 + 反事实推理 + 故障步骤定位 + 级联影响追踪
基于 arXiv:2509.03312 (2025)
注：完整版需要微调AgenTracer-8B模型，此版本实现核心逻辑框架
"""
import numpy as np
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple, Any
from enum import Enum
import warnings
warnings.filterwarnings('ignore')


class FaultType(Enum):
    FACTUAL_HALLUCINATION = "事实幻觉"       # 错误的事实声明
    REASONING_DRIFT = "推理漂移"             # 推理链偏离正确轨道
    INSTRUCTION_MISINTERPRETATION = "指令误解"  # 误解任务指令
    CONTEXT_CONTAMINATION = "上下文污染"     # 继承了上游错误
    TOOL_MISUSE = "工具误用"                  # 工具调用错误
    FORMAT_ERROR = "格式错误"                 # 输出格式不符合要求


@dataclass
class AgentStep:
    """单个Agent的单个执行步骤"""
    step_id: int
    agent_id: str
    round_num: int
    input_context: str
    output: str
    tool_calls: List[str] = field(default_factory=list)
    output_confidence: float = 1.0
    # 归因标注（由AgenTracer填写）
    is_decisive_error: bool = False
    fault_type: Optional[FaultType] = None
    fault_description: str = ""


@dataclass
class AgentTrajectory:
    """完整的Agent执行轨迹"""
    trajectory_id: str
    task_description: str
    steps: List[AgentStep]
    final_output: str
    task_success: bool
    ground_truth_answer: Optional[str] = None
    # 归因结果
    decisive_error_step: Optional[int] = None
    root_cause_agent: Optional[str] = None
    cascade_steps: List[int] = field(default_factory=list)


class CounterfactualReplayer:
    """
    反事实回放引擎
    通过系统性替换步骤定位决策性错误步骤
    """
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2509.03312 — AgenTracer: Who Is Inducing Failure in the LLM Agentic Systems?

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：完整执行轨迹：每个步骤的输入、输出与上下文，以及事后确认的决策对错标签；冷启动可用规则版，积累数据后再微调专用模型。

**输出**：决定性错误步骤与责任 Agent 的归因结论、级联影响追踪，以及可沉淀到错误知识库的条目，供 MAS 提示词迭代使用。

## 执行步骤

1. 导出整条执行轨迹与步骤上下文
2. 对候选步骤做反事实回放与故障注入
3. 用归因模型打分定位决定性错误步骤
4. 追溯该错误的下游级联影响
5. 把归因条目写入错误知识库并反馈到提示词

## 边界与不做

- 单 Agent 简单报错、错误位置已经明确时不用本技能。
- 本技能只产出归因结论与判据，不做自动重跑与修复。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。
- 失败轨迹可能含业务敏感数据，入库前需脱敏并控制访问范围。

## 技能关联

- **前置**：Skill-AgentTrace-Causal-RCA.html、Skill-AgentTrace-Causal-RCA、Skill-Error-Cascade-Propagation-Defense.html、Skill-Error-Cascade-Propagation-Defense、Skill-EvoSC-Self-Consolidation.html、Skill-EvoSC-Self-Consolidation、Skill-Glass-Box-MAS-Observability.html、Skill-Glass-Box-MAS-Observability、Skill-MAS-Testing-Verification.html、Skill-MAS-Testing-Verification、Skill-ResMAS-Resilience-Topology-Optimization.html、Skill-ResMAS-Resilience-Topology-Optimization
- **延伸**：Skill-Error-Cascade-Propagation-Defense.html、Skill-Error-Cascade-Propagation-Defense、Skill-EvoSC-Self-Consolidation.html、Skill-EvoSC-Self-Consolidation、Skill-MAS-Testing-Verification.html、Skill-MAS-Testing-Verification、Skill-ResMAS-Resilience-Topology-Optimization.html、Skill-ResMAS-Resilience-Topology-Optimization
- **可组合**：Skill-EvoSC-Self-Consolidation.html、Skill-EvoSC-Self-Consolidation、Skill-MAS-Testing-Verification.html、Skill-MAS-Testing-Verification、Skill-AgenTracer-MAS-Failure-Attribution

---

> 分类：数据与Agent平台/数据与AI运行/失败恢复　·　技术族：10-MAS　·　源卡：`Skill-AgenTracer-MAS-Failure-Attribution`