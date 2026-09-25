---
name: "p2s-llm-negotiation-conversion-agent"
title: "LLM Negotiation Conversion Agent — LLM 谈判代理驱动的成交率优化"
description: "触发词：谈判代理、询价应对、支付意愿推断、分层让步、成交率。何时不用：要按购买意图概率给弃购用户分档触达用「购买意图预测」；要用效用函数解释选择行为用「MNL 购买选择模型」。安全边界：报价不得低于产品底价与最低折扣线，禁止虚构原价或虚假优惠；支付意愿推断结果不得暴露给对话对象，让步策略须可审计。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-070"
l3_business: "转化优化"
l3_all: "转化优化 / 价格敏感性"
l1_l2_l3: "业务运营/渠道经营/转化优化"
p2s_card_id: "Skill-LLM-Negotiation-Conversion-Agent"
p2s_src_domain: "16-智能体工程"
quality_tier: "preview"
user_summary: "客服别再统一回最低价：先判断买家是真比价还是随口问，再在利润底线之上分层让价。"
user_try: "试试：把这段 WhatsApp 询价对话接上谈判代理，推断买家支付意愿区间并给出不破底线的报价建议。"
whenToUse: "当询盘量大（卡页示例每天 50-200 条）、人工统一回复最低价导致成交率低、需要按买家类型分层让价时用本技能；要给弃购或浏览用户按意图分档触达用「购买意图预测」；要用效用函数解释选择行为用「MNL 购买选择模型」。"
workflow: "导入历史聊天记录与成交价格，标注成单与未成单 → 录入产品成本结构：底价、最低折扣线 → 按对话内容推断买家类型并更新支付意愿置信区间 → 在利润底线以上生成分层报价 → 复盘成交率与平均成交价并校准策略"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLM Negotiation Conversion Agent — LLM 谈判代理驱动的成交率优化

## ① 解决的问题

母婴品牌WhatsApp客服面对「能便宜吗」统一回复「已最低价」导致成交率仅12%——LLM谈判Agent推断买家隐藏支付意愿执行分层让步策略，成交率提升到22-28%，年化私域GMV增益50-150万元

## ② 核心算法逻辑

PrefBench 核心发现：LLM Agent 在谈判中"达成交易"（Deal Rate）高并不等于"高利润成交"——Agent 可能过度让步（给了买家不需要的折扣）或过早放弃（错过本来愿意多付的买家）。关键是推断买家的隐藏偏好（Hidden Preference）：支付意愿（WTP）上限和砍价特征（Bargaining Trait）。

## ③ 业务应用场景

