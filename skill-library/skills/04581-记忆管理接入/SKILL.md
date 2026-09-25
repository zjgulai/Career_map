---
name: polarmem0-onboarding
description: 引导安装并接入 PolarDB-PG 记忆管理（polarmem0 CLI），为 Qoder / QoderWork 开启长时记忆的自动召回与自动沉淀。当用户提到"接入记忆 / 开启长期记忆 / 安装 polarmem0 / 配置 PolarDB 记忆管理 / 记忆没生效 / 卸载记忆"等场景时使用。
---

# PolarDB-PG 记忆管理接入

## 1. 什么时候用这个 skill

- 用户要**首次接入**：说"接入记忆""开启长期记忆""安装 polarmem0""配置 PolarDB 记忆管理"
- 用户反馈**记忆没生效**：说"记忆没记住""没有召回""怎么不自动记了" → 直接跳到 §7 排查
- 用户要**卸载** → 跳到 §8

**何时不适用**：用户只是想写入/检索某条记忆（而非安装配置）。接入完成后，CLI 会安装一份 `polarmem0-memory` skill 负责日常记忆操作，交由它处理。

## 2. 先确认当前接入状态

无论用户的诉求是首次接入还是排查，都先执行一次状态检查，避免重复安装或覆盖已有配置：

```sh
polarmem0 status --agent qoder --json
```

（QoderWork 用户把 `qoder` 换成 `qoderwork`；若尚不确定客户端类型，先按 §4 确认。）

按结果分流：

| 结果 | 处理 |
| --- | --- |
| 命令不存在（`command not found`） | 尚未安装，从 §3 开始完整流程 |
| `connected`、`hooks_installed`、`skill_installed` 三项均为 `true` | **已接入，不要重装**。告知用户当前状态，并询问是否需要更换服务端点/API Key、调整 `user_id` 或卸载；用户无进一步需求则结束 |
| 命令可用但存在 `false` 项 | 已安装但配置不完整，跳到 §7 排查 |

## 3. 前置检查

先确认 Node.js 版本满足要求（需 20 及以上）：

```sh
node -v
```

- 版本 ≥ v20：继续
- 版本 < v20 或命令不存在：**告知用户需先安装 Node.js 20+，不要擅自修改用户的 Node 环境或版本管理器配置**，等用户处理好再继续

## 4. 向用户索取两项信息

接入需要用户提供以下两项，缺一不可。若用户未提供，明确询问，不要猜测或使用示例值：

| 信息 | 说明 |
| --- | --- |
| API Key | PolarDB-PG 记忆管理的访问凭证（控制台参数 `secret.access.apikey`） |
| 服务端点 | 形式为 `http://<host>:<port>`，即记忆管理的连接地址 |

同时确认用户使用的客户端是 **Qoder** 还是 **QoderWork**，后续命令的 `--agent` 取值据此决定（`qoder` 或 `qoderwork`）。

## 5. 安装 CLI

**执行前必须向用户说明这是全局安装并取得同意**，用户拒绝则停止流程。

```sh
npm install -g @aliyunpolar/polarmem0
```

安装缓慢时可改用镜像源：

```sh
npm install -g @aliyunpolar/polarmem0 --registry=https://registry.npmmirror.com/
```

## 6. 执行接入并验证

1. 接入配置（将 `<API_KEY>`、`<host>`、`<port>` 替换为用户提供的实际值；QoderWork 用户把 `qoder` 换成 `qoderwork`）：

   ```sh
   polarmem0 setup --agent qoder --api-key <API_KEY> --base-url http://<host>:<port>
   ```

   该命令会写入配置、注册生命周期 Hooks、安装 `polarmem0-memory` skill，并校验连通性与 Key 有效性。命令输出中任一步骤失败时，按 §7 排查，不要重复盲试。

2. 告知用户**需重启客户端（新开一个会话）**，Hooks 与 skill 仅在会话启动时加载。

3. 验证结果：

   ```sh
   polarmem0 status --agent qoder --json
   ```

   输出中 `connected`、`hooks_installed`、`skill_installed` 三项均为 `true` 表示接入成功；把结果展示给用户。

**可选**：多人共用同一服务实例时，可在 `setup` 时追加 `--user-id <id>` 隔离各自的记忆（默认值为 `default`）。是否需要请询问用户，不要擅自设定。

## 7. 排查

先执行 `polarmem0 status --agent <qoder|qoderwork> --json`，再按下表对症处理：

| 现象 | 原因与处理 |
| --- | --- |
| `connected: false`，报 401 | API Key 不正确或已失效。请用户核对后重跑 §6 步骤 1 |
| `connected: false`，连接失败/超时 | 端点地址或网络不通。确认端点形式为 `http://<host>:<port>`，并提醒用户客户端所在环境需与服务网络连通（必要时将本机 IP 加入服务白名单） |
| `hooks_installed` 或 `skill_installed` 为 `false` | 重新执行一次 `polarmem0 setup --agent <qoder\|qoderwork>` 即可修复，**无需重新传入 API Key 与端点**（配置会保留） |
| 三项均 `true`，但记忆未自动召回/沉淀 | 用户未重启客户端。提醒新开一个会话后再试 |

## 8. 卸载

**顺序不能颠倒**，否则会残留失效的 Hooks 配置：

```sh
polarmem0 uninstall --agent qoder
npm uninstall -g @aliyunpolar/polarmem0
```

## 9. 安全须知

在引导过程中向用户说明以下事项：

- API Key 会以明文保存在 `~/.polarmem0/config.json`，请勿将该文件提交到代码库。
- `setup` 命令包含 API Key，会留在 shell 历史记录中；如有顾虑，可在接入完成后清理对应历史条目。
- 端点使用 HTTP 时，凭证与记忆内容在网络上未加密传输，适用于 VPC/内网环境；公网环境建议使用 HTTPS。
- 不要在对话中复述用户的 API Key，也不要将其写入任何项目文件。
