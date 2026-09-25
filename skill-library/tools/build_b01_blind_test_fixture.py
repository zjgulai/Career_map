#!/usr/bin/env python3
"""Build the B01 independent blind-test package without running a candidate."""

from __future__ import annotations

from datetime import date
from hashlib import sha256
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
PACK_ROOT = ROOT / "skill-library" / "blind-tests" / "b01_blind_test_v1"
INPUT_PATH = PACK_ROOT / "inputs" / "b01_blind_test_inputs.json"
GOLD_PATH = PACK_ROOT / "gold" / "b01_blind_test_proposed_gold.json"
MANIFEST_PATH = PACK_ROOT / "b01_blind_test_manifest.json"
TEMPLATE_PATH = PACK_ROOT / "submission" / "submission_template.json"
LOCK_TEMPLATE_PATH = PACK_ROOT / "gold" / "gold_label_lock.template.json"
SITE_DATA_PATH = ROOT / "skill-library" / "site" / "b01-blind-data.js"


def review(record_id: str, text: str, family: str, challenge: str, expected: list[tuple[str, str]]) -> tuple[dict, dict]:
    return (
        {
            "record_id": record_id,
            "input_type": "D01",
            "coverage_family": family,
            "challenge": challenge,
            "text": text,
            "sample_classification": "合成盲测评论",
        },
        {"record_id": record_id, "expected_tuples": [list(item) for item in expected]},
    )


def signal(record_id: str, query: str, volume: int, click: float, family: str, challenge: str, intent: str, sentiment: str) -> tuple[dict, dict]:
    return (
        {
            "record_id": record_id,
            "input_type": "D02",
            "coverage_family": family,
            "challenge": challenge,
            "month": "2026-11",
            "query": query,
            "volume_proxy": volume,
            "click_proxy": click,
            "sample_classification": "合成盲测搜索表达",
        },
        {
            "record_id": record_id,
            "expected_intent": intent,
            "expected_sentiment": sentiment,
            "expected_rule_hit": intent == "problem_solving" and sentiment == "negative_pain" and volume >= 4000,
        },
    )


