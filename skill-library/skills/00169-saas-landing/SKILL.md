---
name: saas-landing
description: |
  Single-page SaaS landing with hero, features, social proof, pricing, and CTA.
  Respects the active DESIGN.md color/typography/layout tokens.
  Trigger keywords: "saas landing", "marketing page", "product landing".
triggers:
  - "saas landing"
  - "marketing page"
  - "product landing"
od:
  mode: prototype
  platform: desktop
  scenario: marketing
  preview:
    type: html
    entry: index.html
    reload: debounce-100
  design_system:
    requires: true
    sections: [color, typography, layout, components]
  craft:
    requires: [typography, color, anti-ai-slop]
  inputs:
    - name: product_name
      type: string
      required: true
    - name: tagline
      type: string
      required: true
    - name: has_pricing
      type: boolean
      default: true
    - name: proof_count
      type: integer
      default: 3
      min: 0
      max: 6
  parameters:
    - name: hero_density
      type: spacing
      default: 96
      range: [48, 200]
    - name: accent_strength
      type: opacity
      default: 1.0
      range: [0.5, 1.0]
  outputs:
    primary: index.html
  capabilities_required:
    - file_write
---

# SaaS Landing Skill

Produce a single-page SaaS landing. Agent, follow this workflow exactly.

## 1. Read context

Before writing anything:
- Read `DESIGN.md` in the current working directory. If missing, stop and ask for one.
- Identify the color palette, typography tokens, and layout principles.
- Note the "Agent Prompt Guide" section — it overrides any instruction here if they conflict.
- If Design Intelligence context is present, use its landing pattern, CTA placement,
  conversion guidance, UX checks, and anti-patterns to choose section order and
  emphasis.
- If Style Reference recommendations are present, use them as inspiration only;
  do not treat a recommended reference as an approved design system.

## 2. Plan sections

Required sections, in order:
1. **Hero** — logo-or-wordmark, headline (tagline input), subhead (1–2 sentences), primary CTA, secondary CTA. Use the hero_density parameter as vertical padding in px.
2. **Features** — 3–6 feature tiles. Each: icon, short title, 1–2 sentence body.
3. **Product proof / demo** — show a concrete product surface, workflow preview,
   integration list, or outcome sequence. Do not use abstract decorative cards
   when a product signal is available.
4. **Social proof** — `proof_count` logos or testimonials. If 0, skip this section.
5. **Pricing** — 2–3 tiers. Include only if `has_pricing` is true.
6. **Footer CTA** — large accent-colored band with one-button call to action.
7. **Footer** — minimal: links + copyright.

Section choice rules:
- If Design Intelligence recommends "Interactive Product Demo", make the demo
  the second section after the hero.
- If it recommends "Social Proof-Focused", place proof before pricing.
- If it recommends "Minimal & Direct", remove secondary decoration and keep a
  single conversion path.

## 3. Apply design system

- All colors must come from DESIGN.md tokens. Do not invent hex values.
- Typography: use the declared display font for headlines, body font for everything else.
- Layout: respect the grid, max-width, and section spacing rules.
- Components: use declared button/card/input patterns. Do not add shadows if DESIGN.md's Depth & Elevation says minimal.
- Accent: use the accent color only once in the hero, once in the footer CTA, and for all links. Do not flood the page.

## 4. Write the file

Output a single self-contained `index.html` with:
- All CSS inlined in a `<style>` block in `<head>`.
- `<!doctype html>` and `<meta name="viewport" content="width=device-width, initial-scale=1" />`.
- System font fallbacks if DESIGN.md fonts aren't loadable from Google Fonts etc.
- No external JS.
- Semantic HTML (`<header>`, `<main>`, `<section>`, `<footer>`).
- Each major section tagged with both `data-component="Human Name"` and
  `data-od-id="<unique-slug>"` so Canvas and comment mode can target it.
- Buttons and links must have real labels and valid destinations or actions.
- Forms must use visible `<label>` or explicit `aria-label` / `aria-labelledby`.

## 5. Self-check

Before finishing, verify:
- [ ] All text is content-meaningful, not lorem ipsum (use product_name and tagline inputs; generate plausible specific copy for the rest).
- [ ] No broken color references (every CSS color value is in DESIGN.md's palette or a valid alpha/fallback variant).
- [ ] Responsive breakpoints match DESIGN.md's Responsive Behavior section.
- [ ] The page looks good at 1440w, 768w, and 375w (mentally simulate).
- [ ] Accent used no more than twice total.
- [ ] Hero headline names the product/category or literal offer; supporting copy carries the value prop.
- [ ] Primary CTA appears in the hero and near the final CTA; avoid more than one competing primary action per section.
- [ ] Social proof is specific enough to be believable, or omitted.
- [ ] No invented precision claims such as "10x faster" or "99.9%" unless supplied by the user.
- [ ] Text cannot overlap or truncate in buttons, cards, pricing rows, or mobile navigation.

## 6. Lint repair loop

After writing, run the Canvas lint tool or inspect the write result's
`repairInstructions`. Fix all P0 and P1 items before handoff, especially
viewport, placeholder copy, empty links, raw colors outside tokens, form labels,
and missing `data-component` coverage.

## 7. Done

Write only `index.html`. Do not generate a separate CSS file, JS file, or README.

---

## For skill authors reading this as a reference

This is a minimal but complete skill. Structure:

```
saas-landing-skill/
├── SKILL.md    ← you are here
└── assets/
    └── base.html    (optional starter template; this skill doesn't use one)
```

Things to notice:
- The `od:` front-matter block is optional for Claude-Code-only compatibility, but adding it lights up OD's typed inputs, sliders, preview metadata, and capability gating.
- The workflow below the front-matter is plain Markdown that the agent reads as its system prompt.
- DESIGN.md is treated as a collaborator, not an override. The skill gives the agent authority to override when the brief conflicts, but never to invent new tokens.
- `data-od-id` tagging is how we wire elements to comment mode. Skills that want comment-mode compatibility must annotate their output.

See [`../../skills-protocol.md`](../../skills-protocol.md) for the full protocol.
