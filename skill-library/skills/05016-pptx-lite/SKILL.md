---
name: pptx-lite
description: Fast, "good-enough" .pptx creation and editing for chat-driven office use (reports, nghị quyết, báo cáo, policy/propaganda decks, internal updates). Use whenever a user asks to make/produce/edit slides or a PowerPoint from a short request, especially in a superapp/chat context where speed matters and output only needs to be presentable, not bespoke. Mirrors the user's language in all slide text. Prefer this over the heavier `pptx` skill unless the user explicitly needs custom layouts, charts, images, or template-matching.
---

# pptx-lite

Produce a clean, consistent 16:9 `.pptx` from a small JSON spec via `scripts/build_deck.py` (python-pptx). No browser, no rendering loop, no validation round-trips — one deterministic run.

## Language rule (always)

Write every slide string in **the same language the user used to interact**. Do not translate, do not mix languages, do not add English subtitles unless the user asks. If the user writes Vietnamese, all titles/bullets/labels/footer are Vietnamese. Same for any other language.

## Workflow (3 steps)

1. **Draft the spec** in the user's language. Map their content to slide types (below). Keep each slide to one idea; ≤6 bullets/slide; ≤8 words per bullet where possible.
2. **Write the spec JSON** to a workspace file (e.g. `deck.json`).
3. **Run**: `<PY> <skill>/scripts/build_deck.py deck.json out.pptx`. It prints `OK: N slides -> out.pptx`.

`<PY>` = any python with `python-pptx`; use the shared skill venv `~/.qoder/skills/.venv/bin/python` (stock macOS python3 is 3.9 and `markitdown` needs ≥3.10; Homebrew python is PEP-668 externally-managed, so never `pip install` against it directly).

Editing an existing deck: read it first (`<PY> -m markitdown file.pptx`), then either regenerate from an updated spec (preferred) or patch text in place with python-pptx.

## Spec schema

```json
{
  "theme": { "kicker": "SHORT UPPERCASE BAND LABEL",
             "primary": "1E5128", "accent": "4E9F3D", "bg": "FFFFFF",
             "text": "333333", "muted": "666666", "light": "F0F7EE", "font": "Calibri" },
  "slides": [ { "type": "...", ... } ]
}
```

`theme` is optional; defaults shown. `kicker` appears in the top band of content slides (use the org/doc type, e.g. "BÁO CÁO NỘI BỘ", "NGHỊ QUYẾT").

### Slide types

| type | fields | use for |
|---|---|---|
| `title` | `title`, `subtitle?`, `footer?` | cover |
| `section` | `title` | divider between parts |
| `bullets` | `title`, `bullets[]`, `size?` | main content. bullet = `"text"` or `{"text","level":0|1}` |
| `two_col` | `title`, `left{heading,bullets[]}`, `right{...}`, `size?` | compare two groups |
| `table` | `title`, `header[]`, `rows[][]` | numbers/data |
| `stats` | `title`, `stats[{value,label}]` (≤4) | KPI / headline numbers |
| `closing` | `title`, `subtitle?`, `bullets?` | thanks + next actions |

Minimal example (Vietnamese):

```json
{"theme":{"kicker":"BÁO CÁO"},"slides":[
  {"type":"title","title":"Báo cáo quý III/2026","subtitle":"Phòng HCNS"},
  {"type":"bullets","title":"Kết quả chính","bullets":[
     {"text":"Hoàn thành 92% chỉ tiêu","level":0},
     {"text":"Tuyển dụng 18/20 vị trí","level":1}]},
  {"type":"stats","title":"Chỉ số","stats":[{"value":"92%","label":"Chỉ tiêu"},{"value":"0","label":"Quá hạn"}]},
  {"type":"closing","title":"Xin cảm ơn!","bullets":["Thông qua báo cáo"]}
]}
```

## Authoring guidance

- Office/policy decks read better dense-but-ordered than sparse: prefer `bullets` with level-1 sub-points over many thin slides.
- Numbers → `stats` or `table`, never prose.
- End policy/ nghị quyết decks with a `closing` slide listing the decisions to approve (Thông qua / Phê duyệt / Giao nhiệm vụ).
- Keep `kicker` and titles short; long titles wrap and crowd the band.
- Do not add images/charts/emoji here — that is the full `pptx` skill's job. If the user needs them, say so and switch skills.

## Resources

- `scripts/build_deck.py` — the generator. Deterministic; ~0.5s per deck. Only dependency: `python-pptx`.
