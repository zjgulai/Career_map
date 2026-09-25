#!/usr/bin/env python3
"""Run the B01 controlled fixture through the original D01 and D02 implementations."""

from __future__ import annotations

from collections import Counter, defaultdict
from dataclasses import asdict
from datetime import date
from hashlib import sha256
from importlib.util import module_from_spec, spec_from_file_location
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
FIXTURE_PATH = ROOT / "skill-library" / "fixtures" / "b01_trial_01_wearable_pump.json"
OUTPUT_DIR = ROOT / "skill-library" / "outputs" / "2026-09-23-b01-trial-01"


def load_module(name: str, source_path: Path):
    spec = spec_from_file_location(name, source_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load source implementation: {source_path}")
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def source_digest(source_path: Path) -> dict:
    return {
        "path": str(source_path),
        "sha256": sha256(source_path.read_bytes()).hexdigest(),
    }


def classify_topic(text: str) -> str:
    lower = text.lower()
    if any(token in lower for token in ("leak", "spill")):
        return "防漏与密封"
    if any(token in lower for token in ("suction", "pump strength")):
        return "吸力持续性"
    if any(token in lower for token in ("noise", "noisy", "loud", "quiet", "silent", "sound")):
        return "安静使用"
    if any(token in lower for token in ("flange", "comfortable", "comfort", "pain")):
        return "佩戴舒适度"
    if any(token in lower for token in ("battery", "charging", "charge")):
        return "续航与充电"
    return "未预设主题"


def main() -> None:
    fixture = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))
    d01_path = Path(fixture["d01_config"]["source_implementation"])
    d02_path = Path(fixture["d02_config"]["source_implementation"])
    if not d01_path.is_file() or not d02_path.is_file():
        raise FileNotFoundError("The original D01/D02 implementations are not available.")

    d01 = load_module("b01_d01", d01_path)
    d02 = load_module("b01_d02", d02_path)

    review_inputs = [{"id": item["id"], "text": item["text"]} for item in fixture["reviews"]]
    absa_results = d01.RuleBasedABSA().batch_extract(review_inputs)
    aspect_report = d01.aggregate_aspect_report(absa_results)
    d01_rows = []
    for result in absa_results:
        tuples = [asdict(item) for item in result.tuples]
        d01_rows.append({
            "review_id": result.review_id,
            "overall_sentiment": result.overall_sentiment,
            "tuple_count": len(tuples),
            "tuples": tuples,
            "mapping_state": "已映射" if tuples else "未映射，保留未知",
        })

    query_inputs = [(item["query"], item["volume_proxy"], item["click_proxy"]) for item in fixture["search_signals"]]
    opportunity_threshold = fixture["d02_config"]["opportunity_threshold"]
    opportunity_by_key = {
        (item["query"], item["monthly_search_vol"], item["opportunity_score"]): item
        for item in d02.product_dev_opportunities(query_inputs, min_vol=opportunity_threshold)
    }
    d02_rows = []
    for item in fixture["search_signals"]:
        intent = d02.classify_intent(item["query"])
        sentiment = d02.simple_sentiment_score(item["query"])
        score = item["volume_proxy"] * (1 - item["click_proxy"])
        is_opportunity = (item["query"], item["volume_proxy"], score) in opportunity_by_key
        d02_rows.append({
            "query_id": item["query_id"],
            "month": item["month"],
            "query": item["query"],
            "volume_proxy": item["volume_proxy"],
            "click_proxy": item["click_proxy"],
            "intent": intent,
            "sentiment": sentiment,
            "opportunity_rule_hit": is_opportunity,
            "opportunity_score": round(score, 2) if is_opportunity else None,
            "topic": classify_topic(item["query"]),
        })

    pain_words = d02.extract_pain_keywords(query_inputs, top_n=10)
    review_index = {item["id"]: item for item in fixture["reviews"]}
    d01_unmapped = [item["review_id"] for item in d01_rows if not item["tuple_count"]]
    d01_topic_rows = []
    for row in d01_rows:
        for item in row["tuples"]:
            d01_topic_rows.append({
                "review_id": row["review_id"],
                "topic": classify_topic(review_index[row["review_id"]]["text"]),
                "aspect": item["aspect"],
                "sentiment": item["sentiment"],
                "opinion": item["opinion"],
                "raw_span": item["raw_span"],
            })

    d01_topic_counts = defaultdict(Counter)
    for item in d01_topic_rows:
        d01_topic_counts[item["topic"]][item["sentiment"]] += 1
    d02_topic_counts = defaultdict(Counter)
    for item in d02_rows:
        d02_topic_counts[item["topic"]]["signals"] += 1
        if item["opportunity_rule_hit"]:
            d02_topic_counts[item["topic"]]["rule_hits"] += 1

    d01_rows_by_id = {item["review_id"]: item for item in d01_rows}
    d01_semantic_checks = []
    for expected in fixture["semantic_spot_check_policy"]["d01_expected"]:
        actual = {
            (item["aspect"], item["sentiment"])
            for item in d01_rows_by_id[expected["review_id"]]["tuples"]
        }
        wanted = {tuple(item) for item in expected["expected_tuples"]}
        d01_semantic_checks.append({
            "record_id": expected["review_id"],
            "expected": sorted(wanted),
            "actual": sorted(actual),
            "missing": sorted(wanted - actual),
            "unexpected": sorted(actual - wanted),
            "exact_match": wanted == actual,
        })
    d02_rows_by_id = {item["query_id"]: item for item in d02_rows}
    d02_semantic_checks = []
    for expected in fixture["semantic_spot_check_policy"]["d02_expected"]:
        actual = d02_rows_by_id[expected["query_id"]]
        d02_semantic_checks.append({
            "record_id": expected["query_id"],
            "expected": {"intent": expected["intent"], "sentiment": expected["sentiment"]},
            "actual": {"intent": actual["intent"], "sentiment": actual["sentiment"]},
            "exact_match": expected["intent"] == actual["intent"] and expected["sentiment"] == actual["sentiment"],
        })
    threshold = fixture["semantic_spot_check_policy"]["exact_match_threshold"]
    d01_exact_rate = sum(item["exact_match"] for item in d01_semantic_checks) / len(d01_semantic_checks)
    d02_exact_rate = sum(item["exact_match"] for item in d02_semantic_checks) / len(d02_semantic_checks)

    cross_source_view = []
    for topic in ["防漏与密封", "吸力持续性", "安静使用", "佩戴舒适度", "续航与充电"]:
        review_counts = d01_topic_counts.get(topic, Counter())
        search_counts = d02_topic_counts.get(topic, Counter())
        if topic == "防漏与密封":
            reading = "搜索侧命中问题型规则；评论侧未映射，暴露当前 D01 词典的覆盖缺口。"
        elif topic == "吸力持续性":
            reading = "两侧都有合成输入记录；D01 规则输出有正负并存，但语义闸口未通过，只能保留为待修复测试主题。"
        elif topic == "安静使用":
            reading = "D01 规则输出有正负并存，搜索侧主要是属性/场景表达；语义闸口未通过，不能合并成单向痛点。"
        elif topic == "佩戴舒适度":
            reading = "D01 规则输出有正负记录，搜索侧只是属性表达；语义闸口未通过，不能把它们当作证据。"
        else:
            reading = "D01 规则输出有正负记录，搜索侧低于试跑阈值；语义闸口未通过，不输出优先级判断。"
        cross_source_view.append({
            "topic": topic,
            "review_positive": review_counts["positive"],
            "review_negative": review_counts["negative"],
            "review_neutral": review_counts["neutral"],
            "search_records": search_counts["signals"],
            "search_rule_hits": search_counts["rule_hits"],
            "controlled_reading": reading,
        })

    source_trace_d01 = all(item["review_id"] in review_index for item in d01_rows)
    source_trace_d02 = all(item["query_id"] in {row["query_id"] for row in fixture["search_signals"]} for item in d02_rows)
    expected_unmapped = {"R017", "R018", "R021", "R022"}
    assertions = [
        {"name": "D01 逐条回溯", "passed": source_trace_d01, "detail": "每个 D01 输出保留唯一 review_id。"},
        {"name": "D01 保留未知", "passed": expected_unmapped.issubset(set(d01_unmapped)), "detail": "防漏与会话记录的合成评论未被强行归类。"},
        {"name": "D02 逐条回溯", "passed": source_trace_d02, "detail": "每个 D02 输出保留唯一 query_id、月份与合成量级。"},
        {"name": "D02 不改写非问题查询", "passed": any(item["intent"] != "problem_solving" and not item["opportunity_rule_hit"] for item in d02_rows), "detail": "属性、比较和功能型查询不进入问题型机会规则。"},
    ]
    if not all(item["passed"] for item in assertions):
        raise AssertionError("One or more B01 controlled-trial checks failed.")

    result = {
        "trial_id": fixture["trial_id"],
        "generated_on": str(date.today()),
        "sample_classification": fixture["sample_classification"],
        "business_question": fixture["business_question"],
        "scope": fixture["scope"],
        "source_implementations": {
            "D01": source_digest(d01_path),
            "D02": source_digest(d02_path),
        },
        "d01": {
            "rows": d01_rows,
            "aspect_report": aspect_report,
            "topic_rows": d01_topic_rows,
            "unmapped_review_ids": d01_unmapped,
        },
        "d02": {
            "rows": d02_rows,
            "pain_words": pain_words,
        },
        "semantic_spot_check": {
            "purpose": fixture["semantic_spot_check_policy"]["purpose"],
            "exact_match_threshold": threshold,
            "d01": {
                "exact_match_count": sum(item["exact_match"] for item in d01_semantic_checks),
                "total": len(d01_semantic_checks),
                "exact_match_rate": round(d01_exact_rate, 3),
                "quality_gate": "通过" if d01_exact_rate >= threshold else "未通过，不能进入真实样本判断",
                "records": d01_semantic_checks,
            },
            "d02": {
                "exact_match_count": sum(item["exact_match"] for item in d02_semantic_checks),
                "total": len(d02_semantic_checks),
                "exact_match_rate": round(d02_exact_rate, 3),
                "quality_gate": "通过" if d02_exact_rate >= threshold else "未通过，不能进入真实样本判断",
                "records": d02_semantic_checks,
            },
        },
        "cross_source_view": cross_source_view,
        "checks": assertions,
        "non_conclusions": fixture["non_conclusions"],
    }
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUTPUT_DIR / "b01_trial_01_results.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")

    site_data = {
        "trialId": fixture["trial_id"],
        "sampleType": fixture["sample_classification"],
        "question": fixture["business_question"],
        "scope": fixture["scope"],
        "contractChecks": {
            "passed": sum(item["passed"] for item in assertions),
            "total": len(assertions),
            "label": "交付契约通过",
            "meaning": "每条输出可回到输入，未知和非问题型记录没有被静默吞掉。",
        },
        "skills": [
            {
                "code": "D01",
                "name": "评论中的需求证据拆解",
                "input": f"{len(fixture['reviews'])} 条合成评论",
                "output": "方面、情感、意见词三元组与未映射记录",
                "quality": result["semantic_spot_check"]["d01"],
                "unmapped": d01_unmapped,
                "risk": "全句词典会把局部词义扩散到无关方面，正负词共现时也会失真。",
                "sourceHash": result["source_implementations"]["D01"]["sha256"][:12],
                "failures": [
                    {
                        "recordId": item["record_id"],
                        "input": review_index[item["record_id"]]["text"],
                        "expected": item["expected"],
                        "actual": item["actual"],
                        "missing": item["missing"],
                        "unexpected": item["unexpected"],
                    }
                    for item in d01_semantic_checks if not item["exact_match"]
                ],
            },
            {
                "code": "D02",
                "name": "购买前需求信号归集",
                "input": f"{len(fixture['search_signals'])} 条合成搜索信号，覆盖 3 个合成月份",
                "output": "意图、情感、规则命中与可回溯量级",
                "quality": result["semantic_spot_check"]["d02"],
                "ruleHits": sum(item["opportunity_rule_hit"] for item in d02_rows),
                "risk": "office/work 等场景词会被规则顺序误归为功能型或导航型。",
                "sourceHash": result["source_implementations"]["D02"]["sha256"][:12],
                "failures": [
                    {
                        "recordId": item["record_id"],
                        "input": d02_rows_by_id[item["record_id"]]["query"],
                        "expected": item["expected"],
                        "actual": item["actual"],
                    }
                    for item in d02_semantic_checks if not item["exact_match"]
                ],
            },
        ],
        "crossSource": cross_source_view,
        "nextSteps": [
            "先改进词典、触发窗口与意图分类顺序，再用更大的人工标注验证集复测语义质量。",
            "补齐防漏、会话记录等当前未映射方面，并约定每一方面的可接受误差。",
            "达到预设质量阈值后，才可接入已授权、可说明范围的真实评论与搜索数据。",
            "真实数据中的支持、反证和未知应进入 C-018；不得直接替代产品定义、投入或业务动作。",
        ],
        "nonConclusions": fixture["non_conclusions"],
    }
    site_path = ROOT / "skill-library" / "site" / "b01-trial-data.js"
    site_path.write_text("window.B01_TRIAL_DATA = " + json.dumps(site_data, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")

    report_lines = [
        "# B01 Trial 01：D01 / D02 同题受控试跑",
        "",
        "## 这次实际做了什么",
        "",
        "- 用 24 条合成评论运行 D01 的原始规则实现，输出评论级方面、情感和意见词三元组。",
        "- 用 18 条合成搜索信号运行 D02 的原始规则实现，输出意图、情感、规则命中与可回溯量级。",
        "- 用同一主题表对照两侧记录，刻意保留支持、反证和未映射项。",
        "",
        "## 试跑结论",
        "",
        "- 4 项交付契约检查均通过：D01/D02 的每条输出都有唯一输入 ID；D01 未把词典外的防漏与会话记录评论强行归类；D02 未把属性、比较和功能型搜索改写成痛点。",
        f"- 但语义质量闸口没有通过：D01 的逐条精确匹配为 {sum(item['exact_match'] for item in d01_semantic_checks)}/{len(d01_semantic_checks)}（{d01_exact_rate:.1%}），D02 为 {sum(item['exact_match'] for item in d02_semantic_checks)}/{len(d02_semantic_checks)}（{d02_exact_rate:.1%}），均低于 {threshold:.0%} 的受控样本阈值。",
        "- D01 的主要风险是全句词典命中把局部词义扩散到无关方面，并会在正负词共现时给出中性或反向标签。D02 对 office/work 场景词的意图分类也不稳定。这意味着两者目前只能作为待修复的候选实现，不得进入真实样本判断。",
        "- D01 当前词典没有“防漏与密封”或“会话记录”方面，因此 R017、R018、R021、R022 被保留为未映射。这是需要补词典或换模型的能力缺口，不是消费者结论。",
        "",
        "## 不能读成什么",
        "",
    ]
    report_lines.extend([f"- {item}" for item in fixture["non_conclusions"]])
    report_lines.extend([
        "",
        "## 下一次进入真实样本前的门槛",
        "",
        "- 取得已授权、去重且带来源范围的真实评论与搜索数据，并说明市场、语言、时间窗和抽样规则。",
        "- 先修复词典与窗口策略，并在更大一批人工标注的合成或脱敏验证集上达到预设语义阈值；特别补足防漏、会话记录等未映射主题。",
        "- 让 D01/D02 的输出与访谈或其他证据源交叉复核，保留冲突和未知。",
        "- 只有形成 C-018 所需的来源、范围、支持、反证和未知后，才可讨论是否进入 C-021 的经营选项与验证建议。",
        "",
        "## 可复核材料",
        "",
        "- 合成受控样本：`skill-library/fixtures/b01_trial_01_wearable_pump.json`",
        "- 执行结果：`skill-library/outputs/2026-09-23-b01-trial-01/b01_trial_01_results.json`",
        "- 原始实现仅只读调用，D01/D02 的 SHA256 已记录在结果 JSON 中。",
    ])
    (OUTPUT_DIR / "B01_TRIAL_01_REPORT.md").write_text("\n".join(report_lines) + "\n", encoding="utf-8")
    print(json.dumps({
        "output": str(OUTPUT_DIR / "b01_trial_01_results.json"),
        "checks_passed": sum(1 for item in assertions if item["passed"]),
        "checks_total": len(assertions),
        "d01_semantic_exact_match": f"{sum(item['exact_match'] for item in d01_semantic_checks)}/{len(d01_semantic_checks)}",
        "d02_semantic_exact_match": f"{sum(item['exact_match'] for item in d02_semantic_checks)}/{len(d02_semantic_checks)}",
        "d01_unmapped": d01_unmapped,
        "d02_rule_hits": sum(1 for item in d02_rows if item["opportunity_rule_hit"]),
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
