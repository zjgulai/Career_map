---
name: TDDL同步接入
version: 1.0.0
description: TDDL/Sharding-MySQL to ODPS full pipeline. Extracts DDL, creates DI nodes (hf_once/hi/hf), deploys, backfills, and writes DingTalk docs.
description_zh: TDDL/Sharding-MySQL 数据源同步到 ODPS 全流程工具。覆盖 DDL 提取与转换、DI 同步节点创建（hf_once/hi/hf）、批量部署、补数据解冻重跑、钉钉文档整理。支持国内站（TDDL）和国际站（sharding_mysql）两种数据源。
user-invocable: true
argument-hint: 提供数据源类型、工作空间、表列表、业务流程目录等信息
---

# TDDL / Sharding-MySQL -> ODPS 同步管道搭建

> **前置依赖**：dw-bff-kits skill（必须先加载）、钉钉文档 MCP（Phase 5 用）
>
> **两种数据源模式**：本 skill 支持国内站（TDDL）和国际站（sharding_mysql）两种数据源。
> 主流程相同，差异点在各 Phase 中以 **「国际站差异」** 标注。

## 总体流程

```
Phase 1: DDL 提取 & 转换    -> 源表结构 -> ODPS 建表语句（⚠️ createTableByDDL 陷阱）
Phase 2: 创建节点 (N×3)     -> hf_once + hi + hf
Phase 3: 批量部署到生产     -> 每批 ≤10 个节点
Phase 4: 一次性补数据       -> 补数据 -> 解冻 -> 重跑
Phase 5: 钉钉文档整理       -> 按模板创建表格映射文档
```

> **⚠️ 执行安全规则（必须遵守）**
>
> 1. **每一步骤完成后必须人工确认**：Agent 完成每个 Phase（或 Phase 内的关键子步骤）后，必须暂停并等待用户确认再进入下一步。禁止跳步或连续执行多个 Phase。
> 2. **生产环境建表 DDL 必须由用户自己执行**：Agent 只负责生成 DDL 语句并输出给用户，**不得代替用户在生产环境执行 CREATE TABLE / DROP TABLE**。Agent 可以在开发环境验证 DDL 正确性，但生产环境的表结构变更必须由用户手动执行或确认执行。

## 输入参数

开始前需确认以下信息（不确定就问用户）：

| 参数 | 国内站示例 | 国际站示例 | 说明 |
|------|-----------|-----------|------|
| 数据源类型 | tddl | sharding_mysql | 决定 DI Reader 的 stepType |
| 数据源名称 | `_TDDL` | `aliyun_sub_intl` | 国内用内置 `_TDDL`，国际用自建数据源名 |
| TDDL App 名称 | ALIYUN_SUBSCRIPTION_APP | *(不需要)* | 仅 TDDL 模式需要 |
| 工作空间 | aliyun_marketing (27697) | 阿里云优惠团队国际站空间 (33599) | projectId |
| 表列表 | subscription_equity_instance, ... | 同左 | 需要同步的源表 |
| 业务流程目录 | subscription | subscription | 节点存放路径前缀 |
| 资源组 | group_75252227 | group_399652227 | DI 任务资源组 |
| 负责人 baseId | 394662 | 394662 | owner |
| 增量表(hi)生命周期 | 400 | 400 | 天数，需与用户确认 |
| 全量表(hf)生命周期 | 3650 | 3650 | 天数，需与用户确认 |
| 钉钉文档参考 | NZQYprEoWoxKPoqwCDn2dGNDV1waOeDk | 同左 | 已有的映射文档模板 |

## Phase 1: DDL 提取 & 转换

### 1.1 获取源表结构

通过 `getTableListPost` + `getTableColumnPost` 获取源表的列信息和主键。

**国内站（TDDL）**：数据源为 `_TDDL`（内置），查表时传 `appName` 参数。

```python
# 获取表列表
client.load("getTableListPost",
    projectId=PROJECT_ID, tenantId=1,
    datasourceName="_TDDL", resourceGroup=f"group_{PROJECT_ID}",
    envType=1, table=table_name,
    subType="inner", stepType="tddl", datasourceType="tddl",
    appName=APP_NAME, pageNum=1, pageSize=20)

# 获取列元数据
client.load("getTableColumnPost",
    projectId=PROJECT_ID, tenantId=1,
    envType=1, datasourceName="_TDDL",
    resourceGroup=f"group_{PROJECT_ID}",
    stepType="tddl", datasourceType="tddl",
    table=table_name, subType="inner",
    appName=app_name, guid=guid)
```

