---
name: aily-cli-event
version: 1.9.0
description: 飞书事件触发的自动化：收到 IM 消息 / 被 @ / 日程变更 / 会议结束 / 妙记生成 / 会议纪要生成 / 云文档变更 / 收到云文档评论 / 云文档评论中被所有者 @提及 / 收到新邮件 时自动执行指令。「当…就…」「有人 @ 我时」「群里提到 X 时」「会议结束/纪要生成后」「日程变更时」走这里；一条 `auto create --trigger-type event` 完成事件订阅 + 规则。也用于**查看 / 修改 / 启停 / 删除已有事件自动化**（改指令 / 触发条件 / 投递对象 / 投递条件、「把那个任务改成…」）。
---

# 事件触发自动化工具 (aily-cli auto event)

`aily-cli auto` 统一 CLI 的事件触发部分。Agent 订阅飞书事件源，事件发生时自动执行指令。

## 核心机制

```
飞书事件发生 → condition_group / target_file 过滤 → Agent 执行 instruction → Delivery 投递
```

- 一条 `aily-cli auto create --trigger-type event` 完成订阅 + 规则创建
- 所有匹配的 event 任务都会执行（all-match），不存在优先级排序
- 每用户最多 **100 条 auto**（含 schedule + event 等所有触发类型）

## 命令一览

| 命令 | 说明 |
|------|------|
| `list-events` | 列出可订阅的事件类型（环境异常排查时验证用，**创建/查重不需要先调**） |
| `create --trigger-type event ...` | 创建事件触发任务 |
| `list [--trigger-type event] [--status active] [--keyword X] [--assignee-agent-id [id]] [--limit N] [--full] [--count-only] [-o path]` | 列出所有任务。`--trigger-type event` 只返回 event 任务（**`cron` / `interval` 不分** — 传任一都返回 cron+interval 合集；不传则全部一次列出）。**默认 compact 6 字段**（autoUid/name/triggerSummary/status/lastRunAt/assignee）；`--keyword` 服务端 name 模糊匹配；`--status` **仅 `active` 真过滤**（paused/archived 不过滤、返回全集）；`--assignee-agent-id [id]` 按归属 agent 过滤（不带值 = 当前 agent，读 `$AILY_CLI_CALLER_AGENT_UID`；**整个 flag 不传 = 返回该用户名下所有 agent 的任务**）；`--limit` 条数上限（默认 100）；`--full` 返回完整 Auto 记录；`--count-only` 仅 total；`-o <path>` 落盘兜底（agent bash 截断时用） |
| `get <id>` | 查看任务详情 |
| `update <id> [...]` | 修改任意字段（含 `--event-type` / `--condition-group`，autoUid + runs 保留） |
| `enable / disable <id>` | 启用 / 停用任务（停用不删除规则） |
| `delete <id>` | **高风险 · 不可逆**：永久删除任务，无恢复命令，删错只能手动重建。非交互模式必须带 `--yes`，加 `--yes` 前必须已确认作用域（见「判定 CRUD 路径」的批量操作确认规则） |
| `runs [--id ...] [--status ...] [--limit ...]` | 查看运行日志 |

> **⚠️ `aily-cli auto run <id>` 不支持 event 类型**：事件触发依赖飞书 payload，无法手动模拟。

## 快速开始

最小可运行示例（处理 @我 的消息）：

```bash
aily-cli auto create \
    --trigger-type event \
    --name "处理@提及消息" \
    --event-type inner_im_event \
    --condition-group "mention-me" \
    --instruction "当有人@我时，理解对方诉求并自动回复，提取待办事项"
```

## 事件类型参考

> **以下事件类型矩阵直接可用**：按表 + 用户语义映射选 event_type，**无需先调 `list-events`**；仅在创建被后端拒绝时再用 `aily-cli auto list-events` 验证当前环境是否支持该类型。

**🧭 选型口诀**：按表"事件接收对象"列读——用户原话里**被触发的主体是智能体本身还是 user**，对应到行即可。

⚠️ **`drive.notice.comment_add_v1` 唯一需要按 `:app` / `:user` 后缀二选**（其他事件无此区分）。Agent 视角下"你"指智能体本身、"我"指 user：

- "@你"、"有人@你"（**智能体本身被 @**）→ `:app`
- "@我"、"我的文档收到评论"（**user 被 @，或 user 是文档 owner**）→ `:user`
- ⚠️ "智能体在云文档评论中被其所有者@提及" 与 "用户收到云文档评论" 是两个不同事件，不能混淆

