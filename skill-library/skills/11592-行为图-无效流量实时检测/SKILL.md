---
name: "p2s-ad-fraud-ivt-detection"
title: "Ad Fraud IVT Detection — 行为图 + GNN 无效流量实时检测"
description: "触发词：无效流量、IVT 检测、点击农场、行为图、异常会话、无效点击申诉。何时不用：只有正常波动或缺少会话级行为日志时不要下作弊结论；流量真实但 ROI 低时用归因或饱和分析。安全边界：行为分析需符合个保法要求并留存审计日志，不得凭单次判定封禁真实用户，申诉只走平台官方渠道。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 安全事件处理"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Ad-Fraud-IVT-Detection"
p2s_src_domain: "19-风控反欺诈"
quality_tier: "preview"
user_summary: "用会话行为特征识别机器刷量与竞品点击，减少无效广告支出并支持向平台申诉。"
user_try: "试试：我的 TikTok 广告点击后转化率不到 0.3%，帮我查是不是点击农场刷量。"
whenToUse: "点击量异常上升但转化异常下滑、怀疑机器流量或竞品恶意点击时用本技能；转化正常而 ROI 低时用渠道饱和或归因类技能；缺少点击日志时先补埋点。"
workflow: "采集点击日志与会话行为字段 → 提取停留时长、点击间隔、页面深度等特征 → 构建行为图并计算异常指标 → 融合异常检测打分并标记 IVT 会话 → 输出 IVT 率、无效支出估算与申诉证据"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Ad Fraud IVT Detection — 行为图 + GNN 无效流量实时检测

## ① 解决的问题

母婴品牌 TikTok/Google 广告月均 30 万投放中 15-25% 为无效点击（Bot/竞品刷量），ROAS 被高估 30%——行为图 WTG + DGCNN 将 IVT 识别率提升至 95%+，年化节省无效广告支出 5-15 万元，并为平台申诉提供量化证据

## ② 核心算法逻辑

核心思路：传统 IVT 检测依赖 IP 黑名单和 UserAgent 特征，Bot 可轻易伪造；BOTracle 转而对用户会话行为序列建图，捕捉"鼠标轨迹是否太规律、页面停留时间是否异常短、点击深度是否缺乏探索性"等难以伪造的行为模式。

## ③ 业务应用场景

