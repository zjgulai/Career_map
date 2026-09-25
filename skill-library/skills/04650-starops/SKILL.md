---
name: starops
description: |
  STAROps is an Agentic Ops / AIOps skill from Alibaba Cloud, delivering capabilities from data queries and diagnostics to continuous protection. Use this skill whenever the user needs to diagnose service or application errors, investigate incidents, analyze root cause, inspect metrics/APM/traces/logs, query service topology, analyze alerts, trace call chains, identify impact scope, or get remediation suggestions through the STAROps Agent.

  Triggers: "STAROps", "AIOps", "SRE", "Ops", "故障排查", "排查根因", "根因分析", "服务报错", "服务异常", "应用异常", "接口报错", "接口超时", "请求失败", "慢请求", "告警分析", "指标异常", "APM 服务", "链路追踪", "调用链", "trace", "span", "日志分析", "服务拓扑", "依赖关系", "事故分析", "故障复盘", "影响面分析", "恢复建议", "k8s诊断", "k8s巡检", "主机诊断", "SLS分析", "告警降噪", "变更守护", "变更分析".
---

# STAROps Agent

Call the Alibaba Cloud STAROps Agent through STAROps OpenAPI from the `starops-qoder` Qoder plugin and receive a streaming diagnostic answer.

## Scenario Description

Use this skill when the user wants to:

- Diagnose service errors or exceptions (root cause analysis)
- Query workspace topology, service lists, or service metrics
- Analyze APM traces, error rates, latency, or request volume
- Triage alerts or investigate incidents
- Ask questions about their STAROps workspace or services

## Configuration

The script reads STAROps connection values from private JSON config files and environment variables. Prefer `~/.starops/config.json` for local setup. Environment variables and command-line flags override config file values when explicitly set.

Run all commands from this skill root directory inside the installed plugin: `skills/starops`.

Config files are loaded in this order:

1. User config: `~/.starops/config.json`
2. Local config: `./.starops/config.json` (overrides user config)
3. Explicit config: `--config <path>` or `STAROPS_AGENT_CONFIG` (overrides user/local config)

The only required STAROps routing value is `employeeId`; it should normally come from the private STAROps config file. Environment variables are supported for temporary overrides.

`workspace` is the optional STAROps workspace. `project` is the optional SLS Project name. When set, both are forwarded as request variables; omit them when the target context is unknown.

| Variable | Required | Description |
|----------|----------|-------------|
| `STAROPS_AGENT_EMPLOYEE` | Yes, unless config provides `employeeId` | Digital Employee ID in STAROps (from console → Digital Employee list → ID column) |
| `STAROPS_AGENT_WORKSPACE` | No | Optional workspace identifier forwarded with each request |
| `STAROPS_AGENT_ENDPOINT` | No | API endpoint (default: `starops.cn-beijing.aliyuncs.com`) |
| `STAROPS_AGENT_PROJECT` | No | Optional SLS Project name forwarded with each request. Overridden by `--project` |
| `STAROPS_AGENT_TIMEOUT` | No | Default value for `--timeout` (CreateChat stream total timeout in seconds; default `1800`) |
| `STAROPS_AGENT_IDLE_TIMEOUT` | No | Default value for `--idle-timeout` (max seconds to wait for the next SSE event; default `60`) |
| `STAROPS_AGENT_CONFIG` | No | Path to an explicit JSON config file loaded after user/local config |

Recommended private config file example:

```json
{
  "employeeId": "<your-digital-employee-id>"
}
```

Optional fields:

```json
{
  "endpoint": "starops.cn-beijing.aliyuncs.com",
  "workspace": "optional-workspace",
  "project": "optional-sls-project",
  "timeout": 1800,
  "idleTimeout": 60
}
```

Config files use the exact key names shown above. Do not use alternate aliases such as `employee`, `digitalEmployeeId`, or `workspaceName`.

Private config files may also include direct credentials. This is the preferred local credential setup. The script uses these values directly when both `accessKeyId` and `accessKeySecret` are present; otherwise it falls back to the Alibaba Cloud Credentials default chain:

```json
{
  "employeeId": "<your-digital-employee-id>",
  "workspace": "<optional-workspace>",
  "project": "<optional-sls-project>",
  "accessKeyId": "<access-key-id>",
  "accessKeySecret": "<access-key-secret>",
  "securityToken": "<optional-sts-token>"
}
```

Never commit config files containing `accessKeySecret` or `securityToken`, and never ask the user to paste secret values into chat.

**Local setup check — run this before invoking the script to confirm local prerequisites are available:**

