---
name: "turborepo"
title: "Monorepo"
description: "配置并排查 Turborepo 构建：任务依赖流水线、本地与远程缓存、--affected 增量构建。触发词：Monorepo、turborepo、配置并排查 Turborepo 构建：任务依赖流水线、本地与远程缓存、--affected 增量构建。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# Turborepo

面向 JavaScript/TypeScript monorepo 的构建系统。Turborepo 会缓存任务输出，并基于依赖图并行执行任务。

## 重要：用包级任务，不要用根级任务

**优先用包级任务，而不是根级任务（Root Tasks）。**

在创建任务/脚本/流水线时，你必须默认采用包级任务：

1. 把脚本加到每个相关包的 `package.json` 里
2. 在根 `turbo.json` 里注册该任务
3. 根 `package.json` 只用 `turbo run <task>` 做转发

**不要**把任务逻辑放在根 `package.json` 里，如果它本可以放在各个包里。这会废掉 Turborepo 的并行能力。

```json
// DO THIS: Scripts in each package
// apps/web/package.json
{ "scripts": { "build": "next build", "lint": "eslint .", "test": "vitest" } }

// apps/api/package.json
{ "scripts": { "build": "tsc", "lint": "eslint .", "test": "vitest" } }

// packages/ui/package.json
{ "scripts": { "build": "tsc", "lint": "eslint .", "test": "vitest" } }
```

```json
// turbo.json - register tasks
{
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "lint": {},
    "test": { "dependsOn": ["build"] }
  }
}
```

```json
// Root package.json - ONLY delegates, no task logic
{
  "scripts": {
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test"
  }
}
```

```json
// DO NOT DO THIS - defeats parallelization
// Root package.json
{
  "scripts": {
    "build": "cd apps/web && next build && cd ../api && tsc",
    "lint": "eslint apps/ packages/",
    "test": "vitest"
  }
}
```

根级任务（`//#taskname`）**只**用于那些确实无法放进包里的任务，例如 Vitest Projects 的 `//#test`、仓库级的发布脚本，或者本身不调用 `turbo` 的工具链。

## 次要规则：`turbo run` 与 `turbo`

**当命令要写进代码里时，始终使用 `turbo run`：**

```json
// package.json - ALWAYS "turbo run"
{
  "scripts": {
    "build": "turbo run build"
  }
}
```

```yaml
# CI workflows - ALWAYS "turbo run"
- run: turbo run build --affected
```

**简写形式 `turbo <tasks>` 只用于终端里的一次性命令**，由人或 agent 直接敲。绝不要把 `turbo build` 写进 package.json、CI 或脚本。

## 快速决策树

### 「我要配置一个任务」

```
Configure a task?
├─ Define task dependencies → references/configuration/tasks.md
├─ Lint/check-types (parallel + caching) → Use Transit Nodes pattern (see below)
├─ Specify build outputs → references/configuration/tasks.md#outputs
├─ Handle environment variables → references/environment/RULE.md
├─ Set up dev/watch tasks → references/configuration/tasks.md#persistent
├─ Package-specific config → references/configuration/RULE.md#package-configurations
└─ Global settings (cacheDir, daemon) → references/configuration/global-options.md
```

### 「我的缓存不工作」

```
Cache problems?
├─ Tasks run but outputs not restored → Missing `outputs` key
├─ Cache misses unexpectedly → references/caching/gotchas.md
├─ Need to debug hash inputs → Use --summarize or --dry
├─ Want to skip cache entirely → Use --force or cache: false
├─ Remote cache not working → references/caching/remote-cache.md
└─ Environment causing misses → references/environment/gotchas.md
```

### 「我只想跑改动过的包」

```
Run only what changed?
├─ Changed packages + dependents (RECOMMENDED) → turbo run build --affected
├─ Custom base branch → TURBO_SCM_BASE=origin/develop turbo run build --affected
├─ Manual git comparison → --filter=...[origin/main]
└─ See all filter options → references/filtering/RULE.md
```

