---
name: "p2s-error-cascade-propagation-defense"
title: "MAS错误级联传播防御 — 有向依赖图传播建模与血统追踪治理层"
description: "触发词：错误级联、血统追踪、断路器、置信门控、传播阻断。何时不用：并行且无下游依赖的任务链不需要级联防御；本技能面向线性或层次化 MAS 的错误传播阻断。安全边界：断路器阈值与判据是契约产物；需设误报率监控并保留人工覆盖通道，异常来源的第三方核查接口须合规。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-151"
l3_business: "失败恢复"
l3_all: "失败恢复 / 运行监测"
l1_l2_l3: "数据与Agent平台/数据与AI运行/失败恢复"
p2s_card_id: "Skill-Error-Cascade-Propagation-Defense"
p2s_src_domain: "10-MAS"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "一个 Agent 报了错数据，下游别跟着一起错：标上来源可信度，超阈值就阻断并转人工。"
user_try: "试试：研究 Agent 这条数据来源不可信，帮我追踪它会污染哪些下游结论。"
whenToUse: "线性或层次化 MAS 中一个错误事实会被下游当既定事实使用时用本技能；只需定位单点根因用因果图根因分析类技能。"
workflow: "为每条消息附带来源引用与置信度 → 维护血统图并标注低置信来源 → 感染规模超临界前触发断路器 → 隔离异常输出并升级人工审核"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# MAS错误级联传播防御 — 有向依赖图传播建模与血统追踪治理层

## ① 解决的问题

注入一个原子错误种子就能让线性MAS Pipeline 100%崩溃——血统追踪治理层实时监控传播图并在超临界前触发断路器，阻断89%+的最终感染（2026 arXiv:2603.04474）

## ② 核心算法逻辑

反直觉洞察：大多数MAS工程师关注"单个Agent的错误率"，而忽视了更致命的问题——错误的传播和放大。一个微小的事实错误（"竞品月销3000件"→实际500件）在线性Pipeline中会被每个下游Agent当作"已确认事实"来引用和扩展，最终形成一个看起来非常自信但完全错误的决策。论文发现：注入仅一个原子错误种子就能导致MetaGPT整个系统崩溃（RS_f=0%）。反直觉的是：增加Agent数量不一定提升鲁棒性，有时反而增加级联风险。

## ③ 业务应用场景

