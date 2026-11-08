---
title: 六份早先产物的逐处更正
doc_type: other
module: handoff
topic: corrections
status: review
created: 2026-11-04
updated: 2026-11-04
owner: self
source: human+ai
---

# 六份早先产物的逐处更正

本文件只做一件事：列出 Career 侧早先六份产物中每一处必须更正的内容。每处写清「错在哪 → 改成什么」。

**复算命令**：本文件所有计数均可用 `find` / `grep` / `python3` 复现。凡标注「口径」处，引用时必须带上口径。

---

## C-01 · `seat-registry.json`：T0 把运行层写成身份层

| 项 | 内容 |
| --- | --- |
| 错在哪 | `tier_definitions.T0` 写 `no persona, no soul, no memory`；同文件把 AGT-015/020/040/044/045/048/050 七席标为 T0 |
| 为什么错 | 这七席是 53 席专家目录里的真实岗位，有岗位卡与 persona。`tier` 是**目标运行层**，不是身份类型。现文与「53 个专家」直接冲突 |
| 改成什么 | `T0 = deterministic execution mode: this run loads no persona/soul/memory; the seat keeps its 53-seat identity, role card and persona reference; semantic work requires a separately authorized T3 profile run.` |
| 附加 | 增加 `identity_note` 与 `runtime_layer_status` 两个字段 |

**规则**：`tier` 描述「这一次跑怎么执行」，不描述「这个席位是不是专家」。53 席全员都是专家，无例外。

---

## C-02 · `seat-registry.json`：缺 `runtime_layer` 字段，前置永远过不了

| 项 | 内容 |
| --- | --- |
| 错在哪 | 授权文件 §4 前置 1 要求 46 席 `runtime_layer` 显式写 `unassigned` 且不得 null；文件没有这个字段，53/53 `human_owner_ref` 为 null |
| 后果 | 前置 1 永远无法通过 |
| 改成什么 | 53 行各加 `runtime_layer`：4 席试点分别 `T3_profile` / `T2_session` / `T2_session` / `T0_plus_T3`；46 席 `unassigned`；3 MGT `T4_rule_pack`。加 `runtime_layer_status`；`human_owner_ref` 由 null 改 `PENDING`，并加 `human_owner_required_for` |
| 校验 | 53/53 非空；46 个 `unassigned`；0 个 null |

---

## C-03 · `read-only-overlay.json`：三个分母混用

| 项 | 内容 |
| --- | --- |
| 错在哪 | `applies_to` 写 50 AGT；授权文件 §4 判据写 53/53 preset；overlay 又排除 MGT |
| 为什么错 | 50 preset、53 seat、53 preset 不是同一对象 |
| 改成什么 | 加 `coverage` 块：`agt_presets=50`、`mgt_rule_packs=3`、`seat_coverage=53`、`session_capable=50` |
| 判据改为 | `50/50 AGT preset + 3/3 MGT rule pack = 53/53 seat coverage` |
| 明确 | MGT 不生成 preset、不起 session |

---

## C-04 · `read-only-overlay.json`：preset_id 是旧格式

| 项 | 内容 |
| --- | --- |
| 错在哪 | 50 处 `preset_id` 为 `dsh.role.agt-NNN.v1`，是 0.1.x 目录型命名 |
| 为什么错 | 0.2.0 只认 `config.id = agt-NNN`；`expert-skill-bundles.ts` 已用 `presetId: agt-NNN`，两处不一致 |
| 改成什么 | 50 处改 `preset_id: agt-NNN`；保留 `legacy_preset_id: dsh.role.agt-NNN.v1`；加 `preset_schema: @deepseek-ai/dsh-agent-preset` |
| 校验 | 50/50；加载器字段中 0 个 `dsh.role.` 前缀 |

---

## C-05 · `dsh-53-expert-config-spec-draft`：「一个都配不了」范围过宽

