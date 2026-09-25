---
name: "dsh-dev-platform-diagnostics"
title: "DSH 二次开发平台诊断"
description: "DSH 二次开发平台（LUTE）系统异常诊断：启动白屏、进入恢复模式、插件树加载失败、插件没加载、胶囊卡/卡片样式被破坏、MCP 卡片消失、斜杠补丁失效、profile 副本改动不生效、视觉工具限流等本平台实战案例的判定与修复。触发词：白屏、启动异常、恢复模式、胶囊卡、卡片消失、插件没加载、DSH 异常、系统诊断、诊断一下。何时不用：与 DSH 桌面应用无关的通用软件问题；通用 DSH 机制细节（asar/profile override/权限处理器）请看官方技能 dsh-desktop-diagnostics，本技能只引不抄。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
workflow: "Complete in five steps:\n1. Snapshot 快照 —— 跑 diagnose.sh 拿启动终态与错误签名\n2. Match 查表 —— 症状对照判定表 A/B 定位归因\n3. Evidence 取证 —— 日志上下文 + profile 三路证据确认根因\n4. Fix 修复 —— 按案例库方案执行，改动走备份+语法门+回滚三件套\n5. Verify 验证 —— lifecycle 终态 healthy + 功能复现，结果留痕"
input_contract: 异常症状描述（白屏/恢复模式/插件消失/卡片样式坏/斜杠命令失效等）；可选：日志路径
output_contract: 症状根因判定+对应修复步骤，含修复后自检验证清单；对话内即时交付，分钟级
example: 说「DSH 桌面一开就白屏」→ 得到白屏根因判定与重启/修复步骤，附修复完成验证清单

---

# DSH 二次开发平台 · 系统异常诊断

本技能是本平台（Magpie-Horch / LUTE）DSH 桌面应用异常的实战诊断手册：**12 个近几天真实案例 + 诊断快照脚本 + 判定表**。通用机制（asar 遮蔽、profile override、权限处理器、静默回滚三件套）见官方技能 `dsh-desktop-diagnostics`，两技能互相引用、不重复内容。

## 第一步：跑诊断快照（只读，永远先做）

```bash
bash ~/.dsh/skills/dsh-dev-platform-diagnostics/scripts/diagnose.sh
```

一次采集：最近启动终态（startup.jsonl）、近 3 天错误日志签名、profile 依赖/bundles、关键插件三路证据、技能文件完整性。**先看快照再下结论，不要凭症状直接改文件。**

## 判定表 A：启动类（症状 → 证据 → 归因 → 处置）

| 症状 | 证据（错误日志签名） | 归因 | 处置 |
| --- | --- | --- | --- |
| 启动白屏（窗口开但全白） | `renderer failed to load (-312: ERR_UNSAFE_PORT)` | 宿主随机端口命中 Chromium 不安全端口黑名单（6000/6665-6669/10080 等），Electron 拒绝加载 | 重启换端口自愈；重启无效时 lsof -iTCP -sTCP:LISTEN 查端口占用、grep renderer failed 当日日志确认端口号；宿主侧缺陷，不要改 app 文件 |
| pnpm install 报 `ENOENT: scandir '/<pkg>-local'`（裸绝对路径） | lockfile 里 vendor 依赖的 `file:` 路径错位成 `../../../../../<pkg>`（5 层 `..` 直达根目录；2.0.5 freeupgrade 带入打包机生成的锁文件；`--fix-lockfile` 无效） | 双锁备份后 sed：项目锁与 `node_modules/.pnpm/lock.yaml` 中 `file:../../../../../` → `file:vendor/`（先确认全部前缀都对应 vendor 目录再动手）→ 重跑 install |
| 进入恢复模式 / 部分插件消失 | `plugin tree failed to load: failed to apply loader entry <pkg>` + 具体错误 | 某插件 apply 访问未 inject 的 service（平台实例：dsh-rename-conversations `cannot get property "tools" without inject`） | 证据双确认：startup.jsonl finalStage + 设置页插件清单缺失；定位插件 → 修 inject 声明或移除条目 → 重启；恢复模式是按设计的优雅降级 |
| 反复 ECONNRESET | 多次 `ECONNRESET` | renderer↔宿主 HTTP 中断（重启窗口/HMR 热更/插件重载） | 单次无害；若伴随重启循环 → 还原刚改的 client bundle，改完主动 Cmd+R 别指望 HMR |
| 插件没加载但日志零报错 | 日志干净 | profile 静默回滚（dsh-im 案例） | 三件套取证：package.json 两条目 / pnpm-lock 计数 / node_modules 残留 → 重写条目 → 桌面 pnpm install → 重启 → 复查持久性 |
| 上一次未干净关闭 | `previous desktop run did not shut down cleanly` | 单次无害 | 只有反复出现构成崩溃循环才排查时序 |

