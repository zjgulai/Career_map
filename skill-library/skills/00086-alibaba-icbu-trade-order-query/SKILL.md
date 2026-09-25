---
name: alibaba-icbu-trade-order-query
version: 0.7.0
description: >
  Alibaba.com Trade Order Query Skill, for looking up order list and specific order details.
  Triggered when users mention topics related to checking orders, order list, order details,
  order status, or any order-related inquiry.

  Typical utterances:
  - Check my order 634002494782600
  - What's the status of my order?
  - Has my order been shipped?
  - I want to see order details for order number 634002494782600
  - Show me my orders
  - List my recent orders
  - 查看我的订单列表
  - What orders do I have pending payment?
enabled: true
tool_triggers:
  - name: icbu_alibaba_trade_order_detail_query
  - name: icbu_alibaba_trade_order_query_list_buyer
---

# Alibaba.com Trade Order Query

An order query assistant for international buyers, covering order list browsing and single order detail lookup.

## MCP Services

| Capability Module | MCP code | Description |
|---------|----------|------|
| Order List Query | `icbu_alibaba_trade_order_query_list_buyer` | Query buyer's order list with optional status filter and pagination |
| Order Detail Query | `icbu_alibaba_trade_order_detail_query` | Query single order details by order ID (must string) |

## Intent Routing

Based on user input, identify the intent and route to the corresponding capability module.

```
User Input
  │
  ├─ Contains specific order ID (pure digits)
  │   └─► Order Detail Mode → icbu_alibaba_trade_order_detail_query
  │
  ├─ Asks about order status / order detail with order ID
  │   └─► Order Detail Mode → icbu_alibaba_trade_order_detail_query, focus on status fields
  │
  ├─ Asks to list / browse orders (with or without status filter)
  │   └─► Order List Mode → icbu_alibaba_trade_order_query_list_buyer
  │
  ├─ Asks about orders in a certain status (e.g. "pending payment orders")
  │   └─► Order List Mode → icbu_alibaba_trade_order_query_list_buyer with status filter
  │
  └─ Order-related query without order ID and no list intent
      └─► Ask user: want to see order list or look up a specific order?
```

### Intent Recognition Rules

| User Input Characteristics | Intent | Capability Module |
|-------------|------|---------|
| Contains order ID (pure digits, e.g. `634002494782600`) | Order Detail | icbu_alibaba_trade_order_detail_query |
| Asks about "order status", "shipped", "delivered" + has order ID in context | Order Detail | icbu_alibaba_trade_order_detail_query |
| "my orders", "order list", "recent orders", "all orders" | Order List | icbu_alibaba_trade_order_query_list_buyer |
| "pending payment orders", "shipped orders", status-specific list request | Order List (filtered) | icbu_alibaba_trade_order_query_list_buyer |
| Order-related query without order ID and no list intent | Clarification | Ask user for intent |

### Multilingual Trigger Keywords

| Language | Trigger Keywords |
|----------|-----------------|
| English | check order, order detail, order status, has it shipped, my orders, order list, recent orders, pending orders |
| Chinese | 查订单, 订单详情, 订单状态, 发货了吗, 我的订单, 订单列表, 最近的订单, 待付款订单 |
| Spanish | detalle del pedido, estado del pedido, mis pedidos, lista de pedidos |
| French | détail de commande, statut de commande, mes commandes, liste des commandes |

> **Fallback:** The above list is a reference. The Agent should identify intent based on semantic understanding in any language.

## MCP Tool Usage

### Order List Query — `icbu_alibaba_trade_order_query_list_buyer`

Before calling, run `accio-mcp-cli search icbu_alibaba_trade_order_query_list_buyer` to get the full parameter schema.

**Mandatory MCP call format:**

All parameters MUST be wrapped inside `fieldName_0`. Do NOT send `filter` / `currentPage` / `locale` directly at the top level of `--json`. `fieldName_0` is the only top-level required field.

