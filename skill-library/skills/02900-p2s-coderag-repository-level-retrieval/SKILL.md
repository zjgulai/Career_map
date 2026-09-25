---
name: "p2s-coderag-repository-level-retrieval"
title: "Skill-CodeRAG-Repository-Level-Retrieval"
description: "触发词：代码库检索、跨文件复用、技能模板组合、报错代码修复、函数级索引。何时不用：代码库未按目录与命名整理、或代码块无法解析时不适用；自然语言到代码的语义召回走代码语义嵌入。安全边界：只做检索与组合，生成的脚本须人工验证后才可使用，检索结果须标注来源技能与版本。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 技能版本"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-CodeRAG-Repository-Level-Retrieval"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "在成百上千个技能代码模板里按需求跨文件检索可复用的片段，拼出能直接用的脚本。"
user_try: "试试：我需要写一个结合A/B测试和时间序列预测的库存优化脚本，帮我从技能库里检索可复用的代码片段。"
whenToUse: "当代码模板分散在多个目录、需要按需求跨文件检索与组合时用本卡；需要按语义相似度而非关键词召回用代码语义嵌入；需要按复杂度决定检索次数用自适应查询路由。"
workflow: "扫描代码库目录提取技能文档中的代码块 → 建立函数名到代码块的索引 → 解析用户需求定位相关领域与技能 → 跨文件检索可组合的代码片段 → 组装片段生成脚本并标注来源"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-CodeRAG-Repository-Level-Retrieval

## ① 解决的问题

开发者面临"1200个Skill代码模板无法语义检索只能手动翻找"——CodeRAG(EMNLP2025)将Skill代码复用率从10%提升至65%，每次代码开发节省2-4小时，年化节省开发成本30万元

## ② 核心算法逻辑

代码RAG在软件仓库级别做检索增强代码补全，核心解决"跨文件上下文"问题——函数调用另一个文件的类方法时，LLM需要检索相关代码。

## ③ 业务应用场景

场景1：Skill代码模板智能检索 用户："我需要写一个结合A/B测试和时间序列预测的库存优化脚本"
CodeRAG检索： - 检索02-A/B实验域：`Skill-AB-Test-Sequential-Analysis.md`代码片段 - 检索04-供应链域：`Skill-Safety-Stock-Replenishment.md`代码 - 检索03-时间序列域：`Skill-Demand-Quantile-Forecast.md`代码 → 组合三个模板生成完整脚本，节省4小时
**场景2：错误代码智能修复** 运营反馈代码报错 → CodeRAG找同类Skill的正确实现 → 对比差异修复

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

Skill代码复用率：无检索约10% → CodeRAG约65%
开发效率：每次代码开发节省2-4小时
paper2skills 1200+代码模板的激活价值：从静态库 → 智能检索
Agent调用代码能力提升：从写死 → 动态检索组装

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（266 行）。**下面 43 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **43 行，未到上限**（可能即为源站发布的全部）。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 43 行：unterminated string literal (detected at line 43)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：4」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
CodeRAG: 代码仓库级检索增强
用于Skill代码模板的智能检索和复用
"""
import os
import re
import ast
from typing import List, Dict, Tuple, Optional
import hashlib

class SkillCodeIndex:
    """
    Skill代码模板索引
    从paper2skills的Markdown文件中提取代码块
    """
    
    def __init__(self, vault_path: str):
        self.vault_path = vault_path
        self.code_chunks: List[Dict] = []
        self.function_index: Dict[str, List[Dict]] = {}  # 函数名 -> 代码块列表
    
    def index_vault(self) -> Dict:
        """扫描Vault，提取所有代码块"""
        total_skills = 0
        total_functions = 0
        
        for domain_dir in os.listdir(self.vault_path):
            full_dir = os.path.join(self.vault_path, domain_dir)
            if not os.path.isdir(full_dir):
                continue
            
            for fname in os.listdir(full_dir):
                if not fname.endswith(".md") or not fname.startswith("Skill-"):
                    continue
                
                fpath = os.path.join(full_dir, fname)
                skill_id = fname.replace(".md", "")
                
                with open(fpath, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # 提取Python代码块
                code_blocks = re.findall(r'
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：按领域目录与技能文件命名整理的代码库（如以技能命名的 Markdown 文档，内含 Python 代码块），以及用户的自然语言需求描述或报错信息。

**输出**：按需求召回的相关代码块及其来源技能标识、跨文件组合后的完整脚本，以及报错场景下与同类正确实现的差异对比，供开发者直接复用或修复。

## 执行步骤

1. 扫描代码库目录并提取技能文档中的代码块
2. 建立函数名到代码块的索引
3. 解析用户需求，定位相关领域与候选技能
4. 跨文件检索可组合的代码片段
5. 组装片段生成完整脚本并标注来源
6. 对报错代码检索同类正确实现并对比差异

## 边界与不做

- 何时不用：代码库未按目录与命名规范整理、或代码块无法解析时不适用；自然语言到代码的语义召回应改用代码语义嵌入。
- 能力边界：只做检索与组合，不保证生成的脚本可直接运行，须人工验证；代码来源与版本必须可追溯。
- 版本边界：索引与技能版本绑定，代码模板更新后须重建索引否则召回结果过期。

## 技能关联

- **可组合**：Skill-CodeRAG-Repository-Level-Retrieval

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：08-知识图谱　·　源卡：`Skill-CodeRAG-Repository-Level-Retrieval`