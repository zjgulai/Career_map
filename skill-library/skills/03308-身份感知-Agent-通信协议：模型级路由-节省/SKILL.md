---
name: "p2s-ldp-identity-aware-protocol"
title: "LDP — 身份感知 Agent 通信协议：模型级路由 + 37% Token 节省"
description: "触发词：身份感知路由、Agent身份卡、模型分级路由、Token节省、任务复杂度评估。何时不用：只解决工具如何暴露给模型时用 MCP 与 A2A 协议栈技能；只审计工具描述质量时用工具描述审核技能。安全边界：身份卡中的信任域与权限声明必须与真实授权一致，不得凭身份卡自述放宽权限。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-143"
l3_business: "接口契约"
l3_all: "接口契约 / 集成验证"
l1_l2_l3: "数据与Agent平台/数据与AI运行/接口契约"
p2s_card_id: "Skill-LDP-Identity-Aware-Protocol"
p2s_src_domain: "16-智能体工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "给每个 Agent 发一张身份卡，按任务难度把请求分给合适大小的模型，省掉不必要的调用成本。"
user_try: "试试：把我们的任务记录按复杂度分级，给每个 Agent 建身份卡，然后按身份与难度重排模型路由。"
whenToUse: "多个 Agent 共用模型池、需要按任务复杂度与身份选择模型档位时用本技能；只解决工具如何暴露给模型，用 MCP 与 A2A 协议栈技能。"
workflow: "给模型划分质量档位 → 为每个 Agent 建身份卡（模型、成本、上下文、信任域） → 用复杂度评估函数判断任务档位 → 按身份与档位路由请求并统计节省"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LDP — 身份感知 Agent 通信协议：模型级路由 + 37% Token 节省

## ① 解决的问题

数据治理专员面临身份混用难追责——LDP将错绑身份率4%降到0.5%，年化省11万元

## ② 核心算法逻辑

Google A2A 和 Anthropic MCP 这两大主流 Agent 通信协议存在共同缺陷：不暴露模型级属性。Agent 只知道对方"是一个 Agent"，但不知道对方用的是 Claude Opus 还是 3B 小模型、推理能力如何、token 成本是多少。这导致：

## ③ 业务应用场景

母婴出海 MAS 中，不同任务对模型能力要求差异巨大： - 策略型任务（市场分析、竞品洞察、合规策略制定）→ 需要 Claude Opus / GPT-4o 级别 - 执行型任务（文案改写、数据格式化、SKU 匹配）→ 3-7B 轻量模型即可
但因为缺乏身份感知，所有任务都路由到 Frontier 模型，成本浪费 80%+。
数据要求： - 历史任务记录（任务描述 + 实际所需模型质量） - 各 Agent 的 Identity Card 注册信息 - 任务复杂度评估函数（可用轻量分类器）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

数据要求：低，主要是 Agent 注册信息配置
技术门槛：低中，协议层增强，不改变 LLM 本身
工程复杂度：低中，可作为 MCP/A2A 之上的薄层插件（Rust 实现参考 JamJet runtime）
维护成本：低，Identity Card 按需更新
立竿见影：token -37% 直接降低 API 成本，快速 ROI
低侵入性：作为 MCP/A2A 上层薄层，不破坏现有系统

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（489 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/llm_agent_engineering/ldp_identity_aware_protocol` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-LDP-Identity-Aware-Protocol.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
LDP — LLM Delegate Protocol 身份感知 Agent 通信协议
论文: LDP: An Identity-Aware Protocol for Multi-Agent LLM Systems
arXiv: 2603.08852 | 2026-03

核心组件:
- ModelIdentityCard: Agent 身份证（模型属性）
- PayloadMode: 6 级 Payload 协商模式
- LDPSession: 治理会话（持久上下文 + 信任域）
- LDPRouter: 基于 Identity Card 的智能路由
- LDPChannel: 带 Governed Session 缓存的通信通道
"""

from __future__ import annotations

import hashlib
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any


# ──────────────────────────────────────────
# 1. 模型质量分级
# ──────────────────────────────────────────

class QualityTier(str, Enum):
    """模型质量分级：FRONTIER > MID > LIGHTWEIGHT"""
    FRONTIER = "frontier"      # GPT-4o, Claude Opus, Gemini Ultra 级别
    MID = "mid"                # GPT-3.5, Claude Haiku, Qwen-Plus 级别
    LIGHTWEIGHT = "lightweight" # 3-7B 本地小模型


class ReasoningProfile(str, Enum):
    """推理风格偏好"""
    QUALITY_FIRST = "quality_first"    # 准确率优先，延迟可接受
    BALANCED = "balanced"              # 质量与速度均衡
    SPEED_OPTIMIZED = "speed_optimized" # 速度优先，轻量任务


# ──────────────────────────────────────────
# 2. Rich Identity Card — Agent 身份证
# ──────────────────────────────────────────

@dataclass
class ModelIdentityCard:
    """
    Agent 身份证：暴露模型级属性，解决 MCP/A2A 不透明问题。
    每个 Agent 注册时携带此卡，供 Orchestrator 做智能路由。
    """
    agent_id: str
    model_id: str                          # 具体模型版本: "claude-opus-4", "qwen-7b"
    model_family: str                      # 模型族: "claude", "gpt", "qwen", "gemma"
    quality_tier: QualityTier
    reasoning_profile: ReasoningProfile
    cost_per_[REDACTED]                  # USD per 1K tokens
    max_context_tokens: int                # 最大上下文长度
    supported_modalities: list[str] = field(default_factory=lambda: ["text"])
    trust_domain: str = "default"          # 所属信任域
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2603.08852 — LDP: An Identity-Aware Protocol for Multi-Agent LLM Systems

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：历史任务记录（任务描述与实际所需模型质量）、各 Agent 的身份卡注册信息（模型版本、成本、上下文长度、信任域）与任务复杂度评估函数，粒度到单次任务。

**输出**：身份卡注册表与任务到模型档位的路由结果，含每类任务的模型选择、成本与质量对照，供平台架构师与成本负责人使用。

## 执行步骤

1. 定义模型质量档位与推理风格枚举
2. 为每个 Agent 登记包含模型版本、成本、上下文与信任域的身份卡
3. 用轻量分类器评估任务复杂度并落到对应档位
4. 把请求路由到对应档位的模型并记录实际使用的身份
5. 对比路由前后的成本与质量，标出身份错配的任务

## 边界与不做

- 任务复杂度无法评估或缺少身份卡注册信息时不可用；单一模型即可满足全部任务时无需引入。
- 本技能只定义身份与路由契约，不替代实际的模型网关、鉴权与限流系统。

## 技能关联

- **前置**：Skill-Cost-Aware-Agent-Scheduling.html、Skill-Cost-Aware-Agent-Scheduling、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-Tool-Call-Decision-Framework.html、Skill-Tool-Call-Decision-Framework
- **延伸**：Skill-Agent-QMix-Topology-Learning.html、Skill-Agent-QMix-Topology-Learning、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack
- **可组合**：Skill-Agentic-Workflow-Compilation.html、Skill-Agentic-Workflow-Compilation、Skill-ParaManager-Parallel-Orchestration.html、Skill-ParaManager-Parallel-Orchestration、Skill-SLM-Tool-Calling-Optimization.html、Skill-SLM-Tool-Calling-Optimization、Skill-LDP-Identity-Aware-Protocol

---

> 分类：数据与Agent平台/数据与AI运行/接口契约　·　技术族：16-智能体工程　·　源卡：`Skill-LDP-Identity-Aware-Protocol`