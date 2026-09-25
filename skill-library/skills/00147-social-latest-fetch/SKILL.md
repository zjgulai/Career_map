---
name: social-latest-fetch
description: Curl-first collection of public social profile data and recent posts/videos/tweets for Media Kits and creator pages. Use for YouTube, Instagram, TikTok, X/Twitter, or Facebook when you need creator profile fields, followers/subscribers, post/video counts, recent content, thumbnails/covers, visible interactions, contact links, or engagement-rate inputs. Falls back to browser only after curl/proxy attempts fail or a platform requires rendered/login state.
---

# Social Latest Fetch

Collect public social profile data, latest posts, and recent content with **curl first**, then browser fallback. Do not use OAuth or ask the user to connect accounts unless a future product flow explicitly supports it.

## Data Contract

Normalize every platform result to this shape. Leave unavailable fields as `null` and record why in `blocked_fields`; never invent metrics.

```json
{
  "platform": "instagram|tiktok|youtube|x|facebook",
  "source_url": "https://...",
  "method": "curl-direct|curl-proxy|browser|user-supplied",
  "status": "ok|partial|blocked|not-found",
  "profile": {
    "display_name": null,
    "handle": null,
    "profile_url": null,
    "avatar_url": null,
    "bio": null,
    "verified": null,
    "external_url": null,
    "contact_email": null
  },
  "metrics": {
    "followers": null,
    "following": null,
    "subscribers": null,
    "posts_count": null,
    "videos_count": null,
    "total_likes": null,
    "total_views": null
  },
  "latest_content": [
    {
      "id": null,
      "type": "post|reel|video|short|tweet",
      "title": null,
      "text": null,
      "url": null,
      "thumbnail": null,
      "posted_at": null,
      "age": null,
      "views": null,
      "likes": null,
      "comments": null,
      "shares": null,
      "retweets": null,
      "quotes": null,
      "bookmarks": null
    }
  ],
  "engagement": {
    "sample_size": 0,
    "avg_interactions": null,
    "rate": null,
    "formula": null
  },
  "blocked_fields": []
}
```

Engagement rate is only allowed when the denominator and sampled interactions are public:

- Instagram: average `(likes + comments) / followers` across returned posts.
- TikTok: only compute if likes/comments/shares are available; embed `playCount` alone is not engagement.
- YouTube: use average `(likes + comments) / subscribers` only when both likes and comments are available; otherwise report views/likes separately.
- X/Twitter: average `(likes + replies + reposts + quotes) / followers` when timeline items and followers are available.

## Curl-First Flow

1. Normalize supplied handles/URLs.
2. Probe platform reachability with curl without a proxy.
3. If probe fails, detect a local proxy port and retry curl through it.
4. Run the platform curl playbook below.
5. If curl returns no usable profile/content after reasonable attempts, use browser fallback and mark `method="browser"`.

When a browser fallback is required, prefer the host's browser inspection or `browser_console` capability to read rendered state and DOM data, then normalize the result into the same contract below.

Use a normal desktop UA:

```bash
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
```

Probe:

```bash
curl -sS -L -m 12 -o /tmp/social_probe.html -w 'HTTP=%{http_code} SIZE=%{size_download}\n' \
  -H "User-Agent: $UA" "https://www.youtube.com/robots.txt"
```

Proxy detection, only after direct probe fails or returns a platform block:

```bash
lsof -nP -iTCP -sTCP:LISTEN | rg -i 'clash|mihomo|surge|v2ray|sing|proxy|789|108|136|615|808|909'
for p in 7890 7891 13659 6152 1080 8080; do
  curl -sS -m 8 --proxy "socks5h://127.0.0.1:$p" https://www.youtube.com/robots.txt \
    -o /tmp/proxy_probe.txt -w "socks $p HTTP=%{http_code} SIZE=%{size_download}\n" || true
  curl -sS -m 8 --proxy "http://127.0.0.1:$p" https://www.youtube.com/robots.txt \
    -o /tmp/proxy_probe_http.txt -w "http $p HTTP=%{http_code} SIZE=%{size_download}\n" || true
done
```

