---
name: social-avatar-fetch
description: Fetch the real avatar/profile image URL for a social media creator from YouTube, Instagram, Twitter/X, or TikTok, preferring curl/profile JSON fields and falling back to browser DOM only when curl fails. Use when a creator's actual profile photo is needed for media kits, creator profile pages, design assets, or any task where a placeholder silhouette is not acceptable.
---

# Social Avatar Fetch

This skill gets a creator's real profile photo from social platforms. Prefer the curl-first data collected by `social-latest-fetch` when available; most platforms expose avatar URLs in profile JSON or initial HTML. Use browser DOM only when curl/profile extraction fails or the platform requires rendered/login state.

## Curl-First Order

1. If `social-latest-fetch` already ran, reuse `profile.avatar_url`.
2. If not, run the same curl/proxy reachability flow from `social-latest-fetch` and extract the avatar from the platform profile response.
3. Apply the platform resolution/stability rule below.
4. Browser fallback: navigate to the profile and run the DOM query only if curl fields are missing or blocked.

Do not screenshot to identify an avatar, and do not make more than one browser console attempt per platform unless the page was clearly still loading.

## Platform playbook

### YouTube (`youtube.com/@handle` or `youtube.com/channel/...`)

**Curl source:** `ytInitialData.channelMetadataRenderer.avatar.thumbnails` or page header avatar sources from `https://www.youtube.com/@<handle>` / `/about`.

**Browser fallback JS:**
```javascript
JSON.stringify((() => {
  const selectors = [
    'yt-avatar-shape img',
    'ytd-channel-avatar-element img',
    '#channel-header-container yt-img-shadow img',
    'img.ytCoreImageHost[src*="yt3"]',
    'img[src*="yt3.googleusercontent.com"]',
    'img[src*="yt3.ggpht.com"]',
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.src && el.src.includes('yt3')) return { src: el.src, selector: sel };
  }
  return null;
})())
```

**Resolution upgrade rule:**  
YouTube CDN URLs contain a size token like `=s88-c-k-...` or `=s160-c-k-...`. Replace the size number with `900` for best quality:
- Input:  `https://yt3.googleusercontent.com/HASH=s160-c-k-c0x00ffffff-no-rj`
- Output: `https://yt3.googleusercontent.com/HASH=s900-c-k-c0x00ffffff-no-rj`

The regex: `url.replace(/=s\d+-/, '=s900-')`

No extra verification fetch needed — YouTube's CDN always serves the upgraded size if the base hash is valid.

---

### Twitter / X (`twitter.com/handle` or `x.com/handle`)

**Curl source:** `window.__INITIAL_STATE__.entities.users.entities[*].profile_image_url_https` from `https://x.com/<handle>`, or `UserByScreenName` GraphQL result when using the internal Web API path from `social-latest-fetch`.

**Browser fallback JS:**
```javascript
JSON.stringify((() => {
  const selectors = [
    'a[href$="/photo"] img[src*="pbs.twimg.com/profile_images"]',
    'div[data-testid="UserAvatar-Container-mkbhd"] img',
    'img[src*="pbs.twimg.com/profile_images"]',
    '[data-testid^="UserAvatar-Container"] img',
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.src && el.src.includes('profile_images')) return { src: el.src, selector: sel };
  }
  return null;
})())
```

**Resolution upgrade rule:**  
Twitter profile image URLs end with a size suffix: `_normal`, `_bigger`, `_mini`, `_200x200`, or `_400x400`.  
Replace any suffix with `_400x400` (maximum publicly available):
- Input:  `https://pbs.twimg.com/profile_images/123/abc_normal.jpg`
- Output: `https://pbs.twimg.com/profile_images/123/abc_400x400.jpg`

The regex: `url.replace(/_(normal|bigger|mini|200x200|400x400)(\.\w+)$/, '_400x400$2')`

---

### Instagram (`instagram.com/handle`)

**Curl source:** `data.user.profile_pic_url_hd` or `profile_pic_url` from:

```bash
https://www.instagram.com/api/v1/users/web_profile_info/?username=<handle>
```

Instagram can block unauthenticated automation. Use this fallback order:

1. **Try `browser_console`** when curl profile extraction fails and the user is already logged into Instagram in the browser:
```javascript
JSON.stringify((() => {
  const img = document.querySelector('img[alt*="profile"], header img, img._aadp, div._aarf img');
  return img ? { src: img.src } : null;
})())
```

