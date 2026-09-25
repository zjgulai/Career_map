---
name: "p2s-text2sql-schema-linking"
title: "Schema-Linking感知Text2SQL — 列对齐与表联接推断"
description: "触发词：Schema对齐、列名映射、表联接推断、自助查数、查询准确率。何时不用：表结构简单、模型能直接读懂时用基础 Text-to-SQL；要跨结构化与非结构化库时用混合检索。安全边界：仅限只读查询内部业务库，涉及客户字段须脱敏，查询结果不得用于价格歧视等不当用途。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 指标契约"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-Text2SQL-Schema-Linking"
p2s_src_domain: "09-DataAgent-LLM"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把自然语言里的业务词对齐到正确的表和列、推断该联哪些表，让运营自己就能查对数。"
user_try: "试试：上周吸奶器在美国的退货率是多少，帮我联好 orders、returns、products 三表再回答。"
whenToUse: "属于「业务工具实现」：业务词与库表列名对不上、需要先做列对齐与联接推断时用；若表结构简单、模型能直接读懂，用基础 Text-to-SQL；若要跨结构化与非结构化库联合取数，用混合检索。"
workflow: "维护 Schema、外键关系与数据字典的中文映射 → 把问题中的业务实体对齐到具体表名与列名 → 推断需要联接的表并生成 SQL → 执行查询并核对结果与指标口径是否一致 → 把验证过的查询登记为样例，供后续复用"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Schema-Linking感知Text2SQL — 列对齐与表联接推断

## ① 解决的问题

数据运营面临"运营每日10-20个临时数据请求、数据分析师3小时/天疲于应付查数需求"——Schema-Linking感知Text2SQL将查询准确率从60%提升至85%，年化节省分析师人力20万元

## ② 核心算法逻辑

Text2SQL 的核心难点不是 SQL 语法，而是Schema Linking：将自然语言中的实体/概念正确对应到数据库表名和列名。错误的 Schema Linking 导致 SQL 逻辑正确但查询错表/错列。

## ③ 业务应用场景

