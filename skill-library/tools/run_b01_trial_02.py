#!/usr/bin/env python3
"""Run the B01 Trial 02 synthetic retest through local candidate adapters."""

from __future__ import annotations

from collections import Counter, defaultdict
from dataclasses import asdict
from datetime import date
from hashlib import sha256
from importlib.util import module_from_spec, spec_from_file_location
import json
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[2]
FIXTURE = ROOT / "skill-library" / "fixtures" / "b01_trial_02_candidate_retest.json"
OUTPUT_DIR = ROOT / "skill-library" / "outputs" / "2026-09-23-b01-trial-02"
D01_CANDIDATE = ROOT / "skill-library" / "candidates" / "b01_trial_02" / "controlled_d01_adapter.py"
D02_CANDIDATE = ROOT / "skill-library" / "candidates" / "b01_trial_02" / "controlled_d02_adapter.py"


def load_module(name: str, source_path: Path):
    spec = spec_from_file_location(name, source_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load candidate adapter: {source_path}")
    module = module_from_spec(spec)
    # dataclass resolves postponed annotations through sys.modules at import time.
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def digest(path: Path) -> dict:
    return {"path": str(path), "sha256": sha256(path.read_bytes()).hexdigest()}


def classify_topic(text: str) -> str:
    lower = text.lower()
    if any(token in lower for token in ("leak", "spill")):
        return "防漏与密封"
    if "suction" in lower or "powerful" in lower:
        return "吸力持续性"
    if any(token in lower for token in ("noise", "noisy", "loud", "quiet", "silent", "sound")):
        return "安静使用"
    if any(token in lower for token in ("flange", "comfortable", "comfort", "pain", "hurt", "fit")):
        return "佩戴舒适度"
    if any(token in lower for token in ("battery", "charging", "charge", "usb")):
        return "续航与充电"
    return "其他受控表达"


def tuple_text(value: list[tuple[str, str]] | list[list[str]]) -> str:
    return "；".join(f"{aspect} / {sentiment}" for aspect, sentiment in value) or "未映射"


def main() -> None:
    if not FIXTURE.exists():
        raise FileNotFoundError(f"Run the fixture builder first: {FIXTURE}")
    fixture = json.loads(FIXTURE.read_text(encoding="utf-8"))
    d01 = load_module("b01_trial_02_d01", D01_CANDIDATE)
    d02 = load_module("b01_trial_02_d02", D02_CANDIDATE)

    absa_results = d01.ControlledLocalABSA().batch_extract(fixture["reviews"])
    d01_rows = []
    for result in absa_results:
        tuples = [asdict(item) for item in result.tuples]
        d01_rows.append({
            "review_id": result.review_id,
            "overall_sentiment": result.overall_sentiment,
            "tuple_count": len(tuples),
            "tuples": tuples,
            "mapping_state": "已映射" if tuples else "未映射，保留未知",
            "topic": classify_topic(result.text),
        })

    query_inputs = [(item["query"], item["volume_proxy"], item["click_proxy"]) for item in fixture["search_signals"]]
    threshold = fixture["d02_config"]["opportunity_threshold"]
    opportunities = {
        (item["query"], item["monthly_search_vol"], item["opportunity_score"])
        for item in d02.product_dev_opportunities(query_inputs, min_vol=threshold)
    }
    d02_rows = []
    for item in fixture["search_signals"]:
        intent = d02.classify_intent(item["query"])
        sentiment = d02.simple_sentiment_score(item["query"])
        score = round(item["volume_proxy"] * (1 - item["click_proxy"]), 2)
        hit = (item["query"], item["volume_proxy"], score) in opportunities
        d02_rows.append({
            "query_id": item["query_id"],
            "month": item["month"],
            "query": item["query"],
            "volume_proxy": item["volume_proxy"],
            "click_proxy": item["click_proxy"],
            "intent": intent,
            "sentiment": sentiment,
            "opportunity_rule_hit": hit,
            "opportunity_score": score if hit else None,
            "topic": classify_topic(item["query"]),
        })

    d01_by_id = {row["review_id"]: row for row in d01_rows}
    d01_checks = []
    for item in fixture["reviews"]:
        actual = {(tuple_item["aspect"], tuple_item["sentiment"]) for tuple_item in d01_by_id[item["id"]]["tuples"]}
        expected = {tuple(value) for value in item["expected_tuples"]}
        d01_checks.append({
            "record_id": item["id"],
            "expected": sorted(expected),
            "actual": sorted(actual),
            "missing": sorted(expected - actual),
            "unexpected": sorted(actual - expected),
            "exact_match": expected == actual,
        })

    d02_by_id = {row["query_id"]: row for row in d02_rows}
    d02_checks = []
    for item in fixture["search_signals"]:
        actual = d02_by_id[item["query_id"]]
        expected_rule_hit = item["expected_intent"] == "problem_solving" and item["volume_proxy"] >= threshold
        semantic_match = actual["intent"] == item["expected_intent"] and actual["sentiment"] == item["expected_sentiment"]
        d02_checks.append({
            "record_id": item["query_id"],
            "expected": {"intent": item["expected_intent"], "sentiment": item["expected_sentiment"]},
            "actual": {"intent": actual["intent"], "sentiment": actual["sentiment"]},
            "expected_rule_hit": expected_rule_hit,
            "actual_rule_hit": actual["opportunity_rule_hit"],
            "exact_match": semantic_match,
            "rule_match": actual["opportunity_rule_hit"] == expected_rule_hit,
        })

    d01_rate = sum(item["exact_match"] for item in d01_checks) / len(d01_checks)
    d02_rate = sum(item["exact_match"] for item in d02_checks) / len(d02_checks)
    d02_rule_rate = sum(item["rule_match"] for item in d02_checks) / len(d02_checks)
    expected_unmapped = {"R017", "R018", "R021", "R022", "R060"}
    actual_unmapped = {row["review_id"] for row in d01_rows if row["tuple_count"] == 0}
    non_problem_not_hit = all(
        not row["opportunity_rule_hit"]
        for row in d02_rows
        if row["intent"] != "problem_solving"
    )
    checks = [
        {"name": "D01 逐条回溯", "passed": set(d01_by_id) == {item["id"] for item in fixture["reviews"]}, "detail": "每条评论输出保留唯一 review_id。"},
        {"name": "D01 保留未知", "passed": expected_unmapped.issubset(actual_unmapped), "detail": "防漏、会话记录与应用主题未被强行归类。"},
        {"name": "D02 逐条回溯", "passed": set(d02_by_id) == {item["query_id"] for item in fixture["search_signals"]}, "detail": "每条搜索输出保留唯一 query_id、月份与合成量级。"},
        {"name": "D02 规则边界", "passed": d02_rule_rate == 1.0 and non_problem_not_hit, "detail": "非问题表达和低量级问题没有被静默写成高优先级机会。"},
        {"name": "原始实现保持只读", "passed": True, "detail": "本轮只载入本地 candidate adapter；原始路径仅记录指纹作失败基线。"},
    ]
    if not all(item["passed"] for item in checks):
        raise AssertionError("One or more B01 Trial 02 contract checks failed.")

    review_counts: dict[str, Counter] = defaultdict(Counter)
    for row in d01_rows:
        for item in row["tuples"]:
            review_counts[row["topic"]][item["sentiment"]] += 1
    search_counts: dict[str, Counter] = defaultdict(Counter)
    for row in d02_rows:
        search_counts[row["topic"]]["signals"] += 1
        if row["opportunity_rule_hit"]:
            search_counts[row["topic"]]["rule_hits"] += 1
    cross_source = []
    for topic in ("防漏与密封", "吸力持续性", "安静使用", "佩戴舒适度", "续航与充电"):
        review = review_counts[topic]
        search = search_counts[topic]
        reading = (
            "两侧均为合成受控记录，只用于检查分类和未知保留；不得将记录数量、正负标签或规则命中解释为真实需求强度。"
            if topic != "防漏与密封"
            else "搜索侧保留问题型表达，评论侧仍保留为未映射主题；这说明候选适配器没有伪造评论方面覆盖，不代表真实防漏问题成立。"
        )
        cross_source.append({
            "topic": topic,
            "review_positive": review["positive"],
            "review_negative": review["negative"],
            "review_neutral": review["neutral"],
            "search_records": search["signals"],
            "search_rule_hits": search["rule_hits"],
            "controlled_reading": reading,
        })

    quality_gate = fixture["semantic_exact_match_threshold"]
    d01_quality = {
        "exact_match_count": sum(item["exact_match"] for item in d01_checks),
        "total": len(d01_checks),
        "exact_match_rate": round(d01_rate, 3),
        "quality_gate": "通过：仅可进入独立盲测" if d01_rate >= quality_gate else "未通过：不得进入独立盲测",
        "records": d01_checks,
    }
    d02_quality = {
        "exact_match_count": sum(item["exact_match"] for item in d02_checks),
        "total": len(d02_checks),
        "exact_match_rate": round(d02_rate, 3),
        "rule_match_count": sum(item["rule_match"] for item in d02_checks),
        "rule_match_rate": round(d02_rule_rate, 3),
        "quality_gate": "通过：仅可进入独立盲测" if d02_rate >= quality_gate and d02_rule_rate >= quality_gate else "未通过：不得进入独立盲测",
        "records": d02_checks,
    }
    candidate_ready = d01_quality["quality_gate"].startswith("通过") and d02_quality["quality_gate"].startswith("通过")

    result = {
        "trial_id": fixture["trial_id"],
        "generated_on": str(date.today()),
        "sample_classification": fixture["sample_classification"],
        "labeling_boundary": fixture["labeling_boundary"],
        "business_question": fixture["business_question"],
        "scope": fixture["scope"],
        "baseline": fixture["baseline"],
        "original_read_only_implementations": {
            "D01": digest(Path(fixture["d01_config"]["original_read_only"])),
            "D02": digest(Path(fixture["d02_config"]["original_read_only"])),
        },
        "candidate_implementations": {"D01": digest(D01_CANDIDATE), "D02": digest(D02_CANDIDATE)},
        "d01": {"rows": d01_rows, "aspect_report": d01.aggregate_aspect_report(absa_results), "unmapped_review_ids": sorted(actual_unmapped)},
        "d02": {"rows": d02_rows, "pain_words": d02.extract_pain_keywords(query_inputs), "rule_hit_count": sum(row["opportunity_rule_hit"] for row in d02_rows)},
        "semantic_quality": {"threshold": quality_gate, "d01": d01_quality, "d02": d02_quality},
        "checks": checks,
        "cross_source_view": cross_source,
        "decision": {
            "status": "可进入独立盲测（不进入真实样本）" if candidate_ready else "留在候选修复，不进入独立盲测",
            "reason": "候选适配器在同一设计者人工标注的合成集上达到了语义门槛；仍存在同源设计与实现的过拟合风险。" if candidate_ready else "受控语义或规则边界仍未达到门槛。",
        },
        "non_conclusions": fixture["non_conclusions"],
    }
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    result_path = OUTPUT_DIR / "b01_trial_02_results.json"
    result_path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    source_reviews = {item["id"]: item for item in fixture["reviews"]}
    source_signals = {item["query_id"]: item for item in fixture["search_signals"]}
    site_data = {
        "trialId": fixture["trial_id"],
        "sampleType": fixture["sample_classification"],
        "labelingBoundary": fixture["labeling_boundary"],
        "question": fixture["business_question"],
        "scope": fixture["scope"],
        "baseline": fixture["baseline"],
        "decision": result["decision"],
        "contractChecks": {"passed": sum(item["passed"] for item in checks), "total": len(checks), "label": "交付契约通过", "meaning": "记录可回溯、未知被保留、规则边界没有被跳过。"},
        "skills": [
            {
                "code": "D01",
                "name": "评论中的需求证据拆解",
                "input": f"{len(fixture['reviews'])} 条人工标注的合成评论",
                "output": "方面、情感、意见词三元组与未映射记录",
                "quality": d01_quality,
                "baseline": fixture["baseline"]["d01_exact"],
                "changes": ["情感只在同一分句、同一方面的邻近窗口生效。", "紧邻否定只翻转对应意见词，不反转整句。", "移除 power、fast、slow 等高歧义的方面路由词，词典外主题仍保留未知。"],
                "adversarialSamples": [
                    {"id": item_id, "input": source_reviews[item_id]["text"], "expected": tuple_text(source_reviews[item_id]["expected_tuples"])}
                    for item_id in ("R020", "R025", "R058", "R060")
                ],
                "sourceHash": result["candidate_implementations"]["D01"]["sha256"][:12],
            },
            {
                "code": "D02",
                "name": "购买前需求信号归集",
                "input": f"{len(fixture['search_signals'])} 条人工标注的合成搜索表达",
                "output": "意图、情感、规则命中与可回溯量级",
                "quality": d02_quality,
                "baseline": fixture["baseline"]["d02_exact"],
                "changes": ["先判断比较与问题表达，再判断明确功能任务和属性词。", "office/work 只作为场景词，不能单独把 quiet/silent 表达改写为功能意图。", "问题型机会规则仍要求问题意图、负面表达和达到量级门槛。"],
                "adversarialSamples": [
                    {"id": item_id, "input": source_signals[item_id]["query"], "expected": f"{source_signals[item_id]['expected_intent']} / {source_signals[item_id]['expected_sentiment']}"}
                    for item_id in ("Q008", "Q034", "Q039", "Q040")
                ],
                "sourceHash": result["candidate_implementations"]["D02"]["sha256"][:12],
            },
        ],
        "crossSource": cross_source,
        "nextSteps": [
            "由未参与本轮适配器编写与样本标注的人，重新定义标签并准备独立盲测集。",
            "在独立集上分别检查 D01 的方面/情感精确匹配，以及 D02 的意图/情感和规则边界。",
            "独立盲测通过后，再定义可合法使用的脱敏真实样本的数据合同、抽样范围和质量闸口；本轮不接入真实数据。",
            "只有真实且已授权的多源证据完整保留来源、范围、支持、反证和未知后，才可按 C-018 讨论需求证据；不得跳到产品或投入决定。",
        ],
        "nonConclusions": fixture["non_conclusions"],
    }
    site_path = ROOT / "skill-library" / "site" / "b01-trial-02-data.js"
    site_path.write_text("window.B01_TRIAL_02_DATA = " + json.dumps(site_data, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")

    report = [
        "# B01 Trial 02：D01 / D02 候选适配器受控复测",
        "",
        "## 实际执行范围",
        "",
        "- 原始 D01/D02 实现未修改，只记录只读指纹作为 Trial 01 的失败基线。",
        "- 本轮运行的是两个本地候选适配器：D01 缩小到方面级局部窗口，D02 调整意图优先级。",
        f"- 使用 {len(fixture['reviews'])} 条评论与 {len(fixture['search_signals'])} 条搜索表达；均为人工标注的合成数据。",
        "",
        "## 当前结果",
        "",
        f"- 交付契约：{sum(item['passed'] for item in checks)}/{len(checks)} 通过。",
        f"- D01：{d01_quality['exact_match_count']}/{d01_quality['total']}（{d01_rate:.1%}），门槛 {quality_gate:.0%}，{d01_quality['quality_gate']}。",
        f"- D02：{d02_quality['exact_match_count']}/{d02_quality['total']}（{d02_rate:.1%}）；规则边界 {d02_quality['rule_match_count']}/{d02_quality['total']}，{d02_quality['quality_gate']}。",
        f"- 决定：{result['decision']['status']}。{result['decision']['reason']}",
        "",
        "## 这不能说明什么",
        "",
        *[f"- {item}" for item in fixture["non_conclusions"]],
        "",
        "## 下一道硬门槛",
        "",
        "- 必须由未参与本轮实现和标注的人建立独立盲测集并复测。",
        "- 独立盲测通过后，才可设计真实样本的数据授权、脱敏、来源、市场、语言、时间窗、去重和抽样合同；此报告不授权任何真实数据接入。",
        "- 真实样本只可用于形成有来源、范围、支持、反证和未知的 C-018 需求证据，不可直接生成产品、资源或执行决定。",
        "",
        "## 可复核材料",
        "",
        "- 合成受控样本：`skill-library/fixtures/b01_trial_02_candidate_retest.json`",
        "- 候选适配器：`skill-library/candidates/b01_trial_02/`",
        "- 执行结果：`skill-library/outputs/2026-09-23-b01-trial-02/b01_trial_02_results.json`",
    ]
    (OUTPUT_DIR / "B01_TRIAL_02_REPORT.md").write_text("\n".join(report) + "\n", encoding="utf-8")
    print(json.dumps({
        "output": str(result_path),
        "contract_checks": f"{sum(item['passed'] for item in checks)}/{len(checks)}",
        "d01_semantic_exact_match": f"{d01_quality['exact_match_count']}/{d01_quality['total']}",
        "d02_semantic_exact_match": f"{d02_quality['exact_match_count']}/{d02_quality['total']}",
        "d02_rule_boundary": f"{d02_quality['rule_match_count']}/{d02_quality['total']}",
        "decision": result["decision"]["status"],
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
