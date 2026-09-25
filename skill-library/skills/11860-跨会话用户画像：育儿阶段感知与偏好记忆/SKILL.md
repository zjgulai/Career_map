---
name: "p2s-user-profile-long-memory"
title: "User Profile Long Memory — 跨会话用户画像：育儿阶段感知与偏好记忆"
description: "触发词：跨会话画像、长期记忆、育儿阶段感知、偏好持久化、主动预判推荐。何时不用：只做单次会话推荐或离线分层用 RFM 类技能，本技能维护可持久化的结构化画像并跨会话更新。安全边界：画像存储须遵守个人信息保护要求并支持用户查询与删除，推断出的月龄等属性不得对外披露，不得用于歧视性定价。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-101"
l3_business: "分群"
l3_all: "分群 / 需求识别"
l1_l2_l3: "业务运营/品牌与增长/分群"
p2s_card_id: "Skill-User-Profile-Long-Memory"
p2s_src_domain: "14-用户分析"
quality_tier: "preview"
user_summary: "记住用户上个月买了什么、偏好什么品牌，下次打开就能接上，不用重复说。"
user_try: "试试：给我们的会员建立跨会话画像，用户下次回访时按其宝宝阶段自动推荐下一阶段的商品。"
whenToUse: "需要把历史购买与浏览沉淀为可检索、可更新的画像并跨会话复用时用本技能；只做单次会话内推荐用常规推荐策略，只做离线分层用 RFM 类技能。"
workflow: "把购买与浏览写入画像特征 → 推断宝宝月龄与育儿阶段 → 检测临近升阶窗口 → 回访时按画像推荐下一阶段商品 → 按新行为更新画像置信度"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# User Profile Long Memory — 跨会话用户画像：育儿阶段感知与偏好记忆

## ① 解决的问题

用户上月购买了 Stage 1 奶粉，系统推断宝宝约 2-3 月龄

## ② 核心算法逻辑

传统电商推荐的痛点：每次会话独立，用户偏好从零识别——上月的购买行为、表达过的品牌偏好、当下育儿阶段的隐含需求全部丢失。用户画像长期记忆（User Profile Long Memory）通过跨会话持久化画像，将用户的历史交互沉淀为可更新、可检索的结构化特征，驱动无缝个性化体验。

## ③ 业务应用场景

业务问题：用户上月购买了 Stage 1 奶粉，系统推断宝宝约 2-3 月龄。本月用户再次进入 App，系统需要主动预判宝宝已接近 4-5 月，即将进入 Stage 2 窗口，无需用户重复说明偏好即可精准推荐。
数据要求： - 历史购买记录：品类（Stage 1/2/3 奶粉、辅食泥、学步玩具）+ 购买时间 - 浏览行为：浏览了哪些品类页 + 停留时长 - 画像特征存储：JSON 结构，持久化到用户数据库
| 时间节点 | 画像状态 | 推荐行为 | |---------|---------|---------| | 购买 Stage 1（Month 0） | `baby_stage=NEWBORN, brand=Aptamil, organic=True` | 写入画像 | | 用户回访（Month 3） | 推断宝宝≈4月，检测到临近升阶窗口 | 推荐 Stage 2 同品牌有机配方 + 辅食入门套装 | | 用户回访（Month 6） | 推断宝宝≈8月，进入辅食深度期 | 推荐有机米粉/果泥 + Stage 3 过渡产品 |

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

