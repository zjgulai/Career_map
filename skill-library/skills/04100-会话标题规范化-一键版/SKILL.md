---
name: rename-conversations
title: "会话标题规范化"
description: "- 当用户要求批量重命名或规范化 DSH 桌面端所有项目下的会话（对话）标题时使用，目标格式统一为 MMDD｜类型｜主题，可一键批量执行。Use when the user asks to rename conversations, batch rename chats, standardize session titles across workspaces, or mentions 会话标题/对话重命名/规范化标题/整理左侧栏。只改标题，绝不改项目名。"
user-invocable: true
workflow: "用 rc_probe 盘点会话；计算 MMDD｜类型｜主题 新标题；输出两列表格等用户确认；调用 rc_batch_rename 一键执行；报告成功与失败数"
disable-model-invocation: false
enabled: "true"
input_contract: 无需提供文件，说「批量重命名／规范化会话标题」即可，全部项目自动盘点
output_contract: 先出原名称→新名称对照表（MMDD｜类型｜主题）等确认；确认后一键批量改，报成功／失败数
example: 说「把所有会话标题规范化」→ 得到新旧标题对照表；确认后一键改好并报告成功／失败数

---

# 会话标题规范化（一键版）

把当前 DSH Desktop 中所有项目（工作区）下的会话标题统一为 `MMDD｜类型｜主题`。**执行前必须先输出两列表格等用户确认，确认后才修改。**

## 审计模式

1. check-only 审计（只查不改）：输出「合规清单 + 不合规清单 + 建议新标题」三列表，不进入确认执行门。
2. 合规判定谓词：标题匹配 MMDD｜类型｜主题 格式且 MMDD 与 createdAt 的 Asia/Shanghai 日期一致（不一致判不合规）；问候类会话（你好/在吗等）豁免。
3. rc_probe 单次上限 30 个：候选超 30 时按 30 个/批分批调用详情，禁止静默截断。
## 硬规则

1. 日期取会话创建时间 `createdAt`，按 **Asia/Shanghai** 时区转换，格式 `MMDD`；**绝不用 `updatedAt`**。
2. 格式：`MMDD｜类型｜主题`（全角竖线分隔）。
3. 类型限定为八字之一：`功能`、`设计`、`修复`、`优化`、`发布`、`探索`、`文档`、`研究`。
4. 主题根据会话实际内容提炼，**不重复项目名称**；标题简洁、具体，适合左侧栏窄宽显示。
5. 无法判断主题时**不要猜，保留原名称**（不进修改清单）。
6. 只修改会话标题；**绝不修改**：项目名称、对话内容、项目归属、排序、置顶、归档状态。
7. 子代理会话（`origin: "subagent"` 或存在 `parentSessionId`）默认跳过；空白会话（`blank: true` 或内容为空）默认跳过。

## Few-shot

| 原名称 | 新名称 |
| --- | --- |
| 优化批次文字显示 | 0903｜优化｜批次文字显示 |
| 整合快捷键提示页面 | 0902｜功能｜整合快捷键提示页 |
| 提交代码到 GitHub | 0813｜发布｜提交代码到GitHub |
| 新功能讨论 | 0901｜设计｜界面对齐检查 |

## 执行流程

### 第 1 步 · 盘点（只读，两个工具调用搞定）

直接调用常驻工具 `rc_probe`（宿主插件 dsh-rename-conversations 提供，**无需 cordis_define**）：

1. 不带参数调用一次 `rc_probe` → 全部会话清单（sessionId / 当前标题 / cwd / blank / running / origin / parentSessionId）。
2. 再调用一次 `rc_probe`，`sessionIds` 传全部**非子代理、非空白**的会话 id → 每个会话直接返回 `createdShanghai`（已换算好的 MMDD）、`currentTitle`、`firstUserText` 与 `userTexts`（各 ≤200 字、最多 3 条，已瘦身）。

> 若工具集里没有 `rc_probe`：说明宿主插件未安装/未重启，按「排障备注」安装并重启后再执行。

### 第 2 步 · 计算新标题

- `MMDD` 直接用 `details[id].createdShanghai`（不要再换算）。
- 从 `firstUserText`/`userTexts` 提炼主题（≤10 字；不重复 cwd 的项目名；内容不足以判断时保留原名）。
- 类型：明显是改 bug 用「修复」；调样式/交互细节用「优化」；新增能力用「功能」；讨论方案/界面用「设计」；发布/上线/提交用「发布」；尝试新事物用「探索」；写作/整理资料用「文档」；调研分析用「研究」；无法归类时保留原名。
- 问候/寒暄类会话（你好、你是谁、干啥呢等）一律保留原名。

### 第 3 步 · 输出表格并等待确认

**只输出**一个两列表（表头严格为）：

| 原名称 | 新名称 |

不要附带解释文字。**必须等用户明确确认后才能进入第 4 步。**

### 第 4 步 · 一键执行重命名

调用 `rc_batch_rename` **一次**，`renames` 传 `[{sessionId, title}, ...]`（表格中的全部条目）。工具内部逐条串行、单条失败不影响其余，返回聚合结果。个别失败（`ok:false`）记录原因，不重试、不猜改。

### 第 5 步 · 报告

**只报告修改结果**：`成功 N 个 / 失败 K 个（原因）`，不再输出完整对话。

## 排障备注（实测结论）

