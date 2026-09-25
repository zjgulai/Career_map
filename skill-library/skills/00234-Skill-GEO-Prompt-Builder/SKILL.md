---
name: geo-query-builder
displayName: Prompt Builder
displayDescription: Generate AI search monitoring prompt matrix for any brand
version: 1.55.0
description: GEO Prompt Builder — Generate AI search monitoring prompt matrices for brands. Use when the user wants to analyze a brand's AI search visibility, needs a list of prompts for GEO data collection, or wants to start a GEO analysis. Also handles single-prompt repeated collection setup via single_query_runner.py. Trigger phrases: generate queries, generate prompts, GEO matrix, query list, start GEO analysis, brand monitoring, 生成 query、GEO 矩阵、品牌监控。
---

# Skill: GEO Prompt Builder

## 🚨🚨🚨 Top-level Red Line (Must Read Before Using This Skill) 🚨🚨🚨

**Once the Prompt generation is completed, you must IMMEDIATELY call `ask_user` to block and wait for user confirmation. It is strictly forbidden to proceed directly to collection.**

Correct workflow (none of these steps can be skipped):
0. **When collecting brand information initially, you must ask for the brand type** (see "Brand Type Required Question" below).
1. Call `query_builder.py` to generate the Prompt JSON file.
2. Output a preview of 5 sample queries + the file path in the chat.
3. **Must** call `ask_user(mode="form", ...)` to block—**form mode** (not chat + quickReplies) to display a clear options panel for the user.

4. Wait for the user's click/input in the **next turn** before calling the corresponding tools based on the selection (matching both English and Chinese labels):
   - **"Start Collection"** / **"Start Collection"** → Call `collector.py submit` (returns snapshot_id in seconds), then loop-call `collector.py poll` and copy the progress block to the user each time. **Do not use `collector.py run`** (which blocks the screen for 10 minutes). Add `--lang en` for English users. See the submit/poll workflow in the geo-collector skill.
   - **"Adjust Prompts"** / **"Adjust Prompts"** → Parse `[OTHER] xxx`, rewrite the query file according to the user's description, and call `ask_user` again.
   - **"Add More Prompts"** / **"Add More Prompts"** → Ask how many more prompts to expand, then re-run `query_builder.py`.
   - **"Change Brand"** / **"Change Brand"** → Restart the brand confirmation workflow.
   - `[SKIPPED]` → Treat as "do not collect for now", inform the user they can continue at any time.

**Prohibitions**:
- ❌ Calling `collector.py` immediately after Prompt generation (even if the user initially said "start analysis").
- ❌ Having both `ask_user` and `collector.py` in the same response.
- ❌ Using a plain text "Should we start collection?" instead of the `ask_user` tool.
- ❌ Using `mode="chat" + quickReplies=[...]` (small buttons are not prominent enough), **you must use `mode="form"`**.
- ❌ Treating the user's initial "analyze my brand" prompt as confirmation of the Prompt list.

**Cost of Violation**: Collection triggers an AI search call (~10 minutes) and cannot be undone.

**Default consent ≠ Explicit confirmation**. There must be an explicit button click by the user on the `ask_user` UI.

---

## 🚨 Collection Progress Passthrough (v1.14.0 - Weak-Model Friendly Version)

`collector.py` has already packaged the "reporting template" for you. The agent **only does one thing: copy-paste the content between `===CHAT_REPORT_BEGIN===` and `===CHAT_REPORT_END===` verbatim into the chat.**

Two report blocks will appear in the tool output:
- 🚀 **Trigger Report** (printed when the script starts, containing snapshot_id + estimated duration)
- ✅ **Completion Report** (printed when the script finishes, containing duration + count + file path)

**Iron Rules**:
- ✅ When you see `===CHAT_REPORT_BEGIN===`, copy the content between it and `===CHAT_REPORT_END===` **verbatim** into the chat.
- ❌ Do not rewrite, summarize, or omit.
- ❌ Do not call `run` again just because it is "taking too long"—polling is already handled internally, just wait.
- ❌ To check the progress, you can only use `python3 collector.py wait <snapshot_id>`. Re-running `run` is strictly prohibited.

---

## New User Onboarding (Must Read for First-Time Launch)

When a user interacts with the GEO Agent for the first time, briefly explain the overall capabilities and decision points using the following template:

