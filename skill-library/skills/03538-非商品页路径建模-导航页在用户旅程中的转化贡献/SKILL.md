---
name: "p2s-nonitem-page-path-modeling"
title: "非商品页路径建模 - 导航页在用户旅程中的转化贡献"
description: "触发词：非商品页路径、导航页贡献权重、页面类型序列、桑基图节点、Next-Item预测。何时不用：只做页面级漏斗流失节点定位时用「用户旅程分析」；只按设备、浏览器、来源做转化诊断时用「电商流量来源全维度分析」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-068"
l3_business: "漏斗诊断"
l3_all: "漏斗诊断 / 站点运营"
l1_l2_l3: "业务运营/渠道经营/漏斗诊断"
p2s_card_id: "Skill-NonItem-Page-Path-Modeling"
p2s_src_domain: "14-用户分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "算清首页、分类页、搜索页这些导航页到底带来多少转化，避免误砍真正有用的页面。"
user_try: "试试：用我的会话级页面序列量化首页、分类页、搜索页的转化贡献权重，并估算砍掉分类页会损失多少转化。"
whenToUse: "需要量化首页、分类页、搜索页、博客页等非商品页在旅程中的转化贡献、估算砍掉或降级某导航页的损失时用本技能；只做页面级流失节点定位时用「用户旅程分析」；只按设备、浏览器、来源做转化诊断时用「电商流量来源全维度分析」；只做跨会话意图语义标注时用「Session意图漂移建模」。"
workflow: "按会话整理商品页与非商品页混合的页面事件序列 → 对非商品页做CPID或PE编码（频繁分类组合、搜索词嵌入、页面文本嵌入） → 用HypTrails假设检验验证非商品页的影响力 → 训练简化SASRec序列模型，对比仅商品页与含非商品页的Next-Item预测 → 做非商品页贡献度消融，输出各导航节点的转化贡献权重"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 非商品页路径建模 - 导航页在用户旅程中的转化贡献

## ① 解决的问题

母婴独立站（如 Momcozy/Graco 品牌站）的首页、分类页（奶瓶/奶粉/童车）、搜索页在转化漏斗中起什么作用

## ② 核心算法逻辑

传统序列推荐系统只捕获「商品交互」（PDP 页面点击），忽略了用户在商品页之间穿插访问的非商品页——如首页、搜索结果页、分类页（Category Listing Page，CLP）、博客详情页、购物车页等。论文证明：这些非商品页携带了关于用户意图的关键信号，能显著提升 NextItem 预测性能。

## ③ 业务应用场景

业务问题：母婴独立站（如 Momcozy/Graco 品牌站）的首页、分类页（奶瓶/奶粉/童车）、搜索页在转化漏斗中起什么作用？桑基图中这些节点的「转化贡献权重」该如何科学量化？砍掉或降级某个导航页会损失多少转化？
| 母婴独立站页面类型 | 论文非商品页类型 | 表征策略推荐 | |-----------------|---------------|------------| | 首页（Homepage） | 单体非商品页 | CPID: `type:homepage` | | 搜索结果页（SRP） | 商品列表页 | PE: 用搜索词嵌入 / CPID: 频繁分类组合 | | 分类页（CLP，如 `/breast-pumps/`） | 商品列表页 | CPID: `category:breast-pump` | | 博客/选购指南页 | 单体非商品页 | PE: 页面文本嵌入 | | 购物车页 | 单
| 字段 | 类型 | 示例 | |------|------|------| | `session_id` | string | `"sess_abc123"` | | `event_time` | datetime | `"2026-05-01 10:23:45"` | | `page_type` | string | `"pdp"` / `"clp"` / `"srp"` / `"homepage"` / `"cart"` | | `page_id` | string | `"pdp_M001"` / `"clp_breast-pump"` / `"srp_q123"` | | `ite

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

5000 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（650 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/user_analytics/nonitem_page_path_modeling` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-NonItem-Page-Path-Modeling.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Non-Item Page Path Modeling — 非商品页路径建模
论文: arXiv:2408.15953 (ACM TORS 2025)
场景: 母婴出海独立站，桑基图导航节点权重量化 + 含非商品页的 Next-Item 预测

