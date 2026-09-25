---
name: "p2s-purchase-sequence-prediction"
title: "Purchase Sequence Prediction — 买家下一购买行为序列预测"
description: "触发词：购买序列预测、下一品类、时间感知、品类扩张路径、推送时机、复购推荐。何时不用：同类耗材的补购时机预测用节奏感知补购卡；要预测用户下一个会买什么品类、什么时候买时用本卡。安全边界：购买序列属敏感经营数据须脱敏使用，推荐不得基于敏感属性，触达须可退订并控制频率。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 复购实验"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-Purchase-Sequence-Prediction"
p2s_src_domain: "14-用户分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "预测用户下一件最可能买的品类和时机，让复购推荐从广撒网变成点对点。"
user_try: "试试：这是我用户 6 个月的购买序列，帮我预测每位用户下一次购买的 Top-3 品类和最优推送时机。"
whenToUse: "与「节奏感知补购预测」相比：同品类耗材的补购时点用那张卡；跨品类的下一购买品类与路径预测用本卡。"
workflow: "整理用户购买序列（品类、时间、金额），至少 6 个月 → 用时间感知序列模型学习品类转移与时间间隔 → 输出下一次购买的 Top-3 品类概率与时机预测 → 据预测安排触达并绘制品类扩张路径图"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Purchase Sequence Prediction — 买家下一购买行为序列预测

## ① 解决的问题

买了吸奶器的用户下个月最可能买配件还是辅食机，品牌完全不知道只能广撒网，复购率只有 18%——时间感知 Transformer 序列建模预测下一购买品类和时机，精准触达复购率提升到 30%+，LTV 增加 40-60%

## ② 核心算法逻辑

核心思想：母婴用户的购买行为有强烈的时序规律——买了吸奶器的用户，通常在 24 周后购买配件（硅胶护罩/储奶袋），36 个月后购买辅食工具，1218 个月后购买学步用品。通过对历史购买序列建模，预测用户下一次最可能购买的品类和时机，实现精准的品类扩张推荐和复购触达。

## ③ 业务应用场景

场景：吸奶器用户购买配件和下阶段产品的精准推荐
- 业务问题：买了吸奶器的用户，品牌不知道下个月她最可能需要什么，推送的营销都是通用的，复购率只有 18%。 - 数据要求：用户历史购买记录（品类 + 购买时间 + 订单金额），至少 6 个月历史。 - 预期产出： - 每位用户下一次购买品类的 Top-3 概率预测 - 最优推送时机（"该用户在 T+14 天购买配件的概率 72%"） - 品类扩张路径图（可视化用户从入门品到全品类的转化路径） - 业务价值：精准推送复购率从 18% 提升到 30%+，LTV 提升 40-60%。
三轨验证 | 成本轨：模型训练月均成本3500元（GPU算力2000元+数据标注1500元），API调用月均800元，人工验证12小时/月折合2400元，总月成本6700元 | 合规轨：符合《个人信息保护法》，用户购买序列数据本地加密存储，不涉及跨境传输，满足母婴产品信息安全要求 | 风险轨：模型过拟合概率18%（建议每季度重训练），季节性购买模式识别偏差±8%，新品类冷启动数据不足导致预测准确率下降至72%，建议建立异常告警机制

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：复购率从 18% 提升到 30%+，用户 LTV 提升 40-60%，年化增量 GMV 50-200 万元
实施难度：⭐⭐⭐☆☆（中等，需要用户购买历史数据 + 序列模型）
优先级：⭐⭐⭐⭐⭐（母婴用户生命周期清晰，序列可预测性强，是最佳序列预测场景）
评估依据：Session-Based Recommendation 系列论文验证，母婴品类转移规律经过多品牌实践验证

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（77 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：'[' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/user_analytics/purchase_sequence_prediction` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-Purchase-Sequence-Prediction.md`），已与卡面节选核对，不依赖上述路径。

