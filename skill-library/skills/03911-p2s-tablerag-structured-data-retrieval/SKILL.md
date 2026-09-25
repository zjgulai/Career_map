---
name: "p2s-tablerag-structured-data-retrieval"
title: "Skill-TableRAG-Structured-Data-Retrieval"
description: "触发词：大表查询、超Token、双路索引、库存表筛选、结构化问答。何时不用：问题只涉及精确聚合且能直接连库时用 Text2SQL；表格只以截图存在时用表格理解。安全边界：无。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 数据管道"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-TableRAG-Structured-Data-Retrieval"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "面对几十万行的库存表，先按列和单元格定位相关行，只把少量数据喂给模型回答筛选问题。"
user_try: "试试：在 50 万行库存表里找出旺季前 30 天库存不足、且毛利率高于 30% 的纸尿裤产品。"
whenToUse: "属于「业务工具实现」：表太大无法整表喂给模型、又需要用业务语言筛选时用；若问题只涉及精确聚合且能直接连库，用 Text2SQL 更直接；若数据只有截图，用表格理解技能。"
workflow: "对目标表建立列级 Schema 索引与行级单元格索引 → 解析问题，定位相关列与行关键词 → 按索引只抽取少量相关行交给模型（卡页示例约 200 行） → 生成结构化答案并附上对应的 SQL 语句 → 按命中情况调整索引粒度，迭代提升准确率"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-TableRAG-Structured-Data-Retrieval

## ① 解决的问题

运营面临"50万行库存表超Token无法用LLM直接查询"——TableRAG双路检索将大表查询成功率从0%提升至95%，答案准确率+29%，人工筛选30分钟缩至15秒

## ② 核心算法逻辑

表格检索解决LLM处理大规模结构化数据（价格表/库存表/规格表）的核心挑战：Token限制与表格理解的双重瓶颈。

## ③ 业务应用场景

场景1：Amazon价格/库存大表查询 库存表：500,000行 × 50列（ASIN/价格/库存/FBA费/毛利率...）
用户查询："哪些婴儿纸尿裤产品在旺季前30天库存不足且毛利率>30%？"
TableRAG处理： 1. Schema检索：定位"库存天数""毛利率""品类"列 2. 单元格检索：找婴儿纸尿裤相关行 3. 精准注入：只提取~200行相关数据给LLM 4. 输出：结构化答案 + SQL查询语句

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

大表查询成功率：超Token报错100% → TableRAG成功率95%
答案准确率：全表截断法58% → TableRAG 87%（+29%）
查询响应时间：人工Excel筛选30分钟 → 自动化15秒
年化节省运营人力：约80万元（每日大量数据查询）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（237 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
TableRAG: 大规模表格的RAG检索与理解
母婴跨境电商场景实现
"""
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
import json

class TableRAGSystem:
    """
    TableRAG核心系统
    支持百万行级别的结构化数据检索
    """
    
    def __init__(self, embedding_fn=None, token_budget: int = 4000):
        self.embedding_fn = embedding_fn or self._default_embedding
        self.token_budget = token_budget
        self.schema_index = {}   # 列级索引
        self.cell_index = {}     # 行级索引
        self.tables = {}
    
    def index_table(self, table_name: str, df: pd.DataFrame) -> Dict:
        """
        对DataFrame建立双路索引
        
        Args:
            table_name: 表名
            df: 数据表
        Returns:
            索引统计
        """
        self.tables[table_name] = df
        
        # Schema索引：列级别
        schema_docs = []
        for col in df.columns:
            dtype = str(df[col].dtype)
            sample_vals = df[col].dropna().head(3).tolist()
            # 数值列统计
            stats = ""
            if df[col].dtype in [np.float64, np.int64]:
                stats = f"range:[{df[col].min():.2f},{df[col].max():.2f}]"
            
            schema_doc = {
                "table": table_name,
                "column": col,
                "dtype": dtype,
                "samples": str(sample_vals[:3]),
                "stats": stats,
                "text": f"表:{table_name} 列:{col} 类型:{dtype} 示例:{sample_vals[:2]} {stats}"
            }
            schema_docs.append(schema_doc)
        
        self.schema_index[table_name] = schema_docs
        
        # Cell索引：行级别（采样索引，避免全量）
        # 对大表进行分层采样
        sample_size = min(len(df), 10000)
        sample_df = df.sample(n=sample_size, random_state=42) if len(df) > sample_size else df
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：待查询的大表（卡页示例库存表 50 万行乘 50 列，含 ASIN、价格、库存、FBA 费、毛利率）与业务查询语句；卡页第 4 段未给字段级规格。

**输出**：结构化答案与 SQL：卡页示例把大表查询成功率从 0 提升至 95%、答案准确率从 58% 提升至 87%、查询响应从人工筛选 30 分钟缩短到 15 秒。

## 执行步骤

1. 对目标表建立列级 Schema 索引与行级单元格索引
2. 解析问题，定位相关列与行关键词
3. 按索引只抽取少量相关行交给模型（卡页示例约 200 行）
4. 生成结构化答案并附上对应的 SQL 语句
5. 按命中情况调整索引粒度，迭代提升准确率

## 边界与不做

- 数据不满足时不用：表结构频繁变化或缺少列级描述时索引会失效，应先稳定表结构并补字段说明。
- 能力边界：本卡产出大表检索与答疑能力，不含数据仓库建模与 ETL 管道建设。

## 技能关联

- **可组合**：Skill-TableRAG-Structured-Data-Retrieval

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：08-知识图谱　·　源卡：`Skill-TableRAG-Structured-Data-Retrieval`