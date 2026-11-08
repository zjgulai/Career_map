---
title: 公开仓库卫生清理
doc_type: workflow
module: handoff
topic: public-hygiene
status: review
created: 2026-11-04
updated: 2026-11-04
owner: self
source: human+ai
---

# 公开仓库卫生清理

Career 是公开仓库。本文件列出进入公开面或交给 Sanbao 之前，必须清理的内容。

**区分两件事**：

- **交接包本身**（`deliverables/execution/sanbao-handoff-20261104/`）——已清理，0 处本机路径
- **Career 历史已跟踪文件**——仍有本机路径，属历史遗留

---

## 1. 交接包状态：已清理

| 检查项 | 结果 |
| --- | --- |
| 本机绝对路径 | ✅ 0 |
| 临时目录路径 | ✅ 0 |
| 凭据文件位置 | ✅ 0 |
| 真实业务数据 | ✅ 0 |
| 凭据值 | ✅ 0 |

**复检命令**（在交接包目录内执行）：

```bash
grep -rnE "/(Users|tmp)/|[.]dsh/config" *.md
# 期望：无输出
```

---

## 2. Career 历史已跟踪文件：20+ 个含本机路径

扫描结果：`git grep "HEAD"` 命中以下文件。

| 文件 | 类别 | 处置 |
| --- | --- | --- |
| `.codex/context-pack.md` | 决策日志 | **必须处理**——公开门面 |
| `.codex/product-responsibility-research.md` | 研究资料 | **必须处理** |
| `.codex/sources.md` | 来源台账 | **必须处理** |
| `CONTEXT.md` | 术语表 | **必须处理** |
| `deliverables/research/sanbao-sources.md` | 交付副本 | **必须处理** |
| `deliverables/canvas/sanbao-identity-boundaries.html` | 画布 | **必须处理** |
| `.superpowers/brainstorm/.../sanbao-identity-boundaries.html` | 讨论页 | **必须处理** |
| `skill-library/*.md`（8 个报告） | 能力分析 | 视发布策略 |
| `skill-library/*.json` / `*.csv`（多个） | 数据矩阵 | 视发布策略 |
| `skill-library/tools/*.py`（7 个脚本） | 工具脚本 | 视发布策略 |
| `scripts/check-ledger-consistency.py` | 检查脚本 | **保留**——检查器本身要能识别路径 |

---

## 3. 清理优先级

### P0 · 公开门面（必须清）

这 7 个文件是外部读者第一眼会看的，路径暴露直接影响可信度。

| 文件 | 清理方式 |
| --- | --- |
| `.codex/context-pack.md` | 路径替换为仓别名（`AI组织变革`、`Sanbao` 等） |
| `.codex/product-responsibility-research.md` | 同上 |
| `.codex/sources.md` | 同上 |
| `CONTEXT.md` | 同上 |
| `deliverables/research/sanbao-sources.md` | 同上（它是副本，源头改完同步） |
| `deliverables/canvas/sanbao-identity-boundaries.html` | 同上 |
| `.superpowers/brainstorm/.../sanbao-identity-boundaries.html` | 同上 |

**替换规则**：

```
本机 AI组织变革 路径      → AI组织变革
本机 Sanbao 路径          → Sanbao
本机 paper_to_skills 路径 → paper_to_skills
本机 Career 路径          → Career
临时克隆目录              → （删除该引用）
应用安装路径              → （改为「目标宿主」）
```

### P1 · 能力库（视发布策略）

`skill-library/` 下有 20+ 个文件含路径。这些是能力竞聘分析的历史产物。

| 选择 | 后果 |
| --- | --- |
| A 全部清理后保留 | 工作量大，但历史可查 |
| B 移入 `archive/` 并从公开面移除 | 干净，但失去可查性 |
| C 保持现状 | 路径继续暴露 |

**建议 B**：移入 `archive/`，README 里写清「历史能力分析归档，不含当前有效结论」。

理由：这批文件的价值是历史痕迹，不是当前依据。当前依据在 `.codex/` 和交接包里。

### P2 · 检查脚本（保留）

`scripts/check-ledger-consistency.py` 里的路径是**检查规则的一部分**（它要识别路径模式）。保留，但确认：

- 里面写的是**模式**（如用户主目录前缀判断），不是**具体路径**
- 若写死了具体路径，改为正则