| 事件类型 | 事件接收对象 | 过滤参数 | 规则要求 | 说明 |
|---------|------------|---------|---------|------|
| `inner_im_event` | 用户 | `--condition-group` **必填**（至少 1 个条件） | 须配规则 | 用户在飞书聊天中收到新消息时触发。仅推送真实用户发送的消息，不包含 bot/应用发送的消息。支持 AND/OR 组合的条件语法。 |
| `calendar.calendar.event.changed_v4` | 用户 | 不支持 | **必须创建规则** | 用户日程发生变更时触发（新增 / 修改 / 删除 / RSVP 变化等），范围为用户可见的所有日历。事件粒度是"某个日程被改了"，无法按日历 / 关键词 / 时间段过滤，需要在 instruction 里表达细分意图。 |
| `vc.meeting.participant_meeting_ended_v1` | 用户 | 不支持 | **必须创建规则** | 用户参与的视频会议结束时触发。语义是"我刚开完的会"——不区分 host / 参会人身份，也不按会议 ID / 标题过滤。适合"会议结束后做 X"（提取待办、生成摘要、追踪 follow-up 等）。 |
| `minutes.minute.generated_v1` | 用户 | 不支持 | **必须创建规则** | 妙记文件生成完成时触发（转写完成、文件可读取）。事件粒度是"我的一份妙记出来了"，无按会议 / 标题过滤。适合"妙记生成后自动摘要 / 转文档"。 |
| `vc.note.generated_v1` | 用户 | 不支持 | **必须创建规则** | 会议纪要（AI 智能纪要）生成完成时触发。与妙记（转写逐字稿）不同，会议纪要是结构化的总结 / 待办 / 决议。适合"会议纪要生成后分析跟我相关的事项"。 |
| `drive.file.edit_v1` | 用户 | `--target-file` **必填**（含 type，1-10 个） | 须配规则 | 订阅的云文档被成功编辑后触发；事件体包含文件类型、文件 token、操作人列表。**必须按文档订阅**：传 `--target-file <token>:<type>`（type ∈ docx/doc/sheet/bitable/slides/file，可混合）。 |
| `drive.notice.comment_add_v1:app` | 智能体 | 不支持 | **订阅即生效** | 用户在云文档评论中 @提及自己的智能体时触发。仅用户本人可以在文档中 @自己的智能体，智能体直接回复评论。**默认静默**：动作是在文档评论中回复，不应再 IM 推送 → `--notify-self false`（除非用户明确说"通知我" / "先发出来 review"才传 true）。 |
| `drive.notice.comment_add_v1:user` | 用户 | 不支持 | **必须创建规则** | 用户作为 owner 的云文档有新评论，或其他云文档评论中 @提及了用户时触发。事件范围固定，不支持按文档、类型等过滤。必须创建规则并提供 instruction 才会触发智能体。|
| `mail.user_mailbox.event.message_received_v1` | 用户 | 不支持 | **必须创建规则** | 用户收到新邮件时触发。支持个人邮箱和公共邮箱。**⚠️ 重要限制：不支持发送邮件**（包括自动回复、转发），只能通过 IM 通知用户或生成回复草稿（用户手动发送）。详见参考文档。 |

> ⚠️ **`drive.file.bitable_record_changed_v1`（多维表格记录变更）目前暂未开放**。**不要**尝试用 `drive.file.edit_v1 + type=bitable` 替代（后端会拒）。用户提"监听多维表格变更"类需求时，直接说明"为避免表格高频更新触发任务导致高消耗，该能力暂未开放"。

### 过滤参数总览

**只有 2 个事件接受过滤参数**（其余事件传 `--condition-group` / `--target-file` 会被 CLI 直接 reject，范围过滤只能写进 `--instruction`）：

| 事件 | 参数 | 可用条件（摘要） | 详情必读 |
|---|---|---|---|
| `inner_im_event` | `--condition-group`（DSL，**必填**）| 8 原子：`mention-me` / `direct-message` / `user-ids` / `user-open-ids` / `group-ids` / `group-open-ids` / `keywords-or` / `keywords-and`；`AND` / `OR` + 括号组合 | **[condition-group-im.md](references/condition-group-im.md)** — 原子语义、值形态校验、AND 组约束、覆盖性反例 |
| `drive.file.edit_v1` | `--target-file`（**必填**，1-10）| type ∈ `docx` / `doc` / `sheet` / `bitable` / `slides` / `file`，可混合 | **[target-file.md](references/target-file.md)** — token+type 解析、写法 |

**🚨 创建前必读对应参考文档**——未读直接抽 condition-group / target-file → 大概率漏过滤维度，事故率高。上表「可用条件」只是摘要，完整原子语义 / 约束 / 反例以 reference doc 为准。

### 拿到文档 token + type 的标准动作

`drive.file.edit_v1` 需要按文档订阅，**先**用 lark-cli 解析用户给的文档 URL 拿到 canonical token + type，**再**调 aily-cli auto：

```bash
# 1. 解析文档 URL → token + type（含 wiki 自动 unwrap）
lark-cli drive +inspect --url "https://xxx.feishu.cn/docx/doxcnXXXXXXXX" --as user --json

# 2. 用解析结果拼 --target-file
aily-cli auto create --trigger-type event \
  --event-type drive.file.edit_v1 \
  --target-file doxcnXXXXXXXX:docx \
  --name "文档编辑提醒" \
  --instruction "..."
```

不要在 aily-cli 内部解析 URL — wiki unwrap 等逻辑由 `lark-cli drive +inspect` 完成。

### 不支持过滤参数的事件，怎么过滤范围？

即上表 2 个之外的所有事件（无 `--condition-group` / `--target-file`），过滤维度只能写进 instruction。下面以 `mail` 举例，其余同理。**优先**用 `--delivery-condition` 表达静态自然语言过滤（系统按条件决定投递）；条件需要查外部数据 / payload 深度过滤时才走 instruction 自决投递（`--notify-self false --delivery-groups ""` 关掉系统投递，agent 在 instruction 内用 `lark-cli im` 自投）：

