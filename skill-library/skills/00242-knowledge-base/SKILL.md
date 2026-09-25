---
name: knowledge-base
displayName: Knowledge Base
displayDescription: Handles Accio Work Knowledge Base file and kit references. Parses the `<knowledge_base_refs>` XML block emitted by the chat UI, fetches file contents via MCP, and supports semantic search across the knowledge base.
description: |
  Handles Accio Work Knowledge Base file and kit references and semantic search.
  Reads and searches KB content via the platform-provided MCP tools
  (get_kb_file_contents / search_kb_file_contents).

  Trigger — evaluate in order, stop at first match:
    1. HARD (unconditional): message contains a <knowledge_base_refs> block.
    2. SOFT: "知识库 / knowledge base / kb" mentioned with content intent,
       OR context shows the current file was previously selected from KB.

  Do NOT trigger on generic "这份文档 / 这个文件 / 根据文档内容" without a
  KB signal — those may be local attachments. See the skill body for the
  full trigger matrix, MCP calling conventions, and fallback rules.

  Once triggered, the agent MUST call get_kb_file_contents or
  search_kb_file_contents before answering when a valid call can be formed.
  For `type: folder`, resolve fileIds from the matching active kit index;
  never use the folder entry's `id` as a fileId. Do not satisfy Knowledge Base
  tasks through filesystem search, local file parsing, shell commands, or
  scripts. If the KB tool call fails, report the failure honestly instead
  of working around it with local files.
version: 1.0.4
---

# Knowledge Base Skill

This skill governs how to handle Accio Work Knowledge Base file references:
parse the `<knowledge_base_refs>` protocol block, call the platform-provided
MCP tools to read or search KB content, and answer the user grounded in that
content. **Never bypass the MCP tools by hitting backend APIs directly or
guessing file content.**

## Reply language

**Always reply in the same language the user wrote in.** Chinese question →
Chinese reply; English question → English reply. Do not default to English
just because this skill file or the tool docstrings are in English. If the
user switches language mid-conversation, switch with them.

## Core constraints

- **Do not echo raw `<knowledge_base_refs>` blocks back to the user.** The
  XML tag is an internal protocol between the platform and the model; it
  appears in the user message only as context and must not be reproduced.
- **At most one `<knowledge_base_refs>` block per message.** The parser is
  robust to multiple blocks, but the product contract is one.

## When to use

Evaluate triggers **in order**, stop at first match:

### HARD trigger (deterministic — must enter)

The message contains a `<knowledge_base_refs version="1">…</knowledge_base_refs>` block. This is emitted by the front-end when the user selects KB files or folders. **No semantic judgment needed** — if the block exists, enter the skill unconditionally.

### SOFT trigger (heuristic — requires intent judgment)

The user explicitly mentions "知识库", "knowledge base", or "kb", **AND** the intent is to read / search / summarize / compare / inspect / answer-from the knowledge base.

