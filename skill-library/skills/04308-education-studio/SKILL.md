---
name: education-studio
version: "0.1.46"
summary-cn: 教育内容与视频一体化创作工作室
summary-en: End-to-end educational content and video production studio
display-name-zh: 教育内容工作室
creator: MiniMax
tags: [education, video, course, explainer, assessment]
trigger-words: [educational video, teaching video, lesson plan, course material, quiz creation, science explainer, training content, course transcript]
guide-prompt: |
  告诉我你想讲解的主题、题目或课程素材，我会通过可点击选项引导你完成教学设计、分镜、H3 视频生成和成片。
guide-prompt-en: |
  Share a topic, question, or course material. I will guide you through lesson design, shot planning, H3 video generation, and final delivery using clickable choices.
description: |
  Turn a topic, question, lesson recording, transcript, or course material into a lesson plan, exercises, handout, courseware, or educational video. Not for generic editing without a teaching goal.
---

# Education Content Studio

Determine the learning problem first, then choose the minimal sufficient delivery path. Start with a verifiable teaching brief, confirm complex tasks stage by stage, and expand long content only after the plan is confirmed.

## Interaction rules

For every decision that materially changes the film or delivery topology and can be enumerated into finite options, use the agent runtime's confirmation card to show clickable options. Put the recommended item first labeled "recommended", and explain each option's effect or trade-off in one sentence. confirmation card is the structured interaction of the planning stage.

In scope: delivery form, narrative approach, video generation route, storyboard-image strategy, visual direction, voice or narration style, and hard constraints like aspect ratio or platform. Mergeable decisions go into one ask; dependent decisions are asked in order. Low-impact details are decided directly by the agent from the brief.

Text input is for topics/questions, copy that must be used verbatim, proper nouns the user must supply, and custom requirements. Information already present in messages or material is inherited directly.

## Canvas delivery hard gate

All stage artifacts must enter the Hub canvas; delivery completion is judged by canvas nodes.

- Initial `Brief.md`: write one editable text node with writing to canvas, containing the body draft, teaching brief, learning objectives, candidate narrative approaches and visual directions, route suggestions, and the deliverables list — no video generation prompts;
- `视频脚本与提示词.md` (video script & prompts): after the user picks the narrative approach, visual style, and image-generation route, write a second independent editable text node containing per-shot video prompts and the sound plan;
- Storyboard images, keyframes, and other images: results must enter the canvas;
- H3 video clips: results must enter the canvas;
- VO, music, and sound effects: results must enter the canvas;
- Editable cut: use the opened video-editor plugin and its agent capabilities; when the editor is not open, ask the user to open the plugin node first;
- Final render: use the editor's export capability guidance and keep the result in the canvas/asset system.

A stage counts as complete only after the text node write succeeds and returns a valid `node identifier`. The initial stage creates `Brief.md`; the formal storyboard stage creates `视频脚本与提示词.md`. In chat, state the created node names, purposes, and next steps.

After `Brief.md` is written, immediately fire the next-step confirmation card based on the current brief and risk judgment so the user advances by clicking; never close with plain text and wait for the user to type "next". When duration, structure, or material risks exist, the next-step options must explicitly include both "continue with the current plan" and "adjust the plan first".

Users may edit canvas text nodes directly. Before the storyboard stage, re-read the latest `Brief.md` with latest canvas version; before image, audio, or video generation, re-read both `Brief.md` and `视频脚本与提示词.md`, treating the latest canvas content as authoritative. When the user requests changes in chat, locate the document and passage first, get precise anchors via canvas locating, and apply minimal edits via anchored text edit; use writing to canvas with `expected content version` only for full rewrites.

## Task routing

