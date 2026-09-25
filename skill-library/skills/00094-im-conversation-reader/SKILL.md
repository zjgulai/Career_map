---
id: im-conversation-reader
name: im-conversation-reader
description: >-
  Resolve and optionally read buyer-seller IM history for another sourcing or trade Skill.
  Use an imConversationId from the current supplier mention when present,
  otherwise resolve it from sellerAliId through query_recent_conversation;
  default to paginated query_conversation_msg_for_aimode and reserve
  query_conversation_msg_timeRange for explicit complete intervals. When
  file-type messages carry a clouddisk URL, fetch the attachment content
  conservatively (only when a URL is present). Use internally only and
  never expose identifiers.
---

# IM Conversation Reader

Read one or more referenced supplier conversations for a calling Skill. Own conversation resolution, request contracts, pagination, response validation, retries, confidentiality, and per-supplier failure isolation; the caller owns business analysis.

## Supplier Context

1. Accept supplier fields only from the current request's `@[label](mention:aiMode:supplier/<id>?...)` references:
   - `imConversationId`: internal conversation identifier;
   - `sellerAliId`: internal seller identifier used only to resolve or classify the conversation;
   - `supplierName`: optional business context for the calling Skill.
2. Keep `imConversationId` and `sellerAliId` internal. Never display them, persist them, or use them as output labels.
3. If `imConversationId` is present, use it unchanged and do not call `query_recent_conversation`.
4. If it is absent, require `sellerAliId` and resolve the conversation as described below. Never ask the buyer for an internal ID.
5. Never send `sellerAliId` as `selfAliId`, `buyerId`, or another buyer-identity field. The gateway supplies the signed-in buyer identity.
6. Isolate suppliers throughout the read. A missing field or failed call for one supplier must not stop reads for other suppliers.

## Resolve a Missing Conversation ID

Call:

```text
accio-mcp-cli call query_recent_conversation \
  --json '{"request":{"domain":"icbu","limitTimeStamp":<current-time-ms>,"count":20}}'
```

Rules:

1. Resolve `limitTimeStamp` from the system clock at call time as Unix epoch milliseconds.
2. Send only `domain`, `limitTimeStamp`, and `count` under `request`.
3. Match entries whose `contactAliId` equals the supplier's `sellerAliId`; if several match, select the entry with the latest supported message timestamp and use its `conversationId`.
4. If no matching conversation exists or the response is invalid, return a safe unavailable result for that supplier and continue with the others.

### Resolution-only mode

Use this mode only when a calling Skill needs an `imConversationId` as internal routing data but does not need message content, such as explicit Inquiry page navigation:

1. Use the mention's exact `imConversationId` when present; otherwise resolve it once from `sellerAliId` with `query_recent_conversation` above.
2. Return the resolved identifier only to the calling Skill. Keep it inside the machine-readable action payload and never expose it in buyer-visible text.
3. Stop after resolution. Do not call `query_conversation_msg_for_aimode` or `query_conversation_msg_timeRange`, apply message response validation, or read IM history.
4. If neither identifier is available or resolution fails, return a safe unavailable result rather than constructing a placeholder or malformed link.

## Tool Selection

### Default: paginated message query

Use `query_conversation_msg_for_aimode` for latest-message reads, topic or message-count scopes, default summaries, and backward pagination:

```text
accio-mcp-cli call query_conversation_msg_for_aimode \
  --json '{"request":{"conversationId":"<resolved-conversation-id>","limitTimeStamp":<resolved-boundary-ms>,"forward":false,"domain":"icbu","count":50}}'
```

- Initial `limitTimeStamp`: caller-provided time boundary in milliseconds, otherwise current system time in milliseconds.
- Later pages: use `data.nextPointTimeStamp`; never recalculate the system time.
- Keep `conversationId`, `forward`, and `domain` unchanged.
- Keep `count` within `1`–`100` and no larger than the caller's remaining message budget.

### Explicit complete interval

Use `query_conversation_msg_timeRange` only when the buyer explicitly names a date/time range or the task explicitly requires the complete interval within the most recent 30 days:

```text
accio-mcp-cli call query_conversation_msg_timeRange \
  --json '{"conversationId":"<resolved-conversation-id>","domain":"icbu","startTime":<inclusive-start-ms>,"endTime":<inclusive-end-ms>}'
```