## 判定表 B：UI/功能类

| 症状 | 归因 | 处置 |
| --- | --- | --- |
| 胶囊卡/面板样式错乱、元素散射、布局破坏 | ① 插件 CSS 全局类名未 scoping，级联污染 Dock/侧边栏/设置页 ② 无效嵌套 HTML（按钮套按钮） ③ flex space-between 三元素散射 | 按 ①→②→③ 顺序取证：先查 CSS 是否属性 scoping，再查 HTML 嵌套，最后查 flex 布局；修复后做全插件 scoping 自检（grep 无全局类规则）再收尾 |
| MCP/连接卡片数量异常（消失/减少/不全） | ①配置读取函数「文件存在就整体返回」，不合并默认条目 ②工具清单抓取超时（15s）静默返回空 | ①改为**按 id 合并**：`{...default, ...userEntry}`，用户条目只覆盖运行时状态，默认补齐静态元数据 ②检查宿主日志抓取超时痕迹，重启后重抓 |
| 升级后文案/样式仍是旧版 | 用户配置文件存旧静态展示字段，合并时压住插件新默认 | 清除文件中的静态字段；**数据治理原则：静态展示数据归插件默认，用户文件只存运行时状态（enabled/凭证引用等）** |
| 斜杠命令补丁不生效/部分生效 | async map 未 await（Promise 数组）；补丁锚点 tab/空格漂移 | Promise.all 收齐；精确锚点全文件重写；幂等脚本 + 锚点验证门（每个替换 count==1 才落笔） |
| 改了插件代码/lib 重启不生效 | profile node_modules 是硬链接，编辑工具写新 inode 断链 | 取证：`ls -i` 对比源与副本 inode、`cmp` 验证内容；改后 `cat 源 > 副本` 同步。生效语义：client.js（带 __ModuleLoader__）Cmd+R；共享模块/主进程必须完整重启 |
| 截图/视觉工具反复失败 | 外部视觉服务限流/超时（返回 VISION_RATE_LIMITED / VISION_TIMEOUT 等 code） | **当轮不再重试**（换措辞无效）；用代码推理 + 用户口述症状替代；需要 OCR 走本地 tesseract（chi_sim+eng） |

## 平台拓扑速查（本项目关键路径）

- 宿主：`/Applications/DSH Desktop.app`（app.asar 只读；`app.asar.unpacked/` 可写且遮蔽同名路径）
- profile：`~/.dsh/profiles/desktop/`（package.json 两条目：dependencies + dsh.profile.bundles；node_modules 为硬链接；cordis.patch.yml 的 insert 被桌面组合层静默忽略）
- 插件源码：`/Users/lute/project/Magpie-Horch/`（dsh-wanzh-hulian / dsh-overseas-skills / *_local vendor 目录 / _doc-notes）
- 用户技能：`~/.dsh/skills/`（81-skills、getnote-brain、pixpix-ecommerce、本技能）；官方技能：`~/.agents/skills/`
- 日志：`~/Library/Application Support/DSH Desktop/logs/dsh-YYYY-MM-DD(.error).log`
- 生命周期：`~/Library/Application Support/DSH Desktop/lifecycle-events/startup.jsonl`（最后一条的 finalStage / rendererStatus 定生死）
- 集成配置：`~/.dsh/integrations/<pkg>/`（配置≠凭据，凭据在凭据存储）

## 案例库（13 例，本平台实战）

