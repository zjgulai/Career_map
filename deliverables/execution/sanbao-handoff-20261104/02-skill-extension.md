---
title: 给 53 席继续添加技能的稳定入口
doc_type: architecture
module: handoff
topic: skill-extension-interface
status: review
created: 2026-11-04
updated: 2026-11-04
owner: self
source: human+ai
---

# 给 53 席继续添加技能的稳定入口

用户明确要求：「为后续继续为 53 个专家添加 skill 留口子」。

本文件定义这个口子。**核心约束：不新增第七份映射层。**

---

## 1. 现有六层各管什么（先认清，再谈扩展）

| 层 | 唯一回答的问题 | 文件 | 写模式 |
| --- | --- | --- | --- |
| **岗位事实** | 53 席是谁、声明了哪些中文业务技能名 | `AI组织变革/docs/05-agents/role-catalog.json` + `management-catalog.json` | 上游只读 |
| **技能资产** | 这个技能的正文是什么、什么版本 | `SKILL.md`（staging 源池 + `~/.dsh/skills/<name>/`） | 经收录管线写 |
| **接线** `skill-map.json` | 岗位声明的能力由哪些具体技能满足 | `Sage/scripts/role-presets/skill-map.json` | 人工语义映射 + 门禁 |
| **归位** `role-assignments.json` | 这个技能允许给哪些席位用 | `Sage/packages/capabilities/dsh-overseas-skills/manifest/role-assignments.json` | 人工判定 + 证据 + 门禁 |
| **分类** | 技能属于哪个业务分类 | `classification.json` + `taxonomy-v3.json` | 派生 / 人工 |
| **证据 / 许可** | 有没有证据、能不能公开出货 | `skill-evidence-corpus.json`、`provenance.json`、`intake-provenance.json`、`NOTICE` | 只读快照 |
| **运行投影**（不是独立层） | 无事实权威 | `expert-skill-bundles.ts`、`~/.dsh/.agent-presets/*`、`expert-registry.generated.ts` | **生成，禁止手改** |

`role-assignments.json:5` 已经把分工写死：`skill-map` 是「接线」（喂 preset），`RA` 是「归位」（喂页面）。

**现在的问题是第三个消费者 `expert-skill-bundles.ts` 既没声明读哪一层，也没有生成器。**

---

## 2. 扩展口就是 RA 的 `source=add-on`

不给某个技能找 skill-map 的位置，而是直接在 `role-assignments.json` 里给席位加一条挂载：

```json
{
  "skill_id": "<kebab-case-id>",
  "seat": "AGT-008",
  "source": "add-on",
  "approved_by": "<席位责任方具名>",
  "note": "为什么这条不走 skill-map",
  "responsibility": "<或 null，add-on 可豁免逐字匹配>"
}
```

**为什么用 add-on 而不是新层**：RA 本来就是「skill → seat 的资格」的权威。一个新技能给一个席位用，本质就是一条资格记录。再开一层只会制造第二个真相源。

**三条使用规则**：

| 场景 | 用什么 |
| --- | --- |
| 该技能是岗位声明能力的一部分 | 走 `skill-map`（改一次，多个席位继承） |
| 该技能只是这个席位的额外能力 | 走 RA `source=add-on` |
| 该技能要同时给 ≥3 席使用 | **必须**走 `skill-map`，不能逐席 add-on（validator J3 禁止多席标 high） |

---

## 3. 加一个技能的完整步骤

### 步骤 0 · 判来源与允许面

| 项 | 内容 |
| --- | --- |
| 输入 | 技能卡路径 / 仓库路径 / 能力需求 |
| 输出 | `source_kind`、`source_ref`、`source_sha256`、`allowed_surfaces` |
| 通过 | 来源可解析；许可明确；面在允许集内 |
| 失败 | 无许可 → 只能进 internal；`source=prod-sync` 的指针卡 → 先补正文 |

