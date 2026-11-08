---
title: 跨仓变更请求单
doc_type: other
module: handoff
topic: cross-repo-requests
status: review
created: 2026-11-04
updated: 2026-11-04
owner: self
source: human+ai
---

# 跨仓变更请求单

Career 只提请求与证据，**不替对方写 ADR、不改源仓**。

每单写清：目标仓、范围、要改的文件字段、验收判据、停止条件。

---

## CR-AO-001 · AI组织变革：A 方案 9 席职责扩写

| 项 | 内容 |
| --- | --- |
| **目标仓** | `AI组织变革` |
| **依据** | C-378（A 方案）、C-389（冻结前置） |
| **要改的文件** | `docs/05-agents/role-catalog.json`、`docs/04-organization/management/management-catalog.json`、对应的 `roles/*.md` 与 `souls/*.soul.md` |

### 逐席变更

| 席位 | 缺口 | 新增职责（责任句） |
| --- | --- | --- |
| **AGT-041 守金** | 汇率与外汇 | 按已批准口径输出《汇率敞口清单与敏感性测算》；汇率损益和对冲效果不属本岗位责任 |
| **AGT-019 通途** | 贸易合规 | 输出《清关单证与风险预检表》；是否放行由海关与报关行决定，不属本岗位责任 |
| **AGT-044 安界** | 认证项目管理 | 输出《合规证据矩阵》；证书真实性与准入结论由签发机构/监管/海关认定 |
| **AGT-014 择源** | 供应商风险 | 维护《关键物料供应风险档案》；断供是否发生及损失由供应商与市场决定 |
| **AGT-018 质守** | 召回决策 | 输出《批次隔离与召回证据包》；是否召回由 L4 真人所有者决定 |
| **AGT-020 行舟** | 召回物流 | 核对《履约与退货回执差异表》；实际出库退款由仓库与系统执行 |
| **AGT-027 守店** | 账号矩阵 | 输出《账号风险信号与证据包》；是否封禁与封禁范围由平台决定 |
| **AGT-043 律衡** | IP 攻防 | 输出《IP 风险与应对建议》；诉讼胜负与禁令由法院与外部律师决定 |
| **MGT-003 人和** | 企业风险/保险/BCP | 维护《企业级风险与约束台账》；风险组合取舍由 MGT-001/真人所有者决定 |

### 统一改写原则

原扩写把职责写成「对结果负责」，但结果不由岗位控制。**统一改为对「证据完整性、预警及时性、建议有据」负责，不对外部决定的结果负责。**

### 验收判据

```
9/9 席的 mission 与 boundary 已更新
每席新增职责可判定（能回答「做到什么算完成」）
责任句不含「对结果负责」类表述
catalog 版本号升级
build-role-assets 重跑通过
catalog ↔ role doc ↔ soul ↔ blueprint 四层一致性校验通过
```

### 停止条件

- 需要新增第 21 个专业身份 → 停，回到设计讨论
- 需要改动其他席位 → 另立请求

---

## CR-AO-002 · AI组织变革：版本冻结与打 tag（C-389）

| 项 | 内容 |
| --- | --- |
| **目标仓** | `AI组织变革` |
| **当前状态** | 工作树不干净：`M README.md`、`?? playbook.md`、`?? tmp/`；无 tag |
| **要求** | 交接冻结前由源仓 owner 提交并打不可变 tag |

### 验收判据

```
git status --short 为空（或 dirty 项已归档/还原）
tag 名与 commit sha 写入交接快照
Sanbao 侧 pin 该 tag/commit
9 席 A 方案与 tag 在同一冻结点
```

### 停止条件

- dirty 项属于未完成工作 → 先归档，不夹带
- 需要改 D-051 → 另立决定，不在本单范围

---

## CR-SB-001 · Sanbao：0.2.0 preset 声明行迁移

| 项 | 内容 |
| --- | --- |
| **目标仓** | `Sanbao` |
| **依据** | C-381（基座 0.2.0-rc.2） |
| **排期** | 排在当前 wave 收口之后，不插队 |

### 要改的文件

| 文件 | 动作 | 原因 |
| --- | --- | --- |
| `scripts/role-presets/generate.mjs:109-111` | 改基座模板来源 | 现指向 0.2 已删除的 `dsh-agent-presets` |
| `scripts/role-presets/generate.mjs:458-464` | `rowBlockRange` 改为缩进感知 | 只认列 0 的 `- id:`，读不了 `config.plugins` 嵌套 |
| `scripts/role-presets/generate.mjs:116` | `SOURCE_DSH_VERSION` 改 0.2.0-rc.2 | 现写 2.0.5 |
| `scripts/role-presets/generate.mjs` | **新增声明行发射器** | 现输出目录形态，0.2 不读 |
| `scripts/lib/app-resources.mjs:19` | 探测 Sage.app | 硬编码 `DSH Desktop.app` |
| profile 依赖 | 打包 `dsh-skill-subset` | 当前无此依赖，引用会激活失败 |
| `packaging/assemble.sh` | 白名单迁到声明行层 | 现按 `~/.dsh/.agent-presets` 目录选 |

### 验收判据

```
1 席（AGT-001）能产出声明行并 mount 成功
声明行 YAML 可解析，config.id = agt-001
persona 用 prefix（不是 text）
无 dsh-workflow-worker-thread（0.2 已删除）
skills.list 能看到白名单
hideOthers 生效
越权工具被拒
```

### 停止条件

- 需要改 `page.tsx` → 另立批次（当前正在拆分）
- 需要改 DSH 基座源码 → 回到架构讨论

---

## CR-SB-002 · Sanbao：会话绑定 agentPreset

