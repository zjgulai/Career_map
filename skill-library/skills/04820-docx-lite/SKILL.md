---
name: docx-lite
description: "Fast, good-enough Word (.docx) creation and editing for chat-triggered office work, tuned for server agents serving end users. The agent writes markdown; one pandoc call produces the document with correct Vietnamese office typography (Times New Roman 13pt, A4, NĐ 30/2020 margins) already applied. Ships skeletons for nghị quyết, quyết định, báo cáo, tờ trình, công văn. Use when a user asks to make, write, draft, fill in, or convert a document, letter, report, memo, notice, contract, minutes, CV, or đơn from a chat message — 'soạn thảo văn bản', 'làm cho tôi báo cáo', 'viết đơn xin nghỉ phép', 'xuất file word', 'create a docx', 'draft a memo' — or to fill placeholders in an existing .docx. Output language always matches the user's language. Not for pixel-exact layout, tracked changes, comments, or OOXML surgery: use the full docx skill for those."
---

# docx-lite: Word documents in one command

## Overview

Produce a professional, editable `.docx` from a chat request in as few steps as
possible. The agent's only creative job is **writing good markdown**. Fonts, page
size, margins, spacing, heading styles, and table borders come from a bundled
reference document and are applied automatically on every call.

Optimise for: correct content, correct language, one generation command, no
iteration loops. "Good enough for office work" is the target, not print design.

## Rule 0 — Write in the user's language

Detect the language of the user's message and write the **entire document** in it:
headings, section labels, table headers, signature blocks, form field names.

- A Vietnamese request yields `BÁO CÁO`, `Kính gửi`, `Nơi nhận`, `TM. Ban Giám đốc`.
- An English request yields `REPORT`, `To:`, `cc:`, `For and on behalf of`.
- Never translate a document into English to "make it cleaner", and never add a
  bilingual summary the user did not ask for.
- Keep the user's own terminology and proper nouns verbatim, including acronyms,
  agency names, and product names.
- Mixed-language requests: follow the dominant language of the request, not of the
  file names or technical terms inside it.

If the request is a document type with a strong national convention (Vietnamese
administrative documents, French letters, German business letters), reproduce that
convention in that language — see `references/vn-office-formatting.md`.

## The one path that works

1. Write the finished document as a `.md` file. Publication content only — no
   instructions to yourself, no "yêu cầu định dạng" notes, no placeholder prose.
2. Run the wrapper:

```bash
scripts/md2docx.sh draft.md "Báo cáo 9 tháng.docx"
```

That is the whole pipeline. It applies `assets/reference-vn.docx`, resolves relative
image paths, and prints `ok: <path> (<bytes>B)`.

Add `--toc` for documents over ~3 pages. Add `--pdf` only if the user asked for a PDF.

### Markdown that survives the conversion

| Use | Works |
|---|---|
| `#`–`####` headings | yes, styled and black |
| `-` bullets, `1.` lists | yes |
| Pipe tables | yes |
| `**bold**`, `*italic*`, `[text](url)` | yes |
| `![alt](img.png)` relative to the .md | yes |
| `> blockquote`, fenced code | yes |
| `::: {custom-style="Title"}` … `:::` | yes — maps to a named style in the reference doc |
| Raw HTML, `<div>`, CSS, `\newpage` | **no** — dropped or mangled |
| Merged cells, column widths, text boxes | **no** — not expressible |

To centre a title or motto, use `custom-style="Title"` or `custom-style="Subtitle"`.
Those two styles are centred and bold in the reference document.

## Templates for Vietnamese administrative documents

Prefer a template when the user names a document type. Copy it, replace the
`{{TOKENS}}`, then write the body.

| File | For |
|---|---|
| `assets/templates/vn-nghi-quyet.md` | nghị quyết, quyết định — căn cứ + Điều 1/2/3 |
| `assets/templates/vn-bao-cao.md` | báo cáo — kết quả, hạn chế, phương hướng, kiến nghị |
| `assets/templates/vn-to-trinh.md` | tờ trình — sự cần thiết, phương án, kinh phí |
| `assets/templates/vn-cong-van.md` | công văn, thông báo — ngắn, một mục đích |