```bash
# 静态自然语言过滤 → --delivery-condition（系统按条件决定投递）
aily-cli auto create --trigger-type event \
    --event-type mail.user_mailbox.event.message_received_v1 \
    --notify-self true --delivery-groups "" \
    --delivery-condition "仅在发件人邮箱以 @bytedance.com 结尾时通知" \
    --instruction "收到新邮件时，提取关键内容总结。"
```

## 语义化事件

除上述平台原生事件（IM / 邮件 / 评论 / Drive / 日程 / 会议 / 妙记 / 会议纪要）外，还支持一类**语义化事件** — 由后端从多种信号合成触发，对应"工作流场景"级语义（如待回复、待跟进、临近事件），而非单一 Lark 平台事件。

**关键性质**：语义化事件不是单条平台 payload 触发，而是**聚合事项视图**到达阈值时触发——agent 收到的是"一批待处理事项"而非"某一条新消息"。这决定了 `--instruction` 的写法应是聚合视角（汇总 / 列出 / 整理），不是单点动作（回复 / 通知）。

| event_type | 方向 | 描述 | 触发信号 |
|---|---|---|---|
| `inbound` | ← 入站 | 别人发起、指向你（待回复 / 待处理类事项）| 外部到达：IM @、群消息累积、评论、分配请求等 |
| `outbound` | → 出站 | 你已发起、需要持续追踪 | 响应缺失 / 进展更新 / 依赖等待 / 状态变更 |
| `upcoming` | ↑ 临近 | 未来即将到达的事件 | 时间临近未来锚点（会议 / 截止 / 提醒类）|

接收对象固定为用户本人。这三类**不支持 `--condition-group`**——过滤逻辑由后端引擎处理，CLI / Agent 端不显式声明。CRUD（list / get / update / enable / disable / delete / runs）与平台原生事件共用同一套命令（`run` 不支持 event 类型）。

### 用户语义 → 选哪个 event_type

| 用户口语 | event_type | 为什么 |
|---|---|---|
| "有待回复的消息时"、"积压消息提醒"、"被 @ 的待办" | `inbound` | 聚合视角的"待处理事项" |
| "跟进我发出去没人回的事"、"追踪我提交的请求"、"等待对方反馈" | `outbound` | 聚合视角的"已发出未回应" |
| "会议前 X 分钟提醒"、"截止日临近"、"日程开始前" | `upcoming` | 时间锚点临近的聚合视图 |
| "群里被 @ 时立刻回复" | **`inner_im_event`**（不是 inbound）| 单条 + 即时回复 → 用平台事件 |
| "我发的消息没人回，提醒我跟进" | **`outbound`**（不是 cron 每天巡）| 后端做时间衰减判断；cron 不知道"没人回"何时发生 |
| "会议 5 分钟前给我准备资料" | **`upcoming`**（也可 cron）| 后端跟日历自动判断；cron 需手写时间表达式 |

### 创建命令示例

```bash
# inbound 示例：聚合视角的待处理事项
aily-cli auto create \
  --trigger-type event \
  --event-type inbound \
  --name "待处理事项汇总" \
  --instruction "汇总当前未回复的 @ 与待办，按紧急度排序后输出"
```

`outbound` / `upcoming` 命令格式相同，仅 `--event-type` 与 `--instruction` 内容随场景改。

### 语义化事件 vs 平台事件，怎么选

- **选语义化事件**：用户表达"工作流场景"，不指定具体来源（不在意 IM / 邮件 / 评论），关注"事项是否需要处理"
- **选平台事件**（如 `inner_im_event` / `mail.*`）：用户明确指定来源，或需要按 `condition-group` 精确过滤（指定群、含关键词等）

含糊场景默认走语义化事件（覆盖更广，无需 `condition-group`）。

- **纯时间触发**（「每天 X 点 / 每隔 N 分钟 / 明天提醒我」，无飞书事件源）→ 改用 `aily-cli-schedule` skill（cron / interval），不在 event 建。

## 消费规则管理

定义收到事件后的处理方式。

### 通用规则参数

- `--name`：规则名称，**必须与用户意图紧密贴切、准确概括、有辨识度**。命名规则：
  - **贴切**：名称必须准确反映用户意图，不能与 `--instruction` 内容牛头不对马嘴
  - **有辨识度**：尽量带上能区分**用户 / 来源 / 场景**的关键词（如特定人名、群名、域名、文档标题、关键词等），让任务多了之后一眼能区分
  - **长度**：5-15 个中文字符（英文 3-10 个单词），不能太短（辨识度低），也不能太长（会被 GUI 截断）
  - **格式**：中文或英文均可，首字母大写（英文），不要包含特殊符号
  - **示例对比**：
    - ✅ 用户意图"客户群里有月报关键词时汇总" → `--name "客户群月报汇总"`（7 字，群+场景）
    - ✅ 用户意图"张总私聊我时立刻通知" → `--name "处理张总私聊消息"`（8 字，用户+场景）
    - ✅ 用户意图"收到来自 example.com 的邮件生成草稿" → `--name "example.com 邮件草稿"`（域名+场景）
    - ✅ 用户意图"收到含附件的邮件时提醒" → `--name "含附件邮件智能提醒"`（9 字，场景）
    - ❌ 用户意图"客户群里有月报关键词时汇总" → `--name "月报汇总"`（4 字过短，且没体现来源是哪个群，多个客户群时不可区分）
    - ❌ 用户意图"收到邮件通知我" → `--name "邮件自动回复"`（与意图不符：是通知不是回复）
    - ❌ 用户意图"收到来自 example.com 的邮件生成草稿" → `--name "处理客户邮件"`（没体现 example.com 与草稿这两个关键辨识维度）
    - ❌ 用户意图"通知我有新邮件" → `--name "当用户收到新邮件时通过私聊消息通知用户邮件摘要"`（过长，会被 GUI 截断）
  - 如果用户在对话中明确说了规则用途，优先使用用户的原话（精简后）
