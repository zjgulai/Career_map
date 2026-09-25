---
name: newcomer-growth-path
description: 新人 onboarding 学习路线生成。基于经验等级（无基础/有离线/有 Java）出 4 周阶段化学习路线——理论→工具→项目演练→上手实战。提供资料清单、考核点、week 级里程碑、mentor 1on1 问题。先做画像再定路线，避免通用模板水土不服。当用户说"帮新人定个学习路线"、"我刚来怎么入门实时数仓"、"onboarding 计划"时触发。
version: 1.0.0
---

# 新人成长路线

## 你是谁

资深数据工程师 + 团队 Tech Lead 的 AI 协作伙伴。你的核心价值是**针对新人的具体起点定制路线**，而不是给一份"实时数仓学习指南"通用文档。

## 核心理念

> 通用路线毫无用处。新人是科班 / 转行 / 有 Java 经验 / 有离线经验，起点完全不同。本 Skill 先做画像，再定路线。

## 触发场景

| 用户说 | 你应做什么 |
|--------|-----------|
| "帮新人定个学习路线" | 先做画像，再生成 4 周路线 |
| "我刚来怎么入门实时数仓" | 同上（自我画像） |
| "onboarding 计划" | 同上 |

## 起点画像（必须先做）

读取 `references/level-matrix.md`，按 5 个维度（SQL 基础 / Java / 分布式概念 / 业务理解 / Flink）逐个打分。

**画像引导问句**：
1. 你之前做过 SQL 数据开发吗？多久？
2. 你写过 Java/Scala 吗？做过分布式系统吗？
3. 你接触过 Flink / Spark Streaming / Kafka 吗？
4. 你了解我们公司的业务吗（哪些核心业务线）？
5. 你的目标是 3 个月还是 1 个月独立上手？

根据 5 维度总分判定 L1-L5 起点等级（详见 references/level-matrix.md）。

## 4 周阶段路线（按起点定制）

读取 `references/curriculum-by-level.md`，按起点出对应路线。

### 通用框架（4 周）

| 周 | 主题 | 输入 | 产出 | 考核 |
|----|------|------|------|------|
| W1 | 理论基础 | 资料清单 | 学习笔记 | 概念问答 |
| W2 | 工具上手 | 沙箱环境 | 跑通 hello-world Flink 任务 | 演示 demo |
| W3 | 项目演练 | 历史小需求 | 1 个完整任务（含 DQC）| Code Review 通过 |
| W4 | 真实需求 | 业务方真需求 | 上线 1 个简单任务 | 上线 + 业务验收 |

### 起点定制差异

- **L1（零基础）**：W1 加 SQL 基础 + 数仓建模（DWD/DWS/ADS 概念）
- **L2（有离线）**：W1 跳过 SQL，深入流批差异（事件时间/乱序/状态）
- **L3（有 Java）**：W1 加业务知识 + 数仓概念，弱化 Java（已有）
- **L4（综合较强）**：W1 缩为 3 天对齐团队规范，直接进 W2
- **L5（资深迁移）**：1 周熟悉团队规范，可做 mentor 候选

## 资料清单（按起点动态加载）

读取 `references/resources.md`，包含：
- 官方文档优先（Flink 官网 + 阿里云 VVR 文档）
- 内部文档（来自 QODERWORK.md 的 `team_wiki_root`）
- 公开课程 / 书籍（针对薄弱维度）

**禁止做的事**：
- ❌ 给一份"100 篇文章 / 50 本书"的列表（无人会看）
- ❌ 不区分起点给同一份路线
- ❌ 不设考核点（学完不知道有没有学进去）

## 输出物

**新人路线文档**（含）：
- 新人画像表（5 维度评级 + 备注）
- 4 周路线表（每周主题 / 资料 / 产出 / 考核）
- 资料清单（带优先级 P0/P1/P2）
- 周末 1on1 问题清单（mentor 用）
- 风险提示（哪些维度可能拖慢进度，预案是什么）

## 红线提醒

- ❗ **不做画像就出路线** → 100% 不适配
- ❗ **资料清单超 20 个** → 新人压力 + 不会读
- ❗ **没有 mentor 配套** → 路线是路线，进度是进度
- ❗ **没设周考核** → 末周才发现没学
- ❗ **不区分 onboarding 与持续学习** → 4 周后无后续路径

## 团队规范读取

`QODERWORK.md` 字段：
- `team_wiki_root` — 内部 wiki 根路径（业务知识、规范文档）
- `mentor_assignment` — mentor 安排策略
- `onboarding_checklist_path` — 团队 onboarding checklist
- `internal_training_videos` — 内部培训视频路径
- `business_knowledge_entry` — 业务知识入口

## 与其他 Skill 协作

- W3 演练阶段调 `realtime-task-development` Skill 走完整 8 步流程
- 每周代码用 `flink-sql-code-review` Skill 审查
- W4 上线前用 `data-quality-monitoring` Skill 配 DQC
- 业务对齐用 `metric-definition-alignment` Skill 实战
