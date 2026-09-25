---
name: "sql-queries"
title: "跨方言 SQL 查询"
description: "在 PostgreSQL、Snowflake、BigQuery、Redshift、Databricks 方言上写查询：函数对照、窗口函数、CTE 与漏斗留存模板。触发词：跨方言 SQL 查询、sql-queries、在 PostgreSQL、Snowflake、BigQuery、Redshift、Databricks 方言上写查询：函数对照、窗口函数、CTE 与漏斗留存模板。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# SQL 查询

在所有主流数据仓库方言上写出正确、高效、可读的 SQL。

## 各方言参考

### PostgreSQL（含 Aurora、RDS、Supabase、Neon）

**日期/时间：**
```sql
-- Current date/time
CURRENT_DATE, CURRENT_TIMESTAMP, NOW()

-- Date arithmetic
date_column + INTERVAL '7 days'
date_column - INTERVAL '1 month'

-- Truncate to period
DATE_TRUNC('month', created_at)

-- Extract parts
EXTRACT(YEAR FROM created_at)
EXTRACT(DOW FROM created_at)  -- 0=Sunday

-- Format
TO_CHAR(created_at, 'YYYY-MM-DD')
```

**字符串函数：**
```sql
-- Concatenation
first_name || ' ' || last_name
CONCAT(first_name, ' ', last_name)

-- Pattern matching
column ILIKE '%pattern%'  -- case-insensitive
column ~ '^regex_pattern$'  -- regex

-- String manipulation
LEFT(str, n), RIGHT(str, n)
SPLIT_PART(str, delimiter, position)
REGEXP_REPLACE(str, pattern, replacement)
```

**数组与 JSON：**
```sql
-- JSON access
data->>'key'  -- text
data->'nested'->'key'  -- json
data#>>'{path,to,key}'  -- nested text

-- Array operations
ARRAY_AGG(column)
ANY(array_column)
array_column @> ARRAY['value']
```

**性能提示：**
- 用 `EXPLAIN ANALYZE` 剖析查询
- 在频繁过滤/参与 join 的列上建索引
- 相关子查询用 `EXISTS` 而不是 `IN`
- 对常见过滤条件使用部分索引
- 并发访问时使用连接池

---

### Snowflake

**日期/时间：**
```sql
-- Current date/time
CURRENT_DATE(), CURRENT_TIMESTAMP(), SYSDATE()

-- Date arithmetic
DATEADD(day, 7, date_column)
DATEDIFF(day, start_date, end_date)

-- Truncate to period
DATE_TRUNC('month', created_at)

-- Extract parts
YEAR(created_at), MONTH(created_at), DAY(created_at)
DAYOFWEEK(created_at)

-- Format
TO_CHAR(created_at, 'YYYY-MM-DD')
```

**字符串函数：**
```sql
-- Case-insensitive by default (depends on collation)
column ILIKE '%pattern%'
REGEXP_LIKE(column, 'pattern')

-- Parse JSON
column:key::string  -- dot notation for VARIANT
PARSE_JSON('{"key": "value"}')
GET_PATH(variant_col, 'path.to.key')

-- Flatten arrays/objects
SELECT f.value FROM table, LATERAL FLATTEN(input => array_col) f
```

**半结构化数据：**
```sql
-- VARIANT type access
data:customer:name::STRING
data:items[0]:price::NUMBER

-- Flatten nested structures
SELECT
    t.id,
    item.value:name::STRING as item_name,
    item.value:qty::NUMBER as quantity
FROM my_table t,
LATERAL FLATTEN(input => t.data:items) item
```

**性能提示：**
- 大表用聚簇键（clustering key），不要用传统索引
- 在聚簇键列上过滤以触发分区裁剪
- 按查询复杂度设置合适的仓库规格
- 用 `RESULT_SCAN(LAST_QUERY_ID())` 避免重跑昂贵的查询
- staging/临时数据用 transient 表

---

### BigQuery（Google Cloud）

**日期/时间：**
```sql
-- Current date/time
CURRENT_DATE(), CURRENT_TIMESTAMP()

-- Date arithmetic
DATE_ADD(date_column, INTERVAL 7 DAY)
DATE_SUB(date_column, INTERVAL 1 MONTH)
DATE_DIFF(end_date, start_date, DAY)
TIMESTAMP_DIFF(end_ts, start_ts, HOUR)

-- Truncate to period
DATE_TRUNC(created_at, MONTH)
TIMESTAMP_TRUNC(created_at, HOUR)

-- Extract parts
EXTRACT(YEAR FROM created_at)
EXTRACT(DAYOFWEEK FROM created_at)  -- 1=Sunday

-- Format
FORMAT_DATE('%Y-%m-%d', date_column)
FORMAT_TIMESTAMP('%Y-%m-%d %H:%M:%S', ts_column)
```

