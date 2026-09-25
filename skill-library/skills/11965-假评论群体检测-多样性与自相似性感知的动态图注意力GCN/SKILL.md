---
name: "p2s-ds-dga-gcn-fake-review-group-detection"
title: "DS-DGA-GCN假评论群体检测 — 多样性与自相似性感知的动态图注意力GCN"
description: "触发词：假评论群体、自相似性、动态注意力、误杀控制、跨平台刷单。何时不用：只需单条评论判定时用评论级模型；本技能输出群体级判定，为的是避免把真实差评误杀。安全边界：检测仅用于内部识别与平台举报，不得自动化批量删评；账号标识须脱敏处理。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-136"
l3_business: "安全事件处理"
l3_all: "安全事件处理 / 体验分析"
l1_l2_l3: "独立控制/数据与AI运行/安全事件处理"
p2s_card_id: "Skill-DS-DGA-GCN-Fake-Review-Group-Detection"
p2s_src_domain: "19-风控反欺诈"
quality_tier: "preview"
user_summary: "把恶意差评的账号群整团识别出来，而不是冤枉单个真实差评，误杀率压到很低。"
user_try: "试试：这批集中出现的 1 星评论是不是有组织的攻击群，尽量别误伤真实用户。"
whenToUse: "需要群体级判定、且要控制误杀率时用本技能；只做冷启动新品防刷的轻量版用假评论群组检测类技能。"
workflow: "构建评论、用户、产品的三方图 → 计算群体自相似性并与正常基线对比 → 用动态注意力捕捉时序爆发模式 → 输出攻击群体而不是单个差评的判定"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# DS-DGA-GCN假评论群体检测 — 多样性与自相似性感知的动态图注意力GCN

## ① 解决的问题

竞争对手有组织的恶意差评攻击让新品评分在7天内从4.8崩至3.6——DS-DGA-GCN通过多样性与自相似性感知的动态图注意力识别假评论群体，Amazon数据集准确率89.8%（2026 arXiv:2603.08332）

## ② 核心算法逻辑

反直觉洞察：传统假评论检测针对"单个用户账号"，但跨境电商的刷单通常由有组织的群体执行——多个账号协同操作，每个账号单独看起来"正常"，只有从群体关系视角才能发现异常。更反直觉的是：对新品（评论稀少）的假评论检测比成熟品难得多，而实际上新品上市期恰是刷单最活跃的时刻。DSDGAGCN专门针对这两个问题：群体检测+冷启动鲁棒性。

## ③ 业务应用场景