三类来源的默认面：

| 来源 | 默认允许面 |
| --- | --- |
| `paper-card`（纸库方法卡） | internal / public-site / shipped-product（**著作权归用户**） |
| `career-packaged`（Career 恢复的运营卡） | 默认 internal，除非逐条补许可证据 |
| `third-party`（出海 staging 引入） | 有 SPDX 才可出货，否则 internal |

**纸库的例外**：卡片文本归用户，但卡内引用的 arXiv 摘要、PDF、图表仍属第三方。公开面必须写清这条边界。

### 步骤 1 · 落资产

| 项 | 内容 |
| --- | --- |
| 输出 | `SKILL.md` 落到 `dsh-paper2skills/staging/<L2>/<slug>/` 或 `dsh-overseas-skills/staging/<intake\|third-party>/<name>/` |
| 通过 | frontmatter `name` = 目录名；`description ≤ 500`；`SKILL.md ≤ 12KB`（长代码进 `references/`） |
| 失败 | 52 张 `p2s-raw-v1` 先跑 assemble/adapt 补契约段；`prod-sync` 先回填正文 |

### 步骤 2 · 填契约

必填 frontmatter，缺一即拒：

```
name             kebab-case，^[a-z0-9]+(-[a-z0-9]+)*$
title            中文标题
description      ≤500 字，说明何时使用与何时不用
version          semver
status           active | candidate | retired
owner            责任方
source_kind      paper-card | career-packaged | third-party | native
source_ref       来源路径或 URL
source_sha256    正文哈希
body_profile     paper-card-v1 | p2s-assembled-v1 | overseas-v1 | career-v1 | native-v1
disable-model-invocation  true（岗位技能默认不全局可见，只经白名单开放）
```

通过判据：`check-skill-contract.mjs --file <path>` 全绿；name 全局唯一；`source_sha256` 可重算。

### 步骤 3 · 分类

| 项 | 内容 |
| --- | --- |
| 输出 | `classification.json` 一条，或 `taxonomy-v3.json` 的 mapping |
| 通过 | L3 名逐字在 `classification.json` 现有的 136 个 L3 名内；一条技能 1–3 个 L3；不跨面 |
| 失败 | 无匹配 L3 → **不猜**，标 `no_role_kind` + `reason`，或留 `candidate` |

**注意**：`151` 是 AGT 的中文业务技能名数量（`skill-map._meta`），**不是 L3 数量**。分类层的 L3 是 136 个。两个数字不能混用。

### 步骤 4 · 证据

| 项 | 内容 |
| --- | --- |
| 输出 | `corpus` / `provenance` / `code-availability` / `code-recovery` 记录 |
| 通过 | `build-evidence-corpus.mjs --check` 覆盖；`from_skill` 是正文的连续子串 |
| 失败 | `MISMATCH` / `NOT_FOUND` / `NO_ID` → 降 `candidate`；代码不可解析 → 不得标「可运行」 |

### 步骤 5 · 接线（可选）

只在「这个技能属于岗位声明的能力」时做。

| 项 | 内容 |
| --- | --- |
| 输出 | `skill-map.json` 的 supply 数组追加 id |
| 通过 | key 逐字在 `role-catalog.json`；`direct/partial` 的 supply 非空；`gap` 的 supply 为空 |
| 失败 | key 不在 role-catalog → 拒绝（需要上游材料变更）；无正文 → 先补正文 |

**必须知道的坑**：`apply-skill-map-overrides.mjs` 的 quota 会把每个 L3 的 supply 裁到 keep 名单。当前 skill-map 已是裁剪后状态。**新加的 supply 如果不进 quota keep 名单，会被静默裁掉。**

### 步骤 6 · 归位

