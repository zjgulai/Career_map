---
name: follow-up
description: Offer relevant natural-language next steps after Accio Site Builder responses, prioritizing Supabase, scheduled refresh for external dynamic data, and SEO when applicable.
---

# Follow-up

After completing the user's request, offer 1–5 useful next steps when appropriate.

## Rules

- Use natural language that matches the user's language and tone. Do not use XML, JSON, directives, or another fixed output format.
- Do not repeat work that was already requested, completed, declined, or ignored.
- For a first frontend delivery, wait until the build and rendered preview have been verified before offering post-delivery work.
- Do not use optional follow-ups in place of required clarification, authorization, safety guidance, or blocker handling.
- Do not start optional work until the user clearly accepts it.
- If no follow-up would be useful, do not add one.
- Do not offer binding a user's own domain (CNAME/DNS) as a follow-up — that is not supported yet. Company-domain subdomains from site publish are fine to mention.

## Available Follow-ups

Prioritize these when applicable:

1. **Supabase database support** — Offer this when a site uses mock or local data but would benefit from persistent, user-owned data. This plugin supports only Supabase. Skip static or presentational sites, narrow edits, and cases where database or provider work is already in scope.
2. **Scheduled refresh for external dynamic data** — Offer this whenever visible website content depends on a changing external source, such as social data, articles or news, events, jobs, properties or other listings, menus, prices, opening hours, business status, feeds, APIs, or public profiles. Do not offer it when external material was used only for style, layout, information architecture, copy tone, assets, or a one-time static snapshot. It may be offered together with database support.
3. **SEO optimization** — Offer this for public sites that should be discoverable. Skip private tools, authenticated dashboards, sensitive workflows, local-only prototypes, and narrow changes unrelated to discoverability.

Other context-aware follow-ups may include:

- Applying, revising, or extending the completed work.
- Comparing options or explaining an implementation decision.
- Verifying, debugging, testing, or improving responsive behavior, accessibility, runtime behavior, or provider integration.
- Adding a related page, section, feature, content area, or integration.
- Previewing, publishing, or handing off the result.

Keep the total to 1–5 follow-ups, with applicable priority follow-ups listed before context-aware ones.
