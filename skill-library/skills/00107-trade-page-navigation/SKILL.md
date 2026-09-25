---
id: trade-page-navigation
name: trade-page-navigation
description: >-
  Navigate to the Alibaba.com Inquiry page only when the buyer explicitly asks
  to open, enter, or go to it, or to the Order creation page for order creation
  or navigation when no reliable current signal says the request is continuing
  the existing AI auto-chat flow.
  Emit contract-compliant action-link tags. Do not handle inquiry creation or
  management, order status/details, payment, logistics, after-sales, drafting,
  prefilling, or submission.
version: 1.0.0
---

# Trade Page Navigation

Navigate the buyer to a supported Alibaba.com secondary page through buyer-visible `action-link` tags. Own navigation only; do not draft, prefill, create, submit, query transaction status or details, or claim completion of an inquiry or order.

## Intent Gate

1. Navigate to the Inquiry page only when the buyer explicitly asks to open, enter, go to, or visit the Inquiry page. Requests to create, send, manage, continue, reply to, negotiate, complete, or check the progress of an inquiry stay in the existing Sourcing inquiry flow.
2. For a supplier-context request to place, create, or generate an order, or to open, enter, go to, or continue on the Order creation page, decide the branch before the plugin's general Order Placement route:
   - keep the existing Sourcing order flow only when the buyer explicitly asks the Agent to continue AI auto-chat or negotiation with that supplier as the way to place the order, or trusted current Sourcing context for that supplier explicitly reports `autoFollow=1`;
   - navigate to the Order creation page when trusted context reports `autoFollow=0` or no reliable AI auto-chat signal exists.
3. Do not treat a supplier mention, `imConversationId`, message history, or an earlier unrelated inquiry as proof that AI auto-chat is active. Use only trusted state already available for the relevant supplier; do not enumerate unrelated inquiry tasks only to make this navigation decision.
   Keep the raw `autoFollow` field internal; describe only the resulting buyer-facing path when an explanation is useful.
4. Do not activate for order status, order details, payment, shipping, logistics, after-sales, refunds, disputes, content drafting, form prefilling, submission, or general advice.
5. If the buyer explicitly requests both supported destinations and each independently passes its gate, emit both links without asking the buyer to choose.

## Navigation Contract

Use the corresponding tag exactly once for each selected destination. Preserve the tag name, attribute name, single quotes, compact JSON payload, key casing, and fixed values. Never add undeclared fields or interpolate visible buyer text into a payload.

Inquiry page (replace `{imConversationId}` with the exact ID from the relevant supplier mention or the resolution-only path below):

```text
<action-link payload='{"defaultPage":"inquiryEditPanel","imConversationId":"{imConversationId}"}'>{contextual action text}</action-link>
```

For Inquiry navigation:

1. Use the exact `imConversationId` from the relevant supplier mention when present.
2. If it is absent and that mention has `sellerAliId`, read `../im-conversation-reader/SKILL.md` completely and use its resolution-only mode. Call only `query_recent_conversation`; do not read message history.
3. If neither field is available or resolution fails, do not emit a legacy, placeholder, or malformed Inquiry link. Explain only that the page cannot be opened from the current reference; never ask the buyer for an internal ID.
4. Never substitute `sellerAliId` itself into the payload. Keep the resolved conversation identifier only in the machine-readable payload and never repeat it in the visible label or surrounding prose.

Order creation page:

```text
<action-link payload='{"defaultPage":"order","pageScene":"CREATE_ORDER"}'>{contextual action text}</action-link>
```

The payload is the only machine-readable destination. Text between the tags is display text only.

## Inline Label and Sentence Rules

1. Match the language of the buyer's latest message unless another language was requested.
2. Generate a nonempty, concise phrase that accurately describes navigating to or continuing on the destination page.
3. Use natural prose around each tag so the rendered sentence is grammatically coherent.
4. Keep the label on one line as plain text. Do not include Markdown, nested directives, HTML, placeholders, `<`, `>`, `&`, `[`, `]`, or backticks.
5. Do not put an `action-link` in a code fence, Markdown link, heading, table, bold span, or another wrapper.
6. State clearly that the link opens a secondary page where the buyer can continue. Never imply an inquiry or order was drafted, prefilled, created, sent, or submitted.

## Examples

```text
你可以 <action-link payload='{"defaultPage":"inquiryEditPanel","imConversationId":"{imConversationId}"}'>创建询盘</action-link>，提交前再核对采购信息。
```

```text
确认不走代聊下单流程后，可以 <action-link payload='{"defaultPage":"order","pageScene":"CREATE_ORDER"}'>前往订单创建页面继续填写</action-link>。
```

## Output Contract

1. Apply this contract only after at least one destination passes the Intent Gate.
2. Emit exactly one contract-compliant `action-link` for each selected destination and never duplicate a destination.
3. Do not call a tool or persist a file for navigation, except for the resolution-only `query_recent_conversation` call when an explicit Inquiry navigation request lacks `imConversationId`.
4. Before finishing, verify that each destination was explicitly requested, every payload is exact, every label is contextual plain text, and no transaction-completion claim is present.
5. Do not generate follow-up chips inside this Skill; the Follow-up Output Rules own the final `<follow>...</follow>` block.