**`--affected` 是「只跑改动过的包」的首选方式。** 它拿 `main`（取不到则用 `master`）作对比基准 —— 而不是仓库配置的默认分支 —— 并且会把依赖方一并纳入。其它基准分支用 `TURBO_SCM_BASE` 指定。

### 「我要过滤包」

```
Filter packages?
├─ Only changed packages → --affected (see above)
├─ By package name → --filter=web
├─ By directory → --filter=./apps/*
├─ Package + dependencies → --filter=web...
├─ Package + dependents → --filter=...web
└─ Complex combinations → references/filtering/patterns.md
```

### 「环境变量不生效」

```
Environment issues?
├─ Vars not available at runtime → Strict mode filtering (default)
├─ Cache hits with wrong env → Var not in `env` key
├─ .env changes not causing rebuilds → .env not in `inputs`
├─ CI variables missing → references/environment/gotchas.md
└─ Framework vars (NEXT_PUBLIC_*) → Auto-included via inference
```

### 「我要搭 CI」

```
CI setup?
├─ GitHub Actions → references/ci/github-actions.md
├─ Vercel deployment → references/ci/vercel.md
├─ Remote cache in CI → references/caching/remote-cache.md
├─ Only build changed packages → --affected flag
├─ Skip unnecessary builds → turbo-ignore (references/cli/commands.md)
└─ Skip container setup when no changes → turbo-ignore
```

### 「开发时我想监听文件变化」

```
Watch mode?
├─ Re-run tasks on change → turbo watch (references/watch/RULE.md)
├─ Dev servers with dependencies → Use `with` key (references/configuration/tasks.md#with)
├─ Restart dev server on dep change → Use `interruptible: true`
└─ Persistent dev tasks → Use `persistent: true`
```

### 「我要创建/组织一个包」

```
Package creation/structure?
├─ Create an internal package → references/best-practices/packages.md
├─ Repository structure → references/best-practices/structure.md
├─ Dependency management → references/best-practices/dependencies.md
├─ Best practices overview → references/best-practices/RULE.md
├─ JIT vs Compiled packages → references/best-practices/packages.md#compilation-strategies
└─ Sharing code between apps → references/best-practices/RULE.md#package-types
```

### 「我的 monorepo 该怎么组织结构？」

```
Monorepo structure?
├─ Standard layout (apps/, packages/) → references/best-practices/RULE.md
├─ Package types (apps vs libraries) → references/best-practices/RULE.md#package-types
├─ Creating internal packages → references/best-practices/packages.md
├─ TypeScript configuration → references/best-practices/structure.md#typescript-configuration
├─ ESLint configuration → references/best-practices/structure.md#eslint-configuration
├─ Dependency management → references/best-practices/dependencies.md
└─ Enforce package boundaries → references/boundaries/RULE.md
```

### 「我要强制架构边界」

```
Enforce boundaries?
├─ Check for violations → turbo boundaries
├─ Tag packages → references/boundaries/RULE.md#tags
├─ Restrict which packages can import others → references/boundaries/RULE.md#rule-types
└─ Prevent cross-package file imports → references/boundaries/RULE.md
```

## 关键反模式

### 在代码里使用 `turbo` 简写

**`turbo run` 才是 package.json 脚本与 CI 流水线里该用的写法。** 简写 `turbo <task>` 是给交互式终端准备的。

```json
// WRONG - using shorthand in package.json
{
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev"
  }
}

// CORRECT
{
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev"
  }
}
```

```yaml
# WRONG - using shorthand in CI
- run: turbo build --affected

# CORRECT
- run: turbo run build --affected
```

### 根脚本绕过 Turbo

根 `package.json` 的脚本必须转发给 `turbo run`，而不是直接跑任务。

