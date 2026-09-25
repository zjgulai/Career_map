---
name: multi-platform-rpa-execution-new
displayName: 多平台店铺rpa执行
displayDescription: 执行多平台电商 RPA 数据采集，包含抖店/pdd/淘宝/京东/天猫/1688平台的店铺分析类采集任务执行。适用场景：上游提供带标准平台标识（canonical platform keys）的 batch-request.json 或 chat-collection-request.json 时使用；不适用于凭据采集、RPA 工具之外的手动浏览器脚本编写。
description: Executes multi-platform ecommerce RPA data collection, Chat collection, DSL compilation, rolling-concurrency browser RPA, result recording, and legacy-compatible request-level Excel delivery. Use when upstream provides batch-request.json or chat-collection-request.json with canonical platform keys; do not use for credential collection, manual browser scripting outside RPA tools, or legacy orchestration.
---

# Multi-platform RPA Execution New

凡向用户输出“设置 - 账号管理”引导，必须先读取 `../discover-store-accounts/references/merchant-account-management.md`，并按其中的 Agent 回复契约完整展示四步图文教程；同一条回复最多展示一次，不得只给链接或输出插件开发机路径。

> **Python 执行统一口径**：本 Skill 的 Python 脚本均使用 `python3` 工具执行，脚本路径与传参路径先展开为绝对路径。

> **执行状态门禁**：`assemble_dsl_run.py`、`validate_run_results.py`、`rpa_post_process.py` 及所有决定是否进入后续采集、恢复或交付阶段的命令，必须以 `python3 "<pluginRoot>/runtime/shell_execution.py" -- python3 "<目标脚本绝对路径>" ...` 执行。只有外层 envelope 同时满足 `transportStatus=ok`、`processExitCode=0`、`semanticStatus=ok` 才能继续；非零退出、超时、命令不存在，或 child exit 0 但显式返回非 `ok` 语义状态时均停止，不得启动下一批、后处理或交付。工具顶层 `isError=false`、stdout 非空、`loop_end=completed` 或部分产物存在不能覆盖失败。本文后续裸命令只表示 child argv，实际执行仍必须经过上述 Runner。

## DO NOT CONTINUE UNTIL

- You have identified the request type: static `batch-request.json`, Chat `chat-collection-request.json`, compile/validate only, or delivery repair.
- You have loaded the workflow reference for that request type from `Resources`.
- You have run the Python runtime preflight before any online RPA execution.
- You have called one complete `discover_store_accounts` result for the exact current target scope using the upstream-owned non-empty `accountDiscovery.platformIdList` (advertising and static collection: `dsl-run-plan.json`; Chat: `logs/chat-collection-plan.json`), matched every target by `storeAccountId`, verified `storeId` and the collection-platform alias against the same record's `platformId`, and applied the selected accounts' `enable` gate. An unscoped (zero-argument) discovery call is never allowed.
- For merchant-backend collection, you have verified the business page's visible store/account identity matches the requested `storeName`; an `enable=true` account record alone is not sufficient merchant-identity evidence.
- `<run_dir>/logs/run_context.env` contains a valid `RUN_START_ISO` captured before the first browser task.
- You can preserve the legacy-compatible request-level delivery contract under each request-level `raw_data/` directory.

## Purpose

Use this skill as the new execution entry for old `multi-platform-rpa-execution` behavior. It compiles upstream requests into final DSLs, runs browser RPA by task with bounded rolling concurrency, records factual task results, runs deterministic post-processing, and returns legacy-compatible request-level Excel deliverables.

This skill does not collect passwords, cookies, tokens, or verification codes. It does not call legacy orchestration scripts, replace browser RPA tools with local Python automation, or send/modify Chat, order, coupon, product, or account data.

## Decision Points

