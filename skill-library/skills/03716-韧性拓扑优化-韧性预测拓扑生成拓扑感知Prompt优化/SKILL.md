---
name: "p2s-resmas-resilience-topology-optimization"
title: "ResMAS韧性拓扑优化 — GNN韧性预测+GRPO拓扑生成+拓扑感知Prompt优化"
description: "触发词：拓扑优化、韧性评估、冗余验证、依赖重构、高负载降级。何时不用：只有一两个 Agent 的简单链路，重构拓扑收益有限；本技能面向 3 个以上 Agent、单点失效会放大成全链路失败的系统。安全边界：拓扑方案与切换判据是契约产物，在线切换的编排动作由控制层执行，本技能不做在线切换。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-151"
l3_business: "失败恢复"
l3_all: "失败恢复 / 依赖协调"
l1_l2_l3: "数据与Agent平台/数据与AI运行/失败恢复"
p2s_card_id: "Skill-ResMAS-Resilience-Topology-Optimization"
p2s_src_domain: "10-MAS"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把一条线串起来的 Agent 流程改成互相验证的层次结构，一个节点挂了也不至于全盘崩。"
user_try: "试试：把这条线性选品流程改成层次拓扑，评估一下单点失效时的影响变化。"
whenToUse: "3 个以上 Agent、单点失效会放大成全链路失败时用本技能；只处理调用抖动与重试用容错回退类技能。"
workflow: "评估现有拓扑的韧性 → 生成候选层次拓扑并离线预计算 → 按失效场景对比性能下降幅度 → 高负载期按判据切换到高韧性拓扑"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# ResMAS韧性拓扑优化 — GNN韧性预测+GRPO拓扑生成+拓扑感知Prompt优化

## ① 解决的问题

线性Pipeline是最脆弱的MAS拓扑，单节点失效导致性能下降23.7%——ResMAS用GNN韧性预测+GRPO自动生成层次拓扑，失效10%时性能下降仅5.5%（+30%韧性）（2026 arXiv:2601.04694）

## ② 核心算法逻辑

反直觉洞察：MAS设计者通常先设计业务逻辑（"我需要Research→Compliance→Finance→Report这个流程"），然后在拓扑上做这个线性链条。ResMAS揭示了一个反直觉结论：拓扑结构对MAS韧性的影响与基础模型能力同等重要——同样的GPT4o集群，层次拓扑的韧性比中心化（Star）拓扑高30%+。更重要的是：拓扑不应该手工设计，而应该通过GNN预测+强化学习自动生成最优韧性拓扑。

## ③ 业务应用场景

