---
name: credits-inspector
description: Show the current Qoder session's token & credits consumption as a visual Canvas report — billed input total, live context usage, resend amplification, and per-category / per-tool / per-file (path-level) breakdown. Use when the user asks how many tokens/credits this session used, what is eating the context, which files or tools cost the most, or wants to refresh or open the session token report. 用户询问本次会话的 token 消耗、credits 花费、成本占比、上下文被什么占满、哪些文件/工具最耗 token，或想刷新/打开会话 token 报告时使用。
description_zh: 图形化展示当前会话的 token 与 credits 消耗——计费输入总量、实时上下文占用、重发放大，以及按类别 / 工具 / 文件（精确到路径）的占比。以 Canvas 报告呈现，随 Agent 每次结束自动刷新。
user-invocable: true
---

# Ocean's Credits Inspector

把「当前会话烧了多少 token / credits、都花在哪」变成一张可读的 Canvas 报告。

- **计费输入总量**：`Σ context_usage_ratio × contextWindow`——这是平台计费口径的**真值**，不是估算。
- **实时上下文 / 峰值占用**：当前窗口里净存活多少 token、峰值到过多少（峰值自最近一次压缩起算，跨压缩的历史高点在 `context.peakSession*`）。
- **重发放大**：计费输入 ÷ 净上下文，反映同一批内容被反复重发的倍数。
- **按类别 / 按工具 / 按文件占比**：把总量按比例分摊到系统提示词、工具返回、模型思考/回复、用户输入、压缩摘要等类别，并下钻到**具体文件路径**与工具（文件级为比例估算，总量受恒等式 A1 约束）。
- **子代理账**：`Agent` 派发的子代理，其每次往返只写进各自的独立转录（`<sessionId>\subagents\agent-*.jsonl`），**不计入主链任何数字**。报告单独汇总每个子代理的往返 / 计费输入 / 峰值占比 / Credits，并给出 `combined`（主链 + 子代理）——官方 UI 的一场会话扣费对齐的是这个合计，不是主链。无子代理时该段不渲染；未汇总时报告头部给出告警并列出探测过的候选目录（`subagents.reason` / `subagents.probedPaths`）。
- **数据可用性标注**：报告逐项标注每个数字是 `measured`（客户端上报真值）/ `derived`（由真值推导）/ `fallback`（读不到用了回退默认值）/ `manual`（从官方 UI 手工回填）/ `unavailable`（本地数据源里根本没有）。**不可用的量一律显示「—」而不是 0** —— IDE 端的 0 是「读不到」，不是「没花钱」。
- **官方 UI 真值回填**：`.qoder-credits/overrides/<sessionId>.json` 里填官方 UI 看到的数字，重跑后报告会并列展示并与本地推导值对账（详见下文「两类客户端」）。

报告随每次 Agent 结束（Stop 钩子）自动刷新，无需手动触发。

## 报告产物位置

生成在**当前项目根**下的 `.qoder-credits/`：

| 文件 | 用途 |
|------|------|
| `.qoder-credits/<会话标题>__<会话id前8位>.canvas.tsx` | **该会话**的 Canvas 可视化报告（每会话一个、互不覆盖；在 Canvas 预览面板打开）。确切文件名见 `report.json` 的 `artifacts.canvas` |
| `.qoder-credits/report.json` | **最近刷新（当前）会话**的结构化数据（供读取/摘要/二次分析） |
| `.qoder-credits/overrides/<sessionId>.json` | 可选。**官方 UI 真值回填**文件，需自己创建；存在即被读取，见下文「两类客户端」 |

## 两类客户端：报告数字有没有取决于转录来自哪一端

本机同时存在两个会写转录的客户端，两者的转录富贫差很多（`report.source` 标明）：

