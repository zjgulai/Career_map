---
name: "p2s-hybrid-sql-vector-rag"
title: "Skill: Skill-Hybrid-SQL-Vector-RAG | 母婴跨境电商知识图谱"
description: "触发词：混合检索、结构化加语义、指标联合查询、财务与评论对账、双路召回。何时不用：问题只涉及数值统计时用 Text2SQL；只涉及文本语义时用普通 RAG。安全边界：财务与利润数据仅限内部只读查询，输出不得包含个人隐私字段，原始财务明细不得外发。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 数据管道"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-Hybrid-SQL-Vector-RAG"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "一次提问同时查库里的精确数字和评论里的语义理由，回答哪款推车利润最高又差评最少。"
user_try: "试试：48 小时内给我答案——哪款进口婴儿推车在欧洲站上季度 ROI 最高、且用户差评率低于 5%。"
whenToUse: "属于「业务工具实现」：一个问题里既有精确数值条件又有语义条件、需要两路联合取数时用；若问题纯数值，用 Text2SQL；若纯语义，用普通 RAG。"
workflow: "解析问题，把条件拆成数值型与语义型两类 → 对结构化库生成精确查询，对评论文本走向量检索 → 把两路结果按产品维度对齐融合 → 由生成模型汇总成结论与行动建议 → 输出结论时同时附数值依据与评论依据"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill: Skill-Hybrid-SQL-Vector-RAG | 母婴跨境电商知识图谱

## ① 解决的问题

数据分析师面临"结构化订单数据与语义评论数据割裂无法联合分析"——Hybrid SQL-Vector RAG将SQL精确查询与语义向量检索融合，联合查询覆盖率提升60%，跨模态分析响应时间降低70%

## ② 核心算法逻辑

Skill: SkillHybridSQLVectorRAG | 母婴跨境电商知识图谱

## ③ 业务应用场景

业务问题：运营需在48小时内判断「哪款进口婴儿推车在欧洲站点上季度ROI最高且用户差评率<5%」，以决定是否追加库存投入。
数据要求： - 结构化：财务DB（SKU_ID, 销售额, 成本, 退货率, 上季度利润） - 非结构化：评论库（产品ID, 评分, 评论文本、退货原因）、竞品分析文档
量化产出： - 精确输出：「推车型号X-2024，上季度利润€47,300，差评率3.2%，库存建议+500件」 - 执行时间：2.3秒（SQL查询0.8s + 向量检索0.9s + LLM生成0.6s） - 准确率：94%（vs 人工审核基准）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

（卡页此段未附代码。但语料 vault 的同一张卡里有代码：本技能已附 `references/implementation.py`（186 行）。⚠️ 本卡卡面无节选可作对照，该文件取的是最长代码围栏，**未经交叉核对**。）

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：结构化数据（卡页示例：财务 DB 含 SKU_ID、销售额、成本、退货率、上季度利润）与非结构化数据（评论库含产品 ID、评分、评论文本、退货原因，另有竞品分析文档）。

**输出**：联合查询结论与依据：卡页示例输出精确到型号的利润与差评率并给出库存建议（利润 47,300 欧元、差评率 3.2%、建议库存加 500 件），执行时间 2.3 秒、准确率 94%（以人工审核为基准）。

## 执行步骤

1. 解析问题，把条件拆成数值型与语义型两类
2. 对结构化库生成精确查询，对评论文本走向量检索
3. 把两路结果按产品维度对齐融合
4. 由生成模型汇总成结论与行动建议
5. 输出结论时同时附上数值依据与评论依据

## 边界与不做

- 数据不满足时不用：结构化库与文本库没有可对齐的主键时两路结果接不上，应先统一商品标识。
- 能力边界：本卡产出联合查询与结论，不含数据仓库建设与指标口径治理。
- 财务与利润数据仅限内部只读查询，输出不得包含个人隐私字段，原始财务明细不得外发。

## 技能关联

- **前置**：Skill-Knowledge-Graph-Construction、Skill-LLM-Prompt-Chain、Skill-Multi-Modal-RAG-Vision、Skill-Real-Time-Data-Sync、Skill-SQL-Agent-Text-to-SQL.html、Skill-SQL-Agent-Text-to-SQL、Skill-Semantic-Search-Optimization、Skill-Vector-Embedding-Encoder
- **可组合**：Skill-Hybrid-SQL-Vector-RAG

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：08-知识图谱　·　源卡：`Skill-Hybrid-SQL-Vector-RAG`