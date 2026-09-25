---
name: seo-keywords
displayName: Keyword Research
displayDescription: Multi-source keyword research with opportunity, difficulty and gap analysis
version: 1.55.0
description: Keyword Research — Unified multi-source keyword planning, analysis and research. Merges Google Keyword Planner, Search Console, Semrush, Ahrefs, DataForSEO and Moz data into a prioritized opportunity matrix with difficulty assessment, search-intent classification, QDF freshness modeling and competitor keyword gap analysis. Companion scripts: python/keyword_research.py, python/keyword_planner.py, python/gsc_query.py. Trigger phrases: keyword research, keyword planning, keyword analysis, find keywords, keyword gap, keyword opportunity, search volume, keyword difficulty, search intent, 关键词研究、关键词规划、关键词分析、关键词挖掘、找关键词、搜索量、关键词难度、关键词缺口。
argument-hint: "[seed-keyword|url] [--competitor url]"
license: "MIT"
user-invocable: true
tool_triggers:
  - tool: bash
    args:
      command: /seo\s+(?:keywords|keyword.research|keyword.analysis|find.keywords|keyword.gap|keyword.opportunity|search.volume)/i
---

# Keyword Research: Unified Multi-Source Analysis

> ⛔ **PRE-FLIGHT CHECKLIST — 在执行任何命令之前，必须按顺序完成以下检查：**
>
> - [ ] **Step 0: 检查数据源授权状态**
>   ```bash
>   python3 python/keyword_research.py --sources
>   ```
>   确认 Semrush API / Ahrefs / DataForSEO / Moz 是否已授权。
>
> - [ ] **Step 1: 无 API 时的强制路由决策（不可跳过）**
>   如果 Step 0 显示没有任何付费 API 已授权：
>   **必须立即询问用户**：
>   > "检测到 Semrush/Ahrefs 等 API 均未授权。如果您有 Semrush 账号，我可以通过浏览器帮您登录并提取精确关键词数据（搜索量、难度、CPC、意图）。是否尝试？"
>   - 用户同意 → 执行 §Semrush 浏览器辅助模式
>   - 用户拒绝 / 无账号 → 使用 Jungle Scout 默认数据源
>   - **⛔ 绝对禁止**：在未询问用户的情况下，直接使用 web_search / web_fetch 获取搜索量、难度等核心关键词数据
>
> - [ ] **Step 2: 确认数据源后，才进入下方执行命令章节**

---

## ⛔ 数据源路由决策（必读，不可跳过）

### 优先级表（Semrush 优先原则）

| Priority | Source | Data Available | Auth Required | Confidence | Status |
|----------|--------|---------------|---------------|------------|--------|
| 1 | Semrush API | Volume, difficulty, intent, SERP features, trends | Semrush API key | 0.97 | 最高优先 |
| 2 | **Semrush 浏览器** | Volume, difficulty, intent, CPC, trends (界面提取) | 用户登录 Semrush 账号 | 0.95 | **必须尝试** |
| 3 | Ahrefs | Volume, difficulty, CPC, intent, keyword gap | Ahrefs API key | 0.93 | Optional |
| 4 | DataForSEO | Volume, difficulty, CPC, SERP features, trends | DataForSEO API | 0.90 | Optional |
| 5 | Moz | Keyword difficulty, DA/PA | Moz API key | 0.80 | Optional |
| 6 | **Jungle Scout** | Search volume, keyword difficulty, CPC, trend, competition | 内置 | 0.85 | **默认兜底** |
| — | Google Keyword Planner | Search volume, CPC, competition, forecast | Google Ads API | 1.0 | 补充 |
| — | Google Search Console | Actual queries, impressions, clicks, CTR, position | GSC OAuth | 1.0 | 补充 |
| 7 | ⚠️ Web 公开数据 | 间接引用、他人报告的二手数据 | 无 | 0.30 | **最后手段，不推荐** |

### 选择逻辑（强制执行）

