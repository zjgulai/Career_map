---
name: "p2s-omnithink-knowledge-boundary-expansion"
title: "Skill-OmniThink-Knowledge-Boundary-Expansion"
description: "触发词：知识缺口、报告补全、边界扩展、盲区识别、市场研究。何时不用：需要的是品类机会打分或市场规模数字时分别用「品类机会评分引擎」「Market Size Estimation」；本技能只处理研究报告的知识覆盖问题。安全边界：卡页未给出数据规格与合规要求，补全内容必须标注来源，不得把模型补全当作事实证据。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-022"
l3_business: "市场机会评估"
l3_all: "市场机会评估 / 竞品研究"
l1_l2_l3: "业务运营/产品与创新/市场机会评估"
p2s_card_id: "Skill-OmniThink-Knowledge-Boundary-Expansion"
p2s_src_domain: "09-DataAgent-LLM"
p2s_code_level: "无代码"
quality_tier: "preview"
user_summary: "分析市场报告时自动识别知识盲区并做补全，让报告覆盖更完整，减少因为没查到就没写进去的遗漏。"
whenToUse: "写市场或竞品研究报告、担心存在知识盲区遗漏时用本技能；若要的是品类机会评分或市场规模数字，用「品类机会评分引擎」或「Market Size Estimation」；若要做竞品评论主题对标，用「Competitive VOC Benchmarking」。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-OmniThink-Knowledge-Boundary-Expansion

## ① 解决的问题

分析师面临市场报告知识盲区遗漏——OmniThink自动识别知识缺口并补全，报告深度+300%，年化分析质量提升价值30万元

## ② 核心算法逻辑

SkillOmniThinkKnowledgeBoundaryExpansion

## ③ 业务应用场景

（卡页此段是占位串，未承载业务场景；可读的落地口径见下方「执行步骤」与「输入 / 输出契约」。）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

（卡页此段未附代码。但语料 vault 的同一张卡里有代码：本技能已附 `references/implementation.py`（137 行）。⚠️ 本卡卡面无节选可作对照，该文件取的是最长代码围栏，**未经交叉核对**。）

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2501.09751。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：待分析的市场研究报告或研究材料的初步分析结果；卡页第 4 段未给出更细的数据规格，实施前需回看原始卡页补齐输入定义。

**输出**：识别出的知识缺口清单与补全后的报告内容（报告深度提升）；卡页第 5 段未给出输出规格，交付前需回看原始卡页确认产出形态。

## 执行步骤

1. 输入待分析的市场报告与研究材料
2. 扫描并列出其中未被覆盖的知识缺口
3. 针对每个缺口做补充检索与内容扩写
4. 把补全内容回填到报告结构中并标注来源

## 边界与不做

- 卡页第 3/4/5/7 段未自动抽取，缺少明确的业务场景与数据规格时不得直接投产，需先回看原始卡页
- 补全内容只能作为线索，必须标注来源与不确定性，不得当作已核实事实使用
- 本技能不替代事实核查与合规审阅

## 技能关联

- **可组合**：Skill-OmniThink-Knowledge-Boundary-Expansion

---

> 分类：业务运营/产品与创新/市场机会评估　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-OmniThink-Knowledge-Boundary-Expansion`