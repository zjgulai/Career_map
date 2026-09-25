---
name: "p2s-tag-quality-coverage-kpi"
title: "标签质量KPI监控体系 — 覆盖率/准确率/时效性/一致性的全维度Tag质量仪表盘"
description: "触发词：标签质量、覆盖率 KPI、SLA 监控、时效性、标签仪表盘。何时不用：要给单批商品目录做入湖前质量门控走商品数据质量评估；要监控 ML 输入漂移走管道可观测性。安全边界：标签涉及母婴产品安全与合规，误标可能导致违规下架，卡页原文要求保留抽样准确率验证与人工复核。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-140"
l3_business: "数据质量"
l3_all: "数据质量 / 运行监测"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据质量"
p2s_card_id: "Skill-Tag-Quality-Coverage-KPI"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "给自动打标立五维质量 KPI，标签错在哪、哪一批过期了，仪表盘上直接看得到。"
user_try: "试试：给这套标签体系配 SLA，大促前扫一遍哪些 SKU 的断货风险标签过期了。"
whenToUse: "自动打标已上线、需要持续监控覆盖率与准确率时用；要给单批商品目录做入湖前评分请转商品数据质量评估。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 标签质量KPI监控体系 — 覆盖率/准确率/时效性/一致性的全维度Tag质量仪表盘

## ① 解决的问题

自动化团队面临"标签错误后几个月才发现"——五维质量KPI(覆盖率/准确率/时效/一致性/完整性)将标签错误MTTD从数月降至实时，防止误触发Action损失20万元

## ② 核心算法逻辑

标签质量 是标签工程的护城河。高质量标签 = 可信赖的Action触发；低质量标签 = 误报预警/错误自动化操作。

## ③ 业务应用场景