| User goal | Primary deliverable |
|---|---|
| Learn a concept/skill | learning objectives, prerequisites, step-by-step explanation, worked examples, comprehension checks |
| Lesson prep / teaching | lesson plan, board/courseware structure, classroom activities, time allocation, teacher notes |
| Exercises / exams | questions, difficulty ladder, answers, solutions, rubrics, error tags |
| Science communication / outreach | audience-tailored script, analogies, factual boundaries, visual explanation suggestions |
| Micro-lesson / educational video | narration script, shot table, subtitles, asset list, audio-visual rhythm |
| Courseware / handouts | page outline, key message per page, charts/application material, speaker notes |
| Material processing | transcription, correction, summary, terminology unification, knowledge-point slicing |

For video visuals, consult `references/visual-production.md` and `references/education-video-pipeline.md` as needed; for assessment, `references/assessment.md`. Read only the reference the current branch needs.

Educational-video prompts use a unified style anchor plus per-shot teaching fields. Narration is written directly into each clip's prompt to be generated together with visual events, actions, text motion, and transitions; after the video is confirmed, generate a standalone formal VO as a replacement or polish layer only as needed. Style selection, storyboard generation, H3 calls, canvas, and the video editor follow the current Hub workflow.

## Standard workflow

### 1. Establish the brief (HARD-GATE)

Extract or reasonably infer: topic, learner age/level, learning objectives (at most 3), usage scenario, content depth, language, output format, provided material, and constraints. A user-given duration is kept as a constraint; when unspecified, do not force the user to invent an exact total duration before the script. Fill key gaps with 1–3 questions and proceed on explicit assumptions for the rest.

Write objectives as observable behaviors, each with a clear actor, action, completion condition, and acceptance criterion. Keep the body draft and full narration in `Brief.md`, but video shots, sound planning, and generation prompts all go into the next stage's `视频脚本与提示词.md`.

1. **Teaching brief**: audience, objectives, prerequisites, scenario, language, and delivery specs;
2. **Candidate narrative approaches and visual directions**: 3–5 concrete film plans written for this topic, each with matching medium/style, color, material, composition, camera language, information display, motion, transitions, focus principles, and negative prompts;
3. **Full word-for-word narration**: the input text of the video script, annotated with speaker, tone, and pronunciation risks;
4. **Video script and prompt suggestions**: script structure and generation route only — no per-shot prompts expanded inside the Brief;
5. **Generation route suggestion**: direct text-to-video, or image-generation model storyboards first then H3;
6. **Deliverables list**: narration, storyboards/keyframes, voice reference, H3 clips, subtitles, editable video project, and final render.

When the user edits the body or narration, read the latest canvas version first and write changes back to `Brief.md`; at the formal storyboard stage, split the latest narration per shot and compute the sound plan into `视频脚本与提示词.md`. Later stages never rewrite confirmed word-for-word narration without a user request; on a request, close the loop "locate passage → minimal edit → recount/re-time → update affected shots, subtitles, sound, and prompts → re-confirm", reusing unaffected shots and assets.

Form a complete, naturally paced word-for-word narration draft in `Brief.md` first. Then compute the natural spoken duration from the audience's baseline speaking rate, effective character count, and punctuation/breath pauses, plus necessary visual buffer, yielding the script's estimated total duration. Then you must use a real confirmation card: `At the current script and natural pace, the film is estimated at about X seconds. Is this acceptable?`, always with three options: `Accept X seconds (recommended)`, `More seconds`, `Fewer seconds`. "More" notes it adds script length and teaching content; "fewer" notes it trims script length and content. After more/fewer, first edit the narration in `Brief.md`, recompute, and re-ask this duration confirmation; never change only the total duration, visual buffer, or speaking rate. Do not enter the formal per-clip script before the duration is confirmed.

When the user gives an explicit total duration, treat it as a hard planning constraint: lock `target_duration_seconds` first, derive `voice_budget_seconds` from the audience rate, punctuation/breath pauses, and necessary buffer, then organize narration and shots — never write an over-budget draft and force-squeeze it into the video. After the narration draft, always compute `voice_required_seconds` versus `target_seconds` and calibrate clip boundaries to the model's legal durations; when over budget, prefer removing repetition, merging adjacent semantics, or splitting into a series — never rescue via faster speech, deleted pauses, or duration-only edits.