```bash
accio-mcp-cli call icbu_alibaba_trade_order_query_list_buyer --json '{"fieldName_0": {"currentPage": 1, "locale": "en_US", "filter": {"simpleFilter": "simpleFilter@all"}}}'
```

**Parameter Acquisition Strategy** (all parameters live under `fieldName_0`):

| Parameter | Priority |
|-----------|----------|
| `currentPage` | 1. User asks "next page" / "more" → increment by 1 → 2. Default: `1` (number, not string) |
| `locale` | 1. Derive from user's conversation language → Chinese → `zh_CN`, English → `en_US` → 2. Default: `en_US`. **Use underscore `_`, never hyphen `-`** (i.e. never `zh-CN` / `en-US`) |
| `filter.simpleFilter` | 1. Map user's status intent to the fixed value below → 2. Default: `simpleFilter@all`. **Pass the raw `value` string only**, never the Chinese label |
| `filter.fuzzySearchValue` | 1. User provides a keyword (product name, seller name, partial order ID) → pass as string → 2. Default: omit |
| `filter.createDateFilter.from` / `to` | 1. User specifies a date range (e.g. "last 7 days", "本月") → format as `YYYY-MM-DD` strings → 2. Default: omit (no date filter) |
| `filter.orderIds` | 1. User provides one or more order IDs to narrow down → pass as **number array** (note: each id is a number, not string here) → 2. Default: omit |

**`simpleFilter` enum mapping** (always pass the `value`, never the label):

| User Intent (任意语言) | `simpleFilter` value |
|----------------------|----------------------|
| All / 全部 / 所有订单 | `simpleFilter@all` (default) |
| Pending confirmation / 待确认 | `simpleFilter@confirm` |
| Pending payment / 待付款 / 待支付 | `simpleFilter@pay` |
| Pending shipment / 待发货 | `simpleFilter@shipment` |
| Pending receipt / 待收货 | `simpleFilter@confirmShipment` |
| Dispute / Refund / 售后 / 退款 | `simpleFilter@dispute` |
| Finished or closed / 已完成或已关闭 | `simpleFilter@finish` |
| Completed / 已完成 | `simpleFilter@success` |
| Closed / 已关闭 | `simpleFilter@closed` |

> **Note:** The API does NOT accept a `pageSize` parameter — page size is fixed by the backend (typically 10). Do not invent or pass `pageSize`.

**Response Key Fields** (root → `pageData.data[]`):

