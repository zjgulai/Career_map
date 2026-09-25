---
name: bos-method
description: BOS 六词证据语言(implemented/verified/anchored/callable/blocked/planned)与证据边界判定。在 BOS 融合开发、DSH 工具/证据编写、审计或验收语境中,判断能力状态、撰写证据或评审交付物时加载。核心约束:禁止从 Manifest、Registry、mock、静态契约或 UI 入口推断生产就绪。
---

# BOS 方法论:六词证据语言与证据边界

本技能把 BOS 的证据语言(Loop Engineering 契约的核心词汇表)固化为 agent 可执行的行为约束。
它不承诺任何具体能力已就绪——**证据边界之外的任何"就绪"断言都是推断,必须被拒绝**。

## 六词证据语言(唯一允许的状态词)

1. **implemented(已实现)** — 存在实现载体(代码、产物、脚本),且该载体是真实运行的路径,不是占位符或注释。
2. **verified(已验证)** — 存在可复现的机器证据(测试报告、E2E 结果、校验和、可重放的执行日志)证明行为符合契约。
3. **anchored(已锚定)** — 证据绑定到不可变基线(commit 哈希、制品 sha256、Receipt 哈希链),可追溯到具体版本,重跑可复现。
4. **callable(可调用)** — 内容/能力已发布且被授权调用链真实可通(如 Published 知识、verified-only 的 55 场景),调用会命中真实数据而非 mock。
5. **blocked(受阻)** — 存在明确的阻断条件(门禁未过、数据缺失、依赖未接线),并附机器可路由的阻断码。
6. **planned(已规划)** — 只有计划/文档/契约定义,尚无实现或证据。

## 禁止事项(硬约束)

- **禁止从 Manifest / Registry / mock / 静态契约 / UI 入口推断生产就绪。** 例如:Registry 中 55 条场景记录、`productionPromotionAllowed` 字段、mock 返回、前端可点击入口,都不构成 verified 或 callable 的证据。
- **禁止把"文档写了"当作 implemented。** 计划、PRD、契约草案一律是 planned。
- **禁止把"测试通过"升级为 anchored,除非证据绑定不可变基线**(commit/制品哈希)且可重放。
- **禁止在证据缺失时使用模糊词掩盖状态**(如"应该可以""基本就绪");只能使用六词之一,并给出证据路径或阻断码。
- **禁止以 0 计数之外的任何方式把 `blocked` 状态描述为风险之外的"推进中"**;blocked 必须携带阻断条件。

## 证据边界判定流程

对任何"X 是否就绪"的问题,按序回答:

1. X 是否有实现载体且为真实运行路径?否 → **planned**(无实现)或 **blocked**(实现存在但被阻断)。
2. 是否有可复现的机器证据?否 → **implemented**(若实现存在,但未验证)。
3. 证据是否锚定到不可变基线(commit/sha256/Receipt)?否 → **verified** 但**未 anchored**(如 `passed_machine_report_unanchored`)。
4. 是否已发布且调用链真实可通(非 mock)?否 → 只能到 **verified**,不能到 **callable**。
5. 全部通过 → **callable**;任一环节存在明确阻断 → **blocked**,并列出阻断码。

## 与 DSH 融合语境的应用

- `bos_knowledge_status` / `bos_scenario_lookup` / `bos_knowledge_search` 返回的计数与门禁标志是 **artifact 事实**,不是就绪声明;`data_ready=0/55`、`productionPassCount=0/55`、`candidateAvailable=0`、`publishedAvailable=0`、`callable=0` 时,任何"可以上线/可以调用知识"的结论都是推断,必须标为 blocked/planned。
- BOS 六词与 DSH 的 fail-closed 语义一致:数据缺失时工具必须返回明确的不可用状态,不得回退到 mock 或猜测值。
- 本技能自身是方法论资产(planned→implemented 随 BOS 方法论文档持续演进),它的存在不代表任何 BOS 生产能力已就绪。

## 资源

方法论文档源(`resourceBase` 目录):
- `/Users/ll/Documents/VOA/research/dsh-harness-fusion/` 下的融合方案与实施报告
- BOS Loop Engineering 文档与 `backend/data/knowledge-intake-self-proof.p0-p1.v1.json`(证据边界基准)

按需加载,仅作引用,不改变上述证据语言约束。
