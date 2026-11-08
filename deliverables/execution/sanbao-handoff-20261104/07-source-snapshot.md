---
title: 源仓版本快照
doc_type: reference
module: handoff
topic: source-snapshot
status: review
created: 2026-11-04
updated: 2026-11-04
owner: self
source: human+ai
---

# 源仓版本快照

本文件固定交接基线。后续任何引用岗位内容的地方，都必须能回到本文件记录的版本。

**为什么需要这个**：AI组织变革 当前工作树不干净、无 tag。不钉版本，Sanbao 无法证明消费的是哪一版，也无法回退。

---

## 1. 仓库别名

交接包内一律使用别名，不写本机路径。

| 别名 | 角色 |
| --- | --- |
| `AI组织变革` | 53 席岗位事实源 |
| `paper_to_skills` | 方法卡技能库 |
| `Career` | 准入 / 证据层（本包来源） |
| `Sanbao` | 产品工程与运行装配 |

本地解析时把别名替换为实际仓库根目录。

---

## 2. AI组织变革 快照

### 2.1 当前状态

| 项 | 值 |
| --- | --- |
| HEAD commit | `b54ff262724bea796f98d05c7a99199dce730c75` |
| 提交时间 | 2026-11-03 01:55:54 +0800 |
| 提交说明 | `fix: 修正 6 类 8 处文档漂移并加知识图谱 CI 守卫` |
| tag | **无** |
| 工作树 | **不干净** |
| 未提交项 | `M README.md`、`?? playbook.md`、`?? tmp/` |

### 2.2 关键文件哈希

| 文件 | sha256 |
| --- | --- |
| `docs/05-agents/role-catalog.json` | `098288071d5419a9008ecedc510eb0c8b25824118d8b40c3b8d23a883ad0cc8b` |
| `docs/04-organization/management/management-catalog.json` | `ed2f2d5006b30e687df3b718744e168db868a5dd68a46f784814a0a848ee82c7` |

复算命令：

```bash
sha256sum docs/05-agents/role-catalog.json \
          docs/04-organization/management/management-catalog.json
```

### 2.3 未提交项的影响判断

| 未提交项 | 是否影响被消费文件 | 处置 |
| --- | --- | --- |
| `M README.md` | 否——README 不参与岗位内容生成 | 可提交或还原，不影响快照有效性 |
| `?? playbook.md` | 否——未跟踪，不在生成链上 | 归档或删除 |
| `?? tmp/` | 否——临时目录 | 归档或删除 |

**结论**：三个未提交项都不影响 `role-catalog.json` 与 `management-catalog.json`。但为可复现，仍在打 tag 前清理。

---

## 3. 冻结要求（C-389）

### 3.1 打 tag 前置

```
1. 决定三个未提交项的处置（提交 / 还原 / 归档）
2. 确认 role-catalog 与 management-catalog 的 sha256 不变
3. 提交
4. 打不可变 tag
5. tag 名与 commit sha 回填到本文件 §2.1
```

### 3.2 tag 命名建议

```
aiorg-handoff-20261104
```

理由：带日期，语义明确，不改现有版本号体系。

### 3.3 Sanbao 侧要求

Sanbao 快照必须 pin 该 tag / commit，且：

- 记录到 `manifest.source_snapshot.source_revision`
- 记录每个被消费文件的 sha256
- 不得消费未打 tag 的工作树

---

## 4. 被消费的文件清单

Sanbao 生成链实际读取的文件（按 `build-expert-registry.mjs` 与 `generate.mjs`）：

| 文件 | 用途 | 关键字段 |
| --- | --- | --- |
| `docs/05-agents/role-catalog.json` | 50 个 AGT 岗位事实 | `id` / `alias` / `title` / `mission` / `personality` / `principle` / `skills` / `artifact` / `metrics` / `boundary` / `group` / `flows` / `scenarios` |
| `docs/04-organization/management/management-catalog.json` | 3 个 MGT 岗位事实 | 同上 + `decision_rights` / `owned_role_ids` |
| `docs/05-agents/roles/AGT-*.md` | 岗位卡全文（进 manifest 归档） | 七节结构 |
| `docs/05-agents/roles/souls/AGT-*.soul.md` | Soul 契约 | 五节 + 灵魂原则 |
| `docs/04-organization/management/roles/MGT-*.md` | MGT 岗位卡 | — |
| `docs/04-organization/management/souls/MGT-*.soul.md` | MGT Soul | — |
| `docs/06-playbooks/PLAYBOOKS.md` | 8 个共享 Playbook | PB-001~008 |
| `docs/06-playbooks/role-playbooks/AGT-*.md` | 岗位 Playbook | 十段 |
| `dist/data/visual-identities.json` | 视觉身份索引 | 头像路径 |
| `docs/12-rollout/visual-assets/SANBAO-WEB-VIS-G4-*.json` | 53 份数字人格档案 | — |