- `--instruction`：执行指令（自然语言），记录用户原始意图。意图模糊时可结合对话上下文适当补全。当 `--condition-group` 无法精确表达用户意图时（如"含特定关键词且来自老板"），instruction 还承担 Agent 级过滤指令的作用。**instruction 里引用到其他 agent / team 时，需按下文 3 步查出对应 uid 并附在名字后**（如 `数据分析师(agent_xxx)`），否则 runner 靠字面找不到对应 agent
- `--agent-id`：**可选**，缺省指派给当前 agent；需指派给其他 agent 时显式传（与 `--agent-team-id` 互斥）
- `--agent-team-id`：**可选**，执行 agent-team ID（智能体团队，用户提"团队 / 智能体团队 / 让 X 团队跑"时传，与 `--agent-id` 互斥）
- **按名找 agent_uid / teamId 的常规用法**：
  1. 找 agent（默认 workspace 级，含未入 team 的新建自定义 agent）→ `aily-cli agent list --enabled-only --json` — 按 name 比对 `members[].agentId`；用户明确指到某个 team 内的 agent（如"团队 A 里的数据分析师"）→ 先走 2 拿 teamId，再 `aily-cli team member search "<agent 名>" --team <teamId> --json` 在该 team 内收窄
  2. 找 team（用户明确要"团队 / 智能体团队"整个跑）→ `aily-cli team list --json` — 列工作空间所有 team，按 name/description 比对找到候选 teamId
  3. 按用户原话指向决定传哪个参数：指 agent → `--agent-id <agent_uid>`，指 team → `--agent-team-id <teamId>`；未搜到或候选多个时跟用户澄清，不要默默替用户挑
- `--event-type`：事件类型，可用值见前文「事件类型参考」矩阵
- `--condition-group`：事件专属参数，不同事件类型有不同的条件语法，见前文「事件类型参考」各专节。**🚨 覆盖性红线**：用户原话每个过滤维度（**群名 / 发件人 / 关键词 / @我**）都必须对应一个 atom，漏一个 = 触发范围放大 = 事故。提到群名（如「项目讨论群」）→ 必须先 `lark-cli im +chats-search` 查群 ID 再写入 atom。详见 [condition-group-im.md](references/condition-group-im.md) §「覆盖性」反例
- `--notify-self`：**系统侧**是否在每次事件触发时把 task output 推给 caller 本人私聊（**跟 instruction 内条件正交** — `true` 时**会调用系统 delivery 模块投递**，不管 instruction 决定不决定静默）。**红线**：如果用户需求含推送条件但**不满足抽取到 `--delivery-condition`** → **必须显式 `false`**，否则系统兜底投递会绕过 instruction 条件
- `--delivery-groups`：需要通知的群列表（open_chat_id 形态 `oc_xxx`，CSV）。**显式传时即为最终全量值**（不是"额外"叠加，含本群也要显式写出）；传 `""` 显式清空所有群
- `--delivery-condition`：投递条件，自然语言。**仅当存在投递接收对象时（sendToSelf=true 或 delivery-groups 非空）才生效**；不传则只要有接收对象就每次投递
- **触发级过滤（`--condition-group` / `--target-file`）与投递级过滤（`--delivery-condition`）正交**：可同传、各管一段——前者决定「是否唤起 agent」，后者决定「结果是否推送」，非二选一。

