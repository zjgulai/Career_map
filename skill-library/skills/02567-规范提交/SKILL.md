---
name: "git-commit"
title: "约定式提交"
description: "分析 diff 判断变更类型与影响范围，按 Conventional Commits 规范暂存文件并生成提交信息。触发词：约定式提交、git-commit、分析 diff 判断变更类型与影响范围，按 Conventional Commits 规范暂存文件并生成提交信息。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# Git Commit（Conventional Commits 规范提交）

## 概述

使用 Conventional Commits 规范创建标准化、语义化的 git 提交。分析真实的 diff，判断合适的 type、scope 与提交信息。

## Conventional Commit 格式

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## 提交类型

| 类型       | 用途                           |
| ---------- | ------------------------------ |
| `feat`     | 新功能                         |
| `fix`      | Bug 修复                       |
| `docs`     | 仅文档                         |
| `style`    | 格式/样式（不改逻辑）          |
| `refactor` | 代码重构（既非新功能也非修复） |
| `perf`     | 性能改进                       |
| `test`     | 新增/更新测试                  |
| `build`    | 构建系统/依赖                  |
| `ci`       | CI/配置变更                    |
| `chore`    | 维护/杂项                      |
| `revert`   | 回滚提交                       |

## 破坏性变更

```
# Exclamation mark after type/scope
feat!: remove deprecated endpoint

# BREAKING CHANGE footer
feat: allow config to extend other configs

BREAKING CHANGE: `extends` key behavior changed
```

## 工作流

### 1. 分析 diff

```bash
# If files are staged, use staged diff
git diff --staged

# If nothing staged, use working tree diff
git diff

# Also check status
git status --porcelain
```

### 2. 暂存文件（如需要）

如果一个文件都没暂存，或者你想换一种方式给变更分组：

```bash
# Stage specific files
git add path/to/file1 path/to/file2

# Stage by pattern
git add *.test.*
git add src/components/*

# Interactive staging
git add -p
```

**绝不提交机密信息**（.env、credentials.json、私钥）。

### 3. 生成提交信息

分析 diff，判断：

- **Type（类型）**：这是哪种变更？
- **Scope（范围）**：受影响的是哪个区域/模块？
- **Description（描述）**：用一行说清改了什么（现在时、祈使语气、少于 72 字符）

### 4. 执行提交

```bash
# Single line
git commit -m "<type>[scope]: <description>"

# Multi-line with body/footer
git commit -m "$(cat <<'EOF'
<type>[scope]: <description>

<optional body>

<optional footer>
EOF
)"
```

## 最佳实践

- 每次提交只包含一个逻辑变更
- 用现在时：「add」而不是「added」
- 用祈使语气：「fix bug」而不是「fixes bug」
- 引用 issue：`Closes #123`、`Refs #456`
- 描述保持在 72 字符以内

## Git 安全协议

- 绝不更新 git config
- 未经明确要求，绝不运行破坏性命令（--force、hard reset）
- 除非用户要求，绝不跳过钩子（--no-verify）
- 绝不强推到 main/master
- 如果提交因钩子失败，修好后新建一次提交（不要使用 amend）
