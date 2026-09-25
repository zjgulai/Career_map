---
name: "p2s-compliant-dynamic-pricing-guard"
title: "Compliant Dynamic Pricing Guard（合规-定价双约束优化）"
description: "触发词：定价合规、MAP 协议、价格底线、跨市场价差、关税传导。何时不用：不带合规约束的定价优化用「AIGP 动态定价」；本技能是套在定价引擎外的约束护栏。安全边界：护栏不得被绕过，调价须留存约束激活日志供合规审查。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性 / 规则监测"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-Compliant-Dynamic-Pricing-Guard"
p2s_src_domain: "17-价格优化"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "在自动调价外面加一层合规闸门，越线就回退，避免踩 MAP 和多市场价差红线。"
user_try: "试试：给我们的动态定价引擎加一层合规检查，MAP 和跨市场价差越线就回退。"
whenToUse: "当已有动态定价引擎且跨市场销售、需要 MAP 与最低价与反倾销约束护栏时用；纯定价优化本身用「AIGP 动态定价」。"
workflow: "建立价格约束库（MAP、历史价格、关税系数） → 在定价引擎外层接入合规护栏 → 每次调价前运行约束检查，越线回退到安全价格 → 记录约束激活日志供合规审查"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Compliant Dynamic Pricing Guard（合规-定价双约束优化）

## ① 解决的问题

AI 动态定价在大促期间将美国售价压低 35%，触发品牌 MAP 协议并引发欧洲经销商投诉——合规-定价双约束框架在优化 GMV 的同时实时检测 MAP/最低价/反倾销边界，违规率归零

## ② 核心算法逻辑

核心思想：跨境动态定价不能只优化利润，必须同时满足多个合规约束，违规定价可能触发 MAP 违规、Amazon 最低价政策、或反倾销诉讼。

## ③ 业务应用场景

业务问题：某母婴品牌同时在 Amazon US/EU/JP 销售，AI 动态定价引擎在大促期间将美国售价压到了比欧洲便宜 35%，触发了品牌 MAP 协议，并引起了欧洲经销商的投诉。
应用流程： 1. 建立价格约束数据库（MAP价格/历史价格/关税系数） 2. 在 AIGP 动态定价引擎外层包装合规护栏 3. 每次调价前运行约束检查，违规则回退到 base_price + 安全边际 4. 记录约束激活日志，供合规审查
量化收益： - 消除 MAP 违规风险（一次 MAP 处罚：暂停账号 30-90 天，损失 150-500 万 GMV） - 跨市场价格差异保持在 15% 以内，防止灰色进口 - 关税调整自动传导到定价，不再依赖人工调整（节省 2-3 天响应时间）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：预防一次 MAP 违规暂停 = 150-500 万 GMV 保护
难度：⭐⭐⭐☆☆（技术集成难度中等）
优先级：⭐⭐⭐⭐⭐（有动态定价 + 多市场的品牌必须配置）
适用场景：跨境多市场动态定价、大促期间自动调价、关税冲击后价格传导

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（62 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/pricing/compliant_dynamic_pricing_guard` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/17-价格优化/Skill-Compliant-Dynamic-Pricing-Guard.md`），已与卡面节选核对，不依赖上述路径。

```python
from dataclasses import dataclass
from typing import Optional
import logging

@dataclass
class PriceConstraints:
    map_price: float           # 品牌最低广告价格
    amazon_floor: float        # Amazon 价格底线（历史最低 × 0.97）
    min_margin_ratio: float    # 最低毛利率（如 0.15 = 15%）
    max_cross_market_gap: float = 0.20  # 跨市场最大价差 20%
    safety_margin: float = 0.03         # 合规安全边际 3%

def compliant_price(
    proposed_price: float,
    constraints: PriceConstraints,
    cost: float,
    market: str = "US",
) -> tuple[float, list[str]]:
    """
    返回合规后的最终价格 + 触发的约束列表。
    """
    final_price = proposed_price
    triggered = []
    
    # MAP 约束
    map_floor = constraints.map_price * (1 + constraints.safety_margin)
    if final_price < map_floor:
        final_price = map_floor
        triggered.append(f"MAP: raised to ${map_floor:.2f}")
    
    # Amazon 价格底线
    if final_price < constraints.amazon_floor:
        final_price = constraints.amazon_floor * (1 + constraints.safety_margin)
        triggered.append(f"AMZN_FLOOR: raised to ${final_price:.2f}")
    
    # 最低毛利约束
    min_price = cost / (1 - constraints.min_margin_ratio)
    if final_price < min_price:
        final_price = min_price
        triggered.append(f"MIN_MARGIN: raised to ${min_price:.2f}")
    
    if triggered:
        logging.warning(f"[Compliance] Market={market}, Proposed={proposed_price:.2f}, Final={final_price:.2f}, Constraints={triggered}")
    
    return final_price, triggered

# 与 AIGP 动态定价集成
def aigp_with_compliance(product_id: str, base_price: float, constraints: PriceConstraints) -> float:
    # 1. AIGP 生成建议价格
    aigp_price = base_price * 0.92  # 模拟：建议降价 8%
    
    # 2. 合规护栏过滤
    final_price, violations = compliant_price(aigp_price, constraints, cost=base_price*0.4)
    
    return final_price

# 测试
constraints = PriceConstraints(map_price=19.99, amazon_floor=17.99, min_margin_ratio=0.20)
price, violations = compliant_price(17.50, constraints, cost=8.00)
print(f"最终合规价格: ${price:.2f}, 触发约束: {violations}")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：品牌 MAP 价格、平台价格底线、最低毛利率、跨市场最大价差、合规安全边际、成本与关税系数。

**输出**：合规后的最终价格与触发的约束清单（MAP、平台底线、最低毛利）、约束激活日志，供定价执行与合规审查。

## 执行步骤

1. 整理各市场的 MAP、价格底线与最低毛利约束
2. 在定价引擎外层接入约束检查
3. 每次调价前运行检查并记录命中项
4. 越线时回退到安全价格并加安全边际
5. 定期审计约束激活日志并更新约束库

## 边界与不做

- 何时不用：没有 MAP 协议文本或历史价格数据时，约束边界无法设定
- 能力边界：只做约束检查与价格回退，不承担法律合规判定与关税申报责任，也不替代法务审查

## 技能关联

- **前置**：Skill-AIGP-LLM-Dynamic-Pricing.html、Skill-AIGP-LLM-Dynamic-Pricing、Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Cost-Plus-Dynamic-Tariff-Pricing.html、Skill-Cost-Plus-Dynamic-Tariff-Pricing、Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework、Skill-Cross-Border-Price-Harmonization.html、Skill-Cross-Border-Price-Harmonization、Skill-Regulatory-Change-Monitoring.html、Skill-Regulatory-Change-Monitoring
- **延伸**：Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Cost-Plus-Dynamic-Tariff-Pricing.html、Skill-Cost-Plus-Dynamic-Tariff-Pricing
- **可组合**：Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Cost-Plus-Dynamic-Tariff-Pricing.html、Skill-Cost-Plus-Dynamic-Tariff-Pricing、Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework、Skill-Regulatory-Change-Monitoring.html、Skill-Regulatory-Change-Monitoring、Skill-Compliant-Dynamic-Pricing-Guard

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：17-价格优化　·　源卡：`Skill-Compliant-Dynamic-Pricing-Guard`