> **GEO Agent can do 4 things for you:**
> 1. **Generate Monitoring Prompts** — Generate a batch of questions that real users would ask ChatGPT, tailored to your brand and industry.
> 2. **Collect ChatGPT Answers** — Call the AI search API to bulk-fetch AI answers + reference sources, and automatically wait for completion.
> 3. **One-Click Analysis Report** — Automatically run analysis, domain ranking, and strategic recommendations upon collection completion to generate a deliverable HTML Dashboard.
> 4. **GEO Content Production** — Write blog articles, Reddit posts, or perform deep-dive analysis on a single prompt based on the analytical insights.
>
> **You only need to make two decisions:**
> - **Prompt Direction**: Objective Prompt Mode (without brand name, recommended) or Brand Prompt Mode (with brand name)?
> - **Deep Analysis**: Analyze a single prompt using existing multi-query data, or collect that query 10 more times separately for a probability distribution?
>
> Now, please tell me your **brand name** and **core business**, and I will generate the Prompt matrix.

---

## Interaction Flow

1. Explain the overall capabilities to the user using the onboarding guide above (only for first-time launch or upon user inquiry).
2. Collect the following information (**must confirm all of them before generating queries**):

   | Information | Description | Example |
   |---|---|---|
   | Brand name | Target brand display name | `YourBrand` |
   | Website domain | Root domain, no www | `yourbrand.com` |
   | Category / service | Used to generate relevant queries | `B2B cross-border wholesale` |
   | **Brand type** (required) | Determines strategy direction for all downstream skills | `B2B` / `B2C` / `DTC` |
   | **Competitors** (required) | 2–4 brands with domains, for Mention Rate comparison | `Alibaba (alibaba.com), AliExpress (aliexpress.com)` |

   **两步收集（最少打字量）——详见 prompt.md §2 Step 2.0：**

   第一步只问 2 个字段，且**必须先在聊天里用文字说明每个框填什么**，再调 `ask_user`（部分客户端 label 渲染弱，文字说明是兜底）：
   ```python
   # 先输出文字：「第 1 个框：品牌名称，例如 Temu；第 2 个框：官网域名，例如 temu.com」
   ask_user(mode="fields", fields=[
     {"id": "brand_name",   "label": "品牌名称（例：Temu）",                     "placeholder": "输入你要监测的品牌名", "icon": "person"},
     {"id": "brand_domain", "label": "官网域名（例：temu.com，不要 www/https）", "placeholder": "输入品牌官网域名",     "icon": "link"}
   ])
   ```
   第二步：用 `web_search` 自动补出**品类 + 3–4 个竞对**，再走一表确认，不让用户手打竞对。
   > 示例必须写进 label 本身（不能只放 placeholder）。若用户反馈看不到标题，立即改为聊天逐项提问。Brand type 用下方单独的 form 问（不要塞进 fields）。

   > **Brand type is critical** — it controls which strategy templates are used downstream. B2C / DTC brands must NOT receive B2B advice (sourcing guides, MOQ discussions, procurement experience posts). Ask this every time; do not infer.
   >
   > Competitors missing = report has no cross-brand comparison. If the user is unsure, `web_search` top competitors in the category and recommend.

   **Brand type ask_user template (must use form mode, allowSkip: false):**
   ```python
   ask_user(mode="form", questions=[{
     "question": "What type of brand is this?",
     "header": "Brand Type",
     "allowSkip": False,
     "options": [
       {"label": "B2C",  "description": "Sells directly to consumers (e.g. Yeti, Anker, Nike)"},
       {"label": "B2B",  "description": "Sells to businesses / procurement teams (e.g. Alibaba supplier, factory, wholesaler)"},
       {"label": "DTC",  "description": "Own-brand direct-to-consumer, typically Shopify / independent store"}
     ]
   }])
   ```
   Store the result as `brand_type` and pass it to all downstream skills (strategy-advisor, content-writer).

3. If the brand is unfamiliar, use `web_search` to learn its background and identify primary competitors.
4. **Must ask for the Prompt Mode** (see next section), explaining the difference in one sentence.
5. Propose 3–5 generation directions, then generate after user confirmation. **Default to 30 queries** (recommended). User can request up to 100 max — requests above 100 must be refused (single-run limit). Explain: "100 is the hard limit for a single run."
6. Save the file, provide the path, and actively guide the user to the next step: **"Prompts are ready, would you like to start the collection now?"**