def write_json(path: Path, value: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def digest(path: Path) -> str:
    return sha256(path.read_bytes()).hexdigest()


def main() -> None:
    # The reviewer-facing input deliberately excludes every expected label.
    review_specs = [
        ("BR001", "The motor stayed quiet through an afternoon nap.", "噪音", "直接正向", [("噪音", "positive")]),
        ("BR002", "This pump is loud enough to interrupt a phone call.", "噪音", "直接负向", [("噪音", "negative")]),
        ("BR003", "It is not noisy in the nursery.", "噪音", "局部否定", [("噪音", "positive")]),
        ("BR004", "The pump stays quiet, but the suction feels weak by the end.", "噪音", "转折与双方面", [("噪音", "positive"), ("吸力", "negative")]),
        ("BR005", "Suction remained strong through a twenty-minute session.", "吸力", "直接正向", [("吸力", "positive")]),
        ("BR006", "The suction faded before I was finished.", "吸力", "新措辞负向", [("吸力", "negative")]),
        ("BR007", "The suction is not weak when the cup is full.", "吸力", "局部否定", [("吸力", "positive")]),
        ("BR008", "Strong suction saves time, although charging is slow overnight.", "吸力", "转折与双方面", [("吸力", "positive"), ("充电", "negative")]),
        ("BR009", "The battery lasted through two commutes without a recharge.", "充电", "直接正向", [("充电", "positive")]),
        ("BR010", "Battery life dies before lunch on a normal workday.", "充电", "直接负向", [("充电", "negative")]),
        ("BR011", "Charging is not slow with the supplied cable.", "充电", "局部否定", [("充电", "positive")]),
        ("BR012", "The battery lasts, but the USB connection is difficult to reach.", "充电", "转折与近义表达", [("充电", "positive")]),
        ("BR013", "The small body fits easily into my travel pouch.", "尺寸重量", "直接正向", [("尺寸重量", "positive")]),
        ("BR014", "It feels bulky in a small work bag.", "尺寸重量", "直接负向", [("尺寸重量", "negative")]),
        ("BR015", "The pump is not heavy once it is clipped on.", "尺寸重量", "局部否定", [("尺寸重量", "positive")]),
        ("BR016", "The compact size is helpful, but the flange presses too hard.", "尺寸重量", "转折与双方面", [("尺寸重量", "positive"), ("舒适度", "negative")]),
        ("BR017", "The soft flange stayed comfortable throughout the session.", "舒适度", "直接正向", [("舒适度", "positive")]),
        ("BR018", "My skin felt sore after a short session.", "舒适度", "直接负向", [("舒适度", "negative")]),
        ("BR019", "The flange is not uncomfortable once I use the right size.", "舒适度", "局部否定", [("舒适度", "positive")]),
        ("BR020", "The fit is comfortable, but the sound is still loud in meetings.", "舒适度", "转折与双方面", [("舒适度", "positive"), ("噪音", "negative")]),
        ("BR021", "Setup was simple before my first workday.", "易用性", "直接正向", [("易用性", "positive")]),
        ("BR022", "Assembly is complicated when I have to clean it quickly.", "易用性", "直接负向", [("易用性", "negative")]),
        ("BR023", "The instructions are not difficult to follow.", "易用性", "局部否定", [("易用性", "positive")]),
        ("BR024", "The guide is clear, but replacing the valve is difficult.", "易用性", "转折与任务变化", [("易用性", "negative")]),
        ("BR025", "The price feels fair for something I use every day.", "价格", "直接正向", [("价格", "positive")]),
        ("BR026", "It is expensive for a pump with only one cup.", "价格", "直接负向", [("价格", "negative")]),
        ("BR027", "The price is not unreasonable after the discount.", "价格", "局部否定", [("价格", "positive")]),
        ("BR028", "The value is good, but replacement cups cost too much.", "价格", "转折与双价格词", [("价格", "negative")]),
        ("BR029", "Customer support was helpful when I needed a replacement part.", "客服", "直接正向", [("客服", "positive")]),
        ("BR030", "Customer service ignored my email for three days.", "客服", "直接负向", [("客服", "negative")]),
        ("BR031", "Support was not slow once I included the order number.", "客服", "局部否定", [("客服", "positive")]),
        ("BR032", "Support replied quickly, but delivery still arrived late.", "客服", "转折与双方面", [("客服", "positive"), ("物流", "negative")]),
        ("BR033", "Shipping was fast and the box arrived safely.", "物流", "直接正向", [("物流", "positive")]),
        ("BR034", "The package arrived late with no useful update.", "物流", "直接负向", [("物流", "negative")]),
        ("BR035", "Delivery was not delayed this time.", "物流", "局部否定", [("物流", "positive")]),
        ("BR036", "The package arrived early, but customer support could not answer a billing question.", "物流", "转折与双方面", [("物流", "positive"), ("客服", "negative")]),
        ("BR037", "Milk leaked when I bent to pick up a toy.", "未知主题", "词典外防漏", []),
        ("BR038", "One quick turn caused a spill on my shirt.", "未知主题", "词典外防漏", []),
        ("BR039", "I need an app that remembers each pumping session.", "未知主题", "应用与记录", []),
        ("BR040", "The screen should show how much milk I collected today.", "未知主题", "显示与记录", []),
        ("BR041", "Cleaning the tiny valves takes longer than expected.", "未知主题", "清洁维护", []),
        ("BR042", "I would like a case that keeps the parts sterile between trips.", "未知主题", "储存卫生", []),
        ("BR043", "The warranty wording is hard to understand before buying.", "未知主题", "保障条款", []),
        ("BR044", "I cannot tell whether the cup is aligned correctly from the mirror.", "未知主题", "位置反馈", []),
        ("BR045", "The compact design is easy to pack, and the battery lasts all day.", "跨方面组合", "同向双方面", [("尺寸重量", "positive"), ("充电", "positive")]),
        ("BR046", "The quiet motor is nice, but the price still feels expensive.", "跨方面组合", "转折双方面", [("噪音", "positive"), ("价格", "negative")]),
        ("BR047", "It is not loud, and the setup is simple after one practice run.", "跨方面组合", "双局部正向", [("噪音", "positive"), ("易用性", "positive")]),
        ("BR048", "The pump is lightweight, yet the suction is too weak for me.", "跨方面组合", "转折双方面", [("尺寸重量", "positive"), ("吸力", "negative")]),
    ]
    d01_inputs, d01_gold = zip(*(review(*item) for item in review_specs))

    signal_specs = [
        ("BQ001", "best wearable pump for travel", 5200, 0.41, "比较意图", "比较基线", "comparison", "positive_expectation"),
        ("BQ002", "wearable pump vs traditional pump", 4700, 0.38, "比较意图", "比较连接词", "comparison", "positive_expectation"),
        ("BQ003", "better breast pump for small bags", 3600, 0.45, "比较意图", "比较与尺寸", "comparison", "positive_expectation"),
        ("BQ004", "top quiet pump alternatives", 4100, 0.35, "比较意图", "比较优先级", "comparison", "positive_expectation"),
        ("BQ005", "compare wearable pumps with long battery", 3900, 0.49, "比较意图", "比较与属性", "comparison", "positive_expectation"),
        ("BQ006", "best pump alternative for office", 4300, 0.46, "比较意图", "场景不改比较", "comparison", "positive_expectation"),
        ("BQ007", "wearable pump suction weak", 4000, 0.28, "问题意图", "阈值等于门槛", "problem_solving", "negative_pain"),
        ("BQ008", "wearable pump suction weak", 3999, 0.28, "问题意图", "阈值低于门槛", "problem_solving", "negative_pain"),
        ("BQ009", "breast pump leaks when bending", 6100, 0.31, "问题意图", "词典外问题", "problem_solving", "negative_pain"),
        ("BQ010", "wearable pump hurts after twenty minutes", 4500, 0.39, "问题意图", "舒适度问题", "problem_solving", "negative_pain"),
        ("BQ011", "pump battery drains during commute", 3800, 0.33, "问题意图", "低量级边界", "problem_solving", "negative_pain"),
        ("BQ012", "pump noise too loud for calls", 7200, 0.26, "问题意图", "噪音问题", "problem_solving", "negative_pain"),
        ("BQ013", "how to clean a wearable pump", 5400, 0.52, "功能意图", "明确操作任务", "functional", "neutral"),
        ("BQ014", "wearable pump flange replacement instructions", 4200, 0.48, "功能意图", "更换任务", "functional", "neutral"),
        ("BQ015", "how to sterilize pump parts", 4600, 0.51, "功能意图", "卫生任务", "functional", "neutral"),
        ("BQ016", "install wearable pump collection cup", 3500, 0.47, "功能意图", "安装任务", "functional", "neutral"),
        ("BQ017", "clean noisy wearable pump", 4300, 0.44, "功能意图", "问题词与任务冲突", "functional", "neutral"),
        ("BQ018", "how to replace a weak pump valve", 4050, 0.50, "功能意图", "问题词与任务冲突", "functional", "neutral"),
        ("BQ019", "wearable pump return policy", 5100, 0.55, "导航意图", "政策查找", "navigational", "neutral"),
        ("BQ020", "wearable pump shipping status", 4800, 0.58, "导航意图", "订单状态", "navigational", "neutral"),
        ("BQ021", "wearable pump customer service phone number", 3300, 0.61, "导航意图", "服务入口", "navigational", "neutral"),
        ("BQ022", "pump warranty claim page", 2900, 0.57, "导航意图", "保障入口", "navigational", "neutral"),
        ("BQ023", "wearable pump order tracking", 3600, 0.54, "导航意图", "订单跟踪", "navigational", "neutral"),
        ("BQ024", "replacement cup shipping status", 3100, 0.59, "导航意图", "零件订单状态", "navigational", "neutral"),
        ("BQ025", "quiet wearable pump", 6800, 0.42, "属性意图", "静音属性", "attribute", "neutral"),
        ("BQ026", "hands free breast pump with long battery life", 5900, 0.43, "属性意图", "续航属性", "attribute", "neutral"),
        ("BQ027", "portable pump for small bag", 4400, 0.46, "属性意图", "尺寸属性", "attribute", "neutral"),
        ("BQ028", "wireless double wearable pump", 4100, 0.40, "属性意图", "形态属性", "attribute", "neutral"),
        ("BQ029", "wearable pump flange size", 3700, 0.52, "属性意图", "配件属性", "attribute", "neutral"),
        ("BQ030", "usb charge wearable pump", 3500, 0.47, "属性意图", "充电属性", "attribute", "neutral"),
        ("BQ031", "best pump for leaking while traveling", 6300, 0.32, "优先级碰撞", "比较优先于问题词", "comparison", "positive_expectation"),
        ("BQ032", "how to clean a pump that leaks", 5500, 0.37, "优先级碰撞", "任务优先于问题词", "functional", "neutral"),
        ("BQ033", "return policy for a noisy pump", 4900, 0.49, "优先级碰撞", "导航优先于问题词", "navigational", "neutral"),
        ("BQ034", "silent pump that does not leak", 4050, 0.34, "优先级碰撞", "属性与否定问题", "attribute", "neutral"),
        ("BQ035", "wearable pump loud during commute", 4001, 0.25, "阈值边界", "高于门槛一条", "problem_solving", "negative_pain"),
        ("BQ036", "wearable pump loud during commute", 3998, 0.25, "阈值边界", "低于门槛两条", "problem_solving", "negative_pain"),
        ("BQ037", "pump battery drains during commute", 4000, 0.66, "阈值边界", "点击率不改准入", "problem_solving", "negative_pain"),
        ("BQ038", "pump battery drains during commute", 3999, 0.12, "阈值边界", "点击率不替代量级", "problem_solving", "negative_pain"),
        ("BQ039", "wearable pump leaks after bending", 4000, 0.30, "阈值边界", "词典外问题等于门槛", "problem_solving", "negative_pain"),
        ("BQ040", "wearable pump leaks after bending", 3999, 0.30, "阈值边界", "词典外问题低于门槛", "problem_solving", "negative_pain"),
    ]
    d02_inputs, d02_gold = zip(*(signal(*item) for item in signal_specs))

    inputs = {
        "protocol_id": "B01-BLIND-01",
        "created_on": str(date.today()),
        "sample_classification": "全量合成的独立盲测输入包",
        "input_boundary": "本文件不含预期标签。不得以本包形成消费者、市场、产品或经营结论。",
        "reviews": list(d01_inputs),
        "search_signals": list(d02_inputs),
    }
    proposed_gold = {
        "protocol_id": "B01-BLIND-01",
        "label_state": "待独立复核并锁定",
        "access_boundary": "文件层级没有技术隔离；独立性依赖交接时由未参与本轮实现与标注的人限制访问、复核并记录。未生成 gold_label_lock.json 前，本金标不得用于正式评分。",
        "thresholds": {"d01_exact_match": 0.9, "d02_semantic_exact_match": 0.9, "d02_rule_boundary": 1.0},
        "d01": list(d01_gold),
        "d02": list(d02_gold),
    }
    write_json(INPUT_PATH, inputs)
    write_json(GOLD_PATH, proposed_gold)
    manifest = {
        "protocol_id": "B01-BLIND-01",
        "pack_state": "待独立评审",
        "sample_classification": inputs["sample_classification"],
        "d01_input_count": len(d01_inputs),
        "d02_input_count": len(d02_inputs),
        "input_sha256": digest(INPUT_PATH),
        "proposed_gold_sha256": digest(GOLD_PATH),
        "required_before_scoring": [
            "未参与本轮实现和标注的人复核拟议金标。",
            "独立评审人写入 gold_label_lock.json，记录金标指纹与锁定责任。",
            "独立执行人提交候选输出与候选代码指纹。",
            "评分脚本生成可复核结果；结果通过只允许设计真实样本数据合同。",
        ],
        "not_authorized": [
            "真实评论、搜索、订单、投放或经营数据接入。",
            "消费者需求、市场规模、产品定义、投入、发布或业务动作结论。",
            "岗位、Preset、Agent、权限或生产能力任命。",
        ],
    }
    write_json(MANIFEST_PATH, manifest)
    submission_template = {
        "protocol_id": "B01-BLIND-01",
        "submission_state": "待独立执行人填写",
        "independent_evaluator_reference": "",
        "executed_at": "",
        "input_sha256": "独立运行器会自动写入，不应手填。",
        "candidate_hashes": {"D01": "", "D02": ""},
        "d01_outputs": [{"record_id": "BR001", "tuples": [["方面", "positive_or_negative"]]}],
        "d02_outputs": [{"record_id": "BQ001", "intent": "", "sentiment": "", "opportunity_rule_hit": False}],
        "submission_note": "提交者不得将本模板中的示例行留在正式提交中。",
    }
    write_json(TEMPLATE_PATH, submission_template)
    lock_template = {
        "protocol_id": "B01-BLIND-01",
        "lock_state": "独立金标已锁定",
        "gold_sha256": "填写拟议金标复核并定稿后的 SHA-256。",
        "independent_reviewer_reference": "填写未参与本轮候选实现和原有标签设计的复核责任标识。",
        "locked_at": "填写锁定时间，例如 2026-09-23T16:00:00+08:00。",
        "lock_note": "独立复核人确认金标版本、歧义处理记录和固定门槛后再创建实际 gold_label_lock.json。",
    }
    write_json(LOCK_TEMPLATE_PATH, lock_template)

    safe_site_data = {
        "protocolId": manifest["protocol_id"],
        "state": manifest["pack_state"],
        "sampleType": manifest["sample_classification"],
        "question": "D01 与 D02 的候选适配器能否在独立设计的合成输入上保持方面、局部语义、意图优先级和机会规则边界？",
        "scope": "本包只准备独立盲测，不运行候选、不展示金标、不接入真实数据。",
        "counts": {"d01": len(d01_inputs), "d02": len(d02_inputs), "total": len(d01_inputs) + len(d02_inputs)},
        "coverage": [
            {"name": "D01 方面与局部语义", "count": len(d01_inputs), "detail": "九类已覆盖方面，直接正负、局部否定、转折、多方面与八类未知主题分开检验。"},
            {"name": "D02 搜索意图与规则", "count": len(d02_inputs), "detail": "比较、问题、功能、导航、属性、优先级碰撞与 3998/3999/4000/4001 阈值边界同时覆盖。"},
        ],
        "roles": [
            {"role": "独立标注复核", "work": "复核拟议金标，处理歧义，锁定金标版本。", "must_not": "不得参与本轮候选实现或原有标签设计。"},
            {"role": "独立执行", "work": "按固定输入运行候选，提交逐条输出与代码指纹。", "must_not": "不得改写输入、金标或评分门槛。"},
            {"role": "结果复核", "work": "检查评分脚本、交付完整性和下一道门槛。", "must_not": "不得把通过解释成真实洞察或业务授权。"},
        ],
        "gates": [
            "未生成独立金标锁定文件时，评分脚本拒绝执行。",
            "独立运行器也会在金标未锁定时拒绝生成候选输出；检查模式只核对输入与候选版本，不运行候选。",
            "候选输出必须覆盖每一条输入，并保留输入 ID 和候选代码指纹。",
            "D01、D02 语义精确匹配均不低于 90%，D02 规则边界必须为 100%。",
            "盲测通过后只能设计真实样本数据合同，不能直接接入真实数据。",
        ],
        "nonConclusions": manifest["not_authorized"],
        "download": "../outputs/2026-09-23-b01-blind-pack/b01_blind_test_execution_pack.xlsx",
        "handoff": "独立运行器已准备：锁定后只生成带输入与候选指纹的逐条提交，不读取金标、不计算得分。",
    }
    SITE_DATA_PATH.write_text("window.B01_BLIND_DATA = " + json.dumps(safe_site_data, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
    print(json.dumps({"inputs": str(INPUT_PATH), "gold": str(GOLD_PATH), "manifest": str(MANIFEST_PATH), "d01": len(d01_inputs), "d02": len(d02_inputs)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
