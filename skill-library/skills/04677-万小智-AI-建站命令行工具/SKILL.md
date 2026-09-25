---
name: wxz-cli
description: |
  万小智 (Wan Xiao Zhi) AI 建站平台 CLI 工具。用于通过自然语言对话创建、预览和部署网站。
  Triggers: "wxz", "万小智", "建站", "website builder", "chat start", "deploy", "preview",
  "domain bind", "code tree", "sandbox", "灵感值", "inspiration", "发布网站", "对话建站"
---

# wxz CLI — 万小智 AI 建站命令行工具

万小智是阿里云上的 AI 对话建站平台，通过自然语言对话自动生成网站代码并部署上线。

**架构:** `wxz CLI → POP API (websitebuild.aliyuncs.com) → 万小智 AI Agent → 沙箱 → CDN`

## Installation

### 从 PyPI 安装

```bash
pip install wxz-cli
```

安装后 `wxz` 命令全局可用。验证安装:

```bash
wxz --version
wxz --help
```

### 依赖

- Python 3.9+
- 阿里云 AccessKey (AK/SK)，需有万小智 (websitebuild) 产品的访问权限
- 依赖包: click, rich, httpx, alibabacloud_tea_openapi, alibabacloud_credentials

### 配置文件位置

| 文件 | 用途 |
|------|------|
| `~/.wxz/session.json` | 会话状态（AK/SK、biz_id、conversation_id、phase、platform 等） |
| `~/.wxz/config.json` | 全局配置（region、profile） |
| `.wxz/config.json` | 项目级配置（当前绑定的项目与会话） |

## Authentication — 登录认证

`wxz login` 支持三种凭证来源，按优先级选择：

1. **显式传入 AK/SK**（`--ak` / `--sk`）。
2. **阿里云默认认证链**：环境变量 → `~/.aliyun/config.json` 共享配置 → ECS/ECI RAM 角色。
3. **交互式提示输入 AK/SK**。

```bash
# 使用阿里云默认认证链登录（推荐 CI/容器/已配置 aliyun CLI 的环境）
wxz login

# 交互式登录（未配置认证链时提示输入 AK/SK）
wxz login

# 参数方式登录
wxz login --ak <ACCESS_KEY_ID> --sk <ACCESS_KEY_SECRET>

# 指定 region 和 endpoint
wxz login --ak LTAI... --sk abc... --region cn-hangzhou --endpoint websitebuild.aliyuncs.com

# Federation 免密 SSO 登录（必须使用显式 AK/SK，登录后自动打开浏览器跳转控制台）
wxz login --ak LTAI... --sk abc... --role-arn acs:ram::1234567890123456:role/MyWxzRole

# Federation 登录，不自动打开浏览器，仅输出登录 URL
wxz login --ak LTAI... --sk abc... --role-arn arn... --no-browser

# 查看当前身份（本地会话 + 云端 STS）
wxz whoami

# 退出登录（清除本地凭据）
wxz logout
```

login 选项:

| 选项 | 简写 | 默认值 | 说明 |
|------|------|--------|------|
| `--access-key-id` | `--ak` | — | 阿里云 AccessKey ID |
| `--access-key-secret` | `--sk` | — | 阿里云 AccessKey Secret |
| `--profile` | — | `default` | 凭据 profile 名称 |
| `--region` | — | `cn-hangzhou` | 阿里云 region |
| `--endpoint` | — | `websitebuild.aliyuncs.com` | POP endpoint |
| `--role-arn` | — | — | RAM role ARN，用于 Federation 控制台 SSO 登录（不支持认证链） |
| `--destination` | — | `https://wanxiaozhi.aliyun.com/` | SSO 登录后跳转的控制台地址 |
| `--no-browser` | — | false | 不自动打开浏览器 |

使用认证链登录时，系统不会把链上获取到的临时凭据持久化到 `~/.wxz/session.json`，每次请求仍会重新解析认证链。显式 AK/SK 登录时，凭据保存在 `~/.wxz/session.json`（权限 0600）。`whoami` 会同时显示本地会话信息和云端 STS 身份（账号 ID、身份类型、Arn、主体 ID）。

## Core Workflow — 对话建站

