---
name: "p2s-agentic-memory-management"
title: "AgeMem — 统一 LTM+STM 管理的 Agentic Memory"
description: "触发词：LTM与STM统一、记忆即策略动作、用户生命周期记忆、过期偏好清理、记忆质量评估。何时不用：单次会话、无跨会话画像需求时不适用；只做结构化记忆图谱走A-MEM记忆系统。安全边界：长期记忆涉及用户画像，须按最小必要收集并支持删除过期偏好，训练与评测数据须脱敏。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 知识溯源"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
quality_tier: "curated"
p2s_card_id: "Skill-Agentic-Memory-Management"
p2s_src_domain: "16-智能体工程"
p2s_venue_tier: "preprint"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Agentic-Memory-Management"
rebase_vault_path: "paper2skills-vault/16-智能体工程/Skill-Agentic-Memory-Management.md"
rebase_source_sha256: "9bf3170b94bc82ed3e40d186eb10f345e738d0affb53325c2be1c4a4df812a48"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "9bf3170b94bc82ed3e40d186eb10f345e738d0affb53325c2be1c4a4df812a48"
rebase_full_card_bytes: "23757"
rebase_full_card_lines: "479"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "5247d6516ce04dbacc62c5392f3326dc08c4ddf8607326b8b68fd3fd8152b792"
user_summary: "让 Agent 自己判断哪些用户信息该长期记住、哪些该过滤、哪些过期该删掉，而不是靠固定规则。"
user_try: "试试：母婴用户从孕期到3岁跨4年数百次交互，帮我建立能自动沉淀过敏原、品牌偏好和月龄变化的记忆管理。"
whenToUse: "当需要 Agent 自主决定用户信息的存取与更新、且输入侧有标注训练数据时用本卡；只做跨会话决策记忆用 A-MEM 记忆系统；只压缩当前上下文用上下文压缩技能。"
workflow: "汇总用户跨会话对话、商品互动与客服记录 → 判定应写入长期记忆的信息类型 → 用过滤器剔除广告导流与闲聊等噪声 → 对随时间变化的属性更新、对过期偏好删除 → 按访问频次把短期记忆固化进长期记忆"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "8"
rebase_evidence_quotes_total: "17"
rebase_evidence_quotes_complete: "false"
---
# AgeMem — 统一 LTM+STM 管理的 Agentic Memory

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Agentic-Memory-Management`（完整卡：`references/full-card.md`，sha256 `9bf3170b94bc82ed3e40d186eb10f345e738d0affb53325c2be1c4a4df812a48`，23757 字节 / 479 行 / 17 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 8 条（共 17 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `5247d6516ce04dbacc62c5392f3326dc08c4ddf8607326b8b68fd3fd8152b792`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: AgeMem — 统一 LTM+STM 管理的 Agentic Memory

---

## ① 算法原理

### 核心思想

**AgeMem(Agentic Memory)** 颠覆了传统 LTM/STM 分离架构,把**记忆管理整合到 Agent 的 policy 本身**。现有方法把 LTM 与 STM 当作两个独立模块,要么用 trigger-based 启发式,要么外挂 Memory Manager,导致:

- LTM/STM 分别优化,组合时各种 ad-hoc
- 训练时记忆操作的稀疏/不连续 reward 难处理
- 部署时需要额外 expert LLM,推理成本翻倍

AgeMem 三大创新:

1. **6 个 memory tools 作为 action space**:
   - LTM: `Add` / `Update` / `Delete`
   - STM: `Retrieve` / `Summary` / `Filter`
   - LLM 自主决定何时调用哪个,无需外部 controller


（**换底正文在此截断** —— 完整卡正文共 479 行，本页内联到第 22 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 8 / 全 17 条 —— **其余 9 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 17 条逐字引文。本页按完整卡顺序内联**前 8 条整条引文**（不在引文中间断开）；其余 9 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"On LongMemEval, the graph does not outperform a flat vector baseline at a matched candidate-generation budget of five retrieval roots: token F1 is $0.417$ against $0.468$, and a paired bootstrap over 500 questions gives $\Delta=-0.050$ (95% CI $[-0.085,-0.016]$)."
> 出处：2608.28978 §Abstract｜Q1

> 原文:"The gap is widest on questions that require recalling a specific prior assistant turn, where judged correctness falls from $0.911$ to $0.607$, suggesting that decomposing a turn into entities discards the surface form these questions depend on."
> 出处：2608.28978 §Abstract｜Q2

> 原文:"Because our extractor is a single small model evaluated on one benchmark, these results characterise this extraction-based pipeline rather than graph-structured memory in general."
> 出处：2608.28978 §Abstract｜Q3

**B. 正结果：遗忘 / 剪枝那一半是有效的（本卡可复用的部分）**

> 原文:"The forgetting module is more successful. Applied once to a persistent 27,021-node graph, it removes 9.8% of nodes and 9.5% of stored bytes; token F1 is unchanged ($+0.001$, 95% CI $[-0.015,+0.016]$) and judged correctness falls by $1.6$ points, with the 95% interval bounding any loss at $3.8$ points ($[-0.038,+0.006]$)."
> 出处：2608.28978 §Abstract｜Q4

> 原文:"The proposed forgetting module contributes a retention mechanism whose cost we can bound: pruning the low-importance tail of a 27,021-node store removed 9.8% of nodes and 9.5% of bytes, and a paired bootstrap over 500 questions detects no significant change in any of the four metrics (Table 7)."
> 出处：2608.28978 §6 Conclusion｜Q5

> 原文:"Applying the forgetting mechanism removes 2,653 nodes (9.8%) and 2,560 edges (5.5%), reducing the graph size from 440.6 MB to 398.6 MB, a 9.5% reduction."
> 出处：2608.28978 §5 Discussion and Limitations / Table 2｜Q6

> 原文:"The reduction in LLM-judge accuracy, however, indicates that some pruned information can still contribute to correct answers, highlighting a trade-off between memory efficiency and information retention."
> 出处：2608.28978 §5 Discussion and Limitations｜Q7

**C. 失败模式与论文自设的范围限定（照抄不加工）**

> 原文:"Graph RAG also underperforms on knowledge-update questions (F1: 0.456 vs. 0.511). Inspection of failures indicates that the current conflict-resolution policy can retain an earlier attribute value instead of replacing it with a more recent value when no explicit confidence score is available."
> 出处：2608.28978 §5 Discussion and Limitations｜Q8

## 输入 / 输出契约

**输入**：用户跨会话的全部对话历史、商品互动与客服记录，HotpotQA 风格的上下文加干扰加任务训练对，以及用于强化学习记忆质量奖励的 ground-truth 记忆标注；数据要求高，训练集规模通常 5000 条以上。

**输出**：长期记忆、短期记忆与情景记忆条目及其检索结果，含随时间更新的属性（如宝宝月龄）与已删除的过期偏好，供业务 Agent 在后续会话中复用用户画像。

## 执行步骤

1. 汇总用户跨会话对话、商品互动与客服记录
2. 判定哪些信息写入长期记忆（过敏原、品牌偏好、月龄、满意度等）
3. 用过滤器剔除广告导流与闲聊等无关上下文
4. 对随时间变化的属性做更新、对过期偏好做删除
5. 按访问次数把高频短期记忆固化进长期记忆
6. 检索时联合短期、长期与情景记忆返回结果

## 边界与不做

- 何时不用：单次会话、无跨会话画像需求时不适用；输入侧要求高，缺少 HotpotQA 风格标注训练集时不应直接上强化学习版本。
- 能力边界：记忆操作由策略通过分步强化学习获得，落地需训练管道与模型评审；只产出记忆条目与检索结果，不改动业务系统。
- 合规边界：长期记忆涉及用户画像，须按最小必要收集并支持过期偏好删除，训练与评测数据须脱敏。

## 技能关联

- **前置**：Skill-Context-Compression.html、Skill-Context-Compression、Skill-Skill-Lifecycle-Design.html、Skill-Skill-Lifecycle-Design
- **延伸**：Skill-Active-Context-Pruning.html、Skill-Active-Context-Pruning、Skill-Long-Term-Preference-Memory.html、Skill-Long-Term-Preference-Memory、Skill-Memory-as-Action.html、Skill-Memory-as-Action
- **可组合**：Skill-LLM-Business-Intelligence-Reasoning.html、Skill-LLM-Business-Intelligence-Reasoning、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-Agentic-Memory-Management

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：16-智能体工程　·　源卡：`Skill-Agentic-Memory-Management`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（54 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Agentic-Memory-Management`（完整卡：`references/full-card.md`）。

- venue 档位：preprint

- 逐字引文：17 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Agentic-Memory-Management`（完整卡：`references/full-card.md`）。
>
> - venue 档位：preprint
>
> - 逐字引文：17 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Agentic-Memory-Management`（完整卡：`references/full-card.md`）。
> >
> > - venue 档位：preprint
> >
> > - 逐字引文：17 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Agentic-Memory-Management`（完整卡：`references/full-card.md`）。
> > >
> > > - venue 档位：preprint
> > >
> > > - 逐字引文：17 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Agentic-Memory-Management`（完整卡：`references/full-card.md`）。
> > > >
> > > > - venue 档位：preprint
> > > >
> > > > - 逐字引文：17 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2601.01885 — Agentic Memory: Learning Unified Long-Term and Short-Term Memory Management for Large Language Model Agents
> > > > > ⚠️ 该号被 2 张卡共用，最多只有一张能对。
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
