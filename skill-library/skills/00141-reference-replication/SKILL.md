---
name: reference-replication
description: Coordinate reference-site visual replication after site-builder sets referenceReplication=true. Prepare the target project, have reference-site-replicator inspect the supplied site in a browser and write the final DESIGN.md, then continue through the shared asset and implementation workflow.
---

# Reference Replication

Use this skill only after `skills/site-builder/references/routing-and-intake.md` resolves `referenceReplication=true`. This branch and Canvas design are mutually exclusive. Both branches produce the same project-root `DESIGN.md`; only their visual grounding differs.

## Workflow

1. In the task sent to `reference-site-replicator`, directly provide the user's requested pages, routes, content and copy boundaries, interactions, states, responsive priorities, type-specific requirements, purpose, language, every requested deviation from the reference site, and relevant intake notes. Product requirements remain task inputs rather than becoming custom `DESIGN.md` sections.
2. Load `skills/react-local-runtime/SKILL.md` and prepare the target project through its site-ID reservation and bundled-template flow, or use the existing project.
3. After project setup and any already-required feature additions that change dependencies, run `node scripts/site.js install --cwd <targetProject>` when installation is needed. Then call `accio-site-builder:reference-site-replicator` with those task details, exact normalized user-provided `referenceUrls`, supplied screenshots, files, brand assets and notes, absolute `targetProject`, and `projectMode` (`fresh-scaffold` or `existing-design`). For an existing design, also pass the exact project-root `existingDesignPath` when it should be preserved or evolved. Its statically attached `canvas-design-library` Skill supplies the shared specification and output contract through its spec-only branch.
4. Give the SubAgent ownership of only `<targetProject>/DESIGN.md`. It must inspect the supplied reference site at representative desktop and mobile viewports, derive the visual system from rendered evidence, and write the final file using the bundled format specification and shared output contract. It must not consult the Canvas template library or return a separate replication manual.
5. Read the returned `DESIGN.md` once and confirm that the uppercase file exists, is non-empty, and begins with parseable YAML frontmatter. The SubAgent owns detailed conformance validation. Request one focused correction only when the file has a concrete usability defect.
6. If the SubAgent is unavailable, cannot access enough rendered evidence, or does not produce a usable file, retry once when the failure appears recoverable. Otherwise ask the user for screenshots or exported reference material when that could unblock the same workflow, then report the exact blocker. Do not substitute Canvas or write a replacement design document.
7. After `DESIGN.md` is ready, read `skills/code-generator/references/image-asset-handling.md`, prepare the Image Manifest in `ASSETS.md`, and source permitted original or neutral replacement imagery. Then load and follow `skills/frontend-implementation-policy/SKILL.md` and `skills/code-generator/SKILL.md` directly in the current execution, using the user request, resolved implementation requirements, designer-written `DESIGN.md`, `ASSETS.md`, and existing CDN index. Do not create or delegate to an implementation SubAgent.

## Boundaries

- The reference site supplies visual evidence; the user request and resolved implementation requirements remain authoritative for product scope, copy, behavior, data, integrations, and requested deviations.
- The SubAgent may browse only the supplied reference URLs and links directly discovered from them. It writes no project file except `DESIGN.md` and performs no scaffold, dependency, React/CSS, build, preview, deployment, database, or provider work.
- Keep `ASSETS.md`, assets, React code, runtime CSS, install/build, preview, browser verification, deployment, and provider operations outside the design SubAgent.
- Do not call `canvas-designer`, load `canvas-design`, or use Canvas template grounding for the same request.

## Handoff

During code generation, read `DESIGN.md` and `ASSETS.md` by path and use the user request and resolved implementation requirements directly. Missing visual decisions require a focused correction from the same reference-site-replicator; missing product decisions are resolved against the user request; missing imagery follows the image asset handling contract.