| Field | Description |
|-------|-------------|
| `pageData.pagination.totalRecord` | Total number of matching orders |
| `pageData.pagination.totalPage` | Total page count |
| `pageData.pagination.currentPage` / `pageSize` | Current page number and page size |
| `pageData.data[]` | Array of order summary items (each is a `TradeListOrderBaseView`) |
| `data[].baseInfo.id` | **Order ID** (string, primary identifier — pass to `icbu_alibaba_trade_order_detail_query` as `tradeId`) |
| `data[].baseInfo.createTime` | Order creation date (formatted string, e.g. `2026-05-18`) |
| `data[].baseInfo.createTimestamp` | Order creation timestamp (ms) |
| `data[].baseInfo.businessType` | Business type (e.g. `trade_assurance`) |
| `data[].baseInfo.fulfillmentChannelText.mcmsValue` | Fulfillment channel display text (e.g. `便捷发货`) |
| `data[].baseInfo.fulfillmentChannel` | Fulfillment channel code (e.g. `TAD`) |
| `data[].baseInfo.buyerTodo` | Buyer pending action code (e.g. `pay`, `none`) |
| `data[].baseInfo.sellerTodo` | Seller pending action code |
| `data[].baseInfo.orderIdTitle` | Localized label for "Order ID" |
| `data[].statusAction.status.displayName` | **Order status display text** (e.g. `待买家支付预付款`); keep as-is, no mapping |
| `data[].statusAction.status.name` | Raw status code (e.g. `unpay`) |
| `data[].statusAction.detailUrl` | Order detail page URL on biz.alibaba.com |
| `data[].statusAction.actions[]` | Available action list for the order |
| `actions[].name` | Action code (e.g. `goto_pay`, `view_tt_detail`, `cancel_order`, `request_modify`, `modify_address`) |
| `actions[].displayName` | Localized action label (e.g. `去支付`, `支付预付款`) |
| `actions[].listTarget` | Action target URL |
| `actions[].highLight` | Whether this action is the primary CTA (only one per order is typically `true`) |
| `data[].paymentInfo.totalAmount.numberStr` | **Order total amount with currency** (e.g. `USD 100.00`) |
| `data[].paymentInfo.advanceAmount.numberStr` | Advance / initial payment amount (may be null for one-phase full pay) |
| `data[].paymentInfo.currency` | Currency code (e.g. `USD`) |
| `data[].paymentInfo.shippingFeeAmount.numberStr` | Shipping fee (may be `USD 0.00`) |
| `data[].paymentInfo.taxFee.numberStr` | Tax fee (optional, may be null) |
| `data[].productInfo.productCount` | Distinct product (SKU group) count in the order |
| `data[].productInfo.productTotalNum` | Total quantity across all products |
| `data[].productInfo.productTotalAmount.numberStr` | Product subtotal with currency |
| `data[].productInfo.products[].name` | Product name |
| `data[].productInfo.products[].imageUrl` | Product image URL (relative `//sc04.alicdn.com/...`, prepend `https:` when rendering) |
| `data[].productInfo.products[].unitPrice.numberStr` | Unit price with currency |
| `data[].productInfo.products[].quantity.numberStr` | Quantity (e.g. `1.00`, `10.00`) |
| `data[].productInfo.products[].unit` | Unit (e.g. `Pieces`) |
| `data[].productInfo.products[].productPriceShowDetail` | Pre-composed price breakdown (e.g. `USD 100.00 x 1`) |
| `data[].buyer.country.simpleName` / `country.name` | Buyer country code / full name |
| `data[].buyer.fullName` | Buyer full name (may be null) |
| `data[].seller.fullName` | Seller display name (may be null; fallback to `merchandiser`) |
| `data[].baseInfo.merchandiser` | Seller merchandiser name (fallback when `seller.fullName` is null) |
| `data[].promotionInfo.tags[]` | Promotion / order tags (e.g. `ta`, `dropshipping`, `small`) |
| `data[].lcInfo.lcOrder` | Whether this is an LC (Letter of Credit) order |

After a successful response, render the list strictly per [`references/order-list-template.md`](references/order-list-template.md). If the user wants to see details for a specific order, switch to Order Detail Mode with the `baseInfo.id` from the list as `tradeId`.

---

### Order Detail Query — `icbu_alibaba_trade_order_detail_query`

Before calling, run `accio-mcp-cli search icbu_alibaba_trade_order_detail_query` to get the parameter schema.

> **Note:** The API parameter name is `tradeId`, but the user-facing term remains "order ID".

**Mandatory MCP call format:**

Always wrap `tradeId` inside `fieldName_0`. Do not send `tradeId` directly at the top level of `--json`.
`tradeId` must be a string value; quote it even when the order ID contains only digits.
Also pass `clientType` inside `fieldName_0` (see acquisition strategy below). `<CLIENT_TYPE>` below is a **placeholder** — replace it with the real value from the environment info block's `Client:` line; never send the literal string `<CLIENT_TYPE>` or the example word `web`.

```bash
accio-mcp-cli call icbu_alibaba_trade_order_detail_query --json '{"fieldName_0": {"tradeId": "300241527001028893", "clientType": "<CLIENT_TYPE>"}}'
```

**Parameter Acquisition Strategy:**

