---
name: choose-codex-theme
description: Recommend, compare, preview, customize, and export Codex Material Themes through a guided conversation with automatically localized import instructions. Use when a user asks to choose, preview, switch, customize, import, or generate a Codex appearance theme; mentions preferences such as dark, light, warm, cool, low-glare, high-contrast, reading, or night work; wants UI and code font suggestions; needs instructions matching the language of their Codex UI; or requests a codex-theme-v1 import string.
---

# Choose a Codex Theme

Guide the user through theme selection, font selection, and manual import in three separate stages. Do not skip ahead unless the user already supplied the missing choices.

## Determine the Codex UI Locale

Treat the Codex UI locale as separate from the user's conversation language. Preserve a known UI locale across all three stages.

Determine it in this priority order:

1. An explicit statement from the user about their Codex UI language.
2. Visible Codex menu labels in an attached screenshot, such as `設定` or `Settings`.
3. UI-locale information already established earlier in the conversation.
4. If it is still unknown, infer it from the conversation language: use `zh-Hant` for a conversation written in Traditional Chinese and `en` otherwise.

Read localized labels and instructions from `references/ui-labels.json`. Never pause the theme workflow merely to ask which Codex UI language the user uses. If an explicit statement or visible screenshot label conflicts with the conversation language, trust the explicit or visual evidence. For an unsupported locale, use English labels with a brief note that the names may differ in the user's UI; do not invent translated menu names.

## Stage 1: Recommend a Theme

1. Read `references/themes.json`.
2. Recommend the single best-matching theme. State the reason in one concise sentence and show both localized and English names, such as `午夜研讀（Midnight Study）`.
3. Always display its preview image:
   - Read the selected theme's `previewUrl` from `references/themes.json` and require it to use HTTPS.
   - Prefer the bundled local preview when local command execution and the skill filesystem are available: run `node scripts/build-theme.mjs --theme <theme> --preview-path` from this skill directory and accept the result only when it is an absolute path to an existing `.png` file.
   - When the local preview resolves, embed it as `![<theme name> preview](<absolute local path>)`.
   - When local command execution or the bundled file is unavailable, embed the hosted preview as `![<theme name> preview](<previewUrl>)`.
   - Immediately below either image, always provide `[Open <theme name> preview](<previewUrl>)` as a clickable fallback. If the interface cannot embed the chosen image, continue the confirmation flow with this link; never leave only broken-image alternative text.
4. End with exactly: `要使用「<localized name>（<English name>）」嗎？也可以說「換一個」。`
5. Do not show font choices, the import string, or import instructions yet.
6. If the user asks to change, recommend another suitable theme, display its preview, and ask again.

## Stage 2: Choose Fonts

Start only after the user confirms a theme.

1. Read `fontOptions`, the selected theme's optional `fonts`, and `defaults.fonts` from `references/themes.json`.
2. Present both font roles and their available options in two short lists:
   - UI font: recommend the selected theme's `fonts.ui` when present, otherwise `defaults.fonts.ui`, then list the remaining UI options.
   - Code font: recommend the selected theme's `fonts.code` when present, otherwise `defaults.fonts.code`, then list the remaining code options.
3. Briefly explain that the recommended defaults balance Traditional Chinese UI readability and code clarity.
4. End with exactly: `要使用建議的預設字體組合嗎？也可以分別選擇其他 UI 與程式碼字體。`
5. Do not generate the import string until the user confirms the defaults or provides both font choices.
6. Accept other installed font names when the user supplies them explicitly.

## Stage 3: Provide the Theme Setting

Start only after the theme and both fonts are confirmed.

1. Generate the setting deterministically with `scripts/build-theme.mjs`; never assemble or edit its JSON manually.
2. Return the selected theme, UI font, and code font.
3. Show the complete one-line `codex-theme-v1:` value in a `text` code block.
4. Explain the manual import steps using the selected Codex UI locale from `references/ui-labels.json`.
   - For Traditional Chinese (`zh-Hant`), use this exact route:
     1. Click the profile picture or name in the lower-left corner, then select `設定`. Also mention that `Ctrl+,` opens Settings directly.
     2. In Settings, select `外觀`.
     3. Select `匯入`.
     4. Paste the complete setting line.
     5. Select `匯入主題`.
   - For English (`en`), use this exact route:
     1. Select the profile picture or name in the lower-left corner, then select `Settings`. Also mention that `Ctrl+,` opens Settings directly.
     2. Select `Appearance`.
     3. Select `Import`.
     4. Paste the complete setting line.
     5. Select `Import theme`.
   - Write the surrounding explanation in the user's conversation language, but keep every menu label exactly as it appears in their UI locale.
5. Tell the user to keep the complete prefix and JSON on one line.
6. Do not modify `~/.codex/config.toml`, AppData, databases, installation files, or the Codex window.

## Commands

List themes:

```powershell
node scripts/build-theme.mjs --list
```

Generate the confirmed setting:

```powershell
node scripts/build-theme.mjs --theme "製圖藍" --ui-font "Noto Sans TC" --code-font "Cascadia Mono"
```

Run commands from this skill directory, or pass the absolute script path.

## Recommendation Guidance

- Favor `low-glare` for long sessions, sensitive eyes, or late-night use.
- Favor `high-contrast` for maximum legibility or instrument-panel aesthetics.
- Use warm themes for cozy, paper, café, or editorial requests.
- Use cool themes for structured, technical, calm, or drafting requests.
- Treat light-surface themes as light-looking even when their import payload uses the catalog's compatibility variant.
- Preserve every choice already supplied by the user instead of asking for it again.

## Guardrails

- Always show a preview before asking the user to confirm a theme.
- Never present the generated setting before both font choices are confirmed.
- Keep the `codex-theme-v1:` prefix intact.
- Never give English-only menu labels when the known Codex UI locale is Traditional Chinese.
- Do not claim the theme was applied; the user completes the import in Codex Settings. After import, tell the user to fully quit Codex from Task Manager and reopen it if closing only the window does not apply the theme.
- Do not invent curated theme values outside `references/themes.json`.
