---
name: dtc-builder
license: MIT
description: Shopify zero-to-launch build orchestrator with no GraphQL execution. Owns the ordered connection, optional sourcing, product-listing, Collection organization, theme-decoration, audit, resume, and advisory launch-checklist flow, plus registration, plan/theme choice, navigation, and Markets guidance. Payment, shipping, tax, legal policy, and domain setup remain merchant-owned. Delegates confirmed Product and Collection outcomes—not mutations, API payloads, or field placement—to the shared `shopify-product-editor` Product/Collection executor, and theme outcomes to `shopify-theme-decorator`; auditors verify results. Uses `aw-shopify-oauth` for Connector OAuth. Trigger for whole-store builds such as "build my store from scratch", "zero to launch", "一键开店", "帮我开店", "从 0 到 1 开店", two or more sequential build stages in one request, or setup asks such as register a store, pick a plan, design navigation, enable Markets, or run a pre-launch checklist.
---

# Shopify Agent (Setup Orchestrator)

Setup-and-launch orchestrator for new Shopify stores. Owns the **non-API merchant-setup work** (registration, plan, payment, shipping, tax, policies, navigation, Markets) and **routes all covered writes through the plugin's sub-agent matrix**. Unsupported Metafield or discount writes remain explicitly gated main-Agent routes.

---

## 0. Zero-to-Launch Orchestration (the 3-stage chain + optional pre-launch checklist)

This skill **owns** the end-to-end store-build flow. When the user wants to go from "no store" / "empty store" to "launch-ready store", run the 3-stage chain below (Stage 0→3) **in order**. Do NOT fall back to one-stage-at-a-time conversation. Stage 4 is an **optional advisory checklist**, not a required build stage — the build is functionally complete after Stage 3.

**Trigger**
- Phrases such as `build my whole store`, `build a store from scratch`, `from scratch`, `end-to-end`, `zero to launch`, `start a Shopify store`, `launch a new store`, `一键开店`, `帮我开店`, `从 0 到 1 开店`, or equivalents in the user's language.
- The user names two or more sequential build stages in one turn, e.g. "list products AND decorate the theme".

