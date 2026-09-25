---
name: "ci-cd-and-automation"
title: "CI/CD 流水线"
description: "把 lint、类型检查、测试、构建串成 CI 质量门，产出 GitHub Actions 流水线配置与部署、回滚、功能开关策略。触发词：CI/CD 流水线、ci-cd-and-automation、把 lint、类型检查、测试、构建串成 CI 质量门，产出 GitHub Actions 流水线配置与部署、回滚、功能开关策略。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# CI/CD 与自动化

## 概述

把质量门自动化，让任何变更都必须通过测试、lint、类型检查和构建才能进入生产。CI/CD 是其他每一个技能的执行机制——它抓住人和 agent 都会漏掉的东西，并且在每一次变更上都一致地抓。

**左移（Shift Left）：**尽可能早地在流水线里发现问题。lint 阶段抓到的 bug 只花几分钟；同一个 bug 在生产环境抓到就花几小时。把检查往上游挪——静态分析在测试之前，测试在 staging 之前，staging 在生产之前。

**越快越安全（Faster is Safer）：**更小的批次、更频繁的发布降低风险，而不是增加风险。一个带 3 处变更的部署比带 30 处的更容易排查。频繁发布本身也在建立对发布流程的信心。

## 何时使用

- 搭建新项目的 CI 流水线
- 新增或修改自动化检查
- 配置部署流水线
- 当某类变更应当触发自动验证时
- 排查 CI 失败

## 质量门流水线

每一次变更在合并前都要过这些门：

```
Pull Request Opened
    │
    ▼
┌─────────────────┐
│   LINT CHECK     │  eslint, prettier
│   ↓ pass         │
│   TYPE CHECK     │  tsc --noEmit
│   ↓ pass         │
│   UNIT TESTS     │  jest/vitest
│   ↓ pass         │
│   BUILD          │  npm run build
│   ↓ pass         │
│   INTEGRATION    │  API/DB tests
│   ↓ pass         │
│   E2E (optional) │  Playwright/Cypress
│   ↓ pass         │
│   SECURITY AUDIT │  npm audit
│   ↓ pass         │
│   BUNDLE SIZE    │  bundlesize check
└─────────────────┘
    │
    ▼
  Ready for review
```

**任何一道门都不能跳过。**lint 失败就修 lint——不要关掉规则。测试失败就修代码——不要跳过测试。

## GitHub Actions 配置

### 基础 CI 流水线

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

      - name: Test
        run: npm test -- --coverage

      - name: Build
        run: npm run build

      - name: Security audit
        run: npm audit --audit-level=high
```

### 带数据库集成测试

```yaml
  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: testdb
          POSTGRES_USER: ci_user
          POSTGRES_[REDACTED] secrets.CI_DB_PASSWORD }}
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://ci_user:${{ secrets.CI_DB_PASSWORD }}@localhost:5432/testdb
      - name: Integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://ci_user:${{ secrets.CI_DB_PASSWORD }}@localhost:5432/testdb
```

> **注意：**即使是只在 CI 里用的测试数据库，凭据也要走 GitHub Secrets，而不是硬编码。这能养成好习惯，也能避免测试凭据在其他场景被误用。

### E2E 测试

```yaml
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      - name: Build
        run: npm run build
      - name: Run E2E tests
        run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## 把 CI 失败喂回给 agent

CI 配上 AI agent 的威力在于那个反馈回路。当 CI 失败时：

```
CI fails
    │
    ▼
Copy the failure output
    │
    ▼
Feed it to the agent:
"The CI pipeline failed with this error:
[paste specific error]
Fix the issue and verify locally before pushing again."
    │
    ▼
Agent fixes → pushes → CI runs again
```

**关键模式：**

```
Lint failure → Agent runs `npm run lint --fix` and commits
Type error  → Agent reads the error location and fixes the type
Test failure → Agent follows debugging-and-error-recovery skill
Build error → Agent checks config and dependencies
```

## 部署策略

### 预览部署

每个 PR 都拿到一个预览部署，供人工测试：

```yaml
# Deploy preview on PR (Vercel/Netlify/etc.)
deploy-preview:
  runs-on: ubuntu-latest
  if: github.event_name == 'pull_request'
  steps:
    - uses: actions/checkout@v4
    - name: Deploy preview
      run: npx vercel --[REDACTED] secrets.VERCEL_TOKEN }}
```

### 功能开关

功能开关把「部署」和「发布」解耦。把未完成或有风险的功能放在开关后面部署，于是你可以：

