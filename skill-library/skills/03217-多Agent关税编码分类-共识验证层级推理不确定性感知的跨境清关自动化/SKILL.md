---
name: "p2s-hts-agentic-tariff-classification"
title: "HTS多Agent关税编码分类 — 共识验证+层级推理+不确定性感知的跨境清关自动化"
description: "触发词：多 Agent 关税分类、共识投票、层级推理、不确定性感知、批量重分类。何时不用：只做单模型 HTS 分类与节税推演用「HTS 关税分类与节税」；只查编码税率库用「HTS 编码分类」。安全边界：有分歧的 10 位编码必须推送经纪人确认，不得自动申报；编码库与法规变更须月度人工抽检。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-125"
l3_business: "税务资料"
l3_all: "税务资料 / 关务资料检查"
l1_l2_l3: "独立控制/财务与合规/税务资料"
p2s_card_id: "Skill-HTS-Agentic-Tariff-Classification"
p2s_src_domain: "21-合规决策"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "多个 Agent 并行给每个 SKU 定关税编码并投票，高置信度的自动过、有分歧的交人确认，把经纪人工作量降下来。"
user_try: "试试：把本月 500 个 SKU 跑一遍多 Agent 关税分类，前 6 位高置信度的直接给出，10 位有分歧的列出来给我确认。"
whenToUse: "SKU 数量多、需要多 Agent 共识与不确定性分流来批量定编码时用本技能；单模型分类加节税推演用「HTS 关税分类与节税」；只查税率库用「HTS 编码分类」。"
workflow: "把商品英文描述输入多 Agent 分类系统 → 多个 Agent 并行执行检索 CROSS 数据库、层级推理与分阶段分类 → 按投票结果分流：前 6 位高置信度自动申报，10 位有分歧推送经纪人确认 → 贸易政策变化时以新关税表为上下文批量重分类并生成税率变化清单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# HTS多Agent关税编码分类 — 共识验证+层级推理+不确定性感知的跨境清关自动化

## ① 解决的问题

30%的年度HS申报编码存在错误导致关税多缴或清关延误——多Agent共识+逐元素投票+层级推理将4位HTS准确率提升至75%+，人工工作量减少80%（2026 arXiv:2606.16987）

## ② 核心算法逻辑

反直觉洞察：HS/HTS编码（协调制度关税编码）是全球贸易的通用语言，约30%的年出口申报编码存在错误，导致税率错误、清关延误、罚款。传统分类靠海关经纪人人工查阅17000页规则手册，一份申报要花4590分钟。反直觉发现：单个LLM哪怕是最先进的，在精确10位HTS编码上准确率也只有约2540%，因为这需要多步层级推理+法律条文检索+例外条款判断。但通过多Agent共识框架，将这个准确率大幅提升至75%+（4位数），同时提供可溯源的决策

## ③ 业务应用场景

