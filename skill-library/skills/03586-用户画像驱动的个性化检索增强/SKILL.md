---
name: "p2s-personarag-user-persona-retrieval"
title: "PersonaRAG — 用户画像驱动的个性化检索增强"
description: "触发词：用户画像检索、个性化知识推送、分层回答深度、新手专家差异、检索权重调制、决策摘要。何时不用：可见性与越权边界要靠角色权限收口时用「知识库RBAC」；知识过期与跨域治理用「知识库声明式编排」；任务质量监控用「RAG生产可观测性」。安全边界：画像只用于内部检索权重调制与深度分层，不得用画像绕过权限做可见性放行；画像数据不得外泄或用于对外差异化定价，须符合 GDPR 对检索系统画像使用的要求。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-134"
l3_business: "访问控制"
l3_all: "访问控制 / 业务工具实现"
l1_l2_l3: "独立控制/数据与AI运行/访问控制"
p2s_card_id: "Skill-PersonaRAG-User-Persona-Retrieval"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "同一个问题，CEO 拿到 3 条决策摘要，运营拿到 15 条执行细节——按角色与经验自动调整答案条数与深度。"
user_try: "试试：让检索按我的角色给结果，CEO 问销售情况回 3 条摘要，运营问同一个问题回 15 条 SKU 级细节。"
whenToUse: "当同一知识库对全体用户开放、但不同角色需要的答案深度明显不同（高管要摘要、新手要教程、专家要模型）时用本技能；若不同角色之间是硬性不可见，改用「知识库RBAC」；若问题出在知识过期，改用「知识库声明式编排」。"
workflow: "建立用户画像库：角色、资历等级、领域专精、历史查询量与平均复杂度 → 为知识库文档打语义标签（宏观/中观/微观/教程/专家）与难度等级 → 取基础检索得分作为排序基线 → 按画像调制权重后重排结果并决定返回条数 → 收集文档有用性反馈，季度更新画像与标签"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# PersonaRAG — 用户画像驱动的个性化检索增强

## ① 解决的问题

产品团队面临不同角色用户收到同样深度回答——PersonaRAG将用户满意度+28%，CEO/运营师分层精准响应，年化降低无效决策损失35万元

## ② 核心算法逻辑

核心思想：将用户画像（角色、历史查询、权限等级）作为检索权重调制器，使同一问题对不同用户返回差异化深度的知识片段。

## ③ 业务应用场景

场景A：CEO/运营师分层个性化知识检索 - 业务问题：母婴品牌日均处理100+运营查询（销售、库存、营销），CEO需要5分钟决策摘要，运营需要30分钟执行细节。现状是检索返回冗长报告，CEO浪费时间筛选，运营缺少操作建议。年均因信息不匹配导致决策延迟造成15-20万元机会成本。 - 数据要求：(1)用户档案库（姓名/角色/权限/查询历史100条）；(2)知识库5000+文档（含语义标签：宏观/中观/微观/教程）；(3)查询日志（过去6个月） - 预期产出：CEO查询「Q3销售怎样」→返回3条摘要（趋势+预警+建议）；运营查询同问题→返回15条细节（SKU排名+库存预警+竞品对标+操作chec
三轨验证 | 成本轨：月均服务器成本2000元（向量存储+实时推理），人工标注画像成本3000元/月（首月），后续自动化 | 合规轨：用户画像仅用于内部检索权重调制，不涉及个人隐私泄露，符合GDPR检索系统规范 | 风险轨：画像过时导致权重失效（概率15%，可通过季度更新缓解）；检索结果偏差（概率8%，需人工反馈循环）
场景B：新手/专家运营差异化帮助文档召回 - 业务问题：母婴跨境团队新手（<3个月）和专家（>2年）查询同一问题「如何优化Listing转化」，新手需要基础教程+案例，专家需要高阶技巧+数据模型。现状检索返回混杂内容，新手困惑，专家浪费时间。新手平均学习周期延长2周，年均培训成本增加8万元。 - 数据要求：(1)运营档案（入职日期/岗位/完成培训数/历史查询难度等级）；(2)帮助文档库3000+篇（标注难度等级：L1基础/L2进阶/L3专家/L4研究）；(3)反馈数据（文档有用性评分） - 预期产出：新手查询→返回L1+L2文档（含视频教程+模板）；专家查询→返回L3+L4文档（含算法解析+A

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：CEO/运营师面临「同一问题多人查询、返回结果冗余」的场景——PersonaRAG将检索相关性从60%改善至88%，决策时间从30分钟降至5分钟，年化节省42万元（CEO月均节省100小时×500元/小时）；运营执行效率提升40%，年化增加35万元产出。总年化ROI 77万元。
实施难度：⭐⭐⭐☆☆（需建立用户画像库和文档语义标签体系，但无需复杂模型训练）
优先级：⭐⭐⭐⭐☆（直接影响决策效率和团队生产力，ROI明显）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（187 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity

# ============ 母婴跨境电商场景数据 ============
# 场景：婴儿推车、暖奶器、有机辅食三类产品的运营查询

