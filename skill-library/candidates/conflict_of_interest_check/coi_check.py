#!/usr/bin/env python3
"""独立复核利益冲突检查（AGT-005 / IC-01 / STG-06 前置门禁）。

stdlib only。执行确定性冲突检查并内置自检断言：
  python3 -I skill-library/candidates/conflict_of_interest_check/coi_check.py --selftest
"""

from __future__ import annotations

import sys
from dataclasses import asdict, dataclass, field


@dataclass(frozen=True)
class ConflictItem:
    kind: str
    severity: str  # HIGH | MEDIUM | LOW
    evidence: str


@dataclass(frozen=True)
class IndependenceDeclaration:
    declaration_id: str
    proposer: str
    reviewer: str
    conflicts: list[ConflictItem] = field(default_factory=list)
    mitigation: list[str] = field(default_factory=list)
    disposition: str = "ALLOW"  # ALLOW | REQUIRE_MITIGATION | REFUSE
    can_issue_assurance_review: bool = True


def evaluate_coi(
    declaration_id: str,
    proposer: str,
    reviewer: str,
    contributors: list[str] | None = None,
    reporting_to_proposer: bool = False,
    financial_ties: list[str] | None = None,
    prior_involvement: list[str] | None = None,
    independent_replacement_reviewer: str | None = None,
    mitigation_approver: str | None = None,
) -> IndependenceDeclaration:
    contributors = contributors or []
    financial_ties = financial_ties or []
    prior_involvement = prior_involvement or []
    conflicts: list[ConflictItem] = []

    if not proposer or not reviewer:
        conflicts.append(ConflictItem("missing_identity", "HIGH", "proposer 或 reviewer 为空"))
    elif proposer == reviewer:
        conflicts.append(ConflictItem("self_review", "HIGH", f"proposer 与 reviewer 同为 {reviewer}"))

    if reviewer and reviewer in contributors:
        conflicts.append(ConflictItem("contributor_overlap", "HIGH", f"{reviewer} 在产物 contributors 名单中"))

    for item in prior_involvement:
        conflicts.append(ConflictItem("prior_involvement", "HIGH", f"既往参与被审产物：{item}"))

    if reporting_to_proposer:
        conflicts.append(ConflictItem("reporting_line", "HIGH", f"{reviewer} 汇报线指向发起人 {proposer}"))

    for tie in financial_ties:
        conflicts.append(ConflictItem("financial_interest", "HIGH", f"利益绑定：{tie}"))

    mitigations: list[str] = []
    valid_mitigation = False
    if independent_replacement_reviewer and independent_replacement_reviewer not in {proposer, reviewer}:
        if mitigation_approver and mitigation_approver not in {proposer, reviewer}:
            valid_mitigation = True
            mitigations.append(
                f"由 {mitigation_approver} 批准更换独立复核人为 {independent_replacement_reviewer}"
            )
        else:
            conflicts.append(
                ConflictItem("invalid_self_mitigation", "HIGH", "缓解批准人不得为 proposer 或原 reviewer")
            )

    has_high = any(c.severity == "HIGH" for c in conflicts)
    if has_high and not valid_mitigation:
        return IndependenceDeclaration(
            declaration_id=declaration_id,
            proposer=proposer,
            reviewer=reviewer,
            conflicts=conflicts,
            mitigation=mitigations,
            disposition="REFUSE",
            can_issue_assurance_review=False,
        )
    if conflicts:
        return IndependenceDeclaration(
            declaration_id=declaration_id,
            proposer=proposer,
            reviewer=reviewer,
            conflicts=conflicts,
            mitigation=mitigations,
            disposition="REQUIRE_MITIGATION",
            can_issue_assurance_review=True,
        )
    return IndependenceDeclaration(
        declaration_id=declaration_id,
        proposer=proposer,
        reviewer=reviewer,
        conflicts=[],
        mitigation=[],
        disposition="ALLOW",
        can_issue_assurance_review=True,
    )


def selftest() -> int:
    # 1. 正常独立复核：AGT-008 提议，AGT-005 独立 session 复核 -> ALLOW
    ok = evaluate_coi("DEC-01", proposer="AGT-008", reviewer="AGT-005", contributors=["AGT-008", "AGT-001"])
    assert ok.disposition == "ALLOW" and ok.can_issue_assurance_review is True, asdict(ok)

    # 2. 自审反例：proposer == reviewer -> REFUSE
    self_rev = evaluate_coi("DEC-02", proposer="AGT-008", reviewer="AGT-008")
    assert self_rev.disposition == "REFUSE" and self_rev.can_issue_assurance_review is False, asdict(self_rev)

    # 3. 参与制作反例：reviewer 在 contributors 中 -> REFUSE
    overlap = evaluate_coi("DEC-03", proposer="AGT-008", reviewer="AGT-005", contributors=["AGT-008", "AGT-005"])
    assert overlap.disposition == "REFUSE" and overlap.can_issue_assurance_review is False, asdict(overlap)

    # 4. 自己给自己批缓解 -> 拦截并 REFUSE
    self_mit = evaluate_coi(
        "DEC-04",
        proposer="AGT-008",
        reviewer="AGT-005",
        prior_involvement=["参与起草 STG-04 指标"],
        independent_replacement_reviewer="AGT-042",
        mitigation_approver="AGT-005",
    )
    assert self_mit.disposition == "REFUSE" and self_mit.can_issue_assurance_review is False, asdict(self_mit)

    print("COI_SELFTEST PASS 4/4")
    return 0


if __name__ == "__main__":
    sys.exit(selftest())
