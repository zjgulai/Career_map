---
name: dsh-desktop-diagnostics
description: Diagnose and fix DSH Desktop (DeepSeek Harness) startup failures, plugin incompatibilities, and functional bugs (加载更早/输入框/侧边栏/复制按钮/IM机器人/上下文溢出等). Covers recovery-mode entry, missing services/exports, rc-vs-alpha version divergence, duplicate loader entry ids, silent client-side failure paths, CSS cascade conflicts, renderer client-bundle surgical patching, shared-module restart semantics, main-process permission handlers (clipboard), cordis.patch.yml insert being silently ignored by the desktop composition layer, profile silent rollback, macOS 26 TCC grant flows, context-window compaction tuning, and macos-harness UI verification. Use when the desktop app enters recovery mode, logs "failed to import loader entry", "pending (waiting for service)", "does not provide an export named", "duplicate loader entry id", when a UI feature misbehaves (click does nothing, panel does not resize, history cannot load, copy button fails silently), when an installed plugin never activates (patch insert ignored / silent rollback), when the Feishu/IM bot ignores group mentions, when a session overflows CONTEXT_WINDOW_EXCEEDED, when the app boots healthy but the main area is blank/white (logs "renderSlot('root') before any 'root' registration (boot order)" — root-slot boot race, OR after app-bundle client bytes were patched — combo rev mismatch), when the client reports "connection invalid server-response failure" or "settings are unavailable in this browser" (via LAN/gateway), when diagnosing/fixing dsh plugins, cordis.patch.yml, bundles, pnpm-workspace.yaml, or when building/proxying the Desktop over a team gateway (browser-auth cookie wall, slash RPC args envelope, /api/remote.mux streams).
---

# DSH Desktop Diagnostics

Diagnose and fix DeepSeek Harness Desktop failures. Two failure families: **启动/加载失败**（boot 阶段，日志可见）和 **UI 功能故障**（app 启动 healthy，但某个功能"没反应/坏掉了"——静默失败，日志看不到）。This skill distills both, for the macOS DSH Desktop app (Electron + Cordis loader) where the desktop host ships an **unpublished alpha API** (`0.1.2-alpha.1`) diverged from the npm `rc` ecosystem (`0.1.1-rc.x`).

## 核心概念（必须先理解）

- **app.asar**：`/Applications/DSH Desktop.app/Contents/Resources/app.asar`（宿主，内置 `@deepseek-ai/*` 核心包，alpha）。**`app.asar.unpacked/` 是可写展开目录，且对 asar 同名路径有遮蔽效应**（宿主读盘时 unpacked 优先）——这是「改宿主内置包」的合法缝隙（见下）。
- **profile node_modules**：`~/.dsh/profiles/desktop/node_modules`（第三方插件，来自 npm rc）。
- **版本分叉是根源**：npm 最新是 `0.1.1-rc.x`，桌面主机内置 `0.1.2-alpha.1`。API 已分叉（服务改名、导出增删）。
- **Cordis loader**：`resolveOverlayPackage`，`compare(profile.version, install.version) > 0 ? profile : install` —— **版本号高者胜出**。
- **配置入口**：`~/.dsh/profiles/desktop/package.json`（`dependencies` + `dsh.profile.bundles`）、`cordis.patch.yml`、`pnpm-workspace.yaml`、`pnpm-lock.yaml`；运行参数 `~/.dsh/settings.yaml`（compaction-basic、模型 `contextWindow` 等）；IM 渠道配置 `~/.dsh/integrations/<im>/config.json`（白名单等，凭据本体在凭据存储）。
- **renderer 与宿主的关系**：renderer（Electron 网页）经 HTTP 从宿主拉取 client bundle（`<pkg>/lib/client.js`），响应 `cache-control: no-cache`；宿主每 500ms stat-poll 客户端 bundle 的 mtime/size（dsh-client-hmr），变化时推 `rebuilt` 帧。
- **生效机制二分（改完怎么加载——判错就是白改两轮）**：插件自带的 `lib/client.js` 通常有 `window.__ModuleLoader__.load(...)` 包装 → **Cmd+R 即可重载**；**共享依赖模块**（如 `dsh-client-ui-primitives/lib/index.js`，被多个 bundle import、无 loader 包装）→ **必须完整重启应用**。改文件前先 `grep -c "__ModuleLoader__" <file>` 判定归属；主进程/electron-runtime 分块一律完整重启。
- **主进程权限处理器**：electron-runtime 分块里的 `setPermissionRequestHandler((_wc, _p, cb) => cb(false))` 是 deny-all → 剪贴板等权限类功能在**主进程层静默失效**（renderer 无异常、日志干净）。
- **插件安装机制（桌面组合层语义）**：`cordis.patch.yml` 的 `insert` 条目**被桌面组合层静默忽略**（id-targeted 覆盖有效）→ 新增插件唯一可靠机制 = `dependencies`（`file:` vendor 到项目目录）+ `dsh.profile.bundles`（实测 dsh-auto-compact：机制 A 静默失败、机制 B 一次成功）。

## 诊断流程

### A. 启动/加载失败（进恢复模式、插件没激活）

1. **查生命周期**：`~/Library/Application Support/Sanbao/lifecycle-events/startup.jsonl`，最后一条的 `finalStage`（`profile-composition` / `host-boot` / `health-commit`）与 `rendererStatus`。
2. **查日志**：`~/Library/Application Support/Sanbao/logs/dsh-<日期>.log`。（目录名随 productName：2026-09-20 起为 `Sanbao`；旧的 `.../DSH Desktop` 目录是迁移前备份，不是活的。）
3. **定位缺失 service/export**：宿主提供面 `grep -rn 'super(ctx, "X")\|provide("X"' /tmp/dsh-asar/extracted/node_modules/@deepseek-ai/*/lib/*.js`；插件需求面 `grep -n 'exports.inject\|const inject' <plugin>/lib/*.js`；提取 asar：`npx asar extract .../app.asar /tmp/dsh-asar/extracted`。
4. **捕获 renderer 真实报错**：`ELECTRON_ENABLE_LOGGING=1 ".../DSH Desktop" --enable-logging=stderr > /tmp/dsh.log 2>&1`。
5. **「插件没被加载」但日志干净 → 静默回滚签名三件套（实测 dsh-im 2026-08-30）**：与恢复模式回滚（日志有 `plugin tree failed to load`）不同，静默回滚**日志零报错**。三件套：① `grep <pkg> ~/.dsh/profiles/desktop/package.json` 空（依赖+bundles 两条目都消失，文件回到与安装前快照逐字节一致）② `grep -c <pkg> pnpm-lock.yaml` = 0 ③ `ls node_modules/<pkg>` 还在（包体残留）。修复：重写两条目 → 桌面 pnpm `install --no-frozen-lockfile` → 重启 → **重启后必须复查持久性**。触发机制未定论（怀疑健康快照/未干净关闭自愈或市场操作），复发时深挖 `profile-selection`/`profile-setup` 状态文件与启动时序，不要盲目反复重装。
6. **免审批三路证据法**（验证 bundle 是否真被组合，零审批、不受 UI 虚拟列表影响）：
   - host：host-only 动态插件读 `ctx.get('clientModules').graph()`，深搜含包名的节点（id/rev 存在 = 已组合）；
   - client：`cordis_inspect_query(platform=client, Slots, listSubTree)` 查精确 root（如 `settings.section`）的 `occupants`——registrant/id/order/active 一行定生死（注册账本，不依赖 DOM 渲染）；
   - 文件：profile package.json 两条目 + lockfile grep。
   只有三路都绿才下「已加载」结论；需要页面 DOM 证据时才上动态 client 探针（需审批，见「关键坑」）。