- **部署代码但不启用它。**早点合并到 main，准备好了再打开。
- **不重新部署就能回滚。**关掉开关，而不是回滚代码。
- **对新功能做金丝雀。**先给 1% 用户，再 10%，再 100%。
- **跑 A/B 测试。**对比有该功能和没有该功能时的行为。

```typescript
// Simple feature flag pattern
if (featureFlags.isEnabled('new-checkout-flow', { userId })) {
  return renderNewCheckout();
}
return renderLegacyCheckout();
```

**开关的生命周期：**创建 → 为测试启用 → 金丝雀 → 全量放开 → 移除开关与死代码。永远活着的开关会变成技术债——创建时就给它定一个清理日期。

### 分阶段发布

```
PR merged to main
    │
    ▼
  Staging deployment (auto)
    │ Manual verification
    ▼
  Production deployment (manual trigger or auto after staging)
    │
    ▼
  Monitor for errors (15-minute window)
    │
    ├── Errors detected → Rollback
    └── Clean → Done
```

### 回滚方案

每一次部署都应当是可逆的：

```yaml
# Manual rollback workflow
name: Rollback
on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to rollback to'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - name: Rollback deployment
        run: |
          # Deploy the specified previous version
          npx vercel rollback ${{ inputs.version }}
```

## 环境管理

```
.env.example       → Committed (template for developers)
.env                → NOT committed (local development)
.env.test           → Committed (test environment, no real secrets)
CI secrets          → Stored in GitHub Secrets / vault
Production secrets  → Stored in deployment platform / vault
```

CI 绝不应当持有生产机密。CI 测试用单独的凭据。

## CI 之外的自动化

### Dependabot / Renovate

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    open-pull-requests-limit: 5
```

### Build Cop 角色

指定一个人负责让 CI 保持绿色。构建坏掉时，修好或回滚是 Build Cop 的职责——不是那个造成破坏的变更作者的职责。这能避免坏构建不断堆积、而每个人都以为别人会去修。

### PR 检查

- **必需的审查：**合并前至少 1 个批准
- **必需的状态检查：**合并前 CI 必须通过
- **分支保护：**禁止向 main 强推
- **自动合并：**所有检查通过且已批准时自动合并

## CI 优化

流水线超过 10 分钟时，按影响从大到小的顺序应用这些策略：

```
Slow CI pipeline?
├── Cache dependencies
│   └── Use actions/cache or setup-node cache option for node_modules
├── Run jobs in parallel
│   └── Split lint, typecheck, test, build into separate parallel jobs
├── Only run what changed
│   └── Use path filters to skip unrelated jobs (e.g., skip e2e for docs-only PRs)
├── Use matrix builds
│   └── Shard test suites across multiple runners
├── Optimize the test suite
│   └── Remove slow tests from the critical path, run them on a schedule instead
└── Use larger runners
    └── GitHub-hosted larger runners or self-hosted for CPU-heavy builds
```

**示例：缓存与并行**
```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci
      - run: npx tsc --noEmit

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci
      - run: npm test -- --coverage
```

## 常见的自我合理化

| 自我合理化 | 现实 |
|---|---|
| 「CI 太慢了」 | 去优化流水线（见下方的 CI 优化），不要跳过它。一条 5 分钟的流水线能省下几小时的排查。 |
| 「这个改动微不足道，跳过 CI 吧」 | 微不足道的改动也会弄坏构建。何况 CI 对微不足道的改动本来就很快。 |
| 「这个测试不稳定，重跑一下就行」 | 不稳定的测试会掩盖真实 bug，还浪费所有人的时间。去修那个不稳定性。 |
| 「我们以后再上 CI」 | 没有 CI 的项目会不断堆积坏状态。第一天就搭起来。 |
| 「手工测试就够了」 | 手工测试不可扩展也不可重复。能自动化的就自动化。 |

## 危险信号

- 项目里没有 CI 流水线
- CI 失败被忽略或被静音
- 为了让流水线通过而在 CI 里禁用测试
- 没有经过 staging 验证就上生产
- 没有回滚机制
- 机密存在代码或 CI 配置文件里（而不是密钥管理器）
- CI 耗时很长却没人尝试优化

## 验证

搭好或改完 CI 之后：

- [ ] 所有质量门都在（lint、类型、测试、构建、审计）
- [ ] 每个 PR 和每次推送 main 都会跑流水线
- [ ] 失败会拦住合并（已配置分支保护）
- [ ] CI 结果回流到开发循环里
- [ ] 机密存在密钥管理器里，不在代码里
- [ ] 部署有回滚机制
- [ ] 测试套件的流水线在 10 分钟以内跑完