| 项 | 内容 |
| --- | --- |
| 输出 | `role-assignments.json` 一条 mount |
| 通过 | `validate_assignments.py` J1–J6；`source ∈ {skill-map, assigned, add-on}`；add-on 必须有 `approved_by` + `note` |
| 失败 | 责任名不逐字 → 改或走 add-on；证据不是连续子串 → 重写；同席重复 → 合并；缺批准人 → 拒绝 |

### 步骤 7 · 生成投影

| 项 | 内容 |
| --- | --- |
| 输出 | `~/.dsh/.agent-presets/*` 与 `expert-skill-bundles.ts` |
| 通过 | `generate.mjs` 退出 0；`build-skill-bundles.mjs --check`；bundle 每个 id 都有正文、有 RA、`status=active` |
| 失败 | 悬空 id → 删或补；bundle 过期 → `--write`；MGT 可点击 → 改 UI |

### 步骤 8 · 安装与运行验证

| 项 | 内容 |
| --- | --- |
| 输出 | `~/.dsh/skills/<name>/SKILL.md` + 验证记录 |
| 通过 | `verify-install.mjs`；`verify-lossless.mjs` L7/L8；目标席位开一次会话能路由到该技能 |
| 失败 | `~/.dsh` 不存在 → skip + note，**不报已安装** |

### 步骤 9 · 登记与发布

| 项 | 内容 |
| --- | --- |
| 输出 | `intake-provenance` 条目、`NOTICE-paper-to-skills.md`、按命令重算的计数 |
| 通过 | license 可追溯；NOTICE 有 holder + scope；internal-only 不进 shipped |
| 失败 | 缺 NOTICE → 拒绝 public/shipped |

---

## 4. 五种扩容场景的完整路径

### (a) 单个专家加一个技能

```
技能已在源池 → 跳过步骤 0-4
  → RA 加 add-on（approved_by + note）
  → validate_assignments.py
  → build-skill-bundles --write
  → generate.mjs
  → verify-lossless L8
影响面：1 个席位，1 条记录
```

技能不存在 → 走步骤 0-4 先写资产。

### (b) 一个技能给多个专家

```
一个 SKILL.md，多条 RA mounts
  → 若这些席位的声明能力本来就包含它：改 skill-map 一次，RA 用 source=skill-map 继承
  → 否则逐席 add-on，每席独立 approved_by
  → ≥3 席时 confidence 不得 high（J3）
影响面：1 个技能，N 条挂载，0 份正文复制
```

任一席不需要时**只删该席的 mount，不删技能**。

### (c) 批量导入一个新技能库

```
1. 建 staging/<batch>/ + batch.json（来源 repo@commit、license、count、owner）
2. 逐文件跑 check-skill-contract
3. 批量分类 + 证据
4. 生成 candidate-roles.json 给席位责任方，不自动写 RA
5. 选 1-2 席 pilot，shadow 运行
6. 通过后按波次挂载
禁止：自动写 RA、未 pilot 就全量
```

### (d) 退役一个技能

```
1. status = retired
2. 从 skill-map supply 移除，或把 kind 降为 gap/partial 并写 note
3. RA 用 dropped[] 写 reason，不静默删
4. bundle generator 过滤 non-active
5. generate / verify-lossless / build-skill-bundles --check，断言 0 引用
6. 正文移到 archive，不删除
7. intake-provenance 保留
8. 公开目录下架，shipped 包重打
必须：若某席因此失去声明技能，显式记 gap 或换替代
```

### (e) 技能升级换版

```
1. 同 id 新 version（semver）
2. 更新 source_sha256
3. 旧正文归档
4. 行为变化时重跑证据与分类
5. 受影响席位重新批准
6. generate + bundle + verify
7. 回滚用旧版正文重装
禁止：hash 变了但 version 不变（静默覆盖）
major 变更必须席位重批；minor/patch 可批量但要有 changelog
```

---

## 5. 原设计漏掉的三个场景（补上）