Examples:
- "搜索知识库里关于 XX 的内容" — ✅ KB signal + search intent
- "总结这个知识库文件" — ✅ KB signal + summarize intent
- "根据知识库回答 XX" — ✅ KB signal + answer-from intent
- "知识库怎么用" — ❌ KB signal but no read/search intent (it's a how-to question, not a content query)

Also triggers when the user asks to summarize or answer based on a **previously referenced** KB file (e.g. "总结这份文档", "这个文件说了什么"), **and** the conversation context clearly shows the file came from Knowledge Base (e.g. a `<knowledge_base_refs>` block appeared earlier in the conversation).

### Do NOT trigger

Generic file/document wording **without** a KB signal — "这份文档", "这个文件", "引用文件", "根据文档内容", "总结这份文档" — unless the message also mentions "知识库", contains a `<knowledge_base_refs>` block, or clearly refers to a previously selected KB file. Such a file may be a local attachment.

### Once triggered (mandatory)

- Call `get_kb_file_contents` or `search_kb_file_contents` **before answering** when a valid call can be formed.
- Do **not** answer KB tasks via filesystem search (`glob` / `find` / `Get-ChildItem`), local file parsing (`pdftotext` / `pandas` / `pdfplumber`), or custom scripts.
- If a KB tool call fails **or returns unusable content**, report the issue honestly — do **not** silently switch to local files or any other non-KB source.

## XML protocol (v1)

The user message may end with an XML block emitted by the front-end
`appendKbRefsBlock` helper:

```xml
<knowledge_base_refs version="1">
  - id: 1001, name: "Product Overview.pdf", fileType: pdf
  - id: 1042, name: "Q2 Sales.xlsx", fileType: xlsx, folderId: 101
  - id: 205, name: "Brand Kit", type: folder
</knowledge_base_refs>
```

### Field reference

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `id` | yes | number | File ID for file entries; folder ID when `type: folder` |
| `name` | yes | string (JSON) | Always a JSON-encoded string (with quotes); use `JSON.parse` to recover escapes (`\"`, `\\`, `\n`) |
| `fileType` | file only | string | Lowercase: `pdf` / `doc` / `docx` / `xlsx`; unknown values fall back to `unknown` |
| `type` | folder only | string | `folder` identifies a kit/folder reference |
| `folderId` | no | number | Containing folder of a file; never use as `fileId` |
| `version` | block attribute | string | Currently `"1"`; missing → treat as v1; unknown → skip parsing |

### Parsing rules

1. Each entry line starts with `  - ` (two spaces, hyphen, space).
2. Fields are separated by `, ` (comma + space) and are **order-insensitive**.
3. `name` is always a JSON string (quoted); run `JSON.parse` to handle escapes.
4. **Skip lines missing `id` or `name`** — both are required to parse an entry.
5. For `type: folder`, `id` is a folder ID; otherwise an entry with
   `fileType` is a file reference.
6. Ignore unknown fields (e.g. `updatedAt`, `refType`) for forward
   compatibility.

## Calling MCP tools

KB tools are MCP tools — call them via `accio-mcp-cli call` (bash).
**Do not use `accio-mcp-cli search` or `accio-mcp-cli list` to discover
KB tools** — the tool names and exact calling syntax are already documented
below. Proceed directly to `accio-mcp-cli call`.

Resolve `fileIds` from file-entry IDs plus explicit `file_id` / `fileId`
values in the matching `<kit>` block of the active kit context, then
deduplicate them. Never include a folder entry's `id`. If a scoped folder has
no usable index or explicit file IDs, report that limitation instead of using
its folder ID or silently widening the search to the whole KB.

### Tool selection rules

Choose the KB tool based on the user's intent:

| User intent | Tool | Rule |
|---|---|---|
| Summarize, inspect, or read selected KB files | get_kb_file_contents | Call once per file |
| Ask a question about selected KB files | search_kb_file_contents | Pass fileIds to limit scope |
| Search the whole knowledge base | search_kb_file_contents | Omit fileIds |
| Compare selected files or objects | search_kb_file_contents | Pass fileIds when available; keep all compared entities in the query |
| get_kb_file_contents returns empty or unusable content | search_kb_file_contents | Retry with the original query and fileIds |
| search_kb_file_contents returns no relevant chunks | No non-KB fallback | Say the knowledge base does not contain enough evidence |

### 1. Fetch file contents — `get_kb_file_contents`

Once `fileIds` are resolved, call **per file** via bash:

```bash
accio-mcp-cli call get_kb_file_contents --json '{"fileId": 1001}'
```

Constraints:

- Pass only `fileId` (single file).
- **One file per call.** For multiple files, call sequentially and merge results.
- See "Handling responses" for the return shape.

### 2. Search the knowledge base — `search_kb_file_contents`

When the user asks to search the KB (with or without an XML block):

```bash
accio-mcp-cli call search_kb_file_contents --json '{"query": "user search keywords", "fileIds": [1001, 1042], "maxResults": 10}'
```

Constraints:

- `query` is required and should mirror the user's wording (or a tight
  paraphrase). Do not pad with unrelated context.
- `fileIds` is optional; omit to search the whole KB. If the conversation
  scopes to specific files directly or through a kit index, pass them to
  narrow the result set.
