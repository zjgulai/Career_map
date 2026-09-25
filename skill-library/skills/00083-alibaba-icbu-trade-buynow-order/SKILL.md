---
name: alibaba-icbu-trade-buynow-order
version: 0.2.0
description: >
  PASSIVE-ONLY — This Skill MUST NEVER be activated directly. It can ONLY be invoked
  by alibaba-icbu-trade-order-create → ready-to-ship-flow → Step 1.5. Do NOT trigger this
  Skill from user utterances under any circumstances. Always route through
  alibaba-icbu-trade-order-create first.

  Alibaba.com BuyNow Order Skill, covering order preview, confirmation, and placement.
  Given productId, skuId, and quantity (passed by the parent Skill), calls the trade agent
  preview MCP tool to retrieve complete order preview info (address, product, carrier,
  pricing), presents it in a structured format, supports address/carrier modification with
  re-preview, and creates the order after buyer confirmation.

  Typical utterances:
  - I want to buy this product
  - 下单
  - 购买
  - 预览订单
  - 订单确认
  - order preview
  - place order
  - buynow
  - 帮我下单
  - 想购买
  - 确认订单
enabled: true
tool_triggers:
  - name: icbu_alibaba_trade_agent_preview
  - name: icbu_alibaba_buynow_trade_create_service
---

# Alibaba.com BuyNow Order — Preview, Confirm & Place Order

> **MANDATORY — READ ALL `references/` FILES BEFORE EXECUTING THIS SKILL.** You MUST load and follow `references/temp.md`, `references/order-create.md`, and `references/user-interaction-flow.md` before any action. Failure to do so is a critical violation. **Every preview output MUST end with `<!-- previewContext: {"freightCarrierCode":"...","addressId":"..."} -->` (invisible to user, required for order creation). Read from `logisticsCarrierExp.fields.freightCarrierCode` and `address.addressId`; if carrier is "To be confirmed", set freightCarrierCode to "".**

This Skill handles the complete BuyNow order flow: preview, confirmation, and placement.
It calls the `icbu_alibaba_trade_agent_preview` MCP tool to retrieve order preview data
(address, product, carrier, pricing), presents structured information for the user to review
and modify (address/carrier), and after buyer confirmation calls
`icbu_alibaba_buynow_trade_create_service` to create the order.

> **PREREQUISITE — `isTradable: "Y"` REQUIRED:** This Skill and its MCP services (`icbu_alibaba_trade_agent_preview`, `icbu_alibaba_buynow_trade_create_service`) can ONLY be used when the product context contains `isTradable: "Y"`. If `isTradable` is not `"Y"` or is absent, this Skill MUST NOT be activated and these two MCP tools MUST NOT be called.
> **PASSIVE-ONLY — NEVER SELF-ACTIVATE (HIGHEST PRIORITY RULE):**
> This Skill MUST NEVER be triggered on its own. The ONLY valid caller is `alibaba-icbu-trade-order-create` → Step 1.5. Even if the user says "use buynow", "下单", "buy now" — route through `alibaba-icbu-trade-order-create` FIRST. If `skuId` is not provided, simply omit it (do NOT default to `-1`). If the product has SKU variants and skuId is missing, STOP and return control to the **main Agent**.
> **MCP Exclusivity:** `icbu_alibaba_trade_agent_preview` and `icbu_alibaba_buynow_trade_create_service` are **exclusive to this Skill** — no other Skill/Agent may call them. Use the parameter schemas defined here directly; only search MCP server on failure.