| Task | Approach | Load |
|---|---|---|
| Run ordinary static platform data collection | Static DSL workflow | [static-dsl-workflow.md](references/static-dsl-workflow.md), then [rpa-execution-rules.md](references/rpa-execution-rules.md), [result-recording-contract.md](references/result-recording-contract.md), [delivery-contract.md](references/delivery-contract.md) |
| Run a static DSL with `filters.productIds` or split more than 10 product IDs | Use the filtered request contract; do not explore alternate batch/filter shapes | [static-dsl-workflow.md](references/static-dsl-workflow.md) §Filtered product-ID batches and [filtered-static-request-example.json](references/filtered-static-request-example.json) |
| Run an advertising-analysis batch containing `ads_*`, `tmall_ads_*`, `pdd_ads_*`, `jd_ads_*`, or `doudian_qc_*` | Static workflow plus advertising gates | [static-dsl-workflow.md](references/static-dsl-workflow.md), then [ads-collection-workflow.md](references/ads-collection-workflow.md), [rpa-execution-rules.md](references/rpa-execution-rules.md), [result-recording-contract.md](references/result-recording-contract.md), [delivery-contract.md](references/delivery-contract.md) |
| Run Chat communication collection from `multi-platform-chat-analysis` | Chat collection workflow | [chat-collection-workflow.md](references/chat-collection-workflow.md), then [rpa-execution-rules.md](references/rpa-execution-rules.md) and [delivery-contract.md](references/delivery-contract.md) |
| Validate or compile only | Stop after deterministic script output | Relevant request schema plus [script-inventory.md](references/script-inventory.md) |
| Confirm platform naming | Use canonical platform keys only | [static-dsl-workflow.md](references/static-dsl-workflow.md) or [chat-collection-workflow.md](references/chat-collection-workflow.md) |
| Repair or verify post-processing output | Delivery review only | [result-recording-contract.md](references/result-recording-contract.md) and [delivery-contract.md](references/delivery-contract.md) |

## Workflow

1. Classify the input request and load the matching workflow reference.
2. Run `../multi-platform-intention-router/scripts/check_python_env.py --json`; it prepares only the pinned Excel wheel group in the dynamically resolved Accio Python `site-packages`. Stop on non-zero exit according to the loaded workflow.
3. For static requests, run `scripts/assemble_dsl_run.py` once and treat its plan as the only source of final DSLs, task IDs, order, and concurrency. If the authoritative Assemble stdout contains any `tasks[].platform == "pdd"`, then before any browser launch run `../multi-platform-intention-router/scripts/check_python_env.py --json -m openpyxl -m xlrd -m PIL -m fontTools` and stop on non-zero exit; PDD post-processing requires both optional modules to decode spider-font values. Do not rely on an upstream preflight to satisfy this Execution-owned gate. When the request contains advertising DSL IDs, load and apply [ads-collection-workflow.md](references/ads-collection-workflow.md) before any browser launch.
4. For Chat requests, run `scripts/orchestration/chat_collect.py plan` and follow its per-store phase plan.
5. Before online RPA, load and follow `../discover-store-accounts/SKILL.md` and `../browser-rpa-launch/SKILL.md`; call account discovery once with the exact upstream-owned non-empty `accountDiscovery.platformIdList` carried unchanged by Assemble or `chat_collect.py plan`, match each target by `storeAccountId`, verify its `storeId` and Profile platform (`doudian` accepts `dy`; a `taobao` collection task with `commercePlatform=tmall` must match `tmall`, while plain `taobao` must match `taobao`), complete the `enable` gate, and pass the matched record's Profile fields to launch. Native `tmall` tasks such as chat must still match `tmall` exactly and run only the tmall chat DSL; never substitute taobao templates. A legacy Tmall task that lacks `commercePlatform` is replayable only when the exact discovery scope is `tmall` alone; an ambiguous mixed Taobao/Tmall legacy plan must be regenerated. Never infer the list here, use an unscoped call, or reuse an earlier broader result. Do not run a separate login Skill or login DSL, and do not call browser tools for offline validation or compile-only tasks.
6. Verify the merchant identity on the actual business page before collection. If the page does not expose an identity that can be matched to `storeName`, pause that store and require user confirmation instead of inferring identity from the account-discovery result.
7. Execute browser RPA as `1 task = 1 DSL = 1 browser_rpa_launch item`, with global active tasks capped by the plan.
8. For advertising runs, inspect each opened page/result before scheduling the next task. An explicit page access denial is a run-level terminal condition: preserve its visible text, stop all pending work, skip retries/post-processing, and tell the user to resolve permission first.
9. Record each non-permission task result factually in the required results JSON; follow each task's assembled `retryPolicy`. Retry ordinary final `failed` tasks once. Core priority tasks may retry up to three times; Alimama advertising downloads may retry up to two times. Both require complete current-task output/download evidence and run isolated during retry.
10. Run deterministic post-processing once after all batches or Chat stores reach terminal status. Post-processing may ingest only files explicitly attributed to the current task in `downloadedFiles` and created or modified within the current run window.
11. When post-processing reports `userDecision.required=true`, report every entry in `blockingFailedTasks` with its Chinese platform/DSL name and impact as a data gap, then continue with whatever deliverables the run did produce and report `partial`. Do not pause for a retry/upload/ignore choice: the per-task `retryPolicy` retries are already exhausted, `skippedOptionalTasks` continues without a choice, and a further recovery pass runs only when the user explicitly asks for one. Stop and report the run as `failed` only when the filesystem enumeration of every `<run_dir>/execution/<requestId>/raw_data/` yields zero workbooks that pass the non-empty data-row check, and even then report the gap list plus the next user action instead of asking for a choice.
12. Validate request-level and root-level Excel delivery paths plus task-level lineage before reporting completion or partial completion.

