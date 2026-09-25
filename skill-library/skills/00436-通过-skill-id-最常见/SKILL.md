---
name: aily-cli-skillhub
description: 在 Aily skill 市场搜索 / 浏览 / 看版本 / 安装 / 升级 / 卸载，以及上架(publish) / 撤回 / 下架 / 改可见性等市场治理 skill（给当前 agent）。「搜个 skill / 装上这个 skill / 升级 skill / 看 skill 版本 / 发布状态 / 把技能上架 / 撤回上架 / 下架 / 改可见性」都走这里，agent 可直接跑。只有本地 download（落盘大文件）让 user 自己跑。是 **Aily skillhub，不是宿主自带的 skill/plugin 管理，也不是从零创作新 skill（那走 lark-skill-maker）**。
---

## skillhub

**CRITICAL** — 读 / 写边界**严格**：

- **读命令**（search / explore / list / inspect / versions / check-update / publish-status / get-reports）—— agent 可直接跑，带 `--json` 拿结构化输出。
- **skill 生命周期 / 市场治理写命令**（install / upload / uninstall / upgrade / publish / cancel-publish / unlist / change-visibility）—— agent 可直接跑，带 `--json` 拿结构化输出；需要确认的命令（卸载 / 上架 / 撤回 / 下架 / 改可见性）在非交互场景加 `--yes`（漏 `--yes` 会报 `SKILLHUB_REFUSE_NOINPUT`）。
- **文件落盘写命令**（download）—— agent 不直接跑；把命令模板告诉 user，让 user 自己在 shell 里执行。不要擅自往 user 本地落 30MB+ 大文件。

## 通用约定

- 所有命令支持 `--json` 输出（除 `download`）；agent 默认带 `--json`。
- 分页 read 命令（`search` / `explore` / `list` / `versions`）支持 `--page-size <n>` `--page-token <token>`。
- 所有 skill_id 形如 `skill_xxxxxxxx`，从 `search` / `explore` / `list` 返回结果里拿。
- 所有命令走 Gateway（不是本地 daemon），本机文件系统不反映安装状态，必须用 `list` 查询。

---

## 读命令（agent 可直接跑）

### `search` — 关键词搜索市场

```bash
aily-cli skillhub search <query> [--page-size <n>] [--page-token <token>] --json
```

用 query 关键词搜市场技能。返回每条命中含 `skill_id`、`name`、`description`、`tags`、`latest_version` 等。

何时用：user 问"市场上有没有 X 类型的 skill"、或 agent 自己判断"我需要 X 能力，先搜搜看有没有现成 skill"。

### `explore` — 浏览 + 筛选

```bash
aily-cli skillhub explore [--sort <sort>] [--tags <tags>] [--page-size <n>] [--page-token <token>] --json
```

`--sort` 取值如 `popular` / `latest`；`--tags` 逗号分隔。`search` 不带关键词时用 `explore` 当默认浏览入口。

### `list` — 列已安装到当前 agent 的 skill

```bash
aily-cli skillhub list [--keyword <q>] [--page-size <n>] [--page-token <token>] [--agent-id <id>] --json
```

- `--keyword` 名/描述模糊匹配
- `--agent-id` 目标 agent id；缺省回退 `$AILY_CLI_CALLER_AGENT_UID`（daemon 为 agent 子进程注入）

返回 agent 已安装的 skill 列表（含 `skill_id`、`name`、`installed_version`）。

何时用：
- user 问"我装了哪些 skill"
- agent 自检"我能干什么"：这里看 Gateway 视角的安装记录；本地 framework dir 不再通过单独命令暴露给 agent-lite。
- 安装/卸载前确认当前状态

### `inspect` — 查看技能详情 / 文件

```bash
aily-cli skillhub inspect <skill_id> [--version <ver>] [--files] [--file <path>] --json
```

- 默认返回 skill metadata
- `--files`：返回文件树
- `--file <path>`：读取单个文件（服务端限制 200KB）
- `--version` 省略时为 latest

何时用：user 想"看下 X skill 长什么样、能干嘛"再决定要不要装。

### `versions` — 版本发布历史

```bash
aily-cli skillhub versions <skill_id> [--page-size <n>] [--page-token <token>] --json
```

返回该 skill 的所有发布版本，每项含 `version`、`release_notes`、`created_at`。

何时用：install / upgrade 前看历史版本，决定是否指定 `--version`。

### `check-update` — 批量检查更新

```bash
aily-cli skillhub check-update --skill-id <id> [--skill-id <id> ...] --json
```

- 一次最多 50 个 skill_id
- 每个 `--skill-id` 写一次（commander variadic 写法）

