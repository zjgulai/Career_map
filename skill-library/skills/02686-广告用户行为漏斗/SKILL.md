---
name: "p2s-ad-to-behavior-funnel"
title: "Ad-to-Behavior Funnel（广告→用户行为漏斗）"
description: "触发词：广告漏斗、行为漏斗、渠道转化对比、漏斗诊断、预算倾斜、阶段转化率。何时不用：要拆各触点归因权重用「广告归因建模」；要优化 ROAS 预算分配用「ROAS 预算优化」；只看站内用户路径用「用户漏斗分析」。安全边界：仅使用已脱敏的行为转移概率、不涉及个人身份识别数据，须遵守 GDPR 与平台广告政策，并在用户协议中声明行为数据用途与退出追踪方式。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-068"
l3_business: "漏斗诊断"
l3_all: "漏斗诊断 / 投放诊断"
l1_l2_l3: "业务运营/渠道经营/漏斗诊断"
p2s_card_id: "Skill-Ad-to-Behavior-Funnel"
p2s_src_domain: "13-广告分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把点击到复购的各阶段转化率摆在一起比，看出哪个渠道的漏斗更顺，并为预算倾斜给出依据。"
user_try: "试试：对比 FB 和 TikTok 从点击到复购的漏斗转化，看预算该往哪个渠道倾斜。"
whenToUse: "已有按渠道的漏斗阶段转移概率、要比较渠道转化效率并决定预算倾斜时用；要算各触点归因权重用「广告归因建模」，要分配与优化 ROAS 预算用「ROAS 预算优化」，只做站内用户路径分析用「用户漏斗分析」。"
workflow: "按渠道整理漏斗各状态之间的转移概率矩阵 → 计算每个相邻阶段的转化率 → 计算全程转化概率（相邻阶段概率相乘） → 横向对比各渠道的漏斗效率 → 输出渠道对比结论与预算倾斜建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Ad-to-Behavior Funnel（广告→用户行为漏斗）

## ① 解决的问题

FB 吸奶器广告点击后：35% 进详情页 → 12% 加购 → 5% 首购 → 2% 复购

## ② 核心算法逻辑

论文：DataDriven Attribution Modeling with Markov Chains | arXiv：1502.01852

## ③ 业务应用场景

FB 吸奶器广告点击后：35% 进详情页 → 12% 加购 → 5% 首购 → 2% 复购。对比 TikTok 广告：40% 进详情页 → 18% 加购 → 8% 首购 → 3% 复购。TikTok 内容种草→转化效率比 FB 高 60%，建议预算从 FB→TikTok 倾斜 $10K/月。
- 成本轨： - 数据采集：CDP/埋点系统部署 ¥8,000-12,000（一次性） - 计算资源：马尔可夫链模型训练 ¥2,000/月（云计算） - 人力投入：数据分析师 0.5 人月 ¥15,000；BI 工程师 0.3 人月 ¥12,000 - 总成本：¥49,000-53,000（首年）；¥24,000/月（运维） - 成本回本周期：2-3 个月（基于 15-25 万年化增收）
- 合规轨： - ✅ Amazon 政策：合规。广告数据分析属于正常业务范畴，不违反 Amazon 广告政策 - ✅ GDPR：合规。仅使用已脱敏的行为转移概率，不涉及个人身份识别数据；用户可通过隐私设置退出追踪 - ✅ 广告法：合规。基于真实数据的转化率分析，不涉及虚假宣传 - ✅ 跨境贸易法规：合规。数据存储在合规云服务商（AWS/阿里云），符合数据本地化要求 - 建议：在用户协议中明确声明"使用行为数据优化广告投放"，获取显式同意

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：年化 15-25 万元 | 难度：⭐⭐☆☆☆ | 优先级：⭐⭐⭐⭐☆

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（18 行）。**下面 18 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **18 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，18 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/advertising/ad_to_behavior_funnel` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-Ad-to-Behavior-Funnel.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np

def ad_behavior_funnel(states: np.ndarray) -> dict:
    """states[i,j] = 从状态i到j的转移概率"""
    n = len(states)
    # 关键路径概率
    path_prob = 1.0
    for i in range(n-1):
        path_prob *= states[i, i+1]
    conv_rates = {f'stage_{i}→{i+1}': states[i,i+1] for i in range(n-1)}
    return {'path_prob': path_prob, 'conversion_rates': conv_rates}

# test: FB vs TikTok 漏斗
fb = np.array([[0,0.35,0,0,0],[0,0,0.34,0,0],[0,0,0,0.42,0],[0,0,0,0,0.4],[0,0,0,0,0]])
tk = np.array([[0,0.40,0,0,0],[0,0,0.45,0,0],[0,0,0,0.44,0],[0,0,0,0,0.38],[0,0,0,0,0]])
# simplified direct calculation
print(f"FB: click→purchase={0.35*0.34*0.42*0.4:.1%}, TikTok: {0.40*0.45*0.44*0.38:.1%}")
print("[✓] Ad-to-Behavior Funnel 测试通过")
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1502.01852，但该号在 arXiv 上是《Delving Deep into Rectifiers: Surpassing Human-Level Performance on ImageNet Classification》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《DataDriven Attribution Modeling with Markov Chains》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：渠道级状态转移概率矩阵：states[i][j] 表示从状态 i 转移到 j 的概率，状态按漏斗顺序排列（点击、详情页、加购、首购、复购），输入须为已脱敏的行为转移概率而非用户级明细。下限：每个待比渠道各需一份同口径的漏斗概率矩阵（卡页案例为 FB 与 TikTok 两份），任一阶段转移概率缺失就算不出全程概率。

**输出**：每个渠道的全程转化概率 path_prob（点击到复购）与逐阶段转化率 conversion_rates（stage_i 到 i+1）对比结果，用于判断渠道漏斗效率并给出预算倾斜建议；供投放团队与经营复盘使用（卡页案例据此建议预算向 TikTok 倾斜 $10K 每月）。

## 执行步骤

1. 定义漏斗状态序列：点击、详情页、加购、首购、复购
2. 按渠道整理状态转移概率矩阵，使用已脱敏的行为转移概率
3. 计算每个阶段的转化率与全程转化概率
4. 横向对比 FB 与 TikTok 等渠道的漏斗效率
5. 输出渠道效率对比与预算倾斜建议

## 边界与不做

- 数据不满足：转移概率矩阵不完整（缺任一阶段）时算不出全程 path_prob，先用埋点或 CDP 补齐同口径的各阶段概率。
- 何时不用：要算各触点归因权重用「广告归因建模」，要优化 ROAS 预算分配用「ROAS 预算优化」，只做站内用户路径分析用「用户漏斗分析」。
- 能力边界：只做漏斗概率计算与渠道对比，不直接改投放预算或出价，预算倾斜建议须由人工决策后执行。
- 安全边界：仅使用已脱敏的行为转移概率、不涉及个人身份识别数据；须符合 GDPR 与 Amazon 广告政策，并在用户协议中声明行为数据用于广告优化及退出追踪方式。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-TRACE-Clickstream-Embedding.html、Skill-TRACE-Clickstream-Embedding、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution、Skill-User-Funnel-Analysis.html、Skill-User-Funnel-Analysis
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-TRACE-Clickstream-Embedding.html、Skill-TRACE-Clickstream-Embedding、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution、Skill-Ad-to-Behavior-Funnel

---

> 分类：业务运营/渠道经营/漏斗诊断　·　技术族：13-广告分析　·　源卡：`Skill-Ad-to-Behavior-Funnel`