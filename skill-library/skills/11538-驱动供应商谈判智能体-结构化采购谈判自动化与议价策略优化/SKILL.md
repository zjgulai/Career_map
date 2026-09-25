---
name: "p2s-supplier-negotiation-llm-agent"
title: "LLM驱动供应商谈判智能体 — 结构化采购谈判自动化与议价策略优化"
description: "触发词：供应商谈判、BATNA、锚定报价、谈判话术、让步信号。何时不用：需要买卖双方 Agent 自主来回议价并留存审计记录用「采购谈判多Agent」，只算 MOQ 与账期联合成本用「MOQ与账期联动优化」。安全边界：谈判建议与话术须标注仅供参考并经人工审核后发出，合同条款仍须法务预审。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-044"
l3_business: "采购比价"
l3_all: "采购比价"
l1_l2_l3: "业务运营/供应与履约/采购比价"
p2s_card_id: "Skill-Supplier-Negotiation-LLM-Agent"
p2s_src_domain: "16-智能体工程"
quality_tier: "preview"
user_summary: "把原材料行情和历史成交价变成谈判筹码，自动算出保留价、首轮锚点并生成谈判话术。"
user_try: "试试：供应商电机组件报价 45 元一个，给我做 BATNA 分析、保留价和首轮锚定报价，并生成谈判话术。"
whenToUse: "本卡属采购比价中的策略准备侧：需要为一次具体谈判算 BATNA、保留价、锚点并准备话术时用；让买卖双方 Agent 自动来回议价，用采购谈判多 Agent 类技能。"
workflow: "汇聚历史采购记录、竞品供应商报价与原材料价格指数 → 做 BATNA 分析并设定谈判保留价 → 计算锚定首轮报价与随附交换条件 → 生成谈判脚本并做让步信号检测"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLM驱动供应商谈判智能体 — 结构化采购谈判自动化与议价策略优化

## ① 解决的问题

采购谈判凭经验价格几乎不降——BATNA分析+锚定策略将采购成本降低5-9%，年采购额¥500万的卖家年化节省¥25-40万

## ② 核心算法逻辑

反直觉洞察：采购谈判被认为是"强关系、弱算法"的领域——许多卖家认为谈判靠人脉和经验。但研究发现，在价格谈判中，结构化的BATNA（最佳替代方案）分析和锚定策略比"关系好坏"贡献了更多的价格差异（平均差距815%）。而LLM的优势不是"替代谈判"，而是实时战略顾问：分析历史谈判数据、生成最优锚定价格、准备竞品报价反驳脚本、识别供应商话语中的让步信号。

## ③ 业务应用场景

