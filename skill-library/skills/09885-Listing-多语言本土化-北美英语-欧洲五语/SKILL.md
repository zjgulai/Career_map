---
id: multilingual-localizer
title: Listing 多语言本土化（北美英语 / 欧洲五语）
description: 在已有英文或源文案草稿后，将标题/五点/描述/A+ 模块转为目标市场语言并统一母婴专业术语；不替代合规扫描与法务终审。
skill_version: "0.1.0"
l2_pillar: 渠道
ref_domain:
  - B
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
---

## 目标

输出 **分语言、分模块** 的本土化文本，保持 **事实与认证表述** 与源稿一致，**禁止**在翻译中新增疗效或医疗承诺。

## 前置条件

- 输入来自 `listing-bulk-generator` 或等价结构化草稿。  
- 指定目标：`NA`（英语优化）或 `EU`（DE/EN/FR/IT/ES 中哪些语种）。  
- 维护 **术语表**（如吸力档位、防回流、静音）各语标准译法；可放在 `docs/` 或本 Skill 附录。

## 步骤

1. 锁定 **锁事实字段**（型号、认证号、参数）— 仅翻译不改写数字与标准名。  
2. 营销句 **逐句** 翻译并标注 **合规风险**（指向 `listing-compliance-scanner` 规则）。  
3. 欧洲 **一国一稿** 或主稿+副稿，禁止混语单栏无标注。  
4. 输出 **术语一致性检查**（同一概念在各模块用词统一）。  
5. 对无法直译的 slogan 给 **2 个文化适配版本** 供选。

## 输出格式

- 按 `module | lang | text | locked_facts | notes`  
- **术语表 diff**：本次新增或修改的词条。

## When NOT to use

- 源稿尚未通过 `listing-compliance-scanner` 的 Block 清零 — 先修源稿再翻译。  
- 仅机器翻译批量不加审 — 本 Skill 输出为 **人工发布前** 终稿候选。

## 相关 Skill

- 上游：`listing-bulk-generator`（`next`）  
- 下游：`listing-compliance-checker`（`next`）