| `source` | 客户端 | 转录位置 | `message.usage` |
|------|------|------|------|
| `desktop-rich` | QoderCN 桌面端 | `~\.qoder-cn\projects\<slug>\<id>.jsonl` | **有**（`credits` / `original_credits` / `context_usage_ratio` 为真值；`input_tokens` / `output_tokens` 恒为 0，故不使用） |
| `ide-lite` | IDE 插件端 | `~\.qoder-cn\projects\<slug>\transcript\<id>.jsonl` | **整个字段不存在**，也不落到本地任何其它位置 |

在 **IDE 里开会话，报告里的 Credits / token / 各类占比必然全是「—」**，这不是插件故障，本地无法恢复。此时仍为真值的只有不依赖 usage 的计数：`byTool[].calls`、`byFile[].reads`、`session.turns`（报告会单独成段展示）。

唯一补真值的通道是把官方 UI 看到的数字填进 `.qoder-credits/overrides/<sessionId>.json`（两个客户端都可用，桌面端也可用它对账）：

```json
{
  "credits": 19.43,
  "originalCredits": 50.51,
  "model": "Qwen3.8-Flash",
  "durationMin": 28,
  "startedAt": "2026-09-11T00:30:00+08:00",
  "note": "含子代理合计"
}
```

全部字段可选；存在即生效，重跑报告后出现「官方 UI 真值」一段。**手工数字绝不覆盖 `report.totals`**（否则下次重算就对不上账），只并列展示并给出 `localCoverage`（本地值 ÷ 官方真值）。对账口径：有子代理时拿 `combined`（主链 + 子代理）比，否则拿主链比——官方 UI 的一场会话扣费含子代理，用主链比会系统性低估（实测 ca2f7834：主链 0.46、combined 0.89）。

## 自定义模型（BYOK）：用「usage 记录代理」补实测 token

`source === "desktop-rich"` 但 `usageSource === null` = 会话走用户自配的 OpenAI 兼容端点（如千问 tokenplan）。自定义模型不经 Qoder 计费网关，转录里没有可信 usage（无键，或字段齐全却全为 0 的「壳 usage」；插件以 `context_usage_ratio > 0` 为真值判据）。补救是插件自带的本地透明代理 `scripts/proxy.mjs`：把提供商响应的 usage 记到 `~\.qoder-credits-proxy\usage.jsonl`，报告按 `message.id` 精确 join，token 恢复为提供商实测真值；credits 仍无本地真值，显示「—」。

**防呆铁律：别让用户装 Node 或敲命令，也别凭记忆给用户背配置步骤——直接代跑下面的 CLI，把它打印的引导原样转达。**

`<plugin_root>` 不用猜：本文件位于 `<plugin_root>/skills/credits-inspector/SKILL.md`，把你刚读到的这个路径砍掉结尾 `skills/credits-inspector/SKILL.md` 就是插件根目录。一律经插件自带启动器调用（它自己会找 Qoder 内置 JS 运行时，**不要求 PATH 上有 node**）：

```bash
CI="<plugin_root>/bin/credits-inspector.cmd"        # 已在 bash 里，直接代跑，别让用户动手
"$CI" cli --check-proxy                             # 自检链路；没数据时打印完整排查清单
"$CI" cli --request-log --tail 40                   # 每笔请求成败/耗时 + 代理·供应商·客户端归因
"$CI" cli --setup-proxy --upstream <供应商根地址>     # 自动挑端口、拉起、打印可粘贴的 Base URL
"$CI" cli --stop-proxy                              # 改回官方模型时停用
```

拿不准入口就先跑 `--check-proxy`：它输出的每条「下一步」都是带绝对路径的整命令，照抄执行即可。非 Windows 或本机确有 node 时，`node "<plugin_root>/scripts/cli.mjs" <同样的 flag>` 完全等价。

