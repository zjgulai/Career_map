#!/usr/bin/env python3
"""优化草案 §9 剩余四项缺失机制（Falsification Gate / Conflict Record / Program-Incident 承接 / 预算与并发上限）可判定门禁与自测。

stdlib only:
  python3 -I scripts/check-governance-mechanisms.py
  python3 -I scripts/check-governance-mechanisms.py --selftest
  python3 -I scripts/check-governance-mechanisms.py --json
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONFIG_PATH = ROOT / "configs/pilot-governance-mechanisms.json"

KNOWN_SEATS = {f"AGT-{i:03d}" for i in range(1, 51)} | {"MGT-001", "MGT-002", "MGT-003"}


def evaluate_falsification_gate(payload: dict) -> tuple[str, str]:
    for req in ("thesis_id", "headline_claim_id", "headline_support_status", "headline_evidence_class",
                "alternative_explanations", "disconfirming_test", "falsification_threshold"):
        if req not in payload or payload[req] in (None, ""):
            return "RETURN_MISSING_FALSIFIER", f"missing_field:{req}"
    if payload.get("headline_evidence_class") == "C" or payload.get("creative_counted_as_evidence"):
        return "RETURN_CREATIVE_COUNTED_AS_EVIDENCE", "creative_asset_cannot_count_as_evidence"
    if payload.get("headline_support_status") != "SUPPORTED" or payload.get("headline_evidence_class") != "E":
        return "RETURN_UNSUPPORTED_HEADLINE", "headline_must_be_SUPPORTED_E_claim"
    alts = payload.get("alternative_explanations")
    if not isinstance(alts, list) or len(alts) < 1 or not all(isinstance(x, str) and x.strip() for x in alts):
        return "RETURN_MISSING_FALSIFIER", "requires_at_least_one_alternative_explanation"
    dt = payload.get("disconfirming_test")
    if not isinstance(dt, dict) or not dt.get("method") or not dt.get("Independent_reviewer_seat"):
        return "RETURN_MISSING_FALSIFIER", "disconfirming_test_incomplete"
    if dt.get("disconfirmed") is True:
        return "RETURN_THESIS_DISCONFIRMED", "disconfirming_test_triggered_return"
    return "PASS_FALSIFICATION_GATE", "ok"


def evaluate_conflict_record(payload: dict) -> tuple[str, str]:
    for req in ("conflict_id", "case_id", "conflict_type", "party_a_seat", "party_a_claim_refs",
                "party_b_seat", "party_b_claim_refs", "routing_target"):
        if req not in payload or payload[req] in (None, "", []):
            return "REJECT_INVALID_CONFLICT_RECORD", f"missing_field:{req}"
    if payload.get("lead_unilateral_override") is True:
        return "REJECT_UNILATERAL_OVERRIDE", "lead_cannot_unilaterally_override_specialist_dissent"
    if payload.get("silent_averaging") is True:
        return "REJECT_SILENT_AVERAGING", "conflicting_metrics_or_options_cannot_be_averaged"
    if payload.get("party_a_seat") == payload.get("party_b_seat"):
        return "REJECT_INVALID_CONFLICT_RECORD", "conflict_parties_must_be_distinct"
    if payload.get("self_referential_l2b") is True and payload.get("routing_target") != "HUMAN_OWNER_L2B":
        return "REJECT_L2B_MISROUTED", "self_referential_governance_dispute_must_route_to_HUMAN_OWNER_L2B"
    if payload.get("routing_target") not in ("HUMAN_OWNER_L2B", "MGT_RULE_ARBITRATION", "RETURN_FOR_RECONCILIATION"):
        return "REJECT_INVALID_CONFLICT_RECORD", "invalid_routing_target"
    return "ACCEPT_CONFLICT_RECORD", f"routed:{payload['routing_target']}"


def evaluate_program_incident_handoff(payload: dict) -> tuple[str, str]:
    for req in ("handoff_id", "source_case_id", "carrier_kind", "assigned_existing_seats",
                "human_owner_ref", "verification_conditions", "review_window"):
        if req not in payload or payload[req] in (None, "", []):
            return "REJECT_INCOMPLETE_HANDOFF", f"missing_field:{req}"
    if payload.get("new_role_created") is True:
        return "REJECT_NEW_ROLE_CREATION", "prohibited_from_creating_21st_role_or_new_seat"
    seats = payload.get("assigned_existing_seats", [])
    if not isinstance(seats, list) or not seats or any(s not in KNOWN_SEATS or s.startswith("MGT-") for s in seats):
        return "REJECT_INVALID_ASSIGNED_SEAT", "must_assign_existing_AGT_seats_only"
    if payload.get("prior_responsibility_released_without_signoff") is True:
        return "REJECT_PREMATURE_RELEASE", "prior_responsibility_remains_until_handoff_conditions_met"
    if payload.get("auto_scope_expansion") is True:
        return "REJECT_AUTO_SCOPE_EXPANSION", "handoff_does_not_grant_scope_expansion"
    if payload.get("carrier_kind") not in ("PROGRAM_CONTINUATION", "INCIDENT_RESPONSE"):
        return "REJECT_INCOMPLETE_HANDOFF", "unknown_carrier_kind"
    return "ACCEPT_HANDOFF_CONTRACT", f"carrier:{payload['carrier_kind']}"


def evaluate_budget_concurrency_cap(payload: dict, limits: dict | None = None) -> tuple[str, str]:
    lim = limits or {"max_concurrent_sessions": 2, "max_case_tokens": 120000, "max_tool_calls": 60, "max_write_calls": 0}
    for req in ("case_id", "active_sessions", "compose_from_shared_context", "tokens_used",
                "tool_calls_used", "write_calls_attempted", "silent_truncation"):
        if req not in payload:
            return "HOLD_MISSING_BUDGET_TELEMETRY", f"missing_field:{req}"
    if payload.get("silent_truncation") is True:
        return "REJECT_SILENT_TRUNCATION", "silent_truncation_prohibited_must_hold_explicitly"
    if payload.get("compose_from_shared_context") is True:
        return "HOLD_ISOLATION_VIOLATION", "worker_or_assurance_cannot_share_lead_context_via_composeFrom"
    if int(payload["write_calls_attempted"]) > int(lim["max_write_calls"]):
        return "HOLD_WRITE_ATTEMPT_BLOCKED", "readonly_pilot_forbids_write_calls"
    if int(payload["active_sessions"]) > int(lim["max_concurrent_sessions"]):
        return "HOLD_CONCURRENCY_CAP_EXCEEDED", f"active_sessions>{lim['max_concurrent_sessions']}"
    if int(payload["tokens_used"]) > int(lim["max_case_tokens"]):
        return "HOLD_TOKEN_BUDGET_EXCEEDED", f"tokens_used>{lim['max_case_tokens']}"
    if int(payload["tool_calls_used"]) > int(lim["max_tool_calls"]):
        return "HOLD_TOOL_BUDGET_EXCEEDED", f"tool_calls_used>{lim['max_tool_calls']}"
    return "ALLOW_WITHIN_BUDGET", "ok"


def run_selftest() -> tuple[bool, list[dict]]:
    cfg = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    mechs = cfg.get("mechanisms", [])
    if len(mechs) != 4:
        raise AssertionError(f"Expected 4 mechanisms, got {len(mechs)}")

    cases = [
        # 1. Falsification Gate (1 pos + 3 neg)
        ("FG-POS-01", evaluate_falsification_gate({
            "thesis_id": "TH-001", "headline_claim_id": "CLM-E-01",
            "headline_support_status": "SUPPORTED", "headline_evidence_class": "E",
            "alternative_explanations": ["季节性促销退潮导致转化回落，而非人群痛点消失"],
            "disconfirming_test": {"method": "对比非促销周同品类复测样本", "Independent_reviewer_seat": "AGT-005", "disconfirmed": False},
            "falsification_threshold": "非促销周差评率 < 8% 则推翻原痛点主张"
        }), "PASS_FALSIFICATION_GATE"),
        ("FG-NEG-01-NO-ALT", evaluate_falsification_gate({
            "thesis_id": "TH-001", "headline_claim_id": "CLM-E-01",
            "headline_support_status": "SUPPORTED", "headline_evidence_class": "E",
            "alternative_explanations": [],
            "disconfirming_test": {"method": "复测", "Independent_reviewer_seat": "AGT-005"},
            "falsification_threshold": "8%"
        }), "RETURN_MISSING_FALSIFIER"),
        ("FG-NEG-02-UNSUPPORTED-HEADLINE", evaluate_falsification_gate({
            "thesis_id": "TH-001", "headline_claim_id": "CLM-J-02",
            "headline_support_status": "PARTIAL", "headline_evidence_class": "J",
            "alternative_explanations": ["替代解释 A"],
            "disconfirming_test": {"method": "复测", "Independent_reviewer_seat": "AGT-005"},
            "falsification_threshold": "8%"
        }), "RETURN_UNSUPPORTED_HEADLINE"),
        ("FG-NEG-03-CREATIVE-AS-EVIDENCE", evaluate_falsification_gate({
            "thesis_id": "TH-001", "headline_claim_id": "CLM-C-01",
            "headline_support_status": "SUPPORTED", "headline_evidence_class": "C",
            "alternative_explanations": ["替代解释 A"],
            "disconfirming_test": {"method": "复测", "Independent_reviewer_seat": "AGT-005"},
            "falsification_threshold": "8%"
        }), "RETURN_CREATIVE_COUNTED_AS_EVIDENCE"),

        # 2. Conflict Record (1 pos + 3 neg)
        ("CR-POS-01", evaluate_conflict_record({
            "conflict_id": "CNF-001", "case_id": "CASE-FLOW02-SCN002-DRYRUN-001",
            "conflict_type": "RECOMMENDATION_DISSENT",
            "party_a_seat": "AGT-008", "party_a_claim_refs": ["CLM-J-01"],
            "party_b_seat": "AGT-005", "party_b_claim_refs": ["CLM-E-04"],
            "lead_unilateral_override": False, "silent_averaging": False,
            "self_referential_l2b": False, "routing_target": "RETURN_FOR_RECONCILIATION"
        }), "ACCEPT_CONFLICT_RECORD"),
        ("CR-NEG-01-UNILATERAL", evaluate_conflict_record({
            "conflict_id": "CNF-002", "case_id": "CASE-01", "conflict_type": "RECOMMENDATION_DISSENT",
            "party_a_seat": "AGT-008", "party_a_claim_refs": ["CLM-1"],
            "party_b_seat": "AGT-005", "party_b_claim_refs": ["CLM-2"],
            "lead_unilateral_override": True, "silent_averaging": False,
            "self_referential_l2b": False, "routing_target": "RETURN_FOR_RECONCILIATION"
        }), "REJECT_UNILATERAL_OVERRIDE"),
        ("CR-NEG-02-AVERAGING", evaluate_conflict_record({
            "conflict_id": "CNF-003", "case_id": "CASE-01", "conflict_type": "METRIC_FORMULA_MISMATCH",
            "party_a_seat": "AGT-008", "party_a_claim_refs": ["CLM-1"],
            "party_b_seat": "AGT-045", "party_b_claim_refs": ["CLM-2"],
            "lead_unilateral_override": False, "silent_averaging": True,
            "self_referential_l2b": False, "routing_target": "RETURN_FOR_RECONCILIATION"
        }), "REJECT_SILENT_AVERAGING"),
        ("CR-NEG-03-L2B-MISROUTED", evaluate_conflict_record({
            "conflict_id": "CNF-004", "case_id": "CASE-01", "conflict_type": "GOVERNANCE_METRIC_RULER",
            "party_a_seat": "AGT-005", "party_a_claim_refs": ["CLM-1"],
            "party_b_seat": "MGT-003", "party_b_claim_refs": ["CLM-2"],
            "lead_unilateral_override": False, "silent_averaging": False,
            "self_referential_l2b": True, "routing_target": "MGT_RULE_ARBITRATION"
        }), "REJECT_L2B_MISROUTED"),

        # 3. Program / Incident Handoff (1 pos + 3 neg)
        ("PI-POS-01", evaluate_program_incident_handoff({
            "handoff_id": "HND-001", "source_case_id": "CASE-FLOW02-SCN002-DRYRUN-001",
            "carrier_kind": "PROGRAM_CONTINUATION",
            "assigned_existing_seats": ["AGT-001", "AGT-008"],
            "new_role_created": False, "human_owner_ref": "layer_0.slot_portfolio_owner",
            "verification_conditions": ["补齐 D1 非促销周样本 ≥ 100 条", "AGT-045 复核六源口径一致"],
            "review_window": "P14D",
            "prior_responsibility_released_without_signoff": False,
            "auto_scope_expansion": False
        }), "ACCEPT_HANDOFF_CONTRACT"),
        ("PI-NEG-01-NEW-ROLE", evaluate_program_incident_handoff({
            "handoff_id": "HND-002", "source_case_id": "CASE-01", "carrier_kind": "PROGRAM_CONTINUATION",
            "assigned_existing_seats": ["AGT-001"], "new_role_created": True,
            "human_owner_ref": "layer_0.slot_portfolio_owner",
            "verification_conditions": ["条件 1"], "review_window": "P14D",
            "prior_responsibility_released_without_signoff": False, "auto_scope_expansion": False
        }), "REJECT_NEW_ROLE_CREATION"),
        ("PI-NEG-02-PREMATURE-RELEASE", evaluate_program_incident_handoff({
            "handoff_id": "HND-003", "source_case_id": "CASE-01", "carrier_kind": "INCIDENT_RESPONSE",
            "assigned_existing_seats": ["AGT-018", "AGT-005"], "new_role_created": False,
            "human_owner_ref": "layer_0.slot_risk_oncall",
            "verification_conditions": ["隔离核验"], "review_window": "P7D",
            "prior_responsibility_released_without_signoff": True, "auto_scope_expansion": False
        }), "REJECT_PREMATURE_RELEASE"),
        ("PI-NEG-03-MGT-AS-WORKER", evaluate_program_incident_handoff({
            "handoff_id": "HND-004", "source_case_id": "CASE-01", "carrier_kind": "INCIDENT_RESPONSE",
            "assigned_existing_seats": ["MGT-003"], "new_role_created": False,
            "human_owner_ref": "layer_0.slot_risk_oncall",
            "verification_conditions": ["隔离核验"], "review_window": "P7D",
            "prior_responsibility_released_without_signoff": False, "auto_scope_expansion": False
        }), "REJECT_INVALID_ASSIGNED_SEAT"),

        # 4. Budget & Concurrency Cap (1 pos + 3 neg)
        ("BC-POS-01", evaluate_budget_concurrency_cap({
            "case_id": "CASE-FLOW02-SCN002-DRYRUN-001", "active_sessions": 2,
            "compose_from_shared_context": False, "tokens_used": 48200,
            "tool_calls_used": 18, "write_calls_attempted": 0, "silent_truncation": False
        }), "ALLOW_WITHIN_BUDGET"),
        ("BC-NEG-01-CONCURRENCY", evaluate_budget_concurrency_cap({
            "case_id": "CASE-01", "active_sessions": 3,
            "compose_from_shared_context": False, "tokens_used": 48200,
            "tool_calls_used": 18, "write_calls_attempted": 0, "silent_truncation": False
        }), "HOLD_CONCURRENCY_CAP_EXCEEDED"),
        ("BC-NEG-02-COMPOSE-FROM", evaluate_budget_concurrency_cap({
            "case_id": "CASE-01", "active_sessions": 2,
            "compose_from_shared_context": True, "tokens_used": 48200,
            "tool_calls_used": 18, "write_calls_attempted": 0, "silent_truncation": False
        }), "HOLD_ISOLATION_VIOLATION"),
        ("BC-NEG-03-SILENT-TRUNCATION", evaluate_budget_concurrency_cap({
            "case_id": "CASE-01", "active_sessions": 2,
            "compose_from_shared_context": False, "tokens_used": 135000,
            "tool_calls_used": 18, "write_calls_attempted": 0, "silent_truncation": True
        }), "REJECT_SILENT_TRUNCATION"),
    ]

    results = []
    all_ok = True
    for cid, (got, reason), want in cases:
        ok = got == want
        if not ok:
            all_ok = False
        results.append({"case_id": cid, "expected": want, "got": got, "reason": reason, "ok": ok})
    return all_ok, results


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--selftest", action="store_true")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    cfg = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    ok, results = run_selftest()
    summary = {
        "status": "PASS" if ok else "FAIL",
        "mechanisms_count": len(cfg.get("mechanisms", [])),
        "cases_total": len(results),
        "cases_passed": sum(1 for r in results if r["ok"]),
        "mechanisms": [
            {"id": m["id"], "name": m["name"], "trigger_stage": m["trigger_stage"], "owner_seat": m["owner_seat"]}
            for m in cfg.get("mechanisms", [])
        ],
        "cases": results,
    }
    if args.json:
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        return 0 if ok else 1
    print(f"GOVERNANCE_MECHANISMS_SELFTEST {summary['status']} "
          f"{summary['mechanisms_count']}/4 mechanisms + {summary['cases_passed']}/{summary['cases_total']} cases")
    if not ok:
        for r in results:
            if not r["ok"]:
                print(f"  FAIL {r['case_id']}: expected {r['expected']}, got {r['got']} ({r['reason']})", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