```
1. Semrush API 已授权？ → 使用 API（置信度 0.97）
2. Semrush API 未授权？ → 【必须】询问用户是否通过浏览器登录 Semrush
   ├── 用户同意 → 浏览器模式（置信度 0.95）
   └── 用户拒绝 → 继续 Step 3
3. Ahrefs / DataForSEO / Moz 已授权？ → 使用最高优先级的已授权源
4. 全部未授权 → 使用 Jungle Scout（默认，零配置）
5. Jungle Scout 不可用（极端情况） → 启发式估算 + Google Suggest，标注置信度"低"
6. ⚠️ 最后手段：web_search/web_fetch 仅用于市场背景、竞争格局等辅助信息
   【禁止】用于搜索量、难度、CPC 等核心指标
```

**核心原则：万不得已才降级。必须穷尽 Semrush 的两种获取方式（API + 浏览器），再考虑其他工具。绝不允许跳过 Semrush 浏览器直接使用 web_search。**

### 硬约束（违反即报告不合格）

| 约束 | 说明 |
|------|------|
| ⛔ 禁止 web_search 获取核心数据 | 搜索量、难度、CPC、意图等核心指标不得来自 web_search/web_fetch |
| ⛔ 禁止跳过浏览器询问 | 无 API 时必须询问用户是否使用 Semrush 浏览器，不可静默跳过 |
| ⛔ 禁止 N/A 后直接降级 | 脚本返回 N/A 说明数据源未配置，必须触发路由决策，不是"标注后继续" |
| 多源交叉验证 | 多源可用时取置信度最高的数据，交叉验证 |

---

## 🔍 Semrush 浏览器辅助模式

### 触发规则（满足任一即触发询问）

**自动触发询问**：Semrush API 未配置 + 以下任一项成立：
- 用户请求涉及 "搜索量/难度/意图/CPC/趋势" 中的任意一项
- 用户请求中包含 "精确/详细/完整/深度" 等精度描述词
- 用户请求的关键词数量 ≤ 100 个（浏览器模式可处理）
- 脚本返回 Volume: N/A 或 Difficulty: N/A

**跳过询问、直接降级到 Jungle Scout**（仅以下情况）：
- 用户明确说 "随便看看/简单分析/大概数据/不用太精确"
- 关键词数量 > 100 个（浏览器模式无法处理）
- 用户已明确拒绝过浏览器模式

### 询问模板

> "检测到 Semrush API 未授权。如果您有 Semrush 账号，我可以通过浏览器帮您登录并提取关键词数据（搜索量、难度、CPC、意图等）。是否尝试？"
> - 是，我有 Semrush 账号 → 进入浏览器模式
> - 否，用默认工具即可 → 使用 Jungle Scout

### 执行流程

通过 `sessions_spawn(agent_id="browser", ...)` 调用宿主内置的浏览器子代理执行（复用用户已登录的 Chrome 会话）：

```
Step 1: 打开 Semrush 登录页
  → 调用浏览器技能导航到 https://www.semrush.com/login/
  → 提示用户在浏览器中手动完成登录（含 2FA/验证码等）
  → 等待用户确认"已登录"

Step 2: 导航到关键词研究页面
  → 关键词概览: https://www.semrush.com/analytics/keywordoverview/?q={keyword}&db={country}
  → 关键词魔法工具: https://www.semrush.com/analytics/keywordmagic/?q={keyword}&db={country}
  → 竞品有机关键词: https://www.semrush.com/analytics/organic/positions/?q={domain}&db={country}

Step 3: 等待数据加载 + 提取
  → 等待页面表格/图表渲染完成
  → 截图保存（作为数据证据）
  → 提取页面中的结构化数据：
    - 搜索量 (Volume)
    - 关键词难度 (KD%)
    - CPC
    - 搜索意图 (Intent)
    - 趋势数据 (Trend)
    - 相关关键词列表

Step 4: 数据标准化
  → 将提取的数据转换为与 API 相同的 JSON 格式
  → 标注数据来源为 "Semrush (browser extraction)"
  → 置信度标注为 0.95

Step 5: 会话复用（可选）
  → 登录态 cookie 可保存，下次无需重复登录
  → 若 session 过期，重新引导用户登录
```

### 关键约束

