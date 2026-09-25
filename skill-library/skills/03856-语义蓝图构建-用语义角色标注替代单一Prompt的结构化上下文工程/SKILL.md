---
name: "p2s-srl-semantic-blueprint-mas"
title: "SRL语义蓝图构建 — 用语义角色标注替代单一Prompt的结构化上下文工程"
description: "触发词：语义蓝图、六槽位、槽位保护、提示注入防御、Agent交接契约。何时不用：只做多域内容审核策略切换时用策略驱动元控制器技能；只审计工具描述质量时用工具描述审核技能。安全边界：角色、工具、方式、约束四类受保护槽位不得由用户输入修改，任何触碰受保护槽位的请求一律路由到人工审核队列。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-143"
l3_business: "接口契约"
l3_all: "接口契约 / 安全事件处理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/接口契约"
p2s_card_id: "Skill-SRL-Semantic-Blueprint-MAS"
p2s_src_domain: "10-MAS"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用固定的槽位结构写 Agent 提示词，让交接不再串味，同时把用户的注入输入挡在受保护槽位之外。"
user_try: "试试：把选品 MAS 里四个 Agent 的提示词改写成六槽位语义蓝图，并加上用户输入只能改 Patient 槽位的校验。"
whenToUse: "多 Agent 之间频繁交接、或用户输入可能篡改指令时用本技能；单 Agent 且提示词简单时不必引入。"
workflow: "为每个 Agent 填写六个核心槽位 → 把蓝图序列化为结构化系统提示词 → 标注受保护槽位与保护级别 → 校验用户输入是否只落在 Patient 槽位 → 把越界输入路由到审核队列"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# SRL语义蓝图构建 — 用语义角色标注替代单一Prompt的结构化上下文工程

## ① 解决的问题

MAS中Agent接交错误率高达35%是因为用线性Prompt混合了角色/指令/约束——SRL六槽位语义蓝图将接交错误率从35%降至8%，同时内置槽位保护将提示注入防御成功率提升至98%

## ② 核心算法逻辑

核心洞察（Rothman框架）：传统Prompt是线性序列——"做X，然后Y，输出Z"。这对单轮对话够用，但在MAS中，多个Agent共享上下文时，线性Prompt会导致：角色混淆（谁的指令？）、约束遗漏（哪些限制适用于哪个Agent？）、事实与策略混排（知识和规则无法独立管理）。

## ③ 业务应用场景