`--check-proxy` 的输出已含「为什么没数据 + 下一步怎么改」的全部步骤（Base URL 只换 host:port 成 `http://127.0.0.1:<port>`、原有路径段保留、改完要完全重启 Qoder、确认新会话真选中该模型、发一句话后看 records 是否 >0），照念即可，不要自己另编。用户报「对话/上下文压缩没反应」时跑 `--request-log`，按它打印的归因结论转达，别自己猜是谁的锅。用户坚持不跑命令时的手动通道一句话带过：编辑 `~\.qoder-credits-proxy\config.json` 把 `upstream` 填成「Base URL 去掉结尾 `/v1`」、`enabled` 置 `false` 即停用；首次开会话钩子会自动生成带中文说明的模板。

信任口径（被问到时如实说明）：代理只在本机 127.0.0.1 监听、逐字节透传，仅注入 `stream_options.include_usage`，且只吞掉因这次注入而多出来的末尾 usage chunk（客户端自己索取的一律原样下发）；API key 过路不落日志，请求诊断只存元数据不含任何请求/响应内容；源码在插件目录内可审计。

## 被激活时的工作流

1. **读数据**：用 Read 打开 `<project_root>/.qoder-credits/report.json`（路径分隔符按宿主 OS）。
   - 存在 → 直接取 `totals` / `context` / `byCategory` / `byTool` / `byFile` 给用户做**文字速览**（计费输入总量、上下文占用、放大倍数、Top 文件/工具）。
   - 不存在 → 转第 3 步手动生成。

2. **引导看图**：从 `report.json` 的 `artifacts.canvas` 取当前会话对应的文件名，告诉用户在 **Canvas 预览面板**打开 `<project_root>/.qoder-credits/<artifacts.canvas>`（饼图 / 条形图 / 文件榜 / 逐请求明细）。每个会话一个 `.canvas.tsx`，文件名含会话标题、对应前端会话列表，互不覆盖。

3. **手动刷新（兜底）**：Stop 钩子已自动刷新；若需强制重算，运行插件自带 CLI（`node` 或 Qoder CN 运行时均可）：

   ```bash
   "$CI" cli --latest            # 自动选最近修改的会话转录
   "$CI" cli --transcript <path> # 指定某个 .jsonl 转录
   "$CI" cli --session <id>      # 按会话 id 定位
   "$CI" cli --latest --overrides <dir>  # 指定 overrides 目录（默认用输出目录）
   ```

   `$CI` 见上文 BYOK 一节；`node "<plugin_root>/scripts/cli.mjs" <flag>` 等价。生成后回到第 1 步。

## 度量口径（务必如实转述，勿夸大精度）