场景A：TikTok Ads 竞品刷量识别 - 业务问题：母婴品牌（吸奶器/婴儿推车）TikTok 投流月均 30 万，点击后转化率异常低（< 0.3%），疑似竞品雇佣点击农场刷量消耗预算 - 数据要求：TikTok 广告点击日志（click_id, session_id, timestamp, page_sequence, dwell_time_ms, scroll_events） - 检测逻辑：会话中位停留 < 800ms、点击间隔 CV < 0.1、页面深度 ≤ 1 → 标记为 IVT - 预期产出：识别 IVT 率 15-25%，自动向平台提交无效点击申诉（部分平台支持退款） - 业务
场景B：Google Ads 搜索欺诈保护 - 业务问题：婴儿湿巾/纸尿裤关键词竞价激烈（CPC $2-5），疑似竞品批量点击消耗日预算 - 数据要求：Google Ads 点击日志 + GA4 会话行为序列（page_path, session_duration, bounce, engagement_time） - 检测逻辑：构建用户访问图，计算图级聚类系数 + 度分布异常度，融合 Isolation Forest 打分 - 预期产出：每天屏蔽 200-500 个异常 IP 段，日均节省无效点击费 1,500-3,000 元 - 业务价值：年化节省 55-110 万元投放预算浪费，并为 G
三轨验证 | 成本轨：月均成本1200元（AI模型API调用费800元/月，人工审核12小时/月×50元/小时=600元，系统维护200元/月），ROI=8万/1200元=66.7倍 | 合规轨：符合《电商法》第十七条反不正当竞争规定，满足平台治理义务；需备案数据处理流程，符合《个保法》用户行为分析合规要求 | 风险轨：误杀率5-8%导致正常商家投诉（概率30%），模型漂移导致检测准确率下降（概率20%），账户关联识别不足遗漏组织化刷单（概率15%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：月均 30 万广告预算中 15-25% 为 IVT（4.5-7.5 万元/月），年化节省 5-15 万元无效消耗；ROAS 真实值比平台报告值高 20-35%，指导预算重新分配
额外价值：为 TikTok/Google 提交无效点击申诉提供量化证据，历史申诉成功率 40-70%，可额外追回 1-3 万元/月
实施难度：⭐⭐⭐☆☆（需要广告点击日志访问权限，Bot 特征需周期性更新）
优先级：⭐⭐⭐⭐⭐（直接影响广告投放 ROI，止损效果立竿见影）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（461 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/risk_fraud/ad_fraud_ivt_detection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/19-风控反欺诈/Skill-Ad-Fraud-IVT-Detection.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Ad Fraud IVT Detection — 行为图 + 统计异常检测
基于 BOTracle (arXiv:2412.02266) + GCD-GNN (arXiv:2407.17333) 核心思想
使用 numpy + collections，无需额外依赖
"""
import numpy as np
from collections import defaultdict
import random

random.seed(42)
np.random.seed(42)


# ─────────────────────────────────────────────
# 1. 数据生成：模拟广告点击会话（真实用户 vs Bot）
# ─────────────────────────────────────────────

def generate_session_data(n_sessions=100):
    """
    生成模拟广告点击会话数据
    返回：list of dict，每条为一个会话
    """
    sessions = []
    for i in range(n_sessions):
        is_bot = i < 30  # 前30条为Bot（30% IVT率）

        if is_bot:
            # Bot特征：均匀间隔、极短停留、浅页面深度
            n_clicks = random.randint(2, 4)
            intervals_ms = [random.uniform(80, 120) for _ in range(n_clicks - 1)]  # 过于规律
            dwell_times_ms = [random.uniform(50, 300) for _ in range(n_clicks)]      # 极短停留
            page_depth = random.randint(1, 2)
            scroll_events = random.randint(0, 2)  # 几乎不滚动
            engagement_score = random.uniform(0, 0.2)
        else:
            # 真实用户：随机间隔、正常停留、有探索行为
            n_clicks = random.randint(3, 12)
            intervals_ms = [random.uniform(500, 15000) for _ in range(n_clicks - 1)]
            dwell_times_ms = [random.uniform(800, 60000) for _ in range(n_clicks)]
            page_depth = random.randint(2, 8)
            scroll_events = random.randint(3, 30)
            engagement_score = random.uniform(0.3, 1.0)

        sessions.append({
            'session_id': f'sess_{i:04d}',
            'is_bot_truth': is_bot,
            'n_clicks': n_clicks,
            'intervals_ms': intervals_ms,
            'dwell_times_ms': dwell_times_ms,
            'page_depth': page_depth,
            'scroll_events': scroll_events,
            'engagement_score': engagement_score,
        })
    return sessions


# ─────────────────────────────────────────────
# 2. 行为特征提取（BOTracle 核心特征）
# ─────────────────────────────────────────────
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2407.17333 — Global Confidence Degree Based Graph Neural Network for Financial Fraud Detection

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：广告点击日志与会话行为字段（click_id、session_id、时间戳、页面序列、停留时长、滚动事件），以及 GA4 等行为序列数据；粒度为会话级，需覆盖完整时间窗。

**输出**：会话级 IVT 标记与整体 IVT 率、异常特征清单、无效支出估算与给平台的申诉材料；供投放与风控团队申请退款并调整投放策略。

## 执行步骤

1. 采集点击日志与会话行为字段
2. 提取停留时长、点击间隔、页面深度等异常特征
3. 构建行为图并计算聚类系数与度分布异常度
4. 融合异常检测打分标记 IVT 会话
5. 输出 IVT 率、无效支出估算与申诉证据

## 边界与不做

- 何时不用：只有转化下滑但点击行为正常时，先排查素材、落地页与归因口径，不要直接判定刷量。
- 能力边界：本技能产出 IVT 标记与申诉材料，不代替平台做退款裁定，也不执行 IP 屏蔽等线上动作。
- 合规边界：行为分析需符合个保法与平台治理要求，误杀需人工复核，检测结果不得用于规避平台风控。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-PromoGuardian-Promotion-Fraud-GNN.html、Skill-PromoGuardian-Promotion-Fraud-GNN、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **延伸**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Ad-Fraud-IVT-Detection

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：19-风控反欺诈　·　源卡：`Skill-Ad-Fraud-IVT-Detection`