包含:
1. 页面序列数据模拟（母婴电商场景）
2. HypTrails 假设检验：验证非商品页影响力
3. 非商品页 CPID/PE 编码
4. 序列推荐模型（简化 SASRec 变体）：对比 Items-Only vs 含非商品页
5. 非商品页贡献度消融实验（Ablation Study）
"""

from __future__ import annotations

import random
import math
from collections import defaultdict, Counter
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
import numpy as np


# ============================================================
# 1. 数据结构定义
# ============================================================

@dataclass
class PageEvent:
    """单次页面交互事件"""
    page_type: str          # "pdp" / "clp" / "srp" / "homepage" / "cart" / "blog"
    page_id: str            # 页面唯一标识
    item_id: Optional[str]  # 仅 PDP 有商品 ID
    categories: List[str]   # 页面分类标签（非商品页最重要的内容信号）
    query_embedding: Optional[List[float]] = None  # 搜索页专用

    @property
    def is_item(self) -> bool:
        """是否为商品页（PDP）"""
        return self.page_type == "pdp" and self.item_id is not None

    def get_cpid(self) -> str:
        """构造 Content-based Page ID"""
        if self.is_item:
            return f"item:{self.item_id}"
        if self.categories:
            cat_str = "|".join(sorted(self.categories))
            return f"{self.page_type}:{cat_str}"
        return f"{self.page_type}:{self.page_id}"


@dataclass
class UserSession:
    """用户会话：包含商品页和非商品页的混合序列"""
    session_id: str
    events: List[PageEvent] = field(default_factory=list)

    def get_item_sequence(self) -> List[str]:
        """仅返回商品页序列（传统方式）"""
        return [e.item_id for e in self.events if e.is_item]
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2408.15953。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：会话级页面交互事件：session_id、event_time、page_type（pdp/clp/srp/homepage/cart/blog）、page_id、item_id（仅PDP）、categories（页面分类标签）、query_embedding（搜索页专用）；按会话与时间排序，必须同时保留商品页与非商品页事件；示例取值如page_type为pdp、clp、srp、homepage、cart，page_id如pdp_M001、clp_breast-pump、srp_q123。

**输出**：非商品页的转化贡献权重与消融结论（仅商品页与含非商品页的Next-Item预测效果差异）、CPID与PE编码结果、HypTrails假设检验结论；供站点运营与增长团队判断首页、分类页、搜索页、博客页在桑基图中的权重，以及砍掉或降级某个导航页会损失多少转化。

## 执行步骤

1. 采集会话级页面访问事件（page_type、page_id、categories、event_time）并按时序整理
2. 为非商品页生成CPID或嵌入表征PE
3. 运行HypTrails检验非商品页对路径的解释力
4. 训练序列推荐模型并对比仅商品页与含非商品页的预测效果
5. 逐类消融非商品页，量化其对转化的贡献
6. 输出各导航页的贡献权重与保留、降级建议

## 边界与不做

- 数据不满足：事件缺少page_type与categories，或日志只保留商品页点击而丢掉导航页与会话内时序时无法建模，需先补齐含非商品页的会话级埋点。
- 何时不用：只做页面级流失节点与优化优先级时用「用户旅程分析」；只按设备、浏览器、来源做转化诊断时用「电商流量来源全维度分析」；只做页面转移矩阵缺观测补全时用「超稀疏矩阵补全」。
- 能力边界：输出非商品页贡献权重与消融结论，不做导航页改版或前端实施，也不替代站点A/B实验验证。

## 技能关联

- **前置**：Skill-Diversity-Reranking-SMMR.html、Skill-Diversity-Reranking-SMMR、Skill-Session-Intent-Shift.html、Skill-Session-Intent-Shift、Skill-TRACE-Clickstream-Embedding.html、Skill-TRACE-Clickstream-Embedding、Skill-Traffic-Source-Analysis.html、Skill-Traffic-Source-Analysis、Skill-User-Funnel-Analysis.html、Skill-User-Funnel-Analysis
- **延伸**：Skill-Diversity-Reranking-SMMR.html、Skill-Diversity-Reranking-SMMR、Skill-Session-Intent-Shift.html、Skill-Session-Intent-Shift、Skill-Traffic-Source-Analysis.html、Skill-Traffic-Source-Analysis
- **可组合**：Skill-Diversity-Reranking-SMMR.html、Skill-Diversity-Reranking-SMMR、Skill-Session-Intent-Shift.html、Skill-Session-Intent-Shift、Skill-NonItem-Page-Path-Modeling

---

> 分类：业务运营/渠道经营/漏斗诊断　·　技术族：14-用户分析　·　源卡：`Skill-NonItem-Page-Path-Modeling`