```python
from dataclasses import dataclass
from typing import List, Tuple, Dict
from collections import defaultdict, Counter
import math

@dataclass
class PurchaseEvent:
    user_id: str
    category: str
    days_ago: int
    amount_usd: float

CATEGORY_TRANSITIONS = {
    "breast_pump":   [("pump_accessory", 0.65, 14), ("bottle", 0.45, 21), ("sterilizer", 0.40, 30)],
    "pump_accessory":[("bottle", 0.55, 14), ("nursing_pad", 0.40, 7),  ("storage_bag", 0.50, 10)],
    "bottle":        [("bottle_brush", 0.60, 7),  ("formula", 0.35, 21), ("sterilizer", 0.40, 14)],
    "formula":       [("formula", 0.80, 30),       ("feeding_spoon", 0.40, 90), ("baby_food", 0.35, 120)],
    "diaper":        [("diaper", 0.85, 30),         ("wipe", 0.70, 30),  ("rash_cream", 0.50, 21)],
    "baby_food":     [("baby_food", 0.75, 30),      ("learning_fork", 0.50, 30), ("sippy_cup", 0.45, 60)],
}

def predict_next_purchase(history: List[PurchaseEvent],
                           horizon_days: int = 30) -> List[Dict]:
    if not history:
        return []
    sorted_hist = sorted(history, key=lambda e: e.days_ago)
    recent_categories = [e.category for e in sorted_hist[:3]]
    predictions: Dict[str, Dict] = {}
    for i, event in enumerate(sorted_hist[:3]):
        weight = 1.0 / (i + 1)
        transitions = CATEGORY_TRANSITIONS.get(event.category, [])
        for next_cat, base_prob, typical_days in transitions:
            recency_factor = math.exp(-event.days_ago / 30)
            prob = base_prob * weight * recency_factor
            in_window = typical_days <= horizon_days
            if next_cat in predictions:
                predictions[next_cat]["probability"] += prob
                predictions[next_cat]["in_window"] = predictions[next_cat]["in_window"] or in_window
            else:
                predictions[next_cat] = {"category": next_cat, "probability": prob,
                                          "typical_days": typical_days, "in_window": in_window}
    total = sum(p["probability"] for p in predictions.values())
    if total > 0:
        for p in predictions.values():
            p["probability"] = round(p["probability"] / total, 3)
    result = sorted(predictions.values(), key=lambda x: -x["probability"])
    return [r for r in result if r["in_window"]][:5]

def compute_ltv_uplift(base_repurchase_rate: float, predicted_rate: float,
                        avg_order_value: float, months: int = 12) -> Dict:
    base_ltv = avg_order_value * base_repurchase_rate * months
    uplift_ltv = avg_order_value * predicted_rate * months
    return {"base_ltv_usd": round(base_ltv, 0), "predicted_ltv_usd": round(uplift_ltv, 0),
            "ltv_uplift_pct": round((uplift_ltv - base_ltv) / base_ltv * 100, 1)}

users_history = {
    "U001": [PurchaseEvent("U001", "breast_pump", 15, 89.99),
             PurchaseEvent("U001", "diaper", 10, 45.99)],
    "U002": [PurchaseEvent("U002", "breast_pump", 45, 89.99),
             PurchaseEvent("U002", "pump_accessory", 20, 24.99),
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：用户历史购买记录：品类、购买时间与订单金额，至少 6 个月；卡页场景为吸奶器到配件再到辅食机等品类转移。

**输出**：每位用户下一次购买的 Top-3 品类概率、最优推送时机（卡页如 T+14 天购买配件概率 72%）与品类扩张路径图，供营销与 CRM 配置触达。

## 执行步骤

1. 清洗购买序列并补齐品类与时间间隔字段。
2. 用时间感知序列模型学习品类转移规律。
3. 输出下一购买品类的 Top-3 概率与时间预测。
4. 安排触达时点并绘制品类扩张路径。
5. 每季度重训并监控过拟合与冷启动品类的准确率。

## 边界与不做

- 何时不用：购买历史不足 6 个月、或新品类无数据时不要用（冷启动准确率明显下降）；同品类补购提醒用节奏感知补购卡即可。
- 能力边界：产出预测与时机建议，不代发触达；复购率 18%→30% 以上、年化 GMV 50–200 万为卡页案例值。
- 安全边界：序列数据须脱敏，不得基于敏感属性推荐，触达须可退订。

## 技能关联

- **前置**：Skill-CASE-Cadence-Aware-Repurchase-Prediction.html、Skill-CASE-Cadence-Aware-Repurchase-Prediction、Skill-LLM-Augmented-Recommendation.html、Skill-LLM-Augmented-Recommendation、Skill-Long-Term-Preference-Memory.html、Skill-Long-Term-Preference-Memory、Skill-Post-Purchase-Email-Sequence-Optimizer.html、Skill-Post-Purchase-Email-Sequence-Optimizer、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-User-Lifecycle-STAN.html、Skill-User-Lifecycle-STAN
- **延伸**：Skill-CASE-Cadence-Aware-Repurchase-Prediction.html、Skill-CASE-Cadence-Aware-Repurchase-Prediction、Skill-LLM-Augmented-Recommendation.html、Skill-LLM-Augmented-Recommendation、Skill-Long-Term-Preference-Memory.html、Skill-Long-Term-Preference-Memory、Skill-Post-Purchase-Email-Sequence-Optimizer.html、Skill-Post-Purchase-Email-Sequence-Optimizer、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction
- **可组合**：Skill-CASE-Cadence-Aware-Repurchase-Prediction.html、Skill-CASE-Cadence-Aware-Repurchase-Prediction、Skill-Long-Term-Preference-Memory.html、Skill-Long-Term-Preference-Memory、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction、Skill-Purchase-Sequence-Prediction

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：14-用户分析　·　源卡：`Skill-Purchase-Sequence-Prediction`