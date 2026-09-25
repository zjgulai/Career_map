---
name: "p2s-cross-org-agent-protocol"
title: "Cross-Org Agent Protocol — 跨组织多智能体协调协议：多委托人、联邦编排、工作区委托"
description: "触发词：跨组织协作、多委托人、联邦编排、消息签名、工作区委托。何时不用：同一组织内的多 Agent 调度用「MAS Orchestrator」；跨组织双方要严格共识与容错用「MAS 共识机制」。安全边界：跨组织消息必须签名验签；未建立委托关系前不得交换价格、产能等商业敏感数据。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-006"
l3_business: "依赖协调"
l3_all: "依赖协调"
l1_l2_l3: "经营管理/经营与组织/依赖协调"
p2s_card_id: "Skill-Cross-Org-Agent-Protocol"
p2s_src_domain: "10-MAS"
quality_tier: "preview"
user_summary: "让分属不同公司或不同厂商的 Agent 互相协作，靠签名消息和委托关系把协作口径对齐。"
user_try: "试试：帮我把品牌采购 Agent 和工厂产能 Agent 接起来，按跨组织协议协商交期。"
whenToUse: "当协作双方 Agent 分属不同组织或厂商、没有共同 API 或信任基础时用本技能；同一组织内的编排调度用「MAS Orchestrator」；需要严格共识与容错用「MAS 共识机制」。"
workflow: "建立 MPAC 会话并声明双方委托人 → 按 MPAC 层级与消息类型封装消息 → 对消息签名并在接收端验签 → 按委托范围交换约定字段并协商出结论 → 留存会话记录供审计"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Cross-Org Agent Protocol — 跨组织多智能体协调协议：多委托人、联邦编排、工作区委托

## ① 解决的问题

项目经理面临跨部门协作口径不一——Cross-Org Protocol将需求回传时长48小时压到8小时，年化省15万元

## ② 核心算法逻辑

现有 MAS 协议栈有两个标准：

## ③ 业务应用场景

业务背景：母婴品牌与代工工厂建立"智能协同"关系——品牌的采购 Agent 需要直接与工厂的产能规划 Agent 协作，实时获取产能数据、协商交期。但两方 Agent 系统分属不同公司，各有利益。
业务背景：品牌在 Amazon、TikTok、独立站三个平台各有独立 Agent 系统（不同供应商提供）。大促期间需要三个系统协同调配预算，但三方 Agent 来自不同厂商，无共同 API。
三轨验证 | 成本轨：月均成本3,200元（Agent服务器租赁2,000元/月+API调用费800元/月+人工监督4小时/月×100元/小时），ROI周期4个月 | 合规轨：符合《跨境电商B2C零售进口商品清单》和《母婴产品质量安全监督管理规定》，需获得海关备案编码和商检证书，风险等级中等 | 风险轨：库存预测偏差导致积压或缺货（概率15%），多Agent决策不一致引发超采（概率8%），跨境物流延误影响备货时间（概率12%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（190 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：5」并记录位置 `paper2skills-code/mas/cross_org_agent_protocol` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-Cross-Org-Agent-Protocol.md`），已与卡面节选核对，不依赖上述路径。

```python
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple
from enum import Enum
import time
import hashlib


class MPACLayer(Enum):
    SESSION = "session"
    INTENT = "intent"
    OPERATION = "operation"
    CONFLICT = "conflict"
    GOVERNANCE = "governance"


class MPACMessageType(Enum):
    HELLO = "HELLO"
    AUTH_REQUEST = "AUTH_REQUEST"
    AUTH_GRANT = "AUTH_GRANT"
    AUTH_DENY = "AUTH_DENY"
    DECLARE_INTENT = "DECLARE_INTENT"
    ACCEPT_INTENT = "ACCEPT_INTENT"
    COUNTER_INTENT = "COUNTER_INTENT"
    REJECT_INTENT = "REJECT_INTENT"
    REQUEST = "REQUEST"
    RESPONSE = "RESPONSE"
    DISPUTE = "DISPUTE"
    ARBITRATE = "ARBITRATE"
    RESOLVE = "RESOLVE"
    LOG = "LOG"
    TERMINATE = "TERMINATE"


@dataclass
class MPACMessage:
    msg_type: MPACMessageType
    sender_id: str
    receiver_id: str
    layer: MPACLayer
    payload: Dict[str, Any]
    session_id: str
    timestamp: float = field(default_factory=time.time)
    signature: str = ""

    def sign(self, private_key_sim: str) -> "MPACMessage":
        content = f"{self.msg_type.value}{self.sender_id}{self.payload}{self.timestamp}"
        self.signature = hashlib.md5((content + private_key_sim).encode()).hexdigest()[:16]
        return self

    def verify(self, public_key_sim: str) -> bool:
        content = f"{self.msg_type.value}{self.sender_id}{self.payload}{self.timestamp}"
        expected = hashlib.md5((content + public_key_sim).encode()).hexdigest()[:16]
        return self.signature == expected


class MPACSession:
    def __init__(self, session_id: str, principal_a: str, principal_b: str):
        self.session_id = session_id
        self.principal_a = principal_a
        self.principal_b = principal_b
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2602.15055 — Beyond Context Sharing: A Unified Agent Communication Protocol (ACP) for Secure, Federated, and Autonomous Agent-to-Agent (A2A) Orchestration

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：双方委托人身份与会话 ID、消息类型（提案、协商、确认等）、待交换字段（产能、交期等），以及用于消息签名验签的密钥体系。

**输出**：带签名与验签的跨组织消息会话与协商结论，以及可审计的会话记录；供双方 Agent 与业务负责人确认后执行。

## 执行步骤

1. 建立 MPAC 会话并声明双方委托人
2. 按 MPAC 层级与消息类型封装消息
3. 对消息签名并在接收端验签
4. 按委托范围交换约定字段并协商出结论
5. 留存会话记录供审计

## 边界与不做

- 数据不满足：没有明确委托人与可验签密钥体系时不要启用跨组织协作。
- 何时不用：同一组织内部编排用「MAS Orchestrator」；需要严格共识与拜占庭容错用「MAS 共识机制」；只需内部多平台预算协同可先用中心化编排。
- 能力边界：协议只保证消息与委托契约，不解决商业利益冲突，也不执行下单或付款。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-Graph-Grounded-MAS-Protocol.html、Skill-Graph-Grounded-MAS-Protocol、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack
- **延伸**：Skill-Agent-Registry-Discovery.html、Skill-Agent-Registry-Discovery
- **可组合**：Skill-LDP-Identity-Aware-Protocol.html、Skill-LDP-Identity-Aware-Protocol、Skill-MAS-Dynamic-Trust.html、Skill-MAS-Dynamic-Trust、Skill-Cross-Org-Agent-Protocol

---

> 分类：经营管理/经营与组织/依赖协调　·　技术族：10-MAS　·　源卡：`Skill-Cross-Org-Agent-Protocol`