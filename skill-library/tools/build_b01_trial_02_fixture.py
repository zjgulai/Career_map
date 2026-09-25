#!/usr/bin/env python3
"""Create the manually labelled, synthetic fixture for B01 Trial 02."""

from __future__ import annotations

from datetime import date, timedelta
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "skill-library" / "fixtures" / "b01_trial_02_candidate_retest.json"


def review(index: int, rating: int, text: str, expected: list[tuple[str, str]], note: str) -> dict:
    return {
        "id": f"R{index:03d}",
        "rating": rating,
        "submitted_on": str(date(2026, 7, 3) + timedelta(days=(index - 1) * 2)),
        "language": "en",
        "text": text,
        "expected_tuples": [list(item) for item in expected],
        "fixture_note": note,
    }


def signal(index: int, query: str, volume: int, click: float, intent: str, sentiment: str, note: str) -> dict:
    return {
        "query_id": f"Q{index:03d}",
        "month": ("2026-07", "2026-08", "2026-09", "2026-10")[(index - 1) % 4],
        "query": query,
        "volume_proxy": volume,
        "click_proxy": click,
        "expected_intent": intent,
        "expected_sentiment": sentiment,
        "fixture_note": note,
    }


def main() -> None:
    review_rows = [
        (2, "The noise is loud enough that I would not use it beside a sleeping baby.", [("噪音", "negative")], "否定词不应错误翻转远处 loud。"),
        (5, "It is quiet and discreet enough for a shared office. I love the compact size.", [("噪音", "positive"), ("尺寸重量", "positive")], "同句多方面正向表达。"),
        (2, "The suction feels weak after fifteen minutes, although the battery is good.", [("吸力", "negative"), ("充电", "positive")], "转折两方面。"),
        (5, "Strong suction helped me finish quickly and the charging cable is easy to use.", [("吸力", "positive"), ("充电", "positive")], "关键词前后的局部正向词。"),
        (2, "The flange fit was uncomfortable and painful by the end of the session.", [("舒适度", "negative")], "舒适度负面。"),
        (5, "The flange fit is comfortable and the small pump is portable for travel.", [("尺寸重量", "positive"), ("舒适度", "positive")], "舒适度与尺寸正面。"),
        (2, "Battery life is poor and charging is slow during a busy workday.", [("充电", "negative")], "slow 仅在电池语境中生效。"),
        (5, "Battery life is great. It lasts a full workday and charging is fast.", [("充电", "positive")], "fast 仅在电池语境中生效。"),
        (2, "Setup was complicated and the instructions made assembly difficult.", [("易用性", "negative")], "多词同一方面。"),
        (5, "The setup is easy and simple even when I am tired.", [("易用性", "positive")], "易用性正面。"),
        (2, "The price feels expensive for something that still makes a loud sound.", [("噪音", "negative"), ("价格", "negative")], "价格与噪音负面。"),
        (5, "It is worth the price because it is quiet and easy to use.", [("噪音", "positive"), ("易用性", "positive"), ("价格", "positive")], "三方面正面。"),
        (2, "Customer service was slow to respond when I asked for help.", [("客服", "negative")], "客服响应慢不应映射为物流。"),
        (5, "Customer support was fast and helpful when I needed a replacement part.", [("客服", "positive")], "客服响应快不应映射为物流。"),
        (2, "The package arrived late and delivery updates were poor.", [("物流", "negative")], "物流负面。"),
        (5, "Shipping was fast and the package arrived in good condition.", [("物流", "positive")], "物流正面。"),
        (2, "Milk leaked from the cup after I bent down to pick up a toy.", [], "词典外防漏问题保留未知。"),
        (2, "One sudden movement caused a spill, and I had to change my shirt.", [], "词典外防漏问题保留未知。"),
        (3, "It is quiet but the suction is weak, so my experience is mixed.", [("吸力", "negative"), ("噪音", "positive")], "转折后不应把正负互相抵消。"),
        (4, "The compact size is great, but the flange fit is not comfortable for a long session.", [("尺寸重量", "positive"), ("舒适度", "negative")], "局部否定只作用 comfortable。"),
        (3, "The pump works for me, but I need a clearer way to track each session.", [], "会话记录词典外保留未知。"),
        (4, "I want an app that marks the session as complete.", [], "应用与会话记录不误报易用性。"),
        (1, "The sound is noisy and the suction power is weak. I regret the purchase.", [("吸力", "negative"), ("噪音", "negative")], "power 不应误路由为充电。"),
        (5, "Quiet, powerful, comfortable and easy. This made commuting much easier.", [("吸力", "positive"), ("噪音", "positive"), ("舒适度", "positive"), ("易用性", "positive")], "短句多方面正面。"),
        (5, "The pump is not loud, and the suction is strong.", [("吸力", "positive"), ("噪音", "positive")], "紧邻否定翻转 loud。"),
        (2, "The pump is not quiet; the noise is loud during calls.", [("噪音", "negative")], "紧邻否定翻转 quiet。"),
        (5, "Charging is not slow at all, and the battery lasts long.", [("充电", "positive")], "紧邻否定翻转 slow。"),
        (2, "The battery drains before lunch, even when I charge it overnight.", [("充电", "negative")], "电池耗尽负面。"),
        (5, "The battery lasts long and charging is fast.", [("充电", "positive")], "充电正面。"),
        (2, "It feels heavy and bulky in a work bag.", [("尺寸重量", "negative")], "尺寸重量负面。"),
        (5, "The small, lightweight design is portable for travel.", [("尺寸重量", "positive")], "尺寸重量正面。"),
        (2, "The flange is sore after a short session.", [("舒适度", "negative")], "舒适度负面。"),
        (5, "The soft flange stays comfortable throughout the session.", [("舒适度", "positive")], "舒适度正面。"),
        (2, "Assembly is difficult without help.", [("易用性", "negative")], "help 不应单独触发客服。"),
        (5, "The setup guide is clear and easy to follow.", [("易用性", "positive")], "说明清晰、易用。"),
        (2, "Customer service ignored my request for a replacement part.", [("客服", "negative")], "客服未响应。"),
        (5, "Support replied quickly and gave a helpful answer.", [("客服", "positive")], "客服快速响应。"),
        (2, "Shipping was delayed for a week.", [("物流", "negative")], "物流延迟。"),
        (5, "Delivery arrived early and the package was safe.", [("物流", "positive")], "物流提前到达。"),
        (2, "This price is too high for the build quality.", [("价格", "negative")], "价格负面。"),
        (5, "The cost is affordable for a daily-use pump.", [("价格", "positive")], "价格正面。"),
        (5, "The noise is quiet. The flange is comfortable for a full session.", [("噪音", "positive"), ("舒适度", "positive")], "跨句两方面。"),
        (2, "The sound is noisy. The fit hurts after ten minutes.", [("噪音", "negative"), ("舒适度", "negative")], "跨句两方面负面。"),
        (3, "The suction is powerful, however battery life is poor.", [("吸力", "positive"), ("充电", "negative")], "however 转折。"),
        (3, "The suction is weak; the size is compact.", [("吸力", "negative"), ("尺寸重量", "positive")], "分号两方面。"),
        (5, "The device is easy to clean.", [("易用性", "positive")], "功能词不影响评论方面。"),
        (2, "The device is difficult to clean.", [("易用性", "negative")], "功能词不影响评论方面。"),
        (3, "The value is worth it, but delivery was late.", [("价格", "positive"), ("物流", "negative")], "转折不互相污染。"),
        (3, "The price is expensive, but customer support was helpful.", [("价格", "negative"), ("客服", "positive")], "价格与客服相反方向。"),
        (5, "The pump is silent during calls.", [("噪音", "positive")], "silent 正面。"),
        (1, "The pump wakes everyone because it is loud.", [("噪音", "negative")], "loud 负面。"),
        (5, "The fit is not painful after a full session.", [("舒适度", "positive")], "紧邻否定翻转 painful。"),
        (2, "The fit is not comfortable after a full session.", [("舒适度", "negative")], "紧邻否定翻转 comfortable。"),
        (1, "The battery is dead before lunch.", [("充电", "negative")], "电池失效。"),
        (5, "The battery remains strong all day.", [("充电", "positive")], "电池表现正面。"),
        (2, "The delivery package arrived damaged.", [("物流", "negative")], "物流损坏。"),
        (5, "The package arrived safely and shipping was fast.", [("物流", "positive")], "物流安全及时。"),
        (3, "The instructions are complicated, although customer support is responsive.", [("易用性", "negative"), ("客服", "positive")], "同句转折，两个方面。"),
        (5, "The price is reasonable and the setup is simple.", [("易用性", "positive"), ("价格", "positive")], "价格与易用性正面。"),
        (2, "It leaked when I bent over, and I need session history in the app.", [], "两个未覆盖主题都必须保留未知。"),
    ]
    reviews = [review(index, *row) for index, row in enumerate(review_rows, start=1)]

    signal_rows = [
        ("wearable breast pump leaking milk", 6200, 0.14, "problem_solving", "negative_pain", "防漏问题型。"),
        ("quiet breast pump office", 5400, 0.31, "attribute", "neutral", "安静场景，非痛点。"),
        ("wearable pump suction too weak", 4900, 0.10, "problem_solving", "negative_pain", "吸力问题。"),
        ("hands free breast pump spill", 4500, 0.12, "problem_solving", "negative_pain", "防漏问题。"),
        ("comfortable wearable pump flange", 3800, 0.22, "attribute", "neutral", "舒适度属性。"),
        ("wearable breast pump cleaning", 3200, 0.25, "functional", "neutral", "功能型。"),
        ("wearable breast pump leaking milk", 6500, 0.13, "problem_solving", "negative_pain", "重复月份的防漏问题。"),
        ("silent breast pump work office", 5900, 0.29, "attribute", "neutral", "work/office 是场景，非功能词。"),
        ("wearable pump suction too weak", 5300, 0.09, "problem_solving", "negative_pain", "重复月份的吸力问题。"),
        ("hands free breast pump spill", 4700, 0.11, "problem_solving", "negative_pain", "重复月份的防漏问题。"),
        ("wearable pump flange size", 4100, 0.19, "attribute", "neutral", "尺寸属性。"),
        ("best wearable breast pump", 7600, 0.35, "comparison", "positive_expectation", "比较型。"),
        ("wearable breast pump leaking milk", 6800, 0.12, "problem_solving", "negative_pain", "重复月份的防漏问题。"),
        ("quiet breast pump office", 5600, 0.30, "attribute", "neutral", "场景属性。"),
        ("wearable pump suction too weak", 5100, 0.10, "problem_solving", "negative_pain", "重复月份的吸力问题。"),
        ("hands free breast pump spill", 4800, 0.10, "problem_solving", "negative_pain", "重复月份的防漏问题。"),
        ("wearable breast pump battery life", 3900, 0.24, "attribute", "neutral", "续航属性。"),
        ("breast pump return policy", 2900, 0.18, "navigational", "neutral", "政策导航。"),
        ("how to clean wearable breast pump", 3300, 0.21, "functional", "neutral", "明确使用任务。"),
        ("wearable breast pump how to use", 3700, 0.20, "functional", "neutral", "明确使用任务。"),
        ("quiet wearable breast pump night shift", 4300, 0.18, "attribute", "neutral", "场景属性。"),
        ("silent breast pump meetings", 4100, 0.21, "attribute", "neutral", "场景属性。"),
        ("wearable pump leaking while bending", 5200, 0.11, "problem_solving", "negative_pain", "防漏问题。"),
        ("breast pump flange pain after use", 4600, 0.12, "problem_solving", "negative_pain", "舒适度问题。"),
        ("wearable pump uncomfortable fit", 4400, 0.14, "problem_solving", "negative_pain", "舒适度问题。"),
        ("breast pump suction weak after 10 minutes", 4900, 0.10, "problem_solving", "negative_pain", "吸力问题。"),
        ("breast pump battery life long", 3900, 0.23, "attribute", "neutral", "续航属性。"),
        ("wearable breast pump charge usb c", 3600, 0.22, "attribute", "neutral", "充电属性。"),
        ("compare wearable breast pump models", 6100, 0.28, "comparison", "positive_expectation", "比较型。"),
        ("wearable pump vs standard pump", 5800, 0.27, "comparison", "positive_expectation", "比较型。"),
        ("breast pump replacement parts", 3100, 0.19, "functional", "neutral", "配件动作任务。"),
        ("breast pump return policy", 3000, 0.17, "navigational", "neutral", "政策导航。"),
        ("portable breast pump size guide", 4200, 0.20, "attribute", "neutral", "尺寸属性。"),
        ("hands free breast pump office quiet", 5100, 0.24, "attribute", "neutral", "office 不等于功能。"),
        ("wearable breast pump sound too loud", 4700, 0.11, "problem_solving", "negative_pain", "噪音问题。"),
        ("noisy wearable breast pump", 4500, 0.13, "problem_solving", "negative_pain", "噪音问题。"),
        ("hands free pump spill while walking", 4300, 0.12, "problem_solving", "negative_pain", "防漏问题。"),
        ("breast pump leak after bending", 5000, 0.11, "problem_solving", "negative_pain", "防漏问题。"),
        ("best quiet wearable breast pump", 7000, 0.33, "comparison", "positive_expectation", "比较优先于属性词。"),
        ("wearable breast pump cleaning instructions", 3400, 0.20, "functional", "neutral", "功能优先于属性词。"),
        ("electric breast pump double", 5200, 0.22, "attribute", "neutral", "结构属性。"),
        ("breast pump shipping status", 2800, 0.16, "navigational", "neutral", "订单状态导航。"),
        ("wearable breast pump breast shield size", 3900, 0.20, "attribute", "neutral", "尺寸属性。"),
        ("painful breast pump flange", 4700, 0.12, "problem_solving", "negative_pain", "舒适度问题。"),
        ("breast pump strong suction", 4400, 0.24, "attribute", "neutral", "能力属性而非痛点。"),
        ("wearable breast pump battery drains fast", 4600, 0.15, "problem_solving", "negative_pain", "续航问题。"),
        ("how to sterilize wearable pump", 3200, 0.19, "functional", "neutral", "明确使用任务。"),
        ("wearable breast pump customer service", 2700, 0.18, "navigational", "neutral", "服务入口导航。"),
    ]
    signals = [signal(index, *row) for index, row in enumerate(signal_rows, start=1)]

    assert len(reviews) == 60
    assert len(signals) == 48
    fixture = {
        "trial_id": "B01-TRIAL-02",
        "title": "B01 候选适配器受控复测：可穿戴吸奶器使用阶段需求证据",
        "created_at": "2026-09-23",
        "sample_classification": "人工标注的合成受控复测样本",
        "labeling_boundary": "标注由本轮测试设计者定义，尚非独立盲评；所有数据均为合成文本和合成量级。",
        "business_question": "在不触碰真实消费者或经营数据的前提下，D01 与 D02 的候选修复能否正确保留局部语义、问题/属性边界和未覆盖主题？",
        "scope": "本轮只检验候选适配器对 60 条评论和 48 条购买前搜索表达的合成标注是否一致。它不测模型泛化、真实数据接入、样本代表性、市场规模或业务价值。",
        "non_conclusions": [
            "不代表真实消费者偏好、市场规模、品牌、品类问题或需求优先级。",
            "不构成产品定义、功能改版、投入优先级、投放、采购、发布、岗位任命或业务授权。",
            "不证明候选适配器在独立盲测、真实语言、真实数据质量或生产运行中可靠。",
        ],
        "baseline": {
            "trial_id": "B01-TRIAL-01",
            "d01_exact": "14/24（58.3%）",
            "d02_exact": "15/18（83.3%）",
            "meaning": "原始只读实现的失败基线；本轮不修改该实现。",
        },
        "d01_config": {
            "source_skill_id": "04011-p2s-voc-aspect-sentiment-extraction-6afb1dae",
            "original_read_only": "/Users/lute/.dsh/skills/p2s-voc-aspect-sentiment-extraction/references/implementation.py",
            "candidate_implementation": "skill-library/candidates/b01_trial_02/controlled_d01_adapter.py",
            "method": "ControlledLocalABSA：按方面、按分句、按邻近意见词的局部窗口；词典外主题保留未知。",
        },
        "d02_config": {
            "source_skill_id": "03791-p2s-search-voc-signal-loop-4a0bf819",
            "original_read_only": "/Users/lute/.dsh/skills/p2s-search-voc-signal-loop/references/implementation.py",
            "candidate_implementation": "skill-library/candidates/b01_trial_02/controlled_d02_adapter.py",
            "method": "比较、问题、功能、属性、导航的显式优先级；office/work 不单独视为功能意图。",
            "opportunity_threshold": 4000,
        },
        "semantic_exact_match_threshold": 0.90,
        "reviews": reviews,
        "search_signals": signals,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(fixture, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"fixture": str(OUTPUT), "reviews": len(reviews), "search_signals": len(signals)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