7. **「装上了但功能/入口不出现」先查安装机制**：若安装走 `cordis.patch.yml` 的 `insert` 条目——**桌面组合层静默忽略 insert**（id-targeted 覆盖有效），插件从未进组合（实测 dsh-auto-compact）。改为 `dependencies`（`file:` vendor 到 `/Users/lute/project/Magpie-Horch/<pkg>-local`）+ `dsh.profile.bundles` → 桌面 pnpm `install --no-frozen-lockfile` → 重启 → 三路证据复查。

### B. UI 功能故障（启动 healthy 但功能坏）——「静默失败」二分法

启动记录 healthy ≠ 功能正常。UI bug 的典型形态是**客户端把失败吞掉了**。定位五步：

1. **先二分「数据管线 vs 客户端 UI」**：把宿主逻辑**离线用真实数据重放**。例：会话数据在 `~/.dsh/sessions/--<cwd>--/session-<id>/session.jsonl.zstd`（`zstd -d` 解压；行内 chunk 记录会展开成多个事件，seq 要求 0 起密集）。用 Python 复刻宿主算法（如 `paginate`：从 `beforeSeq` 倒数 MESSAGE 类事件、按 `sourceEventSeqs` 折叠 groupStart），若离线能算出正确结果 → 管线健康，问题在客户端。
2. **看客户端守卫与异常路径是否静默**：`async loadOlder() { if (openState !== "open" || !hasMore || loadingOlder) return; ... } catch (e) { if (sessionStreamFailure(e) === void 0) console.error(...) }` —— 守卫 return 与「已知失败不打印」= 用户零反馈。
3. **找「状态自相矛盾」**：按钮按 `hasMore` 渲染，点击却要求 `openState === "open"`；流失败后 `openState` 变 `error` 而 `hasMore` 不重置 → 按钮可见但点击必被拦截（经典"点了没反应"）。
4. **现场取证**：临时在 client bundle 里插入**页面横幅诊断**（见「renderer 端补丁」）→ 用户 Cmd+R 重载 → 复现 → 读横幅。宿主日志没有 renderer console（2.0.4 原版主进程不转发 console-message；本机已加转发补丁，见「关键坑」），`document.title` 也不可靠（无边框窗口标题固定为空）。
5. **权限类功能失效（复制/通知等）先查主进程权限处理器**：renderer 一切正常但权限 API 全被拒时，查 `app.asar.unpacked/lib/electron-runtime-*.js` 的 `setPermissionRequestHandler`（deny-all 单行）。此类失败**无 renderer 异常**：`navigator.clipboard.writeText` 只是 reject；`document.execCommand('copy')` 甚至**返回 true 但不写入**（假阳性，不能以返回值判定成功）。

### C. UI 自动化验收（macos-harness）

- 先 `macos-harness doctor` 看权限；**授权对象是 DSH Desktop 应用本身**（agent 的 bash 由 Electron 主进程派生，TCC 责任跟随应用而非终端）。
- `mac.ax.query(app=..., text=..., search_key="AXValueSearchKey")` 找元素 → `mac.ax.perform(idx, "AXPress")` 触发（绕过命中测试，适合验证逻辑链）。
- `mac.click(x, y, coordinate_space="screen")` 走真实点击（验证用户真实路径）；**坐标坑**：AX frame 是屏幕逻辑点；`screencapture` 产出是物理像素（Retina 2x）；mac.see 截图坐标=窗口内容。像素坐标 = 逻辑坐标 × 2，另加窗口原点偏移。
- 截图看不清时用 `tesseract <png> <out> -l chi_sim+eng --psm 6` + `tsv` 模式拿单词精确坐标；vision 模型限流时这是主通道。
- `mac.key("cmd+r", app=...)` 只重载 renderer（不重启应用、不动会话）；`mac.scroll` 可在指定坐标滚动（到达列表顶部让「加载更早」这类按钮渲染出来——虚拟列表会把屏幕外元素卸载）。

## 错误分类 → 归因 → 修复

### 启动/加载类（日志可见）

| 报错特征 | 归因 | 修复 |
|---|---|---|
| `Renderer boot failed for N plugin(s)` | 客户端插件 inject 了宿主没有的 service | 移除该插件，或用 profile override 提供该 service |
| `cannot resolve package X` | 插件在 `bundles` 却不在 `dependencies`，pnpm 对账清掉 | 从 `bundles` 移除，或补进 `dependencies` |
| `pending (waiting for service: X)` | 插件 inject 的 service 不存在 | 定位提供者；无则移除或 override |
| `does not provide an export named X` | rc vs alpha 导出差异 | profile override + shim，或对齐版本 |
| `duplicate loader entry id "X"` | 两处 `cordis.patch.yml` 的 `insert` 用了同一 id | 删掉其中一个 |
| `X.catch is not a function` | 核心包 `fiber.dispose().catch(...)` 中 dispose 返回 undefined | profile override 改成 `Promise.resolve(fiber.dispose()).catch(...)` |
| `registerProvider is not a function` | rc「注册模式」→ alpha「直调模式」架构级变化 | 只能移植源码或移除插件 |
| `cloudflared: set this to true or false` | 已删依赖残留 allowBuilds 条目 | 从 `pnpm-workspace.yaml` 删行 |
| `skill-filesystem ... binary file` | `~/.agents/skills/*/SKILL.md` 损坏（二进制） | 改名 `.corrupt` |
| 启动 healthy 但主区白屏（右侧面板正常），日志 `renderSlot('root') before any 'root' registration (boot order)` | **root 槽 boot 竞态**：渲染 root 时 layout 的 root 注册未就绪。两类触发：① 新插件进组合扰乱 boot 时序（`dsh.client.inject` 缺失包 / apply 内 setInterval+MutationObserver 高频扫描）；② pnpm install 后**首次启动**的一次性竞态（第二次启动自愈） | ① 移除/修正新插件（两条目 + install + 三路证据）；② **连续重启两次**验收，别以第一次启动判定成败；③ 根治：`dsh-client-ui-renderer` RootOutlet 不 throw、渲染等待占位、注册到达自动恢复（见典型实战 9） |
| 启动 healthy 但整屏白屏（无 `renderSlot('root')` 日志），且刚在**关机态**改过 app bundle 内 client bundle 字节（如网关打 settings 补丁） | **combo rev 失配**：boot 清单把 50+ 客户端包拼成一个大 combo（`/plugins/??…&rev=<sha1-12hex>`），rev=sha1 内容哈希且「mismatched revisions are rejected」——字节被改而 rev 未随动 → 整个 combo（含全部核心 UI）拒绝服务 | **还原字节即自愈**（rev 恢复一致）；UI 行为改造走「运行中手术（HMR re-hash）」或「网关/代理响应层 in-flight 转换」（见典型实战 10） |