Whenever `Brief.md` exists and a decision can advance, pop the next confirmation card in the same turn — never wait in plain text. When the narration draft is done, fire the natural-duration confirmation first; otherwise ask the currently needed content or narrative-approach decision.

Decide how the film tells its story before deciding art style. The narrative approach uses its own confirmation card, picking the 3–5 best-fitting items for this topic, audience, and duration from the library below. Options must use "category name: one plain-language explanation" so the user grasps the structure at a glance:

- **Story narrative**: a small story or concrete scenario carries the knowledge; a character meets a problem and understands or solves it along the way;
- **Instructor explainer**: an instructor or virtual instructor stays on camera speaking to the audience, with supporting visuals interspersed;
- **Character Q&A**: two or more characters ask, challenge, and answer, clarifying the point through dialogue;
- **Board derivation**: like a teacher at a blackboard, whiteboard, or digital canvas, formulas, figures, and derivations written out step by step;
- **Infographic poster**: big titles, capability guidances, icons, charts, and information layout dominate, revealed layer by layer with the narration;
- **Experiment / hands-on**: built around real experiments, hand operations, or software operations, with the audience following steps to observe process and results;
- **Case observation**: show a real phenomenon, case, or object first, then reach conclusions via close-ups, annotation, comparison, and decomposition;
- **Immersive exploration**: the audience follows a first-person view, spatial walkthrough, or micro/macro journey, discovering knowledge through exploration;
- **Hybrid explainer**: one primary form throughout, switching to instructor, scenario, infographic, board, or hands-on segments as the knowledge requires.

Show only options genuinely distinct for the current task, with the recommendation first; never present plans that differ only in name but share the same shot structure. Beyond the plain-language line, add each option's key effect or trade-off for this topic. After selection, write it as the "narrative approach anchor", fixing the film's opening hook, narrative subject, knowledge carrier, shot progression, information density, on-screen-text ratio, and ending structure, and write it back to the planning node.

Visual direction must expand into observable visual baselines. After the narrative approach is confirmed, use confirmation card to offer 3–5 matching full style directions, each stating medium, composition, material, color, information display, motion, why it fits, and risks. After selection, converge into a unified style anchor and write it back. The style anchor must include: visual medium, compositional language, line and material, color and light, teaching-information presentation, camera rhythm, focus principles, and directly usable negative prompts. Narrative approach and art style are independent decisions: style never substitutes for how the content unfolds.

Planning must first build a "teaching information → visual evidence" mapping: every knowledge point states which visible action, spatial relation, graphic change, contrast, material feedback, or character reaction proves it; every narration passage binds to at least one visual evidence item. The imagery demonstrates knowledge relations directly, and adjacent passages keep adding information through changes in subject, space, scale, composition, or motion.

The full video script marks the sound topology first: `narration-only`, `on-camera speech`, `character dialogue`, or `silent demonstration`. Narration-only mode uses "narration semantic units" as generation clips; other modes divide clips by lines, performance, and visible action together. Each clip fully records: clip number, sound topology, absolute time range, word-for-word narration/lines, effective character count, adopted speaking rate, base reading time, punctuation/breath pauses, voice start and end times, 1–2 s visual buffer, `target_seconds`, planned generation duration, submitted duration, rate-load status, visuals, framing and camera position, camera move, entry state, exit state, subjects/characters/props, knowledge point carried, teaching function, learner observation task or comprehension goal, subject-accuracy / teacher-review points, on-screen text, sound, keyframe description, and reference sources. Only with all fields complete may keyframe or video generation start.

Before writing the formal script and computing clips, check the current video capability summary for supported durations and reference handling. The script and estimated total duration confirmed via the natural-duration confirmation are the whole-film planning basis; clip count and per-clip durations derive jointly from narration semantics, voice timing, and supported durations — this is execution planning, never a confirmation card asking the user "how many segments to stitch". Write the derivation into `视频脚本与提示词.md` and the project planning record; when capability info invalidates an existing split, update both plans in place before continuing to assets and generation.