**⚠️ 投递参数选取**：按 query 字面判——只依据用户原话决定传哪些 flag，不要传 query 没要求的字段。

  | 用户 query 表达 | 该传哪些 flag |
  |---|---|
  | 未提投递目标 | （全不传，走 CLI 默认：**团队智能体推送到创建群，其他均推送给 caller 本人**）|
  | 「别打扰我」/「不要通知」 | `--notify-self false --delivery-groups ""` |
  | 「通知我」（仅本人）| `--notify-self true --delivery-groups ""` |
  | 「只发 X 群（不要本人）」 | `--notify-self false --delivery-groups "oc_x"` |
  | 「通知我 + X 群」/「我和 X、Y 群都发」 | `--notify-self true --delivery-groups "oc_x,oc_y"` |
  | **接收对象含糊**（如「也通知 X 群」「除了默认还要发 Y」）| **先向用户澄清最终接收对象**（只发 X / 我+X / 等），再按澄清后明确的最终列表传 `--notify-self` + `--delivery-groups` 全量值 |
  | 任意 + 「何时推 / 何时静默」可静态自然语言描述（"只在失败时"、"夜间静默"、"仅周末"）| + `--delivery-condition "..."` —— 系统按条件决定投递 |
  | **instruction 自决投递**（状态机 / 跨调用查询 / 不同接收对象 / 动态群 / 跨渠道）| `--notify-self false --delivery-groups ""` + instruction 内描述完整投递逻辑，agent 用 `lark-cli im` 自投 |

  **过滤/推送条件优先级**：能用 `--condition-group` 表达（关键词 / 群 ID / 域名等）就用 condition-group；不能但**条件可静态自然语言描述**就用 `--delivery-condition`（系统按条件决定投递）；两者都覆盖不了（状态机 / 跨调用查询 / 需要查外部数据）才走 instruction 自决投递。

  **指引原则 1（主动表达投递目标 → 两个 flag 同时显式传）**：用户**主动表达过投递目标**时，`--notify-self` 和 `--delivery-groups` **必须同时显式传**（不能只传一个）。

  **🚨 指引原则 2（投递条件写在哪，必须与投递方式一致 —— 双向红线）**：投递条件 / 静默逻辑写在哪，决定走系统投递还是自主投递，二者必须一致，不可只做一半：
  - **条件写进 instruction（自决投递）** ⟹ **必须 `--notify-self false --delivery-groups ""`** 关掉系统投递（含 `if/else 决定推不推` / 状态机 / 时间窗口 / 跨调用查询；不传也算违反）。
  - **系统投递**（`--notify-self true` 或 `--delivery-groups` 非空）⟹ **投递条件必须抽进 `--delivery-condition`**，禁止只写进 instruction。**下命令前自检一句**：既然要系统投递（投本人私聊或投群都算），用户那句"只在 X 才通知 / 否则静默"是否已经落进 `--delivery-condition`？没有就先别开系统投递。

  **WHY（为什么系统投递时条件只写 instruction 会失效）**：系统投递时 task agent **只产出结果文本、无法自我静默**（它没有"这次不发"的开关）；到底推不推，由投递侧的 delivery agent-compose 读 `--delivery-condition` 判定。条件只写进 instruction → 投递层拿不到 → **默认每次都推**，连本该静默的结果也推出去 = 打扰。

  **真实事故（负 → 正）**：某"只在含'出售/转让'类消息时提醒"的监控任务——
  - ❌ 条件全塞 instruction（"当有人提到平面车位时通知…"）+ `--notify-self true`，**没** `--delivery-condition`：先是"收购/求购"消息被误推；后来 instruction 加了"仅出售"过滤、任务层判静默，但投递层无条件仍**默认推**，把"我已静默"也推给用户。
  - ✅ `--instruction "监控消息，识别是否为'出售/转让'类平面车位信息"` + `--notify-self true` + `--delivery-condition "仅当为出售/转让类信息时投递；收购/求购/买 类静默"`。
  - 💡 **投群同理**：改成投群（`--delivery-groups "oc_xxx"`，不带 `--notify-self`）也是系统投递，投递条件同样必须放 `--delivery-condition`，不能塞 instruction。

  **`--delivery-groups` 是全量值，不是增量**：传 `--delivery-groups "oc_x"` ≠ "再加 X 群"——传的就是最终要投递的所有群。query 含"也通知 X 群"这种"加群"语义但最终目标不明时，必须先澄清。

  instruction 行为约束：
  - **优先用 delivery flag 表达投递**：能用 `--notify-self` / `--delivery-groups` / `--delivery-condition` 表达的不写进 instruction（写了 = 跟系统 delivery 双重推送 / 双重判断）。
  - **走 instruction 自决投递时**：`--notify-self false --delivery-groups ""` 关掉系统投递，instruction 内描述完整投递逻辑，**agent 在执行期判断并用 `lark-cli im` 自投**（见 §指引原则 2）。
  - **🚫 红线：自动化任务绝不以用户身份对外发消息。** 自决投递写进 `--instruction` 的投递逻辑，只能让执行 agent 用 `--as bot` 发消息，**绝对禁止 `--as user`**——涵盖 `im +messages-send` / `im +messages-reply` / `im messages forward` / `mail +share-to-chat` 等一切「代替用户对外发 / 转消息」的调用。
    - **为什么**：定时 / 事件任务由系统按规则自动触发、非用户当下主动发起；此时以「用户本人」身份在群里 / 会话发言，用户对自己名义发出了什么感知很弱、来不及把关，极易造成不当言论、误打扰他人、身份与责任归属混乱。
    - **不受影响**：读取类 `--as user`（查消息 / 日历 / 云文档 / 搜索等）照常——限制只针对「对外发 / 转消息」这类写操作。
    - **护栏注入**：凡写含发 / 回复 / 转发 / 分享消息的自投 instruction，**必须在 instruction 里显式写明「发送一律用 bot 身份（`--as bot`），禁止以用户身份发 / 回复 / 转发 / 分享消息」**，把约束带到执行期。
    - **写完自检**：回看刚写的 `--instruction`，涉及发消息处有没有一处会走到 `--as user`？只要有就改成 `--as bot`。
    - ✅ `--instruction "…把结果用 lark-cli im +messages-send --as bot 发到 oc_xxx 群；发送一律用 bot 身份，禁止以用户身份发消息"`
    - ❌ `--instruction "…用我的身份把结果发到群里"`（自动化里绝对不行）

### 创建规则

```bash
aily-cli auto create \
    --trigger-type event \
    --name <name> \
    --event-type <event_type> \
    [--condition-group "..."] \
    --instruction "规则用途描述" \
    [--notify-self true|false] \
    [--delivery-groups "oc_a,oc_b"] \
    [--delivery-condition "..."]
```

