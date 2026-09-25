---
name: "dsh-desktop-release"
title: "DSH Desktop 集成打包发布"
description: "将 DSH Desktop 2.0.4 + Magpie-Horch 全量定制层（P0 补丁、品牌、bundle profile、技能/预设、灵枢运行时）集成为可安装 dmg，并完成全链路验证；维护补丁工程（新补丁登记、锚点更新、漂移修复）。触发词：打包发布、出新版本、打包 dmg、build dmg、release、发布。"
enabled: "true"
disable-model-invocation: true
user-invocable: true
workflow: "pre-flight 预检（补丁/品牌锚点、CHANGELOG、manifest、磁盘空间）；增量变更审查；版本号决策；assemble→smoke→dmg 构建验证；只读卷终验并交付"
input_contract: 发布指令与版本号（可选：变更说明条目）
output_contract: 可安装 Mac 安装包+全链路验证报告（文件，约 20 分钟）
example: 说「打包发布 1.2.0」→ 得到签名验证通过的安装包与真机验收清单。

---
# DSH Desktop 集成打包发布

## 目标

将「DSH Desktop 2.0.4 + Magpie-Horch 全量定制层（P0 补丁 + 品牌 + 全量 bundle profile + 技能/预设 + 灵枢运行时）」集成为可安装的 **dmg**，并完成全链路验证。同时维护补丁工程（新补丁登记、锚点更新、漂移修复）。

## 触发条件

用户说「打包发布 / 出新版本 / 打包 dmg / build dmg / release / 发布」时触发。

## 前置知识

> 详见 references/prerequisites.md

## 工作流总览

```
pre-flight 预检 → 增量变更审查 → 版本号决策 → assemble → smoke → dmg → 只读卷终验 → 交付
                                                                    ↑
                                                              补丁工程（如需）
```

---

## 一、Pre-flight 预检

**每次打包前必须全部通过。** 打包工程已内置前置校验（assemble 检查磁盘空间 + 源存在性），但以下检查需要人工确认或 skill 辅助：

### 1.1 补丁锚点全绿

> 详见 references/checklists.md

期望输出：`ALL PATCHES VERIFIED`（全部锚点）。如有 DRIFT，先修复再继续（见 §六 补丁工程）。锚点总数以 `verify-patches.sh` 实际 `check` 行数 + 3 个循环检查为准。

### 1.2 品牌锚点全绿

> 详见 references/checklists.md

期望输出：`BRAND ALL VERIFIED`（全部品牌锚点）。

### 1.3 CHANGELOG 已更新

`packaging/CHANGELOG.md` 应已有本次版本的条目（至少标题行 `## [x.y.z]（日期）`），内容可在 assemble 阶段补全。

### 1.4 patches-manifest 已同步

比对 `dsh-patches/patches-manifest.md` 与 `dsh-patches/verify-patches.sh` 的锚点覆盖范围：manifest 列出的每个补丁都应在 verify 中有对应锚点。

### 1.5 磁盘空间

assemble 前置校验要求 ≥6G；实际需要约 8G（含 staging 中间产物）。

---

## 二、增量变更审查

**核心问题：自上次发布以来，哪些补丁面 / 锚点 / 完整性清单发生了变化？**

### 2.1 审查项目

| 审查项 | 检查方法 |
|---|---|
| 补丁锚点数量变化 | `grep -c '^check ' dsh-patches/verify-patches.sh` |
| 品牌锚点数量变化 | `dsh-patches/brand-replay.sh --check` 输出数 |
| profile dependencies 变化 | `node -e "console.log(Object.keys(require('$HOME/.dsh/profiles/desktop/package.json').dependencies).length)"` |
| file: 依赖数量变化 | derive from assemble vendor 列表 |
| 技能数量变化 | `ls ~/.dsh/skills/ | wc -l` |
| 预设数量变化 | `ls ~/.dsh/.agent-presets/ | wc -l` |
| 新增补丁（P0-x / UI-x 等） | 比对 patches-manifest.md 自上次 CHANGELOG 以来的新增条目 |

### 2.2 审查动作

- 若锚点数量变化 → 更新 `smoke-test.sh` 的预期值（如 31→N）
- 若 file: 依赖变化 → `completeness.json` 将自动反映（动态生成）
- 若新增补丁 → 见 §六 补丁工程登记流程
- 若技能/预设变化 → `completeness.json` 自动反映

---

## 三、版本号决策

当前版本体系：**独立语义版本 1.x + `CFBundleVersion=2.0.4-lute.<ver>`**。

版本号写入位置：
- `VERSION` 环境变量传给 `assemble.sh`
- `CFBundleVersion` 由 assemble 自动写入 `Info.plist`
- `CHANGELOG.md` 需人工填写

