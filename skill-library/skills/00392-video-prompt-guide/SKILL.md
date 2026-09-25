---
name: video-prompt-guide
description: |
  Main routing Skill for video generation. Routes into one of three paths based on regeneration intent and final duration: video generation under 15 seconds, video generation from 15–30 seconds, and video regeneration.
  The two new-video paths share one workflow: Research → the `research.md` artifact → text video script → user confirmation → model-specific compilation → video generation.
---

# Video Generation

## 1. Routing Scope

This Skill is the sole entry point for video-generation tasks. It is responsible only for determining which path the current request belongs to and executing the corresponding Pipeline.

| Path | File | Condition |
| --- | --- | --- |
| Video generation under 15 seconds | `pipelines/video-under-15s.md` | `1–15s`; 15 seconds belongs to this path |
| Video generation from 15–30 seconds | `pipelines/video-15-to-30s.md` | `>15s` and `<=30s`, and the `video_generate_submit` Ultra `duration` capability supports values above 15 seconds |
| Video generation from 15–30 seconds (backup path) | `pipelines/video-15-to-30s_backup_plan.md` | `>15s` and `<=30s`, and the `video_generate_submit` Ultra `duration` capability supports only values up to 15 seconds |
| Video regeneration | `pipelines/video-regenerate.md` | Modify, redo, or generate again a video already generated in the current conversation |

The pipeline files referenced above reside in the `pipelines/` directory relative to this Skill's installation path.

Routing is determined solely by final duration, not by the number of shots or scenes.

The two new-video paths share one workflow: Research → the `research.md` artifact → text video script → user confirmation → model-specific compilation → video generation. Execution details are defined by the corresponding Pipeline file.

## 2. Intent Routing

### STEP 0 — First Determine Whether This Is a Regeneration

The following intents enter `pipelines/video-regenerate.md` directly:

- Regenerate / create another version / regenerate;
- Modify the video just generated;
- Keep everything else unchanged and modify only one part;
- Generate again after changing the action, camera movement, pacing, aspect ratio, resolution, or model;
- Generate again using exactly the same parameters.

The regeneration target must be clearly identifiable from the current conversation. If multiple candidates exist and it is impossible to determine which one, ask only which one should be redone.

### STEP 1 — Confirm That the Task Requires Actual Video Generation

Enter this Skill only when the user requests that video-generation capability ultimately be invoked. When the request is only to analyze a video, write a script, or write a Prompt, complete the corresponding content directly without entering a generation Pipeline.

### STEP 2 — Confirm the Final Duration

- The user provides a specific duration: use it directly;
- The user provides a duration range, or a vague expression such as “a dozen or so seconds / short video / slightly longer”: ask and confirm one final duration;
- The user does not provide a duration: default to `10s`;
- `duration <= 15s` → `pipelines/video-under-15s.md`;
- `15s < duration <= 30s` → Read the `video_generate_submit` Ultra `duration` capability (tool definition only, no test submission): if it supports values above 15 seconds → `pipelines/video-15-to-30s.md`; if it supports only values up to 15 seconds → `pipelines/video-15-to-30s_backup_plan.md`;
- `duration > 30s` → Inform the user that single generation beyond 30 seconds is not currently supported, and suggest splitting the content into multiple segments generated separately.

### STEP 3 — Determine the Aspect Ratio

Determine the aspect ratio in the following order:

1. The user explicitly provides an aspect ratio such as `16:9 / 9:16 / 1:1` → Use it directly;
2. The user explicitly says horizontal / landscape → `16:9`;
3. The user explicitly says vertical / portrait → `9:16`;
4. The user explicitly says square → `1:1`;
5. In all other cases, default to `9:16`.

The aspect ratio is a shared fact for script composition and final video parameters, and is confirmed together at the confirmation Gate.

### STEP 4 — Determine the Model and Resolution Defaults

- The model defaults to `Pro`, and a supported model explicitly designated by the user takes precedence; the `15s < duration <= 30s` path fixes on `Ultra` (`Pro` and MiniMax H3 have a 15-second duration limit);
- Resolution defaults to `720P` for `pro` / `ultra`, and `768P` for `minimax`.

The defaults for duration, aspect ratio, model, and resolution take effect only when the user has not explicitly specified them; a parameter the user explicitly provides always takes precedence.

### STEP 5 — Execute the Corresponding Pipeline

After routing is complete, read the corresponding Pipeline. First create all task nodes and wire their dependencies at once according to that Pipeline's DAG task protocol, then execute them in dependency order.

