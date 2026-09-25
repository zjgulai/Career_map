---
name: qoder-cloud-agents
description: Run and manage Qoder Cloud Agents tasks with QCA tools. Use for Agent and Template configuration, cloud conversations, scheduled tasks, and execution results.
---

# Qoder Cloud Agents

Use the available QCA tools. Match the logical tool names below to their discovered names and read the current input schema before calling.

## Choose the workflow

| Task | Workflow | Reference |
| --- | --- | --- |
| Run a custom Agent or one-off task | Managed: Agent + Environment → Session | [Managed workflows](references/workflows.md) |
| Run an Agent on demand or on a schedule | Managed Deployment | [Managed workflows](references/workflows.md#create-and-observe-a-deployment) |
| Start or continue a business assistant conversation | Forward: Template + Identity → Session | [Forward workflows](references/forward-workflows.md) |
| Schedule a Template task for an Identity | Forward Schedule | [Forward workflows](references/forward-workflows.md#forward-schedule-not-managed-deployment) |

Keep existing resources in their original business layer. For Forward, use an actual `identity_id` from application context, the user, or an existing Session/Schedule.

## Run a task

1. Call `list_models` and select a supported model and options. Reuse a suitable Agent/Template and Environment, or create the resources needed for the task.
2. Create a Session with `create_session` or `create_forward_session` in the selected layer.
3. Send the user's message with `send_session_events` or `send_forward_session_events`. Session messages use `user.message` with text content blocks; creating a Session alone does not send the message.
4. Observe Session status and events until completion, failure, cancellation, required input or a deadline. Read final output from `agent.message` events.
5. Report the affected resource IDs, actual state and result. For failures, include the relevant error and request ID.

## Configure and update resources

- Preserve the requested tools, Skills, files, repository mounts and Vault bindings. Inspect existing configuration before updating; supplied arrays may replace all existing entries.
- Create a Deployment or Forward Schedule for recurring tasks. Set its schedule/timezone and initial message; invoke its run tool when an immediate run is requested.
- Inspect state before retrying an uncertain write. Archive or delete only the selected resources when cleanup is requested.

Read [tool calling and results](references/mcp-guide.md) for pagination, message shapes and lifecycle details. Consult the [Managed tool catalog](references/tool-catalog.md) or [Forward tool catalog](references/forward-tool-catalog.md) for operation-specific arguments.
