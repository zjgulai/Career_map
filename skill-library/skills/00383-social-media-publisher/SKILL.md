---
name: social-media-publisher
description: >-
  Social media publishing skill for Instagram and X (Twitter). Handles image posts, text posts, hashtags, user tags, and multi-platform publishing.
  Use this skill whenever the user wants to post, publish, or share content to Instagram or X/Twitter — including phrases like "发ins", "发推", "帮我发一条", "post to Instagram", "tweet this", "share on social media", "发社媒", or any request involving creating social media posts with images, hashtags, or @mentions.
  Also use this skill when the user asks about social media publishing workflows, caption formatting, or hashtag best practices for Instagram/X.
region_scope: INTL
---

# Social Media Publisher

Publish content to Instagram and X (Twitter) with correct formatting, hashtags, and media attachments.

## Why This Skill Exists

Instagram's Composio tool description for `INSTAGRAM_POST_IG_USER_MEDIA` states in the `caption` field:
> "Use HTML URL encoding for hashtags (# becomes %23)."

This instruction is **wrong in practice** — following it causes hashtags to render as literal `%23` text in the published post. This skill exists to override that misleading documentation and ensure correct behavior, along with standardizing multi-platform publishing workflows.

## Platform Workflows

Run publishing tools from bash with **`accio-mcp-cli`**: use `accio-mcp-cli search instagram` or `accio-mcp-cli search twitter` to discover tool names when needed, then `accio-mcp-cli call <tool-name> ...` (see **accio-mcp-cli** / **mcp-tools**). Instagram Composio flows use `accio-mcp-cli call COMPOSIO_MULTI_EXECUTE_TOOL --json '...'` as below.

### Instagram (Two-Step Publishing)

Instagram uses a container-based publishing model: first create a media container, then publish it.

#### Connected Account (pre-resolved — skip INSTAGRAM_GET_USER_INFO)

The connected Instagram account info is stored in the user profile (USER.md / system context). At runtime:
- Read `ig_user_id` and `username` from the connected accounts section in the user profile context — do **not** hardcode them here.
- If not available in context, call `INSTAGRAM_GET_USER_INFO` with `ig_user_id = "me"` to resolve dynamically.
- Only call `INSTAGRAM_GET_USER_INFO` again if publishing fails with a 401/403 error (token may have rotated).

**What IS safe to cache here (non-sensitive workflow params):**
- Composio session_id for Instagram workflow: `pale`

#### Tool call pattern — use `COMPOSIO_MULTI_EXECUTE_TOOL` with `tools` array

Both steps must be called via `COMPOSIO_MULTI_EXECUTE_TOOL` (NOT `COMPOSIO_MULTI_EXECUTE_TOOL` with a flat `tool_slug` top-level arg — that fails validation). Correct format:

```json
{
  "tools": [
    {
      "tool_slug": "INSTAGRAM_POST_IG_USER_MEDIA",
      "arguments": { ... }
    }
  ],
  "session_id": "pale"
}
```

**Step 1 — Create Container:** Call `INSTAGRAM_POST_IG_USER_MEDIA`
- `ig_user_id`: resolved from user profile context (see above)
- `image_url`: A direct, publicly accessible image URL (must start with `https://`). URLs with query parameters (like signed S3 URLs) are rejected by Instagram.
- `caption`: The post text. **Write `#` directly — do not encode as `%23`.** The tool description says to encode; ignore that instruction because Instagram's backend does not decode it back, resulting in broken hashtags.
- `user_tags`: Optional array of `{username, x, y}` objects to tag users in the image (x/y range 0.0–1.0)
- Returns an `id` — this is the `creation_id` for the next step. It expires after 24 hours.

**Step 2 — Publish:** Call `INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH`
- `ig_user_id`: same as Step 1
- `creation_id`: The container `id` from Step 1
- Videos/Reels may take 30–120 seconds to process; images are typically instant.
- Returns an `id` — this is the `ig_media_id` for the next step.

**Step 3 (Optional) — Get Permalink:** Call `INSTAGRAM_GET_IG_MEDIA`
- `ig_media_id`: The `id` returned from Step 2
- `fields`: `"id,permalink"`
- Returns the public post URL. Present this to the user as a clickable link.

**Caption formatting checklist (run before Step 1):**
1. All `#` symbols are literal `#`, not `%23`
2. All `@` mentions use the correct username (no `@` duplication)
3. Line breaks use `\n` in the JSON string

### X / Twitter (Single-Step Publishing)

X uses a simpler model — one tool call handles both media upload and tweet creation.

**Post a Tweet:** `accio-mcp-cli call post_tweet` (or discover first with `accio-mcp-cli search twitter`)
- `text`: The tweet content (280 character limit). Hashtags use normal `#`.
- `media_urls`: Optional array of image URLs to attach (the tool handles upload automatically)
- `reply_to`: Optional tweet ID to reply to
- `tags`: Optional user tags

No separate media upload step is needed — `post_tweet` handles it internally.

## Local Image Upload

When the user provides a **local file path** (e.g. `~/Downloads/photo.jpg`, `/tmp/image.png`) instead of a URL, convert it to a public CDN URL before publishing. Instagram and X both require `https://` image URLs — local paths won't work.

### Option 1: Upload script (preferred)

Run the bundled script from this skill's directory:

```bash
bash ${SKILL_DIR}/scripts/upload-image-to-cdn.sh <image_path>
```

The script uploads the image to Alibaba CDN via the local Accio gateway and prints the CDN URL to stdout.

- **Prerequisite**: Accio desktop app must be running and the user must be logged in.
- **Gateway port**: auto-detects 4097/4098. Override with `GATEWAY_PORT` env var if needed.
- Supports jpg, jpeg, png, webp, gif, bmp.

**Example:**
```bash
CDN_URL=$(bash ${SKILL_DIR}/scripts/upload-image-to-cdn.sh ~/Downloads/product.jpg)
# CDN_URL is now something like https://sc02.alicdn.com/kf/Axxxxx.png
```

Then use `$CDN_URL` as the `image_url` (Instagram) or in `media_urls` (X/Twitter).

### Option 2: Drag-and-drop fallback

If the upload script fails (e.g. gateway not running, user not logged in, network error), instruct the user:

> 请将图片直接拖入对话框，系统会自动将其转为可用的 URL。
>
> (Drag the image into the chat — it will be automatically converted to a usable URL.)

The chat interface auto-uploads dragged images and provides a URL that can be used directly for publishing.

## Pre-Publish Checklist

Before calling any publishing tool, verify:

1. **Hashtag integrity**: Scan the caption/text for any `%23` — replace with `#`
2. **Image URL validity**: The URL must be a direct image link (ends in .jpg/.png/.webp or from a known CDN). Product page URLs are not valid image URLs. If the user gave a local path, it must be uploaded first (see **Local Image Upload** above).
3. **Character limits**: X tweets max 280 chars (URLs consume ~23 chars); Instagram captions max 2,200 chars
4. **@mention accuracy**: Verify usernames exist on the target platform (e.g., @shopify on Instagram, @Shopify on X — capitalization may differ)