## Non-negotiable Rules

- Do not call old `multi-platform-rpa-execution` orchestration or post-processing scripts.
- Do not ask upstream for account secrets, browser selectors, URLs, DSL files, `execution-request-plan.json`, single-store `request.json`, `rawDataDir`, cookies, or tokens.
- AccioWork's unified Python environment is the source of xlsx dependencies.
- Do not filter account candidates by `enable` before the target accounts are confirmed. All selected `enable=true` accounts may continue; **all `false` accounts must stop and the agent must immediately read `../discover-store-accounts/references/merchant-account-management.md` to provide full graphic guidance**; for a mixed set, auto-skip the logged-out targets and continue with the logged-in ones without asking and without stopping. Never treat login state as a reason to pause, and never substitute another store of the same platform for a logged-out target the user named.
- Every run requires a non-empty `accountDiscovery.platformIdList` supplied by the upstream Skill (`batch-request.json` / `dsl-run-plan.json` for static and advertising collection, `chat-collection-request.json` / `chat-collection-plan.json` for Chat) and passes it unchanged to `discover_store_accounts`. Execution must not decide, infer, reorder, or remap this list; do not add platforms, query all accounts, or split discovery per store. A missing or empty list is a stop condition. 抖店 always appears as `dy` in that list even though its collection platform key stays `doudian`.
- If an advertising page explicitly reports that the current account lacks access, record `permission_denied:<visible page error text>`, stop the whole run immediately, and relay that page text verbatim. Do not retry, continue another task/store, post-process, generate a report, or offer retry/upload/ignore choices; ask the user to resolve permission first.
- Match a selected account by `storeAccountId`, then verify `storeId` and the collection-platform alias against the same discovery record's `platformId`. Never match or merge accounts by store name or masked `account`.
- Every Profile launch must pass top-level `platformId`, `storeId`, and `storeAccountId` from that one record. Also pass its `platformName`, `name` as `storeName`, and masked `account` for display and diagnostics; keep `items[]` limited to `url`, `dslPath`, and `closeOnFinish`.
- Do not merge multiple DSL tasks into one `browser_rpa_launch` call, even if the tool accepts multiple items.
- That is a packing restriction, not a serialization rule. Up to `plan.maxConcurrency` single-item calls MAY be in flight at the same time, including against one Profile browser. Issue them as parallel tool calls in the same turn; do not wait for one call to return before starting the next unless `plan.maxConcurrency` is 1, the task requires `retryPolicy.mode=isolated`, or a permission-denied stop gate has fired. Serializing an entire plan that allows concurrency is a defect, not a safe default.
- Every advertising task must try its date again on its own page before any read or download. Use the ordered fallback `quick preset -> existing URL date parameters -> exact date picker -> page default`; never invent URL parameters or inherit state from an earlier task. Date-control failure may continue to the next strategy, but the plan and post-processing warnings must preserve that the delivered file's period is unverified or differs from the request.
- Do not reorder assembled tasks, rescan `dsl_elapse.json`, edit materialized DSLs, or add platform/store serialization rules.
- Do not use generic platform login markers as proof of the requested merchant identity. Verify the visible business-page store/account, or pause for user confirmation.
- Take download evidence for `downloadFile` tasks only from the Tool-returned `outputsPath`, using `outputs[<downloadKey>].path`; do not compose, guess, retype, or discover download paths by scanning directories.
- Never scan `~/Downloads`, Desktop, Documents, browser Profile directories, prior request directories, or any shared download location. Do not reuse pre-existing artifacts or files whose modification time predates `RUN_START_ISO` by more than two minutes.
- An empty `downloadedFiles` array is allowed and should be backfilled from `outputsPath`. Only a missing/invalid `outputsPath` or `outputs[<downloadKey>].path` is missing evidence; post-processing must not upgrade such a task to `PASS`.
- Chat export filenames are store-scoped deliverables: use the plan-generated auto-naming command, which passes the current `storeName`; never copy a previous store's `jsonOut/xlsxOut`. Recording and raw collection must fail when a filename does not contain its storeName or an output path is reused across stores.
- Do not describe partial or missing data as full success.
- `requests[].deliveryFiles` and `deliveryCount` are per-call increments, not the delivery set. Enumerate `<run_dir>/execution/<requestId>/raw_data/` on the filesystem for every delivery list and count, compare against the pre-rerun baseline (count may only grow), and exclude `-2`/`-3` collision copies from root `raw_data/`.
- Run `rpa_post_process.py` at most twice per `run_dir` (first pass plus one explicitly user-requested recovery pass). Further reruns shrink the declaration instead of restoring it.
- A downloaded workbook counts as delivered only after a non-empty data-row check; keep empty workbooks in `raw_data/` but report them as that DSL's data gap. Byte size is not emptiness evidence.
- Never present a permission-class failure (`NO_PERMISSION` / `permission_denied:` / an on-page authorization notice) as retryable: state plainly that a retry cannot fix it, name the concrete authorization path, and report it as a data gap instead of asking the user to choose an action.
- `RUN_START_ISO` must predate the first `browser_rpa_launch` and must never be rewritten after browser tasks start; a later value fails the whole run and cannot be healed by a rerun.
- After automatic retries are exhausted, never silently drop a failed DSL and never pause for a user choice about it. For an advertising request with a validated `taskRequirement`, record optional failures in `skippedOptionalTasks` and required failures in `blockingFailedTasks`. Without that explicit policy, treat every remaining failed task as a declared data gap: record it in `blockingFailedTasks`, relay it in the run report, deliver what the run did produce, report `partial`, and leave the per-store go/no-go decision to the upstream Skill.
- Do not interpret advertising metrics, allocate missing spend, compare channel efficiency, or generate optimization conclusions. Preserve files and evidence for `multi-platform-ads-analysis`; analysis belongs to that Skill.
- Advertising tasks are read-only collection only. Reject any request or DSL that creates, deletes, starts, pauses, or changes campaigns, keywords, creatives, audiences, budgets, bids, or target ROI before browser launch, even if an upstream plan contains it.
- Alimama download tasks must use the assembled 13-digit Unix-millisecond timestamp report name, poll that exact row until `生成成功`, and download only from that row. Keep `requestId` for local request isolation only; do not write it into the platform report name. A fixed sleep, the first task row, or a generic first `下载` button is not acceptable evidence.