```json
// WRONG - bypasses turbo entirely
{
  "scripts": {
    "build": "bun build",
    "dev": "bun dev"
  }
}

// CORRECT - delegates to turbo
{
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev"
  }
}
```

### 用 `&&` 串联 Turbo 任务

不要用 `&&` 串接 turbo 任务。让 turbo 来做编排。

```json
// WRONG - turbo task not using turbo run
{
  "scripts": {
    "changeset:publish": "bun build && changeset publish"
  }
}

// CORRECT
{
  "scripts": {
    "changeset:publish": "turbo run build && changeset publish"
  }
}
```

### 手工构建依赖的 `prebuild` 脚本

`prebuild` 这类手工去构建其它包的脚本，绕过了 Turborepo 的依赖图。

```json
// WRONG - manually building dependencies
{
  "scripts": {
    "prebuild": "cd ../../packages/types && bun run build && cd ../utils && bun run build",
    "build": "next build"
  }
}
```

**不过，怎么修取决于 workspace 依赖有没有声明：**

1. **如果依赖已声明**（例如 package.json 里有 `"@repo/types": "workspace:*"`），删掉 `prebuild` 脚本。Turbo 的 `dependsOn: ["^build"]` 会自动处理。

2. **如果依赖没有声明**，`prebuild` 存在是因为没有依赖关系时 `^build` 不会触发。修法是：
   - 先把依赖加进 package.json：`"@repo/types": "workspace:*"`
   - 然后删掉 `prebuild` 脚本

```json
// CORRECT - declare dependency, let turbo handle build order
// package.json
{
  "dependencies": {
    "@repo/types": "workspace:*",
    "@repo/utils": "workspace:*"
  },
  "scripts": {
    "build": "next build"
  }
}

// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"]
    }
  }
}
```

**关键点：** `^build` 只会在被声明为依赖的包里跑 build。没有依赖声明 = 没有自动的构建顺序。

### 过于宽泛的 `globalDependencies`

`globalDependencies` 通过**全局哈希**影响所有包里的所有任务 —— 任务无法只对某些文件豁免，哪怕在 `inputs` 里写反选 glob 也不行。要写得具体。

```json
// WRONG - heavy hammer, affects all hashes
{
  "globalDependencies": ["**/.env.*local"]
}

// BETTER - move to task-level inputs
{
  "globalDependencies": [".env"],
  "tasks": {
    "build": {
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": ["dist/**"]
    }
  }
}
```

开启 `futureFlags.globalConfiguration` 之后，这个问题会得到缓解，因为 `global.inputs` 里的文件会被折进每个任务的 inputs（而不是进全局哈希）。任务就能排除特定文件了：

```json
// BEST - global.inputs with per-task exclusion
{
  "futureFlags": { "globalConfiguration": true },
  "global": {
    "inputs": [".env"]
  },
  "tasks": {
    "build": { "outputs": ["dist/**"] },
    "lint": {
      "inputs": ["$TURBO_DEFAULT$", "!$TURBO_ROOT$/.env"]
    }
  }
}
```

### 重复的任务配置

留意各任务之间可以合并的重复配置。Turborepo 支持共享配置的写法。

```json
// WRONG - repetitive env and inputs across tasks
{
  "tasks": {
    "build": {
      "env": ["API_URL", "DATABASE_URL"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"]
    },
    "test": {
      "env": ["API_URL", "DATABASE_URL"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"]
    },
    "dev": {
      "env": ["API_URL", "DATABASE_URL"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "cache": false,
      "persistent": true
    }
  }
}

// BETTER - use globalEnv and globalDependencies for shared config
{
  "globalEnv": ["API_URL", "DATABASE_URL"],
  "globalDependencies": [".env*"],
  "tasks": {
    "build": {},
    "test": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**什么时候用全局、什么时候用任务级：**

- `globalEnv` / `globalDependencies` —— 影响所有任务，用于真正共享的配置
- 任务级 `env` / `inputs` —— 只有特定任务需要时用它

### 不算反模式：很长的 `env` 数组

一个很长的 `env` 数组（哪怕 50 个以上变量）**不是**问题。它通常说明用户很仔细地声明了构建所依赖的环境。不要把它当成问题报出来。

### 使用 `--parallel` 选项

`--parallel` 会绕过 Turborepo 的依赖图。它已被弃用，并会在未来的大版本中移除 —— 请改用任务配置（`persistent`、`with`）。

```bash
# WRONG - bypasses dependency graph
turbo run lint --parallel

