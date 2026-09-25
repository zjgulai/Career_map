---
name: dtc-sop-a-selection
description: >
  DTC 母婴跨境产品选品扫描 SOP（SOP-A）：5 大数据维度并行采集，输出机会评分 + GO/NO-GO 推荐。
  触发场景：「SOP-A 选品」「做一次选品扫描」「分析这个品类」「母婴品类评估」「新品类要不要做」。
  封装了 baby-sterilizer 选品完整流程，约 30 分钟完成 5 维数据采集 + 3 个机会推荐 + 1 个强 GO 建议。
triggers:
  - "SOP-A"
  - "选品扫描"
  - "品类分析"
  - "分析这个品类"
  - "母婴品类评估"
  - "新品要不要做"
  - "市场调研"
version: 1.0.0
created: 2026-05-25
source_sessions:
  - ses_1c9962202ffet3Em7fX1z7ke2b  # eng_20260515_baby-sterilizer-selection
source_lessons:
  - lesson_uv-handheld-trap
  - lesson_compliance-as-moat
  - lesson_pain-point-water-droplet
---

# dtc-sop-a-selection

DTC 母婴跨境产品选品扫描 SOP-A — 5 维并行数据采集。

## 执行时序

SOP-A 全程约 30 分钟（含 librarian 并行等待）：

```
Step 1: 明确品类边界（2 分钟）
Step 2: 5 维并行采集（15-20 分钟，4 个 background agent）
Step 3: 数据汇总 + 机会评分（5 分钟）
Step 4: GO/NO-GO 推荐报告（5 分钟）
```

---

## Step 1: 品类边界确认

在搜索前先明确 2 个参数：

1. **品类关键词**（英文，Amazon 搜索词级别）：如 `baby bottle sterilizer`
2. **目标市场**：US / EU / Both

边界太宽（如 `baby products`）→ 数据无效  
边界太窄（如 `Momcozy UV-C Baby Sterilizer`）→ 变成竞品分析而非选品

---

## Step 2: 5 维并行采集

**启动 4 个 background librarian agent 并行：**

```typescript
// Agent 1: 市场规模数据
task(subagent_type="librarian", run_in_background=true, load_skills=[],
  description="Market size research",
  prompt=`[CONTEXT] SOP-A product selection for [品类]
[GOAL] Get market size, CAGR, sub-segment data
[REQUEST] Search for:
1. Global market size USD (2024) and CAGR to 2030
2. US + EU market share percentages
3. UV-C vs steam vs UV+steam sub-segment breakdown
4. Top 3-5 growth drivers
Source priority: Grand View Research, Mordor Intelligence, Statista, MarketsandMarkets
Return: Numbers with source names. If data conflicts, list both.`)

// Agent 2: Amazon BSR 竞品分析
task(subagent_type="librarian", run_in_background=true, load_skills=[],
  description="Amazon BSR analysis",
  prompt=`[CONTEXT] SOP-A for [品类]
[GOAL] Understand competitive landscape on Amazon US
[REQUEST] Find top 10 Amazon BSR products for "[品类关键词]":
- ASIN, brand, price, review count, rating, key USPs
- Identify price gaps (empty price tiers)
- Note which products have compliance issues or recalls
- Note dominant brands vs opportunities
Return as table format.`)

// Agent 3: Reddit/论坛痛点挖掘
task(subagent_type="librarian", run_in_background=true, load_skills=[],
  description="Pain point research",
  prompt=`[CONTEXT] SOP-A for [品类]
[GOAL] Understand real consumer pain points
[REQUEST] Search Reddit (r/beyondthebump, r/NewParents, r/breastfeeding) and parenting forums for:
1. Top 5 complaints about current [品类] products
2. Feature requests / "I wish it had..."
3. Safety concerns mentioned
4. Price sensitivity signals
Return: Direct quotes + summary of top 3 pain points`)

// Agent 4: 合规要求扫描
task(subagent_type="librarian", run_in_background=true, load_skills=[],
  description="Compliance requirements",
  prompt=`[CONTEXT] SOP-A for [品类] targeting US + EU
