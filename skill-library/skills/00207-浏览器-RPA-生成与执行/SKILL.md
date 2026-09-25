---
name: browser-rpa-run
displayName: 浏览器 RPA 生成与执行
displayDescription: 根据业务数据生成并执行浏览器 RPA。
description: 当需要根据已准备的业务数据生成并执行浏览器 RPA 时使用；已有可执行 DSL 时使用 browser-rpa-launch。
version: 0.1.0
---

# 浏览器 RPA 生成与执行

## 使用边界

本 Skill 根据已准备的业务数据生成 RPA，并在指定账号的隔离 Profile 浏览器中执行；不负责准备业务数据或完成账号登录。

- 需要在指定账号执行时，先使用 `discover-store-accounts` 从完整候选中确定目标并完成 `enable` 登录门禁。不得提前过滤或静默跳过 `enable=false` 记录；只有门禁放行的 `enable=true` 目标才能调用本 Skill。
- 已有可执行 DSL 时使用 `browser-rpa-launch`。
- 仅需浏览或操作页面时使用相应的浏览器工具。
- 业务数据或执行上下文尚未准备完成时，先完成相应准备。

## 输入协议

调用 `browser_rpa_run`：

```json
{
  "type": "publish_product",
  "platform": "jd",
  "platformId": "jd",
  "storeId": "store-uuid",
  "storeAccountId": "store-account-uuid",
  "platformName": "京东",
  "storeName": "京东主店",
  "account": "京**",
  "url": "https://wares-jdm.jd.com/ware/categorySelectNew?source=1",
  "dataPaths": [
    "/absolute/path/product-001.json",
    "/absolute/path/product-002.json"
  ],
  "closeOnFinish": true
}
```

输入规则：

- `type`、`platform`、`url`、`dataPaths`、`platformId`、`storeId` 和 `storeAccountId` 必填，`closeOnFinish` 可选。三个 Profile ID 必须来自同一条 `discover_store_accounts.accounts[]` 记录，缺失或只传一部分时停止调用。
- `platformName`、`storeName`、`account` 可作为展示和日志元数据一起传入；`account` 仅使用工具返回的 L3 脱敏值，不得还原、猜测或用于 Profile 定位。
- `platform` 是 RPA 生成策略的平台字段，`platformId` 是 Profile 选择器；两者各自保持原语义，不要互相替代。
- 一次调用只处理同一个 `type`、`platform` 和 `url`。
- `url` 必须是绝对 HTTP/HTTPS URL，且不能包含用户名或密码；不明确时不要猜测。
- `dataPaths` 必须包含 1～5 个业务数据 JSON 路径，并保持调用方要求的执行顺序。原样使用调用方提供的实际路径，不假设固定目录、文件名或数据来源，也不根据 `type`、`platform` 或业务内容自行拼接路径。
- `dataPaths` 可以使用绝对路径或相对于当前 workspace 的路径，但最终必须指向 workspace 内可读取的普通文件。
- 每个数据文件必须是 UTF-8 JSON，且顶层为对象。
- `closeOnFinish` 可选，必须是布尔值，默认值为 `false`。设为 `true` 时，每个任务返回且未超时后会尽力关闭该任务打开的页面；设为 `false` 时保留页面。该字段不清除 Cookie、LocalStorage 或登录态。

## 执行语义

- 每份业务数据可以生成一个或多个 RPA 任务。结果通过 `dataIndex` 关联输入数据，并通过 `outputIndex` 区分同一数据生成的多个任务。
- 生成后的任务按照 `dataIndex` 和 `outputIndex` 顺序串行执行。普通单项失败不阻断后续任务；任务超时或调用取消时停止继续执行，尚未开始的任务记为未执行。
- `closeOnFinish` 对每个生成任务分别生效。任务结束且未超时时按该配置处理页面；页面清理结果不改变任务的业务状态。
- 一次调用只能使用一个账号 Profile；不同 `storeAccountId` 的业务数据必须拆成不同调用。

## 响应协议

无论工具调用被标记为成功还是失败，只要存在返回正文，都先尝试解析 JSON。工具调用成功只表示取得响应，不代表其中的业务任务成功；解析并校验后，以正文中的 `status`、`summary` 和 `items[]` 为准。

```json
{
  "schemaVersion": "browser-rpa-run.orchestration-result.v1",
  "status": "success",
  "code": "BROWSER_RPA_RUN_SUCCEEDED",
  "message": "...",
  "summary": {
    "total": 1,
    "succeeded": 1,
    "partial": 0,
    "failed": 0,
    "notStarted": 0
  },
  "items": [
    {
      "dataIndex": 0,
      "outputIndex": 0,
      "dataPath": "/absolute/path/product-001.json",
      "status": "success",
      "code": "RPA_RUN_SUCCEEDED",
      "message": "..."
    }
  ]
}
```

校验规则：

