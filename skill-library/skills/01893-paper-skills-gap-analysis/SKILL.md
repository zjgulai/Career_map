---
name: paper-skills-gap-analysis
description: >
  系统性分析 paper2skills 知识图谱的覆盖缺口，输出带优先级的新增选题候选清单。
  用于「围绕 skills graph 找选题」「图谱缺口分析」「推荐下一批萃取方向」「Sprint 选题规划」等场景。
  本 skill 是 paper-skills-graph 的深度执行配套，负责把图谱数据转化为可执行的选题行动列表。
triggers:
  - "围绕 skills graph 看看可以增加什么"
  - "skills graph 缺口"
  - "推荐新选题方向"
  - "下一批萃取什么"
  - "Sprint 选题规划"
  - "图谱分析"
  - "知识缺口"
version: 1.0.0
created: 2026-05-25
source_sessions:
  - ses_1b22f385effe2dJmVzvm2fPycP  # 2026-05-22 专题分析，产出 ~45 个候选
---

# paper-skills-gap-analysis

paper2skills 知识图谱缺口分析与选题推荐 Skill。

## 触发场景

- 每次新增 4+ 个 Skill 后需要重新分析图谱
- 规划下一个 Sprint 的萃取主题时
- 用户询问「图谱里还缺什么」
- 业务需求发生变化，需要对齐图谱优先级

---

## 执行流程（4 步，全部串行）

### Step 1: 读取当前图谱状态

```bash
# 优先读缓存报告（避免重复计算）
cat /Users/lute/project/paper_to_skills/skills_graph_report.md | head -100

# 如果报告超过 2 周，重新生成
cd /Users/lute/project/paper_to_skills/paper2skills-skills/paper-skills-graph
python scripts/skills_graph_analyzer.py --vault /Users/lute/project/paper_to_skills/paper2skills-vault
```

**从报告中提取关键指标：**
- 节点总数、边总数
- HIGH 缺口数（P0 阻塞）
- MEDIUM 缺口数（结构性问题：孤立节点 + 跨域断层）
- 各领域 Skill 数量分布（识别薄领域）

### Step 2: 多维缺口分析

**2A. 薄领域扫描（数量维度）**

统计各领域当前 Skill 数，识别数量 < 5 的薄领域：

```bash
for domain in /Users/lute/project/paper_to_skills/paper2skills-vault/*/; do
  count=$(ls "$domain"Skill-*.md 2>/dev/null | wc -l | tr -d ' ')
  name=$(basename "$domain")
  echo "$count $name"
done | sort -n
```

薄领域标准：当前 Skill 数 < 5 = 急需建设；5-8 = 需要补强。

**2B. 孤立节点扫描（关联维度）**

从图谱报告中提取孤立 Skill（无任何 prerequisite/extends/combinable 边）。
孤立 = 内容可能正确，但图谱价值为零；优先补关联，不急于新增。

**2C. 跨域断层扫描（桥梁维度）**

高价值跨域组合（历史验证有效的桥梁方向）：
- `causal_inference ↔ advertising` — 因果归因
- `time_series ↔ supply_chain` — 预测补货
- `mas ↔ llm_agent_engineering` — 算法→工程
- `knowledge_graph ↔ advertising` — 受众图谱
- `advertising ↔ user_analytics` — 广告→用户行为闭环

**2D. 路线图对照**

读取现有 Sprint 候选，避免重复推荐：

```bash
cat /Users/lute/project/paper_to_skills/paper2skills-skills/paper-skills-graph/skills_graph_report.md | grep -A 50 "Sprint"
```

### Step 3: 生成候选清单

按 **P0/P1/P2** 三档输出，格式固定：

```markdown
## P0 — 立即启动（HIGH 缺口 / 薄领域基础建设）

| Skill 候选名 | 领域 | 填补类型 | 业务锚点 | 论文搜索关键词 |
|---|---|---|---|---|
| Model Evaluation (ROC/AUC) | 12-ML基础 | 薄领域 | 所有预测模型质量门控 | `model evaluation ROC AUC calibration 2024` |

## P1 — 本月内（新业务领域 / 关键桥梁）

（同格式）

## P2 — 下个迭代（精补 / 孤立节点关联）

（同格式）

## 图谱修复（非新增 Skill，补充已有 Skill 的关联边）

| 孤立 Skill | 应关联到 | 边类型 |
|---|---|---|
| Skill-HGNN-Cross-Device | Skill-Ad-Attribution | extends |
```

### Step 4: 与路线图整合输出

将候选清单追加到路线图文件（不覆盖，追加 + 日期标记）：

```bash
cat >> /Users/lute/project/paper_to_skills/00-项目规划/next-papers-roadmap.md << EOF

---
## 缺口分析更新 — $(date +%Y-%m-%d)

（粘贴 Step 3 的 P0/P1/P2 清单）
EOF
```

---

## 输出规范

**必须输出的内容：**

1. **图谱快照**（3 行）：节点数 / 边数 / HIGH 缺口数 / MEDIUM 缺口数
2. **薄领域热力表**：所有领域 + Skill 数量，标注 < 5 的
3. **P0/P1/P2 候选清单**：带论文搜索关键词的完整表格
4. **图谱修复清单**：孤立节点应补充的关联边

**不需要输出的内容：**
- 已存在的 Sprint 候选的重复推荐
- 超出业务范围的纯学术方向
- 没有论文搜索关键词的候选（不可操作）

---

## 与其他 Skill 的协作关系

```
paper-skills-gap-analysis（本 Skill）
    ↓ 输出候选清单
paper-选题（验证具体论文可得性，arXiv 搜索）
    ↓ 输出可萃取论文列表
paper-萃取（执行萃取 + 生成 Skill 卡片）
    ↓ 完成后
paper-skills-gap-analysis（重新分析，验证缺口填补）
```

---

## 注意事项

- 每次分析前先检查 `skills_graph_report.md` 的生成日期，超过 2 周则重新生成
- 孤立节点优先补关联，不急于新增内容（图谱修复比新增更高效）
- 薄领域基础 Skill（如 ML基础）要优先做，否则高层 Skill 的前置依赖全是断链
- 保留「不推荐」决策的理由（避免下次重复讨论）

---

## 历史执行记录

| 日期 | 会话 | 图谱状态 | 主要产出 |
|------|------|---------|---------|
| 2026-05-22 | ses_1b22f385ef | 150 节点 / 758 边 / 0 HIGH / 105 MEDIUM | P0:6, P1:12, P2:8, 新领域 3 个 |
| 2026-04-28 | session-summary-2026-04-28 | 57 节点 / ~200 边 | 19 个 P0 缺口，建立 Sprint 计划 |
