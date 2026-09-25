---
name: aily-cli-team
version: 0.1.0
description: 列 / 查 / 搜工作空间的团队及其成员。「列团队 / 看某个团队 / 搜团队 / 列团队成员 / 看组织树 / 团队内找 agent」走这里。
---

# aily-cli-team

列 / 查 / 搜工作空间的团队及其成员（团队是 agent 的容器，带 `leaderAgentId`）。输出默认 JSON（`--format table` 给人看）；workspace 取自 `$AILY_CLI_WORKSPACE_ID`，或显式 `--workspace <id>`。

## 团队

```bash
aily-cli team list              # 列工作空间全部团队
aily-cli team get <teamId>      # 单团队详情（含 collaborationGuide）；详情不含成员，成员另用 team member list
aily-cli team search 智能       # 按名/描述筛
```

## 成员

```bash
# 列团队成员
aily-cli team member list --team <teamId>
# 组织树视图
aily-cli team member list --team <teamId> --tree
# 团队内搜 agent（服务端，限定该团队）
aily-cli team member search 投诉 --team <teamId>
```

> `member list` / `member search` 支持翻页（cursor 式，同 task 域，无 page-index）：把上一页返回的 `nextPageToken` 传给 `--page-token`，`--page-size` 设每页条数。`team list / get / search` 不分页（后端一次全返）。