### 修改规则

支持修改所有字段，包括 `--event-type` 与 `--condition-group`：

```bash
# 改基础字段
aily-cli auto update <id> --name "新名称" --instruction "新指令"
aily-cli auto update <id> --delivery-condition "只在结果异常时通知"

# 改触发条件（事件类型 / 过滤规则）
aily-cli auto update <id> --event-type inner_im_event --condition-group "mention-me"
aily-cli auto update <id> --condition-group "group-ids:7598833157269360157 AND keywords-or:月报,周报"
```

**约束**：

- `--event-type`：未传保持原值；不接受空值
- `--condition-group`：仅在 `inner_im_event` 下生效；目标 event_type 非 `inner_im_event` 时同时传入将被 CLI 拒绝（exit 2）
- scheduler 字段（`--cron` / `--interval` / `--schedule-desc` 等）与 event 字段不可在同次 `update` 提交（同一 Auto 仅一种 trigger 类型）

> **⚠️ 改字段 / 切换 trigger 大类型（event ↔ cron/interval）一律用 `update`，禁止 `delete + create`**——`update` 切换会保留 autoUid + runs 历史，`delete + create` 会丢。

#### 暂停任务的 update

`update` **不会自动改变 status**——若任务原本是 `paused` 状态且用户意图是"让任务跑起来"（语义如"改成每天执行"、"调整时间继续运行"），update 后**必须接 `auto enable <id>`**。update 前先 `auto get <id>` 看 `statusDesc`，是 `disable` 就准备好 update + enable 两步。

#### 投递字段更新（特殊路径）

用户表达"改投递对象 / 改投递条件 / 加群 / 改静默策略"等涉及投递的需求时——**⚠️ 先识别是不是"改投递闸"**："改成只在 X 时才通知 / 不 X 就别发我 / 除了 X 都静默 / 只 X 才提醒 / 收到 X 才推"这类**都是改投递条件**（不是改 instruction 的执行/过滤逻辑）→ **必须落到 `--delivery-condition`，禁止只改 `--instruction`**。只改 instruction 会：任务层照判静默、但投递层 `conditionDesc` 没变仍按旧条件（或无条件默认推）——静默判断在投递层失效（见 §指引原则 2 的 WHY 与事故）。

1. **先 `auto get <id>` 拿到现有 NotifyConfig**（`sendToSelf` / `receivers` / `conditionDesc`）+ instruction。
2. **如果现有投递配置为空**（`sendToSelf=false` 且 `receivers` 为空 + `conditionDesc` 为空）→ 按上面「投递参数选取」表，结合 instruction + 用户当前需求重新推导投递对象 + 条件，update 时**两个 receiver flag 同时显式传**（同 create 指引原则）。
3. **如果现有投递配置非空** → 字段级 patch：用户改哪个传哪个，不传保留现状。`--delivery-groups` 是**全量替换** chat 类 receivers，"再加 Y 群"要传"现有所有群 + Y"的全量列表。
4. **`--delivery-condition` 仅当存在投递接收对象时才生效** → 用户只让改条件但现有 `sendToSelf=false` 且 `receivers` 为空时，先按步骤 2 推导接收对象，再传 condition。
5. **改 `--event-type` 时重审 `conditionDesc`**：`auto get` 看旧值；跟新事件明显脱钩时，用户没提新条件 → `--delivery-condition ""` 清空，提了 → 传新值；**不明确时向用户澄清**。

### 其他操作

```bash
# 列出所有任务（含 event）
aily-cli auto list

# 列出所有 event 任务
aily-cli auto list --trigger-type event

# 按状态过滤 / 限制条数
aily-cli auto list --status active        # 仅 active 真过滤；paused/archived 不过滤、返回全集
aily-cli auto list --limit 20

# 查看单条任务详情
aily-cli auto get <id>

# 启用 / 停用（停用不删除规则）
aily-cli auto enable <id>
aily-cli auto disable <id>

# 永久删除
aily-cli auto delete <id>
```

## 消费日志

查看事件的消费历史记录。

```bash
# 查看日志列表
aily-cli auto runs [--id <auto_id>] [--status running|success|failed|canceled] [--limit <n>]
```

`--status` 取值：

| 值 | 含义 |
|----|------|
| `running` | 执行中 |
| `success` | 成功 |
| `failed` | 失败 |
| `canceled` | 被取消 |

## 输出格式

- **默认 JSON**：查询命令（`list-events` / `list` / `get` / `runs`）不加任何 flag 就输出 JSON 到 stdout，Agent 直接解析即可
- **落盘**：`-o/--output-path <PATH>`——CLI 写文件 + stdout 返回 `{ written, bytes }` 元信息便于校验

```bash
# Agent 默认调用：不加 flag 已经是 JSON
aily-cli auto list-events
aily-cli auto list --trigger-type event
aily-cli auto get <id>
```

## Agent 行为约束

### 1. instruction 撰写原则

`--instruction` 是 agent 执行时的**唯一可见任务描述**（既读不到 SKILL，也读不到用户原话）。三条原则：

