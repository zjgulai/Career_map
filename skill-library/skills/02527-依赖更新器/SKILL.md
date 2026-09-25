---
name: "dependency-updater"
title: "依赖更新"
description: "跨语言检测过时依赖并按语义化版本分级处置：minor/patch 自动应用、major 逐个询问，附冲突诊断与安全审计。触发词：依赖更新、dependency-updater、跨语言检测过时依赖并按语义化版本分级处置：minor/patch 自动应用、major 逐个询问，附冲突诊断与安全审计。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# 依赖更新器

面向任何语言的智能依赖管理，带自动检测与安全更新。

---

## 快速上手

```
update my dependencies
```

本技能会自动检测你的项目类型，其余的交给自己处理。

---

## 触发场景

| 触发场景 | 示例 |
|---------|---------|
| 更新依赖 | 「update dependencies」、「update deps」 |
| 检查过期 | 「check for outdated packages」 |
| 修复依赖问题 | 「fix my dependency problems」 |
| 安全审计 | 「audit dependencies for vulnerabilities」 |
| 诊断依赖 | 「diagnose dependency issues」 |

---

## 支持的语言

| 语言 | 清单文件 | 更新工具 | 审计工具 |
|----------|--------------|-------------|------------|
| **Node.js** | package.json | `taze` | `npm audit` |
| **Python** | requirements.txt, pyproject.toml | `pip-review` | `safety`, `pip-audit` |
| **Go** | go.mod | `go get -u` | `govulncheck` |
| **Rust** | Cargo.toml | `cargo update` | `cargo audit` |
| **Ruby** | Gemfile | `bundle update` | `bundle audit` |
| **Java** | pom.xml, build.gradle | `mvn versions:*` | `mvn dependency:*` |
| **.NET** | *.csproj | `dotnet outdated` | `dotnet list package --vulnerable` |

---

## 速查表

| 更新类型 | 版本变化 | 动作 |
|-------------|----------------|--------|
| **Fixed（固定）** | 无 `^` 或 `~` | 跳过（有意钉死的版本） |
| **PATCH** | `x.y.z` → `x.y.Z` | 自动应用 |
| **MINOR** | `x.y.z` → `x.Y.0` | 自动应用 |
| **MAJOR** | `x.y.z` → `X.0.0` | 逐个询问用户 |

---

## 工作流

```
User Request
    │
    ▼
┌─────────────────────────────────────────────────────┐
│ Step 1: DETECT PROJECT TYPE                         │
│ • Scan for package files (package.json, go.mod...) │
│ • Identify package manager                          │
├─────────────────────────────────────────────────────┤
│ Step 2: CHECK PREREQUISITES                         │
│ • Verify required tools are installed               │
│ • Suggest installation if missing                   │
├─────────────────────────────────────────────────────┤
│ Step 3: SCAN FOR UPDATES                            │
│ • Run language-specific outdated check              │
│ • Categorize: MAJOR / MINOR / PATCH / Fixed         │
├─────────────────────────────────────────────────────┤
│ Step 4: AUTO-APPLY SAFE UPDATES                     │
│ • Apply MINOR and PATCH automatically               │
│ • Report what was updated                           │
├─────────────────────────────────────────────────────┤
│ Step 5: PROMPT FOR MAJOR UPDATES                    │
│ • AskUserQuestion for each MAJOR update             │
│ • Show current → new version                        │
├─────────────────────────────────────────────────────┤
│ Step 6: APPLY APPROVED MAJORS                       │
│ • Update only approved packages                     │
├─────────────────────────────────────────────────────┤
│ Step 7: FINALIZE                                    │
│ • Run install command                               │
│ • Run security audit                                │
└─────────────────────────────────────────────────────┘
```

---

## 按语言分的命令

### Node.js (npm/yarn/pnpm)