- 业务问题：某卖家向固定供应商采购电机组件，单价¥45/个，年采购量10万件，年采购额¥450万。凭经验谈了3年，价格几乎没降。竞争对手报价¥38-42/件，但换供应商有质量风险 - 数据要求：历史采购记录（价格/批量/付款条件）、3家竞品供应商报价、原材料价格指数（铜/磁铁） - 算法应用： 1. LLM分析原材料价格指数：铜价近6个月下降8% → "成本降低论据"自动生成 2. BATNA分析：最佳替代方案¥40/件（B级供应商报价）→ 谈判保留价设为¥42 3. 锚定策略：首轮报价¥36/件（目标价¥40的90%），附带"3年框架协议+预付30%"作为交换条件 4. 谈判脚本：LLM生
- 业务问题：包装盒、说明书、贴纸每年10+次采购，每次都要重新谈价，耗时多且一致性差 - 算法应用：建立"采购谈判知识库"（历史成交价+市场行情+谈判话术），LLM根据当前询价自动生成谈判初稿，人工3分钟审核后发出，响应速度从2天缩短至2小时 - 预期产出：采购人员每年节省160小时谈判准备时间，平均采购成本降低5-7%
**三轨验证** | 成本轨：LLM API调用成本月均1200元（基于日均50次供应商谈判，单次0.8元），人工审核8小时/月，系统维护4小时/月，总TCO月均1800元，较传统人工谈判（月均12000元）降低85% | 合规轨：符合《电子商务法》第三方平台责任规范，供应商合同自动审查模块需通过法务预审，AI生成的谈判建议需标注"仅供参考"免责声明，满足母婴产品供应链合规要求 | 风险轨：模型幻觉导致报价偏离市场价格（概率15%），需设置价格波动预警阈值；供应商关系损伤风险（概率8%），因AI谈判风格过于强硬；数据泄露风险（概率3%），涉及供应商商业机密，需加密存储和访问控制

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：年采购额¥500万的卖家，通过系统化谈判降低5-8%采购成本，年节省¥25-40万；系统建设成本¥5万，ROI≈500-800%
实施难度：⭐⭐⭐☆☆（核心逻辑（BATNA/锚定/状态机）工程难度低；生产环境接入LLM API并做安全护栏是主要工作）
优先级：⭐⭐⭐⭐☆（采购是可控成本最大来源之一，任何规模都值得优化）
适用规模：年采购额>¥100万的卖家均可受益
数据依赖：历史采购记录、至少3家竞品供应商报价（建立BATNA）、原材料价格指数（公开数据）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（325 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/llm_agent_engineering/supplier_negotiation_llm_agent` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-Supplier-Negotiation-LLM-Agent.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
LLM驱动供应商谈判智能体
功能：BATNA分析 + 锚定策略 + 谈判状态机 + 让步信号检测
（生产环境接入真实LLM API，本版本用规则引擎模拟LLM推理）
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from enum import Enum
import re
import warnings
warnings.filterwarnings('ignore')


class NegotiationState(Enum):
    """谈判状态机"""
    INITIAL_CONTACT = "初始接触"
    ANCHOR_PHASE = "锚定报价"
    COUNTER_OFFER = "反报价"
    CONCESSION_EXPLORE = "让步探索"
    PACKAGE_DEAL = "打包条件"
    AGREEMENT = "达成协议"
    DEADLOCK = "谈判僵局"


@dataclass
class NegotiationContext:
    """谈判上下文"""
    product_name: str
    annual_volume: int              # 年采购量
    current_price: float            # 当前成交价（CNY）
    target_price: float             # 目标价格
    reservation_price: float        # 保留价（最高可接受）
    
    # BATNA信息
    batna_price: float              # 最佳替代方案价格
    batna_supplier: str             # 替代供应商名称
    
    # 附加条件筹码
    payment_terms_current: int      # 当前付款期（天）
    order_commitment_months: int    # 框架协议月数（0=无）
    
    # 市场数据
    material_cost_change_pct: float # 原材料价格变化（正=涨价）
    
    # 状态追踪
    current_state: NegotiationState = NegotiationState.INITIAL_CONTACT
    rounds: int = 0
    history: List[Dict] = field(default_factory=list)
    
    @property
    def zopa_width(self) -> float:
        """谈判区间宽度"""
        return self.reservation_price - self.batna_price
    
    @property
    def leverage_score(self) -> float:
        """谈判筹码评分 0-10"""
        score = 0
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2405.14644，但该号在 arXiv 上是《Adoption of a token-based authentication model for the CMS Submission Infrastructure》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：历史采购记录（价格、批量、付款条件）、至少 3 家竞品供应商报价（用于建立 BATNA）、原材料价格指数（如铜、磁铁）；按物料×供应商粒度。

**输出**：BATNA 与保留价、首轮锚定报价及交换条件、谈判区间宽度与筹码评分、可复用的谈判脚本与话术初稿，输出给采购谈判人员审核后使用。

## 执行步骤

1. 汇聚历史采购记录、竞品供应商报价与原材料价格指数。
2. 做 BATNA 分析并设定谈判保留价。
3. 计算锚定首轮报价与随附交换条件。
4. 生成谈判脚本与话术初稿，识别对方让步信号。
5. 人工审核话术后发出，并跟踪谈判结果。

## 边界与不做

- 何时不用：不足 3 家竞品报价、无法建立 BATNA 时谈判筹码无从量化，不适用本技能。
- 能力边界：谈判建议仅供参考，须标注免责并经人工审核后才能发出；模型幻觉可能导致报价偏离市场价格，供应商关系与合同条款仍需人工把关。

## 技能关联

- **前置**：Skill-Agent-Knowledge-Distillation-SOP.html、Skill-Agent-Knowledge-Distillation-SOP、Skill-Agent-Observability-Tracing.html、Skill-Agent-Observability-Tracing、Skill-Agent-Safety-Guardrails.html、Skill-Agent-Safety-Guardrails、Skill-Competitive-Price-Intelligence、Skill-LLM-Negotiation-Conversion-Agent.html、Skill-LLM-Negotiation-Conversion-Agent、Skill-Supplier-Lead-Time-Buffer.html、Skill-Supplier-Lead-Time-Buffer、Skill-Supply-Chain-Due-Diligence.html、Skill-Supply-Chain-Due-Diligence、Skill-Tariff-FX-FBA-Cost-Dynamics.html、Skill-Tariff-FX-FBA-Cost-Dynamics
- **延伸**：Skill-Agent-Knowledge-Distillation-SOP.html、Skill-Agent-Knowledge-Distillation-SOP、Skill-Agent-Observability-Tracing.html、Skill-Agent-Observability-Tracing、Skill-Competitive-Price-Intelligence、Skill-LLM-Negotiation-Conversion-Agent.html、Skill-LLM-Negotiation-Conversion-Agent、Skill-Supplier-Lead-Time-Buffer.html、Skill-Supplier-Lead-Time-Buffer、Skill-Tariff-FX-FBA-Cost-Dynamics.html、Skill-Tariff-FX-FBA-Cost-Dynamics
- **可组合**：Skill-Agent-Knowledge-Distillation-SOP.html、Skill-Agent-Knowledge-Distillation-SOP、Skill-Competitive-Price-Intelligence、Skill-LLM-Negotiation-Conversion-Agent.html、Skill-LLM-Negotiation-Conversion-Agent、Skill-Tariff-FX-FBA-Cost-Dynamics.html、Skill-Tariff-FX-FBA-Cost-Dynamics、Skill-Supplier-Negotiation-LLM-Agent

---

> 分类：业务运营/供应与履约/采购比价　·　技术族：16-智能体工程　·　源卡：`Skill-Supplier-Negotiation-LLM-Agent`