## Resources

- [static-dsl-workflow.md](references/static-dsl-workflow.md): ordinary `batch-request.json` input, assemble, batch order, concurrency, retry, and post-process workflow.
- [ads-collection-workflow.md](references/ads-collection-workflow.md): advertising DSL recognition, read-only surfaces, ordered date fallback, period evidence, serial execution, file-role evidence, and partial-status semantics.
- [chat-collection-workflow.md](references/chat-collection-workflow.md): dedicated Chat request flow, state semantics, and read-only collection constraints.
- [rpa-execution-rules.md](references/rpa-execution-rules.md): account discovery, login-state gate, Profile launch payload, rolling concurrency, retry, and browser RPA gotchas.
- [result-recording-contract.md](references/result-recording-contract.md): `dsl-run-results.json` schema, status mapping, output evidence, and download attribution.
- [delivery-contract.md](references/delivery-contract.md): post-processing command, exit codes, final directory layout, and report requirements.
- [script-inventory.md](references/script-inventory.md): public and auxiliary script inputs, outputs, side effects, dry-run support, `--help` expectations, and black-box usage notes.
- [contract/batch-request.schema.json](references/contract/batch-request.schema.json): static batch request schema.
- [filtered-static-request-example.json](references/filtered-static-request-example.json): canonical static request showing one store and 19 product IDs split into 10+9 filtered batches.
- [contract/chat-collection-request.schema.json](references/contract/chat-collection-request.schema.json): Chat collection request schema.
- `references/dsl/**` and [dsl_elapse.json](references/dsl_elapse.json): script-consumed DSL specs, templates, manifests, and duration hints; do not edit during execution unless the task explicitly targets DSL maintenance.