完整的建站流程: 需求收集 → PRD 生成 → 代码生成 → 预览 → 部署。在 `chat start` / `chat send` / `chat generate` 执行过程中，session 的 phase 会自动随阶段变更：`prd`（需求/PRD 阶段）→ `generate_code`（代码生成阶段）。

### chat 命令选择指南

根据场景选择正确的 chat 命令，**避免不必要的 chat send 调用**：

| 场景 | 命令 | 是否需要后续 chat send |
|------|------|----------------------|
| 一次性建站（推荐） | `wxz chat start "<需求>" --yes` | **不需要**，端到端自动完成 |
| 需要交互确认 | `wxz chat start "<需求>"` | 可能需要，等 interrupt 后再 send |
| 仅收集需求 | `wxz chat start "<需求>" --no-input` | 需要，后续用 `chat send` 补充 |
| 对已有会话追加需求 | `wxz chat send "<内容>"` | — |
| PRD 已完成，仅触发代码生成 | `wxz chat generate` | — |

**核心原则：**
- `--yes` 表示**全自动模式**：跳过所有交互确认，自动走完 需求收集 → PRD → 代码生成 全流程。执行过程中即使 CLI 输出显示 "Collecting requirements"、弹出表单或提示 "Please answer the following"，`--yes` 也会自动填写默认值并继续，**严禁在此过程中调用 `chat send`**。
- `chat start --yes` 启动后，**唯一正确的做法是持续轮询同一个后台进程**，等待其输出 `Code generation complete!` 或购买页 URL，然后进入 preview / deploy。
- `chat send` **仅用于**对已有会话追加消息（如修改需求、补充信息），不要在 `chat start --yes` 执行过程中或成功后调用。
- 如果 `chat start --yes` 执行后状态显示 error，应先检查日志排查原因，而不是盲目重试 `chat send`。

## 执行策略：后台运行 chat 命令

`chat start`、`chat send`、`chat generate` 均为长时间运行的 SSE 流式命令（通常 1~5 分钟），**必须使用后台方式执行**，避免阻塞 agent 主流程：

1. **后台启动**：使用 `is_background=true` 运行 chat 命令，记下返回的 `terminal_id`。
2. **轮询输出并同步进度**：每隔 15~20 秒通过 `GetTerminalOutput(terminal_id)` 查看后台进程输出，**每次检查后必须向用户发送一条可见消息同步当前进度**（如"正在收集需求…"、"PRD 生成中…"、"代码生成中…"），不能在一个 turn 里连续静默轮询。
   - **特别注意**：轮询时若看到 "Please answer the following" 或需求收集表单，不要新开 `chat send` 去回复。`--yes` 会自动填表并继续，应继续等待同一后台进程。
3. **判断完成**：当输出中出现 `Code generation complete!` 或购买页 URL 时，表示流程完毕，可继续后续操作（预览、部署等）。
4. **异常处理**：若输出中出现 error 或进程已退出但无成功标志，根据日志排查原因。禁止在未分析日志的情况下立刻重试 `chat send`。

```
# 典型后台执行流程（--yes 全自动模式，无需 chat send）：
# Step 1: 后台启动 chat（记下 terminal_id）
wxz chat start "做一个科技公司官网" --yes        # is_background=true

# Step 2: 轮询输出（每次检查后向用户同步进度）
# GetTerminalOutput → 告诉用户当前阶段 → 等 15~20s → 再次 GetTerminalOutput → ...
# 看到 "Code generation complete!" 或购买页 URL 即表示完成

# Step 3: 预览效果
wxz preview

# Step 4: 提示用户前往控制台购买站点（发布前必须完成）
# 打开购买页面（需要 conversation_id，可从 session 或后台输出获取）
# https://wanxiaozhi.aliyun.com/webdesign/home#/ai/preview?conversationId={conversation_id}

# Step 5: 发布上线（确认购买后再执行）
wxz deploy publish --watch                        # is_background=true
```

### chat start 会话初始化流程

`chat start` 不再预先调用 `CreateAIStaffConversation` 创建会话，而是直接调用 `CreateAppChat` SSE 接口：

1. 直接发起 `CreateAppChat` 流式请求（仅携带 `BotId` 和 `Messages`）。
2. `ChatRenderer` 消费 SSE 事件：
   - 从 `message.delta` / `message.completed` / `message.tool` / `message.tool.delta` / `message.interrupt` 等 `message.*` 事件的 `data.conversationId` 字段提取 `conversation_id`
   - 从 `chat.processing` 事件的 `data.chatId` 字段提取 `chat_id`