2. **Last HTTP fallback — use the unofficial oEmbed endpoint** (no login required, sometimes works):
```
https://graph.instagram.com/v1.0/oembed?url=https://www.instagram.com/<handle>/&maxwidth=400
```
This returns `thumbnail_url` which is typically the profile picture at 200×200.  
Call this via `web_fetch`.

3. **If both fail:** Mark `instagram_avatar: "login_required"` and use the YouTube or Twitter avatar instead. Do **not** burn more than 2 attempts on Instagram.

**Resolution note — signed CDN URL:**

Instagram CDN URLs (`cdninstagram.com` / `fbcdn.net`) are signed, time-limited, and may be tied to request context. Curl can often retrieve them immediately after `web_profile_info`, and they may sometimes render as plain `<img>` URLs, but third-party hotlinking is unreliable: URLs can expire, return 403, or fail when cookies/request headers do not match. CORS mainly affects `fetch()`/canvas access; broken `<img>` rendering is usually CDN auth, expiry, or hotlink protection rather than CORS itself.

**Correct handling when building UI:**
- **Self-host**: download the avatar image while authenticated on `instagram.com`, save to your own `/public/` directory, reference locally
- **Fallback**: use a verified avatar from another supplied platform when available (YouTube/Twitter avatars are usually more stable). If no real avatar is available, return `unavailable` to the calling skill without fabricating a substitute avatar.
- **Do not rely on hotlinking** `cdninstagram` URLs in production; if the image matters, download/self-host it or return the unavailable result to the caller

---

### TikTok (`tiktok.com/@handle`)

**Curl source:** `webapp.user-detail.userInfo.user.avatarLarger`, `avatarMedium`, or `avatarThumb` from profile HTML `__UNIVERSAL_DATA_FOR_REHYDRATION__`; creator embed also exposes `userInfo.avatarThumbUrl`.

**Browser fallback JS:**
```javascript
JSON.stringify((() => {
  const selectors = [
    'img[class*="avatar"]',
    'img[src*="p16-sign-sg"]',
    'img[src*="p77-sign"]',
    'img[src*="muscdn.com"]',
    '[class*="Avatar"] img',
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.src) return { src: el.src, selector: sel };
  }
  return null;
})())
```

**Resolution note:** TikTok CDN URLs are signed (contain `~tplv-` or query params like `&from=`). They're stable for days. No simple resolution upgrade — use the URL as-is.

---

## Execution Flow

```
1. Reuse existing curl profile data if present.
2. Otherwise run curl/proxy profile extraction from social-latest-fetch.
3. Apply the resolution upgrade/stability rule.
4. Browser fallback only if curl did not expose an avatar.
```

Stop as soon as you have a real URL and stability note.

**Do not:**
- Take screenshots to "see" the avatar — the DOM query is faster and more reliable
- Call `web_fetch` on the image URL to verify it loads unless the final UI must self-host a signed asset
- Try more than 2 CSS selectors in separate calls — batch them in the single JS array above
- Navigate to a sub-page (like `/channel`) when the main profile page works

## Output format

Return a structured result to the calling agent:

```json
{
  "platform": "youtube",
  "handle": "@mkbhd",
  "avatar_url": "https://yt3.googleusercontent.com/HASH=s900-c-k-c0x00ffffff-no-rj",
  "resolution": "900x900",
  "stability": "stable",
  "notes": ""
}
```

`stability` values:
- `stable` — URL is a permanent CDN link (YouTube, Twitter)
- `signed` — URL has an expiry / signature (Instagram, TikTok); note re-fetch requirement
- `login_required` — could not retrieve without authentication

## Multi-platform batch

When fetching avatars for multiple platforms in one task, use existing open tabs to your advantage:
- Reuse `social-latest-fetch` profile responses first.
- Run one curl/proxy profile extraction pass per missing platform.
- Only navigate browser tabs for platforms where curl fields are blocked.

This often avoids browser calls entirely for YouTube, Instagram, TikTok, and X profile avatars.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| JS returns `null` | Page not fully loaded, or YouTube changed DOM | Wait 1s with `browser_wait`, retry; or try `document.querySelectorAll('img')` and filter by src |
| YouTube URL missing `yt3` | Got a signed thumbnail, not avatar | Look for `img` with class containing `avatar`, `Avatar`, or `channel-avatar` |
| Twitter shows `_normal` | Correct — just apply the upgrade regex | `url.replace(/_(normal\|bigger\|mini)(\.\w+)$/, '_400x400$2')` |
| Instagram returns 401 | Not logged in | Use oEmbed fallback or accept `login_required` |
| TikTok URL expires | Signed CDN | Re-fetch at build time; inform caller |
