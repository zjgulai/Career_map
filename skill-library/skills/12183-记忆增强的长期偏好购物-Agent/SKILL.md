---
name: "p2s-long-term-preference-memory"
title: "Shopping Companion — 记忆增强的长期偏好购物 Agent"
description: "触发词：长期偏好记忆、跨会话记忆、偏好演化、复购推荐、生命周期升级。何时不用：单次会话内的导购推荐用「对话式商务 Agent」；本技能负责跨会话的偏好沉淀。安全边界：偏好记忆属个人信息，须经授权存储并可清除，不得跨平台合并用户身份。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-108"
l3_business: "选购指导"
l3_all: "选购指导 / 生命周期触达"
l1_l2_l3: "业务运营/服务与体验/选购指导"
quality_tier: "curated"
p2s_card_id: "Skill-Long-Term-Preference-Memory"
p2s_src_domain: "16-智能体工程"
p2s_venue_tier: "preprint"
p2s_paper_id: "2603.14864"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Long-Term-Preference-Memory"
rebase_vault_path: "paper2skills-vault/16-智能体工程/Skill-Long-Term-Preference-Memory.md"
rebase_source_sha256: "57d907dc1792a2e9fde90e14d2c97901a2e4de7bd9a216553f367eb5c8247aca"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "57d907dc1792a2e9fde90e14d2c97901a2e4de7bd9a216553f367eb5c8247aca"
rebase_full_card_bytes: "13840"
rebase_full_card_lines: "318"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "935d5b87960752eab7be685bde309dd08f72301843bd6a90f1a4f41bc7e99206"
user_summary: "记住每位妈妈买过什么、在意什么，宝宝进入下一阶段时主动推荐该升级的那一件。"
user_try: "试试：根据这位用户过去半年的购买和退货记录，预测她下一阶段需要什么并给出推荐。"
whenToUse: "当母婴等长周期品类需要跨会话沉淀偏好、按阶段主动推荐时用；单次对话导购用「对话式商务 Agent」。"
workflow: "从会话与订单事件更新偏好（购买品牌、退货原因、尺码历史） → 把偏好写入结构化记忆档案 → 对新候选商品按偏好与排除项打分过滤 → 输出排序推荐并回写本次交互偏好"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "11"
rebase_evidence_quotes_total: "12"
rebase_evidence_quotes_complete: "false"
---
# Shopping Companion — 记忆增强的长期偏好购物 Agent

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Long-Term-Preference-Memory`（完整卡：`references/full-card.md`，sha256 `57d907dc1792a2e9fde90e14d2c97901a2e4de7bd9a216553f367eb5c8247aca`，13840 字节 / 318 行 / 12 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 11 条（共 12 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `935d5b87960752eab7be685bde309dd08f72301843bd6a90f1a4f41bc7e99206`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Shopping Companion — 记忆增强的长期偏好购物 Agent

---

## ① 算法原理

### 核心思想

**Shopping Companion** 解决两个长期被忽视的问题:(1) 缺少能评估跨 session 偏好记忆的端到端购物 benchmark;(2) 现有方法把"偏好识别"和"购物执行"当作独立模块,没有端到端联合优化。它把购物 Agent 形式化为 **POMDP**,并提出**两阶段统一框架** + **双奖励 RL 训练**。

两阶段架构:

1. **Stage 1 - Preference Identification(偏好识别)**:通过 memory tools 检索跨 session 对话历史,提取隐含偏好(品牌偏好、尺码历史、价格档),并向用户呈现确认,允许用户介入修正
2. **Stage 2 - Shopping Assistance(购物执行)**:基于确认后的偏好,迭代检索产品 + 校验约束(预算、组合、品类),直到任务完成

5 个工具(基于 memory + product 两个检索引擎):memory search、product search、preference extraction、constraint check、recommendation output。

### 数学直觉

**任务成功条件**:Agent 终态推荐必须同时满足"指令需求"和"偏好约束":

$$
C_{\mathcal{I}} = \bigwedge_{n \in \mathcal{N}(\mathcal{I})} \text{Satisfy}(s_T, n), \quad C_{\mathcal{M}} = \bigwedge_{p \in \mathcal{P}(\mathcal{M})} \text{Match}(s_T, p)
$$

（**换底正文在此截断** —— 完整卡正文共 318 行，本页内联到第 25 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 11 / 全 12 条 —— **其余 1 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 12 条逐字引文。本页按完整卡顺序内联**前 11 条整条引文**（不在引文中间断开）；其余 1 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"Our meta-evaluation study demonstrates that the GPT-5 evaluator achieves more than 90% agreement with human experts."
> 出处：2603.14864 §4.2 Evaluation Methods
>
> 原文:"We construct a large-scale shopping sandbox containing over 1.2 million real-world products to enable consistent evaluation."
> 出处：2603.14864 §4.1 Shopping Simulation Environment
>
> 原文:"Our benchmark contains 1,000 instructions (500 per task) split into 800 training and 200 test examples. Each instruction has 15–50 turn conversation history with embedded preferences."
> 出处：2603.14864 §6.1 Experimental Setup, Dataset
>
> 原文:"Shopping Companion employs a two-stage architecture (illustrated in Figure 1): Stage 1 (Preference Identification) retrieves relevant conversation history via memory tools and extracts implicit user preferences (e.g., brand aversions, size history). These are presented to the user for confirmation, enabling intervention before shopping proceeds."
> 出处：2603.14864 §5.1 Two-Stage Agentic Framework
>
> 原文:"However, performance drops substantially on add-on deals, with success rates between 24.0% and 54.0%, indicating that multi-product coordination and constraint satisfaction remain challenging even for large-scale models."
> 出处：2603.14864 §6.2 Main Results, Closed-source LLMs
>
> 原文:"Qwen3-4B achieves only 49.0% Acc. and 44.0% Succ. on single products and performs poorly on add-on deals (6.0% Succ.)."
> 出处：2603.14864 §6.2 Main Results, Open-source LLMs
>
> 原文:"With dual & tool-wise rewards, the model reaches 90.0% Acc. and 84.0% Succ. on single products and 55.0% Acc. and 43.0% Succ. on add-on deals, outperforming open-source baselines and approaching closed-source models."
> 出处：2603.14864 §6.2 Main Results, Shopping Companion
>
> 原文:"| GPT-5 | 82.0 | 75.0 | 66.0 | 54.0 | 74.0 | 64.5 |"
> 出处：2603.14864 §6 Experiments, Table 2
>
> 原文:"| GPT-4o | 79.0 | 72.0 | 41.0 | 26.0 | 60.0 | 49.0 |"
> 出处：2603.14864 §6 Experiments, Table 2
>
> 原文:"| GPT-4.1 | 88.0 | 78.0 | 39.0 | 24.0 | 63.5 | 51.0 |"
> 出处：2603.14864 §6 Experiments, Table 2
>
> 原文:"89.0 81.0 50.0 38.0 69.5 59.5"
> 出处：2603.14864 §6 Experiments, Table 2 (Qwen3-4B-LoRA + RL, Dual-reward)
>

## 输入 / 输出契约

**输入**：6 个月以上历史对话与购买退货事件、结构化产品库；事件字段含类型（购买、退货、尺码）与对应取值。

**输出**：用户结构化偏好档案（品牌偏好分、尺码历史、价格区间、排除特征、会话数）与新会话的偏好过滤排序结果，供复购与阶段推荐使用。

## 执行步骤

1. 从历史会话与订单抽取偏好、排除特征与尺码记录
2. 把偏好写入结构化记忆档案并累计会话数
3. 对新品候选按品牌偏好与排除项打分
4. 按孕期、月龄阶段生成主动推荐
5. 定期清理与压缩记忆，保留有效偏好

## 边界与不做

- 何时不用：历史对话不足或缺少结构化产品库时，偏好推断会偏差
- 能力边界：只做偏好记忆与推荐排序，不做跨平台身份合并，记忆存储需用户授权

## 技能关联

- **延伸**：Skill-Agentic-Memory-Management.html、Skill-Agentic-Memory-Management、Skill-Auto-Skill-Synthesis.html、Skill-Auto-Skill-Synthesis、Skill-Context-Compression.html、Skill-Context-Compression
- **可组合**：Skill-AutoGen-Multi-Agent-Conversation.html、Skill-AutoGen-Multi-Agent-Conversation、Skill-Long-Term-Preference-Memory

---

> 分类：业务运营/服务与体验/选购指导　·　技术族：16-智能体工程　·　源卡：`Skill-Long-Term-Preference-Memory`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（52 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Long-Term-Preference-Memory`（完整卡：`references/full-card.md`）。

