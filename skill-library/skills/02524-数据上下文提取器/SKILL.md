---
name: "data-context-extractor"
title: "数据上下文提取"
description: "探查数仓 schema 并追问实体、指标口径与过滤约定，生成公司专属的数据分析技能包。触发词：数据上下文提取、data-context-extractor、探查数仓 schema 并追问实体、指标口径与过滤约定，生成公司专属的数据分析技能包。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# 数据上下文提取器

一个元技能：从分析师身上提取公司特有的数据知识，并生成量身定做的数据分析技能。

## 它如何工作

本技能有两种模式：

1. **引导模式（Bootstrap Mode）**：从零创建一个新的数据分析技能
2. **迭代模式（Iteration Mode）**：通过补充领域专属的参考文件，改进一个已有技能

---

## 引导模式

使用时机：用户想为自家的数据仓库创建一个新的数据上下文技能。

### 阶段 1：连接数据库并做探查

**第 1 步：确定数据库类型**

问："What data warehouse are you using?"

常见选项：
- **BigQuery**
- **Snowflake**
- **PostgreSQL/Redshift**
- **Databricks**

用 `~~data warehouse` 工具（查询与 schema 两类）来连接。如果判断不了，就看看当前会话里有哪些可用的 MCP 工具。

**第 2 步：探查 schema**

用 `~~data warehouse` 的 schema 工具去做：
1. 列出可用的 dataset/schema
2. 找出最重要的表（问用户："Which 3-5 tables do analysts query most often?"）
3. 拉取这些关键表的 schema 细节

按方言区分的探查查询示例：
```sql
-- BigQuery: List datasets
SELECT schema_name FROM INFORMATION_SCHEMA.SCHEMATA

-- BigQuery: List tables in a dataset
SELECT table_name FROM `project.dataset.INFORMATION_SCHEMA.TABLES`

-- Snowflake: List schemas
SHOW SCHEMAS IN DATABASE my_database

-- Snowflake: List tables
SHOW TABLES IN SCHEMA my_schema
```

### 阶段 2：核心问题（必须问到）

schema 探查完之后，用对话的方式问这些问题（不要一次全倒出来）：

**实体消歧（关键）**
> "When people here say 'user' or 'customer', what exactly do they mean? Are there different types?"

要听出：
- 是否存在多种实体类型（user 与 account 与 organization）
- 它们之间的关系（1:1、1:多、多:多）
- 是哪些 ID 字段把它们关联起来的

**主标识符**
> "What's the main identifier for a [customer/user/account]? Are there multiple IDs for the same entity?"

要听出：
- 主键与业务键的区别
- UUID 与整型 ID
- 遗留的 ID 体系

**关键指标**
> "What are the 2-3 metrics people ask about most? How is each one calculated?"

要听出：
- 精确公式（ARR = monthly_revenue × 12）
- 每个指标由哪些表/列供数
- 时间口径约定（近 7 天、自然月等）

**数据卫生**
> "What should ALWAYS be filtered out of queries? (test data, fraud, internal users, etc.)"

要听出：
- 必须始终带上的标准 WHERE 条件
- 标示需要排除的标记列（is_test、is_internal、is_fraud）
- 需要排除的具体取值（status = 'deleted'）

**常见坑**
> "What mistakes do new analysts typically make with this data?"

要听出：
- 容易混淆的列名
- 时区问题
- NULL 处理的怪癖
- 历史态表与当前态表

### 阶段 3：生成技能

按下面的结构创建技能：

```
[company]-data-analyst/
├── SKILL.md
└── references/
    ├── entities.md          # Entity definitions and relationships
    ├── metrics.md           # KPI calculations
    ├── tables/              # One file per domain
    │   ├── [domain1].md
    │   └── [domain2].md
    └── dashboards.json      # Optional: existing dashboards catalog
```

**SKILL.md 模板**：见 `references/skill-template.md`

**SQL 方言小节**：见 `references/sql-dialects.md`，并写入对应方言的说明。

**参考文件模板**：见 `references/domain-template.md`

### 阶段 4：打包交付

1. 在技能目录里创建全部文件
2. 打包成 zip 文件
3. 连同「已捕获了什么」的摘要一起呈交给用户

---

## 迭代模式

使用时机：用户已有技能，但还需要补充更多上下文。

### 第 1 步：加载已有技能

让用户上传现有技能（zip 或文件夹），如果它已经在会话里就直接定位到它。

读当前的 SKILL.md 与参考文件，弄清已经记录了什么。

### 第 2 步：定位缺口

问："What domain or topic needs more context? What queries are failing or producing wrong results?"

常见缺口：
- 一个新的数据域（marketing、finance、product 等）
- 缺失的指标定义
- 没有记录的表间关系
- 新的术语

### 第 3 步：定向探查

针对已识别的域：

1. **探查相关表**：用 `~~data warehouse` 的 schema 工具找出该域下的表
2. **问该域专属的问题**：
   - "What tables are used for [domain] analysis?"
   - "What are the key metrics for [domain]?"
   - "Any special filters or gotchas for [domain] data?"

3. **生成新的参考文件**：按领域模板创建 `references/[domain].md`

### 第 4 步：更新并重新打包

1. 加入新的参考文件
2. 更新 SKILL.md 的「Knowledge Base Navigation」小节，把新域纳入
3. 重新打包该技能
4. 把更新后的技能呈交给用户

---

## 参考文件的标准

每个参考文件都应包含：

### 表的文档
- **位置**：完整表路径
- **说明**：这张表装的是什么、什么时候用它
- **主键**：如何唯一定位一行
- **更新频率**：数据多久刷新一次
- **关键列**：一张含列名、类型、说明、备注的表
- **关系**：这张表如何与其它表 join
- **示例查询**：2-3 个常见查询模式

### 指标的文档
- **指标名**：便于人读的名称
- **定义**：用大白话解释
- **公式**：带列引用的精确计算式
- **来源表**：数据从哪里来
- **注意事项**：边界情况、排除项、坑点

### 实体的文档
- **实体名**：它被叫作什么
- **定义**：它在业务上代表什么
- **主表**：在哪里能找到这个实体
- **ID 字段**：如何识别它
- **关系**：它与其它实体如何关联
- **常用过滤条件**：标准排除项（internal、test 等）

---

## 质量检查清单

交付生成的技能之前，逐项确认：

- [ ] SKILL.md 的 frontmatter 完整（name、description）
- [ ] 实体消歧小节表述清楚
- [ ] 关键术语都已定义
- [ ] 标准过滤条件/排除项都有记录
- [ ] 每个域至少 2-3 个示例查询
- [ ] SQL 用的是正确的方言语法
- [ ] 参考文件都能从 SKILL.md 的导航小节链接到
