---
name: "observability-and-instrumentation"
title: "可观测性埋点"
description: "给生产代码加日志、指标、链路追踪与告警：先写下值班会问的问题，再按信号类型埋点，并验证遥测本身可用。触发词：可观测性埋点、observability-and-instrumentation、给生产代码加日志、指标、链路追踪与告警：先写下值班会问的问题，再按信号类型埋点，并验证遥测本身可用。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# 可观测性与埋点

## 概述

观察不到的代码就是运维不了的代码。可观测性指的是：借助代码自己发出的遥测数据，从外部回答「系统在做什么、为什么这么做」。埋点不是上线之后才补的东西——它和测试一样，是跟着功能一起写出来的。一个功能没带遥测就上线，第一个用户报来的 bug 就变成了考古，而不是一次查询。

## 何时使用

- 构建任何会在生产环境运行的功能
- 新增服务、端点、后台任务或外部集成
- 一次生产故障排查花了太久（「我们看不出到底发生了什么」）
- 建立或审查告警规则
- 审查一个引入了 I/O、重试、队列或跨服务调用的 PR

**不适用于：**
- 诊断此刻正在发生的故障——用 `debugging-and-error-recovery` 技能（可观测性正是让那个技能下次能变快的东西）
- 对已经量化的慢做性能剖析与优化——用 `performance-optimization` 技能
- 上线当天的监控清单与回滚触发条件——见 `shipping-and-launch` 技能；本技能覆盖的是喂给它们的埋点

## 流程

### 1. 埋点之前先定义「正常」

没有问题牵引的遥测就是噪声。加任何埋点之前，先写下值班工程师会就这个功能问的 2–4 个问题：

```
FEATURE: checkout payment retry
QUESTIONS ON-CALL WILL ASK:
1. What fraction of payments succeed on first attempt vs after retry?
2. When a payment fails permanently, why? (provider error? timeout? validation?)
3. Is the payment provider slower than usual?
→ Every signal below must help answer one of these.
```

如果你说不出这些问题，就还没准备好埋点——你会记下所有东西，却什么也学不到。

### 2. 为每个问题选对信号

| 信号 | 回答什么 | 成本特征 | 示例 |
|---|---|---|---|
| **结构化日志** | 「这一具体个案里发生了什么？」 | 按事件计；随流量增长 | 带 provider 错误码的 `payment_failed` |
| **指标** | 「聚合看，发生多频繁 / 多快？」 | 按时间序列固定；查询便宜 | provider 调用的 p99 延迟 |
| **链路追踪** | 「跨服务看，时间花在哪了？」 | 按请求计；通常采样 | 一次慢结账请求，按跳拆解 |

经验法则：指标告诉你**出了**问题，链路追踪告诉你问题**在哪**，日志告诉你**为什么**。

### 3. 结构化日志

记录的是事件，不是散文。每一行日志都是一个 JSON 对象，带稳定的事件名和机器可读的字段：

```typescript
// BAD: string interpolation — unqueryable, inconsistent
logger.info(`Payment ${id} failed for user ${userId} after ${n} retries`);

// GOOD: stable event name + structured fields
logger.warn({
  event: 'payment_failed',
  paymentId: id,
  provider: 'stripe',
  errorCode: err.code,
  attempt: n,
}, 'payment failed');
```

**日志级别——一致地使用它们：**

| 级别 | 含义 | 值班动作 |
|---|---|---|
| `error` | 不变量被打破；可能需要有人处理 | 调查 |
| `warn` | 已降级但被处理掉了（重试成功、走了兜底） | 观察趋势 |
| `info` | 重要的业务事件（下单、任务完成） | 无 |
| `debug` | 诊断细节 | 生产环境默认关闭 |

**关联 ID 是强制要求。**在系统边界生成（或接收）一个请求 ID，并把它附加到每一行日志、每一个 span 和每一次出站调用上。没有它，你无法从交错的日志里重建出单次请求：

```typescript
// Express: child logger per request, ID propagated downstream
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] ?? crypto.randomUUID();
  req.log = logger.child({ requestId: req.id });
  res.setHeader('x-request-id', req.id);
  next();
});
```

**当多个入口都往同一个日志里写时，把入口点标出来。**关联 ID 标识的是一次运行，它并不说明是哪条代码路径启动了这次运行。同一个任务，被调度器触发、被重放端点触发、被手工跑 CLI 触发，写入同一个 sink 后产生的行是无法区分的，于是要归属某一行就只能靠排除法——交叉翻调度器历史、进程表、部署日志——而这种论证只有在那些外部记录恰好还在时才成立。在运行开始的地方、紧挨着关联 ID 打上入口点，并把两者以同样的方式向下传递：