递增规则：补丁级变更（修 bug/调锚点）→ 1.1.0→1.1.1；功能级变更（新补丁/新架构）→ 1.1.0→1.2.0；架构级变更（重新评审）→ 1.x→2.0。

---

## 四、组装（assemble）

**单命令，约 8 分钟。** 前置：pre-flight 全部通过。

```bash
cd ~/project/Magpie-Horch/packaging
VERSION=1.2.0 ./assemble.sh
```

assemble 自动执行：
1. 拷贝并改写 app（排除 dev 机老 dsh-profile → 同源注入）
2. 暂存 profile（manifest + vendor + overrides + cordis 占位替换）
3. **R2b 双落位**：同一份 staging 内容注入 app `Resources/dsh-profile` + 制 `profile.tar.gz`
4. 内嵌 node_modules 排除 `.bin`（防断链阻塞 codesign）
5. 绝对符号链接扫描 + 断链扫描（两道门禁）
6. adhoc 深签名 + `codesign --verify --deep --strict`
7. 压缩 app（gzip -1）
8. 压缩 profile（含离线 node_modules）
9. 技能 + 预设打包
10. 灵枢 aeis 便携化
11. 装配安装器 + 工具
12. 生成元数据（VERSION / SHA256SUMS / manifest.json / completeness.json / README）

产物：`staging/<VERSION>/payload/`（安装器 + 载荷 tarball + 校验工具 + 完整性清单）

**常见失败**：
- `codesign` 拒绝 → 查看 assemble 日志，检查绝对符号链接/断链输出
- 磁盘空间不足 → 清理 staging/ 旧版本或 release/ 旧 dmg
- vendor 源缺失 → 确认 `~/project/Magpie-Horch/` 下对应目录存在

---

## 五、冒烟（smoke）

**约 5 分钟，隔离环境（/tmp），不触碰本机安装。**

```bash
cd ~/project/Magpie-Horch/packaging
./scripts/smoke-test.sh staging/<VERSION>/payload
```

断言矩阵（当前版本约 40 项）：

> 详见 references/smoke-checklist.md

> **计数纪律（关键教训）**：bundles/vendor/skills/presets 的**具体数量是动态的**（随 profile 演化），由 assemble 生成的 `completeness.json` 在每次构建时现算，smoke 据此比对。**任何地方都不硬编码这些数量**——skill 文档只描述「存在性比对」，不写死数字。

**期望输出**：`SMOKE PASSED`（exit 0）。

**常见失败**：
- `file: 依赖指向 ./vendor/` 计数不匹配 → 动态计数已自动适配（= completeness.vendor.length-1），不再硬编码
- bundle 缺失 → 检查是否因新增 bundle 类型（如官方 bundle 在 app 端而非 profile 端），必要时更新 smoke 双路径查找逻辑
- `内嵌 cordis 保留 __DSH_HOME__` 失败 → 确认 assemble 的 cordis 占位替换步骤正常执行

---

## 六、补丁工程

> 本节覆盖：新增补丁的登记流程、锚点更新、漂移修复。这是 skill 的「补丁工程」范围。

### 6.1 补丁登记清单

新增一个补丁需要同步更新以下文件：

> 详见 references/checklists.md

### 6.2 补丁施加纪律

1. **备份先行**：改前 `cp target target.pXX.bak`（如 `main.js.p07.bak`）
2. **锚点唯一**：verify 的 grep 锚点字符串必须在目标文件中**只有补丁才会引入**，避免本源代码正常演进而误报漂移
3. **计数稳定**：grep 的期望计数（`grep -c`）应对补丁内容稳定——避免用可变内容（如注释日期）作锚点；若补丁本身有多次出现（如 `replaceAll`），按实际出现次数登记
4. **dev 机验证**：新增补丁后立即跑 `verify-patches.sh` 确认全绿
5. **整机重启**：改 client bundle 后必须整机重启（Cmd+R 热重载在无 `dev:web` 时会残缺）

### 6.3 补丁漂移修复

当 `verify-patches.sh` 报告 DRIFT 时：

1. 确认漂移项是否因官方 app 升级/重装/包更新导致
2. 按 `patches-manifest.md` 的「回滚」列找到备份文件
3. 对照「改动」列重新施加补丁
4. 重新跑 `verify-patches.sh` 确认全绿
5. 若是新版本引入的新补丁需求 → 走 §6.1 完整登记流程

### 6.4 常见补丁面