- 论文：2603.14864
- 标题：Shopping Companion: A Memory-Augmented LLM Agent for Real-World E-Commerce Tasks
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：12 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Long-Term-Preference-Memory`（完整卡：`references/full-card.md`）。
>
> - 论文：2603.14864
> - 标题：Shopping Companion: A Memory-Augmented LLM Agent for Real-World E-Commerce Tasks
> - venue 档位：preprint
> - 证据基础：paper-verbatim
>
> - 逐字引文：12 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Long-Term-Preference-Memory`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2603.14864
> > - 标题：Shopping Companion: A Memory-Augmented LLM Agent for Real-World E-Commerce Tasks
> > - venue 档位：preprint
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：12 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Long-Term-Preference-Memory`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2603.14864
> > > - 标题：Shopping Companion: A Memory-Augmented LLM Agent for Real-World E-Commerce Tasks
> > > - venue 档位：preprint
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：12 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Long-Term-Preference-Memory`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2603.14864
> > > > - 标题：Shopping Companion: A Memory-Augmented LLM Agent for Real-World E-Commerce Tasks
> > > > - venue 档位：preprint
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：12 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2603.14864 — Shopping Companion: Benchmarking and Training LLM Agents for Long-Horizon Preference-Grounded E-Commerce Tasks
> > > > > ⚠️ 该号被 2 张卡共用，最多只有一张能对。
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