After the script, build the "project generation input contract" as the single source for all media work. Keep project metadata, shared assets, local segment content, and execution settings as separate sections; the natural-language prompt is compiled from the unified style anchor plus the local segment content. The contract records project name, aspect ratio, resolution, file naming, whole-film timing, character and voice assets, local narration, on-screen text, sound events, and the chosen model route without copying private implementation details.

Extract shared entities from the full script first. Any recognizable person appearing in two or more clips, and any continuously on-camera instructor or host, becomes a shared-person record. Register a qualified user reference when available; otherwise generate a clean-background character asset image, fixing face, hair, apparent age, build, wardrobe, palette, and signature accessories. Each person keeps a stable identifier, name, asset path, and applicable-clip set. After the asset lands on canvas, confirm it with a real confirmation card and update the shared-asset table.

The shared-character stage completes only when every cross-clip character has a stable identity record, a real asset path, an applicable-clip set, and user confirmation; every applicable clip's execution preview includes that path. Repeating a character's appearance in prompts does not constitute a character asset; with any item open, H3 must not be used.

Before generating each clip, assemble shared assets by their applicable-clip sets: on-camera people, the confirmed voice, matching scenes, storyboards, and user material each retain a declared duty. The direct text-to-video route only decides whether per-shot storyboards are made; it never changes how shared assets are built, confirmed, and assembled.

Brief, video script, project generation input contract, and execution steps are successive representations of one plan: each later step only compiles the previous one — never improvise a different clip count, uniform duration, narration, or material scheme at generation time. Before every video generation, verify the current segment, local narration, planned duration, character references, and voice reference item by item; on any mismatch with the contract, update the planning node first — never substitute ad-hoc reasoning for the canvas contract.

Narration-only mode computes sound first, then designs visuals. Default Chinese educational pace is about 3.0 chars/s (~180 chars/min); lower grades 2.5–2.8, upper grades 2.8–3.2, secondary and adult 3.0–3.4. Every clip must first get `voice_required_seconds = effective chars ÷ adopted rate + punctuation/breath pauses`, then `target_seconds = voice_required_seconds + 1–2 s visual buffer`, matched upward to the model's shortest legal duration. Never pad a short line into a long video with non-speech action or observation reserves, and never pick an 8, 11, or 15-second video first and stuff the narration in. When upward matching would leave more than ~2 s of narration-free head/tail, merge with adjacent semantics or re-split first; genuinely standalone silent demonstrations are planned separately under the appropriate topology. When `target_seconds` exceeds the single-clip cap, split along natural semantic boundaries and recompute each — never rescue via faster speech, deleted pauses, or narration spanning clips. Below the model minimum, likewise prefer merging adjacent semantics.

Each project uses one "baseline pace tier" as the whole-film anchor; adjacent clips of the same narrator must not swing widely in adopted rate because of character counts. Default adjacent-clip rate difference is at most 0.3 chars/s; genuinely faster or slower passages must be triggered by a narrative reason and recorded in the rate-load status. The hard cap for educational explainers is 3.6 chars/s; any clip whose back-computed rate from submitted duration exceeds 3.6, or that lacks punctuation/breath pauses, must be rewritten, split, or lengthened before dispatch.

A narration-only clip may contain one or more visual events, but the count follows narration semantics — never append a second narration-free, non-teaching shot to fill time. Other topologies may reserve reasonable screen time for reactions, mouth-closure, operation completion, or demonstrated results. When a visual switch occurs, record in local time the switch point, the outgoing action, the transition device, its duration, the knowledge relation carried over, and the incoming state; without a real switch, never force a transition.

After the planning package is on the canvas and before any image/audio/video generation, complete these six pre-selections and generate from the user's choices:

1. **Narrative approach question**: show 3–5 fitting categories from the library, each as "category name: one plain-language explanation" plus its effect or trade-off for this topic;
2. **Visual style question**: after the approach is set, show 3–5 matching style cards (medium, color, material, composition, camera, motion, why it fits); write the selection back to the planning node;
3. **Gender question**: female voice / male voice;
4. **Narration style question**: clear approachable teacher / lively energetic kids' narrator / steady professional documentary / user-provided reference voice; merge the two choices into one "voice anchor" line;
5. **Voice reference question**: `generate a voice reference` / `control the voice with text only in prompts`. A generated reference (a 3–15 s audible sample via voice-reference generator) keeps timbre and tone steadier across clips; text-only control saves credits and is faster but relies on prompts, with more variance;
6. **Image generation route question**: the first option is always `generate video directly with H3 from the per-shot teaching records (recommended)`, only then `generate storyboards with image-generation model first, then give them to H3 as image references` / `combine both`; visual style, subject matter, layout, or "more controllable" reasons never change the default recommendation or order.

Ask the narrative approach alone first; visual style, voice reference, and image route may share the next confirmation card. Choices the user already made are inherited. After selection, write results back to the planning canvas node; later stages consume only these confirmed values.

Educational explainers run the voice-in-video pipeline: write the full narration to canvas and split it into the per-shot contract; when the user chooses a voice reference, generate the audible sample to canvas first, then offer a confirmation card. Register the sample as a shared voice record with its path, voice anchor, applicable speakers, and applicable-clip set; on regeneration, update that record. Once confirmed, all applicable clips retain the same voice and mark its audio duty. Only when the capability summary explicitly shows that the target model rejects audio references may the plan switch to a standalone narration-replacement path, explained before video generation; never fall back to a pure text route while audio references are supported. Every clip keeps the confirmed voice anchor, word-for-word narration, tone, local time window, keyword-action pairings, ambience, and action sounds; after video confirmation, generate formal VO as needed and back-compute clip capacity and post arrangement from actual VO duration.

### 2. Design the learning path

Organize as "activate prior knowledge → core concept → concrete examples → guided practice → independent practice → exit check". Each knowledge point carries one cognitive action; intuition before terminology, rules, or formulas; abstractions must have examples and counterexamples.

For children/beginners: short sentences, single variables, visualization, and repeated recall.
For intermediate/advanced learners: explicit assumptions, boundaries, common misconceptions, and transfer problems.
For vocational training: prioritize real tasks, decision points, checklists, and executable artifacts.

### 3. Choose the delivery form

Pick one primary format per the brief, with optional supplements:

- **Text lesson**: heading hierarchy + key conclusions + application material + exercises + answers.
- **Lesson plan / courseware**: timeline + teacher actions + student activities + materials + assessment points.
- **Exercise set**: question → objective → difficulty → answer → solution → error causes.
- **Video**: segment/shot timecodes → visuals → narration → on-screen text → sound → assets.
- **Material processing**: keep the original structure, state the changes, output verifiable diffs or segmented results.

### 4. Educational video generation routes

On these inputs, prefer the matching route:

- **Question / question set → dynamic problem walkthrough**: re-lay the problem → identify givens → derivation steps → mark key discrimination points → answer reveal → transfer practice.
- **PPT / document → course video**: extract page hierarchy → keep layout and branding → write narration → map page elements to animation → generate chapters and subtitles.
- **Textbook / long course → knowledge-point shorts**: slice knowledge points → generate titles and cover copy → unified intro/outro → 30-second, 1-minute, or 3-minute versions.

Every educational video picks one pipeline before Visual Gen:

1. **Direct text-to-video (recommended)**: teaching script → unified style anchor and per-shot teaching records → H3 video. Good for quick validation, especially when speech-visual alignment matters and fewer intermediate edits are wanted.
2. **Storyboard reference pipeline**: teaching script → standalone storyboards via image-generation model → confirmation card offering "confirm all storyboards and generate H3" / "storyboards need changes" → after the click-confirm, H3 uses the approved images as its reference set and generates video. Good when visuals need stronger control and edits are cheap. Never ask "confirm?" in plain text or require the user to type a confirmation word.