### UI 功能类（启动 healthy、日志干净）

| 症状 | 归因 | 修复 |
|---|---|---|
| 点按钮「没反应」（如 加载更早） | 客户端静默失败：守卫 return 无反馈 + 已知失败不打印 + 请求无超时；或状态矛盾（按钮渲染条件 ≠ 点击可用条件） | ① 失败全显性化（写 `openError` → 复用现有错误横幅，所有失败 `console.error`）；② 失败前自愈（如 `resync()` 重开流）；③ 请求加超时（`Promise.race` + 定时 reject）；④ 按钮渲染条件与可用条件对齐（如 `hasMore && openState === "open"`） |
| 侧边栏/面板展开，中间栏不收缩 | **CSS 级联冲突**：桌面壳样式 `html, body, #root { width: 100% }` 覆盖了第三方面板对 `#root` 的宽度挤压（如 dsh-better-sidebar 的 `#root { width: calc(100% - var(--panel-w)) }`），`margin-right` 生效而 width 不缩 → 溢出、内容被盖 | 壳层不再显式锁 `#root` 宽度（改 `html, body { width:100%; height:100% } #root { height:100% }`，让 #root 走 auto 宽度随 margin 收缩）；用无头 Chrome 分别按两种样式顺序复现验证（`--dump-dom` 读计算宽度） |
| 某个交互「应该存在但没有」（如 ⬆️ 回填上一条消息） | **功能缺失**（当前版本没实现，不是坏了）：全仓库检索 keymap/命令链后确认无此逻辑 | 在 composer keymap 链补 handler（如 KEY_ARROW_UP_COMMAND 优先级 4 处：弹出菜单未消费 → 空草稿+非 IME → 取会话窗口最后一条 user/message 纯文本经 `keyboard.paste` 填入） |
| 应用反复重启/崩溃循环 | 排查时序：改过 client bundle 后宿主 HMR 热替换可能在运行态把 renderer 弄崩（无 dev:web 时热更不完整）；log 里 `previous desktop run did not shut down cleanly` 串起来就是崩溃循环 | 先撤刚改的 bundle（还原文件），等下一次重启稳定；**改 client bundle 后一律用 Cmd+R 或重启加载，别指望 HMR** |
| 复制按钮点了没反应/复制失败 | **双层根因**：① 主进程 `setPermissionRequestHandler` deny-all → `clipboard-write`/`clipboard-sanitized-write` 权限请求全被拒；② client `writeClipboard` 依赖 execCommand 兜底——**execCommand 在本沙箱返回 true 但不写剪贴板**（假阳性） | ① electron-runtime 分块一行定向放行：`callback(permission === "clipboard-sanitized-write" \|\| permission === "clipboard-write")`（主进程红线唯一例外，须用户确认）；② primitives `writeClipboard` 恢复 `navigator.clipboard.writeText` 优先、execCommand 仅兜底；**改后完整重启**（主进程代码 Cmd+R 无效） |
| 飞书/IM 机器人只回复群主 @，其他人 @ 无响应 | 渠道配置 `ownerOpenIds` 白名单只含群主 openId（`~/.dsh/integrations/dsh-feishu/config.json`） | 白名单改 `["*"]`；配置≠凭据（凭据在凭据存储，改配置不丢机器人身份） |
| 会话报 `CONTEXT_WINDOW_EXCEEDED`/压缩失效 | 三层叠加：① 适配器窗口低估（pi-ai 默认 256K，模型实为 262144 未声明）；② 压缩引擎默认阈值过晚，溢出时无可压缩空间；③ 摘要同模型同窗死局（摘要请求自身也溢出） | ① settings.yaml 模型条目补 `contextWindow: 262144`；② `compaction-basic` 段 `thresholdRatio: 0.75` + `maxOverflowRetries: 3`；③ 摘要路由独立 provider/model（`summarizationProvider: deepseek-official`）；④ core override 补输出预算预留 + 摘要降级重试（见典型实战 6） |
| 客户端报 `connection: invalid server-response failure`（代理/网关拒绝某请求后出现） | Desktop 客户端 `parseConnectionResponse` 严格校验失败信封：`error.code` 字符串 + `error.message` 字符串 + `error.details` **必须是对象**——代理构造拒绝响应缺 `details` 即抛此误导性错误（掩盖真实拒绝原因） | 拒绝响应必须 `{ok:false, error:{code, message, details:{}}}`；code 取客户端已知错误码集合，未知映射 `internal` |
| 经局域网/代理访问设置页报「加载提供方目录失败: settings are unavailable in this browser」、模型页显示关闭 | 设置客户端硬编码 `connection.isLoopback ? "host" : "memory"`（dsh-client-ui-settings 两处，**无配置开关可覆盖**）——非 loopback 来源（局域网 IP）走 memory 模式，设置目录永远为空 | 只能改该三元；但磁盘补丁会白屏（combo rev）→ 在网关/代理响应层对 JS 响应做 in-flight 字符串替换（见典型实战 10） |
| 注入 shim 后成员 UI 错位/元素永久消失 | 按 aria-label 隐藏了**多状态元素**（如 composer 输入 div 在未选工作区状态带 aria-label="选择工作区"）——React 重渲染只更新属性，**不清理外部设置的 display:none** → 元素转态后仍隐藏 | 只隐藏专用按钮（限定 button 元素 + 精确 aria 匹配）；多状态元素绝不按瞬态属性隐藏 |
| 注入 shim 后侧栏标题闪烁后消失 | 上游 shim 的 DOM 假设不适配 Desktop：用 `document.querySelector("textarea")` 探测 composer 就绪（Desktop composer 是 contenteditable div `[data-composer-input]`）→ 停止条件永不成立 → 每秒点击工作区 treeitem 直至 90 次上限 → 持续重渲染 | 探测兼容 textarea 与 `[data-composer-input]`；占位符读 `placeholder`/`data-placeholder`；每个目标只点击一次（Set 幂等），命中后由占位符检查停止 |

## 修复技术（工具箱）

### 1. Renderer 端 client bundle 外科手术（改宿主内置包 UI 代码——已验证可行）

宿主内置包的 `lib/client.js` 在 `app.asar.unpacked/` 有可写副本且遮蔽 asar——**这是改宿主 UI 代码的合法缝隙**。但边界严格：

