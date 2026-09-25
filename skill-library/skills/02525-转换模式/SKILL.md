---
name: "dbt-transformation-patterns"
title: "dbt 数据转换"
description: "按 staging、intermediate、marts 分层组织 dbt 模型：命名约定、项目结构、数据质量测试与增量物化策略。触发词：dbt 数据转换、dbt-transformation-patterns、按 staging、intermediate、marts 分层组织 dbt 模型：命名约定、项目结构、数据质量测试与增量物化策略。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# dbt 转换模式

面向生产环境的 dbt（data build tool）模式，涵盖模型组织、测试策略、文档与增量处理。

## 何时使用本技能

- 用 dbt 构建数据转换管道
- 把模型组织成 staging、intermediate 与 marts 三层
- 实现数据质量测试
- 为大数据集创建增量模型
- 为数据模型与血缘（lineage）编写文档
- 搭建 dbt 项目结构

## 核心概念

### 1. 模型分层（Medallion 架构）

```
sources/          Raw data definitions
    ↓
staging/          1:1 with source, light cleaning
    ↓
intermediate/     Business logic, joins, aggregations
    ↓
marts/            Final analytics tables
```

### 2. 命名约定

| 分层 | 前缀 | 示例 |
| --- | --- | --- |
| Staging | `stg_` | `stg_stripe__payments` |
| Intermediate | `int_` | `int_payments_pivoted` |
| Marts | `dim_`、`fct_` | `dim_customers`、`fct_orders` |

## 快速开始

```yaml
# dbt_project.yml
name: "analytics"
version: "1.0.0"
profile: "analytics"

model-paths: ["models"]
analysis-paths: ["analyses"]
test-paths: ["tests"]
seed-paths: ["seeds"]
macro-paths: ["macros"]

vars:
  start_date: "2020-01-01"

models:
  analytics:
    staging:
      +materialized: view
      +schema: staging
    intermediate:
      +materialized: ephemeral
    marts:
      +materialized: table
      +schema: analytics
```

```
# Project structure
models/
├── staging/
│   ├── stripe/
│   │   ├── _stripe__sources.yml
│   │   ├── _stripe__models.yml
│   │   ├── stg_stripe__customers.sql
│   │   └── stg_stripe__payments.sql
│   └── shopify/
│       ├── _shopify__sources.yml
│       └── stg_shopify__orders.sql
├── intermediate/
│   └── finance/
│       └── int_payments_pivoted.sql
└── marts/
    ├── core/
    │   ├── _core__models.yml
    │   ├── dim_customers.sql
    │   └── fct_orders.sql
    └── finance/
        └── fct_revenue.sql
```

## 详细模式与完整示例

详细的模式文档在 `references/details.md` 中。上方的导航层级不够用时，读那个文件。

## 最佳实践

### 应当做

- **使用 staging 层** —— 数据只清洗一次，到处复用
- **大力测试** —— 非空、唯一、关系
- **什么都写文档** —— 列描述、模型描述
- **使用增量** —— 面向超过 100 万行的表
- **版本控制** —— dbt 项目放进 Git

### 不应当做

- **不要跳过 staging** —— 从原始表直连 mart 是技术债
- **不要硬编码日期** —— 用 `{{ var('start_date') }}`
- **不要重复逻辑** —— 抽成 macro
- **不要在生产环境测试** —— 用 dev target
- **不要忽略新鲜度** —— 监控源数据
