---
name: geo-collector
displayName: Data Collector
displayDescription: Collect AI-search answers and citations (ChatGPT / Gemini / Perplexity)
version: 1.55.0
description: GEO Data Collector — Collect AI search responses (ChatGPT / Gemini / Perplexity answers + citations). Use when the user has a query list and wants to collect LLM responses and citation sources at scale, or needs to run a single prompt repeatedly for fine-grained analysis. Companion script: scripts/collector.py. Trigger phrases: collect data, AI search data, snapshot, fetch answers, 采集数据、采集回答。
---

# Skill: GEO Data Collector

Batch-collect LLM responses and citations from ChatGPT, Gemini, and Perplexity via the AI search API.

> **🚨 CRITICAL: Agent MUST use `collector.py` for ALL data collection. NEVER substitute with `web_search`, `browser`, `web_fetch`, or any other built-in tool. The AI search API returns authentic ChatGPT/Gemini/Perplexity responses; web search returns Google/Bing results — completely different and incompatible data. See Hard Rule #5 in prompt.md.**

## Configuration

Data collection runs through the **Accio platform's `brightdata_geo_server` MCP** (`toolkit=accio, toolkit_service=brightdata_geo_server`), which provides 4 tools:
- `bright_data_submit` — submit queries, returns snapshotId
- `bright_data_poll` — query progress (returns when progress changes)
- `bright_data_status` — single status check
- `bright_data_download` — download full results

No hardcoded credentials — auth is managed by the Accio platform. No external connector authorization required.

---

## Interaction Flow (submit + poll mode)

1. Auto-detect the latest prompt file in `data/prompts/`, or ask the user.
2. Confirm country (default US) and query count.
3. **`submit` triggers instantly** → get `snapshot_id`, immediately report "Task submitted" to user.
4. **Loop `poll`** (≤90 sec each), report real-time progress (progress bar + collected count + elapsed) every time.
5. `poll` exit code 0 = complete (auto-downloaded), 1 = failed, 2 = keep polling.
6. Only after completion, ask whether to generate the report.

> "Collection complete! Raw data saved to `data/raw/xxx.json`.
> Ready to generate the analysis report? Just tell me the brand name and website domain — I'll run analysis → domain ranking → strategy → Dashboard, HTML report in 5 minutes."

---

## ⚠️ Hard Constraints to Prevent Duplicate Triggers (To Avoid Duplicate Triggers)

**Only 1 collection task can be triggered per analysis.** each trigger is a paid API call; duplicate triggers waste money.

| Scenario | Correct Action | Incorrect Action |
|---|---|---|
| User urges mid-way / extremely long context | Reply with "Data is still being collected, please wait for the `run` command to print `✅ Data written`" | Re-run `collector.py run` ❌ |
| Terminal disconnected / Agent restarted | Find the original `snapshot_id` in `data/locks/*.lock`, and use the `resume` command to continue waiting | Re-run `run` ❌ |
| Want to know if the task is still running | Run `collector.py status <snapshot_id>` to check status individually | Re-run `run` ❌ |
| User actively requests re-collection | **Explicitly inform the user: "This will trigger another paid collection, are you sure?" Once confirmed,** use the `trigger` command | Trigger again by default ❌ |

**The `run` command itself has a built-in duplicate prevention mechanism**: It reads `data/locks/<prompt_hash>.lock`. If an incomplete or completed collection task already exists for the same prompt file, it will automatically reuse the `snapshot_id` and **will not actually call the the AI search API**. Therefore, even if you repeatedly run the command, it will not waste money—but the Agent should still actively avoid it and use `status` to check the progress first.

---

## Collection Commands (v14.3 mainly promotes submit + poll)

### 🎯 Recommended Workflow: submit → loop poll (agent can report progress in real-time)

```bash
# 1️⃣ Trigger task (returns in seconds), prints "🚀 Collection task submitted" block + SNAPSHOT_ID
python3 scripts/collector.py submit <prompt_file> [country]
#   - Output contains one line of `SNAPSHOT_ID: sd_xxx`, agent records this sid
#   - Automatic prevention of duplicate triggers (if the same prompt file is already running, it reuses the sid; if already completed, it directly provides the file link)

# 2️⃣ Loop poll (each time blocking for ≤90 seconds)
python3 scripts/collector.py poll <snapshot_id>
#   Returns a ===CHAT_REPORT=== progress block each time (progress bar + collected count + elapsed time)
#   Exit code: 0=completed (downloaded), 2=continue polling, 1=failed
#
# Agent call example (pseudo-code):
#   while True:
#       run "python3 collector.py poll $SID"
#       copy CHAT_REPORT block to chat for user
#       if exit_code == 0: break       # Complete
#       if exit_code == 1: handle_error # Failed
#       continue                        # exit 2 → continue polling
```

