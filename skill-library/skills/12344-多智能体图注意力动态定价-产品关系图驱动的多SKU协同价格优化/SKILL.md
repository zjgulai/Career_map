---
name: "p2s-mappo-gat-dynamic-pricing"
title: "MAPPO+GAT多智能体图注意力动态定价 — 产品关系图驱动的多SKU协同价格优化"
description: "触发词：多 SKU 协同定价、产品关系图、图注意力、交叉弹性、联动促销、组合利润。何时不用：单 SKU 或 SKU 间无关联用「动态定价与需求弹性」；只求两卖家博弈均衡用「纳什均衡定价模型」。安全边界：所有 SKU 定价不得低于成本价，避免被平台识别为系统性低价倾销，联动降价前评估账户审查与竞品反制风险。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性 / 组合设计"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-MAPPO-GAT-Dynamic-Pricing"
p2s_src_domain: "17-价格优化"
quality_tier: "preview"
user_summary: "别一个个 SKU 单独定价：把商品间关系画成图，让相关 SKU 一起调价，把联带销售的钱赚回来。"
user_try: "试试：我有吸奶器主机、配件包、储奶袋等 5 个相关 SKU，帮我建产品关系图，算一版大促联动定价方案。"
whenToUse: "当同时经营 10 个以上互相关联（互补或替代）的 SKU、要把交叉弹性纳入定价时用本技能；SKU 彼此独立或只做单点调价，用「动态定价与需求弹性」；只需与单一竞品的博弈均衡，用「纳什均衡定价模型」。"
workflow: "按 SKU 建立产品图并标注互补或替代边 → 用历史同单购买与价格-销量数据学习关系图边权重 → 训练 MAPPO+GAT，让每个定价 Agent 感知相邻 SKU 的价格状态 → 大促期按联动方案下发各 SKU 折扣，例如主机、配件、储奶袋分档降价 → 用成本底线与单次调幅约束复核方案后再执行"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# MAPPO+GAT多智能体图注意力动态定价 — 产品关系图驱动的多SKU协同价格优化

## ① 解决的问题

独立对每个SKU定价忽略产品间价格交叉弹性导致组合利润显著低于最优解——MAPPO+GAT图注意力让每个定价Agent感知相关SKU状态，组合协同定价比独立定价提升10-20%总利润（2025 arXiv:2511.00039）

## ② 核心算法逻辑

反直觉洞察：单品定价策略通常独立优化每个SKU的价格，这在只有一个商品时够用，但母婴卖家通常同时运营50200个SKU，这些SKU之间存在复杂的价格交叉弹性——提高吸奶器价格会影响配件销售；婴儿奶粉降价可能带动婴儿食品全品类销售。反直觉发现：单独优化每个SKU价格的总利润，远低于考虑SKU间交互的协同定价。MAPPO+GAT将产品关系建模为图（每个SKU是一个节点，价格关联是边），让每个定价Agent能"看到"其他SKU的价格信息，实现

## ③ 业务应用场景