### 4.1 一张必须记住的表

| 内容 | 权威源 | 衍生 |
| --- | --- | --- |
| 岗位身份、使命、技能名、边界 | `role-catalog.json` / `management-catalog.json` | 岗位卡、Soul、Playbook、blueprint 全部是衍生 |
| 岗位卡全文 | `roles/AGT-*.md` | — |
| Soul 原则 | `souls/AGT-*.soul.md` | — |

**冲突时的裁决顺序**：catalog 优先。若 catalog 与岗位卡不一致，以 catalog 为准，并修岗位卡。

---

## 5. 已知漂移

### 5.1 AI组织变革 内部

推演核查结论：**五处一致，53/53**。

| 对照 | 结果 |
| --- | --- |
| `role-catalog.mission` ↔ `roles/AGT-*.md` | 一致 |
| `role-catalog.mission` ↔ `souls/AGT-*.soul.md` | 一致 |
| `role-catalog.mission` ↔ `preset-blueprints.identity.mission` | 一致 |
| `management-catalog.mission` ↔ 对应三层 | 一致 |
| VIS-G4 dossier mission | 一致 |

**AI组织变革 内部没有漂移。** 漂移全部发生在 Sanbao 侧（见下）。

### 5.2 Sanbao 侧漂移（12 处）

`assets/experts/expert-registry.json` 有 12 处字段被手改：

| 席位 | 字段 | 原文 | 改写 |
| --- | --- | --- | --- |
| MGT-001 | alias | 天時 | 天时 |
| MGT-003 | title | CGOv | CGOV |
| MGT-001~003、AGT-001~005 | mission | 见 catalog | 见 registry |
| AGT-002、AGT-005 | personality | 见 catalog | 见 registry |

来源：`Sage-2.0-main` 的 UI kit 样张文案。该 UI kit 自述只有 8 条标 `visual-copy-reviewed`、45 条 mission 为 null、**不能当完整岗位使命文案**。

处置：C-384，保留为展示字段，语义字段恢复源文。详见 `03-corrections.md` C-01 与 `06-cross-repo-requests.md` CR-SB-004。

### 5.3 Sanbao 侧路径漂移

`expert-registry.json` 的 MGT `sourceRefs` 12 条全部指向 `05-agents` 路径，**该路径下没有 MGT 文件**。正确路径是 `04-organization/management/`。

---

## 6. 复算清单

任何人对快照有疑义时，跑这四条即可验证：

```bash
# 1. 确认 HEAD
cd AI组织变革 && git rev-parse HEAD
#   期望 b54ff262724bea796f98d05c7a99199dce730c75

# 2. 确认工作树
git status --short
#   期望 3 项（README.md / playbook.md / tmp/）

# 3. 确认文件哈希
sha256sum docs/05-agents/role-catalog.json
#   期望 098288071d5419a9008ecedc510eb0c8b25824118d8b40c3b8d23a883ad0cc8b

# 4. 确认无 tag
git tag
#   期望空
```

四项全对，本快照有效。

---

## 7. 快照之后的变化如何跟踪

| 场景 | 处置 |
| --- | --- |
| AI组织变革 打 tag 后 | 更新 §2.1 的 tag 与 commit，旧快照归档 |
| catalog 内容变更 | 必须升版本号，重新生成全部衍生资产 |
| 只改岗位卡不改 catalog | 视为漂移，catalog 优先 |
| Sanbao 侧改了 registry | 按 CR-SB-004 恢复，不得反向改 catalog |

---

## 8. 事实状态

| 内容 | 状态 |
| --- | --- |
| 本快照 | 有效，可用 |
| AI组织变革 tag | **未打**，是交接前的硬前置 |
| 工作树清理 | **未做** |
| Sanbao 侧 pin | 未落实 |
| 12 处手改 | 未修 |