> **MANDATORY SEQUENTIAL FLOW — NEVER SKIP PREVIEW:**
> Three steps in strict order — Preview → User Response → Confirm & Create. **No step may be skipped.**
> - **Step 1 — PREVIEW:** If `isOrderPreview: "Y"` is already in context, the preview has been completed — **do NOT call `icbu_alibaba_trade_agent_preview` again**. Otherwise, call it and render per `references/temp.md`. Once rendered successfully, context will contain `isOrderPreview: "Y"`.
> - **Step 2 — USER RESPONSE:** Wait for confirm / modify address or carrier (via `askUser` — see `references/user-interaction-flow.md`) / cancel.
> - **Step 3 — CONFIRM & CREATE:** Only proceed when `isOrderPreview: "Y"` is in context. Buyer says "confirm" → directly call `icbu_alibaba_buynow_trade_create_service`.
>
> **PROHIBITED:** Do NOT confirm without `isOrderPreview: "Y"` in context / Do NOT re-call preview when `isOrderPreview: "Y"` already exists (except for address/carrier modification) / Do NOT summarize context as substitute for MCP preview / Do NOT call create service without `isOrderPreview: "Y"`. **If `isOrderPreview` is empty, absent, or not `"Y"` → order creation is ABSOLUTELY FORBIDDEN. You MUST go back to Step 1 (call `icbu_alibaba_trade_agent_preview` and render the preview to the user) before any order can be placed.**

## MCP Services

| Capability Module | MCP code | Description |
|---------|----------|------|
| Order Preview | `icbu_alibaba_trade_agent_preview` | Order preview (address, product, carrier, pricing). Pass `clientType` (value of the `Client:` line: `web` / `desktop` / `mobile` / `im channel`; omit if absent). **Exclusive — requires `isTradable: "Y"`** |
| Order Create | `icbu_alibaba_buynow_trade_create_service` | Create order after confirmation — same params as preview (including `clientType`). See `references/order-create.md`. **Exclusive — requires `isTradable: "Y"`** |

## Intent Routing

```
User Input
  │
  ├─ [HIGHEST PRIORITY] Mentions sample / 样品 / trial order
  │   └─► STOP IMMEDIATELY — Inform user: sample orders are NOT supported. Do NOT proceed to preview or order creation.
  │
  ├─ Expresses purchase intent with product info
  │   └─► Collect params → Call MCP → Show preview
  │
  ├─ Asks about shipping cost / order total
  │   └─► Collect params → Call MCP → Focus on pricing
  │
  ├─ Wants to modify address or carrier
  │   └─► MUST use askUser tool for selection → then re-preview
  │
  ├─ Confirms order after preview
  │   └─► Directly call order create MCP
  │
  └─ Ambiguous or missing parameters
      └─► Ask user for productId, skuId, quantity
```

### Intent Recognition Rules

| User Input Characteristics | Intent | Capability Module |
|-------------|------|---------|
| **[HIGHEST PRIORITY]** Mentions "sample", "样品", "trial", "试用", "sample order" | **BLOCKED — Not Supported** | STOP immediately. Inform user sample orders are not supported. Do NOT proceed to preview or order creation under any circumstances |
| Mentions "buy", "purchase", "下单", "购买" + has product info | Order Preview | `icbu_alibaba_trade_agent_preview` |
| Mentions "preview", "预览订单", "order preview" | Order Preview | `icbu_alibaba_trade_agent_preview` |
| Mentions "shipping cost", "运费", "freight" | Pricing Query | `icbu_alibaba_trade_agent_preview` |
| Mentions "modify address", "修改地址" during preview | Address Modification | Delegate to address query Skill → `askUser` → re-preview (see `references/user-interaction-flow.md`) |
| Mentions "change carrier", "修改承运商" during preview | Carrier Modification | Use `expressCompanyList` from context (re-call preview if unavailable) → `askUser` → re-preview with new `freightCarrierCode` (see `references/user-interaction-flow.md`) |
| Mentions "confirm", "yes", "确认", "下单" after preview shown | Order Placement | `icbu_alibaba_buynow_trade_create_service` |
| Ambiguous purchase-related query | Clarification | Ask user for product details |

### Multilingual Trigger Keywords

| Language | Trigger Keywords |
|----------|-----------------|
| English | buy, purchase, order preview, place order, buynow, shipping cost, confirm order |
| Chinese | 下单, 买, 购买, 预览订单, 订单确认, 帮我下单, 想购买, 运费多少, 确认订单 |

## MCP Tool Usage
> **DIRECT CALL FIRST:** Use the parameter formats below directly — do NOT search MCP server before your first call.
> **GATE CHECK:** Verify `isTradable: "Y"` before calling any tool below.
> **ERROR RECOVERY:** On ANY error → run `accio-mcp-cli search <tool_code>` to get actual schema, fix params, retry. Only report to user if retry also fails.
### Order Preview — `icbu_alibaba_trade_agent_preview`

