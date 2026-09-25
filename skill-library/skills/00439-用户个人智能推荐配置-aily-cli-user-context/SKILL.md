---
name: aily-cli-user-context
version: 0.1.0
description: 读写用户的「个人智能推荐」配置页——AI 主动服务的全部设置与关注面。含 6 个方面：① config 基础配置/偏好（主动推送开关、主动服务模式档位、免打扰、每日前瞻/回顾、每周回顾、会议前提醒、自然语言偏好 instructions）；② goals 我的目标（目标+验收标准，JSON 读写）；③ contacts 紧密协作人名单；④ chats 重要群名单；⑤ calendar 重要日程名单；⑥ active-matters 活跃事项（AI 识别出的待跟进事项）。「打开/关掉主动推送」「调低主动性」「设个免打扰」「把周报改到周五」「更新我的偏好说明」「记个目标/我的目标有哪些」「把某人设为紧密协作人」「把某群/某会设为重要」「我还有哪些没办的事/待回复」都走这里。不含：定时任务(aily-cli-schedule)、自建结构化任务(aily-cli-task)、飞书日历建改删/发消息/查组织架构/会话置顶(lark-cli)。
---

# 用户个人智能推荐配置 (aily-cli user-context)

对应用户「个人智能推荐」配置页的全部 tab，一个命令组一个 tab。所有命令直连各自的后端 typed RPC。

## 先选对命令组（路由表）

| 用户想干什么 | 命令组 | 典型说法 |
|---|---|---|
| 改 AI 主动服务的**开关/档位/时段** | `config` | 打开/关掉主动推送、调低主动性、设免打扰、把周报改到周五、更新偏好说明 |
| 记/改/看**目标** | `goals` | 记个目标、我的目标有哪些、把目标标记完成、加一条验收标准 |
| 改**紧密协作人**名单 | `contacts` | 把某人设为紧密协作人、别再关注某某、我的紧密协作人有谁 |
| 改**重要群**名单 | `chats` | 把某群设为重要、别再关注某群、我关注了哪些群 |
| 改**重要日程**名单 | `calendar` | 把某个会设为重要日程、别盯着那个周会、我关注了哪些日程 |
| 看/勾销**活跃事项**（AI 识别的待跟进事项） | `active-matters` | 我还有哪些没办的事、待回复、把这件事标记完成 |

**不归本 skill**（别在这里找）：定时/未来执行任务 → `aily-cli-schedule`；用户自建的结构化任务/待办 → `aily-cli-task`；**在飞书里建/改/删日历日程、发消息、查组织架构、把会话置顶** → `lark-cli`（IM/日历能力）。

## 全组通用约定（先记这几条，各组不再重复）

1. **解析输出一律加 `--json`**：`--json` 是 `format=json` 的最高优先级别名，成功输出**单行 compact JSON** `{"ok":true,...}`；`--format pretty|json|markdown|compact` 也可选（默认 pretty，markdown 便于呈现给用户看）。
2. **失败信封 + 退出码**：带 `--json` 时出错统一 `{"ok":false,"error":{"code","message","hint?"}}`（不带则是普通错误文本，所以要机器可读就带上 `--json`）；退出码 `usage`=2（参数非法，报错带合法值清单）/ `gateway_http`=3（网关不可达）/ `rpc_error`=1（后端失败）。照 `hint`/合法值改对重试。**⚠️ 例外**：**启动前置错误**（未登录 / 网关未配）在命令逻辑前就 `exit 2` + 纯文本写 stderr，**不是 JSON**——别无脑解析 stdout：先看 exit code，`0` 才解析 stdout JSON；非 0 且 stdout 空时读 stderr 文本（多半是 `aily-cli login` 提示）。
3. **取值一律人话化**：`on|off`、`conservative|moderate|aggressive`、`mon..sun`、`10min|30min|1h`、`YYYY-MM-DD`、`not_started|in_progress|done` 等；CLI 内部翻译成后端 int/enum，别传 wire 值。
4. **写完以读为准**：scope/目标类写操作即使返回 `ok:true`，也应 `list`/`get` 回读确认真的落库了（`add` 后目标出现在 list、`remove` 后从 list 消失），再向用户确认。
5. **只有 `add`/`remove`，没有 `pin`**：contacts/chats/calendar 三组的名单编辑只有纳入(`add`)/移出(`remove`)；误移出直接 `add` 回来即可。用户说「置顶」通常指**飞书会话置顶**，那是 IM 能力、走 `lark-cli`，不在这里。
6. **id 来自 list/search 输出**：所有 `<id>`（goal_id / chat_id / event_id / matter_id / contact user_id）一律取自 `list`/`search` 输出，**禁止手编或从对话上下文猜**。
7. **⚠️ 这是 CLI 命令**，必须通过 shell 执行，不能作为 tool / MCP server 调用。

