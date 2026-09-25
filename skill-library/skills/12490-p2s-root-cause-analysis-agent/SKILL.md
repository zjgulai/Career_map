---
name: "p2s-root-cause-analysis-agent"
title: "Root Cause Analysis Agent for Business Anomalies"
description: "触发词：根因分析、转化率骤降、假设生成、证据取证、监控闭环。何时不用：已有指标因果拓扑要秒级路径溯源时用「ProRCA」；只要指标漂移告警本身时用运行监测类技能。安全边界：Agent 只做查询取证与结论输出，不得自行执行修复或变更线上配置。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-008"
l3_business: "GMV归因分析"
l3_all: "GMV归因分析 / 运行监测"
l1_l2_l3: "经营管理/经营与组织/GMV归因分析"
quality_tier: "curated"
p2s_card_id: "Skill-Root-Cause-Analysis-Agent"
p2s_src_domain: "09-DataAgent-LLM"
p2s_venue_tier: "non-paper"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Root-Cause-Analysis-Agent"
rebase_vault_path: "paper2skills-vault/09-DataAgent-LLM/Skill-Root-Cause-Analysis-Agent.md"
rebase_source_sha256: "cd767d6c2015b74640c10bdaaf210c11aa5aec6fcff0a7eebd63cb0ad434c3b7"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "cd767d6c2015b74640c10bdaaf210c11aa5aec6fcff0a7eebd63cb0ad434c3b7"
rebase_full_card_bytes: "13048"
rebase_full_card_lines: "345"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "e1c1476cf26282510de33e09d4a54f2c27543afc890c309a3818b3baf8c8fd86"
user_summary: "指标突然异常时，自动生成假设、逐条查证据，几分钟给出最可能的根因。"
user_try: "试试：今天下午转化率从 2.5% 掉到 1.2%，帮我自动生成假设并逐条查证据，定位最可能的根因。"
whenToUse: "当异常类型未知、需要 Agent 自动生成假设并调用工具取证时用本技能；已有指标因果拓扑要秒级路径溯源，用「ProRCA」；只需要指标漂移告警本身，用运行监测类技能。"
workflow: "构造异常事件对象（指标、时间窗、幅度） → 用 LLM 生成候选假设（前端、支付、流量、缺货、竞品等） → 逐条调用工具收集证据并判定真假 → 汇总最可能的根因与建议动作"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Root Cause Analysis Agent for Business Anomalies

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Root-Cause-Analysis-Agent`（完整卡：`references/full-card.md`，sha256 `cd767d6c2015b74640c10bdaaf210c11aa5aec6fcff0a7eebd63cb0ad434c3b7`，13048 字节 / 345 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `e1c1476cf26282510de33e09d4a54f2c27543afc890c309a3818b3baf8c8fd86`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Root Cause Analysis Agent

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

---

## ① 算法原理

**核心问题**：异常检测告诉你"什么出问题了"，但不告诉你"为什么"。根因分析（RCA）回答"为什么"——是系统Bug、竞品行动、营销活动、还是供应链问题？

**传统RCA的局限**：
- 人工排查：慢，依赖经验
- 规则引擎：僵化，无法覆盖未知场景
- 相关性分析：容易陷入"相关≠因果"的陷阱

**Agent-based RCA 框架**：

1. **多源数据接入**：整合指标数据、日志、用户反馈、竞品情报
2. **假设生成**：LLM根据异常特征生成可能的根因假设
3. **证据收集**：Agent自动查询数据库、调用API验证假设
4. **因果推理**：用因果推断方法（DoWhy/PyWhy）验证因果关系
5. **报告生成**：输出结构化的根因报告，含置信度和建议

**关键组件**：

- **Hypothesis Generator**：基于异常模式生成根因假设树
- **Evidence Collector**：自动查询相关数据源
- **Causal Validator**：用干预分析验证因果方向
- **Report Composer**：生成可执行的建议

**反直觉洞察**：
- 最快的根因定位往往不是"深入挖掘"，而是"横向对比"——与其他 unaffected 的维度对比
- 80%的根因可以在5分钟内定位：看最近变更（代码发布、配置修改、营销活动）
- Agent的价值在于处理那20%的复杂根因——需要跨系统、跨时间维度的关联分析

---

## ② 母婴出海应用案例

### 场景：转化率异常自动根因分析

**业务问题**：某日下午转化率从2.5%骤降到1.2%。传统排查需要人工逐个检查系统、页面、流量来源，耗时1-2小时。

**Agent RCA 流程**：

1. **异常接收**：时序异常检测系统触发告警

2. **假设生成**（LLM）：
   - H1: 前端页面加载异常
   - H2: 支付通道故障
   - H3: 流量来源变化（低质量流量涌入）
   - H4: 某个SKU缺货导致流失
   - H5: 竞品促销导致用户比价流失

3. **证据收集**（Agent自动查询）：
   - H1: 检查页面加载时间 → 正常（1.2s）
   - H2: 检查支付成功率 → 异常（从98%降到45%）
   - H3: 检查流量来源构成 → 无明显变化
   - H4: 检查SKU库存状态 → 正常
   - H5: 检查竞品价格 → 无重大促销

4. **根因确认**：支付通道故障（Stripe API 429限流）

5. **建议生成**：
   - 立即：切换备用支付通道
   - 短期：与Stripe沟通限流原因
   - 长期：建立多支付通道自动切换机制

**预期产出**：
- 根因定位时间：1-2小时 → 5分钟
- 误定位率：人工30% → Agent <10%

---

（**换底正文在此截断** —— 完整卡正文共 345 行，本页内联到第 80 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：异常事件描述（指标、发生时间、幅度）、可查询的证据源（页面加载、支付成功率、流量来源、SKU 库存、竞品价格）与查询接口。

**输出**：假设清单、每条假设的证据与判定结论、最终根因与建议动作；供业务负责人快速处置。

## 执行步骤

1. 构造异常事件对象（指标、时间窗、幅度）
2. 用 LLM 生成候选假设（前端、支付、流量、缺货、竞品）
3. 逐条调用工具收集证据并判定每条假设
4. 汇总最可能的根因与建议动作

## 边界与不做

- 数据不满足：证据源无法查询时假设无法验证，先打通查询接口。
- 何时不用：已有因果拓扑要秒级定位用「ProRCA」；离线因果结构学习用「PC算法因果发现」；只要指标监控告警用运行监测类技能。
- 能力边界：只做取证与结论输出，不执行修复动作，也不保证假设集合完备。
- 安全边界：不得依据未验证假设自动变更线上配置或触发资金类操作。

## 技能关联

- **前置**：Skill-Argos-Agentic-Anomaly-Detection.html、Skill-Argos-Agentic-Anomaly-Detection、Skill-SQL-Agent-Text-to-SQL.html、Skill-SQL-Agent-Text-to-SQL
- **延伸**：Skill-DeepAnalyze-Autonomous-Data-Science-Agent.html、Skill-DeepAnalyze-Autonomous-Data-Science-Agent
- **可组合**：Skill-Multi-Agent-Debate.html、Skill-Multi-Agent-Debate、Skill-Root-Cause-Analysis-Agent

---

> 分类：经营管理/经营与组织/GMV归因分析　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-Root-Cause-Analysis-Agent`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（244 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Root-Cause-Analysis-Agent`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Root-Cause-Analysis-Agent`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-Root-Cause-Analysis-Agent`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-Root-Cause-Analysis-Agent`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-Root-Cause-Analysis-Agent`（完整卡：`references/full-card.md`）。
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
> > > > > **卡页记录的出处不可采信**：卡页写的是 arXiv:2206.01161，但该号在 arXiv 上是《Optimizing Relevance Maps of Vision Transformers Improves Robustness》，与本卡主题无关。
> > > > > ⚠️ 卡页 ② 段点名的论文是《Root Cause Analysis in Microservice Systems: A Survey》，与这个号指的不是同一篇。
> > > > >
> > > > > 按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。
