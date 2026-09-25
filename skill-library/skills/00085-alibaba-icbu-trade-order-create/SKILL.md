---
name: alibaba-icbu-trade-order-create
version: 0.9.0
description: >
  Alibaba.com Trade Order Creation Skill, helping buyers create orders from conversations.
  Supports ready-to-ship direct purchase link generation, direct order placement with
  draft preview confirmation, and buyer draft order creation from IM negotiation context.
  Triggered when users express intent to place an order, buy a product, proceed to checkout,
  or create an order based on IM negotiation results.

  Typical utterances:
  - I want to place an order for this product
  - Create an order for 500 pieces of product 17777111177771
  - Buy this product / Buy now
  - 我要下单 / 直接购买
  - 帮我下单
  - Proceed to checkout
  - 帮我起草订单
  - 基于沟通下单
  - Create order from our chat discussion
enabled: true
tool_triggers:
  - name: icbu_alibaba_trade_create_service_V2
  - name: generate_now_buy_url
---

# Alibaba.com Trade Order Creation

An order creation assistant for international buyers, supporting ready-to-ship direct purchase links, direct order placement with draft preview, and buyer draft order creation from IM negotiation context.

## Service & Skill Providers

| Capability Module | Provider | Description |
|---------|----------|------|
| Order Creation | `icbu_alibaba_trade_create_service_V2` | MCP tool for creating an order (direct mode or buyer draft mode) |
| Draft Preview | `alibaba-icbu-trade-contract-draft-view` | Delegate to this skill for draft preview rendering before final creation |

## Intent Routing

```
User Input
  │
  ├─ Sample/trial order (sample, 样品, trial, 试用) → STOP — not supported
  │
  ├─ Ready-to-Ship product (isTradable: "Y") + no price dispute + direct buy intent
  │   └─► Ready-to-Ship Direct Link Mode
  │       ├─ Step 1: Collect productId + quantity (+ optional skuId) from context
  │       ├─ Step 1.5: MANDATORY — Delegate to alibaba-icbu-trade-buynow-order (primary path)
  │       │   └─ If success → STOP (task done)
  │       │   └─ If buynowDegrade=true or failure → proceed to Step 2
  │       ├─ Step 2: Generate nowBuy URL (FALLBACK ONLY)
  │       └─ Step 3: Display purchase link to user
  │
  ├─ "place order" / "buy" + product info (productId)
  │   └─► Direct Order Mode
  │       ├─ Step 1: Collect productId from context
  │       ├─ Step 2: `alibaba-icbu-trade-contract-draft-view` → display order preview
  │       ├─ Step 3: Two-step confirmation → icbu_alibaba_trade_create_service_V2
  │       └─ Step 4: Return order ID → guide to payment
  │
  ├─ Context contains notes (draft order from IM negotiation)
  │   └─► Buyer Draft Mode
  │       ├─ Step 1: Parse notes → extract productId → display order summary
  │       ├─ Step 2: Wait for buyer confirmation or modification
  │       ├─ Step 3: icbu_alibaba_trade_create_service_V2(productId, remark)
  │       └─ Step 4: Return order ID → guide to track seller review status
  │
  └─ Buying intent but details unclear
      └─► Guided Order Mode
          ├─ Ask for product ID
          └─ Once collected → enter Direct Order Mode
```

### Intent Recognition Rules

| User Input Characteristics | Intent | Capability Module |
|-------------|------|---------|
| Ready-to-Ship product (`isTradable: "Y"`) + no price objection + direct buy intent | Ready-to-Ship Direct Buy | **Delegate to `alibaba-icbu-trade-buynow-order`** (fallback: nowBuy link) |
| "buy now", "直接购买", "purchase directly" + stock product / `isTradable: "Y"` context | Ready-to-Ship Direct Buy | **Delegate to `alibaba-icbu-trade-buynow-order`** (fallback: nowBuy link) |
| "place order", "buy", "purchase", "下单" + product info | Direct Order | `alibaba-icbu-trade-contract-draft-view` for preview, then `icbu_alibaba_trade_create_service_V2` |
| "checkout", "proceed", "confirm order" in active order context | Order Confirmation | Execute pending order |
| Context has notes + order intent | Buyer Draft | icbu_alibaba_trade_create_service_V2 |
| "create order from chat", "基于沟通下单", "帮我起草订单" | Buyer Draft | icbu_alibaba_trade_create_service_V2 |
| Buying intent without specific product details | Guided Order | Information Gathering |

