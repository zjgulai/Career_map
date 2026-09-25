#!/usr/bin/env python3
"""Create a B01 blind-test submission only after the independent gold is locked.

This runner never reads the proposed gold labels and never scores a candidate.
It only produces a complete, fingerprinted output submission for the independent
evaluator to hand to the separate result reviewer.
"""

from __future__ import annotations

import argparse
from dataclasses import asdict
from hashlib import sha256
from importlib.util import module_from_spec, spec_from_file_location
import json
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[2]
PACK_ROOT = ROOT / "skill-library" / "blind-tests" / "b01_blind_test_v1"
INPUT_PATH = PACK_ROOT / "inputs" / "b01_blind_test_inputs.json"
LOCK_PATH = PACK_ROOT / "gold" / "gold_label_lock.json"
D01_CANDIDATE = ROOT / "skill-library" / "candidates" / "b01_trial_02" / "controlled_d01_adapter.py"
D02_CANDIDATE = ROOT / "skill-library" / "candidates" / "b01_trial_02" / "controlled_d02_adapter.py"


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def digest(path: Path) -> str:
    return sha256(path.read_bytes()).hexdigest()


def fail(message: str) -> None:
    print(json.dumps({"execution_state": "已拒绝执行", "reason": message}, ensure_ascii=False))
    raise SystemExit(2)


def load_module(name: str, source_path: Path):
    spec = spec_from_file_location(name, source_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load candidate adapter: {source_path}")
    module = module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def lock_state() -> dict:
    if not LOCK_PATH.exists():
        return {"state": "尚未锁定", "reason": "缺少 gold_label_lock.json"}
    lock = read_json(LOCK_PATH)
    required = ("lock_state", "gold_sha256", "independent_reviewer_reference", "locked_at")
    missing = [field for field in required if not lock.get(field)]
    if missing or lock.get("lock_state") != "独立金标已锁定":
        return {"state": "锁定记录无效", "reason": f"缺少或无效字段：{', '.join(missing) or 'lock_state'}"}
    return {"state": "已锁定", "reviewer": lock["independent_reviewer_reference"], "locked_at": lock["locked_at"]}


def inspect_only() -> None:
    inputs = read_json(INPUT_PATH)
    print(json.dumps({
        "execution_state": "执行前检查完成，未运行候选",
        "protocol_id": inputs.get("protocol_id"),
        "input_sha256": digest(INPUT_PATH),
        "d01_input_count": len(inputs.get("reviews", [])),
        "d02_input_count": len(inputs.get("search_signals", [])),
        "gold_lock": lock_state(),
        "candidate_hashes": {"D01": digest(D01_CANDIDATE), "D02": digest(D02_CANDIDATE)},
    }, ensure_ascii=False))


def run_candidate(evaluator_reference: str, executed_at: str, output_path: Path) -> None:
    state = lock_state()
    if state["state"] != "已锁定":
        fail("独立金标尚未有效锁定。执行前请先完成独立标注复核并写入 gold_label_lock.json。")
    inputs = read_json(INPUT_PATH)
    if inputs.get("protocol_id") != "B01-BLIND-01":
        fail("输入包协议不正确。")
    if not evaluator_reference.strip() or not executed_at.strip():
        fail("独立执行责任标识和执行时间均为必填项。")
    if output_path.resolve() == (PACK_ROOT / "submission" / "submission_template.json").resolve():
        fail("不得覆盖 submission_template.json；请指定新的提交文件路径。")

    d01 = load_module("b01_blind_d01", D01_CANDIDATE)
    d02 = load_module("b01_blind_d02", D02_CANDIDATE)
    d01_results = d01.ControlledLocalABSA().batch_extract(inputs["reviews"])
    d01_outputs = [
        {
            "record_id": result.review_id,
            "tuples": [[item["aspect"], item["sentiment"]] for item in (asdict(tuple_item) for tuple_item in result.tuples)],
        }
        for result in d01_results
    ]
    query_inputs = [(item["query"], item["volume_proxy"], item["click_proxy"]) for item in inputs["search_signals"]]
    opportunity_rows = d02.product_dev_opportunities(query_inputs, min_vol=4000)
    opportunity_keys = {(item["query"], item["monthly_search_vol"], item["opportunity_score"]) for item in opportunity_rows}
    d02_outputs = []
    for item in inputs["search_signals"]:
        score = round(item["volume_proxy"] * (1 - item["click_proxy"]), 2)
        key = (item["query"], item["volume_proxy"], score)
        d02_outputs.append({
            "record_id": item["record_id"],
            "intent": d02.classify_intent(item["query"]),
            "sentiment": d02.simple_sentiment_score(item["query"]),
            "opportunity_rule_hit": key in opportunity_keys,
        })
    submission = {
        "protocol_id": "B01-BLIND-01",
        "submission_state": "独立执行已提交",
        "independent_evaluator_reference": evaluator_reference.strip(),
        "executed_at": executed_at.strip(),
        "input_sha256": digest(INPUT_PATH),
        "candidate_hashes": {"D01": digest(D01_CANDIDATE), "D02": digest(D02_CANDIDATE)},
        "d01_outputs": d01_outputs,
        "d02_outputs": d02_outputs,
        "execution_boundary": "本文件只记录候选输出与版本指纹；不含金标、不含分数、不是业务结论。",
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(submission, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "execution_state": "候选输出已提交，待独立结果复核",
        "output": str(output_path),
        "d01_output_count": len(d01_outputs),
        "d02_output_count": len(d02_outputs),
        "input_sha256": submission["input_sha256"],
    }, ensure_ascii=False))


def main() -> None:
    parser = argparse.ArgumentParser(description="Run a locked B01 blind-test candidate without reading gold labels.")
    parser.add_argument("--check-only", action="store_true", help="Validate the package and candidate fingerprints without running either candidate.")
    parser.add_argument("--independent-evaluator-reference", default="", help="Independent evaluator reference recorded in the submission.")
    parser.add_argument("--executed-at", default="", help="Execution timestamp recorded in the submission.")
    parser.add_argument("--output", default="", help="New JSON path for the candidate submission.")
    args = parser.parse_args()
    if args.check_only:
        inspect_only()
        return
    if not args.output:
        fail("必须指定新的 --output 提交文件路径。")
    run_candidate(args.independent_evaluator_reference, args.executed_at, Path(args.output))


if __name__ == "__main__":
    main()