| 项 | 内容 |
| --- | --- |
| **目标仓** | `Sanbao` |
| **依据** | 交接就绪度分析：`session/create` 只传 `cwd` |

### 要改的文件

| 文件 | 动作 |
| --- | --- |
| `apps/sage-shell/src/host/bridge-endpoints.ts` | `session/create` 接受 `agentPreset` 参数 |
| `apps/sage-shell/src/main/session-channel.ts` | 透传到 `sessions.create({cwd, agentPreset})` |
| `apps/sage-shell/src/product/app/desktop/experts.tsx` | 「对话」按钮传对应 presetId |

### 验收判据

```
Sage UI 选 AGT-001 → 会话 header.agentPreset = 'agt-001'
4 席各能选中并在会话里加载对应 persona
选不到 → 具名拒绝，不静默回落到 standard
```

### 停止条件

- 需要改 ExpertProfile DTO → 那是 EP-2，另立

---

## CR-SB-003 · Sanbao：修三处映射漂移

| 项 | 内容 |
| --- | --- |
| **目标仓** | `Sanbao` |

### 三个漂移

| 漂移 | 实测 | 修法 |
| --- | --- | --- |
| `skill-map` supply ∩ `role-assignments` | 101 / 251 | 从 skill-map 重建 RA 的 `source=skill-map` 部分；158 条陈旧挂载写 `dropped` |
| bundle 引用不在该席 skill-map 期望集 | 159 / 280 | 补生成器，从 skill-map + RA 重建，**禁止手改** |
| bundle 引用不在 skill-map ∪ RA | 15 条 | 删或补 RA |

### 关键：bundle 必须是生成的

`expert-skill-bundles.ts` 目前是手写清单，被 6 个 src + 3 个 test 消费。它声称「derived」但没有生成器。

**必须补 `build-skill-bundles.mjs`，且生成器只能读 skill-map 和 RA，不能读自己。**

### 验收判据

```
validate_assignments.py J1-J6 exit 0
supply ∩ RA = 251/251（或显式例外清单）
bundle 与生成器输出逐字节一致
159/280 归零或写入显式例外
MGT coreSkills 为空
```

---

## CR-SB-004 · Sanbao：修 expert-registry 的 12 处手改（C-384）

| 项 | 内容 |
| --- | --- |
| **目标仓** | `Sanbao` |

### 现状

`assets/experts/expert-registry.json` 与 `expert-registry.generated.ts` 中，**12 处字段被手改**，来源是 `Sage-2.0-main` 的 UI kit 样张文案。UI kit 自己声明只有 8 条标 `visual-copy-reviewed`、45 条 mission 为 null、**不能当完整岗位文案**。

`build-expert-registry.mjs --check` 现在 exit 1（registry 与源不一致），且该检查**未接任何门禁**。

### 修法（C-384）

按用户决定：**8 席改写保留为展示字段**。

```
1. 语义字段（mission/personality/alias/title）恢复为 AI组织变革 原文
2. 把改写移到 display 字段：display_mission / display_personality
3. 加 source_snapshot：记录消费的 AI组织变革 commit + 每文件 sha256
4. 修 MGT 的 sourceRefs：12 条指向不存在的 05-agents 路径 → 改 04-organization/management
5. build-expert-registry.mjs --check 接入门禁
```

### 验收判据

```
build-expert-registry.mjs --check exit 0
12 处字段与源一致
display_* 字段存在且不可进入 persona
MGT sourceRefs 12/12 路径存在
门禁在 CI 中运行
```

---

## CR-SB-005 · Sanbao：只读强制下沉到工具层（C-386）

| 项 | 内容 |
| --- | --- |
| **目标仓** | `Sanbao` |

### 现状

业务层（action-authority-table 的 70 条 action）确实没有业务 scope。**但模型工具层仍注册 bash / fs / web / subagent，沙箱默认 workspace-write。**

「只读」目前只存在于提示词里。

### 修法

```
1. pilot preset 的 plugins 数组删除危险行：tool-bash / tool-pwsh / tool-web / 写类 fs
2. sandbox 配置显式 read-only 或 workspace-write
3. 服务端 Policy Gate 强制字段级过滤
4. 建 9 类负向测试
```

### 验收判据

```
9/9 负向测试通过：
  write tool / 越界读 / 意外字段 / 跨事项 / 过期凭据 /
  缺审计 / 隐式会话 / 换岗 / shell 绕过
任一失败 → fail-closed
```

---

## 请求单汇总

| 编号 | 目标仓 | 主题 | 优先级 | 依赖 |
| --- | --- | --- | --- | --- |
| CR-AO-001 | AI组织变革 | A 方案 9 席 | P0 | 用户逐格确认 |
| CR-AO-002 | AI组织变革 | 冻结与打 tag | P0 | CR-AO-001 |
| CR-SB-001 | Sanbao | 0.2 声明行迁移 | P0 | 当前 wave 收口 |
| CR-SB-002 | Sanbao | 会话绑定 preset | P1 | CR-SB-001 |
| CR-SB-003 | Sanbao | 修映射漂移 | P0 | 无 |
| CR-SB-004 | Sanbao | 修 12 处手改 | P0 | 无 |
| CR-SB-005 | Sanbao | 只读下沉 | P0 | CR-SB-001 |

**CR-SB-003 与 CR-SB-004 无依赖，可以立即开始。**

---

## 不做什么

| 禁止 | 原因 |
| --- | --- |
| Career 代写 ADR | Sanbao 自己写 |
| Career 改源仓 | 三仓只读 |
| 为让门禁变绿改源文件 | G12 |
| 把源仓工作树当事实源 | 必须 pin commit |
