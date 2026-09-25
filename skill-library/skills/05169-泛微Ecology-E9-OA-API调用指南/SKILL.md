---
name: weaver-oa-api
description: 泛微Ecology E9 OA系统流程API和建模API调用指南。涵盖Workflow SOAP/HTTP/REST接口（创建流程、提交审批、退回、转发、查询待办/已办）、建模引擎ModeDateService SOAP接口（建模数据CRUD+分页查询）、JSP HTTP端点（ModeOperation/ModeDataOperation）、认证机制（IP白名单+userId、SSO Token、Session）。适用于需要与泛微OA系统集成的开发场景，包括外部系统对接、数据同步、流程自动化触发。
version: 1.0.0
---

# 泛微Ecology E9 OA API调用指南

## 系统架构概述

泛微E9提供三层API接口:

1. **SOAP Web Service (XFire)** — `/services/*`，适合Java/.NET等强类型客户端
2. **JSP HTTP端点** — 传统POST表单方式，适合简单集成
3. **Jersey REST API** — `/api/*`，现代REST风格，JSON交互

另有DWR(`/dwr/*`)和自定义REST(`/rest/*`)作为补充。

---

## 一、认证机制

### 1.1 SOAP服务认证 — IP白名单+userId

SOAP服务（WorkflowService/ModeDateService）不使用Token/密码，采用**IP白名单+用户ID映射**:

- 调用方IP必须在`workflow_userref`表中注册
- 每次调用传入`userId`参数，系统校验IP与userId的映射关系
- `workflow_userref`表结构: `name`(IP地址)、`usertype`(1=全部用户/2=分部/3=部门/4=指定用户)、`userids`

配置方式: OA后台 → 流程引擎 → 外部接口设置 → 添加IP和用户映射

### 1.2 REST API认证 — Session + SSO Token

`/api/*`路径的认证链:

- **Session认证**: 浏览器端通过登录获取Session，`SessionCloudFilter`校验
- **SSO Token**: 通过`/api/integration/simplesso/getToken`获取Token
- **OAuth2**: `com/api/integration/web/OAuth2Action`
- **白名单URL**: `/api/ec/dev/app/getCheckSystemInfo`、`/api/ec/dev/app/emjoin`免认证

### 1.3 JSP端点认证

- **RequestOutOperation.jsp**: 直接传`userid`+`logintype`参数（无需Session）
- **内部JSP**: 通过Session或`f_weaver_belongto_userid`/`f_weaver_belongto_usertype`头

---

## 二、流程API (Workflow API)

### 2.1 SOAP接口 — WorkflowService

**WSDL**: `http://{host}/services/WorkflowService?wsdl`
**XML变体**: `http://{host}/services/WorkflowServiceXml?wsdl`（返回XML字符串而非Java对象）

#### 创建流程

```
doCreateWorkflowRequest(WorkflowRequestInfo wri, int userId) → String(requestId)
```

**WorkflowRequestInfo结构**:
```
WorkflowRequestInfo:
  requestName: String          // 流程标题
  requestLevel: String         // "0"=普通 "1"=紧急 "2"=重要
  messageType: String          // 短信提醒类型
  creatorId: String            // 创建人ID
  isnextflow: String           // "0"=停留在当前节点, 其他=自动流转到下一节点
  secLevel: String             // 安全级别
  remark: String               // 签名意见
  workflowBaseInfo:
    workflowId: int            // 流程定义ID(关键!)
  workflowMainTableInfo:
    Property[]:                // 主表字段数组
      name: String             // 字段名(数据库列名, 如field123)
      value: String            // 字段值
      type: String             // 附件字段类型: "http"/"ftp"/"base64"/"file:", 多文件用|分隔
  workflowDetailTableInfos:
    DetailTable[]:             // 明细表数组
      id: String               // 明细表序号(从1开始)
      Row[]:                   // 行数组
        Cell[]:                // 单元格数组
          name: String         // 字段名
          value: String        // 值
          type: String         // 附件类型
```

#### 提交流程

```
submitWorkflowRequest(WorkflowRequestInfo wri, int requestid, int userId, String type, String remark)
→ String: "success" / "failed" / "error"
```

