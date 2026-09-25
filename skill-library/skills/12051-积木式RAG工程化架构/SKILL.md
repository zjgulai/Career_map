---
name: "p2s-modular-rag-architecture"
title: "Modular RAG — 积木式RAG工程化架构"
description: "触发词：模块化检索、可插拔架构、工作流编排、迭代提速、RAG工程化。何时不用：知识库规模小、单点检索够用时不必模块化；要做多范式选型对比时用 RAG 工具包。安全边界：无。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-Modular-RAG-Architecture"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "把单体检索系统拆成检索、重排、生成、记忆、编排五类可插拔模块，用配置组合工作流，改一处不再牵动全系统。"
user_try: "试试：把我们这个单体检索系统拆成可插拔模块，让检索器和生成器能各自独立迭代。"
whenToUse: "属于「业务工具实现」：检索系统需要频繁迭代、单点优化不想影响全链路时用；若知识库很小、单点检索够用，不必模块化；要多范式对比选型，用 RAG 工具包。"
workflow: "把单体系统拆成检索、重排、生成、记忆、编排五类模块 → 为每个模块定义统一输入输出格式与配置项 → 按配置组合工作流：顺序、分支、循环、自适应 → 独立优化单个模块，用同一评测口径验证效果 → 用配置切换工作流，缩短整体迭代周期"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Modular RAG — 积木式RAG工程化架构

## ① 解决的问题

工程团队面临RAG系统牵一发动全身难以迭代——模块化RAG将单节点迭代周期从2周→2天，年化工程效率提升60%，间接价值50万元

## ② 核心算法逻辑

核心思想：将单体RAG系统拆解为5类独立模块（Retriever/Reranker/Generator/Memory/Orchestrator），每个模块可插拔替换，通过配置文件组合支持Sequential/Branch/Loop/Adaptive多种工作流，实现"搭积木式"的RAG工程化。

## ③ 业务应用场景

- 业务问题：某跨境母婴平台知识库检索系统准确率62%，用户投诉"搜不到有机辅食的过敏信息"占客服工单35%。现有系统为单体架构，优化检索器需重新训练生成器，迭代周期长达21天，错过营销窗口。
- 数据要求：(1) 母婴知识库15万+条（婴儿推车安全、暖奶器使用、有机辅食营养、过敏症状等）；(2) 用户查询日志50万条（含点击反馈）；(3) 标注数据5000条（query-doc相关性）。
- 预期产出： - 检索准确率从62%→81%（通过Query改写模块+多路召回模块） - 生成答案准确率从74%→89%（通过独立优化Generator模块） - 系统迭代周期从21天→3天（模块独立优化） - 用户投诉率从35%→8%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：母婴跨境电商运营团队面临"知识库准确率低+系统迭代慢"的困境——通过模块化RAG将检索准确率从62%改善至81%，系统迭代周期从21天降至3天，年化收益 48-142万元（取决于应用场景规模）。
实施难度：⭐⭐⭐☆☆（需要重构现有RAG系统架构，但模块化设计降低了复杂度；中等规模团队可在4-6周内完成）
优先级：⭐⭐⭐⭐☆（高优先级，直接影响知识库系统可维护性和业务迭代速度）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（402 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Callable
from dataclasses import dataclass
from enum import Enum
import json
from datetime import datetime

# ============ 模块化RAG架构实现 ============

class WorkflowType(Enum):
    """工作流类型"""
    SEQUENTIAL = "sequential"      # 顺序执行
    BRANCH = "branch"              # 分支执行
    LOOP = "loop"                  # 循环执行
    ADAPTIVE = "adaptive"          # 自适应执行

@dataclass
class ModuleConfig:
    """模块配置"""
    name: str
    module_type: str              # retriever/reranker/generator/memory/orchestrator
    params: Dict[str, Any]
    input_format: str
    output_format: str

@dataclass
class WorkflowConfig:
    """工作流配置"""
    name: str
    workflow_type: WorkflowType
    modules: List[str]            # 模块执行顺序
    connections: Dict[str, List[str]]  # 模块间连接关系

class RAGModule:
    """基础RAG模块类"""
    def __init__(self, config: ModuleConfig):
        self.config = config
        self.name = config.name
        self.module_type = config.module_type
        self.params = config.params
        self.performance_metrics = {"calls": 0, "avg_latency": 0, "success_rate": 1.0}
    
    def execute(self, input_data: Any) -> Any:
        """执行模块"""
        raise NotImplementedError
    
    def update_params(self, new_params: Dict[str, Any]):
        """独立更新模块参数"""
        self.params.update(new_params)
        print(f"[{self.name}] 参数已更新: {new_params}")

class RetrieverModule(RAGModule):
    """检索模块 - 多路召回"""
    def __init__(self, config: ModuleConfig):
        super().__init__(config)
        # 模拟母婴知识库：婴儿推车、暖奶器、有机辅食
        self.knowledge_base = {
            "婴儿推车安全": ["GB 10810标准", "折叠机制检查", "制动系统要求"],
            "暖奶器使用": ["温度控制45-50°C", "防烫设计", "清洁方法"],
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2407.21059 — Modular RAG: Transforming RAG Systems into LEGO-like Reconfigurable Frameworks

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：待接入的知识库（卡页示例为母婴知识库 15 万+ 条）、用户查询日志（示例 50 万条，含点击反馈）与标注相关性数据（示例 5000 条 query-doc）。

**输出**：可配置的模块化检索系统：卡页示例把检索准确率从 62% 提升至 81%、生成答案准确率从 74% 提升至 89%、系统迭代周期从 21 天缩短到 3 天、用户投诉率从 35% 降至 8%。

## 执行步骤

1. 把单体系统拆成检索、重排、生成、记忆、编排五类模块
2. 为每个模块定义统一的输入输出格式与配置项
3. 按配置组合工作流：顺序、分支、循环、自适应
4. 独立优化单个模块，用同一评测口径验证效果
5. 用配置切换工作流，缩短整体迭代周期

## 边界与不做

- 数据不满足时不用：知识库规模小、没有查询日志与标注数据时，模块化收益不足以覆盖改造成本。
- 能力边界：本卡产出系统架构与工作流配置，不含知识库内容生产与在线服务的容量规划。

## 技能关联

- **前置**：Skill-Adaptive-RAG-Query-Routing.html、Skill-Adaptive-RAG-Query-Routing、Skill-Agentic-RAG-Active-Retrieval.html、Skill-Agentic-RAG-Active-Retrieval、Skill-GraphRAG-Knowledge-Enhanced-Retrieval.html、Skill-GraphRAG-Knowledge-Enhanced-Retrieval、Skill-RAG-Fusion-Multi-Query.html、Skill-RAG-Fusion-Multi-Query、Skill-Self-RAG-Reflective-Retrieval.html、Skill-Self-RAG-Reflective-Retrieval
- **延伸**：Skill-Agentic-RAG-Active-Retrieval.html、Skill-Agentic-RAG-Active-Retrieval、Skill-RAG-Fusion-Multi-Query.html、Skill-RAG-Fusion-Multi-Query、Skill-Self-RAG-Reflective-Retrieval.html、Skill-Self-RAG-Reflective-Retrieval
- **可组合**：Skill-RAG-Fusion-Multi-Query.html、Skill-RAG-Fusion-Multi-Query、Skill-Modular-RAG-Architecture

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：08-知识图谱　·　源卡：`Skill-Modular-RAG-Architecture`