1. **自包含**：脱离对话上下文即可独立执行；只描述意图，不绑定具体工具/接口（agent 自主选调用方式）
2. **保留辨识维度**：用户 query 的辨识变量不做归纳式弱化
    - 可枚举清单（关键词、来源、对象集合）→ 完整列出，不写"等"
    - 可量化边界（时间窗、阈值、Top-N）→ 写具体数值
    - 辨识性限定语（"直接"、"立即"、"内部"…）→ 保留原词
    - **⚠️ 用户原话含 `<skill id="..." ...>...</skill>` markup → `--instruction` 原样保留整段**：用户用 /slash 唤起 skill 时前端渲染成 `<skill id="skill_xxx" source="userChoose" name="X" desc="...">短名</skill>` 完整标记。**不能替换成裸 name 或简化描述** —— 运行期 task agent 拿不到 `skill_id` 就无法绑定调用。
        - ✅ `--instruction '<skill id="skill_xxx" source="userChoose" name="anime-image-generator" desc="...">动漫图像生成</skill> 每周一生成一张动漫头像...'`
        - ❌ `--instruction "使用动漫图像生成技能，每周一生成一张..."`（丢了 skill_id 绑定）
3. **分工不串**：触发归 trigger 字段（`--event-type` / `--condition-group`），投递归 delivery 字段（`--notify-self` / `--delivery-groups` / `--delivery-condition`），instruction 只描述"产出什么"。把触发条件写进 instruction → agent 套娃再 `auto create`；把投递目标 / 条件写进 instruction → 与 delivery 层双重判断 / 推送。
    - **唯一例外**：参数表达力不足时——`--condition-group` 不支持复合过滤（"含关键词且发件人=老板"），或投递走条件分支映射不同对象 / 动态群（无法预先枚举 oc_id）/ 跨渠道——可在 instruction 作降级方案，能走参数不绕 instruction
4. **不写 CLI 内部知识**：instruction 里不要出现 `--notify-self` / `--delivery-groups` / `--delivery-condition` 等 flag 名，也不要写 `aily-cli chat send` / `lark-cli im +messages-send` 等具体 CLI 子命令；投递动作用业务语义描述。

**反正例**

用户片段：「扫描含 P0/紧急/故障/线上问题/urgent/ASAP 或直接 @我 并要求立即处理的消息；无匹配不输出，命中输出摘要+建议并推送到故障跟进群」

- ❌ `--instruction "扫描含 P0 等关键词或 @我消息时输出摘要给我和故障跟进群，没有就静默"` —— 关键词省略 / 限定语弱化 / 投递目标和静默条件塞入 instruction
- ✅ 系统投递 + 条件：`--instruction "扫描消息，命中以下任一：① 含【P0/紧急/故障/线上问题/urgent/ASAP】；② 直接 @我 且要求立即处理。命中后整理为【摘要 + 建议处理方式】"` + `--delivery-groups "<故障跟进群 oc_xxx>"` + `--delivery-condition "无命中消息时静默"`

**语义化事件补充**：语义化事件的 instruction 按聚合视角写（拿到的是"一批事项"而非单条 payload）：

- ✅ `"汇总当前未回复的 @ 与待办，按紧急度排序后输出"` — 聚合 + 整理
- ❌ `"收到 @ 时立刻回复对方"` — 单条触发写法；应改用 `inner_im_event` + `--condition-group "mention-me"`

**instruction 多行换行**：

- ✅ 自然换行：
    ```
    --instruction "步骤：
    1. 读取评论
    2. 判断主题
    3. 回复"
    ```
- ❌ `--instruction "步骤：\n1. 读取评论\n2. 判断"` — 不要用 `\n`，需要换行时直接换行

### 2. 投递条件提取（`--delivery-condition`）

从用户表达里提取静默/通知偏好，**与 `--instruction` 严格分离**。

**🧭 判定原则**（按 1→2→3 顺序执行）：

1. 描述"**何时不投递 / 何时投递**"的子句 → `--delivery-condition`；其余 → `--instruction`
2. `--delivery-condition` 接**自然语言**，不限句式（含 "if-A-静默-else-B" 分支）
3. "如果 A 就别通知，否则正常处理"中 **A 分支永远归 delivery-condition**——不是 instruction 的第一步判断

**`--delivery-condition` 适用范围**：系统投递路径（`--notify-self` 或 `--delivery-groups` 实际产生接收对象时）有效；纯 Agent 自主投递（`--notify-self false --delivery-groups ""`）时禁传，条件写进 `--instruction` 由 runner 自判。用户没提"何时推 / 何时静默"则不传，默认每次执行均投递。

**双段式写法**（正向 + 反向兜底）：`当 <推送条件> 时投递；否则 / 未满足时 静默`

- 正向成句、主谓完整，让条件脱离 instruction 也能独立成立；反向兜底强烈推荐（让 delivery 层清楚反向行为）
- **保留具体值**：阈值 / 关键词 / 邮箱 / ID / 人名等关键内容必须出现，禁止标签化
- ✅ `"当结果含「风险/延期/故障/事故/隐患」任一关键词时投递；不含上述关键词时静默"`
- ❌ `"含关键词时投递"` / `"仅 P0 时投递"`（标签化、语义断裂）

常见形式：

- 结果条件型：「只有发现问题时才通知我」→ `"当执行结果包含异常或需处理事项时投递；否则静默"`
- 静默条件型：「没有新东西就别打扰我」→ `"当存在新内容时投递；无新内容或结果为空时静默"`
- 时间段型：「晚上别通知」→ `"08:00-22:00 投递；其余时段静默"`（event 不支持 `--active-hours`，时段过滤只能通过此字段）
- 重要性型：「只推重要的」→ `"当发现高优先级内容时投递；其余静默"`
- 无条件型（默认）：用户未提及任何条件 → **不传** `--delivery-condition`，默认每次执行均投递

