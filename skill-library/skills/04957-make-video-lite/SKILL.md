---
name: make-video-lite
description: "Fast, one-call video generation for chat-based end users of an app: turn a short request into a good-enough, satisfying short video in a single Wan3.0 generation call — no production ceremony. Use when a user in a chat/app sends something like 'make a 10s video about my coffee shop opening' or 'làm video giới thiệu sản phẩm' or '帮我做一个新年祝福视频' and expects a finished mp4 back quickly, in the SAME language they typed in. Self-contained: ships its own copy of the API script at scripts/wan_video.py and reads Model Studio credentials from credentials.json in its own skill directory, so no sibling skill install is required. The video's spoken/sung content and music cues always match the user's interaction language — read references/language-and-voice.md before anything else. Model and provider are configurable via config.json or env vars (default model wan3.0-video). Not for remaking an existing video (video-remake), videos >30 s or multi-shot (video-storyboard), or full brief-driven productions (video-create)."
description_zh: "为 App 聊天端普通用户提供快速、一次调用即可完成的视频生成：把一句简短请求变成一个'够用且好看'的短视频，单次 Wan3.0 生成调用完成，无制作流程负担。当用户在聊天/App 里发来'帮我做一个咖啡店开业 10 秒视频'、'祝我生日快乐'这类请求、并期望快速拿回成片 mp4 时使用；视频的语言必须与用户输入的语言一致。自包含：内置 API 脚本副本 scripts/wan_video.py，密钥读取本技能目录内的 credentials.json，无需安装同级 skill。模型与提供商可通过 config.json 或环境变量切换（默认模型 wan3.0-video）。不用于翻拍已有视频（video-remake）、超过 30 秒或多镜头（video-storyboard）、完整的简报驱动制作（video-create）。"
---

# Make-Video-Lite — fast one-call video for chat end-users

An app or chat user sends one short request; you return one finished,
"good enough" short video, fast — with a small creative spark, not a full
production. **One model call.** No beat tables, no asset pipelines, no
iteration loops.

- Ships its own copy of the API script at `scripts/wan_video.py`: same
  endpoint, same credentials, same polling/download behavior. You never touch
  the API directly.
- Prompt formulas are inlined in Step 3 below; the optional
  `wan-video-prompting` skill carries the long form.
- **Hard requirement: the video speaks the user's language.** If the user
  writes in Vietnamese, the video's dialogue/music cues are Vietnamese. If
  Chinese, Chinese. Read `references/language-and-voice.md` first.

## Prerequisites

- Nothing to install. The API client is bundled at
  `$HOME/.qoder/skills/make-video-lite/scripts/wan_video.py` — Python 3.8+,
  standard library only, no pip packages.
- Credentials live in `credentials.json`, in this skill's own directory,
  configured once, manually, by a human — never handle API keys in this chat.
  If that file is absent the script falls back to
  `~/.qoder/wan-video/config.json`, then `~/.qoder/qwen-image/config.json`
  (same Model Studio account), so an existing video/image setup still works.
  **Never zip, commit, or share `credentials.json`** — it holds live API keys.
- `ffmpeg` on PATH if you need to trim or inspect the downloaded mp4; the
  generation call itself does not require it.
- This skill's own defaults live in `config.json` (same directory as this
  file); environment variables override them.

## Step 0 — Load settings, check credentials

1. Read `config.json` in this skill directory. Any environment variable
   beats the file (see "Changing model/provider" below).
2. Check credentials without exposing the key:

```bash
python3 "$HOME/.qoder/skills/make-video-lite/scripts/wan_video.py" status
```

3. If `"configured": false` — stop. Tell the user to run that same script's
   interactive `configure` subcommand themselves, in a real terminal. Do not
   collect or enter the key.

## Step 1 — Fix the language (mandatory, before any creativity)