---

## 1. config —— 基础配置 + 偏好

> 「基础配置」tab 引导语（与产品页一致）：**智能伙伴会在合适的时机主动工作——每日前瞻、每日与每周回顾、重要会议准备。在这里调整各功能的开关与频率，使其贴合你的工作习惯。**

三个动词，`describe` 是发现入口（改配置前先跑它拿全 item + 当前值）：

| 命令 | 说明 |
|---|---|
| `config describe` | 列全部 item 的名称 / 允许值 / 当前值 / 用途（发现入口） |
| `config get [item]` | 读当前值；省略 item = 全部 |
| `config set <item> <value> [flags]` | 改一项（原子 partial，不动其它项） |

配置项（`set <item> <value> [flags]`）：

| item | 值 / flags | 用途（对齐产品页文案） |
|---|---|---|
| `proactive` | `on`\|`off` | 主动推送：关闭后，智能伙伴将只在你主动发问时响应 |
| `proactivity` | `conservative`\|`moderate`\|`aggressive` | 主动服务模式：设置智能伙伴执行所有功能时的主动程度（UI 档位 克制=`conservative`／平衡=`moderate`／积极=`aggressive`，输入用英文 token） |
| `dnd` | `on`\|`off` `[--from HH:MM --to HH:MM]` | 免打扰时段：这些时段内不主动推送（紧急事项除外） |
| `daily-briefing` | `on`\|`off` `[--at HH:MM]` | 每日前瞻：每个工作日早晨，为你备好当天的日程、待办与重点 |
| `daily-review` | `on`\|`off` `[--at HH:MM]` | 每日回顾：每个工作日结束时，为你回顾当天的进展与待续事项 |
| `weekly-review` | `on`\|`off` `[--day mon..sun --at HH:MM]` | 每周回顾：每周帮你总结本周、展望下周 |
| `meeting-reminder` | `on`\|`off` `[--lead 10min\|30min\|1h]` | 重要会议前提醒：重要会议开始前提醒，并附上相关文档或上次纪要 |
| `instructions` | 见下「**instructions 专用**」 | 偏好：自然语言定制主动服务（≤3000 字，整体/正反馈/负反馈三块） |

```bash
aily-cli user-context config describe --json                      # 先看全量 + 当前值
aily-cli user-context config set proactivity aggressive --json
aily-cli user-context config set dnd on --from 22:00 --to 08:00 --json
aily-cli user-context config set weekly-review on --day fri --at 17:30 --json
```

- **复合项 read-merge**：`dnd`/`daily-*`/`weekly-review`/`meeting-reminder` 没传的子 flag 保留现值（只 `set dnd on` 不带时段则沿用旧值）；只改时间也要带 `on`（value 是必填 positional）。
- **⚠️ 首开缺省只有 `dnd`**：`dnd` 首次启用补默认窗 22:00-08:00；`daily-briefing`/`daily-review`/`weekly-review`/`meeting-reminder` **无默认** time/day/lead——首次 `set ... on` 若不带子 flag = 启用但无排程。首次启用这四项时请**同时给** `--at`/`--day`/`--lead`。
#### instructions 专用（自然语言偏好 · 破坏性写入 · 严格按此来，别自己发挥）

**① 选输入通道 —— 只看内容有没有换行：**

| 内容 | 通道 | 命令 |
|---|---|---|
| **单行**短文本 | inline | `aily-cli user-context config set instructions "重要事项才提醒，其余别推"` |
| **多行 / bullet 列表 / 含任何换行** | **stdin(`-`) 或 `@path`** | `printf '%s' "$TEXT" \| aily-cli user-context config set instructions -`　或　`aily-cli user-context config set instructions @/tmp/prefs.md` |

> ⚠️ **多行走 inline 会被 CLI 直接拒（报 usage 错）**；拆成多段传也会报错——都是为了防止「片段静默覆盖掉整段偏好」。bullet 列表（`- …`）**内容本身完全没问题**（intro 模板就是这个格式），照写，只是**必须走 stdin/`@path`**，别内联。