- 业务问题：竞争对手对某母婴卖家新上市的吸奶器发起有组织的恶意差评攻击（Day1-7集中出现200条1星评论），评分从4.8跌至3.6，排名崩溃；平台的基础规则检测误杀率高（真实差评也被删除） - 数据要求：评论文本+时间戳+用户行为历史+产品-评论-用户三方图 - DS-DGA-GCN应用： 1. 构建攻击期评论者的三方图 2. NFS评分：发现攻击群体成员间自相似性异常高（0.87 vs 正常0.32） 3. 动态注意力：识别Day1-7的时序爆发模式 4. 群体级检测：识别出17个账号构成的攻击群，而非误判单个正常差评 - 预期产出：假评论召回率89.8%，误杀率<5%；阻止评分崩溃，
三轨验证： - 成本：需采购GPU服务器（约$2,000/月）用于图模型推理；数据采集需对接平台API（约$500/月）；人力投入1名算法工程师+1名运营（约$8,000/月）。总显性成本约$10,500/月。 - 合规：Amazon政策允许卖家使用自动化工具进行评论分析，但禁止直接操纵评论或对用户进行报复性操作。本方案仅用于内部检测，不触碰GDPR（用户ID脱敏处理）或广告法红线。需确保不将检测结果公开用于诉讼或平台举报以外的用途。 - 风险：若误判真实用户为假评论群并采取删除操作，可能引发用户投诉和品牌声誉损伤（次生风险）。建议仅标记为“可疑”并人工复核，避免自动化处理。同时，竞品可能反向
- 业务问题：某卖家在Amazon和Shopee都发现同一批账号在刷好评，但平台各自独立处理，无法联合溯源 - 跨平台应用：利用共享的用户行为特征（评论时间模式+IP段+设备指纹）在多平台间建立关联图，检测跨平台协同刷单群体

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：防止1次新品恶意差评攻击（评分从4.8→3.6导致80%流量损失）相当于挽回约$20-50万月销售额；检测准确率89.8%，误杀率低，系统建设$5万，ROI极高
实施难度：⭐⭐⭐⭐☆（需要构建用户-评论-产品三方图，需要足够的历史数据；新品冷启动场景需特别处理）
优先级：⭐⭐⭐⭐⭐（假评论是跨境电商生死问题，Amazon每年暂停数万个账号，高评分是竞争力核心）
适用规模：日均评论>100条的平台或卖家即可受益，规模越大图特征越清晰
数据依赖：评论文本+用户ID+产品ID+时间戳（平台标准数据）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（192 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/risk_fraud/ds_dga_gcn_fake_review_group_detection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/19-风控反欺诈/Skill-DS-DGA-GCN-Fake-Review-Group-Detection.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
DS-DGA-GCN假评论群体检测
基于 arXiv:2603.08332 (2026)
动态图注意力GCN + 网络特征评分 + 三方网络
"""
import numpy as np
from collections import defaultdict
import warnings
warnings.filterwarnings('ignore')


def compute_neighbor_diversity(adj, node_id, node_types):
    """
    计算节点的邻居多样性分数
    真实用户：邻居类型多样（评论了不同类目产品）
    假评论群：邻居集中（集中在同一产品）
    """
    neighbors = adj.get(node_id, [])
    if len(neighbors) < 2:
        return 1.0  # 邻居太少，不可判断

    # 统计邻居类型分布
    type_counts = defaultdict(int)
    for n in neighbors:
        t = node_types.get(n, 'unknown')
        type_counts[t] += 1

    # 熵作为多样性度量
    total = len(neighbors)
    probs = [c/total for c in type_counts.values()]
    entropy = -sum(p * np.log2(p + 1e-9) for p in probs)
    max_entropy = np.log2(len(type_counts) + 1)
    return entropy / (max_entropy + 1e-9)


def compute_network_self_similarity(adj, node_id, depth=2):
    """
    计算网络自相似性（真实网络具有分形特性）
    假评论群破坏自相似性
    """
    neighbors_1hop = set(adj.get(node_id, []))
    if not neighbors_1hop:
        return 0.5

    # 2跳邻居
    neighbors_2hop = set()
    for n in neighbors_1hop:
        neighbors_2hop.update(adj.get(n, []))
    neighbors_2hop -= neighbors_1hop
    neighbors_2hop.discard(node_id)

    # 真实网络：2跳邻居覆盖应远大于1跳（分形扩展）
    if len(neighbors_1hop) == 0:
        return 0.5
    ratio = len(neighbors_2hop) / (len(neighbors_1hop) * len(neighbors_1hop) + 1)
    # 正常值~0.5-0.8, 假评论群<0.2（封闭子图）
    return min(ratio, 1.0)


def nfs_score(adj, node_id, node_types):
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2603.08332 — Detecting Fake Reviewer Groups in Dynamic Networks: An Adaptive Graph Learning Method
⚠️ 该号被 3 张卡共用，最多只有一张能对。

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：评论文本、时间戳、用户行为历史与产品、评论、用户三方图数据；需足够历史数据支撑群体基线，用户 ID 须脱敏。

**输出**：假评论群体名单与召回率、误杀率指标及群体级判定证据，供内部风控与平台举报使用。

## 执行步骤

1. 对齐评论、用户与产品并构建三方图
2. 计算群体自相似性并与正常基线比较
3. 用动态注意力识别时序爆发模式
4. 输出群体级判定而非单条误判
5. 复核误杀率并沉淀举报证据

## 边界与不做

- 只需要单条评论判定时不必用群体级模型。
- 本技能产出可疑群体与指标，不执行删评或对用户的处置动作。
- 检测结果仅用于内部识别与平台举报，账号标识须脱敏，避免自动化误伤真实用户。

## 技能关联

- **前置**：Skill-Compliance-ML-Risk-Scoring.html、Skill-Compliance-ML-Risk-Scoring、Skill-Fake-Review-Detection.html、Skill-Fake-Review-Detection、Skill-Graph-Grounded-MAS-Protocol.html、Skill-Graph-Grounded-MAS-Protocol、Skill-KG-Hallucination-Detection.html、Skill-KG-Hallucination-Detection、Skill-MAS-Adversarial-Defense.html、Skill-MAS-Adversarial-Defense、Skill-MAS-Dynamic-Trust.html、Skill-MAS-Dynamic-Trust
- **延伸**：Skill-Compliance-ML-Risk-Scoring.html、Skill-Compliance-ML-Risk-Scoring、Skill-KG-Hallucination-Detection.html、Skill-KG-Hallucination-Detection、Skill-MAS-Adversarial-Defense.html、Skill-MAS-Adversarial-Defense、Skill-MAS-Dynamic-Trust.html、Skill-MAS-Dynamic-Trust
- **可组合**：Skill-KG-Hallucination-Detection.html、Skill-KG-Hallucination-Detection、Skill-MAS-Dynamic-Trust.html、Skill-MAS-Dynamic-Trust、Skill-DS-DGA-GCN-Fake-Review-Group-Detection

---

> 分类：独立控制/数据与AI运行/安全事件处理　·　技术族：19-风控反欺诈　·　源卡：`Skill-DS-DGA-GCN-Fake-Review-Group-Detection`