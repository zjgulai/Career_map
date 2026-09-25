---
name: setup-mobile-use
description: "Diagnose and set up the local Android Emulator, HarmonyOS DevEco Previewer/HDC, and iOS Simulator toolchains required by Mobile Use Canvas. Use when list_targets is empty, Canvas reports a missing SDK, JDK, Xcode, DevEco, HDC, AVD, or Simulator dependency, or a user asks to install, configure, or repair a local mobile preview environment."
---

# Set Up Mobile Use

Diagnose the host first, then guide the user through only the missing platform
prerequisites. Keep environment setup separate from building a project or
starting a device session.

## Workflow

1. Identify whether the request concerns Android, HarmonyOS, iOS, or all three.
2. Derive the checker's absolute path from this loaded `SKILL.md`, then run it
   directly without depending on the workspace cwd:

   ```bash
   node "/absolute/loaded-setup-mobile-use-skill/scripts/check-mobile-environment.mjs" --platform <android|harmony|ios|all> --json
   ```

   Add `--project <path>` for HarmonyOS so the checker can inspect the
   project-generated Previewer device configuration.
3. Read only the matching platform reference:

   - [Android Emulator](references/android.md)
   - [HarmonyOS DevEco Previewer and HDC](references/harmonyos.md)
   - [iOS Simulator](references/ios.md)

4. Report what was detected, which exact requirement is missing, and which
   environment variable or default path supplied each toolchain root.
5. For iOS, require separate passing checks for Node.js, npm, and npx. Report
   their resolved absolute paths. If the pinned interaction runtime has not
   been prepared, ask immediately before running:

   ```bash
   node "/absolute/loaded-setup-mobile-use-skill/scripts/check-mobile-environment.mjs" \
     --platform ios \
     --strict \
     --prepare-ios-interaction-runtime
   ```

   This command may access the npm registry and writes to the user's npm
   cache. It must resolve exactly the viewer-owned `serve-sim` version; never
   replace the pin with `latest` or install it globally.
6. Ask before installing packages, accepting licenses, downloading SDKs or
   runtimes, creating a virtual device, changing shell profiles, using `sudo`,
   or selecting a different Xcode installation.
7. Re-run the checker with `--strict`. Without the iOS preparation flag, a
   zero exit code proves toolchain and target discovery only. With the flag,
   it additionally proves that the pinned iOS interaction package resolved and
   reported the expected version. Neither mode proves IDE environment
   inheritance, a project build, a live frame, or input injection.
   `--platform all` intentionally evaluates every product platform, so it
   reports iOS as unsupported on Windows/Linux. Use an explicit platform when
   qualifying one host-supported workflow.
8. Invoke `$mobile-use`, follow its CLI reference to run `list-targets`,
   and ask before `start-session`. Starting a session may build, boot, install,
   and launch.

## Safety and Scope

- Prefer the official Android Studio, DevEco Studio, and Xcode installers and
  their SDK managers. Do not invent third-party download URLs.
- Do not silently edit `.zshrc`, `.bashrc`, IDE settings, signing identities,
  Gradle properties, or project files.
- Do not start an emulator, Simulator, or Previewer as part of environment
  setup. Target listing is the final non-mutating check.
- Preserve platform limits: Android uses an AVD; HarmonyOS publishes Previewer
  plus explicitly connected HDC targets; iOS uses an iPhone Simulator on
  macOS. Do not infer a HarmonyOS target's emulator/physical kind from product
  strings or claim unadvertised recording/log capabilities.
- Treat the pinned iOS interaction runtime as viewer-owned. Do not start a
  second `serve-sim` daemon, install it globally, change its pinned version,
  or copy a native Helper app into the plugin. Preparation runs `--version`
  only; it does not start the daemon or boot a Simulator.
- Never commit SDK paths, local signing data, virtual-device data, build
  outputs, or generated Previewer artifacts.

## Failure Handling

- If the checker itself fails, show its stderr and inspect the script rather
  than substituting shell boot commands.
- If a required path differs from the implementation defaults, prefer the
  documented `CANVAS_*` or toolchain root override for the IDE process.
- If setup is complete but `list-targets` stays empty, restart the IDE once so
  its plugin host inherits the environment, then diagnose the viewer/broker
  boundary with `$mobile-use`.