**② 写入是破坏性全量替换，不是追加：** 每次 `set` 用新内容**整段覆盖**旧全文；传空串/空值会**清空**。改或加一条偏好**必须**三步：`get instructions --json` 读回**当前全文** → 本地拼成**含旧内容的完整新文本** → `set` 整段写回。**禁**直接 `set` 片段（会抹掉其余全部偏好）；**禁**分多次 `set` 逐条写（后盖前，只剩最后一条）。

**③ 读全文只走单项 `get instructions --json`** → `{"values":{"instructions":"<全文>"}}` 回**整段正文**（从未配置时回系统 intro 模板基线，可直接在其上改）。`get`（全部）/ `describe` 对 instructions 只显字数 `(N chars)`、不回全文，**不能拿来当改写基线**——改写前务必用单项 get 读全文。

---

## 2. goals —— 我的目标（JSON 读写）

一个目标 = 描述 + 状态 + 截止日 + 验收标准 criteria[]。**读写同一套 JSON**：`get` 出来的形状改了直接 `update` 回写。

| 命令 | 说明 |
|---|---|
| `goals schema` | 打印 goal JSON 字段形状 + 说明（发现入口，不确定形状先看它） |
| `goals list [--status not_started\|in_progress\|done]` | 列目标 |
| `goals get <goal_id>` | 取单个目标为可回写 JSON |
| `goals create <json>` | 从 JSON 新建；`<json>` 是 positional 参数：`-`（stdin）/ `@path` / 内联 JSON 字符串（`--json` 只是输出格式开关，与输入无关） |
| `goals update <goal_id> <json>` | 用整份 JSON 回写（criteria 按 id 增量 diff）；`<json>` 取值方式同 create |
| `goals archive <goal_id>` | 归档（软删） |

goal JSON 形状：

| 字段 | 类型 / 取值 | 说明 |
|---|---|---|
| `id` | string | `get` 输出带上；`create` 忽略，`update` 用它匹配 criteria 增量 |
| `description` | string（必填） | 目标描述 |
| `status` | `not_started`\|`in_progress`\|`done` | 目标状态 |
| `deadline` | `YYYY-MM-DD` | 截止日；只能设 / 改，删字段或置空**不会清空**远端（CLI 暂不支持置空） |
| `criteria[]` | array | 每条 `{"id?","description","status":"pending"\|"done"}`；**无 id = 新增** |

```bash
aily-cli user-context goals schema --json          # 先看 JSON 形状
aily-cli user-context goals get g_xxx --json       # get → 改 → update 回写
echo '<改好的完整 JSON>' | aily-cli user-context goals update g_xxx - --json
aily-cli user-context goals get g_xxx --json       # 回读确认真的落库
```

- **改目标 = get → 改 → update 整份回写**：改 criterion 保留其 `id`，加新 criterion 别写 id，删就从 JSON 里去掉。**注意「回写」边界**：criteria 删字段 = 删条目（真 diff）；但 scalar `deadline` 删字段 **≠ 清空**——只能改成新日期，暂无清空路径。
- **create 两个 wire 约束**：① `status` 在 create 时被忽略（一律 not_started），要进行中/完成得 create 后再 update；② criteria 都建成 pending，CLI 会对标了 `done` 的补一刀（best-effort）。
- **非原子**：`update`/`create` 是多次 RPC 顺序执行，中途失败即 `{ok:false,error}`，`get` 看落到哪步、改好重跑；成功输出带 `applied` 列出实际子操作。

---

## 3. contacts —— 紧密协作人名单

| 命令 | 参数 | 说明 |
|---|---|---|
| `contacts list` | — | 列当前关注名单 |
| `contacts add <user_id>` | `[--reason]` | 纳入名单 |
| `contacts remove <user_id>` | `[--reason]` | 移出名单（用**数字 lark_id**；删后自动回查核验，没生效会报错；误删可 `add` 回来） |

> **⚠️ `<user_id>` 是数字 LarkUserID，不是 `ou_` open_id**（后端对 target 做 ParseInt，传 open_id 报错）。`contacts list` 里每条的 `id` 就是可直接用的 user_id。

**⚠️ contacts 没有候选搜索命令**（后端无此能力）。要 add 一个**不在名单里的新人**，先拿到他的 user_id，两步走：

