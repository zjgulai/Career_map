---
name: "p2s-gan-red-team-listing"
title: "GAN 红队驱动的 Listing 上线前免疫接种 (Adversarial Listing Defense)"
description: "触发词：红队演练、对抗生成、Listing 劫持、专利碰瓷、上架前免疫。何时不用：上架后的跟卖发现与侵权处置不属本技能；本技能只做上架前的对抗预演。安全边界：红队模拟仅用于自身防御演练，不得用于生成攻击、劫持他人 Listing 的内容。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-067"
l3_business: "Listing优化"
l3_all: "Listing优化 / 知识产权检索"
l1_l2_l3: "业务运营/渠道经营/Listing优化"
p2s_card_id: "Skill-GAN-Red-Team-Listing"
p2s_src_domain: "16-智能体工程"
quality_tier: "preview"
user_summary: "上架前先让一个攻击者 Agent 试着劫持和碰瓷你的 Listing，把能堵的漏洞先堵上。"
user_try: "试试：对这款准备上架的爆款跑一次红队演练，列出可能的 Listing 劫持和专利碰瓷路径。"
whenToUse: "当爆款上架前需要预演攻击面、做防御性免疫接种时用；上架后的跟卖发现与侵权处置不在本技能。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# GAN 红队驱动的 Listing 上线前免疫接种 (Adversarial Listing Defense)

## ① 解决的问题

运营团队在爆款上架前始终找不到潜在攻击点——引入生成对抗网络(GAN)红队Agent，以灰色市场攻击者视角自动生成Listing劫持与专利碰瓷模拟，在上架前完成免疫接种，防止爆款上架2周即被恶意跟卖摧毁。

## ② 核心算法逻辑

Skill Card: GAN 红队驱动的 Listing 上线前免疫接种 (Adversarial Listing Defense)

## ③ 业务应用场景

（卡页此段是占位串，未承载业务场景；可读的落地口径见下方「执行步骤」与「输入 / 输出契约」。）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

（卡页此段未附代码；源站声明有 0 个代码块并记录位置 `paper2skills-code/llm_agent_engineering/gan_red_team_listing`，但**该代码树不在本包内**，本包未附带。）

## ⑧ 论文来源

**出处（已核验）**：arXiv:1705.07204 — Ensemble Adversarial Training: Attacks and Defenses

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：待上架 Listing 的标题、要点与图片，以及品牌、专利、商标等权利信息；卡页未给出更细的输入规格，以原始 Skill 卡片为准。

**输出**：以攻击者视角给出的潜在 Listing 劫持与专利碰瓷路径清单及上线前加固建议；卡页未给出更细的输出规格，以原始 Skill 卡片为准。

## 执行步骤

1. 梳理待上架 Listing 的文案、图片与权利信息
2. 以灰色市场攻击者视角生成劫持与碰瓷模拟
3. 列出可行的攻击路径与触发条件
4. 在上架前逐条加固文案、图片与品牌标识
5. 把高风险攻击面纳入上架后监控清单

## 边界与不做

- 何时不用：缺少品牌与权利信息时不适用，无法判断碰瓷风险
- 能力边界：本卡页未提供业务场景、输入输出规格与代码模板，只承载红队演练的思路框架，落地需以原始 Skill 卡片为准

## 技能关联

- **前置**：Skill-Agent-Fault-Tolerance.html、Skill-Agent-Fault-Tolerance、Skill-Brand-Listing-Hijacking-Detection.html、Skill-Brand-Listing-Hijacking-Detection、Skill-Listing-Compliance-Auto-Repair.html、Skill-Listing-Compliance-Auto-Repair、Skill-Listing-Health-Diagnostic.html、Skill-Listing-Health-Diagnostic、Skill-PromptGuard-Injection-Defense.html、Skill-PromptGuard-Injection-Defense
- **延伸**：Skill-Agent-Fault-Tolerance.html、Skill-Agent-Fault-Tolerance、Skill-Brand-Listing-Hijacking-Detection.html、Skill-Brand-Listing-Hijacking-Detection、Skill-Listing-Compliance-Auto-Repair.html、Skill-Listing-Compliance-Auto-Repair、Skill-PromptGuard-Injection-Defense.html、Skill-PromptGuard-Injection-Defense
- **可组合**：Skill-Agent-Fault-Tolerance.html、Skill-Agent-Fault-Tolerance、Skill-Listing-Compliance-Auto-Repair.html、Skill-Listing-Compliance-Auto-Repair、Skill-PromptGuard-Injection-Defense.html、Skill-PromptGuard-Injection-Defense、Skill-GAN-Red-Team-Listing

---

> 分类：业务运营/渠道经营/Listing优化　·　技术族：16-智能体工程　·　源卡：`Skill-GAN-Red-Team-Listing`