### Multilingual Trigger Keywords

| Language | Trigger Keywords |
|----------|-----------------|
| English | place order, create order, buy, purchase, checkout, buy now, purchase directly, add to cart, create order from chat, draft order, buyer draft |
| Chinese | 下单, 买, 购买, 创建订单, 直接购买, 立即购买, 现货下单, 我要买这个, 基于沟通下单, 帮我起草订单, 买家拟单, 把讨论的转成订单 |

> **Fallback:** The Agent should identify intent based on semantic understanding in any language.

## SubAgent Delegation

> When this intent is detected by the main Agent, do NOT call MCP tools directly — delegate to the trade SubAgent via `sessions_spawn(agent_id="accio-sourcing-agent-plugin:alibaba-icbu-trade-sub-agent")` and pass the user's query and any relevant context (product ID, order ID, conversation history). **Also pass the current session's client platform as `[Client] <value>`** — read it from the main session's environment info block `Client:` line (`web` / `desktop` / `mobile` / `im channel`) so the SubAgent can populate `clientType` in order MCP calls. If the `Client:` line is absent, do NOT pass it (the SubAgent will then omit `clientType`); never substitute `web` or `Runtime`.

## Ready-to-Ship Direct Link Mode

For stock products (`isTradable: "Y"` in context) with no price dispute:

1. **Collect** `productId` (required), `quantity` (required), and `skuId` (optional — omit if absent; do NOT look it up) from context
2. **Delegate to `alibaba-icbu-trade-buynow-order`** (primary path, supports single or multiple products). Read ALL its `references/` docs before executing. If it succeeds → STOP, task done.
3. **Only on `buynowDegrade=true` or failure** → check `buynowDegradReason`: **(3a)** If `CERTIFIED_WAREHOUSE_OVERSEA_GOODS` → **FULL STOP, no URL fallback.** Inform user this certified overseas product cannot be purchased through this channel. **(3b)** Otherwise → generate `nowBuy.htm` link as fallback. **Use the `generate_now_buy_url` custom tool** (preferred); only if the tool is unavailable, strictly follow `ready-to-ship-flow.md` Step 2-3 template and encoding rules. **NEVER assemble the URL from memory or guesswork.**

**Constraints:** Requires `isTradable: "Y"`. Do NOT call `icbu_alibaba_trade_agent_preview` or `icbu_alibaba_buynow_trade_create_service` directly — they are exclusive to buynow-order. NEVER generate the link without first attempting delegation.

**URL:** `https://biz.alibaba.com/contract/nowBuy.htm?data=[{"productId":"<ID>","skuid":"<SKU_ID>","quantity":<QTY>}]&tracelog=accio` (URL-encoded). If `addressId` is available, append `&addressId=<ADDRESS_ID>` as a separate query parameter. **`&tracelog=accio` is MANDATORY on every generated link** — `generate_now_buy_url` adds it automatically; if assembling manually, you MUST include it.

See [references/ready-to-ship-flow.md](references/ready-to-ship-flow.md) for the complete flow including Step 1.5 delegation, display template, and error handling.

## Draft Preview Delegation

### Draft Preview — `alibaba-icbu-trade-contract-draft-view`

For Direct Order Mode, do **not** call the draft-view MCP tool directly from this skill.
Delegate a **preview-only** subtask to `alibaba-icbu-trade-contract-draft-view` with the
collected `productId`; do not pass the raw ordering utterance as that skill's intent. The
delegated skill owns the underlying MCP query and draft rendering rules.

**Parameter Acquisition Strategy:**

| Parameter | Priority |
|-----------|----------|
| productId | 1. User input → 2. Conversation context → 3. Ask user |

**Preview result expected from delegated skill:**

