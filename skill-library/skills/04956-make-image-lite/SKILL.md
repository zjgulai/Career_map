---
name: make-image-lite
description: "Fast, one-call image generation for chat-based end users of an app: turn a short request into a good-enough, shareable image in a single Qwen-Image call — no design ceremony. Use when a user in a chat/app sends something like 'draw me a birthday card for my mom', 'làm cho mình hình avatar quán cà phê', or '帮我做一张新年海报' and expects a finished image back quickly, in the SAME language they typed in. Any text that appears in the image is written in the user's interaction language, and so is your reply. Self-contained: ships its own copy of the API script at scripts/qwen_image.py and reads Model Studio credentials from credentials.json in its own skill directory, so no sibling skill install is required. Default model is qwen-image-3.0 (Standard, not Pro); model and provider are configurable via config.json or MAKE_IMAGE_* env vars. Not for precise commercial posters, dense infographics, multi-grid boards, or pixel-perfect text (use qwen-image + qwen-image-prompting), nor for complex multi-image editing (qwen-image edit)."
description_zh: "为 App 聊天端普通用户提供快速、一次调用即可完成的图片生成：把一句简短请求变成一张'够用又好看'、可分享的图片，单次 Qwen-Image 调用完成，无设计流程负担。当用户在聊天/App 里发来'帮我画一张给妈妈的生日卡'、'làm cho mình hình avatar quán cà phê'、'帮我做一张新年海报'这类请求、并期望快速拿回成图时使用；图中出现的文字必须与用户输入语言一致，你的回复也用该语言。自包含：内置 API 脚本副本 scripts/qwen_image.py，密钥读取本技能目录内的 credentials.json，无需安装同级 skill。默认模型 qwen-image-3.0（标准版，非 Pro）；模型与提供商可通过 config.json 或 MAKE_IMAGE_* 环境变量切换。不用于精确商业海报、密集信息图、多宫格、像素级文字（用 qwen-image + qwen-image-prompting），也不用于复杂多图编辑（qwen-image edit）。"
---

# Make-Image-Lite — fast one-call image for chat end-users

An app or chat user sends one short request; you return one finished,
"good enough" shareable image, fast — with a small creative spark, not a full
design project. **One model call.** No mood boards, no asset pipelines, no
iteration loops.

- Ships its own copy of the API script at `scripts/qwen_image.py`: same
  endpoint, same credentials, same download behavior. You never touch the API
  directly.
- Prompt formulas are inlined in Step 3 below; the optional
  `qwen-image-prompting` skill carries the long form.
- **Hard requirement: the image speaks the user's language.** Any text rendered
  in the image is in the user's interaction language (Vietnamese, Chinese,
  English…), and your chat reply is too. Read
  `references/language-and-text.md` first.
- **Default model is Standard `qwen-image-3.0`** (faster, cheaper) — not Pro.

## Prerequisites

- Nothing to install. The API client is bundled at
  `$HOME/.qoder/skills/make-image-lite/scripts/qwen_image.py` — Python 3.7+,
  standard library only, no pip packages.
- Credentials live in **`credentials.json` in this skill directory** (mode 600),
  configured once, manually, by a human — never handle API keys in this chat.
  If that file is absent the client falls back to
  `~/.qoder/qwen-image/config.json`, so an existing setup keeps working.
  **Never zip, commit, or share `credentials.json`.**
- This skill's own defaults live in `config.json` (same directory as this
  file); environment variables override them. `config.json` holds no secrets
  and does ship with the skill — `credentials.json` is the secret one.

## Step 0 — Load settings, check credentials

1. Read `config.json` in this skill directory. Any environment variable beats
   the file (see "Changing model/provider" below).
2. Check credentials without exposing the key:

```bash
python3 "$HOME/.qoder/skills/make-image-lite/scripts/qwen_image.py" status
```

3. If `"configured": false` — stop. Tell the user to run that same script's
   interactive `configure` subcommand themselves, in a real terminal. Do not
   collect or enter the key.

## Step 1 — Fix the language (mandatory, before any creativity)

