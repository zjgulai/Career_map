---
name: buyer-payment-intent
version: 1.2.0
description: |
  买家支付域统一入口。所有会调用 `alibaba-icbu-payment-sub-agent` 的支付诉求都必须先进入本 skill,不得绕过。
  覆盖支付通知、支付状态/记录、支付链接、去支付/立即支付、重新支付、支付失败原因、到账时间、退款时间、H5 关闭回流、session resume 等场景。
  本 skill 负责识别意图、按意图契约收集业务参数、构造内嵌 JSON、追加 `[Response Language]` / `[Client]` tag、调用并透传 sub-agent 返回。
enabled: true
---

# 买家支付意图 Skill

## 0. 入口硬规则

对 `alibaba-icbu-payment-sub-agent` 的所有调用都必须先按本 skill 流程执行,不得由主 Agent 直接调用。

## 1. 触发范围

命中任一即进入本 skill:

- `[Payment Notifications]` 前缀消息。
- 支付状态/记录/历史: 支付了吗、支付状态、payment status/history。
- 支付动作: 去支付、立即支付、make payment、pay now。
- 重试支付: 重新支付、再付一次、retry payment。
- 支付链接: 支付链接、付款链接、收银台地址、checkout URL、payment link。
- 支付结果解释: 为什么失败、错误码、到账时间、退款多久、settlement/refund timing。
- H5 关闭回流或 session resume 中需要继续处理支付结果。

下单、订单详情、地址、物流、售后退款发起/进度等非支付域诉求仍按对应 trade/logistics/after-sales 路由处理。

## 2. task 封装契约

调用 payment sub-agent 时,task 必须按以下顺序组成:

```text
<完整任务描述>
json: <按当前 query 意图构造的 JSON>
[Response Language] <Lang> [Client] <ClientType>
```

- 普通用户请求的 `<完整任务描述>` 必须使用用户本轮原话,不得删减、摘要、翻译或改写。
- 支付通知、H5 关闭回流、session resume 使用完整的系统事件任务描述,必须写清事件类型和要执行的支付任务,不得缩写成模糊指令。
- JSON 只能包含 §3 为当前 query 意图定义的必传字段和有可信值的选填字段;不得复制表外字段,不得传空值。
- `language` 从一开始就不写入 JSON。`<Lang>` 取英文语言名,如 `Chinese` / `English` / `Spanish` / `French`;无法判断时使用 `Chinese`。
- `[Client] <ClientType>` 取当前主会话环境信息块 `Client:` 行原值,仅允许 `web` / `desktop` / `mobile` / `im channel`。
- 若 `Client:` 行缺失或读不到,省略整个 `[Client] <ClientType>`,禁止默认 `web`,禁止从 `Runtime` 推导,也不得向 JSON 增加 `client` / `clientType` / `clientPlatform`。
- JSON 是 task 的一部分,不是独立的第二入参。
- `orderId` 必须保持字符串,不得转为数字、截断或补零。

## 3. query 意图与字段契约

| Query 意图 | 必传字段 | 选填字段(有可信值才传) |
|---|---|---|
| 支付通知 | `orderId`, `source="payment_notification"` | 无 |
| 主动查询支付状态/记录/历史 | `orderId` | `aliId` |
| H5 关闭回流 | `orderId`, `source="h5_closed"` | `aliId` |
| session resume | `orderId`, `source="session_resume"` | `aliId` |
| 发起支付 | `orderId`, `intent="new"` | `aliId`, `amount`, `currency` |
| 重新支付 | `orderId`, `intent="retry"` | `aliId` |
| 获取支付链接 | `orderId`, `paymentItemIndex`, `aliId` | 无 |
| 解释支付失败原因 | `orderId`, `bucket="FAILED"`, `errorCode`, `aliId` | 无 |
| 解释非失败支付结果 | `bucket` | `orderId`, `paymentMethod`, `refundType` |
| 支付结果文本降级处理 | `message` | `orderId` |

字段来源与限制:

- `aliId` 只能从当前登录会话读取,不得询问用户提供内部 ID,不得接受用户自报或覆盖。
- `amount` / `currency` 只能来自当前订单上下文。
- `bucket` / `paymentMethod` / `errorCode` / `refundType` 只能来自真实支付结果或可信系统事件,不得猜测或改写。
- `paymentItemIndex` 只能是用户明确确认的首款 `0` 或后续款 `1`。
- `message` 必须保留完整原始支付结果文本,不得先摘要。
- 买家入口固定按 `audience=buyer` 处理。JSON 不传 `audience`,也不接受用户指定的 `seller` / `ops`。
- 主动查询支付状态时不增加 `source="user_inquiry"`;没有 `source` 即表示默认主动查询。

## 4. 必传字段缺失处理

必传字段无法从本轮请求或可信上下文取得时,不得调用 payment sub-agent:

- 缺少 `orderId`: 询问“请提供需要处理的订单号。”
- 获取支付链接缺少 `paymentItemIndex`: 询问“请确认这是首款还是后续款项？”
- 获取支付链接或解释支付失败原因缺少登录会话 `aliId`: 提示用户先登录;不得询问或展示 `aliId`。
- 解释支付失败原因缺少 `errorCode`: 询问支付页面显示的准确错误码。
- 解释非失败支付结果缺少 `bucket`: 询问当前显示的是支付成功、处理中、关闭、退款、未支付还是未知状态。
- 文本降级处理缺少完整 `message`: 要求提供完整支付提示;若用户要查询具体订单,同时询问订单号。

## 5. 支付 URL 责任边界

- `buyer-payment-intent` 不收集、不构造、不传递 `payActionUrl`、`cashierUrl`、`payNowUrl` 或 `freshUrl`。
- 发起支付时,payment sub-agent 使用 `orderId` 调用支付 URL MCP,内部使用 `paymentItemIndex=0`。
- 重新支付时,payment sub-agent 先校验重试资格,再按最新支付记录计算 `paymentItemIndex` 并调用支付 URL MCP。
- 支付状态仅在确认需要“立即支付”按钮后获取 URL,并由 payment sub-agent 根据支付记录计算 `paymentItemIndex`。
- 获取支付链接必须先取得 `orderId`、用户确认的 `paymentItemIndex` 和登录会话 `aliId`,再由 payment sub-agent 获取 URL。
- MCP 返回的 `cashierUrl` 仅在 payment sub-agent 内部按用途传给卡片或链接渲染流程;入口 task 不携带支付 URL。

## 6. 透传与兜底

- sub-agent 返回的卡片、follow-up、错误提示一律原样透传,主 skill 不二次渲染、不补充话术、不翻译。
- sub-agent 多次无返回/超时/技术异常时,用自然业务语言告知暂时无法处理本次支付请求,建议前往 Alibaba.com 我的订单查看或稍后重试。
- 用户可见文本不得暴露 sub-agent、内部 JSON、字段名、路由编号、MCP/tool 名称。

## 7. 验收清单

- 所有 payment sub-agent 调用前都先进入本 skill。
- 普通用户请求的 task 完整保留用户原话;系统事件 task 使用完整事件任务描述。
- task 含按 query 意图构造的 JSON 和 `[Response Language]`,可读取时含 `[Client]`。
- JSON 只含当前意图允许的字段,不含 `language` / `audience` / Client tag 字段或任何支付 URL。
- 必传字段缺失时先追问或提示登录,不调用 sub-agent,不传空值。
- 买家入口始终按 buyer 处理。
