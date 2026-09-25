---
name: aily-cli-schedule
version: 1.9.0
description: 定时 / 未来时刻由 AI 执行任务：cron 固定时刻（每天 9 点、每周一）、interval 等间隔（每 30 分钟，可限活跃时段）、以及「明天 / 1h 后 / 下周三」这类一次性未来提醒（`--repeat false`）。凡「到点自动跑 / 定时提醒 / 未来某刻做 X」一律走这里，**不要回退到宿主自带的 schedule / cron / at——只有它在本 runtime 可管理可观测**。每轮独立、不依赖上一轮结果——**要跨轮接力上一轮产出（去重 / 累计 / 盯到完成）的改用 `task --kind continuous`（周期任务），不归这里**；纯日历日程（无 AI 执行步骤）也不归这里。也用于**查看 / 修改 / 启停 / 删除已有定时任务**（改时间 / 指令 / 投递对象 / 投递条件、**开启 / 关闭闲时执行（idle-execution）**、「把那个定时任务改成…」）。**「闲时执行」是定时任务(autopilot)专属开关，`aily-cli task` 没有——凡「某个定时任务 / 每日提醒 / 闲时执行」的查改启停都走这里，别去 `aily-cli task` 找。**
---

# 定时自动化任务工具 (aily-cli auto schedule)

`aily-cli auto` 是统一的自动化任务管理 CLI，支持三种触发类型。本 skill 聚焦其中两种：

- **cron** — 固定时间点触发（如每天 8:35、每周一 10:15、每月 1 号 9:00）
- **interval** — 等间隔触发（如每隔 30 分钟、每隔 2 小时），支持 `--active-hours` 限定每天的激活时段

> **⚠️ `aily-cli auto` 是 CLI 命令，必须通过 shell 执行，不能作为 tool 或 MCP server 调用。**

> **CRUD 看动词，不看名词**：「启用 / 停用 / 改 / 删 / 跑 / 看」等动词 + 任务标识表示对已有任务的操作——先 `aily-cli auto list --keyword <片段>` 拿到 autoUid，再按动词对应 `enable / disable / update / delete / run / get`。

> **⚠️ 「取消 / 关掉 / 停掉 / 别再跑了」默认是 `disable`，不是 `delete`**：先停用（可 `enable` 恢复），回报时告知"已停用，要彻底删除再说一声"；只有用户明说「删除 / 删掉 / 清掉 / remove」才 `delete`。`delete` 无恢复命令，删了只能手动重建。

> **⚠️ "关闭 / 开启 X" 先看 X 是任务还是子开关**：X = **整个任务**（"停用/关闭这个任务"）→ `disable/enable`；X = 任务的**某个子开关**（**闲时执行 / 通知 / 投递**）→ 是 `update` 改那个字段，**不是** `disable/enable`。例："关闭闲时执行" = `auto update <id> --idle-execution false`（**不是**停用任务）；"关闭通知" = 改投递 flag。别看到"关闭"就 `disable` 任务。

> **⚠️ 建之前先确认：这真是 auto 吗（每轮独立）？** auto 每次执行**互不携带上一轮结果**。先过一遍：下一轮要用到上一轮的产出吗？（线索：参考上周 / 接着上次 / 对照昨天 / 累计 / 在上次基础上 / 盯着 X 直到…）→ **要 = 这不是 auto，是周期任务**：改用 `aily-cli task create --kind continuous --interval <dur>`（见 task 子技能），别在这建；不要（每轮从零、读固定外部源、独立提醒 / 报表）→ 继续往下。

## 可用工具

| 工具                | 功能                                  | 使用场景                       |
|-------------------|-------------------------------------|----------------------------|
| `create`          | 创建并启用新任务（cron / interval） | 用户需要定时执行的任务              |
| `list`            | 列出任务。`--trigger-type cron`/`interval` 返回**定时任务合集**（server 不分两者），`--trigger-type event` 只返 event，不传则全部一次列出。`--assignee-agent-id [id]` 按归属 agent 过滤：不带值 = 当前 agent（读 `$AILY_CLI_CALLER_AGENT_UID`）；带值 = 指定 agent；**整个 flag 不传 = 不过滤，返回该用户名下所有 agent 的任务** | 查看当前已有的任务 |
| `get <id>`        | 查看单条任务详情                | 检查任务配置                    |
| `update <id>`     | 修改任务的时间、内容、投递、名称等 | 用户要调整已有任务               |
| `enable <id>`     | 启用已暂停的任务                | 重新启用暂停的任务               |
| `disable <id>`    | 暂停任务，保留配置              | 临时停用                        |
| `run <id>`        | 立即执行一次已有任务（仅 cron / interval 支持）| 用户想马上触发某个定时任务 |
| `delete <id>`     | **高风险 · 不可逆**：永久删除任务，无恢复命令，删错只能手动重建。非交互模式必须带 `--yes`，加 `--yes` 前必须已按「注意事项 18」确认作用域 | 用户明说「删除 / 删掉」且已确认范围 |
| `runs`            | 查看运行日志（含静默执行记录）| 检查执行结果或排查失败           |

## 快速开始

```bash
# 每天 9:43 发我一份 AI 行业动态汇总
# （研究/汇总类 + 早高峰发送 + 系统投递 → 开闲时执行：凌晨预跑、到点直推）
aily-cli auto create \
    --trigger-type cron \
    --name "AI 行业动态日报" \
    --cron "0 43 9 * * *" \
    --schedule-desc "每天早上 9:43" \
    --instruction "汇总昨日 AI 行业的重要动态与新闻，整理成简洁日报" \
    --repeat true \
    --notify-self true \
    --idle-execution true

# 每隔 3 小时检查群消息，9:00-19:00 激活
aily-cli auto create \
    --trigger-type interval \
    --name "内部体验群消息巡检" \
    --interval 10800 \
    --active-hours "9-19" \
    --schedule-desc "每天 9:00-19:00 每隔 3 小时" \
    --instruction "检查内部体验群最近 3 小时的关键消息，有未处理反馈时整理摘要"

# 工作日下午 3 点轻量提醒一次
aily-cli auto create \
    --trigger-type cron \
    --name "下午茶提醒" \
    --cron "0 0 15 * * 1-5" \
    --schedule-desc "工作日下午 3 点" \
    --repeat false \
    --instruction "## 轻量提醒：下午茶
该起来活动一下了 ☕"
```