3. SSE 流结束后，使用 `conversation_id` 调用 `GetAppConversation` 接口，从返回数据（`Module.siteId` / `SiteId` / `bizId` / `BizId`）中解析 `siteId`（即 CLI 中的 `biz_id`）。
4. 将 `biz_id`、`conversation_id`、`chat_id`、`phase`、`platform` 写入 `~/.wxz/session.json` 和当前目录的 `.wxz/config.json`。
5. 继续后续阶段：如遇 `message.interrupt` 则收集表单答案 → 恢复生成 PRD → 进入 `generate_code` 阶段生成代码。

```bash
# 开始对话（全流程: 需求收集 → PRD → 代码生成）
wxz chat start "帮我做一个科技公司官网"

# 自动模式（跳过交互确认，自动生成代码）
wxz chat start "做一个餐厅官网" --yes

# 不自动弹出发布页面
wxz chat start "做一个商城" --no-publish

# 仅需求收集，不自动继续（后续用 chat send 补充信息）
wxz chat start "做一个个人博客" --no-input

# 指定技能/插件（如 OCR 识别）
wxz chat start "做一个带身份证识别的表单页面" --skill ocr-ai

# 生成小程序（默认为 web）
wxz chat start "做一个外卖点餐小程序" --platform miniprogram

# 补充信息（如有 interrupt，传入 JSON 或文本）
wxz chat send '{"应用名称": "MySite", "主营服务": "Tech"}'

# 补充信息时指定技能
wxz chat send "添加银行卡识别功能" --skill ocr-ai

# 单独触发代码生成（PRD 已完成时）
wxz chat generate

# 查看聊天状态
wxz chat status

# 查看聊天记录
wxz chat history
```

chat start 选项:

| 选项 | 说明 |
|------|------|
| `--staff-no` | Staff bot ID（默认 Zero2） |
| `--model` | 模型名称（默认 qwen3.5） |
| `--skill` | 插件/技能 ID（如 `ocr-ai`），通过 metadata 的 `_CODE_AGENT_SKILL_ID` 传给 AI Agent |
| `--platform` | 目标平台：`web`（默认）或 `miniprogram`，仅在会话开始时设置 |
| `--yes` / `-y` | 自动接受默认值，端到端生成 |
| `--no-input` | 不提示输入，停在 interrupt 后后续用 `chat send` 补充 |
| `--no-publish` | 代码生成完成后不自动打开/显示发布页面 |

chat send 选项:

| 选项 | 说明 |
|------|------|
| `--model` | 模型名称（默认 qwen3.5） |
| `--skill` | 插件/技能 ID（如 `ocr-ai`） |

`chat generate` 选项:

| 选项 | 说明 |
|------|------|
| `--model` | 模型名称（默认 qwen3.5） |

## Preview — 预览

```bash
# 打开预览（自动打开浏览器）
wxz preview

# 仅输出 URL，不打开浏览器
wxz preview --url-only

# 重启沙箱后预览
wxz preview --restart
```

## Deploy — 部署发布

**前置条件：** 发布前必须先到站点购买页面完成开通，否则发布会失败。购买地址：`https://wanxiaozhi.aliyun.com/webdesign/home#/ai/preview?conversationId={conversation_id}`（conversation_id 可从 `wxz chat status` 或 `~/.wxz/session.json` 获取）。

发布流程通常需要 1~3 分钟，建议使用后台方式执行 `deploy publish`：

```bash
# 发布并实时跟踪进度（步骤进度条 + Live 轮询）
wxz deploy publish --watch                        # is_background=true

# 轮询发布状态
wxz deploy status

# 指定渠道（WEAPP 为小程序）
wxz deploy publish --channel WEAPP

# 发布历史
wxz deploy history

# 回滚到指定版本
wxz deploy rollback <publish_number>
```

发布进度步骤: `插件检查 → 初始化 → 构建 → OSS 同步 → CDN 刷新 → 完成`

## Domain — 自定义域名