Read `references/language-and-voice.md`, then decide **L** = the language the
user is interacting in (from their message text; not your language, not the
app's UI language). Everything below — plan, prompt, dialogue, music cues,
your reply — is in L. If L is ambiguous, pick by signal priority in the
reference and state the choice to the user in one line.

## Step 2 — Creative plan in one breath (working memory only)

- **Topic** from the request; the ONE feeling it should give.
- **A small "wow"** — pick exactly one of: an unexpected twist, a motivated
  camera move (slow push-in / circling reveal), a signature sound moment,
  a before→after reveal. One is enough; it's what separates "good enough"
  from "oh nice".
- **Duration**: config default is `-1` (smart — the model sizes the video to
  the content); use a fixed 2–30 s only when the user asks for a specific
  length.
- **≤3 beats** with timestamps summing to the duration; the hook lands in the
  first 2 s. State subject + action + camera + sound per beat.

No files, no directory ceremony. If the user attaches an image, it's a
first-frame or reference input (Step 4) — not a pipeline.

## Step 3 — Compose the prompt

Build the prompt as subject + action, visual style, camera work/framing,
lighting, with sound always stated. Non-negotiables:

- **Prompt written in L** (mixed-language prompts are fine; dialogue must be
  in its spoken language, quoted verbatim with speaker voice attributes).
- **禁止项 / "don't" list** at the end: no watermark, no subtitles, no
  garbled text, no extra characters.
- **Sound design stated**: what is heard — VO lines, music style/beat, or
  explicit silence (`全片无台词` style controls) — rather than left to fate.
- **Consistency locks** if a subject repeats across beats (restate outfit /
  object exactly).
- ≤20,000 chars. For a plain request this is 5–15 sentences — rich but tight.

## Step 4 — Generate: ONE call

```bash
python3 "$HOME/.qoder/skills/make-video-lite/scripts/wan_video.py" generate \
  --prompt "<prompt from Step 3>" \
  --duration <cfg.duration> --ratio <cfg.ratio> --resolution <cfg.resolution> \
  [--prime] [--model <cfg.model>] [--base-url <cfg.base_url>] \
  --out outputs --filename <kebab-slug>
```

- `<cfg.*>` values come from Step 0 (config.json / env). Defaults shipped:
  `wan3.0-video`, 720P, 9:16, duration `-1` (smart — the model picks the
  length from the prompt/content). A fixed number (2–30) overrides it.
- User attached an image → add `--first-frame <img>` (or `--ref-image` for
  reference-based mode). First/last-frame is mutually exclusive with
  references — never mix.
- This blocks while polling (generation takes ~1–5 min). Do not submit a
  duplicate task; if the host can't wait, add `--no-wait` and reconcile with
  the `task <id>` subcommand later.
- `--prime` maps to `wan3.0-video-prime` (noticeably faster, same surface) —
  enable it in config when speed matters more than dollars.

## Step 5 — Deliver; retry at most once

Hand back the **local file path** (the script downloads immediately; URLs
expire in 24 h), plus a 2-line description in L: what's in the video and that
its spoken content is in L.

Retry exactly once, and only when the output clearly misses spec:
- wrong language spoken/sung, or subject wildly off, or the task `FAILED`
  with a fixable cause → revise the prompt from the specific delta and
  regenerate (same flags). Then deliver whatever comes back — no further
  loops. Lite means fast.

## Changing model or provider (supported, without editing scripts)

Edit `config.json` (or set env vars per launch — useful on a shared server):

| Key | Env override | Meaning |
|---|---|---|
| `model` | `MAKE_VIDEO_MODEL` | Model id, e.g. `wan3.0-video`, `wan3.0-video-prime`, or any other id your gateway serves |
| `prime` | `MAKE_VIDEO_PRIME=1` | Use the accelerated model (equivalent to `--prime`) |
| `resolution` | `MAKE_VIDEO_RESOLUTION` | `480P` / `720P` / `1080P` |
| `ratio` | `MAKE_VIDEO_RATIO` | `16:9`, `9:16`, `1:1`, `4:3`, `3:4`, `adaptive` |
| `duration` | `MAKE_VIDEO_DURATION` | 2–30, or `-1` smart |
| `base_url` | `MAKE_VIDEO_BASE_URL` | Full task-creation endpoint for a different region/gateway |

Switching provider = point `base_url` at any Model-Studio-compatible gateway
plus `model` = the gateway's video model id (credentials still come from this
skill's `credentials.json`; a key for a different cloud would need that file
re-configured manually). Changing API shapes beyond that is out of scope for
this lite skill.

## When something fails

Relay 401 / 404 / task-`FAILED` code+message verbatim; a
`DataInspectionFailed`-style moderation failure on mid-generation output is
stochastic in Wan3.0 — one fresh retry with a new seed is legitimate (see
Step 5), persistent `403 AccessDenied` = per-key model allowlist in the
console.

## Scope

Single call, ≤30 s. Longer or explicitly multi-shot, remaking an existing
clip, branded ad production, and deep prompt diagnosis are all beyond lite —
say so plainly. The optional `video-storyboard`, `video-remake`,
`video-create`, and `wan-video-prompting` skills cover those if they happen to
be installed, but this skill never calls them.

## Resources

- `references/language-and-voice.md` — L detection, dialogue and music-cue
  language, voice attributes. **Read before Step 1.**
- `config.json` — defaults for model / prime / resolution / ratio / duration /
  base_url; holds no secrets; overridden by `MAKE_VIDEO_*` env vars.
- `credentials.json` — API key / workspace_id / region / model, mode 600,
  never zipped or shared; created by the installer or the script's
  `configure` subcommand.
- `scripts/wan_video.py` — the bundled API client (stdlib only; subcommands
  `status`, `configure`, `generate`, `task`). This skill reads no other skill's
  directory. Maintenance note: it is a diverged copy of `wan-video`'s client,
  so an upstream fix there must be ported here by hand.
