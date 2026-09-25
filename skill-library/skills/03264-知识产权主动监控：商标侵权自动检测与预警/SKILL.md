---
name: "p2s-ip-trademark-brand-monitoring"
title: "IP Trademark Brand Monitoring — 知识产权主动监控：商标侵权自动检测与预警"
description: "触发词：品牌侵权监控、仿冒品预警、图片盗用、证据包、平台举报。何时不用：要盯官方商标公告提前异议用「商标侵权追踪」；要在上架前评估我方侵权风险用「上架前 IP 侵权扫描」。安全边界：举报材料须有系统化证据并经品牌方确认；不得对正常竞品发起恶意投诉。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-129"
l3_business: "知识产权检索"
l3_all: "知识产权检索 / 争议证据组织"
l1_l2_l3: "独立控制/财务与合规/知识产权检索"
p2s_card_id: "Skill-IP-Trademark-Brand-Monitoring"
p2s_src_domain: "19-风控反欺诈"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "持续盯着平台上的品牌名、Logo 和主图盗用，发现仿冒品后直接生成带截图证据的举报材料。"
user_try: "试试：监控搜索我们品牌名出现的相似品牌和盗图卖家，输出今日高风险仿冒品清单和证据包。"
whenToUse: "需要持续监控平台端品牌名、Logo 与图片侵权并产出举报材料时用本技能；盯官方商标公告抢异议窗口用「商标侵权追踪」；上架前自查侵权风险用「上架前 IP 侵权扫描」。"
workflow: "录入需要保护的品牌名、Logo、主图与核心关键词 → 拉取平台搜索结果中的竞品 ASIN、品牌名与 Listing 图片 → 计算品牌名相似度与图片哈希相似度并筛出高风险 → 生成带相似度截图与侵权点说明的证据包 → 整理成品牌备案投诉或 DMCA 举报材料"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# IP Trademark Brand Monitoring — 知识产权主动监控：商标侵权自动检测与预警

## ① 解决的问题

竞品上架与我品牌名95%相似的仿冒品抢走流量但人工发现需要数周——多模态IP监控24小时内检测品牌名/Logo/图片侵权并生成证据包，快速举报保护品牌GMV年化避损20-80万元

## ② 核心算法逻辑

品牌侵权的三种形式：

## ③ 业务应用场景