## 命令

```
aily-cli auto create   创建自动化任务
                   --trigger-type STR        类型: cron | interval (必填)
                   --name STR                任务名称 (必填)
                   --instruction STR         执行指令（自然语言）(必填)
                   --agent-id STR            执行 agent ID，可选，缺省=当前 agent（与 --agent-team-id 互斥）。按 agent 名找 agent_uid 见下文「按名找 agent_uid / teamId」3 步
                   --agent-team-id STR       执行 agent-team ID，可选；用户提"团队 / 智能体团队 / 让 X 团队跑"时传（与 --agent-id 互斥）。teamId 用 `aily-cli team list --json` 的 `teamId` 字段查
                   --cron STR                6 字段 cron 表达式 (trigger-type=cron 时必填)
                   --interval N              间隔秒数，最小 900 (trigger-type=interval 时必填)
                   --active-hours STR        激活时段，如 "9-18" 或 "9-12,14-18" (interval 可选)
                   --schedule-desc STR       调度时机的自然语言描述 (cron/interval 必填)
                   --start-time STR          生效开始时间，ISO 格式 (可选)
                   --end-time STR            生效结束时间，ISO 格式 (可选，仅在用户明确要求截止时间时设置)
                   --repeat BOOL             是否重复执行：true=循环 / false=单次。**仅 cron 必填且支持 false**；interval 本质循环，不支持 --repeat false（一次性请走 cron）
                   --notify-self BOOL        是否通知 caller 本人私聊。可选；用户没主动改投递时不传，走 CLI 默认行为
                   --delivery-groups CSV     需要通知的群列表 (open_chat_id, oc_xxx, 逗号分隔)。可选；显式传时即为最终全量值（覆盖 CLI 默认），传 "" 显式清空
                   --delivery-condition STR  投递条件，自然语言 (可选)。仅当存在投递接收对象时生效；不传则只要有接收对象就每次投递
                   --idle-execution BOOL     闲时执行 (可选)。true=后端在闲时窗口(0-6点)提前执行、到发送时间再投递。默认不传。判断见下方「闲时执行判断」；以响应 idleExecution 为准

aily-cli auto list     列出所有任务
                   --trigger-type STR        过滤类型 (cron | interval | event，可选)。**cron/interval 不分**（传任一返回定时任务合集）；event 独立；不传则全部一次列出
                   --status STR              过滤状态 (可选)。**仅 active 真过滤**；paused/archived 不过滤、返回全集，需客户端自筛
                   --limit N                 返回条数上限 (可选；默认 100，与用户 auto 总量上限一致)
                   --keyword STR             按 name 服务端模糊匹配 (可选；推荐用关键词缩范围)
                   --assignee-agent-id [id]  按归属 agent 过滤（可选）。不带值 = 当前 agent（读 $AILY_CLI_CALLER_AGENT_UID）；带值 = 指定 agent；**整个 flag 不传 = 不过滤，返回该用户名下所有 agent 的任务**
                   --full                    返回完整 Auto 记录 (可选；默认 compact 6 字段，含 assignee 归属)
                   --count-only              仅输出 total 数字 (可选；用于纯数量检查)
                   -o, --output-path PATH    把结果写入文件而非 stdout (可选；落盘兜底，agent bash 截断时用)

aily-cli auto get      查看任务详情
                   <id>                      任务 ID (必填)

aily-cli auto update   更新任务
                   <id>                      任务 ID (必填)
                   --name STR                新名称 (可选)
                   --instruction STR         新指令 (可选)
                   --cron STR                新 cron 表达式 (须配合 --schedule-desc)
                   --interval N              新间隔秒数，最小 900 (须配合 --schedule-desc)
                   --active-hours STR        新激活时段 (interval 任务)
                   --schedule-desc STR       新调度时机描述 (修改时间时必填)
                   --start-time STR          新生效开始时间
                   --end-time STR            新生效结束时间
                   --repeat BOOL             是否重复执行：**仅改 cron 时必传**（true=重复 / false=单次）；改 interval 时可省略，且不接受 false（一次性请走 cron）
                   --notify-self BOOL
                   --delivery-groups CSV     字段级 patch：传则全量替换 chat 接收方，传 "" 清空，不传则保留现状
                   --delivery-condition STR
                   --idle-execution BOOL     闲时执行开关。字段级 patch：传则更新，不传保留现状。改发送时间等触发时机也会触发后端重判，以响应 idleExecution 为准

                   ⚠️ `auto update` **不接受 `--trigger-type`**（仅 `create` 必填）。改成什么类型按字段推断：传 `--cron` → cron；传 `--interval` → interval；传 `--event-type` → event。跨大类切换（event ↔ schedule）也直接传目标字段即可，autoUid + runs 保留。

aily-cli auto enable   启用已暂停的任务
                   <id>                      任务 ID (必填)

aily-cli auto disable  暂停任务
                   <id>                      任务 ID (必填)

aily-cli auto run      立即执行一次任务
                   <id>                      任务 ID (必填)

aily-cli auto delete   删除任务（⚠️ 高风险 · 不可逆，无恢复命令）
                   <id>                      任务 ID (必填)
                   -y, --yes                 确认删除（非交互模式必填；加 --yes 前必须已按「注意事项 18」向用户确认作用域）

aily-cli auto runs     查看运行日志
                   --id STR                  按任务 ID 过滤 (可选)
                   --status STR              按状态过滤: running | success | failed | canceled (可选)
                   --limit N                 返回条数上限 (可选)
```

## 参数

