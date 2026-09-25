# 一键部署流水线

从检查到部署到验证的完整发布流程。区分代码部署和Prompt部署——两者是独立的流程。

## 使用方式

在Codex中输入 `/deploy` 或引用此Skill。

支持三种模式：
- `/deploy code` — 代码部署（含构建、测试、部署、E2E验证）
- `/deploy prompt {name}` — Prompt独立部署（灰度发布，不涉及代码变更）
- `/deploy all` — 同时有代码和Prompt变更时的联合部署

## 前置条件

- CI/CD流水线已配置（GitHub Actions + Vercel/Railway）
- Langfuse已配置（用于Prompt独立部署）
- Playwright MCP可用（用于部署后E2E验证）

---

## 模式一：代码部署 (`/deploy code`)

### 部署前检查

在部署前强制检查（任何一项失败都阻止部署）：

```
□ npm run lint        — 通过
□ npm run typecheck   — 通过  
□ npm run test        — 通过（所有单元测试+集成测试）
□ npm run eval        — 通过（评估门禁：底线+安全）
□ 无未提交的更改       — git status clean
□ 当前分支已同步main   — 如果有未合并的main变更，先rebase
```

如果任何一项失败，终止部署并报告：
```
⛔ 部署已阻止：{检查项} 未通过
原因：{具体失败信息}
修复：[建议]
```

### 部署执行

```
1. git push origin {branch} → 触发CI
2. 等待CI通过（lint + typecheck + test + eval + build）
3. 部署到staging环境
4. Playwright MCP运行核心E2E测试（staging URL）
5. Staging验证通过 → 合并PR → 部署到production
6. Playwright MCP运行production E2E验证
```

### 部署后验证（Playwright MCP自动化）

```
用Playwright MCP在production URL上执行：
1. 页面加载正常（核心页面可达，无白屏/500）
2. 核心用户流程：注册→核心功能→完成（完整的happy path）
3. 流式响应正常（AI功能有流式输出）
4. 错误处理正常（故意触发一个边界条件，看错误提示是否友好）
5. 控制台无报错（no console errors）
6. 移动端响应式正常（至少检查一个关键页面）
```

### 部署后监控（前30分钟）

在部署后的30分钟内关注：
- Sentry错误率（> 2x基线 → 告警）
- 核心API的p50/p95延迟（> 2x基线 → 告警）
- LLM调用的错误率

如果任何指标异常，准备回滚。

---

## 模式二：Prompt独立部署 (`/deploy prompt {name}`)

**核心认知**：Prompt发布不需要代码部署。Langfuse的标签机制支持运行时切换Prompt版本。

### 流程

```
1. 确认Prompt对比评估结果：
   → npm run eval -- --compare prompts/{name}/v{old}.md prompts/{name}/v{new}.md
   → 确认新版在综合指标上显著优于旧版（p < 0.05）
   → 确认无安全指标倒退

2. 在Langfuse中更新Prompt标签：
   - 当前版本 production 标签 → 保留在 v{old}
   - 新版 v{new} → 设置 canary 标签

3. 灰度发布（流量按用户ID哈希分配，保证同一用户始终看到同一版本）：
   Step 1: 5% 流量 → canary标签 → 观察4小时
   Step 2: 25% 流量 → canary标签 → 观察8小时
   Step 3: 50% 流量 → canary标签 → 观察12-24小时
   Step 4: 100% 流量 → canary标签 → 观察后 production 标签移到 v{new}

   每一步观测：
   - 点踩率无明显上升
   - 无安全违规报告
   - 错误率无明显上升
   - 如果异常 → 立即将 production 标签移回 v{old}（<1秒回滚）
   ```

### 回滚

Prompt回滚比代码回滚快得多：
```
Langfuse中 production 标签 → 移回 v{old}
→ <1秒生效
→ 同时失效 v{new} 的语义缓存（避免用户看到旧缓存中的新版Prompt输出）
→ 不需要重新部署代码
```

---

## 模式三：联合部署 (`/deploy all`)

当一次发布同时包含代码变更和Prompt变更时，部署顺序很重要：

```
1. 先部署Prompt（通过Langfuse的Prompt灰度发布）
   → 因为Prompt回滚最快（<1秒），万一出问题影响最小

2. 验证Prompt变更在生产环境正常后，再部署代码

3. 代码部署按模式一的流程走

如果代码部署失败：
  → 代码回滚即可，Prompt保持不变
如果Prompt灰度中发现问题：
  → Prompt立即回滚，代码继续部署（因为代码变更应该独立于Prompt版本）
```

---

## 关键原则

- **Prompt和代码独立部署**：Prompt变更是运营操作（<1秒回滚），代码变更是工程操作（需要重新构建部署）。不要把两者绑在一起
- **先验证staging，再动production**：即使你"只改了一行"
- **灰度是保险，不是可选**：100%的部署事故都发生在没做灰度的发布中
- **回滚预案必须在部署前想好**：回滚是标签移动还是代码revert？需要失效缓存吗？
- **部署后30分钟是关键窗口**：别部署完就下班
