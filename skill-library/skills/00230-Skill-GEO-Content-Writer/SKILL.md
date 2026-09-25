---
name: geo-content-writer
displayName: GEO Content Writer
displayDescription: Generate publish-ready content optimized for AI search
version: 1.55.0
description: GEO Content Writer — Produce publish-ready content based on GEO analysis data. Supports any platform: Blog, Reddit, Quora, LinkedIn, Twitter/X, YouTube, Medium, Hacker News, Newsletter, G2/Trustpilot, WeChat, Zhihu, Xiaohongshu, or any custom platform specified by the user. Also triggers geo-report-builder for single-prompt HTML analysis reports. Companion script: scripts/content_writer.py. Trigger phrases: write article, write blog, write Reddit post, content production, GEO content, draft a post, create content, single prompt analysis, deep dive, 写文章、写 blog、写 reddit、写小红书、写知乎、内容生产、帮我写一篇、单条分析、深度分析。
---

# Skill: GEO Content Writer

Generate publish-ready content based on GEO analysis data. Supports any user-specified platform; unknown platforms are automatically adapted to native format and tone.

---

## Supported Platforms

**Built-in Rules (Ready to Use):**

| Category | Platform |
|---|---|
| Long-form Content | Blog Guide, Blog Comparison, Medium |
| Community | Reddit, Quora, Hacker News |
| Professional Social | LinkedIn, Twitter/X Thread |
| Video/Newsletter | YouTube Script Outline, Newsletter |
| Review Platforms | G2, Trustpilot, Capterra |
| Chinese Platforms | WeChat Official Account, Zhihu, Xiaohongshu |

**User-specified custom platform** → Automatically fall back to general rules, adapting to the platform's native format and GEO writing principles, without requiring the user to confirm support beforehand.

---

## Two Use Cases

### Case A: Generate Content Based on Multi-Prompt Analysis Results

Generate content directly based on Dashboard data after the global monitoring run is complete.

**Interaction Flow:**
1. Read `strategy_[Brand].md` to get recommended topics.
2. Ask: **Target Platform** and **Topic** (or choose directly from the strategy report).
3. Generate full content, save the file, and provide the absolute path.

> If the platform specified by the user is not in the built-in list, simply reply "Okay, I will adapt the format for [Platform]" without asking whether it is supported.

### Case B: Deep Dive + Content Generation for a Single Prompt

#### Path B1: Reuse Multi-Prompt Data (Fast)

Extract the target Prompt from existing collection data and output analysis + content instantly.

```bash
python3 ../geo-analyzer/scripts/single_query_analyzer.py \
  <raw_json> <output_dir> "<Brand1,Brand2,Brand3>"
```

Upon completion of the analysis, call **geo-report-builder** to render the HTML report:
`python3 ../geo-report-builder/scripts/single_query_report.py <analysis_dir> <out.html> --query "<prompt>" --brand <Brand> --brand-domain <domain> --lang zh --raw <raw.json>`

#### Path B2: Repeated Collection for a Single Prompt (Deep)

Collect the same Prompt repeatedly **10 times** to analyze the probability distribution.

```bash
# Step 1: Repeated collection
python3 ../geo-query-builder/scripts/single_query_runner.py "<query>" 10 US

# Step 2: Deep analysis
python3 ../geo-analyzer/scripts/single_query_analyzer.py \
  data/raw/single_xxx.json \
  data/outputs/single_[topic] \
  "Brand1,Brand2,Brand3"
```

Upon completion of the analysis, call **geo-report-builder** to render the HTML report:
`python3 ../geo-report-builder/scripts/single_query_report.py <analysis_dir> <out.html> --query "<prompt>" --brand <Brand> --brand-domain <domain> --lang zh --raw <raw.json>`

---

## Decision Guidance

When the user says "help me write content", confirm the following in order:

1. **Platform**: Which platform do you want to publish to? (Any platform is supported)
2. **Topic**: Which topic or Prompt is this based on? (Can be selected from the strategy report recommendations)
3. **Language**: Chinese or English?

When the user says "I want to analyze this Prompt in depth", ask:

> "Do you already have collection data for multiple Prompts?
> - **Yes** → Directly extract and analyze from it, ready in seconds (Path B1)
> - **No / Want probability distribution data** → Repeat collection 10 times, taking about 5–10 minutes (Path B2)"

---

## Mandatory Steps After Content Generation

After generation is complete:
1. Save the content as a `.md` file.
2. Inform the user of the **full absolute path**: `/Users/.../data/outputs/content/xxx.md`

---

## Script Execution

```bash
python3 scripts/content_writer.py "<topic>" <platform> [brand] [output_dir] [lang]
```

**platform Examples**: `blog_guide`, `blog_comparison`, `reddit`, `quora`, `linkedin`, `twitter`, `youtube`, `newsletter`, `medium`, `hackernews`, `g2_review`, `wechat`, `zhihu`, `xiaohongshu`, or any custom name

**Output**: `data/outputs/content/[platform]_[topic]_[timestamp].md`

---

## General GEO Writing Principles

1. **Direct Answer First** — Give a concise answer at the very beginning.
2. **E-E-A-T Signals** — Quote data, cite experience, or use first-hand sources.
3. **FAQ Structure** — 5–8 questions and answers, making it easy for LLMs to extract snippets.
4. **Comparison Tables** — Mandatory for competitive topics.
5. **Verb-based Headings** — H2/H3 should mirror the way users ask AI questions.
6. **Natural Brand Placement** — Mention the brand 2–4 times naturally, avoiding stuffing.
7. **Source Citation** — Cite 3–5 authoritative external sources.
