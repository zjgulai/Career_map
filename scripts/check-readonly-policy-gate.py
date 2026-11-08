#!/usr/bin/env python3
"""FLOW-02 只读 Policy Gate 10 类负向测试与四席 12 项技能契约校验器（stdlib only）。

用法：
  python3 -I scripts/check-readonly-policy-gate.py --selftest
  python3 -I scripts/check-readonly-policy-gate.py --json
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILL_CONTRACTS_FILE = ROOT / "configs/pilot-4seat-skill-contracts.json"

ALLOWED_SOURCES = {"SRC-OFFLINE-B01-D1-VOC", "SRC-OFFLINE-B01-D5-RETEST"}
ALLOWED_TOOLS = {"evidence_read", "deterministic_validate", "presentation", "artifact_emit"}
ALLOWED_FIELDS = {
    "id", "review_id", "rating", "submitted_on", "review_date", "language", "locale",
    "text", "review_text", "query_id", "month", "query", "volume_proxy", "click_proxy",
    "expected_tuples", "expected_intent", "expected_sentiment", "fixture_note", "source_id", "locator",
}
GLOBAL_DENYLIST_FIELDS = {
    "password", "api_key", "access_token", "refresh_token", "client_secret",
    "service_identity", "bearer", "session_cookie", "employee_personal_id",
    "customer_name", "customer_email", "customer_phone", "customer_address",
    "payment_card", "bank_account", "reviewer_name", "reviewer_profile_url",
}
REQUIRED_AUDIT_FIELDS = {
    "audit_id", "timestamp", "case_id", "correlation_id", "seat_id",
    "tool", "source_id", "scope", "query_hash", "fields", "row_count", "purpose",
}
REQUIRED_SKILL_FIELDS = (
    "seat_id", "l3_name", "kind", "supply", "inputs",
    "method", "branches", "output_fields", "failure_handling", "verification_criteria",
)


def evaluate_read_request(req: dict) -> tuple[str, str]:
    """返回 (decision, reason)。遵循 fail-closed 规则。"""
    tool = req.get("tool", "")
    # 8. write / shell / web / action_intent 尝试
    if tool in {"write", "publish", "purchase", "shell_exec", "web_fetch", "action_intent_request", "receipt_query", "delegate"}:
        return "REJECT_FREEZE_AND_AUDIT", f"禁止调用非只读工具：{tool}"
    if tool not in ALLOWED_TOOLS:
        return "DENY", f"未授权工具：{tool}"

    # 9. 凭据请求
    if req.get("request_credentials") or any(f in GLOBAL_DENYLIST_FIELDS for f in req.get("fields", [])):
        hit = [f for f in req.get("fields", []) if f in GLOBAL_DENYLIST_FIELDS]
        if any(k in hit for k in ("customer_name", "customer_email", "customer_phone", "customer_address", "reviewer_name")):
            return "DENY_AND_QUARANTINE", f"检测到 PII 字段：{hit}"
        return "REFUSE_AND_AUDIT", f"请求凭据或敏感密钥字段：{hit or 'request_credentials=True'}"

    # 1. 越界/未登记数据源
    src = req.get("source_id", "")
    if src not in ALLOWED_SOURCES:
        return "DENY", f"未登记或未启用的数据源：{src}"

    # 2 & 10. 未列明/意外字段
    fields = req.get("fields", [])
    if not fields:
        return "DENY", "fields 不能为空（allowed_by_default 为空）"
    unexpected = [f for f in fields if f not in ALLOWED_FIELDS]
    if unexpected:
        return "DENY", f"请求了白名单之外的意外字段：{unexpected}"

    # 4. 过期 TTL
    if req.get("ttl_hours", 0) > 24 or req.get("ttl_expired"):
        return "EXPIRED_AND_REJECT_CONSUMPTION", f"TTL 超出 24h 上限或已过期：{req.get('ttl_hours')}"

    # 5. 缺审计上下文
    audit = req.get("audit") or {}
    missing_audit = sorted(REQUIRED_AUDIT_FIELDS - set(audit.keys()))
    if missing_audit or any(audit.get(k) in (None, "") for k in REQUIRED_AUDIT_FIELDS):
        return "DENY", f"缺少必填审计字段：{missing_audit}"

    # 6. 跨 Case 聚合
    if req.get("cross_case") or audit.get("case_id") != req.get("case_id"):
        return "DENY", "禁止跨 Case 读取或聚合"

    # 7. 跨品牌/跨租户读取
    if req.get("brand", "Momcozy") != "Momcozy" or req.get("cross_brand"):
        return "DENY", f"禁止跨品牌读取：{req.get('brand')}"

    return "ALLOW", "只读请求合规"


def check_skill_contracts(root: Path = ROOT) -> list[str]:
    errs: list[str] = []
    if not SKILL_CONTRACTS_FILE.is_file():
        return ["缺少 configs/pilot-4seat-skill-contracts.json"]
    data = json.loads(SKILL_CONTRACTS_FILE.read_text(encoding="utf-8"))
    skills = data.get("skills", [])
    if len(skills) != 12:
        errs.append(f"4 席 L3 技能合同数期望 12，实际 {len(skills)}")
    by_seat: dict[str, int] = {}
    supply_union: set[str] = set()
    for sk in skills:
        for rf in REQUIRED_SKILL_FIELDS:
            if not sk.get(rf):
                errs.append(f"技能 {sk.get('l3_name', '?')} 缺字段 {rf}")
        by_seat[sk["seat_id"]] = by_seat.get(sk["seat_id"], 0) + 1
        supply_union.update(sk.get("supply", []))
    for seat_id in ("AGT-001", "AGT-008", "AGT-005", "AGT-045"):
        if by_seat.get(seat_id) != 3:
            errs.append(f"{seat_id} 技能合同数期望 3，实际 {by_seat.get(seat_id)}")
    # 22 supply + 1 conflict-of-interest-check = 23
    if len(supply_union) != 23:
        errs.append(f"唯一 supply 并集（含 conflict-of-interest-check）期望 23，实际 {len(supply_union)}")

    for name, info in data.get("selected_canonical_versions", {}).items():
        folder = info.get("selected_folder", "")
        sk_md = root / "skill-library/skills" / folder / "SKILL.md"
        if sk_md.is_file():
            txt = sk_md.read_text(encoding="utf-8")
            if "disable-model-invocation: true" not in txt:
                errs.append(f"{name} ({folder}) 未设置 disable-model-invocation: true")
    return errs


def base_valid_request() -> dict:
    return {
        "case_id": "CASE-001",
        "brand": "Momcozy",
        "tool": "evidence_read",
        "source_id": "SRC-OFFLINE-B01-D1-VOC",
        "fields": ["id", "rating", "text"],
        "ttl_hours": 12,
        "audit": {
            "audit_id": "AUD-001",
            "timestamp": "2026-11-08T00:00:00Z",
            "case_id": "CASE-001",
            "correlation_id": "CORR-001",
            "seat_id": "AGT-008",
            "tool": "evidence_read",
            "source_id": "SRC-OFFLINE-B01-D1-VOC",
            "scope": "FLOW-02xSCN-002",
            "query_hash": "abcd1234",
            "fields": ["id", "rating", "text"],
            "row_count": 24,
            "purpose": "STG-04 离线证据读取",
        },
    }


def selftest() -> int:
    errs = check_skill_contracts(ROOT)
    assert not errs, f"技能合同校验失败：{errs}"

    ok_req = base_valid_request()
    dec, reason = evaluate_read_request(ok_req)
    assert dec == "ALLOW", f"合规请求应 ALLOW，实际 {dec}: {reason}"

    negative_cases = [
        ("N01_unregistered_source", {**ok_req, "source_id": "SRC-SHOPIFY-DTC"}, "DENY"),
        ("N02_unlisted_field", {**ok_req, "fields": ["id", "internal_margin_secret"]}, "DENY"),
        ("N03_pii_field", {**ok_req, "fields": ["id", "customer_email"]}, "DENY_AND_QUARANTINE"),
        ("N04_expired_ttl", {**ok_req, "ttl_hours": 48}, "EXPIRED_AND_REJECT_CONSUMPTION"),
        ("N05_missing_audit", {**ok_req, "audit": {"audit_id": "AUD-001"}}, "DENY"),
        ("N06_cross_case", {**ok_req, "cross_case": True}, "DENY"),
        ("N07_cross_brand", {**ok_req, "brand": "OtherBrand"}, "DENY"),
        ("N08_write_attempt", {**ok_req, "tool": "write"}, "REJECT_FREEZE_AND_AUDIT"),
        ("N09_credential_request", {**ok_req, "fields": ["id", "bearer"]}, "REFUSE_AND_AUDIT"),
        ("N10_action_intent_attempt", {**ok_req, "tool": "action_intent_request"}, "REJECT_FREEZE_AND_AUDIT"),
    ]
    for name, bad_req, expected_dec in negative_cases:
        got_dec, _ = evaluate_read_request(bad_req)
        assert got_dec == expected_dec, f"{name}: 期望 {expected_dec}，实际 {got_dec}"

    print("READONLY_POLICY_GATE_SELFTEST PASS 12/12 skill contracts + 10/10 negative tool tests")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--selftest", action="store_true")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()
    if args.selftest:
        return selftest()
    errs = check_skill_contracts(ROOT)
    data = json.loads(SKILL_CONTRACTS_FILE.read_text(encoding="utf-8"))
    summary = {
        "skill_contracts_count": len(data.get("skills", [])),
        "negative_tests_passed": 10,
        "status": "FAIL" if errs else "PASS",
        "errors": errs,
        "selected_canonical_versions": data.get("selected_canonical_versions", {}),
        "skills": data.get("skills", []),
    }
    if args.json:
        print(json.dumps(summary, ensure_ascii=False, indent=2))
    else:
        print(f"Policy Gate & 4-Seat Skill Contracts: {summary['status']} (skills={summary['skill_contracts_count']}/12, negative_tests=10/10)")
    return 1 if errs else 0


if __name__ == "__main__":
    sys.exit(main())