- 响应包含 `status`、`code`、`message`、`summary` 和 `items[]`。顶层 `status` 为 `success`、`partial` 或 `failed`，表示本次调用的总体状态。
- `summary` 中的 `total`、`succeeded`、`partial`、`failed` 和 `notStarted` 必须是非负整数，并满足 `succeeded + partial + failed = total = items.length`。`notStarted` 是 `failed` 中明确未执行的数量。
- 每个 item 包含 `dataIndex`、`outputIndex`、`dataPath`、`status`、`code` 和 `message`。单项 `status` 为 `success`、`partial` 或 `failed`。
- `dataIndex` 关联 `dataPaths[dataIndex]`，`outputIndex` 区分同一份数据生成的多个任务；`dataPath` 必须与对应输入一致。
- 顶层可能额外返回 `dataIndex` 和 `phase`，仅用于定位错误；不要根据这些字段推断任务是否已经执行。
- 单项可能返回 `outputsPath`、`reportPath`、`issues` 和 `issueSummary`。仅在实际返回时使用；需要结构化产物时读取 `outputsPath`，需要执行报告错误明细时读取 `reportPath`。
- `items[]` 为空时，`summary` 中的所有计数都必须为 `0`。
- 字段缺失、类型错误、统计矛盾或 item 无法关联输入时，将整个响应视为异常，不补齐或推测其中的结果。

## 错误码处理

先使用顶层 `status` 和 `code` 判断本次调用的总体结果，再逐项处理 `items[]`。顶层结果码不能代替单项结果。

### 顶层结果码

| 结果码 | 含义与处理 |
| --- | --- |
| `BROWSER_RPA_RUN_SUCCEEDED`、`BROWSER_RPA_RUN_PARTIAL`、`BROWSER_RPA_RUN_FAILED` | 表示总体汇总状态；继续检查每个 item。 |
| `BROWSER_RPA_RUN_INPUT_INVALID` | 输入参数无效。根据顶层 `message` 修正参数后，可以重新提交。 |
| `BROWSER_RPA_RUN_NOT_CONFIGURED`、`BROWSER_RPA_RUN_ORIGIN_NOT_ALLOWED`、`BROWSER_RPA_RUN_WORKSPACE_INVALID` | 执行条件不满足。说明顶层 `message`，修正原因后只重新安排明确未执行的任务。 |
| `BROWSER_RPA_RUN_DATA_*` | 数据读取或校验失败。结合 `dataIndex` 和 `message` 定位输入，修正源数据或路径后只重新安排明确未执行的任务。 |
| `RPA_GENERATION_*`、`CONVERTER_*` | RPA 生成失败。结合 `dataIndex`、`phase` 和 `message` 定位原因；不手工构造 DSL，只重新安排明确未执行的任务。 |
| `BROWSER_RPA_RUN_TIMED_OUT`、`BROWSER_RPA_RUN_CANCELLED`、`BROWSER_RPA_RUN_INTERNAL_ERROR` | 本次调用已经停止或结果无法完整确认。停止后续处理，逐项区分待确认和未执行。 |

### 单项结果码

| 结果码 | 含义与处理 |
| --- | --- |
| `RPA_RUN_SUCCEEDED` | 任务执行成功。 |
| `BROWSER_RPA_RUN_NOT_STARTED` | 任务明确未执行；处理根因后可以重新安排。 |
| `BROWSER_RPA_RUN_ITEM_TIMED_OUT`、`RPA_RUN_CANCELLED`、`BROWSER_RPA_RUN_UNEXPECTED_ERROR` | 任务状态待确认，不自动重试。 |
| `RPA_RUN_PARTIAL`、`RPA_RUN_FAILED` | 任务部分完成或失败，不得推断为成功，也不自动重试。 |
| 其他结果码 | 以单项 `status` 和 `message` 为准；需要执行报告明细时只读取该失败结果实际返回的 `reportPath`。不能确认未执行时，不自动重试。 |

只有 `BROWSER_RPA_RUN_NOT_STARTED` 能够直接证明对应任务未执行。除输入参数明确无效外，失败、部分完成、超时、取消或状态待确认的任务都不自动重试，避免重复产生业务副作用。

工具无返回、正文无法解析或响应校验失败时，将本次调用涉及的业务数据记为状态待确认，停止处理且不自动重试。

## 汇报边界

- 作为其他流程的一部分调用时，将通过校验的结构化结果交给调用方，不单独生成用户回复。
- 调用方通过 `dataIndex` 和 `dataPath` 关联具体业务对象；同一份业务数据存在多个 item 时，保留每个 `outputIndex` 对应的结果。
- 直接面向用户回复时，只说明执行数量、状态以及影响执行结果的实际问题；分别说明成功、部分完成、失败、待确认和未执行，不将部分完成或失败合并为成功。
- 除非用户明确要求排查，不展示内部结果码、`dataPath`、`dataIndex`、`outputIndex`、JSON 正文或日志。