```bash
# Check prerequisites
scripts/check-tool.sh taze "npm install -g taze"

# Scan for updates
taze

# Apply minor/patch
taze minor --write

# Apply specific majors
taze major --write --include pkg1,pkg2

# Monorepo support
taze -r  # recursive

# Security
npm audit
npm audit fix
```

### Python

```bash
# Check outdated
pip list --outdated

# Update all (careful!)
pip-review --auto

# Update specific
pip install --upgrade package-name

# Security
pip-audit
safety check
```

### Go

```bash
# Check outdated
go list -m -u all

# Update all
go get -u ./...

# Tidy up
go mod tidy

# Security
govulncheck ./...
```

### Rust

```bash
# Check outdated
cargo outdated

# Update within semver
cargo update

# Security
cargo audit
```

### Ruby

```bash
# Check outdated
bundle outdated

# Update all
bundle update

# Update specific
bundle update --conservative gem-name

# Security
bundle audit
```

### Java (Maven)

```bash
# Check outdated
mvn versions:display-dependency-updates

# Update to latest
mvn versions:use-latest-releases

# Security
mvn dependency:tree
mvn dependency-check:check
```

### .NET

```bash
# Check outdated
dotnet list package --outdated

# Update specific
dotnet add package PackageName

# Security
dotnet list package --vulnerable
```

---

## 诊断模式

依赖已经坏了的时候，跑诊断：

### 常见问题与修法

| 问题 | 症状 | 修法 |
|-------|----------|-----|
| **版本冲突** | 「Cannot resolve dependency tree」 | 干净重装，用 overrides/resolutions |
| **Peer 依赖** | 「Peer dependency not satisfied」 | 装上所需的 peer 版本 |
| **安全漏洞** | `npm audit` 报出问题 | `npm audit fix` 或手工升级 |
| **无用依赖** | 打包体积臃肿 | 跑 `depcheck`（Node）或等价工具 |
| **重复依赖** | 装进了多个版本 | 跑 `npm dedupe` 或等价命令 |

### 应急修法

```bash
# Node.js - Nuclear reset
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Python - Clean virtualenv
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Go - Reset modules
rm go.sum
go mod tidy
```

---

## 安全审计

任何项目都可以跑安全检查：

```bash
# Node.js
npm audit
npm audit --json | jq '.metadata.vulnerabilities'

# Python
pip-audit
safety check

# Go
govulncheck ./...

# Rust
cargo audit

# Ruby
bundle audit

# .NET
dotnet list package --vulnerable
```

### 按严重级别的响应

| 严重级别 | 动作 |
|----------|--------|
| **Critical** | 立即修复 |
| **High** | 24 小时内修复 |
| **Moderate** | 1 周内修复 |
| **Low** | 下个版本修复 |

---

## 反模式

| 避免 | 原因 | 改为 |
|-------|-----|---------|
| 更新固定版本 | 那是有意钉住的 | 跳过它们 |
| 自动应用 MAJOR | 有破坏性变更 | 询问用户 |
| 批量询问 MAJOR | 丢失上下文 | 逐个询问 |
| 跳过锁文件 | 构建不可复现 | 锁文件一定提交 |
| 无视安全告警 | 存在漏洞 | 按严重级别处理 |

---

## 验证清单

更新之后：

- [ ] 更新扫描未报错
- [ ] MINOR/PATCH 已自动应用
- [ ] MAJOR 更新已逐个询问
- [ ] 固定版本未被触碰
- [ ] 锁文件已更新
- [ ] 安装命令已执行
- [ ] 安全审计已通过（或问题已记录）

---

<details>
<summary><strong>深入：项目检测</strong></summary>

本技能通过扫描清单文件来自动检测项目类型：

| 发现的文件 | 语言 | 包管理器 |
|------------|----------|-----------------|
| `package.json` | Node.js | npm/yarn/pnpm |
| `requirements.txt` | Python | pip |
| `pyproject.toml` | Python | pip/poetry |
| `Pipfile` | Python | pipenv |
| `go.mod` | Go | go modules |
| `Cargo.toml` | Rust | cargo |
| `Gemfile` | Ruby | bundler |
| `pom.xml` | Java | Maven |
| `build.gradle` | Java/Kotlin | Gradle |
| `*.csproj` | .NET | dotnet |

