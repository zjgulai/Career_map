---
name: "p2s-product-opportunity-scoring"
title: "Product Opportunity Scoring（新品机会评分卡）"
description: "触发词：机会评分卡、新品打分、多维加权、候选池、选品决策。何时不用：要对整个品类做三维机会评分时用「品类机会评分引擎」；要预测新品成功概率与首发区域时用「New Product Opportunity Mining」。安全边界：权重与阈值须按业务复核留档，评分只做候选分层、不等于立项结论；利润字段必须使用真实成本数据。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-022"
l3_business: "市场机会评估"
l3_all: "市场机会评估 / 组合取舍"
l1_l2_l3: "业务运营/产品与创新/市场机会评估"
p2s_card_id: "Skill-Product-Opportunity-Scoring"
p2s_src_domain: "06-增长模型"
quality_tier: "preview"
user_summary: "把候选新品的市场规模、竞争、毛利、趋势、合规和运营复杂度加权成一张评分卡，快速分出值得做的候选池。"
user_try: "试试：给便携式恒温暖奶器（USB 充电款）按六维评分卡打分，看它进不进候选池。"
whenToUse: "要在候选新品之间快速分层、需要一张可比的评分卡时用本技能；若评估对象是整个品类，用「品类机会评分引擎」；若要预测成功概率与首发区域，用「New Product Opportunity Mining」。"
workflow: "收集候选新品的六项指标（市场规模、竞争强度、利润空间、趋势方向、合规风险、运营复杂度） → 对各项指标归一化，竞争、合规、复杂度三项取反 → 按权重加权求和得到综合得分 → 按阈值分为 HIGH / CANDIDATE / LOW 分层"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Product Opportunity Scoring（新品机会评分卡）

## ① 解决的问题

产品总监面临机会排序混乱——Opportunity Scoring将误判率28%压到9%，年化省19万元

## ② 核心算法逻辑

多维度加权评分卡，综合评估新品机会：

## ③ 业务应用场景

候选新品“便携式恒温暖奶器（USB充电款）”评分过程： - 市场规模：月搜索量 18.5 万，BSR 品类总量 320 万美金 → 归一化 0.82 - 竞争强度：竞品 47 个，HHI 0.18 → 归一化 0.65（反比后 0.35） - 利润空间：售价 $29.99，成本 $8.50，FBA 费 $6.20 → 毛利率 51% → 0.78 - 趋势方向：近 6 个月搜索增长 +32% → 0.85 - 合规风险：需 UL 认证 + FDA 食品接触材料，已预审通过 → 0.70（反比后 0.30） - 运营复杂度：重量 0.6kg，退货率 8% → 0.55（反比后 0.45）
综合得分：0.25×0.82 + 0.20×0.35 + 0.20×0.78 + 0.15×0.85 + 0.10×0.30 + 0.10×0.45 = 0.64 → 候选池
实际运营结果：首批备货 2000 件，上架 30 天后日销 50 件，转化率 4.5%，ROAS 3.2。年化节省选品试错成本约 45 万元（对比此前凭感觉选品 60% 失败率），库存周转率从 2.1 次/年提升至 2.7 次/年（+28%）。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：系统化选品减少试错成本 50%+；年化 40-80 万元
难度：⭐⭐☆☆☆ | 优先级：⭐⭐⭐⭐⭐（5 星）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（19 行）。**下面 19 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **19 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，19 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/growth_model/product_opportunity_scoring` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-Product-Opportunity-Scoring.md`），已与卡面节选核对，不依赖上述路径。

```python
"""Product Opportunity Scoring"""

def opportunity_score(metrics: dict, weights: dict = None):
    w = weights or {'market_size': 0.25, 'competition': 0.20, 'margin': 0.20,
                     'trend': 0.15, 'compliance': 0.10, 'complexity': 0.10}
    # competition, compliance, complexity are inverse (higher=worse)
    if 'competition' in metrics: metrics['competition'] = 1 - metrics['competition']
    if 'compliance' in metrics: metrics['compliance'] = 1 - metrics['compliance']
    if 'complexity' in metrics: metrics['complexity'] = 1 - metrics['complexity']
    return sum(w.get(k, 0) * v for k, v in metrics.items())

def classify(score):
    return "HIGH" if score > 0.65 else ("CANDIDATE" if score > 0.45 else "LOW")

# test
s = opportunity_score({'market_size':0.8, 'competition':0.4, 'margin':0.85, 'trend':0.75, 'compliance':0.5, 'complexity':0.4})
print(f"Score: {s:.2f} → {classify(s)}")
assert s > 0.65
print("[✓] Product Opportunity Scoring 测试通过")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：候选新品的六项指标：市场规模（月搜索量、品类 BSR 总量）、竞争强度（竞品数、HHI）、利润空间（售价、成本、FBA 费）、趋势方向（近 6 个月搜索增长）、合规风险（认证要求与预审状态）、运营复杂度（重量、退货率）。

**输出**：归一化后的六维得分、加权综合得分与 HIGH / CANDIDATE / LOW 分层结果，作为候选池筛选与后续小批量试单决策的输入。

## 执行步骤

1. 收集候选新品的六项指标
2. 归一化各指标并对竞争、合规、复杂度取反
3. 按权重加权求和得出综合得分
4. 按阈值划分 HIGH / CANDIDATE / LOW 分层
5. 对入选品项安排小批量试单并回看评分准确性

## 边界与不做

- 六项指标有缺项或只能定性估计时不适用，加权结果会失真
- 评分只做候选分层，不等于立项结论，也不替代成本核算与合规认证
- 权重与阈值须按业务复核并留档，利润字段必须使用真实成本数据

## 技能关联

- **前置**：Skill-Category-Trend-Forecasting.html、Skill-Category-Trend-Forecasting、Skill-Competitor-Product-Intelligence.html、Skill-Competitor-Product-Intelligence、Skill-Cross-Border-Cold-Start-Forecast.html、Skill-Cross-Border-Cold-Start-Forecast、Skill-Cross-Market-Product-Transfer.html、Skill-Cross-Market-Product-Transfer、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Guardrailed-CATE-NBA.html、Skill-Guardrailed-CATE-NBA、Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-Market-Size-Estimation.html、Skill-Market-Size-Estimation、Skill-Product-Lifecycle-Stage.html、Skill-Product-Lifecycle-Stage、Skill-Supplier-Evaluation-Model.html、Skill-Supplier-Evaluation-Model、Skill-UCB-LDP-Dynamic-Pricing.html、Skill-UCB-LDP-Dynamic-Pricing
- **可组合**：Skill-Cross-Border-Cold-Start-Forecast.html、Skill-Cross-Border-Cold-Start-Forecast、Skill-Cross-Market-Product-Transfer.html、Skill-Cross-Market-Product-Transfer、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Guardrailed-CATE-NBA.html、Skill-Guardrailed-CATE-NBA、Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-Market-Size-Estimation.html、Skill-Market-Size-Estimation、Skill-Product-Lifecycle-Stage.html、Skill-Product-Lifecycle-Stage、Skill-Supplier-Evaluation-Model.html、Skill-Supplier-Evaluation-Model、Skill-UCB-LDP-Dynamic-Pricing.html、Skill-UCB-LDP-Dynamic-Pricing、Skill-Product-Opportunity-Scoring

---

> 分类：业务运营/产品与创新/市场机会评估　·　技术族：06-增长模型　·　源卡：`Skill-Product-Opportunity-Scoring`