---
name: "p2s-dialogue-to-action-graph"
title: "Skill-Dialogue-to-Action-Graph"
description: "触发词：p2s-dialogue-to-action-graph。客服对话决策图"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-111"
l3_business: "售后处理"
l3_all: "售后处理 / 客诉分诊"
l1_l2_l3: "业务运营/服务与体验/售后处理"
quality_tier: "curated"
p2s_card_id: "Skill-Dialogue-to-Action-Graph"
p2s_src_domain: "07-NLP-VOC"
p2s_venue: "arXiv preprint (LG AI Research / University of Michigan)"
p2s_venue_tier: "preprint"
p2s_paper_id: "2312.04668"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Dialogue-to-Action-Graph"
rebase_vault_path: "paper2skills-vault/07-NLP-VOC/00-知识库-Skill卡片/Skill-Dialogue-to-Action-Graph.md"
rebase_source_sha256: "49a3c47362cb9457d62622f976b441725bf7ceb4f28914291923e02e8d36b6eb"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "49a3c47362cb9457d62622f976b441725bf7ceb4f28914291923e02e8d36b6eb"
rebase_full_card_bytes: "10989"
rebase_full_card_lines: "256"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "18"
rebase_evidence_quotes_total: "18"
rebase_evidence_quotes_complete: "true"
---
# Skill-Dialogue-to-Action-Graph

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Dialogue-to-Action-Graph`（完整卡：`references/full-card.md`，sha256 `49a3c47362cb9457d62622f976b441725bf7ceb4f28914291923e02e8d36b6eb`，10989 字节 / 256 行 / 18 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill Card: 客服对话决策图
# Dialogue-to-Action Graph

**论文来源**: TOD-Flow: Modeling the Structure of Task-Oriented Dialogues (arXiv:2312.04668, 2023)
**理论基础**: Subtask Graph + TOD-Flow Graph Learning + Graph-Conditioned Dialogue Modeling
**适用领域**: NLP-VOC / 客服对话分析 / 服务流程优化

---

## ① 算法原理

任务型对话系统（Task-Oriented Dialogue, TOD）的核心挑战：如何让模型理解"什么情况下该做什么、不该做什么"。

TOD-Flow 提出**从对话数据中自动推断对话流程图**（TOD-Flow Graph），定义三种关系约束对话动作空间：

1. **Can（可做）**：前置条件满足后，动作可被允许执行
   - 例：确认用户身份 `Can` → 修改订单地址

2. **Should（应做）**：动作发生后，推荐执行的后续动作
   - 例：用户反馈产品故障 `Should` → 引导故障排查

3. **Should Not（不应做）**：动作发生后，不应执行的后续动作
   - 例：用户要求升级投诉 `Should Not` → 继续推销产品

**数学直觉**：将对话建模为**图约束下的序列生成问题**。对于每个对话轮次，先从基础模型采样候选动作集合，再用 TOD-Flow Graph 做三层过滤——保留 `Should` 动作、移除 `Should Not` 动作、验证 `Can` 前置条件。三层过滤后的候选集显著缩小，同时提升透明度和可控性。

**图学习**：从 dialog-act 标注的对话数据中，通过混淆矩阵优化推断三种关系。假设动作 `a[n]` 的执行状态为布尔变量 `c[n]`，最大化：
- `J_can`：Can 条件满足时动作为真的概率
- `J_shd`：Should 条件满足时动作为真的概率
- `J_shdnt`：Should-Not 条件满足时动作为假的概率

---

## ② 母婴出海应用案例

### 案例 A：客服工单流程标准化

**场景**：Momcozy 客服团队处理大量重复性问题（改地址、退货、产品故障），流程不统一导致解决效率低。

**输入**：

**输出（决策动作图）**：

**业务价值**：
- 从 10,000+ 历史工单中自动挖掘标准处理流程
- 新客服培训时间从 2 周缩短至 3 天
- 识别"最优解决路径"，平均处理时长降低 30%

**数据需求**：
- 客服对话/工单文本（必须）
- 对话角色标注（User/Agent）
- 可选：VOC 标签作为节点分类辅助

### 案例 B：流失预警与干预

**场景**：识别哪些对话路径容易走向"升级投诉"或"流失"，提前干预。

**输入**：1000 条历史客服对话

**输出**：
- 走向 `ESCALATION` 的典型路径：用户问题 → 诊断（未解决）→ 用户再次追问 → 升级
- 走向 `RESOLUTION` 的典型路径：用户问题 → 诊断 → 解决方案 → 成交

**业务价值**：
- 在对话第 2 轮识别高风险路径，自动提醒资深客服介入
- 流失率降低 15-20%

---

（**换底正文在此截断** —— 完整卡正文共 256 行，本页内联到第 91 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 全 18 条 · 不截断）

> 原文:"The inferred TOD-Flow graph can be easily integrated with any dialogue model to improve its prediction performance, transparency, and controllability."
> 出处：2312.04668 Abstract

> 原文:"Our TOD-Flow graph learns what a model can, should, and should not predict, effectively reducing the search space and providing a rationale for the model’s prediction."
> 出处：2312.04668 Abstract

> 原文:"Our TOD-Flow graph captures the causal dependency between dialog acts in terms of can, should, and should not relationships."
> 出处：2312.04668 Figure 1 caption

> 原文:"First, we show that subtask graph can infer the relationship between dialog state and dialog acts without requiring any manual definition of nodes and edges in graphs."
> 出处：2312.04668 §1 Introduction

> 原文:"Second, in addition to the precondition (or can relationship), we present learning algorithms to model two novel relationships, should and should not, which provide more fine-grained control and improved prediction."
> 出处：2312.04668 §1 Introduction

> 原文:"For instance, a can relationship may represent that the system can make a payment only if the user confirms the payment."
> 出处：2312.04668 §1 Introduction

> 原文:"The should relationship may learn that if a user ask about the address of the hotel, the system should reply back."
> 出处：2312.04668 §1 Introduction

> 原文:"We use the graph to condition each candidate result, then select the best one using a selection method such as most number of actions in set, candidate with least graph violations, etc."
> 出处：2312.04668 §4.1 Graph-conditioned Dialog Policy

> 原文:"We can further improve the prediction performance if our baseline dialog model can be sampled multiple times with different results, as illustrated in Figure 2."
> 出处：2312.04668 §4.1 Graph-conditioned Dialog Policy

> 原文:"We empirically found that simply choosing the result with the most actions works best."
> 出处：2312.04668 §4.1 Graph-conditioned Dialog Policy

> 原文:"We used two standard TOD benchmarks."
> 出处：2312.04668 §5.1 Datasets

> 原文:"SGD covers a wide range of domains (i.e., different dialog acts and goals)."
> 出处：2312.04668 §5.1 Datasets

> 原文:"We use 24 domains in SGD, and did not use the schema for experiment."
> 出处：2312.04668 §5.1 Datasets

> 原文:"MultiWOZ (Budzianowski et al., 2020) has 10k humanhuman conversations on 14 domains."
> 出处：2312.04668 §5.1 Datasets

> 原文:"Overall, we observe that TOD-Flow consistently improves the prediction accuracy with a significant margin compared to other baselines BC and MSG2 on all base models and all dataset."
> 出处：2312.04668 §5.2 Results

> 原文:"Importantly, we have integrated these inferred graphs with a range of dialogue models, without necessitating retraining, resulting in a substantial enhancement in performance in both dialog act classification and end-toend response generation."
> 出处：2312.04668 §6 Conclusion

> 原文:"We also relied on action annotations from the datasets to infer graphs, which limits the applicability of our approach."
> 出处：2312.04668 Limitations

> 原文:"It would be interesting to extend our approach to unannotated raw dialogues."
> 出处：2312.04668 Limitations

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Dialogue-to-Action-Graph`（完整卡：`references/full-card.md`）。

- 论文：2312.04668
- 标题：TOD-Flow: Modeling the Structure of Task-Oriented Dialogues
- 发表处：arXiv preprint (LG AI Research / University of Michigan)
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：18 条，全部内联于上方「原文引用」段；一条不截断。