**字符串函数：**
```sql
-- No ILIKE, use LOWER()
LOWER(column) LIKE '%pattern%'
REGEXP_CONTAINS(column, r'pattern')
REGEXP_EXTRACT(column, r'pattern')

-- String manipulation
SPLIT(str, delimiter)  -- returns ARRAY
ARRAY_TO_STRING(array, delimiter)
```

**数组与 struct：**
```sql
-- Array operations
ARRAY_AGG(column)
UNNEST(array_column)
ARRAY_LENGTH(array_column)
value IN UNNEST(array_column)

-- Struct access
struct_column.field_name
```

**性能提示：**
- 始终在分区列（通常是日期）上过滤，以减少扫描的字节数
- 对分区内频繁过滤的列使用聚簇
- 大规模基数估算用 `APPROX_COUNT_DISTINCT()`
- 避免 `SELECT *` —— 计费按扫描字节数算
- 参数化脚本用 `DECLARE` 和 `SET`
- 执行大查询前先用 dry run 预估查询成本

---

### Redshift（Amazon）

**日期/时间：**
```sql
-- Current date/time
CURRENT_DATE, GETDATE(), SYSDATE

-- Date arithmetic
DATEADD(day, 7, date_column)
DATEDIFF(day, start_date, end_date)

-- Truncate to period
DATE_TRUNC('month', created_at)

-- Extract parts
EXTRACT(YEAR FROM created_at)
DATE_PART('dow', created_at)
```

**字符串函数：**
```sql
-- Case-insensitive
column ILIKE '%pattern%'
REGEXP_INSTR(column, 'pattern') > 0

-- String manipulation
SPLIT_PART(str, delimiter, position)
LISTAGG(column, ', ') WITHIN GROUP (ORDER BY column)
```

**性能提示：**
- 为同址 join 设计分布键（DISTKEY）
- 对频繁过滤的列使用排序键（SORTKEY）
- 用 `EXPLAIN` 检查查询计划
- 避免跨节点数据搬运（留意 DS_BCAST 与 DS_DIST）
- 定期执行 `ANALYZE` 与 `VACUUM`
- 需要 schema 灵活性时用 late-binding view

---

### Databricks SQL

**日期/时间：**
```sql
-- Current date/time
CURRENT_DATE(), CURRENT_TIMESTAMP()

-- Date arithmetic
DATE_ADD(date_column, 7)
DATEDIFF(end_date, start_date)
ADD_MONTHS(date_column, 1)

-- Truncate to period
DATE_TRUNC('MONTH', created_at)
TRUNC(date_column, 'MM')

-- Extract parts
YEAR(created_at), MONTH(created_at)
DAYOFWEEK(created_at)
```

**Delta Lake 特性：**
```sql
-- Time travel
SELECT * FROM my_table TIMESTAMP AS OF '2024-01-15'
SELECT * FROM my_table VERSION AS OF 42

-- Describe history
DESCRIBE HISTORY my_table

-- Merge (upsert)
MERGE INTO target USING source
ON target.id = source.id
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *
```

**性能提示：**
- 用 Delta Lake 的 `OPTIMIZE` 与 `ZORDER` 提升查询性能
- 计算密集的查询借助 Photon 引擎
- 频繁访问的数据集用 `CACHE TABLE`
- 按低基数的日期列分区

---

## 常用 SQL 模式

### 窗口函数

```sql
-- Ranking
ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC)
RANK() OVER (PARTITION BY category ORDER BY revenue DESC)
DENSE_RANK() OVER (ORDER BY score DESC)

-- Running totals / moving averages
SUM(revenue) OVER (ORDER BY date_col ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as running_total
AVG(revenue) OVER (ORDER BY date_col ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as moving_avg_7d

-- Lag / Lead
LAG(value, 1) OVER (PARTITION BY entity ORDER BY date_col) as prev_value
LEAD(value, 1) OVER (PARTITION BY entity ORDER BY date_col) as next_value

-- First / Last value
FIRST_VALUE(status) OVER (PARTITION BY user_id ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)
LAST_VALUE(status) OVER (PARTITION BY user_id ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)

-- Percent of total
revenue / SUM(revenue) OVER () as pct_of_total
revenue / SUM(revenue) OVER (PARTITION BY category) as pct_of_category
```