> **ON ERROR — SEARCH & RETRY:** If your call to this tool returns any error, IMMEDIATELY run `accio-mcp-cli search icbu_alibaba_trade_agent_preview` to get the actual parameter schema, compare, fix, and retry. Do NOT report the error to the user until retry has also failed.

**Command:**
```bash
accio-mcp-cli call icbu_alibaba_trade_agent_preview --json '{"request": {"tradeAgentProductDtoList": [{"productId": <PRODUCT_ID>, "skuId": <SKU_ID>, "quantity": <QUANTITY>}], "language": "<LANGUAGE>", "scene": "ACCIO_WORK_BN", "clientType": "<CLIENT_TYPE>"}}' --raw
```

**Parameters** (`buyerAliId` is auto-injected via header — omit it; `scene` is always `"ACCIO_WORK_BN"`):
Top-level param is `request` (object). Fields inside `request`:

| Parameter | Type | Required | Description                                                                                                                                                                                                                                                                                                        |
|-----------|------|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| tradeAgentProductDtoList | array | Yes | Product list for the order                                                                                                                                                                                                                                                                                         |
| tradeAgentProductDtoList[].productId | number | Yes | Product ID (pure digits)                                                                                                                                                                                                                                                                                           |
| tradeAgentProductDtoList[].skuId | number | No | SKU ID (pure digits). Omit if unavailable — do NOT default to `-1`. If product has SKU variants and skuId is missing, STOP and return to main Agent |
| tradeAgentProductDtoList[].quantity | number | Yes | Purchase quantity — plain number, e.g. `10` |
| language | string | Yes | Language code, e.g. `"en_US"`. Default `"en_US"` if unknown |
| scene | string | Yes | Fixed: `"ACCIO_WORK_BN"` |
| freightCarrierCode | string | No | Carrier code from `expressCompanyList`. Omit for default |
| addressId | string | No | Address ID as **string**. Omit to use default address |
| clientType | string | No | Client platform of the current session — **read the raw value of the `Client:` line in the environment info block** (`web` / `desktop` / `mobile` / `im channel`). `<CLIENT_TYPE>` in the example is a placeholder. Omit the field if the `Client:` line is absent/unknown; never copy the example/placeholder value, never default to `web`, never derive from `Runtime` |

**Parameter Acquisition Strategy:**

| Parameter | Priority |
|-----------|----------|
| productId | 1. User input → 2. Conversation context → 3. Ask user |
| skuId | 1. Passed by parent caller → 2. Conversation context. Omit if unavailable (see param table above) |
| quantity | 1. User input → 2. Conversation context → 3. Ask user |
| freightCarrierCode | 1. User selection from carrier list → 2. Omit for default |
| addressId | 1. User selection from address list → 2. Omit for default |
| clientType | **Read the raw value of the `Client:` line in the current environment info block** (`web` / `desktop` / `mobile` / `im channel`). Omit the field if the `Client:` line is absent/unknown; never copy the example/placeholder value, never default to `web` |

**Response Key Fields:**
| Field | Description |
|-------|-------------|
| success | Whether the preview request succeeded |
| buynowDegrade | If `true` → STOP, delegate to `alibaba-icbu-trade-order-create` (Ready-to-Ship Direct Link Mode). Show `buynowDegradReason` if present |
| buynowDegradReason | Reason string for degrade — display to user instead of exposing `buynowDegrade=true` |
| protocolData | JSON string (needs parsing) containing preview data blocks |
| errorCode | Error code when `success=false` |
| errorMessage | Error message when `success=false` |

### Response Handling