| Parameter | Priority |
|-----------|----------|
| tradeId (= order ID) | 1. User's current input → 2. Active order ID in conversation history → 3. Ask user |
| clientType | **Read the raw value of the `Client:` line in the current environment info block** (`web` / `desktop` / `mobile` / `im channel`). **Omit the field entirely if the `Client:` line is absent/unknown** — never copy the example/placeholder value, never default to `web`, never derive it from `Runtime` |

**Response Key Fields:**

| Field | Description |
|-------|-------------|
| tradeId / orderDetailUrl | Order ID and detail link (top-level fields) |
| data.orderInfoVO.createTime.simpleDateStr | Order creation date |
| data.pcStatusActionVO.name.value | Raw status label (e.g. `Shipment started`); keep as-is, no mapping |
| data.pcStatusActionVO.pcActions | Payment action list; find item where `name === "goto_pay"` and use its `url` as payment link |
| data.shipmentVO.shipmentLabel.value | Shipment status label (e.g. `Pending dispatch`) |
| data.shipmentVO.shipmentMethod.value | Shipment method (e.g. `Express`) |
| **data.paymentVO.fullPayReceived** | **Boolean. `true` ⇒ order has been fully paid; suppress payment CTA and show "Fully paid" badge on the card** |
| data.paymentVO.fullPay | Whether the order is one-phase full pay |
| data.contractVO.subjectMatterVO.products[].name / snapshotImage | Product name and image for the order card |
| data.contractVO.subjectMatterVO.skuQuantity | SKU variations count |
| data.contractVO.subjectMatterVO.productTotalQuantity | Total product quantity |
| data.contractVO.terms.payment.actualBuyerPayment.amountStr | Buyer total payable across the order's lifecycle |
| **data.paymentVO.nowShouldPaymentWithTax.amountStr** | **Current payable amount (with tax) for this phase — the primary highlighted figure on the card. Do NOT substitute with `advanceAmount`, `balanceAmount` or `actualBuyerPayment`** |
| data.contractVO.terms.payment.actualSummaryTotal.amountStr | Contract subtotal |
| data.contractVO.terms.payment.advanceAmount.amountStr | Initial / advance payment |
| data.contractVO.terms.payment.balanceAmount.amountStr | Balance amount (may be empty for one-phase full pay) |
| data.contractVO.terms.payment.originVatFeeAmount.amountStr | VAT / GST tax amount; show only when > 0 |
| data.contractVO.terms.payment.originRstAmount.amountStr | RST / Sales tax amount; show only when > 0 |
| data.contractVO.terms.payment.dutyAmount.amountStr | Import charges (duty); show only when > 0 |
| data.contractVO.terms.shipment.tradeTerms | Trade terms (e.g. `DDP`) |
| data.contractVO.terms.shipment.shipmentMarketFee.amountStr | Shipping fee; show only when > 0 |
| data.contractVO.terms.shipment.shipmentAssuranceFee.amountStr | Shipping insurance fee; show only when > 0 |
| data.contractVO.isShowViewContract | Whether to show "View Contract" entry |

After a successful MCP response, render the order card strictly per [`references/order-card-template.md`](references/order-card-template.md). Do not invent fields and do not reorder the card layout.

## Order Status Handling

Do not map order status codes to display labels. Use the raw `orderStatus` value from the MCP response as-is.

## General Rules

### Language
- Detect user's input language and always respond in the same language
- Keep raw data values (order IDs, status codes, product names) as-is
- Translate UI labels and prompts to user's language
- Default to English when language cannot be determined

### Error Handling

| Scenario | Response Strategy |
|----------|-------------------|
| MCP tool call fails | Inform user the service is temporarily unavailable, suggest retrying later |
| Order ID not found | Ask user to verify the order ID; provide the order management page link for reference |
| Order not viewable / permission denied | Inform the user and provide the order management page link |
| Order list returns empty | Inform user no orders match the criteria; suggest adjusting filters |
| Missing required parameters | Politely ask for the order ID |