业务问题：母婴品牌的 WhatsApp Business 客服每天收到 50-200 条询价，80% 是"能便宜吗？""能再优惠点？"类消息。人工客服统一回复"已经最低价"，成交率 12%。其实有 30-40% 的用户支付意愿比现价高 10-20%，客服只是不知道如何分层应对。
数据要求： - 历史聊天记录（询价→成交/未成交）及成交价格 - 用户画像：来源渠道、历史购买记录、地区 - 产品成本结构（底价/最低折扣线）
预期产出： - 自动化谈判 Agent：根据用户询问内容推断买家类型，执行对应策略 - 实时 WTP 置信区间：当前对话中买家支付意愿的概率分布 - 成交价格建议：在利润底线以上的最优报价

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
私域 WhatsApp 成交率从 12% → 22-28%：月增 GMV ¥20-60 万（取决于询盘量）
B2B 询盘转化率从 8% → 18%：月增大客户合同 ¥15-50 万
平均成交价格提升（减少不必要让步）：每笔订单多 $10-30，月增利润 ¥5-20 万
客服人效提升（Agent 处理 60% 标准询价）：节省人力成本 ¥3-8 万/月
年化综合 ROI：¥50-150 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（184 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/16-智能体工程/llm_negotiation_conversion_agent` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-LLM-Negotiation-Conversion-Agent.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
LLM Negotiation Conversion Agent
基于隐偏好推断的母婴成交率优化 Agent
"""
import numpy as np
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class BuyerBelief:
    """买家隐偏好信念分布"""
    wtp_low: float = 0.3      # 低WTP概率（接受底价）
    wtp_mid: float = 0.4      # 中WTP概率（接受折扣价）
    wtp_high: float = 0.3     # 高WTP概率（接受原价甚至溢价）
    price_sensitive: float = 0.5   # 价格敏感程度 0-1
    quality_focused: float = 0.5   # 品质关注程度 0-1
    urgency: float = 0.3           # 购买紧迫性 0-1
    rounds: int = 0


class NegotiationAgent:
    """LLM 驱动的谈判成交 Agent（规则驱动的简化实现）"""

    def __init__(self, product_name, list_price, cost_price, min_margin=0.15):
        self.product = product_name
        self.list_price = list_price
        self.cost = cost_price
        self.min_price = cost_price * (1 + min_margin)
        self.belief = BuyerBelief()
        self.conversation = []
        self.current_offer = list_price

    def update_belief(self, user_message: str):
        """根据用户消息更新隐偏好信念（贝叶斯更新简化版）"""
        msg = user_message.lower()
        # 价格敏感信号
        price_signals = ['cheap', 'cheaper', 'discount', 'cheaper', 'how much', 'too expensive',
                         '便宜', '打折', '优惠', '太贵', '能少点吗', 'best price', 'lowest']
        quality_signals = ['quality', 'certified', 'safe', 'review', 'certificate', 'fda', 'bpa',
                           '质量', '认证', '安全', '评价', '品质', 'warranty', '保修']
        urgency_signals = ['urgent', 'asap', 'today', 'need now', 'rush', 'quickly',
                           '急', '今天', '马上', '赶紧', '快点']

        for sig in price_signals:
            if sig in msg:
                self.belief.price_sensitive = min(0.95, self.belief.price_sensitive + 0.15)
                self.belief.wtp_low += 0.1
                self.belief.wtp_high -= 0.1
        for sig in quality_signals:
            if sig in msg:
                self.belief.quality_focused = min(0.95, self.belief.quality_focused + 0.15)
                self.belief.wtp_high += 0.1
                self.belief.wtp_low -= 0.05
        for sig in urgency_signals:
            if sig in msg:
                self.belief.urgency = min(0.95, self.belief.urgency + 0.2)

        # 归一化 WTP 分布
        total = self.belief.wtp_low + self.belief.wtp_mid + self.belief.wtp_high
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2605.22855 — PrefBench: Evaluating Zero-Shot LLM Agents in Hidden-Preference Personalized Pricing Negotiations

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：历史聊天记录（询价到成交或未成交）及成交价格、用户画像（来源渠道、历史购买、地区）、产品成本结构（底价与最低折扣线）；粒度为单次询价会话。

**输出**：买家类型判断、实时支付意愿置信区间与利润底线以上的报价建议；供私域客服与销售在对话中执行。

## 执行步骤

1. 导入历史询价与成交记录并标注成交结果
2. 录入产品成本结构与最低折扣线
3. 按对话内容推断买家类型并更新支付意愿分布
4. 在利润底线之上生成分层报价与话术
5. 复盘成交率与平均成交价并校准让步策略

## 边界与不做

- 数据不满足：拿不到产品成本与最低折扣线时不能生成报价建议，先由业务方定清底线。
- 何时不用：要给弃购用户按意图分档触达用「购买意图预测」；要用效用函数解释选择行为用「MNL 购买选择模型」。
- 能力边界：只做买家推断与报价建议，不代替客服对话本身，也不保证卡页口径的成交率提升。
- 安全边界：报价不得低于底价与最低折扣线，禁止虚构原价或虚假优惠；支付意愿推断结果不得对外暴露，让步策略须可审计。

## 技能关联

- **前置**：Skill-AgenticPay-Procurement-Negotiation.html、Skill-AgenticPay-Procurement-Negotiation、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-LLM-Negotiation-Conversion-Agent

---

> 分类：业务运营/渠道经营/转化优化　·　技术族：16-智能体工程　·　源卡：`Skill-LLM-Negotiation-Conversion-Agent`