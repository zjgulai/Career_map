---
name: "p2s-contextual-bandits-rec"
title: "Contextual Bandits Recommendation — 在线探索-利用均衡推荐"
description: "触发词：在线探索、LinUCB、流量分配、冷启动加速。何时不用：只需评估两套固定策略优劣时用交叉实验或 AB 测试；流量极小、探索损失不可接受时不用本卡。安全边界：价格探索需符合平台价格稳定性规则，不得对同一用户展示不同价格。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-023"
l3_business: "组合取舍"
l3_all: "组合取舍 / 转化优化"
l1_l2_l3: "业务运营/产品与创新/组合取舍"
p2s_card_id: "Skill-Contextual-Bandits-Rec"
p2s_src_domain: "05-推荐系统"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用在线探索算法主动给新品分配流量，让系统自己快速找到最优推荐位与价格点。"
user_try: "试试：新品上线 7 天推荐流量不到 0.1%，帮我用老虎机算法设计一套探索方案。"
whenToUse: "本卡属「组合取舍」。新品缺少历史数据、需要主动分配探索流量时用本卡；数据充足、只需比较两套固定策略优劣时用排序交叉实验类技能。"
workflow: "定义上下文与候选臂特征 → 初始化每个臂的参数 → 按 UCB 得分选择并曝光 → 用奖励反馈更新参数 → 收敛后交回常规推荐"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Contextual Bandits Recommendation — 在线探索-利用均衡推荐

## ① 解决的问题

运营面临"新品上线7天曝光不足、推荐系统流量分配<0.1%"——LinUCB在线探索将新品首周总曝光提升300%、7天后CVR高于Baseline15%，年化新品孵化成功率提升25%

## ② 核心算法逻辑

Contextual Bandits（上下文多臂老虎机）是推荐系统中的在线学习框架，解决 Exploitation vs. Exploration 的权衡：既要推荐高置信度商品（利用已知偏好），又要探索新商品以更新用户模型，避免过度聚焦导致的过滤气泡。

## ③ 业务应用场景

场景1：Amazon 新品首周 Bandit 推荐加速冷启动 - 业务问题：新 SKU 上线后前 7 天缺乏历史数据，推荐系统分配流量极少（<0.1%），新品首周曝光严重不足 - 数据要求：用户上下文特征（月龄偏好、历史价格区间、上次购买距今天数）、新品商品特征（类目、价格、认证标签） - 预期产出：新品上线后前 7 天总曝光量提升 300%（Bandit 主动分配探索流量），7 天内获得足够反馈后推荐系统接管，CVR 高于 Baseline 15% - 业务价值：新品冷启动速度加快，Review 积累周期缩短 50%，上线 30 天 BSR 爬升速度提升，年化新品孵化成功率提升 25%
场景2：大促前动态定价推荐（价格 Bandit） - 业务问题：大促期间同款奶粉在 $45/$49/$52 三个价格点间，不知哪个价格能最大化 GMV，A/B 测试成本高（需 2 周） - 数据要求：实时点击/购买日志、用户价格敏感度特征（历史优惠使用率） - 预期产出：Bandit 在 3 天内收敛到最优价格点，相比均匀 A/B 测试，GMV 提升 8-12% - 业务价值：大促 3 天 GMV 节省探索成本约 15 万元
**三轨验证**： - 成本：LinUCB 计算轻量（矩阵更新），Python 实现每次推荐 <1ms；存储仅需保存 $A_a, b_a$ 矩阵 - 合规：价格探索需符合平台价格稳定性规则；不得对同一用户展示不同价格（需用户分组） - 风险：$\alpha$ 参数调优敏感；探索期间少量用户会收到次优推荐（需设定最大可接受损失阈值）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：新品冷启动加速 50%，大促期价格优化 GMV 提升 8-12%；年化综合价值约 100-200 万元（取决于新品 launch 频率）
实施难度：⭐⭐⭐☆☆（LinUCB 实现简单，工程部署难点在实时反馈接入）
优先级：⭐⭐⭐⭐☆
评估依据：在线学习是当前推荐系统与离线批训练的核心差异，母婴品类新品 launch 频繁，Bandit 探索价值极高；投入产出比极佳

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（92 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'for' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np

# ============================================================
# Contextual Bandits Recommendation（LinUCB 实现）
# ============================================================