**在 monorepo 里检测顺序很重要：**
1. 先查当前目录
2. 再查是否有 workspace/monorepo 结构
3. 若适用，提议递归执行

</details>

<details>
<summary><strong>深入：Node.js 与 taze</strong></summary>

### 前置条件

```bash
# Install taze globally (recommended)
npm install -g taze

# Or use npx
npx taze
```

### 智能更新流程

```bash
# 1. Scan all updates
taze

# 2. Apply safe updates (minor + patch)
taze minor --write

# 3. For each major, prompt user:
#    "Update @types/node from ^20.0.0 to ^22.0.0?"
#    If yes, add to approved list

# 4. Apply approved majors
taze major --write --include approved-pkg1,approved-pkg2

# 5. Install
npm install  # or pnpm install / yarn
```

### 自动批准清单

有些包 major 版本跳得频繁但向后兼容：

| 包 | 理由 |
|---------|--------|
| `lucide-react` | 图标库，major 都是增量添加 |
| `@types/*` | 类型定义，通常安全 |

</details>

<details>
<summary><strong>深入：版本策略</strong></summary>

### 语义化版本

```
MAJOR.MINOR.PATCH (e.g., 2.3.1)

MAJOR: Breaking changes - requires code changes
MINOR: New features - backward compatible
PATCH: Bug fixes - backward compatible
```

### 范围修饰符

| 修饰符 | 含义 | 示例 |
|-----------|---------|---------|
| `^1.2.3` | Minor + Patch 可以升 | `>=1.2.3 <2.0.0` |
| `~1.2.3` | 只升 Patch | `>=1.2.3 <1.3.0` |
| `1.2.3` | 精确（固定） | 只允许 `1.2.3` |
| `>=1.2.3` | 至少 | 任何 `>=1.2.3` |
| `*` | 任意 | 最新（危险） |

### 推荐策略

```json
{
  "dependencies": {
    "critical-lib": "1.2.3",      // Exact for critical
    "stable-lib": "~1.2.3",       // Patch only for stable
    "modern-lib": "^1.2.3"        // Minor OK for active
  }
}
```

</details>

<details>
<summary><strong>深入：冲突消解</strong></summary>

### Node.js 冲突

**诊断：**
```bash
npm ls package-name      # See dependency tree
npm explain package-name # Why installed
yarn why package-name    # Yarn equivalent
```

**用 overrides 消解：**
```json
// package.json
{
  "overrides": {
    "lodash": "^4.18.0"
  }
}
```

**用 resolutions 消解（Yarn）：**
```json
{
  "resolutions": {
    "lodash": "^4.18.0"
  }
}
```

### Python 冲突

**诊断：**
```bash
pip check
pipdeptree -p package-name
```

**消解：**
```bash
# Use virtual environment
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Or use constraints
pip install -c constraints.txt -r requirements.txt
```

</details>

---

## 脚本参考

| 脚本 | 用途 |
|--------|---------|
| `scripts/check-tool.sh` | 验证工具已安装 |
| `scripts/run-taze.sh` | 用正确的参数跑 taze |

---

## 相关工具

| 工具 | 语言 | 用途 |
|------|----------|---------|
| [taze](https://github.com/antfu-collective/taze) | Node.js | 智能依赖更新 |
| [npm-check-updates](https://github.com/raineorshine/npm-check-updates) | Node.js | taze 的替代品 |
| [pip-review](https://github.com/jgonggrijp/pip-review) | Python | 交互式 pip 更新 |
| [cargo-edit](https://github.com/killercup/cargo-edit) | Rust | Cargo 依赖管理 |
| [bundler-audit](https://github.com/rubysec/bundler-audit) | Ruby | 安全审计 |
