---
name: "p2s-dual-rag-context-engine"
title: "双通道RAG上下文引擎 — 指令RAG与事实RAG协同的高保真信息检索架构"
description: "触发词：双通道 RAG、指令 RAG、事实 RAG、引用验证、SOP 遵从。何时不用：文档只有单一类型（纯规则或纯数据）时不必分通道；要检测已有回答里的事实错误走幻觉检测。安全边界：无法验证的声明须标记为未验证并触发人工审核，不得直接进入对外交付物。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-146"
l3_business: "知识溯源"
l3_all: "知识溯源"
l1_l2_l3: "数据与Agent平台/数据与AI运行/知识溯源"
p2s_card_id: "Skill-Dual-RAG-Context-Engine"
p2s_src_domain: "10-MAS"
quality_tier: "preview"
user_summary: "把操作规则和市场知识分成两路检索，别再让市场数据盖掉内部 SOP。"
user_try: "试试：把 SOP 和竞品报告分成两条检索通道，看指令遵从率能不能提上来。"
whenToUse: "同一个助手既要守操作规则又要用市场知识、两类内容互相干扰时用；只有一个来源类型时不必分通道。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 双通道RAG上下文引擎 — 指令RAG与事实RAG协同的高保真信息检索架构

## ① 解决的问题

单RAG系统将操作SOP和市场数据混为一谈导致指令遵从率只有71%——双通道RAG（指令RAG+事实RAG）将指令遵从率提升至96%，引用准确率从58%提升至89%

## ② 核心算法逻辑

核心洞察（Rothman双RAG架构）：传统RAG只有一条检索通道——查询→检索→生成。这在单Agent场景下够用，但在MAS中存在根本性缺陷：策略/指令类信息（"如何做"）和事实/知识类信息（"是什么"）的检索需求完全不同：

## ③ 业务应用场景

- 业务问题：某母婴卖家部署AI助手辅助运营决策，要求同时掌握：(1) 内部SOP（如何申报FBA、促销规则）和 (2) 市场知识（竞品数据、趋势报告）。单RAG系统频繁出现"用市场数据覆盖了操作SOP"的问题，导致错误决策 - 数据要求： - 指令库：100页内部SOP文档（FBA操作手册/促销规则/合规清单） - 知识库：市场报告、竞品数据、行业白皮书 - 双RAG解决方案： 1. 问题"如何申报FBA退货税？" → 指令RAG检索SOP → 精确操作步骤 2. 问题"吸奶器2025年市场趋势？" → 知识RAG检索报告 → 结构化分析 3. 问题"在旺季如何调整备货以符合合规要求？" →
场景B：多Agent研究助手（NASA风格严格引用）
- 业务问题：研究团队需要MAS自动生成有严格引用要求的行业报告，不允许任何无来源声明 - 双RAG机制：知识库存放来源文档；每次生成时实时验证引用ID是否存在于检索结果集中；无法验证的声明自动标记为[UNVERIFIED]并触发人工审核 - 预期产出：报告幻觉率从23%降至3%，可验证引用比例从45%提升至94%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：母婴出海合规+选品双RAG助手，引用准确率从58%→94%使运营团队验证时间减少60%；指令遵从率96%减少合规违规风险（每次FBA违规罚款约$500-$5000）；系统建设成本$5万，年化防损+效率提升>$20万，ROI≈400%
实施难度：⭐⭐⭐⭐☆（双库分离管理和优先级合并逻辑需要仔细设计；生产环境需要Pinecone等向量数据库支撑）
优先级：⭐⭐⭐⭐⭐（Rothman在书中Ch3就引入双RAG，作为整个Context Engine的核心信息摄入架构，是后续所有章节的基础）
适用规模：需要同时处理"操作规则"和"知识数据"的任何MAS系统
数据依赖：指令类文档（SOP/政策/规则）和知识类文档（报告/数据/文档）需要预先分类整理

## ⑦ 代码节选

（卡页此段未附代码。但语料 vault 的同一张卡里有代码：本技能已附 `references/implementation.py`（342 行）。⚠️ 本卡卡面无节选可作对照，该文件取的是最长代码围栏，**未经交叉核对**。）

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：预先分类整理的两类文档：指令类（SOP、政策、规则清单）与知识类（市场报告、竞品数据、行业白皮书）

**输出**：按问题类型路由的检索结果与合并后的上下文（含引用验证结果），供 Agent 生成有据可依的回答

## 执行步骤

1. 把文档预分类为指令库与知识库两路。
2. 按问题类型路由：操作性提问走指令通道，市场性提问走知识通道，混合提问做优先级合并。
3. 生成时实时验证引用 ID 是否存在于检索结果集中。
4. 把无法验证的声明标记为未验证并触发人工审核。

## 边界与不做

- 何时不用：文档只有单一类型（纯规则或纯数据）时，双通道只增加复杂度而无收益。
- 能力边界：只保证检索与引用可验证，不判断规则本身是否仍然有效。
- 安全边界：无法验证的声明须标记为未验证并触发人工审核，不得直接进入对外交付物。

## 技能关联

- **前置**：Skill-Agent-Memory-Learning.html、Skill-Agent-Memory-Learning、Skill-Context-Engine-Architecture.html、Skill-Context-Engine-Architecture、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Glass-Box-MAS-Observability.html、Skill-Glass-Box-MAS-Observability、Skill-High-Fidelity-RAG-Defense.html、Skill-High-Fidelity-RAG-Defense、Skill-MAS-Dynamic-KG-Collaboration.html、Skill-MAS-Dynamic-KG-Collaboration、Skill-SRL-Semantic-Blueprint-MAS.html、Skill-SRL-Semantic-Blueprint-MAS
- **延伸**：Skill-Context-Engine-Architecture.html、Skill-Context-Engine-Architecture、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Glass-Box-MAS-Observability.html、Skill-Glass-Box-MAS-Observability、Skill-High-Fidelity-RAG-Defense.html、Skill-High-Fidelity-RAG-Defense、Skill-MAS-Dynamic-KG-Collaboration.html、Skill-MAS-Dynamic-KG-Collaboration
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Glass-Box-MAS-Observability.html、Skill-Glass-Box-MAS-Observability、Skill-MAS-Dynamic-KG-Collaboration.html、Skill-MAS-Dynamic-KG-Collaboration、Skill-Dual-RAG-Context-Engine

---

> 分类：数据与Agent平台/数据与AI运行/知识溯源　·　技术族：10-MAS　·　源卡：`Skill-Dual-RAG-Context-Engine`