- ✅ 可改：**renderer 端纯 JS 资源**（`@deepseek-ai/<pkg>/lib/client.js` 等）。改完 `codesign --verify` 仍过、启动 `rendererStatus: healthy`（实测）。
- ❌ 不碰：主进程文件（`main.js`/`bin.js`/`Info.plist`/原生二进制）——改它们才会破坏签名/TCC 身份/`userData` 路径（品牌替换实战教训：改 Info.plist 的应用名会让 `app.getPath('userData')` 指向新目录、数据全丢）。
- 工作流（本次「加载更早 + ⬆️ 回填」实战）：
  1. 备份：`cp <pkg>/lib/client.js <pkg>/lib/client.js.orig`（另存一份到项目目录做持久备份）；
  2. 改码：锚点替换（唯一字符串匹配），每次替换 count==1 才落笔；
  3. 语法门：`node --check <file>`；
  4. 生效：**先判定文件归属**——带 `__ModuleLoader__` 包装的插件 client.js 用 Cmd+R 重载；共享依赖模块（无包装，如 dsh-client-ui-primitives）与主进程/electron-runtime 分块**必须完整重启**；**不要依赖 HMR 热替换**；
  5. 验收：见「诊断流程 C」；
  6. 回滚：`cp .orig` 还原 + Cmd+R。重放脚本模式：`apply-fixes.sh apply|--check|--verify-anchors|--rollback`（参考 `/Users/lute/project/Magpie-Horch/dsh-chatui-fix/`）。
- 升级注意：官方升级重打包 `.app` 会覆盖补丁 → 升级后重放补丁脚本（锚点漂移时 `--verify-anchors` 报告每个锚点匹配数，手工适配）。
- ⚠️ **多次手术基线纪律**：对已打过补丁的 chunk 再手术，基线取**当前生效版本**（先 `diff 当前 vs .orig`），不要从 asar 原始版/旧备份重建——否则静默丢弃前序补丁（详情见「关键坑」）。
- ⚠️ **combo rev 白屏边界（2026-09-08 实测，team-hub settings 补丁）**：Desktop boot 清单把 50+ 客户端包拼成**一个大 combo**（`/plugins/??…&rev=<sha1-12hex>`，rev=内容哈希），主机侧「mismatched revisions are rejected」。**在 Desktop 未运行（关机态/外部进程）时修改任何 app bundle 内 client bundle 字节 → 重启白屏**（整个 combo 加载失败，与 root-slot 竞态白屏是两回事；还原字节即自愈）。「加载更早」手术可行的前提是**运行中修改 → HMR re-hash 更新 rev**。因此：外科手术必须走「运行中改 + Cmd+R」路径；**需要外部程序/网关改动 UI 行为时，一律走响应层 in-flight 转换（零磁盘接触，见典型实战 10）**，绝不关机态改 bundle 字节。

### 2. Profile override（覆盖核心包，host 侧逻辑）

核心包 host 侧代码在只读 asar 里；复制到 profile node_modules 并把版本抬到 `<原版本>-override`：

```bash
SRC="/Applications/DSH Desktop.app/Contents/Resources/app.asar.unpacked/node_modules/@deepseek-ai/<pkg>"
DST="$HOME/.dsh/profiles/desktop/node_modules/@deepseek-ai/<pkg>"
rm -rf "$DST"; mkdir -p "$DST"; cp -R "$SRC/." "$DST/"
node -e 'const fs=require("fs");const p=process.argv[1];const j=JSON.parse(fs.readFileSync(p,"utf8"));j.version=j.version+"-override";fs.writeFileSync(p,JSON.stringify(j,null,2)+"\n");' "$DST/package.json"
# 然后编辑 $DST/lib/*.js 打补丁
```

### 3. Node_modules 补丁（脆弱） / Vendor 本地化（可靠根治）

直接改 `node_modules/<pkg>/lib/*.js` 会**被 pnpm 重装覆盖**；根治 = vendor 到本地目录（`/Users/lute/project/Magpie-Horch/<pkg>-local`）+ 依赖改 `"file:/绝对路径"`。配合幂等补丁脚本 + `"postinstall": "node apply-patches.mjs"`。

### 4. 移除不兼容插件

架构级差异（`registerProvider`→`ask` 等）无法 shim 时：移除插件、单独移植。

### 5. 应用品牌字符串替换（实测：LUTE Agentic System 与 Sanbao 两轮改名）

改 app 源码里的品牌字符串是**纯文本替换**（低风险），但有红线：

- ✅ 安全：原生 UI 页 JS（`lib/native-ui/assets/*.js` 的显示文案）、CLI 帮助文本、shell 显示名——纯显示字符串盲替换即可（备份先行）。
- ⚠️ **路径 join 字符串不可替换**（历史坑；2.0.10 基座已把数据目录路径收进身份表 `productName`，见下条）：旧基座 `bin.js` 里 `path.join(appData, "DSH Desktop")` 之类是数据目录路径，改了会让 CLI/诊断找不到数据目录；当年用「只替换未加引号（显示文案）保留加引号（路径）」区分。
- ⚠️ **数据目录改名是成套动作**（2026-09-20 起，四步缺一不可）：`productName`（身份表**两个家**：`lib/bin.js` + `lib/profile-manager-*.js`）→ 数据目录迁移（`packaging/scripts/migrate-app-data-dir.sh`，只复制不删除）→ 显示名/Helper/Info.plist（`dsh-patches/brand-replay.sh`；**Helper 目录必须与 CFBundleName 匹配**，Electron 按 `Frameworks/<CFBundleName> Helper.app` 查找，不匹配就启动 17ms 崩 `FATAL: Unable to find helper app`）→ 重签（`packaging/scripts/refresh-app-brand.sh`）。数据主体在 `~/.dsh`（profile/会话/设置），userData 几乎全是缓存——改 productName 不丢数据。
- 注意 `.map` 源映射是 dev 产物不加载，可不动；原生页改动下次触发生效（恢复/初始化向导），无需重启。

### 6. 主进程权限处理器定向放行（主进程红线唯一例外）

electron-runtime 分块（`lib/electron-runtime-*.js`）的 deny-all 单行会让权限类功能静默失效（剪贴板实测）。定向放行：

```js
window.webContents.session.setPermissionRequestHandler((_wc, permission, callback) =>
  callback(permission === "clipboard-sanitized-write" || permission === "clipboard-write"));
```

纪律：改前备份 `.orig` → `node --check` → **完整重启**（主进程代码 Cmd+R 无效）→ 功能复现验证。这是「不碰 main.js/Info.plist/二进制」红线**唯一经用户确认的例外**——只动 permission 白名单一行，不碰签名/TCC 身份/userData 路径相关代码。

### 7. 配置类修复（settings.yaml / integrations）

- 运行参数在 `~/.dsh/settings.yaml`：模型条目补 `contextWindow` 可纠正适配器窗口低估（256K 默认 vs 模型实为 262144）；`compaction-basic` 段控制压缩阈值/重试/摘要路由。
- IM 渠道配置在 `~/.dsh/integrations/<im>/config.json`（`ownerOpenIds` 白名单、`groupResponseMode` 等）；**凭据本体在凭据存储**——改配置、重装插件都不丢机器人身份（dsh-im 回滚重装后直接恢复在线，实测）。
- 改完按插件语义决定重启或重载，并做行为复现验证。

## 关键坑（避坑）