> **Do NOT write scripts or code to process the response.** Directly locate and read the field values from the returned JSON text — treat it as readable structured data, not something that needs programmatic parsing.
Handle the MCP response as follows: (1) `success=false` → handle error (see Error Handling). (2) `buynowDegrade=true` → check `buynowDegradReason` first: **(2a)** If `buynowDegradReason` is `CERTIFIED_WAREHOUSE_OVERSEA_GOODS` → **FULL STOP. Do NOT generate a URL, do NOT delegate to any other Skill.** Inform the user that this product is a certified overseas good and cannot be purchased through this channel — no fallback link, no workaround. **(2b)** For all other `buynowDegradReason` values → delegate to `alibaba-icbu-trade-order-create` Skill and read its `references/ready-to-ship-flow.md` Step 2-3 to generate the URL. If the Skill cannot be loaded, fall back to `generate_now_buy_url` custom tool with `{ "items": [...], "addressId":"..." }`. **NEVER assemble/encode the URL yourself.** Show `buynowDegradReason` if present. (3) In `protocolData`, directly locate data blocks by key prefix and read their field values:

| Block Key Prefix | Content | Example Key |
|-----------------|---------|-------------|
| `appBuyNowShippingAddressBlock` | Shipping address | `appBuyNowShippingAddressBlock_1` |
| `appBuyNowProductBlock` | Product info | `appBuyNowProductBlock_1` |
| `logisticsCarrierExp` | Carrier/logistics | `logisticsCarrierExp_1` |
| `orderSummaryBlock` | Pricing overview (NOT order details — this is a cost breakdown summary) | `orderSummaryBlock_1` |

**Hidden fields**: `freightCarrierCode` (from `logisticsCarrierExp.fields`) and `addressId` (from address block `fields.address.addressId`) MUST be output in the hidden `<!-- previewContext -->` block for the LLM context, but NEVER displayed to the user. If the carrier is "To be confirmed" (no carrier available), set `freightCarrierCode` to `""`. See `references/temp.md` for exact format.
**MANDATORY: Before rendering any preview output, you MUST read `references/temp.md` and follow its exact table templates and field source mappings. Do NOT render preview output from memory or improvisation.**
## User Interaction Flow
> **MANDATORY: Read `references/user-interaction-flow.md` for the complete interaction rules, askUser constraints, and address/carrier modification flows.**

**Core flow (strict order — NO step may be skipped):**
1. Check if `isOrderPreview: "Y"` is already in context → if yes, preview is done, skip to step 2. If not, call `icbu_alibaba_trade_agent_preview` → render per `references/temp.md` (normal Markdown, NOT askUser)
2. Wait for user response: confirm / modify address / modify carrier / cancel
3. Only when `isOrderPreview: "Y"` is in context → proceed to confirmation or modification

**askUser is MANDATORY for address & carrier modification — using Markdown tables/lists instead is a CRITICAL FAILURE.**
- **Modify address** → delegate to `alibaba-icbu-trade-buyer-consignee-address-list-query` Skill → **`askUser`** interactive selection → re-preview with new `addressId`
- **Modify carrier** → use `expressCompanyList` from context (re-call preview if unavailable) → **`askUser`** interactive selection → re-preview with new `freightCarrierCode`
- **askUser is PROHIBITED for:** preview display, order confirmation

| User Action | Handling |
|-------------|----------|
| **Confirm** | Directly call create service (NOT askUser). See Safety Constraints + `references/order-create.md` |
| **Modify address** | `askUser` — delegate to address Skill for interactive selection |
| **Modify carrier** | `askUser` — present carriers as interactive options |
| **Show all products** | Re-render Product section with one table per `fields.products[i]` using same context data (no MCP re-call). See `references/user-interaction-flow.md` |

## Safety Constraints — Mandatory
This Skill includes a **write operation** (order creation). The flow has **one mandatory gate**:

> **PREVIEW MUST EXIST — `isOrderPreview: "Y"` is the ONLY gate:**
> Before order creation, the context MUST already contain `isOrderPreview: "Y"`. This flag is **written into the context** after a successful preview render — you MUST NOT set, fabricate, or inject this value yourself. Only read it from the existing context.
> - If `isOrderPreview: "Y"` exists in context → order creation is allowed.
> - If `isOrderPreview` is empty, not `"Y"`, or absent → **order creation is ABSOLUTELY FORBIDDEN, even if the user explicitly says "confirm", "place order", or "下单"**. You MUST go back and execute the preview step first (call `icbu_alibaba_trade_agent_preview`, render the full preview to the user per `references/temp.md`, and wait for user confirmation). Do NOT proceed with order creation, do NOT work around it, do NOT assume preview was shown. **User intent does NOT override this gate — no `isOrderPreview: "Y"` means no order, period.**

