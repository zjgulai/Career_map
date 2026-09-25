---
name: "p2s-step-back-prompting"
title: "Step-Back Prompting — 抽象推理提升复杂问题准确率"
description: "触发词：抽象推理、原则提炼、两阶段推理、复杂决策、可解释方案。何时不用：要按指标链自动生成归因报告用「多步推理 BI 归因」；要把成本变化做因果分解用「供应链成本因果归因」。安全边界：提炼的原则需业务与合规复核后方可执行；定价类结论不得违反反垄断与价格歧视法规。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-016"
l3_business: "经济性分析"
l3_all: "经济性分析 / 经营预算"
l1_l2_l3: "经营管理/财务与合规/经济性分析"
p2s_card_id: "Skill-Step-Back-Prompting"
p2s_src_domain: "09-DataAgent-LLM"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "先让模型后退一步总结出高层原则，再按原则推导具体方案，让复杂经营决策更准也更可解释。"
user_try: "试试：先提炼促销定价的三条原则，再据此给暖奶器、推车和辅食制定一致的折扣方案。"
whenToUse: "需要先用抽象原则统一决策逻辑再落到具体方案（如定价、异常诊断）时用本技能；指标链自动报告用「多步推理 BI 归因」；成本因果分解用「供应链成本因果归因」。"
workflow: "整理具体问题的上下文数据，含成本、历史销量、竞品价、库存与目标利润率 → 第一阶段提炼 3 到 5 条高层原则 → 第二阶段按原则逐条推导具体方案并校验约束 → 输出方案与原则依据，便于复核与审计"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Step-Back Prompting — 抽象推理提升复杂问题准确率

## ① 解决的问题

运营分析师面临复杂业务决策LLM推理错误率高——Step-Back抽象推理将复杂问题准确率提升11%，决策失误率-35%，年化避免损失45万元

## ② 核心算法逻辑

核心思想：通过「后退一步」的抽象推理，先从具体问题中提炼高层原则/规律，再基于原则回答具体问题，相比直接ChainofThought提升推理准确率711%。

## ③ 业务应用场景

场景A：复杂促销定价策略逐层推导 - 业务问题：运营师面对618大促，需在3小时内为暖奶器、婴儿推车、有机辅食三类产品制定差异化折扣策略。直接定价导致折扣不一致（A类打6折，B类打5折，C类打7折），转化率仅提升8%，毛利下降12%。 - 数据要求：产品成本结构、历史销量、竞品价格、库存水位、目标利润率、客户购买力分布 - 预期产出：基于「促销定价三原则」（成本保护、竞争力维持、库存清理优先级）生成的分层定价方案，确保折扣逻辑一致且可解释 - 业务价值：年化168万元（相比直接定价，转化率提升18%，毛利损失降低至6%）
三轨验证 | 成本轨：月均调用LLM成本约800元（含API调用+人工审核），ROI周期3个月 | 合规轨：定价方案需符合各国反垄断法（EU、UK禁止价格歧视），Step-Back推理生成的原则文档可作为合规证据 | 风险轨：若原则提炼不当（概率15%），可能导致定价偏离市场（风险等级中）
场景B：供应链异常根因抽象分析 - 业务问题：婴儿推车从中国供应商的交付周期突然从30天延长至45天，导致欧洲仓库库存预警。直接问「为什么延期」，供应商回复模糊（「生产遇到问题」），无法快速决策是否启动备选供应商。 - 数据要求：供应商历史交付数据、生产工艺流程、原材料采购周期、替代供应商评分、库存消耗速率、应急成本 - 预期产出：通过「供应链延期的三层根因模型」（原材料层→生产工艺层→物流层）逐层推导，定位真实瓶颈（如钢管供应短缺），并生成应急方案（启动备选供应商或调整产品配置） - 业务价值：年化245万元（避免缺货导致的销售损失，同时通过精准诊断降低应急成本30%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：母婴运营师面临「促销定价」「供应链异常」等复杂决策——Step-Back Prompting将决策准确率从72%提升至80.5%，年化为413万元收益（相比直接CoT方案）。同时决策可解释性提升95%，便于合规审计。
实施难度：⭐⭐⭐☆☆（需要LLM集成+原则库维护，但逻辑清晰）
优先级：⭐⭐⭐⭐☆（高ROI、中等难度、强业务适配度）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（207 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import json