- **HMR 陷阱**：宿主 stat-poll 客户端 bundle，改文件即推 `rebuilt` 帧；无 dev:web 时热替换不完整，运行中热更可能崩渲染器（曾实测导致连续重启循环）。改完文件**主动 Cmd+R**，若发现重启循环立即还原文件等稳定。
- **重启副作用清单（诊断工作流设计依据）**：桌面重启会 ① 中断当前 agent turn（工具报 interrupted 属预期，会话自动恢复）② **清空全部动态插件**（cordis_define 的探针不跨重启，重启后的验证计划需含探针重建）③ 单次 `previous desktop run did not shut down cleanly` 警告**无害**（只有反复出现构成崩溃循环才要排查时序）。因此重启前完成文件级取证与快照，重启后立刻按预案复查。
- **动态探针纪律**：多个动态插件注册**同名读取工具会互相遮蔽**（读到的永远是先注册者）——每个探针用唯一 tool 名；host-only 探针免审批、client 探针 `awaiting-approval` 后等系统 steering 报告，别死等。
- **文本 dump 两大误判坑（现场取证时）**：① 全文档 `textContent` 会混入**会话历史文本**——用户贴在聊天里的错误消息会被正则误判成「UI 实时错误」，命中后必须回查该文本的 DOM 链（parentElement 逐层）确认来源是设置面板还是对话流；② **虚拟列表截断**——插件清单等长列表的屏外行不在 DOM，文字抓不到目标行，改用 slot occupants 或截图。另：二维码等可视化元素可能渲染在 `<img>`（data URL）而非 `<canvas>`，只查 canvas 会误判「无二维码」。
- **共享依赖模块重启语义**：`grep -c "__ModuleLoader__" <file>` 判定——无 loader 包装的共享模块（dsh-client-ui-primitives 等）改后 Cmd+R 无效，**必须完整重启**（白改两轮的实测教训）。
- **patch.yml insert 被桌面组合层静默忽略**：`cordis.patch.yml` 的 `insert` 条目不会进组合（id-targeted 覆盖有效）。装插件/加 bundle 一律走 `dependencies` + `dsh.profile.bundles`。
- **execCommand 假阳性**：权限被拒的沙箱里 `document.execCommand('copy')` 返回 `true` 但剪贴板无内容——检测复制成败必须看 `navigator.clipboard.writeText` 的 resolve/reject，不能信 execCommand 返回值。
- **多次手术基线纪律**：对已打补丁的 chunk 再手术，基线必须是当前生效版本（先 `diff 当前 vs .orig`）；从 asar 原始版/旧备份重建会静默丢前序补丁（electron-runtime 剪贴板放行行被 console 转发手术还原成 deny-all 的实测）。
- **renderer console 通道**：2.0.4 原版主进程**不转发** `console-message`——诊断输出只能页面横幅（截图/OCR 读）或宿主日志通道（`desktop-web-server Error:`、ECONNRESET 痕迹、boot report 写 lifecycle jsonl）。本机已在 electron-runtime 分块加转发补丁（`console-message` → `[Renderer] ${message} (${sourceId}:${line})`，level≥3 走 logError）——改此文件须完整重启；升级后需重放。
- **macOS 26 TCC**：adhoc 签名应用的辅助/录屏授权写在**系统库** `/Library/Application Support/com.apple.TCC/TCC.db`（用户库 `~/Library/...` 可能是空的）；授权按 bundle id 记录。`tccutil reset Accessibility ai.deepseek.dsh.desktop` + 触发弹窗 + 用户点允许后**当前实例立即生效**；授权后若再重启应用，可能又失效——重来一遍 reset+弹窗即可（授权对象是 DSH Desktop 本身，不是终端）。
- 核心包在 app.asar 只读——host 侧逻辑用 profile override；**renderer 端 client bundle 例外**（见工具箱 1）。
- 版本比较「高者胜出」：override 必须抬版本。
- `resolveOverlayPackage` 只对 loader 自身 import 生效；插件内部传递 import 走 Node 默认解析。
- `dsh-theme` 等本地适配插件：`cordis.patch.yml` 里 `insert` 会生成 id，别再把同名插件加进 `bundles`（`duplicate loader entry id`）。
- **白屏与 mcp giving up 的 155 秒时间伴随陷阱**：`mcp-client` 重连退避 500ms+1s+2s+4s+8s+16s+30s×4 ≈ 155 秒，其 `giving up` 总落在启动后 ~155 秒；root 槽 boot 竞态也常在此窗口暴露，两者日志相邻出现**不是因果**——同组合第二次启动的对照实验（同样 giving up 时刻无白屏）可排除误判。
- **combo rev 管线（改 app bundle 字节的白屏机制，2026-09-08）**：boot 清单把 50+ 客户端包拼成一个大 combo（`/plugins/??…&rev=<sha1-12hex>`），rev=sha1 内容哈希且主机侧「mismatched revisions are rejected」——**关机态/非 HMR 路径修改任何 app bundle 内 client bundle 字节 → 重启整屏白屏**（team-hub settings 补丁实测；还原字节即自愈）。运行中修改会触发 HMR re-hash（「加载更早」手术可行即此因）。UI 行为改造的安全路径：运行中手术 + Cmd+R，或**代理/网关响应层 in-flight 转换**（零磁盘接触）。
- **combo 缓存不可变 + URL 处理坑（网关/代理场景）**：combo 响应 `cache-control: public, max-age=31536000, immutable`——代理做内容转换后必须给 URL 注入缓存破坏参数（否则浏览器一年不重拉，转换永远不生效）；SPA HTML 无缓存头，代理应补 `no-store`。⚠️ 处理 combo URL **禁用 URL/URLSearchParams**——`??` 会被重编码为 `%3F` 破坏上游路由（实测 404），用纯字符串剥离参数。
- **外部进程（网关/代理）崩溃会断全员连接**：undici 上游响应体超时（`UND_ERR_BODY_TIMEOUT`）等未捕获异常会让 node 进程退出（客户端集体报 connection lost）——代理服务必须注册 `uncaughtException`/`unhandledRejection` 记日志不退出。
- **Desktop composer 不是 textarea**：contenteditable div（`role="textbox"` + `data-composer-input` + `data-placeholder`）——注入任何针对 standalone web 编写的 DOM 脚本（shim/自动点击）前，先核对元素类型假设，否则停止条件永不成立、周期动作失控。
- **挂死渲染端的热栈取证法（2026-09-19 实战，「插件加载中→黑屏」）**：渲染主线程被微任务级联饿死时，Electron 渲染端 inspector 完全不可达（`Runtime.enable`/`Debugger.enable` 全超时，因为 CDP 消息必须过主线程）。可行通道：① 读 `~/.dsh/.credentials.yaml` 的 `client-connection/browser-session` secret（base64url 解码成 32B 再做 HMAC key）铸造 `dsh-auth-<b64url(sha256(authority))>` cookie；② 独立 Chrome（`--remote-debugging-port`）`Network.setCookie`（**sameSite 必须给 Lax**，Strict 跨站导航会被扣）后导航**不带 query 的根路径** `http://127.0.0.1:<port>/`（带 `dsh-desktop-mode=...` query 会被桌面壳 403）；③ **在空白页先 `Debugger.enable` 再导航**，挂死后发 `Debugger.pause`——V8 栈守卫中断能打断忙循环，热栈顶帧即死循环函数。挂死前最后几条 console（需开 Runtime 事件监听）往往直接点名涉事插件。
- **「插件加载中」永不结束的第三种根因（前两种：root 槽竞态 / combo rev）——MutationObserver 微任务乒乓（2026-09-19 实战）**：多个插件共享的注入核心各自挂 body/root 级 MutationObserver，回调里又互相抢 DOM（收编进容器 vs 拉回锚点，或两个同名单例容器互抢成员行）→ 每次移动触发对方 observer → 微任务队列永不清空 → 渲染端 30s 健康上报发不出（日志 `renderer boot failed (plugins: Unknown client plugin)`，即插件清单为空）→ 看门狗杀页面 → 黑屏；渲染进程 CPU 100%+ 是签名。三个判据签名：CPU 常驻 100–185%、`Runtime.enable` 超时、当天 `[Renderer]` console 零输出（转发补丁在但无消息=一进页面就挂）。修复不变量（已固化在 `shared/client/sidebar-entry-core.ts`，详见 `docs/notes/implemented/surface/2026-09-19-workbench-group-livelock-boot-blackout.md`）：**observer 回调对被观察子树的写操作必须「移动一次后不再满足移动条件」**——收编只收 `parentElement === root` 的直接子行、单例在插入时（而非挂载时）裁决、geometry 重锚带 `parentElement === root` 守卫。
- **本机 app bundle 现存 lute 补丁清单（升级后跑重放脚本，不要手工重打）**：① `app/lib/client.js` 启动上报确认式重试 → `dsh-patches/boot-health-retry/apply-fixes.sh`（备份基线 `client.js.orig-boot-health-retry`）；② `app/lib/electron-runtime-*.js` console 转发（G2）→ `dsh-patches/runtime-guards/apply-fixes.sh`（基线 `.orig`）。诊断期曾临时把看门狗探测时限 10s→120s（`120e3` 止痛贴）——**2026-09-19 已还原上游 10s**（livelock 根因已修，放宽会掩盖真挂死 2 分钟）；若在盘上再见到 `120e3`，那是止痛贴复发，还原而不是登记。
- 恢复模式是按设计的优雅降级；先定位 `finalStage` 再归因。
- `[FAILSAFE-DRILL]` 之类注释注入是演练残留，直接删。

