---
name: alibaba-icbu-trade-buyer-consignee-address-list-query
version: 0.2.0
description: >
  Alibaba.com Buyer Consignee Address List Query Skill, for retrieving the list of
  shipping / consignee addresses under the current buyer account. Used in order
  creation, checkout, address selection, or any scenario where the buyer needs to
  review or pick from their saved delivery addresses.
  Triggered when users mention topics related to consignee address, shipping
  address, delivery address, address book, or picking an address for an order.

  Typical utterances:
  - 查一下我的收货地址
  - 我有哪些收货地址？
  - 列出我账号下所有的收货地址
  - 查询我美国的地址
  - 查询我最近一条地址
  - List my consignee addresses
  - Show me all shipping addresses under my account
  - What addresses do I have for delivery?
  - List my USA addresses
  - Show me the latest address
enabled: true
tool_triggers:
  - name: icbu_alibaba_buyer_consignee_address_list
  - name: format_address_list
---

# Alibaba.com Buyer Consignee Address List Query

A read-only consignee address assistant for international buyers, covering
consignee address list retrieval, filtering by country, and picking the most
recent address for downstream order-creation flows.

## MCP Services

| Capability Module | MCP code | Description |
|---------|----------|------|
| Consignee Address List Query | `icbu_alibaba_buyer_consignee_address_list` | Query the consignee (shipping) address list under the current buyer account, with optional filters by country / scene / limit |

> **Note:** This Skill is read-only. No write / create / update / delete operations are involved, so no Safety Constraints section is required.

## Intent Routing

Based on user input, identify the intent and route to the corresponding capability module.

```
User Input
  │
  ├─ Asks for "my addresses" / "address list" / "收货地址"
  │   └─► Address List Mode → Call icbu_alibaba_buyer_consignee_address_list (no filter)
  │
  ├─ Mentions a specific country / region (e.g. "USA", "美国", "日本")
  │   └─► Filtered List Mode → Call the tool with countryCode filter
  │
  ├─ Asks for "latest address" / "最近一条" / "默认地址"
  │   └─► Latest Address Mode → Call the tool with limit=1 (or fetch list then pick the newest)
  │
  └─ Ambiguous address-related query
      └─► Ask user to clarify: show full list, or filter by country / scene?
```

### Intent Recognition Rules

| User Input Characteristics | Intent | Capability Module |
|-------------|------|---------|
| Mentions "my addresses", "address list", "收货地址", "address book" | Full List | `icbu_alibaba_buyer_consignee_address_list` |
| Mentions a country or region name (USA / 美国 / Japan / 日本 etc.) | Filtered List | `icbu_alibaba_buyer_consignee_address_list` with `countryCode` |
| Mentions "latest", "most recent", "最近一条", "最新地址" | Latest Address | `icbu_alibaba_buyer_consignee_address_list` with `limit=1` |
| Mentions address selection during checkout / order creation | Scene-scoped List | `icbu_alibaba_buyer_consignee_address_list` with `scene` |
| Ambiguous address-related query | Ambiguous | Ask user to clarify filter / scene |

### Multilingual Trigger Keywords

| Language | Trigger Keywords |
|----------|-----------------|
| English | consignee address, shipping address, delivery address, my addresses, address list, address book, latest address |
| Chinese | 收货地址, 收件地址, 配送地址, 我的地址, 地址列表, 地址簿, 最近的地址, 默认地址 |
| Spanish | dirección de envío, mis direcciones, lista de direcciones |
| French | adresse de livraison, mes adresses, liste d'adresses |

> **Fallback:** The above list is a reference. The Agent should identify intent based on semantic understanding in any language.

## MCP Tool Usage

### Consignee Address List Query — `icbu_alibaba_buyer_consignee_address_list`

**Command:**
```bash
accio-mcp-cli call icbu_alibaba_buyer_consignee_address_list --json '{"ownerAliId": <BUYER_ALI_ID>, "locale": "en_US", "scene": "accio_work", "limit": 20, "countryCode": "US", "filterValidAddress": false}' --raw
```

**Parameters:**

| Parameter | Type   | Required | Description                                                                                                 |
|-----------|--------|----------|-------------------------------------------------------------------------------------------------------------|
| ownerAliId | number | Yes | Buyer account identifier (ali ID) whose address book is queried                                             |
| locale | string | No | Locale for address field localization, e.g. `en_US`, `zh_CN`. Default: `en_US`                                   |
| scene | string | No | Business scene tag, e.g. `accio_work`, `accio_work_trade`. Influences which addresses are returned          |
| limit | number | No | Max number of addresses to return. Default: `5`; use `1` to fetch only the latest. If user explicitly specifies a number (e.g. "show me 10 addresses"), use the user-specified value |
| countryCode | string | No | ISO country code filter (e.g. `US`, `CN`, `JP`). When provided, only addresses of that country are returned |

**Parameter Acquisition Strategy:**

| Parameter | Priority                                                                                                 |
|-----------|----------------------------------------------------------------------------------------------------------|
| ownerAliId | Try to get from header's mcp-ali-id                                                                                |
| locale | 1. User's current UI locale → 2. Language of the user's input → 3. Default `en_US`                       |
| scene | 1. Inferred from the calling Skill / upstream context (e.g. order-create flow) → 2. Default `accio_work` |
| limit | 1. Explicit user request (e.g. "latest one" → `1`, "show 10" → `10`) → 2. Default `5`                    |
| countryCode | 1. Country / region mentioned in user input → 2. Omit (return all)                                       |

**Response Key Fields:**

