---
name: aily-cli-agent
version: 0.1.0
description: 查询当前 Aily workspace 中可协作的全部 agent。需要发现同伴、获取 agent ID 或在派发任务前确认目标 agent 时使用。
---

# aily-cli-agent

查询当前 workspace 中可协作的 agent，不按 team 过滤：

```bash
aily-cli agent list
```

workspace 默认取 daemon 注入的 `$AILY_CLI_WORKSPACE_ID`；普通终端可传
`--workspace <workspace-id>`。结果默认是 JSON，从 `members[].agentId` 取得后续
派发任务所需的 agent ID。

只查询启用成员时加 `--enabled-only`。响应有 `nextPageToken` 时，保留首轮的
`--workspace` 和过滤参数，再追加 `--page-token <nextPageToken>`；不能把单页结果
当作 workspace 全集。
