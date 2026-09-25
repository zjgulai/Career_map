---
name: "p2s-lifecycle-stage-aware-rec"
title: "Lifecycle Stage Aware Recommendation — 用户生命周期感知推荐"
description: "触发词：生命周期阶段、阶段跃迁、品类切换推荐、月龄标注、HMM、交叉销售。何时不用：算用户价值分层用 LTV 类卡；要在用户从孕期到幼儿的阶段跃迁点切换推荐品类时用本卡。安全边界：不采集儿童年龄等敏感信息，仅用商品与行为信号推断阶段；阶段不确定时走通用推荐兜底，避免误推。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 转化优化"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-Lifecycle-Stage-Aware-Rec"
p2s_src_domain: "05-推荐系统"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "在宝宝月龄阶段切换的当口，把推荐从奶粉切到辅食，抓住品类扩张的最佳时机。"
user_try: "试试：这是我的用户购买序列和商品月龄标注，帮我推断每个用户所处生命周期阶段并给出跃迁期的推荐策略。"
whenToUse: "与「购买序列预测」相比：预测下一购买品类与时机用那张卡；要识别用户当前阶段并在跃迁窗口切换推荐内容时用本卡。"
workflow: "给商品打生命周期阶段标签（孕期、0-6M、6-12M、1-3Y） → 用购买序列推断用户当前阶段与跃迁概率 → 在跃迁窗口（卡页如 5-7 月龄）切到目标品类推荐 → 阶段不确定时走通用热门兜底并评估 CTR 与交叉购买率"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Lifecycle Stage Aware Recommendation — 用户生命周期感知推荐

## ① 解决的问题

运营面临"用户从新生儿期过渡到辅食期时品类切换推荐错失商机"——生命周期阶段感知推荐将辅食CTR从1.2%提升至4.8%、NTB用户数提升35%，年化品类GMV增量约200万元

## ② 核心算法逻辑

母婴消费者的需求随用户生命周期阶段（备孕期→孕期→新生儿期→婴儿期→幼儿期）发生结构性跃迁，传统推荐系统将用户视为静态偏好载体，无法捕捉这种相变式转型。

## ③ 业务应用场景

场景1：Amazon 婴儿用品跨阶段主动推荐 - 业务问题：用户从"新生儿奶粉"阶段过渡到"婴儿辅食"阶段时，推荐系统未能及时切换，错失辅食品类增购机会，相关品类 CVR 仅 1.2% - 数据要求：用户 18 个月以上购买序列、商品月龄标注（0-6M/6-12M/1-3Y）、用户注册时的预产期（可选） - 预期产出：阶段跃迁期（宝宝 5-7 月龄）品类切换推荐 CTR 从 1.2% 升至 4.8%，辅食品类 30 日 NTB（新品类购买）用户数提升 35% - 业务价值：辅食品类扩张，年化品类 GMV 增量约 200 万元
场景2：会员体系分层激活 - 业务问题：品牌 APP 用户分层运营靠人工打标，同是"奶粉用户"却混合了不同阶段，Push 到达率 14% - 数据要求：APP 内购买/浏览记录、会员注册信息 - 预期产出：基于阶段分层的 Push 到达后转化率从 2.1% 提升至 5.8%，品类交叉销售率提升 28% - 业务价值：精准推送降低 30% 用户退订率，年化 LTV 提升约 80 万元
**三轨验证**： - 成本：HMM 训练轻量，在线推理 <10ms；商品月龄标注需一次性人工完成（约 2 人周） - 合规：不收集儿童年龄等敏感信息，仅用商品信号推断阶段；COPPA 合规 - 风险：阶段识别准确率受数据稀疏影响；需设置 fallback（阶段不确定时用通用热门推荐）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：阶段跃迁期精准推送使品类交叉购买率提升 25-40%，对年均 5000 个活跃用户，年化增量 GMV 150-250 万元
实施难度：⭐⭐⭐☆☆（核心是商品月龄标注，推荐逻辑不复杂）
优先级：⭐⭐⭐⭐⭐
评估依据：母婴品类的阶段性需求跃迁是行业独特优势，竞争对手难以复制品牌对用户全周期的持续服务能力；用户阶段跃迁是最高价值运营节点

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（83 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'[' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from collections import Counter

# ============================================================
# Lifecycle Stage Aware Recommendation（生命周期感知推荐简化版）
# ============================================================

