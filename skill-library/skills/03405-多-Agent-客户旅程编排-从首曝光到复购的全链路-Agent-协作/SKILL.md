---
name: "p2s-mas-customer-journey-orchestration"
title: "多 Agent 客户旅程编排 — 从首曝光到复购的全链路 Agent 协作"
description: "触发词：旅程编排、多 Agent、事件驱动、漏斗修复、复购提醒、全链路。何时不用：单一动作（如一次复购提醒）用对应单点技能即可；要跨认知到复购多个阶段、由多个 Agent 按事件接力时才用本卡。安全边界：站内信不得携带站外链接，须遵守平台消息政策；推送频率须设上限并提供一键退订，不得基于敏感健康数据做预测。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 漏斗诊断"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-MAS-Customer-Journey-Orchestration"
p2s_src_domain: "10-MAS"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把认知、首购、复购、挽回各阶段的运营动作交给多个 Agent 接力编排，不再各团队各自为战。"
user_try: "试试：这是我独立站的用户行为序列和订单数据，帮我设计从首购到复购的旅程编排方案和各阶段触发规则。"
whenToUse: "与「队列挽回调度」相比：单点队列干预用那张卡；要把多个阶段与多个 Agent 串成事件驱动的旅程时用本卡。"
workflow: "定义旅程阶段（认知/考虑/首购/体验/忠诚/流失风险）与状态机 → 按事件触发对应 Agent（如首购后 28 天复购提醒、加购超 24 小时挽回） → 传递用户上下文，保证跨 Agent 信息一致 → 用 A/B 测试文案与频率，评估各阶段转化增量"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 多 Agent 客户旅程编排 — 从首曝光到复购的全链路 Agent 协作

## ① 解决的问题

用户运营负责人面临"用户在不同生命周期阶段的运营动作各团队各自为战没有统一编排"——全旅程4 Agent协作将客户全生命周期运营效率提升3.2倍，年化增收$14.6万

## ② 核心算法逻辑

解决「跨境母婴卖家每个渠道各自运营，客户在 Instagram 看了广告→Amazon 搜索→Shopify 下单→客服跟进 完全断开，导致转化漏斗每步损失 3050%」的业务问题。

## ③ 业务应用场景

