---
name: "p2s-cultural-adaptation-agent"
title: "Cultural Adaptation Agent — 跨文化适应：母婴跨境的本地化 AI 策略"
description: "触发词：文化适配Agent、叙事框架重写、目标市场偏好、客服话术适配、认证优先展示、跨市场差评。何时不用：要做文化禁忌与监管风险词的硬性扫描替换用「文化感知内容本地化」；要做文化距离量化后批量生成文案用「跨文化内容自动适配」；要做跨语言关键词匹配用「跨文化营销适配」。安全边界：适配结果不得以文化刻板印象为唯一依据，日德等市场广告措辞须先经合规审查。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-083"
l3_business: "本地化"
l3_all: "本地化 / 市场语境审查"
l1_l2_l3: "业务运营/渠道经营/本地化"
p2s_card_id: "Skill-Cultural-Adaptation-Agent"
p2s_src_domain: "16-智能体工程"
quality_tier: "preview"
user_summary: "同一款产品按目标市场的文化偏好换一套叙事框架和客服口吻，减少因说错话导致的跨市场差评。"
user_try: "试试：把这款婴儿奶粉的产品信息分别适配到美国和德国，给出各自的 headline 框架与认证展示顺序。"
whenToUse: "本卡属「本地化」并覆盖「市场语境审查」，做叙事框架与客服话术的市场级适配。要做文化禁忌词与监管敏感词的扫描替换用「文化感知内容本地化（Skill-Cross-Market-Content-Localization）」；要用 Hofstede 文化距离批量生成多市场文案用「跨文化内容自动适配（Skill-Cross-Cultural-Content-Adaptation）」；要做跨语言关键词语义匹配用「跨文化营销适配（Skill-Cross-Cultural-Marketing-Adaptation）」；要给 Listing 质量打分用「Listing 质量评分（Skill-Listing-Quality-Scoring）」。"
workflow: "输入产品信息（含认证清单）与目标市场代码 → Agent 读取该市场文化特征并选择叙事框架（美国=科学权威+个人选择，德国=有机认证+长期健康） → 按框架重排卖点与认证展示顺序，并调整价格呈现方式（如营养价值比 $/oz） → 客服场景按检测到的市场与意图适配回复口吻 → 所有适配策略通过 A/B 测试验证后才上线"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Cultural Adaptation Agent — 跨文化适应：母婴跨境的本地化 AI 策略

## ① 解决的问题

同款婴儿奶粉文案在美国强调"便利快速"，在日本却因缺乏安全认证描述而遭遇差评——文化适配 Agent 自动识别目标市场偏好差异并重写叙事框架，跨市场差评率降低 30%

## ② 核心算法逻辑

论文：CultureLLM: Incorporating Cultural Differences into Large Language Models via Prompt Engineering | 年份：2023

## ③ 业务应用场景

| 市场 | 文化特征 | Agent 选择叙事框架 | 示例文案 | |------|---------|-----------------|---------| | 🇺🇸 美国 | IDV=91, UAI=46 | 科学权威 + 个人选择 | "AAP-aligned formula. Parents who want the best choose Stage 2." | | 🇩🇪 德国 | IDV=67, UAI=65, LTO=83 | 有机认证 + 长期健康 | "EU Organic Certified. Investing in your baby's health for t
Agent 执行：`CulturalAdaptationAgent.adapt_content(product_info, market="US")` → 自动选择"科学权威"框架，优先展示 AAP/FDA 认证，价格展示以营养价值比（$/oz）而非总价呈现。
背景：同一款产品收到退款申请，来自美国和日本客户的表达方式截然不同。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

⚠️ 文化刻板印象风险：Hofstede 维度是统计均值，个体差异显著；需结合行为数据持续校准
⚠️ 代际差异：Z 世代的消费价值观与传统 Hofstede 分数有偏差
⚠️ 监管合规：日本、德国的广告措辞有严格法规要求，适配前需经合规审查
✅ 验证驱动：所有适配策略必须通过 A/B 测试验证，不能仅靠文化假设上线

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（19 行）。**下面 19 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **19 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，19 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/llm_agent_engineering/cultural_adaptation_agent` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-Cultural-Adaptation-Agent.md`），已与卡面节选核对，不依赖上述路径。

```python
from cultural_adaptation import CulturalAdaptationAgent

agent = CulturalAdaptationAgent()

# 产品内容适配
adapted = agent.adapt_content(
    product_info={"name": "Infant Formula Stage 2", "certifications": ["AAP", "EU Organic", "消費者庁"]},
    market="DE"
)
print(adapted.headline)  # → "EU Bio-Zertifiziert..."

# 客服消息适配
response = agent.adapt_response(
    customer_message="I want a refund...",
    detected_market="US",
    intent="refund_request"
)
print(response.tone)  # → "direct"
print("[✓] Cultural Adaptation Agent 测试通过")
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2305.12345，但该号在 arXiv 上是《Overspinning a rotating black hole in semiclassical gravity with type-A trace anomaly》，与本卡主题无关。
⚠️ 该号被 19 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《CultureLLM: Incorporating Cultural Differences into Large Language Models via Prompt Engineering》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：输入为产品信息（名称与认证清单，如 AAP、EU Organic、消費者庁）与目标市场代码；客服场景需客户消息原文、检测到的市场与意图（如 refund_request）。Agent 以目标市场文化特征参数驱动叙事框架选择，调用形式为 CulturalAdaptationAgent.adapt_content(product_info, market) 与 adapt_response(customer_message, detected_market, intent)。

**输出**：产出适配后的文案对象（adapt_content 返回 headline 等字段，按市场叙事框架重排卖点与认证展示，价格可改为营养价值比呈现）与客服回复建议（adapt_response 返回 tone，如对美国客户为 direct）；原案例口径为跨市场差评率降低 30%。交付 Listing 本地化与客服话术使用。

## 执行步骤

1. 整理产品信息与认证清单，确定目标市场代码
2. 由 CulturalAdaptationAgent 按市场文化特征选择叙事框架
3. 生成适配文案并输出 headline 等字段，重排认证与卖点顺序
4. 客服场景调用 adapt_response，按市场与意图给出回复口吻
5. 用 A/B 测试校验适配效果，通过验证的策略才上线

## 边界与不做

- 数据不满足：缺少产品认证清单或目标市场信息、或未做 A/B 验证时不要直接上线，需先用行为数据校准文化假设。
- 何时不用：要做文化禁忌词与监管敏感词的硬性扫描替换用「文化感知内容本地化」；要做文化距离量化后批量生成多市场文案用「跨文化内容自动适配」；要做跨语言关键词匹配用「跨文化营销适配」。
- 能力边界：只做叙事框架与话术的适配建议，不替代本地合规审查，也不保证差评率下降幅度；Hofstede 维度是统计均值，存在个体与代际偏差。
- 安全边界：日本、德国等地广告措辞有严格法规要求，适配文案上线前必须经合规审查，禁止仅凭文化刻板印象决策。

## 技能关联

- **前置**：Skill-AI-Brand-Storytelling.html、Skill-AI-Brand-Storytelling、Skill-LACA-CrossLingual-ABSA.html、Skill-LACA-CrossLingual-ABSA
- **延伸**：Skill-AI-Consumer-Wellbeing-Ethics.html、Skill-AI-Consumer-Wellbeing-Ethics、Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework
- **可组合**：Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-Shopping-Companion-Agent.html、Skill-Shopping-Companion-Agent、Skill-Cultural-Adaptation-Agent

---

> 分类：业务运营/渠道经营/本地化　·　技术族：16-智能体工程　·　源卡：`Skill-Cultural-Adaptation-Agent`