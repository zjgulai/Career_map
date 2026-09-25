---
name: "domain-modeling"
title: "领域建模"
description: "建立并打磨项目领域模型（术语/ADR/词汇表）。触发词：领域建模、domain-modeling、建立并打磨项目领域模型（术语/ADR/词汇表）。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# Domain Modeling

在设计过程中，积极构建并打磨项目的领域模型。这是一门*主动*的纪律：质疑术语、发明边缘场景，并在它们成形的当下就把术语表和决策写下来。（仅仅为了词汇而*读* `CONTEXT.md` 不算是这个技能：那是任何技能都能做到的一行习惯。这个技能是给你**改变**模型、而不只是消费模型的时候用的。）

## 文件结构

大多数仓库只有一个上下文：

```
/
├── CONTEXT.md
├── docs/
│   └── adr/
│       ├── 0001-event-sourced-orders.md
│       └── 0002-postgres-for-write-model.md
└── src/
```

如果根目录下存在 `CONTEXT-MAP.md`，这个仓库就有多个上下文。这张地图指向每个上下文所在的位置：

```
/
├── CONTEXT-MAP.md
├── docs/
│   └── adr/                          ← system-wide decisions
├── src/
│   ├── ordering/
│   │   ├── CONTEXT.md
│   │   └── docs/adr/                 ← context-specific decisions
│   └── billing/
│       ├── CONTEXT.md
│       └── docs/adr/
```

惰性创建文件：只有当你有东西要写时才创建。如果没有 `CONTEXT.md`，就在第一个术语敲定的时候创建一份。如果没有 `docs/adr/`，就在需要第一份架构决策记录（ADR）的时候创建它。

## 会话进行中

### 对照术语表质疑

当用户使用了一个与 `CONTEXT.md` 中既有语言冲突的术语时，立刻指出来。「你的术语表把『cancellation』定义为 X，但你似乎指的是 Y。到底是哪个？」

### 打磨模糊的语言

当用户使用含糊或超载的术语时，提出一个精确的规范术语。「你说的是『account』：你指的是 Customer 还是 User？那是两个不同的东西。」

### 讨论具体场景

当讨论领域关系时，用具体场景对它们做压力测试。发明能探测边缘情况、迫使用户精确界定概念之间边界的场景。

### 与代码交叉核对

当用户陈述某件事如何运作时，核对代码是否一致。如果发现矛盾，就把它摆出来：「你的代码取消的是整个 Order，但你刚说部分取消是可能的。哪个才是对的？」

### 就地更新 CONTEXT.md

术语敲定之时，就地更新 `CONTEXT.md`。不要攒着批量做：随时发生随时记。使用 [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md) 中的格式。

`CONTEXT.md` 应当完全不包含实现细节。不要把 `CONTEXT.md` 当作规格说明、草稿纸或实现决策的存放处。它是术语表，仅此而已。

### 谨慎地提议 ADR

只有当以下三条全部成立时，才提议创建 ADR：

1. **难以逆转**：日后改变主意的代价是可观的
2. **脱离上下文会令人费解**：未来的读者会疑惑「他们为什么这么做？」
3. **是一次真实权衡的结果**：确实存在其他方案，你出于具体理由选择了其中一个

三条中缺任何一条，就跳过 ADR。使用 [ADR-FORMAT.md](./ADR-FORMAT.md) 中的格式。