# CORRECT - configure tasks to allow parallel execution
# In turbo.json, set dependsOn appropriately (or use transit nodes)
turbo run lint
```

### 在根 turbo.json 里写包级任务覆盖

当多个包需要不同的任务配置时，用**包级配置**（每个包各自的 `turbo.json`），而不是把根 `turbo.json` 塞满 `package#task` 覆盖项。

```json
// WRONG - root turbo.json with many package-specific overrides
{
  "tasks": {
    "test": { "dependsOn": ["build"] },
    "@repo/web#test": { "outputs": ["coverage/**"] },
    "@repo/api#test": { "outputs": ["coverage/**"] },
    "@repo/utils#test": { "outputs": [] },
    "@repo/cli#test": { "outputs": [] },
    "@repo/core#test": { "outputs": [] }
  }
}

// CORRECT - use Package Configurations
// Root turbo.json - base config only
{
  "tasks": {
    "test": { "dependsOn": ["build"] }
  }
}

// packages/web/turbo.json - package-specific override
{
  "extends": ["//"],
  "tasks": {
    "test": { "outputs": ["coverage/**"] }
  }
}

// packages/api/turbo.json
{
  "extends": ["//"],
  "tasks": {
    "test": { "outputs": ["coverage/**"] }
  }
}
```

**包级配置的好处：**

- 配置离它所影响的代码更近
- 根 turbo.json 保持干净，只专注基础模式
- 更容易看清每个包特殊在哪里
- 可以配合 `$TURBO_EXTENDS$` 继承并扩展数组

**什么时候才在根里用 `package#task`：**

- 单个包需要一种独有的依赖关系（例如 `"deploy": { "dependsOn": ["web#build"] }`）
- 迁移期间的临时覆盖

完整细节见 `references/configuration/RULE.md#package-configurations`。

### 在 `inputs` 里用 `../` 越出包范围

不要用 `../` 这类相对路径引用包外的文件。改用 `$TURBO_ROOT$`。

```json
// WRONG - traversing out of package
{
  "tasks": {
    "build": {
      "inputs": ["$TURBO_DEFAULT$", "../shared-config.json"]
    }
  }
}

// CORRECT - use $TURBO_ROOT$ for repo root
{
  "tasks": {
    "build": {
      "inputs": ["$TURBO_DEFAULT$", "$TURBO_ROOT$/shared-config.json"]
    }
  }
}
```

### 会产出文件的任务却缺 `outputs`

**在报「缺 outputs」之前，先看清这个任务到底产出了什么：**

1. 读该包的脚本（例如 `"build": "tsc"`、`"test": "vitest"`）
2. 判断它是往磁盘写文件，还是只往 stdout 输出
3. 只有当它产出的文件确实该被缓存时才报

```json
// WRONG: build produces files but they're not cached
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"]
    }
  }
}

// CORRECT: build outputs are cached
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}
```

各框架常见的 outputs：

- Next.js：`[".next/**", "!.next/cache/**", "!.next/dev/**"]`
- Vite/Rollup：`["dist/**"]`
- tsc：`["dist/**"]`，或自定义的 `outDir`

**TypeScript 的 `--noEmit` 依然可能产出缓存文件：**

当 tsconfig.json 里 `incremental: true` 时，即便不输出 JS，`tsc --noEmit` 也会写出 `.tsbuildinfo` 文件。在断定「没有 outputs」之前先看 tsconfig：