class LinUCBRecommender:
    """LinUCB 上下文多臂老虎机推荐器"""

    def __init__(self, n_features: int, alpha: float = 1.0):
        """
        n_features: 上下文特征维度
        alpha: 探索参数（越大越激进探索）
        """
        self.alpha = alpha
        self.d = n_features
        # 每个 arm（商品）维护 A（d×d 矩阵）和 b（d 向量）
        self.A: dict[str, np.ndarray] = {}
        self.b: dict[str, np.ndarray] = {}

    def _init_arm(self, arm: str) -> None:
        if arm not in self.A:
            self.A[arm] = np.eye(self.d)
            self.b[arm] = np.zeros(self.d)

    def get_ucb_score(self, arm: str, context: np.ndarray) -> float:
        """计算 UCB 得分：期望奖励 + 不确定性上界"""
        self._init_arm(arm)
        A_inv = np.linalg.inv(self.A[arm])
        theta = A_inv @ self.b[arm]  # 估计参数
        expected_reward = theta @ context
        uncertainty = self.alpha * np.sqrt(context @ A_inv @ context)
        return float(expected_reward + uncertainty)

    def select_arm(self, candidate_arms: list[str],
                   context: np.ndarray) -> str:
        """选择 UCB 得分最高的 arm"""
        scores = {arm: self.get_ucb_score(arm, context) for arm in candidate_arms}
        return max(scores, key=scores.__getitem__)

    def update(self, arm: str, context: np.ndarray, reward: float) -> None:
        """基于观察到的奖励更新 arm 的参数"""
        self._init_arm(arm)
        self.A[arm] += np.outer(context, context)
        self.b[arm] += reward * context

# ---------- 模拟推荐场景 ----------
np.random.seed(42)
n_features = 5  # 特征：[月龄偏好, 价格敏感度, 有机偏好, 复购意愿, 浏览深度]

# 商品候选（新品+老品混合）
arms = ["新品DHA奶粉", "爆款辅食泥", "新品有机米粉", "经典奶瓶", "新品安抚奶嘴"]

recommender = LinUCBRecommender(n_features=n_features, alpha=1.2)

# 模拟 200 次推荐-反馈循环
rewards_log = []
explore_count = 0

for t in range(200):
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2409.03168，但该号在 arXiv 上是《The HI reservoir in central spiral galaxies and the implied star formation process》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：用户上下文特征（月龄偏好、历史价格区间、上次购买距今天数）、候选商品特征（类目、价格、认证标签），以及实时点击与购买反馈流。

**输出**：各候选臂的 UCB 得分与选择结果、探索期曝光分配方案，以及收敛后的最优价格点或推荐位，用于新品冷启动与大促定价。

## 执行步骤

1. 定义用户上下文与候选臂特征
2. 初始化每个臂的矩阵与向量参数
3. 按 UCB 得分选择臂并曝光
4. 用观察到的奖励更新参数
5. 收敛后交回常规推荐接管

## 边界与不做

- 流量极小、探索期次优推荐损失不可接受时不用本卡
- 本卡只产出探索策略与参数更新规则，不负责线上实时计算与熔断
- 价格探索需符合平台价格稳定性规则，不得对同一用户展示不同价格（需按用户分组）

## 技能关联

- **前置**：Skill-Cold-Start-Meta-Learning-PAM.html、Skill-Cold-Start-Meta-Learning-PAM、Skill-MultiModal-Product-Rec.html、Skill-MultiModal-Product-Rec、Skill-Position-Bias-Debiasing-Rec.html、Skill-Position-Bias-Debiasing-Rec、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-RLHF-Recommendation.html、Skill-RLHF-Recommendation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Real-Time-Streaming-Recommendation.html、Skill-Real-Time-Streaming-Recommendation
- **延伸**：Skill-Cold-Start-Meta-Learning-PAM.html、Skill-Cold-Start-Meta-Learning-PAM、Skill-MultiModal-Product-Rec.html、Skill-MultiModal-Product-Rec、Skill-Position-Bias-Debiasing-Rec.html、Skill-Position-Bias-Debiasing-Rec、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-Cold-Start-Meta-Learning-PAM.html、Skill-Cold-Start-Meta-Learning-PAM、Skill-MultiModal-Product-Rec.html、Skill-MultiModal-Product-Rec、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Contextual-Bandits-Rec

---

> 分类：业务运营/产品与创新/组合取舍　·　技术族：05-推荐系统　·　源卡：`Skill-Contextual-Bandits-Rec`