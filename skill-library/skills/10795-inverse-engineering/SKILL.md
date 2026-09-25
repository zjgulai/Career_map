---
name: inverse-engineering
description: 通用逆向工程 Skill。给定任意输入（HTML报告、Skill文件、GitHub仓库、PDF文档、代码快照），AI 按对应的 SOP（A/B/C）自动逆向出：口径缺陷清单、方法论框架、假设链、可复现系统架构、质量门定义，并在 session 结束时自动生成经验复盘文档存入 docs/reverse_engineering/experience_log/。触发场景：「逆向这个」「从这个报告/仓库/skill 中学习」「这类报告怎么自动化」「复制这个系统的能力」「分析这个仓库」「帮我改造这个工作流」。不适用于：普通问答、代码调试、功能实现（这些不需要逆向工程）。
---

# Inverse Engineering Skill

## 核心意图

给定任意「输出物」（报告/Skill/仓库），自动逆向出「产出该输出物所需的系统/能力/方法论」，并将经验沉淀为可复用的文档。

**关键区分**：逆向工程不是「理解这个东西是什么」，而是「理解要复制这个东西的能力需要什么」。

---

## 第一步：识别 InputKind

在执行任何分析之前，先确定输入类型：

| 输入特征 | InputKind | 使用 SOP |
|---------|-----------|---------|
| HTML/PDF/Markdown 分析报告 | `html_report` / `pdf_document` | SOP-A |
| SKILL.md / prompt 文件 / 工作流描述 | `skill_file` | SOP-B |
| GitHub URL / 代码库路径 | `github_repo` / `codebase_snap` | SOP-C |

```python
from app.reverse.contracts import InputKind, ReverseEngineeringInput
# 在系统中触发逆向任务的标准方式
reverse_input = ReverseEngineeringInput(
    kind=InputKind.HTML_REPORT,  # 根据上表选择
    raw_content="...",
    title="输入标题",
    extraction_hints=("重点看渠道策略",),  # 可选
)
```

---

## 第二步：路由到对应 SOP

| SOP | 文档路径 | 核心产出 |
|-----|---------|---------|
| SOP-A（报告逆向）| `docs/reverse_engineering/sop/SOP-A-report-reverse.md` | 口径清单 + 系统架构设计 |
| SOP-B（Skill 逆向）| `docs/reverse_engineering/sop/SOP-B-skill-reverse.md` | 决策树 + 新 SKILL.md |
| SOP-C（Repo 逆向）| `docs/reverse_engineering/sop/SOP-C-repo-reverse.md` | 架构摘要 + 可复用组件清单 |

**执行前必读对应 SOP 文档的「执行前检查清单」**。

---

## 第三步：执行 SOP

按 SOP 文档逐 Phase 执行。每个 Phase 结束必须产出对应格式的输出（JSON / YAML / Mermaid）。

**不要跳过任何 Phase**。特别是 SOP-A 的 Phase 1（口径扫描）和 SOP-C 的 Phase 5（反模式识别），这两个是最容易被跳过但价值最高的 Phase。

---

## 第四步：Session 结束时触发经验萃取

**每次逆向 session 结束时，必须执行此步骤**：

### 方式一：AI 自动生成（推荐）

回答以下 6 个问题，然后写入 `docs/reverse_engineering/experience_log/YYYY-MM-DD-{sop_id}-{title}.md`：

1. **输入类型与核心方法论**：InputKind + 识别出的分析框架
2. **最重要的口径/缺陷发现**：最多5条，calibration_issues 格式
3. **最耗时的决策点**：3个，含「如果重来」的做法
4. **如果重来会不同的地方**：更早做/更晚做/根本不做
5. **产出的可迁移设计模式**：命名 + 适用场景 + 核心步骤
6. **给下次同类逆向的3条建议**：含「为什么重要」

参考格式：`docs/reverse_engineering/experience_log/2026-07-29-gtm-report-reverse-experience.md`

### 方式二：命令行（手动）

```bash
rtk .venv/bin/python -m app.reverse.experience \
  --sop sop_a \
  --input-title "输入标题" \
  --input-kind html_report
```

---

## 检索历史经验

下次逆向开始前，先检索历史经验：

```bash
# 查看所有历史经验日志
ls docs/reverse_engineering/experience_log/

# 在经验日志中搜索相关内容
grep -r "口径冲突" docs/reverse_engineering/experience_log/
grep -r "Wire Contract" docs/reverse_engineering/experience_log/
```

或者在 AI session 中：「检索逆向工程经验日志中关于 [主题] 的建议」

---

## 已知的全局陷阱（所有 SOP 通用）

来自 `docs/reverse_engineering/experience_log/2026-07-29-gtm-report-reverse-experience.md` 的经验提炼：

1. **Wire Contract 先行**：任何系统的 `Input/Output` 合约必须在第一个 Phase 就锁定，晚锁定意味着后期大量重写
2. **对抗测试驱动实现**：先写「系统可能被怎么欺骗」的测试，再实现防御，而不是先实现再找漏洞
3. **口径扫描是最高优先级**：数字陷阱是隐性的，不主动扫描就会在 50% 实现后才发现
4. **Runtime 层不超过 30%**：基础设施代码（状态机/队列/恢复）超过 30% 意味着过度工程
5. **每个 Phase 产出必须是 JSON/YAML/Mermaid**：自由文本输出无法被后续步骤机器处理

---

## 与其他 Skill 的关系

- **依赖**：`codebase-memory`（SOP-C 使用 codegraph）、`anysearch`（获取外部信息）
- **被依赖**：此 Skill 完成后，产出物供 `write-a-skill`、`system-design` 等 Skill 使用
- **互补**：`understand` Skill 做代码理解，本 Skill 做逆向工程（理解 → 复制能力）

---

## 质量门（每次逆向结束时检查）

- [ ] 对应 SOP 的所有 Phase 已完成，每个 Phase 有格式化输出
- [ ] 经验复盘文档已写入 `docs/reverse_engineering/experience_log/`
- [ ] 至少识别了 3 个「可迁移设计模式」并命名
- [ ] 至少识别了 3 个「已知陷阱」
- [ ] 产出的系统设计/SKILL.md/架构摘要已写入 `docs/reverse_engineering/` 对应子目录
