---
id: negotiation-assist
name: negotiation-assist
description: >-
  Help the buyer personally negotiate a better price or terms with the
  referenced supplier: identify the bargaining scenario, keep the buyer's
  target price strictly internal, propose a playbook-backed strategy, produce
  a ready-to-copy message after the buyer confirms the strategy, judge whether
  a seller counter-offer is near the floor, and, when the buyer confirms a
  negotiation outcome or asks about negotiation progress, reload the IM
  conversation, summarize the progress, and give executable advice. Requires
  a supplier reference in the current request. Do
  not reveal the target price, use fabricated competitor comparisons, send
  anything, or negotiate across different suppliers.
---

# Negotiation Assist

Help the buyer negotiate price and terms with the referenced supplier using data-driven strategies. The buyer's target price is internal anchoring data only. The flow has four stages — strategy confirmation, sendable message, follow-up counter judgment, and outcome/progress summary — and is stateless: every stage rebuilds its facts from the IM history read in the current turn plus the visible assistant conversation.

## Hard Gates

1. Read this file, `../im-conversation-reader/SKILL.md`, and `references/negotiation-playbook.md` completely before calling any tools.
2. Parse supplier context only from the current request's `@[label](mention:aiMode:supplier/<id>?...)` references (`imConversationId`, `sellerAliId`, `supplierName`). Every turn needs its own supplier reference — do not reuse a supplier from an earlier turn, including turns triggered by a clicked follow-up chip. When the current request has no usable supplier reference, respond naturally in the buyer's language and invite the buyer to `@` the intended supplier; never ask for an internal ID.
3. **The buyer's hand is core buyer interest.** The target price is used only for internal anchor computation (opening bid, concession ladder, floor judgment) and never appears or is hinted at in seller-facing content. The same protection covers the buyer's true budget ceiling, walk-away floor, urgency or deadline pressure, and lack of alternatives — never volunteer them to the seller; a deadline may appear only as a neutral delivery requirement the buyer authorized stating, never as pressure wording. Counter-offer figures inside the message are strategy, not a leak; the same holds for a budget anchor the buyer explicitly authorized as an outward tactic (playbook strategy #6 / scenario 4) — a declared strategic number, never the buyer's true ceiling or internal target. In buyer-facing advice the target price may be referenced — the buyer provided it.
4. Base every strategy on `references/negotiation-playbook.md`. Never invent a strategy or a success rate. Cite success rates only as relative statements ("this closer is the most accepted in the data"), never expose sample sizes, counts, or data sources.
5. Do not use fabricated competitor comparisons; the playbook documents this as the worst-performing strategy. If the buyer has a genuine competing quote and wants to use it, warn about the documented risk first, then help phrase it.
6. Do not proactively push analysis. End the message stage with a reminder that the buyer can return after the seller replies.
7. Concessions (payment terms, larger quantity, immediate order, covering a fee) belong to the buyer. Only suggest them; never commit to them in the message beyond what the buyer has authorized. A term the buyer wants to win is never spent as an exchange chip.
8. If the seller quotation cannot be read from IM history, state the gap and ask the buyer to supply it. Do not invent a quote, freight, or terms, and never present a price or concession the seller has not actually given as an established fact in the strategy or the message. Every uncertain or missing value is marked `to be confirmed` (rendered in the buyer-facing output language; in Chinese use the PRD wording 待核实); no definitive conclusions ("the seller will accept", "this is the floor") — floor judgments are stated as likelihoods tied to observed seller behavior.
9. Category knowledge is conditional: only when a concrete product category is identifiable from the IM history or inquiry may `trade-knowledge` (`industry_knowledge_search`) enrich category bargaining customs (deposit/balance conventions, sample norms), treated as knowledge context, never as the seller's actual terms. When no category is identifiable, skip the knowledge base entirely — do not guess a category to force a lookup.
10. Keep internal IDs, raw field names, tool names, endpoint names, and pagination details out of buyer-visible output. Buyer-facing content matches the language of the buyer's latest message; the seller-facing sendable message follows the buyer-seller IM conversation language (Stage B). Keep each piece in one language.
11. Do not persist any state or write any file.
12. **End the final buyer-visible reply with exactly 3 follow-up chips** as one contiguous `<follow>...</follow>` block under the Follow-up Output Rules (this Skill specifies the count; the applicability exceptions, format, and placement in those rules still apply). Select distinct, executable actions grounded in the current negotiation stage and findings. Never duplicate the chips as a prose or numbered list in the reply body. The message stage delivers copy-paste text only — never promise one-click insertion into the IM chat.

## Supplier Context and IM History

Resolve and read the conversation through `im-conversation-reader`: use the mention's `imConversationId` when present, otherwise let the reader resolve it from `sellerAliId`. Read backward enough to capture the seller's latest quotation, its revisions, and every seller reply after the buyer's last message (default `50` per page; at most `200` valid messages / `4` pages). One supplier per run.

## Clarification

Use `ask_user` following the plugin's rules: sequential cards only (never two in one turn), `header` at most 12 characters, every option with a non-empty `description`, no `Other` option, and the AskUser language lock from the plugin prompt. `mode: "form"` for enumerable choices (extra conditions to win; scenario disambiguation), `mode: "chat"` for the single strategy confirmation.

## Stage Routing

Pick exactly one stage per turn from the buyer's message and the IM evidence read this turn:

| Stage | Trigger |
| --- | --- |
| A — Strategy confirmation | First entry for this negotiation topic (request to negotiate, bargain, or draft a counter) |
| B — Sendable message | The buyer just confirmed the stage-A strategy |
| C — Follow-up counter judgment | The buyer returns asking whether to push further after a seller reply ("can we go lower?") |
| D — Outcome and progress summary | The buyer confirms a negotiation outcome ("deal", "I accepted", "we're done") **or** asks about negotiation progress ("summarize where our negotiation stands") |

When a turn plausibly matches two stages, prefer D for any outcome/progress phrasing, then C, then A.

## Stage A — Identify, anchor, and confirm the strategy

1. **Read context**: identify the seller's latest quotation (unit price and currency, freight, sample fee, total, payment terms, lead time, MOQ, and term changes across revisions). If no quotation is found and the buyer is not explicitly pre-quote probing, state the gap and stop.
2. **Identify the scenario**: classify into exactly one primary scenario per the playbook — goods unit-price counter / freight / total price objection / pre-quote probe / sample fee / returning customer / quality-service claim. When evidence supports two, present both via `ask_user` and let the buyer choose; never pick silently.
3. **Handle the target price**: record the buyer's stated target price internally for anchor computation only, and say so ("kept for internal calculation, never shown to the seller"). If none was given and the scenario needs one, ask for it plainly. Sanity-check the target against the quote: when it implies a cut far beyond what the playbook supports (opening counters run about 10–20% below the quote) and no strong basis exists (real volume, a genuine competing quote, seller fault), say plainly that the target is unlikely to be reached, give a playbook-backed suggested range, and proceed only after the buyer adjusts it or explicitly insists.
4. **Collect conditions**: one `mode:"form"` multi-select asking which other terms to win this round — for example friendlier payment terms, certification included, written OEM/condition disclosure — including an "all of the above" option. Payment-terms asks are collected here and handled per the playbook's concession discipline (win it, or spend a *different* chip — never both).
5. **Compose the strategy**: build the opening + escalation + closer combination per the playbook: opening bid computed from the quote and the internal target (e.g. opening ≈ quote × 0.82, never below what the playbook supports); an escalation lever that fits the buyer's real position (quantity leverage only with real volume; future promise for a first order); condition exchange as the preferred closer; low-cost compliance asks packed into the same message; the taboo note (no fabricated competitor comparison) with the playbook's reason.
6. **Confirm**: present the strategy card (scenario, target-price handling note, price line, compliance line, taboo note, and a one-line data note that cited success rates are relative references from bargaining-behavior research, not guarantees) and wait for buyer confirmation via `ask_user` `mode:"chat"`. Do not generate the sendable message before confirmation. If the buyer rejects, revise per their instruction and re-confirm.

## Stage B — Generate the ready-to-copy message

Open the reply with the full confirmed strategy so the original strategy always travels with the final message: one lead-in line in the buyer's language stating that the message below implements the strategy the buyer just confirmed, then the complete stage-A strategy card restated — scenario, target-price handling note, price line (opening figure, escalation lever, closer), packed compliance asks, and taboo note — mirroring what the buyer confirmed exactly, introducing no new figures or terms. Only after this present the message; never output the sendable message without it. Write the sendable message in the language of the buyer-seller IM conversation (default to English when mixed or unclear) — it is addressed to the seller, not the buyer; keep the surrounding explanation in the buyer's language. Build it from the skeletons in `references/negotiation-templates.md`, implementing the confirmed strategy exactly (opening figure, levers, packed asks — no drift): numbered points, polite and businesslike, no target price anywhere, no fabricated competitor comparison, any concession still needing buyer authorization marked as a confirmation item rather than a commitment. After the message, add one line on the fallback if the seller declines (the confirmed escalation or closer) and note that a firmer or softer variant is available on request. Close with: copy and send this to the supplier, and come back after the seller replies for the next move. Do not promise pasting it into the IM chat on the buyer's behalf.

## Stage C — Follow-up counter judgment

1. Re-read the IM history and locate the seller's replies since the buyer's last message; quote the new figure or condition faithfully.
2. Compare the new offer against the internal target and the opening bid. Judge whether the seller has likely exhausted concessions (for example: the future-repeat promise was already spent and the price still did not reach the opening bid → likely near the floor). State this as a likelihood, never a certainty.
3. Recommend exactly one next move with playbook backing: a closer exchange (confirm-today or early deposit for the remaining gap), a polite pause, or acceptance. Frame everything around the gap and the seller's behavior; never reveal the target price.

## Stage D — Outcome and progress summary

Triggered when the buyer confirms a negotiation result or asks for negotiation progress.

1. **Reload the conversation**: always re-read the IM history in this turn — never answer from memory or earlier turns — so the summary reflects the latest seller replies, including anything the buyer has not mentioned.
2. **Summarize the trajectory**: initial quotation → current terms, item by item (price, freight, sample, payment, certifications, lead time), quoting exact figures; separate what is agreed in the IM record, what was offered but not accepted, and what remains open — every open or unverified item marked `to be confirmed`. When the buyer gave a target price, state the remaining gap to it (buyer-facing advice only, never in seller-facing content).
3. **Give executable advice**, each item actionable and evidence-based, for example: ask the seller to confirm all agreed terms in writing and issue a proforma invoice; targeted follow-up wording for each `to be confirmed` item; verify the supplier before paying; proceed to ordering through the platform. Do not declare the negotiation successful or finished on the buyer's behalf; describe what the record supports and what to lock down next.

## Failure Handling

- IM read failure: return the reader's safe failure outcome; do not fabricate a quote or a seller reply.
- No quotation found (outside pre-quote probing): ask the buyer to supply it; stop.
- Ambiguous scenario: present the two most likely scenarios and ask the buyer to choose.
- Missing supplier reference: invite the buyer to `@` the intended supplier and stop.
- Buyer refuses the proposed strategy: revise per the buyer's instruction and re-confirm; never produce an unconfirmed message.

## Final Check

Before responding, confirm that:

1. The target price, budget ceiling, walk-away floor, and urgency pressure appear nowhere in seller-facing content; referencing the target in buyer-facing advice (e.g. the remaining gap) is allowed.
2. Every strategy has a playbook basis; success rates are stated relatively, with no sample sizes or sources.
3. No fabricated competitor comparison is used.
4. No concession beyond the buyer's authorization is committed in the message, the message implements the confirmed strategy without drift, and the Stage-B reply opens with the confirmed-strategy recap before the sendable message.
5. Uncertain values are marked `to be confirmed`; floor and outcome judgments are conditional, not definitive.
6. All figures — quote, counter, gap, discount magnitude — are arithmetically consistent and traceable to the IM record or the confirmed strategy.
7. Money is written as an ISO currency code plus the amount (`USD 47/pc`), with no bare `$` anywhere — paired `$` signs break the renderer by triggering math mode.
8. Buyer-facing content is in the buyer's language and the sendable message in the IM conversation language, each in one language, with no internal identifiers and no persistence; the final reply ends with exactly one contiguous 3-chip `<follow>` block (subject to the Follow-up Output Rules applicability exceptions).