- `rc_probe` / `rc_batch_rename` / `rc_rename` 由宿主插件 `dsh-rename-conversations` 常驻注册（profile bundles），**应用重启后依然可用**；不要在会话内重复 cordis_define。
- 重命名走官方 `sessionController.rename`（契约 `session/rename`）：冷会话自动 resume 后落盘 `session/title` 事件，客户端列表即刷新生效。
- `sessionController.list/inspect` 只读冷安全；标题字节上限由 session-title 服务控制（中文标题保持 ≤30 字最稳）。
- 不要直接改 `~/.dsh/sessions/**/session.jsonl.zstd` 磁盘文件：运行中的应用持有内存态，绕过 API 会丢改或造成不一致。
- 安装/更新：改 `~/.dsh/profiles/desktop/package.json`（dependencies `file:../../../project/Magpie-Horch/dsh-rename-conversations` + `dsh.profile.bundles` 追加 `dsh-rename-conversations`）→ 桌面 pnpm `install --no-frozen-lockfile` → 重启 DSH Desktop。

## 附录 · 宿主插件缺失时的临时 fallback

若 `rc_probe` 不可用且暂时无法重启，用 cordis_define 定义临时宿主插件（idPrefix `rchr`），run 后调用其 `rc_probe` / `rc_batch_rename`；**重启后临时插件失效，仍以常驻插件为准**：

```javascript
return {
  name: 'rename-conversations-helper',
  apply(ctx) {
    const controller = ctx.get('sessionController');
    if (controller === undefined) throw new Error('sessionController service unavailable');
    const probe = harness.defineTool({
      name: 'rc_probe',
      description: '只读盘点会话清单与详情（含 createdShanghai 日期换算与文本瘦身）。',
      parameters: { type: 'object', properties: { sessionIds: { type: 'array', items: { type: 'string' } } }, required: [] },
      output: { schema: { type: 'object', additionalProperties: true }, render: (a, v) => [{ type: 'text', text: JSON.stringify(v, null, 2) }] },
      execute: async (args) => {
        const out = { rows: [], details: {} };
        try {
          const list = await controller.list({});
          for (const row of (list.items ?? [])) {
            out.rows.push({ sessionId: row.sessionId, title: row.projections && row.projections.title !== undefined ? row.projections.title : null, cwd: row.cwd ?? null, updatedAt: row.updatedAt, blank: row.blank, running: row.running, origin: row.origin ?? null, parentSessionId: row.parentSessionId ?? null });
          }
        } catch (e) { out.listError = String(e && e.message ? e.message : e); }
        const ids = Array.isArray(args && args.sessionIds) ? args.sessionIds.slice(0, 30) : [];
        for (const id of ids) {
          try {
            const ins = await controller.inspect(id);
            const meta = ins && ins.meta;
            const events = Array.isArray(ins && ins.events) ? ins.events : [];
            const sh = (ms) => { if (typeof ms !== 'number') return null; const d = new Date(ms + 8 * 3600 * 1000); return String(d.getUTCMonth() + 1).padStart(2, '0') + String(d.getUTCDate()).padStart(2, '0'); };
            const clip = (s, max) => { const x = String(s ?? '').replace(/\s+/g, ' ').trim(); return x.length > max ? x.slice(0, max) + '…' : x; };
            const texts = events.filter((e) => e && e.type === 'user/message').map((e) => { const c = e.data && e.data.message && e.data.message.content ? e.data.message.content : (e.data && e.data.content) || []; return c.map((b) => (b && b.text) || '').join(' ').trim(); }).filter((t) => t.length > 0);
            const titles = events.filter((e) => e && e.type === 'session/title' && e.data && typeof e.data.title === 'string');
            out.details[id] = { createdAt: meta ? meta.createdAt : null, createdShanghai: sh(meta ? meta.createdAt : null), cwd: meta ? meta.cwd : null, currentTitle: titles.length > 0 ? titles[titles.length - 1].data.title : null, firstUserText: clip(texts[0] ?? '', 120), userTexts: texts.slice(0, 3).map((t) => clip(t, 200)) };
          } catch (e) { out.details[id] = { error: String(e && e.message ? e.message : e) }; }
        }
        return out;
      }
    });
    const batch = harness.defineTool({
      name: 'rc_batch_rename',
      description: '一键批量重命名会话标题（逐条串行，单条失败不影响其余）。',
      parameters: { type: 'object', properties: { renames: { type: 'array', items: { type: 'object', properties: { sessionId: { type: 'string' }, title: { type: 'string' } }, required: ['sessionId', 'title'] } } }, required: ['renames'] },
      output: { schema: { type: 'object', additionalProperties: true }, render: (a, v) => [{ type: 'text', text: JSON.stringify(v, null, 2) }] },
      execute: async (args) => {
        const renames = Array.isArray(args && args.renames) ? args.renames : [];
        const results = []; let success = 0, failed = 0;
        for (const item of renames) {
          const sessionId = String(item && item.sessionId ? item.sessionId : '');
          const title = String(item && item.title ? item.title : '');
          if (sessionId === '' || title === '') { failed += 1; results.push({ sessionId, ok: false, error: 'sessionId 或 title 为空' }); continue; }
          try { const r = await controller.rename({ sessionId, title }); success += 1; results.push({ sessionId, ok: true, title: r.title, seq: r.seq }); }
          catch (e) { failed += 1; results.push({ sessionId, ok: false, error: String(e && e.message ? e.message : e) }); }
        }
        return { success, failed, results };
      }
    });
    harness.registerTool(ctx, probe);
    harness.registerTool(ctx, batch);
  }
};
```

> v1.1 2026-09-07 SkillOpt epoch1：held-out 验证均分 74.5 → 91.0 (+16.5)，验证门接受

<!-- 维护纪律：本技能后续迭代遵循 SkillOpt 式维护 SOP（有界编辑/验证门/拒绝缓冲），见 dsh-dev-platform-diagnostics 技能 -->

> 2026-09-07 SkillOpt epoch2：held-out 验证均分 91.0 → 93.5 (+2.5)，接受
