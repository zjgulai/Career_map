---
title: FLOW-02 × SCN-002 只读试点章程
doc_type: workflow
module: handoff
topic: flow02-pilot
status: review
created: 2026-11-04
updated: 2026-11-04
owner: self
source: human+ai
---

# FLOW-02 × SCN-002 只读试点章程

**当前状态：不可运行。** 生效前置 0/7。本文件定义「什么条件下可以开始跑」，不是「已经跑起来了」。

---

## 1. 试点目标

在只读约束下，用 FLOW-02 新品机会洞察 × SCN-002，验证一条完整的经营分析链能不能从信号走到关闭。

**验证的不是「专家能不能聊」，是这四件事能不能成立**：

1. 证据能不能追溯（每条结论挂得到来源）
2. 判断能不能被独立复核（复核者与生产者分离）
3. 阶段产物能不能被下一阶段正式接收
4. 事项能不能干净关闭（含未解项与遗留责任）

---

## 2. 范围

| 维度 | 授权范围 |
| --- | --- |
| Flow | FLOW-02 新品机会洞察（`SELECTOR-FLOW-02-01`） |
| Scenario | SCN-002，**人工固定** |
| 业务阶段 | **P1 证据入池 + P2 机会命题** |
| 数据 | 离线证据包 |
| 动作面 | 只读 |
| 期限 | 至 Go/No-Go 出具结论 |

### 2.1 明确不在范围内

| 排除项 | 原因 |
| --- | --- |
| P3 样品与准入 | 需要外部实测 |
| P4 最小商业验证 | 需要市场回执 |
| P5 组合决策 | 依赖 P3/P4 证据 |
| 24 个 E2E 执行模块（SEO / 六视图 / 视频制作） | 只读下不可达，不属 FLOW-02 |
| 有限放量 | 禁止 |
| 任何外部业务动作 | 禁止 |
| 市场回执 / 订单回执 | 禁止获取 |

---

## 3. 参与席位

| 席位 | 运行方式 | 在试点中的职责 |
| --- | --- | --- |
| **AGT-008 拓新** | T2 独立 session（**Lead**） | STG-02 / 04 / 05 / 07 / 08；对事项结果负责 |
| **AGT-005 守衡** | T2 独立 session（**独立复核**） | STG-06；复核证据质量，不碰专业合规结论 |
| AGT-001 衡远 | T3 profile 注入 Lead 上下文 | STG-02 资源约束 / STG-05 取舍输入 |
| AGT-045 同尺 | T0 校验器 + T3 口径 profile | STG-02 / 04 指标契约与口径冲突 |

**实际并发 = 2 个 session。** AGT-001 与 AGT-045 不占 session。

### 3.1 pilot-only role_scope 扩展（C-382）

AGT-005 与 AGT-045 **不在** FLOW-02 的 26 人 role_scope 内。本试点授权以下绑定，**仅限本次**：

| 席位 | 绑定到 | 说明 |
| --- | --- | --- |
| AGT-005 | STG-06 assurance | 只复核决策质量（可证伪性、来源版本、冲突、独立性、资源假设、未验证项） |
| AGT-045 | STG-02 / STG-04 | 只做指标契约、对象关系、口径冲突 |

约束：不改全局 role_scope；不新增席位；pilot 结束即失效；记录 operator / reason / timestamp。

---

## 4. 八阶段合同

| Stage | 生产者 | 产物 | 验收 | 失败处置 |
| --- | --- | --- | --- | --- |
| **STG-01 信号接收** | Case Control（T0） | 信号信封 | 字段齐全、hash 可重算、去重键可关联 | 重复 → 关联已有事项 |
| **STG-02 范围与章程** | AGT-008（+ AGT-001 资源约束） | 事项章程 | 恰好一个 flow + 一个 scenario；完成条件只依赖既有证据 | 出现「有限放量」→ 拒绝 |
| **STG-03 上下文装配** | Case Control + AGT-048 | 上下文清单 | 恰好一个主责角色；版本 hash 匹配；只读策略覆盖全部数据源 | 缺策略 → WAIT / FREEZE |
| **STG-04 证据与诊断** | AGT-008 汇总（AGT-006/007 以 T3 注入） | 证据包 + 诊断记录 | 每条 claim 有来源/版本/hash/时效；**派生源不计独立源**；缺失 = UNKNOWN 不是 0；**证据区无创意资产** | 无来源 → RETURN |
| **STG-05 决策包** | AGT-008（+ AGT-009/001/035 T3） | 决策包 | 目标人群 / 未满足任务 / 差异化；可证伪假设；停止条件；候选与已执行分开 | 把创意当事实 → RETURN |
| **STG-06 独立复核** | Assurance Gate（T0）+ **AGT-005 独立 session** | 复核决定 | 确定性检查全过；**发起人不得覆盖拒绝** | 硬失败 → RETURN / WAIT / FREEZE |
| **STG-07 只读无动作** | AGT-008 记录 + Policy Gate 判定 | **无动作记录** | 无 ActionIntent / PolicyDecision / ExecutionAttempt；无凭据；无外部请求 | 出现动作意图 → FROZEN |
| **STG-08 关闭** | AGT-008（+ AGT-001 组合边界） | 关闭记录 | 完成条件可求值；每条 claim 可追溯；未解项有 owner | 证据不足 → PARTIAL，**不得 SUCCESS** |

