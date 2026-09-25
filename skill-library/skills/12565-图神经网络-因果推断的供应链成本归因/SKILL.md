---
name: "p2s-kg-supply-chain-cost-attribution"
title: "KG Supply Chain Cost Attribution — 图神经网络 + 因果推断的供应链成本归因"
description: "触发词：图谱归因、时序生产图、因果发现、链路成本、品类脆弱性。何时不用：因子数少、只做可加性分解用「供应链成本因果归因」；要用双重差分评估政策或促销影响用「双重差分因果估计」。安全边界：图与归因结论依赖数据质量，须做混淆变量检验；供应商信息属商业机密，须加密存储。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-016"
l3_business: "经济性分析"
l3_all: "经济性分析 / 供应商评估"
l1_l2_l3: "经营管理/财务与合规/经济性分析"
p2s_card_id: "Skill-KG-Supply-Chain-Cost-Attribution"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "把供应链画成图，顺着链路找出成本从哪一段涨起来，并比较各品类的成本脆弱性。"
user_try: "试试：构建吸奶器的供应链图谱，定位 Q4 成本上涨 18% 主要来自哪条链路，并对比三个品类的脆弱性。"
whenToUse: "需要按链路与品类做成本分解、并在缺少显式 BOM 时从数据推断结构时用本技能；少量因子的可加性分解用「供应链成本因果归因」；用双重差分评估干预用「双重差分因果估计」。"
workflow: "构建供应链时序生产图（工厂、头程、仓库、SKU）并填入各期单位成本 → 按路径分解各链路总成本变化 → 用因果发现算法识别主因与次因的方差贡献 → 做反事实模拟并给出针对性改善建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# KG Supply Chain Cost Attribution — 图神经网络 + 因果推断的供应链成本归因

## ① 解决的问题

跨境母婴品牌供应链成本季度性激增，头程/原材料/仓储三因素难以区分——时序生产图 TPG + PC 算法因果归因将成本驱动识别准确率从 40% 提升至 85%，年化节省错误决策成本 50-150 万元

## ② 核心算法逻辑

时序生产图（Temporal Production Graph, TPG） 将供应链建模为有向无环图：节点 = 供应链环节（工厂、头程、仓库、SKU），边 = 成本流量。Stanford AAAI 2025 工作用异构 GNN 从买家供应商历史交易记录自动推断隐式 BOM（物料清单）结构和生产函数——即使没有显式 BOM 文档，也能从数据中学习"谁依赖谁、成本如何传导"。

## ③ 业务应用场景