| 参数 | 说明 |
|------|------|
| `--trigger-type` | 触发类型（必填）：`cron`（基于时间点）或 `interval`（基于时间间隔） |
| `--name` | 简洁的任务名称，便于识别。**必须与用户意图紧密贴切**（建议 2-8 个中文字符或 2-6 个英文单词） |
| `--instruction` | 执行时 Agent 收到的任务描述（自然语言）。**引用其他 agent / team 时，需按下文 3 步查出对应 uid 并附在名字后**（如 `数据分析师(agent_xxx)`），否则 runner 靠字面找不到对应 agent |
| `--agent-id` | 执行 agent ID。可选，缺省指派给当前 agent；**执行 agent 即为投递 agent**。与 `--agent-team-id` 互斥 |
| `--agent-team-id` | 执行 agent-team ID（智能体团队，用户提"团队/智能体团队/让 X 团队跑"时传）。与 `--agent-id` 互斥 |
| **按名找 agent_uid / teamId** | 常规用法：<br>① 找 agent（默认 workspace 级，含未入 team 的新建自定义 agent）→ `aily-cli agent list --enabled-only --json`，按 name 比对 `members[].agentId`；用户明确指到某个 team 内的 agent（如"团队 A 里的数据分析师"）→ 先走 ② 拿 teamId，再 `aily-cli team member search "<agent 名>" --team <teamId> --json` 在该 team 内收窄<br>② 找 team（用户明确要"团队 / 智能体团队"整个跑）→ `aily-cli team list --json` 拿 teamId<br>③ 按用户原话指向决定传哪个：指 agent → `--agent-id <agent_uid>`，指 team → `--agent-team-id <teamId>`；未搜到或候选多个时跟用户澄清 |
| `--cron` | 6 字段 cron 表达式：`秒 分 时 日 月 周` |
| `--interval` | 间隔秒数（最小 900，即 15 分钟） |
| `--active-hours` | interval 的激活时段（可选）。格式：`"9-18"` 单段或 `"9-12,14-18"` 多段。仅在激活时段内触发，时段外自动跳过。不传则全天执行 |
| `--schedule-desc` | 调度时机的自然语言描述（**cron/interval 必填**），忠实翻译 cron/interval 含义（如"每天早上 8:35"、"每隔 3 小时"），用于创建后确认和用户侧展示 |
| `--start-time` | 生效开始时间，ISO 格式（如 `2026-03-15T09:00:00`）。适用场景：用户明确要求"从某天开始生效"（如"下周一开始每天提醒我"）。不传则立即生效，**不要主动询问** |
| `--end-time` | 生效结束时间，ISO 格式（可选）。**仅在用户明确要求截止时间时设置**，不主动询问，不默认填写 |
| `--repeat` | 是否重复执行。**仅 cron 路径**支持区分 true/false（true=循环，false=单次）；interval 本质就是循环，`--repeat` 可省略且**不接受 false**（一次性任务一律走 cron） |
| `--notify-self` | **系统侧**是否在每次触发时把 task output 推给 caller 本人私聊（**跟 instruction 内条件正交** — `true` 时**会调用系统 delivery 模块投递**，不管 instruction 决定不决定静默）。**红线**：如果用户需求含推送条件但**不满足抽取到 `--delivery-condition`** → **必须显式 `false`**，否则系统兜底投递会绕过 instruction 条件 |
| `--delivery-groups` | 需要通知的群列表（open_chat_id 形态 `oc_xxx`，CSV）。用户在 query 中提到具体群时显式传；**传时即为最终全量值**（不是"额外"叠加，含本群也要显式写出）；传 `""` 显式清空所有群 |
| `--delivery-condition` | 投递条件，自然语言（如 `"只在任务失败时通知"`、`"如果没有重要信息保持静默"`）。**仅当存在投递接收对象时（sendToSelf=true 或 delivery-groups 非空）才生效**；不传则只要有接收对象就每次投递 |
| `--idle-execution` | 闲时执行开关（bool，可选，**仅 cron/repeat 有意义**）。`true` = 后端在闲时窗口（0-6 点）提前执行、到发送时间再投递，用于错峰。**判断标准见下方「闲时执行判断」节**；以响应返回的 `idleExecution` 为准，被资格静默关时原因在 `idleExecutionNotice` |

> **接收对象只支持「caller 本人私聊」+「群（任意 oc_xxx）」**：query 含「私聊给 A 人 / @ B 人」等私聊非本人语义时，**必须先向用户澄清**（确认是发到群里 @ 该人，还是改用其他方式）；用户坚持私聊非本人时，需明确说明 lark-cli im 给非本人投递依赖飞书关系链可能发不出。

## Cron 表达式 (6 字段): `秒 分 时 日 月 周`

最前面是**秒**字段；遇到 5 字段输入需补 `0` 作为秒后再传入。

示例：

- ❌ `0 9 * * *`（5 字段，CLI reject）→ ✅ `0 0 9 * * *`（每天 9:00，秒=0）
- `30 0 9 * * *` — 每天 9:00:30（秒=30）
- `0 35 8 * * *` — 每天 8:35
- `0 15 9 * * 1-5` — 工作日 9:15
- `0 40 10 1 * *` — 每月 1 号 10:40
- `0 20 9 * * 1` — 每周一 9:20
- `0 0/30 9-18 * * *` — 每天 9:00-18:00，整点和半点触发（9:00, 9:30, 10:00…）
- `0 0/30 9-18 * * 1-5` — 工作日 9:00-18:00，整点和半点触发

**⚠️ Cron 不支持年份粒度**：用户说「每年 X 月 X 日」时拦截并提示——可以创建单次任务执行后引导用户重建下次。

## 闲时执行判断（`--idle-execution`）

> **⚠️ 创建 / 更新 cron/repeat 类定时任务时，输出命令前必做这一步**：过一遍下面两条，两条都命中就在命令里**带上 `--idle-execution true`**（极易漏——漏了任务就白白挤早高峰、失去错峰意义）。
>
> **🚫 先过一票否决（优先级最高，压过下面"两条都命中就开"和后文"早高峰首选开 / 漏了补开"）**：query 只要带**实时 / 新鲜度**诉求——「此刻 / 当前 / 最新 / 实时 / 这个时间点 / 到点现查 / 不能延迟 / 要（发送时）最新的」——**一律不传 `--idle-execution`**。闲时是凌晨预跑、到点才投，结果到发送时已不是最新，与"要最新"直接冲突；这类**即便命中早高峰 + 系统投递也不开**。

闲时执行 = 后端在闲时窗口（0-6 点）**提前执行**任务、**到用户设定的发送时间再投递**，用于错峰削早高峰。适用于"何时算"不敏感、但"何时收到"敏感的任务。

**判断是否传 `--idle-execution true`（两条都要满足）：**

1. **时间不敏感**（提前几小时算、到点发，结果仍成立）：
   - ✅ 正信号：调研 / 汇总 / 总结 / 整理 / 昨日总结 / 行业动态 / 竞品调研 / 日报 / 周报（聚合已有 / 历史信息）
   - ❌ 负信号：含「此刻 / 当前 / 最新 / 实时」、结果依赖发送那一刻的状态、临近提醒（会前 X 分钟）、用户明确要求"实时 / 到点现查" → **不开**
