---
title: 四席试点技能需求矩阵
doc_type: analysis
module: handoff
topic: pilot-skill-matrix
status: review
created: 2026-11-04
updated: 2026-11-04
owner: self
source: human+ai
---

# 四席试点技能需求矩阵

对应 FLOW-02 × SCN-002 试点的四个席位：**AGT-001 衡远 / AGT-008 拓新 / AGT-005 守衡 / AGT-045 同尺**。

---

## 1. 四席技能总表

数据源：`role-catalog.json` 的 `skills` 字段 × `skill-map.json`。

| 席位 | 业务技能（L3） | kind | supply 数 | supply 明细 |
| --- | --- | --- | --- | --- |
| **AGT-001 衡远** | 经营目标拆解 | direct | 2 | `ecommerce-quarterly-strategy`, `p2s-business-scale-kpi-growth-achievement` |
| | 资源情景比较 | direct | 2 | `market-scenario-modeler`, `p2s-sc-whatif-scenario-analysis-engine` |
| | 月度经营复盘 | direct | 2 | `ecommerce-monthly-review`, `p2s-agentic-pnl-analyst` |
| **AGT-008 拓新** | 组合取舍 | direct | 2 | `product-attribute-analyzer`, `p2s-contextual-bandits-rec` |
| | 实验组合 | direct | 2 | `ab-test-setup`, `p2s-llm-experiment-hypothesis` |
| | 阶段投资建议 | direct | 2 | `product-launch-planner`, `p2s-real-options-product-launch-timing` |
| **AGT-005 守衡** | 抽样审计 | direct | 2 | `p2s-compliance-ml-risk-scoring`, `p2s-tag-fairness-bias-audit` |
| | 证据复核 | direct | 2 | `p2s-explainable-review-adjudication`, `p2s-decision-audit-trail-ontology` |
| | **利益冲突检查** | **gap** | **0** | **∅** |
| **AGT-045 同尺** | 指标契约 | partial | 2 | `ecommerce-business-insights`, `p2s-pvm-attribution-window-harmonization` |
| | 账号商品映射 | direct | 2 | `multichannel-inventory-sync`, `p2s-entity-resolution-kg-dedup` |
| | 主数据治理 | direct | 2 | `terminology-standardizer`, `p2s-cross-platform-user-identity` |

**唯一 supply 并集：22 个。**

```
ab-test-setup                 ecommerce-business-insights      ecommerce-monthly-review
ecommerce-quarterly-strategy  market-scenario-modeler          multichannel-inventory-sync
p2s-agentic-pnl-analyst       p2s-business-scale-kpi-growth-achievement
p2s-compliance-ml-risk-scoring p2s-contextual-bandits-rec      p2s-cross-platform-user-identity
p2s-decision-audit-trail-ontology  p2s-entity-resolution-kg-dedup
p2s-explainable-review-adjudication  p2s-llm-experiment-hypothesis
p2s-pvm-attribution-window-harmonization  p2s-real-options-product-launch-timing
p2s-sc-whatif-scenario-analysis-engine  p2s-tag-fairness-bias-audit
product-attribute-analyzer    product-launch-planner           terminology-standardizer
```

---

## 2. 22 条 supply 的正文状态

| 状态 | 数量 | 说明 |
| --- | --- | --- |
| Sage staging 有正文 | 18 | 可直接用 |
| Career skill-library 归一化同名可达 | 22 | 全部可恢复 |
| **合并后可用** | **22/22** | 无缺 |
| git 跟踪 | 1 | 只有 `product-attribute-analyzer`，且在 backup 目录 |

**结论：4 席试点的技能正文不缺。** 之前报「缺 41 个」是只数 git 跟踪文件造成的误判。

---

## 3. 四个待定版技能

这 4 个在 Career 各有 2 个版本，需选一版。**判断依据是内容完整性，不是字节数。**

### 3.1 `market-scenario-modeler`（AGT-001 资源情景比较）

