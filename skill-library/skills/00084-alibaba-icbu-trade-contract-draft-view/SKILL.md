---
name: alibaba-icbu-trade-contract-draft-view
version: 0.3.1
description: >
  Alibaba.com Trade Contract Draft **Preview** Skill — read-only viewer for the current
  negotiation contract draft (products, payment schedule, logistics terms) with confirmation
  status indicators. **Preview only — does NOT validate orderability.** When the user wants
  to place an order, route to `alibaba-icbu-trade-agent-guide` first for field-completeness
  validation, not this skill.

  Typical utterances (preview intent only):
  - Show me the current draft contract
  - What are the terms in our draft?
  - Preview the negotiation contract
  - 查看草稿合同
  - 显示当前合同草稿内容
  - 预览谈判条款

  Do NOT trigger on: "place order", "下单", "能不能下单", "缺什么字段" — those route to
  `alibaba-icbu-trade-agent-guide` (and `alibaba-icbu-trade-order-create` for execution).
enabled: true
tool_triggers:
  - name: icbu_alibaba_trade_order_draft_view_V2
  - name: parse_contract_draft
---

# Alibaba.com Trade Contract Draft View (Preview Only)

A **read-only** contract draft viewer for international trade negotiations. Renders the
current negotiation contract draft (products, payment, logistics) with status badges
indicating which fields are mutually confirmed vs. still under negotiation.

> **Scope:** This skill is for **preview/inspection only**. It does NOT determine whether
> an order can be placed. For order-readiness checks, missing-field guidance, or any
> "can I place an order?" intent, use `alibaba-icbu-trade-agent-guide` instead.

## Scope & Boundaries

| In scope (use this skill) | Out of scope (route elsewhere) |
|---------------------------|-------------------------------|
| Render the full draft contract for the user to read | Validate whether the contract is orderable → `alibaba-icbu-trade-agent-guide` |
| Show which negotiation fields are agreed vs. pending | Identify missing fields blocking order/payment → `alibaba-icbu-trade-agent-guide` |
| Display product / payment / logistics terms by section | Create / submit an order → `alibaba-icbu-trade-order-create` |
| Show the `negotiationId` for downstream use | Decide routing for "下单 / place order" intents → `alibaba-icbu-trade-agent-guide` (Step 1 of inquiry-based order workflow) |

> **Hard rule:** If the user expresses any intent that includes ordering, purchasing,
> checkout, or asks "can I order / 能不能下单 / 缺什么字段", **stop and route to
> `alibaba-icbu-trade-agent-guide`** for the field-completeness gate. Do NOT use this
> skill's output as a substitute for that validation.

## MCP Services

| Capability Module | MCP code | Description |
|---------|----------|------|
| Contract Draft Query | `icbu_alibaba_trade_order_draft_view_V2` | Fetch negotiation contract draft by product ID (server resolves the buyer-seller contract automatically) |

## Intent Routing

```
User Input
  │
  ├─ Mentions "place order / 下单 / buy / checkout / 能不能下单 / 缺什么字段"
  │   └─► STOP. Route to `alibaba-icbu-trade-agent-guide` for orderability validation.
  │       (Do NOT use this skill — it cannot tell the user whether they can place an order.)
  │
  ├─ Pure preview intent: view / show / preview contract draft or negotiation terms
  │   ├─ Has productId in context
  │   │   └─► Query draft → render full contract summary (read-only preview)
  │   └─► No productId available
  │       └─► Ask user to provide the product ID
  │
  └─ Asks about a specific section (price / payment / shipping) without ordering intent
      └─► Query draft → render the relevant section only
```

### Intent Recognition Rules

| User Input Characteristics | Intent | Capability Module |
|-------------|------|---------|
| "place order", "buy", "checkout", "下单", "购买", "能不能下单", "缺什么字段", "what's missing for the order" | **Order intent — NOT preview** | **Route to `alibaba-icbu-trade-agent-guide`** |
| "draft contract", "draft terms", "negotiation draft", "preview", "查看草稿", "预览合同" | View Draft (preview only) | `icbu_alibaba_trade_order_draft_view_V2` |
| "what price did we agree", "payment schedule", "shipping terms" (no order intent) | View Specific Section | `icbu_alibaba_trade_order_draft_view_V2` |
| No productId in context | Clarification | Ask user for product ID |

> **Disambiguation tip:** When the user's utterance mixes preview wording with order
> wording (e.g., "preview the contract so I can place an order"), treat it as **order
> intent** and route to `alibaba-icbu-trade-agent-guide`. The agent-guide flow already
> includes a draft preview step when needed.

### Multilingual Trigger Keywords

| Language | Trigger Keywords |
|----------|-----------------|
| English | draft contract, negotiation draft, contract terms, preview contract, draft terms |
| Chinese | 草稿合同, 合同草稿, 谈判条款, 预览合同, 查看草稿 |

> **Fallback:** The above list is a reference. The Agent should identify intent based on semantic understanding in any language.

## SubAgent Delegation

> When this intent is detected by the main Agent, do NOT call MCP tools directly — delegate to the trade SubAgent via `sessions_spawn(agent_id="accio-sourcing-agent-plugin:alibaba-icbu-trade-sub-agent")` and pass the user's query and any relevant context (product ID, order ID, conversation history).