### 4.1 闭环枚举（必须统一）

```
decision ∈ {CONTINUE, TURN, STOP, PARTIAL}
action_disposition ∈ {NO_ACTION, ACTION_REQUIRES_AUTHORIZATION}
```

`NO_ACTION` 是字段，不是 outcome。三处必须一致：完成规则、关闭 schema、验收测试。

---

## 5. 只读边界（C-386）

### 5.1 四层强制

| 层 | 内容 |
| --- | --- |
| **工具面** | 只注册 `evidence_read` / `deterministic_validate` / `presentation` / `artifact_emit` |
| **数据面** | 服务端 allowlist：来源 / 字段 / 时间窗 / 行数；默认拒绝；字段最小化；凭据不可见 |
| **审计** | append-only：事项 / 席位 / 工具 / 范围 / 查询哈希 / 字段 / 用途 / 决定 |
| **校验** | CI 拒绝 write / 越界 / 意外字段 / PII / 超时 / 无审计 / 跨事项 / 外部网络 |

### 5.2 禁止清单

```
action_intent_request   receipt_query          write
shell                   web                    jobs
workflow                delegation             dispatch_to_squad
```

### 5.3 唯一写入面

事项工作区：`case artifact store` + `append-only ledger`。**不是业务系统。**

---

## 6. 生效前置：0/7

**七项全绿才能开始跑。任何一项未完成，试点不生效。**

| # | 前置 | 判据 | 当前 |
| --- | --- | --- | --- |
| 1 | 席位注册表 53 行 | `runtime_layer` 字段非空；46 席显式 `unassigned` | ❌ 字段缺失 |
| 2 | 只读覆盖层 | **50/50 AGT preset 的 `can_emit_action_intent=false`** | ⚠️ 文件已写，preset_id 格式需改 |
| 3 | 离线证据包 | 1 个品类的最小两源样本；每项含来源/版本/hash/时效/分类/owner | ❌ 无 dataset path |
| 4 | 具名人类 owner | MGT 三岗 + AGT-005/008 验收 + 数据 owner；含替补 | ❌ 全 null |
| 5 | 只读策略 | 数据集 allowlist / 字段 allowlist / 时限 / 行数 / 审计字段 | ✅ 已写 |
| 6 | DSH 版本冻结 | 三个 hash 写入 pin 文件 | ❌ 未冻结 |
| 7 | 风险中断通道 | 安全/质量/账号的严重度分级、具名 on-call、SLA | ❌ 未建 |

**第 2 项是硬前置**：当前 50 份 preset 全部 `can_emit_action_intent=true`、`action_intent_request` 可见。不加覆盖层直接跑，只读边界当场失效。

---

## 7. 成功与停止条件

### 7.1 成功判据

| 项 | 判据 |
| --- | --- |
| 阶段完整 | 8/8 产物存在且 ACCEPT |
| 证据可追 | 100% claim 标 E/J/C；100% 数字 claim 有来源 |
| 独立复核 | AGT-005 给过至少一次非 ACCEPT 的结论，且发起人未覆盖 |
| 只读成立 | 0 次动作意图、0 次外部调用、0 次凭据请求 |
| 可重放 | 3 次同证据重放得出同一决策 |
| 干净关闭 | 未解项有 owner；证据不足时判 PARTIAL 而非 SUCCESS |

### 7.2 立即停止条件

任一发生，停止试点，不用等待复核：

- 任一越界读被放行
- 任一凭据进入仓库 / 日志 / 报告 / 提示词 / 产物
- 任一访问无审计事件
- 出现 write / 外部网络 / shell / delegation 调用
- `action_intent_request` 或 `receipt_query` 可见或可调
- 结论出现「端到端已验证」「53 席已上岗」类表述

### 7.3 停止后处置

1. 停试点，冻结事项
2. 轮换受影响凭据
3. 缩小读取范围
4. 保留账本与失败记录，**不改写**
5. 出具说明：触发项、影响范围、恢复条件

---

## 8. 已知缺口（写清楚，不掩盖）

| 缺口 | 影响 |
| --- | --- |
| 8 阶段模板的 schema 引用未填 | 阶段验收无法机械化 |
| 4 席技能白名单与 bundle 不一致 | AGT-005 在 bundle 里 0/4 |
| `~/.dsh/skills` 不存在 | 技能装不上，调用失败 |
| preset 声明行发射器不存在 | 专家挂不到会话 |
| 会话创建不传 `agentPreset` | 选了专家也还是普通会话 |
| 模型工具层仍有 bash / fs / web | 只读只是提示词 |

**最后一条最危险。** 前五项是「跑不起来」，第六项是「跑起来但不安全」。

---

## 9. 一句话

**这个试点的价值不在「跑通」，而在「跑不通的时候知道卡在哪」。** 七项前置每一项都对应一个真实缺口，补一项就少一个黑箱。