[GOAL] Map required certifications and compliance landmines
[REQUEST] Research:
1. US: FDA requirements (21 CFR which section), CPSIA, UL/ETL requirements
2. EU: CE marking requirements, EN standards, REACH/RoHS
3. Any recent recalls or FDA warning letters for this category (last 3 years)
4. Typical certification cost estimates and timeline
Return: Requirement list + estimated cost + gotchas to avoid`)
```

**同时用直接工具做第 5 维（不需等 agent）：**

```bash
# 5. Exa 搜索 TikTok/Social 趋势
# 搜索关键词：[品类] review TikTok 2024-2025
# 目标：找出 UGC 内容量 + 病毒素材类型 + 话题标签
```

---

## Step 3: 数据汇总 + 机会评分

收齐 5 维数据后，填写机会评分卡：

| 机会 | 市场规模 | 竞争密度 | 合规门槛 | 痛点强度 | 社媒热度 | 综合评分 |
|---|---|---|---|---|---|---|
| 机会 #1 | ⭐⭐⭐⭐⭐ | ⭐⭐ (低竞争) | ⭐⭐⭐⭐ (高=护城河) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | **GO** |
| 机会 #2 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ (饱和) | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | NO-GO |
| 机会 #3 | ⭐⭐ | ⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | WATCH |

**特别注意（母婴品类历史教训）：**

- 手持 UV 棒/便携 UV：**一律 NO-GO**（BigTree 2025-08 + Uvlizer 2026-04 两次 FDA Class 2 大规模召回）
- 高合规门槛产品（UV-C、医疗器械类）：**合规护城河** = 反而是机会，不是阻碍
- 蒸气消毒器：Red Ocean（Baby Brezza/Papablic/Momcozy 饱和，首发 NO-GO）

---

## Step 4: GO/NO-GO 推荐报告

**报告文件命名：** `【SOP-A】{品类}-选品报告-{日期}.md`

**报告结构：**

```markdown
# SOP-A 选品报告：[品类] — [日期]

## 执行摘要
- 扫描品类：[品类关键词]
- 目标市场：[US/EU/Both]
- 建议：GO [机会 #X] / WATCH [机会 #Y] / NO-GO [机会 #Z]

## 5 维数据快照
### 1. 市场规模（[数据源]，[采集日期]）
[市场规模 + CAGR + 子赛道分布]

### 2. Amazon BSR 竞品矩阵
[Top 10 表格]

### 3. 消费者痛点 Top 3
[痛点 + 原文引用]

### 4. 合规要求地图
[US/EU 要求 + 成本预估]

### 5. 社媒趋势信号
[TikTok/Reddit 热度数据]

## 机会评分卡
[评分表格]

## 最终建议
### 强 GO：[机会 #X]
- 理由：[3 条]
- 关键风险：[2 条]
- 下一步：SOP-B 上架准备，起点：Brand Guardian brief

### 拒绝 Alternative：
- [机会 #Y]：[拒绝理由]
- [机会 #Z]：[拒绝理由]

## 数据质量说明
- 完整维度：[X/5]
- 缺失说明：[如 Exa 限流，用替代源覆盖]
```

---

## 决策节奏

SOP-A 结束时，Sisyphus **提出建议**，但最终 GO/NO-GO 由路特在「看完工厂打样 + 合规预审 + brand brief」后拍板。

SOP-A 是方向性 GO，不是最终决策。

---

## 历史执行记录

| 日期 | 品类 | 5 维完整度 | 结论 | 状态 |
|---|---|---|---|---|
| 2026-05-15 | baby bottle sterilizer | 4/5 (Reddit 限流) | GO #1 高端密闭 UV-C $129-149 | ✅ 进入 SOP-B |