# ============ Step-Back Prompting 母婴跨境电商应用 ============

class StepBackPromptingEngine:
    """
    两阶段推理引擎：
    Stage 1 (Abstraction): 从具体问题提炼高层原则
    Stage 2 (Application): 基于原则生成具体决策
    """
    
    def __init__(self):
        self.abstraction_principles = {}
        self.decision_history = []
    
    def stage1_extract_principles(self, problem_domain, context_data):
        """
        Stage 1: 后退一步，提炼高层原则
        输入：问题域 + 上下文数据
        输出：3-5条高层原则（可被LLM生成）
        """
        if problem_domain == "promotion_pricing":
            principles = {
                "principle_1": "成本保护原则：折扣不能低于成本+目标毛利率",
                "principle_2": "竞争力维持原则：折扣需对标竞品，保持价格竞争力",
                "principle_3": "库存优先级原则：高库存产品折扣力度>低库存产品",
                "principle_4": "客户分层原则：高价值客户享受更优折扣，提升复购率",
                "principle_5": "时间敏感原则：临近促销截止日期，折扣力度递增"
            }
        elif problem_domain == "supply_chain_delay":
            principles = {
                "principle_1": "根因分层原则：原材料层→生产工艺层→物流层逐层诊断",
                "principle_2": "数据驱动原则：依赖历史交付数据判断异常程度",
                "principle_3": "风险评估原则：延期风险 = 库存消耗速率 × 延期天数",
                "principle_4": "应急成本原则：启动备选方案成本需<缺货损失",
                "principle_5": "供应商协作原则：根因分析需基于供应商反馈+数据验证"
            }
        
        self.abstraction_principles[problem_domain] = principles
        return principles
    
    def stage2_apply_principles(self, problem_domain, specific_case, principles):
        """
        Stage 2: 基于原则，生成具体决策
        输入：问题域 + 具体案例 + 原则集合
        输出：量化决策建议
        """
        decisions = {}
        
        if problem_domain == "promotion_pricing":
            # 案例数据
            products = specific_case["products"]  # [{"name": "暖奶器", "cost": 45, "target_margin": 0.35, "inventory": 1200, "competitor_price": 129}, ...]
            promotion_budget = specific_case["promotion_budget"]  # 预期利润损失上限
            
            for product in products:
                # 应用原则1：成本保护
                min_price = product["cost"] / (1 - product["target_margin"])
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2310.06117 — Take a Step Back: Evoking Reasoning via Abstraction in Large Language Models

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：具体问题的上下文数据：定价场景的产品成本结构、历史销量、竞品价格、库存水位、目标利润率与客户购买力分布；供应链场景的交付历史、工艺流程、采购周期、替代供应商评分与库存消耗速率。

**输出**：由 3 到 5 条高层原则推导出的具体决策方案与可解释的原则依据，用于定价、异常诊断等复杂决策与合规审计。

## 执行步骤

1. 整理问题域与上下文数据
2. 先提炼 3 到 5 条高层原则
3. 按原则逐条推导具体方案
4. 校验方案是否满足成本与合规约束
5. 输出方案与原则依据供复核

## 边界与不做

- 拿不到成本、库存与竞品等上下文数据时不适用，原则提炼会脱离业务约束
- 只产出方案与原则依据，不代替定价审批、供应商切换等业务决策
- 原则提炼不当会导致方案偏离市场；定价类结论不得违反反垄断与价格歧视法规

## 技能关联

- **前置**：Skill-Adaptive-RAG-Query-Routing.html、Skill-Adaptive-RAG-Query-Routing、Skill-Few-Shot-In-Context-Learning、Skill-Multi-Step-Reasoning-BI.html、Skill-Multi-Step-Reasoning-BI、Skill-Query2Doc-Query-Expansion.html、Skill-Query2Doc-Query-Expansion、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-Tree-of-Thoughts-Planning.html、Skill-Tree-of-Thoughts-Planning
- **延伸**：Skill-Adaptive-RAG-Query-Routing.html、Skill-Adaptive-RAG-Query-Routing、Skill-Few-Shot-In-Context-Learning、Skill-Query2Doc-Query-Expansion.html、Skill-Query2Doc-Query-Expansion、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis
- **可组合**：Skill-Few-Shot-In-Context-Learning、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-Step-Back-Prompting

---

> 分类：经营管理/财务与合规/经济性分析　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-Step-Back-Prompting`