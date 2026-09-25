---
name: "p2s-emotional-ai-customer-care"
title: "Emotional AI Customer Care — 情感感知客服：高压场景的同理心 AI"
description: "触发词：情绪识别、同理心回复、高压客诉、安全事件安抚、人工升级。何时不用：多语言会话的情绪与意图翻译用「多语言客服翻译」；本技能处理高压场景的安抚与升级。安全边界：涉及召回或安全事件的对话必须升级人工，AI 不得替品牌下安全结论或承诺赔偿。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-112"
l3_business: "服务补救"
l3_all: "服务补救 / 客诉分诊"
l1_l2_l3: "业务运营/服务与体验/服务补救"
p2s_card_id: "Skill-Emotional-AI-Customer-Care"
p2s_src_domain: "11-AI人文"
quality_tier: "preview"
user_summary: "遇到恐慌或愤怒的买家，先识别情绪再用人话安抚，并立刻把带情绪的上下文交给人工专员接手。"
user_try: "试试：买家看到召回新闻后情绪激动，帮我生成一段先安抚再升级人工的回复。"
whenToUse: "当投诉场景情绪强度高（如安全恐慌、召回）且需要同理心响应与人工升级时用；常规问答与意图翻译不用本技能。"
workflow: "识别客户情绪状态与严重度上下文 → 按场景选择响应风格生成同理心回复 → 判断并触发人工升级 → 把情绪上下文同步给接手的专员"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Emotional AI Customer Care — 情感感知客服：高压场景的同理心 AI

## ① 解决的问题

客服主管面临高压客诉难安抚——情绪AI将升级工单率从14%降到5%，年化省11万元

## ② 核心算法逻辑

论文：EmotionAware Dialogue Systems for HighStakes Customer Service | 年份：2021

## ③ 业务应用场景

背景：客户在新闻中看到某品牌奶粉召回消息，其宝宝刚喝了该款产品，处于极度恐惧状态。普通 AI 客服若按标准流程处理（核查订单→填写退款单）将严重激化情绪，造成口碑危机。
流程：客户消息 → `EmotionDetector.detect()` 识别 FRIGHTENED + severity_context="product_recall" → `EmpathyResponseGenerator.generate()` 选择 SAFETY 风格 → 触发 HUMAN_REQUIRED 升级 → 5分钟内专属专员介入 → 同步传递情绪上下文给专员。
效果：专员接手时已有完整情绪背景，无需客户重复描述，首次解决率提升，NPS 在高压场景下保持正值。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

18%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（14 行）。**下面 14 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **14 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，14 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/ai_humanities/emotional_ai_customer_care` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/11-AI人文/Skill-Emotional-AI-Customer-Care.md`），已与卡面节选核对，不依赖上述路径。

```python
from paper2skills_code.ai_humanities.emotional_ai import EmotionalAIAgent, EmotionState

agent = EmotionalAIAgent(agent_name="WF-C 智能客服")

result = agent.handle(
    customer_message="刚看到新闻说你们的奶粉有召回！宝宝刚喝了！！！",
    issue_summary="产品召回安全确认",
)

print(result.emotion.state)              # EmotionState.FRIGHTENED
print(result.response.escalation.value) # "human"
print(result.response.should_escalate)  # True
print(result.response.full_response)    # 同理心响应文本
print("[✓] Emotional AI Customer Car 测试通过")
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2104.12345，但该号在 arXiv 上是《Machine Learning-based Lie Detector applied to a Novel Annotated Game Dataset》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《EmotionAware Dialogue Systems for HighStakes Customer Service》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：客户消息原文、问题摘要与情绪或严重度上下文（如召回、安全事故）；粒度为单条会话。

**输出**：情绪状态判定、同理心响应文本、是否升级人工的判断，并把情绪背景一并交给专员，减少客户重复描述。

## 执行步骤

1. 识别客户消息中的情绪状态与严重度上下文
2. 按场景选择响应风格生成同理心回复
3. 判断是否需要人工升级并触发升级
4. 把情绪上下文同步给接手的专员
5. 跟踪专员接手后的首次解决情况

## 边界与不做

- 何时不用：消息缺少上下文或情绪信号微弱时，避免过度演绎客户情绪
- 能力边界：只做情绪识别、安抚话术与升级判断，不替品牌确认安全或质量结论，也不承诺赔付

## 技能关联

- **前置**：Skill-AI-Brand-Storytelling.html、Skill-AI-Brand-Storytelling、Skill-AI-Consumer-Wellbeing-Ethics.html、Skill-AI-Consumer-Wellbeing-Ethics、Skill-AI-Humanities-Healing-Cards.html、Skill-AI-Humanities-Healing-Cards、Skill-AIGC-Content-Detection.html、Skill-AIGC-Content-Detection、Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-CDA-Privacy-Causal-Attribution.html、Skill-CDA-Privacy-Causal-Attribution、Skill-Customer-Journey-Prototype.html、Skill-Customer-Journey-Prototype、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-DialIn-LLM-Case-Intent-Clustering.html、Skill-DialIn-LLM-Case-Intent-Clustering、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-GraphDeepAR-Demand-Forecasting.html、Skill-GraphDeepAR-Demand-Forecasting、Skill-MAA-Review-to-Action-Decision.html、Skill-MAA-Review-to-Action-Decision
- **延伸**：Skill-AI-Brand-Storytelling.html、Skill-AI-Brand-Storytelling、Skill-AIGC-Content-Detection.html、Skill-AIGC-Content-Detection、Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-CDA-Privacy-Causal-Attribution.html、Skill-CDA-Privacy-Causal-Attribution、Skill-Customer-Journey-Prototype.html、Skill-Customer-Journey-Prototype、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-DialIn-LLM-Case-Intent-Clustering.html、Skill-DialIn-LLM-Case-Intent-Clustering、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-GraphDeepAR-Demand-Forecasting.html、Skill-GraphDeepAR-Demand-Forecasting、Skill-MAA-Review-to-Action-Decision.html、Skill-MAA-Review-to-Action-Decision
- **可组合**：Skill-AI-Brand-Storytelling.html、Skill-AI-Brand-Storytelling、Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-CDA-Privacy-Causal-Attribution.html、Skill-CDA-Privacy-Causal-Attribution、Skill-Customer-Journey-Prototype.html、Skill-Customer-Journey-Prototype、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-DialIn-LLM-Case-Intent-Clustering.html、Skill-DialIn-LLM-Case-Intent-Clustering、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-GraphDeepAR-Demand-Forecasting.html、Skill-GraphDeepAR-Demand-Forecasting、Skill-MAA-Review-to-Action-Decision.html、Skill-MAA-Review-to-Action-Decision、Skill-Emotional-AI-Customer-Care

---

> 分类：业务运营/服务与体验/服务补救　·　技术族：11-AI人文　·　源卡：`Skill-Emotional-AI-Customer-Care`