返回每个 skill 的 `installed_version` vs `latest_version`，标注 `has_update: true/false`。

何时用：user 问"我装的 skill 有更新吗"，或 agent 自检完 `list` 后顺手检查。

### `publish-status` — 查询上架状态

```bash
aily-cli skillhub publish-status --skill-id <id> --json
```

返回两种 shape：

- **从未上架**：`{status: "not_published", platform_status, published_version?}`
- **有上架记录**：`{submission_id, version_id, status, current_node, platform_status, published_version?, node_history?}`

#### 状态机

**`status`（SubmissionStatus）**：

| 值 | 含义 |
|---|---|
| `not_published` | 从未上架过 |
| `submitted` | 已提交，等待自动检测 |
| `auto_checking` | 自动检测中（质量评估 + 安全扫描） |
| `pending_review` | 检测通过，等待管理员人工审核 |
| `approved` | 审核通过，已上架 |
| `rejected` | 审核拒绝 |
| `withdrawn` | 开发者已撤回 |
| `superseded` | 被新版本上架请求替换 |

**`current_node`（PublishNode）**：`submitted` → `auto_checking` → `pending_review` → `published`。

**`platform_status`（PlatformStatus）**：`normal`（正常上架）/ `taken_down`（已下架）。

#### 回复指引（重要）

**不要**把 `submission_id` / `node_history` / `current_node` 这种原始字段直接列给 user。按下表判断场景，用**一句话**告知 user。规则按顺序匹配，命中即停：

| 条件 | 场景 | 回复模板 |
|---|---|---|
| `status` = `not_published` | 从未提交过 | "该技能尚未提交上架。" |
| `status` ∈ {`submitted`, `auto_checking`, `pending_review`} 且无 `published_version` | 首次发布审核中 | "技能已提交上架，当前 {status 中文}，等待审核完成。" |
| `status` = `approved` 且 `platform_status` 不存在或 = `normal` | 已上架 | "技能已上架，当前版本 {published_version}。" |
| `status` = `approved` 且 `platform_status` = `taken_down` | 已上架但被下架 | "技能已上架（版本 {published_version}），但已被下架，当前不可见。" |
| `status` ∈ {`submitted`, `auto_checking`, `pending_review`} 且有 `published_version` | 已上架，新版本审核中 | "技能当前线上版本 {published_version}，新版本正在审核中（{status 中文}）。" |
| `status` = `rejected` 且无 `published_version` | 首次发布被驳回 | "技能上架申请已被驳回。可用 `get-reports` 查看驳回原因。" |
| `status` = `rejected` 且有 `published_version` | 已上架，新版本被驳回 | "技能当前线上版本 {published_version} 正常，但新版本上架申请已被驳回。可用 `get-reports` 查看原因。" |

status 中文映射：`submitted` → 已提交、`auto_checking` → 自动检测中、`pending_review` → 等待人工审核。

user 追问细节时才展开 `node_history`、`submission_id`。

### `get-reports` — 查看质量 / 安全报告

```bash
aily-cli skillhub get-reports --skill-id <id> [--version-id <id>] [--type all|quality|security] --json
```

- `--type` 默认 `all`，可单看 `quality`（质量评估）或 `security`（安全扫描）
- `--version-id` 省略时取 latest

返回字段：

| 字段 | 含义 |
|---|---|
| `quality_reports` | 质量评估报告列表，每项含 `report_id`、`type`、`created_at`、`status` |
| `security_reports` | 安全扫描报告列表，每项含 `report_id`、`type`、`created_at`、`status` |
| `security_detail` | 安全报告详情（`--type` 非 quality 时返回），含 `score`、`risk_level`（`low`/`medium`/`high`）、`result` |

何时用：`publish-status` 显示 `rejected` 或 `taken_down` 时查具体原因；user 主动问"我那个 skill 安全评分多少"。

---

## 写命令（按风险分层）

agent 直接执行 skill 生命周期写命令与市场治理写命令（`publish` / `cancel-publish` / `unlist` / `change-visibility`）时默认带 `--json`；需要确认且运行在非交互场景时加 `--yes`（否则报 `SKILLHUB_REFUSE_NOINPUT`）。只有 `download` 仍只给 user 命令模板，不由 agent 执行。

### `install` — 安装 skill 到当前 agent

```bash
# 通过 skill id（最常见）
aily-cli skillhub install --skill-id <skill_id> [--version <ver>] [--agent-id <id>]

# 或通过分享链接
aily-cli skillhub install --shared-skill <link_token> [--agent-id <id>]
```