- 业务问题：Research Agent错误报告"吸奶器品类年增长率45%"（实际12%），Finance Agent基于此计算了错误的ROI（过于乐观），Report Agent生成了"强烈推荐立即大批量进入"的报告，导致过度备货$30万 - 根因：线性Pipeline中没有错误传播检测，事实错误被下游Agent当作confirmed fact - 级联防御方案： 1. Research Agent输出附带来源引用和置信度：`"年增长率45%（来源：未验证新闻），置信度=0.4"` 2. 血统追踪：Finance Agent引用这条信息时标记blood=YELLOW（低置信度来源） 3. 
三轨验证： - 成本：每条消息增加血统元数据（约50字节/条），置信度评分需引入外部事实核查API（如Google Fact Check Tools，约$0.01/次）；计算资源增加约5%（血统图维护+断路器判断） - 合规：血统追踪不涉及用户个人数据，仅记录Agent间消息依赖关系，不违反GDPR/CCPA；但需注意：若置信度评分依赖第三方API，需确保API供应商的数据处理合规（如不将业务数据用于模型训练） - 风险：过度保守的断路器可能导致正常消息被误阻断（如高置信度但低可信来源的消息被标记YELLOW），影响业务响应速度；需设置断路器误报率监控（目标<2%），并保留人工覆盖通道
- 业务问题：大促期间MAS处理100个并发品类分析，一个库存Agent故障（返回所有库存为0），导致下游所有报告都推荐"紧急补货"，触发了错误的大批量采购 - MAS-FIRE防御方案： 1. 库存Agent输出经过Mechanism层验证（库存=0的SKU数>50%→异常信号） 2. 断路器触发：该Agent的输出被隔离，并行启动备用估算逻辑 3. 受影响的下游任务收到"库存数据不可信"标记，暂停自动决策，升级人工审核 - 预期产出：单Agent故障影响范围从100%降至<15%（只有直接依赖该Agent的任务受影响）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：一次因错误级联导致的错误大批量采购（如过度备货$30万）是可避免的；血统治理层阻断89%的终端感染，年化避免1次此类事故=$30万防损；系统成本$8万，ROI≈375%
实施难度：⭐⭐⭐⭐☆（血统追踪需要修改MAS消息传递层，对现有框架有一定侵入性；建议作为消息layer的plugin实现，不修改Agent本身）
优先级：⭐⭐⭐⭐⭐（论文发现"注入1个错误种子即可导致整个Pipeline崩溃"——这是所有线性MAS工作流的共同致命弱点，不解决这个问题所有MAS质量保证都是假的）
适用规模：所有线性或层次化MAS系统，特别是涉及高风险决策（采购/合规/财务）的场景
数据依赖：需要为每条消息定义置信度评分机制；可从来源可信度、事实可验证性、推理链长度等维度计算

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（263 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/mas/error_cascade_propagation_defense` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-Error-Cascade-Propagation-Defense.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
MAS错误级联传播防御系统
功能：有向依赖图建模 + 血统追踪 + 断路器 + 超临界级联预警
基于 arXiv:2603.04474 + 2602.19843 (2026)
"""
import numpy as np
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Set, Tuple
from enum import Enum
from collections import defaultdict, deque
import warnings
warnings.filterwarnings('ignore')


class RiskLevel(Enum):
    GREEN = "GREEN"     # 低风险
    YELLOW = "YELLOW"   # 中风险（传播但标记）
    RED = "RED"         # 高风险（触发断路器）


@dataclass
class MessageGenealogy:
    """消息血统记录"""
    message_id: str
    source_agent: str
    content_preview: str
    parent_ids: List[str] = field(default_factory=list)
    confidence: float = 1.0
    verification_status: str = "UNVERIFIED"
    risk_level: RiskLevel = RiskLevel.GREEN
    propagation_count: int = 0           # 已传播给多少个Agent
    retry_count: int = 0
    excluded_from_lineage: bool = False   # 是否已被断路器排除


class ErrorCascadeDetector:
    """错误级联检测器"""

    def __init__(self, cascade_threshold: float = 0.35,
                 max_retry: int = 3):
        self.cascade_threshold = cascade_threshold  # 超临界阈值（近似e^{-γ}）
        self.max_retry = max_retry
        self.message_store: Dict[str, MessageGenealogy] = {}
        self.dependency_graph: Dict[str, List[str]] = defaultdict(list)  # agent -> [upstream_messages]
        self.infection_log: List[Dict] = []

    def register_message(self, msg_id: str, source_agent: str,
                          content: str, parent_ids: List[str] = None,
                          confidence: float = 1.0) -> MessageGenealogy:
        """注册新消息并构建血统"""
        genealogy = MessageGenealogy(
            message_id=msg_id,
            source_agent=source_agent,
            content_preview=content[:80],
            parent_ids=parent_ids or [],
            confidence=confidence,
            risk_level=self._compute_initial_risk(confidence, parent_ids or []),
        )
        self.message_store[msg_id] = genealogy
        return genealogy
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2602.19843 — MAS-FIRE: Fault Injection and Reliability Evaluation for LLM-Based Multi-Agent Systems

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：Agent 间消息流及其依赖关系、每条消息的来源与置信度评分（可从来源可信度、可验证性、推理链长度计算），以及可选的事实核查接口。

**输出**：带血统元数据的消息、断路器触发判据与阈值、感染影响范围评估（含误报率监控口径），供 MAS 消息层与运维使用。

## 执行步骤

1. 给 Agent 输出附加来源与置信度标注
2. 构建消息血统图并计算传播规模
3. 在超临界前触发断路器隔离异常输出
4. 对受影响下游任务打不可信标记并暂停自动决策
5. 评估影响范围与误报率并记录

## 边界与不做

- 并行且无依赖的任务链不需要级联传播防御。
- 本技能产出传播阻断判据与隔离规则，不执行任务的暂停与恢复动作。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。
- 过于保守的断路器会误阻断正常消息，需监控误报率并保留人工覆盖通道。

## 技能关联

- **前置**：Skill-AgenTracer-MAS-Failure-Attribution.html、Skill-AgenTracer-MAS-Failure-Attribution、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Glass-Box-MAS-Observability.html、Skill-Glass-Box-MAS-Observability、Skill-Graph-Grounded-MAS-Protocol.html、Skill-Graph-Grounded-MAS-Protocol、Skill-High-Fidelity-RAG-Defense.html、Skill-High-Fidelity-RAG-Defense、Skill-MAS-Adversarial-Defense.html、Skill-MAS-Adversarial-Defense、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ResMAS-Resilience-Topology-Optimization.html、Skill-ResMAS-Resilience-Topology-Optimization
- **延伸**：Skill-AgenTracer-MAS-Failure-Attribution.html、Skill-AgenTracer-MAS-Failure-Attribution、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Glass-Box-MAS-Observability.html、Skill-Glass-Box-MAS-Observability、Skill-High-Fidelity-RAG-Defense.html、Skill-High-Fidelity-RAG-Defense、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ResMAS-Resilience-Topology-Optimization.html、Skill-ResMAS-Resilience-Topology-Optimization
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Glass-Box-MAS-Observability.html、Skill-Glass-Box-MAS-Observability、Skill-High-Fidelity-RAG-Defense.html、Skill-High-Fidelity-RAG-Defense、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Error-Cascade-Propagation-Defense

---

> 分类：数据与Agent平台/数据与AI运行/失败恢复　·　技术族：10-MAS　·　源卡：`Skill-Error-Cascade-Propagation-Defense`