| 版本 | 字节 | 结构 | 判断 |
| --- | --- | --- | --- |
| `02631` | 3,410 | 含触发词、何时不用、安全边界 | ✅ **选这个** |
| `12771` | 1,364 | 仅 When to Use / Framework / Templates / Tips | 英文简版，缺治理段 |

**理由**：`02631` 有中文触发词（市场情景建模、TAM/SAM/SOM、敏感性分析）与「何时不用」（财务建模转 creating-financial-models），符合 DSH 技能的 `description` 要求。`12771` 是纯英文工具描述，缺安全边界。

### 3.2 `ab-test-setup`（AGT-008 实验组合）

| 版本 | 字节 | 差异 |
| --- | --- | --- |
| `02430` | 12,059 | description 含完整触发词（A/B测试、分组实验、假设验证、分流测试、实验设计） |
| `00266` | 11,177 | description 用 `>-` 折叠块，无中文触发词 |

**理由**：两版正文结构几乎相同（`## Initial Assessment` / `## Core Principles` 等），差异主要在 frontmatter。`02430` 的 description 更完整，含中文触发词。**选 `02430`。**

**但需修**：确认 `disable-model-invocation: true`。

### 3.3 `product-launch-planner`（AGT-008 阶段投资建议）

| 版本 | 字节 |
| --- | --- |
| `04081` | 8,288 |
| `00354` | 6,224 |

**选 `04081`**（字节多 2,064，更可能含完整上市前置清单）。

**必须修**：`04081` 的 `disable-model-invocation: false`，与岗位技能默认 `true` 冲突，改 `true`。

### 3.4 `multichannel-inventory-sync`（AGT-045 账号商品映射）

| 版本 | 字节 |
| --- | --- |
| `02651` | 9,950 |
| `00344` | 8,266 |

**选 `02651`**。

**注意一个语义问题**：这个技能的正文是 Shopify / Amazon **库存同步**，而 AGT-045 的「账号商品映射」是**主数据对象关系**。两者相关但不等同。挂上后需要在 note 里写清「此技能覆盖库存维度的对象映射，不覆盖账号—商品—站点的完整关系」。

---

## 4. 三个真正缺正文的技能

| 技能 | 归属 | 状态 | 处置 |
| --- | --- | --- | --- |
| `compliance-checker` | bundle 里有，四池皆无 | 无正文 | 需写，或从 bundle 移除 |
| `audit-log-analyzer` | 同上 | 无正文 | 同上 |
| **利益冲突检查** | AGT-005 的 gap 技能 | **四位置 0 候选** | **必须写** |

### 4.1 利益冲突检查：为什么它必须写

这是 AGT-005 守衡在试点中承担独立复核的核心能力。

AGT-005 的边界是「不能替代法律签署和诉讼程序」，它的价值就在「复核者与生产者分离」。而这个分离的技术保障，正是利益冲突检查：

```
proposer = reviewer        → REFUSE
reviewer 参与产物制作       → 冲突
HIGH 且无缓解              → 拒绝复核并升级具名人类
```

**没有这个技能，独立复核就是形式。** AGT-005 会退化成「另一个 AGT-008」。

### 4.2 建议的正文结构

```markdown
---
name: conflict-of-interest-check
description: 检查复核者与被复核事项之间是否存在利益冲突。
  用于独立复核前置校验。触发词：利益冲突、独立性检查、回避判断、复核资质。
  何时不用：普通业务评审（非独立复核场景）、合规审查（转 compliance-checker）。
version: 0.1.0
status: candidate
owner: AGT-005
source_kind: native
body_profile: native-v1
disable-model-invocation: true
---

## 输入
proposer / reviewer / contributors / reporting_lines /
financial_interests / prior_involvement / decision_rights

## 检查项
1. proposer = reviewer → REFUSE
2. reviewer 是否参与产物制作或指标定义
3. 汇报线是否指向被复核决策的受益人
4. 财务或个人利益
5. 既往参与
6. 外部关系

## 分级
HIGH / MEDIUM / LOW

## 缓解
recusal / 换独立 session / 外部 human / 职责分离

## 输出
IndependenceDeclaration:
  declaration_id / proposer / reviewer /
  conflicts[{type, severity, evidence_ref}] /
  mitigation[] / residual_risk / independence_level / signers[]

## 失败处理
无声明 → 不出结论
自审 → REFUSE
不能自己给自己缓解

## 验收
proposer ≠ reviewer 或已 recuse
每个 conflict 有类型/严重度/证据
HIGH 无缓解时无 AssuranceReview
```