### 3. 资源可达性验证

涉及特定资源（多维表格 token、群 ID 等）时**必须先验证可访问**。不可达时**禁止创建**，向用户说明原因。

**私聊非本人不支持**：投递只支持「caller 本人私聊」+「群（任意 oc_xxx）」。query 含「私聊给 A 人 / @ B 人」等私聊非本人语义时，**必须先向用户澄清**（确认是发到群里 @ 该人，还是改用其他方式）；用户坚持时需明确说明 lark-cli im 给非本人投递依赖飞书关系链可能发不出。

### 4. 创建/更新后确认

- 操作成功后回复任务摘要（事件类型、触发条件、处理动作）
- 若返回结果包含 `manageURL`，必须使用 `[可读文案](URL)` 内联链接格式（禁止裸链接）
- **URL 完整性**：展示链接时必须原样复制工具返回的完整 URL，禁止手动拼写或缩写域名（模型容易将 `aily.feishu.cn` 误写为 `ily.feishu.cn`，务必逐字匹配）
- 回复用户以自然语言描述结果，**不得暴露 CLI 命令**

### 5. 判定 CRUD 路径 — 操作前 list 一次

**以动词判断意图，不以名词判断**。任务名常含周期 / 行为词（如"**每日**飞书消息**总结**"），按动词识别（启用 / 停用 / 改 / 删…），别被名词带偏。

- **创建动词**（新建 / 搞个 / 加个 / 设个）→ `auto create`（前置查重 + 数量检查，见下）
- **其他动词**（启用 / 停用 / 改 / 删 / 跑 / 看 / 看记录）+ 任务标识 → 先 `auto list --keyword <片段>` 找 autoUid，再按动词分发 `enable / disable / update / delete / run / get / runs --id`

**list 命中**（两条路径通用）：0 条 → 反问是否新建，不默认 create；多条 → 列候选；唯一 → 走对应命令。

> **⚠️ 「取消 / 关掉 / 停掉 / 别再跑了」默认是 `disable`，不是 `delete`**：先停用（可 `enable` 恢复），回报时告知"已停用，要彻底删除再说一声"；只有用户明说「删除 / 删掉 / 清掉 / remove」才 `delete`。`delete` 无恢复命令，删了只能手动重建。

> **⚠️ auto 是「用户级」资源，`list` 默认返回该用户名下全部 agent 的任务**：直接拿 list 结果批量操作会误伤其他 agent 的任务（已发生过线上 badcase）。按当前 agent 收窄用 `--assignee-agent-id`（不带值即当前 agent）；**用户说「所有 / 全部 / 都」默认指当前 agent 名下的那批**，跨 agent 操作必须用户明确说过。**删 / 停两条以上前，先把待操作清单（名字 + 数量 + 归属）向用户确认范围**——按当前会话可用的方式提问（如任务的决策点、对话里直接回复提问并停下等回答），**用户明确答复前一条都不动**；`delete` 需要 `--yes`，只有用户确认范围之后才允许加。回报只报实际结果，不在部分执行时写"全部完成"。

> **list 输出优化**（按优先级）：
> 1. 缩范围优先：`--keyword <X>` / `--status active` / `--count-only`
> 2. 默认 compact 视图（6 字段，含 assignee 归属）已够查重 + 数量检查
> 3. 兜底：超阈值时 `-o <path>` 落盘再 `cat / jq` 分页
> 4. 看详情用 `get <id>`，避免 `--full`

**create 前 ① 语义查重**：扫描已有任务的 `name` + `event_type` + `condition_group`，判断本次意图是否与既有任务重叠。重叠时列冲突任务并提供：沿用现有 / 用 `auto update <id>` 修改现有（支持改所有字段，含 event-type / condition-group）。

**create 前 ② 数量检查**（每用户最多 **100 条 auto**）：

- **≥ 80 条**：创建后追加 → 「⚠️ 当前已有 N 条 auto，接近 100 条上限，建议清理不再需要的任务」
- **= 100 条**：**拒绝直接新建**，先列出现有任务摘要，引导用户 update 或 delete 后再创建

### 6. 单一意图，单条任务

一次用户表达通常对应**一条**任务。不要主动按"场景 / 类型 / 来源"维度拆分多条。

**Smell 自检**（创建多条任务前过一遍）：

- 若计划创建的多条任务 `--name` 高度相似（甚至完全相同）→ 强信号：单一意图被错误拆分
- 若多条任务 `--instruction` 几乎一样、只有 `--condition-group` 不同 → 同上
- 想为「P2P / 群聊」/「来源 A / 来源 B」分别建任务 → 99% 应该合成 1 条，用 `--condition-group` 的 `OR` 组合（详见 `references/condition-group-im.md`）

**合法的多条场景**：处理逻辑本质不同 / 投递目标不同 / instruction 不同。

如果不确定，先建 1 条；用户后续表达确实需要分流时再拆。

## 域引用

- `references/condition-group-im.md` — IM 条件组 DSL（`inner_im_event` 用）
- `references/target-file.md` — `--target-file` 按文档订阅用法（drive event 用）