| 约束 | 说明 |
|------|------|
| 用户主动授权 | 绝不自动打开浏览器，必须用户明确同意 |
| 人在回路 | 登录步骤由用户手动完成，Agent 只负责登录后的导航和提取 |
| 超时保护 | 单次浏览器会话最长 5 分钟，超时自动放弃并降级 |
| 数据量限制 | 浏览器模式每次最多提取 100 个关键词（避免触发反爬） |
| 合规声明 | 在报告中标注"数据通过浏览器界面提取，非 API 授权方式" |
| 失败降级 | 若浏览器被 Cloudflare/CAPTCHA 阻断 → 降级到 Ahrefs/DataForSEO/Moz/Jungle Scout |

### 数据来源标注格式

```
📊 数据来源: Semrush (浏览器提取) | 置信度: 0.95 | 采集时间: 2026-07-29 10:15
   说明: 通过浏览器登录 Semrush 界面提取，非 API 调用。数据可能因页面渲染差异存在 ±5% 偏差。
```

### 与 API 模式的数据对比

| 维度 | API 模式 | 浏览器模式 | Jungle Scout 默认 |
|------|---------|-----------|------------------|
| 数据完整性 | 100% | 60-80% | 70-85% |
| 速度 | <2s | 30-120s | <3s |
| 用户操作 | 零 | 需登录一次 | 零 |
| 置信度 | 0.97 | 0.95 | 0.85 |
| 适用场景 | 批量/自动化 | 单次深度研究 | 日常研究 |

---

## 🏃 执行命令参考

> ⚠️ 运行以下命令前，确保已完成 §数据源路由决策。若 API 未配置且未询问用户，命令将返回 N/A——此时必须触发浏览器模式询问，而非继续执行。

```bash
# Keyword research from seed keyword
seo keywords "running shoes"

# Keyword research from competitor URL (find their top keywords)
seo keywords https://competitor.com

# Keyword gap analysis (your site vs competitor)
seo keywords https://yoursite.com --competitor https://competitor.com

# Keyword opportunity matrix (prioritized list)
seo keywords "running shoes" --matrix

# Keyword difficulty assessment
seo keywords "running shoes" --difficulty

# Search intent classification
seo keywords "running shoes" --intent

# Check available data sources
python3 python/keyword_research.py --sources

# Show methodology appendix
python3 python/keyword_research.py --methodology
```

---

## ⚠️ 数据来源标注规范（强制）

**所有关键词研究输出必须在报告头部或每个数据表格旁标注实际使用的数据来源工具。**

格式要求：
```
📊 数据来源: [工具名称] | 置信度: [高/中/低] | 采集时间: [YYYY-MM-DD HH:mm]
```

示例：
```
📊 数据来源: Semrush API v2 | 置信度: 高 (0.97) | 采集时间: 2026-07-28 14:30
📊 数据来源: Semrush (浏览器提取) | 置信度: 高 (0.95) | 采集时间: 2026-07-28 14:30
📊 数据来源: Jungle Scout (默认) | 置信度: 中 (0.85) | 采集时间: 2026-07-28 14:30
📊 数据来源: 启发式估算 (无授权源) | 置信度: 低 | 采集时间: 2026-07-28 14:30
```

**规则：**
- 每个数据表格/列表必须标注来源（不可仅在报告头部标注一次）
- 若同一报告中混合使用多个数据源，每个表格分别标注
- 使用降级/启发式数据时，必须额外说明降级原因

## ⚠️ 方法论附录规范（强制）

**所有包含计算公式、评分模型、权重分配的报告，必须在报告末尾附加「方法论附录」章节。**

附录必须包含以下四项内容（缺一不可）：

### 附录模板

```markdown
## 附录：方法论与计算依据

### [公式/模型名称]

**计算公式：**
[完整公式，含变量定义]

**计算依据：**
[该公式的理论来源/行业基准/研究论文]

**采用原因：**
[为什么选择这个公式而非其他方案，对比说明]

**作用与意义：**
[该公式在 SEO 决策中的实际作用，如何指导行动]
```

### 必须附录的公式/模型清单

