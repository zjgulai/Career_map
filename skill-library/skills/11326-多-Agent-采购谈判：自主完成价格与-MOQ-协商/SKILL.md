---
name: "p2s-agenticpay-procurement-negotiation"
title: "AgenticPay — LLM 多 Agent 采购谈判：自主完成价格与 MOQ 协商"
description: "触发词：采购谈判、多Agent议价、MOQ协商、BATNA、自动报价。何时不用：只算 MOQ 与账期的现金流联合成本用「MOQ与账期联动优化」，只做采购价格超支归因用「采购价格达成率KPI」。安全边界：Agent 只能按授权区间出价，不得越权承诺付款条件或签署合同，最终协议须人工确认。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-044"
l3_business: "采购比价"
l3_all: "采购比价"
l1_l2_l3: "业务运营/供应与履约/采购比价"
p2s_card_id: "Skill-AgenticPay-Procurement-Negotiation"
p2s_src_domain: "10-MAS"
quality_tier: "preview"
user_summary: "让买家 Agent 和供应商 Agent 自动来回议价，几轮内把价格和起订量谈拢，并留下可审计的谈判记录。"
user_try: "试试：我的 BATNA 是替代供应商 118 元一箱、MOQ 600 箱，供应商开价 130 元、MOQ 1000 箱，帮我跑一轮议价并给出谈判记录。"
whenToUse: "本卡属采购比价中的议价执行环节：需要就单价与起订量做多轮谈判、且已有备选供应商报价作为筹码时用；只做 MOQ 与账期的现金流权衡、不与供应商对话的，用 MOQ 与账期联动优化类技能。"
workflow: "设定买家 BATNA、目标单价与目标 MOQ → 配置谈判参数（最大轮次、让步幅度与递减比例） → 买家与供应商 Agent 按轮生成报价与论据 → 达成协议或输出最大差距条款交人工跟进"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AgenticPay — LLM 多 Agent 采购谈判：自主完成价格与 MOQ 协商

## ① 解决的问题

业务问题：母婴品牌向供应商采购配方奶粉，供应商初始 MOQ=1000 箱（资金占用约 50 万），品牌方目标 MOQ≤500 箱（降低首单风险）

## ② 核心算法逻辑

AgenticPay 将买卖双方谈判建模为三方博弈：Buyer Agent（代理买家利益）+ Seller Agent（代理卖家利益）+ Mediator Agent（协调双方找到 ZOPA）。LLM 驱动每个 Agent 根据各自的 BATNA（最佳替代方案）和策略参数自主生成报价、评估还价、决定让步幅度。

## ③ 业务应用场景

