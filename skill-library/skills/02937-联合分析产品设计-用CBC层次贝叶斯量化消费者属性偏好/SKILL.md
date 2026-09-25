---
name: "p2s-conjoint-analysis-product-design"
title: "联合分析产品设计 — 用CBC+层次贝叶斯量化消费者属性偏好"
description: "触发词：联合分析、属性权重、CBC 问卷、支付意愿、新品属性组合。何时不用：属性已经定好、只需从差评里排改进优先级时用「VOC 产品迭代信号提取」；还在判断品类值不值得进时用「Blue Ocean Category Discovery」。安全边界：问卷不得暗示即将上市或引导留评，调研结果不得包装成临床证明用于营销素材；结果公开前需评估竞品针对性定价风险。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-026"
l3_business: "产品需求定义"
l3_all: "产品需求定义 / 需求分群"
l1_l2_l3: "业务运营/产品与创新/产品需求定义"
p2s_card_id: "Skill-Conjoint-Analysis-Product-Design"
p2s_src_domain: "05-推荐系统"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "在新品上市前量化消费者最看重哪些属性、愿意为某项认证多付多少钱，把属性组合与定价决策从感觉变成数据。"
user_try: "试试：新款纸尿裤待定有机认证、BPA-free、价格区间和包装，用 CBC 问卷帮我算属性权重和愿付溢价。"
whenToUse: "属性组合还没定、需要知道哪个属性最影响购买决策时用本技能；若属性已定、只需从差评里找改进优先级，用「VOC 产品迭代信号提取」；若还在判断品类是否值得进入，用「Blue Ocean Category Discovery」。"
workflow: "确定待测属性与水平（认证/价格/包装/品牌），用效果编码展开 → 设计约 12-15 个选择集、每集 3 个假想产品组合 → 招募 200-500 名目标消费者完成 CBC 问卷 → 用层次贝叶斯 MNL 估计属性效用与 WTP → 输出属性重要度排序、愿付溢价与消费者细分"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 联合分析产品设计 — 用CBC+层次贝叶斯量化消费者属性偏好

## ① 解决的问题

产品负责人面临"新品属性组合（有机/BPA-free/价格区间）靠感觉定不知道哪个最重要"——联合分析量化消费者属性权重，新品成功率提升28%，年化节省无效研发投入$4.2万

## ② 核心算法逻辑

来自心理学/经济学的离散选择理论：联合分析（Conjoint Analysis）根植于Luce & Tukey（1964）的属性权衡心理学理论——人类在评估产品时，会对多维属性进行隐性权衡（tradeoff）。市场研究者将这个洞察转化为「强迫选择实验」：给消费者一系列精心设计的产品组合，通过他们的选择反推每个属性对决策的权重。

## ③ 业务应用场景