Read `references/language-and-text.md`, then decide **L** = the language the
user is interacting in (from their message text; not your language, not the
app's UI language). Everything below — plan, prompt, on-image text, your reply
— is in L. If L is ambiguous, pick by the signal priority in the reference and
state the choice to the user in one line.

## Step 2 — Creative plan in one breath (working memory only)

- **Subject** from the request; the ONE feeling the image should give.
- **A small "wow"** — pick exactly one of: a signature lighting moment
  (golden-hour rim light, neon glow), an unexpected composition/angle
  (low angle, off-center, looking up), a bold or surprising color palette, a
  hidden detail, or one distinctive art style. One is enough; it's what
  separates "good enough" from "oh nice".
- **Format**: the size from config (default 1:1); match what the user wants
  (avatar, card, poster, phone wallpaper) if they say so.

No files, no directory ceremony. If the user attaches an image, it's an I2I
edit input (Step 4 `edit`) — not a pipeline.

## Step 3 — Compose the prompt

Build the prompt as subject + how to draw it + what must not change + what to
defend against. Non-negotiables:

- **Prompt written in L** (writing the prompt in L helps on-image text come
  out in L). Mixed-language prompts are fine.
- **On-image text quoted verbatim in L** in “ ” with position, font style,
  color/material, and hierarchy. Never write "加点文字" or paraphrase the copy.
  Keep text off faces and the hero area. If the user needs *lots* of precise,
  small text, say the Standard model is weaker on fine type — keep it short and
  bold, or bump this one call to Pro (see "Changing model/provider").
- **Exactly ONE primary art style** (real photo / anime / 3D / flat
  illustration / …) — never mix competing ones.
- **Light stated once**: source + direction, and that face and environment
  receive consistent lighting ("面部与环境受光一致").
- **Prevention clause at the end**: 无乱码、无伪文字、无畸形、手指数量正确、
  无水印、无多余文字 (no garbled text, no extra/fake text, no watermark).
- Rich but tight — for a plain request this is ~4–10 sentences, not a
  paragraph per attribute.

## Step 4 — Generate: ONE call

Text-to-image (no attached image):

```bash
python3 "$HOME/.qoder/skills/make-image-lite/scripts/qwen_image.py" generate \
  --prompt "<prompt from Step 3>" \
  --model <cfg.model> --size <cfg.size> --n <cfg.n> \
  [--no-thinking] [--negative-prompt "<things to avoid>"] \
  [--base-url <cfg.base_url>] \
  --out outputs --filename <kebab-slug>
```

- `<cfg.*>` values come from Step 0 (config.json / env). Defaults shipped:
  `qwen-image-3.0`, `1024*1024`, `n=1`, thinking on.
- **Always pass `--model`** — the script's own default is Pro; we want the
  Standard base model by default.
- **Never pass `--no-prompt-extend`.** Prompt extension is on by default and is
  what offloads prompt optimization to Model Studio's server. `enable_thinking`
  requires it, so disabling it silently forces thinking off too.
- `--prompt-extend-mode agent` gives finer server-side rewriting but is
  text-to-image only — the script exits if you pass it with `edit`. Leave the
  default (`direct`) unless the call is T2I and the prompt needs more help.
- `--size` is `"width*height"` (area 512×512–2048×2048, ratio 1:8–8:1). Omit
  only if you want the API to choose.
- User attached an image → use `edit` instead of `generate`: add `--image
  <img>` (repeatable, 1–3), and in the prompt lock what must NOT change first,
  then describe the change.
- This blocks while generating (typically ~10–40 s; thinking on is slower). Do
  not submit a duplicate task.

## Step 5 — Deliver; retry at most once

Hand back the **local file path** (the script downloads immediately; image
URLs expire in 24 h), plus a 1–2 line description in L: what the image shows
and that any on-image text is in L.

Retry exactly once, and only when the output clearly misses spec:
- on-image text wrong/garbled or in the wrong language, subject clearly off,
  or the call failed with a fixable cause → revise the prompt from the specific
  delta and regenerate (same flags). Then deliver whatever comes back — no
  further loops. Lite means fast.

## Changing model or provider (supported, without editing scripts)

Edit `config.json` (or set env vars per launch — useful on a shared server):

| Key | Env override | Meaning |
|---|---|---|
| `model` | `MAKE_IMAGE_MODEL` | `qwen-image-3.0` (Standard, default), `qwen-image-3.0-pro`, or any other id your gateway serves |
| `size` | `MAKE_IMAGE_SIZE` | `"width*height"`, e.g. `1024*1024` (1:1), `896*1152` (3:4), `1152*896` (4:3), `1344*768` (16:9), `768*1344` (9:16) |
| `n` | `MAKE_IMAGE_N` | images per call, 1–6 (default 1) |
| `thinking` | `MAKE_IMAGE_THINKING=0` | set `false`/`0` to disable thinking mode for speed (adds `--no-thinking`) |
| `base_url` | `MAKE_IMAGE_BASE_URL` | full generation endpoint for a different region/gateway |

Switching provider = point `base_url` at any Model-Studio-compatible gateway
plus `model` = the gateway's image model id (credentials still come from this
skill's `credentials.json`; a key for a different cloud needs that file
re-configured manually). For dense/precise in-image text, set `model` to
`qwen-image-3.0-pro` for that one call. Changing API shapes beyond that is out
of scope for this lite skill.

## When something fails

Relay 401 / 404 codes and messages verbatim. 401 = key/region/workspace
mismatch (keys are region-scoped). 404 / "model not found" = model id or
endpoint moved — re-check the docs. Persistent `403 AccessDenied` = per-key
model allowlist in the console. A `DataInspectionFailed`-style moderation
failure is stochastic — one fresh retry (optionally with a new `--seed`) is
legitimate (Step 5).

## Scope

Single call, one image (or up to 6 via `n`), plus simple `edit` over 1–3
reference images. Precise commercial posters, dense infographics, multi-grid
boards, pixel-perfect text, heavy multi-reference I2I, and deep prompt
diagnosis are beyond lite — say so plainly. The optional full `qwen-image` and
`qwen-image-prompting` skills cover those if they happen to be installed, but
this skill never calls them.

## Resources

- `references/language-and-text.md` — L detection, on-image text in L, reply
  language, text-rendering limits. **Read before Step 1.**
- `config.json` — defaults for model / size / n / thinking / base_url;
  overridden by `MAKE_IMAGE_*` env vars. No secrets; ships with the skill.
- `credentials.json` — API key, workspace id, region, model. Mode 600, created
  by `configure`. **Never distribute.** Absent until a human runs setup.
- `scripts/qwen_image.py` — the bundled API client (stdlib only; subcommands
  `status`, `configure`, `generate`, `edit`). This skill reads no other skill's
  directory. Maintenance note: it began as a copy of `qwen-image`'s client and
  has since diverged (skill-local credential lookup), so upstream fixes must be
  ported by hand, not re-copied.
