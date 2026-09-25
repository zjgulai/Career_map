---
name: "p2s-agent-registry-discovery"
title: "Agent Registry & Discovery — 动态 Agent 能力注册与路由"
description: "触发词：Agent 注册、能力发现、灰度扩容、健康检查、故障转移。何时不用：技能层面的注册与发现走「技能注册表」；配额与限流调度走「MAS 资源调度」。安全边界：本技能只产出能力目录与路由规则，真正的流量切换由模型外的确定性控制层执行。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-147"
l3_business: "技能版本"
l3_all: "技能版本 / 容量管理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/技能版本"
p2s_card_id: "Skill-Agent-Registry-Discovery"
p2s_src_domain: "10-MAS"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "新版本 Agent 上线要让编排器立刻知道它会什么，按能力和健康度分流，扩容与灰度都不停机。"
user_try: "试试：新版补货 Agent 上线了，帮我设计能力注册和 10% 灰度流量的方案。"
whenToUse: "当 MAS 需要动态扩容、多版本灰度或按能力自动路由时用；若注册对象是技能而非 Agent 实例，用「技能注册表」；若只是配额与限流，用「MAS 资源调度」。"
workflow: "定义 Agent 能力标签与元数据结构 → 新实例启动时向注册中心上报能力与版本 → 注册中心广播变更给编排器 → 按能力与 fitness 分数灰度路由流量 → 持续健康检查与故障自动转移"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Agent Registry & Discovery — 动态 Agent 能力注册与路由

## ① 解决的问题

大促期间 MAS 需动态扩容补货 Agent，无注册发现中心则新 Agent 无法被编排器感知——Agent Registry 让新实例自动上报能力标签，实现秒级灰度扩容

## ② 核心算法逻辑

论文：Dynamic Agent Discovery and Routing in MultiAgent Systems | 年份：2023

## ③ 业务应用场景

场景一：婴儿暖奶器库存补货 Agent 灰度升级（WF-A 补货工作流）
母婴出海平台 SKU 婴儿暖奶器（型号 WMH-2024-Pro）库存 2000 件，日销 50 件，周期补货周期 14 天。旧版补货 Agent v1 仅支持单货币定价，新版 Agent v2 集成多货币汇率预测和区域库存均衡能力。v2 上线时向 Registry 注册，声明新能力 `["replenishment", "fx_prediction", "regional_balance"]`。Registry 广播变更，Orchestrator 灰度路由 10% 流量（日销 5 件）至 v2。每 5 分钟检查 SLO：v2 连续 3 次 fitness > v1（0.92 vs 0.88）
场景二：婴儿推车选品 Agent 池多能力调度（WF-D 选品工作流）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：MAS 从静态配置升级为动态服务网格，支持热更新和蓝绿发布，Agent 版本迭代零停机；Fitness 路由减少低质量决策暴露率；故障自动转移保证业务连续性，年化节省成本 45 万元+，ROAS 提升 1.3 倍，库存周转率提升 28%，复购率提升 27%
难度：⭐⭐⭐☆☆ | 优先级：⭐⭐⭐⭐⭐

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（195 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/mas/agent_registry_discovery` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-Agent-Registry-Discovery.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Agent Registry & Discovery — 动态注册与路由
来源：Agent Registry 2025-2026 + MCP/A2A 协议扩展
"""
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import List, Dict, Optional, Set


class HealthStatus(Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    DOWN = "down"


class RoutingStrategy(Enum):
    FITNESS_FIRST = "fitness_first"
    LATENCY_FIRST = "latency_first"
    ROUND_ROBIN = "round_robin"


@dataclass
class AgentCapability:
    skill_names: List[str]
    domains: List[str]
    slo_target: float               # 如 0.999
    version: str
    fitness: float = 1.0            # 0.0-1.0，综合延迟+成功率
    p95_latency_ms: float = 100.0

    def matches(self, required_skills: List[str], domain: Optional[str] = None) -> float:
        if not required_skills:
            return 0.0
        required_set: Set[str] = set(required_skills)
        own_set: Set[str] = set(self.skill_names)
        intersection = required_set & own_set
        union = required_set | own_set
        jaccard = len(intersection) / len(union) if union else 0.0
        domain_bonus = 0.1 if domain and domain in self.domains else 0.0
        return min(1.0, jaccard + domain_bonus)


@dataclass
class AgentRegistration:
    agent_id: str
    endpoint: str
    capabilities: AgentCapability
    health_status: HealthStatus = HealthStatus.HEALTHY
    last_heartbeat: float = field(default_factory=time.time)
    registered_at: float = field(default_factory=time.time)
    _consecutive_failures: int = 0

    def update_heartbeat(self) -> None:
        self.last_heartbeat = time.time()
        self._consecutive_failures = 0
        self.health_status = HealthStatus.HEALTHY

    def mark_failure(self) -> None:
        self._consecutive_failures += 1
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2305.20050，但该号在 arXiv 上是《Let's Verify Step by Step》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Dynamic Agent Discovery and Routing in MultiAgent Systems》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：需 Agent 实例的能力标签、版本号与健康状态、SLO 与 fitness 指标定义、流量切换策略，实例级粒度。

**输出**：产出版本化的 Agent 能力目录、灰度路由方案与 fitness 对比结果（卡页示例新版 0.92 对旧版 0.88）、健康检查与故障转移规则，供 MAS 平台运维使用。

## 执行步骤

1. 定义 Agent 能力标签与元数据结构
2. 上报新实例的能力与版本到注册中心
3. 广播变更给编排器
4. 灰度路由流量（按能力与 fitness 分数）
5. 持续健康检查并在异常时自动转移流量

## 边界与不做

- 只有一个 Agent 版本、无灰度需求时，注册中心是多余组件
- 只产出能力目录与路由规则，流量切换由模型外的确定性控制层执行
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-Agent-SLO-Manager.html、Skill-Agent-SLO-Manager、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-ParaManager-Parallel-Orchestration.html、Skill-ParaManager-Parallel-Orchestration、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-SDOF-State-Constrained-Orchestration.html、Skill-SDOF-State-Constrained-Orchestration、Skill-Skill-Registry-Dynamic-Loading.html、Skill-Skill-Registry-Dynamic-Loading
- **延伸**：Skill-Agent-SLO-Manager.html、Skill-Agent-SLO-Manager、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-ParaManager-Parallel-Orchestration.html、Skill-ParaManager-Parallel-Orchestration、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-SDOF-State-Constrained-Orchestration.html、Skill-SDOF-State-Constrained-Orchestration
- **可组合**：Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-SDOF-State-Constrained-Orchestration.html、Skill-SDOF-State-Constrained-Orchestration、Skill-Agent-Registry-Discovery

---

> 分类：数据与Agent平台/数据与AI运行/技能版本　·　技术族：10-MAS　·　源卡：`Skill-Agent-Registry-Discovery`