## 工程纪律（用户红线）

1. **先审计后动手**：改代码前先审计并给方案（A/B/C 供选择），用户批准后执行。
2. **只改 renderer/main 的 JS**（`lib/*.js`、client bundle）。`main.js`/`Info.plist`/原生二进制是红线——唯一例外：electron-runtime 分块权限处理器白名单一行（须用户显式确认）。
3. **每次改动的门**：锚点唯一（替换 count==1 才落笔）→ `node --check` 语法门 → `.orig` 原地备份 + 持久副本到项目目录。
4. **完整重启验证**：主进程/共享依赖模块改动必须完整重启；改完查 `rendererStatus: healthy` + 功能复现。重启前完成文件级取证（动态插件会清空）。
5. **回滚预案先行**：每次改动给出精确回滚路径（`.orig` 还原 + 重启）；多文件重放用幂等脚本 `apply-fixes.sh apply|--check|--verify-anchors|--rollback`。
6. **升级覆盖补丁**：重打包/升级后 unpacked 与 runtime 块补丁全丢 → 重放补丁脚本并复查（`--verify-anchors` 报告锚点漂移）。

## 典型实战

### 1. dsh-memory「角色扮演」图标反复出现

症状：`dsh-memory` 经 `installRoleplayWeb` 在 `/roleplay` 挂网页 + `webServer.tapIndex` 注入「🎭 角色扮演」按钮。反复出现 = npm 发布包只在 node_modules 打补丁会被重装覆盖。根治：vendor 到 `/Users/lute/project/Magpie-Horch/dsh-memory-local`，`lib/index.js` 与 `src/index.ts` 都删 `installRoleplayWeb` 的 import+调用、删孤立 `roleplay_web.js/.ts`，依赖改 `file:`。核心 `lingshu_*` 工具不动。

### 2. 对话页「加载更早」没反应 + ⬆️ 不回填（2026-08-30 实战）

- 症状：`rendererStatus: healthy`，但点「加载更早」零反馈；输入框 ⬆️ 不回填上一条消息。
- 定位：① 离线重放宿主 `paginate`（解压 session.jsonl.zstd，481 条消息事件，能正确算出上一页）→ 管线健康；② 读 `dsh-api-session-controller/lib/client.js` 的 `loadOlder()` → 守卫静默 return + 已知失败不打印 + `failEventStream` 后 `hasMore` 不重置 → 按钮可见但点击必被拦；③ 检索 composer keymap（`dsh-client-ui-conversation`）→ ArrowUp 只服务弹出菜单，菜单关闭即 `pass` → 回填功能根本不存在。
- 修复（3 个 client bundle，锚点替换 + `node --check` + Cmd+R）：`loadOlder` 自愈（`resync`）+ 失败显性化（`openError` 驱动现有错误横幅）+ 15s 超时；按钮渲染门 `hasMore && openState === "open"`；快照暴露 `lastOwnMessage` + keymap 补 `recallPrevious`（空草稿/非锁定/非 IME 时 `keyboard.paste` 最后一条 user/message 文本）。
- 验收：AXPress 点击后顶部消息跳到更早历史 ✓；点输入框按 ↑ 回填用户上一条消息 ✓；重启 `rendererStatus: healthy` ✓。交付 `/Users/lute/project/Magpie-Horch/dsh-chatui-fix/`（apply-fixes.sh + README）与 `.orig` 备份。

### 3. 侧边栏展开中间栏不收缩（上一轮实战）

- 定位：桌面壳 `DESKTOP_OWNED_STYLES` 的 `html, body, #root { width: 100% }` 与 dsh-better-sidebar 的 `#root { margin-right: var(--w); width: calc(100% - var(--w)) }` 同级联冲突（后者样式 tag 靠前时被覆盖）→ 面板展开只加 margin 不缩 width → 溢出、中间栏看似不缩。用无头 Chrome 按两种样式顺序 dump 计算宽度复现后，改壳层样式去掉 `#root` 的显式宽度（auto 宽度随 margin 收缩，两种顺序都正确）。
- 教训：**壳层不要用 ID 选择器锁 #root 尺寸**，给插件留挤压空间；CSS 级联冲突用无头浏览器离线复现最快。

### 4. dsh-im「没被加载」实为 profile 静默回滚（2026-08-30 实战）

