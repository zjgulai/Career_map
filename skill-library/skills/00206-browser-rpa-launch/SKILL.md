---
name: browser-rpa-launch
displayName: 浏览器脚本执行
displayDescription: 打开指定页面并执行对应脚本。
description: 当已有一个或多个页面地址及对应的本地脚本文件，需要打开页面并执行脚本时使用。不用于生成、修改或解释脚本，也不用于在已有页面上回放脚本。
version: 0.1.0
---

# Browser RPA Launch

## 使用边界

使用本 Skill：

- 已有一条或多条页面地址与本地脚本路径，需要打开新页面并执行对应脚本。
- 电商账号业务已经通过 `discover-store-accounts` 的 `enable` 登录门禁，并取得目标账号同一条记录的完整 Profile ID。

不要使用本 Skill：

- 需要生成、修改或解释脚本。
- 需要在已有页面上执行脚本。
- 只需要浏览或操作页面，没有可执行脚本。

## 输入协议

电商账号业务调用时，在顶层传入同一条 `discover_store_accounts.accounts[]` 记录对应的三个 Profile 选择 ID；名称和脱敏账号可作为展示与日志元数据一起传入：

```json
{
  "platformId": "pdd",
  "storeId": "store-uuid",
  "storeAccountId": "store-account-uuid",
  "platformName": "拼多多",
  "storeName": "示例旗舰店",
  "account": "示**",
  "items": [
    {
      "url": "https://example.com/workflow",
      "dslPath": "/absolute/path/to/flow.json",
      "closeOnFinish": true
    }
  ]
}
```

输入规则：

- 电商账号业务必须同时传入顶层 `platformId`、`storeId`、`storeAccountId`，三者必须来自同一条发现记录；只有这三个 ID 参与 Profile 定位，缺失或只传一部分时停止调用。
- `platformName`、`storeName`、`account` 可从同一条发现记录传入，仅用于展示和日志；`account` 必须保持 L3 脱敏值，不得还原、猜测或用于 Profile 定位。
- 顶层 `platformId` 是 Profile 选择器；发品文件模式已有的顶层 `platform` 仍保持原语义，两者不要混用。
- `items` 必填，必须包含 1～5 条记录。
- 每条记录只能包含 `url`、`dslPath` 和可选的 `closeOnFinish`；`url` 和 `dslPath` 必填。不要传业务字段或其他元数据。
- 不要把缺少必填字段的记录放入 `items[]`；由调用方决定补齐信息或将该记录标记为不可执行。
- `url` 必须是绝对 HTTP/HTTPS URL；不明确时不要猜测。
- `dslPath` 必须是本地 JSON 文件路径。优先使用绝对路径；只有当前任务工作目录明确时才使用相对路径。
- `closeOnFinish` 可选，必须是布尔值，默认值为 `false`。`true` 表示脚本返回且未超时时，尽力关闭本次打开的页面，无论结果是成功、部分完成还是失败；超时项不主动关闭。
- `closeOnFinish=false` 表示执行结束后保留页面。该字段只控制本次打开页面的关闭行为，不会清除 Cookie、LocalStorage 或登录态。

工具会在打开页面前校验整个列表的参数格式。任意记录格式不合法时，整个调用失败，不执行任何记录。该校验不包含脚本文件存在性、可读性或脚本内容校验。

## 执行语义

- 一次 `browser_rpa_launch` 调用执行一个队列分段。
- 分段内严格按 `items[]` 顺序执行，当前记录返回后才开始下一条。
- 单条记录失败不阻断当前分段，记录失败结果后继续执行后续记录。
- 调用被取消时，当前记录以实际执行结果为准；尚未开始的记录返回 `failed`，结果码为 `RUN_CANCELLED`。
- 单项超时时，当前记录返回 `RPA_LAUNCH_ITEM_TIMED_OUT`，当前分段内尚未开始的记录返回 `RPA_LAUNCH_NOT_STARTED`，队列返回 `QUEUE_TIMED_OUT`。该结果是整个逻辑队列的终态，不再调用后续分段。
- 同一逻辑队列超过 5 条时，由调用方按原顺序拆分；各分段依次调用，不能并发执行。
- 不同逻辑队列可以分别调用，具体调度方式由调用方决定。
- 传入完整 Profile 选择器时，工具在对应店铺的隔离浏览器中打开页面；选择器只放调用顶层，不进入 `items[]`。
- 一次调用只能使用一个账号 Profile；不同 `storeAccountId` 的任务必须拆成不同调用。

## 响应协议

处理结果分为三层：

1. 工具调用结果：表示调用是否被接受并正常返回。
2. 队列分段结果：汇总本次 `items[]` 的执行结果。
3. 单项结果：记录在队列分段结果的 `items[]` 中。

每次调用返回的 `status` 和 `summary` 只代表当前队列分段。一个逻辑队列包含多个分段时，由调用方按原始顺序汇总所有分段结果。

### 工具调用结果

- 顶层参数或 `items[]` 格式校验失败时，工具调用失败；此时没有队列分段结果，也不会执行任何记录。
- 工具不可用、调用抛错或无返回时，按工具调用失败处理。
- 单条记录在打开页面或执行脚本时失败，不会使工具调用失败；该记录写入 `items[]` 后继续执行当前分段。
- 工具调用成功只表示当前分段已经处理并返回结果，不表示所有记录都执行成功。
- 工具调用成功后，先检查最小有效响应；通过后再以队列分段结果中的 `status`、`summary` 和 `items[]` 为准。

### 队列分段结果

