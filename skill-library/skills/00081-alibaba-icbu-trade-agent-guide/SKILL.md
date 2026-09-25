---
name: alibaba-icbu-trade-agent-guide
version: 0.2.2
description: >
  Alibaba.com Trade Agent Guide Skill, covering pre-order validation and missing field guidance.
  Given a productId (numeric), calls the trade agent guide MCP tool to check negotiation contract
  completeness, then guides users to fill in missing fields based on their intent (quick order vs.
  order-and-pay). The request only requires productId; include language (e.g. en_US) when available.

  Typical utterances:
  - Check if I can place an order for this product
  - 下单引导
  - 订单校验
  - 能不能下单
  - 缺什么信息
  - trade agent guide
  - 下单前检查
  - What information is missing for this order?
  - productId
  - 商品ID
enabled: true
tool_triggers:
  - name: icbu_alibaba_trade_agent_guide_V2
  - name: parse_guide_result
---

# Alibaba.com Trade Agent Guide — Pre-Order Validation & Guidance

This Skill validates the completeness of a negotiation contract before order placement on Alibaba.com.
It calls the trade agent guide MCP tool with a productId, parses the result, and guides users
to fill in missing fields to reach an orderable or payable state.
The system automatically looks up seller information based on the productId.

## MCP Services

| Capability Module | MCP code | Description |
|---------|----------|------|
| Trade Agent Guide | `icbu_alibaba_trade_agent_guide_V2` | Validate negotiation contract and return missing fields for order/payment |

## Intent Routing

```
User Input
  │
  ├─ Provides productId
  │   └─► Call MCP tool → Parse result → Guide user
  │
  ├─ Asks "can I place an order?" / "what's missing?"
  │   └─► Collect productId → Call MCP tool
  │
  └─ Ambiguous or missing parameters
      └─► Ask user for productId
```

### Intent Recognition Rules

| User Input Characteristics | Intent | Capability Module |
|-------------|------|---------|
| Contains productId (digits) | Direct Validation | `icbu_alibaba_trade_agent_guide_V2` |
| Mentions "下单引导", "order guide", "能不能下单" | Validation with param collection | `icbu_alibaba_trade_agent_guide_V2` |
| Mentions "缺什么信息", "what's missing", "商品ID" | Validation with param collection | `icbu_alibaba_trade_agent_guide_V2` |
| Ambiguous trade-related query | Clarification | Ask user for productId |

### Multilingual Trigger Keywords

| Language | Trigger Keywords |
|----------|-----------------|
| English | order guide, can I order, pre-order check, what's missing, trade agent guide, productId |
| Chinese | 下单引导, 订单校验, 能不能下单, 缺什么信息, 下单前检查, 订单缺失字段, 商品ID |

> **Fallback:** The above list is a reference. The Agent should identify intent based on semantic understanding in any language.

## SubAgent Delegation

> When this intent is detected by the main Agent, do NOT call MCP tools directly — delegate to the trade SubAgent via `sessions_spawn(agent_id="accio-sourcing-agent-plugin:alibaba-icbu-trade-sub-agent")` and pass the user's query and any relevant context (product ID, order ID, conversation history).

## MCP Tool Usage

### Trade Agent Guide — `icbu_alibaba_trade_agent_guide_V2`

**Command:**
```bash
accio-mcp-cli call icbu_alibaba_trade_agent_guide_V2 --json '{"request":{"productId":<PRODUCT_ID>,"language":"en_US"}}' --raw
```

**Request Body Example:**

```json
{
  "request": {
    "productId": 1601535080308,
    "language": "en_US"
  }
}
```

- **request**: Request object containing `productId` (numeric). Include `language` when available.
- Do not send `operatorRole` or any extra identity fields; this MCP request schema does not require them.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| request.productId | number | Yes | Product ID (numeric, not a string). The system will look up seller info based on this ID. |
| request.language | string | No | Response language in locale format, e.g. `en_US`, `zh_CN`. Infer from user language when possible. |

**Parameter Acquisition Strategy:**

| Parameter | Priority |
|-----------|----------|
| productId | 1. User's current input → 2. Conversation context → 3. Ask user |
| language | 1. User's preferred language → 2. User's current input language → 3. Default to `en_US` |

**Response Key Fields:**

| Field | Description |
|-------|-------------|
| code | Status code indicating validation result (e.g. `SUCCESS`, `ORDER_BLOCKED`) |
| canOrder | Whether the order can be placed |
| canPay | Whether payment can be made |
| orderMissingList | Fields missing for order creation |
| payMissingList | Fields missing for order creation + payment (superset of orderMissingList) |
| addressList | Candidate addresses when address parsing fails |

## Result Handling by Status Code

After calling the MCP tool, handle results based on the `code` field. Use the output templates defined in `references/temp.md` for consistent formatting.

| Code | Condition | Action |
|------|-----------|--------|
| `SUCCESS` | canOrder=true, canPay=true | Congratulate — all info complete |
| `ORDER_ONLY` | canOrder=true, canPay=false | Show payMissingList for payment readiness |
| `ORDER_BLOCKED` | canOrder=false, canPay=false | Show orderMissingList or payMissingList based on user intent |
| `ADDRESS_ERROR.ADDRESS_PARSE_FAILED` | Address parsing failed | Show candidate addresses for selection |
| `PARAM_INVALID.*` | Input parameter error | Guide user to correct parameters (productId) |
| `NEGOTIATION_CONTRACT_ERROR.*` | Contract issue | Guide user to verify contract/identity |
| `SYSTEM_ERROR` | System failure | Suggest retry later |

### User Intent Detection

Before presenting missing fields, determine user intent:

- **Quick Order** — user only wants to create the order → show `orderMissingList`
- **Order & Pay** — user wants to order and pay in one step → show `payMissingList`
- **Default** — when intent is unclear, default to **Order & Pay** (more complete)

For detailed error codes, see `references/error-codes.md`.
For output format templates, see `references/temp.md`.

**Post-processing preference:** After a successful MCP response, first try the custom JS
tool `parse_guide_result` with `{ "rawGuideResponse": <raw MCP response>, "userIntent":
"quick_order | order_and_pay | unknown" }`. Prefer its `markdown` output for the final
response, or its `sections` rows when localizing labels. Only fall back to manual scenario
handling from this section and `references/temp.md` if the JS tool is unavailable or returns
an error.

## General Rules

### Language
- Detect user's input language and always respond in the same language
- Keep raw data values (productId, error codes) as-is
- Translate UI labels, field names, and prompts to user's language
- Default to English when language cannot be determined

### Error Handling

| Scenario | Response Strategy |
|----------|-------------------|
| MCP tool call fails | Inform user the service is temporarily unavailable, suggest retrying later |
| productId invalid or empty | Ask user to provide a valid product ID |
| Product seller not found | The product ID may be incorrect, ask user to verify |
| Seller type not supported | This product's seller is not CGS/IFM type, feature not available |
| Unexpected operator identity error | Explain that order guidance could not complete because the service rejected the request context; do not ask the user for extra identity fields |
| Contract not found | Inform user no active negotiation contract exists |
| Address parse failed | Show candidate addresses or ask for full address |

### Result Presentation
- Use output templates from `references/temp.md` for all scenarios
- Use Markdown tables for structured display of missing fields
- Map field keys to user-friendly names using the field reference table
- Categorize fields with emoji icons (🚚 Logistics, 📦 Product, 💰 Payment, 📋 Contract)
- Provide next-step suggestions at the end of each response
- Never expose raw JSON or internal tool names to the user