场景A：供应链标签质量SLA体系建立 - 业务问题：自动打标流水线上线后，没有质量监控，3 个月后发现某批供应商风险标签因数据源问题全部标为"low"（错误率约40%），导致错误的采购决策 - 解决方案：建立完整质量SLA体系 - 状态标签：覆盖率≥99%，时效≤4h，准确率≥92% - 合规标签：覆盖率=100%，时效≤30d，准确率≥98% - 预测标签：覆盖率≥95%，时效≤24h，准确率≥88% - 业务价值：质量监控上线后，标签错误被及时发现（MTTD从"几个月"→"实时"）
场景B：大促前标签质量全面扫描 - 业务问题：Black Friday前需要确保所有SKU的断货风险标签是最新的，但不知道系统是否正常运行 - 执行：触发全量质量扫描 → 发现 23 个 SKU 的`stockout_risk`标签超过 8h 未更新（数据源超时） - 业务价值：提前 48h 发现问题，修复后大促期间断货响应正常，防止 5 个 SKU 因未及时补货损失约 12 万元
三轨验证 | 成本轨：月均成本3,200元（标注工具订阅1,500元/月+人工审核12小时/月×100元/小时+模型微调GPU成本200元/月），ROI周期4个月 | 合规轨：符合《电商平台商品信息规范》和《跨境电商商品分类标准》，标签体系需通过母婴产品安全认证（GB/T 22796），结论：可合规实施 | 风险轨：标签误标导致产品违规下架（概率8%），影响SKU曝光；多语言标签翻译偏差（概率12%），影响海外站点转化；标注数据隐私泄露（概率3%），涉及消费者信息保护

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：质量监控使标签错误MTTD从"几个月"→"实时"，防止一次大规模错误标签导致的误操作损失（历史案例：供应商风险标签全错导致错误切换供应商，损失约20万元）；持续保障Action触发的准确率，每年防止误操作约10次
实施难度：⭐⭐☆☆☆（主要是定义SLA和建立监控Pipeline，工程量适中）
优先级评分：⭐⭐⭐⭐⭐（"无监控的自动化是最危险的"——标签质量保障是整个自动化体系的安全防线）
评估依据：Palantir实践：所有生产环境标签都有质量SLA和持续监控，这是"可信任的行动触发"的必要条件

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（260 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/tag_quality_coverage_kpi` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Tag-Quality-Coverage-KPI.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
标签质量 KPI 监控体系
功能：五维质量计算 / SLA合规检测 / 质量预警 / 抽样准确率验证 / 质量仪表盘
输入：实体标签数据 + Tag Schema（含SLA定义）
输出：质量KPI报告 + 预警列表 + 改善建议
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from collections import defaultdict
from scipy.stats import entropy
import warnings
warnings.filterwarnings('ignore')


def generate_tag_data(n_entities: int = 200, seed: int = 42) -> list:
    """生成模拟实体标签数据（含质量缺陷）"""
    np.random.seed(seed)
    now = datetime.now()
    entities = []

    for i in range(n_entities):
        entity = {"id": f"SKU-{i+1:03d}", "type": "SKU", "tags": {}}

        # stockout_risk：99%覆盖，但有些超时未更新
        if np.random.random() < 0.99:
            age_hours = np.random.choice([
                np.random.uniform(0, 3),    # 75% 正常
                np.random.uniform(8, 48),   # 15% 超时
                np.random.uniform(0, 1),    # 10% 刚更新
            ], p=[0.75, 0.15, 0.10])
            entity["tags"]["stockout_risk"] = {
                "value": np.random.choice(["critical", "high", "medium", "low", "none"],
                                          p=[0.05, 0.10, 0.25, 0.35, 0.25]),
                "updated_at": (now - timedelta(hours=age_hours)).isoformat(),
                "confidence": np.random.uniform(0.75, 1.0),
            }

        # abc_class：95%覆盖
        if np.random.random() < 0.95:
            entity["tags"]["abc_class"] = {
                "value": np.random.choice(["A", "B", "C", "D", "E"],
                                          p=[0.05, 0.13, 0.27, 0.30, 0.25]),
                "updated_at": (now - timedelta(hours=np.random.uniform(0, 720))).isoformat(),
                "confidence": np.random.uniform(0.80, 1.0),
            }

        # compliance_certs：85%覆盖（故意低）
        if np.random.random() < 0.85:
            entity["tags"]["compliance_certs"] = {
                "value": np.random.choice([["CE"], ["CE", "FDA"], ["FCC", "CE"], []],
                                          p=[0.35, 0.25, 0.25, 0.15]),
                "updated_at": (now - timedelta(days=np.random.uniform(0, 400))).isoformat(),
                "confidence": np.random.uniform(0.85, 1.0),
            }

        # 故意制造冲突标签（inventory_health互斥冲突）
        has_conflict = np.random.random() < 0.03  # 3%冲突率
        entity["tags"]["inventory_health"] = {
            "value": "healthy" if not has_conflict else "slow_moving",
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2206.07845，但该号在 arXiv 上是《Optimality of Matched-Pair Designs in Randomized Controlled Trials》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：实体标签数据与 Tag Schema（含各类标签的 SLA 定义：覆盖率、时效、准确率阈值）

**输出**：五维质量 KPI 报告、SLA 合规检测结果与预警列表、改善建议，供标签运营与自动化决策链使用

## 执行步骤

1. 按标签类型定义 SLA（覆盖率、时效、准确率、一致性、完整性）。
2. 周期性计算各维度质量指标并与 SLA 对比。
3. 触发全量质量扫描，找出超时未更新或异常标签的实体。
4. 用抽样人工验证校准准确率，输出预警与改善建议。

## 边界与不做

- 何时不用：要对单批商品目录做入湖前质量门控时，请转商品数据质量评估。
- 能力边界：只度量与告警标签质量，不自动重打标或修复标签值。
- 安全边界：标签涉及母婴产品安全与合规，误标可能导致违规下架；卡页原文要求保留抽样准确率验证与人工复核。

## 技能关联

- **前置**：Skill-Auto-Tagging-Pipeline-Rule-ML-LLM.html、Skill-Auto-Tagging-Pipeline-Rule-ML-LLM、Skill-Forecast-Bias-Adjustment-Detection.html、Skill-Forecast-Bias-Adjustment-Detection、Skill-Keyword-Competition-Scoring.html、Skill-Keyword-Competition-Scoring、Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO、Skill-Supply-Chain-KPI-Health-Dashboard.html、Skill-Supply-Chain-KPI-Health-Dashboard、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Tag-Propagation-Supply-Chain.html、Skill-Tag-Propagation-Supply-Chain、Skill-Tag-Schema-Engineering-Lifecycle.html、Skill-Tag-Schema-Engineering-Lifecycle
- **延伸**：Skill-Forecast-Bias-Adjustment-Detection.html、Skill-Forecast-Bias-Adjustment-Detection、Skill-Keyword-Competition-Scoring.html、Skill-Keyword-Competition-Scoring、Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO、Skill-Supply-Chain-KPI-Health-Dashboard.html、Skill-Supply-Chain-KPI-Health-Dashboard、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Tag-Propagation-Supply-Chain.html、Skill-Tag-Propagation-Supply-Chain
- **可组合**：Skill-Forecast-Bias-Adjustment-Detection.html、Skill-Forecast-Bias-Adjustment-Detection、Skill-Keyword-Competition-Scoring.html、Skill-Keyword-Competition-Scoring、Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO、Skill-Supply-Chain-KPI-Health-Dashboard.html、Skill-Supply-Chain-KPI-Health-Dashboard、Skill-Tag-Quality-Coverage-KPI

---

> 分类：数据与Agent平台/数据与AI运行/数据质量　·　技术族：24-标签工程　·　源卡：`Skill-Tag-Quality-Coverage-KPI`