业务问题：母婴品牌向供应商采购配方奶粉，供应商初始 MOQ=1000 箱（资金占用约 50 万），品牌方目标 MOQ≤500 箱（降低首单风险）。价格谈判同步进行（目标单价≤¥110，供应商开价¥130）。
数据要求： - 买家 BATNA：替代供应商 B 的报价（¥118/箱，MOQ=600 箱） - 卖家成本底线：生产成本 ¥95/箱，目标毛利率 ≥ 15%（底线价格 ¥109.25） - 谈判参数：max_rounds=5，初始让步 10%，每轮递减 30%
预期产出： - 3-5 轮内达成协议：价格 ¥108-¥115，MOQ 500-700 箱 - 谈判记录（每轮报价 + 论据），可用于内部审计 - 若协议失败，输出最大差距条款供人工跟进

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
采购成本降低 5-15%（LLM Agent 不受情绪影响，坚守 BATNA，不轻易让步）
谈判周期从 2 周缩短至 2 小时（无需等待邮件回复，Agent 实时执行）
采购人员从谈判执行者转为谈判策略制定者（节省约 4 人·天/次）
以年采购 500 万元计，降低 5% = 节省 25 万元/年
实施难度：⭐⭐☆☆☆

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（317 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/mas/agenticpay_procurement_negotiation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-AgenticPay-Procurement-Negotiation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
AgenticPay — LLM 多 Agent 采购谈判框架
arXiv:2602.06008 | Python 3.14+ | 仅标准库
"""
from __future__ import annotations

import math
import random
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class NegotiationOffer:
    """单轮谈判报价"""
    price: float
    moq: int
    delivery_days: int
    payment_terms: int     # NET days
    round_num: int
    party: str             # "buyer" or "seller"
    rationale: str = ""


@dataclass
class BATNA:
    """最佳替代方案（谈判底线）"""
    walk_away_price: float
    alternative_supplier: str
    min_moq: int = 0
    max_moq: int = 999999


@dataclass
class NegotiationResult:
    """谈判结果"""
    success: bool
    final_offer: Optional[NegotiationOffer]
    total_rounds: int
    history: list[NegotiationOffer] = field(default_factory=list)
    failure_reason: str = ""


class BuyerAgent:
    """Buyer Agent：保守启动 → 逐步让步，保守 BATNA 策略"""

    def __init__(self, batna: BATNA, initial_offer_factor: float = 0.75,
                 concession_decay: float = 0.3):
        self.batna = batna
        self.initial_offer_factor = initial_offer_factor
        self.concession_decay = concession_decay
        self._last_offer: Optional[NegotiationOffer] = None

    def generate_offer(self, round_num: int, product: str) -> NegotiationOffer:
        """生成买家报价：初始保守，随轮次递增（但不超 BATNA）"""
        if round_num == 1:
            price = self.batna.walk_away_price * self.initial_offer_factor
        else:
            last_price = self._last_offer.price if self._last_offer else (
                self.batna.walk_away_price * self.initial_offer_factor
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2602.06008 — AgenticPay: A Multi-Agent LLM Negotiation System for Buyer-Seller Transactions

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：买家 BATNA（替代供应商报价与 MOQ）、自身目标单价与目标 MOQ、供应商开价与成本底线推断、谈判参数（最大轮次、初始让步幅度、每轮递减比例）。

**输出**：多轮内收敛的成交价格与 MOQ 区间、逐轮报价与论据的谈判记录（供内部审计）、协议失败时的最大差距条款，输出给采购负责人与谈判策略制定者。

## 执行步骤

1. 设定买家 BATNA、目标单价与目标 MOQ。
2. 配置谈判参数（最大轮次、初始让步幅度、每轮递减比例）。
3. 由买家与供应商 Agent 逐轮生成报价与论据，买家报价不超过 BATNA。
4. 在轮次上限内收敛出价格与 MOQ 区间并留存谈判记录。
5. 未达成时输出最大差距条款，交人工跟进。

## 边界与不做

- 何时不用：没有备选供应商报价（BATNA）或供应商成本底线不明时，议价缺乏约束，不适用本技能。
- 能力边界：谈判结果不承诺对方接受，只产出成交区间与论据；最终合同与付款条件须人工确认，Agent 不得自行承诺条件。

## 技能关联

- **前置**：Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-Dynamic-Lot-Sizing-MOQ.html、Skill-Dynamic-Lot-Sizing-MOQ、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator、Skill-Multi-Agent-Debate.html、Skill-Multi-Agent-Debate、Skill-Multi-SKU-Procurement-Budget-Allocation.html、Skill-Multi-SKU-Procurement-Budget-Allocation、Skill-Supplier-Capacity-Planning.html、Skill-Supplier-Capacity-Planning
- **延伸**：Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-Multi-Agent-Debate.html、Skill-Multi-Agent-Debate、Skill-Multi-SKU-Procurement-Budget-Allocation.html、Skill-Multi-SKU-Procurement-Budget-Allocation
- **可组合**：Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-Multi-SKU-Procurement-Budget-Allocation.html、Skill-Multi-SKU-Procurement-Budget-Allocation、Skill-AgenticPay-Procurement-Negotiation

---

> 分类：业务运营/供应与履约/采购比价　·　技术族：10-MAS　·　源卡：`Skill-AgenticPay-Procurement-Negotiation`