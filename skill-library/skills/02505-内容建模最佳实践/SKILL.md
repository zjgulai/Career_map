---
name: "content-modeling-best-practices"
title: "内容建模最佳实践"
description: "设计 headless CMS 的结构化内容模型：内容与呈现分离、引用与嵌入取舍、复用模式与分类体系。触发词：内容建模最佳实践、content-modeling-best-practices、设计 headless CMS 的结构化内容模型：内容与呈现分离、引用与嵌入取舍、复用模式与分类体系。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# 内容建模最佳实践

设计灵活、可复用、可维护的结构化内容的原则。这些概念适用于任何 headless CMS，但包含 Sanity 特有的实现说明。

## 何时适用

在以下情形参考这些指引：
- 启动新项目并设计内容模型
- 评估内容应当结构化还是自由形式
- 在引用与嵌入内容之间做选择
- 为多渠道内容分发做规划
- 重构既有内容结构

## 核心原则

1. **内容是数据，不是页面** —— 按含义来组织内容，不按呈现来组织
2. **唯一事实源** —— 避免内容重复
3. **面向未来** —— 为尚不存在的渠道而设计
4. **以编辑为中心** —— 为创建内容的人做优化

## 参考文档

从与你眼前这个建模决策相匹配的那一篇参考开始，不要一次加载所有主题。具体主题的详细指引见 `references/`：
- `references/separation-of-concerns.md` —— 把内容与呈现分离
- `references/reference-vs-embedding.md` —— 何时用引用、何时用嵌入对象
- `references/content-reuse.md` —— 内容复用模式与复用光谱
- `references/taxonomy-classification.md` —— 扁平、层级与分面分类