业务问题：品牌"PumpiMom"在 Amazon 销售吸奶器，发现搜索"PumpiMom"时出现了"PumpiMam"和"PumpiMum"两个相似品牌在抢流量。还有一家卖家的产品图片和我们的主图高度相似（95%）。这些每天都在发生，人工发现太慢。
数据要求： - 自己的品牌名/Logo/产品图（需要保护的资产） - Amazon 关键词搜索结果（竞品 ASIN 列表） - 竞品 Listing 图片和品牌名
预期产出： - 每日侵权预警报告：高风险仿冒品列表 - 证据包：相似度截图 + 侵权点说明 - Amazon 侵权举报材料（附图表） - 建议处理方式：DMCA 举报 / Amazon 品牌备案投诉

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
快速发现仿冒品（24h vs 几周）：及时举报减少流量流失 ¥5-20 万/次
品牌声誉保护：防止低质仿冒品损害品牌口碑
Amazon 侵权举报成功率更高（有系统化证据）
年化综合 ROI：¥20-80 万（以品牌保护为主）
实施难度：⭐⭐☆☆☆（文字相似度算法简单；图像哈希 1 周实现；需要 Amazon 产品搜索 API；约 2-3 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（156 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/risk_fraud/ip_trademark_brand_monitoring` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/19-风控反欺诈/Skill-IP-Trademark-Brand-Monitoring.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
IP Trademark Brand Monitoring
知识产权主动监控：商标侵权自动检测
"""
import numpy as np
import re
from dataclasses import dataclass


@dataclass
class BrandAsset:
    """需要保护的品牌资产"""
    brand_name: str
    product_keywords: list  # 核心关键词
    image_hash: str = ''    # 主图感知哈希（生产用 imagehash 库）


@dataclass
class CompetitorListing:
    """竞品 Listing"""
    asin: str
    brand_name: str
    title: str
    image_hash: str = ''
    price: float = 0.0


def levenshtein_distance(s1: str, s2: str) -> int:
    """编辑距离计算"""
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1): dp[i][0] = i
    for j in range(n + 1): dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            cost = 0 if s1[i-1] == s2[j-1] else 1
            dp[i][j] = min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + cost)
    return dp[m][n]


def brand_name_similarity(name1: str, name2: str) -> float:
    """品牌名相似度（0-1）"""
    n1, n2 = name1.lower(), name2.lower()
    if n1 == n2: return 1.0

    # 编辑距离
    dist = levenshtein_distance(n1, n2)
    max_len = max(len(n1), len(n2))
    edit_sim = 1 - dist / max_len

    # 共有子序列
    common_chars = sum(min(n1.count(c), n2.count(c)) for c in set(n1) | set(n2))
    char_sim = common_chars / max(len(n1), len(n2))

    return 0.6 * edit_sim + 0.4 * char_sim


def simulated_phash_similarity(hash1: str, hash2: str) -> float:
    """
    感知哈希相似度（模拟）
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2407.12567，但该号在 arXiv 上是《Experimental demonstration of spontaneous symmetry breaking with emergent multi-qubit entanglement》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：自有品牌名、Logo 与产品图（需保护的资产）、Amazon 关键词搜索结果（竞品 ASIN 清单）、竞品 Listing 图片与品牌名。

**输出**：每日侵权预警报告（高风险仿冒品列表）、带相似度截图与侵权点说明的证据包，以及可提交的 Amazon 侵权举报材料。

## 执行步骤

1. 录入受保护品牌名、Logo、主图与关键词
2. 拉取搜索结果中的竞品 ASIN、品牌名与图片
3. 计算品牌名相似度与图片相似度并排序
4. 生成带截图与侵权点说明的证据包
5. 整理成品牌备案投诉或 DMCA 举报材料

## 边界与不做

- 拿不到竞品 Listing 图片或搜索 API 权限时不适用，图片相似度无法计算
- 只做检测、预警与证据组织，不代替法务判断，也不自动提交投诉
- 举报须基于系统化证据并避免误伤正常竞品，不得用于恶意投诉

## 技能关联

- **前置**：Skill-Amazon-Account-Appeal-Strategy.html、Skill-Amazon-Account-Appeal-Strategy、Skill-Brand-Listing-Hijacking-Detection.html、Skill-Brand-Listing-Hijacking-Detection、Skill-LLM-Contract-Compliance-Review.html、Skill-LLM-Contract-Compliance-Review、Skill-Multimodal-Product-Understanding.html、Skill-Multimodal-Product-Understanding、Skill-VOC-Fraud-Review-Detection.html、Skill-VOC-Fraud-Review-Detection、Skill-Visual-Product-Search.html、Skill-Visual-Product-Search
- **延伸**：Skill-Amazon-Account-Appeal-Strategy.html、Skill-Amazon-Account-Appeal-Strategy、Skill-LLM-Contract-Compliance-Review.html、Skill-LLM-Contract-Compliance-Review、Skill-VOC-Fraud-Review-Detection.html、Skill-VOC-Fraud-Review-Detection、Skill-Visual-Product-Search.html、Skill-Visual-Product-Search
- **可组合**：Skill-LLM-Contract-Compliance-Review.html、Skill-LLM-Contract-Compliance-Review、Skill-VOC-Fraud-Review-Detection.html、Skill-VOC-Fraud-Review-Detection、Skill-IP-Trademark-Brand-Monitoring

---

> 分类：独立控制/财务与合规/知识产权检索　·　技术族：19-风控反欺诈　·　源卡：`Skill-IP-Trademark-Brand-Monitoring`