**type参数**:
- `"submit"` — 正常提交(流转到下一节点)
- `"subnoback"` — 提交且不可回退(neeback="0")
- `"subback"` — 提交且可回退(neeback="1")
- `"reject"` — 退回到上一节点

#### 查询类接口(统一分页模式)

所有查询接口共享分页参数: `pageNo`(页码,从1开始)、`pageSize`(每页条数)、`recordCount`(总记录数)、`userId`、`conditions[]`(SQL WHERE条件数组,如`"t1.workflowid=5"`)

| 方法 | 说明 |
|------|------|
| `getToDoWorkflowRequestList/Count` | 待办列表/计数 |
| `getDoingWorkflowRequestList/Count` | 在办(当前节点等待当前用户操作) |
| `getCCWorkflowRequestList/Count` | 抄送列表/计数 |
| `getHendledWorkflowRequestList/Count` | 已办列表/计数 |
| `getMyWorkflowRequestList/Count` | 我创建的请求 |
| `getBeRejectWorkflowRequestList/Count` | 被退回的请求 |
| `getForwardWorkflowRequestList/Count` | 转发请求 |
| `getProcessedWorkflowRequestList/Count` | 已归档请求 |
| `getToBeReadWorkflowRequestList/Count` | 待阅请求 |
| `getAllWorkflowRequestList/Count` | 所有可访问请求 |

*注: 带`4OS`后缀的变体包含OFS异构系统数据*

#### 详情查询

```
getWorkflowRequest(int requestid, int userId, int fromrequestid) → WorkflowRequestInfo
getWorkflowRequestLogs(String workflowId, String requestId, int userid, int pagesize, int endId) → WorkflowRequestLog[]
```

**WorkflowRequestLog结构**: `nodeName`、`nodeType`、`operator`、`operatorType`、`operateDate`、`operateTime`、`remark`、`action`

#### 转发

```
forwardWorkflowRequest(int requestid, String recipients, String remark, int userId, String clientip) → String
forward2WorkflowRequest(int requestid, String recipients, String remark, int userId, String forwardflag) → String
```

#### 其他操作

```
deleteRequest(int requestid, int userId) → boolean       // 删除请求
doForceOver(int requestid, int userId) → String           // 强制归档
givingOpinions(int requestid, int userid, String remark)  // 加签意见
writeWorkflowReadFlag(String requestid, String userid)    // 标记已阅
getUserId(String filedType, String filedValue) → String   // 根据字段查用户ID
getLeaveDays(fromDate, fromTime, toDate, toTime, resourceId) → String  // 请假天数
```

### 2.2 XML变体 — WorkflowServiceXml

所有复杂类型替换为XML字符串，适合非Java客户端:

```
doCreateWorkflowRequest(String xml, int userId) → String
submitWorkflowRequest(String xml, int requestid, int userId, String type, String remark) → String
getWorkflowRequest(...) → String (XML)
// 列表方法返回 String[]
```

### 2.3 JSP HTTP端点

#### 外部创建流程 — RequestOutOperation.jsp

**URL**: `POST /workflow/request/RequestOutOperation.jsp`

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `src` | String | 是 | 来源标识(非空) |
| `iscreate` | String | 否 | "1"表示新建 |
| `workflowid` | int | 是 | 流程定义ID |
| `formid` | int | 是 | 表单ID |
| `isbill` | int | 是 | 0=表单 1=单据 |
| `nodeid` | int | 是 | 当前节点ID |
| `nodetype` | String | 是 | 节点类型("0"=创建) |
| `userid` | int | 是 | OA用户ID |
| `logintype` | String | 是 | "1"=内部用户 "2"=客户 |
| `requestname` | String | 否 | 流程标题 |
| `requestlevel` | String | 否 | 优先级 |
| `remark` | String | 否 | 意见 |
| `field{id}` | String | 否 | 主表字段值 |
| `field{id}_{row}` | String | 否 | 明细表字段(行号) |
| `nodesnum` | int | 否 | 明细表行数 |

**响应**: 纯文本 `"0"`=成功, `"3"`=校验失败, `""`=流转失败

#### 字段名映射端点 — RequestOutDataFormatOperation.jsp

**URL**: `POST /workflow/request/RequestOutDataFormatOperation.jsp`

与上面类似但使用字段名而非ID: `field_{fieldname}` 代替 `field{id}`，内部自动转换为ID格式后转发给RequestOutOperation.jsp。