```bash
# 绑定域名
wxz domain bind example.com

# 绑定并跟踪进度
wxz domain bind example.com --watch

# 绑定时覆盖已有 DNS 记录
wxz domain bind example.com --overwrite

# 指定操作类型
wxz domain bind example.com --operate-type START_DOMAIN_BIND

# 查看域名详情（验证、解析、证书状态）
wxz domain describe example.com

# 查看绑定进度（一次性渲染）
wxz domain status example.com

# 持续监控绑定进度
wxz domain status example.com --watch

# 列出所有域名
wxz domain list

# 按关键词过滤域名列表
wxz domain list --keyword example

# 解绑域名
wxz domain unbind example.com
```

域名绑定进度步骤: `域名绑定 → DNS 配置 → DNS 验证 → 证书设置 → 完成`

domain bind 的 `--operate-type` 可选值:
- `START_DOMAIN_BIND`（默认）— 开始域名绑定
- `SUBMIT_VERIFY_DNS` — 提交 DNS 验证
- `SET_CERTIFICATE` — 设置证书
- `MIGRATE_DOMAIN` — 迁移域名

`domain status --watch` 会在绑定完成后自动停止；若失败则提示前往域名管理页面继续操作。

## Projects — 项目管理

```bash
# 列出所有项目
wxz projects list

# 分页
wxz projects list --page-num 1 --page-size 20

# 查看项目详情
wxz projects info [biz_id]

# 将当前目录绑定到指定项目（自动解析 phase 和 platform）
wxz projects use [biz_id]

# 指定 bot
wxz projects use [biz_id] --bot-id Zero2
```

`projects use` 会调用 `SwitchAppConversation` 获取或创建该项目的活跃会话，并把 `bizId`、`conversationId`、`phase`、`platform` 写入 `~/.wxz/session.json` 和当前目录的 `.wxz/config.json`。`biz_id` 未提供时会从当前 session 或 `.wxz/config.json` 中解析。

## Code — 代码查看（只读）

```bash
# 查看沙箱目录结构
wxz code tree

# 查看指定目录
wxz code tree src/components

# 查看文件内容
wxz code cat package.json

# 列出代码快照版本
wxz code versions

# 回滚到指定快照
wxz code rollback <snapshot_id>
```

## Conversation — 会话管理

```bash
# 列出会话
wxz conversation list

# 按站点 ID 过滤
wxz conversation list --site-id <biz_id>

# 按时间范围过滤（ISO8601，最大 30 天）
wxz conversation list --start-time 2026-01-01T00:00:00Z --end-time 2026-01-31T23:59:59Z

# 查看会话详情
wxz conversation get [conversation_id]
wxz conversation get [conversation_id] --bot-id Zero2

# 绑定当前目录到指定会话（自动解析 phase 和 platform）
wxz conversation use <conversation_id>
wxz conversation use <conversation_id> --bot-id Zero2

# 切换到指定项目的会话
wxz conversation switch <biz_id>
wxz conversation switch <biz_id> --bot-id Zero2 --task-type <task_type>

# 查看会话消息列表（分页）
wxz conversation messages [conversation_id] --page-size 20

# 基于游标翻页（上一页最后一条消息的创建时间）
wxz conversation messages [conversation_id] --page-size 20 --start-time <ISO8601>

# 查看指定聊天轮次的消息
wxz conversation chat-messages [conversation_id] --chat-id <chat_id>

# 查看会话锁定状态
wxz conversation lock-status [conversation_id]
```

## Account — 账号与灵感值

```bash
# 查看账号信息、云端身份、灵感值余额
wxz account
```

输出包括:
- **身份信息**: 账号 ID、身份类型、Arn、主体 ID（来自 STS GetCallerIdentity）
- **账号信息**: 用户名、套餐
- **灵感值**: 可用余额、累计获得、累计消耗、已过期

## Info — 环境信息

```bash
# 查看项目环境约束、技术栈、CLI 快速参考
wxz info
```

## Plugins — 技能/插件管理

```bash
# 列出当前项目可用的技能/插件（使用 session 中的 phase）
wxz plugins list

# 指定项目
wxz plugins list --biz-id <biz_id>
```

技能/插件是 AI Agent 在代码生成阶段可以调用的增强能力（如 OCR 识别、表单生成等）。`plugins list` 默认使用 session 中的 phase（由 chat 流程或 `conversation use` 自动维护），并只展示 `enabled=1` 的已启用插件。使用 `wxz plugins list` 查看可用技能 ID，然后通过 `--skill` 选项在对话中激活:

