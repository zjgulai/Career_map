---
name: SQL性能优化
version: 1.0.0
description: Diagnose and optimize slow SQL and DI sync tasks. Covers DI sync tuning and ODPS SQL optimization with data-driven analysis.
description_zh: 诊断并优化慢 SQL 和 DI 同步任务。覆盖 DI 同步优化和 ODPS SQL 优化两个分支，基于实际数据分析给出调优方案。
user-invocable: true
argument-hint: 提供慢 SQL、节点名、或描述性能问题
---

# SQL 性能优化

诊断并优化 DataWorks 平台上的慢查询和同步任务。支持 DI 同步优化和 ODPS SQL 优化两大场景。

## 触发方式

用户通常以以下方式触发：
- "这个 SQL 太慢了"
- "帮我优化一下这段代码"
- "DI 同步任务跑了 X 小时"
- "基线任务在甘特图上耗时过长"
- "任务经常 OOM/超时"

## 分支判断

收到优化请求后，先判断任务类型：

| 类型 | 判断依据 | 优化路径 |
|------|---------|----------|
| **DI 同步任务** | 节点类型为 DI / 数据集成 / 离线同步 | [DI 同步优化](#di-同步优化) |
| **ODPS SQL 任务** | 节点类型为 ODPS_SQL / MaxCompute SQL | [ODPS SQL 优化](#odps-sql-优化) |
| **不确定** | 用户只给了节点名或 SQL 文本 | 先用 `identify.py` 查节点类型，再路由 |

## DI 同步任务优化

### 诊断流程

1. **获取任务详情**：
   ```bash
   python3 <dataworks-skill>/modules/task-ops/scripts/task_detail.py --node-id <nodeId> --project-id <pid>
   ```

2. **查看运行历史**：关注运行时长、数据量、失败原因

3. **分析 DI 配置**：使用 `list_sync_objects.py` 获取同步配置详情

### 优化维度

| 维度 | 优化手段 | 检查方法 |
|------|---------|----------|
| **切分键** | 选择均匀分布的切分键（主键/自增 ID），避免数据倾斜 | 查看源表切分键的分布 |
| **JVM 配置** | 调整 `-Xms` / `-Xmx` 参数 | 查看日志中的内存使用 |
| **索引** | 确保源表切分键上有索引 | 查询源表索引信息 |
| **并发数** | 根据源表分片和目标表分区调整并发 | 查看 DI 配置的 `channel` 数 |
| **资源组** | 切换到更空闲的 DI 资源组 | `list_resource_groups.py` |
| **querySql** | 自定义查询 SQL 应对数据倾斜 | 用 WHERE 条件过滤热点数据 |
| **批量大小** | 调整 `batchSize` 和 `batchByteSize` | 根据网络带宽和内存调整 |

### 输出格式

```markdown
## 任务概况

- 节点: {节点名} ({nodeId})
- 平均耗时: {X} 分钟
- 数据量: {X} 行 / {X} GB

## 瓶颈分析

{发现的瓶颈点}

## 优化建议

| 优化项 | 当前值 | 建议值 | 预期效果 |
|--------|--------|--------|----------|
| {项} | {当前} | {建议} | {效果} |

## 验证步骤

1. {修改配置}
2. {试跑验证}
3. {对比优化前后耗时}
```

## ODPS SQL 任务优化

### 诊断流程

1. **获取执行日志**：
   - 通过 dataworks skill 的 `task_detail.py` 查看最近实例
   - 获取 LogView 链接分析执行计划

2. **分析执行计划**（如果用户提供了 LogView）：
   - 查看 Stage 数量和依赖关系
   - 识别长尾任务（某些 instance 耗时明显长于其他）
   - 检查数据倾斜（某些 reducer 处理数据量远大于其他）

3. **SQL 代码审查**：
   - 检查是否有全表扫描（缺少分区过滤）
   - 检查 JOIN 条件是否合理
   - 检查是否有多层嵌套子查询
   - 检查是否有重复计算

### 优化维度

| 维度 | 优化手段 | 适用场景 |
|------|---------|----------|
| **MapJoin** | 小表放内存做 mapjoin：`/*+ mapjoin(b) */` | 大表 JOIN 小表 |
| **切分中间表** | 将复杂查询拆成多个临时表 | 多层嵌套、逻辑复杂 |
| **SkewJoin** | `/*+ skewjoin(a) */` 自动处理倾斜 | 数据倾斜明显 |
| **参数调优** | `set odps.sql.mapper.split.size = 256` | 控制 mapper 数量 |
| **分区裁剪** | 确保 WHERE 条件能裁剪分区 | 分区表查询 |
| **列裁剪** | 只 SELECT 需要的字段 | 宽表查询 |
| **谓词下推** | 将过滤条件尽量提前 | 多层 JOIN |
| **去重优化** | 用 `ROW_NUMBER()` 替代 `DISTINCT` | 大数据量去重 |

### 常见反模式

| 反模式 | 问题 | 修正 |
|--------|------|------|
| `SELECT *` | 读取无用字段，增加 IO | 只选需要的字段 |
| `IN (子查询)` | 大数据量时性能差 | 改用 `JOIN` 或 `EXISTS` |
| `OR` 条件 | 导致分区裁剪失效 | 拆成 `UNION ALL` |
| 多层嵌套子查询 | 执行计划复杂，难优化 | 拆成 CTE 或中间表 |
| `ORDER BY` 无 LIMIT | 全局排序耗资源 | 加 LIMIT 或改为窗口函数 |

### 输出格式

```markdown
## SQL 概况

- 节点: {节点名}
- 平均耗时: {X} 分钟
- 数据量: {输入表行数估算}

## 瓶颈分析

{发现的性能瓶颈}

## 优化方案

### 优化前
```sql
{原 SQL}
```

### 优化后
```sql
{优化后的 SQL}
```

## 优化点说明

1. {具体优化点及原因}
2. ...

## 验证建议

- 在开发环境执行对比
- 关注 LogView 中各 Stage 耗时变化
- 检查输出数据量是否一致
```

## 与外部 Skill 的协作

- **dataworks**：获取任务详情、运行日志、LogView
- **dataworks-datastudio**：修改节点代码、试跑验证、发布
- **odps-sql-optimizer**（如有）：数据驱动的自动优化建议