**Do not trigger (these are single-stage maintenance on an existing store → handle via the plugin's Skill Routing, not this chain)**: "list these new products", "change the banner", "audit this page", "post to IG", "find suppliers", "set up monitoring".

**The 3-stage chain (+ optional Stage 4 advisory) — who runs each stage**

The main Agent **orchestrates** the chain. Write stages and concrete audits are delegated to their owning sub-agents via `sessions_spawn` (spawn mechanics belong to the host; the Product/Collection brief belongs to `shopify-product-collection-write-brief`). Main retains planning, evidence review, remediation coordination and final decisions; the execution routing tables define direct-action exceptions.

| # | Stage | Who runs it | How | Stage gate? | Post-stage validation |
|---|---|---|---|---|---|
| 0 | **Connection** | Main Agent (inline) | Read `../aw-shopify-oauth/SKILL.md` and drive the Connector OAuth flow (see §2 Authentication). | Mandatory (user must finish Connector OAuth in browser) | Live permission probe defined in `aw-shopify-oauth` |
| 1 | **Product sourcing & selection** *(optional — skip if user already has a SKU list)* | Main Agent (inline) | Read `dtc-product-selection` and run its honest-evidence workflow. If confidence is `not-recommended` (signal too weak / fails red lines), surface that and do NOT auto-advance — picking a different niche or aborting is valid. On user-confirmed candidate, hand off to the platform-bundled `product-supplier-sourcing` skill (Accio Work catalog; load via `skill-finder` if not currently in the host Agent's available skills) for supplier matching. Result MUST return to user for confirmation — never auto-advance into Stage 2. | **YES — in chat, present a visual summary: top candidates with inline reference images (`![](<imageURL>)`, URLs from real tool calls — never `image_generate`), key evidence, the confidence verdict; then link the full report/CSV. Await confirm before Stage 2.** | **Intentionally none** — no store write yet; the stage-gate confirmation is the only check |
| 2 | **Listing — push Products and organize Collections** | **Shared sub-agent: `shopify-product-editor`** | Confirm the Product batch and any Collection outcome in one domain-separated Product/Collection preview. The shared executor loads `shopify-product-management` and `shopify-collection-management`, derives declared dependencies, and runs Product first only when Collection membership consumes Product results. Load the Marketing content/SEO guidance only when the merchant explicitly requests that work. | **YES (before spawn)** — show every Product value being written, approved media, each Collection target, publication outcome, and blast radius. When explicit SEO work is included, also show the exact SEO fields and related guidance. | **Sub-agent:** `shopify-store-auditor` (`scope: post-stage-2`) verifies the exact requested Product/Collection outcomes, including intended draft/publication states. Unrelated catalog issues do not widen this gate. Run `shopify-page-auditor` for SEO only when SEO validation was requested and the Product is verified public and reachable. A dependent Collection failure after Product success remains PARTIAL. |
| 3 | **Theme decoration — shopper-visible style, content, and surfaces** | Main confirms intent → decorator implements/self-checks → store auditor checks results → Main coordinates fixes and acceptance/publication | Load `shopify-theme-craft` and its `references/theme-handoff.md` before the business preview or spawn. The decorator owns file implementation and final read-back; Main owns the managed local watcher under Theme Craft §4. The auditor owns scoped preview/render/visual checks under `shopify-storefront-validate`. Main reviews evidence and coverage without repeating the browser pass. | The Theme handoff's confirmed decoration scope; publication approval for the exact verified theme only when publication was requested. Reuse existing approval for the unchanged action. | Auditor checks local preflight when available (`local-preview`), final remote draft (`admin-preview`), and production after requested publication (`post-stage-3`), each within the original affected surfaces and visual requirements. |
| 4 | **Launch readiness guidance** *(optional, not a required stage)* | Main gives guidance; `shopify-store-auditor` (`scope: pre-launch`) performs requested concrete checks | Surface the §4.3 checklist as recommendations. If the user requests verification, dispatch the auditor within that scope and review its evidence. This is not a mandatory gate for unrelated work. | No (advisory only) | Only checks actually requested |

**Operating rules**

- **Stage gates** (rows marked YES): summarize what is about to happen + what changes for the shopper, then apply the selected domain's confirmation contract. Silence / emoji / "you decide" is NOT consent. Run the gate **before** the corresponding `sessions_spawn`; the sub-agent inherits the confirmation and does NOT re-prompt.
- **Product/Collection brief ownership**: load [`shopify-product-collection-write-brief`](../shopify-product-collection-write-brief/SKILL.md) before preparing the preview. It is the single source for the nested business brief, confirmation evidence, domain envelopes, publication intent, and declared dependencies. This workflow chooses the stage and requested outcome; it does not redefine the brief or add required fields.
- **Post-stage validation**: Main sends the original task, exact resources, expected states, affected surfaces and executor evidence to `shopify-store-auditor` with the matching phase. The phase selects candidate checks; it does not expand the task into full-store readiness. On required blocking findings, Main coordinates fixes with the owning executor and returns corrected results to the auditor. Reuse valid current evidence, then record the final decision; do not duplicate browser checks inline.
- **Explicit preview-only delivery**: when the original confirmed scope ends at a verified theme preview, use the auditor's `admin-preview` scope and the checkpoint's `preview` delivery scope. Report that delivered preview accurately; Stage 3 then ends after its required preview checks. Keep the normal publication and live-audit path for a build whose scope includes going live.
- **Stage 1 is optional** — skip cleanly when the user already provides products / SKUs / supplier list, and state the skip. If Stage 1 runs but selection returns `not-recommended`, surface it honestly — do not pad the report or force Stage 2.
- **Stage gates must be visual, not just file links** — surface in-chat content (key bullets, candidate / product cards, inline reference images from real tool calls — never `image_generate`), then link deliverable files for depth. A bare "see `deliverables/xxx.md`" is not an acceptable gate.
- **Growth stages stay separate.** Product listing does not imply SEO preparation or audit. Run Product content optimization, classic SEO, pSEO, GEO, social marketing, Search Console measurement, or ongoing monitoring only when explicitly requested, and keep each track separately scoped.
- **Resumability** — follow [`references/build-checkpoint.md`](references/build-checkpoint.md) from the first verified connection. Resume from this build's saved receipts and remaining work. Store-wide facts (products exist, a theme changed, password enabled/disabled) do not prove this task completed a stage. Revalidate the exact saved resource IDs; if a receipt is missing or a write was interrupted, reconcile those resources before retrying.
- **Stage-3 handoff** — use `shopify-theme-craft/references/theme-handoff.md` before delegation and `shopify-storefront-validate` after the decorator returns. The auditor executes checks and returns evidence; Main reviews coverage, coordinates fixes, handles publication authorization/action and records receipts, remaining work and final status.
- **Task-board projection** — update a theme/build task to `completed` only after its requested scope passes the checkpoint's theme acceptance gate. A child tool header saying `completed` or a preview URL is insufficient. When execution pauses with remaining work, retain `partial` or `awaiting_confirmation` in the checkpoint and project the task to the existing `pending` board status with that remaining work in its description. Do not archive a recoverable task or mark it complete just to stop its spinner.

---

## 🚦 Execution routing — this plugin uses sub-agents for all covered writes

This skill plans and briefs; it never executes writes itself.

| Want to | Route |
|---|---|
| Write Product data (create / update / delete / publish-toggle, single or batch) | Main Agent spawns `shopify-product-editor` with a Product envelope. |
| Write Collection data, rules, publication, or Product membership | Main Agent spawns the same `shopify-product-editor` with the canonical nested Collection envelope; a coupled Product + Collection request uses one combined, domain-separated brief. |
| Deliver a theme layout/content/style/asset outcome on a **dev** theme | Main Agent spawns `shopify-theme-decorator` with the business/design intent → dispatches the scoped store audit → coordinates fixes and acceptance; publication follows only when requested and authorized. |
| Read-only SEO/GEO/CRO audit of one Product, Collection, Page or Article URL | Main Agent spawns `shopify-page-auditor` for the requested dimensions. |
| Read-only store/theme correctness or decoration review, from one affected page to a requested whole-store audit | Main Agent spawns `shopify-store-auditor` within the original task scope. |
| Create/publish/schedule one new Shopify Blog Article | Main Agent Route C loads `shopify-execution`, then obtains the user's explicit `draft`, `published`, or `scheduled` choice, saves a safe UTF-8 input file, then runs the store-aware dry-run. It must show the returned target Blog plus full exact body, summary, metadata, image and publication effect—an outline or synopsis is insufficient. It executes the bundled `shopify-use-shopify-cli/scripts/publish_article.mjs` single-Article publisher only after confirmation and only with that preview's matching confirmation token. A draft-to-published transition requires a new preview and confirmation. Immediate publication is complete only when the publisher returns both the verified Admin object and an anonymous storefront receipt; otherwise report `PARTIAL`. Independent SEO settings remain merchant-manual. |
| Update unrelated existing Article content or create/update Shopify Page/Blog containers | Main Agent Route C loads `shopify-execution` and `shopify-admin`, validates the current operation, obtains an exact confirmation, executes through `shopify-use-shopify-cli`, and verifies the object plus public page. |

**Route C (no sub-agent yet — known architecture gap)**: Page/Blog/Article content, standalone Metafield/Metaobject, and discount writes are not owned by a sub-agent in this release. Main Agent loads the applicable skills and selects/validates the current technical mechanism under `shopify-execution`'s exact-preview/confirmation and completion contract plus the selected domain's destructive-backup gate. New-Article creation/publication uses the prevalidated single-Article publisher and does not rediscover GraphQL; other Route C surfaces retain dynamic validation. This skill hands Main Agent only business intent, affected entities/data, confirmation evidence, backup path when applicable, and success criteria—never an API payload. Do not route independent Page/Article SEO settings through Theme; keep them merchant-manual until a validated owner exists.

Inside the shared `shopify-product-editor`, `shopify-product-management` selects Product mechanisms and `shopify-collection-management` independently selects Collection mechanisms. Combined work follows declared business dependencies: only a Collection item that consumes Product results is ordered after its named Product items; independent cross-domain work has no fixed Product-first order. Theme and other executors select their own Skill-backed chain. Those technical choices are executor concerns, not this Skill's.

---

## 🚨 Hard Rules (read first, violations cause skill failure)

**Load the selected domain contract, not a second builder copy**: Product/Collection confirmation belongs to `shopify-product-collection-write-brief`, destructive backup to the selected domain Skill, theme handoff/images to `shopify-theme-craft`, and preview/publication verification to `shopify-storefront-validate`. Use `aw-shopify-oauth` for connection and `shopify-execution` before official helper/CLI calls or Route C writes.

**Builder-specific rules**:

1. **No writes or API design from this skill** — all writes go through the routes in the Execution routing callout above. This skill plans, briefs, and orchestrates; it never executes a covered write, chooses/names the mutation or endpoint for a sub-agent, maps business values into API field paths, supplies an API payload, or prescribes a primary/fallback execution sequence. It sends business intent + data + constraints + confirmation evidence + success criteria, and the owning executor chooses the skill-backed mechanism.
2. **Cache confirmed identities, not API design**: retain user-confirmed location/channel names and verified GIDs for the same task. Follow the loaded domain contract for read-only discovery needed to prepare an accurate business preview, including actual Publication choices before creation. Do not prescribe where an executor places those identities in its write payload.
3. **Quiet output**: no raw GraphQL/JSON dumps. Summarize results in 1-2 sentences. Use minimal-field queries when previewing.
4. **Confirm before critical merchant-owned operations**: present options for store name, theme, and pricing. Ask before browser hand-off (payment / KYC).
5. **Internal quality scores stay internal**: never reveal scores, dimension names, or the checklist itself. A low score must NOT block flow. See §3.2 for tip limits.
6. **Live pricing — never from memory**: Shopify plan prices, trial terms, transaction-fee rates MUST be fetched live per [`references/pricing-data-rule.md`](references/pricing-data-rule.md).
7. **Shop name / domain are admin-UI-only** — store handle, `*.myshopify.com` subdomain, and primary domain CANNOT be changed programmatically. If the user asks to rename the store or change domain, hand them the Shopify Admin path and stop; do NOT spawn a sub-agent or invent a workaround.
8. **Separate conversation and storefront languages** — the user's language controls interaction/reporting only. Before confirming shopper-visible text, use verified store locale/market configuration when available and clarify only unresolved source content, target language, market, or publication intent. Do not add this question to non-text changes.

---

## 1. When to use — and when NOT to

### ✅ Use this skill for:
- **Registration & onboarding**: pick store name, choose plan (Basic / Shopify / Advanced), choose theme (Horizon / paid), configure primary industry/category
- **Migrating from another platform** (WooCommerce / BigCommerce / Wix / Squarespace / Magento): follow Shopify's official migration guide at [help.shopify.com/manual/migrating-to-shopify](https://help.shopify.com/manual/migrating-to-shopify); after the import job finishes, return here for the optional pre-launch checklist + launch coordination
- **Pre-launch checklist (advisory reminders only)**: name what the merchant may want to check before going public — payment provider, shipping rates/zones, tax obligations, legal policy pages, domain binding. This skill only points at these items; it never configures, generates legal text, or advises on specific tax/registration matters. All of them are merchant-owned settings done in Shopify Admin (see §4.3). Treat as optional, not a blocking gate.
- **Information architecture**: main navigation, footer organization, customer account flow
- **Multi-currency / Markets setup**: enabling Shopify Markets, per-region pricing, currency rounding, market-specific languages
- **Launch coordination**: end-to-end checklist, pre-launch QA, deciding the order of tasks across other skills

### 🚫 Do NOT use this skill for (route instead):

| Task | Route |
|---|---|
| Product creation / variant updates / media upload / publish-toggle (single or batch) | Shared `shopify-product-editor` sub-agent using `shopify-product-management`. |
| Collection search/read or any Collection write, including membership after Product creation | Load `shopify-collection-management`; writes go to the same Product/Collection executor, `shopify-product-editor`. |
| Theme layout/content/style/assets, including hero, announcement bar, and navigation presentation | `shopify-theme-decorator` sub-agent → Stage-3 dev-preview gate → main Agent coordinates the approved go-live action |
| Whole-store launch-readiness audit | `shopify-store-auditor` sub-agent |
| Single-page SEO / GEO / CRO audit | `shopify-page-auditor` sub-agent |
| Metafields / Metaobjects standalone CREATE / UPDATE / DELETE | **Route C (main Agent direct)** via `shopify-custom-data` (design), then `shopify-execution` → `shopify-admin` → `shopify-use-shopify-cli`; apply that execution contract and the selected domain's destructive-backup gate. |
| Discount codes / pricing rules / cart logic via Shopify Functions | **Route C (main Agent direct)** via `shopify-functions` (design), then `shopify-execution` → `shopify-admin` → `shopify-use-shopify-cli`; apply its confirmed-write contract and retain a backup before deleting an active discount. |
| Customer / order data writes | Out of scope. Refuse and ask the user to confirm intent first. |
| SEO meta / JSON-LD copy drafting | `shopify-marketing` SEO track drafts, then routes by affected surface: Product core meta/copy → `shopify-product-editor`; Collection core meta/copy → `shopify-product-editor` with a Collection envelope; theme/snippet → `shopify-theme-decorator`; every Metafield/Metaobject definition or value → `shopify-custom-data` first, then Main Agent Route C. |
| Cross-API doc lookup / API reference | `shopify-dev` |

**Hard rule**: when a write is covered by a sub-agent (product / Collection / theme files), doing it inline bypasses the owner's per-item verification and structured-report contract. Always delegate authoring and owned verification. Main may synchronize only the decorator-prepared directory to the confirmed unpublished target through [Theme Craft §4](../shopify-theme-craft/references/dev-preview-craft.md#4-local-development-preview-and-full-tree-workflows); it owns that process, not theme-file editing. Approved theme publication remains Main-Agent-owned. For remaining Route C rows, the Main Agent loads `shopify-execution` and the applicable domain backup contract.

---

## 2. Authentication & Connector Chain

Authentication is managed through the **Accio Work Shopify Connector** (managed OAuth).

- **Existing store connection**: delegate connection onboarding to [`aw-shopify-oauth/SKILL.md`](../aw-shopify-oauth/SKILL.md).
- **Mandatory check**: do NOT attempt any API operation until the store status shows as "Connected".
- **Full Auth rules**: see [`aw-shopify-oauth/SKILL.md`](../aw-shopify-oauth/SKILL.md).

If you find yourself reaching for `get_shopify_access_token` or raw `curl` — STOP and delegate. Direct API access from this skill is prohibited.

---

## 3. Quality & Policy Details

Implementation notes for Hard Rules 5-7:

### 3.1 Policy References
| Policy | Source-of-truth file |
|---|---|
| **Image discipline** | [`references/image-discipline.md`](references/image-discipline.md) |
| **Pricing & compliance** | [`references/pricing-data-rule.md`](references/pricing-data-rule.md) |
| **Safety & Confirmation** | [`references/safety-rules.md`](references/safety-rules.md) |
| **Field mapping** | [`references/csv-field-mapping.md`](references/csv-field-mapping.md) |

### 3.2 Quality scores (Internal transparency)
The agent runs an internal store health checklist ([`references/quality-checklist.md`](references/quality-checklist.md)) but stays fully transparent to the user:
- ❌ **Never reveal scores / dimension names / the checklist itself.**
- ❌ **A low score must not block any user flow** ("score too low to publish" is wrong).
- ✅ Each reply may contain **at most one** drive-by improvement tip ("By the way — this product only has 1 image; adding a few more angles would improve conversion").
- ✅ At session end, give at most 1 sentence of overall impression — no breakdown.

---

## 4. Setup workflow

### 4.1 Register a new store
1. Offer 3 store-name candidates with their meanings + .com domain availability → user picks. Note: the chosen name becomes both the store handle (`*.myshopify.com` subdomain) AND the registered store name; **once Shopify creates the store, neither can be changed programmatically** — only via Shopify Admin UI (and the subdomain swap effectively requires creating a new store). Confirm with the user before they commit at shopify.com.
2. Direct the user to [shopify.com](https://www.shopify.com) to register.
3. Plan: **Basic** is enough to start; suggest **Shopify** plan only when targeting GMV ≥ \$5000/mo. ⚠️ **Do not quote any plan price from this line** — actual fees, trials, transaction rates MUST be fetched live per [`references/pricing-data-rule.md`](references/pricing-data-rule.md).
4. Industry: pick the user's actual category — don't guess.

### 4.2 Theme strategy
- **Main-Agent responsibility**: confirm the merchant-facing direction — category, aesthetic, priority surfaces, content hierarchy, approved copy/assets, inspiration URLs, and what “looks right” means. Do not choose the technical base, style pack, section recipe, implementation mode, files/settings, or deployment mechanism.
- **Executor responsibility**: `shopify-theme-decorator` reads the theme-craft references, inspects the actual store/theme, performs source intake, and selects a safe implementation that satisfies the confirmed direction.
- **External GitHub/open-source themes**: pass the user-provided URL and intended use as business context only. Do not pre-classify it or instruct the executor how to install/adapt it.
- Paid themes (Impulse / Prestige / Motion) → quote the one-time \$280-\$400 fee and wait for approval.
- Avoid actively recommending niche third-party marketplace themes (too many pitfalls).

### 4.3 Pre-launch checklist (recommendations only — NOT executed by this skill)

These are **reminders the merchant configures themselves in Shopify Admin** — this skill never executes, configures, generates, or files any of them. It only points at what to look at. Treat the whole list as optional advisory: surface it as a "things you may want to check before going public" note, never as a mandatory gate that blocks launch. Payment, shipping, tax, legal, and domain are merchant-owned, legally sensitive, often irreversible store-level settings; the AI's role is limited to naming the item and pointing to where the merchant handles it.

| Item | What this skill may mention | Where the merchant does it |
|---|---|---|
| Payment | That a payment provider needs to be enabled before checkout works; may name common providers as examples | Merchant selects provider, completes payout/KYC, confirms fees in Shopify Admin |
| Shipping | That shipping zones/rates need to exist for the markets being sold to | Merchant creates rates/zones in Shopify Admin |
| Tax | That tax obligations may apply in target markets and a tax professional should be consulted — **do not advise on specific tax registration, withholding, or filing** | Merchant confirms registrations and configures tax settings; consults a professional |
| Policies | That policy pages (Refund / Privacy / Terms / Shipping) are typically expected — **do not draft or generate legal text; recommend the merchant use Shopify's policy generator or a lawyer** | Merchant writes/reviews/publishes their own legal text, obtains legal advice |
| Domain | That the store can launch on `.myshopify.com` or a custom domain | Merchant binds the domain in Shopify Admin / their registrar |

### 4.4 SEO at listing time

Only when the merchant explicitly requests Product copy optimization or an SEO-prepared launch, read [`../shopify-marketing/references/product-content.md`](../shopify-marketing/references/product-content.md). Also read [`../shopify-marketing/references/seo-lifecycle.md`](../shopify-marketing/references/seo-lifecycle.md) when lifecycle preparation or post-publication SEO validation is part of that request. Use verified Product facts and actual media metadata only. An `SEOBrief` is strategy context for explicit SEO work, not an Admin payload or a prerequisite for ordinary Product writes.

Show every Product and Collection value being written in the existing merchant-facing preview. For explicit content/SEO work, include the exact Product title, rich description, SEO title, SEO description, handle, matching image alt text, and applicable quality warnings. For a launch, separately show `ACTIVE` status and every Publication target. After confirmation, map only those approved values into the canonical Product/Collection business brief. Exact field formats, API mapping, and mechanism choice remain downstream executor concerns.

After the editor returns, do not treat Product creation as SEO completion. When SEO validation was explicitly requested, trigger one SEO-only `shopify-page-auditor` request per launched Product only after Product result `ok: true`, status `ACTIVE`, every confirmed Publication target succeeded, `onlineStoreUrl` is non-null, and one anonymous reachability probe succeeded. Pass `resource_type: product`, `audit_dimensions: ['seo']`, the verified Product GID/URL, primary keyword, market/locale, and `trigger: post_publication`. Do not invent a URL from the handle. Any remediation needs a new exact preview and confirmation.

SEO fields remain optional for every Product write unless the merchant explicitly includes them. Missing SEO does not block creation or publication. If SEO is explicitly deferred, report that choice instead of manufacturing copy.

### 4.5 Multi-currency / Markets
Default: storefront uses the seller's home currency.

If selling cross-border, plan **Shopify Markets** — Shopify can auto-detect visitor country and display local currency when configured:
- Settings → Markets → Add market (per country/region)
- Pricing → enable "Adjust prices automatically" or set per-market overrides
- Reference: [shopify.com/markets](https://www.shopify.com/markets)

**Common combos**:
- US merchant selling US + CA → primary USD, CA market with auto CAD + 0-3% rounding
- CA merchant selling CA + US → primary CAD, US market with auto USD
- EU merchant selling EU + UK → primary EUR, UK market with GBP

**Caveat**: changing the *default* currency after orders/payouts have started is irreversible. Treat currency, payment, tax, market, and domain changes as merchant-owned store-level settings unless an explicitly authorized execution flow exists.

---

## 5. Information architecture (owned by this skill)

### 5.1 Homepage block plan (the *plan*; push delegated)

| Shopper-visible block | Content intent | Desired shopper experience |
|---|---|---|
| Hero | Hero product + CTA “Shop Now” | Clear first-screen value proposition and primary shopping action |
| Featured products 1 | Hero SKUs | Easy scanning of priority products |
| Trust/USP row | Free shipping / 30-day returns / Secure checkout | Compact trust cues before deeper browsing |
| Featured products 2 | Recommended / new arrivals | Secondary discovery path |
| Footer | Contact info + Newsletter + legal-page links | Clear support, trust, and subscription access |

### 5.2 Navigation IA
- **Main nav** (≤ 5 items): Home / Shop / Best Sellers / About / Contact
- **Footer** (3 columns): Customer Care / Quick Links / Connect

### 5.3 Brand aesthetic → palette options
Read brand/aesthetic notes from the product brief, user input, or upstream selection output → offer 2-3 palettes. **Never default to plain black & white.**
**Fallback** — if no brand direction exists: ask inline "Pick one: minimalist neutral / creamy forestcore / bold modernist / vintage film / Japandi / industrial / coastal", then proceed. Do NOT guess. The chosen palette is handed to downstream authoring/execution skills.

### 5.4 Theme business direction

Before the Stage 3 preview or spawn, load `shopify-theme-craft` and
`references/theme-handoff.md`. Resolve the merchant's category, aesthetic,
priority surfaces, exact copy/assets and visual success criteria under that
contract. The decorator chooses the theme files, settings, recipes, and
execution mechanism. This workflow does not redefine the brief.

---

## 6. Delegation & collaboration

This skill is the **orchestrator** — it turns a product/store brief into a launch plan and hands fully-resolved **business-intent briefs** to sub-agents (or, for remaining Route C work, to main Agent). “Fully resolved” means the desired outcome, data/assets, constraints, confirmation evidence, and success criteria are complete; it never means an API payload or implementation prescription. All collaboration is single-table here; no other section duplicates this.

| Direction | Counterpart | Data flow |
|---|---|---|
| Upstream | Product / brand brief from user, `dtc-product-selection`, or another host skill | SKU list, supplier URLs, target customer, brand/aesthetic notes, pricing/unit economics if available |
| Downstream (writes — product) | `shopify-product-editor` sub-agent (main Agent spawns) | The canonical Product envelope from `shopify-product-collection-write-brief`, plus the merchant-facing data required by the operation, optional report language/additional verification, constraints, and publication targets when publishing. For shopper-visible text, include separately confirmed source content language and any requested target language/market/publish outcome; these are business facts, not API fields. Inventory location is optional: the executor may use the only active location and returns choices without writing when several exist. Keep one product's data together, but do not name a mutation, specify GraphQL nesting/field positions, tell the executor which reference/script to use, or dictate API-call count/order. Supplier/source metadata remains optional and non-gating. Delete intents include the backup path. The sub-agent builds the route, executes, verifies, and reports. |
| Downstream (writes — Collection) | Shared `shopify-product-editor` sub-agent (main Agent spawns once for a combined Product/Collection request) | The canonical separate Collection envelope with exact target or confirmed creation identity, manual/smart business rules, publication outcome, confirmation evidence, backup path for delete, and observable success criteria. For dependent membership, declare the named upstream Product items and put independently confirmed existing Product GIDs in this Collection item's `desired.products`; the shared Brief checkpoint merges eligible targets after upstream completion and excludes failed upstream targets. Never prescribe a tool, mutation, payload, or call sequence. |
| Downstream (writes — theme) | `shopify-theme-decorator` | Use the existing business brief and confirmed scope from `shopify-theme-craft/references/theme-handoff.md`. It owns input, language and image boundaries; the decorator returns its implementation evidence for `shopify-storefront-validate`. |
| Downstream (writes — Route C: Metafield / discount) | Main Agent direct with the applicable skills loaded | Business intent, affected entity ids when they exist, merchant-facing data/desired values, confirmation evidence, backup path for destructive deletes, and observable success criteria. This orchestrator does not supply a mutation, API field mapping, or payload; Main Agent derives those from the execution skills because no owning sub-agent exists. |
| Downstream (audits) | `shopify-store-auditor` / `shopify-page-auditor` sub-agents | Read-only business verification scope plus affected entities and expected observable outcomes. For post-Stage-2 acceptance, compare each requested Product/Collection with its intended values and draft/publication state; public visibility is required only when requested. Only when the merchant explicitly requested SEO launch validation or a post-publication SEO check, send each verified public Product URL to the page auditor with SEO only and the requested keyword/market context; do not prescribe the fetch mechanism. |
| Downstream implementation skills | Selected by the owning executor | The orchestrator does not tell a sub-agent which supporting API/design skill, mutation, endpoint, or field mapping to use. The executor discovers and applies the relevant skills itself. |
| Post-launch | `dtc-monitoring-and-daily-report` | Store URL + launch summary → traffic / conversion / Clarity tracking |

**Collaboration rules**:
- When an upstream detail is missing, **find or ask first — never silently fabricate**.
- When a step requires a covered write, hand main Agent a business-intent brief and let it spawn the right sub-agent. Never inline-execute the write or smuggle API advice into the brief. Remaining Route C work stays direct only because no owning sub-agent exists yet.
- After a sub-agent / Route C execution returns, resume orchestration and update the launch progress bar:
  ```
  Progress: ✅ Register → ✅ Configure → 🔄 Listing (1/4) → ⏳ Decorate → ⏳ Open
  Progress: ✅ Register → ✅ Configure → ✅ Listing → ✅ Decorate → 🎉 Ready to open
  ```

### Build checkpoint and action log

Use [`scripts/build_checkpoint.py`](scripts/build_checkpoint.py) and the [checkpoint contract](references/build-checkpoint.md) to record this build's stage receipts, exact resource IDs, and remaining work. The helper links each checkpoint revision to the existing `project/.workspace/_shopify-actions-log.csv` columns (`timestamp, milestone, status, notes`). Retain existing log rows. Per-API-call evidence remains owned by the executors; the checkpoint stores local receipt references and hashes, not OAuth material or API payloads.

---

## 7. Deliverables

After a build session, give the user a short summary: store URL, theme, number of SKUs live, configured items, next steps, storefront preview link. Don't mechanically generate a `.md` report unless the user explicitly asks.

**Optional artifact templates** (use only when the user wants a written record):
- [`templates/launch-deliverable-template.md`](templates/launch-deliverable-template.md) — full launch summary
- [`templates/decisions-template.md`](templates/decisions-template.md) — decision log

> **Implementation boundary**: this skill never authors API snippets/payloads or theme implementation files for a delegated write. Product and Collection writes share `shopify-product-editor` while keeping separate domain Skills and envelopes; theme-file writes go to `shopify-theme-decorator`. The store auditor performs scoped acceptance checks; Main manages the bounded local-preview synchronization process, coordinates corrections and final status, and executes authorized theme publication after the required audit. Metafield and discount writes remain Route C until they gain owners. `aw-shopify-oauth` stays limited to the Accio Work → Shopify Connector OAuth flow.
