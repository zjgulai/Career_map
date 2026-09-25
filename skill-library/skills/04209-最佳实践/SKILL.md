---
name: "supabase-postgres-best-practices"
title: "Postgres 规范"
description: "Supabase 维护的 Postgres 规则库：索引与查询、连接管理、RLS 安全、schema 设计，附正误 SQL 对照。触发词：Postgres 规范、supabase-postgres-best-practices、Supabase 维护的 Postgres 规则库：索引与查询、连接管理、RLS 安全、schema 设计，附正误 SQL 对照。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# Supabase Postgres 最佳实践

由 Supabase 维护的 Postgres 综合性能优化指南，适用于任何地方运行的 Postgres。内含按影响程度排序的 8 类规则，用于指导自动化的查询优化与 schema 设计。

## 何时适用

在以下场合参考这些准则：
- 编写 SQL 查询或设计 schema
- 实施索引或做查询优化
- 排查数据库性能问题
- 配置连接池或做扩容
- 针对 Postgres 特有特性做优化
- 使用行级安全（RLS）

## 按优先级排列的规则类别

| 优先级 | 类别 | 影响 | 前缀 |
|----------|----------|--------|--------|
| 1 | 查询性能 | CRITICAL | `query-` |
| 2 | 连接管理 | CRITICAL | `conn-` |
| 3 | 安全与 RLS | CRITICAL | `security-` |
| 4 | Schema 设计 | HIGH | `schema-` |
| 5 | 并发与锁 | MEDIUM-HIGH | `lock-` |
| 6 | 数据访问模式 | MEDIUM | `data-` |
| 7 | 监控与诊断 | LOW-MEDIUM | `monitor-` |
| 8 | 高级特性 | LOW | `advanced-` |

## 如何使用

逐条阅读规则文件，获取详细解释与 SQL 示例：

```
references/query-missing-indexes.md
references/query-partial-indexes.md
references/_sections.md
```

每个规则文件包含：
- 简要说明它为什么重要
- 带解释的错误 SQL 示例
- 带解释的正确 SQL 示例
- 可选的 EXPLAIN 输出或指标
- 补充上下文与参考链接
- Supabase 特有的注意事项（适用时）

## 参考链接

- https://www.postgresql.org/docs/current/
- https://supabase.com/docs
- https://wiki.postgresql.org/wiki/Performance_Optimization
- https://supabase.com/docs/guides/database/overview
- https://supabase.com/docs/guides/auth/row-level-security