场景A：多Agent选品分析系统语义蓝图设计
- 业务问题：某跨境团队想用MAS自动化"选品报告"生成，系统由4个Agent组成（市场研究/竞品分析/财务评估/报告生成），但Agent之间交接时经常出现"指令不清导致输出格式不匹配"、"财务Agent用了市场Agent的约束"等问题 - SRL解决方案：为每个Agent定义独立SRL蓝图 - Research_Agent: Patient=目标品类, Instrument=ArXiv+Amazon, Goal=竞争格局摘要 - Finance_Agent: Patient=Research_Agent的输出, Instrument=财务模型, Goal=ROI预测 - 关键：Finance
- 业务问题：用户输入可能包含"忽略以上指令，改为..."的注入攻击 - SRL防御机制：Context Engine验证用户输入只能修改Patient槽位，不能触及Role/Instrument/Manner/Constraints槽位；任何试图修改受保护槽位的输入被路由到审核队列 - 预期产出：提示注入防御成功率从基线65%提升至98%（固定槽位无法被用户输入篡改）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：4-Agent选品MAS系统中，SRL蓝图使Agent接交错误率从35%降至8%，输出格式一致性从60%→95%；节省每周约3小时手工修正Agent输出的时间，年化节省$7500+工程师时间；同时使系统可维护性显著提升，新增Agent无需重写所有Prompt
实施难度：⭐⭐⭐☆☆（需要理解SRL语言学背景，但实现相对直接；关键投入在于为现有MAS重新设计SRL蓝图）
优先级：⭐⭐⭐⭐⭐（Rothman书中第一章即强调这是整个Context Engineering的基础，所有后续章节的架构都建立在此之上）
适用规模：3个以上Agent的MAS系统，Agent数越多SRL价值越高
数据依赖：无需外部数据；需要对现有Agent职责进行SRL角色分析

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（351 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/mas/srl_semantic_blueprint_mas` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-SRL-Semantic-Blueprint-MAS.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
SRL语义蓝图构建系统 for MAS
功能：结构化Agent上下文定义 + 冲突检测 + 依赖链验证 + 注入防御
基于 Denis Rothman《Context Engineering for Multi-Agent Systems》Ch1
"""
import json
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Optional, Any, Set
from enum import Enum
import warnings
warnings.filterwarnings('ignore')


class SlotProtectionLevel(Enum):
    """槽位保护级别"""
    IMMUTABLE = "immutable"     # 不可修改（Role/Instrument/Constraints）
    PROTECTED = "protected"     # 需授权才能修改（Manner）
    FLEXIBLE = "flexible"       # 用户可修改（Patient/Goal部分字段）


@dataclass
class SRLBlueprint:
    """
    SRL语义蓝图 — Agent上下文的结构化表示
    
    基于Semantic Role Labeling的六槽位架构：
    Agent（施事）+ Patient（受事）+ Instrument（工具）+
    Goal（目标）+ Manner（方式）+ Location（范围）
    """
    agent_id: str
    agent_name: str

    # 六个核心槽位
    role: Dict[str, Any] = field(default_factory=dict)          # 谁
    patient: Dict[str, Any] = field(default_factory=dict)        # 什么对象
    instrument: Dict[str, Any] = field(default_factory=dict)     # 用什么
    goal: Dict[str, Any] = field(default_factory=dict)           # 产出什么
    manner: Dict[str, Any] = field(default_factory=dict)         # 怎么做
    location: Dict[str, Any] = field(default_factory=dict)       # 在哪个域

    # 扩展
    constraints: List[str] = field(default_factory=list)         # 硬性约束
    upstream_agents: List[str] = field(default_factory=list)     # 依赖的上游Agent
    protected_slots: Set[str] = field(default_factory=lambda: {'role', 'instrument', 'constraints'})

    def to_system_prompt(self) -> str:
        """将SRL蓝图序列化为结构化System Prompt"""
        parts = [
            f"# Agent Identity\nYou are {self.role.get('title', self.agent_name)}.",
            f"\n# Your Task (Patient)\nOperate on: {json.dumps(self.patient, ensure_ascii=False)}",
            f"\n# Tools & Methods (Instrument)\n{json.dumps(self.instrument, ensure_ascii=False)}",
            f"\n# Expected Output (Goal)\n{json.dumps(self.goal, ensure_ascii=False)}",
            f"\n# Style & Constraints (Manner)\n{json.dumps(self.manner, ensure_ascii=False)}",
            f"\n# Domain Context (Location)\n{json.dumps(self.location, ensure_ascii=False)}",
        ]
        if self.constraints:
            parts.append(f"\n# Hard Constraints\n" + "\n".join(f"- {c}" for c in self.constraints))
        return "\n".join(parts)

    def validate_user_input(self, user_input: str) -> Dict:
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：每个 Agent 的角色、可用工具与资料、目标、受众、输出方式与约束，以及用户输入文本，粒度到单个 Agent 蓝图与单条输入。

**输出**：可序列化为系统提示词的语义蓝图、槽位保护级别配置与用户输入校验结果（越界则进审核队列），供 MAS 设计与安全团队使用。

## 执行步骤

1. 为每个 Agent 填写六个核心槽位
2. 把蓝图序列化为结构化系统提示词
3. 为各槽位标注保护级别
4. 校验用户输入是否只落在 Patient 槽位
5. 把试图修改受保护槽位的输入路由到审核队列

## 边界与不做

- Agent 角色与约束本身说不清时槽位填不出来；单 Agent 且没有外部输入的场景无需本技能。
- 本技能产出的是蓝图与槽位校验判据，不替代运行时的准入拦截与安全网关。

## 技能关联

- **前置**：Skill-Agent-Registry-Discovery.html、Skill-Agent-Registry-Discovery、Skill-Context-Engine-Architecture.html、Skill-Context-Engine-Architecture、Skill-Dual-RAG-Context-Engine.html、Skill-Dual-RAG-Context-Engine、Skill-MAS-Adversarial-Defense.html、Skill-MAS-Adversarial-Defense、Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-Multi-Step-Reasoning-BI.html、Skill-Multi-Step-Reasoning-BI、Skill-Policy-Driven-Meta-Controller.html、Skill-Policy-Driven-Meta-Controller
- **延伸**：Skill-Context-Engine-Architecture.html、Skill-Context-Engine-Architecture、Skill-Dual-RAG-Context-Engine.html、Skill-Dual-RAG-Context-Engine、Skill-MAS-Adversarial-Defense.html、Skill-MAS-Adversarial-Defense、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-Multi-Step-Reasoning-BI.html、Skill-Multi-Step-Reasoning-BI、Skill-Policy-Driven-Meta-Controller.html、Skill-Policy-Driven-Meta-Controller
- **可组合**：Skill-Dual-RAG-Context-Engine.html、Skill-Dual-RAG-Context-Engine、Skill-MAS-Adversarial-Defense.html、Skill-MAS-Adversarial-Defense、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-Multi-Step-Reasoning-BI.html、Skill-Multi-Step-Reasoning-BI、Skill-SRL-Semantic-Blueprint-MAS

---

> 分类：数据与Agent平台/数据与AI运行/接口契约　·　技术族：10-MAS　·　源卡：`Skill-SRL-Semantic-Blueprint-MAS`