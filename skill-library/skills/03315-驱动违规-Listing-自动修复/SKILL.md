---
name: "p2s-listing-compliance-auto-repair"
title: "Listing Compliance Auto Repair — AI 驱动违规 Listing 自动修复"
description: "触发词：违规修复、合规检测、违禁词改写、批量修复、上架窗口。何时不用：只要体检报告不要改写用「Listing 健康诊断」；本技能输出违规点的修复版本。安全边界：修复后仍需人工确认，不得以改词规避真实合规义务或保留未获证实的功效宣称。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-067"
l3_business: "Listing优化"
l3_all: "Listing优化 / 宣称审查"
l1_l2_l3: "业务运营/渠道经营/Listing优化"
p2s_card_id: "Skill-Listing-Compliance-Auto-Repair"
p2s_src_domain: "21-合规决策"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把 clinically proven、FDA approved 这类违规说法自动改成合规表达，赶得上大促上架窗口。"
user_try: "试试：把这 35 个 SKU 的 Listing 违规点批量修掉，给出修复前后对比和置信度。"
whenToUse: "当 Listing 已被标记违规或需在大促前批量过合规、且要求给出改写版本时用；只要体检报告不求修复用「Listing 健康诊断」。"
workflow: "扫描标题、要点、描述与 A+ 中的违规表达 → 按修复规则库生成替换、删除或弱化方案 → 给每条修复打置信度分 → 低置信度转人工确认后批量重扫"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Listing Compliance Auto Repair — AI 驱动违规 Listing 自动修复

## ① 解决的问题

黑五前35个SKU需要合规修复人工每条需30分钟共需3-5天错过上架窗口——LLM驱动自动修复规则引擎30秒完成一条批量处理节省2-4天上架时机保护旺季GMV10-30万元并防止Amazon账号警告

## ② 核心算法逻辑

检测（Flag）→ 修复（Fix）的完整闭环：

## ③ 业务应用场景