```json
{
  "schemaVersion": "browser-rpa-launch.queue.result.v1",
  "ok": false,
  "status": "partial",
  "code": "QUEUE_PARTIAL",
  "message": "...",
  "summary": {
    "total": 2,
    "succeeded": 1,
    "partial": 0,
    "failed": 1
  },
  "items": [
    {
      "index": 0,
      "url": "https://example.com/workflow",
      "dslPath": "/absolute/path/to/flow.json",
      "ok": true,
      "status": "success",
      "code": "RPA_RUN_SUCCEEDED",
      "message": "...",
      "outputsPath": "..."
    },
    {
      "index": 1,
      "url": "https://example.com/other-workflow",
      "dslPath": "/absolute/path/to/other-flow.json",
      "ok": false,
      "status": "failed",
      "code": "RPA_RUN_FAILED",
      "message": "..."
    }
  ]
}
```

队列分段状态：

| `status` | `code` | 含义 |
| --- | --- | --- |
| `success` | `QUEUE_SUCCEEDED` | 所有记录都执行成功。 |
| `partial` | `QUEUE_PARTIAL` | 记录结果混合，或至少有一条记录部分完成。 |
| `failed` | `QUEUE_FAILED` | 所有记录都执行失败。 |
| `partial` 或 `failed` | `QUEUE_TIMED_OUT` | 某条记录超时，队列已经停止。 |

`ok` 只有在队列分段 `status=success` 时才是 `true`。

### 最小有效响应

- 队列分段结果必须包含 `schemaVersion`、`ok`、`status`、`code`、`message`、`summary` 和 `items[]`。
- `schemaVersion` 必须是 `browser-rpa-launch.queue.result.v1`。
- `status`、`code` 和 `ok` 必须符合上面的队列分段状态表。
- `summary` 必须包含非负整数 `total`、`succeeded`、`partial` 和 `failed`。
- `items.length` 和 `summary.total` 必须都等于当前分段的输入记录数；`summary` 中三个结果数量之和必须等于 `summary.total`，并与 `items[].status` 的实际统计一致。
- 每条 `items[]` 必须包含 `index`、`url`、`dslPath`、`ok`、`status`、`code` 和 `message`；`status` 必须是 `success`、`partial` 或 `failed`。
- `items[]` 必须与当前分段输入顺序一致；每条记录的 `index` 必须等于分段内位置，`url` 和 `dslPath` 必须与对应输入一致。
- 响应无法解析、不满足上述结构或 `schemaVersion` 不受支持时，按当前分段响应异常处理；不要使用其中的 `summary` 或 `items[]`，也不要自行补齐或推断字段。

### 单项结果

- `items[]` 与当前分段的输入顺序一致，`index` 是当前分段内从 0 开始的序号，不是整个逻辑队列的全局序号。
- 调用方使用分段上下文和输入顺序关联原始记录；需要跨分段关联时，同时保留对应的 `url` 和 `dslPath`。
- `items[].status` 为 `success`、`partial` 或 `failed`，表示该记录自身的执行结果。
- `items[].code` 是该记录的主结果码，可能来自页面打开、脚本校验、脚本执行或组合工具本身；结果码集合不在本 Skill 中穷举。
- 判断单项结果时以 `items[].status` 为主，使用 `code`、`message` 和 `issues[]` 定位具体原因。
- `items[].issues[]` 存在时，其中的 `code` 和 `message` 表示具体步骤问题；不要把步骤问题码当成队列结果码。
- `outputsPath`、`issues` 和 `issueSummary` 都可能缺失，只在实际返回时使用。
- `closeOnFinish` 的页面清理结果不进入公开响应，也不改变该记录的 RPA 执行结果。
- 单条执行抛出异常时，该条记录为 `failed`，并保留可见错误信息；其他记录继续执行。

### 跨分段汇总

- 只汇总通过最小有效响应检查的分段结果，并按原始分段和分段内记录顺序合并 `items[]`；不要使用分段内 `index` 作为全局序号。
- 将有效分段 `summary` 的 `total`、`succeeded`、`partial` 和 `failed` 分别求和，并与合并后的单项结果复核。
- 所有记录都有明确结果时，整个逻辑队列全部为 `success` 才记为 `success`，全部为 `failed` 才记为 `failed`，其他情况记为 `partial`。
- 不要使用任一分段的 `status` 或 `summary` 代表整个逻辑队列。
- 某个分段工具调用失败或响应异常时，没有可信的队列分段结果。调用方应为该分段输入保留同一可见错误，并标明执行结果未确认；不要把它伪装成工具返回的 `items[]`，也不要自动重试。
- 分段异常后默认继续同一逻辑队列的下一分段；如果错误明确表示工具不可用、调用被取消或后续无法执行，则停止剩余分段，并由调用方将尚未调用的记录标为未执行。
- 存在结果未确认或未执行记录时，不要把整个逻辑队列汇报为执行完成；由上层分别汇总明确结果、结果未确认和未执行记录。

## 汇报边界

- 作为上层流程的一部分调用时，不单独生成用户回复；将队列分段结果和单项结果交给上层流程继续处理。
- 上层流程负责业务分组、原始记录关联、跨分段结果汇总和最终用户回复。
- 有 `items[].outputsPath` 且上层任务需要结构化输出时再读取。
- 有 `items[].issues[]` 时只摘要必要问题；不要粘贴大段日志、页面内容或报告正文。
- 用户明确直接执行脚本队列时，只汇总完成、部分完成、失败数量和必要问题；存在结果未确认或未执行记录时一并说明。
- 面向用户时，除非用户明确要求，不展示内部结果码或大段执行详情。
- 用户需要获取结构化结果文件时，再提供实际返回的 `outputsPath`。
