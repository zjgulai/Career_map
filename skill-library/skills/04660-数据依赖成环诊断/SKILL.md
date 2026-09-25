---
name: 数据依赖成环诊断
version: 1.0.0
description: Analyze circular dependencies in DataWorks workflows. Traces node dependencies, builds dependency graph, finds cycles, validates data flow via code inspection, and provides fix recommendations.
description_zh: 分析 DataWorks 工作流中的循环依赖问题。追踪节点依赖关系、构建依赖图、找出循环链路、通过代码检查验证数据流、给出修复建议。
user-invocable: true
argument-hint: 提供怀疑成环的节点名列表，或描述成环现象
---

# 数据依赖成环诊断

分析 DataWorks 工作流中的循环依赖问题，定位成环链路并给出修复方案。

## 触发方式

- "帮我分析一下为什么成环了"
- "这些节点成环了"
- "补数据跑不动，是不是成环了"
- "调度报循环依赖错误"

## 诊断方法论

### Step 1: 收集节点信息

用户提供怀疑成环的节点名列表后，逐个查询节点基本信息：

```bash
python3 <dataworks-skill>/modules/discovery/scripts/identify.py "节点名" --project-id <pid>
python3 <dataworks-skill>/modules/task-ops/scripts/task_detail.py --node-id <nodeId> --project-id <pid>
```

收集每个节点的：
- nodeId / entityId
- 节点类型
- 负责人
- 调度配置

### Step 2: 提取上下游依赖

从 `task_detail.py` 的输出中提取每个节点的：
- **上游依赖**：该节点声明依赖了哪些节点
- **下游依赖**：哪些节点声明依赖了该节点

构建节点间的依赖关系矩阵：

```
| 节点 | 上游（声明依赖了谁） | 下游（谁依赖了它） |
|------|---------------------|-------------------|
| A    | B, C                | D, E              |
| B    | D, E                | A, C              |
| ...  | ...                 | ...               |
```

### Step 3: 寻找循环链路

基于依赖关系矩阵，使用图算法找出所有循环链路：

1. **直接互依赖**：A 依赖 B，且 B 依赖 A
2. **三节点环**：A -> B -> C -> A
3. **多节点环**：更长的循环依赖链

标注每个循环链路的类型：
- **直接互锁**：两个节点互相依赖
- **间接循环**：通过中间节点形成的循环

### Step 4: 验证数据流

**关键步骤**：循环依赖不一定都是错误的，需要验证依赖是否有真实的数据流支撑。

对每个可疑依赖，查看节点代码确认：

```bash
python3 <dataworks-skill>/modules/node-management/scripts/find_node_code.py --project-id <pid> --task-id <taskId> --runtime
```

分析：
- 该节点实际读取了哪些表？
- 这些表是由上游节点产出的吗？
- 如果节点代码中没有读取上游节点的产出表，则该依赖是**多余的**

### Step 5: 根因分析

基于数据流验证结果，分析成环的根因：

| 根因类型 | 特征 | 典型案例 |
|---------|------|----------|
| **复制粘贴错误** | 新节点复制了其他节点的依赖配置，忘记删除不适用项 | 新创建的 JVS 节点继承了不该有的上游 |
| **业务理解偏差** | 对数据处理顺序理解错误，配置了反向依赖 | D（起点）错误依赖了 A（终点） |
| **虚拟节点滥用** | 虚拟节点作为汇总点被过多节点依赖 | 多个节点都依赖了汇总虚拟节点 |
| **历史遗留** | 旧依赖未清理，随着链路扩展形成循环 | 早期临时依赖未删除 |

### Step 6: 给出修复建议

针对每个多余的依赖，给出明确的删除建议：

```markdown
## 需要删除的多余依赖

| 节点 | 多余的上游 | 原因 |
|------|-----------|------|
| D    | A         | D 不读取 A 的任何产出表 |
| D    | C         | D 不读取 C 的任何产出表 |
| B    | E         | B 不读取 E 的任何产出表 |

## 修复后的依赖链路

D -> B -> C -> A -> E

## 操作步骤

1. 在 DataWorks 开发界面，逐个删除上述多余依赖
2. 重新发布受影响的节点
3. 重新发起补数据验证
```

## 验证修复

用户修改依赖后，重新检测：

```bash
python3 <dataworks-skill>/modules/task-ops/scripts/task_detail.py --node-id <nodeId> --project-id <pid>
```

确认：
1. 多余的依赖已删除
2. 必要的依赖仍然保留
3. 拓扑排序通过（无回边）

## 输出格式

```markdown
## 涉及节点

- A = {节点名} ({nodeId})
- B = {节点名} ({nodeId})
- ...

## 依赖关系矩阵

| 节点 | 声明的上游 |
|------|-----------|
| A    | B, C      |
| B    | D, E      |
| ...  | ...       |

## 发现的循环链路

**环1（直接互依赖）**: C <-> D
- C 声明依赖 D
- D 声明依赖 C

**环2（三节点环）**: D -> A -> B -> D
- D 依赖 A
- A 依赖 B
- B 依赖 D

## 数据流验证

| 依赖 | 是否有数据依据 | 分析 |
|------|--------------|------|
| B->D | 有 | B 读取 D 产出的 `xxx_di` |
| D->A | **无** | D 完全不读 A 的产出表 |
| ...  | ...        | ... |

## 根因分析

{成环的根因}

## 修复建议

### 需要删除的依赖
- D 去掉对 A 的依赖
- D 去掉对 C 的依赖
- ...

### 修复后的 DAG
```
D -> B -> C -> A -> E
```

## 验证步骤

1. 在 DataWorks 删除多余依赖
2. 重新发布节点
3. 重新检测确认无环
```

## 与外部 Skill 的协作

- **dataworks**：查节点信息、上下游依赖、节点代码
- **dataworks-datastudio**：修改节点依赖、发布节点
