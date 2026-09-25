---
name: aily-cli-task
version: 1.6.1
description: 派发、跟踪、评论、交付 Aily 平台结构化任务（task / 工作项 / TASK-编号 / 我的任务 / 今天的工作）。用于「建任务 / 创建任务 / 派单给某 agent / 看任务进展 / 给任务加评论 / 完成任务」，以及多轮接力推进同一目标（`--kind continuous`，如盯合同到签约）。**「让另一个 agent 帮我做 X 并回报」这类跨 agent 委派也走这里**——用 `task create --assignee <agent>` 派单并跟踪结果。**「建任务」默认走这里，不是飞书 lark task（另一套系统）**；只有用户明确说「飞书任务」才用 lark。**另注意：管理已有的定时任务 / 每日提醒 / 闲时执行（idle-execution）→ 走 `aily-cli auto`（定时任务是 autopilot，不是 task）；「任务名称为 X」这类措辞里的「任务」常指定时任务，别当成同名 task 去 `task list` 按名字搜。**
---

# aily-cli-task

输出默认就是 JSON。完整命令清单 `aily-cli task --help` 自查。

> **⚠️ scope 边界**——定时 / 未来 / 事件类诉求先分流，判据是「下一轮要不要上一轮的结果」：
> - "收到邮件 / 消息 / 评论时做 X"（平台事件触发）→ `aily-cli auto create --trigger-type event`（auto-event 子技能）
> - 未来某刻 / 定时执行且**每轮独立**（"明天做 X"、月度备份、独立提醒）→ `aily-cli auto`（auto-schedule 子技能）
> - **多轮接力推进同一目标、下一轮需要上一轮结果**（盯进展、追踪派出事项、增量报告）→ 本工具 `--kind continuous`（见「周期任务」）
> - 当下做一次就完 → 本工具，默认 oneshot
> - "建任务 / 创建任务"默认用 **aily-cli task**（Aily 平台任务），**不是**飞书 lark-cli task（另一套系统）；只有用户明确要"飞书任务"才用 lark-cli。

## 两类工作

这个域只有两类工作，按**你现在在做什么**对号入座：