**国际站（sharding_mysql）**：数据源为用户自建（如 `aliyun_sub_intl`），无 appName。物理表名需加分片后缀 `_0000`。

```python
# 获取列元数据
client.load("getTableColumnPost",
    projectId=PROJECT_ID, tenantId=1,
    envType=1, datasourceName="aliyun_sub_intl",
    resourceGroup=f"group_{PROJECT_ID}",
    stepType="sharding_mysql", datasourceType="sharding_mysql",
    table="subscription_equity_value_0000",  # 物理分片表名
    subType="")
```

### 1.2 转换 ODPS DDL

每张源表生成 2 张 ODPS 表：

| 后缀 | 用途 | 分区 | 生命周期 |
|------|------|------|----------|
| `_hi` | 增量表（小时） | `ds STRING` | 由用户确认（默认 400） |
| `_hf` | 全量表（小时合并） | `ds STRING` | 由用户确认（默认 3650） |

命名规则：`s_{source_table}_{datasource_lower}_hi/hf`

类型映射和 DDL 模板见 [reference.md](reference.md#type-mapping)。

### 1.3 通过 createTableByDDL 建表

> **⚠️ 致命陷阱（实战踩坑）**
>
> `createTableByDDL` API 有两个**静默失败**的限制：
>
> 1. **不支持 `SET` 语句前缀**：传入 `SET odps.sql.decimal.odps2=true;\nCREATE TABLE...` 时，API 返回 code=200 但**表实际未创建**。DECIMAL 列无需 SET 前缀，`createTableByDDL` 本身支持 DECIMAL 类型。
>
> 2. **不支持 project 名前缀**：`CREATE TABLE project.table_name` 会报 `table name like project.table is not supported`。必须用纯表名 `CREATE TABLE table_name`。

```python
# ❌ 错误 — 静默失败，表不会被创建
ddl = "SET odps.sql.decimal.odps2=true;\nCREATE TABLE IF NOT EXISTS project.my_table (...)"

# ✅ 正确 — 无 SET 前缀、无 project 前缀
ddl = "CREATE TABLE IF NOT EXISTS my_table (...)"
```

> **🚫 生产环境建表必须由用户执行**：Agent 生成 DDL 后，将完整 DDL 语句输出给用户，由用户自行在生产环境执行 `createTableByDDL` 或通过 DataWorks 控制台建表。Agent 不得直接调用生产环境的建表/删表 API。

> **SET 前缀只在 ODPS SQL 查询（hf 合并节点、execute_sql.py）中需要**，`createTableByDDL` 建表时绝对不要加。

**建表后必须验证**：用 `SELECT * FROM project.table WHERE 1=0` 确认表确实存在且列数正确。曾出现建表"成功"但实际只有 3 列（畸形表）的情况，需 DROP 重建。

输出：`outputs/{DATASOURCE}_ODPS_DDL.sql`

## Phase 2: 创建节点

每张表创建 3 个节点。使用 `createNodeSimple` 创建 -> `UpdateNode` 设置 FlowSpec。

> **「国际站差异」** DI Reader 的 stepType 为 `sharding_mysql`（非 `tddl`），需要额外参数。详见 [reference.md](reference.md#di-sharding-mysql-reader)。

### 2.1 hf_once — 一次性全量 DI

| 属性 | 国内站 | 国际站 |
|------|--------|--------|
| 路径 | `{biz_flow}/数据集成/一次性补数据/{name}` | 同左 |
| 调度 | Daily, **recurrence=Pause** | 同左 |
| 并发 | 32 | 3（数据量较小） |
| bizdate | `$[yyyymmdd-1]` | 同左 |
| DI Writer partition | `ds=${bizdate}` | 同左 |
| DI where | 空（全量） | 同左 |
| DI Reader stepType | `tddl` | `sharding_mysql` |

### 2.2 hi — 小时增量 DI

| 属性 | 国内站 | 国际站 |
|------|--------|--------|
| 路径 | `{biz_flow}/数据集成/{DATASOURCE}/{name}` | 同左 |
| 调度 | 每小时 `00 10 00-23/1 * * ?` | 同左 |
| 并发 | 16 | 3 |
| bizdate | `$[yyyymmdd-1/24]` | 同左 |
| 自动重跑 | 5 次 / 120s 间隔 | 同左 |
| 依赖 | CrossCycleDependsOnSelf + {project}_root | 同左 |
| DI Writer partition | `ds=${bizdate}` | 同左 |
| DI where | `STR_TO_DATE('${bizdate}','%Y%m%d') <= gmt_modified AND gmt_modified < DATE_ADD(STR_TO_DATE('${bizdate}','%Y%m%d'), interval 1 day)` | 同左 |
| DI Reader stepType | `tddl` | `sharding_mysql` |

### 2.3 hf — 小时合并 ODPS SQL

| 属性 | 值 |
|------|-----|
| 路径 | `{biz_flow}/MaxCompute/{DATASOURCE}/{name}` |
| 调度 | 每小时 `00 00 00-23/1 * * ?` |
| today | `$[yyyymmdd-1/24]` |
| bizdate | `$[yyyymmdd-1-1/24]` |
| 自动重跑 | 5 次 / 60s 间隔 |
| autoParse | **true** |
| 依赖 | CrossCycleDependsOnSelf + CodeParse 依赖对应 hi 节点 |
| 含 DECIMAL | SQL 前加 `SET odps.sql.decimal.odps2 = true` |

合并 SQL 逻辑：全量 LEFT JOIN 增量排除已变更行 UNION ALL 增量新数据。模板见 [reference.md](reference.md#merge-sql)。

### 创建流程

```
1. createNodeSimple(command="DI"/"ODPS_SQL", name=path, content=...)  -> uuid
2. UpdateNode(uuid=uuid, spec=FlowSpec_JSON)  -> 设置调度/依赖/资源组
```

FlowSpec 完整模板见 [reference.md](reference.md#flowspec-templates)。

**分阶段执行**（避免一次创建太多）：先 hf_once -> 再 hi -> 最后 hf。

## Phase 3: 批量部署

使用 `deploy_node.py`，**每批 ≤10 个节点**：

```bash
# 分 3 批部署
deploy_node.py --project-id {PID} --uuid {uuid1..uuid8}   # hf_once
deploy_node.py --confirm && deploy_node.py --confirm-prod

deploy_node.py --project-id {PID} --uuid {uuid9..uuid16}  # hi
deploy_node.py --confirm && deploy_node.py --confirm-prod

deploy_node.py --project-id {PID} --uuid {uuid17..uuid24} # hf
deploy_node.py --confirm && deploy_node.py --confirm-prod
```

**已知问题**：
- 超过 10 个节点会报 `发布对象大小限制: 10`，必须分批
- DI 节点可能被「集团安全部数据合规检查器」阻塞，标记"可跳过"时 deploy_node.py 自动跳过
- ODPS SQL 节点通常不会被合规检查器阻塞

## Phase 4: 一次性补数据

目标：对 hf_once 节点补昨日分区，使全量数据落盘。

### 4.1 创建补数据

```python
body = {
    "env": "prod",
    "includeNodeIds": [task_id],
    "rootNodeId": task_id,
    "rootNodeProjectId": PROJECT_ID,
    "projectId": PROJECT_ID,
    "multipleTimePeriods": json.dumps([{
        "bizBeginTime": "YYYY-MM-DD",  # 昨日
        "bizEndTime": "YYYY-MM-DD",
    }]),
    "name": f"P_{node_name}_{timestamp}",
    "newAsync": True,
    "useMultipleTimePeriods": True,
    "isParallel": False, "order": "asc", "parallelGroup": 1,
}
api_call(client, "supplementAsync", **body)
```

### 4.2 解冻暂停实例

**关键踩坑**：hf_once 节点 recurrence=Pause，补数据实例会以暂停状态创建（status=5, "实例属性为暂停"）。

解冻 API 的参数必须用 **taskIds（列表）**，不是 instanceId：

```python
# 正确
requests.post(endpoint + "/workbench/enableInstance", json={
    "projectId": PROJECT_ID,
    "taskIds": [iid1, iid2, ...],  # 必须是列表！
    "env": "prod",
    "tenantId": 1
})

# 错误（返回"内部服务错误" code=1203110001）
{"instanceId": iid}   # 参数名错
{"taskId": iid}        # 不是列表
```

### 4.3 重跑

```python
requests.post(endpoint + "/workbench/rerunInstance", json={
    "projectId": PROJECT_ID,
    "taskIds": [iid1, iid2, ...],
    "env": "prod",
    "tenantId": 1
})
```

### 4.4 查询实例状态

通过 `getInstanceList`（dagType=3 对应补数据实例）轮询。实例 ID 字段是 **taskId**（不是 instanceId）。状态码：0=未运行, 4=运行中, 5=失败, 6=成功。

完整补数据流程：`supplementAsync -> 等待实例创建 -> enableInstance(taskIds=[...]) -> rerunInstance(taskIds=[...]) -> 轮询 getInstanceList 直到全部 status=6`

## Phase 5: 钉钉文档整理

参照已有文档格式（如 Credits 文档），使用钉钉文档 MCP 创建映射表：

```
1. get_document_content(参考文档 nodeId) -> 获取表格格式
2. create_document(name=数据源名, folderId=同一目录, markdown=表格内容)
```

表格结构：

| 列 | 内容 |
|----|------|
| rds 表名 | 源表名 |
| 表备注 | 中文描述 |
| odps 表名（国内） | `[s_xxx_hf](dw链接)` |
| odps 表名（国际） | 国际站表名（如有） |
| 中间层 | dwd 层表名（如有） |

dw 链接格式：`https://<INTERNAL_DOMAIN>/dmc/odps-table/odps.{project}.{table_name}/`

## 常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| **createTableByDDL 返回成功但表未创建** | DDL 字符串包含 `SET odps.sql.decimal.odps2=true;` 前缀 | **删除 SET 前缀**。createTableByDDL 本身支持 DECIMAL 类型，不需要 SET |
| **createTableByDDL 报 table name not supported** | CREATE TABLE 语句中带了 `project.table` 前缀 | 使用纯表名，不带 project 前缀 |
| **createTableByDDL 建出畸形表（列数不对）** | SET 前缀导致静默失败后残留测试表 | 用 `createQueryJob` 执行 DROP TABLE，再用 createTableByDDL 重建（无 SET） |
| **DI 节点报 `gmt_modified 不存在于列表`** | ODPS 目标表列数与 DI 配置不匹配（表只有 3 列） | DROP 畸形表 -> 重建完整 schema -> 重跑 |
| **国际站 DI 节点读不到分片数据** | Reader stepType 用了 `mysql` 而非 `sharding_mysql` | 改为 `stepType: "sharding_mysql"`，加 `parentShardingDatasource`、`selectTableMode: "pattern"`、`table: "xxx_[0-9]*"` |
| enableInstance 返回"内部服务错误" | 参数用了 instanceId 而非 taskIds 列表 | 改为 `taskIds: [id]` |
| 发布报"发布对象大小限制: 10" | 一次提交超 10 个节点 | 分批，每批 ≤10 |
| 补数据实例立即失败"实例属性为暂停" | 节点 recurrence=Pause | 先 enableInstance 解冻再 rerunInstance |
| DI 节点发布被合规检查器阻塞 | 集团安全部数据合规检查器 | 可跳过的检查器自动跳过 |
| getInstanceList 找不到实例 | dagType 不对 | 补数据用 dagType=3 |
| rerunInstance 参数异常 | 缺少 env 参数 | 加 `env: "prod"` |
| supplementAsync 报"补数据名称不能为空" | 请求体缺少 `name` 字段 | 加 `name: f"P_{task_id}_{timestamp}"` |
| supplementAsync 报"补数据根节点异常" | 缺少 `rootNodeProjectId` | 加 `rootNodeProjectId: PROJECT_ID` |
| 新发布节点无周期实例 | 节点在当天实例生成窗口后才发布 | 周期实例 T+1 生成，当天需手动补数据验证 |
| **DROP TABLE 执行在 dev 环境** | execute_sql.py 的 datasource-code 对应 DEV 连接 | 用 `createQueryJob` + `executorMode=SIMPLE_QUERY` + 对应的 prod datasourceCode，或确认 execute_sql 的 datasource 指向 prod |
