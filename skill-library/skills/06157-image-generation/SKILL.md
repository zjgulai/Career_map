---
name: image_generation
description: |-
  Create an image based on a text description using AI image generation.

  ### Features:
  - Generate high-quality images from text prompts
  - Support explicit pixel sizes (WIDTHxHEIGHT): both dimensions are multiples of 16 up to 3840, aspect ratio at most 3:1, total pixels between 655,360 and 8,294,400. Default is 1024x1024.
  - Support background color: opaque (default) or transparent, with identical size support
  - Support JPG, JPEG, PNG format output with high resolution (only support png for transparent)

  ### Usage Guidelines:
  - Provide detailed, descriptive prompts for better results
  - Include specific details about style, composition, colors, and mood
  - Use clear, descriptive language for best image quality
  - Specify output file path with .jpg, .jpeg, .png extension (only support png for transparent)

  ### Best Practices:
  - Be specific about visual elements (lighting, perspective, style)
  - Include artistic style references when desired
  - Describe composition and framing details
  - Mention color schemes and atmosphere
---

# Image Generation

Use this skill to create an image from a text description with AI image
generation, then save it locally and display it to the user.

> **Working directory:** Every `scripts/...` path below is relative to the
> plugin root (the directory containing `kimi.plugin.json`). Run these commands
> from the plugin root, or use an absolute path. The skill directory does not
> contain a `scripts/` subdirectory.
>
> ```bash
> cd <plugin-root>
> python3 scripts/image_generation_tool.py ...
> ```

## Setup

Before the first use, ensure the agent-gw Python SDK (version 0.2.6 or newer) is installed. This checks the current environment and installs or upgrades it only when needed:

```bash
python3 <plugin-root>/scripts/image_generation_tool.py ensure-deps
```

The SDK needs an API key from `[REDACTED]`, `KIMI_API_KEY`, or
`~/.kimi/agent-gw.json`.

## Parameters

- `description` (required): detailed text description of the image to generate.
- `size`: `WIDTHxHEIGHT` in pixels. Default `1024x1024`. Both dimensions must
  be positive multiples of 16 and at most 3840, the aspect ratio at most 3:1,
  and total pixels between 655,360 and 8,294,400. Examples: `1024x1024`,
  `1536x1024`, `2048x1152`, `1024x1536`, `3840x2160`.
- `background`: `opaque` (default) or `transparent`. Both support the same
  sizes; transparent requires PNG output.
