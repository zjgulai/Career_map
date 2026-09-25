---
name: "p2s-caged-debiased-rec"
title: "因果图聚合权重去偏推荐 - CAGED"
description: "触发词：推荐去偏、长尾曝光、流行度偏差、GNN 权重聚合、长尾覆盖率。何时不用：要解决的是推荐结果说不清、用户不信任（需要一句话解释）时用「可解释推荐」；要优化的是搜索结果排序时用「个性化搜索排序」。安全边界：只产出无偏权重与推荐列表，不改推荐服务架构。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-065"
l3_business: "商品诊断"
l3_all: "商品诊断 / 转化优化"
l1_l2_l3: "业务运营/渠道经营/商品诊断"
p2s_card_id: "Skill-CAGED-Debiased-Rec"
p2s_src_domain: "05-推荐系统"
quality_tier: "preview"
user_summary: "把推荐算法对爆款的偏爱纠回来，让换配件和特殊尺码这类长尾商品也能被推出去。"
user_try: "试试：用最近 6 个月的行为日志跑一次去偏推荐，看看长尾商品在 Top-20 里能占多少。"
whenToUse: "当推荐流量高度集中在少数爆款、长尾商品几乎零曝光、需要从图聚合权重层面纠偏时用本技能；若要解决的是推荐结果说不清、用户不信任，用「可解释推荐」；若要优化的是搜索结果排序，用「个性化搜索排序」。"
workflow: "从行为日志构建 user-item 交互并建图 → 训练 CAGED 估计无偏因果权重 → 排除已购后生成去偏 Top-20 推荐 → 用长尾覆盖率与有偏无偏对比评估"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 因果图聚合权重去偏推荐 - CAGED

## ① 解决的问题

Momcozy 吸奶器爆款 SKU 占全部流量的 60%+，200 余款配件（替换配件、特殊尺码）几乎零曝光

## ② 核心算法逻辑

GNN 推荐系统（如 LightGCN）在图上做邻居聚合时，边权重天然由度数平方根决定。热门商品度数高，信息在传播时被反复放大，形成"回声室效应"——推荐系统拼命推爆款，长尾优质商品彻底失声。

## ③ 业务应用场景

业务问题： Momcozy 吸奶器爆款 SKU 占全部流量的 60%+，200 余款配件（替换配件、特殊尺码）几乎零曝光。新品在首页推荐中竞争不过历史交互量高的爆款，导致配件库存积压，复购品类单一。
数据要求： - 用户行为日志（session_id, user_id, item_id, event_type: view/add_cart/purchase, timestamp） - 商品属性表（item_id, category, price, stock, launch_date） - 最近 6 个月数据，至少 5 万用户 × 1000 SKU
预期产出： - 无偏因果偏好权重矩阵（user × item） - 去偏后的 Top-20 推荐列表，长尾商品（月销 < 50 件）占比提升至 40%+ - 每周更新一次权重，对接现有推荐服务

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

实施成本：算法工程师 2 周集成（CAGED 模块 Plug-in 到现有 LightGCN 服务），训练额外耗时 +20%（ELBO 优化）
预期收益：长尾商品 GMV 提升 10-25%，以中型跨境品牌月 GMV 500 万元计 → 年增 GMV 600-1500 万元
隐性价值：降低爆款断货风险（库存分散）、提升平台生态健康度（卖家多样性增加）
算法本身为 Plug-and-play，不重构推荐服务架构
纯 numpy 可运行，无需 GPU（小数据集）；大规模需 PyTorch 版本
流行度偏差是跨境电商推荐系统的普遍性根本问题，不是边缘 case

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（44 行）。**下面 44 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **44 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，44 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/recommendation/caged_debiased_rec` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/05-推荐系统/Skill-CAGED-Debiased-Rec.md`），已与卡面节选核对，不依赖上述路径。