### Other Commands (Backup / Debug)

```bash
# ⚠️ Blocks for 10 minutes, black screen from the agent's perspective, deprecated, only for manual debugging
python3 scripts/collector.py run <prompt_file> [country]

# 🚨 Safe: Only poll existing tasks (blocking until completion)
python3 scripts/collector.py wait <snapshot_id>

# Check status separately (no cost)
python3 scripts/collector.py status <snapshot_id>

# ⚠️ Trigger only (triggers a paid collection), for debugging
python3 scripts/collector.py trigger <prompt_file> [country]
python3 scripts/collector.py download <snapshot_id> <brand_name> [output_dir]

# ✅ Free: check whether a result file is real collection data (no API call)
python3 scripts/collector.py validate <result_file>
#   exit 0 = VALID / exit 1 = INVALID + prints REASON
```

Output: `data/raw/raw_GEO_[date]_[snapshot_id].json` (provided as `[filename](file:///absolute_path)` markdown link format in the completion block; agent **must keep the link format** when repeating it, do not change to plain text)
Lock files: `~/.geo-agent/locks/<prompt_md5>.lock`

---

## 🛡️ Result Validation & `--force` (v1.55.0)

A transient backend failure can return a JSON-RPC error object instead of records
(e.g. `{"success": false, "errorCode": "-32603", "errorMsg": "send request fail..."}`).
Before v1.55.0 that error was written to disk as if it were the finished dataset and
then cached in the lock file, so every later `submit` reused the broken file and the
only way out was deleting the lock by hand.

**Now every result file is validated** (valid JSON → not an error envelope → record
count > 0 → first record carries `answer_text` / `answerText`) at two gates:

| Gate | Behaviour on invalid data |
|---|---|
| Right after download | File is renamed to `INVALID_<timestamp>_<name>` and an error is raised telling the user it is a transient backend fault |
| Before reusing a cached file | File is quarantined, the lock's `out_path` is cleared, and a fresh collection is triggered instead |

A **missing** cached file is not treated as corruption — lock `out_path` is often a
relative path that simply cannot be resolved from the current working directory, so
the old resume-by-snapshot behaviour is preserved and no paid collection is wasted.

`poll_until_ready` also refuses a snapshot that reports `ready` while the progress log
says 0 of N collected.

**`--force` flag** — retrigger without hand-editing lock files:

```bash
python3 scripts/collector.py submit <prompt_file> [country] --engine gemini --force
python3 scripts/collector.py run    <prompt_file> [country] --force
```

`--force` ignores any existing lock and cached file and always triggers a new
(paid) collection. Per the duplicate-trigger constraints above, only use it when the
user explicitly asks to re-collect, or when a cached file was reported invalid.

---

## 🌐 Language Parameter `--lang` (Toggle between Chinese and English report blocks)

`collector.py` has a built-in report block `===CHAT_REPORT_BEGIN===...===CHAT_REPORT_END===`, which defaults to English. For **Chinese users**, add `--lang zh` when calling, and all report blocks (trigger / progress / completion) will switch to Chinese. Match the user's language — if the user speaks English, use `--lang en` (or omit); if Chinese, use `--lang zh`.

```bash
# Chinese (default)
python3 scripts/collector.py submit prompts.json US
python3 scripts/collector.py poll sd_xxx

# English
python3 scripts/collector.py submit prompts.json US --lang en
python3 scripts/collector.py poll sd_xxx --lang en
```

The parameter can be placed anywhere (beginning, middle, or end), or you can use the environment variable `GEO_AGENT_LANG=en` to set the global default.

---

## Post-Collection → One-Click Report (auto when ready)

Upon completion of the collection, hand off to geo-dashboard-builder **without making the user type a free-form reply**.

**If these were already confirmed earlier in the conversation, run `run_pipeline.py` immediately:**

| Parameter | Description |
|---|---|
| `brand_name` | Brand display name, e.g., `YourBrand` |
| `brand_domain` | Official website root domain, e.g., `yourbrand.com` |
| **`competitors`** | `BrandName:domain`, comma-separated |
| `brand_type` | `B2B` / `B2C` / `DTC` |
| `lang` | Report language `en` / `zh` (match user language) |

**Only if a required parameter is missing:** call `ask_user(mode="form")` with clickable options (Generate Report Now / Adjust Competitors / Change Language / View Raw Data). Never ask "reply yes to continue" in plain chat.

> Example competitor format: `Alibaba:alibaba.com,AliExpress:aliexpress.com,Global Sources:globalsources.com`
