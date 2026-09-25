---
name: "p2s-cross-border-tax-tariff-modeling"
title: "HTS Tariff Intelligence — LLM 驱动的跨境关税分类与节税优化"
description: "触发词：HTS 分类、关税节税、GRI 规则、Binding Ruling、清关编码。何时不用：要用多 Agent 共识投票提升编码准确率用「HTS 多 Agent 分类」；只查现成编码与税率库用「HTS 编码分类」。安全边界：最终编码须经 CBP Binding Ruling 或报关行确认，不代替海关归类的法律意见；不得虚报编码规避关税。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-125"
l3_business: "税务资料"
l3_all: "税务资料 / 关务资料检查 / 申报协作"
l1_l2_l3: "独立控制/财务与合规/税务资料"
p2s_card_id: "Skill-Cross-Border-Tax-Tariff-Modeling"
p2s_src_domain: "23-运营财务"
quality_tier: "preview"
user_summary: "用 LLM 按 GRI 规则给商品找更准确的 10 位 HTS 编码，配合正式裁定申请，把合法可省的关税省下来。"
user_try: "试试：这款吸奶器被申报为液体泵，帮我按 GRI 规则评估能否归到呼吸治疗器具，并给出候选编码与税率差异。"
whenToUse: "需要 LLM 分层推理给出候选 HTS 编码、GRI 依据与节税路径时用本技能；要多 Agent 共识提升分类准确率用「HTS 多 Agent 分类」；只查既有编码与税率库用「HTS 编码分类」。"
workflow: "用分层分类输出候选 HTS 编码前三及 GRI 依据 → 检索 CBP 历史裁定确认目标编码有先例支持 → 申请 CBP Binding Ruling 取得有法律约束力的分类确认 → 按裁定结果修改报关单申报编码并核算节税金额"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# HTS Tariff Intelligence — LLM 驱动的跨境关税分类与节税优化

## ① 解决的问题

母婴跨境卖家吸奶器被默认申报为液体泵（关税3.4%）而非呼吸治疗器具（0%），500万美元货值每年多缴17万美元关税——ATLAS LLM分层HTS分类识别正确10位编码，配合CBP Binding Ruling申请实现合规节税，Top-20 SKU年化节税20-200万元

## ② 核心算法逻辑

HTS（Harmonized Tariff Schedule）分层分类本质是一个层级多标签分类问题：10 位编码中前 2 位是章节（Chapter），前 4 位是税则号（Heading），前 6 位是子目（Subheading），后 4 位由各国自定义。

## ③ 业务应用场景