| 公式/模型 | 适用报告类型 |
|-----------|-------------|
| Keyword Opportunity Score | 关键词研究报告 |
| Keyword Difficulty Assessment | 关键词研究报告 |
| Content Quality Score (7维度) | 内容质量报告 |
| Site Health Score (加权) | 全站审计报告 |
| Priority Score (severity × effort × impact) | 所有含优先级的报告 |
| Freshness Decay Model (QDF) | 关键词研究/内容报告 |
| Share of Voice (SoV) | 竞品分析报告 |
| Core Web Vitals Score | 性能/技术审计报告 |

**违反此规范视为报告不合格，必须补全后重新输出。**

---

## Analysis Framework

### 1. Keyword Discovery

**From seed keyword:**
```bash
python3 python/keyword_planner.py ideas "<seed>" --json
```
- Get related keywords with search volume, CPC, competition level
- Expand to long-tail variations
- Include question-based keywords (who, what, how, why)

**From competitor URL:**
```bash
# Semrush: get competitor's top organic keywords
get_domain_organic_keywords domain=<competitor.com> limit=100
```
- Identify keywords competitor ranks for
- Extract traffic-driving keywords
- Find keywords you're missing

**From GSC (your site):**
```bash
python3 python/gsc_query.py --property <url> --days 90 --json
```
- Actual queries bringing traffic to your site
- Queries with high impressions but low CTR (optimization opportunities)
- Queries where you rank position 8-20 (quick win potential)

### 2. Keyword Opportunity Matrix

For each keyword, calculate priority score:

```
Priority Score = Volume × (1 - Difficulty) × Relevance × Intent_Match
```

| Factor | Source | Weight |
|--------|--------|--------|
| Search Volume | Keyword Planner / Semrush | 25% |
| Keyword Difficulty | Semrush / Moz | 25% |
| Business Relevance | Manual classification (High/Medium/Low) | 25% |
| Search Intent Match | Semrush intent classification | 25% |

**Output matrix:**

| Keyword | Volume | Difficulty | CPC | Intent | Current Rank | Priority | Action |
|---------|--------|-----------|-----|--------|-------------|----------|--------|
| running shoes for flat feet | 12,100 | 42 | $2.30 | Commercial | — | High | Create content |
| best running shoes 2026 | 8,100 | 65 | $3.10 | Commercial | 15 | Medium | Optimize existing |
| how to choose running shoes | 3,600 | 28 | $0.80 | Informational | 8 | High | Create guide |
| running shoes near me | 2,900 | 35 | $1.50 | Navigational | — | Medium | Local SEO |

### 3. Keyword Difficulty Assessment

| Difficulty Score | Competition Level | Recommended Action |
|-----------------|-------------------|-------------------|
| 0-30 | Low | Target immediately, quick wins |
| 31-50 | Medium | Target with quality content |
| 51-70 | High | Requires authority + backlinks |
| 71-100 | Very High | Long-term goal, needs strong domain |

**Difficulty factors:**
- Domain authority of top-ranking pages
- Backlink count of top 10 results
- Content quality of existing results
- SERP feature saturation (ads, snippets, AI Overviews)

### 4. Search Intent Classification

| Intent Type | Description | Content Format |
|-------------|-------------|---------------|
| **Informational** | Seeking knowledge (how, what, why, guide) | Blog post, tutorial, guide |
| **Commercial** | Comparing options (best, vs, review, top) | Comparison page, listicle, review |
| **Transactional** | Ready to buy (buy, price, deal, discount) | Product page, landing page |
| **Navigational** | Looking for specific brand/site | Homepage, brand page |

**Intent detection:**
- Semrush provides intent classification directly
- Heuristic: question words → informational; comparison words → commercial; action words → transactional

### 4-B. Query Deserves Freshness (QDF) Classification

Not all queries value freshness equally. Google's QDF system (patent US7877367B2,
"Query freshness determination") identifies queries where fresh results are
preferred and boosts recently-updated content for those queries. Keyword research
must classify target keywords by QDF sensitivity to guide content update cadence.

Reference: Das, A. et al. (2007). "Google's Query Deserves Freshness." Google
Research Blog; Google Patent US7877367B2; content freshness decay model
(exponential decay with content-type half-lives).

**QDF Classification:**

