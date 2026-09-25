---
name: "sql-optimization-patterns"
title: "SQL 查询优化"
description: "读 EXPLAIN 定位慢查询，用 B-Tree/GIN/覆盖索引消除全表扫描与 N+1，附 PostgreSQL 语句。触发词：SQL 查询优化、sql-optimization-patterns、读 EXPLAIN 定位慢查询，用 B-Tree/GIN/覆盖索引消除全表扫描与 N+1，附 PostgreSQL 语句。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# SQL 优化模式（SQL Optimization Patterns）

通过系统化的优化、正确的索引与查询计划分析，把缓慢的数据库查询变成极快的操作。

## 何时使用本技能

- 调试运行缓慢的查询
- 设计高性能的数据库表结构
- 优化应用响应时间
- 降低数据库负载与成本
- 在数据量增长时提升可扩展性
- 分析 EXPLAIN 查询计划
- 实施高效的索引
- 解决 N+1 查询问题

## 核心概念

### 1. 查询执行计划（EXPLAIN）

读懂 EXPLAIN 的输出是优化的基本功。

**PostgreSQL EXPLAIN：**

```sql
-- Basic explain
EXPLAIN SELECT * FROM users WHERE email = 'user@example.com';

-- With actual execution stats
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'user@example.com';

-- Verbose output with more details
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT u.*, o.order_total
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.created_at > NOW() - INTERVAL '30 days';
```

**要重点看的指标：**

- **Seq Scan**：全表扫描（在大表上通常很慢）
- **Index Scan**：走索引（好）
- **Index Only Scan**：只走索引、不回表（最好）
- **Nested Loop**：连接方式（小数据集上尚可）
- **Hash Join**：连接方式（较大数据集上表现好）
- **Merge Join**：连接方式（数据有序时表现好）
- **Cost**：估算的查询代价（越低越好）
- **Rows**：估算的返回行数
- **Actual Time**：真实执行时间

### 2. 索引策略

索引是最强大的优化工具。

**索引类型：**

- **B-Tree**：默认类型，适合等值与范围查询
- **Hash**：只用于等值（=）比较
- **GIN**：全文检索、数组查询、JSONB
- **GiST**：几何数据、全文检索
- **BRIN**：块范围索引（Block Range INdex），适合存在相关性的超大表

```sql
-- Standard B-Tree index
CREATE INDEX idx_users_email ON users(email);

-- Composite index (order matters!)
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Partial index (index subset of rows)
CREATE INDEX idx_active_users ON users(email)
WHERE status = 'active';

-- Expression index
CREATE INDEX idx_users_lower_email ON users(LOWER(email));

-- Covering index (include additional columns)
CREATE INDEX idx_users_email_covering ON users(email)
INCLUDE (name, created_at);

-- Full-text search index
CREATE INDEX idx_posts_search ON posts
USING GIN(to_tsvector('english', title || ' ' || body));

-- JSONB index
CREATE INDEX idx_metadata ON events USING GIN(metadata);
```

### 3. 查询优化模式

**避免 SELECT \*：**

```sql
-- Bad: Fetches unnecessary columns
SELECT * FROM users WHERE id = 123;

-- Good: Fetch only what you need
SELECT id, email, name FROM users WHERE id = 123;
```

**高效使用 WHERE 子句：**

```sql
-- Bad: Function prevents index usage
SELECT * FROM users WHERE LOWER(email) = 'user@example.com';

-- Good: Create functional index or use exact match
CREATE INDEX idx_users_email_lower ON users(LOWER(email));
-- Then:
SELECT * FROM users WHERE LOWER(email) = 'user@example.com';

-- Or store normalized data
SELECT * FROM users WHERE email = 'user@example.com';
```

**优化 JOIN：**

```sql
-- Bad: Cartesian product then filter
SELECT u.name, o.total
FROM users u, orders o
WHERE u.id = o.user_id AND u.created_at > '2024-01-01';

-- Good: Filter before join
SELECT u.name, o.total
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01';

-- Better: Filter both tables
SELECT u.name, o.total
FROM (SELECT * FROM users WHERE created_at > '2024-01-01') u
JOIN orders o ON u.id = o.user_id;
```

## 详细模式与完整示例

详细的模式文档在 `references/details.md`。上面的导航层不够用时，再读那个文件。

## 最佳实践

1. **有选择地建索引**：索引过多会拖慢写入
2. **监控查询性能**：使用慢查询日志
3. **保持统计信息更新**：定期运行 ANALYZE
4. **选用合适的数据类型**：类型越小性能越好
5. **谨慎地范式化**：在范式化与性能之间取平衡
6. **缓存高频访问的数据**：使用应用层缓存
7. **连接池**：复用数据库连接
8. **定期维护**：VACUUM、ANALYZE、重建索引

```sql
-- Update statistics
ANALYZE users;
ANALYZE VERBOSE orders;

-- Vacuum (PostgreSQL)
VACUUM ANALYZE users;
VACUUM FULL users;  -- Reclaim space (locks table)

-- Reindex
REINDEX INDEX idx_users_email;
REINDEX TABLE users;
```

## 常见坑

- **索引过多**：每个索引都会拖慢 INSERT/UPDATE/DELETE
- **未使用的索引**：占空间又拖慢写入
- **缺少索引**：查询慢、全表扫描
- **隐式类型转换**：导致用不上索引
- **OR 条件**：无法高效利用索引
- **前导通配符的 LIKE**：`LIKE '%abc'` 用不上索引
- **WHERE 里用函数**：除非存在函数索引，否则用不上索引

## 监控查询

```sql
-- Find slow queries (PostgreSQL)
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Find missing indexes (PostgreSQL)
SELECT
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    seq_tup_read / seq_scan AS avg_seq_tup_read
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 10;

-- Find unused indexes (PostgreSQL)
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
```