| 你在做的事 | 看哪节 | 一句话 |
|---|---|---|
| **创建任务**：发起一个新任务、跟踪进度、收结果、改派（在 shell / 别的 agent / 用户对话里发起） | [创建 / 派发任务](#创建--派发任务)、[跟踪 / 收结果](#跟踪--收结果) | 你显式传 task-id；只需 `AILY_CLI_WORKSPACE_ID` |
| **执行任务**：推进一条已经派给你的 task（读上下文 → 干 → 交付 → 退出码） | [执行一个任务](#执行一个任务) | 命令里直接用 `$AILY_CLI_TASK_ID` / `$AILY_CLI_TASK_RUN_ID` |

两类工作会叠加：执行一个任务时，你也可以**创建**子任务来并行分解（见[拆子任务](#拆子任务并行)）——那一刻你就在做"创建任务"，照创建那节即可。

## Core Concepts

### 资源关系图

```
Workspace (workspaceId, env: AILY_CLI_WORKSPACE_ID)
└── Task (taskId；执行任务时命令里用 $AILY_CLI_TASK_ID)
    │   字段：title / description / status / assigneeType+id / creatorType+id
    │        parentTaskId / subTaskCount
    │        kind (oneshot|continuous) / intervalSeconds / nextRunAtMs — 周期任务调度三件套，见「周期任务」
    │
    ├── Run (runId；执行任务时命令里用 $AILY_CLI_TASK_RUN_ID)
    │   字段：status / attemptNo / executorAgentId (只能是 agent)
    │         summary / usageJson / errorReason / startedAtMs / endedAtMs
    │   └── Comment (commentId)
    │       字段：type / actorType+id / content / mentions[]
    │
    ├── SubTask (Task)               ← parentTaskId 反指，深度上限 5
    │
    └── Dependency edge (dependencyId)  ← DAG，不能成环
        blockingTaskId → blockedTaskId
```

### 状态值

Task 和 Run 用**两套不同**的状态值，别混：

| 资源 | 状态值 |
|---|---|
| **Task** | `todo` · `in_progress` · `in_review` · `blocked` · `done` · `cancelled` |
| **Run** | `queued` · `running` · `completed` · `failed` · `cancelled`（另有 `paused` / `expired`） |

- Run **没有** `done` / `in_progress` / `in_review` / `blocked`——那是 Task 的值。`task run list --status` 要用 Run 的值：写 `--status done` 查不到，应写 `--status completed`；写 `--status in_progress` 查不到，应写 `--status running`。

### Actor / 身份

| 字段 | 取值 | 说明 |
|---|---|---|
| `actorType` / `creatorType` | `user` 或 `agent` | 多态身份 |
| `assigneeType` | `agent` / `agent_team` | CLI 创建 / 改派 task 时使用；team 写作 `agent_team`，不是 `team` |
| mention 写在评论正文 | `<at id="a-2" type="agent">研发</at>` | 用 `<at>` 标签写在正文里唤起对方 |
| **Run executor** | **只能 `agent`** | `executorAgentId` 字段，不接受 user / team |
| `task create --assignee-type` / `update --assignee-type` | `agent\|agent_team`；不传按 `agent` 处理 | create / update 的 CLI 指派类型入口 |

### ID 约定

所有 id（`taskId` / `runId` / `commentId` / `dependencyId` / `workspaceId`）都是 **系统生成的 opaque string**，**没有固定前缀约定**——不要假设格式，从 API 响应里取原值传回去。

### env 速查

| 变量 | 含义 | 哪里有 |
|---|---|---|
| `AILY_CLI_WORKSPACE_ID` | 当前 workspace（每条命令都需要） | 一直需要；缺失则命令报错并提示 `export AILY_CLI_WORKSPACE_ID=...` |
| `AILY_CLI_TASK_ID` | 当前 task | 执行任务时才有；创建 / 派发任务时通常没有，自己显式传 task-id |
| `AILY_CLI_TASK_RUN_ID` | 当前 Run id（**每次被唤醒都是新值**，别缓存） | 执行任务时才有 |

- 创建 / 派发任务时（env 里没有上面两个）→ `export AILY_CLI_WORKSPACE_ID=...`。
- task-id / run-id 位置参数 **optional**（缺省从 `$AILY_CLI_TASK_ID` / `$AILY_CLI_TASK_RUN_ID` 取）的有：`task run list` / `task run get` / `task comment list`；其余子命令（`get` / `update` / `subtasks` / `dependency` / `interaction`）的 `<task-id>` 是**必填位置参数**，没有 env fallback。

---

## 创建 / 派发任务

发起一个新任务、跟踪它、收结果、改派——在 shell / 别的 agent / 用户对话里发起。需要 `export AILY_CLI_WORKSPACE_ID=...`，其他命令默认就够。

### 创建

```bash
aily-cli task create \
  --assignee BackendAgent \                # 必填；agent / agent_team 的 id
  --assignee-type agent \                  # 可选；agent|agent_team；不传按 agent 处理
  --parent <parent-task-id> \              # 可选；建子任务，深度上限 5
  --depends-on "t_up1,t_up2" \             # 可选；CSV 列上游 task ids，未完成则任务直接进 blocked
  --kind continuous \                      # 可选；oneshot(默认)|continuous，见「周期任务」
  --interval 4h \                          # 可选；仅 continuous；节奏 5m/4h/7d(范围 5min~7d)
  --description "..."                      # 必填；多行/Markdown 用 --description-file 或 --description-stdin（见下方「转义」说明）
```

- 记响应里的 `task.taskId`，后续命令都用它。
- 创建 task 必须指定执行方。默认把 `--assignee` 当 agent id；目标是 agent team 就加 `--assignee-type agent_team`。要切类型也可走 `task update --assignee-type`。
- **多行 `--description` 转义**（`create` / `update` 同款）：**绝不写 `--description "...\n..."`**——双引号里的 `\n` 是字面量、不换行，CLI 会直接 `exit 2` 拦截。三条正确写法：
  - **Windows / PowerShell / 通用稳妥写法 → `--description-file`**。先写 UTF-8 文件，再让 CLI 读文件，避免 PowerShell 5.1 的 stdin code page 把中文写坏：
    ```powershell
    $desc = Join-Path $PWD ".aily-task-description.md"
    @'
    目标：汇总本周各组进展并产出报告

    步骤：
    1. 拉取本周数据
    2. 生成报告并交付
    '@ | Set-Content -LiteralPath $desc -Encoding UTF8
    aily-cli task create --assignee XxxAgent --description-file $desc
    ```
  - **POSIX 多行 / Markdown → `--description-stdin`**（verbatim、零转义）。用 heredoc 时 **`--assignee` 等所有其它 flag 必须写在 `--description-stdin <<'EOF'` 之前**——`EOF` 之后的内容会被 shell 当成另一条命令、描述静默截断：
    ```bash
    aily-cli task create --assignee XxxAgent --description-stdin <<'EOF'
    目标：汇总本周各组进展并产出报告

    步骤：
    1. 拉取本周数据
    2. 生成报告并交付
    EOF
    ```
  - **POSIX 短单行 → ANSI-C 引用 `$'...'`**：`--description $'第1行\n第2行'`（`\n` 展开成真实换行）。
- `@` 提及 agent 同 comment：正文写 `<at id="<agent-id>" type="agent">显示名</at>`，裸 `@` 不唤起。

### 改派 / 取消

```bash
aily-cli task update <task-id> --assignee NewAgent --assignee-type agent   # 改派 + 切类型
aily-cli task update <task-id> --status cancelled                          # 取消；--status 取 todo|in_progress|in_review|blocked|done|cancelled 之一，服务端校验流转
```

- `update` 可改 `--title / --description[-stdin] / --assignee / --assignee-type (agent|agent_team) / --status (todo|in_progress|in_review|blocked|done|cancelled，服务端校验流转) / --kind continuous / --interval / --next`，至少传一个。oneshot 升 continuous 走这里（见「周期任务」；反向 continuous→oneshot 服务端拒绝）。
- 取消原因另行说明（`--status cancelled` 不接 `--reason`）。
- **改派只对非终态任务有效**：只有**真实的 assignee 变更**才会起新 Run（改派回同一个 agent 是 no-op，不会重跑）；任务已是终态（`failed` / `done` / `cancelled`）则系统拒绝起 Run（`cannot queue run for terminal task`）。终态任务要重跑只能**另起一个新任务**。

## 跟踪 / 收结果

```bash
aily-cli task get <task-id>
aily-cli task list --assignee <uid> --status todo,in_progress   # list flag 见下
aily-cli task subtasks <task-id>                # 只列一层；要全树自己递归
aily-cli task comment list <task-id>
aily-cli task run list <task-id>                # Run 历史，排查失败 / 看重试 lineage
aily-cli task dependency list <task-id>         # 默认 --direction blocked_by（谁挡着我）
```

- `list` flag：`--status / --assignee / --creator / --keyword / --sort-by / --order / --parent / --page-size / --page-token`；`--keyword` 是 title+description 全文模糊，`--order asc|desc`（默认 desc）。分页用 cursor（`page_token`），不是 page 数。
- **结果只在 comment 里**，stdout / 日志不算：`task comment list <task-id>` 列全部评论。产物通过 resource center 自动关联，无需手动挂载。详见 `references/aily-cli-task-comment.md`。

### 排查失败 / 重试

任务失败不靠 stdout 判断，靠 Run lineage：

```bash
aily-cli task run list [task-id] --status failed   # 看每次失败的 errorReason（task-id 省略则取当前 task）
aily-cli task run get  [task-id] [run-id]          # 单条 Run 的 errorReason / errorMessage / summary（均省略则取当前 task+run）
```

- 退出码 ≠ 0 的执行会被标记 Run `failed`；失败明细看 `errorReason` / `errorMessage`（执行失败前一般也会在交付结果里说明原因）。
- `attemptNo` 是服务端给的重试 lineage（同一 task 出现多个 Run 说明重试过）。**是否重试、重试几次由服务端策略决定**——CLI 不暴露 `max_retries` flag，也没有 `task run restart` 命令。

---

## 执行一个任务

当你被起来执行一条已派给你的 task 时：一次启动 = 一条 Run，命令里用 `$AILY_CLI_TASK_ID` / `$AILY_CLI_TASK_RUN_ID` 指代当前 task / run。流程是**读上下文 → 干活 → 交付 → 用退出码收尾**。

**收尾只认退出码**（不要也无法用 CLI 改 Run 状态，`task run` 没有写操作）：`exit 0` → 这条 Run 标记 `completed`；`exit ≠ 0` → `failed`。

### 读上下文

```bash
aily-cli task get "$AILY_CLI_TASK_ID"
aily-cli task comment list "$AILY_CLI_TASK_ID"
```

### 干活

通用工具自由组合（bash / 文件 / 代码 / web / MCP）。中间进度走 reasoning，不单独发评论——本轮结果统一一次交付（见下「交付」）。

### 拆子任务并行

需要并行分解时，创建子任务后**直接 `exit 0`**，不要在原进程同步等：

```bash
aily-cli task create --parent "$AILY_CLI_TASK_ID" --description "..." \
  --assignee XxxAgent                 # 可选 --assignee-type agent|agent_team
# ... 派多个 ...
exit 0
```

`exit 0` 后这条 Run 记 `completed`；父 Task 还有未完成子任务时留在 `in_progress`，子任务全部终态后系统开**新 Run**（新进程、新 `$AILY_CLI_TASK_RUN_ID`）把你重新叫起来收尾。父子树深度上限 5，详见 `references/aily-cli-task-hierarchy.md`。

### 交付

**交付动作本身（把结果 / 产物发给用户、抛决策点）由任务执行说明里的工具完成**（结果交付 / 决策点），不通过 `task` 子命令。终端 print **不算交付**。

读取交付结果用 `task comment list`：结果以 comment 形式落在 Timeline（详见 `references/aily-cli-task-comment.md`）。

### 收尾

| 场景 | 怎么做 | Task / Run |
|---|---|---|
| 正常完成（叶子 task） | 用结果交付工具提交结果并标记完成（`status=done`，交付即收尾，见任务执行说明的结果交付）→ `exit 0` | Task done · Run completed |
| 派完子任务等唤醒 | 直接 `exit 0`（**别原地 sleep 等**） | Task in_progress · Run completed，子任务全终态后开新 Run 叫你收尾 |
| 失败 | 先在交付结果里说明原因，再 `exit ≠ 0` | Run failed · Task 由系统决策 |

遇到需要 user 决策的节点不要硬猜——按任务执行说明 `<ask-decision>` 章节的调度规则（何时出 / 何时不出 / 表单写法）把决策点送给 user，抛出后 `exit 0` 等 user resolve 触发新 Run，**不要 busy-loop poll**。管理已有决策点（读取 / resolve / skip）见 `references/aily-cli-task-interaction.md`。

## 周期任务（continuous）

`--kind continuous` = 同一目标跨多次 Run 接力推进，**判据：下一轮 Run 需要上一轮的结果作上下文**（盯合同到签约、追踪派出事项、需引用上期进展的增量报告），区别于 oneshot（做完即关）。到 `nextRunAtMs` 自动起新 Run，不用你手动触发下一轮。

```bash
aily-cli task create --description "跟进到签约" \
  --assignee BackendAgent --kind continuous --interval 4h     # create 不收 --next，首轮按 interval 起
aily-cli task update <task-id> --interval 5m --next 5m        # 改节奏：--interval 改以后节奏，--next 让新节奏即刻从现在生效
aily-cli task update <task-id> --next 30m                     # 只挪下一次、不改节奏（仅 update）
aily-cli task update <task-id> --kind continuous --interval 4h  # oneshot 升 continuous（反向 continuous→oneshot 服务端拒绝）
```

- `--interval`（create/update）/ `--next`（仅 update）用人类单位 `5m`/`4h`/`7d`（范围 5min~7d）。`--interval` 只改以后每轮的节奏，**不会重排已排好的下一次唤醒**；稳态每轮跑完自动按当前 `interval` 顺延，不用手设 `--next`。**但用户要求改节奏（尤其改快）时 `--interval` 必须配 `--next` 一起传**（如 `--interval 5m --next 5m`），否则新节奏要等旧节奏那拍到点才生效。
- **想"等下一拍"时别提前收尾**（别用结果交付工具的 `status=done`，也别 `update --status done`）：那是"真的收尾"，会停掉调度（之后只能靠用户留评论 reopen）。只想等下次就别动状态，靠 `interval` 自动顺延。
- **两类易混场景不要建 continuous**：①**事件监控**（"收到邮件 / 消息 / 文档评论时做 X"）→ `aily-cli auto create --trigger-type event`（见 auto-event 子技能），轮询只会每轮空转；②**定时重复但每轮独立**（月度备份、每期独立的周报）→ `aily-cli auto`（cron/interval），用不上 task 的跨轮记忆。
- 执行周期任务的每一轮：先 `task comment list` 翻历史（优先看上次重点，别重复做）→ 看是到点还是用户评论触发 → 干这轮的活 → 交付本轮进度（见任务执行说明的结果交付）→ 再决定收尾（`status=done`）还是留给下次。

## 决策树（深入看哪份）

| 场景 | 看哪份 reference |
|---|---|
| 读取评论 / 交付物（按 `type` 区分） | `references/aily-cli-task-comment.md` |
| 父子任务（subtask）：`--parent` / `subtasks <id>` / 5 层上限 | `references/aily-cli-task-hierarchy.md` |
| 任务依赖（DAG）：`dependency {add, list, remove}` | `references/aily-cli-task-dependency.md` |
| 管理已有决策点：`interaction {get, list, resolve, skip}`（抛决策点用任务执行说明里的工具） | `references/aily-cli-task-interaction.md` |
| 看 Run 列表 / 单条 Run 详情 | `references/aily-cli-task-run-list.md` · `references/aily-cli-task-run-get.md` |
| 普通 / 周期 / 定时 / 事件类诉求选型（oneshot vs `--kind continuous` vs `aily-cli auto`） | 见上「scope 边界」+「周期任务」 |
| 容易踩的坑 | `references/aily-cli-ta[REDACTED].md` |

> **树还是图？** 最高频的概念混淆：**父子（subtask，hierarchy）** 是树——一个父多个子、子之间不互相阻塞、全部子终态后系统开新 Run 唤醒父来收口；**依赖（dependency，DAG）** 是图——上游挡下游、上游 done 后下游自动从 `blocked` 放出。要"分解一个大活" → subtask；要"A 必须等 B 先完成" → dependency。二者**可叠加**（子任务之间也能用依赖排序）。

## 完整命令树

```
aily-cli task
├── list / get / create / update <id> / subtasks <id>
├── run         {list, get}                                             ← 只读，看 Run 列表 / 单条 Run
├── comment     {list}                                                  ← 只读，看评论 / 交付物
├── dependency  {add <task-id> <blocking-id>, list <id>, remove <task-id> <dep-id>}
└── interaction {get, list, resolve, skip}                              ← 管理已有决策点（读取 / resolve / skip）
```

**`aily-cli task run` 只有 `list` 和 `get`**（只读）：Run 的终态由执行退出码决定，CLI 不暴露 Run 的写操作，别去捏 RPC 改 Run 状态。`$AILY_CLI_TASK_RUN_ID` 在执行任务时只读，用来把 comment 绑到当前 Run 或喂给 `task run get` 查 Run 详情。

## 幂等性

所有写类命令（create / update / dependency add|remove）自动带请求去重 id；同一条命令短时间重放回到同一结果，安全可重试。Run 状态写入由系统按退出码驱动，不走 CLI。