```json
// If tsconfig has incremental: true, tsc --noEmit produces cache files
{
  "tasks": {
    "typecheck": {
      "outputs": ["node_modules/.cache/tsbuildinfo.json"] // or wherever tsBuildInfoFile points
    }
  }
}
```

要确定 TypeScript 任务正确的 outputs：

1. 检查 tsconfig 里是否启用了 `incremental` 或 `composite`
2. 检查 `tsBuildInfoFile` 是否指定了自定义缓存位置（默认：与 `outDir` 同目录，或在项目根目录）
3. 如果没有开增量模式，`tsc --noEmit` 不产出任何文件

### `^build` 与 `build` 的混淆

```json
{
  "tasks": {
    // ^build = run build in DEPENDENCIES first (other packages this one imports)
    "build": {
      "dependsOn": ["^build"]
    },
    // build (no ^) = run build in SAME PACKAGE first
    "test": {
      "dependsOn": ["build"]
    },
    // pkg#task = specific package's task
    "deploy": {
      "dependsOn": ["web#build"]
    }
  }
}
```

### 环境变量没有进哈希

```json
// WRONG: API_URL changes won't cause rebuilds
{
  "tasks": {
    "build": {
      "outputs": ["dist/**"]
    }
  }
}

// CORRECT: API_URL changes invalidate cache
{
  "tasks": {
    "build": {
      "outputs": ["dist/**"],
      "env": ["API_URL", "API_KEY"]
    }
  }
}
```

### `.env` 文件没有进 inputs

Turbo 不会去加载 `.env` 文件 —— 那是你的框架干的。但 Turbo 需要知道这些文件的变化：

```json
// WRONG: .env changes don't invalidate cache
{
  "tasks": {
    "build": {
      "env": ["API_URL"]
    }
  }
}

// CORRECT: .env file changes invalidate cache
{
  "tasks": {
    "build": {
      "env": ["API_URL"],
      "inputs": ["$TURBO_DEFAULT$", ".env", ".env.*"]
    }
  }
}
```

### monorepo 根目录下的 `.env` 文件

仓库根目录放 `.env` 是反模式 —— 哪怕是对小 monorepo 或脚手架模板也一样。它在包之间制造了隐式耦合，也让人搞不清哪个包依赖哪些变量。

```
// WRONG - root .env affects all packages implicitly
my-monorepo/
├── .env              # Which packages use this?
├── apps/
│   ├── web/
│   └── api/
└── packages/

// CORRECT - .env files in packages that need them
my-monorepo/
├── apps/
│   ├── web/
│   │   └── .env      # Clear: web needs DATABASE_URL
│   └── api/
│       └── .env      # Clear: api needs API_KEY
└── packages/
```

**根 `.env` 的问题：**

- 说不清哪些包消费了哪些变量
- 所有包都拿到所有变量（包括它们根本不需要的）
- 缓存失效粒度太粗（根 .env 一改，全都失效）
- 安全风险：包可能误访问本该给别人的敏感变量
- 坏习惯都是从小处开始的 —— 脚手架模板更应该示范正确的做法

**如果你确实必须共享变量**，用 `globalEnv` 把「共享了什么」显式写出来，并注明原因。

### Strict 模式过滤掉 CI 变量

默认情况下，Turborepo 会把环境变量过滤到只剩 `env`/`globalEnv` 里列出的那些。CI 变量可能会不见：

```json
// If CI scripts need GITHUB_TOKEN but it's not in env:
{
  "globalPassThroughEnv": ["GITHUB_TOKEN", "CI"],
  "tasks": { ... }
}
```

或者用 `--env-mode=loose`（生产环境不推荐）。

### 把共享代码放在 app 里（它应该是个包）

```
// WRONG: Shared code inside an app
apps/
  web/
    shared/          # This breaks monorepo principles!
      utils.ts

// CORRECT: Extract to a package
packages/
  utils/
    src/utils.ts
```