业务问题：Momcozy S12 Pro 吸奶器被默认申报为 `8413.20.0000`（液体泵，关税 3.4%）。实际上按 GRI Rule 1，其主要功能为提供呼吸治疗式负压吸力，应归类为 `9019.20.0000`（呼吸治疗器具，关税 0%）。年销售额 500 万美元时，关税差异高达 17 万美元。
数据要求： - 商品英文描述（含材质、功能、医疗/非医疗用途声明） - 历史清关编码记录 - 竞品已获批的 CBP Binding Ruling（公开可查询）
执行路径： 1. ATLAS 分层分类 → 输出候选 HTS 编码 Top-3 及 GRI 依据 2. CBP 历史裁定检索 → 确认 `9019.20` 有先例支持 3. 申请 CBP Binding Ruling → 获得法律约束力的正式分类确认 4. 修改报关单申报编码 → 合规节税

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ATLAS 论文报告 fine-tuned LLaMA-3.3-70B 在 10 位编码准确率达 40%（人工专家 ~ 60-70%），LLM+人工复核组合准确率 > 90%
CBP 数据：2024 年进口商收到 HTS 错误通知并补缴关税的案例增加 23%
吸奶器案例：`8413.20`（3.4%）→ `9019.20`（0%），500 万美元货值年节税 17 万美元（约 122 万人民币）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（378 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/growth_model/cross_border_tax_tariff_modeling` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/23-运营财务/Skill-Cross-Border-Tax-Tariff-Modeling.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
HTS Tariff Intelligence — LLM 驱动的 HTS 关税编码分类
母婴跨境场景：5 个典型 SKU 的分层分类 + GRI 规则链输出
依赖：openai>=1.0.0 或可替换为任意 LLM API
"""

import json
import re
from dataclasses import dataclass, field
from typing import Optional


# ─── 数据结构 ─────────────────────────────────────────────

@dataclass
class HTSResult:
    """HTS 分类结果"""
    sku_name: str
    hts_code: str           # 10 位 HTS 编码（示例：9019.20.0000）
    duty_rate: float        # 关税税率（百分比）
    gri_rule: str           # 适用 GRI 规则（如 "GRI Rule 1"）
    gri_reasoning: str      # GRI 规则适用理由
    section: str            # HTS Section（如 "Section XVI"）
    chapter: str            # Chapter（如 "Chapter 90"）
    confidence: float       # 置信度 0-1
    alternative_codes: list = field(default_factory=list)  # 备选编码
    cbp_ruling_ref: Optional[str] = None  # CBP 裁定参考编号


# ─── HTS 关键章节/税率数据（简化版，实际应接 USITC 数据库） ──

HTS_CHAPTER_MAP = {
    "84": {"name": "核反应堆、锅炉、机械器具", "section": "Section XVI"},
    "85": {"name": "电气机械及设备", "section": "Section XVI"},
    "90": {"name": "光学、医疗、精密仪器", "section": "Section XVIII"},
    "94": {"name": "家具、寝具、灯具", "section": "Section XX"},
    "95": {"name": "玩具、游戏品、运动用品", "section": "Section XX"},
    "87": {"name": "车辆及其零件", "section": "Section XVII"},
    "62": {"name": "纺织服装", "section": "Section XI"},
}

# 示例税率库（实际应接 USITC Tariff Schedule API）
DUTY_RATE_DB = {
    "9019.20.0000": 0.0,    # 呼吸治疗器具 — 免税
    "8413.20.0000": 3.4,    # 液体泵
    "8509.80.5050": 4.2,    # 家用电动器具
    "8516.79.0050": 0.0,    # 电热器具（部分）
    "9403.20.0018": 0.0,    # 金属家具（婴儿床架）
    "8714.99.8000": 10.0,   # 童车零件
    "8715.00.0000": 0.0,    # 童车及婴儿车 — 免税
    "9021.90.8100": 0.0,    # 矫形器具
    "3406.00.0000": 0.0,    # 蜡烛（儿童夜灯蜡烛）
    "8471.60.9000": 0.0,    # 输入/输出装置
}

# GRI 规则摘要（简化）
GRI_RULES = {
    "GRI Rule 1": "按税则各类的条文及各节或章的注释归类，税则条文未另规定者，依后续规则处理",
    "GRI Rule 2a": "非完整品/未制成品归类同完整品，前提是具备完整品的基本特征",
    "GRI Rule 2b": "混合材料或物质归类，按 Rule 3 处理",
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2509.18400 — ATLAS: Benchmarking and Adapting LLMs for Global Trade via Harmonized Tariff Code Classification
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：商品英文描述（含材质、功能、医疗或非医疗用途声明）、历史清关编码记录，以及竞品已获批的 CBP Binding Ruling（公开可查）。

**输出**：HTS 分类结果（10 位编码、关税率、适用 GRI 规则与理由、置信度与备选编码）与节税测算，供关务与报关行据以申请裁定与改单。

## 执行步骤

1. 整理商品英文描述、材质功能与用途声明
2. 分层推理输出候选 HTS 编码与 GRI 依据
3. 检索 CBP 历史裁定确认先例支持
4. 测算税率差异与节税金额
5. 按裁定结果更新报关申报编码

## 边界与不做

- 商品描述缺少材质与用途声明、或没有历史清关记录时不适用，纯口头卖点无法归类
- 只给候选编码与节税路径，最终归类须经 CBP Binding Ruling 或报关行确认
- 不得为规避关税虚报编码，节税必须以合规归类为前提

## 技能关联

- **前置**：Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-FBA-Fee-Intelligence.html、Skill-FBA-Fee-Intelligence、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard、Skill-Tax-Compliance-VAT-GST.html、Skill-Tax-Compliance-VAT-GST
- **延伸**：Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-FBA-Fee-Intelligence.html、Skill-FBA-Fee-Intelligence、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard
- **可组合**：Skill-FBA-Fee-Intelligence.html、Skill-FBA-Fee-Intelligence、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard、Skill-Cross-Border-Tax-Tariff-Modeling

---

> 分类：独立控制/财务与合规/税务资料　·　技术族：23-运营财务　·　源卡：`Skill-Cross-Border-Tax-Tariff-Modeling`