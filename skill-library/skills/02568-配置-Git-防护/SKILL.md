---
name: "git-guardrails-claude-code"
title: "Git 操作护栏"
description: "git 操作护栏（防危险操作）。触发词：Git 操作护栏、git-guardrails-claude-code、git 操作护栏（防危险操作）。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# 配置 Git 防护

设置一个 PreToolUse hook，在 Claude 执行危险的 git 命令之前拦截并阻止它们。

## 会被拦截的命令

- `git push`（包括 `--force` 在内的所有变体）
- `git reset --hard`
- `git clean -f` / `git clean -fd`
- `git branch -D`
- `git checkout .` / `git restore .`

被拦截时，Claude 会看到一条消息，告知它无权访问这些命令。

## 步骤

### 1. 询问安装范围

询问用户：是**仅为当前项目**安装（`.claude/settings.json`），还是**为所有项目**安装（`~/.claude/settings.json`）？

### 2. 复制 hook 脚本

随附的脚本位于：[scripts/block-dangerous-git.sh](scripts/block-dangerous-git.sh)

根据安装范围复制到目标位置：

- **项目级**：`.claude/hooks/block-dangerous-git.sh`
- **全局**：`~/.claude/hooks/block-dangerous-git.sh`

用 `chmod +x` 使其可执行。

### 3. 把 hook 加入设置

添加到相应的设置文件：

**项目级**（`.claude/settings.json`）：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-dangerous-git.sh"
          }
        ]
      }
    ]
  }
}
```

**全局**（`~/.claude/settings.json`）：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/block-dangerous-git.sh"
          }
        ]
      }
    ]
  }
}
```

如果设置文件已存在，把 hook 合并进已有的 `hooks.PreToolUse` 数组。不要覆盖其他设置。

### 4. 询问是否需要自定义

询问用户是否想从拦截列表中增加或移除某些模式。据此修改复制出来的脚本。

### 5. 验证

运行一次快速测试：

```bash
echo '{"tool_input":{"command":"git push origin main"}}' | <path-to-script>
```

应以退出码 2 退出，并向 stderr 打印一条 BLOCKED 消息。