```python
from model import CAGEDRecommendationPipeline, long_tail_coverage

# 初始化管线
pipeline = CAGEDRecommendationPipeline(
    num_users=10000,
    num_items=2000,
    embed_dim=64,
    latent_dim=32,
    n_layers=3,
    momentum=0.9,
)

# 从行为日志构建交互列表
interactions = [(row.user_id, row.item_id) for row in behavior_log]
pipeline.build_graph(interactions)

# 训练 CAGED 估计无偏权重（实际应用中 epochs=50-200）
history = pipeline.train(interactions, epochs=50)

# 为用户生成去偏推荐
user_id = 12345
exclude = [i for i in user_history[user_id]]  # 排除已购商品

unbiased_recs = pipeline.get_recommendations(
    user_id=user_id,
    top_k=20,
    exclude_items=exclude,
    use_unbiased=True,
)

# 评估长尾覆盖率
item_ids = [i for i, _ in unbiased_recs]
tail_cov = long_tail_coverage(
    item_ids,
    pipeline.caged.item_popularity,
    tail_threshold=0.1,  # 流行度归一化后 <10% 视为长尾
)
print(f"长尾覆盖率: {tail_cov:.1%}")

# 对比有偏/无偏效果
result = pipeline.compare_biased_vs_unbiased(user_id=user_id, top_k=20)
print(f"有偏推荐: {[i for i, _ in result['biased'][:5]]}")
print(f"无偏推荐: {[i for i, _ in result['unbiased'][:5]]}")
print("[✓] CAGED Debiased Rec 测试通过")
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2510.04502 — Causality-aware Graph Aggregation Weight Estimator for Popularity Debiasing in Top-K Recommendation

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：最近 6 个月的用户行为日志（session_id、user_id、item_id、event_type ∈ view/add_cart/purchase、timestamp）与商品属性表（item_id、category、price、stock、launch_date）；卡页规模口径至少 5 万用户 × 1000 SKU；粒度为用户 × 商品交互。

**输出**：无偏因果偏好权重矩阵（user × item）、去偏后的 Top-20 推荐列表（含长尾商品占比，卡页口径提升至 40%+）、有偏与无偏的对比结果；每周更新一次权重，供推荐服务或算法工程师接入。

## 执行步骤

1. 从行为日志构建 user-item 交互列表并建图
2. 训练 CAGED 估计无偏因果权重（含 ELBO 优化，卡页建议 epochs 50-200）
3. 排除已购商品后为指定用户生成 Top-20 去偏推荐
4. 用长尾覆盖率（卡页阈值：流行度归一化后 <10% 视为长尾）与有偏无偏对比评估效果
5. 每周刷新权重并对接现有推荐服务

## 边界与不做

- 数据不满足：交互量低于卡页口径（5 万用户 × 1000 SKU、6 个月）时长尾信号不足，去偏权重不稳定。
- 何时不用：要解决的是推荐结果无法解释、用户不信任，用「可解释推荐」；要优化的是搜索结果排序而非推荐位排序，用「个性化搜索排序」。
- 能力边界：只产出无偏权重与推荐列表，不重构推荐服务架构（卡页为 plug-and-play 模块）；卡页的长尾 GMV +10-25%、年增 600-1500 万元为按中型品牌月 GMV 500 万测算的案例值。

## 技能关联

- **前置**：Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-Session-Based-Recommendation-SR-GNN.html、Skill-Session-Based-Recommendation-SR-GNN
- **延伸**：Skill-Cold-Start-Meta-Learning-PAM.html、Skill-Cold-Start-Meta-Learning-PAM、Skill-Counterfactual-Recommendation-DCE.html、Skill-Counterfactual-Recommendation-DCE
- **可组合**：Skill-Agentic-Workflow-Compilation.html、Skill-Agentic-Workflow-Compilation、Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-DS-DGA-GCN-Fake-Review-Group.html、Skill-DS-DGA-GCN-Fake-Review-Group、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-GraphDeepAR-Demand-Forecasting.html、Skill-GraphDeepAR-Demand-Forecasting、Skill-CAGED-Debiased-Rec

---

> 分类：业务运营/渠道经营/商品诊断　·　技术族：05-推荐系统　·　源卡：`Skill-CAGED-Debiased-Rec`