2. **走系统投递**（`--notify-self true` 或 `--delivery-groups` 非空）：只有系统投递才能"先算好、暂存、到点再推"。**自投路径（instruction 自决 + `--notify-self false --delivery-groups ""`）默认不开** —— 提前执行时 agent 会当场（凌晨）就把消息发了，破坏"到点才发"。

> **例**："每天早上 8:30 发我一份昨日团队工作进展汇总" → 汇总类(时间不敏感✅) + 8:30 早高峰 + 发我(系统投递✅) → **必须带 `--idle-execution true`**。

**用户强制要求例外**：对不满足上面的任务（自投路径 / 时间敏感），用户**明确坚持**要闲时执行时 → **先提醒**"这类任务闲时会在凌晨就推送给你 / 结果可能不是发送时刻最新的"，然后**仍然设** `--idle-execution true`（视为用户知情决策，不硬拦）。

**契约（重要）**：`--idle-execution true` **传进去 ≠ 生效**。后端按资格（`cron` / `repeat` 每天至多一次、发送时刻晚于 6 点等）判定，不满足则**静默关闭、不报错**，响应里 `idleExecution` 返回 `false`、原因在 `idleExecutionNotice`。**一律以响应返回的 `idleExecution` 为准**判断实际是否生效，被自动关时读 `idleExecutionNotice` 拿原因。⚠️ **回复用户必须用大白话、绝不要把 `idleExecution` / `idleExecutionNotice` 这类内部字段名或裸 JSON 甩给用户**：开启成功就说「已开启闲时执行：系统会在 00:00-06:00 间提前完成任务，到你设置的时间再发送结果，你也可以在自动化设置里手动修改」；被自动关闭时用大白话转达原因（如"发送时间在闲时窗口内，暂不支持闲时执行"），不提字段名。

**仅定时（cron / repeat）任务有意义**；interval / 一次性 / event 不适用。

## 注意事项

1. **⚠️ 投递参数选取**：**按 query 字面判**——只依据用户原话决定传哪些 flag，不要传 query 没要求的字段。

    | 用户 query 表达 | 该传哪些 flag |
    |---|---|
    | 未提投递目标 | （全不传，走 CLI 默认：**团队智能体推送到创建群，其他均推送给 caller 本人**）|
    | 「别打扰我」/「不要通知」 | `--notify-self false --delivery-groups ""` |
    | 「通知我」（仅本人）| `--notify-self true --delivery-groups ""` |
    | 「只发 X 群（不要本人）」 | `--notify-self false --delivery-groups "oc_x"` |
    | 「通知我 + X 群」/「我和 X、Y 群都发」 | `--notify-self true --delivery-groups "oc_x,oc_y"` |
    | **接收对象含糊**（如「也通知 X 群」「除了默认还要发 Y」）| **先向用户澄清最终接收对象**（只发 X / 我+X / 等），再按澄清后明确的最终列表传 `--notify-self` + `--delivery-groups` 全量值 |
    | 任意 + 「何时推 / 何时静默」可静态自然语言描述（"只在结果异常时"、"夜间 22-8 静默"、"仅周末投递"）| + `--delivery-condition "..."` —— 系统按条件决定投递 |
    | **instruction 自决投递**（状态机 / 跨调用查询 / 不同接收对象 / 动态群 / 跨渠道）| `--notify-self false --delivery-groups ""` + instruction 内描述完整投递逻辑，agent 用 `lark-cli im` 自投 |
    | **系统投递 + 调研/汇总/日报/周报类 + 发送落早高峰(8-10 点)** | 在上面投递 flag 基础上 **额外加 `--idle-execution true`**（错峰：凌晨预跑、到点直推；判断见「闲时执行判断」节）|

    **过滤/推送条件优先级**：条件可**静态自然语言描述**就用 `--delivery-condition`（系统按条件决定投递）；静态描述覆盖不了（状态机 / 跨调用查询 / 需要查外部数据）才走 instruction 自决投递。

    **指引原则 1（主动表达投递目标 → 两个 flag 同时显式传）**：用户**主动表达过投递目标**时，`--notify-self` 和 `--delivery-groups` **必须同时显式传**（不能只传一个）。

    **🚨 指引原则 2（投递条件写在哪，必须与投递方式一致 —— 双向红线）**：投递条件 / 静默逻辑写在哪，决定走系统投递还是自主投递，二者必须一致，不可只做一半：
    - **条件写进 instruction（自决投递）** ⟹ **必须 `--notify-self false --delivery-groups ""`** 关掉系统投递（含 `if/else 决定推不推` / 状态机 / 时间窗口 / 跨调用查询；不传也算违反）。
    - **系统投递**（`--notify-self true` 或 `--delivery-groups` 非空）⟹ **投递条件必须抽进 `--delivery-condition`**，禁止只写进 instruction。**下命令前自检一句**：既然要系统投递（投本人私聊或投群都算），用户那句"只在 X 才通知 / 否则静默"是否已经落进 `--delivery-condition`？没有就先别开系统投递。

    **WHY（为什么系统投递时条件只写 instruction 会失效）**：系统投递时 task agent **只产出结果文本、无法自我静默**（它没有"这次不发"的开关）；到底推不推，由投递侧的 delivery agent-compose 读 `--delivery-condition` 判定。条件只写进 instruction → 投递层拿不到 → **默认每次都推**，连本该静默的结果也推出去 = 打扰。

    **对照例（负 → 正）**：每天汇总昨日数据、"只在有异常时提醒我"——
    - ❌ 条件塞 instruction（"汇总数据，有异常就通知我"）+ `--notify-self true`，**没** `--delivery-condition`：无异常那天，任务判"该静默"但投递层无条件仍**默认推**，把"今日无异常"也推给用户 = 打扰。
    - ✅ `--instruction "汇总昨日数据，判断是否存在异常"` + `--notify-self true` + `--delivery-condition "仅当存在异常时投递；无异常时静默"`。
    - 💡 **投群同理**：改成投群（`--delivery-groups "oc_xxx"`，不带 `--notify-self`）也是系统投递，投递条件同样必须放 `--delivery-condition`，不能塞 instruction。

    **`--delivery-groups` 是全量值，不是增量**：传 `--delivery-groups "oc_x"` ≠ "再加 X 群"——传的就是最终要投递的所有群。query 含"也通知 X 群"这种"加群"语义但最终目标不明时，必须先澄清。

    instruction 行为约束：
    - **优先用 delivery flag 表达投递**：能用 `--notify-self` / `--delivery-groups` / `--delivery-condition` 表达的不写进 instruction（写了会跟系统 delivery 模块双重推送 / 双重判断）。
    - **走 instruction 自决投递时**：`--notify-self false --delivery-groups ""` 关掉系统投递，instruction 内描述完整投递逻辑，**agent 在执行期判断并用 `lark-cli im` 自投**（见 §指引原则 2）。
    - **🚫 红线：自动化任务绝不以用户身份对外发消息。** 自决投递写进 `--instruction` 的投递逻辑，只能让执行 agent 用 `--as bot` 发消息，**绝对禁止 `--as user`**——涵盖 `im +messages-send` / `im +messages-reply` / `im messages forward` / `mail +share-to-chat` 等一切「代替用户对外发 / 转消息」的调用。
      - **为什么**：定时 / 事件任务由系统按规则自动触发、非用户当下主动发起；此时以「用户本人」身份在群里 / 会话发言，用户对自己名义发出了什么感知很弱、来不及把关，极易造成不当言论、误打扰他人、身份与责任归属混乱。
      - **不受影响**：读取类 `--as user`（查消息 / 日历 / 云文档 / 搜索等）照常——限制只针对「对外发 / 转消息」这类写操作。
      - **护栏注入**：凡写含发 / 回复 / 转发 / 分享消息的自投 instruction，**必须在 instruction 里显式写明「发送一律用 bot 身份（`--as bot`），禁止以用户身份发 / 回复 / 转发 / 分享消息」**，把约束带到执行期。
      - **写完自检**：回看刚写的 `--instruction`，涉及发消息处有没有一处会走到 `--as user`？只要有就改成 `--as bot`。
      - ✅ `--instruction "…把结果用 lark-cli im +messages-send --as bot 发到 oc_xxx 群；发送一律用 bot 身份，禁止以用户身份发消息"`
      - ❌ `--instruction "…用我的身份把结果发到群里"`（自动化里绝对不行）

    **投递字段更新（update 路径）**：用户表达"改投递对象 / 改投递条件 / 加群 / 改静默策略"时——**⚠️ 先识别是不是"改投递闸"**："改成只在 X 时才通知 / 不 X 就别发我 / 除了 X 都静默 / 只 X 才提醒"这类**都是改投递条件**（不是改 instruction 的执行/过滤逻辑）→ **必须落到 `--delivery-condition`，禁止只改 `--instruction`**。只改 instruction 会：任务层照判静默、但投递层 `conditionDesc` 没变仍按旧条件（或无条件默认推）——静默判断在投递层失效（见 §指引原则 2 的 WHY 与对照例）。
    1. **先 `auto get <id>` 拿到现有 NotifyConfig**（`sendToSelf` / `receivers` / `conditionDesc`）+ instruction。
    2. **现有投递配置为空**（`sendToSelf=false` 且 `receivers` 为空 + `conditionDesc` 为空）→ 按上面「投递参数选取」表，结合 instruction + 用户当前需求重新推导投递对象 + 条件，update 时**两个 receiver flag 同时显式传**。
    3. **现有投递配置非空** → 字段级 patch：用户改哪个传哪个，不传保留现状。`--delivery-groups` 是**全量替换** chat 类 receivers，"再加 Y 群"要传"现有所有群 + Y"的全量列表。
    4. **`--delivery-condition` 仅当存在投递接收对象时才生效** → 用户只让改条件但现有 `sendToSelf=false` 且 `receivers` 为空时，先按步骤 2 推导接收对象，再传 condition。
    5. **改 `--cron` / `--interval` 跨切换或触发时机大改时重审 `conditionDesc`**：`auto get` 看旧值；跟新触发明显脱钩时，用户没提新条件 → `--delivery-condition ""` 清空，提了 → 传新值；**不明确时向用户澄清**。

    执行 Agent 回复用户时**以自然语言描述结果，不得暴露 CLI 命令**
