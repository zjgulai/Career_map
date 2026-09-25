---
name: mobile-use
description: "Inspect, operate, automate, and verify Android, HarmonyOS, and iOS apps through live Qoder Canvas device surfaces. Use for live target or session discovery, semantic UI interaction, screenshots, or exact native-test evidence. Use setup-mobile-use for missing toolchains or machine-wide device setup; do not use for ordinary mobile source editing unless runtime verification is requested."
---

# Mobile Use Canvas

Operate the matching host-owned Canvas device surface. The plugin-local CLI
controls live targets and sessions. The plugin currently contributes no MCP
tools, does not open IDE editors, and does not start a second device runtime.

## Route the task

- Missing SDK, JDK, Xcode, DevEco, HDC, AVD, or Simulator target: invoke
  `$setup-mobile-use` before changing project files.
- Known project but no matching live Canvas surface: follow
  [Establish the surface](#establish-the-surface) before device discovery.
- Device/session automation: read [CLI](references/cli.md).
- Choosing between the plugin CLI, setup probe, host-owned platform tools, or
  optional external utilities: read [Tools and boundaries](references/tools.md).
- Screenshot, recording, or visual-regression evidence: also read
  [Visual evidence](references/visual-evidence.md).
- Missing or inconsistent targets, sessions, capabilities, frames, input,
  installed behavior, or evidence: read [Debugging](references/debugging.md).
- Native test, mobile E2E, repair, or fail-to-pass evidence: also read
  [Installed-app verification](references/installed-app-verification.md).
- Platform-specific project or runtime diagnosis: read only the matching
  [Android](references/android.md), [HarmonyOS](references/harmonyos.md), or
  [iOS](references/ios.md) reference.

## Establish the surface

- Android: open application-module `src/main/AndroidManifest.xml`.
- HarmonyOS: open application-root `build-profile.json5`.
- iOS application: open `<App>.xcodeproj/project.pbxproj`.
- SwiftUI Package Preview: open the importable package's `Package.swift`.

Reading an entry file does not open its Canvas viewer. Use a host-provided
Canvas-open action when one is available, then wait for that viewer to publish
its target. A user request to open, start, run, or test the app already
authorizes revealing the matching project Canvas; do not ask for the same
permission again.

If the host exposes no Canvas-open action, report that host boundary and give
the user the canonical entry above. Do not use a platform shell command,
rewrite an entry file, or claim that the SDK/device is absent merely to make a
surface appear.

## Verify source changes

When the user asks to change app source and verify it:

- Edit source-owned files only and preserve existing behavior unless the user
  requested a behavior change.
- Never edit Previewer caches, packaged viewers, build output, simulator state,
  or other generated files to manufacture the expected result.
- Require a supported viewer rebuild or refresh before runtime assertions.
- If no supported refresh is available, report the source change as complete
  and runtime verification as unavailable. Do not guess platform commands or
  generated paths.

## Match evidence to the claim

- Build: the selected project or target compiled.
- Interactive: the real device surface completed `observe -> act -> assert`.
- Native target test: one exact instrumentation, XCTest, or ArkXTest selector
  executed and returned `data.output.outcome == "passed"`.
- Repair: the same frozen execution plan produced the intended assertion
  failure before the fix and passed after it.

Do not substitute Phone Use `assert` for a native runner result. HarmonyOS
Previewer intentionally lacks `device.test.run`; native HarmonyOS evidence
requires a qualified HDC target.

## Automation loop

Use the Skill-local launcher described in [CLI](references/cli.md). Derive its
absolute path from the loaded `SKILL.md` and pass that path directly to `node`.
Do not declare or export a launcher environment variable, depend on the
workspace cwd, or require `QODER_PLUGIN_ROOT`.

1. For “what devices are available?”, use `inventory`; report its
   `scope: live_canvas_surfaces` and do not infer machine-wide toolchain absence.
2. For one semantic interaction, use selector-first `tap` or `long-press` so
   the host resolves and acts against one fresh snapshot.
3. For multiple steps, use one versioned `run-plan` in one shell invocation;
   let it bind the uniquely selected session and return bounded step evidence.
   When diagnostic media is material, explicitly request failure screenshots
   or native recording in the plan's `evidence` policy.
4. Use `list-targets` / `start-session` / `list-sessions` and low-level
   revision-bound `observe` / `act` only when the task needs explicit lifecycle,
   coordinates, text/key input, or snapshot refs.
5. For installed-app verification, run one exact `run-native-test` selector.
6. Use operational commands only when the selected target/session advertises
   the matching capability.
7. Stop only the session this workflow started unless the user asked to keep it.

Android UIAutomator, HarmonyOS Inspector, and iOS accessibility nodes are not
DOM elements. Prefer native identifiers and uniquely resolved semantic labels.

## Safety and reporting

- Ask before starting a target unless the user already requested runtime/E2E
  execution; starting may build, boot, install, and launch.
- `manage-app uninstall` requires explicit confirmation. Do not infer it.
- Keep broker URLs/tokens private. Preserve artifact URI/digest metadata rather
  than embedding media bytes.
- Distinguish **captured** media from **visually inspected** media. An artifact
  receipt proves capture and provenance; it does not prove the pixels or video
  were viewed by the Agent.
- Do not edit or commit DerivedData, Gradle/Hvigor outputs, APK/HAP/app bundles,
  Previewer output, simulator data, or signing material as project source.
- Report build, interactive, native-test, and repair evidence separately, and
  name every unverified platform or layer.