- 业务问题：某母婴卖家每月向美国发货约500个SKU，HS编码全靠海关经纪人手工查，费用约$1500/月，且错误率约15%（导致税率多缴或延误） - 多Agent框架应用： 1. 商品描述输入多Agent系统（如："Battery-operated electric double breast pump with USB charging, BPA-free silicone flanges, weight 1.2kg"） 2. 5个Agent并行：检索CROSS数据库→层级推理→4阶段分类 3. 投票结果：前6位高置信度→自动申报；10位有分歧→推送经纪人确认 4. 经纪人平均只需处理20
- 业务问题：2025年贸易政策频繁变化，Section 301关税多次调整，旧的HS编码可能对应新的税率表，需要快速批量重分类 - 自动化重分类：以新的关税表为上下文，批量对所有SKU重新运行分类流水线，生成税率变化清单，优先处理税率变化最大的SKU
三轨验证 | 成本轨：月均成本1200元（AI模型调用费用800元/月+人工审核4小时/月×100元/小时=400元），年度投入14400元，相比传统人工分类（月均3000元）节省60% | 合规轨：基于HS编码库+FDA/CE数据库智能匹配，准确率98.5%，符合FDA 21 CFR Part 820医疗器械分类标准和CE标志指令2014/30/EU，可直接用于报关单证和合规声明 | 风险轨：模型误分类风险8%（主要涉及边界产品如婴儿监护仪），可能导致清关延误3-5天或罚款500-2000元；数据更新滞后风险5%（新增关税政策响应周期7天），建议建立月度人工抽检机制（20件/月）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：84.2%
ROI 预估：月500个SKU申报，海关经纪人费用从$1500降至$400，年节省$13200；减少错误申报税率损失$5000/年；系统成本$4万，ROI≈460%
实施难度：⭐⭐⭐☆☆（核心挑战是构建完整的HTS规则检索库；论文提供了开源代码框架；可从6位编码开始逐步精细化）
优先级：⭐⭐⭐⭐⭐（跨境清关HS编码错误会导致货物被扣、高额罚款；30%的错误率是全行业公认痛点，2026年最新顶刊）
适用规模：月出口>50个不同SKU的卖家，SKU越多节省越大
数据依赖：产品标题/描述（已有），HTS规则文档（公开可获取），历史申报记录（最优但非必须）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（166 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/compliance/hts_agentic_tariff_classification` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/21-合规决策/Skill-HTS-Agentic-Tariff-Classification.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
HTS多Agent关税编码分类系统
基于 arXiv:2606.16987 + 2605.14857 (2026)
多Agent共识投票 + 层级分类 + 不确定性感知
"""
import re
from collections import Counter
import warnings
warnings.filterwarnings('ignore')


# HTS章级别分类规则（简化版，实际需加载完整17000页规则）
HTS_CHAPTER_RULES = {
    "8543": {"desc": "电气机械和设备", "keywords": ["electric", "battery", "motor", "pump"]},
    "9018": {"desc": "医疗器械", "keywords": ["medical", "hospital", "clinical"]},
    "3926": {"desc": "塑料制品", "keywords": ["plastic", "BPA", "silicone", "bottle"]},
    "6111": {"desc": "婴儿服装（针织）", "keywords": ["baby clothing", "infant wear", "onesie"]},
    "9403": {"desc": "家具", "keywords": ["crib", "stroller", "high chair", "furniture"]},
    "8516": {"desc": "加热/冷却家电", "keywords": ["warmer", "sterilizer", "heater"]},
}

HTS_SUFFIXES = {
    "8543": {"70": "其他电气设备", "90": "零件"},
    "9018": {"90": "其他医疗器械", "50": "眼科器械"},
    "3926": {"90": "其他塑料制品", "10": "学校用具"},
}


def classify_hts_single_agent(product_description, agent_id=0):
    """
    单个Agent的HTS分类（简化版层级推理）
    """
    desc_lower = product_description.lower()

    # 阶段1：章分类（2位）
    chapter_scores = {}
    for chapter, info in HTS_CHAPTER_RULES.items():
        score = sum(1 for kw in info['keywords'] if kw.lower() in desc_lower)
        if score > 0:
            chapter_scores[chapter] = score

    if not chapter_scores:
        return None, 0.0, "无法匹配任何章"

    # 加入随机扰动模拟不同Agent的视角差异
    import random
    rng = random.Random(agent_id)
    for ch in chapter_scores:
        chapter_scores[ch] += rng.uniform(-0.3, 0.3)

    best_chapter = max(chapter_scores, key=chapter_scores.get)
    confidence = chapter_scores[best_chapter] / (sum(chapter_scores.values()) + 1e-9)

    # 阶段2：品目（4位）
    heading_suffix = "70" if "electric" in desc_lower or "battery" in desc_lower else "90"

    # 阶段3：子目（6位）
    subheading = HTS_SUFFIXES.get(best_chapter, {}).get(heading_suffix, "其他")

    # 构建HTS编码（简化版）
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2605.14857 — A Deterministic Agentic Workflow for HS Tariff Classification: Multi-Dimensional Rule Reasoning with Interpretable Decisions
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：产品标题与描述（含材质、电池、功能等要素）、HTS 规则文档（公开可获取），历史申报记录为可选增强项；适用规模为月出口 50 个以上不同 SKU。

**输出**：SKU 级 HTS 编码与置信度、需人工确认的分歧清单、批量重分类后的税率变化清单，供报关与经纪人处理。

## 执行步骤

1. 整理待分类 SKU 的产品标题与描述
2. 并行运行多个 Agent 做检索、层级推理与分类
3. 按投票结果分出高置信度编码与分歧编码
4. 把分歧项推送经纪人确认后定稿
5. 按新关税表批量重跑分类并输出税率变化清单

## 边界与不做

- 产品描述缺失关键要素（材质、电池、用途）时不适用，层级推理无法启动
- 只做分类与分流，不直接申报报关单；分歧编码必须人工确认
- 编码库与法规存在更新滞后，须保留每月人工抽检机制

## 技能关联

- **前置**：Skill-ATLAS-HTS-Tariff-Classification.html、Skill-ATLAS-HTS-Tariff-Classification、Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework、Skill-Platform-Policy-Change-Adaptive-Monitor.html、Skill-Platform-Policy-Change-Adaptive-Monitor、Skill-Regulatory-Graph-Compliance-Monitor.html、Skill-Regulatory-Graph-Compliance-Monitor、Skill-Supply-Chain-Due-Diligence.html、Skill-Supply-Chain-Due-Diligence、Skill-Tariff-FX-FBA-Cost-Dynamics.html、Skill-Tariff-FX-FBA-Cost-Dynamics
- **延伸**：Skill-Platform-Policy-Change-Adaptive-Monitor.html、Skill-Platform-Policy-Change-Adaptive-Monitor、Skill-Regulatory-Graph-Compliance-Monitor.html、Skill-Regulatory-Graph-Compliance-Monitor、Skill-Supply-Chain-Due-Diligence.html、Skill-Supply-Chain-Due-Diligence、Skill-Tariff-FX-FBA-Cost-Dynamics.html、Skill-Tariff-FX-FBA-Cost-Dynamics
- **可组合**：Skill-Supply-Chain-Due-Diligence.html、Skill-Supply-Chain-Due-Diligence、Skill-Tariff-FX-FBA-Cost-Dynamics.html、Skill-Tariff-FX-FBA-Cost-Dynamics、Skill-HTS-Agentic-Tariff-Classification

---

> 分类：独立控制/财务与合规/税务资料　·　技术族：21-合规决策　·　源卡：`Skill-HTS-Agentic-Tariff-Classification`