---
id: conversation-summary
name: conversation-summary
description: >-
  Summarize buyer-seller IM history for every supplier referenced in the current
  request when the buyer asks what was discussed, agreed, changed, remains open,
  or should happen next. Read each supplier independently through
  im-conversation-reader; do not summarize the current assistant conversation,
  merge suppliers, or persist the result.
---

# Conversation Summary

Summarize each referenced buyer-seller IM conversation from the buyer's perspective. Preserve the negotiation timeline, distinguish confirmed facts from interpretation, and recommend practical next communication steps.

## Hard Gates

1. Read this file and `../im-conversation-reader/SKILL.md` completely before calling any tools.
2. Parse supplier context only from the current request's `@[label](mention:aiMode:supplier/<id>?...)` references. Process every referenced supplier independently and never merge histories or reuse context from another supplier.
3. Require `sellerAliId` for each supplier so buyer and seller messages can be attributed safely. Use `imConversationId` directly when present; otherwise let `im-conversation-reader` resolve it from `sellerAliId`. If `sellerAliId` is unavailable, return a safe limitation for that supplier and continue with the others; never ask the buyer for an internal ID.
4. Match the language of the buyer's latest message unless the buyer requests another language.
5. Base every factual statement on valid messages returned in the current run, including attachment text fetched by `im-conversation-reader`. Never invent attachment content, events, agreements, prices, dates, intentions, or transaction status.
6. Keep sender IDs, conversation IDs, raw field names, tool names, request parameters, and pagination details out of buyer-visible output.
7. Do not persist the summary or write a report file.

## Summary Scope

1. Parse any scope in the buyer's request before reading history:
   - an explicit date or time range;
   - a message-count limit;
   - a topic or decision to focus on;
   - an explicit request for the entire conversation.
2. Apply every compatible buyer-specified constraint. A specified scope overrides the default scope.
3. Without a specified scope, summarize the latest valid text messages within the last `30` days, up to `100` messages. Use the reader's default paginated path rather than requesting a complete time-range query.
4. Use a complete time-range query only when the buyer explicitly specifies a date/time interval or explicitly requires the complete interval from the most recent 30 days.
5. For an entire-history or wider custom scope, continue only within `im-conversation-reader`'s maximum of `200` valid messages or `4` successful pages.
6. Treat a supplier's summary as partial whenever relevant history is excluded by scope, reader limits, an invalid cursor, a partially failed read, or unsupported content.

## Read and Normalize

For each supplier independently:

1. Call `im-conversation-reader` with that supplier's available mention fields and the requested scope.
2. For the default scope, read backward with `50` messages per page, stopping at `100` valid text messages or the 30-day boundary.
3. Accept only messages with a usable millisecond timestamp and non-empty textual `content`, plus attachment messages whose content has been fetched by `im-conversation-reader`. Preserve `quoteMessage` as context for its containing message, but do not count it as another message.
4. Map a message to the seller only when its sender matches the supplier's `sellerAliId`; map the other participant to the buyer. Use these labels only in analysis and never expose either identifier.
5. Sort selected messages from oldest to newest. Preserve repeated messages when they show emphasis, confusion, or a repeated request.
6. For attachment text that `im-conversation-reader` has fetched and returned, analyze it alongside the conversation — it reflects real file content the supplier shared. Never infer or invent content for attachments that were not fetched (e.g., `[file]` messages without a URL, or downloaded binaries that could not be extracted). If unfetched attachment content may affect completeness, retain only that limitation.
7. Track the selected message count, earliest/latest timestamps, whether relevant history remains, and the reason for every exclusion or truncation.

## Analyze the Selected Messages

1. Reconstruct chronology before drafting; do not let a later quantity, quote, address, requirement, or term silently replace an earlier one.
2. Extract only message-supported dimensions such as product, specification, quantity, price/currency, MOQ, customization, samples, shipping, delivery, payment, order status, quality, certification, and after-sales terms.
3. Separate confirmed requirements and terms, unaccepted proposals or claims, changes or disputes, and unresolved questions.
4. Identify the current negotiation stage only when supported, such as requirement confirmation, quotation, negotiation, term confirmation, awaiting payment, ordered, or stalled.
5. Treat urgency, hesitation, frustration, or satisfaction as cautious signals only when materially relevant; never present them as certain motives.
6. Interpret and render all returned Unix-millisecond timestamps in the trusted timezone exposed by the host for the current user. Apply the same user timezone when interpreting buyer-provided date/time ranges. Calculate durations from raw timestamps. Show the resolved user timezone once beside the visible period so the displayed time is unambiguous. Never substitute a default timezone or infer one when the trusted user timezone is absent.
7. Recommend the smallest set of high-value next messages or confirmations, prioritizing unresolved commercial terms and contradictions.

## Output Contract

1. Give each supplier a separate section, using `supplierName` when available. Never combine facts, agreements, gaps, or negotiation stages across suppliers.
2. Start each section with its actual message count, date range, and visible duration.
3. When a result is partial, say so in that supplier's opening paragraph and give the buyer-visible reason and actual coverage.
4. When unfetched attachments may affect completeness, add a concise limitation. For attachments whose content was fetched by `im-conversation-reader`, summarize the relevant substance and note the source attachment.
5. Prefer concise sections for overview/status, key terms, confirmed items, changes or disagreements, open items, and prioritized next communication steps; omit empty sections.
6. Include meaningful timestamps beside important changes and decisions. Show value progression without treating the latest value as accepted unless acceptance is explicit.
7. If no valid text exists, say so for that supplier. If a read partially succeeds, summarize the valid messages and disclose the limitation. If it fails completely, return a safe per-supplier failure and continue with the others.
8. Do not generate follow-up chips inside the summary; the Follow-up Output Rules own the response-level `<follow>...</follow>` block.