- **前提**：以下全部仅在报告有 usage 时成立（`usageSource` 为 `proxy` / `transcript-tokens` / `transcript-ratio` / `mixed`；`transcript` 为 v3 旧报告兼容值）。三档含义：`proxy`=代理实测 promptTokens，`transcript-tokens`=转录 usage.input_tokens 真值，`transcript-ratio`=转录 ratio×window 推导；`linkHealth.breakdown`（`{proxy, transcriptTokens, transcriptRatio}`）给出各源笔数。`usageSource === null`（`ide-lite` 转录，或 BYOK 且未配代理）时 Credits 与 token 一律不可用，**不得把「—」或 0 转述成「没花钱」**；先看 `report.availability` 再开口。代理路径（`usageSource === "proxy"`）的 token 是提供商实测 `prompt_tokens`（标 `measured`），但 **credits 恒为「—」**（自定义模型不经 Qoder 计费）。
- **计费输入总量 / 上下文占用 / 放大倍数**：来自平台真值字段（`context_usage_ratio`）或供应商实测 `prompt_tokens`。但计费输入总量 = `context_usage_ratio × contextWindow`，`contextWindow` 来源看 `context.contextWindowSource`，优先级：`manual`（ManualTruth 锁定）> runtime-config > `derived-from-usage`（BYOK 下用同一笔的 input_tokens ÷ ratio 反推真实窗口，无需手工录入）> `fallback`（都拿不到时静默回退 200000，报告里带 ≈ 且头部常驻告警）。回退时以窗口为分母的占比会偏大，但绝对 token 数以逐笔锁定的 S 真值为底、不受影响。逐笔真值优先级：代理 promptTokens > 转录 usage.input_tokens > ratio × window。
- **Credits 的覆盖范围（最容易转述错的一项）**：`creditsCoverage.full === false` 时，Credits 只来自 `trips`/`roundTrips` 笔往返（占计费输入 `tokenShare`）。**绝不要拿 Credits 除以计费输入总量报「单价」**，也不要说「这次只花了 X」——混合链路里其余往返走自定义模型、不经 Qoder 计费，不是没花钱。转述时必须带上覆盖范围。
- **缓存命中 / 输出 token**：`totals.cachedTokens`、`totals.outputTokens` 仅代理路径有真值（`availability.cachedTokens === "measured"` 才可用），转录侧恒 0。缓存命中部分供应商单价更低，故**按 token 数的节省大于按计费的节省**，不要把它换算成钱。
- **该不该压上下文**：直接念 `context.peakAdvice.text`（阈值已按实测账算好：盈亏线 39%、性价比区间 65–85%、过 85% 尽快压、超 100% 已触顶），别自己现场推算。判断依据是**峰值**占比（自最近一次压缩起算，压完即回落；跨压缩的历史高点是 `peakSessionRatio`，别拿它当「现在该不该压」的依据），不是净上下文（净值是估算）。**双阈值（2.6.8）**：`peakAdvice` 对模型窗口，`peakUserAdvice`（配 `peakUserRatio` / `userContextLimit`，默认 200K、ManualTruth 可覆盖）对 Qoder 自动压缩阈值。BYOK 下模型窗口可能 1M、用户阈值 200K，两者能差一个量级，**两个结论都要转述**；`peakAdvice` 为 low/mid 而 `peakUserAdvice` 为 high/over 时，额外提醒“模型窗口未满但快自动压缩了”。
- **压缩单笔成本**：`compactionCost.items`，每笔看 `proxy` 是否为 null 决定口径（非 null = 供应商实测，null = 客户端自估），**两种口径不要混着说**；合计 `totals` 已按生效口径算好。
- **代理链路是否正常**：先读 `linkHealth`（覆盖率、最近记录时间、最近若干笔的三方归因计数、有无被推翻的陈旧失败记录），它已足够回答「代理正常吗」，不必每次代跑 CLI；只有用户要逐笔明细时才跑 `--request-log`。**注意那些失败计数只对走代理的会话有意义**：`usageSource === "transcript"` 时代理不在链路上，报告只给覆盖率与最近记录时间，别拿全局计数去排这个会话的障。
- **按类别、按工具、按文件的拆分**：以每块文本的估算 token 为权重、按比例分摊真值总量。因此**总量精确、内部占比为估算**；系统性偏差在归一化时抵消，恒等式 A1（`Σ 分摊 == 计费输入总量`）严格成立。一次带 usage 的往返都没有时 `identity.ok === null`（**不适用**，不是「校验通过」）。
- **工具调用次数、文件读取次数、对话轮数**：直接数 `tool_use` 块与 `user` entry 得来，**不依赖 usage**，两类客户端都是真值。
- 回答「哪个文件/工具最烧 token」时，**总量与「单次」要一起给**：`byTool[].perCall`、`byFile[].perRead`。只给总量会漏掉「只调了几次却每次极贵」的那一类（实测 Read 29 次吃 335 万 token，单次是同榜 Edit 的 2.6 倍）。文件级另有 `trips`（被重发的程数）与 `reads`（返回次数）。

## 护栏

- 报告为只读分析产物；本技能不修改用户代码。
- 不要把 `report.json` 里可能出现的敏感内容（如工具返回中的密钥）主动外泄或粘贴到无关处。
- Canvas 的每个会话 `.canvas.tsx` 依赖宿主的 `qoder/canvas` SDK 做类型检查；若预览面板报类型错误，以面板提示为准。