- `maxResults` is optional (default 10, max 50). Increase it if `hasMore`
  is true and the current chunks don't fully answer the question.

## Handling responses

### `get_kb_file_contents`

```json
{
  "fileId": 1001,
  "fileName": "Product Overview.pdf",
  "message": "File parsed successfully. Parsed content exceeds 10KB, download the full text via 'parsedFile.downloadUrl'. Original file available via 'rawFile.downloadUrl'.",
  "rawFile": {
    "fileSize": 1949572,
    "downloadUrl": "https://..."
  },
  "parsedFile": {
    "fileSize": 78817,
    "content": null,
    "downloadUrl": "https://..."
  }
}
```

| Case | Action |
|------|--------|
| `parsedFile.content` non-null (≤10KB) | Use `content` directly to answer the user; cite `fileName` |
| `parsedFile.content` null, `parsedFile.downloadUrl` non-null (>10KB) | Tell the user the content is large and provide the `downloadUrl` for download |
| `parsedFile` null, `rawFile` present | File is still being parsed or parsing failed. Tell the user the status (refer to `message` field) and offer `rawFile.downloadUrl` |
| Both `rawFile` and `parsedFile` null | File was blocked by content policy. Tell the user it cannot be accessed |

### `search_kb_file_contents`

```json
{
  "chunks": [
    {
      "chunkId": "53001_37",
      "title": "Chapter 2 Listing flow",
      "content": "matched snippet…",
      "score": 0.95,
      "fileId": "1001",
      "fileName": "Listing Manual.pdf"
    }
  ],
  "totalCount": 5,
  "hasMore": true
}
```

- Consume by descending `score` by default; **always cite `fileName`** when
  quoting a chunk.
- If `chunks` is empty **and `fileIds` were set on purpose** (scoped to
  specific files, or a comparison), answer honestly that the content is
  **not found in those files** — do **not** silently widen the search to the
  whole KB. If no scope was set on purpose, refine the query / keywords and
  search again **yourself** before concluding there is no match.
- If `hasMore` is true and the current chunks don't fully answer, **increase
  `maxResults` (up to 50) or refine the query and search again yourself** —
  retrieval tuning is the skill's job, not something to hand back to the
  user.

## End-to-end example

**User message:**

```
Please summarize the key takeaways of this document.

<knowledge_base_refs version="1">
  - id: 1001, name: "Product Overview.pdf", fileType: pdf
</knowledge_base_refs>
```

**Steps:**

1. HARD trigger: detect the `<knowledge_base_refs>` block; extract `fileIds: [1001]`.
2. Run `accio-mcp-cli call get_kb_file_contents --json '{"fileId": 1001}'`.
3. If `parsedFile.content` is available, use it to distill the takeaways. If only `parsedFile.downloadUrl` is available, tell the user the content is large and provide the link.
4. Answer in the user's language and end with `Source: Product Overview.pdf`.
5. **Do not** echo the original XML block back to the user.

## Strictly forbidden

- Calling KB backend HTTP APIs directly (`curl`, `requests`, `fetch`, …).
  All read / search must go through `get_kb_file_contents` /
  `search_kb_file_contents`.
- Fabricating file content. If a file is not yet indexed or fails to read,
  **say so honestly** — never infer body text from the file name.
- Echoing the `<knowledge_base_refs>` block, or surfacing internal anchors
  like `fileId` as part of the answer.
- Passing the `id` of a `type: folder` entry as `fileId` or in `fileIds`.
- Mixing `fileIds` from different knowledge bases. The IDs you
  pass must come from file entries in the current XML block, explicit file
  IDs in its matching active kit index, or the most recent
  `search_kb_file_contents` response.

## Hard requirements

- When multiple file IDs are resolved, call `get_kb_file_contents` **once per file** —
  the tool accepts a single `fileId` per call.
- When citing parsed content, attribute it to the source file (and chapter
  title when relevant) so the user can verify.
- If a single message combines a KB reference with other capabilities
  (mentions, local file attachments), handle the KB part per this skill
  and let other capabilities proceed in parallel.
