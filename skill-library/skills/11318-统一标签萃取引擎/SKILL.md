---
name: "p2s-voc-proxy-nps-aipl"
title: "'Skill: VOC Proxy NPS × AIPL 统一标签萃取引擎'"
description: "触发词：Proxy NPS、AIPL 萃取、指标口径、隐性问题、情感校准。何时不用：只要评论摘要与属性分布用「AGRS 属性引导评论摘要」；要按标签把信号分派给团队用「Tag-Driven VOC 信号路由」。安全边界：Proxy NPS 是代理指标、不得对外当作官方 NPS 披露；标签库与校准规则变更须版本化留痕，避免口径漂移。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-019"
l3_business: "VOC编码"
l3_all: "VOC编码 / 体验分析 / 指标契约"
l1_l2_l3: "业务运营/产品与创新/VOC编码"
quality_tier: "curated"
p2s_card_id: "Skill-VOC-Proxy-NPS-AIPL-统一萃取引擎"
p2s_src_domain: "07-NLP-VOC"
p2s_venue_tier: "non-paper"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-VOC-Proxy-NPS-AIPL-统一萃取引擎"
rebase_vault_path: "paper2skills-vault/07-NLP-VOC/00-知识库-Skill卡片/Skill-VOC-Proxy-NPS-AIPL-统一萃取引擎.md"
rebase_source_sha256: "c0436e83555d50ee157e7e390612cdd6c67891afcc18bcf54865cc49f34cdabd"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "c0436e83555d50ee157e7e390612cdd6c67891afcc18bcf54865cc49f34cdabd"
rebase_full_card_bytes: "27740"
rebase_full_card_lines: "718"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "259faf591cd1085e3c56ae68bd128a5bb6666cef203dd22b9a8e315513ec44ea"
user_summary: "把一条评论同时萃取出旅程阶段、产品问题和用户画像三类标签，用 Proxy NPS 把被高评分掩盖的隐性问题也识别出来。"
user_try: "试试：用统一萃取引擎跑这 12,000 条暖奶器评论，把 3-4 星里被掩盖的产品问题找出来并算出 Proxy NPS。"
whenToUse: "VOC 指标口径不统一、且高评分掩盖了真实问题时用本技能；若只要一份属性摘要，用「AGRS 属性引导评论摘要」；若要按标签把信号分派给团队，用「Tag-Driven VOC 信号路由」。"
workflow: "加载对应品线的标签种子库（如暖奶器 376 个标签） → 对全量评论运行统一萃取引擎 → 标记每条评论的 AIPL 旅程阶段与产品问题标签 → 把 3-4 星且命中问题标签加负向情感的评论重分类为 Detractor → 合成 Proxy NPS 并输出隐性问题清单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# 'Skill: VOC Proxy NPS × AIPL 统一标签萃取引擎'

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-VOC-Proxy-NPS-AIPL-统一萃取引擎`（完整卡：`references/full-card.md`，sha256 `c0436e83555d50ee157e7e390612cdd6c67891afcc18bcf54865cc49f34cdabd`，27740 字节 / 718 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `259faf591cd1085e3c56ae68bd128a5bb6666cef203dd22b9a8e315513ec44ea`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill: VOC Proxy NPS × AIPL 统一标签萃取引擎

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

## 基础信息

- **技能名称**: VOC-Proxy-NPS-AIPL-统一萃取引擎
- **核心方法**: 多标签关键词匹配 + 品线过滤 + 情感校准 + 画像推导
- **应用场景**: 母婴出海跨境电商 VOC 全链路标签自动萃取
- **数据规模**: 376 标签种子 + 55 原子画像标签 + AIPL 7 节点
- **代码位置**: `paper2skills-code/nlp_voc/proxy_nps_aipl_workflow/`

---

## 1. 算法原理

### 1.1 核心问题

传统 VOC 标签体系存在三大断层：

1. **标签碎片化**：产品问题标签、AIPL 旅程标签、画像标签分散在不同系统，无法从一条 VOC 文本同时萃取
2. **品线交叉污染**：通用标签和品线专属标签混用，导致吸奶器标签误打到内衣评论上
3. **情感方向混乱**：同一文本中不同方面的情感方向可能相反（"吸力好但噪音大"），粗粒度情感极性无法支撑业务决策

### 1.2 统一萃取框架

### 1.3 关键设计决策

| 决策 | 选择 | 原因 |
|------|------|------|
| 多标签策略 | 全部保留 | 用户可能同时提及多个问题方面 |
| 品线过滤 | 统一跑一次全量（带过滤） | 避免先通用后个性的两次遍历开销 |
| 情感校准 | 预定义 + ABSA 动态 | 预定义保证一致性，ABSA 捕捉上下文 |
| 画像推导 | 共现计分（非硬编码） | 数据驱动的画像归属，避免规则僵化 |
| Proxy NPS | 标签优先级法 | 推荐意愿标签优先级最高 |

### 1.4 数据模型


---

## 2. 业务应用

### 2.1 Momcozy 场景：一条评论萃取全部标签

**输入**（亚马逊评论）：
> "I was searching for a wearable pump and came across Momcozy on TikTok. Compared it with Willow and Elvie, the price is much more affordable. However, the flange size is too small and the suction feels weak. Customer service was slow to respond. Would not recommend to friends."

**萃取输出**：

**业务闭环**：
- 主责部门：客户服务部（P0）→ 立即跟进
- 策略包：服务体验优化包 + 核心体验改良包
- 画像洞察：该用户属于"社群黏着型"，对价格敏感，通过社媒了解品牌

### 2.2 指标看板：Proxy NPS × AIPL 漏斗

### 2.3 四路数据源统一处理

---

（**换底正文在此截断** —— 完整卡正文共 718 行，本页内联到第 180 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：品线隔离的标签种子库（如暖奶器 376 个标签，含温度不均匀、漏水等产品维度标签）+ 全量评论数据（示例：12,000 条 Amazon 评论，覆盖过去 6 个月），需含评分与评论文本。

**输出**：每条评论的三维萃取结果（AIPL 阶段、产品问题标签、消费者画像）、Proxy NPS 信号与被传统评分口径漏掉的隐性问题清单（如温度不均匀 156 条、漏水 89 条），以及供指标口径统一的契约说明。

## 执行步骤

1. 加载品线隔离的标签种子库
2. 对全量评论运行统一萃取引擎
3. 标记 AIPL 阶段与产品问题标签
4. 把高评分但命中问题标签的评论重分类为 Detractor
5. 计算 Proxy NPS 并输出隐性问题清单

## 边界与不做

- 标签种子库未建立、或品线标签不匹配时不适用，萃取结果会大面积落空
- Proxy NPS 是代理指标，口径与传统 NPS 不同，不得对外当作官方 NPS 披露
- 标签库与情感校准规则变更须版本化留痕，否则指标口径会漂移

## 技能关联

- **可组合**：Skill-VOC-Proxy-NPS-AIPL-统一萃取引擎

---

> 分类：业务运营/产品与创新/VOC编码　·　技术族：07-NLP-VOC　·　源卡：`Skill-VOC-Proxy-NPS-AIPL-统一萃取引擎`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（377 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-VOC-Proxy-NPS-AIPL-统一萃取引擎`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-VOC-Proxy-NPS-AIPL-统一萃取引擎`（完整卡：`references/full-card.md`）。
>
> - venue 档位：non-paper
> - 证据基础：author-practice
>
> - 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-VOC-Proxy-NPS-AIPL-统一萃取引擎`（完整卡：`references/full-card.md`）。
> >
> > - venue 档位：non-paper
> > - 证据基础：author-practice
> >
> > - 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-VOC-Proxy-NPS-AIPL-统一萃取引擎`（完整卡：`references/full-card.md`）。
> > >
> > > - venue 档位：non-paper
> > > - 证据基础：author-practice
> > >
> > > - 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-VOC-Proxy-NPS-AIPL-统一萃取引擎`（完整卡：`references/full-card.md`）。
> > > >
> > > > - venue 档位：non-paper
> > > > - 证据基础：author-practice
> > > >
> > > > - 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > （卡页此段未自动抽取，本卡未记录论文出处。）