### 跨包边界直接访问文件

```typescript
// WRONG: Reaching into another package's internals
import { Button } from "../../packages/ui/src/button";

// CORRECT: Install and import properly
import { Button } from "@repo/ui/button";
```

### 根依赖太多

```json
// WRONG: App dependencies in root
{
  "dependencies": {
    "react": "^18",
    "next": "^14"
  }
}

// CORRECT: Only repo tools in root
{
  "devDependencies": {
    "turbo": "latest"
  }
}
```

## 常用任务配置

### 标准构建流水线

```json
{
  "$schema": "https://v2-10-13-canary-6.turborepo.dev/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**", "!.next/dev/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

如果你有需要并行执行、同时又要正确失效缓存的任务，再加上一个 `transit` 任务（见下文）。

### 带 `^dev` 模式的 dev 任务（用于 `turbo watch`）

根 turbo.json 里一个 `dependsOn: ["^dev"]`、`persistent: false` 的 `dev` 任务看着可能有点怪，但对 **`turbo watch` 工作流来说是正确的**：

```json
// Root turbo.json
{
  "tasks": {
    "dev": {
      "dependsOn": ["^dev"],
      "cache": false,
      "persistent": false  // Packages have one-shot dev scripts
    }
  }
}

// Package turbo.json (apps/web/turbo.json)
{
  "extends": ["//"],
  "tasks": {
    "dev": {
      "persistent": true  // Apps run long-running dev servers
    }
  }
}
```

**它为什么成立：**

- **包**（例如 `@acme/db`、`@acme/validators`）的 `"dev": "tsc"` 是一次性的类型生成，很快就跑完
- **应用**用 `persistent: true` 覆盖它，因为跑的是真正的 dev server（Next.js 等）
- **`turbo watch`** 会在源文件变化时重跑这些一次性的包级 `dev` 脚本，让类型保持同步

**预期用法：** 运行 `turbo watch dev`（而不是 `turbo run dev`）。watch 模式会在文件变化时重新执行一次性任务，同时让常驻任务继续运行。

**替代写法：** 给一次性依赖构建单独起个名字，比如 `prepare` 或 `generate`，让意图更清楚：

```json
{
  "tasks": {
    "prepare": {
      "dependsOn": ["^prepare"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "dependsOn": ["prepare"],
      "cache": false,
      "persistent": true
    }
  }
}
```

### 用 Transit 节点处理「并行执行 + 缓存失效」

有些任务可以并行跑（不需要依赖的构建产物），但依赖的源码一变就必须让缓存失效。

**`dependsOn: ["^taskname"]` 的问题：**

- 强制串行执行（慢）

**`dependsOn: []`（无依赖）的问题：**

- 允许并行执行（快）
- 但缓存是错的 —— 改依赖的源码不会让缓存失效

**Transit 节点同时解决这两点：**

```json
{
  "tasks": {
    "transit": { "dependsOn": ["^transit"] },
    "my-task": { "dependsOn": ["transit"] }
  }
}
```

`transit` 任务建立了依赖关系，却不对应任何真实脚本，于是任务得以并行执行，同时缓存失效仍然正确。

**怎么找出需要这个模式的任务：** 那些会读依赖的源文件、但不需要依赖构建产物的任务。

### 带上环境变量

```json
{
  "globalEnv": ["NODE_ENV"],
  "globalDependencies": [".env"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "env": ["API_URL", "DATABASE_URL"]
    }
  }
}
```

开启 `futureFlags.globalConfiguration` 后，同样的配置会把全局设置移到 `global` 之下 —— 而 `.env` 变成每个任务的 input，不再是全局哈希的 input：

```json
{
  "futureFlags": { "globalConfiguration": true },
  "global": {
    "env": ["NODE_ENV"],
    "inputs": [".env"]
  },
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "env": ["API_URL", "DATABASE_URL"]
    }
  }
}
```

## 参考索引

### 配置

| 文件                                                                            | 用途                                                                      |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [configuration/RULE.md](./references/configuration/RULE.md)                     | turbo.json 总览、包级配置                                                 |
| [configuration/tasks.md](./references/configuration/tasks.md)                   | dependsOn、outputs、inputs、env、cache、persistent                        |
| [configuration/global-options.md](./references/configuration/global-options.md) | globalEnv、globalDependencies、global 键、futureFlags、cacheDir、envMode  |
| [configuration/gotchas.md](./references/configuration/gotchas.md)               | 常见配置错误                                                              |

### 缓存

| 文件                                                            | 用途                                         |
| --------------------------------------------------------------- | -------------------------------------------- |
| [caching/RULE.md](./references/caching/RULE.md)                 | 缓存如何工作、哈希输入                       |
| [caching/remote-cache.md](./references/caching/remote-cache.md) | Vercel Remote Cache、自建、login/link        |
| [caching/gotchas.md](./references/caching/gotchas.md)           | 排查缓存未命中、--summarize、--dry           |

### 环境变量

| 文件                                                          | 用途                                      |
| ------------------------------------------------------------- | ----------------------------------------- |
| [environment/RULE.md](./references/environment/RULE.md)       | env、globalEnv、passThroughEnv            |
| [environment/modes.md](./references/environment/modes.md)     | Strict 与 Loose 模式、框架推断            |
| [environment/gotchas.md](./references/environment/gotchas.md) | .env 文件、CI 问题                        |

### 过滤

| 文件                                                        | 用途                     |
| ----------------------------------------------------------- | ------------------------ |
| [filtering/RULE.md](./references/filtering/RULE.md)         | --filter 语法总览        |
| [filtering/patterns.md](./references/filtering/patterns.md) | 常见过滤模式             |

### CI/CD

| 文件                                                      | 用途                            |
| --------------------------------------------------------- | ------------------------------- |
| [ci/RULE.md](./references/ci/RULE.md)                     | 通用 CI 原则                    |
| [ci/github-actions.md](./references/ci/github-actions.md) | 完整的 GitHub Actions 配置      |
| [ci/vercel.md](./references/ci/vercel.md)                 | Vercel 部署、turbo-ignore       |
| [ci/patterns.md](./references/ci/patterns.md)             | --affected、缓存策略            |

### CLI

| 文件                                            | 用途                                          |
| ----------------------------------------------- | --------------------------------------------- |
| [cli/RULE.md](./references/cli/RULE.md)         | turbo run 基础                                |
| [cli/commands.md](./references/cli/commands.md) | turbo run 选项、turbo-ignore、其它命令        |

### 最佳实践

| 文件                                                                          | 用途                                                            |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [best-practices/RULE.md](./references/best-practices/RULE.md)                 | monorepo 最佳实践总览                                           |
| [best-practices/structure.md](./references/best-practices/structure.md)       | 仓库结构、workspace 配置、TypeScript/ESLint 配置                |
| [best-practices/packages.md](./references/best-practices/packages.md)         | 创建内部包、JIT 与 Compiled、exports                            |
| [best-practices/dependencies.md](./references/best-practices/dependencies.md) | 依赖管理、安装、版本同步                                        |

### Watch 模式

| 文件                                        | 用途                                            |
| ------------------------------------------- | ----------------------------------------------- |
| [watch/RULE.md](./references/watch/RULE.md) | turbo watch、可中断任务、dev 工作流             |

### 边界（实验性）

| 文件                                                  | 用途                                                  |
| ----------------------------------------------------- | ----------------------------------------------------- |
| [boundaries/RULE.md](./references/boundaries/RULE.md) | 强制包隔离、基于 tag 的依赖规则                       |

## 来源文档

本技能基于 Turborepo 官方文档：

- 来源：Turborepo 仓库中的 `apps/docs/content/docs/`
- 线上：https://turborepo.dev/docs
