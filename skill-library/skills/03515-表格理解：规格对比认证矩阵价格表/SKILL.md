---
name: "p2s-multimodal-table-understanding"
title: "Multimodal Table Understanding Agent — 表格理解：规格对比/认证矩阵/价格表"
description: "触发词：表格理解、规格对比、认证矩阵、价格表核对、截图录入。何时不用：表格能落成结构化表时用 SQL 查询更准；要跨多份文档抽条款时用分层检索。安全边界：表格识别结果不替代认证机构与平台的准入结论，认证真伪须回源核验。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 产品准入核对"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-Multimodal-Table-Understanding"
p2s_src_domain: "09-DataAgent-LLM"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "读懂商品规格、认证与价格表格，直接回答哪款含 HMO 且价格低于 50 美元这类筛选问题。"
user_try: "试试：读这 5 款婴儿奶粉的规格对比表，回答哪款含 HMO 且价格低于 50 美元每磅。"
whenToUse: "属于「业务工具实现」：数据以表格图片或混合排版文档形式存在、需要筛选聚合比较时用；若表格能落成结构化表，用 SQL 查询更准；若要跨多份文档抽条款，用分层检索技能。"
workflow: "把表格（截图或混合排版文本）解析为结构化单元格 → 按查询类型识别操作：过滤、聚合、行间比较 → 在结构化表上执行查询，取出命中的行与单元格 → 用表格上下文校验答案，避免错行错列 → 把结果整理成可读的对比结论并标注来源行"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Multimodal Table Understanding Agent — 表格理解：规格对比/认证矩阵/价格表

## ① 解决的问题

分析师面临表格截图难读——多模态表理解将录入错误率从12%降到3%，年化省8万元

## ② 核心算法逻辑

论文：TATQA: A Question Answering Benchmark on a Hybrid of Tabular and Textual Content | 年份：2021

## ③ 业务应用场景

业务背景：运营人员将 Amazon 上 5 款婴儿奶粉的规格对比表输入 Agent，回答业务问题。
| 品牌 | 阶段 | 含 HMO | 价格($/lb) | 有机认证 | 铁含量(mg) | DHA | 产地 | |------|------|-------|-----------|---------|-----------|-----|------| | Brand A | Stage 2 | 是 | 42.5 | 是 | 1.8 | 是 | 美国 | | Brand B | Stage 2 | 否 | 38.0 | 否 | 2.1 | 是 | 荷兰 | | Brand C | Stage 2 | 是 | 55.0 | 是 | 1.5 | 否 | 爱尔兰 | | Brand D | S
Agent 查询：`"哪款含 HMO 且价格 < $50/lb？"`

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（27 行）。**下面 27 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **27 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，27 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/data_agent_llm/multimodal_table_understanding` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/09-DataAgent-LLM/Skill-Multimodal-Table-Understanding.md`），已与卡面节选核对，不依赖上述路径。

```python
# 快速使用示例
from paper2skills_code.data_agent_llm.table_understanding import (
    Table,
    TableCell,
    TableQAAgent,
    build_formula_table,
)

# 构建婴儿奶粉规格对比表（5×8）
table = build_formula_table()

# 序列化为 Markdown
print(table.serialize_to_markdown())

# 过滤查询：含 HMO 且价格 < 50
agent = TableQAAgent(table)
result = agent.execute_query("filter", column="含HMO", op="eq", value="是")
print(f"含HMO品牌: {result}")

# 聚合查询：所有品牌平均价格
agg_result = agent.aggregate("价格($/lb)", func="avg")
print(f"平均价格: ${agg_result:.2f}")

# 比较查询：Brand A vs Brand D 的价格差
compare_result = agent.compare_rows("Brand A", "Brand D", column="价格($/lb)")
print(f"价格差: ${compare_result:.1f}")
print("[✓] Multimodal Table Understa 测试通过")
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2008.03371，但该号在 arXiv 上是《LotteryFL: Personalized and Communication-Efficient Federated Learning with Lottery Ticket Hypothesis on Non-IID Datasets》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《TATQA: A Question Answering Benchmark on a Hybrid of Tabular and Textual Content》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：表格图片或含表格的文档（卡页示例为 5 款婴儿奶粉的规格对比表：品牌、阶段、是否含 HMO、价格、有机认证、铁含量、DHA、产地）与自然语言查询。

**输出**：结构化查询结果与结论：命中行与单元格值、聚合结果（如均价）、行间差异（如两款价格差），可序列化为 Markdown 表格供业务人员复核。

## 执行步骤

1. 把表格图片或混合排版文本解析成结构化单元格
2. 识别查询意图：过滤、聚合还是行间比较
3. 在结构化表上执行查询，取出命中的行与单元格
4. 用表格上下文校验结果，避免错行错列
5. 把结果整理成可读的对比结论并标注来源行

## 边界与不做

- 数据不满足时不用：表格图像质量差、行列错位或缺表头时识别结果不可靠，应先取原始数据文件。
- 能力边界：本卡产出表格理解与查询结果，不替代认证机构与平台的准入结论；认证与合规字段的识别结果不构成合规证明，真伪须回源核验。

## 技能关联

- **前置**：Skill-DeepAnalyze-Autonomous-Data-Science-Agent.html、Skill-DeepAnalyze-Autonomous-Data-Science-Agent、Skill-SQL-Agent-Text-to-SQL.html、Skill-SQL-Agent-Text-to-SQL
- **延伸**：Skill-NL2Dashboard-Automation.html、Skill-NL2Dashboard-Automation、Skill-VLM-Ecommerce-Adaptation.html、Skill-VLM-Ecommerce-Adaptation
- **可组合**：Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-CausalRAG-Causal-Graph-Retrieval.html、Skill-CausalRAG-Causal-Graph-Retrieval、Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-Multimodal-Table-Understanding

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-Multimodal-Table-Understanding`