Set `PX_ARG=(--proxy socks5h://127.0.0.1:<port>)` or omit it when direct curl works. Record whether data came from `curl-direct` or `curl-proxy`.

## Platform Playbook

### Instagram

Primary curl endpoint:

```bash
curl -sS -L -m 30 "${PX_ARG[@]}" \
  "https://www.instagram.com/api/v1/users/web_profile_info/?username=<handle>" \
  -H "User-Agent: $UA" \
  -H "x-ig-app-id: 936619743392459" \
  -H "Referer: https://www.instagram.com/<handle>/" \
  -o /tmp/ig.json
```

Fields:

- profile: `data.user.full_name`, `username`, `biography`, `is_verified`, `profile_pic_url_hd`, `external_url`.
- metrics: `edge_followed_by.count`, `edge_follow.count`, `edge_owner_to_timeline_media.count`.
- latest: first 12 `edge_owner_to_timeline_media.edges[].node`.
- content fields: `shortcode`, `__typename`, `taken_at_timestamp`, caption, `display_url`, `thumbnail_src`, `thumbnail_resources`, `edge_liked_by.count`, `edge_media_to_comment.count`, `video_view_count`.

Notes:

- This is the best public curl path for Instagram but may intermittently block.
- **Instagram Final Asset Self-Hosting Gate**: if the final UI will display an Instagram profile image, post cover, reel cover, thumbnail, or hero/background image outside Instagram, you MUST download the image into the generated site's `public/` directory and reference the local asset path. Do not ship raw `cdninstagram.com`, `fbcdn.net`, `scontent-*`, `thumbnail_src`, `display_url`, or `thumbnail_resources[].src` URLs in rendered UI markup/CSS. Keep signed Instagram CDN URLs only as source evidence in notes.
- If an Instagram image cannot be downloaded and verified, do not hotlink it in the final site. Cover/avatar download failure is a **visual-asset failure**, not automatically a content failure: when the post still has a reliable `post_url` and text/title/caption, keep the post card and replace the missing cover with a local `cover_or_platform_tile` fallback or platform icon/initial tile. Hide the whole post/module only when the target skill's content-integrity rules say the content item itself lacks enough evidence, such as no reliable destination URL.
- Record an `instagram_asset_map` in internal notes for every Instagram image intended for UI display: `source_url`, `local_path`, download method, HTTP status, file size, and verification result. Before final handoff, scan the generated project for raw Instagram CDN hostnames and fix any remaining UI references.
- When downloading Instagram CDN images for self-hosting, use the `thumbnail_src`, `display_url`, or largest `thumbnail_resources[].src` immediately after profile fetch. Save under a stable local path such as `public/assets/social/instagram/<shortcode-or-hash>.jpg`. A simple curl may work, but if it returns `403`, `HTTP=000`, or an SSL/proxy failure, retry as an image request with browser-like headers:

```bash
curl -sS -L -m 20 "${IMG_PX_ARG[@]}" \
  -H "User-Agent: $UA" \
  -H "Referer: https://www.instagram.com/" \
  -H "Accept: image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8" \
  -H "Accept-Language: en-US,en;q=0.9" \
  -H "sec-fetch-dest: image" \
  -H "sec-fetch-mode: no-cors" \
  -H "sec-fetch-site: cross-site" \
  -o /path/to/output.jpg \
  -w "HTTP=%{http_code} SIZE=%{size_download}\n" \
  "$CDN_URL"
```

Use the same proxy as the profile fetch by default. If a SOCKS proxy fails on Instagram CDN image downloads, retry `IMG_PX_ARG=(--proxy http://127.0.0.1:<port>)` on the same local proxy port when available. Treat success as `HTTP=200`, file size over 5KB, and `file output.jpg` reporting a real image.
- For Media Kit and Link-in-Bio builds, this gate applies before implementation handoff and again during final verification. A build that visibly uses an Instagram CDN URL for a cover/avatar/background has not passed.
- If this endpoint fails or returns a login/challenge body, fallback to browser with active login.