Each already carries the quốc hiệu, tiêu ngữ, tên cơ quan, số hiệu, địa danh–ngày
tháng, trích yếu, chữ ký, and `Nơi nhận`.

List what a document still needs:

```bash
python3 scripts/fill.py draft.docx --list
```

Fill tokens without regenerating, preserving any manual edits already in the file:

```bash
python3 scripts/fill.py template.docx out.docx \
  --set CO_QUAN_CHU_QUAN="UBND THÀNH PHỐ HỒ CHÍ MINH" \
  --set SO_HIEU="12" --set NAM="2026"
```

`fill.py` reports `unfilled:` for tokens Word split across runs rather than
silently leaving holes. If a token comes back unfilled, edit the markdown source and
regenerate instead of patching XML.

## Editing an existing .docx

Read the text, change it, regenerate — that is the fast path and it is usually right:

```bash
pandoc existing.docx -o edit.md && ./scripts/md2docx.sh edit.md out.docx
```

Warn the user that a round trip drops their original fonts and layout. When the
change is small and the file's formatting must survive (a name, a date, one number),
use `fill.py` or a targeted text replacement inside `word/document.xml` and never
`pandoc` the file back out.

## Speed discipline — do not do these

These are the habits that turn a 30-second document into a 10-minute one:

- **Do not author docx-js, python-docx, or OOXML code** for a normal document. The
  reference doc already owns typography. Hand-computing table widths in DXA is almost
  never needed.
- **Do not render, screenshot, or visually inspect** the output on every request.
  pandoc's docx writer is deterministic; if the markdown is right, the file is right.
  Inspect only when the user reports a problem or you changed the reference doc.
- **Do not run environment probes** (`which pandoc`, version checks, doctor scripts).
  Assume the server is provisioned; if `md2docx.sh` prints `FAIL: pandoc not
  installed`, report that and stop.
- **Do not build a table for a two-column header.** Use stacked paragraphs plus
  `custom-style` for centring.
- **Do not ask follow-up questions to fill a template.** Draft with plausible values
  and list what you assumed. Only block on the four fields that make a document
  legally wrong: issuing body, số hiệu, signer's title and name, primary recipient.
- **Do not add a table of contents, headers, footers, or page numbers** unless asked.
- **One file per turn.** Do not also produce a PDF, a preview image, and a summary
  document unless the user asked for them.

## Output contract for a chat product

- Write the `.docx` to the working directory with a human-readable filename in the
  user's language and script (`Báo-cáo-9-tháng.docx`, not `output.docx`).
- Reply with the file path plus one or two sentences on what it contains.
- Do not paste the full document text into the chat unless the user asks to read it
  inline; the file is the deliverable.
- Keep the intermediate `.md` — it is the cheapest way to make a follow-up edit.

## When to escalate to the full `docx` skill

Stop and say so if the request needs any of: exact column widths or merged cells,
tracked changes or comments, images positioned absolutely, a corporate template whose
styles must be preserved byte-for-byte, multi-section pages with different
orientations, or fields and content controls. Those need OOXML-level work, which this
skill deliberately does not attempt.

## Resources

- `scripts/md2docx.sh` — markdown → .docx with the reference doc applied.
- `scripts/fill.py` — `{{TOKEN}}` substitution in an existing .docx; stdlib only.
- `scripts/make-reference.py` — regenerates `assets/reference-vn.docx` from pandoc's
  defaults. Run only after changing typography, then re-test one document.
- `assets/reference-vn.docx` — the styling. Not read into context; passed to pandoc.
- `assets/templates/*.md` — Vietnamese administrative document skeletons.
- `references/vn-office-formatting.md` — NĐ 30/2020 structure, signature wording,
  language and number formatting. Read before composing a Vietnamese document type
  you are unsure about.