```typescript
// One helper for every entry point: the run's own logger carries both fields.
// `entryPoint`, not `source` — ECS reserves `source.*` for network fields.
export const runLog = (entryPoint: 'scheduler' | 'replay_endpoint' | 'cli', runId: string) =>
  logger.child({ entryPoint, requestId: runId });

// scheduler tick        -> runLog('scheduler', crypto.randomUUID())
// POST /jobs/:id/replay -> runLog('replay_endpoint', req.id)
// CLI invocation        -> runLog('cli', process.env.RUN_ID ?? crypto.randomUUID())
```

这两个字段必须和关联 ID 跨越同样的边界——队列元数据、HTTP 头——否则 worker 只能重新推导入口点，那就是在猜。一个只是与入口点相关的字段是线索，不是归属：任何能触发这个任务的东西都能把它复现出来。

**绝不记录机密、令牌、口令或完整的 PII。**这是来自 `security-and-hardening` 技能的硬规则——遥测管道是典型的数据泄漏路径。字段用白名单；不要记录整个请求体。

### 4. 指标

对请求驱动的服务，在每个端点和每个外部依赖上埋 **RED**：**R**ate（请求/秒）、**E**rrors（失败率）、**D**uration（延迟直方图，不是平均值）。对资源（队列、连接池、主机），用 **USE**：**U**tilization（利用率）、**S**aturation（饱和度）、**E**rrors（错误）。

与链路追踪一样，厂商中立的做法是 OpenTelemetry 的指标 API（与第 5 步同一套 SDK 和上下文）。下面的例子用的是 Prometheus 的 `prom-client`——一个常见的后端选择，但不是唯一选择；RED/USE 与基数规则两者完全一样。

```typescript
import { Histogram } from 'prom-client';

const httpDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status_class'],  // '2xx', not '200'
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});
```

**基数就是失效模式。**每一个唯一的标签组合都是一条独立的时间序列。标签必须来自小而固定的集合（路由模板、状态类、provider 名）。绝不把用户 ID、原始 URL、错误消息或其他无界值用作标签——那些属于日志和链路追踪。

```
OK as label:    route="/api/tasks/:id"   status_class="5xx"   provider="stripe"
NEVER a label:  user_id, email, request_id, full URL, error message text
```

平均值永远不要跟踪，百分位数永远要：平均值会掩盖那 1% 体验极差的用户。用直方图，读 p50/p95/p99。

### 5. 分布式链路追踪

用 OpenTelemetry——它是厂商中立的标准，自动埋点能以近乎零代码的成本覆盖 HTTP、gRPC 和常见数据库客户端：

```typescript
// tracing.ts — must be imported before anything else
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  serviceName: 'checkout-service',
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

只在有意义的内部工作单元（例如 `applyDiscounts`、`chargeProvider`）周围手工加 span，并附上值班时会用来过滤的属性。跨每一个异步边界传递上下文——HTTP 头、队列消息元数据——否则链路会在断点处死掉。默认做低比例的头部采样；如果你的后端支持尾部采样，就把错误 100% 留下。

### 6. 告警

对**用户能感受到的症状**告警，不要对原因告警：

```
SYMPTOM (page-worthy):           CAUSE (dashboard, not a page):
error rate > 1% for 5 min        CPU at 85%
p99 latency > 2s                 one pod restarted
queue age > 10 min               disk at 70%
```

基于原因的告警在什么都没坏的时候乱响，又会漏掉你没预料到的故障。基于症状的告警恰好在用户受损时触发，不管原因是什么。

对每一条你要建的告警都适用这些规则：

1. **它必须是可行动的。**如果响应动作是「忽略它，它自己会好」，就删掉这条告警。
2. **它链到一份 runbook**——哪怕只有三行：它意味着什么、第一条要跑的查询、升级路径。
3. **它的阈值与持续时间**要有 SLO 或历史数据作为依据，不是靠猜。
4. 只用两个严重级别：**page**（面向用户，立刻处理）和 **ticket**（服务降级，本周内处理）。第三级会变成噪声，把人训练成什么都忽略。

#### 撰写 Runbook

上面的规则 2 要求每条告警都链到一份 runbook。runbook 的职责是让读者不用动脑就能得到三个问题的答案：正在发生什么、先查什么、如果那没解决该找谁。存放在 `docs/runbooks/` 下，文件名与告警同名。

**最小可用 runbook（三行）：**

```markdown
# Runbook: High Error Rate on /api/tasks
**Means:** DB connection pool likely exhausted, or a bad deploy.
**First check:** `SELECT count(*) FROM pg_stat_activity WHERE backend_type = 'client backend';`
  — if count > pool limit, see Step 2. (Swap in the equivalent for your database.)
