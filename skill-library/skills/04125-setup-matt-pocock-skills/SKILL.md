---
name: "setup-matt-pocock-skills"
title: "技能集仓库接线"
description: "为工程技能集配置仓库（issue tracker/分诊标签/领域文档）。触发词：技能集仓库接线、setup-matt-pocock-skills、为工程技能集配置仓库（issue tracker/分诊标签/领域文档）。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# Setup Matt Pocock's Skills

搭建工程类技能所假定的仓库级配置：

- **Issue tracker**：issues 存放的地方（默认 GitHub；本地 markdown 也开箱即用）
- **Triage labels**：五个标准 triage 角色所用的标签字符串
- **Domain docs**：`CONTEXT.md` 和 ADR 存放的位置，以及读取它们的消费方规则

这是一个提示词驱动的技能，而不是确定性脚本。先探索，展示你的发现，与用户确认，然后再写入。

## 流程

### 1. 探索

查看当前仓库，了解它的起始状态。有什么就读什么，不要想当然：

- `git remote -v` 和 `.git/config`：这是 GitHub 仓库吗？是哪一个？
- 仓库根目录的 `AGENTS.md` 和 `CLAUDE.md`：两者中是否存在任何一个？其中是否已有 `## Agent skills` 章节？
- 仓库根目录的 `CONTEXT.md` 和 `CONTEXT-MAP.md`
- `docs/adr/` 以及任何 `src/*/docs/adr/` 目录
- `docs/agents/`：这个技能先前的产出是否已经存在？
- `.scratch/`：本地 markdown issue tracker 约定已在使用的迹象
- `triage` 技能是否已安装？（与本技能并列的 `triage` 技能文件夹，或者你的可用技能列表里有 `triage`。）这决定 B 部分是否要执行。
- Monorepo 信号：`pnpm-workspace.yaml`、`package.json` 里的 `workspaces` 字段，或者带各自 `src/` 的已填充 `packages/*`。这些信号只出现在真正的大型多包仓库中；没有它们就意味着 single-context（单上下文），而几乎所有仓库都是如此。

### 2. 展示发现并提问

总结哪些已就绪、哪些缺失。然后按顺序处理各部分。一次一个部分、一个答复，然后再进行下一个。

每个部分都以推荐答案开头，让用户一句话就能接受。只有当选择确实存在分叉时才给出一行解释；当探索已经敲定了结论时，就整个跳过该部分（`triage` 未安装时跳过 B 部分，没有 monorepo 时跳过 C 部分）。

**A 部分：issue tracker。**

> 说明：issue tracker 是这个仓库 issues 的存放处。`to-tickets`、`triage`、`to-spec` 等技能会读写它。它们需要知道该调用 `gh issue create`、在 `.scratch/` 下写 markdown 文件，还是遵循你描述的某种其他工作流。请选择你实际跟踪本仓库工作的那个地方。

默认姿态：这些技能是为 GitHub 设计的。如果 `git remote` 指向 GitHub，就提议 GitHub。如果 `git remote` 指向 GitLab（`gitlab.com` 或自托管主机），就提议 GitLab。否则（或用户另有偏好），提供以下选项：

- **GitHub**：issues 存放在仓库的 GitHub Issues 中（使用 `gh` CLI）
- **GitLab**：issues 存放在仓库的 GitLab Issues 中（使用 [`glab`](https://gitlab.com/gitlab-org/cli) CLI）
- **Local markdown**：issues 以文件形式存放在本仓库的 `.scratch/<feature>/` 下（适合单人项目或没有远程仓库的仓库）
- **Other**（Jira、Linear 等）：请用户用一段话描述工作流；技能会把它记录为自由形式的文字

把选择记录到 `docs/agents/issue-tracker.md`。GitHub 和 GitLab 模板带有一个「PRs as a request surface」标志（PR 作为请求入口），默认置为 **off**。保持关闭、不要主动提及：想要外部 PR 进入 triage 队列的用户之后可以自行在文件里打开这个标志。

**B 部分：triage 标签词表。**如果 `triage` 技能未安装（探索阶段已经告诉你），就整个跳过本部分，因为未安装的技能不需要标签。

如果已安装，只问一个问题：

> 你想保留默认的 triage 标签吗？（推荐：**yes**）

默认值是五个标准角色，每个标签字符串与其名称相同：`needs-triage`、`needs-info`、`ready-for-agent`、`ready-for-human`、`wontfix`。回答 **yes** 时原样写入。只有当用户说不时——通常是因为他们的 tracker 已经在用其他名字（例如用 `bug:triage` 代替 `needs-triage`）——才收集覆盖映射，让 `triage` 应用既有标签而不是创建重复标签。

**C 部分：领域文档。**默认采用 **single-context**（仓库根目录一个 `CONTEXT.md` + `docs/adr/`）。这适合几乎所有仓库；直接写入，无需询问。

只有当探索发现了 monorepo 信号时，才提供 **multi-context** 选项（根目录的 `CONTEXT-MAP.md` 指向各上下文的 `CONTEXT.md` 文件）。然后确认他们想要哪种布局。

### 3. 确认并修改

向用户展示以下内容的草稿：

- 要加入被编辑的 `CLAUDE.md` / `AGENTS.md` 的 `## Agent skills` 块（选择规则见第 4 步）
- `docs/agents/issue-tracker.md`、`docs/agents/domain.md`、`docs/agents/triage-labels.md` 的内容（最后一个仅当 `triage` 已安装时）

让他们在写入前修改。

### 4. 写入

**选择要编辑的文件：**

- 如果 `CLAUDE.md` 存在，编辑它。
- 否则如果 `AGENTS.md` 存在，编辑它。
- 如果两者都不存在，询问用户创建哪一个；不要替他们决定。

当 `CLAUDE.md` 已存在时绝不要创建 `AGENTS.md`（反之亦然）；始终编辑已经存在的那个。

如果所选文件中已有 `## Agent skills` 块，就地更新其内容，而不是再追加一份重复的。不要覆盖用户对周围章节的修改。

块内容：

```markdown
## Agent skills

### Issue tracker

[one-line summary of where issues are tracked]. See `docs/agents/issue-tracker.md`.

### Triage labels

[one-line summary of the label vocabulary]. See `docs/agents/triage-labels.md`.

### Domain docs

[one-line summary of layout: "single-context" or "multi-context"]. See `docs/agents/domain.md`.
```

仅当 `triage` 已安装且 B 部分执行过时，才包含 `### Triage labels` 子块并编写 `docs/agents/triage-labels.md`。否则两者都省略。

然后以本技能文件夹中的种子模板为起点，编写文档文件：

- [issue-tracker-github.md](./issue-tracker-github.md)：GitHub issue tracker
- [issue-tracker-gitlab.md](./issue-tracker-gitlab.md)：GitLab issue tracker
- [issue-tracker-local.md](./issue-tracker-local.md)：本地 markdown issue tracker
- [triage-labels.md](./triage-labels.md)：标签映射（仅当 `triage` 已安装时）
- [domain.md](./domain.md)：领域文档消费方规则 + 布局

对于「other」类 issue tracker，依据用户的描述从零编写 `docs/agents/issue-tracker.md`。

### 5. 完成

告诉用户配置已完成，以及现在哪些工程技能会读取这些文件。提一句：他们之后可以直接编辑 `docs/agents/*.md`；只有想更换 issue tracker 或从头重新开始时，才需要重新运行这个技能。