场景A：运营自助查数（无需写 SQL） - 业务问题：运营提问"上周吸奶器在美国的退货率"，直接查 BI 需要 JOIN orders/returns/products 三表，非技术人员无从下手 - 数据要求：业务数据库 Schema（表结构 + 外键），数据字典（列名中文映射），历史 SQL 样例（≥20 条） - 预期产出：从自然语言直接生成正确 SQL，Schema Linking 准确率 >85%，节省人工 30 分钟/次 - 业务价值：运营每日查数需求 10-20 个，节省数据分析师约 3h/天，年化节省 20 万元
三轨验证： - 成本轨： - 数据字典维护：初期投入 2 人周（1 万元）+ 月度维护 0.5 人周（2500 元/月） - LLM API 调用：平均每次查询成本 0.02 元（GPT-4 Turbo），月均 500 次查询 = 300 元/月 - 向量数据库部署（可选）：初期 5000 元 + 月度维护 1000 元 - 总成本：初期 17000 元，月度运营成本 3800 元
- 合规轨：✅ 完全合规 - 数据范围：仅涉及内部业务数据库（订单、退货、商品、客户），无第三方数据 - 隐私保护：Schema Linking 不涉及个人隐私数据的暴露（仅操作列名），符合 GDPR - Amazon 政策：不违反 Amazon 数据使用政策，自有数据库查询属于正常业务操作 - 跨境贸易：查询结果用于内部决策，无涉及价格歧视或不正当竞争行为

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：运营自助查数节省数据分析师 3h/天，年化节省 20 万元；查询准确率提升减少错误决策
实施难度：⭐⭐⭐☆☆（需要维护数据字典和 Schema，外键关系完备是前提）
优先级：⭐⭐⭐⭐⭐
评估依据：母婴出海数据需求量大，运营 daily 需要大量临时查询，降低数据获取门槛是最高频需求之一

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（183 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Schema-Linking 感知 Text2SQL — 列对齐 + 表联接推断
"""
import re
from typing import Dict, List, Tuple
import math


# 模拟业务数据库 Schema
BUSINESS_SCHEMA = {
    "orders": {
        "columns": ["order_id", "asin", "market", "order_date", "quantity", "revenue", "customer_id"],
        "description": "订单表，记录每笔销售",
        "primary_key": "order_id",
        "foreign_keys": {"customer_id": "customers.customer_id", "asin": "products.asin"}
    },
    "returns": {
        "columns": ["return_id", "order_id", "asin", "return_date", "return_reason", "refund_amount"],
        "description": "退货表",
        "primary_key": "return_id",
        "foreign_keys": {"order_id": "orders.order_id", "asin": "products.asin"}
    },
    "products": {
        "columns": ["asin", "product_name", "category", "brand", "cost", "list_price"],
        "description": "商品主数据",
        "primary_key": "asin",
        "foreign_keys": {}
    },
    "customers": {
        "columns": ["customer_id", "country", "registration_date", "customer_tier"],
        "description": "客户信息",
        "primary_key": "customer_id",
        "foreign_keys": {}
    }
}

# 中文→英文列名映射（数据字典）
COLUMN_ALIAS_MAP = {
    "退货": ["return_id", "return_date", "return_reason"],
    "退货率": ["returns.return_id", "orders.order_id"],
    "订单": ["order_id", "order_date", "orders"],
    "吸奶器": ["product_name", "asin", "category"],
    "美国": ["market", "country"],
    "上周": ["order_date", "return_date"],
    "收入": ["revenue"],
    "品牌": ["brand"],
    "类目": ["category"],
    "退款": ["refund_amount"],
}


def tokenize_question(question: str) -> List[str]:
    """简单分词（中文字符 + 英文单词）"""
    tokens = re.findall(r'[\u4e00-\u9fff]+|[a-zA-Z_]+|\d+', question)
    return tokens


def compute_bm25_score(query_[REDACTED] column_name: str, description: str = "") -> float:
    """简化 BM25 相似度（基于字符重叠）"""
    # 检查直接映射
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2305.03111，但该号在 arXiv 上是《Can LLM Already Serve as A Database Interface? A BIg Bench for Large-Scale Database Grounded Text-to-SQLs》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：业务数据库 Schema（表结构与外键）、数据字典（列名中文映射）与历史 SQL 样例（卡页示例 ≥20 条）。

**输出**：正确 SQL 与查询结果：卡页示例把查询准确率从 60% 提升至 85%、Schema Linking 准确率高于 85%、每次节省人工 30 分钟，年化节省分析师人力 20 万元。

## 执行步骤

1. 维护 Schema、外键关系与数据字典的中文映射
2. 把问题中的业务实体对齐到具体表名与列名
3. 推断需要联接的表并生成 SQL
4. 执行查询并核对结果与指标口径是否一致
5. 把验证过的查询登记为样例，供后续复用

## 边界与不做

- 数据不满足时不用：外键关系不完整或数据字典缺失时列对齐会出错，应先补齐 Schema 与字典。
- 能力边界：本卡产出 SQL 与查询结果，不替代指标口径治理，也不承担数据仓库建模。
- 仅限只读查询内部业务库，涉及客户字段须脱敏，查询结果不得用于价格歧视等不当用途。

## 技能关联

- **前置**：Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Data-to-Dashboard-Multi-Agent-Visualization.html、Skill-Data-to-Dashboard-Multi-Agent-Visualization、Skill-LLM-Business-Intelligence-Reasoning.html、Skill-LLM-Business-Intelligence-Reasoning、Skill-NL2Dashboard-Automation.html、Skill-NL2Dashboard-Automation、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-RAG-Structured-Data-Fusion.html、Skill-RAG-Structured-Data-Fusion、Skill-SQL-Agent-Text-to-SQL.html、Skill-SQL-Agent-Text-to-SQL、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **延伸**：Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Data-to-Dashboard-Multi-Agent-Visualization.html、Skill-Data-to-Dashboard-Multi-Agent-Visualization、Skill-NL2Dashboard-Automation.html、Skill-NL2Dashboard-Automation、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-RAG-Structured-Data-Fusion.html、Skill-RAG-Structured-Data-Fusion、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **可组合**：Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Data-to-Dashboard-Multi-Agent-Visualization.html、Skill-Data-to-Dashboard-Multi-Agent-Visualization、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-RAG-Structured-Data-Fusion.html、Skill-RAG-Structured-Data-Fusion、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection、Skill-Text2SQL-Schema-Linking

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-Text2SQL-Schema-Linking`