2. **⚠️ 投递条件提取（`--delivery-condition`）**: 从用户表达里提取静默/通知偏好，**与 `--instruction` 严格分离**。
    - **🧭 判定原则**（按 1→2→3 顺序执行）：
        1. 描述"**何时不投递 / 何时投递**"的子句 → `--delivery-condition`；其余 → `--instruction`
        2. `--delivery-condition` 接**自然语言**，不限句式（含 "if-A-静默-else-B" 分支）
        3. "如果 A 就别通知，否则正常处理"中 **A 分支永远归 delivery-condition**——不是 instruction 的第一步判断
    - **`--delivery-condition` 适用范围**：系统投递路径（`--notify-self` 或 `--delivery-groups` 实际产生接收对象时）有效；纯 Agent 自主投递（`--notify-self false --delivery-groups ""`）时禁传，条件写进 `--instruction` 由 runner 自判
    - **双段式写法**（正向 + 反向兜底）：`当 <推送条件> 时投递；否则 / 未满足时 静默`
        - 正向成句、主谓完整，让条件脱离 instruction 也能独立成立；反向兜底强烈推荐（让 delivery 层清楚反向行为）
        - **保留具体值**：阈值 / 关键词 / 邮箱 / ID / 人名等关键内容必须出现，禁止标签化
        - ✅ `"当结果含「风险/延期/故障/事故/隐患」任一关键词时投递；不含上述关键词时静默"`
        - ✅ `"当当日合计库存达到或超过 27000kg 时投递；未达到时静默"`
        - ❌ `"含关键词时投递"` / `"≥27000kg 时投递"` / `"仅 P0 时投递"`（标签化、语义断裂）
    - 常见形式：
        - 结果条件型：「只有发现问题时才通知我」→ `"当执行结果包含异常或需处理事项时投递；否则静默"`
        - 静默条件型：「没有新东西就别打扰我」→ `"当存在新内容时投递；无新内容或结果为空时静默"`
        - 重要性型：「只推重要的」→ `"当发现高优先级内容时投递；其余静默"`
        - 无条件型（默认）：用户未提及任何条件 → **不传** `--delivery-condition`，默认每次执行均投递
    - **⚠️ 时间静默优先用 `--active-hours`，不要用 `--delivery-condition`**：
      - interval 任务："晚上别打扰 + 每隔 X 小时" → `--active-hours "9-22"`（限定触发窗口，避免无意义执行）
      - cron 任务：表达式的「时」字段限定（如 `0 0 9-22 * * *`）
      - 仅当时段语义复杂、`--active-hours` / cron 字段无法表达（如"工作日白天 + 周末晚上"）时，才退到 `--delivery-condition "..."`