```bash
wxz chat start "做一个带身份证识别的表单页面" --skill ocr-ai
```

## Global Options

所有命令支持的公共选项（放在子命令前）:

| 选项 | Env Var | 说明 |
|------|---------|------|
| `--base-url` | `WXZ_BASE_URL` | POP 网关地址（默认 `https://websitebuild.aliyuncs.com`） |
| `--biz-id` | `WXZ_BIZ_ID` | 项目实例 ID |
| `--conversation-id` | `WXZ_CONVERSATION_ID` | 会话 ID |
| `--json` | — | JSON 格式输出（适用于脚本集成） |
| `--dry-run` | — | 仅显示将执行的操作 |
| `--verbose` / `-v` | — | 在 stderr 显示 API 请求摘要 |
| `--debug` | — | 在 stderr 显示完整 API 请求/响应详情 |

示例: `wxz --json deploy status` 输出 JSON 格式的发布状态。`wxz conversation use <conv_id>` 会自动解析会话的 phase 和 platform 并更新 session；chat 执行过程中 phase 也会随阶段自动变更，不需要手动设置。

## Technical Constraints

沙箱环境约束:

| Constraint | Value |
|------------|-------|
| 包管理器 | pnpm |
| 路由模式 | Hash 路由 (createHashRouter) |
| 支持框架 | React, Vue, Taro |
| 不支持 | Angular, Svelte, Next.js, Nuxt |
| 禁止 | 启动后端服务器 (Express / Koa / FastAPI) |

## Workflow Example

典型的端到端建站流程:

```bash
# 1. 安装
pip install wxz-cli

# 2. 登录
wxz login --ak LTAI... --sk abc...

# 3. 开始对话建站（自动模式）
wxz chat start "帮我做一个科技公司的官网，要有产品介绍、关于我们、联系方式页面" --yes

# 4. 预览效果
wxz preview

# 5. 如果需要修改，继续对话
wxz chat send "把首页的 hero 区域改成深色主题"

# 6. 查看代码结构
wxz code tree
wxz code cat package.json

# 7. 前往购买页面完成站点开通（发布前必须完成）
# https://wanxiaozhi.aliyun.com/webdesign/home#/ai/preview?conversationId={conversation_id}

# 8. 发布上线（确认购买后再执行）
wxz deploy publish --watch

# 9. 绑定自定义域名
wxz domain bind www.example.com --watch

# 10. 查看绑定进度/详情，根据提示在域名服务商处添加 DNS 记录
wxz domain status www.example.com --watch
wxz domain describe www.example.com

# 11. 查看账号与灵感值余额
wxz account
```

## 万小智帮助文档索引与获取方式

万小智官方帮助文档持续更新，完整索引和核心要点速览见 [HELP_INDEX.md](HELP_INDEX.md)。agent 也可动态拉取最新文档：

```bash
curl 'https://help.aliyun.com/help/json/menupath.json?nodeId=3039206&website=cn&language=zh&channel='
```

返回 JSON 的 `data.children` 为文档树，每篇文章包含 `id`、`title` 等字段。单篇文章 URL：`https://help.aliyun.com/zh/document_detail/{id}.html`，`{id}` 替换为对应文章 ID。

## FAQ — 常见问题与故障排查

使用 wxz CLI 或万小智产品时遇到的常见业务、功能、操作问题，详见本技能目录下的 [FAQ.md](FAQ.md)。该文件整理了阿里云帮助中心「常见问题」章节的完整内容，并补充了 CLI 使用中的高频问题。

## Product Docs

- 产品文档: https://help.aliyun.com/zh/product/3039206.html
- 灵感值购买: https://dc.console.aliyun.com/#/inspiration
- 常见问题源文档:
  - [售后服务方式](https://help.aliyun.com/zh/document_detail/3039541.html)
  - [业务相关 FAQ](https://help.aliyun.com/zh/document_detail/3039542.html)
  - [功能相关 FAQ](https://help.aliyun.com/zh/document_detail/3039543.html)
  - [操作相关 FAQ](https://help.aliyun.com/zh/document_detail/3039544.html)