When the user already specified a pipeline, follow it; otherwise, before Visual Gen, offer via confirmation card the two clickable options "generate directly with H3 (recommended)" and "generate storyboards as references first, then video". "Direct H3" always sits first and recommended, regardless of visual style, subject matter, or static controllability; the storyboard route is only a user-elected alternative. Storyboard count follows the visual states needing clarification; each image carries a clear subject, scene, composition, material, or text-layout reference duty.

Educational videos default to **MiniMax H3**. Before splitting the formal script, read the current capability summary and model guidance; without that check, never fix clip counts, planned durations, compile prompts, or use H3. Clip durations and execution settings follow currently available capabilities. With storyboards, user images, reference videos, or reference audio, use H3's supported reference path; storyboards uniformly serve as image references. When the user explicitly names another model, or a substitute is needed to satisfy hard constraints, present available models via confirmation card.

Complex video tasks advance through these stages, each artifact independently editable:

```text
teaching brief → content research → narrative approach question → narrative approach anchor → style question → unified style anchor
→ full explainer script / narration draft → compute natural total duration → total-duration question → confirm script and duration
→ per-shot teaching contract → storyboard/keyframe confirmation (per chosen route)
→ unified style anchor + matching storyboards + confirmed references → H3 generation and confirmation
→ narration and native sound produced with the video → confirm → formal VO replacement or polish as needed → mix in the video editor → render → teaching QA
```

In the storyboard pipeline, use image-generation model directly to produce standalone storyboards for shots needing clarity. Each image fully presents subject, scene, and stable composition, enters the canvas for confirmation, and serves as an approved image reference for H3. Storyboards supply subject, scene, composition, material, color, and text-layout grounding; action development, event order, camera moves, transitions, internal cuts, text motion, and sound are governed by the matching per-shot teaching record.

The narrative approach plans the script and decides per-shot structure. The video prompt has three parts: the unified style anchor verbatim, the current clip's complete storyboard content, and confirmed references with their duties. The unified style anchor covers visual medium, compositional language, line and material, color and light, information display, and negative prompts; its verbatim text lives in the editable shot script for reuse by storyboards and video generation. The current clip is fully described on a local timeline: planned duration, visuals, framing, camera move, entry state, exit state, transition design, subjects/characters/props, matching word-for-word narration with its local time window, knowledge point carried, subject accuracy, keyframe description, and confirmed text, motion, editing, and sound requirements. Shot numbers, absolute film time, split numbering, and production notes live in the shot table and editor-project metadata.

When generating video, compile two separate artifacts from the input contract: the model prompt from the unified style anchor plus current segment content, and an execution brief from project-level information, execution settings, and confirmed shared assets. Keep aspect ratio, duration, naming, clip order, and film time in planning records; attach people, voice, scene, and storyboard material by duty. The model prompt opens with what is visible, audible, and executable in the current clip, fully expressing visuals, character action, the local timeline, word-for-word narration/lines, on-screen text, sound design, and reference duties. When a clip contains multiple planned visual switches, write out each transition; joins between adjacent clips go into both sides’ segment content and the edit plan. Details in `references/education-video-pipeline.md`.

Clip submission is judged by contract completeness: local segment content has a full timeline and word-for-word audio content; execution settings are within the current capability summary; shared characters, voice, and scenes are confirmed; project-level information maps to the final file and editor timeline. Only with all four complete, start generation.

Video prompts fully keep the word-for-word narration/lines, tone, local time windows, and synchronized actions so the model co-plans imagery and speech rhythm. Every clip has its own `0 s → clip end` timeline whose endpoint equals the planned generation duration, and execution settings must match it. In narration-only mode, a silent interval over 1 second between narration end and clip end must carry an explicit reading, observation, or action-completion task; otherwise shorten the clip, merge narration, or rewrite the visual rhythm. On-camera speech, character dialogue, and silent demonstration follow their planned performance and action timing.