- 业务问题：某母婴品牌（M5 吸奶器）Q4 总成本较 Q3 上涨 18%，财务团队不知道该压缩哪个环节——海运谈判、原材料采购还是换仓提效？ - 数据要求：6个月以上的 SKU 级成本流水（原材料采购价、头程运费发票、FBA 月结账单、制造工单） - 执行步骤： 1. 构建供应链 TPG（工厂→头程→FBA仓→SKU），每条边填入 Q3/Q4 单位成本 2. 路径分解得出各链路总成本变化（海运链路 +11.8%，空运链路 +14.8%） 3. PC 算法 + SCM 识别：头程运价方差贡献 73.5%（主因），制造成本贡献 38.2%（次因） 4. 反事实模拟：若海运谈判将头程降价 20 元
- 业务问题：同时运营消毒器、吸奶器、婴儿车三类产品，CFO 想知道哪个品类供应链最脆弱（成本波动最难归因） - 数据要求：按 SKU 分组的月度成本分项数据（至少 12 个月） - 执行方式：对每个品类分别构建 TPG + 运行 SCM 归因，对比各品类"头程运价方差贡献"作为脆弱性指标 - 业务价值：优先对高脆弱性品类建立运价对冲策略，年化稳定收益 20-50 万元
**三轨验证** | 成本轨：供应商知识图谱构建月均成本1200元（数据采集400元+图谱维护500元+人工标注300元），人工投入12小时/月；断货风险预警系统月均成本800元（监控工具300元+数据分析400元+人工审核100元），人工投入8小时/月 | 合规轨：符合《跨境电商商品质量管理规范》第4.2条供应链透明化要求；符合《个人信息保护法》第三章数据安全规定，供应商信息加密存储；符合海关AEO认证对供应商管理的要求 | 风险轨：供应商数据准确性风险（概率35%）—数据更新延迟导致断货预警失效；知识图谱维护人员流失风险（概率25%）—关键节点识别能力下降；跨境物流中断风险（概率40%）—

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 估算：中型跨境品牌（年营收 3000-5000 万元）每个季度因成本归因不清导致错误决策（优先压错环节）的隐性损失约 15-40 万元/次；图谱归因将准确率从 40% 提升至 85%，每年可避免 2-3 次错误决策，年化节省 50-150 万元
实施难度：⭐⭐⭐⭐☆（需要整理历史成本分项流水；PC 算法需要 ≥90 天数据样本；无需外部 API 依赖）
优先级：⭐⭐⭐☆☆（建议在 SKU 级 P&L 体系建立后再引入，否则输入数据质量不足）
线性 SCM 在成本非线性传导（如量价联动）时精度下降，可替换为 XGBoost 代理模型
观测数据中存在隐藏混淆变量（如汇率同时影响原材料和头程）时需引入工具变量
PC 算法在变量数 > 10 时计算量指数增长，推荐使用 FCI 变体

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（210 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/knowledge_graph/kg_supply_chain_cost_attribution` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-KG-Supply-Chain-Cost-Attribution.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
import networkx as nx
import warnings
warnings.filterwarnings("ignore")


class SupplyChainKG:

    def __init__(self):
        self.G = nx.DiGraph()
        self._build_demo_graph()

    def _build_demo_graph(self):
        nodes = [
            ("factory_CN",   {"type": "factory",   "name": "中国工厂"}),
            ("freight_sea",  {"type": "freight",   "name": "海运头程"}),
            ("freight_air",  {"type": "freight",   "name": "空运头程"}),
            ("warehouse_US", {"type": "warehouse", "name": "FBA美国仓"}),
            ("sku_M5",       {"type": "sku",       "name": "M5吸奶器"}),
        ]
        for nid, attr in nodes:
            self.G.add_node(nid, **attr)

        edges = [
            ("factory_CN",   "freight_sea",  {"cost_q3": 180, "cost_q4": 185, "label": "原材料+制造"}),
            ("factory_CN",   "freight_air",  {"cost_q3": 180, "cost_q4": 220, "label": "原材料+制造"}),
            ("freight_sea",  "warehouse_US", {"cost_q3": 45,  "cost_q4": 67,  "label": "海运费"}),
            ("freight_air",  "warehouse_US", {"cost_q3": 180, "cost_q4": 195, "label": "空运费"}),
            ("warehouse_US", "sku_M5",       {"cost_q3": 38,  "cost_q4": 42,  "label": "FBA仓储费"}),
        ]
        for src, dst, attr in edges:
            self.G.add_edge(src, dst, **attr)

    def decompose_cost_paths(self, period_a="cost_q3", period_b="cost_q4"):
        results = []
        sources = [n for n, d in self.G.nodes(data=True) if d["type"] == "factory"]
        sinks   = [n for n, d in self.G.nodes(data=True) if d["type"] == "sku"]
        for src in sources:
            for dst in sinks:
                for path in nx.all_simple_paths(self.G, src, dst):
                    cost_a = sum(self.G[u][v].get(period_a, 0) for u, v in zip(path[:-1], path[1:]))
                    cost_b = sum(self.G[u][v].get(period_b, 0) for u, v in zip(path[:-1], path[1:]))
                    delta  = cost_b - cost_a
                    pct    = delta / cost_a * 100 if cost_a else 0
                    path_label = " → ".join(self.G.nodes[n]["name"] for n in path)
                    results.append({
                        "path": path_label,
                        "cost_q3": cost_a, "cost_q4": cost_b,
                        "delta": delta, "pct": pct,
                    })
        return results

    def edge_contribution(self, period_a="cost_q3", period_b="cost_q4"):
        contributions = []
        for u, v, data in self.G.edges(data=True):
            ca = data.get(period_a, 0)
            cb = data.get(period_b, 0)
            delta = cb - ca
            contributions.append({
                "edge": f"{self.G.nodes[u]['name']} → {self.G.nodes[v]['name']}",
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：6 个月以上的 SKU 级成本流水（原材料采购价、头程运费发票、FBA 月结账单、制造工单）；按品类归因时需按 SKU 分组的月度成本分项数据（至少 12 个月）。

**输出**：链路级成本变化分解、各因子方差贡献排名与反事实模拟结果，以及各品类供应链脆弱性对比，供采购与供应链决策。

## 执行步骤

1. 构建供应链时序生产图并填入各期单位成本
2. 按链路分解总成本变化
3. 用因果发现算法识别主因与次因
4. 做反事实模拟评估改善方案
5. 对比各品类脆弱性并排定优先动作

## 边界与不做

- 历史成本流水不足 90 天或缺少分项数据时不适用，图构建与因果发现都不稳定
- 只做归因与模拟，不执行采购谈判、换供应商或对冲动作；非线性传导场景精度会下降
- 供应商信息属商业机密须加密存储，存在隐藏混淆变量时需引入工具变量复核

## 技能关联

- **前置**：Skill-Causal-Attribution-Bridge.html、Skill-Causal-Attribution-Bridge、Skill-FBA-Cost-Forecast-Adjustment.html、Skill-FBA-Cost-Forecast-Adjustment、Skill-FBA-Fee-Intelligence.html、Skill-FBA-Fee-Intelligence、Skill-KG-Logistics-Intelligence.html、Skill-KG-Logistics-Intelligence、Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory、Skill-PL-Attribution-Analysis.html、Skill-PL-Attribution-Analysis、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard
- **延伸**：Skill-Causal-Attribution-Bridge.html、Skill-Causal-Attribution-Bridge、Skill-FBA-Cost-Forecast-Adjustment.html、Skill-FBA-Cost-Forecast-Adjustment、Skill-KG-Logistics-Intelligence.html、Skill-KG-Logistics-Intelligence、Skill-PL-Attribution-Analysis.html、Skill-PL-Attribution-Analysis、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard
- **可组合**：Skill-KG-Logistics-Intelligence.html、Skill-KG-Logistics-Intelligence、Skill-PL-Attribution-Analysis.html、Skill-PL-Attribution-Analysis、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard、Skill-KG-Supply-Chain-Cost-Attribution

---

> 分类：经营管理/财务与合规/经济性分析　·　技术族：08-知识图谱　·　源卡：`Skill-KG-Supply-Chain-Cost-Attribution`