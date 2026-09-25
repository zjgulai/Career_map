---
name: "p2s-agentic-workflow-compilation"
title: "Subterranean Agent — 将工作流 SOP 编译进 LLM 权重"
description: "触发词：工作流编译、SOP 固化、模型微调、单次调用、串行编排。何时不用：把经验做成案例库注入上下文走「SOP 蒸馏」；技能自动生成与演化走「技能自演化萃取」。安全边界：合规检查等强约束步骤不得因编译而削弱，编译后模型须通过质量保留率评估才可上线。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-147"
l3_business: "技能版本"
l3_all: "技能版本 / Playbook评估"
l1_l2_l3: "数据与Agent平台/数据与AI运行/技能版本"
p2s_card_id: "Skill-Agentic-Workflow-Compilation"
p2s_src_domain: "16-智能体工程"
quality_tier: "preview"
user_summary: "每天重复跑同一套四步流程、每次都串行调用大模型时，把流程编译进模型，一次推理出全部结果。"
user_try: "试试：Listing 上架这套四步 SOP 每天跑上千次，帮我评估编译进模型能省多少。"
whenToUse: "当 SOP 固定、调用量大且能承担微调基础设施时用；若只是把老运营经验做成案例库，用「SOP 蒸馏」；若要让技能自己生成与演化，用「技能自演化萃取」。"
workflow: "整理历史 SOP 执行轨迹与中间结果 → 编写标准化 SOP 定义（Prompt 模板加输出 Schema） → 用至少数百条高质量示例做 SFT 训练 → 用评估框架验证编译后的质量保留率 → 搭建重编译 CI/CD 管线并灰度上线"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Subterranean Agent — 将工作流 SOP 编译进 LLM 权重

## ① 解决的问题

每日需要上架数百个 SKU，每个 SKU 经过「标题优化→图片描述生成→合规检查→关键词填写」4 步 SOP，当前用 LangGraph 编排，frontier 模型成本约 $0.15/SKU × 1000 SKU = $150/天

## ② 核心算法逻辑

传统 LangGraph/CrewAI 等框架在运行时通过 Orchestrator 逐步调用 LLM 完成多步 SOP：每一步都需要独立的 API 调用、上下文窗口填充、token 计费。Subterranean Agent 的核心洞察是：当 SOP 固定时，Orchestrator 的编排逻辑可以从"运行时解释"变为"编译时参数化"——把整个多步工作流的决策逻辑直接烧录进单个模型权重。

## ③ 业务应用场景

业务问题：每日需要上架数百个 SKU，每个 SKU 经过「标题优化→图片描述生成→合规检查→关键词填写」4 步 SOP，当前用 LangGraph 编排，frontier 模型成本约 $0.15/SKU × 1000 SKU = $150/天。
数据要求： - 历史 SOP 执行轨迹（输入 SKU 信息 → 各步骤中间结果 → 最终 Listing） - 标准化 SOP 定义文件（每步 Prompt 模板 + 输出 Schema） - 至少 500 条高质量执行示例用于 SFT 训练数据
预期产出： - 编译后单次 API 调用完成全部 4 步 SOP - 输出结构化 JSON 包含：optimized_title / image_description / compliance_flags / keywords - 响应时间从 4 次串行调用（约 12s）降至 1 次推理（约 3s）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