**第一步 · 搜通讯录定位人**（`lark-cli` 通讯录搜索，按姓名/邮箱，返回 open_id + 部门 + 是否有私聊）：
```bash
lark-cli contact search-user --query "<姓名>" --as user
# 可能命中多条同名/近名，如：
#   <姓名>（<部门 A，与你同大部门>）— 有私聊记录
#   <近名>（<部门 B>）— 无聊天记录
# 按部门 + 有无私聊判断哪条是目标 → 取其 open_id（ou_ 开头）
```
命中多条时用**部门 / 有无私聊**这类信号消歧，别瞎猜；拿不准就把候选列给用户挑。

**第二步 · open_id 转 user_id**（`aily-cli id convert`，`--ids` 传 open_id）：
```bash
aily-cli id convert --from open_id --to user_id --ids <ou_xxx>
# → 输出数字 user_id，这就是 contacts add 要的值
```

拿到 user_id 后再走名单增删：
```bash
aily-cli user-context contacts list --json                    # 每条 id 即 user_id
aily-cli user-context contacts add <user_id> --reason "..." --json
aily-cli user-context contacts list --json                    # 回读确认进了名单
aily-cli user-context contacts remove <user_id> --json
```

---

## 4. chats —— 重要群名单

| 命令 | 参数 | 说明 |
|---|---|---|
| `chats list` | — | 列当前关注名单 |
| `chats search <query>` | `[--page-size <n>] [--page-token <t>]` | 搜**候选群**（拿 chat_id；透出 `restricted` 防泄密群标记） |
| `chats add <chat_id>` | `[--reason]` | 纳入名单 |
| `chats remove <chat_id>` | `[--reason]` | 移出名单（误删可 `add` 回来） |

```bash
aily-cli user-context chats search "技术评审" --json          # ① 搜候选拿 chat_id
aily-cli user-context chats add oc_xxxxxxxx --reason "..." --json   # ② 纳入
aily-cli user-context chats list --json                       # ③ 回读确认
```

- `search` 出来的是**候选、还没进名单**；`add` 才写进名单。命中 0 反问、多条列出让用户挑、唯一才直接操作。
- `restricted=true` 是防泄密群，展示时保留标记、别替它做内容转述承诺。

---

## 5. calendar —— 重要日程名单

| 命令 | 参数 | 说明 |
|---|---|---|
| `calendar list` | `[--recurring-only]` | 列当前关注名单；🔁 标循环日程 |
| `calendar search <query>` | `[--start YYYY-MM-DD] [--end YYYY-MM-DD] [--page-size <n>] [--page-token <t>]` | 搜**候选日程**（拿 event_id；日期内部转毫秒） |
| `calendar add <event_id>` | `[--reason]` | 纳入名单 |
| `calendar remove <event_id>` | `[--reason]` | 移出名单（误删可 `add` 回来） |

```bash
aily-cli user-context calendar search "项目评审" --start 2026-07-07 --end 2026-07-14 --json
aily-cli user-context calendar add ev_xxxxxxxx --reason "..." --json
aily-cli user-context calendar list --json
```

- `--start/--end` 都省略时服务端补默认窗（未来 7 天）；纯浏览未来日程可不传。`--end` 含当天（取当天 23:59:59.999）。
- **⚠️ 建/改/删日历日程本身走 `lark-cli`**，本组只管「某个已存在日程要不要进关注名单」。

---

## 6. active-matters —— 活跃事项（只读 + 勾销）

AI 从会话里识别出的、需要用户跟进的高相关事项（待回复/待处理），带来源、期望动作、截止。**只读列表 + 勾销完成，不能新建**。

| 命令 | 参数 | 说明 |
|---|---|---|
| `active-matters list` | `[--status open\|done] [--direction inbound\|outbound]` | 列活跃事项（默认只列 open） |
| `active-matters done <matter_id>` | `[--undo]` | 标记完成；`--undo` 则重新打开 |

```bash
aily-cli user-context active-matters list --json                     # 默认 open
aily-cli user-context active-matters list --direction inbound --json # 只看别人给我的
aily-cli user-context active-matters done m_xxxxxxxx --json          # 标记完成
aily-cli user-context active-matters done m_xxxxxxxx --undo --json   # 重开
```

- 后端只返回 relevance=high 的事项；`list` 默认只给 open，看已完成传 `--status done`。
- `inbound`=别人发起等你跟进；`outbound`=你发起等别人。
- **和 goals/task 的区别**：active-matters 是 AI **自动识别**的待跟进项（只读+勾销）；用户主动记的**目标**用上面的 §2 goals；用户自建的**结构化任务**用 `aily-cli-task`。