### 用 CTE 提升可读性

```sql
WITH
-- Step 1: Define the base population
base_users AS (
    SELECT user_id, created_at, plan_type
    FROM users
    WHERE created_at >= DATE '2024-01-01'
      AND status = 'active'
),

-- Step 2: Calculate user-level metrics
user_metrics AS (
    SELECT
        u.user_id,
        u.plan_type,
        COUNT(DISTINCT e.session_id) as session_count,
        SUM(e.revenue) as total_revenue
    FROM base_users u
    LEFT JOIN events e ON u.user_id = e.user_id
    GROUP BY u.user_id, u.plan_type
),

-- Step 3: Aggregate to summary level
summary AS (
    SELECT
        plan_type,
        COUNT(*) as user_count,
        AVG(session_count) as avg_sessions,
        SUM(total_revenue) as total_revenue
    FROM user_metrics
    GROUP BY plan_type
)

SELECT * FROM summary ORDER BY total_revenue DESC;
```

### 同期群留存

```sql
WITH cohorts AS (
    SELECT
        user_id,
        DATE_TRUNC('month', first_activity_date) as cohort_month
    FROM users
),
activity AS (
    SELECT
        user_id,
        DATE_TRUNC('month', activity_date) as activity_month
    FROM user_activity
)
SELECT
    c.cohort_month,
    COUNT(DISTINCT c.user_id) as cohort_size,
    COUNT(DISTINCT CASE
        WHEN a.activity_month = c.cohort_month THEN a.user_id
    END) as month_0,
    COUNT(DISTINCT CASE
        WHEN a.activity_month = c.cohort_month + INTERVAL '1 month' THEN a.user_id
    END) as month_1,
    COUNT(DISTINCT CASE
        WHEN a.activity_month = c.cohort_month + INTERVAL '3 months' THEN a.user_id
    END) as month_3
FROM cohorts c
LEFT JOIN activity a ON c.user_id = a.user_id
GROUP BY c.cohort_month
ORDER BY c.cohort_month;
```

### 漏斗分析

```sql
WITH funnel AS (
    SELECT
        user_id,
        MAX(CASE WHEN event = 'page_view' THEN 1 ELSE 0 END) as step_1_view,
        MAX(CASE WHEN event = 'signup_start' THEN 1 ELSE 0 END) as step_2_start,
        MAX(CASE WHEN event = 'signup_complete' THEN 1 ELSE 0 END) as step_3_complete,
        MAX(CASE WHEN event = 'first_purchase' THEN 1 ELSE 0 END) as step_4_purchase
    FROM events
    WHERE event_date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY user_id
)
SELECT
    COUNT(*) as total_users,
    SUM(step_1_view) as viewed,
    SUM(step_2_start) as started_signup,
    SUM(step_3_complete) as completed_signup,
    SUM(step_4_purchase) as purchased,
    ROUND(100.0 * SUM(step_2_start) / NULLIF(SUM(step_1_view), 0), 1) as view_to_start_pct,
    ROUND(100.0 * SUM(step_3_complete) / NULLIF(SUM(step_2_start), 0), 1) as start_to_complete_pct,
    ROUND(100.0 * SUM(step_4_purchase) / NULLIF(SUM(step_3_complete), 0), 1) as complete_to_purchase_pct
FROM funnel;
```

### 去重

```sql
-- Keep the most recent record per key
WITH ranked AS (
    SELECT
        *,
        ROW_NUMBER() OVER (
            PARTITION BY entity_id
            ORDER BY updated_at DESC
        ) as rn
    FROM source_table
)
SELECT * FROM ranked WHERE rn = 1;
```

## 错误处理与调试

查询失败时：

1. **语法错误**：检查方言特有的语法（例如 BigQuery 没有 `ILIKE`，`SAFE_DIVIDE` 只有 BigQuery 有）
2. **找不到列**：对着 schema 核对列名——检查拼写、大小写敏感性（PostgreSQL 的带引号标识符区分大小写）
3. **类型不匹配**：比较不同类型时显式转换（`CAST(col AS DATE)`、`col::DATE`）
4. **除零**：用 `NULLIF(denominator, 0)` 或方言特有的安全除法
5. **列名歧义**：JOIN 中一律用表别名限定列名
6. **GROUP BY 错误**：所有非聚合列都必须出现在 GROUP BY 中（BigQuery 例外，它允许按别名分组）