| 项 | 内容 |
| --- | --- |
| 错在哪 | L147 / L182 / L197 / L356 把「仓库内正文少、生成器未改」推广成「53 个专家一个都配不了」 |
| 有效范围 | 只是：0.2.0 声明行发射器、真实正文落盘、mount 证据三项未完成时，**不能产出可运行 session** |
| 不等于 | 53 席目录无效、292 refs 无效、22/22 试点 supply 正文无效 |
| 改成什么 | §4 前加范围框：「本结论只覆盖可运行产物的三个缺口」；L147 改为带分母的「git 跟踪集合 11/251；合并正文口径另计」 |

---

## C-06 · `dsh-53-expert-config-spec-draft`：「41 个技能缺正文」

| 项 | 内容 |
| --- | --- |
| 错在哪 | 写「43 个唯一技能中 41 个无正文」；「4 席需补 41 个」 |
| 实际（合并正文口径） | **4 个**。Career skill-library + Sage staging + paper vault 三处合并后 |
| 4 个明细 | `利益冲突检查`（AGT-005，四位置 0 候选，**结构缺口**）；其余 3 个为 T0 / generic 待落盘 |
| 41 是怎么来的 | 只数 `git ls-files '**/SKILL.md'` 的 34 个跟踪文件 |
| 改成什么 | 「合并正文口径 4 个缺口；1 个结构缺口 = 利益冲突检查（0 候选），其余 3 个为 T0/generic 待落盘」；「4 席需补 4 个」 |

---

## C-07 · `dsh-53-expert-config-spec-draft`：persona 含岗位卡逐字块

| 项 | 内容 |
| --- | --- |
| 错在哪 | L158 说 persona 第 5 段是「岗位卡原文逐字块」；L165 说 persona 可见「仅摘要 + 逐字块」 |
| 实际 | `scripts/role-presets/generate.mjs:413-441` 的 `renderPersona` 只放：身份、材料溯源、相对链接说明、Harness 映射、**Soul 摘要**、技能供给实况。L427 明确完整岗位卡归档在 `manifest.material.role_card` |
| 改成什么 | 第 5 段改为「Soul Contract 摘要（我是谁 / 我的灵魂原则 / 我绝不做什么 / 我的停止信号）」；删除「岗位卡原文逐字块」；§3.2 改为「归档指针 + 摘要，无逐字块」 |

---

## C-08 · `dsh-53-expert-config-spec-draft`：引用不存在的 commit

| 项 | 内容 |
| --- | --- |
| 错在哪 | L26 把 `639ed015397290b3745d163aafe02ffee4aa3f84` 写成「参照检出」 |
| 实际 | 本机 `git cat-file -t` 返回 `could not get object info`。该 sha 只出现在 `vendor/dsh-desktop.pin` 的 `harness-submodule` 字段，submodule 未检出 |
| 改成什么 | 「pin 声明 `harness-submodule=639ed...`；本机不可解析，状态 `declared-unverified`；不作为构建或运行时依据」 |
| 运行时依据 | `apps/sage-shell/seed/package.json` 的 `0.2.0-rc.2` |

---

## C-09 · 三份文件：本机绝对路径

| 项 | 内容 |
| --- | --- |
| 错在哪 | dsh spec L17 写临时克隆目录；agent-org L17 与 pilot auth L80 写本机 AI组织变革 绝对路径 |
| 为什么错 | 公开仓库 + 跨机传递；绝对路径暴露本机布局且不可复现 |
| 改成什么 | 全部改为 repo alias：`AI组织变革`、`Sanbao`、`Career`、`paper_to_skills`；需要相对定位写 `<repo-root>/...` |
| 校验 | 交接包内不得出现用户主目录前缀、临时目录前缀或应用安装路径；交付前跑一次路径扫描，命中数必须为 0 |

---

## C-10 · `sanbao-agent-org-optimization-draft`：凭据位置

| 项 | 内容 |
| --- | --- |
| 错在哪 | L326 写「本机 DSH 配置文件第 9 行内嵌 Bearer token」，含完整用户目录路径与行号 |
| 为什么错 | 等于在文档里标出凭据位置；进入公开仓库或共享包会直接扩大泄露面 |
| 改成什么 | 删除路径、行号与「Bearer token」字样；改为「宿主 DSH 配置存在内嵌凭据（位置与值不复述）；pilot 使用独立 profile / secret scope；轮换由具名 owner 执行」 |
| 保留字段 | `credential_source=host_managed`、`credential_in_model=false` |