```bash
python3 scripts/check_starops_setup.py
```

If the required `employeeId` value is still unavailable, ask the user to provide it. Never substitute placeholder strings like `example-employee`.

The local setup check does not call STAROps OpenAPI. It does not verify credential validity, RAM authorization, or whether the configured `employeeId` can access the specified STAROps workspace / SLS Project. Those failures are reported by the real diagnosis call.

The STAROps console link uses the same digital employee ID as `assistantId`.

Credentials should be provided directly in the private STAROps config file when possible. The Alibaba Cloud Credentials default chain is a fallback for environments that already standardize on CLI profiles, environment variables, RAM roles, or shared SDK credentials. Do not define skill-specific AccessKey environment variables beyond the documented config fields.

Recommended local credential setup: use direct credentials in the private STAROps config file with `accessKeyId`, `accessKeySecret`, and optional `securityToken`.

Alternative: use Alibaba Cloud CLI's standard profile flow. The credentials SDK reads the generated `~/.aliyun/config.json`.

```bash
aliyun configure
```

If the user uses a non-default CLI profile, select it before running setup or diagnosis:

```bash
export ALIBABA_CLOUD_PROFILE="<profile-name>"
```

Alternative: use environment variables directly:

```bash
export ALIBABA_CLOUD_ACCESS_KEY_ID="<access-key-id>"
export ALIBABA_CLOUD_ACCESS_KEY_[REDACTED]"
```

For STS credentials, also set:

```bash
export ALIBABA_CLOUD_SECURITY_[REDACTED]"
```

Alternative: use a credentials SDK profile at `~/.alibabacloud/credentials.ini`:

```ini
[default]
type = access_key
access_key_id = <access-key-id>
access_key_[REDACTED]
```

To select a non-default SDK profile, set `ALIBABA_CLOUD_PROFILE`. The resolved identity must have `starops:CreateThread` and `starops:CreateChat` permissions. Never print or store credential values in plugin files.

## Invocation

**IMPORTANT: The `--pipe` flag is MANDATORY for all invocations.** It ensures structured output with THREAD ID, STAROPS_URL, and delimited answer blocks that downstream agents can reliably parse. Never omit `--pipe`.

Install dependencies and run from this skill's root directory:

```bash
pip3 install -r scripts/requirements.txt
python3 scripts/check_starops_setup.py

# First call - creates a new thread automatically
python3 scripts/call_starops_agent.py --question "<complete user context>" --pipe

# First call with an explicit config file
python3 scripts/call_starops_agent.py --config ".starops/config.json" --question "<complete user context>" --pipe

# Follow-up calls - MUST reuse the thread ID from previous response
python3 scripts/call_starops_agent.py --thread "<thread_id>" --question "<follow-up question>" --pipe
```

**Thread Management:**
- Extract thread ID from output
- Use the printed `STAROPS_URL` when the user needs to inspect the same thread in the STAROps console
- Always pass `--thread "<id>"` for related follow-up questions to preserve context

Example workflow:
```bash
# Query 1: Creates new thread
$ python3 scripts/call_starops_agent.py --question "Query TOP 5 error applications" --pipe
THREAD: thread-abc123-xyz
STAROPS_URL: https://starops.console.aliyun.com/chat?threadId=thread-abc123-xyz&assistantId=apsara-ops
=== STAROPS ANSWER BEGIN ===
...

# Query 2: MUST reuse thread for context
$ python3 scripts/call_starops_agent.py --thread "thread-abc123-xyz" --question "Deep dive into notification app errors" --pipe
```

## Command-Line Options

| Flag | Description |
|------|-------------|
| `--question <text>` | **Required.** Natural-language question to send to STAROps Agent. |
| `--thread <id>` | Existing STAROps thread ID. **Required for follow-up questions** to preserve investigation context. |
| `--pipe` | **Mandatory for agent invocations.** Emit structured output with `THREAD`, `STAROPS_URL`, and `=== STAROPS ANSWER BEGIN/END ===` delimiters for reliable parsing. |
| `--json` | Emit machine-readable JSONL events. Mutually exclusive with `--pipe`. **Do not use for agent invocations** — `--pipe` is the supported agent format. |
| `--config <path>` | Optional JSON config file. Loaded after `~/.starops/config.json` and `./.starops/config.json`. |
| `--project <name>` | Optional SLS Project name. Overrides `STAROPS_AGENT_PROJECT`. |
| `--timeout <seconds>` | Total CreateChat stream timeout in seconds. Overrides `STAROPS_AGENT_TIMEOUT` (default `1800`). |
| `--idle-timeout <seconds>` | Maximum seconds to wait for the next SSE event before failing. Overrides `STAROPS_AGENT_IDLE_TIMEOUT` (default `60`). |