## Script modification protocol (HARD-GATE)

Handle user script changes as incremental edits — never treat an old chat script as the latest version:

1. Read the latest canvas version of the target document; for long documents, locate the passage or shot first, then read windowed context.
2. Submit a minimal edit with precise anchors, preserving sections, shots, assets, and references the user did not ask to change; replace the full document only on an explicit full-rewrite request.
3. After narration edits, recompute effective reading units, pauses, `voice_required_seconds`, `target_seconds`, clip boundaries, and back-computed rate, and update affected shot prompts, subtitles, VO, and editor timing;
4. Changes to learning objectives, core facts, duration budget, or sound topology return to `Brief.md` for re-confirmation and rebuild of affected downstream planning; local wording changes keep unaffected confirmed assets;
5. Incremental edits succeed only after the minimal change is visibly applied and the updated text is re-read; full replacements must confirm the rewritten document and re-read its latest version. Both paths must re-pass the duration hard gate — never just display a revised version in chat.

### 5. Production and QA

Show the full planning package before production; when the user must choose a direction or route that changes the film, present clickable options via confirmation card cards. Complex multimedia tasks enter generation only after the script/storyboard is finalized. Pre-delivery checks:

1. Every objective has a matching activity or assessment;
2. Difficulty matches the learner; every first-use term is defined;
3. Facts, formulas, citations, and units are verified; unverified items clearly flagged;
4. Worked answers are recomputable; question conditions complete with unambiguous answers;
5. Narration, visuals, and subtitles align segment by segment; on-screen text is legible;
6. Output includes both the creative result and next-step usage notes.

Extra checks for educational video:

- Formulas, symbols, question conditions, and answers are verifiable;
- Narration, subtitles, on-screen text, and shot timelines agree;
- Every formal VO maps to exactly one video time range, with keywords landing inside the visual event carrying that knowledge point;
- The editor project keeps editable alignment of per-shot video, per-segment VO, subtitles, music, and effects;
- Each shot has exactly one primary teaching purpose;
- New concepts get an explanation pause; each time window focuses a modest number of new elements;
- The ending contains practice, a question, or a comprehension check;
- Change requests can be located to a specific passage, shot, card, or subtitle;
- Visuals provide evidence matching the narration;
- Adjacent shots advance information via changes in subject, space, composition, scale, or motion rhythm;
- The film contains an opening hook, learner observation/thinking tasks, and an ending recap;
- The unified style anchor runs through script, storyboards, keyframes, and video prompts.

## Storyboard confirmation gate (HARD-GATE)

After all storyboards are on the canvas, use a real confirmation card offering “confirm all storyboards and generate H3 video (recommended)” and “storyboards need changes”. Only the click-confirm allows video generation; never ask “confirm?” in plain text or require a typed confirmation word.

## Voice-reference confirmation gate (HARD-GATE)

When the user chose a voice reference, immediately after the sample is generated and placed on canvas, use a real confirmation card offering “confirm this voice and continue to video (recommended)” and “regenerate the voice reference”. Only the click-confirm allows video generation; on regenerate, produce a new sample and ask again. Never substitute chat text for the confirmation, and never batch-generate videos right after sampling. This gate does not fire when the user chose text-only voice control.

After confirmation, update the sample into `shared_assets.voice`. Later clips assemble voice, character, and other visual references independently through the project generation input contract.

Voice-confirmation completeness requires all of: the sample path is recorded; the applicable-clip set is non-empty; those clips allow audio references; and the generation preview contains the same path with its voice duty. With any item open, video generation must wait.

## Voice anchor