业务问题：黑五前 35 个 SKU 要更新 Listing（加促销词），每次更新都需要合规检查。运营经验不足，往往加了违规词（"clinically proven boost"，"#1 rated in America"），被 Amazon 发警告后才发现。一次修复需要 3-5 天，错过最佳上架时机。
数据要求： - Listing 草稿文本（标题/要点/描述/A+） - 目标市场（US/DE/UK） - 待修复时间限制（24小时内完成35个 SKU）
预期产出： - 每个违规点的 AI 修复建议（原文→修复版对比） - 修复置信度评分（高置信度可自动接受，低置信度需人工确认） - 批量修复后的合规重扫描结果

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
修复效率提升 10-20x（人工 30min/条 → AI 30s/条）：节省人力 ¥5-15 万/年
黑五前批量修复 35 个 SKU：提前 2-4 天上架，挽回旺季 GMV ¥10-30 万
防止 Amazon 账号警告：每次警告影响广告排名，保护持续收入
年化综合 ROI：¥20-60 万
实施难度：⭐⭐☆☆☆（规则引擎版 1 周可实现；LLM API 集成约 2 周；全量测试需要真实 Listing 样本）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（188 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：'[' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/compliance/listing_compliance_auto_repair` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/21-合规决策/Skill-Listing-Compliance-Auto-Repair.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Listing Compliance Auto Repair
LLM 驱动违规 Listing 自动修复系统
"""
import re
from dataclasses import dataclass
from typing import Optional


@dataclass
class RepairResult:
    original: str
    repaired: str
    rule_id: str
    confidence: float   # 0-1，修复置信度
    change_type: str    # replace / remove / soften


# 修复规则库（规则→修复映射）
REPAIR_RULES = [
    {
        'rule_id': 'FDA-HC-001',
        'patterns': [
            (r'clinically\s+proven\s+to\s+(\w+)', 'designed to help {1}'),
            (r'clinically\s+(proven|tested|verified)', 'thoughtfully designed'),
            (r'(cure|treat|heal)\s+(\w+)', 'support {2} wellness'),
            (r'fda\s+(approved|cleared)', 'designed with safety in mind'),
            (r'medical\s+grade\s+(pump|device)', 'hospital-strength {1}'),
            (r'(increase|boost)\s+milk\s+supply', 'designed for efficient milk expression'),
        ],
        'confidence': 0.85,
        'change_type': 'replace',
    },
    {
        'rule_id': 'FTC-AD-001',
        'patterns': [
            (r'#1\s+(best\s+)?(rated|selling|pump)', 'highly rated {2}'),
            (r'scientifically\s+proven', 'thoughtfully engineered'),
            (r'guaranteed\s+to\s+(\w+)', 'designed to {1}'),
            (r'(\d+)%\s+(better|more\s+efficient|quieter)\s+than', '{1}% {2} with advanced technology'),
        ],
        'confidence': 0.80,
        'change_type': 'soften',
    },
    {
        'rule_id': 'AMZN-TOS-001',
        'patterns': [
            (r'visit\s+(our\s+)?(website|store|instagram|facebook)[^.]*\.', ''),
            (r'(contact|reach)\s+us\s+(before|first|directly)[^.]*\.', ''),
            (r'leave\s+a\s+(review|feedback)[^.]*\.', ''),
        ],
        'confidence': 0.95,
        'change_type': 'remove',
    },
    {
        'rule_id': 'SUPERLATIVE-001',
        'patterns': [
            (r'\bperfect\b', 'excellent'),
            (r'\bamazing\s+(quality|performance|results)', 'outstanding {1}'),
            (r'\bincredible\s+(\w+)', 'impressive {1}'),
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.14823，但该号在 arXiv 上是《Converse Theorems for Certificates of Safety and Stability》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：Listing 草稿文本（标题、要点、描述、A+）、目标市场（US、DE、UK）、修复时限；粒度为单条 Listing。

**输出**：每个违规点的原文与修复版对比、修复置信度与变更类型、批量重扫后的合规结果，供运营快速交付上架。

## 执行步骤

1. 扫描标题、要点、描述与 A+ 中的违规表达
2. 按修复规则库生成替换、删除或弱化方案
3. 给每条修复打置信度分
4. 把低置信度修复转人工确认
5. 批量重扫确认合规后交付上架

## 边界与不做

- 何时不用：规则库未覆盖目标市场时修复覆盖率不足，需先补规则再批量执行
- 能力边界：只做文本层修复与合规重扫，不承担平台最终判罚责任，也不得保留未获证实的功效宣称

## 技能关联

- **前置**：Skill-Amazon-Account-Appeal-Strategy.html、Skill-Amazon-Account-Appeal-Strategy、Skill-Compliance-ML-Risk-Scoring.html、Skill-Compliance-ML-Risk-Scoring、Skill-Listing-AB-Testing-Automation.html、Skill-Listing-AB-Testing-Automation、Skill-Listing-AI-Copywriting.html、Skill-Listing-AI-Copywriting、Skill-Multilingual-Listing-Localization.html、Skill-Multilingual-Listing-Localization、Skill-Regulatory-Graph-Compliance-Monitor.html、Skill-Regulatory-Graph-Compliance-Monitor
- **延伸**：Skill-Amazon-Account-Appeal-Strategy.html、Skill-Amazon-Account-Appeal-Strategy、Skill-Listing-AB-Testing-Automation.html、Skill-Listing-AB-Testing-Automation、Skill-Listing-AI-Copywriting.html、Skill-Listing-AI-Copywriting、Skill-Multilingual-Listing-Localization.html、Skill-Multilingual-Listing-Localization
- **可组合**：Skill-Listing-AB-Testing-Automation.html、Skill-Listing-AB-Testing-Automation、Skill-Multilingual-Listing-Localization.html、Skill-Multilingual-Listing-Localization、Skill-Listing-Compliance-Auto-Repair

---

> 分类：业务运营/渠道经营/Listing优化　·　技术族：21-合规决策　·　源卡：`Skill-Listing-Compliance-Auto-Repair`