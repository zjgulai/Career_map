---
name: "spark-optimization"
title: "Spark 优化"
description: "用分区、AQE、广播 join 与内存调参优化慢 Spark 作业，减少 shuffle 与数据倾斜。触发词：Spark 优化、spark-optimization、用分区、AQE、广播 join 与内存调参优化慢 Spark 作业，减少 shuffle 与数据倾斜。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# Spark 作业调优

面向生产环境的 Apache Spark 作业优化模式，涵盖分区策略、内存管理、shuffle 优化与性能调优。

## 何时使用本技能

- 优化运行缓慢的 Spark 作业
- 调整内存与 executor 配置
- 落地高效的分区策略
- 排查 Spark 性能问题
- 为大数据集扩展 Spark 管线
- 减少 shuffle 与数据倾斜

## 核心概念

### 1. Spark 执行模型

```
Driver Program
    ↓
Job (triggered by action)
    ↓
Stages (separated by shuffles)
    ↓
Tasks (one per partition)
```

### 2. 关键性能因素

| 因素              | 影响                  | 解法                          |
| ----------------- | --------------------- | ----------------------------- |
| **Shuffle**       | 网络 I/O、磁盘 I/O    | 尽量减少宽依赖变换            |
| **数据倾斜**      | 任务耗时不均          | 加盐（salting）、广播 join    |
| **序列化**        | CPU 开销              | 使用 Kryo、列式格式           |
| **内存**          | GC 压力、溢写（spill）| 调整 executor 内存            |
| **分区数**        | 并行度                | 把分区调到合适大小            |

## 快速开始

```python
from pyspark.sql import SparkSession
from pyspark.sql import functions as F

# Create optimized Spark session
spark = (SparkSession.builder
    .appName("OptimizedJob")
    .config("spark.sql.adaptive.enabled", "true")
    .config("spark.sql.adaptive.coalescePartitions.enabled", "true")
    .config("spark.sql.adaptive.skewJoin.enabled", "true")
    .config("spark.serializer", "org.apache.spark.serializer.KryoSerializer")
    .config("spark.sql.shuffle.partitions", "200")
    .getOrCreate())

# Read with optimized settings
df = (spark.read
    .format("parquet")
    .option("mergeSchema", "false")
    .load("s3://bucket/data/"))

# Efficient transformations
result = (df
    .filter(F.col("date") >= "2024-01-01")
    .select("id", "amount", "category")
    .groupBy("category")
    .agg(F.sum("amount").alias("total")))

result.write.mode("overwrite").parquet("s3://bucket/output/")
```

## 详细模式与完整示例

详细的模式文档在 `references/details.md`。当上面这一层导航不够用时，去读那个文件。

## 最佳实践

### 应当做

- **启用 AQE** —— 自适应查询执行能自动处理很多问题
- **使用 Parquet/Delta** —— 带压缩的列式格式
- **广播小表** —— 小表 join 避免 shuffle
- **盯住 Spark UI** —— 检查倾斜、溢写与 GC
- **把分区调到合适大小** —— 每个分区 128MB - 256MB

### 不应当做

- **不要 collect 大数据** —— 让数据保持分布式
- **不要无谓地使用 UDF** —— 优先用内置函数
- **不要过度缓存** —— 内存是有限的
- **不要忽视数据倾斜** —— 它主宰着作业耗时
- **不要用 `.count()` 判断是否存在** —— 用 `.take(1)` 或 `.isEmpty()`