## Local Setup Checker

`scripts/check_starops_setup.py` performs local-only validation:

- Python version and required Python packages.
- STAROps config file existence and JSON shape.
- Required value: `employeeId`.
- Optional context values: `workspace` (STAROps workspace) and `project` (SLS Project).
- Optional timeout and endpoint value shape.
- Direct STAROps config credentials, or Alibaba Cloud Credentials default-chain resolution, without printing credential values.

It intentionally does not create a STAROps thread or send a chat message.

## Behavioral Notes

1. STAROps Agent calls are long-running by design. A single `CreateChat` stream may start multiple internal diagnostic steps and take minutes; the default timeout is 30 minutes.
2. Provide complete context in one question: cloud account, time range, service or application names, alert text, UModel object, region, and what decision the user needs. Configured STAROps workspace and SLS Project values are forwarded as request variables.
3. **CRITICAL: Always reuse `--thread` for follow-ups in the same investigation. Starting a new thread discards all prior context and findings.**
4. Use this skill for Agent reasoning and diagnosis, not direct resource management. For direct ECS, OSS, RDS, SLS, or RAM mutations, use the corresponding official CLI, SDK, or specialized skill.
5. **MANDATORY: Always pass `--pipe`.** Tool-call status and streaming diagnosis-report chunks are written to stderr, while stdout keeps the reusable thread ID and final answer easy to parse. Omitting `--pipe` will produce unstructured output that cannot be reliably evaluated.
6. If no SSE event arrives for a while, the script fails with a clear idle-timeout error instead of silently waiting for the full task timeout. Increase `--idle-timeout` only when the investigation is expected to be quiet for long periods.
7. **Output integrity rule**: Your final report MUST be based on the actual content returned between `=== STAROPS ANSWER BEGIN ===` and `=== STAROPS ANSWER END ===`. Specifically:
   - Quote or paraphrase concrete data points from the STAROps response (HTTP status codes, service names, error paths, metrics).
   - Do NOT infer or fabricate diagnostic conclusions that are not supported by the STAROps output.
   - If the STAROps answer is empty (`(No assistant answer was returned.)`), incomplete, or only contains generic text, retry once using the same `--thread`. If the retry still yields no actionable data, report honestly: "STAROps 未返回有效诊断数据，请确认配置的 STAROps workspace / SLS Project 中，在指定时间范围内存在相关服务数据。"
   - Never substitute your own prior knowledge for missing STAROps evidence. For example, do not claim "database connection pool exhaustion" if STAROps did not mention it.

## Troubleshooting

When the script exits with an error, check the following in order:

1. **HTTP 401 Unauthorized** — The credential chain did not resolve to a valid identity with STAROps permissions. Verify that `ALIBABA_CLOUD_ACCESS_KEY_ID` / `ALIBABA_CLOUD_ACCESS_KEY_SECRET` (or STS / RAM role) are set and that the identity has `starops:CreateThread` and `starops:CreateChat` permissions. See [references/ram-policies.md](references/ram-policies.md).
2. **HTTP 404 Not Found** — The Digital Employee ID (`STAROPS_AGENT_EMPLOYEE`) does not exist, or the optional STAROps workspace / SLS Project context does not match available STAROps data. Double-check the configured employee and optional context values.
3. **ConfigError: Missing required STAROps configuration value** — `employeeId` is missing from both environment variables and config files.
4. **CredentialError** — The Alibaba Cloud Credentials SDK could not find any valid credential source. Ensure at least one credential provider is configured (environment variables, `~/.aliyun/config.json`, STS, RAM role, or instance metadata).
5. **Idle timeout** — No SSE event was received within `--idle-timeout` seconds (default 60). The STAROps Agent may be stalled. Retry with the same `--thread` if a THREAD line was printed, or increase `--idle-timeout` for investigations expected to be quiet.
6. **Stream interruption / network error** — The HTTPS connection was reset or timed out. Retry the same request with `--thread` to resume context.
7. **ModuleNotFoundError** — Python dependency not installed. Run `pip3 install -r scripts/requirements.txt` and then `python3 scripts/check_starops_setup.py` before invoking the script.

## API Surface

This skill directly calls STAROps OpenAPI:

- `CreateThread`: `POST /digitalEmployee/{employeeId}/thread`
- `CreateChat`: `POST /chat`

See [references/api-reference.md](references/api-reference.md) and [references/ram-policies.md](references/ram-policies.md).