**限制**: 仅支持表单型流程(isbill=0)，不支持单据型。

#### 内部操作端点 — request_operation.jsp

**URL**: `/workflow/request/request_operation.jsp`

| src值 | 说明 |
|-------|------|
| `addrequest` | 新建请求 |
| `save` | 保存表单(不提交) |
| `reject` | 退回 |
| `approve` | 审批通过 |

### 2.4 简单查询SOAP — RequestBaseService

**WSDL**: `http://{host}/ws/RequestBaseService?wsdl`

简化版查询接口，返回`RequestBase[]`(含requestId/requestName/workflowId/creater/createTime/currentNodeId等):

```
getAllRequest()                                    // 所有请求
getRequestByWorkflowId(workflowId)                 // 按流程ID
getRequestByWorkflowIdandDate(workflowId, date)    // 按流程+日期(yyyy-MM-dd)
getRequestByDate(date)                             // 按日期
getAllEndRequest()                                 // 所有已归档
getEndRequestByWorkflowId(workflowId)              // 已归档按流程
getRequestByCreatorId(creatorId)                   // 我创建的
getPendingRequestByUserId(userId)                  // 用户待办
```

### 2.5 REST API — /api/workflow/*

Jersey REST接口在`com.api.workflow.web`包下有87+个Action类，主要:

- `NewRequestAction` — 新建流程
- `RequestListAction` — 流程列表
- `RequestFormNewAction` — 流程表单
- `RequestDeleteAction` — 删除流程
- `RequestForwardAction` — 转发
- `RequestFreeFlowAction` — 自由流程
- `RequestMonitorAction` — 流程监控
- `ProcessLogAction` — 流程日志
- `CustomQueryAction` — 自定义查询
- `BatchPrintAction` — 批量打印

---

## 三、建模API (Modeling/FormMode API)

### 3.1 SOAP接口 — ModeDateService

**WSDL**: `http://{host}/services/ModeDateService?wsdl`
**实现类**: `weaver.formmode.webservices.ModeDataServiceImpl`

#### 通用请求格式

```
POST /services/ModeDateService
Content-Type: application/x-www-form-urlencoded; charset=utf-8
Body: key=datajson&value={jsonString}
```

**Header参数(JSON内)**:
```json
{
  "Header": {
    "systemid": "系统标识",
    "currentDateTime": "时间戳",
    "Md5": "MD5认证哈希",
    "feedbackLanguage": "zh_CN"
  },
  "OperationInfo": {
    "operator": "操作人userId",
    "operationDate": "操作日期",
    "operationTime": "操作时间"
  }
}
```

**响应格式**: JSON `{"status": "success/fail", "datajson": {...}}`

#### 数据操作

**SaveOrUpdateModeData** — 创建或更新建模数据:
```json
{
  "Header": {...},
  "OperationInfo": {...},
  "modeId": "建模ID",
  "data": {
    "主表字段名": "值",
    "明细表": [
      {"字段1": "值1", "字段2": "值2"}
    ]
  }
}
```

**GetModeDataByPK** — 按主键查询:
```json
{
  "Header": {...},
  "modeId": "建模ID",
  "pkValue": "主键值",
  "returnFields": ["field1", "field2"]
}
```

**DeleteModeDataByPK** — 按主键删除:
```json
{
  "Header": {...},
  "modeId": "建模ID",
  "pkValue": "主键值"
}
```

**GetModeDataPageList** — 分页查询:
```json
{
  "Header": {...},
  "modeId": "建模ID",
  "pageInfo": {
    "pageNo": 1,
    "pageSize": 20
  },
  "conditions": [...]
}
```

**GetModeDataPageCount** — 获取总条数:
```json
{
  "Header": {...},
  "modeId": "建模ID",
  "conditions": [...]
}
```

### 3.2 JSP HTTP端点

#### 建模模块CRUD — ModeOperation.jsp

**URL**: `POST /formmode/setup/ModeOperation.jsp`
**权限**: `ModeSetting:All`

