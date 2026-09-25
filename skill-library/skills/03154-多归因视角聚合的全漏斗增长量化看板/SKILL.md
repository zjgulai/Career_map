---
name: "p2s-full-funnel-growth-dashboard"
title: "Full Funnel Growth Dashboard — 多归因视角聚合的全漏斗增长量化看板"
description: "触发词：全漏斗看板、多视角归因、TOFU MOFU BOFU、转化瓶颈、归因重复计数、大促诊断。何时不用：只有渠道级汇总数据、没有旅程级记录时无法分视角归因；要验证增量效果时用实验方法。安全边界：用户旅程数据需匿名化处理并遵守隐私法规，看板对外分享前须去除个体级标识。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 预算分配 / GMV归因分析"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Full-Funnel-Growth-Dashboard"
p2s_src_domain: "14-用户分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把多个归因视角合成一块看板，快速定位是拉新、加购还是成交环节出了问题。"
user_try: "试试：黑五前 ROI 掉了 28%，用全漏斗看板帮我定位是曝光、加购还是弃单的问题。"
whenToUse: "多渠道投放的归因口径互相矛盾、需要定位漏斗瓶颈层时用本技能；只有渠道汇总报表时先补旅程数据；要验证增量效果时用实验方法。"
workflow: "整理用户旅程触点序列并统一触点编码 → 对同批旅程同时运行四个归因视角 → 按 TOFU、MOFU、BOFU 分层计算各层转化率 → 与大促前基线对比定位瓶颈层 → 输出预算与落地页调整建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Full Funnel Growth Dashboard — 多归因视角聚合的全漏斗增长量化看板

## ① 解决的问题

母婴品牌多平台投放（TikTok/Google/Amazon）归因混乱时——全漏斗多视角归因看板将ROAS评估误差从±40%压缩至±8%，预算重分配后季度GMV提升约¥18万

## ② 核心算法逻辑

核心洞察：单一归因模型（首点/末点）本质上是对用户旅程的单一视角投影，存在严重信息损失。MAL 提出用四个互补视角组成归因"多面体"：

## ③ 业务应用场景

场景 A：Momcozy 全渠道投放归因诊断
- 业务问题：在 TikTok Shop 投放 KOL 种草（$20K/月）+ Google 搜索广告（$8K/月）+ Amazon DSP（$5K/月），三平台各报告不同转化数，总转化数之和超出实际订单量 30%，无法判断真实 ROAS - 数据要求：每用户触点序列（平台、时间戳、是否点击、是否购买），最少 1,000 条购买旅程 - 执行方案： 1. 对 10,000 条用户旅程同时运行四视角归因 2. TOFU 分析：TikTok 曝光→点击 CTR = 4.2%，Google 点击→加购 ATR = 12.8% 3. BOFU 分析：Amazon DSP 加购→购买 CR = 38% 
- 业务问题：黑五前两周 ROI 突然下滑 28%，不知道是曝光量不足（TOFU 问题）、加购流失（MOFU 问题）还是弃单率增加（BOFU 问题） - 数据要求：大促前后 4 周漏斗各层日粒度数据，细分到广告组 - 执行方案：TOFU/MOFU/BOFU 分层看板，对比大促前后转化率变化，定位瓶颈层 - 预期产出：定位到 MOFU 加购→购买 CR 从 32% 跌至 19%（原因：竞品降价 22%），快速调价后 CR 回升至 27% - 业务价值：大促 GMV 损失减少约 ¥8 万，归因诊断时效从 3 天缩短至 2 小时

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