- 症状：安装成功并真机联调通过后（飞书机器人 ABI-KB 曾正常收发消息），某次重启后「IM机器人」设置入口消失，用户报「插件没有被加载成功」；**全程日志零报错**。
- 定位：三件套签名命中——`grep dsh-im package.json` 空（依赖+bundles 两条目都没了，文件与安装前快照 `package.json.bak-1788072504` 逐字节一致）、`grep -c dsh-im pnpm-lock.yaml` = 0、`node_modules/@xmanrui/dsh-im` 残留。mtime 显示条目在某时点（02:11:30）被静默移除，日志该时段无任何 profile/bundle/市场事件 → 不是恢复模式回滚（那种有 `plugin tree failed to load` 记录）。
- 修复与验证：重写两条目 → 桌面 pnpm `install --no-frozen-lockfile` → 重启 → 三路证据复查（clientModules 图谱含包 rev + `settings.section` occupants `{registrant:"im-settings", id:"xmanrui-dsh-im", order:21, active:true}` + package.json/lockfile 持久）→ 全绿。
- 附带确认：插件凭据/工作区配置存凭据存储，不随回滚丢失，重装后机器人直接恢复在线（卡片「运行正常」实时刷新）。
- 教训：**「日志干净 + 插件没加载」先查静默回滚签名，不要先查加载错误**；bundle 安装重启后必须复查 package.json 持久性；触发机制未定论（怀疑健康快照/未干净关闭自愈或市场操作）——复发时深挖 profile-selection/profile-setup 状态与启动时序。

### 5. 复制按钮失效（主进程权限 deny-all + client execCommand 假阳性，双层修复）

- 症状：点复制按钮零反馈、剪贴板无内容、日志干净。
- 定位：① client `dsh-client-ui-primitives` 的 `writeClipboard` 依赖 execCommand 兜底且曾有早 return 路径；**execCommand 在此沙箱返回 true 但不写剪贴板**；② 根因在**主进程**：`electron-runtime-DS52LbUW.js` 的 `setPermissionRequestHandler((_wc,_p,cb)=>cb(false))` deny-all → `navigator.clipboard.writeText` 必然被拒。
- 修复：① 权限处理器定向放行 `clipboard-sanitized-write`/`clipboard-write`（一行，用户确认的主进程红线例外）+ **完整重启**；② primitives `writeClipboard` 恢复 `navigator.clipboard.writeText` 优先、execCommand 仅兜底。用户真机测试通过。
- ⚠️ 后续丢失：为同一 chunk 加 console-message 转发的手术从旧基线重建文件，把①的放行行静默还原成 deny-all——二次手术/升级后必须 diff 复查（见「多次手术基线纪律」）。

### 6. 上下文溢出 CONTEXT_WINDOW_EXCEEDED（三层修复）

- 症状：长会话中途报 `CONTEXT_WINDOW_EXCEEDED`，压缩不触发或压缩自身失败。
- 三层归因：① 适配器窗口低估——pi-ai 默认 256K，模型实为 262144 未声明 → 提前溢出；② 压缩引擎默认阈值过晚，溢出时已无可压缩空间；③ **摘要同模型同窗死局**——溢出时发摘要请求，摘要请求自身也溢出。
- 修复：① settings.yaml 模型条目补 `contextWindow: 262144`；② `compaction-basic` 段 `thresholdRatio: 0.75` + `maxOverflowRetries: 3` + 摘要路由 `deepseek-official`/`deepseek-v4-flash`（独立 provider 跳出同窗死局）；③ core override `dsh-compaction-basic`（`0.1.2-alpha.1-override`）补丁：输出预算预留 + 摘要失败降级重试。同家族：早晨 imageRequestPricing 缺失已由 dsh-llm override 修复。

### 7. 飞书 ABI-KB 只回复群主 @（IM 白名单）

- 症状：机器人只对群主 @ 有响应，其他成员 @ 无响应。
- 定位：`~/.dsh/integrations/dsh-feishu/config.json` 的 `ownerOpenIds` 白名单只含群主 openId。
- 修复：`"ownerOpenIds": ["*"]`。配置≠凭据——凭据在凭据存储，改白名单不影响机器人身份与在线状态。

### 8. dsh-auto-compact：机制 A（patch insert）静默失败 → 机制 B（vendor+bundles）成功

- 症状：用 `cordis.patch.yml` 的 `insert` 安装，重启后插件零生效迹象、零报错。
- 定位：**桌面组合层静默忽略 patch.yml 的 insert 条目**（id-targeted 覆盖有效，insert 无效）。
- 修复：机制 B = vendor 到 `/Users/lute/project/Magpie-Horch/dsh-auto-compact-local` + package.json `dependencies`（`file:`）+ `dsh.profile.bundles` → 桌面 pnpm install → 重启 → 三路证据复查全绿。
- 未决（评估此类插件时注意）：工具目录**按会话创建固化**——模型在旧会话里看不到新装的 `compact_now` 工具，只有新会话才会出现；用新会话做 L4 实测。

### 9. 两次白屏 boot 竞态（2026-09-07 实战，RootOutlet 根治补丁）

- 症状：`rendererStatus: healthy`，但左侧主区空白，右侧 Files/任务管理面板正常；日志 `[Renderer] Error: renderSlot('root') before any 'root' registration (boot order)`。
- 定位：报错源 = `dsh-client-ui-renderer/lib/client.js` RootOutlet（root 槽无注册者时 throw）；root 注册者 = `dsh-client-ui-layout`（ctx.effect 中 register AppFrame）。healthy 只证明插件 fiber active，不代表渲染时刻 root 注册仍在 → healthy 与白屏可并存。
- 两次触发：① 新增 dsh-my-quotes 进组合（`dsh.client.inject` 声明不存在的 `@deepseek-ai/dsh-client-runtime` + apply 内 setInterval/MutationObserver）→ 移除两条目 + install + 重启；② pnpm install 移除插件后的**首次启动**一次性竞态 → **第二次启动自愈**。
- 关键澄清：`mcp-client(pixpix) giving up` 总与白屏错误相邻出现，是**时间伴随非因果**——重连退避 500ms+1s+2s+4s+8s+16s+30s×4 ≈ 155 秒恰好落在竞态窗口；对照实验第二次启动同样时刻无白屏。
- 根治补丁：RootOutlet 不再 throw，改 `console.error`（保留诊断）+ 渲染 `data-slot-waiting="root"` "UI 正在装载…"占位；useSyncExternalStore 已订阅 root 槽，注册到达自动重渲染恢复。备份 `.orig` + 持久副本 `~/project/Magpie-Horch/dsh-rootoutlet-heal/`；完整重启验收。
- 教训：新插件两条目齐备 + inject 只写宿主真实包名；客户端 apply 禁 boot 期高频 DOM 扫描；install/增删插件后**连续冷启动两次**验收；`mcp giving up` 只是 155 秒时间标记，别误判因果。

### 10. 网关磁盘补丁 settings 白屏 → 响应层 in-flight 转换（2026-09-07/08 实战，team-hub）