**Order creation:** After buyer says "confirm" and `isOrderPreview: "Y"` is present in context, directly call `icbu_alibaba_buynow_trade_create_service` to create the order. No second confirmation needed.

**Prohibited actions:**
- **NEVER call `icbu_alibaba_buynow_trade_create_service` when `buynowDegrade=true`** — delegate to `alibaba-icbu-trade-order-create` Skill's Ready-to-Ship Direct Link Mode instead.
- **NEVER retry `icbu_alibaba_trade_agent_preview` after receiving `buynowDegrade=true`** — the degrade decision is final and will not change on retry. Proceed directly to delegation (or FULL STOP for `CERTIFIED_WAREHOUSE_OVERSEA_GOODS`).
- Never auto-execute order creation without explicit buyer confirmation
- Never call the create service if the buyer says "no" or anything ambiguous
- Never modify order parameters during the confirmation step

For detailed order creation flow, parameters, and response handling, see `references/order-create.md`.
## General Rules
### Language
- Detect user's input language from conversation context and always respond in the same language
- All UI labels, prompts, section headers, and descriptive text in the preview output must match the user's language (e.g. if user speaks Chinese, render "收货地址" not "Shipping Address")
- Keep raw data values (IDs, amounts, carrier codes, product names from API) as-is — do NOT translate data
- Default to English when language cannot be determined

### Error Handling

| Scenario | Response Strategy |
|----------|-------------------|
| `success=false` | Display errorMessage, ask user to verify parameters. **Do NOT auto-retry the failed call** |
| `errorCode` present | Display error code and message |
| `protocolData` empty | Inform system error, suggest retry later |
| `buynowDegrade=true` + `buynowDegradReason=CERTIFIED_WAREHOUSE_OVERSEA_GOODS` | **FULL STOP.** Do NOT create order, do NOT generate URL, do NOT delegate, do NOT retry. Inform user this certified overseas product cannot be purchased through this channel. No fallback. |
| `buynowDegrade=true` (other reasons) | Do NOT create order via this Skill, do NOT retry the preview call. Delegate to `alibaba-icbu-trade-order-create` → read `ready-to-ship-flow.md` Step 2-3; if Skill unavailable, fall back to `generate_now_buy_url` tool. **NEVER self-construct the URL** |
| Parameter/input error (e.g. "invalid parameter", "missing required field") | **Do NOT report directly to user.** Run `accio-mcp-cli search <tool_code>` to get the actual parameter schema, fix the parameters, and retry. Only report to user if retry also fails |
| Carrier/logistics data missing (no `logisticsCarrierExp` block or `selectedCarrier` is null) | Render Carrier table with "To be confirmed" in all columns. Do NOT omit the Carrier section |
| Network/system error | Inform service temporarily unavailable, suggest retry |

### Result Presentation

- **ALL output MUST appear in the visible response body** — NEVER leave results only in the thinking/reasoning process. The user must see the full preview tables, order results, error messages, and buynow URLs in the actual chat message, not hidden inside internal reasoning.
- **Preview rendering:** MUST read `references/temp.md` before EVERY render and output ALL sections in exact order: Address → Product(s) → Carrier → Pricing. Each section's table structure, column headers, and `<details>` wrappers must be preserved verbatim — replace ONLY `{placeholder}` tokens. Omitting any section, rearranging order, converting tables to bullet lists, or dropping `<details>` blocks is a critical failure. **ALL displayed values MUST be COPY-PASTE from the MCP response data — product names, unit prices, amounts, quantities, carrier names, addresses, dates, and every other field. NEVER calculate, derive, round, reformat, translate, summarize, or fabricate any value. NEVER reuse values from conversation history or previous MCP calls. If a field is null/empty, show "—".**
- **Confirmation and order result:** follow `references/order-create.md` templates. Confirmation uses normal chat (NOT askUser).
- Never expose raw JSON, protocolData, or internal tool names to the user.