3. **⚠️ instruction 撰写原则**: `--instruction` 是 agent 执行时的**唯一可见任务描述**（既读不到 SKILL，也读不到用户原话）。三条原则：
    - **自包含**：脱离对话上下文即可独立执行；只描述意图，不绑定具体工具/接口（agent 自主选调用方式）
    - **保留辨识维度**：用户 query 的辨识变量不做归纳式弱化
        - 可枚举清单（关键词、来源、对象集合）→ 完整列出，不写"等"
        - 可量化边界（时间窗、阈值、Top-N）→ 写具体数值
        - 辨识性限定语（"直接"、"立即"、"内部"…）→ 保留原词
        - **⚠️ 用户原话含 `<skill id="..." ...>...</skill>` markup → `--instruction` 原样保留整段**：用户用 /slash 唤起 skill 时前端渲染成 `<skill id="skill_xxx" source="userChoose" name="X" desc="...">短名</skill>` 完整标记。**不能替换成裸 name 或简化描述** —— 运行期 task agent 拿不到 `skill_id` 就无法绑定调用。
            - ✅ `--instruction '<skill id="skill_xxx" source="userChoose" name="anime-image-generator" desc="...">动漫图像生成</skill> 每周一生成一张动漫头像...'`
            - ❌ `--instruction "使用动漫图像生成技能，每周一生成一张..."`（丢了 skill_id 绑定）
    - **分工不串**：触发归 trigger 字段（`--cron` / `--interval` / `--active-hours`），投递归 delivery 字段（`--notify-self` / `--delivery-groups` / `--delivery-condition`），instruction 只描述"产出什么"。把触发/频率写进 instruction → agent 套娃再 `auto create`；把投递目标 / 条件写进 instruction → 与 delivery 层双重判断/推送。
        - **唯一例外**：参数表达力不足时（状态机 / 跨调用查询 / 多接收对象路由 / 跨渠道）—— 投递逻辑写进 instruction 由 task 内 agent 用 `lark-cli im` 自投，并 `--notify-self false --delivery-groups ""` 关掉系统投递避免重复（见 §指引原则 2）
    - **不写 CLI 内部知识**：instruction 里不要出现 `--notify-self` / `--delivery-groups` / `--delivery-condition` 等 flag 名，也不要写 `aily-cli chat send` / `lark-cli im +messages-send` 等具体 CLI 子命令；投递动作用业务语义描述。
    - **反正例** —— 用户片段「扫描含 P0/紧急/故障/线上问题/urgent/ASAP 或直接 @我 并要求立即处理的消息；无匹配不输出，命中输出摘要+建议并推送到故障跟进群」
        - ❌ `--instruction "扫描含 P0 等关键词或 @我消息时输出摘要给我和故障跟进群，没有就静默"` —— 关键词省略 / 限定语弱化 / 投递目标和静默条件塞入 instruction
        - ✅ 系统投递 + 条件：`--instruction "扫描消息，命中以下任一：① 含【P0/紧急/故障/线上问题/urgent/ASAP】；② 直接 @我 且要求立即处理。命中后整理为【摘要 + 建议处理方式】"` + `--interval 1800` + `--delivery-groups "<故障跟进群 oc_xxx>"` + `--delivery-condition "无命中消息时静默"`
4. **⚠️ 默认值补全与错峰调度**:
    - 高峰时段（**仅以下两个时段，其他时段均为非高峰，不得提示错峰建议**）：**8:00-10:00**、**17:00-18:00**
    - **用户未明确指定具体时刻 → 必须用 bash `$RANDOM` 现场采样生成时刻**，避免模型默认偏置导致多用户聚到同一时刻；得到的 `$HOUR:$MIN` 必须一并写进 `--schedule-desc`，并在确认中提醒用户已随机分配时间，可随时修改。

      **HOURS 挑选**（1→2→3 优先级）：
        1. **任务语义指向时段** → 按语义挑（"吃饭"=三餐、"喝水"=工作时段、"睡觉"=21-23、"健身"=早 6-7 或 晚 19-21），避免出现"提醒吃饭→凌晨 3 点"这种不合理时间分配
        2. **用户原话含时段词** → 从全集筛：上午=(10,11) / 下午=(13,14,15,16,18) / 晚上=(19-23) / 工作时间=(10,11,14,15,16,18)（避高峰 + 去午餐）
        3. **任务语义/时段词都没有** → 用全天合规全集

      ```bash
      # 全集（避 8-10 / 17-18 高峰）：
      # (0 1 2 3 4 5 6 7 10 11 12 13 14 15 16 18 19 20 21 22 23)
      HOURS=(...)   # 按上面 1→2→3 顺序确定子集

      HOUR=${HOURS[$((RANDOM % ${#HOURS[@]}))]}
      MINUTES=({1..29} {31..59})   # 非整点 / 非半点
      MIN=${MINUTES[$((RANDOM % ${#MINUTES[@]}))]}

      # 每周任务的 DOW（cron 1-7 = 周一-周日）：未指定 → 7（周日，默认）；工作日 → (1 2 3 4 5)；周末 → (6 7)
      # 单值固定：cron 直接写 DOW；多值随机：DOW=${ARR[$((RANDOM % ${#ARR[@]}))]}

      CRON="0 $MIN $HOUR * * *"        # 每天
      # CRON="0 $MIN $HOUR * * $DOW"   # 每周（用户未指定时默认周日 = 7）
      # CRON="0 $MIN $HOUR $((RANDOM % 28 + 1)) * *"  # 每月（日随机 1-28，避 29-31 兼容性）
      ```

      - ❌ **禁止模型心算时刻**——多用户跑同款 SKILL 会聚到示范的 11:43 / 22:16，本意分散反而集中
      - 并在确认中告知：**因未指定时间，已随机分配 HH:MM，可随时修改**
    - **用户已指定时间且命中高峰（仅 8:00-10:00、17:00-18:00）**（仅调研/周报/日报类处理，其他类型不提示；仅创建时，update 不追加）：
      - **① 早高峰 8:00-10:00 + 系统投递 → 首选开闲时执行**（⚠️ 除非 query 带实时 / 新鲜度诉求「当前 / 最新 / 实时 / 不能延迟」→ 一票否决、不开，见「闲时执行判断」的否决项）：直接在创建命令里带 `--idle-execution true`（执行左移到凌晨错峰、用户**仍在原时间收到**、心智不变），**不要**建议用户改时间。见「闲时执行判断」。创建后可告知：`💡 已开启闲时执行：系统会在 00:00-06:00 间提前完成任务、到你设定的时间再发送结果，你也可以在自动化设置里手动修改。`
      - **② 晚高峰 17:00-18:00，或自投路径 / 时间敏感（开不了闲时）** → 才退回改时间建议，创建后追加：`💡 小提示：{x} 点是任务执行高峰时段，可能需要排队，建议改到凌晨低谷时段（0 点-7 点），要帮你调整吗？`