- 症状：把 dsh-team-hub 的「远程设置补丁」（改 `dsh-client-ui-settings/lib/client.js` 的两处 `connection.isLoopback ? "host" : "memory"` → `"host"`，为修局域网设置页）打到 Desktop app bundle → 重启**整屏白屏**；还原字节 → 自愈。
- 定位：补丁文件语法 OK、语义本地等价（loopback 本来就是 host），白屏与内容无关——**机制在 combo rev 管线**：boot 清单把 50+ 客户端包拼成一个大 combo，URL 带 `rev=<sha1-12hex>`，主机侧「Versioned code is immutable; mismatched revisions are rejected」。关机态改字节 → rev 失配 → 整个 combo（含 layout/renderer/sidebar/conversation 全部核心 UI）拒绝服务 → 白屏。而「加载更早」手术改同类文件可行，是因为**运行中修改触发了 HMR re-hash**。
- 修复（零磁盘接触）：网关（dsh-team-hub fork）在**响应层**对 JS 响应做 in-flight 转换——内容嗅探到目标三元串即 split/join 替换（gzip/br 先解压后压回）；成员浏览器不校验内容哈希，照常执行转换后 bundle；本地 Desktop 窗口直连原文件不受影响。
- 缓存配套（转换后浏览器仍不生效的二次修复）：上游 combo 是 `max-age=31536000, immutable` 一年强缓存 → 网关对 SPA HTML 补 `cache-control: no-store` + combo URL 注入缓存破坏参数 `&thub=<转换版本>`（转发上游前纯字符串剥离，禁用 URL API）。
- 教训：**Desktop app 内 bundle 字节永远不要关机态修改**；外部系统需要改 UI 行为时，一律走「响应层转换 + 缓存破坏」或「运行中手术」。转换行为升级时 bump 缓存破坏版本号。

### 11. 成员 UI 缺陷五连（2026-09-08 实战，team-hub 成员页）

代理/网关场景下成员页的五个问题与归因（全部网关侧修复，Desktop 零修改）：

1. **预设页报 `agentPresets/list failed: connection: invalid server-response failure`**：两层——① 网关白名单漏了 `agentPresets/list`（被拒）；② 网关的拒绝信封缺 `details` → 客户端严格校验失败，报出误导性错误而非「无权限」。修复：拒绝响应补 `details:{}` + 白名单放行只读面。
2. **胶囊卡片不出现**：数据源是 `dynamicCordisRunner/inventory` + `syncInspectManifest` + `pluginInventory/list` 三个只读端点（上游原版放行，网关移植时误入拒绝集）。修复：只读三件套放行；`invoke`/`resolveRequestRun` 维持拒绝。
3. **「选择工作区」报 `directory picker failed`**：`directoryPicker/pick` 会在宿主 Mac 弹原生对话框（特权面，拒绝正确），但真正触发链是「添加工作区」入口（目录选择器是**无渲染流**：open 即 pick），不是「选择工作区」chip。修复：shim 隐藏「添加工作区」按钮与菜单条目；**教训：按 aria-label 隐藏多状态元素（composer 输入 div 在未选工作区状态带 aria-label="选择工作区"）会让 React 转态后 display:none 残留 → UI 错位**。
4. **「加载工作区」卡住 + connection lost**：① 工作区列表数据源是 `workspace/follow` 流（网关流白名单漏放行）；② connection lost 真相是**网关进程曾因未捕获异常崩溃**（undici UND_ERR_BODY_TIMEOUT）被 launchd 拉起。修复：流放行 + 帧级归属裁剪 + 进程级 uncaughtException/unhandledRejection 记日志不退出。
5. **侧栏标题闪烁后消失**：上游 AUTO_SELECT_SHIM 用 `textarea` 探测 composer 就绪——Desktop composer 是 contenteditable div → 停止条件永不成立 → **每秒点击工作区 treeitem 90 秒**。修复：探测兼容 `[data-composer-input]`、占位符读 `data-placeholder`、点击 Set 幂等。
- 教训：代理 Desktop 前必须先摸清协议面（见下节「对外协议面速查」）；上游为 standalone web 写的 shim/DOM 脚本必须逐个验证 Desktop 元素假设；成员 UI 特权入口「能隐则隐，拒绝策略不放松」。

## Desktop 对外协议面速查（远程访问 / 网关代理诊断参考，2026-09-08 实测）

- **browser-auth cookie 墙**：`/`、`/api/*`、WS 升级（`/api/remote.mux`）都要求 `dsh-auth-<b64url(sha256(authority))>` 签名 cookie（authority=规范化 host:port）。格式 `v1.<b64url(payloadJSON)>.<b64url(HMAC-SHA256(secret, body))>`，payload `{version:1, authority, issuedAt, expiresAt}`（窗口 ≤30 天）；签名密钥 32B base64url 持久化于 `~/.dsh/.credentials.yaml` 的 `client-connection/browser-session` 记录；launch token 每进程随机（窗口 URL 带 `?token=`）。外部工具直连 /api 不带 [REDACTED] `unauthorized`（先过 Host/Origin 栅栏 403）。网关可通过读密钥铸 cookie 打通（同机信任域内）。
- **RPC 命名与信封**：斜杠命名（`session/list` 等，非 standalone 的点号）。请求 `{type:"client-request", rpcId, method, payload}`，payload 必须 `{args: <单字段对象>}`（否则 "Remote payload must contain exactly one plain-object args field"）；`session/list` 特殊 `{args:{_request:{cursor?}}}`；**无 workspace.list**（工作区所有权从 session/list 的 cwd 学习）。响应 `{type:"server-response", rpcId, result:{ok, value|error}}`。
- **事件流（WS）**：端点 `/api/remote.mux`（Typert 流复用；standalone web 的 `/api/events.mux|host` 在 Desktop 不存在）。客户端 `{type:"open", streamId, endpoint, payload}` / `{type:"cancel", streamId}`；服务端 `{type:"item", streamId, value}` / `{type:"end", streamId}` / `{type:"error", streamId, error}`。端点：`$events`（ready + emit{event,args} + waterfall{event,eventId,agentId,request} + cancel{eventId}；会话事件 api-session/added|removed|status|activity|error）、`session/control`（baseline{queues,jobs,projections} + queue/jobs/projection{sessionId}）、`workspace/follow`（baseline{items,archivedSessionIds} + upsert/remove/order/archived）、`session/follow`（按 address.sessionId 归属）。
- **客户端失败信封契约**：`error.code`/`error.message` 字符串 + `error.details` 对象，缺一 → `connection: invalid server-response failure`（掩盖真实拒绝原因）。
- **缓存**：combo `immutable` 一年强缓存；index 无缓存头。
- **settings 模式硬编码**：`connection.isLoopback ? "host" : "memory"`（两处，无配置开关）；非 loopback 来源设置页必坏，只能响应层转换修复。

## 已知的 rc→alpha 导出差异（移植参考）

| 包 | rc | alpha 替代 |
|---|---|---|
| `dsh-agent-presets` | `resolveSessionPreset(session)` | `standingMountFor(agentCtx)?.presetId`；持久化用 `agentPresetProjectionDefinition` |
| `dsh-user-questions` | `registerProvider(provider)` | `ask(request)` 直调 |
| `dsh-host-webserver` | `WebRoute`/`WebUpgradeRoute` | `webServer.register({kind,path,handler})` / `registerUpgrade({path,handler})` |
| `dsh-invariants` | `InvariantInstaller` | `InvariantRegistry`（默认导出） |
| `dsh-typert-protocol` | `TypertRemoteFailure`（rc.2 缺） | alpha 有，对齐版本即可 |
