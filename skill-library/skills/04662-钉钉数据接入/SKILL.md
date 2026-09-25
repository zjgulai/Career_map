---
name: 钉钉数据接入
version: 1.0.0
description: Sync DingTalk spreadsheets and documents to ODPS. Covers reading, field mapping, DDL generation, DI node creation, and data validation.
description_zh: 将钉钉电子表格和文档数据同步到 ODPS（MaxCompute）。覆盖读取钉钉表格、字段映射、生成 ODPS 建表 DDL、创建 DI 同步节点、数据校验的完整流程。
user-invocable: true
argument-hint: 提供钉钉表格/文档链接，或描述需要同步的数据
---

# 钉钉数据接入

将钉钉电子表格和文档数据同步到 ODPS（MaxCompute）。覆盖从读取到同步的完整流程。

## 支持的数据源

| 来源 | 接入方式 | MCP |
|------|---------|-----|
| 钉钉电子表格 | 读取表格内容 -> CSV -> Tunnel 上传 | 钉钉表格 MCP |
| 钉钉文档（表格） | 读取文档表格块 -> CSV -> Tunnel 上传 | 钉钉文档 MCP |
| 钉钉 AI 表格 | 查询记录 -> CSV -> Tunnel 上传 | 钉钉 AI 表格 MCP |

## 执行流程

### Step 1: 读取钉钉数据

根据用户提供的链接或描述，使用对应 MCP 读取数据：

**钉钉电子表格**：
- 使用 `钉钉表格` MCP 的 `get_range` 或 `get_range_as_csv` 读取数据
- 获取表头行和数据行

**钉钉文档**：
- 使用 `钉钉文档` MCP 的 `get_document_content` 读取文档
- 定位表格块，提取表格数据

**钉钉 AI 表格**：
- 使用 `钉钉 AI 表格` MCP 的 `query_records` 查询记录
- 获取字段列表和数据

### Step 2: 数据探查

读取数据后，进行初步探查：

1. **字段识别**：
   - 自动识别数据类型（STRING、BIGINT、DOUBLE、DATETIME 等）
   - 识别特殊格式（日期、金额、百分比等）
   - 标记可疑字段（空值率高、格式不一致等）

2. **数据质量检查**：
   - 空值率统计
   - 重复行检测
   - 异常值标记

3. **向用户确认**：
   - 展示字段映射建议
   - 确认数据类型是否需要调整
   - 确认是否需要过滤/清洗

### Step 3: 生成 ODPS DDL

基于确认的字段映射，生成 ODPS 建表语句：

```sql
CREATE TABLE IF NOT EXISTS {project}.{table_name} (
    {field_name} {field_type} COMMENT '{comment}',
    ...
)
COMMENT '{table_comment}'
PARTITIONED BY (ds STRING COMMENT '业务日期')
LIFECYCLE {days};
```

**命名建议**：`dingtalk_{source_type}_{biz_name}`

### Step 4: 创建 DI 同步节点

创建 DataWorks DI 同步节点，将钉钉数据同步到 ODPS：

**方案 A：一次性导入**（数据量小、不频繁更新）
- 生成 CSV 文件
- 使用 Tunnel 命令上传
- 或直接通过 `execute_sql.py` 执行 INSERT

**方案 B：定期同步**（数据需定期更新）
- 创建 DI 节点
- 配置钉钉数据源（如已通过开放平台配置）
- 设置调度周期（日/周）

> **注意**：钉钉表格本身不是标准数据库，DI 直连可能需要通过中间服务。如环境不支持直连，采用方案 A（导出 CSV + Tunnel）。

### Step 5: 数据校验

同步完成后，进行数据校验：

1. **行数核对**：源表行数 vs ODPS 表行数
2. **抽样检查**：对比几条记录的关键字段
3. **统计校验**：数值字段的 SUM/AVG 是否一致

## 输出格式

```markdown
## 数据源

- 来源: {钉钉表格/文档/AI表格}
- 链接: {链接}
- 数据量: {X} 行 × {Y} 列

## 字段映射

| 源字段 | ODPS 字段 | 类型 | 备注 |
|--------|-----------|------|------|
| {源} | {目标} | {类型} | {备注} |

## 建表 DDL

```sql
{DDL}
```

## 同步配置

- 同步方式: {一次性/定期}
- 目标表: {project.table_name}
- 调度周期: {如定期同步}

## 校验结果

- 行数: 源 {X} / 目标 {Y} / 差异 {Z}
- 抽样: {通过/不通过}
```

## 字段类型映射参考

根据钉钉表格中的数据样例，按以下规则映射 ODPS 类型：

| 钉钉数据样例 | ODPS 类型 | 说明 |
|-------------|----------|------|
| 纯数字整数 | BIGINT | 整数类型，注意超过 2^63-1 用 STRING |
| 纯数字小数 | DOUBLE | 浮点数，金额类建议用 DECIMAL |
| 金额（如 ¥1,234.56）| DECIMAL(18,2) | 先清洗掉货币符号和千分位 |
| 日期（2024-01-01）| STRING 或 DATETIME | 如需计算用 DATETIME，否则 STRING |
| 日期时间 | DATETIME | 标准格式 |
| 是/否、Y/N | STRING | 不建议用 BOOLEAN（ODPS 布尔表达受限）|
| 混合内容 | STRING | 无法确定统一类型时用 STRING |
| JSON 字符串 | STRING | 如需要解析，在 SQL 中用 GET_JSON_OBJECT |

## 常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| 钉钉表格数据格式混乱 | 合并单元格、空行、特殊字符 | 清洗后重新读取 |
| 日期格式不统一 | 钉钉表格中日期显示格式多样 | 统一转为 STRING 或标准 DATETIME |
| 中文字段名 | ODPS 支持中文字段但不推荐 | 建议映射为英文字段名，中文放 COMMENT |
| 数据量超过 Tunnel 限制 | 单文件过大 | 分批上传或使用 `multiupload` |

## 与外部 Skill 的协作

- **dataworks**：SQL 执行、表查询、数据验证
- **dataworks-datastudio**：创建 DI 节点、配置工作流
- **dws / 钉钉 MCP**：读取钉钉表格/文档/AI表格数据