`--skill-id` 和 `--shared-skill` **互斥**，必须二选一。`--shared-skill` 取值是分享 URL 里 `shared_skill=` 参数的值（不是完整 URL）。省略 `--version` 取 latest。`--agent-id` 指定目标 agent，缺省回退 `$AILY_CLI_CALLER_AGENT_UID`（daemon 为 agent 子进程注入）。

何时直接跑：
- agent 在执行任务时意识到"我需要 X skill 才能完成"——先用 `search` / `inspect` 确认目标，再执行安装
- user 看完 `search` / `inspect` 后说"装上吧"——直接执行安装

### `upload` — 上传本地 zip 创建或更新 skill

```bash
# 创建 skill
aily-cli skillhub upload --file ./code-review-skill.zip

# 更新已有 skill 包
aily-cli skillhub upload --file ./code-review-skill.zip --skill-id <skill_id>
```

不传 `--skill-id` 表示创建，传 `--skill-id` 表示替换已有 skill 包。`--file` 必须是本地 zip；CLI 会先本地校验，再通过 Gateway 发送给服务端。更新场景只替换包版本，不额外改变安装目标。

上传 zip 约束：
- 只能包含一个根目录；根目录名必须符合 `^[a-z][a-z0-9_-]{0,63}$`。
- 根目录下必须有 `SKILL.md`，且 YAML frontmatter 必须包含 `name` 和 `description`。
- `SKILL.md` 的 `name` 必须和根目录名完全一致。
- 使用 `--skill-id` 更新已有 skill 时，不支持修改 `SKILL.md` 的 `name`；保留原 name，确需改名则创建新 skill。
- ZIP entry 必须是根目录下的安全相对路径，不得包含路径穿越、绝对路径、反斜杠、空路径段、控制字符或双向文本控制字符。
- 不要打包隐藏文件 / 目录、可执行文件、密钥、重复大小写路径或 symlink。
- CLI 本地预检不按文件后缀硬编码准入；扩展名业务准入以服务端当前生效的 `blocked_extensions` 配置为准。
- CLI 校验只负责稳定的本地打包与安全规则，不等同于服务端全部能力；服务端拒绝时会返回 path、actual、当前 limit 和 fix。
- 如果 CLI 返回 `SKILLHUB_ZIP_VALIDATION_FAILED`，按 `stage/rule/path`（或 `field`）`/actual/limit/fix` 修包后重新打 zip，不要原样重试。

标准 ZIP 打包示例（从 skill 根目录的父目录执行）：

```bash
zip -r code-review-skill.zip code-review-skill/
aily-cli skillhub upload --file ./code-review-skill.zip
```

### `uninstall` — 从当前 agent 卸载 skill

```bash
aily-cli skillhub uninstall <skill_id> [--agent-id <id>]
# 或非交互模式（CI / 脚本）
aily-cli skillhub uninstall <skill_id> --yes
```

注意：bare arg，不是 `--skill-id` flag。`--agent-id` 指定目标 agent，缺省回退 `$AILY_CLI_CALLER_AGENT_UID`（daemon 为 agent 子进程注入）。

### `upgrade` — 升级已安装的 skill

```bash
aily-cli skillhub upgrade --skill-id <skill_id> [--version <ver>] [--agent-id <id>]
# 强制降级
aily-cli skillhub upgrade --skill-id <skill_id> --version <older_ver> --force
```

skill 必须已经在当前 agent 装过（首次安装走 `install`）。`--force` 允许版本回退。`--agent-id` 指定目标 agent，缺省回退 `$AILY_CLI_CALLER_AGENT_UID`（daemon 为 agent 子进程注入）。

### `publish` — 提交技能上架（agent 可直接跑）

```bash
aily-cli skillhub publish --skill-id <skill_id> --visibility <tenant|platform>
# 非交互模式（agent / CI / 脚本）必须带 --yes，否则报 SKILLHUB_REFUSE_NOINPUT
aily-cli skillhub publish --skill-id <skill_id> --visibility <tenant|platform> --yes --json
```

agent 可直接提交当前技能上架；非交互场景务必带 `--yes`。

`--visibility` 含义：

| 值 | 可见范围 |
|---|---|
| `tenant` | 仅租户内 |
| `platform` | 全平台（需平台 review） |
| `partial_users` | **CLI 不支持**（需要 entity 列表，请走 GUI） |

后端固定取技能 latest 版本，不接受指定历史版本。

返回字段：

| 字段 | 含义 |
|---|---|
| `submission_id` | 本次上架请求 ID |
| `status` | SubmissionStatus（通常 `auto_checking` 或 `pending_review`） |
| `current_node` | PublishNode |

### `cancel-publish` — 撤回上架请求（agent 可直接跑）

