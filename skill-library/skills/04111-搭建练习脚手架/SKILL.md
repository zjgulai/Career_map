---
name: "scaffold-exercises"
title: "练习脚手架"
description: "脚手架练习题（workshop 用）。触发词：练习脚手架、scaffold-exercises、脚手架练习题（workshop 用）。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# 搭建练习脚手架

创建能通过 `pnpm ai-hero-cli internal lint` 的练习目录结构，然后用 `git commit` 提交。

## 目录命名

- **章节（Sections）**：位于 `exercises/` 内的 `XX-章节名/`（例如 `01-retrieval-skill-building`）
- **练习（Exercises）**：位于章节内的 `XX.YY-练习名/`（例如 `01.03-retrieval-with-bm25`）
- 章节编号 = `XX`，练习编号 = `XX.YY`
- 名称使用 dash-case（全小写、连字符）

## 练习变体

每个练习至少需要以下子文件夹之一：

- `problem/`——带 TODO 的学生工作区
- `solution/`——参考实现
- `explainer/`——概念性材料，不含 TODO

生成骨架（stub）时，除非计划另有指定，默认使用 `explainer/`。

## 必需文件

每个子文件夹（`problem/`、`solution/`、`explainer/`）都需要一个 `readme.md`，要求：

- **不为空**（必须有真实内容，哪怕只有一行标题也行）
- 没有坏链接

生成骨架时，创建一个包含标题和描述的最小 readme：

```md
# Exercise Title

Description here
```

如果子文件夹里有代码，还需要一个 `main.ts`（多于 1 行）。但对骨架来说，只有 readme 的练习也可以。

## 工作流程

1. **解析计划**——提取章节名、练习名和变体类型
2. **创建目录**——对每个路径执行 `mkdir -p`
3. **创建骨架 readme**——每个变体文件夹一个带标题的 `readme.md`
4. **运行 lint**——用 `pnpm ai-hero-cli internal lint` 验证
5. **修复错误**——反复修改直到 lint 通过

## Lint 规则摘要

linter（`pnpm ai-hero-cli internal lint`）会检查：

- 每个练习都有子文件夹（`problem/`、`solution/`、`explainer/`）
- `problem/`、`explainer/`、`explainer.1/` 中至少有一个存在
- 主子文件夹中的 `readme.md` 存在且不为空
- 没有 `.gitkeep` 文件
- 没有 `speaker-notes.md` 文件
- readme 中没有坏链接
- readme 中没有 `pnpm run exercise` 命令
- 每个子文件夹都需要 `main.ts`，除非它只有 readme

## 移动/重命名练习

重新编号或移动练习时：

1. 用 `git mv`（而不是 `mv`）重命名目录——这样可以保留 git 历史
2. 更新数字前缀以保持顺序
3. 移动后重新运行 lint

示例：

```bash
git mv exercises/01-retrieval/01.03-embeddings exercises/01-retrieval/01.04-embeddings
```

## 示例：根据计划生成骨架

给定如下计划：

```
Section 05: Memory Skill Building
- 05.01 Introduction to Memory
- 05.02 Short-term Memory (explainer + problem + solution)
- 05.03 Long-term Memory
```

创建：

```bash
mkdir -p exercises/05-memory-skill-building/05.01-introduction-to-memory/explainer
mkdir -p exercises/05-memory-skill-building/05.02-short-term-memory/{explainer,problem,solution}
mkdir -p exercises/05-memory-skill-building/05.03-long-term-memory/explainer
```

然后创建 readme 骨架：

```
exercises/05-memory-skill-building/05.01-introduction-to-memory/explainer/readme.md -> "# Introduction to Memory"
exercises/05-memory-skill-building/05.02-short-term-memory/explainer/readme.md -> "# Short-term Memory"
exercises/05-memory-skill-building/05.02-short-term-memory/problem/readme.md -> "# Short-term Memory"
exercises/05-memory-skill-building/05.02-short-term-memory/solution/readme.md -> "# Short-term Memory"
exercises/05-memory-skill-building/05.03-long-term-memory/explainer/readme.md -> "# Long-term Memory"
```
