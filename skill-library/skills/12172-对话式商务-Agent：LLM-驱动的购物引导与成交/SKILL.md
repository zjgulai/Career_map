---
name: "p2s-conversational-commerce-agent"
title: "Conversational Commerce Agent — 对话式商务 Agent：LLM 驱动的购物引导与成交"
description: "触发词：对话导购、需求澄清、购物引导、站内问答、转化漏斗对比。何时不用：跨会话记住老客偏好用「长期偏好记忆」；本技能处理单次会话内的需求澄清与推荐。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-108"
l3_business: "选购指导"
l3_all: "选购指导 / 转化优化"
l1_l2_l3: "业务运营/服务与体验/选购指导"
p2s_card_id: "Skill-Conversational-Commerce-Agent"
p2s_src_domain: "16-智能体工程"
quality_tier: "preview"
user_summary: "让访客用几轮对话说清需求，再推最合适的那一款，把只看不买的人留在页面里。"
user_try: "试试：给我们的吸奶器做个对话导购，先问清使用场景和预算再推荐型号。"
whenToUse: "当访客选择困难、需要用提问澄清需求再推荐时用；需要跨会话记住老客户偏好用「长期偏好记忆」。"
workflow: "从开场逐步澄清使用场景与关键需求 → 收集使用频率、预算与使用场景 → 检索商品库并给出推荐与理由 → 回答追问并收尾促成转化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Conversational Commerce Agent — 对话式商务 Agent：LLM 驱动的购物引导与成交

## ① 解决的问题

独立站用户bounce rate65%主因是不知道选哪款看了就走——LLM对话式导购3-5轮澄清需求后精准推荐，对话路径转化率15-25%远高于搜索路径3-5%年化增益25-80万元

## ② 核心算法逻辑

被动搜索 vs 主动对话：

## ③ 业务应用场景

业务问题：独立站访客 bounce rate 65%（进来就走），主因是用户不知道哪款适合自己。加入对话式助手后，用户通过3-5轮对话明确需求，直接推荐最匹配的产品，显著降低选择困难。
数据要求： - 商品数据库（特征/规格/适用人群） - 常见用户问题 FAQ（训练 Agent 的知识库） - 历史对话数据（用于微调）
预期产出： - 对话式导购 Agent（可嵌入独立站） - 转化漏斗对比：对话路径 vs 搜索路径 - 对话质量指标：平均轮数/任务完成率/转化率

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
对话路径转化率 15-25%（vs 搜索 3-5%）：月增收 ¥5-20 万
bounce rate 降低 20-30%：更多访客完成购买
客服工作量减少（常见问题 Agent 自动回答）
年化综合 ROI：¥25-80 万
实施难度：⭐⭐⭐☆☆（规则状态机版 2 周；LLM API 版本约 4-6 周；需要产品知识库建立；约 3-6 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（218 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/llm_agent_engineering/conversational_commerce_agent` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-Conversational-Commerce-Agent.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Conversational Commerce Agent
对话式商务 Agent：LLM 驱动的购物引导
（规则状态机版，生产替换为 LLM API）
"""
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class ConversationState(Enum):
    START = 'start'
    CLARIFY_USE_CASE = 'clarify_use_case'
    CLARIFY_REQUIREMENTS = 'clarify_requirements'
    RECOMMEND = 'recommend'
    HANDLE_QUESTION = 'handle_question'
    CLOSING = 'closing'


@dataclass
class UserRequirements:
    """用户需求（对话中逐步收集）"""
    use_case: Optional[str] = None      # 'self_use' / 'gift'
    frequency: Optional[str] = None    # 'occasional' / 'frequent'
    key_need: Optional[str] = None     # 'quiet' / 'portable' / 'hospital_grade'
    budget: Optional[str] = None       # 'low' / 'mid' / 'high'
    scene: Optional[str] = None        # 'home' / 'office' / 'travel'


@dataclass
class ConversationContext:
    """对话上下文"""
    state: ConversationState = ConversationState.START
    requirements: UserRequirements = field(default_factory=UserRequirements)
    turns: int = 0
    recommended_products: list = field(default_factory=list)


# 商品数据库（简化）
PRODUCT_DATABASE = {
    'PUMP-001': {
        'name': 'UltraQuiet Double Pump',
        'price': 149.99,
        'noise_db': 42,
        'portable': True,
        'hospital_grade': True,
        'use_case': ['frequent', 'office', 'travel'],
        'pitch': "医院级静音吸奶器，44dB静音设计，USB充电可带上班",
    },
    'PUMP-002': {
        'name': 'Portable Wearable Pump',
        'price': 89.99,
        'noise_db': 45,
        'portable': True,
        'hospital_grade': False,
        'use_case': ['occasional', 'travel'],
        'pitch': "无线穿戴式，无需手持，完全解放双手",
    },
    'PUMP-003': {
        'name': 'Hospital Grade Pump Pro',
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2407.09234，但该号在 arXiv 上是《SU(3) symmetry analysis in charmed baryon two body decays with penguin diagram contribution》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：商品数据库（特征、规格、适用人群）、常见问题 FAQ、历史对话数据（用于微调）；对话中逐步收集用户需求字段。

**输出**：对话式导购 Agent、推荐结果与推荐理由、对话质量指标（平均轮数、任务完成率）与对话路径和搜索路径的转化对比。

## 执行步骤

1. 用提问逐步收集使用场景、频率与预算等需求
2. 把需求映射到商品库并检索候选
3. 输出推荐商品与推荐理由
4. 在追问状态下回答产品问题并补充对比
5. 记录对话轮数与转化，与搜索路径做漏斗对比

## 边界与不做

- 何时不用：商品库字段残缺时，推荐会失准
- 能力边界：只做导购对话与推荐，不承诺库存、价格或交期，也不替代下单与支付环节

## 技能关联

- **前置**：Skill-Explainable-Recommendation.html、Skill-Explainable-Recommendation、Skill-LLM-Negotiation-Conversion-Agent.html、Skill-LLM-Negotiation-Conversion-Agent、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-Personalized-Search-Ranking.html、Skill-Personalized-Search-Ranking、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-Explainable-Recommendation.html、Skill-Explainable-Recommendation、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-Personalized-Search-Ranking.html、Skill-Personalized-Search-Ranking、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Conversational-Commerce-Agent

---

> 分类：业务运营/服务与体验/选购指导　·　技术族：16-智能体工程　·　源卡：`Skill-Conversational-Commerce-Agent`