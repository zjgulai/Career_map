---
name: "finishing-a-development-branch"
title: "分支收尾"
description: "实现完成后的分支收尾：跑全量测试、探测仓库或 worktree 环境，再选本地合并、开 PR 或保留。触发词：分支收尾、finishing-a-development-branch、实现完成后的分支收尾：跑全量测试、探测仓库或 worktree 环境，再选本地合并、开 PR 或保留。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# 收尾一个开发分支

## 概述

**核心原则：** 校验测试 → 探测环境 → 给出选项 → 执行选择 → 清理。

**开始时先声明：** "I'm using the finishing-a-development-branch skill to complete this work."

## 第 1 步：校验测试

跑项目的完整测试套件（`npm test` / `cargo test` / `pytest` / `go test ./...`）。

**如果测试失败**，把失败报出来并停下 —— 菜单要在套件转绿之后才出现：

```
Tests failing (<N> failures). Must fix before completing:

[Show failures]
```

**如果测试通过：** 继续第 2 步。

## 第 2 步：探测环境

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
# Capture now, while still inside the workspace — Step 5 changes directory
# before cleanup (Step 6) needs this value
WORKTREE_PATH=$(git rev-parse --show-toplevel)
```

这决定了要展示哪一套菜单，以及清理该怎么做：

| 状态 | 菜单 | 清理 |
|-------|------|---------|
| `GIT_DIR == GIT_COMMON`（普通仓库） | 标准 3 个选项 | 没有 worktree 需要清理 |
| `GIT_DIR != GIT_COMMON`，命名分支 | 标准 3 个选项 | 依据来源判定（见第 6 步） |
| `GIT_DIR != GIT_COMMON`，detached HEAD | 精简 2 个选项（不含合并） | 由外部管理 —— 原样保留 |

## 第 3 步：确定基础分支

基础分支就是这次工作分叉出来的那个分支 —— 通常在计划、对话或分支的上游里有明确记载。如果还不清楚，就问："This branch split from <your best guess> - is that correct?" 合并之前必须确认：合错了基础分支，收拾起来的代价很高。

## 第 4 步：给出选项

**普通仓库与命名分支的 worktree —— 只给这 3 个选项：**

```
Implementation complete. What would you like to do?

1. Merge back to <base-branch> locally
2. Push and create a Pull Request
3. Keep the branch as-is (I'll handle it later)

Which option?
```

**detached HEAD —— 只给这 2 个选项：**

```
Implementation complete. You're on a detached HEAD (externally managed workspace).

1. Push as new branch and create a Pull Request
2. Keep as-is (I'll handle it later)

Which option?
```

按原文原样给出菜单 —— 简洁，且每个选项都出自上面这份清单。丢弃成果只发生在你的协作人明确要求时（见下文「如果你的协作人要求丢弃成果」）。等他们答复；整合方式由他们决定。

## 第 5 步：执行选择

### 选项 1：本地合并

```bash
# Get main repo root for CWD safety
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"

# Merge first — verify success before removing anything
git checkout <base-branch>
git pull
git merge <feature-branch>

# Verify tests on merged result
<test command>
```

如果合并结果上测试失败：停下，把 worktree 与分支原样留在原地，开始排查 —— 还没有推送任何东西，所以这次合并是本地的、可回退的。

合并结果转绿之后：先清理 worktree（第 6 步），再删分支：

```bash
git branch -d <feature-branch>
```

### 选项 2：推送并创建 PR

```bash
git push -u origin <feature-branch>
# From a detached HEAD, name the new branch on the remote:
# git push origin HEAD:refs/heads/<new-branch>
```

然后用托管平台的工具（有 CLI 就用 CLI，否则用多数平台在你推送时会打印出来的创建 URL）针对 <base-branch> 创建 pull/merge request；仓库里若有 PR 模板与约定就照着来，并把 URL 报给你的协作人。

保留 worktree —— 你的协作人会在这里按 PR 反馈迭代。

### 选项 3：原样保留

回报："Keeping branch <name>. Worktree preserved at <path>."

### 如果你的协作人要求丢弃成果

这条路径只在收到「把成果扔掉」的明确请求时才存在。先确认：

```
This will permanently delete:
- Branch <name>
- All commits: <commit-list>
- Worktree at <path>

Type 'discard' to confirm.
```

等这句一模一样的确认。收到后：

```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
```

然后清理 worktree（第 6 步）并强制删除分支：

```bash
git branch -D <feature-branch>
```

## 第 6 步：清理工作区

**在选项 1 与已确认的丢弃中执行。** 选项 2 和选项 3 始终保留 worktree。两种调用方都已经切换到主仓库根目录 —— 删除 worktree 必须从 worktree 之外执行 —— 并使用第 2 步捕获的 `GIT_DIR`/`GIT_COMMON`/`WORKTREE_PATH` 值，那是切换目录之前的值。

**如果 `GIT_DIR == GIT_COMMON`：** 普通仓库，没有 worktree 需要清理。结束。

**如果 `WORKTREE_PATH` 位于 `.worktrees/` 或 `worktrees/` 之下：** 这个 worktree 是 Superpowers 创建的 —— 清理由我们负责：

```bash
git worktree remove "$WORKTREE_PATH"
git worktree prune  # Self-healing: clean up any stale registrations
```

**如果删除被拒绝**（`contains modified or untracked files`）：说明这个 worktree 里放着别处不存在的文件 —— 未提交的计划、笔记或草稿。绝不主动 `--force`。把利害关系摆给你的协作人看，然后问：

```bash
git -C "$WORKTREE_PATH" status --porcelain -uall
```

```
Worktree removal refused — these files were never committed:

<file list>

1. Commit them to <branch> before cleanup
2. Move them into <main repo root>
3. Delete them (unrecoverable)

Which?
```

按选择执行，然后再删除 worktree。

**其它情况：** 这个工作区归宿主环境所有 —— 原样保留。如果你的平台提供了退出工作区的工具，就用它。

## 速查表

| 选项 | 合并 | 推送 | 保留 Worktree | 清理分支 |
|--------|-------|------|---------------|----------------|
| 1. 本地合并 | yes | - | - | yes |
| 2. 创建 PR | - | yes | yes | - |
| 3. 原样保留 | - | - | yes | - |
| 丢弃（仅限明确要求） | - | - | - | yes（强制） |

## 常见的自我合理化

| 借口 | 事实 |
|--------|---------|
| "Tests passed earlier this session" | Run the suite on the tree you are about to integrate. A green run only proves the tree it ran on. |
| "They obviously want it merged" | Integration is your human partner's decision. Present the menu and wait. |
| "They seem done with this feature — I'll offer to discard it" | The menu is complete as written. Discard happens only when your human partner asks for it in so many words. |
| "'Yeah, get rid of it' counts as confirmation" | Only the typed word `discard` authorizes deletion. |
| "The PR is up, so the worktree is clutter now" | PR feedback gets fixed in that worktree. It stays until the work lands. |
| "This other worktree looks stale — I'll clean it too" | Clean up only worktrees under `.worktrees/` or `worktrees/`. Everything else belongs to the host. |
| "Removal refused — `--force` is just finishing the cleanup" | The refusal means files exist only in that worktree. `--force` destroys them permanently. Show your human partner and ask. |
| "The merged-result failure is probably flaky" | A failing merged result stops everything. Branch and worktree stay put while you investigate. |
| "The base branch is obviously main" | Confirm the fork point or ask. Merging into the wrong base is expensive to undo. |
| "The push was rejected — force-push will fix it" | A rejected push means the remote moved. Investigate; force-push only on your human partner's explicit request. |