**Escalate to:** #db-oncall or engineering on-call rotation.
```

**什么时候要超出三行：**只有当仅凭第一条检查不足以做判断时才加步骤。一份覆盖三种最常见原因的五步 runbook，好过一份覆盖所有边界情况却只被草草扫过的二十步文档。

**让 runbook 保持最新。**每次用它处置完事故，就顺手更新这份 runbook——过期的 runbook 会培养出虚假的信心。如果某一步是错的或缺失的，在把事故标记为已解决之前先把它改对。

### 7. 验证遥测本身

埋点也是代码，也会出错。在宣布工作完成之前，触发那些路径并看真实的输出：

- 在 staging 强制制造一个错误 → 用 `requestId` 在日志里找到它，确认字段是结构化的（不是 `[object Object]`）
- 发测试流量 → 确认指标序列带着预期的标签和合理的值出现
- 在链路追踪 UI 里跟着一个请求跨服务走完 → 没有断掉的 span
- 把每条新告警各触发一次（临时调低阈值）→ 确认它到达正确的渠道，且 runbook 链接可用

## 常见的自我合理化

| 自我合理化 | 现实 |
|---|---|
| 「等它能跑了再加日志」 | 「等」会变成「等第一次事故之后」，而那正是你发现自己瞎了的最贵时刻。边建边埋。 |
| 「日志越多，可观测性越好」 | 非结构化的噪声让事故处理更慢，不是更快。三个可查询的事件胜过三百行散文。 |
| 「现在用 console.log 就够了」 | 非结构化输出无法过滤、无法关联、无法告警。结构化日志器一次性多花五分钟。 |
| 「出事的时候看板子就行了」 | 没有定义问题就搭出来的看板，什么都能给你看，就是给不出答案。从值班问题出发。 |
| 「先把重要的都告警上，回头再调」 | 吵个不停的传呼机会把人训练成无视它。调整永远没发生；漏掉的真实告警却发生了。 |
| 「把用户 ID 当指标标签，调试更方便」 | 它也会让你的指标后端垮掉。高基数的查询属于日志和链路追踪。 |
| 「我们就两个服务，上链路追踪太重了」 | 只要有两个服务，就已经存在日志回答不了的跨服务延迟问题。自动埋点让这件事的成本微不足道。 |

## 危险信号

- 一个带了重试、队列或外部调用，却没有任何新遥测的功能 PR
- 用字符串插值拼出来的日志行，而不是结构化字段
- 没有关联/请求 ID——每一行日志都是孤儿
- 同一个日志流被调度器、webhook 和手工运行一起写入，却没有字段说明这一行是谁产生的
- 指标标签里出现用户 ID、原始 URL 或错误消息文本（基数炸弹）
- 延迟只跟踪平均值，没有百分位数
- 每天触发、被确认却没有任何动作的告警
- 对原因（CPU、内存）告警并呼叫真人，而面向用户的错误率无人监控
- 日志里出现机密、令牌或完整请求体
- 把「在我机器上是好的」当作生产功能健康的唯一证据

## 验证

给功能埋完点之后，确认：

- [ ] 这个功能的值班问题已经写下来，且每个信号都对应其中一个
- [ ] 所有日志输出都是结构化的（JSON），有稳定的事件名，每行都带关联 ID
- [ ] 每个被不止一个入口写入的日志 sink 都带入口点字段，在运行开始处设置、随关联 ID 一起传递，而不是在下游靠推断得出
- [ ] 任何一行日志里都没有机密、令牌或未脱敏的 PII（抽查真实输出）
- [ ] 每个新端点和每个外部依赖都有 RED 指标，且标签集合有界
- [ ] 延迟是直方图；p95/p99 可查询
- [ ] 单个请求能在链路追踪 UI 里端到端走完，没有断掉的 span
- [ ] 每条新告警都基于症状、带 runbook 链接，且被测试触发过一次
- [ ] 在 staging 人为制造的故障仅凭遥测就被定位到，没有读源码

想看这份清单的速览版，包括上线前的埋点门禁，见 `../../references/observability-checklist.md`。