育儿阶段感知是母婴场景特有的强信号，其他通用推荐系统缺失此维度
实现成本低（无 LLM 调用、无向量库），运行成本接近零
与 Shopping Companion Agent 结合后形成完整的"偏好识别→记忆→复现"闭环
仅基于购买行为推断，浏览行为未纳入时推断精度受限
多宝宝家庭（二胎）可能导致阶段推断混乱（需要会话分离机制）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（399 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/user_analytics/user_profile_long_memory` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-User-Profile-Long-Memory.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
User Profile Long Memory — 跨会话用户画像积累
来源: Personalized Memory Architecture + LLM Personal Assistant 2025-2026
场景: 育儿阶段感知 + 品牌偏好 + 价格敏感度的持久化画像管理
"""

import math
import json
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Optional


# ─────────────────────────────────────────────
# 枚举定义
# ─────────────────────────────────────────────

class UserProfileDimension(Enum):
    """用户画像维度枚举"""
    PARENTING_STAGE = "parenting_stage"       # 育儿阶段
    BRAND_PREFERENCE = "brand_preference"     # 品牌偏好
    PRICE_SENSITIVITY = "price_sensitivity"   # 价格敏感度
    ORGANIC_PREFERENCE = "organic_preference" # 有机偏好
    CATEGORY_AFFINITY = "category_affinity"   # 品类亲和度
    QUALITY_WEIGHT = "quality_weight"         # 品质权重
    BABY_AGE_MONTHS = "baby_age_months"       # 宝宝月龄（推断值）


class ParentingStage(Enum):
    """育儿阶段枚举"""
    NEWBORN = "newborn"           # 新生儿（0-3月）
    INFANT = "infant"             # 婴儿期（4-6月）
    CRAWLER = "crawler"           # 爬行期（7-9月）
    TODDLER_EARLY = "toddler_early"   # 学步初期（10-12月）
    TODDLER_MID = "toddler_mid"       # 学步中期（13-18月）
    TODDLER_LATE = "toddler_late"     # 学步晚期（19-24月）
    PRESCHOOL = "preschool"       # 学前期（25+月）
    UNKNOWN = "unknown"           # 未知阶段


# ─────────────────────────────────────────────
# 数据类定义
# ─────────────────────────────────────────────

@dataclass
class ProfileAttribute:
    """单一画像属性，含置信度与衰减机制"""
    value: object
    confidence: float                          # 置信度 [0,1]
    last_updated: str                          # ISO 8601 时间戳
    decay_rate: float = 0.05                   # 月衰减率（λ）
    source: str = "purchase_history"           # 来源标注
    evidence_count: int = 1                    # 支撑证据条数

    def effective_confidence(self, now: Optional[datetime] = None) -> float:
        """计算时间衰减后的有效置信度"""
        if now is None:
            now = datetime.now(timezone.utc)
        last = datetime.fromisoformat(self.last_updated)
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：历史购买记录（品类如奶粉段位、辅食泥、学步玩具，以及购买时间）、浏览行为（浏览的品类页与停留时长）、画像特征存储（JSON 结构，持久化到用户数据库）。

**输出**：跨会话持久化的结构化用户画像（育儿阶段、品牌偏好、价格敏感度、有机偏好、宝宝月龄推断值）与基于画像的推荐结果；卡页示例为按阶段推荐同品牌有机配方与辅食入门套装。

## 执行步骤

1. 把购买记录与浏览行为写入画像特征并持久化。
2. 依据品类与购买时间推断宝宝月龄与育儿阶段。
3. 检测用户临近升阶窗口的时点。
4. 回访时按画像推荐下一阶段商品，无需用户重复说明偏好。
5. 按新行为更新画像属性与置信度。

## 边界与不做

- 只有购买行为、浏览行为未纳入时推断精度受限；多宝宝家庭（二胎）可能导致阶段推断混乱，需要会话分离机制。
- 能力边界：画像基于购买行为推断，月龄等属性是估计值而非事实；本技能只维护与召回画像，不负责推荐排序算法本身，卡页未给出 ROI 数字。
- 合规红线：画像存储须遵守个人信息保护要求并支持用户查询与删除，推断出的月龄等属性不得对外披露。

## 技能关联

- **前置**：Skill-AgeMem-Unified-Agent-Memory.html、Skill-AgeMem-Unified-Agent-Memory、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Shopping-Companion-Agent.html、Skill-Shopping-Companion-Agent
- **延伸**：Skill-Long-Term-Preference-Memory.html、Skill-Long-Term-Preference-Memory
- **可组合**：Skill-ATLAS-Gradient-Free-Continual.html、Skill-ATLAS-Gradient-Free-Continual、Skill-Counterfactual-Recommendation-DCE.html、Skill-Counterfactual-Recommendation-DCE、Skill-User-Profile-Long-Memory

---

> 分类：业务运营/品牌与增长/分群　·　技术族：14-用户分析　·　源卡：`Skill-User-Profile-Long-Memory`