## MCP Tool Usage

### Contract Draft Query — `icbu_alibaba_trade_order_draft_view_V2`

**Command (MUST follow this exact format):**
```bash
accio-mcp-cli call icbu_alibaba_trade_order_draft_view_V2 --json '{"fieldName_1":{"language":"en_US","productId":"<PRODUCT_ID>"}}' --raw
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| fieldName_1.language | string | Yes | Fixed value `"en_US"` |
| fieldName_1.productId | string | Yes | Product ID (pure digits, passed as **string**). The server resolves the negotiation contract between the current buyer and seller based on this product. |

> **IMPORTANT:** The parameter structure is a nested object under `fieldName_1`. `productId` must be a **string** (quoted), not a number. Always include `language: "en_US"`.

**Parameter Acquisition Strategy:**

| Parameter | Priority |
|-----------|----------|
| fieldName_1.productId | 1. Active productId in conversation context → 2. User's current input → 3. Ask user to provide it |

**Response Key Fields:**

| Field                                                      | Description                                                     |
| ------------------------------------------------------------| -----------------------------------------------------------------|
| success                                                    | Whether the query succeeded                                     |
| negotiationId                                              | Confirmed negotiation ID                                        |
| negotiationContract.subjectMatterNegotiationTerm.details[] | Product line items (name, quantity, unit, unitPrice)            |
| negotiationContract.paymentNegotiationTerm                 | Payment terms (totalAmount, payment phases)                     |
| negotiationContract.logisticsNegotiationTerm.details[]     | Logistics terms (method, tradeTerm, address, shipmentDate, fee) |

> **Field value schema:** Each negotiable field has three key properties:
> - `buyerValue` — the current value (may be a JSON string — parse before display). When `buyerValueStatus=confirmed`, this is a mutually agreed value; when `negotiating`, this is only the buyer's unilateral proposal pending seller confirmation.
> - `buyerValueStatus` — `"confirmed"` (both parties agreed on `buyerValue`) / `"negotiating"` (buyer's proposal, seller hasn't confirmed)
> - `confirmed` + `confirmValue` — whether both parties have formally locked in `confirmValue` as the final agreed value
>
> Always use `*NegotiationTerm` paths; ignore the `tradeTerms` aggregate (it duplicates the same data).

> **Note:** Both this Skill and `alibaba-icbu-trade-order-create` use the same MCP tool with `productId`. This Skill focuses on rendering the current negotiation state; order-create uses it as a draft preview before placement. **For pre-order field-completeness validation, use `alibaba-icbu-trade-agent-guide` — this skill is preview-only.**

See [references/draft-view-rendering.md](references/draft-view-rendering.md) for detailed field parsing and display rules.

**Post-processing preference:** After a successful MCP response, first try the custom JS
tool `parse_contract_draft` with `{ "rawDraftResponse": <raw MCP response> }`. Prefer its
`markdown` output for the final response, or its `sections` rows when localizing labels.
Only fall back to manual rendering via `references/draft-view-rendering.md` if the JS tool
is unavailable or returns an error.

## General Rules

### Language
- Detect user's input language and always respond in the same language
- Parse all `buyerValue` JSON strings before displaying (amounts, addresses, dates, skuAttributes)
- Translate UI labels and section headings; keep product names and IDs as-is
- Default to English when language cannot be determined

### Error Handling

| Scenario | Response Strategy |
|----------|-------------------|
| `success: false` in response | Show errorMessage to user; suggest retrying or contacting support |
| MCP tool call fails | Inform user the service is temporarily unavailable, suggest retrying later |
| No negotiation contract found for product | Ask user to verify the product ID or check if a negotiation has been started |
| Missing required parameters | Politely ask user to provide the product ID |

### Result Presentation
- **MANDATORY: ALL data MUST be rendered using Markdown tables (Field | Value | Status). Never use bullet lists, plain text, or any other format to present contract data.**
- Display `negotiationId` at the top of the response. Internally remember this ID in conversation context — it is required when placing an order later. Do NOT show any reminder text to the user about remembering it.
- Render the contract draft in three sections: **Products**, **Payment**, **Logistics** — each as a Markdown table
- Prefix each field with a status badge based on `buyerValueStatus`:
  - `✅ Agreed` — both buyer and seller have confirmed this value
  - `🔄 Buyer Proposal` — buyer's unilateral proposal, pending seller confirmation
- Parse JSON-string values in `buyerValue` before displaying (amounts, addresses, dates)
- Format monetary amounts as `{currency} {amount}` (e.g., `USD 12.00`)
- Convert timestamp dates to human-readable format (e.g., `2026-04-28`)
- Never expose raw JSON, internal field names, or tool names to the user
- Append a summary note: how many fields are mutually agreed vs. still pending seller confirmation
- **Preview-only disclaimer (MANDATORY):** When pending fields exist (`buyerValueStatus = negotiating`) **or** when the user's follow-up may involve ordering, append a closing line such as: *"This is a preview of the negotiation draft. To check whether you can place an order, run the pre-order validation."* Do NOT claim the contract is "ready to order" based on this preview alone — orderability is decided by `alibaba-icbu-trade-agent-guide`, not by this skill.