1. **启动白屏（9-06 22:58 ×3）**：ERR_UNSAFE_PORT → 重启自愈。见判定表 A 第 1 行。
2. **恢复模式（9-05 ×2）**：dsh-rename-conversations 访问未 inject 的 `ctx.tools` → plugin tree failed → 桌面过滤该插件进恢复模式。教训：插件 apply 里 `ctx.xxx` 属性访问必须先在 inject 声明。
3. **胶囊卡破坏·第一式（9-04~06）**：wanzh-hulian 的 `.whRoot` 等全局类名污染 Dock/侧边栏 → 全插件 `[data-plugin='dsh-wanzh-hulian']` 属性化 + 根节点挂属性。
4. **胶囊卡破坏·第二式（9-06）**：「简」按钮嵌套按钮（invalid HTML）+ 三元素 space-between 散射 → span role=button + `.ovpRight` 分组 + 防御 CSS。
5. **MCP 卡片消失（9-06）**：readMcpServers 文件存在时整体返回，getnote 单条目让 pixpix/shopify 卡消失 → 按 id 合并修复。
6. **旧配置压顶（9-06）**：用户 mcp-servers.json 存旧 capabilities/note → 清静态字段，插件默认兜底。
7. **斜杠补丁失效（9-04~06）**：async map 未 await + 锚点漂移 → Promise.all + 精确锚点重写 + 验证门。
8. **profile 副本不同步（9-04~06）**：edit 断硬链接 → cat 同步 + cmp 验证。
9. **vision 429（持续）**：外部限流 → 当轮不重试 + 代码推理替代。
10. **dsh-im 静默回滚（8-30，官方 skill 详录）**：日志零报错插件消失 → 三件套签名 + 重装 + 持久性复查。
11. **官方 skill 引用**：加载更早没反应 / 复制按钮失效 / 侧边栏不收缩 / IM 白名单 / 上下文溢出 / auto-compact 安装机制——详见 dsh-desktop-diagnostics。
12. **新技能卡片不出现 + 斜杠搜不到（9-08）**：self-improvement 的 SKILL.md 开头重复 `---`（`---\n---\n`）→ 空 frontmatter → skill-filesystem 判 missing YAML frontmatter 静默忽略 → 注册表无此技能，胶囊卡（按 skills.list 过滤）与斜杠 picker 同源消失；而宿主 /list 接口正常（catalog 与技能注册表是两个数据源，先分清再查）。处置：grep 日志 `skill file .* ignored` 秒定位 → `od -c` 看文件头 → 去重后文件监听器热重载，无需重启。教训：新装技能改 frontmatter 后必验无重复分隔符；胶囊卡 icon 调性以 lute-brand-icons 角色头像为准（同案附带换掉 2 枚扁平图标）。
> 待验证：2026-09-08 新增，诊断约 8 分钟
13. **插件按钮消失（9-08）**：「我说」按钮不见 → profile package.json 无 dsh-my-quotes → `diff package.json.bak-*` 定位 22:46 编辑时删掉的 dependencies+bundles 两条目 → 恢复条目（与删除前备份逐字一致）→ 桌面 runtime-commands/bin/pnpm install → 重启。教训：插件 UI 消失先 diff package.json 备份找「谁删了哪几行」，比翻日志更快。
> 待验证：2026-09-08 新增，诊断约 5 分钟

## 红线与流程（harness 稳定性）

1. **只读优先**：先 diagnose.sh 快照 + 日志取证，再考虑改动。
2. **重启前取证**：重启会清空全部动态插件、中断当前 agent turn（interrupted 属预期）；文件级证据先落盘。
3. **改动三件套**：`.orig` 备份 → `node --check` 语法门 → 明确回滚路径；多文件用幂等重放脚本（apply / --check / --verify-anchors / --rollback）。
4. **生效语义**：插件 client.js（带 `__ModuleLoader__` 包装）Cmd+R 重载；共享依赖模块与主进程改动必须完整重启；不要依赖 HMR 热更（无 dev:web 时热更不完整可能崩渲染器）。
5. **红线不碰**：main.js / Info.plist / 原生二进制；唯一例外是 electron-runtime 权限处理器白名单一行（须用户显式确认）。
6. **外部限流当轮不重试**：VISION_* / API rate limit 是基建状态，换措辞无效，改用替代通道并告知用户。
7. **改完必须验证**：查 lifecycle 终态 `rendererStatus: healthy` + 功能复现；「装上了」必须三路证据全绿（host 图谱 / slot occupants / 文件条目）。

## 修复验证自检

修复完成后逐项自检：① 全插件 CSS 仅 [data-plugin] 属性化（无全局类规则）② profile 副本 cmp 一致 ③ lifecycle 终态 healthy ④ 功能复现。自检未过不得宣布修复完成。
## 维护 SOP（SkillOpt 式纪律）

本技能的更新遵循 SkillOpt（Microsoft Research，arXiv 2605.23904）的三条核心纪律，保证判定表与案例库可控收敛：

1. **有界编辑**：每次真实诊断结束后，最多做 1 处原子编辑（add/delete/replace）——更新 1 行判定表或 1 个案例；改完在案例末尾留痕（日期 + 诊断耗时）。禁止一次性无界重写。
2. **验证门控**：新增的判定行/案例只有在「下一次同类异常」中证明命中更快、处置更短才转正保留；无效内容回退并记入 `references/rejected-edits.md`，同类编辑不再重复提议（拒绝编辑缓冲）。
3. **规模约束**：SKILL.md 上限 120 行 / 12KB（当前约 85 行 / 9KB）。超限时把最旧的案例细节合并到 `references/case-archive.md`，SKILL.md 只留一行指针——保持紧凑、可审计、可迁移。

案例留痕格式：`> 已验证：YYYY-MM-DD，命中判定表 X 行，诊断 <N 分钟` 或 `> 已回退：YYYY-MM-DD，原因：…（见 references/rejected-edits.md）`

> v1.1 2026-09-07 SkillOpt epoch1：held-out 验证均分 90.0 → 93.5 (+3.5)，验证门接受（26 处有界编辑，零回退）

> 2026-09-07 SkillOpt epoch2b：93.5 → 96.5 (+3.0)
