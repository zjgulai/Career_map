---
name: "p2s-mas-adversarial-defense"
title: "MAS Adversarial Defense — 多智能体系统攻防：群体合谋检测、规划时攻击防御、路由感知注入"
description: "触发词：对抗防御、群体合谋、规划时攻击、路由注入、决策拦截。何时不用：单 Agent 且不读外部数据源时不存在合谋与路由注入面；本技能面向多 Agent 从外部数据源取数的系统。安全边界：检测判据与拦截规则是契约产物，实际拦截由执行层完成；误判会直接影响备货决策，须保留人工覆盖。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-136"
l3_business: "安全事件处理"
l3_all: "安全事件处理"
l1_l2_l3: "独立控制/数据与AI运行/安全事件处理"
p2s_card_id: "Skill-MAS-Adversarial-Defense"
p2s_src_domain: "10-MAS"
quality_tier: "preview"
user_summary: "竞品同时在多个数据源做手脚，想让你的 Agent 一起判断错，于是检测群体合谋和注入、把异常决策拦下来。"
user_try: "试试：这批竞品价格数据里有没有人为操纵的痕迹，顺带检查 Agent 决策链有没有被注入。"
whenToUse: "多 Agent 从外部数据源取数、存在被投毒或合谋操控风险时用本技能；单 Agent 处理内部数据的场景不涉及此类攻击面。"
workflow: "标记可疑外部数据源与异常定价 → 检测多个 Agent 的一致性异常 → 审查规划链路是否被插入额外步骤 → 拦截异常决策并升级人工审核"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# MAS Adversarial Defense — 多智能体系统攻防：群体合谋检测、规划时攻击防御、路由感知注入

## ① 解决的问题

风控运营面临对抗式Agent投毒——Adversarial Defense将异常决策拦截率从70%提到96%，年化省25万元

## ② 核心算法逻辑

SkillAgentSafetyGuardrails 保护的是单个 Agent 免受提示注入攻击。但 MAS 中的攻击比单 Agent 复杂 10 倍：攻击者可以利用多个 Agent 之间的信任关系和通信路径发动群体级攻击。

## ③ 业务应用场景

业务背景：母婴品牌的 MAS 系统从多个数据源 Agent 获取竞品价格数据。竞品可能通过"投毒"数据源（在 Amazon 平台上故意异常定价），诱导 MAS 的多个 Agent 同时报告高竞品价格，让品牌高估市场价格、定价过高失去竞争力。
业务背景：广告竞价 MAS 接收来自外部广告代理的"优化建议"，但恶意代理可能通过建议修改竞价 DAG，插入"向竞争对手账户发送出价预告"的步骤。
三轨验证 | 成本轨：月均成本3,200元（AI模型调用费2,000元/月，人工审核12小时/月×100元/小时=1,200元），年度成本38,400元 | 合规轨：符合《跨境电商进出口商品质量安全监督管理办法》第12条关于风险预警机制要求，满足母婴产品备货合规性审查标准，通过海关HS编码自动匹配验证 | 风险轨：模型误判导致备货偏差（概率8%），可能造成库存积压或缺货，影响大促转化率；多Agent协同延迟风险（概率3%），高并发下响应时间超2秒；数据隐私泄露风险（概率2%），涉及消费者购买记录

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

5-10 万/月

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（186 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：7」并记录位置 `paper2skills-code/mas/mas_adversarial_defense` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-MAS-Adversarial-Defense.md`），已与卡面节选核对，不依赖上述路径。

```python
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set, Tuple
import math
import time


@dataclass
class AgentMessage:
    sender_id: str
    receiver_id: str
    content: str
    timestamp: float = field(default_factory=time.time)
    is_honeypot_response: bool = False


@dataclass
class DefenseAlert:
    alert_type: str
    severity: str
    involved_agents: List[str]
    evidence: dict
    action: str


class GroupGuardMonitor:
    """
    GroupGuard 图监控：检测群体合谋攻击
    三层：图监控 + 蜜罐 + 结构剪枝
    """

    def __init__(self, density_threshold_sigma: float = 3.0,
                 window_seconds: float = 300.0):
        self.density_threshold_sigma = density_threshold_sigma
        self.window_seconds = window_seconds
        self._message_log: List[AgentMessage] = []
        self._density_history: List[float] = []
        self._honeypot_agents: Set[str] = set()
        self._honeypot_solicitations: List[Dict] = []

    def register_honeypot(self, agent_id: str):
        self._honeypot_agents.add(agent_id)

    def record_message(self, msg: AgentMessage) -> Optional[DefenseAlert]:
        self._message_log.append(msg)
        if msg.receiver_id in self._honeypot_agents and not msg.is_honeypot_response:
            self._honeypot_solicitations.append({
                "sender": msg.sender_id, "content": msg.content, "ts": msg.timestamp
            })
            if len(self._honeypot_solicitations) >= 2:
                return DefenseAlert(
                    alert_type="honeypot_triggered",
                    severity="high",
                    involved_agents=[s["sender"] for s in self._honeypot_solicitations],
                    evidence={"solicitations": self._honeypot_solicitations[-3:]},
                    action="isolate_senders",
                )

        density_alert = self._check_density()
        return density_alert
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2604.16543 — Conjunctive Prompt Attacks in Multi-Agent LLM Systems

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：Agent 间消息（发送方、接收方、内容、时间）、外部数据源的原始值、正常决策基线；需能识别异常一致性模式。

**输出**：合谋与注入检测结果、异常决策拦截清单与需人工复核的决策项，供风控与 MAS 编排层使用。

## 执行步骤

1. 采集 Agent 消息与外部数据源原始值
2. 识别异常定价与多 Agent 一致性异常
3. 检查规划链路是否被插入攻击步骤
4. 拦截异常决策并升级人工审核
5. 复盘误判率并调整判据

## 边界与不做

- 单 Agent 且不读外部数据源时，不存在合谋与路由注入攻击面。
- 本技能产出检测结果与拦截判据，实际拦截动作由执行层完成。
- 误判会直接导致备货偏差，需保留人工覆盖通道并监控误判率。

## 技能关联

- **前置**：Skill-Agent-Safety-Guardrails.html、Skill-Agent-Safety-Guardrails、Skill-MAS-Dynamic-Trust.html、Skill-MAS-Dynamic-Trust、Skill-SDOF-State-Constrained-Orchestration.html、Skill-SDOF-State-Constrained-Orchestration
- **延伸**：Skill-AgentTrust-Runtime-Safety-Interception.html、Skill-AgentTrust-Runtime-Safety-Interception
- **可组合**：Skill-MAS-Consensus-Mechanism.html、Skill-MAS-Consensus-Mechanism、Skill-MAS-Testing-Verification.html、Skill-MAS-Testing-Verification、Skill-MAS-Adversarial-Defense

---

> 分类：独立控制/数据与AI运行/安全事件处理　·　技术族：10-MAS　·　源卡：`Skill-MAS-Adversarial-Defense`