**Order Management Page URL (固定链接，禁止自行编造)**:

When the agent needs to direct users to the order management page (e.g., when an order cannot be viewed, order ID is invalid, or the user needs to browse their orders manually), use ONLY this URL:

```
https://biz.alibaba.com
```

> ⚠️ **NEVER fabricate or guess order management page URLs.** Do NOT use `biz.alibaba.com/ta/order_list.htm` or any other made-up path. The only valid order management page URL is `https://biz.alibaba.com`.

### Result Presentation

**Order List:**
- **Mandatory**: whenever `icbu_alibaba_trade_order_query_list_buyer` returns successfully, you MUST render the result strictly per the Order List Template at [`references/order-list-template.md`](references/order-list-template.md). No exceptions, no improvisation, no bullet-list fallback.
- The list has three fixed sections (List Header → Order List Table → Pagination Hint) — render in this order, all as Markdown tables/text per the template
- The Order List Table has eight fixed columns in this exact order: **# | Order ID | Product Name | SKU | Status | Created | Total | Action**
  - **Product Name** column = product image (if present) + product name on the same cell; image always precedes the name
  - **SKU** column = SKU description × quantity (e.g. `无规格 × 1 件` / `No SKU × 10 Pieces`)
  - **Action** column = **ONLY** the order detail link (`statusAction.detailUrl`). Do NOT render primary action buttons (`goto_pay` / `view_tt_detail` / `cancel_order` etc.) — the detail link is the only allowed entry
- Show total count and current page info from `pageData.pagination`
- Prompt user they can ask for details on any specific order using the order ID returned in column 2

**Order Detail:**
- **Mandatory**: render via the fixed Order Card Template at [`references/order-card-template.md`](references/order-card-template.md). The card has four sections (Product / Negotiation Summary / Order summary / Pay now) and **all of them must be rendered as Markdown tables** — never use bullet lists.
- Product table: one row per product with image and name; merge surplus into `+N more products` if > 3.
- Negotiation Summary table (always visible): SKU variations (`skuQuantity`, only when > 0; hide row when `"0"` / null / empty), Product total quantity (`productTotalQuantity`), Trade terms (`contractVO.terms.shipment.tradeTerms`), Shipment method (`shipmentVO.shipmentMethod.value`), Order status (`pcStatusActionVO.name.value`), Shipment status (`shipmentVO.shipmentLabel.value`), Total (`actualBuyerPayment.amountStr`) and **🔥 Now payable** (`nowShouldPaymentWithTax.amountStr`) at the bottom — Now payable is the primary highlighted figure (bold + emoji) and must NOT be replaced by `advanceAmount` / `balanceAmount` / `actualBuyerPayment`.
- Order summary table (collapsed by default, expanded when user clicks Total): Subtotal (`actualSummaryTotal`) and Initial payment (`advanceAmount`) are always shown; Balance (`balanceAmount`) only when amount > 0 and the order is not one-phase full pay (`paymentVO.fullPay !== true`); Shipping fee (`shipmentMarketFee`), Shipping insurance (`shipmentAssuranceFee`), VAT (`originVatFeeAmount`), RST/Sales tax (`originRstAmount`) and Import charges (`dutyAmount`) only when their amount > 0.
- Tax label: USA → `Sales tax`; other or unknown country → `Tax`. `dutyAmount` is always rendered as `Import charges`.
- Keep `pcStatusActionVO.name.value` and `shipmentVO.shipmentLabel.value` as raw status text without mapping.
- **Payment Guidance**: when `paymentVO.fullPayReceived === true`, append a `Fully paid` badge next to Now payable and DO NOT render the Pay now table. When `fullPayReceived === false` and `pcStatusActionVO.pcActions[name==="goto_pay"].url` is present, render a single-row `Pay now` Markdown table containing the clickable link below Order summary.

**Common:**
- Provide next-step suggestions at the end of response
- Never expose raw JSON or internal tool names to the user