5. **⚠️ `--repeat <bool>` 与触发类型的关系**: 一次性 vs 循环只在 `cron` 路径上区分；`interval` 本质就是循环触发，不支持一次性。
    - **`--trigger-type cron`**：必须显式传 `--repeat <bool>`（true=循环 / false=单次）：
        - **一次性意图 → `--repeat false`**（cron 必走）
            - 相对时长："X 分钟后 / X 小时后 / Xh 后 / Xmin 后 / N 天后"
            - 绝对时点："今天 / 今晚 / 明天 / 后天"、"在 HH:MM"、具体日期
            - 显式单次："一次"、"就这一次"、"提醒一次"
        - **循环意图 → `--repeat true`**
            - 周期表达："每天 / 每周 / 每月 / 每 N 分钟 / 每隔 N 小时"、cron 周期表达式
        - **模糊周期类（隐含循环但没"每"前缀）→ 默认 `--repeat true` + 在确认中明确告知，请用户必要时改 false**
            - 触发句式："工作日的 17 点 / 周三上午 9 点 / 早上 10 点提醒我"（没说"每周三"、"每天 10 点"但隐含循环）
            - 确认中加："已设为**每<X>循环执行**（如：每个工作日 17:00、每周周三 09:xx）；如只需**单次提醒**请告知，我帮你改 `--repeat false`"
            - 不要在没确认前默认按单次创建——多数用户对工作日 / 星期几这类描述的预期是循环
    - **`--trigger-type interval`**：循环触发，`--repeat` 可省略；**不支持 `--repeat false`**（一次性任务请用 `--trigger-type cron --cron <expr> --repeat false`）。
    - **零点边界**：23:00-01:00 期间用户使用"今天 / 明天 / 后天"等相对日期时，在确认摘要中用具体日期替代相对表述，并提醒零点因素。如：`⏰ 当前接近零点，已将"明天"对应为 3 月 18 日，如不符合预期可随时调整。`
6. **⚠️ 高频任务提示（< 30 分钟）**: 执行间隔低于 30 分钟（含 cron 等效间隔）时，**必须**在创建/更新确认摘要中附带：`⏱ {触发规则}，任务会比较频繁地运行，可能会消耗较多模型额度。需要我改成每 30 分钟触发一次吗？`
    - **例外**：用户要求的频率已因规则 7 的下限被抬到 15 分钟时，只保留额度提示、**不要**再反问"改成每 30 分钟"——否则「最小只能 15 分钟」和「要不要改 30 分钟」在同一条摘要里自相矛盾。
7. **⚠️ 执行频率约束**：执行间隔（含 `--interval` 和 cron 等效间隔）不得低于 900 秒（15 分钟），**CLI 端直接 reject（exit 2）**。用户要求更小间隔时按 15 分钟配置，并明确告知「平台支持的最小执行间隔为 15 分钟，该任务将每 15 分钟执行一次」。"实时通知"类需求建议转为定时批量检查。若后端另有频率限制返回拒绝，把原因转述给用户并请其确认调整方向，不要静默忽略。
8. **⚠️ 资源可达性验证**: 创建前若涉及特定资源（云文档、API 等），**必须先验证可访问**。不可达时**禁止创建**，向用户说明原因并引导解决，否则每次触发都会失败。
9. **定时执行 vs 轻量提醒**:
    - **AI 自动执行**（"帮我查"、"生成报告"、"发给我"）→ `aily-cli auto create --trigger-type cron|interval`
    - **轻量提醒**（"提醒我"、"别忘了" + 简单动作）→ `aily-cli auto create --trigger-type cron --repeat false`。像跟助理说"提醒我"一样，instruction 以 `## 轻量提醒：` 开头标识场景：
      - ✅ 自然换行：
        ```
        --instruction "## 轻量提醒：喝水
        该喝水啦，起来活动一下吧 🥤"
        ```
      - ❌ `--instruction "## 轻量提醒：喝水\n该喝水啦"` — 不要用 `\n`，需要换行时直接换行
      - ❌ `--instruction "该喝水啦！"` — 缺少 `## 轻量提醒：` 前缀
    - **语义不明确** → 默认按轻量提醒处理（`--repeat false`），大多数"提醒我"场景用户期望的是到点收到一条消息
    - **「加到日历」、「建会议」、「邀请他人」→ 改用 `aily-calendar`**：本 skill 仅负责 AI 自动执行 / 轻量提醒，不做正式日程类目（参会人通知、会议室预定、ics 邀请）。
10. **激活时段**:
    - **默认全天 + 提示**：创建"每 X 分钟/每 X 小时"的定时（interval 类型）任务时，若用户未指定时段，默认全天执行，但在创建确认中提示可设置时段。如：`💡 当前为全天执行，如需限定时段（如 9:00-18:00）可告诉我调整。`
    - **工作场景默认补全**：任务与工作场景明显相关（如"提醒我喝水"、"检查工单"、"站立办公"）时，可默认设为 9:00-19:00，但须在确认中说明：`💡 该任务看起来与工作相关，已默认设为 9:00-19:00 执行，可随时调整时段或改为全天。`
    - **interval 类型**：通过 `--active-hours "9-19"` 限定
    - **cron 类型**：通过 cron 表达式的"时"字段限定（如 `"0 0/30 9-19 * * *"`）
    - 用户明确指定了时段则按用户要求设置
