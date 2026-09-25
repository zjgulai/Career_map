---
name: "setup-pre-commit"
title: "Pre-commit 配置"
description: "配置 pre-commit 钩子。触发词：Pre-commit 配置、setup-pre-commit、配置 pre-commit 钩子。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# 配置 Pre-Commit Hook

## 这会搭建什么

- **Husky** pre-commit hook
- **lint-staged**，对所有已暂存文件运行 Prettier
- **Prettier** 配置（如果缺失）
- pre-commit hook 中的 **typecheck** 和 **test** 脚本

## 步骤

### 1. 检测包管理器

检查 `package-lock.json`（npm）、`pnpm-lock.yaml`（pnpm）、`yarn.lock`（yarn）、`bun.lockb`（bun）。哪个存在就用哪个。无法确定时默认使用 npm。

### 2. 安装依赖

以 devDependencies 方式安装：

```
husky lint-staged prettier
```

### 3. 初始化 Husky

```bash
npx husky init
```

这会创建 `.husky/` 目录，并在 package.json 中添加 `prepare: "husky"`。

### 4. 创建 `.husky/pre-commit`

写入以下文件（Husky v9+ 不需要 shebang）：

```
npx lint-staged
npm run typecheck
npm run test
```

**适配**：把 `npm` 替换为检测到的包管理器。如果仓库的 package.json 中没有 `typecheck` 或 `test` 脚本，则省略对应行并告知用户。

### 5. 创建 `.lintstagedrc`

```json
{
  "*": "prettier --ignore-unknown --write"
}
```

### 6. 创建 `.prettierrc`（如果缺失）

仅当不存在任何 Prettier 配置时才创建。使用以下默认值：

```json
{
  "useTabs": false,
  "tabWidth": 2,
  "printWidth": 80,
  "singleQuote": false,
  "trailingComma": "es5",
  "semi": true,
  "arrowParens": "always"
}
```

### 7. 验证

- [ ] `.husky/pre-commit` 存在且可执行
- [ ] `.lintstagedrc` 存在
- [ ] package.json 中的 `prepare` 脚本为 `"husky"`
- [ ] `prettier` 配置存在
- [ ] 运行 `npx lint-staged` 验证其可用

### 8. 提交

暂存所有更改/新建的文件，并以如下信息提交：`Add pre-commit hooks (husky + lint-staged + prettier)`

这次提交会跑一遍新的 pre-commit hook：正好作为一次冒烟测试，验证一切正常。

## 注意事项

- Husky v9+ 的 hook 文件不需要 shebang
- `prettier --ignore-unknown` 会跳过 Prettier 无法解析的文件（图片等）
- pre-commit 先运行 lint-staged（快速、只处理已暂存文件），然后运行完整的 typecheck 和测试