- `reference_image`: public URL(s) that guide the generation. Repeat
  `--reference-image` for multiple. The gateway only accepts public URLs, so a
  local image must be converted with `image-to-url` first (see "Reference
  images" below); passing a local path to `generate` is rejected.
- `output` (required): local output path ending in `.jpg`, `.jpeg`, or `.png`.
  Transparent background must use `.png`.

## Workflow

1. Build a detailed, descriptive `description` from the user's request: include
   subject, style, composition, lighting, colors, and mood.
2. Choose `size` and `background`. If the user asks for a specific aspect
   ratio or orientation, set the width/height proportions accordingly;
   otherwise pick what fits the content (default square `1024x1024`). Common
   choices — examples, not a fixed list: square `1024x1024` / `2048x2048`,
   landscape `1536x1024` / `2048x1152` / `3840x2160`, portrait `1024x1536` /
   `2160x3840`. Any dimensions satisfying the size contract are allowed
   (multiples of 16, at most 3840 per side, aspect ratio at most 3:1,
   655,360–8,294,400 pixels). Transparent output must use the `.png`
   extension.
3. Pick an `output` file path with a matching extension.
4. If the user supplies reference images, they must be public URLs. For any
   local image (a file on the execution environment, whether that is a sandbox
   or the client's local machine), first run the `image-to-url` command to
   upload it and get a public URL, then pass that URL with `--reference-image`.
   The gateway only accepts public reference URLs; passing a local path to
   `generate` is rejected.
5. Run the `generate` command (see "Script"). It calls `generate_image` on the
   gateway, reads `media.url` / `media.mime_type` from the response, and
   downloads the image to your `output` path with `curl` (the extension is
   corrected to match `mime_type`).
6. If the call fails, explain the failure reason from the printed error. Do not
   invent an image or a local path.
7. On success, the script prints the saved file path. Then **display the image
   to the user by calling the `readFile` tool on that path**. Reading the image
   to show it is the model's job, not this plugin's work.

## Background workflow for long jobs

Reference conversion (`image-to-url`) still runs normally. Only the generation
step should be backgrounded.

When the user wants to generate an image, launch the generate command with
`nohup`, redirecting stdout and stderr to a log file. Then start
`scripts/image_generation_watch.py` directly in the foreground (without
`nohup` or `&`); it checks the log every 30 seconds and keeps this sandbox
alive until the job finishes or fails.

Invoke both commands through `<plugin-root>` absolute paths, as shown below.
The sandbox starts every shell call in its own default directory, and if you
merge the two commands into one line, the `&` backgrounds only the part
before it — a leading `cd` does not carry over to the foreground watcher,
so a bare `scripts/...` would resolve against the wrong directory (for
example `/mnt/agents/scripts/...`). The absolute paths keep every invocation
self-sufficient.

Use a **unique log path per run**: the launcher generates a fresh `<run-id>`
(a timestamp or random string) every time, and both commands below must use
the same path. A fixed path lets a concurrent generation truncate another
job's log, and a stale log from an earlier run can be misread as this run's
result.

```bash
nohup python3 <plugin-root>/scripts/image_generation_tool.py generate \
  --description "..." \
  --size "2048x1152" \
  --background "opaque" \
  --reference-image "https://..." \
  --output "/path/to/output.png" \
  > /tmp/image_generation.generate.<run-id>.log 2>&1 &

python3 <plugin-root>/scripts/image_generation_watch.py \
  --log-file /tmp/image_generation.generate.<run-id>.log \
  --interval-seconds 30
```

Keep the watcher command running in the foreground. It exits with status 0 and
prints the saved path when generation succeeds, or exits with status 1 and
prints the failure reason (including local parameter validation errors), or
exits with status 2 when the log has not grown for `--stale-seconds` (default
900), which means the background job is probably dead — treat that as a failed
attempt and decide whether to retry with a fresh `<run-id>` and log path; it
is not a completed result. The watcher otherwise has no timeout: it keeps
polling until one of those terminal states appears in the generation log.

The command-execution environment that runs the foreground watcher may impose
its own timeout. Set that **outer execution timeout** to at least 10 minutes
(the gateway wait alone can take up to 450 seconds). This is an execution-tool
setting, not a watcher CLI option; do not add a nonexistent timeout argument
to the watcher.

If the outer environment times out while the generation log is still pending,
start `image_generation_watch.py` again in the foreground with the **same
`--log-file` path**. It immediately inspects the existing log and resumes
30-second checks. Do not start another `generate` command: the original
background generation job continues independently, and starting it again would
create a duplicate image task. The `generate` command's internal gateway and
download timeouts remain fixed in the tool script and cannot be overridden from
the command line.

## Reference images

The plugin runs in an execution environment that may be a sandbox or the
client's local machine. Either way, the gateway's `reference_image_urls` must be
public URLs, so any local reference image has to be converted first. This is an
explicit, separate step — `generate` does **not** accept local paths.

Convert each local image to a public URL with `image-to-url` (it uploads the
file via the agent-gw `upload_storage` API and returns the public `signed_url`),
then pass the printed public URL to `generate` with `--reference-image`:

```bash
python3 <plugin-root>/scripts/image_generation_tool.py image-to-url --image-path /path/to/local.png
```

## Script

Use the bundled script from the plugin directory.

Generate an image:

```bash
python3 <plugin-root>/scripts/image_generation_tool.py generate \
  --description "A serene mountain lake at sunrise, soft golden light, mirror reflection, ultra detailed" \
  --size "2048x1152" \
  --background "opaque" \
  --output "/path/to/output.png"
```

Convert a local reference image to a public URL first, then pass that URL:

```bash
# Step 1: upload the local image, capture the printed public URL
python3 <plugin-root>/scripts/image_generation_tool.py image-to-url --image-path /path/to/local_ref.png

# Step 2: pass public URLs (only) to generate
python3 <plugin-root>/scripts/image_generation_tool.py generate \
  --description "Same character in a snowy forest, cinematic" \
  --size "1536x1024" \
  --reference-image "https://example.com/ref1.jpg" \
  --reference-image "https://<public-url-from-step-1>" \
  --output "/path/to/output.jpg"
```

The script:

- `generate` accepts only public `--reference-image` URLs and sends them as
  `reference_image_urls`; a local path is rejected with a hint to use
  `image-to-url`
- `image-to-url` uploads a local image via the agent-gw `upload_storage` API and
  prints the resulting public `signed_url`
- sends `{"description", "size", "background", "reference_image_urls"}` to the
  gateway `generate_image` API
- reads the generated `media.url` and `media.mime_type` from the response
- downloads the image to the `--output` path with `curl`, naming the file by
  `mime_type` (png/jpg)
- prints the saved path and a reminder to display it with `readFile`

`generate_image` response shape (`resp.json()`):

```python
{
    "media": {
        "url": str,        # public URL of the generated image
        "mime_type": str,  # e.g. "image/png" or "image/jpeg"
    }
}
```

> This skill uses the agent-gw Python SDK: `client.tools.generate_image(...)`
> for generation and `client.upload_storage(...)` (which returns a public
> `signed_url`) to turn a local reference image into a public URL.

## Concurrency limits

The gateway allows at most 20 concurrent image generations per user. You may
launch several `generate` jobs in parallel when the task calls for it (for
example, a batch of images); jobs beyond that limit are rejected immediately
with a "too many concurrent generations" (429) error, and slow jobs can also
time out. This is expected, not a bug. When it happens: report which jobs
succeeded and which were rejected or timed out, wait for the running jobs to
finish, then retry the failed ones once with the user's consent. Do not retry
in a loop.