---

## 5. 技能白名单与 bundle 的不一致

已知问题：**bundle 只覆盖 9/22 试点的 supply**。

| 席位 | bundle coreSkills | 应有 supply | 覆盖 |
| --- | --- | --- | --- |
| AGT-001 | 3 | 6 | 3/6 |
| AGT-008 | 3 | 6 | 3/6 |
| AGT-005 | 0 | 4 | **0/4** |
| AGT-045 | 3 | 6 | 3/6 |

**AGT-005 在 bundle 里是 0**，意味着独立复核席位当前没有任何技能。这是 CR-SB-003 要修的核心问题。

---

## 6. 试点技能闭包判定

### 6.1 能关的部分

| 项 | 状态 |
| --- | --- |
| 22 条 supply 正文 | ✅ 22/22 可恢复 |
| 4 个待定版 | ✅ 已给选版建议 |
| 3 个缺失 | ⚠️ 需写，其中 1 个（利益冲突检查）是核心能力 |
| 非技能类前置 | ❌ preset 发射器、会话绑定、技能安装 |

### 6.2 补完技能也不能跑

补完 5 个正文（4 个定版 + 1 个新写）之后，仍然跑不了完整试点。原因：

| 缺什么 | 影响 |
| --- | --- |
| Case Charter | 事项无法建立 |
| 只读输入版本 | 证据无法固定 |
| preset 声明行发射器 | 专家挂不到会话 |
| 技能安装（`~/.dsh/skills` 不存在） | 技能装不上 |
| 16 个 T0 / 8 个 pb | 通用能力缺失 |
| EP-2 / mount 证据 | 无法验证 |

**技能是必要不充分条件。**

---

## 7. 立即可执行的三件事

| # | 动作 | 负责 | 判据 |
| --- | --- | --- | --- |
| 1 | 从 Career 恢复 4 个定版技能到 Sage staging | 工程师 | 4 个目录存在，frontmatter 合法 |
| 2 | 写 `conflict-of-interest-check` 正文 | AGT-005 责任方 | 按 §4.2 结构，含自测断言 |
| 3 | 修 `product-launch-planner` 的 `disable-model-invocation` | 工程师 | 改为 `true` |

---

## 8. 复算命令

```bash
# 四席 supply 并集
python3 -c "
import json
sm=json.load(open('scripts/role-presets/skill-map.json'))['skills']
rc=json.load(open('<AI组织变革>/docs/05-agents/role-catalog.json'))
roles={r['id']:r for r in rc['roles']}
u=set()
for c in ['AGT-001','AGT-008','AGT-005','AGT-045']:
    for s in roles[c]['skills']:
        u.update(sm.get(s,{}).get('supply',[]))
print(len(u))
"
# 期望 22

# 四席 L3 的 kind 分布
# direct 10 / partial 1 / gap 1
```

---

## 9. 事实状态

| 内容 | 状态 |
| --- | --- |
| 22 条 supply 正文 | 可恢复 22/22 |
| 4 个待定版 | 有明确建议，待执行 |
| 利益冲突检查 | **无正文，需写** |
| bundle 覆盖 | 9/22，AGT-005 为 0 |
| 技能安装 | 0 |
| 试点可跑 | **否** |
