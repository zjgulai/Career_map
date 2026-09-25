---
name: voice-clone
description: |
  Create a reusable cloned voice from an authorized recording with consent, source review, optional cleanup, language matching, a demo, and quality checks. Not for unauthorized imitation.
trigger-words: [voice clone, clone a voice, cloned voice, voice replica, reusable voice, voice matching]
guide-prompt: Please provide an authorized reference recording with clear, mostly isolated speech.
guide-prompt-en: Please provide an authorized reference recording with clear, mostly isolated speech.
---

# Voice Clone

Create a reusable cloned voice from a reference recording while protecting speaker consent, source quality, and downstream use.

## Inputs

Collect:

- An audio recording in a currently supported format.
- Confirmation that the user has the right to use the recording and the speaker has authorized cloning.
- The intended language and use when known.
- Optional preferences for cleanup, demo text, and voice naming.

Prefer clean, mostly isolated speech from one speaker. Avoid overlapping speakers, heavy music, strong room echo, clipping, or long silent sections. Check current capability limits before processing rather than encoding provider-specific limits in this workflow.

## Step 1: Obtain authorization

Before inspecting or processing the recording, show this statement and require an explicit confirmation:

> I confirm and guarantee that I have the legal right to use this audio and have obtained authorization from the speaker to create a cloned voice, and that the result will be used only for lawful purposes.

Offer two clear actions: **Confirm and continue** or **Cancel**. Stop immediately if the user cancels, declines, or cannot confirm. This step cannot be skipped.

## Step 2: Review the source recording

After authorization, inspect the source and report:

- Whether its format and size are currently supported.
- Whether it contains enough usable speech for a reliable clone.
- Whether there is one dominant speaker.
- Audible issues such as noise, music, echo, clipping, silence, or unstable volume.
- Any preprocessing that would materially change the source.

If the recording is unsuitable, explain why and ask for a better sample. Do not silently force an unsupported or low-quality source through the workflow.

## Step 3: Confirm preprocessing

Ask separately whether the user wants:

1. Noise reduction when background noise or music interferes with speech.
2. Volume normalization when loudness is uneven, too low, or clipping can be avoided.

When shortening a long source, prefer a continuous clean passage and end at a natural pause. When the usable sample is too short, prefer requesting a better source; only extend or repeat material when the user accepts the quality tradeoff. Preserve the speaker's natural timing and timbre.

## Step 4: Confirm language and demo text

Identify the dominant spoken language and ask the user to confirm or correct it. Use the matching entry in `references/demo-texts.json` as the default demo text, or accept a short custom demo.

Warn the user when the demo language differs from the reference language because pronunciation and similarity may be less reliable.

## Step 5: Create and review the clone

Create the cloned voice from the approved source and preprocessing choices, then generate a short demo using the confirmed text.

Review the demo for:

- Speaker similarity without exaggeration.
- Clear pronunciation in the intended language.
- Stable volume and pacing.
- No unexpected background sound, distortion, metallic artifacts, or copied private content.
- Suitability for the user's stated lawful purpose.

If safety checks flag the source or result, explain the issue in plain language and follow the applicable restriction. Do not expose internal risk codes or implementation fields.

## Step 6: Name and deliver the voice

Ask the user for a reusable name, or propose a neutral default. Optionally collect:

- Language.
- Gender or presentation label, only if the user wants it recorded.
- A short voice description such as “warm, deep, measured delivery.”
- The source filename for traceability, without exposing private local paths.

Deliver:

- Voice name.
- Confirmed language.
- Optional description metadata.
- A playable demo when available.
- A clear note that the cloned voice is ready for compatible voice-synthesis workflows.

Do not teach the user how to pass internal identifiers or request fields to a particular tool.

## Step 7: Optional reuse

Ask whether the user wants the cloned voice saved under its chosen name for future projects. If yes, store only the minimum reusable reference and descriptive metadata supported by the current environment. If no, keep it limited to the current task.

## Failure recovery

- Missing [REDACTED] and explain that cloning cannot continue.
- Unsupported or poor source: request a cleaner, compatible recording.
- Multiple speakers: ask for an isolated speaker sample.
- Weak similarity: choose a cleaner passage and recreate the clone with the user's approval.
- Unwanted noise or artifacts: revisit preprocessing or use a better source.
- Language mismatch: confirm the intended language and replace the demo text.
- Repeated use in the same task: reuse the approved clone rather than creating duplicates.

## Boundaries

This Skill creates an authorized reusable voice and a quality-review demo. It does not grant rights to a speaker's identity, bypass consent, impersonate someone deceptively, or provide provider-specific calling instructions.