- Pass these four fields at the top level; do not wrap them in `request`.
- Resolve both boundaries as Unix epoch milliseconds and require `startTime <= endTime`.
- Use this endpoint only for intervals contained within the most recent 30 days. For wider or older scopes, use paginated `query_conversation_msg_for_aimode` and disclose the normal reader limits.
- Do not use this endpoint as a fallback for ordinary latest-message reads or after a successful default query.

## Message Response Validation

1. Treat a call as successful only when `success` is `true` and `errorCode` is `null`, numeric `0`, or string `0`.
2. Require a message collection in the successful business response; otherwise treat the response as malformed.
3. Preserve message `content`, `timestamp`, sender identity, and `quoteMessage` relationships for the caller. Missing optional fields remain unavailable.
4. Accept only usable millisecond timestamps and non-empty textual content as valid text messages. For messages whose content matches `[file] <url>` or `[image] <url>`, fetch the attachment as described in Attachment Handling and include the extracted text alongside the message. For messages with an unsupported prefix but no URL (e.g., `[file]` alone or `[card]`), return an unavailable-content indicator.
5. Keep raw request fields, tool names, endpoint details, cursors, and identifiers out of buyer-visible results.

## Attachment Handling

1. When a message's `content` matches the pattern `[file] <url>` or `[image] <url>`, extract the URL and fetch the attachment content. Only fetch when a URL is explicitly present — messages whose content is solely `[file]` or `[image]` without a URL must not be fetched.
2. Use whatever HTTP client is available in the execution environment (e.g., `curl`, `wget`, or a Node.js HTTP library). The download chain:
   - GET the clouddisk `downloadFile.htm` URL → expect HTTP 302 redirect to an OSS signed URL.
   - Follow the redirect to the OSS URL → the response body is the binary attachment.
   - The clouddisk URL re-signs on every request; always use the original clouddisk URL from the message, never cache the OSS redirect target.
   - If the clouddisk signature has expired, re-request the original clouddisk URL for a fresh redirect.
3. After downloading, extract human-readable text from the binary where possible (for PDFs, use a PDF text extraction tool; for images, delegate to the calling Skill or `image-analysis`). Report the extraction method and approximate character count alongside the result.
4. Do not expose the clouddisk URL, OSS redirect URL, or any signature tokens to the buyer.
5. Treat a download or extraction failure as transient — retry once. If the second attempt fails, return the original message metadata with a note that the attachment could not be read.
6. Do not fetch attachments for `[card]` or `[video]` prefix messages unless the caller explicitly requests it.
7. Attachment downloads count toward the message budget for the supplier they belong to.

## Pagination

For `query_conversation_msg_for_aimode`:

1. Track collected valid messages, successful pages, the current cursor, and retries for each supplier independently.
2. Normally request `50` messages per page, or fewer for a narrow caller budget.
3. Return as soon as the caller's scope is satisfied.
4. Continue only when `data.hasMore` is `true` and `data.nextPointTimeStamp` is valid and advances backward.
5. Stop when the scope is satisfied, `hasMore` is false, `200` valid messages are collected, or `4` pages succeed.
6. Stop on a missing, invalid, or repeated cursor and return the valid partial result rather than looping.
7. Mark results truncated when the 200-message or 4-page limit is reached while more history remains.

## Retry Policy

1. Retry only timeouts, connection interruptions, rate limiting, explicit temporary failures, or `5xx` errors.
2. Retry one failed page at most `2` times and allow at most `3` retries across one supplier read.
3. Honor `Retry-After` when present. Retries do not count as successful pages or add to the message budget.
4. Do not retry invalid parameters, authentication or permission errors, missing context, malformed responses, invalid cursors, or non-transient business errors.
5. If all attempts fail before any successful response, return a safe failure for that supplier. If earlier pages succeeded, return them as a partial result.

## Handoff

- In resolution-only mode, return only the resolved internal conversation identifier or a safe unavailable result to the calling Skill.
- Return each supplier's messages, coverage, pagination status, and safe limitation independently. Include fetched attachment text alongside the originating message, labeled with the extraction method and character count.
- When a `[file]` or `[image]` message had no URL or could not be fetched, note the limitation in the handoff so the caller can decide whether completeness is affected.
- Do not summarize, compare, search, negotiate, send messages, or perform another business workflow.
- Never let one supplier's missing conversation or tool failure abort the remaining suppliers.
