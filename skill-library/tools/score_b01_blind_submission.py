#!/usr/bin/env python3
"""Score a B01 blind-test submission only after an independent gold lock exists."""

from __future__ import annotations

from hashlib import sha256
import json
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[2]
PACK_ROOT = ROOT / "skill-library" / "blind-tests" / "b01_blind_test_v1"
INPUT_PATH = PACK_ROOT / "inputs" / "b01_blind_test_inputs.json"
GOLD_PATH = PACK_ROOT / "gold" / "b01_blind_test_proposed_gold.json"
LOCK_PATH = PACK_ROOT / "gold" / "gold_label_lock.json"
OUTPUT_PATH = PACK_ROOT / "evaluation" / "b01_blind_evaluation_result.json"


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def digest(path: Path) -> str:
    return sha256(path.read_bytes()).hexdigest()


def fail(message: str) -> None:
    print(json.dumps({"scoring_state": "已拒绝评分", "reason": message}, ensure_ascii=False))
    raise SystemExit(2)


def canonical_tuples(value: list[list[str]] | list[tuple[str, str]]) -> list[tuple[str, str]]:
    return sorted((str(pair[0]), str(pair[1])) for pair in value)


def exact_rows(expected: dict[str, object], actual: dict[str, object], key: str) -> tuple[int, list[dict]]:
    checks = []
    for record_id, expected_item in expected.items():
        actual_item = actual.get(record_id)
        if actual_item is None:
            checks.append({"record_id": record_id, "match": False, "reason": "缺少输出"})
            continue
        if key == "tuples":
            expected_value = canonical_tuples(expected_item[key])
            actual_value = canonical_tuples(actual_item.get(key, []))
        else:
            expected_value = expected_item[key]
            actual_value = actual_item.get(key)
        checks.append({"record_id": record_id, "match": expected_value == actual_value, "expected": expected_value, "actual": actual_value})
    return sum(item["match"] for item in checks), checks


def main(submission_path: str) -> None:
    if not LOCK_PATH.exists():
        fail("尚无独立金标锁定文件。必须先由未参与本轮实现和标注的人复核并锁定金标。")
    lock = read_json(LOCK_PATH)
    gold_digest = digest(GOLD_PATH)
    if lock.get("lock_state") != "独立金标已锁定" or lock.get("gold_sha256") != gold_digest:
        fail("金标锁定记录无效、状态不正确或与当前金标指纹不一致。")
    if not lock.get("independent_reviewer_reference") or not lock.get("locked_at"):
        fail("金标锁定记录缺少独立复核责任或锁定时间。")

    submission = read_json(Path(submission_path))
    if submission.get("protocol_id") != "B01-BLIND-01" or submission.get("submission_state") != "独立执行已提交":
        fail("提交文件的协议或提交状态不正确。")
    if submission.get("input_sha256") != digest(INPUT_PATH):
        fail("提交文件对应的输入指纹与当前盲测输入包不一致。")
    if not submission.get("independent_evaluator_reference") or not submission.get("executed_at"):
        fail("提交文件缺少独立执行责任或执行时间。")
    if not all(submission.get("candidate_hashes", {}).get(code) for code in ("D01", "D02")):
        fail("提交文件缺少 D01/D02 候选代码指纹。")

    inputs = read_json(INPUT_PATH)
    gold = read_json(GOLD_PATH)
    expected_d01 = {item["record_id"]: item for item in gold["d01"]}
    expected_d02 = {item["record_id"]: item for item in gold["d02"]}
    actual_d01 = {item["record_id"]: item for item in submission.get("d01_outputs", [])}
    actual_d02 = {item["record_id"]: item for item in submission.get("d02_outputs", [])}
    input_d01 = {item["record_id"] for item in inputs["reviews"]}
    input_d02 = {item["record_id"] for item in inputs["search_signals"]}
    if set(expected_d01) != input_d01 or set(expected_d02) != input_d02:
        fail("输入包与金标的记录集合不一致。")
    if set(actual_d01) != input_d01 or set(actual_d02) != input_d02:
        fail("候选提交没有逐条覆盖全部盲测输入，或包含未知记录。")

    d01_count, d01_checks = exact_rows(expected_d01, actual_d01, "tuples")
    d02_semantic_checks = []
    d02_rule_checks = []
    for record_id, expected in expected_d02.items():
        actual = actual_d02[record_id]
        semantic_match = expected["expected_intent"] == actual.get("intent") and expected["expected_sentiment"] == actual.get("sentiment")
        rule_match = expected["expected_rule_hit"] == actual.get("opportunity_rule_hit")
        d02_semantic_checks.append({"record_id": record_id, "match": semantic_match})
        d02_rule_checks.append({"record_id": record_id, "match": rule_match})
    d02_semantic_count = sum(item["match"] for item in d02_semantic_checks)
    d02_rule_count = sum(item["match"] for item in d02_rule_checks)
    d01_rate = d01_count / len(d01_checks)
    d02_rate = d02_semantic_count / len(d02_semantic_checks)
    d02_rule_rate = d02_rule_count / len(d02_rule_checks)
    thresholds = gold["thresholds"]
    passed = d01_rate >= thresholds["d01_exact_match"] and d02_rate >= thresholds["d02_semantic_exact_match"] and d02_rule_rate >= thresholds["d02_rule_boundary"]
    result = {
        "protocol_id": "B01-BLIND-01",
        "scoring_state": "已评分，待结果复核",
        "input_sha256": digest(INPUT_PATH),
        "gold_sha256": gold_digest,
        "gold_lock": {"independent_reviewer_reference": lock["independent_reviewer_reference"], "locked_at": lock["locked_at"]},
        "submission": {"independent_evaluator_reference": submission["independent_evaluator_reference"], "executed_at": submission["executed_at"], "candidate_hashes": submission["candidate_hashes"]},
        "d01": {"matched": d01_count, "total": len(d01_checks), "rate": d01_rate, "checks": d01_checks},
        "d02": {"semantic_matched": d02_semantic_count, "semantic_total": len(d02_semantic_checks), "semantic_rate": d02_rate, "rule_matched": d02_rule_count, "rule_total": len(d02_rule_checks), "rule_rate": d02_rule_rate, "semantic_checks": d02_semantic_checks, "rule_checks": d02_rule_checks},
        "thresholds": thresholds,
        "decision": "独立盲测通过，可设计真实样本数据合同（仍不可接入真实数据）" if passed else "独立盲测未通过，留在候选修复",
        "non_conclusion": "无论评分结果如何，评分脚本不形成消费者洞察、产品定义、投入、发布、岗位或权限结论。",
    }
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(OUTPUT_PATH), "decision": result["decision"]}, ensure_ascii=False))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: score_b01_blind_submission.py /absolute/path/to/submission.json")
    main(sys.argv[1])