- 业务问题：计划推出新款纸尿裤，待定属性包括：认证（普通/BPA-free/有机GOTS）、价格区间（15/20/25美元/包）、包装（普通/可降解）、品牌（自有/OEM知名品牌）。产品经理需要知道「先做有机认证还是先降价？」 - 数据要求：对200-500名目标消费者（Amazon买家/TikTok用户）做CBC问卷（约12-15个选择集），每个选择集呈现3个假想产品组合 - 预期产出： - 属性重要度排序（如：认证>价格>品牌>包装） - WTP估算（为有机认证愿意多支付$X） - 细分发现（价格敏感型30% vs 健康优先型45% vs 品牌忠诚型25%） - 业务价值：避免为消费者不
三轨验证： - 成本：数据采集成本约 $2,000-$5,000（Amazon Mechanical Turk或TikTok广告投放招募200-500人）；计算资源成本极低（单机Python即可完成HB估计）；人力成本约2-3人周（问卷设计+分析+报告）。 - 合规：Amazon政策允许消费者调研，但不得在问卷中暗示“即将上市”或引导留评；GDPR要求明确告知数据用途并获取同意；广告法（FTC）禁止将调研结果包装为“临床证明”用于营销素材。 - 风险：若调研结果公开，可能引发竞品针对性定价或认证升级；问卷设计不当（如价格阶梯过低）会低估真实WTP，导致定价策略失误；品牌损伤风险低，但需避免问卷
- 业务问题：设计奶粉+奶瓶+消毒锅的礼盒组合，不同组合定价差异大，需要找到「最大化购买意愿的最优组合」 - 数据要求：CBC实验，属性包括组合内容（单品/二件套/三件套）、价格阶梯、是否含免费配送 - 预期产出：最优产品束（Bundle）配置和定价，礼盒转化率预计提升 20-25%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：母婴跨境新品开发周期通常 6-12 个月，传统靠焦点小组失败率约 40%；CBC联合分析在上市前量化属性权重，使开发资源集中在高权重属性（有机认证 > 品牌 > 包装），新品开发成功率提升 25-35%，等效节省一次失败上新的沉没成本约 80-150 万元/年
实施难度：⭐⭐⭐⭐☆（需要专项消费者调研，问卷设计有技巧，但可用 Google Forms + 本代码离线分析）
优先级：⭐⭐⭐☆☆（适合有新品开发节奏的品牌，非高频但高价值决策）
独特价值：唯一能在新品上市前量化「为有机认证愿意多支付多少钱」的方法，将产品决策从经验驱动转向数据驱动

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（144 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/recommendation/conjoint_analysis_product_design` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/05-推荐系统/Skill-Conjoint-Analysis-Product-Design.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
CBC联合分析 + 层次贝叶斯偏好估计（简化版HB-MNL）
用于母婴新品开发阶段的属性权重测量
[✓] 测试通过
"""
import numpy as np
from scipy.special import softmax
from scipy.optimize import minimize
import warnings
warnings.filterwarnings('ignore')

# ====== 属性定义：婴儿纸尿裤CBC实验 ======
# 属性1: 认证 (0=普通, 1=BPA-free, 2=有机GOTS)
# 属性2: 价格 (0=15美元, 1=20美元, 2=25美元)  [效用为负]
# 属性3: 包装 (0=普通, 1=可降解)
# 属性4: 品牌强度 (0=弱, 1=中, 2=强)
# → 用效用编码（effect coding）展开为6个虚拟变量

def encode_product(cert, price, pkg, brand):
    """将属性水平编码为效用向量（effect coding）"""
    # 认证: 普通=[-1,-1], BPA-free=[1,0], 有机=[0,1]
    cert_enc = {0: [-1, -1], 1: [1, 0], 2: [0, 1]}[cert]
    # 价格: 15=[-1,-1], 20=[1,0], 25=[0,1]（高价负效用在beta中体现）
    price_enc = {0: [-1, -1], 1: [1, 0], 2: [0, 1]}[price]
    # 包装: 普通=[-1], 可降解=[1]
    pkg_enc = {0: [-1], 1: [1]}[pkg]
    # 品牌: 弱=[-1,-1], 中=[1,0], 强=[0,1]
    brand_enc = {0: [-1, -1], 1: [1, 0], 2: [0, 1]}[brand]
    return np.array(cert_enc + price_enc + pkg_enc + brand_enc, dtype=float)

# 生成CBC实验设计（模拟D-optimal设计的12个选择集）
np.random.seed(2024)
choice_sets_design = [
    # (cert, price, pkg, brand) 每组3个选项
    [(2, 2, 1, 2), (0, 0, 0, 0), (1, 1, 0, 1)],  # 有机贵强品牌 vs 普通便宜 vs 中间
    [(1, 0, 1, 0), (2, 1, 0, 2), (0, 2, 1, 1)],
    [(2, 1, 1, 1), (1, 2, 0, 2), (0, 0, 0, 0)],
    [(0, 1, 1, 2), (2, 0, 0, 0), (1, 2, 1, 1)],
    [(2, 2, 0, 1), (0, 1, 1, 2), (1, 0, 1, 0)],
    [(1, 1, 1, 2), (2, 2, 1, 0), (0, 0, 0, 1)],
    [(0, 2, 0, 2), (1, 0, 0, 1), (2, 1, 1, 0)],
    [(2, 0, 1, 2), (1, 2, 0, 0), (0, 1, 1, 1)],
    [(1, 1, 0, 0), (0, 2, 1, 2), (2, 0, 0, 1)],
    [(2, 1, 0, 0), (0, 0, 1, 2), (1, 2, 1, 1)],
    [(0, 1, 0, 1), (2, 2, 1, 2), (1, 0, 0, 0)],
    [(1, 0, 1, 2), (0, 2, 0, 1), (2, 1, 0, 0)],
]

# ====== 模拟消费者应答（3类消费者各50人）======
# 类型1: 健康优先型（高度重视有机认证）
# 类型2: 价格敏感型（价格系数大负值）
# 类型3: 品牌优先型（强品牌溢价高）

TRUE_BETAS = {
    "健康优先型": np.array([1.5, 2.0,  -0.3, -0.5,  0.3,  0.8, 1.2]),
    "价格敏感型": np.array([0.5, 0.8,  -1.5, -2.0,  0.2,  0.3, 0.5]),
    "品牌优先型": np.array([0.8, 1.0,  -0.6, -0.8,  0.1,  1.0, 1.8]),
}
# beta维度: [cert_BPA, cert有机, price_20, price_25, pkg_降解, brand_中, brand_强]
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：对 200-500 名目标消费者（Amazon 买家 / TikTok 用户等）执行的 CBC 问卷数据，约 12-15 个选择集、每集 3 个假想产品组合；需先定义属性与水平（认证、价格区间、包装、品牌）。

**输出**：属性重要度排序（如认证>价格>品牌>包装）、WTP 估算（为有机认证愿意多支付多少）、消费者细分（价格敏感型 / 健康优先型 / 品牌忠诚型占比），以及礼盒等组合的最优产品束配置与定价，供新品开发决策使用。

## 执行步骤

1. 确定待测属性与水平并做效果编码
2. 设计 CBC 选择集与假想产品组合
3. 招募目标消费者并收集选择数据
4. 用层次贝叶斯 MNL 估计属性效用与 WTP
5. 输出属性重要度排序、愿付溢价与细分结构

## 边界与不做

- 属性水平还没收敛、问卷无法设计时不适用；样本量过小或人群不代表目标买家时结论不可用
- 输出的是相对偏好与愿付溢价，不含成本核算与供应链可行性判断
- 问卷不得暗示即将上市或引导留评，调研结果不得包装为临床证明用于营销素材

## 技能关联

- **前置**：Skill-Counterfactual-Recommendation-DCE.html、Skill-Counterfactual-Recommendation-DCE、Skill-Latent-Class-Demand-Segmentation.html、Skill-Latent-Class-Demand-Segmentation、Skill-MNL-Purchase-Choice-Model.html、Skill-MNL-Purchase-Choice-Model、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-Counterfactual-Recommendation-DCE.html、Skill-Counterfactual-Recommendation-DCE、Skill-Latent-Class-Demand-Segmentation.html、Skill-Latent-Class-Demand-Segmentation、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-Counterfactual-Recommendation-DCE.html、Skill-Counterfactual-Recommendation-DCE、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Conjoint-Analysis-Product-Design

---

> 分类：业务运营/产品与创新/产品需求定义　·　技术族：05-推荐系统　·　源卡：`Skill-Conjoint-Analysis-Product-Design`