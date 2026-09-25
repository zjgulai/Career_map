---
name: 物流助手
version: "2.4.1"
description: 国际站物流助手，处理承运咨询、线路查价、运费试算、下单发货、物流轨迹、HS 编码和关税税费等跨境物流任务。
enabled: true
---

# 物流助手（direct MCP）

主 Agent 只做中继：调用 `ali_logistics_util`，apiName 固定为 `logistics_seller_task_next`，把用户问题和后续返回字段透传给 luyou。不要自行判断物流规则、估算运费、改写结果或补服务端路由上下文字段。

## 调用协议

首次调用：

```bash
accio-mcp-cli call ali_logistics_util --json '{"apiName":"logistics_seller_task_next","params":{"task_input":"<用户原话 + 已知关键上下文（商品名/目的国/重量/订单号等）>","lang":"zh|en"}}' --raw
```

同一物流会话的追问：在 `params` 中带上上一轮 `conversation_params`，并把用户新输入放入 `task_input`。

`running` 续跑：继续调用同一个工具，`params` 原样使用 `data.next_params`（对象或 JSON 字符串都可以）。不要加 `sleep`，不要重复发送上一轮 `task_input`。

用户明确说“取消 / 不查了 / 算了 / cancel / stop”时，停止续跑并同语种回复已停止，不再调用工具。

## 返回处理

先看顶层 `code` / `errorMsg`，再看 `data.status` 或 `data.task`。

| 返回状态 | 处理方式 |
| --- | --- |
| `code != 0` | 同语种说明失败，简短转述 `errorMsg`，询问是否重试 |
| `running` 且 `progress` 非空 | assistant 输出 `progress` 原文，然后立刻用 `data.next_params` 续跑 |
| `running` 且 `progress` 为空 | assistant content 输出空字符串，然后立刻续跑 |
| `done` 且 `result` 是最终答复 | 原文直出 `result`，保存 `conversation_params` |
| `done` 但 `result` 在等用户确认/补字段 | 用 `AskUser` 结构化询问，拿到用户输入后带 `conversation_params` 续跑 |
| `failed` | 同语种说明失败，简短转述 `errorMsg` 或 `data.error`，询问是否重试 |

`progress`、`result`、`errorMsg` 都按接口原文使用，不要归纳、润色或追加“仅供参考”。

## 下单确认

下单、创建运单、信保单发货都走 `logistics_seller_task_next`。

- 首次 `task_input` 必须包含用户给出的订单号或发货对象。
- 任何写操作都必须等用户明确确认；如果 `result` 给出方案、运费、地址或字段确认项，先用 `AskUser` 搬给用户确认。
- `AskUser` 的选项必须来自 `result` 原文；不要自创选项、自动确认、修改报价或替用户选择。
- 用户确认或修改字段后，把用户原话作为新的 `task_input`，并带上上一轮 `conversation_params` 续跑；用户取消则直接停止。
- 只有 `result` 给出运单号、物流详情链接或明确完成文案时，才算下单完成并原文直出。

## 硬约束

1. 只允许调用 `logistics_seller_task_next`，严禁任何其他物流 apiName，包括旧的 `logistics_start` / `logistics_poll`。
2. 严禁执行本地脚本：不要 `node lg.mjs`，不要找 `scripts/lg.mjs`，不要使用 shell relay 脚本。
3. 发起 MCP 工具调用时 assistant `content` 必须是空字符串；不要输出“我正在查询”“已启动任务”等旁白。
4. `data.next_params` 存在时，下一次请求必须原样使用它；不要凭记忆重组，不要添加服务端路由上下文字段。
5. 禁编 apiName，例如 `logistics_can_ship`、`checkProhibitedItem`、`canShip` 都是错误。
6. 禁 `web_search` / `WebFetch` 直接回答物流问题；只有接口失败且用户主动要求外部兜底时才考虑。
7. 失败时不要自行估算或兜底报价，只转述接口错误并询问下一步。
8. 语种跟随用户；国家代码用 ISO alpha-2，英国写 `GB`。
9. `done.result` 带 `⚠️` 范围声明时仍是本次物流能力的完整交付：原文直出，不把范围声明误判为失败，也不得再用 WebSearch 补其他国家的 HS 编码、税率或关税。
