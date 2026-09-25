---
name: "p2s-live-catalog-conversational-rec"
title: "Skill-Live-Catalog-Conversational-Rec"
description: "触发词：p2s-live-catalog-conversational-rec。Skill-Live-Catalog-Conversational-Rec"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 主数据治理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
quality_tier: "curated"
p2s_card_id: "Skill-Live-Catalog-Conversational-Rec"
p2s_src_domain: "00-电商Agent"
p2s_venue: "RecSys 2026 (Demo)"
p2s_venue_tier: "preprint"
p2s_evidence_grade: "A"
p2s_paper_id: "2608.27006"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Live-Catalog-Conversational-Rec"
rebase_vault_path: "paper2skills-vault/00-电商Agent/Skill-Live-Catalog-Conversational-Rec.md"
rebase_source_sha256: "3d13395f2424d84da6ff7435f095d89129e57720f3e70ab7a76842b65e3c5aad"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "3d13395f2424d84da6ff7435f095d89129e57720f3e70ab7a76842b65e3c5aad"
rebase_full_card_bytes: "48668"
rebase_full_card_lines: "752"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "28"
rebase_evidence_quotes_total: "37"
rebase_evidence_quotes_complete: "false"
---
# Skill-Live-Catalog-Conversational-Rec

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Live-Catalog-Conversational-Rec`（完整卡：`references/full-card.md`，sha256 `3d13395f2424d84da6ff7435f095d89129e57720f3e70ab7a76842b65e3c5aad`，48668 字节 / 752 行 / 37 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 28 条（共 37 条）逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill Card: 活目录会话推荐（Conversational Recommendation over Live Catalogues）

**这是 `00-电商Agent` 域的第一张卡，也是一张「工程系统卡」而不是「算法卡」。**
论文交付的不是一个新模型，而是把「商品目录一直在变」当成系统一等公民的**索引同步机制**；
它的主张是「让会话推荐的目录新鲜度变成可运维的问题」，而不是「让推荐更准」。

> ⚠️ **读卡前必读（诚实边界声明）**
>
> 1. 本文是 **RecSys 2026 的 Demo 短文**（3 页；章节只有 Introduction / System Overview / Demonstration /
>    Concluding Remarks / Appendix A），**全文没有 Experiments 或 Evaluation 章节**。
> 2. 论文**没有做过任何推荐质量的量化评测**——离线相关性研究、真实用户研究都被列为 future work
>    （⑥ Q30）。所以本卡**不提供任何效果数字**（没有准确率、转化率、GMV、留存）。

（**换底正文在此截断** —— 完整卡正文共 752 行，本页内联到第 13 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 28 / 全 37 条 —— **其余 9 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 37 条逐字引文。本页按完整卡顺序内联**前 28 条整条引文**（不在引文中间断开）；其余 9 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文："Conversational recommender systems based on large language models (LLMs) are usually evaluated on static, pre-indexed item collections, yet e-commerce catalogues change continuously as products are added or removed, repriced, and restocked."
> 出处：2608.27006 §Abstract

> 原文："Most large language model (LLM)-based conversational recommender systems (CRSs) are evaluated over fixed benchmark collections (He et al., 2023; Jannach et al., 2021), but in production the catalogue is a live object, continually updated."
> 出处：2608.27006 §1 Introduction

> 原文："Re-indexing the whole catalogue on every change is wasteful, yet letting the index drift degrades recommendations and surfaces out-of-stock or discontinued items."
> 出处：2608.27006 §1 Introduction

> 原文："Our emphasis is orthogonal to model quality."
> 出处：2608.27006 §1 Introduction（点明本文的重点不在模型质量）

> 原文："We treat catalogue freshness—keeping the index consistent with a live assortment—as the engineering problem that makes such systems production-viable, complementing work on adapting LLM recommenders to refreshed indices (He et al., 2025)."
> 出处：2608.27006 §1 Introduction

### B. self-refreshing retriever 的定义与「只处理增量」

> 原文："Its central component is a self-refreshing retriever that ingests a merchant product feed, enriches the records, and synchronizes them into a vector index."
> 出处：2608.27006 §Abstract

> 原文："On each run, per-item hashes identify which products are new, changed, deleted, or unchanged, so only the delta is processed rather than rebuilding the whole catalogue."
> 出处：2608.27006 §Abstract

> 原文："We demonstrate a conversational shopping assistant built around one contribution: a self-refreshing retriever that re-embeds only new or semantically changed products, keeping synchronization proportional to the changed subset."
> 出处：2608.27006 §1 Introduction（本文唯一贡献的表述）

> 原文："Each manual or scheduled run compares the latest catalogue snapshot with the index and applies only the difference; it does not monitor the feed continuously."
> 出处：2608.27006 §2.1 Self-Refreshing Retriever（**触发方式**：手动/定时，不是流式监听）

> 原文："Our proof of concept uses ChromaDB through a swappable VectorStore interface."
> 出处：2608.27006 §2 System Overview（PoC 用 ChromaDB，藏在可替换的 VectorStore 接口后面）

### C. 三种标识的分工：stable ID / full hash / semantic hash

> 原文："A stable product ID links snapshots and drives exact updates and deletions, but cannot answer natural-language queries."
> 出处：2608.27006 §2.1 IDs, hashes, and embeddings

> 原文："A full hash detects any feed-field change; a semantic hash over name, description, brand, and category identifies changes requiring re-embedding."
> 出处：2608.27006 §2.1 IDs, hashes, and embeddings（三种哈希的分工，本卡 ① 段的核心）

> 原文："The resulting vectors make products retrievable; the generative LLM is only an enrichment fallback."
> 出处：2608.27006 §2.1 IDs, hashes, and embeddings（生成式 LLM 只做 enrichment 兜底）

### D. 五个变化类别与分流规则

> 原文："Comparing IDs and hashes yields five disjoint classes."
> 出处：2608.27006 §2.1 Change classes

> 原文："New and semantically changed records are enriched, embedded, and upserted; enrichment resolves category paths and extracts attributes by rule, with generative fallback."
> 出处：2608.27006 §2.1 Change classes（new + semantic-changed 才走 enrich/embed/upsert）

> 原文："Metadata-only changes, such as price or stock, retain the vector while updating the record and filters."
> 出处：2608.27006 §2.1 Change classes（metadata-only 保留向量——成本节省的来源）

> 原文："Deleted records are removed, and unchanged records are skipped."
> 出处：2608.27006 §2.1 Change classes

> 原文："New and semantically changed items are enriched, embedded, and upserted. Metadata-only changes update the stored record while keeping its vector. Deleted items are removed, and unchanged items are skipped."
> 出处：2608.27006 §Figure 2 图注（Engine architecture，与 §2.1 的分流规则一致）

### E. LLM 只做意图分类与偏好 elicitation（registry 出入的关键证据）

> 原文："A controller-based dialogue layer consumes this index, using an LLM only for intent classification and preference elicitation while retrieval, reranking, and diversity selection run as dedicated functions."
> 出处：2608.27006 §Abstract（**注意：原文是 intent classification AND preference elicitation 两件事**）

> 原文："calling a generative model only for intent and elicitation"
> 出处：2608.27006 §Figure 2 图注（Engine architecture）

> 原文："The conversation pipeline follows an orchestrator-as-controller pattern (Yao et al., 2023; Schick et al., 2023; Huang et al., 2025): a generative model classifies messages into eight intents, composes replies, and uses an elicitor sub-agent to ask one to three clarifying questions when preferences are vague (Shimazu, 2001; Sun and Zhang, 2018)."
> 出处：2608.27006 §2.2 Conversational Pipeline（orchestrator-as-controller；LLM 分类八类意图 + elicitor 子代理）

> 原文："Recommendation uses content-based semantic retrieval: query and product text share one embedding space, metadata filters restrict candidates, an optional non-generative model reranks them (Yang and Chen, 2024; Kemper et al., 2024), and a greedy selector adds brand and category variety."
> 出处：2608.27006 §2.2 Conversational Pipeline（检索 / 过滤 / 重排 / 多样性是专用函数，不是 LLM）

> 原文："This generation-free path keeps cost predictable, although embedding and reranking still call external models (Kolb et al., 2025); the pipeline detects the user’s language, retrieves in English, and replies in that language."
> 出处：2608.27006 §2.2 Conversational Pipeline（无生成路径；**检测用户语言、用英文检索、用用户语言回复**）

> 原文："The engine has three subsystems (Appendix A): a catalogue pipeline that ingests and indexes products, a conversation pipeline that handles multi-turn dialogue, and a storage layer, written by the former and read by the latter, providing vector search, user profiles, and session state. This shared storage decouples catalogue synchronization from dialogue, allowing each pipeline to run independently. All generative, embedding, and reranking calls use a single proxy, making model choices configuration rather than code."
> 出处：2608.27006 §2 System Overview（三个子系统 + 共享存储解耦；所有模型调用走单一代理）

### F. 演示形态：WhatsApp 购物助手

> 原文："Our demonstration is a WhatsApp shopping assistant in which catalogue changes reach the recommendations after the next successful sync."
> 出处：2608.27006 §Abstract（目录变化在**下一次成功同步后**才到达推荐）

> 原文："Users access the live demonstration on any smartphone through WhatsApp, with no application to install (Figure 1)."
> 出处：2608.27006 §3 Demonstration

> 原文："Sessions may be anonymous or personalised from prior purchases; the assistant elicits preferences, searches the live catalogue, and returns diverse in-stock products with links, and each successful sync exposes catalogue changes."
> 出处：2608.27006 §3 Demonstration

### G. Table 1：论文唯一的量化证据（**同步成本**，不是推荐质量）

> 原文："Incremental synchronization of an anonymized 500-record catalogue (medians over three or five runs; full rebuild: 2.914 s)."
> 出处：2608.27006 §3 Demonstration（Table 1 表注：匿名 500 条记录目录、三次或五次运行取中位数、全量重建 2.914 s）

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Live-Catalog-Conversational-Rec`（完整卡：`references/full-card.md`）。

- 论文：2608.27006
- 标题：Conversational Recommendation over Live E-Commerce Catalogues with Self-Refreshing Retrieval
- 发表处：RecSys 2026 (Demo)
- venue 档位：preprint
- 证据等级：A
- 关联卡：Skill-Diversity-Reranking-SMMR.md, Skill-Semantic-ID-Retrieval-RPG.md, Skill-Long-Term-Preference-Memory.md, Skill-Cold-Start-Meta-Learning-PAM.md, Skill-Agentic-Catalog-Enrichment.md

- 逐字引文：37 条，全部内联于上方「原文引用」段；一条不截断。