| QDF Level | Characteristics | Half-life | Update Cadence | Examples |
|-----------|----------------|-----------|----------------|----------|
| **High** | Time-sensitive, event-driven, "best X 2026" | 30-90 days | Monthly review, quarterly rewrite | "best SEO tools 2026", "Google algorithm update", "iPhone 17 price" |
| **Medium** | Evolving best practices, tool comparisons | 6-12 months | Semi-annual update | "how to do keyword research", "React vs Vue", "SEO audit checklist" |
| **Low** | Definitions, principles, historical facts | >2 years | Annual check for accuracy only | "what is PageRank", "how does DNS work", "history of Google" |

**QDF Detection Heuristics:**

High QDF signals (classify as High if ≥2 present):
- Query contains current year ("2026", "this year")
- Query contains temporal modifiers ("latest", "new", "recent", "updated")
- Query targets a product/event with release cycles
- SERP shows publication dates within last 3 months for Top-5 results
- Google Trends shows seasonal/spike pattern for the query

Low QDF signals (classify as Low if ≥2 present):
- Query is definitional ("what is...", "...meaning", "...definition")
- Query targets immutable concepts (math, physics, history)
- SERP Top-5 results are >12 months old and still ranking
- Google Trends shows flat/stable pattern over 2+ years
- Query has no temporal modifier and targets a principle/framework

**Integration with Content Strategy:**

For each keyword in the opportunity matrix, add a QDF column:

| Keyword | Volume | Difficulty | Intent | QDF | Update Trigger |
|---------|--------|-----------|--------|-----|----------------|
| best SEO tools 2026 | 8,100 | 65 | Commercial | HIGH | Rank drop >3 positions OR quarterly |
| what is technical SEO | 2,400 | 22 | Informational | LOW | Factual error detected only |
| SEO audit checklist | 3,600 | 38 | Commercial | MEDIUM | Semi-annual OR new Google update |

**Freshness Decay Model (for monitoring):**

```
freshness_score = exp(-λ × age_days)

Where λ (decay rate) by QDF level:
  HIGH:   λ = ln(2) / 60   (half-life = 60 days)
  MEDIUM: λ = ln(2) / 270  (half-life = 270 days)
  LOW:    λ = ln(2) / 730  (half-life = 730 days)
```

When freshness_score < 0.5 for a High-QDF page ranking position 5-20:
→ Flag "freshness-decay-risk" (high probability of ranking loss within 30 days)

When freshness_score < 0.3 for any QDF level:
→ Flag "stale-content" (recommend update regardless of current ranking)

**Do NOT apply QDF optimization to:**
- Evergreen pillar pages (their value is comprehensiveness, not recency)
- Historical/reference content where "old" is correct
- Pages where updating would remove accurate historical data

### 5. Keyword Gap Analysis

**Your site vs Competitor:**

```
Your keywords (GSC data)
    │
    ├── Shared keywords (both rank for)
    │   └── Compare positions: who ranks higher?
    │
    ├── Your unique keywords (you rank, they don't)
    │   └── Competitive advantage, protect these
    │
    └── Competitor unique keywords (they rank, you don't)
        └── Opportunity: create content for these
```

**Output:**
```
Keyword Gap Analysis: yoursite.com vs competitor.com
═══════════════════════════════════════════════════════
Shared keywords:        45 (you rank higher: 12, they rank higher: 33)
Your unique keywords:   28 (competitive advantage)
Competitor unique:      67 (opportunity to close gap)

Top 10 Opportunities (competitor ranks, you don't):
1. keyword-1 — Volume: 5,400, Difficulty: 38
2. keyword-2 — Volume: 3,200, Difficulty: 45
...
```

### 6. Keyword-to-Page Assignment

Assign every researched keyword to exactly one target page, so no two pages
compete for the same query:

```
Target page: /running-shoes/
├── running shoes (8,100)            ← primary
├── best running shoes (12,100)      ← secondary
└── running shoes for men (6,600)    ← secondary

Target page: /guides/start-running/
├── how to start running (3,600)     ← primary
├── running for beginners (4,400)    ← secondary
└── running form tips (2,900)        ← secondary
```