## ⛔ Hard Constraint: Must ask_user for Confirmation After Prompt Generation (Cannot be Omitted)

Once the Prompt file is generated, you must strictly follow the order below, **without skipping or merging steps**:

1. Display 5 sample queries in chat (taking one representative from each of the 4 categories) + the full file path.
2. **Immediately** call `ask_user(mode="form", ...)`—use form mode to show a clear options panel:
   ```python
   ask_user(mode="form", questions=[{
     "question": "Prompt list is ready. Please confirm the next step:",
     "header": "Confirm GEO Collection",
     "allowSkip": False,      # Must provide an explicit choice, Skip is not allowed
     "recommended": 0,         # Recommend "Start Collection"
     "options": [
       {"label": "Start Collection", "description": "Start collection now (~10 min)"},
       {"label": "Adjust Prompts",   "description": "Rewrite / replace / delete some queries (describe in [OTHER])"},
       {"label": "Add More Prompts", "description": "Expand beyond the current 30 queries"},
       {"label": "Change Brand",     "description": "Drop current brand and restart with a new brand name / website"}
     ]
   }])
   ```
3. **Before** the `ask_user` returns its result, calling `collector.py submit` or `run` in the same turn is absolutely prohibited.
4. Continue only after receiving the specific selection—branch based on the return value:
   - `"Start Collection"` / `"Start Collection"` → Trigger the collection process: first `collector.py submit` (seconds), then loop `collector.py poll` (each ≤90 seconds, reporting progress to the user). **Do not use `collector.py run`**.
   - `"Adjust Prompts"` / `"Adjust Prompts"` or `[OTHER] xxx` → Edit the query file based on the user's description, then return to step 2.
   - `"Add More Prompts"` / `"Add More Prompts"` → Ask how many queries to expand, then re-run `query_builder.py`.
   - `"Change Brand"` / `"Change Brand"` → Return to the brand confirmation workflow.
   - `[SKIPPED]` → This should not occur (allowSkip=False); treat as "do not collect for now" if it does.

**Common Errors Violating This Constraint**:
- ❌ Calling `collector.py submit` or `run` immediately after generating queries (even if the user initially said "start analysis").
- ❌ Placing `ask_user` and `collector.py submit/run` in the same response.
- ❌ Outputting "I have started collecting..." without actually calling `ask_user`.
- ❌ Using `mode="chat" + quickReplies=[...]`—buttons are not prominent enough, **you must use form mode**.
- ❌ Using `collector.py run` during the collection phase (deprecated, screen is black for 10 minutes)—**you must use the submit + poll loop**.

**Default consent ≠ Explicit confirmation**. The user's initial instruction "analyze my brand" does not constitute confirmation of the Prompt list.

---

## Prompt Mode — Ask Every Time, Explain Difference in One Sentence

> "Would you like to use **Objective Prompt Mode** (without brand name, recommended) or **Brand Prompt Mode** (with brand name)?
> Difference: Objective mode measures whether AI actively mentions you without prompts, providing more realistic data; Brand mode might artificially inflate the mention rate because your brand is already in the question."

| Mode | Example | Applicable Scenario |
|---|---|---|
| **Objective (Recommended)** | "What is the best B2B wholesale platform?" | Measure true organic exposure rate |
| **Brand** | "What do people think of [Brand] for sourcing?" | Sentiment analysis / competitor framework analysis |

Default to recommending Objective Mode. Recommend Objective and briefly explain if the user hesitates.

---

## Save Prompts

```bash
python3 scripts/query_utils.py <prompt_file> [source_name] [output_dir]
```

Output: `data/prompts/prompts_[source_name]_[timestamp].json`

---

## Single Prompt Repeated Collection (Deep Analysis Mode)

Used to collect a single Prompt N times repeatedly to analyze the probability distribution of AI answers.

```bash
python3 scripts/single_query_runner.py "<query>" [repeat=10] [country=US]
# Or pass a .json file, automatically taking the first query
python3 scripts/single_query_runner.py data/prompts/xxx.json 10 US
```

Suffixes like `[1]`...`[N]` are automatically appended each time to bypass AI search deduplication.
Output: `data/raw/single_[source]_[date]_[snapshot_id].json`