| 补丁家族 | 锚点数 | 目标位置 |
|---|---|---|
| P0-1..P0-7 | 15 | app lib（electron-runtime / main.js / diagnostic-export）+ profile（noema / dsh-memory / cordis） |
| chatui 修复 | 3 | app client bundle（session-controller / client-ui-chat / conversation） |
| skill 标题 | 3 | app node_modules（dsh-skill / dsh-skill-filesystem / dsh-tool-skill） |
| 剪贴板兜底 | 1 | app node_modules（dsh-client-ui-primitives） |
| profile overrides | 3 | profile node_modules（dsh-llm / dsh-tool-subagent / dsh-file-reference-local） |
| 品牌 | 11 | app lib（client.js / dsh-web-frontend assets / native-ui）+ Info.plist |

### 6.5 main.js 补丁特别说明

main.js 是 Electron 主进程入口，补丁纪律更严格：

- 备份命名：`main.js.pXX.bak`（XX = 补丁编号）
- 插入位置：必须基于**唯一锚点行**（如 execFile ditto 行）定位，不可依赖行号
- 缩进：main.js 用 **tab 缩进**（不是空格），补丁插入时必须对齐
- 验证：改后跑 `node --check main.js` 语法门 + `verify-patches.sh` 锚点门

---

## 七、制 dmg 与只读卷终验

### 7.1 制 dmg

```bash
cd ~/project/Magpie-Horch/packaging
./sign-and-dmg.sh staging/<VERSION>/payload <VERSION>
```

产物：`release/<VERSION>/DSH-Desktop-LUTE-<VERSION>-mac-arm64.dmg` + SHA256SUMS + manifest.json + VERSION。

### 7.2 只读卷终验（真实用户路径）

**约 5 分钟。** 这是最接近用户真实操作的验证——从挂载的只读 dmg 卷直接运行安装器。

```bash
DMG=release/<VERSION>/DSH-Desktop-LUTE-<VERSION>-mac-arm64.dmg
hdiutil attach -readonly -nobrowse "$DMG" >/dev/null
MNT="/Volumes/DSH Desktop LUTE <VERSION>"

# 隔离安装
rm -rf /tmp/dsh-smoke /tmp/dsh-smoke-apps
mkdir -p /tmp/dsh-smoke /tmp/dsh-smoke-apps
DSH_HOME=/tmp/dsh-smoke/.dsh \
  APP_TARGET="/tmp/dsh-smoke-apps/DSH Desktop.app" \
  bash "$MNT/install.sh"

# 验证
grep -E "BRAND ALL|ALL PATCHES" /tmp/dsh-smoke/.dsh/.lute-install/verify.log
codesign --verify --deep --strict "/tmp/dsh-smoke-apps/DSH Desktop.app"

# 清理
hdiutil detach "$MNT"
rm -rf /tmp/dsh-smoke /tmp/dsh-smoke-apps
```

期望：安装 exit 0 + ALL PATCHES VERIFIED + BRAND ALL VERIFIED + 签名有效。

---

## 八、交付

### 8.1 交付物清单

> 详见 references/checklists.md

### 8.2 交付动作

1. 确认 `release/<VERSION>/` 下所有文件就绪
2. 输出 CHANGELOG 本次版本条目
3. 提示 GUI 真机验收清单（见 §九）
4. 按当前分发决策（手动渠道）交付 dmg

### 8.3 版本归档

- `release/` 目录保留历史版本 dmg（不自动清理）
- `staging/` 可清理旧版本释放空间
- 1.0.0 基线保留（里程碑）

---

## 九、GUI 真机验收清单（用户侧）

> 详见 references/acceptance-checklist.md

## 十、故障排查

> 详见 references/troubleshooting.md

## 十一、约束与边界

### Skill 不覆盖

- **GitHub Release / CI**：当前打包为「本机构建 + 手动分发」模式，不做 CI 矩阵或 GitHub Actions
- **Developer ID 签名**：工程保留切换参数，但 skill 默认走 adhoc
- **Windows / x64 平台**：当前仅 mac arm64
- **在线瘦身版**：只做全离线 dmg
- **GUI 真机验收**：用户侧，skill 只出清单

### 不可逾越的约束

1. **构建机 = 源机器**：assemble 依赖本机 `/Applications/DSH Desktop.app`（已补丁）和 `~/.dsh/profiles/desktop`（当前 profile）
2. **离线**：目标机免 node/pnpm/Python
3. **adhoc 签名**：目标机首次启动需右键打开（Gatekeeper）；TCC 每次重装后需重授
4. **升级语义**：安装器只替换包拥有项，`data/`（sessions/记忆库/凭据）不受影响
5. **官方更新禁用**：`app-update.yml` 清空 + P0-1 移除执行路径——永不通过官方通道升级

> 2026-09-07 SkillOpt b5 rollout：3 任务均分 92，轻量修复