场景A：吸奶器复购旅程自动化 - 业务问题：吸奶器配件（储奶袋/吸乳罩）有明确复购周期（30-45 天），但 80% 买家没有收到复购提醒，流向竞品 - 数据要求：订单数据（品类/SKU/购买日期）+ 客户邮箱/推送 token - 部署方案：复购 Agent 在首购后第 28 天推送「储奶袋快用完了？」，附 SKU 补货链接，A/B 测试消息文案 - 预期产出：耗材类 ASIN 30 天复购率从 8% → 23%，年化增收 $76,000（基于 1000 个首购用户计算）
三轨验证： - 成本：显性成本约 $2,500/年（邮件推送服务 $800 + 数据管道维护 $1,200 + A/B 测试工具 $500）；隐性成本为产品经理与开发人员约 40 人天进行规则配置与监控。 - 合规：Amazon 站内信禁止直接发送外部链接（含 Shopify 链接），需改用 Amazon 站内「补货提醒」功能或 Brand Registry 授权消息；GDPR 要求用户可一键退订推送，且复购预测不得基于敏感健康数据（如哺乳频率）。 - 风险：若推送频率过高（如 28 天 + 35 天各一次），可能被用户标记为垃圾消息，导致品牌信任下降；竞品可能同步跟进复购提醒，引发「提醒疲劳
场景B：全旅程漏斗修复 - 业务问题：独立站 Shopify 加购到支付转化率只有 12%，不知道用户卡在哪里 - 数据要求：用户行为序列（页面浏览/加购/结账步骤/停留时长）+ 客服工单 - 部署方案：激活 Agent 监控「加购超 24h 未支付」事件，推送定制挽回（免运费/使用疑问解答） - 预期产出：加购转化率从 12% → 19%，转化提升 58%，年化增收 $52,000

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：母婴跨境 Shopify 独立站（月均 500 新用户）：
复购率提升：从 8% → 23%，年化增收 $76,000
加购转化修复：从 12% → 19%，年化增收 $52,000
流失挽回：AT-RISK 用户挽回率 12%，年化挽回 $18,000
合计年化增收：约 $146,000（旅程编排边际成本接近 0）
实施难度：⭐⭐⭐⭐☆（需要 CDP/数据平台打通各渠道事件，工程量较大）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（277 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/mas/mas_customer_journey_orchestration` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-MAS-Customer-Journey-Orchestration.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
多 Agent 客户旅程编排框架
事件驱动状态机 + 专属 Agent + 上下文传递
"""
import random
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta


class JourneyStage(Enum):
    UNKNOWN = "unknown"
    AWARENESS = "awareness"       # 认知：看到广告/内容
    CONSIDERATION = "consideration"  # 考虑：浏览/加购
    FIRST_PURCHASE = "first_purchase"  # 首购
    ONBOARDING = "onboarding"     # 体验期（首购后30天）
    LOYAL = "loyal"               # 忠实用户（2次+购买）
    AT_RISK = "at_risk"           # 流失风险（30天无活跃）


@dataclass
class CustomerContext:
    """客户旅程上下文（Agent 间传递）"""
    customer_id: str
    stage: JourneyStage = JourneyStage.UNKNOWN
    channel_source: str = "unknown"     # 来源渠道
    preferred_category: str = ""        # 偏好品类
    price_sensitivity: float = 0.5     # 价格敏感度 0-1
    lifetime_value_usd: float = 0.0
    last_purchase_days_ago: int = 999
    purchase_count: int = 0
    last_product_sku: str = ""
    notes: List[str] = field(default_factory=list)
    
    def add_note(self, agent: str, note: str):
        timestamp = datetime.now().strftime("%m/%d %H:%M")
        self.notes.append(f"[{timestamp}][{agent}] {note}")


@dataclass
class AgentAction:
    """Agent 触达动作"""
    action_type: str    # email/push/sms/ad_adjust/coupon
    content: str
    expected_ctr: float = 0.0
    expected_cvr: float = 0.0


class AcquisitionAgent:
    """获客 Agent：识别高意向用户，优化广告投入"""
    
    name = "获客Agent"
    
    def handle(self, ctx: CustomerContext, event: Dict) -> Optional[AgentAction]:
        if ctx.stage != JourneyStage.AWARENESS:
            return None
        
        # 根据用户行为判断意向度
        intent_score = event.get("page_views", 0) * 0.3 + event.get("time_on_site_min", 0) * 0.1
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2403.15891，但该号在 arXiv 上是《Human Motion Prediction under Unexpected Perturbation》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：订单数据（品类、SKU、购买日期）、用户行为序列（页面浏览、加购、结账步骤、停留时长）、客户邮箱或推送 token，以及客服工单数据。

**输出**：各旅程阶段的触发规则与 Agent 分工、跨阶段消息与上下文传递设计，以及分阶段转化增量评估（卡页复购率 8%→23%、加购转化 12%→19%，合计年化约 $146,000），供运营与工程共建。

## 执行步骤

1. 划分旅程阶段并定义状态迁移与触发事件。
2. 指定各阶段负责 Agent 与所需上下文。
3. 配置关键事件动作（复购提醒、加购超时挽回等）。
4. 设置消息频率上限、退订与合规护栏。
5. 用 A/B 测试评估各阶段增量并迭代规则。

## 边界与不做

- 何时不用：缺少跨渠道事件打通的 CDP 或数据平台时不要用；单点动作不必上多 Agent 编排。
- 能力边界：产出阶段规则与编排设计，不代发消息；复购率 8%→23% 等为卡页案例值，工程量大（需打通各渠道事件）。
- 安全边界：站内信不得带站外链接，须可一键退订，不得基于敏感健康数据做预测。

## 技能关联

- **前置**：Skill-Customer-Journey-Analytics.html、Skill-Customer-Journey-Analytics、Skill-MAS-Ecommerce-Ops-Automation.html、Skill-MAS-Ecommerce-Ops-Automation、Skill-RFM-to-Action-Policy-Engine.html、Skill-RFM-to-Action-Policy-Engine、Skill-Repurchase-Trigger-Timing-Model.html、Skill-Repurchase-Trigger-Timing-Model
- **延伸**：Skill-MAS-Ecommerce-Ops-Automation.html、Skill-MAS-Ecommerce-Ops-Automation、Skill-RFM-to-Action-Policy-Engine.html、Skill-RFM-to-Action-Policy-Engine
- **可组合**：Skill-MAS-Ecommerce-Ops-Automation.html、Skill-MAS-Ecommerce-Ops-Automation、Skill-MAS-Customer-Journey-Orchestration

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：10-MAS　·　源卡：`Skill-MAS-Customer-Journey-Orchestration`