| Field         | Visibility | Description |
|---------------|------------|-------------|
| snapshotId    | Internal only — never shown to user | Address snapshot ID, used to lock the exact address content at order time. This is the **only** identifier returned to downstream flows (e.g. order creation). The raw `id` field from the underlying API must NOT be returned or surfaced. |
| contactPerson | User-facing | Recipient / contact person full name |
| contact       | User-facing | Contact phone (and optionally email) for delivery coordination |
| addressLines  | User-facing | Full formatted address string (country, province/state, city, street, postcode) |
| address       | User-facing | Structured address (country, province/state, city, street, postcode) |

> **Important:** The Skill must strip the raw `id` field from MCP responses before passing addresses to the user or downstream Skills. Only `snapshotId` is propagated, and it stays internal.

## Address Index → snapshotId Mapping (Mandatory)

This Skill exposes addresses to the user **by index number only** (1, 2, 3, ...). The `snapshotId` is kept internally and never displayed.

### Display Contract
- Each address in the user-facing list MUST be prefixed with a 1-based index (`#1`, `#2`, ...).
- The order of indices MUST match the order returned by the MCP tool, and MUST be stable within the same conversation turn.
- The index column comes first; `snapshotId` is never rendered in any user-facing output (table, prose, or JSON shown to the user).

### Selection Contract
- When the user picks an address by saying "用第 2 个 / address 2 / the second one / #2 / 最近那条" etc., the Skill MUST:
    1. Resolve the spoken index → the corresponding address entry from the most recently displayed list.
    2. Read the entry's `snapshotId` from the internal cache.
    3. Pass `snapshotId` (not `id`, not the index) to the downstream Skill / tool (e.g. order creation).
- If the user references an index that is out of range, ask them to re-pick from the displayed list — do NOT guess.
- If the displayed list has been invalidated (e.g. a new query was issued, filters changed, conversation context lost), re-query and re-display before accepting an index selection.

### Internal Cache Format (suggested)
The Skill should maintain a per-turn map roughly like:

```json
{
  "addressIndex": {
    "1": { "snapshotId": "<snapshot-id-1>" },
    "2": { "snapshotId": "<snapshot-id-2>" }
  }
}
```

This map is **internal state** — never echoed to the user.

## General Rules

### Language
- Detect user's input language and always respond in the same language
- Keep raw data values (phone numbers, postcodes, recipient names) as-is
- Translate UI labels and column headers to the user's language
- Default to English when language cannot be determined
- Never localize, translate, or display the internal `snapshotId`

### Error Handling

| Scenario                                        | Response Strategy |
|-------------------------------------------------|-------------------|
| MCP tool call fails                             | Inform user the address service is temporarily unavailable. Suggest visiting the [Address Book](https://logistics.alibaba.com/luyou/shipto/list.htm?action=list) to manage addresses directly, and tell the user they can come back and say "use my latest address" after editing — the Skill will then query the most recent one for them |
| Missing `ownerAliId`                            | Politely ask the user to sign in or specify the buyer account |
| `countryCode` filter returns empty              | Tell user no address matches the requested country, offer to show the full list |
| Ambiguous filter (multiple countries mentioned) | Ask the user to pick one, or confirm showing all |

### Result Presentation
- Use Markdown tables for structured display
- **Column order (mandatory):** `#` (index) | `Contact Person` | `Contact` | `Address`
- The `#` column uses 1-based numbering (`1`, `2`, `3` ...) so the user can pick by index in the next turn
- When the user did NOT specify a limit, the default `limit=5` is used. In this case, append a note after the table: "Showing the **5 most recent** addresses. Tell me if you'd like to see more."
- When the user asked for "latest", present a single address block instead of a table, but still label it as `#1`
- When the user asked for a country filter, show the applied filter in the response header (e.g. "Addresses in **US** (3)")
- Provide next-step suggestions at the end using the index, e.g. "Reply **#2** to use the second address for order creation."
- Always append an address-management tip at the end of the response: "Want to manage your addresses? Visit your [Address Book](https://logistics.alibaba.com/luyou/shipto/list.htm?action=list). After editing, just tell me 'use my latest address' and I'll fetch it for you."
- When the user says something like "用刚刚编辑的地址" / "use my latest address" / "use the one I just added" after returning from the address book, treat it as a `limit=1` query to fetch the most recent address and present it for confirmation
- Never expose raw JSON, the internal `id` field, the `snapshotId`, or internal tool names (`icbu_alibaba_*`) to the user
- Even if the user explicitly asks for the address ID / snapshot ID, politely decline and explain that selection is done by index

### Context Data Block (MANDATORY — NEVER OMIT)

**You MUST append this HTML comment as the last line of EVERY address response. Omitting it breaks downstream order creation.**
```
<!-- addressContext: {"1":"<snapshotId_1>","2":"<snapshotId_2>"} -->
```
Invisible to users; maps every displayed index → `snapshotId` for downstream Skills. Do NOT re-query when user selects by index — read from here.

### Example — User-Facing Output

```markdown
Addresses in **US** (2)

| # | Contact Person | Contact          | Address                                                  |
|---|----------------|------------------|----------------------------------------------------------|
| 1 | John Smith     | +1-415-555-0100  | 1 Market St, San Francisco, CA 94105, US                 |
| 2 | Mary Lee       | +1-212-555-0188  | 350 5th Ave, New York, NY 10118, US                      |

Reply **#1** or **#2** to use that address for the next step.

<!-- addressContext: {"1":"snap_abc123","2":"snap_def456"} -->
```
The `<!-- addressContext -->` comment is not visible to the user but persists in conversation context, allowing downstream Skills to resolve the selected index to its `snapshotId`.