### TikTok

Profile stats curl:

```bash
curl -sS -L -m 35 "${PX_ARG[@]}" "https://www.tiktok.com/@<handle>" \
  -H "User-Agent: $UA" \
  -H "Accept-Language: en-US,en;q=0.9" \
  --compressed -o /tmp/tt.html
```

Parse `__UNIVERSAL_DATA_FOR_REHYDRATION__`:

- profile: `webapp.user-detail.userInfo.user` fields `uniqueId`, `nickname`, `signature`, `verified`, `avatarLarger`, `bioLink`.
- metrics: `stats.followerCount`, `followingCount`, `videoCount`, `heartCount`.

Recent content curl:

```bash
curl -sS -L -m 35 "${PX_ARG[@]}" "https://www.tiktok.com/embed/@<handle>" \
  -H "User-Agent: $UA" \
  -H "Accept-Language: en-US,en;q=0.9" \
  --compressed -o /tmp/tt_embed.html
```

Parse the script JSON containing `source.data["/embed/@<handle>"].videoList`.

Fields:

- latest: `id`, `desc`, `coverUrl`, `originCoverUrl`, `dynamicCoverUrl`, `playAddr`, `playCount`, `authorUniqueId`, `width`, `height`, `ratio`.
- URL: `https://www.tiktok.com/@<handle>/video/<id>`.

Notes:

- TikTok `/api/post/item_list` often returns `HTTP 200` with an empty body unless browser signing state is present; do not spend time on it.
- `/embed/@handle` is curl-friendly and includes covers/play counts, but not full likes/comments/shares.
- Official `/v2/video/list/` is stable and sorted by `create_time`, but requires OAuth Bearer token and `video.list`; do not use it in no-OAuth Media Kit collection.

### YouTube

Fetch channel tabs:

```bash
curl -sS -L -m 35 "${PX_ARG[@]}" "https://www.youtube.com/@<handle>" \
  -H "User-Agent: $UA" -H "Accept-Language: en-US,en;q=0.9" \
  --compressed -o /tmp/yt_channel.html
curl -sS -L -m 35 "${PX_ARG[@]}" "https://www.youtube.com/@<handle>/videos" \
  -H "User-Agent: $UA" -H "Accept-Language: en-US,en;q=0.9" \
  --compressed -o /tmp/yt_videos.html
curl -sS -L -m 35 "${PX_ARG[@]}" "https://www.youtube.com/@<handle>/about" \
  -H "User-Agent: $UA" -H "Accept-Language: en-US,en;q=0.9" \
  --compressed -o /tmp/yt_about.html
```

Parse `var ytInitialData = {...};`.

Fields:

- profile: `channelMetadataRenderer` and `aboutChannelViewModel` for title, description, avatar, channelId, canonical URL, country, joined date, links, email in description.
- metrics: `pageHeaderRenderer` / `aboutChannelViewModel` for subscriber text, video count text, total view count text.
- latest: `/videos` `lockupViewModel` entries.
- video fields: `contentId`, title, `contentImage.thumbnailViewModel.image.sources`, metadata rows containing views and age.

Optional single-video details:

```bash
curl -sS -L -m 35 "${PX_ARG[@]}" "https://www.youtube.com/watch?v=<videoId>" \
  -H "User-Agent: $UA" -H "Accept-Language: en-US,en;q=0.9" \
  --compressed -o /tmp/yt_watch.html
```

`ytInitialPlayerResponse.videoDetails.viewCount` gives exact views. Initial watch HTML may include like button text, but comment counts are often not present without continuation calls; mark comments unavailable rather than guessing.

Thumbnail rule: prefer the returned `contentImage` source. If missing, construct `https://i.ytimg.com/vi/<videoId>/hqdefault.jpg`; UI can try `maxresdefault.jpg` with `hqdefault.jpg` fallback.

