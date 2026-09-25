---
name: "p2s-ppc-rule-automation-engine"
title: "PPC Rule Automation Engine — PPC 规则自动化引擎：条件触发的广告出价智能运营"
description: "触发词：规则引擎、条件触发、高ACOS降价、无转化暂停、冷却与变更上限。何时不用：没有关键词维度每日报告或未设目标ACOS时规则无法判定；需要按转化率估计最优出价走PPC出价自动化。安全边界：改价须受冷却小时数与每日最大变更次数约束，须获平台广告API授权并留存执行日志。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 投放诊断"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
p2s_card_id: "Skill-PPC-Rule-Automation-Engine"
p2s_src_domain: "13-广告分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把高 ACOS 降价、长期无转化暂停、低曝光提价这些人工判断写成规则，每天自动跑一遍。"
user_try: "试试：帮我把200个关键词的调价规则自动化，ACOS超35%降价、7天无转化暂停、低ACOS优质词加预算。"
whenToUse: "当决策逻辑本身就是明确的条件与阈值、需要每天自动巡检执行时用本卡；需要按统计估计逐词算最优出价用 PPC 出价自动化；渠道级预算腾挪用再分配触发器。"
workflow: "导入关键词维度每日广告报告与目标 ACOS → 定义规则条件（ACOS、无转化天数、曝光）与动作 → 为每条规则设置冷却小时数与每日最大变更次数 → 每日运行引擎逐词评估条件是否命中 → 命中且未受冷却与次数限制时执行动作并记日志"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# PPC Rule Automation Engine — PPC 规则自动化引擎：条件触发的广告出价智能运营

## ① 解决的问题

中型卖家每周花6小时手动调整200个关键词出价规则不一致还有遗漏——条件触发规则引擎7×24小时自动执行高ACOS降价/无转化暂停/低曝光提价，ACOS降低15-20%运营时间节省80%年化20-50万元

## ② 核心算法逻辑

手动调价 vs 规则自动化：

## ③ 业务应用场景

业务问题：运营有 200 个关键词，每周花 6 小时手动检查和调整。其中： - 30 个关键词 ACOS > 35%（过度花费） - 20 个关键词 7 天无转化但还在花钱 - 10 个低 ACOS 优质词没有加预算（错失机会）
规则引擎把这些决策自动化，每天运行而非每周，响应更及时。
数据要求： - Amazon 广告报告（关键词维度，每日数据） - 目标 ACOS 设置（按 SKU 或活动）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
ACOS 降低 15-20%：月省广告费 ¥3-10 万
运营时间节省 80%：从 6h/周 → 1h/周，年化 ¥3-8 万
无转化词及时暂停：减少无效花费
年化综合 ROI：¥20-50 万
实施难度：⭐⭐☆☆☆（规则引擎逻辑清晰；需要 Amazon 广告 API 权限；约 2-3 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（188 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/advertising/ppc_rule_automation_engine` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-PPC-Rule-Automation-Engine.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
PPC Rule Automation Engine
条件触发的广告出价自动化规则引擎
"""
import numpy as np
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from collections import defaultdict


@dataclass
class KeywordMetrics:
    keyword: str
    match_type: str           # exact/phrase/broad
    current_bid: float
    impressions: int
    clicks: int
    orders: int
    spend: float
    acos: float               # 实际 ACOS
    target_acos: float = 0.25 # 目标 ACOS
    last_modified: datetime = None


@dataclass
class AutomationRule:
    rule_id: str
    name: str
    conditions: list[dict]    # [{metric, operator, value}]
    action: dict              # {type, value}
    cooldown_hours: int = 24
    max_daily_changes: int = 2
    enabled: bool = True

    def evaluate(self, metrics: KeywordMetrics) -> bool:
        """检查规则条件是否满足"""
        for cond in self.conditions:
            metric_val = getattr(metrics, cond['metric'], None)
            if metric_val is None:
                return False
            op = cond['operator']
            threshold = cond['value']
            if op == '>' and not (metric_val > threshold): return False
            if op == '<' and not (metric_val < threshold): return False
            if op == '>=' and not (metric_val >= threshold): return False
            if op == '<=' and not (metric_val <= threshold): return False
            if op == '==' and not (metric_val == threshold): return False
        return True


class PPCRuleEngine:
    """PPC 规则自动化引擎"""

    def __init__(self):
        self.rules: list[AutomationRule] = []
        self.execution_log: list[dict] = []
        self.keyword_change_count: dict = defaultdict(int)
        self.keyword_last_modified: dict = {}

    def add_rule(self, rule: AutomationRule):
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.14892，但该号在 arXiv 上是《CCAT: Detector Noise Limited Performance of the RFSoC-based Readout Electronics for mm/sub-mm/far-IR KIDs》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：关键词维度的每日广告报告（关键词、匹配类型、当前出价、展示、点击、转化、花费、实际 ACOS）、按 SKU 或活动设定的目标 ACOS，以及规则定义（条件组合、动作类型与幅度、冷却小时数、每日最大变更次数）；需要 Amazon 广告 API 权限。

**输出**：命中的规则动作（降价、暂停或提价、幅度与原因）与执行日志、每个关键词的变更计数，供运营复核与平台侧执行。

## 执行步骤

1. 导入关键词维度的每日广告报告与各 SKU 目标 ACOS
2. 定义每条规则的条件组合与对应动作
3. 为规则设置冷却小时数与每日最大变更次数
4. 每日运行引擎逐词评估规则条件是否命中
5. 对命中且未触发冷却与次数上限的关键词执行动作
6. 记录执行日志与变更计数备查

## 边界与不做

- 何时不用：缺少关键词维度每日报告、或未设定目标 ACOS 时规则无法判定，不应空跑。
- 能力边界：只产出触发动作与执行日志，真实改价需平台广告 API 授权；规则条件与阈值由运营设定，本卡不判断阈值本身是否合理。
- 执行纪律：冷却小时数与每日最大变更次数须生效，避免同一关键词被反复调整。

## 技能关联

- **前置**：Skill-AB-Testing-Platform-Infrastructure.html、Skill-AB-Testing-Platform-Infrastructure、Skill-Inventory-Demand-Sensing.html、Skill-Inventory-Demand-Sensing、Skill-PPC-Keyword-Bid-Automation.html、Skill-PPC-Keyword-Bid-Automation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-RTB-Multi-Objective-Bidding.html、Skill-RTB-Multi-Objective-Bidding、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard
- **延伸**：Skill-AB-Testing-Platform-Infrastructure.html、Skill-AB-Testing-Platform-Infrastructure、Skill-Inventory-Demand-Sensing.html、Skill-Inventory-Demand-Sensing、Skill-RTB-Multi-Objective-Bidding.html、Skill-RTB-Multi-Objective-Bidding、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard
- **可组合**：Skill-Inventory-Demand-Sensing.html、Skill-Inventory-Demand-Sensing、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard、Skill-PPC-Rule-Automation-Engine

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：13-广告分析　·　源卡：`Skill-PPC-Rule-Automation-Engine`