---

## C-11 · `sanbao-agent-org-optimization-draft`：标题状态与文件状态冲突

| 项 | 内容 |
| --- | --- |
| 错在哪 | title（frontmatter）与 H1 都写「锁定版」，但 `status: draft`，正文又说「设计提案」；生效前置 0/7 |
| 改成什么 | 标题改「三宝 3+50 专家 Agent 组织优化规格（设计提案 v0.1）」；保留 `status: draft`；加签核块（owner / date / scope） |
| 升级条件 | 只有 owner 签核且 7 项前置满足后，才允许 `status` 升 `stable` 并改标题 |
| 规则 | 标题状态词必须等于 frontmatter `status` |

---

## C-12 · `sanbao-pilot-authorization`：overlay 覆盖范围写错

| 项 | 内容 |
| --- | --- |
| 错在哪 | L154 写「写 read-only overlay（覆盖 4 席，但校验规则要求 53/53）」 |
| 实际 | overlay 有 50 个 AGT override，4 席只是 `in_pilot=true` |
| 改成什么 | 「覆盖 50 AGT + 3 MGT rule pack；4 席标记 `in_pilot`；校验 `50/50 AGT preset + 3/3 MGT rule pack = 53/53 seat coverage`」 |

---

## C-13 · `dsh-53-expert-config-spec-draft`：34 个 SKILL.md 的口径

| 项 | 内容 |
| --- | --- |
| 错在哪 | L182 写「34 个 SKILL.md 中，0 个 p2s 正文」，未说明 34 是 git 跟踪数 |
| 实际 | `git ls-files '**/SKILL.md'` = 34；**未跟踪 staging** 有 1,390 p2s + 153 overseas = 1,543，+ 1 wanzh = 1,544 active，33 backup，合计 1,577 |
| 为什么错 | 被误读为「全仓只有 34 个」 |
| 改成什么 | 「git 跟踪 34 个 SKILL.md，其中 0 个 p2s 正文；未跟踪 staging 1,544 活跃 + 33 backup = 1,577」 |
| 附命令 | `git ls-files '**/SKILL.md'`；`find packages/capabilities/*/staging -name SKILL.md` |

---

## 更正汇总

| # | 文件 | 类型 | 严重度 |
| --- | --- | --- | --- |
| C-01 | seat-registry | 与 53 席决策冲突 | **高** |
| C-02 | seat-registry | 结构性缺失 | **高** |
| C-03 | overlay | 分母混用 | 中 |
| C-04 | overlay | 格式不兼容 0.2 | **高** |
| C-05 | dsh spec | 范围过宽 | **高** |
| C-06 | dsh spec | 数字错 10 倍 | **高** |
| C-07 | dsh spec | 事实错 | 中 |
| C-08 | dsh spec | 引用未核实 | 中 |
| C-09 | 三份 | 公开卫生 | **高** |
| C-10 | agent-org | 凭据位置 | **高** |
| C-11 | agent-org | 状态不一致 | 低 |
| C-12 | pilot auth | 覆盖范围错 | 中 |
| C-13 | dsh spec | 口径缺失 | 中 |

---

## 未覆盖的已知漂移

以下事实错误在推演中被发现，但**未列入本轮更正**（因为分属 Sanbao 工程侧，不是 Career 产物）：

| 漂移 | 实测 |
| --- | --- |
| `MGT-001..003` 的 `sourceRefs` 指向不存在的 `05-agents` 路径 | 12 条 |
| `build-expert-registry.mjs --check` 实测 exit 1 | registry 与源不一致，且未接门禁 |
| `skill-map.overrides.json` 的 `applied_at` 为 null 但内容已生效 | 8 条 note 写 5 项，实际 supply 只剩 2 条 |
| `README.md` 计数过期 | 50 / 350 / 5106 / 272 / 381 应为 53 / 371 / 5404 / 1285 |
| `dsh-paper2skills/README.md` 仍写 1,338 | 实际 1,390 |