30-50 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（197 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'for' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/user_analytics/full_funnel_growth_dashboard` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-Full-Funnel-Growth-Dashboard.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Full Funnel Growth Dashboard — 多归因视角聚合全漏斗看板
场景：Momcozy 10 条用户旅程，TikTok曝光→搜索→详情页→购买
依赖：仅 numpy
"""
import numpy as np

# ─── 数据定义 ──────────────────────────────────────────────────────────────────
# 每条记录：用户旅程触点序列
# 触点编码：0=TikTok曝光, 1=TikTok点击, 2=Google搜索, 3=详情页, 4=加购, 5=购买
JOURNEYS = [
    [0, 1, 2, 3, 4, 5],   # 完整6步旅程
    [0, 2, 3, 5],          # 跳过TikTok点击
    [2, 3, 4, 5],          # 从搜索开始
    [0, 1, 3, 5],          # 跳过搜索直达详情
    [0, 2, 3, 4, 5],
    [1, 2, 3, 5],
    [0, 1, 2, 4, 5],
    [2, 4, 5],             # 直接搜索加购
    [0, 3, 4, 5],
    [1, 3, 5],
]

CHANNEL_NAMES = {0: "TikTok曝光", 1: "TikTok点击", 2: "Google搜索",
                 3: "详情页", 4: "加购", 5: "购买"}

# 渠道平台映射（用于TOFU/MOFU/BOFU分层）
TOFU_CHANNELS  = {0, 1}       # Top: 曝光 + 点击
MOFU_CHANNELS  = {2, 3, 4}    # Mid: 搜索 + 详情 + 加购
BOFU_CHANNELS  = {5}          # Bot: 购买


# ─── 归因模型 ─────────────────────────────────────────────────────────────────
def attribution_first_touch(journeys):
    """首点归因：100% 贡献给旅程第一个触点"""
    counts = np.zeros(6)
    for j in journeys:
        if len(j) > 0:
            counts[j[0]] += 1.0
    return counts / counts.sum()


def attribution_last_touch(journeys):
    """末点归因：100% 贡献给最后一个触点（排除购买本身，给倒数第二步）"""
    counts = np.zeros(6)
    for j in journeys:
        # 最后触点为购买(5)时，归因给购买前最后一个触点
        effective = [c for c in j if c != 5]
        if effective:
            counts[effective[-1]] += 1.0
        elif j:
            counts[j[-1]] += 1.0
    total = counts.sum()
    return counts / total if total > 0 else counts


def attribution_linear(journeys):
    """线性归因：所有触点均分贡献（购买触点不参与分配）"""
    counts = np.zeros(6)
    for j in journeys:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2505.09861，但该号在 arXiv 上是《LiDDA: Data Driven Attribution at LinkedIn》，与本卡主题无关。
⚠️ 该号被 4 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：每用户触点序列（平台、时间戳、是否点击、是否购买，至少上千条购买旅程），以及大促前后各层日粒度的漏斗数据并细分到广告组。

**输出**：四视角归因结果、分层转化率看板、瓶颈层定位与调整建议、归因诊断时效的改善结论；供增长与投放团队在大促期间快速决策。

## 执行步骤

1. 整理用户旅程触点序列并统一触点编码
2. 对同批旅程同时运行四个归因视角
3. 按漏斗分层计算各层转化率
4. 与大促前基线对比定位瓶颈层
5. 输出预算与落地页调整建议

## 边界与不做

- 何时不用：只有渠道级汇总报表、没有旅程级记录时无法做多视角归因，先把旅程数据补齐。
- 能力边界：本技能产出归因看板与诊断结论，不做投放执行和页面改版。
- 数据边界：各平台回传口径不一致会造成归属重复计数（汇总转化数超出实际订单），必须先做口径对齐与去重。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Ad-Spend-Inventory-Sync.html、Skill-Ad-Spend-Inventory-Sync、Skill-Causal-Churn-Retention-Attribution.html、Skill-Causal-Churn-Retention-Attribution、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-User-Funnel-Analysis.html、Skill-User-Funnel-Analysis
- **延伸**：Skill-Ad-Spend-Inventory-Sync.html、Skill-Ad-Spend-Inventory-Sync、Skill-Causal-Churn-Retention-Attribution.html、Skill-Causal-Churn-Retention-Attribution、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling
- **可组合**：Skill-Ad-Spend-Inventory-Sync.html、Skill-Ad-Spend-Inventory-Sync、Skill-Causal-Churn-Retention-Attribution.html、Skill-Causal-Churn-Retention-Attribution、Skill-Full-Funnel-Growth-Dashboard

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：14-用户分析　·　源卡：`Skill-Full-Funnel-Growth-Dashboard`