# 商品→生命周期阶段映射（0:孕期, 1:新生儿0-6M, 2:婴儿6-12M, 3:幼儿1-3Y）
ITEM_STAGE_MAP = {
    "叶酸": 0, "孕妇奶粉": 0, "待产包": 0,
    "新生儿奶粉": 1, "纸尿裤NB": 1, "婴儿床": 1, "新生儿衣服": 1,
    "段位奶粉2段": 2, "辅食泥": 2, "学饮杯": 2, "爬行垫": 2,
    "幼儿奶粉3段": 3, "儿童零食": 3, "早教玩具": 3, "绘本": 3,
}

def infer_user_stage(purchase_history: list[str]) -> int:
    """基于购买历史推断用户当前生命周期阶段（取最高频阶段）"""
    stage_counts = Counter()
    for item in purchase_history:
        stage = ITEM_STAGE_MAP.get(item)
        if stage is not None:
            stage_counts[stage] += 1
    if not stage_counts:
        return 1  # 默认新生儿阶段
    return stage_counts.most_common(1)[0][0]

def detect_stage_transition(recent_items: list[str], current_stage: int) -> bool:
    """检测是否即将进入下一阶段（最近10次购买中出现≥2个下一阶段商品）"""
    next_stage = current_stage + 1
    next_stage_count = sum(
        1 for item in recent_items[-10:]
        if ITEM_STAGE_MAP.get(item) == next_stage
    )
    return next_stage_count >= 2

def recommend_by_stage(current_stage: int,
                       is_transitioning: bool,
                       purchased_items: set[str],
                       top_n: int = 5) -> list[str]:
    """基于生命周期阶段生成推荐商品列表"""
    # 目标阶段：过渡期推荐下一阶段商品
    target_stage = current_stage + 1 if is_transitioning else current_stage

    # 候选商品（目标阶段未购买的商品）
    stage_items = [
        item for item, stage in ITEM_STAGE_MAP.items()
        if stage == target_stage and item not in purchased_items
    ]

    # 简化打分：过渡期给下一阶段商品额外权重
    transition_bonus = 0.3 if is_transitioning else 0.0
    scores = {item: 0.5 + transition_bonus + np.random.uniform(0, 0.2)
              for item in stage_items}

    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return [item for item, _ in ranked[:top_n]]

# ---------- 测试用例 ----------
# 用户历史：新生儿期为主，最近出现辅食泥信号
user_history = [
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2405.09832，但该号在 arXiv 上是《Mixed-Integer Linear Optimization for Cardinality-Constrained Random Forests》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：用户 18 个月以上的购买序列、商品月龄或阶段标注（0-6M、6-12M、1-3Y 等）、可选预产期信息；卡页依赖 APP 或站内购买与浏览记录。

**输出**：每位用户的生命周期阶段与跃迁概率、阶段感知的推荐结果与 Push 分层策略（卡页跃迁期 CTR 1.2%→4.8%、30 日新品类购买用户 +35%），供推荐与会员运营使用。

## 执行步骤

1. 完成商品到生命周期阶段的标注（卡页需一次性人工标注）。
2. 用购买序列推断用户当前阶段与跃迁概率。
3. 在阶段跃迁窗口切换推荐品类与内容。
4. 阶段不确定时走通用热门兜底，避免误推。
5. 评估 CTR、交叉购买率与退订率并迭代规则。

## 边界与不做

- 何时不用：商品月龄标注缺失、购买序列不足 18 个月或用户量过小时不要用；单纯按品类热度推荐无需阶段模型。
- 能力边界：产出阶段判断与推荐策略，不直接改线上推荐系统；CTR 1.2%→4.8%、年化 GMV 150–250 万为卡页案例值。
- 安全边界：不得采集儿童年龄等敏感信息，阶段推断只能基于商品与行为信号。

## 技能关联

- **前置**：Skill-Baby-Age-Aware-Recommendation.html、Skill-Baby-Age-Aware-Recommendation、Skill-Cross-Platform-Transfer-Rec.html、Skill-Cross-Platform-Transfer-Rec、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-Recommendation-TS-Demand.html、Skill-Recommendation-TS-Demand、Skill-Sequential-Recommendation-Transformer.html、Skill-Sequential-Recommendation-Transformer
- **延伸**：Skill-Cross-Platform-Transfer-Rec.html、Skill-Cross-Platform-Transfer-Rec、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-Recommendation-TS-Demand.html、Skill-Recommendation-TS-Demand
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-Recommendation-TS-Demand.html、Skill-Recommendation-TS-Demand、Skill-Lifecycle-Stage-Aware-Rec

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：05-推荐系统　·　源卡：`Skill-Lifecycle-Stage-Aware-Rec`