---

## 4. 凭据红线

### 4.1 已发现的问题

早期产物中有一处写了宿主 DSH 配置文件的具体路径与行号，并说明含 Bearer token。**该文本已在本轮修正中删除**（见 `03-corrections.md` C-10）。

### 4.2 规则

| 禁止 | 说明 |
| --- | --- |
| 写凭据文件路径 | 只写「宿主托管」 |
| 写 token 值 | 永不 |
| 写凭据格式 | 不描述前缀、长度、结构 |
| 在示例配置里放假 token | 用 `<REDACTED>` |

### 4.3 允许写什么

```
credential_source: host_managed
credential_in_model: false
rotation_owner: <具名>
```

---

## 5. 业务数据红线

| 类型 | 处置 |
| --- | --- |
| 真实销售数据 | 不进公开面 |
| 客户名单 / 联系方式 | 不进 |
| 供应商报价 | 不进 |
| 内部经营指标 | 用脱敏示例或标 `<示例>` |
| 平台账号 ID | 不进 |

**交接包里用到的业务示例**（如 VOC 19,098 条），全部来自公开报告，且只引用了数量不引用内容。

---

## 6. 版权红线（C-385）

纸库著作权归用户，但有例外：

| 内容 | 能否公开 |
| --- | --- |
| 1,357 张卡片文本 | ✅ 可以（需 NOTICE） |
| 卡内引用的 arXiv 摘要 | ❌ 第三方 |
| 756 个 PDF | ❌ 第三方 |
| `papers/` 下 95 个 md | ❌ 第三方论文原文 |

**要求**：公开或出货前必须建 `NOTICE-paper-to-skills.md`，写明：

```
著作权人：<用户>
授权范围：1,357 张 Skill-*.md 的卡片文本
例外：卡内引用的 arXiv 摘要、PDF、图表与 papers/ 目录下的论文原文
      仍归属各自原权利人，不在本授权范围内
```

---

## 7. 表述红线

| 禁止表述 | 原因 |
| --- | --- |
| 「53 席已上岗」 | 0 实例化 |
| 「专家已运行」 | 0 挂载 |
| 「端到端已验证」 | 生效前置 0/7 |
| 「已接入数据」 | 无连接器 |
| 「技能已安装」 | `~/.dsh/skills` 不存在 |

**允许表述**：设计态、目录、候选、待验证、生效前置 X/7。

---

## 8. 执行清单

### 阶段一：交接包（已完成）

- [x] 本机路径 0 处
- [x] 凭据位置 0 处
- [x] 业务数据 0 处

### 阶段二：公开门面（P0，待做）

- [ ] 7 个文件路径替换为别名
- [ ] 复检用户主目录前缀在这 7 个文件为 0
- [ ] 画布 HTML 中的路径替换后重新验证渲染

### 阶段三：能力库（P1，待决策）

- [ ] 决定 A / B / C
- [ ] 若选 B：移入 `archive/`，更新 README

### 阶段四：检查脚本（P2）

- [ ] 确认 `check-ledger-consistency.py` 用的是模式不是具体路径
- [ ] 把交接包目录加入检查范围

---

## 9. 检查脚本扩展建议

现有 `check-ledger-consistency.py` 已检查：绝对路径、表头日期、C 编号上限。

**建议扩展**：

| 新增检查 | 判据 |
| --- | --- |
| 交接包路径卫生 | `deliverables/execution/*/` 下用户主目录前缀命中数为 0 |
| 凭据关键词 | 扫描 `token` / `secret` / `password` 后跟值的模式 |
| 状态一致性 | 文件标题的状态词必须等于 frontmatter `status` |
| 版本引用 | 引用的 commit sha 必须能被 `git cat-file -t` 解析 |

**最后一条特别重要**：C-08 发现文档引用了不存在的 commit。加这条检查能防同类错误。

---

## 10. 事实状态

| 项 | 状态 |
| --- | --- |
| 交接包 | ✅ 已清理 |
| 公开门面 7 个文件 | ❌ 未清理 |
| skill-library 20+ 文件 | ❌ 未清理，待决策 |
| 凭据位置 | ✅ 本轮已删 |
| 版权 NOTICE | ❌ 未建 |
| 检查脚本扩展 | ❌ 未做 |