### X / Twitter

Profile page curl gives basic profile state:

```bash
curl -sS -L -m 30 "${PX_ARG[@]}" "https://x.com/<handle>" \
  -H "User-Agent: $UA" \
  -H "Accept-Language: en-US,en;q=0.9" \
  --compressed -o /tmp/x.html
```

Parse `window.__INITIAL_STATE__` when present:

- profile: `entities.users.entities[...].name`, `screen_name`, `description`, `location`, `url`, `entities.url.urls`, `entities.description.urls`, `profile_image_url_https`, `is_blue_verified`, `verified`.
- metrics: `followers_count`, `friends_count`, `statuses_count`, `media_count`, `favourites_count`.

Timeline/content curl via internal Web GraphQL:

1. Pull current `main.*.js` from the profile HTML.
2. Extract the public Web bearer token and operation metadata for `UserTweets` and `UserByScreenName`.
3. Activate a guest token:

```bash
curl -sS -L -m 20 "${PX_ARG[@]}" \
  "https://api.x.com/1.1/guest/activate.json" \
  -X POST \
  -H "User-Agent: $UA" \
  -H "[REDACTED] <web_bearer>" \
  -H "Content-Type: application/json" \
  --compressed -o /tmp/x_guest.json
```

4. Call `https://x.com/i/api/graphql/<queryId>/UserTweets?...` with `Authorization`, `x-guest-token`, `x-twitter-active-user: yes`, `x-twitter-client-language: en`, and current `variables/features/fieldToggles` from the JS bundle.

Fields:

- tweet: `rest_id`, `legacy.full_text`, `legacy.created_at`, status URL.
- metrics: `favorite_count`, `reply_count`, `retweet_count`, `quote_count`, `bookmark_count`; `views.count` if present.
- media/cover: `legacy.extended_entities.media[].media_url_https`; for videos, this is the poster/thumb and `video_info.variants` contains mp4/m3u8 URLs.

Notes:

- Internal X query IDs and feature flags change; treat as `partial` if it breaks.
- Logged-out `UserTweets` may return profile highlights or mixed ordering rather than strict latest timeline. Record this limitation.
- Official X API endpoints such as `/2/users/:id/tweets` and `/2/tweets/search/recent` are stable but require API auth; do not use them in no-OAuth collection.
- If GraphQL curl fails or returns no tweets, fallback to browser.

### Facebook

Facebook is usually browser-only or partial without login. Still try a light curl probe before browser:

```bash
curl -sS -L -m 30 "${PX_ARG[@]}" "https://www.facebook.com/<page_or_profile>" \
  -H "User-Agent: $UA" \
  -H "Accept-Language: en-US,en;q=0.9" \
  --compressed -o /tmp/fb.html
```

If the response is a login wall, unsupported browser page, empty shell, or lacks usable JSON/metadata, switch to browser and mark curl fields blocked. Do not infer audience/reach from Facebook unless visible or user-supplied.

## Browser Fallback

Use browser only after curl/direct and curl/proxy attempts fail, or when the platform clearly requires rendered/login state. Keep browser extraction targeted:

- YouTube: open `/videos`, query video links and thumbnails from DOM.
- Instagram: open profile with logged-in session, query `article a[href*="/p/"], article a[href*="/reel/"]`; snapshot fallback if JS returns empty.
- TikTok: open profile, query video cards and `img/video[poster]` if embed curl failed.
- X/Twitter: open profile, query `[data-testid="tweet"]` and media images.
- Facebook: inspect visible public page content; accept partial data quickly.

Record fallback method and blocked fields in research notes.

## Output Discipline

- Prefer 6-12 latest items per platform; fewer is fine when the source only exposes fewer.
- Deduplicate by canonical content URL.
- Keep raw signed CDN URLs only as source evidence unless the UI can display them; for final sites, self-host unstable Instagram/TikTok assets when possible or render a linked placeholder.
- Do not spend more than two extra attempts on a platform once curl and browser both show a wall/block.