## Output Contract

For each run report:

- Overall status: `complete`, `partial`, `waiting_for_user`, or `failed`.
- Counts of successful, partial, timed-out, failed, and missing-evidence tasks.
- Request-level delivery directories under `<run_dir>/execution/<requestId>/raw_data/`.
- Root summary directory `<run_dir>/raw_data/`.
- Static reports: paths to `dsl-run-plan.json`, `dsl-run-results.json`, `rpa-post-process-result.json`, and `logs/raw_collect_v2_report.json` when they exist.
- For remaining static DSL failures: `failedTasks`, blocking subset `blockingFailedTasks`, automatically skipped subset `skippedOptionalTasks`, and the `userDecision` gap list relayed as a report rather than as a question.
- Every `remediationNotices[]` entry, relayed verbatim. `reason: "lyone_not_enabled"` means 店铺经营核心日报 failed or exported no dated rows and the merchant must enable 生意参谋 lyone 自助取数.
- Chat reports: paths to `logs/chat_collect_result.json` and `logs/chat_raw_collect_report.json` when they exist.
- Warnings that preserve the factual blocker, original error category, and next user action.

> 弹窗防御（离线烘焙、固化产物）：各平台进入页 goto 的弹窗关闭 after 已固化——taobao/tmall 写在 `references/dsl/chat/*chat-*.template.dsl.json` 的 goto 内，jd/pdd/doudian/1688 写在 `references/dsl/chat/hooks-baked/<platform>-entry-goto.json` 并由运行时 `chat/baked_gotos.py` 加载（运行时零依赖；片段缺失静默降级为无 after 的裸 goto，不阻断采集）。**新增/升级弹窗规则时，用外部 `rpa-dsl-hook-converter` skill 重新烘焙这些片段/模板**；本仓库不内置 convert_hooks/hooks.json。

Stop and report the exact stage, action, original error, and next step when a preflight, account login-state check, compile, launch, result validation, or post-processing gate fails in a non-recoverable way.

## Examples

- Static partial run: classify `batch-request.json`, assemble once, execute batches in order, apply each task's assembled retry policy in-batch, run post-processing, then report `partial` when `recoveryTaskIds` remains or delivery evidence is missing.
- Chat waiting run: classify `chat-collection-request.json`, plan stores, auto-skip logged-out stores as `login_failed` without asking, pause a store with `waiting_for_user` only when its merchant identity cannot be confirmed, keep other terminal store facts in `chat_collect_result.json`, and report the exact user action needed.

## Edge Cases

- Missing or invalid request: stop before browser or post-processing work; report schema or file-path errors.
- Python preflight exit `1`: report `sitePackages` and `baseDirs`, then ask the user to update the Accio client.
- Python preflight exit `2`: report incomplete plugin installation; do not attempt package installation.
- Some selected accounts have `enable=false`: if every selected account is false, stop the process and **immediately read `../discover-store-accounts/references/merchant-account-management.md`** to provide full graphic guidance; if results are mixed, auto-skip the logged-out targets, list the skipped and the continuing records in one progress line, record each skipped target as a `login_failed` login gap, and launch the logged-in targets immediately. Never pause or ask for a choice because of login state.
- Post-processing exit `3`: keep current deliverables, relay `userDecision.message` as the data-gap list, and continue to delivery validation with `partial`. Do not wait for a user choice; rerun only `recoveryTaskIds` when the user explicitly asks for a recovery pass.
- Download evidence exists but was not ingested: say the file is downloaded and being backfilled; do not call it collection failure before running the delivery checks.
- `store_core_daily` / `tmall_store_core_daily` failed, or its export has only a header/all-NULL row with no `统计日期` value: the account most likely has not enabled 生意参谋 lyone 自助取数, and retries cannot fix it. Report the failure together with the verbatim notice `本次分析依赖lyone的数据，请check下是否开通。具体链接https://sycm.taobao.com/adm/v3/micro/auto_analysis/datafetch/create ，升级使用免费版即可。开通后等待24小时后数据才会同步！`, and never present the all-0 metrics derived from that empty export as real business data.