**Assignment rules:**
- One primary keyword per page; supporting variants become secondary keywords
- Group by search intent — never mix informational and transactional on one page
- If two candidate pages would target the same primary keyword, keep one and
  redirect or differentiate the other (hand off to `seo-keyword-optimization`
  for the full cannibalization workflow)

---

## Error Handling

| Error | Resolution |
|-------|------------|
| No keyword data source configured | 参见本技能 §Quick Setup，配置 Google Keyword Planner（免费）或 Semrush，然后重跑 `python3 python/keyword_research.py --sources` |
| GSC API quota exceeded | Wait and retry, or use cached data |
| Semrush rate limit | Wait 60s, reduce batch size |
| Keyword too broad | Suggest more specific long-tail variations |
| **Volume/Difficulty 返回 N/A** | ⚠️ **这不是"关键词无数据"，而是"数据源未配置"。立即触发 §数据源路由决策 中的 Step 1 询问（Semrush 浏览器模式）。不要继续执行，不要降级到 web_search。** |
| 浏览器被 CAPTCHA/Cloudflare 阻断 | 降级到 Ahrefs > DataForSEO > Moz > Jungle Scout，标注降级原因 |
| 浏览器会话超时 (>5min) | 放弃浏览器模式，降级到下一优先级工具 |

---

## Output Formats

### Quick Report (default)
```
Keyword Research: "running shoes"
═══════════════════════════════════════════════════════
Keywords analyzed:    156
High opportunity:     23
Medium opportunity:   45
Low opportunity:      88

Top 10 Keywords:
1. best running shoes — Vol: 12.1K, Diff: 65, Intent: Commercial
2. running shoes for flat feet — Vol: 12.1K, Diff: 42, Intent: Commercial
...

Recommended Actions:
- Create 5 new articles targeting high-opportunity keywords
- Optimize 3 existing pages for medium-opportunity keywords
- Build 2 in-depth guides for the highest-volume primary keywords
```

### Full Matrix (with --matrix flag)
CSV/JSON export with all keyword data fields

### Competitor Gap (with --competitor flag)
Detailed gap analysis with opportunity scoring

### Default Output Selection
- If user specifies format -> use user's format
- If user does not specify format:
  - Keyword research results -> **CSV/JSON + HTML summary** (data tables with opportunity matrix, difficulty scores, intent classification)
  - Backlink analysis -> **CSV/JSON + HTML summary** (referring domains, anchor text distribution, toxic link flags)
  - Keyword-to-page assignment -> **CSV** (one row per keyword: primary/secondary role, target page, intent)

### Format Options
| Format | When to use |
|--------|-------------|
| CSV/JSON + HTML summary | Data-heavy analysis with large result sets (default) |
| HTML report | Visual summaries, interactive charts, opportunity matrix |
| CSV | Raw data export, import into other tools |
| JSON | API integration, structured data pipelines |
| Markdown | Quick summaries, inline responses |

---

## Integration with Other Skills

本插件内可直接衔接的技能（均已随包提供）：

| Skill | Integration |
|-------|-------------|
| `seo-keyword-optimization` | Apply density / LSI / cannibalization checks to the mapped pages |
| `seo-full-audit` | Cross-check keyword targets against the 50-dimension technical audit |
| `geo-query-builder` | Turn high-intent keywords into AI-search monitoring prompts |
| `geo-content-writer` | Produce publish-ready content for top-priority keywords |
| `geo-site-auditor` | Validate that target pages carry the mapped keywords and E-E-A-T signals |

## Quick Setup

```bash
# Check available sources
python3 python/keyword_research.py --sources

# Configure Google Keyword Planner (free with a Google Ads account)
#   -> write ads_developer_token / ads_customer_id into
#      ~/.config/seo-kits/google-api.json
#   -> then verify: python3 python/keyword_planner.py ideas "seo tools" --json

# Configure Semrush / Ahrefs / DataForSEO / Moz (optional, paid)
#   -> write semrush_api_key / ahrefs_api_key / moz_api_key into
#      ~/.config/claude-seo/backlinks-api.json
#   -> or export SEMRUSH_API_KEY / AHREFS_API_KEY / DATAFORSEO_USERNAME / MOZ_API_KEY
#   -> then re-run: python3 python/keyword_research.py --sources
```
