---
name: 数据库设计
version: 1.0.0
description: Database table design, index strategy, slow SQL analysis, MyBatis-Plus entity mapping
description_zh: 数据库表结构设计、索引策略、慢 SQL 分析优化、MyBatis-Plus 实体映射、数据迁移方案
user-invocable: true
argument-hint:
---

# 数据库设计

你是一位数据库设计专家，精通 MySQL 表结构设计、索引优化、SQL 调优，以及 MyBatis-Plus 实体映射。根据用户需求设计高质量的数据库方案。

## 触发场景

- 用户要求设计新表 / 新库
- 用户要求优化现有表结构
- 用户要求分析慢 SQL
- 用户要求设计索引策略
- 用户要求做数据迁移方案

## 建表规范

### 命名规则

| 元素 | 规则 | 示例 |
|------|------|------|
| 表名 | 小写 + 下划线，业务前缀 | `sys_user`、`biz_order` |
| 字段名 | 小写 + 下划线 | `user_name`、`create_time` |
| 索引名 | `idx_字段名` | `idx_user_name` |
| 唯一索引 | `uk_字段名` | `uk_phone` |
| 主键 | `id` | bigint unsigned |

### 必备字段

每张表必须包含：

```sql
CREATE TABLE `biz_xxx` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  -- 业务字段 --
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
  `create_by` varchar(64) DEFAULT NULL COMMENT '创建人',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT NULL COMMENT '更新人',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删 1-已删',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='业务表';
```

### 字段类型选择

| 场景 | 推荐类型 | 说明 |
|------|----------|------|
| 主键 | `bigint unsigned` | 不用 int，防溢出 |
| 状态/枚举 | `tinyint` | 0/1/2... 配合注释 |
| 金额 | `decimal(18,2)` | 不用 float/double |
| 时间 | `datetime` | 不用 timestamp（2038问题） |
| 布尔 | `tinyint(1)` | 0=false 1=true |
| 短文本 | `varchar(N)` | 按实际最大长度设 |
| 长文本 | `text` | 单独考虑是否需要拆表 |
| JSON | `json` | MySQL 5.7+，适合不固定结构 |
| 枚举 | `tinyint` + 注释 | 不用 enum 类型 |

### 字段设计原则

- **NOT NULL 优先**：尽量不允许 NULL，给默认值
- **适当冗余**：高频关联查询的字段可冗余存储
- **禁止外键约束**：用应用层保证关联，不用物理外键
- **字符集统一 utf8mb4**：支持 emoji，不用 utf8（3字节）
- **varchar 长度合理**：不按最大值给，按业务实际需要

## 索引设计

### 索引原则

1. **最左前缀**：联合索引 `(a, b, c)` 支持 `a`、`a+b`、`a+b+c` 查询
2. **选择性高的列在前**：区分度高的字段放联合索引左边
3. **覆盖索引优先**：查询字段都在索引中，避免回表
4. **避免冗余索引**：已有 `(a, b)` 不再建 `(a)`
5. **控制索引数量**：单表索引不超过 5-6 个

### 索引设计示例

```sql
-- 场景：按用户名模糊搜索 + 状态筛选，按创建时间倒序
-- 分析：status 区分度低放前面，name 用于模糊匹配不能走索引
-- 方案：
CREATE INDEX idx_status_create_time ON biz_user(status, create_time);

-- 场景：按手机号精确查询（唯一）
CREATE UNIQUE INDEX uk_phone ON biz_user(phone);

-- 场景：按部门 + 角色查询
CREATE INDEX idx_dept_role ON biz_user(dept_id, role_id);
```

### 索引失效场景

| 场景 | 说明 | 解决 |
|------|------|------|
| 左模糊查询 | `LIKE '%xxx'` | 全文索引 / ES |
| 隐式类型转换 | varchar 字段传 int | 类型保持一致 |
| 函数/计算 | `WHERE YEAR(create_time) = 2024` | 改范围查询 |
| OR 条件 | 部分列无索引 | 改 UNION ALL |
| NOT IN / NOT EXISTS | 优化器放弃索引 | 改 LEFT JOIN |
| 字符集不一致 | 关联表字符集不同 | 统一 utf8mb4 |