# 1. 用户画像库
users_data = {
    'user_id': ['CEO_001', 'OPS_002', 'OPS_003', 'NEW_004', 'EXP_005'],
    'role': ['CEO', 'Operations', 'Operations', 'NewbieOps', 'ExpertOps'],
    'seniority_level': [5, 3, 4, 0.5, 4.5],  # 0-5 scale
    'domain_expertise': [4, 3, 4, 1, 5],  # 0-5 scale
    'query_history_count': [120, 450, 380, 45, 520],
    'avg_query_complexity': [3.2, 2.8, 3.5, 1.5, 4.2]
}
users_df = pd.DataFrame(users_data)

# 2. 知识库文档（母婴产品运营相关）
docs_data = {
    'doc_id': ['D001', 'D002', 'D003', 'D004', 'D005', 'D006', 'D007', 'D008'],
    'title': [
        'Q3销售趋势摘要',
        'SKU级销售明细表',
        '婴儿推车库存预警',
        '暖奶器竞品对标分析',
        '有机辅食新手运营指南',
        '高阶Listing优化算法',
        '库存管理最佳实践',
        'A/B测试数据模型'
    ],
    'content_depth': ['macro', 'micro', 'micro', 'meso', 'tutorial', 'expert', 'meso', 'expert'],
    'product_category': ['general', 'stroller', 'warmer', 'food', 'general', 'general', 'general', 'general'],
    'semantic_tags': [
        np.array([0.9, 0.1, 0.2, 0.3]),  # [macro_score, micro_score, tutorial_score, expert_score]
        np.array([0.1, 0.95, 0.2, 0.1]),
        np.array([0.2, 0.9, 0.3, 0.1]),
        np.array([0.4, 0.6, 0.2, 0.3]),
        np.array([0.1, 0.3, 0.95, 0.2]),
        np.array([0.2, 0.3, 0.1, 0.95]),
        np.array([0.3, 0.7, 0.4, 0.2]),
        np.array([0.1, 0.2, 0.1, 0.95])
    ]
}
docs_df = pd.DataFrame(docs_data)

# 3. 查询与基础检索得分（模拟BM25或向量相似度）
query = "销售怎样"
base_retrieval_scores = {
    'D001': 0.85,  # 趋势摘要
    'D002': 0.88,  # SKU明细
    'D003': 0.72,  # 推车库存
    'D004': 0.65,  # 竞品分析
    'D005': 0.45,  # 新手指南
    'D006': 0.38,  # 高阶算法
    'D007': 0.70,  # 库存管理
    'D008': 0.32   # A/B测试
}
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2407.09394 — PersonaRAG: Enhancing Retrieval-Augmented Generation Systems with User-Centric Agents

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：用户档案（角色、权限等级、入职/资历、查询历史）、带语义标签与难度等级的知识库文档、历史查询日志与文档有用性反馈；粒度为用户级画像加文档级标签。

**输出**：按画像重排后的差异化知识片段列表（同一问题对不同角色返回不同条数与深度），以及检索相关性、决策耗时的改善记录；供知识检索层与团队管理者使用。

## 执行步骤

1. 采集用户角色、资历、查询历史与平均查询复杂度，建立画像库
2. 给知识库文档标注语义标签与难度等级
3. 以基础检索得分作为起点，按画像计算权重调制系数
4. 重排候选片段并按角色输出差异化条数（高管摘要、运营明细、新手教程）
5. 回收有用性反馈并季度更新画像与标签

## 边界与不做

- 数据不满足：没有用户画像库或文档缺少语义与难度标签时无法调制权重，需先补标注，冷启动阶段退回统一检索。
- 何时不用：要么是可见性硬隔离（用「知识库RBAC」），要么是知识过期治理（用「知识库声明式编排」），都不要用本技能替代。
- 能力边界：只调整检索结果的排序、条数与深度，不改变文档可见范围，也不提升知识本身的覆盖率。
- 安全边界：画像不得作为绕过权限的通道，也不得用于对外差异化定价或任何未经授权的个人信息使用。

## 技能关联

- **前置**：Skill-GPLR-Persona-Generation.html、Skill-GPLR-Persona-Generation、Skill-PersonaBot-RAG-Profiling.html、Skill-PersonaBot-RAG-Profiling、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-Self-RAG-Reflective-Retrieval.html、Skill-Self-RAG-Reflective-Retrieval、Skill-User-Profile-Long-Memory.html、Skill-User-Profile-Long-Memory
- **延伸**：Skill-PersonaBot-RAG-Profiling.html、Skill-PersonaBot-RAG-Profiling、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-Self-RAG-Reflective-Retrieval.html、Skill-Self-RAG-Reflective-Retrieval
- **可组合**：Skill-PersonaBot-RAG-Profiling.html、Skill-PersonaBot-RAG-Profiling、Skill-PersonaRAG-User-Persona-Retrieval

---

> 分类：独立控制/数据与AI运行/访问控制　·　技术族：08-知识图谱　·　源卡：`Skill-PersonaRAG-User-Persona-Retrieval`