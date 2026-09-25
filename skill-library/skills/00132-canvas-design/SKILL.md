---
name: canvas-design
description: Coordinate the non-replication Canvas branch. Provide the required information directly in the canvas-designer task, have it write the final DESIGN.md, then source images and implement the site in the current execution.
---

# Canvas Design

Use this skill when `referenceReplication=false` and a new or materially changed visual system is needed. Do not pass this skill or the image policy to the canvas-designer; reference replication remains a separate branch.

## Canvas Branch Workflow

1. In the task sent to `canvas-designer`, directly provide the user's requested pages, routes, section order, content and copy boundaries, interactions, states, responsive priorities, type-specific requirements, purpose, audience, language, style direction, and relevant research notes.
2. Resolve `pluginRoot` to the installed directory containing `plugin.json`. Load `skills/react-local-runtime/SKILL.md` and prepare the target project through its site-ID reservation and bundled-template flow, or use the existing project.
3. After project setup and any already-required feature additions that change dependencies, run `node scripts/site.js install --cwd <targetProject>` when installation is needed. Then call `accio-site-builder:canvas-designer` with those task details, `pluginRoot`, absolute `targetProject`, and `projectMode` (`fresh-scaffold` or `existing-design`). For an existing design, also pass the exact project-root `existingDesignPath`. Give the SubAgent ownership of only `<targetProject>/DESIGN.md`. Do not select or read its private design-library references. Do not include image sourcing instructions, image-generation budgets, generation prompts, or Image Manifest requirements. Do not paste the output contract or request a second long design response.
4. Read the returned `DESIGN.md` once and confirm that the expected uppercase file exists, is non-empty, and begins with parseable YAML frontmatter. The SubAgent owns detailed conformance validation. Request one focused correction only when the returned file has a concrete usability defect.
5. If the SubAgent is unavailable or does not produce a usable file, retry it once when possible, then report a blocker with the exact failure. Do not read the private design library or write a replacement design document outside the SubAgent.
6. After `DESIGN.md` is ready, read `skills/code-generator/references/image-asset-handling.md`, prepare the Image Manifest in `ASSETS.md`, and source the imagery. Then load and follow `skills/frontend-implementation-policy/SKILL.md` and `skills/code-generator/SKILL.md` directly in the current execution, using the user request, resolved implementation requirements, `DESIGN.md`, `ASSETS.md`, and existing CDN index. Do not create or delegate to an implementation SubAgent.

## Scope Separation

Google `DESIGN.md` is the visual source of truth. Its YAML frontmatter carries design tokens; its standard prose sections explain their visual use. The user request and resolved implementation requirements remain authoritative for routes, page and section structure, copy, behavior, data, and integrations. `ASSETS.md` remains the source of truth for images.

While following the code-generator Skill, read all three inputs directly:

- user request and resolved implementation requirements: what to build;
- `DESIGN.md`: how it should look;
- `ASSETS.md`: which media resources it may use.

Do not write lowercase `design.md`, `component.html`, or `tokens.css`. Do not copy the YAML tokens into another design artifact. Derive runtime CSS once from `DESIGN.md` while following the code-generator Skill.

## Bounded Designer Context

The canvas-designer has `read`, `write`, `list`, `glob`, and `grep`. Its statically attached private Skill owns design-protocol and template selection, and discovery tools are limited by its prompt to narrow searches inside that Skill's references. For a fresh scaffold it must not inspect `package.json`, `src/`, `index.html`, `SETUP.md`, `ASSETS.md`, configuration, or the scaffold placeholder. For an existing design it may read only the explicitly supplied `existingDesignPath`.

Reference provenance belongs in the SubAgent's completion receipt. Do not ask it to put source paths or implementation notes into `DESIGN.md`.

## Handoff

During code generation, read `DESIGN.md` and `ASSETS.md` by path and use the user request and resolved implementation requirements directly. Do not write a replacement design document outside the design SubAgent. Missing visual decisions are handled by a focused `DESIGN.md` correction; missing product decisions are resolved against the user request; missing imagery follows the image asset handling contract.

Keep `ASSETS.md`, assets, React code, runtime CSS, install/build, preview, browser verification, deployment, and provider operations outside the design SubAgent.