11. **工作日限定（建议但不默认）**: 用户描述的任务与工作场景相关（如"提醒我喝水"、"检查工单"）时，创建确认后**建议**用户是否限定为工作日执行，但不自动添加。
    - 例："已创建。该任务看起来与工作相关，需要我改成仅工作日执行吗？"
    - 用户明确要求"工作日"时，使用 cron 周字段 `1-5`（如 `--cron "0 0/30 9-18 * * 1-5"`）。interval 不支持按星期限定，需改用 cron 实现
12. **创建/更新后确认**: 操作成功后回复任务摘要（名称、触发规则、执行内容概述）。若返回结果包含 `manageURL`，一并展示给用户。
    - **链接格式（强制）**: 必须使用 `[可读文案](URL)` 内联链接格式。禁止用 `**标题：**\nURL` 等裸链接格式，裸链接会导致前端渲染异常。
    - **URL 完整性**: 展示链接时**必须原样复制工具返回的完整 URL**，禁止手动拼写或缩写域名。模型容易将域名写错（如 `aily.feishu.cn` 误写为 `ily.feishu.cn`），务必逐字匹配工具返回值。
    - **⚠️ 创建/更新后逐项检查，按需追加用户提示**：
      - [ ] 【仅创建】执行时间命中高峰且为调研/周报/日报类？→ **是否已带 `--idle-execution true`**（见「闲时执行判断」）？命中却没带 = 漏了，补开
      - [ ] 高频任务（< 30min）？→ 第 6 条频率提示
      - [ ] interval 未限定激活时段？→ 第 10 条时段提示
      - [ ] 任务与工作相关但未限定工作日？→ 第 11 条工作日建议
13. **⚠️ update 注意事项**:
    - **暂停任务的 update**：`update` 不会自动改变 status。**update 前先 `auto get <id>` 看 `statusDesc`**；若为 `disable`，**用户没有特殊要求（如明确要保持停用）时默认给他开启**：update 后接 `auto enable <id>`，并告知用户"这个任务原本是关闭状态，已帮你改为启用；如果想保持关闭，告诉我即可"。
    - 修改 `--cron`/`--interval` 时**必须同时传 `--schedule-desc`**，否则后台展示时间与实际触发时间不一致。
    - 修改执行时间时须遵循第 4 条错峰调度规则。
14. **复杂日期（农历等）**: 用 `lunardate` 库计算公历日期，以 `--repeat false` 创建单次任务，并在 `--instruction` 中提示执行后引导用户创建下次任务。
15. **运行日志查询**（`runs`）:
    - `aily-cli auto runs --id <id> --status failed --limit 10` 查看指定任务失败的最近 10 次执行
    - `aily-cli auto runs --status failed --limit 20` 查看最近失败执行
    - `--status` 取值：`running` / `success` / `failed` / `canceled`
16. **输出格式**:
    - **默认 JSON**：查询命令（`list` / `runs` / `get`）不加任何 flag 就输出 JSON 到 stdout，Agent 直接解析即可
    - **落盘**：`-o/--output-path <PATH>`——CLI 写文件 + stdout 返回 `{ written, bytes }` 元信息便于校验
17. **⚠️ 判定 CRUD 路径 — 操作前 list 一次**: 以**动词**判断意图，不以**名词**判断。任务名常含周期 / 行为词（如"**每日**飞书消息**总结**"），按动词识别（启用 / 停用 / 改 / 删…），别被名词带偏。
    - **创建动词**（新建 / 搞个 / 加个 / 设个）→ `auto create`（前置查重 + 数量检查）
    - **其他动词**（启用 / 停用 / 改 / 删 / 跑 / 看 / 看记录）+ 任务标识 → 先 `auto list --keyword <片段>` 找 autoUid，再按动词分发 `enable / disable / update / delete / run / get / runs --id`
    - **list 命中**（两条路径通用）：0 条 → 反问是否新建，不默认 create；多条 → 列候选；唯一 → 走对应命令
    - **总量管理**（每用户最多 **100 条 auto**）：≥ 80 条创建后追加清理提示；= 100 条拒绝新建，引导 `delete` 后重建
    - **list 输出优化**（按优先级）：
        1. 缩范围优先：`--keyword <X>` / `--status active` / `--count-only`
        2. 默认 compact 视图（6 字段，含 assignee 归属）已够查重 + 数量检查
        3. 兜底：超阈值时 `-o <path>` 落盘再 `cat / jq` 分页
        4. 看详情用 `get <id>`，避免 `--full`

18. **⚠️ auto 是「用户级」资源，`list` 默认返回该用户名下全部 agent 的任务**：直接拿 list 结果批量操作会误伤其他 agent 的任务（已发生过线上 badcase：用户说「取消所有自动化任务」，agent 删光了账号下全部 16 条）。
    - **按当前 agent 收窄**：`aily-cli auto list --assignee-agent-id`（不带值即取当前 agent）；compact 视图的 `assignee` 字段显示每条的归属。
    - **用户说「所有 / 全部 / 都」时，默认指当前 agent 名下的那批**，不是账号下全部；要跨 agent 操作必须用户明确说过（如"把我所有智能体的都停掉"）。
    - **删 / 停两条以上前，先把待操作清单（名字 + 数量 + 归属）向用户确认范围**——按当前会话可用的方式提问（如任务的决策点、对话里直接回复提问并停下等回答），**用户明确答复前一条都不动**。`delete` 需要 `--yes`——只有用户确认范围之后才允许加。
    - **回报只报实际结果**：删了几条说几条，跳过或未确认的明确说明，不在部分执行时写"全部完成"。

## 工具选择指南

| 场景                                | 推荐工具                                  |
|-----------------------------------|---------------------------------------|
| 定时自动执行任务（总结、检查、报告等）   | `aily-cli auto create --trigger-type cron/interval` |
| 事件驱动自动化（收到消息/评论时触发） | **`aily-cli-event` skill**           |
| 查看已有任务                            | `aily-cli auto list`                      |
| 查看单条任务详情                        | `aily-cli auto get <id>`                  |
| 调整任务时间或内容                      | `aily-cli auto update <id>`               |
| 立即触发已有定时任务                    | `aily-cli auto run <id>`                  |
| 临时停用/恢复任务                       | `aily-cli auto disable / enable <id>`     |
| 查看运行历史                            | `aily-cli auto runs`                      |
| 轻量提醒（"X分钟后提醒我"、"别忘了"）    | `aily-cli auto create --trigger-type cron --repeat false` |