```bash
aily-cli skillhub cancel-publish --submission-id <submission_id>
# 非交互（agent / CI / 脚本）必须带 --yes，否则报 SKILLHUB_REFUSE_NOINPUT
aily-cli skillhub cancel-publish --submission-id <submission_id> --yes --json
```

注意：用 `--submission-id`，**不是 skill_id**。先用 `publish-status --skill-id <id>` 拿到 `submission_id`。返回 `{status: "withdrawn"}`。

### `unlist` — 已上架技能下架（agent 可直接跑）

```bash
aily-cli skillhub unlist --skill-id <skill_id>
# 非交互必须带 --yes，否则报 SKILLHUB_REFUSE_NOINPUT
aily-cli skillhub unlist --skill-id <skill_id> --yes --json
```

下架后用户不可见、不可安装。返回 `{status: "unlisted"}`。

### `change-visibility` — 修改可见性范围（agent 可直接跑）

```bash
aily-cli skillhub change-visibility --skill-id <skill_id> --visibility <tenant|platform>
# 非交互必须带 --yes，否则报 SKILLHUB_REFUSE_NOINPUT
aily-cli skillhub change-visibility --skill-id <skill_id> --visibility <tenant|platform> --yes --json
```

- 缩小范围（platform → tenant）：直接生效
- 扩大范围（tenant → platform）：可能进入 re-review（响应里 `requires_re_review: true`，并返回新 `submission_id`）

返回字段：

| 字段 | 含义 |
|---|---|
| `visibility_changed` | `true`＝直接生效；`false`＝进入审批未即时生效 |
| `requires_re_review` | 扩大范围且租户为人工审核模式时为 `true` |
| `submission_id` | 扩大范围时新建的上架请求 ID（缩小时无此字段） |

### `download` — 下载技能 zip

```bash
aily-cli skillhub download --skill-id <skill_id> [--version <ver>] [-o <output_path>]
```

下载技能 zip 到本地。默认文件名取自服务端响应，省略 `-o` 时落在当前 cwd。

为什么是 USER：会在 user 文件系统产文件，可能 30MB+，agent 不直接落盘。user 想拿包再装到其他环境 / 看里面文件结构时用；否则看文件结构优先用 `inspect --files` / `inspect --file`。

---

## 命令边界

- 操作粒度是技能**整体**（安装/卸载/升级），不涉及技能**内部文件**的创建和编辑。要看文件内容用 `inspect --file <path>`。
- skillhub 不直接管 agent 跟 skill 的绑定关系。绑定关系由 daemon 在 install 时记录。
- 卸载 / 下架不会删 user 之前下载的 zip。

## 权限

R-tier 用于所有读命令。`install` / `upgrade` / `uninstall` 属于 agent 可执行 W-self，用于更新当前 agent 的 skill 绑定；Gateway 从 session / caller 身份解析当前 agent。市场治理写命令 `publish`（上架）/ `cancel-publish`（撤回）/ `unlist`（下架）/ `change-visibility`（改可见性）也归 agent 可执行（W-self / RUN，非交互带 `--yes`），由 agent 直接对当前技能操作。只有 `download` 属于本地文件落盘写，保持 user 执行。无 `AILY_CLI_CALLER_AGENT_UID` 强校验。

## 命令速查表

| Verb | 类型 | 主要 args |
|---|---|---|
| `search <query>` | R / RUN | `--page-size` `--page-token` |
| `explore` | R / RUN | `--sort` `--tags` `--page-size` `--page-token` |
| `list` | R / RUN | `--keyword` `--page-size` `--page-token` `--agent-id` |
| `inspect <skill_id>` | R / RUN | `--version` `--files` `--file` |
| `versions <skill_id>` | R / RUN | `--page-size` `--page-token` |
| `check-update` | R / RUN | `--skill-id` (repeatable, max 50) |
| `publish-status` | R / RUN | `--skill-id` |
| `get-reports` | R / RUN | `--skill-id` `--version-id` `--type` |
| `install` | W-self / RUN | `--skill-id`/`--shared-skill` `--version` `--agent-id` `--json` |
| `upload` | W-self / RUN | `--file` `--skill-id` `--json` |
| `uninstall <skill_id>` | W-self / RUN | `--yes` `--agent-id` `--json` |
| `upgrade` | W-self / RUN | `--skill-id` `--version` `--force` `--agent-id` `--json` |
| `download` | W / USER | `--skill-id` `--version` `-o` |
| `publish` | W-self / RUN | `--skill-id` `--visibility` `--yes` `--json` |
| `cancel-publish` | W-self / RUN | `--submission-id` `--yes` `--json` |
| `unlist` | W-self / RUN | `--skill-id` `--yes` `--json` |
| `change-visibility` | W-self / RUN | `--skill-id` `--visibility` `--yes` `--json` |