- 业务问题：供应链MAS在旺季高负载期间，Market Research Agent有时因API限流返回不完整数据，导致整个Pipeline基于不完整信息做出错误的备货决策。当前线性拓扑（Market→Compliance→Finance→Report）无法容忍任何一个节点失效 - ResMAS方案： 1. 将线性Pipeline重构为层次拓扑：`Market→(Compliance↔Finance)→Report` 2. Compliance和Finance互相验证对方的输出 3. 若Market Agent返回不完整数据（检测：关键字段缺失率>20%），Compliance和Financ
- **业务问题**：大促期间（12小时高压）所有Agent负载高，错误率上升；而平时（低负载）不需要额外韧性机制 - **GRPO动态生成方案**：系统检测到Agent错误率>10%时，自动调用GRPO模型生成适合当前任务分布的高韧性拓扑（添加验证节点、增加冗余通信边），大促结束后恢复经济拓扑 - **预期产出**：大促期间的MAS任务完成率从87%提升至95%（+8%），普通时期不增加额外成本 - **三轨验证**： - **成本**：GRPO模型在线推理每次约$0.05（GPT-4o调用），大促12小时每5分钟评估一次，总成本约$7.2；拓扑切换需预计算3-5个候选拓扑（离线计算$100

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：月处理2000次完整MAS任务的平台，从线性拓扑改为层次拓扑后任务成功率从83%→92%（+9%），月增成功任务180次；若每次成功的供应链决策价值$100，月增价值$18000；ResMAS系统成本$6万，ROI≈360%
实施难度：⭐⭐⭐☆☆（拓扑改造本身不复杂；难点在于将现有线性工作流重构为层次结构；GRPO训练需要数据集）
优先级：⭐⭐⭐⭐⭐（论文揭示了MAS设计的"第一原理"：拓扑与模型同等重要——这个洞察改变了MAS工程的根本出发点）
适用规模：所有3+个Agent的MAS系统，高负载/高失效率场景（旺季/促销/大量并发）尤其关键
数据依赖：需要历史任务成功/失败数据来评估不同拓扑的韧性；GNN训练需要(拓扑, 韧性分数)对数据集

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（268 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/mas/resmas_resilience_topology_optimization` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-ResMAS-Resilience-Topology-Optimization.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
ResMAS韧性拓扑优化系统
功能：GNN韧性预测(简化版) + 拓扑生成 + 拓扑感知Prompt + 韧性评估
基于 arXiv:2601.04694 (2026)
"""
import numpy as np
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple, Set
from enum import Enum
import warnings
warnings.filterwarnings('ignore')


class TopologyType(Enum):
    LINEAR = "linear"       # A→B→C（最脆弱）
    STAR = "star"           # A→(B,C,D)（中等）
    HIERARCHICAL = "hierarchical"  # A→(B↔C)→D（最强韧）
    FLAT = "flat"           # A↔B↔C（环形，中等）
    CUSTOM = "custom"


@dataclass
class AgentNode:
    """MAS拓扑中的Agent节点"""
    agent_id: str
    role: str
    failure_rate: float = 0.0      # 当前失效率
    base_quality: float = 0.85     # 无失效时的基础质量


@dataclass
class MASTopology:
    """MAS拓扑结构"""
    topology_type: TopologyType
    agents: List[AgentNode]
    edges: List[Tuple[str, str]]   # (from_agent, to_agent) 有向边

    def get_neighbors(self, agent_id: str) -> List[str]:
        """获取Agent的直接上游邻居"""
        return [src for src, dst in self.edges if dst == agent_id]

    def get_hub_agents(self) -> List[str]:
        """识别Hub Agent（被多个Agent依赖）"""
        in_degree = {a.agent_id: 0 for a in self.agents}
        for _, dst in self.edges:
            in_degree[dst] += 1
        return [aid for aid, deg in in_degree.items() if deg >= 2]

    @property
    def adjacency_features(self) -> np.ndarray:
        """提取拓扑特征向量（GNN输入的简化版）"""
        n = len(self.agents)
        # 特征：[平均度, 最大入度, 聚类系数近似, 层次深度, 是否有双向边]
        out_degrees = {a.agent_id: 0 for a in self.agents}
        in_degrees = {a.agent_id: 0 for a in self.agents}
        bidirectional = set()

        for src, dst in self.edges:
            out_degrees[src] += 1
            in_degrees[dst] += 1
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2601.04694 — ResMAS: Resilience Optimization in LLM-based Multi-agent Systems

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：现有 MAS 拓扑结构与节点依赖、历史任务成功与失败数据（用于韧性评估），以及训练用的拓扑与韧性分数数据集。

**输出**：候选拓扑方案、各拓扑的韧性评估结果与切换判据，以及配套的拓扑感知提示词调整建议，供 MAS 编排层采用。

## 执行步骤

1. 梳理现有 Agent 拓扑与依赖边
2. 用历史失效数据评估各拓扑韧性
3. 生成并离线预计算候选层次拓扑
4. 在大促等高负载场景按判据切换
5. 复盘切换前后的任务完成率

## 边界与不做

- Agent 数量很少（一两个）时，拓扑重构的收益有限。
- 本技能产出拓扑方案与切换判据，不在线执行拓扑切换。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。
- 韧性评估依赖历史失效数据，冷启动阶段结论偏差较大。

## 技能关联

- **前置**：Skill-AgenTracer-MAS-Failure-Attribution.html、Skill-AgenTracer-MAS-Failure-Attribution、Skill-Dynamic-DAG-Orchestration.html、Skill-Dynamic-DAG-Orchestration、Skill-Error-Cascade-Propagation-Defense.html、Skill-Error-Cascade-Propagation-Defense、Skill-MAS-Consensus-Mechanism.html、Skill-MAS-Consensus-Mechanism、Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-Multi-Step-Reasoning-BI.html、Skill-Multi-Step-Reasoning-BI、Skill-SDOF-State-Constrained-Orchestration.html、Skill-SDOF-State-Constrained-Orchestration
- **延伸**：Skill-AgenTracer-MAS-Failure-Attribution.html、Skill-AgenTracer-MAS-Failure-Attribution、Skill-Error-Cascade-Propagation-Defense.html、Skill-Error-Cascade-Propagation-Defense、Skill-MAS-Consensus-Mechanism.html、Skill-MAS-Consensus-Mechanism、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-Multi-Step-Reasoning-BI.html、Skill-Multi-Step-Reasoning-BI、Skill-SDOF-State-Constrained-Orchestration.html、Skill-SDOF-State-Constrained-Orchestration
- **可组合**：Skill-AgenTracer-MAS-Failure-Attribution.html、Skill-AgenTracer-MAS-Failure-Attribution、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-Multi-Step-Reasoning-BI.html、Skill-Multi-Step-Reasoning-BI、Skill-SDOF-State-Constrained-Orchestration.html、Skill-SDOF-State-Constrained-Orchestration、Skill-ResMAS-Resilience-Topology-Optimization

---

> 分类：数据与Agent平台/数据与AI运行/失败恢复　·　技术族：10-MAS　·　源卡：`Skill-ResMAS-Resilience-Topology-Optimization`