| operate参数 | 说明 | 关键参数 |
|-------------|------|----------|
| `AddMode` | 新建建模 | modeName, formId, typeId, maincategory, subcategory, seccategory |
| `EditMode` | 编辑建模 | modeId + 同AddMode参数 |
| `deleteMode` | 停用建模(软删) | modeId → 设isenable=0 |
| `DefaultValue` | 设默认值 | modeId, formId, fieldid, customerValue |
| `linkageattr` | 联动属性保存 | modeId + 联动配置参数 |

#### 建模数据CRUD — ModeDataOperation.jsp

**URL**: `POST /formmode/data/ModeDataOperation.jsp`(multipart)

| src参数 | type参数 | 权限 | 说明 |
|---------|----------|------|------|
| `submit` | 1 | 创建权(type=1) | 新建数据记录 |
| `save` | 2 | 编辑权(sharelevel>1) | 保存编辑 |
| `del` | — | 完全控制(sharelevel=3) | 删除记录 |

**关键参数**: `formmodeid`(建模ID)、`formid`(表单ID)、`billid`(数据记录主键)、`iscreate`("1"新建)

**保存后自动处理**:
1. 编码生成: `CodeBuild.getModeCodeStr()`
2. 默认共享: `ModeRightInfo.editModeDataShare()`
3. DML接口触发: `ModeDataManager.doInterface()`
4. 操作日志: `ModeViewLog.setSysLogInfo()`

#### 布局操作 — LayoutOperation.jsp

**URL**: `POST /formmode/setup/LayoutOperation.jsp`(multipart)

| operation参数 | 说明 |
|---------------|------|
| `saveHtmlMode` | 保存HTML布局(Id, formId, modeId, type, opentype) |
| `EditModesHtml` | 编辑建模HTML |
| `batchHtmlField` | 批量HTML字段 |
| `preppm` | 创建默认布局 |

#### 权限管理 — ModeRightOperation.jsp

**URL**: `POST /formmode/setup/ModeRightOperation.jsp`

| method参数 | 说明 |
|------------|------|
| `addNew` | 添加权限规则 |
| `delete` | 删除权限(by IDs) |
| `deleteDataRight` | 删除权限+数据权限 |
| `saveForCreator` | 创建人默认共享配置(1=创建人/2=直属上级/3=分部/4=部门/5=所有上级/6=岗位) |
| `addShare` | 单条数据共享 |
| `resetModeShare` | 重建建模权限(异步) |

**权限级别**: 0=无权限, 1=查看, 2=编辑(可共享), 3=完全控制(可删除)

**权限详情编码**(txtShareDetail下划线分隔): sharetype_relatedids_rolelevel_showlevel_righttype_..._layoutid_higherlevel_...

#### 数据共享 — ModeShareOperation.jsp

**URL**: `POST /formmode/view/ModeShareOperation.jsp`

| method参数 | 说明 |
|------------|------|
| `delShare` | 删除共享 |
| `addShare` | 添加单条共享(sharetype/relatedid/rolelevel/showlevel/righttype) |
| `addShareMore` | 批量共享(多billid) |

### 3.3 建模与其他模块集成

#### 流程→建模 (WorkflowToMode)

**URL**: `POST /formmode/interfaces/WorkflowToModeSetOperation.jsp`

将流程表单数据自动写入建模:
- `workflowid` — 源流程ID
- `modeid` — 目标建模ID
- `triggerMethod` — 1=节点触发, 2=出口触发
- `formtype` — `maintable`或`detailN`
- `maintableopttype` — 1=插入, 2=更新, 3=批量插入, 4=插入+更新
- `wffieldidN[]/modefieldidN[]` — 字段映射对

#### 建模→流程 (ModeTriggerWorkflow)

**URL**: `POST /formmode/interfaces/ModeTriggerWorkflowSetOperation.jsp`

从建模数据触发创建流程:
- `modeid` — 源建模ID
- `workflowid` — 目标流程ID
- `wfcreater` — 流程创建人来源(3=自定义字段)
- `showcondition` — 触发条件
- `triggerName` — 触发按钮标签

#### DML动作 (数据库直连)

**URL**: `POST /formmode/interfaces/dmlaction/DMLActionSettingOperation.jsp`

建模数据变更时执行自定义SQL:
- `dmltype` — insert/update/delete
- `maintablename` — 目标表名
- `dmlfieldname[]` — 字段列表
- `wherefieldname[]` — WHERE条件字段

### 3.4 REST API — /api/formmode/*

Jersey REST在`com.api.formmode`包下:

- `FormmodeService` — 核心建模服务
- `AppService` — 应用服务
- `DetailImportService` — 明细导入
- `DocUploadService` — 文档上传
- `ExcelService` — Excel操作
- `ScriptManagerService` — 脚本管理
- `web/FormmodeFormAction` — 表单操作
- `web/FormmodeListAction` — 列表操作
- `web/FormmodeTreeAction` — 树操作
- `web/page/Data` — 数据页面
- `apps/interfaces/ModeInterfacesService` — 接口服务

---

## 四、ESB集成总线

### 4.1 ESB事件调用

**入口**: `/api/integration/esb/event/{eventId}/request/returnParams`

由`EventController`处理，支持HTTP/WebService/AMQP/JMS/JDBC/Java协议。

### 4.2 ESB触发器类型

| 触发器 | 说明 |
|--------|------|
| `WsTrigger` | Web Service触发 |
| `HttpTrigger` | HTTP请求触发 |
| `AmqpTrigger` | RabbitMQ消息触发 |
| `JmsTrigger` | JMS消息触发 |
| `ScheduleTrigger` | 定时任务触发 |
| `TimerTrigger` | 定时器触发 |

---

## 五、核心数据表

| 表名 | 说明 |
|------|------|
| `workflow_base` | 流程定义(workflowid, formid, isbill) |
| `workflow_requestbase` | 流程请求实例(requestid, requestname, workflowid, creatorid) |
| `workflow_formfield` | 表单字段定义 |
| `workflow_formdict` | 主表字段字典 |
| `workflow_formdictdetail` | 明细表字段字典 |
| `workflow_bill` | 表单/单据定义(formid→tablename) |
| `workflow_billfield` | 表单字段 |
| `workflow_userref` | 外部接口IP-用户映射 |
| `modeinfo` | 建模定义(modeId, modename, formid) |
| `modehtmllayout` | 建模HTML布局 |
| `modeDataShare_{modeId}` | 建模数据级共享(每个建模一张表) |
| `mode_workflowtomodeset` | 流程→建模映射配置 |
| `mode_triggerworkflowset` | 建模→流程触发配置 |

---

## 六、典型集成场景

### 场景1: 外部系统创建并提交流程

**方案A — SOAP (推荐Java客户端)**:
1. 在OA后台配置IP白名单+用户映射
2. 调用`doCreateWorkflowRequest`创建流程，设`isnextflow`控制是否自动流转
3. 如需二次操作，调用`submitWorkflowRequest`

**方案B — HTTP POST (推荐非Java系统)**:
1. POST到`/workflow/request/RequestOutDataFormatOperation.jsp`
2. 使用字段名(`field_name`)而非字段ID
3. 传`userid`+`logintype`认证

### 场景2: 外部系统读写建模数据

1. SOAP调用`ModeDateService`的五个操作
2. 请求格式: `key=datajson&value={JSON}`
3. Header含systemid+Md5认证

### 场景3: 流程审批后自动写入建模

1. 在OA后台配置"流程→建模"映射(`/formmode/interfaces/WorkflowToModeSetOperation.jsp`)
2. 设置触发节点和字段映射
3. 流程到达指定节点时自动执行

### 场景4: 建模数据触发创建流程

1. 配置"建模→流程"触发(`/formmode/interfaces/ModeTriggerWorkflowSetOperation.jsp`)
2. 设置触发条件和字段映射
3. 用户在建模界面点击触发按钮即创建流程

---

## 七、注意事项

- SOAP服务的IP白名单必须提前在OA后台配置，否则所有调用返回权限错误
- `RequestOutDataFormatOperation.jsp`仅支持表单型流程(isbill=0)
- 建模`deleteMode`是软删除(设isenable=0)，不会物理删除数据
- 建模数据表名为`workflow_bill.tablename`对应的物理表，`billid`是主键
- 每个建模有独立的`modeDataShare_{modeId}`权限表
- ESB事件接口路径含`returnParams`后缀表示需要返回参数
- Jersey REST使用JAX-RS注解(`@Path`, `@GET`, `@POST`等)，包扫描范围`com.cloudstore`和`com.api`
- XFire SOAP的WorkflowService使用`WorkflowServiceImplSec`安全包装，每个方法都校验IP+userId