## 3. Global Operating Rules

1. **Research routing**: For product videos, read `skills/ecommerce-research.md`; for non-product videos, read `skills/general-research.md`.
2. **Research produces `research.md`**: It serves as the internal basis for script, model, and parameter selection, and does not add a separate user-confirmation round. Ask only about information gaps that genuinely block the core design.
3. **Reference images are generated on demand**: When the user requests reference images, the only roles are `visual_anchor` and `first_frame`, defaulting to `visual_anchor` (the static image that best helps confirm the video's visual intent, not required to correspond to an exact point in time). When the user explicitly requests “show the first frame first / the first frame must be / drive it with the first frame,” apply the following first-frame determination:
   - **Total reference images = 1 and the selected model supports `i2v`** → Set the image to `role = first_frame`, corresponding precisely to `0.00s`, and use `i2v`;
   - **Total reference images ≥ 2, or the selected model does not support `i2v`** → Set all reference images to `role = visual_anchor` and use `r2v`; state in the script and final Prompt which image serves as the `0.00s` opening frame, while explaining the purpose of each remaining image.

   When the user explicitly designates an uploaded image as the first frame, that `IMG_XX` enters the reference-image set directly. Model input binding must preserve consistent role semantics.
4. **Image preparation**: Prepare reference images only when the user indicates a need for video reference images; during preparation, use `image_edit` when the current image needs to inherit facts from a user image or a preceding image, and `image_generate` in all other cases. Multiple reference images may be generated sequentially to maintain consistency of people, products, or scenes.
5. **Prioritize a model explicitly designated by the user**: If that model cannot support the target duration / aspect ratio / first-frame input, explain the conflict before the confirmation Gate and provide available candidates.
6. **Set only one user-confirmation Gate for a new video**: After Research, generate the text script and model recommendation, and ask the user to confirm them together (present reference images alongside when the user has requested them). On confirmation → proceed to model-specific compilation; on modification → update the affected content per the changes, present it again, and proceed to compilation and generation. For regeneration tasks, determine whether reconfirmation is needed according to `pipelines/video-regenerate.md`. The Gate must be completed through `ask_user` before the response ends.
7. **Perform model-specific compilation after confirmation**: Execute `skills/video-prompt-compiler.md`; the compiler reads the corresponding `model-guides/*.md` and the current `video_generate_submit` tool definition, generates the final Prompt, and prepares the actual call parameters.
8. **The current tool definition is the source of truth for parameters**: Formal submission uses only fields, enumerations, and limits explicitly supported by the tool, and does not probe capabilities through test submissions; the final Prompt and tool parameters are prepared only within the current execution context, and `video_generate_submit` is called directly after validation passes.
9. **Final input is text-to-video or image + text**: By default, use the final text Prompt for text-to-video; when the user provides or requests reference images, attach the confirmed image reference set. User-uploaded videos `VID_XX` are used for preliminary Research, understanding actions/scenes/styles, and preparing reference images.
10. **The Pipeline is driven by the DAG task system**: See the corresponding Pipeline's “DAG Task Protocol” for the node set, dependency wiring, and Gate loopback rules; mark each task `in_progress` before starting and `completed` immediately upon completion, leave no task `in_progress` before ending the response, and perform Gate loopbacks by resetting existing task nodes.

## 4. Models and Providers

| Model | model_id | provider |
| --- | --- | --- |
| MiniMax H3 | `minimax-h3` | `minimax` |
| Pro | `pro` | `pro` |
| Ultra | `ultra` | `ultra` |

The provider mapping is fixed according to the table above. All three models support multiple image references (see the parameter table in the corresponding `model-guides/*.md` for each limit), so the number of reference images does not differentiate model selection.

## 5. File Responsibilities

- `pipelines/`: Four execution paths;
- `skills/general-research.md`: Lightweight Research for non-product videos;
- `skills/ecommerce-research.md`: Product Research;
- `skills/script-and-visual-reference.md`: Generates the text script and model recommendation, and produces reference images when the user requests them;
- `skills/script-table.md`: Defines the markdown table columns and example for the script, shared by the two new-video paths;
- `skills/visual-reference-prompt.md`: Converts dynamic video intent into `visual_anchor` / `first_frame` image instructions (used only when the user requests reference images);
- `skills/video-prompt-compiler.md`: Compiles a confirmed plan into a model-specific Prompt and tool parameters;
- `model-guides/`: Prompt, input-binding, and parameter-adaptation rules for each model; Pro and Ultra share `pro.md`.