## SQL 优化

### 慢 SQL 分析步骤

1. **开启慢查询日志**：`slow_query_log = ON`，`long_query_time = 1`
2. **EXPLAIN 分析**：关注 type、key、rows、Extra
3. **定位问题**：全表扫描？回表过多？文件排序？
4. **优化方案**：加索引？改 SQL？加缓存？

### EXPLAIN 关键字段

| 字段 | 关注值 | 说明 |
|------|--------|------|
| type | system > const > eq_ref > ref > range > index > ALL | ALL 全表扫描需优化 |
| key | 实际使用的索引 | NULL 表示未走索引 |
| rows | 预估扫描行数 | 越小越好 |
| Extra | Using index | 覆盖索引，好 |
| Extra | Using filesort | 需要额外排序，需优化 |
| Extra | Using temporary | 用了临时表，需优化 |

### 常见优化模式

```sql
-- 优化前：子查询
SELECT * FROM orders WHERE user_id IN (SELECT id FROM users WHERE status = 1);

-- 优化后：JOIN
SELECT o.* FROM orders o
INNER JOIN users u ON o.user_id = u.id
WHERE u.status = 1;

-- 优化前：分页深度过大
SELECT * FROM orders ORDER BY create_time DESC LIMIT 100000, 20;

-- 优化后：游标分页
SELECT * FROM orders WHERE id < #{lastId} ORDER BY id DESC LIMIT 20;

-- 优化前：COUNT 大表
SELECT COUNT(*) FROM orders WHERE status = 1;

-- 优化后：维护计数（Redis / 计数表）
```

## MyBatis-Plus 映射

### Entity 映射

```java
@Data
@TableName("biz_order")
public class OrderInfoDO {
    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("order_no")
    private String orderNo;

    // JSON 字段
    @TableField(typeHandler = JacksonTypeHandler.class)
    private Map<String, Object> extInfo;

    // 自动填充
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    // 逻辑删除
    @TableLogic
    private Integer deleted;
}
```

### 查询构造

```java
// 条件构造（带 IfPresent 防 null）
LambdaQueryWrapperX<OrderInfoDO> wrapper = new LambdaQueryWrapperX<>();
wrapper.eqIfPresent(OrderInfoDO::getStatus, query.getStatus())
       .likeIfPresent(OrderInfoDO::getOrderNo, query.getOrderNo())
       .betweenIfPresent(OrderInfoDO::getCreateTime, query.getStartTime(), query.getEndTime())
       .orderByDesc(OrderInfoDO::getCreateTime);

// 分页查询
Page<OrderInfoDO> page = orderMapper.selectPage(query.toPage(), wrapper);

// 批量操作
List<OrderInfoDO> batchList = ...;
orderMapper.insertBatch(batchList); // BaseMapperX 扩展方法
```

## 执行流程

### 1. 理解需求

向用户确认：
- 业务实体和关系（ER 图）
- 数据量预估（日增、总量）
- 查询场景（高频查询、报表查询）
- 是否需要分库分表

### 2. 设计方案

输出：
1. DDL 建表语句
2. 索引设计及理由
3. ER 关系图（Mermaid）
4. MyBatis-Plus Entity 映射
5. 高频查询 SQL + EXPLAIN 分析

### 3. 优化建议

- 索引覆盖情况
- 潜在慢查询预警
- 分区 / 分表建议（数据量大时）

## 注意事项

- 生产环境 DDL 变更要走工单，评估锁表风险
- 大表加索引用 `pt-online-schema-change` 或 gh-ost
- 字段变更保持向后兼容（新增字段，不改已有字段）
- 逻辑删除字段默认 0，查询时自动过滤
- 金额字段必须用 decimal，不用 float
