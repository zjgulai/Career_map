---
name: "p2s-ai-consumer-wellbeing-ethics"
title: "AI Consumer Wellbeing Ethics — 消费者福祉与 AI 伦理：母婴场景"
description: "触发词：消费者福祉、暗模式检测、情绪化定向、AI身份披露、广告合规。何时不用：面向儿童的数据合规审查时用「Privacy COPPA Compliance」；算法可解释性监管报告用「XAI Regulatory Compliance」。安全边界：不得利用父母焦虑做情绪劫持或伪造专家背书；AI 生成内容与 KOL 合作须显著标注，违规风险须交法务复核。"
l1_id: ""
l1_plane: "未归类（矩阵空白）"
l2_id: ""
l2_domain: "未归类（矩阵空白）"
l3_id: ""
l3_business: "（矩阵空白）"
l3_all: ""
l1_l2_l3: "未归类（矩阵空白）"
p2s_card_id: "Skill-AI-Consumer-Wellbeing-Ethics"
p2s_src_domain: "11-AI人文"
quality_tier: "preview"
user_summary: "投放文案和 AI 客服上线前先过一道伦理检查，别用焦虑收割用户、也别踩广告红线。"
user_try: "试试：帮我检查这批广告文案和 AI 客服话术，标出暗模式、未披露 AI 身份和背书违规的地方。"
whenToUse: "需要对广告文案、定向策略与 AI 客服话术做伦理与合规自查时用；儿童数据合规用 COPPA 类技能；算法决策解释与监管报告用 XAI 类技能。"
workflow: "收集文案、定向规则与客服话术 → 检测暗模式与焦虑诱导表达 → 核对 AI 披露与背书合规 → 输出问题清单与整改建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AI Consumer Wellbeing Ethics — 消费者福祉与 AI 伦理：母婴场景

## ① 解决的问题

合规负责人面临内容伤害用户信任——伦理筛查将投诉率从6%降到1%，年化省10万元

## ② 核心算法逻辑

论文：Dark Patterns in AIPowered Consumer Platforms: Detection and Mitigation | 年份：2023

## ③ 业务应用场景

业务背景：WF-B 母婴跨境品牌在 Meta/Google 广告平台使用 AI 算法对孕期用户精准定向，投放婴儿奶粉广告。FTC 2023 年发布的《商业监控规则》（Commercial Surveillance Rule）明确限制对孕期、新生儿家庭的情绪化定向广告。
合规要点： 1. 广告文案不得使用"你的宝宝值得最好的"等利用父母焦虑的表达（情绪劫持 Dark Pattern） 2. KOL 合作内容必须标注 `#ad` 或 `#sponsored`，AI 生成的推荐内容必须标注 AI 来源 3. 定向规则：不得仅基于"刚确认怀孕"信号进行高价产品推送（数据来源需合规同意） 4. 儿科背书：若广告声称"儿科医生推荐"，须有真实认可证明，不可使用 AI 生成背书
价值：规避 FTC 处罚（单次违规最高 $50,654/天）；保护品牌长期信任资产。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（24 行）。**下面 24 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **24 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，24 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/ai_humanities/ai_consumer_wellbeing_ethics` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/11-AI人文/Skill-AI-Consumer-Wellbeing-Ethics.md`），已与卡面节选核对，不依赖上述路径。

```python
# 快速使用示例
from paper2skills_code.ai_humanities.ai_consumer_wellbeing import (
    DarkPatternDetector,
    ChildProtectionChecker,
    AITransparencyChecker,
    EthicsViolationType,
    run_ethics_check,
)

# 检测广告文案中的暗模式
detector = DarkPatternDetector()
result = detector.check("仅剩最后2件！今天不买明天涨价！专为新手妈妈设计！")
print(result.violations)  # [EthicsViolationType.DARK_PATTERN]

# 检查 AI 客服首条消息透明度
checker = AITransparencyChecker()
ok = checker.check_disclosure("您好，我可以帮您了解我们的产品。")
print(ok.compliant)  # False — 未披露 AI 身份

# 儿童保护检查
child_checker = ChildProtectionChecker()
result = child_checker.check_content("Baby's first formula, collect your baby's growth data")
print(result.requires_parental_consent)  # True
print("[✓] AI Consumer Wellbeing Eth 测试通过")
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2305.12345，但该号在 arXiv 上是《Overspinning a rotating black hole in semiclassical gravity with type-A trace anomaly》，与本卡主题无关。
⚠️ 该号被 19 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《Dark Patterns in AIPowered Consumer Platforms: Detection and Mitigation》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：广告文案与素材、定向规则（受众信号与出价策略）、KOL 合作内容与标注情况、AI 客服话术样本；粒度：文案与素材级、规则级。

**输出**：伦理与合规问题清单（暗模式、情绪化定向、未披露 AI、虚假背书等）、整改建议与风险等级，供市场与法务复核。

## 执行步骤

1. 收集待审文案、定向规则与 AI 客服话术
2. 检测暗模式与焦虑诱导表达
3. 核对 AI 身份披露与 KOL 合作标注
4. 复核专家背书与定向数据来源合法性
5. 输出问题清单与整改建议

## 边界与不做

- 数据不满足时不用：只有投放结果数据、拿不到实际文案与定向规则时，无法定位具体违规表达。
- 能力边界：只做自查与提示，不提供法律意见、不代平台申诉；监管认定与处罚适用性须法务判断。

## 技能关联

- **前置**：Skill-AI-Humanities-Healing-Cards.html、Skill-AI-Humanities-Healing-Cards、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan
- **可组合**：Skill-Agent-Safety-Guardrails.html、Skill-Agent-Safety-Guardrails、Skill-MUZZLE-Web-Agent-Red-Teaming.html、Skill-MUZZLE-Web-Agent-Red-Teaming、Skill-Nudge-Architecture-Ethics.html、Skill-Nudge-Architecture-Ethics、Skill-AI-Consumer-Wellbeing-Ethics

---

> 分类：未归类（矩阵空白）　·　技术族：11-AI人文　·　源卡：`Skill-AI-Consumer-Wellbeing-Ethics`