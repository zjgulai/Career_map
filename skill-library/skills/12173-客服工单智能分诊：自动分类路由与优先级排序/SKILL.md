---
name: "p2s-cs-ticket-intelligence"
title: "CS Ticket Intelligence — 客服工单智能分诊：自动分类路由与优先级排序"
description: "触发词：工单分诊、消息分类、紧急度排序、差评预警、回复模板推荐。何时不用：跨领域多 Agent 路由用「知识图谱引导的 AgentRouter」；本技能做单工单的多维分类与优先级。安全边界：分级与预警仅用于内部处理优先级，买家消息不得用于对外标签化。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-110"
l3_business: "客诉分诊"
l3_all: "客诉分诊 / 需求识别"
l1_l2_l3: "业务运营/服务与体验/客诉分诊"
p2s_card_id: "Skill-CS-Ticket-Intelligence"
p2s_src_domain: "09-DataAgent-LLM"
quality_tier: "preview"
user_summary: "每天成百条买家消息一秒分好类型、紧急度和差评风险，把该马上跟进的挑出来并配好回复模板。"
user_try: "试试：把今天这 50 条买家消息按类型、紧急度和差评风险分好，标出需要立刻跟进的。"
whenToUse: "当客服消息需要多维分类、优先级排序与回复模板推荐时用；跨领域多 Agent 协同路由用「AgentRouter」。"
workflow: "接入 Amazon、独立站与邮件等多渠道买家消息 → 按规则库给工单打类型与紧急度标签 → 识别差评风险并单独推送预警 → 从模板库推荐对应回复草稿"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# CS Ticket Intelligence — 客服工单智能分诊：自动分类路由与优先级排序

## ① 解决的问题

每天50条买家消息手动分类处理需3-4小时且容易遗漏高危差评工单——AI工单分诊1秒完成多维分类（类型/紧急度/情感/差评风险），响应时间8h→2h客服效率提升3-5倍年化节省15-40万元

## ② 核心算法逻辑

人工处理 vs 智能分诊：

## ③ 业务应用场景