| Field | Description |
|-------|-------------|
| productInfo | Product name, image, specifications |
| unitPrice / currency | Unit price and currency |
| quantity | Confirmed quantity |
| totalAmount | Calculated total amount |
| shippingInfo | Estimated shipping cost and method |

Use the delegated skill's rendered preview as the confirmation summary. This skill remains responsible for explicit buyer confirmation and the final order creation call.

## MCP Tool Usage

### Order Creation — `icbu_alibaba_trade_create_service_V2`

Before calling, run `accio-mcp-cli search icbu_alibaba_trade_create_service_V2` to get the parameter schema.

**Canonical CLI Call Example:**

Pass `clientType` inside `fieldName_1` alongside the other fields (see acquisition strategy below). `<CLIENT_TYPE>` below is a **placeholder** — replace it with the real value from the environment info block's `Client:` line; never send the literal string `<CLIENT_TYPE>` or the example word `web`.

```bash
accio-mcp-cli call icbu_alibaba_trade_create_service_V2 --json '{"fieldName_1":{"negotiationId":"72f02ef5-68b3-4da0-bfec-5c936a30430e00","clientType":"<CLIENT_TYPE>","scene":"ACCIO_WORK"}}' --raw
```

**Parameter Acquisition Strategy:**

| Parameter | Priority |
|-----------|----------|
| negotiationId | 1. Draft preview / negotiation context → 2. User input → 3. Ask user |
| productId | 1. User input → 2. Draft preview context / notes → 3. Ask user |
| remark | 1. User input → 2. Extract from notes → 3. Optional |
| clientType | **Read the raw value of the `Client:` line in the current environment info block** (`web` / `desktop` / `mobile` / `im channel`). **Omit the field entirely if the `Client:` line is absent/unknown** — never copy the example/placeholder value, never default to `web`, never derive it from `Runtime` |

**Response Key Fields:**

| Field | Description |
|-------|-------------|
| orderId | Created order ID |
| orderStatus | Initial order status |
| totalAmount / currency | Order total |
| paymentUrl | Payment link (if available) |

> **Buyer Draft Mode**: For the detailed flow (notes parsing, summary display, seller review guidance), see [references/buyer-draft-flow.md](references/buyer-draft-flow.md).

## Safety Constraints — Mandatory

### Two-Step Confirmation (MUST EXECUTE)

Order creation is an **irreversible operation**. Before calling `icbu_alibaba_trade_create_service_V2`, ALWAYS:

**Direct Order Mode:**
1. Route to `alibaba-icbu-trade-contract-draft-view` to get the draft preview
2. Display a complete order summary (product, quantity, price, total, shipping)
3. Wait for explicit user confirmation (e.g., "confirm", "yes", "下单")

**Buyer Draft Mode:**
1. Parse and display the order summary from notes (product, quantity, negotiated price, total, seller info)
2. Label the source: "Based on your negotiation with the seller"
3. Wait for explicit buyer confirmation before creating the order
4. After creation, inform: "Order submitted for seller review" and guide to track status

**Prohibited Actions:** Never auto-create orders without explicit confirmation. Never skip the draft preview or order summary display. Never proceed on ambiguous responses. Never auto-submit draft orders. Never create an order without a valid productId.

**Ready-to-Ship Direct Link Mode:** Only use when ALL three conditions are met (stock product, no price objection, direct buy intent). If uncertain, default to inquiry-based path. Inform user of redirect to Alibaba.com checkout.

## General Rules

### Language
- Detect user's input language and respond in the same language
- Keep product names, prices, and order IDs as-is
- Default to English when language cannot be determined

### Error Handling

| Scenario | Response Strategy |
|----------|-------------------|
| MCP tool call fails | Suggest retry later |
| Product not found / Out of stock | Ask user to verify product ID or contact seller |
| Draft preview fails | Fall back to manual summary, still require confirmation |
| Missing required info | Guide user through required fields |
| productId missing (Buyer Draft) | Ask user to provide the product ID or check the negotiation context |

### Result Presentation
- Always show order summary before confirmation
- Display order ID and next steps (payment or seller review) on success
- In Buyer Draft Mode, clearly indicate "Pending seller review" status
- Never expose raw JSON or internal tool names to the user
