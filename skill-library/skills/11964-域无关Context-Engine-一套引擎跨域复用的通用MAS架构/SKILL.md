---
name: "p2s-domain-agnostic-context-engine"
title: "域无关Context Engine — 一套引擎跨域复用的通用MAS架构"
description: "触发词：跨域复用、一套引擎多业务、知识库驱动、配置化MAS、多团队协同。何时不用：只有一个业务域时用三层 MAS 骨架即可；各域数据结构差异过大无法配置化时，先做数据层治理。安全边界：无。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-Domain-Agnostic-Context-Engine"
p2s_src_domain: "10-MAS"
quality_tier: "preview"
user_summary: "把业务差异全部收进知识库与配置文件，让同一套引擎同时服务选品、合规、营销多个团队。"
user_try: "试试：把我们分散的三套 Agent 系统合并成一套靠知识库和配置驱动的引擎，并估算新增业务域的成本。"
whenToUse: "属于「业务工具实现」：同一套 Agent 能力要跨多个业务域复用时用；若只服务单一域、只需模块解耦，用 Context Engine 三层架构；若问题是知识库内容本身不对，先修知识库而不是改引擎。"
workflow: "盘点各业务域的差异点，区分哪些属于知识、哪些属于策略 → 把域差异下沉到知识库与配置文件，保持引擎核心代码零改动 → 为每个业务域编写配置并接入同一引擎实例 → 用同一引擎并行跑多域任务，检查各域结果互不污染 → 新增业务域时只补配置，度量新增成本"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 域无关Context Engine — 一套引擎跨域复用的通用MAS架构

## ① 解决的问题

每开拓一个新业务域就要重新开发一套MAS系统耗时2-4周——域无关Context Engine使新增业务域只需更新知识库和YAML配置文件（3人天vs30人天），节省90%开发成本

## ② 核心算法逻辑

问题：传统MAS为每个业务域单独开发Agent系统，导致维护成本爆炸（N个域=N套系统）。解决方案：将业务差异性完全封装在数据层（知识库）和配置层（策略），保持引擎核心代码零变化，实现"一套引擎，万般应用"。

## ③ 业务应用场景

业务问题： 某母婴品牌（纸尿裤品类）在亚马逊、Shopee、TikTok Shop三个平台同时运营，618大促前需要在48小时内完成： 1. 选品分析（供应链团队）：哪些SKU应该备货、备多少 2. 合规审查（法务团队）：产品声称是否符合各平台规则 3. 营销文案（市场团队）：为每个平台生成符合调性的listing
原始状态：三个团队各用一套AI系统，数据孤立，决策不协同，导致： - 选品推荐与合规要求冲突（推荐备货的产品因声称问题被下架） - 营销文案与选品数据不同步（文案中的库存承诺与实际备货不符） - 维护成本：3套系统 × 2人/套 = 6人月/年
具体数据规模： - 产品库：120个SKU（纸尿裤、湿巾、奶粉等） - 历史销量数据：24个月 × 3个平台 = 72份时间序列 - 合规规则库：450条规则（150条/平台） - 营销文案库：2000+条参考案例

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：一套引擎服务选品/合规/营销三域，开发成本降低 60%，年化节省工程投入约 35 万元
实施难度：⭐⭐⭐⭐☆（架构复杂，需良好的知识库管理体系）
优先级：⭐⭐⭐☆☆（中长期价值，适合 Agent 平台化阶段）

## ⑦ 代码节选

（卡页此段未附代码。但语料 vault 的同一张卡里有代码：本技能已附 `references/implementation.py`（12 行）。⚠️ 本卡卡面无节选可作对照，该文件取的是最长代码围栏，**未经交叉核对**。）

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：多业务域的差异化资产：产品库、历史销量时间序列、领域规则库与文案参考案例（卡页示例为 120 个 SKU、24 个月乘 3 平台销量、450 条合规规则、2000+ 条文案案例）。

**输出**：一套域无关引擎加各业务域配置（知识库与 YAML 策略），产出跨域任务结果（如选品建议、合规审查、平台文案）；卡页示例把新增业务域从 30 人天降到 3 人天。

## 执行步骤

1. 盘点各业务域的差异点，区分知识类与策略类差异
2. 把域差异下沉到知识库与配置文件，保持引擎核心零改动
3. 为每个业务域编写配置并接入同一引擎实例
4. 用同一引擎并行跑多域任务，检查结果互不污染
5. 新增业务域时只补配置，并度量新增成本

## 边界与不做

- 数据不满足时不用：各域数据没有统一底座、也没有人能持续维护知识库时，域无关引擎只会把混乱放大。
- 能力边界：本卡产出引擎架构与配置规范，不含各业务域知识库内容的生产与校验。

## 技能关联

- **前置**：Skill-AgentRouter-KG-Guided.html、Skill-AgentRouter-KG-Guided、Skill-AutoGen-Multi-Agent-Conversation.html、Skill-AutoGen-Multi-Agent-Conversation、Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator、Skill-ReAct-Reasoning-Acting.html、Skill-ReAct-Reasoning-Acting、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Ta[REDACTED].html、Skill-Ta[REDACTED]
- **延伸**：Skill-AgentRouter-KG-Guided.html、Skill-AgentRouter-KG-Guided、Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Ta[REDACTED].html、Skill-Ta[REDACTED]
- **可组合**：Skill-AgentRouter-KG-Guided.html、Skill-AgentRouter-KG-Guided、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Domain-Agnostic-Context-Engine

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：10-MAS　·　源卡：`Skill-Domain-Agnostic-Context-Engine`