业务问题：独立站+Amazon 每天收到约 50 条买家消息，1名客服需要 3-4 小时处理。其中 5% 是差评预警（需要立即跟进），30% 是可用模板快速回复的标准问题，65% 是需要查单的订单追踪询问。AI 分诊让客服专注在高价值互动上。
数据要求： - 历史客服消息+处理结果（用于训练） - 回复模板库
预期产出： - 工单分类（类型+紧急度+情感） - 推荐回复模板 - 差评预警单独推送

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
客服效率提升 3-5x：节省人力 ¥3-8 万/年
P0/P1 响应时间 8h→2h：差评率降低 15-25%
差评预警更早介入：每次挽回节省 ¥2-5 万
年化综合 ROI：¥15-40 万
实施难度：⭐⭐☆☆☆（规则引擎版 1 周；需要 Amazon MWS/SP-API 消息接口；LLM 回复生成约 2-3 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（166 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 55 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/data_agent_llm/cs_ticket_intelligence` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/09-DataAgent-LLM/Skill-CS-Ticket-Intelligence.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
CS Ticket Intelligence
客服工单智能分诊：分类+优先级+情感+回复建议
"""
import re
from dataclasses import dataclass


@dataclass
class Ticket:
    ticket_id: str
    message: str
    channel: str = 'amazon'  # amazon/email/shopify
    buyer_history_orders: int = 0
    buyer_has_reviewed: bool = False


# 多维度分诊规则库
TICKET_RULES = {
    'return_refund': {
        'keywords': ['return', 'refund', 'exchange', 'money back', 'cancel',
                     '退', '退款', '退货', '换货', '取消'],
        'priority': 'P1',
        'action': '查询订单退货政策，准备退款处理',
        'template': 'I understand you would like to return/refund. I\'m checking your order now...',
    },
    'order_tracking': {
        'keywords': ['where', 'track', 'shipping', 'delivery', 'arrived', 'lost',
                     '在哪', '快递', '物流', '发货', '收到'],
        'priority': 'P2',
        'action': '查询物流单号，反馈最新状态',
        'template': 'I\'ve checked your order tracking. The latest status is...',
    },
    'product_defect': {
        'keywords': ['broken', 'defective', 'damaged', 'not work', 'stopped',
                     '坏', '损坏', '不工作', '故障', '破损'],
        'priority': 'P1',
        'action': '品控记录，安排换货或退款',
        'template': 'I sincerely apologize for the defective product. Let me arrange...',
    },
    'safety_urgent': {
        'keywords': ['injury', 'hurt', 'dangerous', 'doctor', 'hospital', 'lawyer', 'recall',
                     '受伤', '危险', '医院', '律师', '召回'],
        'priority': 'P0',
        'action': '立即升级到管理层，准备紧急响应',
        'template': '【紧急】安全事故响应协议启动',
    },
    'usage_question': {
        'keywords': ['how to', 'how do', 'instruction', 'manual', 'setup',
                     '怎么用', '如何', '说明', '操作'],
        'priority': 'P3',
        'action': '发送使用说明/FAQ链接',
        'template': 'Thank you for reaching out! Here\'s how to use/set up your product...',
    },
    'review_complaint': {
        'keywords': ['review', 'rating', 'star', 'feedback', 'complaint',
                     '差评', '评价', '投诉', '星级'],
        'priority': 'P1',
        'action': '差评挽救流程，优先跟进',
        'template': 'I value your feedback greatly. Please allow me to make this right...',
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2407.08923，但该号在 arXiv 上是《A Bistatic ISAC Framework for LEO Satellite Systems: A Rate-Splitting Approach》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：历史客服消息与处理结果（用于训练分类）、回复模板库、渠道字段（Amazon、邮件、独立站）；粒度为单条消息。

**输出**：每条工单的类型、紧急度、情感与差评风险标签、推荐回复模板与预警推送，供客服排班与响应使用。

## 执行步骤

1. 接入多渠道买家消息并归一字段
2. 按规则库给工单打类型与紧急度标签
3. 识别差评风险并单独推送预警
4. 从模板库推荐对应回复草稿
5. 把 P0 与 P1 工单优先派给在线客服

## 边界与不做

- 何时不用：没有回复模板库或历史处理数据时分类尚可但推荐质量下降，需先补数据
- 能力边界：只做分类、排序与草稿建议，不替客服发送回复，也不承担赔付决策

## 技能关联

- **前置**：Skill-Account-Health-Proactive-Monitor.html、Skill-Account-Health-Proactive-Monitor、Skill-LLM-Negotiation-Conversion-Agent.html、Skill-LLM-Negotiation-Conversion-Agent、Skill-NLP-Text-Classification.html、Skill-NLP-Text-Classification、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-VOC-Compliance-Signal-Mining.html、Skill-VOC-Compliance-Signal-Mining、Skill-VOC-Fraud-Review-Detection.html、Skill-VOC-Fraud-Review-Detection
- **延伸**：Skill-Account-Health-Proactive-Monitor.html、Skill-Account-Health-Proactive-Monitor、Skill-LLM-Negotiation-Conversion-Agent.html、Skill-LLM-Negotiation-Conversion-Agent、Skill-VOC-Compliance-Signal-Mining.html、Skill-VOC-Compliance-Signal-Mining、Skill-VOC-Fraud-Review-Detection.html、Skill-VOC-Fraud-Review-Detection
- **可组合**：Skill-Account-Health-Proactive-Monitor.html、Skill-Account-Health-Proactive-Monitor、Skill-VOC-Compliance-Signal-Mining.html、Skill-VOC-Compliance-Signal-Mining、Skill-CS-Ticket-Intelligence

---

> 分类：业务运营/服务与体验/客诉分诊　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-CS-Ticket-Intelligence`