The results of the gender question and narration-style question must be written into the Brief, the per-shot contract, and every clip’s video prompt. Prompt order is fixed: “voice anchor + `working_language` narration verbatim + local time window with synchronized actions”. With reference audio, the voice anchor expresses the equivalent of “@audioN locks … female/male spoken narration”. When producing an audition sample, merge the voice anchor and verbatim audition line into `texts`; never add an undefined extra field.

## Duration contract (HARD-GATE)

Every narration-only clip must record: effective narration characters, whole-film baseline rate, adopted rate (chars/s), base reading time, punctuation/breath pauses, voice start and end times, `voice_required_seconds`, 1–2 s visual buffer, `target_seconds`, planned generation duration, the duration actually submitted, back-computed rate, and rate-load status. Formulas: `voice_required_seconds = effective chars ÷ adopted rate + punctuation/breath pauses`; `target_seconds = voice_required_seconds + 1–2 s visual buffer`; `planned generation duration = the model's shortest legal duration ≥ target_seconds`; `submitted duration = planned generation duration`. On-camera speech, dialogue, and silent demonstration use the contract "total estimated line/action/performance time → shortest legal duration". In every mode the submitted duration must equal the planned duration — never blanket one uniform duration over the film without basis. When discrete legal durations would leave a narration-only clip more than ~2 s of silent head/tail, merge adjacent semantics or re-split before dispatch; when `target_seconds` exceeds the single-clip cap, split along natural semantics and recompute each — never compress the rate to stuff it in.

Rate-load states are fixed: `ok` = back-computed rate within baseline + 0.3 and at most 3.4 chars/s; `warn` = 3.4–3.6 chars/s, allowed only for short lines, recited mnemonics, or urgent commands, with pauses preserved; `blocked` = over 3.6 chars/s, measured VO longer than the video, or pauses deleted to fit the video. `blocked` clips must be fixed in the canvas plan before any image, video, or formal VO generation.

## Generation budget gate (HARD-GATE)

Before calling any image, audio, or video generation step, run one global pre-check recorded in the planning node: total narration characters, estimated total duration, clip count, needed storyboard count, whether a voice-reference generator voice reference is generated, whether standalone sound effects are generated, and the estimated number of generation calls. Budget is estimated by call count, never film seconds alone.

- Narration-only splits follow narration semantics and model duration capability, each clip computing and submitting its own duration; other topologies plan by lines and performance/action rhythm.
- One continuous speech generates only the necessary storyboards; without a clear composition change, do not regenerate storyboards per internal shot.
- Decorative text, stickers, highlight bars, and light UI sounds default to events inside the video prompt, not separate assets; use separate editable tracks only when the user explicitly needs them.
- The voice reference is an optional call, listed separately in the pre-check; never auto-generate before the user chooses.
- With an open budget or anomalous call count, compress clips and assets and explain the expected calls before entering generation.

## Question confirmation gate (HARD-GATE)

Narrative approach, visual style, gender, narration style, and image-generation route: when the user has not made them explicit, confirm through the real confirmation card; when explicit, inherit. The post-sample "confirm this voice / regenerate" and the storyboard pipeline's "confirm all storyboards / need changes" always require a real confirmation card; H3 must not be called before the matching confirmation.

## Output contract

Default output order:

1. **Teaching brief**: audience, objectives, duration, format, assumptions;
2. **Content structure**: modules/segments and their purposes;
3. **Full deliverable**: lesson plan, script, exercise set, courseware outline, or processed material;
4. **QA results**: factual/pedagogical/format checks and follow-up verification items;
5. **Optional next steps**: exercise variants, video versions, courseware versions, or tiered versions.

When the user just wants a simple answer, answer directly plus one comprehension check; when the user wants a film or batch output, run the full workflow.

## Boundaries and safety

Academic citations, exam material, lab safety data, and medical/legal conclusions use real verifiable sources. Children's content uses safe, respectful, privacy-protective expression. For sensitive or high-risk subjects, prioritize authoritative verification points and separate "teaching demonstration" from "real-world advice".