- 业务问题：某卖家同时销售吸奶器主机+配件包+储奶袋+清洁套装，目前各自独立定价，Amazon大促期间吸奶器主机降价20%，但配件销售并未同步增长（错过了联带销售机会） - 数据要求：每个SKU的历史价格/日销量/库存/竞品价格；各SKU间的历史购买关联（是否同单购买） - MAPPO+GAT应用： 1. 构建5个SKU的产品图（吸奶器主机-配件包-储奶袋-清洁套装-电源线），定义互补边 2. 训练：主机降价时，GAT自动传播信号给配件节点，相应降低配件价格，触发联带购买 3. 大促期间：主机-20%，配件-15%，储奶袋-10%，形成联动促销 - 预期产出：组合销售GMV比独立定价高约15
三轨验证： - 成本：数据采集需接入Amazon SP-API获取各SKU日级价格/销量/库存数据（约$500/月API费用）；计算资源需GPU实例（如g4dn.xlarge）训练约40小时（约$200）；人力投入需1名数据工程师+1名算法工程师共2周（约$4000） - 合规：Amazon定价政策禁止操纵价格（如人为制造价格倒挂），需确保所有SKU定价不低于成本价；GDPR不直接适用（企业级商业数据），但需注意不收集/处理个人消费者数据；不涉及广告法 - 风险：若多个SKU同时大幅降价，可能被Amazon算法识别为"系统性低价倾销"触发账户审查；互补品联动降价可能被竞品反向利用（如竞品故意压
- 业务问题：同一款吸奶器在US/UK/DE三个市场定价独立，当US市场竞品降价时，UK市场的同款用户也可能转向竞品（通过网络效应），但当前定价系统无法捕捉跨市场关联 - MAPPO+GAT跨市场应用：将不同市场的同款SKU视为图中相连节点，学习市场间的价格溢出效应，实现协同定价响应

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：50个SKU的母婴组合，协同定价比独立定价提升约10-20%总利润；月GMV$20万情况下，月增利润约$2000-4000；系统建设$4万，ROI≈600%
实施难度：⭐⭐⭐⭐☆（MARL训练需要仿真环境，产品关系图边权重需要从历史数据学习；需要足够的探索时间收敛）
优先级：⭐⭐⭐⭐☆（适合有一定规模的多SKU卖家，单SKU卖家不需要；但对大型母婴品牌而言价值极高）
适用规模：同时运营10+个相互关联SKU的卖家，SKU越多、关联越强，协同定价价值越大
数据依赖：各SKU历史价格和销量数据（用于学习产品关联图边权重）；需要定价仿真环境

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（255 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/pricing/mappo_gat_dynamic_pricing` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/17-价格优化/Skill-MAPPO-GAT-Dynamic-Pricing.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
MAPPO+GAT多智能体图注意力动态定价
基于 arXiv:2511.00039 (2025)
产品关系图驱动的多SKU协同价格优化
"""
import numpy as np
from collections import defaultdict
import warnings
warnings.filterwarnings('ignore')


class ProductGraph:
    """产品关系图"""
    def __init__(self, n_skus):
        self.n_skus = n_skus
        self.adj_matrix = np.zeros((n_skus, n_skus))  # 邻接矩阵（有权）

    def add_edge(self, sku_i, sku_j, weight=1.0, bidirectional=True):
        """添加产品关联边"""
        self.adj_matrix[sku_i][sku_j] = weight
        if bidirectional:
            self.adj_matrix[sku_j][sku_i] = weight

    def get_neighbors(self, sku_id, threshold=0.1):
        """获取相关SKU"""
        row = self.adj_matrix[sku_id]
        return [(j, row[j]) for j in range(self.n_skus) if abs(row[j]) > threshold and j != sku_id]


class GATLayer:
    """简化版图注意力层"""
    def __init__(self, in_dim, out_dim):
        np.random.seed(42)
        self.W = np.random.randn(in_dim, out_dim) * 0.1
        self.a = np.random.randn(2 * out_dim) * 0.1

    def attention_weight(self, h_i, h_j):
        """计算注意力权重"""
        h_concat = np.concatenate([h_i @ self.W, h_j @ self.W])
        return max(np.dot(self.a, h_concat), 0)  # LeakyReLU

    def forward(self, features, adj_matrix):
        """图注意力前向传播"""
        n = len(features)
        out = np.zeros((n, self.W.shape[1]))

        for i in range(n):
            # 计算与所有邻居的注意力权重
            attn_weights = []
            neighbors = [(j, adj_matrix[i][j]) for j in range(n) if adj_matrix[i][j] > 0]
            neighbors.append((i, 1.0))  # 自环

            for j, edge_w in neighbors:
                a_ij = self.attention_weight(features[i], features[j]) * abs(edge_w)
                attn_weights.append((j, a_ij, edge_w))

            # Softmax归一化
            total_attn = sum(w for _, w, _ in attn_weights) + 1e-9
            normalized = [(j, w / total_attn, ew) for j, w, ew in attn_weights]
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2511.00039 — Graph-Attentive MAPPO for Dynamic Retail Pricing

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：每个 SKU 的历史价格、日销量、库存与竞品价格，以及 SKU 之间的历史购买关联（是否同单购买）用于学习关系图边权重；需具备定价仿真环境；粒度为 SKU × 天。

**输出**：多 SKU 协同定价方案：各 SKU 建议价与折扣、联动组合方式，以及相对独立定价的组合利润增益；供多 SKU 卖家在大促与日常定价排期中使用。

## 执行步骤

1. 按 SKU 建立产品关系图并标注互补或替代边
2. 用历史同单购买与价格销量数据学习边权重
3. 训练 MAPPO 与图注意力网络，让 Agent 感知邻接 SKU 状态
4. 按联动方案下发各 SKU 折扣并形成组合促销
5. 用成本底线与调幅约束复核方案后执行

## 边界与不做

- 数据不满足：SKU 数量少或彼此无购买关联时建模无意义，卡页适用规模为 10 个以上关联 SKU。
- 何时不用：单 SKU 调价用「动态定价与需求弹性」；与单一竞品的博弈均衡用「纳什均衡定价模型」。
- 能力边界：只输出协同定价方案与仿真结论，不含改价执行，也不含仿真环境与 GPU 训练资源搭建。
- 安全边界：所有 SKU 价格不得低于成本价，避免触发平台系统性低价倾销审查。

## 技能关联

- **前置**：Skill-Autobidding-Budget-Allocation-Optimization.html、Skill-Autobidding-Budget-Allocation-Optimization、Skill-Causal-RL-Dynamic-Pricing.html、Skill-Causal-RL-Dynamic-Pricing、Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Dynamic-Bundle-Pricing.html、Skill-Dynamic-Bundle-Pricing、Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing
- **延伸**：Skill-Autobidding-Budget-Allocation-Optimization.html、Skill-Autobidding-Budget-Allocation-Optimization、Skill-Dynamic-Bundle-Pricing.html、Skill-Dynamic-Bundle-Pricing、Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing
- **可组合**：Skill-Autobidding-Budget-Allocation-Optimization.html、Skill-Autobidding-Budget-Allocation-Optimization、Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator、Skill-MAPPO-GAT-Dynamic-Pricing

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：17-价格优化　·　源卡：`Skill-MAPPO-GAT-Dynamic-Pricing`