| 场景 | 为什么要单独处理 |
| --- | --- |
| **同 id 内容修订（patch）** | 最高频场景。`verified_at` 是否失效、要不要重跑证据、要不要席位重批，必须写死。规则：**patch 只改错别字/格式 → 不重批，但 `verified_at` 置空；改方法/阈值 → 升 minor，重跑证据** |
| **合并 / 拆分** | `skill-map.overrides.json` 已有 8 条 merge、8 条 `absorbed_capabilities`。新流程必须承认这条既有机制，用 `absorbed_into` / `split_from` 字段，不另造 |
| **改名 / 别名** | Career 库有大量数字前缀目录名。规则：`name` 不改，目录名可带前缀；改名走「新建 + 退役旧」，不做原地改 id |

---

## 6. 门禁：什么情况下必须拒绝

| 门 | 拒绝条件 |
| --- | --- |
| G0 来源许可 | `source_kind` 缺失；license 为空；请求面不在 `allowed_surfaces` 内；`prod-sync` 指针卡请求 public |
| G1 资产契约 | frontmatter 缺必填；name 不合 kebab 规则；name ≠ 目录名；跨池同名；description > 500 |
| G2 正文 | `body_profile` 声称的段缺失；正文是占位句；含二进制容器 |
| G3 证据 | 标 verified 但 `evidence_ref` 不可解析；provenance 为 `MISMATCH` / `NOT_FOUND` 却标 verified；代码不可解析却声称可运行 |
| G4 分类 | L3 不在分类层现有 136 个 L3 名内；一条技能跨面；classification 与 frontmatter 不一致 |
| G5 接线 | key 不是 role-catalog 逐字业务技能名；`kind=gap` 但 supply 非空；`kind=direct/partial` 但 supply 为空 |
| G6 归位 | seat 不在 role-catalog；add-on 无 `approved_by` 或 `note`；同 skill 同 seat 重复；≥3 席标 high |
| G7 投影 | bundle 与生成器输出不一致（手改）；bundle 引用无正文 / 无 RA / `status=retired`；MGT `coreSkills` 非空 |
| G8 退役 | retired 仍出现在 skill-map / RA / bundle；退役未写 `dropped` reason |
| G9 升级 | hash 变化但 version 未变；version 回退；major 未重批 |
| G10 批量 | batch manifest 缺来源 commit / license / count；文件数与 manifest 不符；自动写 RA；未 pilot 就全量 |
| G11 公开出货 | 请求 public/shipped 但 NOTICE 缺失或未写 holder/scope；internal-only 进 shipped |
| G12 跨仓 | 为了让门禁变绿去改 AI组织变革 / paper_to_skills / Career 的源文件 |
| G13 空射程 | 检查器在输入缺失时返回绿；`~/.dsh` 不存在却声称已安装 |
| G14 名称伪造 | 为 gap 编造不存在的 skill id；用中文名冒充 id |

---

## 7. 跨层不变量（写死，防止再漂移）

现有三处漂移是反面教材：

| 漂移 | 实测 | 后果 |
| --- | --- | --- |
| `skill-map` supply ∩ `RA` | 101 / 251 | 验证基线不可信 |
| bundle 引用不在该席 skill-map 期望集 | 159 / 280 | 用户可能点到未挂载技能 |
| bundle 引用不在 skill-map ∪ RA | 15 条 | 悬空 |

三条不变量：

```
I1  每个 skill-map supply id 必须在 skill 资产层有正文
I2  每条 RA mount 的 skill_id 必须在 skill 资产层有正文，且 status=active
I3  bundle = resolver(skill-map, RA, T0, playbook) 的纯函数输出，禁止手改
```

**I3 是根治 159/280 的唯一办法**：bundle 必须是生成的，且生成器必须读 skill-map 和 RA，不能读自己。

---

## 8. 一句话总结

**加技能 = 1 个资产 + 1 条 RA 挂载（必要时 +1 条 skill-map supply）。不新开文件，不改 53 席列表，不碰 preset id，不扩权限。**
