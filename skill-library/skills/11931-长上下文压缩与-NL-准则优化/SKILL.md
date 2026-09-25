---
name: "p2s-context-compression"
title: "ACON — Agent 长上下文压缩与 NL 准则优化"
description: "触发词：长上下文压缩、历史摘要、观察压缩、准则优化、长对话客服降本。何时不用：单轮短会话或上下文未超模型窗口时不必要；只按相关性剪枝单轮工具结果用主动上下文剪枝。安全边界：压缩不得丢掉订单、物流与规格等关键事实，压缩准则须用成功与失败轨迹校准后再上线。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 容量管理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
quality_tier: "curated"
p2s_card_id: "Skill-Context-Compression"
p2s_src_domain: "16-智能体工程"
p2s_venue_tier: "CCF-A"
p2s_paper_id: "2510.00615"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Context-Compression"
rebase_vault_path: "paper2skills-vault/16-智能体工程/Skill-Context-Compression.md"
rebase_source_sha256: "a71d5598486b8cdbca80de12b60b36e2173f7a175cd2a54fd58e52dea43eb123"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "a71d5598486b8cdbca80de12b60b36e2173f7a175cd2a54fd58e52dea43eb123"
rebase_full_card_bytes: "18126"
rebase_full_card_lines: "368"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "0fd161417b8dcc48972154a78f4678f6eaefb321b677d18ec437de43faf5fcc8"
user_summary: "把几十轮客服对话和超长的接口返回压成摘要，成本和首响时延都降下来还不掉准确率。"
user_try: "试试：客服对话 10-30 轮、订单和物流接口返回单个就 5000 token，帮我压缩上下文并保证关键事实不丢。"
whenToUse: "当长会话与多次接口返回把上下文撑爆、需要既降本又不丢关键事实时用本卡；只按相关性剪枝当轮工具结果用主动上下文剪枝；需要跨会话积累知识用记忆管理类技能。"
workflow: "汇总历史对话轮次与接口返回结果 → 按 token 预算保留最近的关键观察 → 对超预算内容提取关键行压缩成摘要 → 为较早历史生成系统级摘要并保留最近若干轮 → 用成功与失败轨迹校准压缩准则"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "10"
rebase_evidence_quotes_total: "29"
rebase_evidence_quotes_complete: "false"
---
# ACON — Agent 长上下文压缩与 NL 准则优化

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Context-Compression`（完整卡：`references/full-card.md`，sha256 `a71d5598486b8cdbca80de12b60b36e2173f7a175cd2a54fd58e52dea43eb123`，18126 字节 / 368 行 / 29 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 10 条（共 29 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `0fd161417b8dcc48972154a78f4678f6eaefb321b677d18ec437de43faf5fcc8`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: ACON — Agent 长上下文压缩与失败驱动准则优化

---

## ① 算法原理

### 核心思想

**ACON(Agent Context Optimization)** 解决长 horizon LLM Agent 的核心瓶颈:**上下文随交互无界增长**。Agent 在每一步要积累 observation + action,十几步后 context 就爆炸,带来高成本 + 长上下文稀释相关信息。

ACON 的两个核心创新:

1. **双重压缩**:
   - **History Compression**:压缩历史交互(observation + action 序列)
   - **Observation Compression**:压缩当前步的长观察(API 返回值、长文档等)
   - 都用阈值触发:$|h_t| > T_{\text{hist}}$ 或 $|o_t| > T_{\text{obs}}$

2. **失败驱动的 NL guideline 优化**(gradient-free):

（**换底正文在此截断** —— 完整卡正文共 368 行，本页内联到第 19 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 10 / 全 29 条 —— **其余 19 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 29 条逐字引文。本页按完整卡顺序内联**前 10 条整条引文**（不在引文中间断开）；其余 19 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"We introduce Agent Context Optimization (Acon), a unified framework that optimally compresses both environment observations and interaction histories into concise yet informative condensations."
> 出处：2510.00615 §Abstract（双重压缩的总体定义）

> 原文:"Acon leverages compression guideline optimization in natural language space: given paired trajectories where full context succeeds but compressed context fails, capable LLMs analyze the causes of failure, and the compression guideline is updated accordingly."
> 出处：2510.00615 §Abstract（失败驱动的 NL guideline 优化）

> 原文:"As interactions accumulate, contexts grow unbounded as in Figure 2, creating two major challenges."
> 出处：2510.00615 §1（上下文无界增长这一核心瓶颈）

> 原文:"Second, excessively long contexts dilute relevant information, distracting the model with outdated or extraneous details (Shi et al., 2023)."
> 出处：2510.00615 §1（长上下文稀释相关信息的依据）

> 原文:"we apply history compression only when the history length exceeds a predefined threshold"
> 出处：2510.00615 §3.2（History compression 的阈值触发机制）

> 原文:"We similarly apply observation compression only when the observation length exceeds a threshold"
> 出处：2510.00615 §3.2（Observation compression 的阈值触发机制）

> 原文:"To overcome these challenges, we propose to optimize compression guidelines ${\mathcal{P}}$ (natural language prompts) for context compression, rather than fine-tuning model parameters $\phi$."
> 出处：2510.00615 §3.3（gradient-free：只优化 prompt 不微调参数）

> 原文:"We instantiate this idea as prompt optimization using an LLM as the optimizer, where the natural language prompt"
> 出处：2510.00615 §3.3（LLM-as-optimizer 范式）

> 原文:"we perform a second iteration that conditions only on successful task with compressed context, asking the LLM to generate feedback about which information was actually used during execution."
> 出处：2510.00615 §3.3（CO 步骤只用 success trajectory）

> 原文:"To reduce this cost, we distill the compressor into a smaller model."
> 出处：2510.00615 §3.4（compressor 蒸馏的动机：compressor 本身有额外调用成本）

## 输入 / 输出契约

**输入**：跨境客服的历史对话（常为 10-30 轮）、多次接口返回的原始数据（订单、物流、产品规格，单个可能 5000 以上 token），以及每个场景 50-200 对成功轨迹与失败轨迹标注用于校准准则。

**输出**：压缩后的观察序列与历史摘要（保留最近若干轮加系统级摘要），以及长对话的推理成本与首响时延改善幅度，供长流程 Agent 在受限上下文窗口内继续推理。

## 执行步骤

1. 汇总历史对话轮次与多次接口返回的原始结果
2. 按 token 预算保留最近的关键观察
3. 对超预算内容提取错误与结果等关键行并压缩成摘要
4. 对较早历史生成系统级摘要并保留最近若干轮
5. 用成功与失败轨迹对校准压缩准则
6. 输出压缩后上下文并核对准确率是否下降

## 边界与不做

- 何时不用：单轮短会话、上下文未超模型窗口时不必要；只剪枝当轮工具结果时用更轻的主动上下文剪枝。
- 能力边界：压缩准则需随业务场景演化定期更新，每个场景需 50-200 对成功与失败轨迹做校准，准确率影响须逐场景验证。
- 本技能承载的是规则与契约产物（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-Skill-Lifecycle-Design.html、Skill-Skill-Lifecycle-Design
- **延伸**：Skill-Active-Context-Pruning.html、Skill-Active-Context-Pruning、Skill-Agentic-Memory-Management.html、Skill-Agentic-Memory-Management、Skill-Memory-as-Action.html、Skill-Memory-as-Action
- **可组合**：Skill-Auto-Skill-Synthesis.html、Skill-Auto-Skill-Synthesis、Skill-Cost-Aware-Agent-Scheduling.html、Skill-Cost-Aware-Agent-Scheduling、Skill-DAG-Ta[REDACTED].html、Skill-DAG-Ta[REDACTED]、Skill-LLM-Business-Intelligence-Reasoning.html、Skill-LLM-Business-Intelligence-Reasoning、Skill-Orchestration-Trace-RL.html、Skill-Orchestration-Trace-RL、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-Tool-Description-Audit.html、Skill-Tool-Description-Audit、Skill-Context-Compression

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：16-智能体工程　·　源卡：`Skill-Context-Compression`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（38 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Context-Compression`（完整卡：`references/full-card.md`）。

- 论文：2510.00615
- venue 档位：CCF-A
- 证据基础：paper-verbatim

- 逐字引文：29 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Context-Compression`（完整卡：`references/full-card.md`）。
>
> - 论文：2510.00615
> - venue 档位：CCF-A
> - 证据基础：paper-verbatim
>
> - 逐字引文：29 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Context-Compression`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2510.00615
> > - venue 档位：CCF-A
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：29 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Context-Compression`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2510.00615
> > > - venue 档位：CCF-A
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：29 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Context-Compression`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2510.00615
> > > > - venue 档位：CCF-A
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：29 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2510.00615 — ACON: Optimizing Context Compression for Long-horizon LLM Agents
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