需要搭建 SFT + GRPO 微调基础设施（A100 或等效 GPU × 8）
需要构建 SOP 执行轨迹数据集（每个 SOP 至少 500–2000 条样本）
编译后模型需要评估框架验证质量保留率（≥87%）
重编译 CI/CD 管线需要工程化（30–50 分钟/次）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（334 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/llm_agent_engineering/agentic_workflow_compilation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-Agentic-Workflow-Compilation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Subterranean Agent — 工作流编译范式模拟
论文: Compiling Agentic Workflows into LLM Weights (arXiv:2605.22502)
模拟将固定 SOP 从「运行时编排」转为「编译时参数化」的核心范式
"""

from __future__ import annotations
import time
import json
from dataclasses import dataclass, field
from typing import Any

# ─── 数据类定义 ────────────────────────────────────────────────────────────────

@dataclass
class WorkflowStep:
    """单个 SOP 步骤的元数据"""
    step_name: str
    prompt_template: str
    expected_output_schema: dict[str, str]
    estimated_input_tokens: int = 500
    estimated_output_tokens: int = 200

    def format_prompt(self, context: dict[str, Any]) -> str:
        """将上下文变量填充进 prompt 模板"""
        try:
            return self.prompt_template.format(**context)
        except KeyError as e:
            raise ValueError(f"步骤 [{self.step_name}] 缺少上下文变量: {e}") from e


@dataclass
class SOPWorkflow:
    """固定 SOP 工作流定义（多步骤序列）"""
    workflow_name: str
    description: str
    steps: list[WorkflowStep] = field(default_factory=list)

    def add_step(self, step: WorkflowStep) -> "SOPWorkflow":
        self.steps.append(step)
        return self

    @property
    def total_steps(self) -> int:
        return len(self.steps)

    @property
    def total_estimated_tokens(self) -> int:
        """运行时编排模式：每步独立调用的总 token 消耗（含上下文重复填充）"""
        # 每步都需要重新填充完整上下文（SOP说明 + 历史步骤输出 + 当前步骤 prompt）
        CONTEXT_OVERHEAD_PER_STEP = 800  # Orchestrator 系统 prompt + CoT 模板
        HISTORY_ACCUMULATION = 150       # 每步会累积前序输出
        total = 0
        for i, step in enumerate(self.steps):
            context_size = (
                step.estimated_input_tokens
                + CONTEXT_OVERHEAD_PER_STEP
                + i * HISTORY_ACCUMULATION    # 历史步骤输出的累积
            )
            total += context_size + step.estimated_output_tokens
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2605.22502 — Compiling Agentic Workflows into LLM Weights: Near-Frontier Quality at Two Orders of Magnitude Less Cost

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：需历史 SOP 执行轨迹（输入、各步中间结果、最终产物）、标准化 SOP 定义文件与每步输出 Schema（卡页示例至少 500 条高质量执行示例），流程实例级粒度。

**输出**：产出单次调用完成全流程的编译模型与结构化 JSON 输出（卡页示例字段 optimized_title、image_description、compliance_flags、keywords）、响应时间对比（卡页记录 4 次串行约 12 秒降至 1 次推理约 3 秒），供上架与运营团队使用。

## 执行步骤

1. 整理历史 SOP 执行轨迹与各步中间结果
2. 编写标准化 SOP 定义与输出 Schema
3. 训练编译模型（至少数百条高质量示例）
4. 验证编译后的质量保留率
5. 搭建重编译 CI/CD 管线并灰度上线

## 边界与不做

- SOP 还在频繁变动或执行量小时，编译与重编译成本收不回
- 需要 SFT 与微调基础设施（卡页示例 8 张 A100 级 GPU），编译后质量保留率须评估达标
- 合规检查等强约束步骤不得因编译合并而削弱

## 技能关联

- **前置**：Skill-Cost-Aware-Agent-Scheduling.html、Skill-Cost-Aware-Agent-Scheduling、Skill-SLM-Tool-Calling-Optimization.html、Skill-SLM-Tool-Calling-Optimization、Skill-Skill-Lifecycle-Design.html、Skill-Skill-Lifecycle-Design
- **延伸**：Skill-Auto-Skill-Synthesis.html、Skill-Auto-Skill-Synthesis、Skill-ParaManager-Parallel-Orchestration.html、Skill-ParaManager-Parallel-Orchestration
- **可组合**：Skill-Active-Context-Pruning.html、Skill-Active-Context-Pruning、Skill-Context-Compression.html、Skill-Context-Compression、Skill-DAG-Ta[REDACTED].html、Skill-DAG-Ta[REDACTED]、Skill-GraphDeepAR-Demand-Forecasting.html、Skill-GraphDeepAR-Demand-Forecasting、Skill-LDP-Identity-Aware-Protocol.html、Skill-LDP-Identity-Aware-Protocol、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-Tool-Call-Decision-Framework.html、Skill-Tool-Call-Decision-Framework、Skill-Agentic-Workflow-Compilation

---

> 分类：数据与Agent平台/数据与AI运行/技能版本　·　技术族：16-智能体工程　·　源卡：`Skill-Agentic-Workflow-Compilation`