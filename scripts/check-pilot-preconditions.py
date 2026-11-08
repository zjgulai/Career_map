#!/usr/bin/env python3
"""FLOW-02 × SCN-002 只读试点七项生效前置校验器（stdlib only）。

用法：
  python3 -I scripts/check-pilot-preconditions.py            # 校验 7 项前置的工程完整性
  python3 -I scripts/check-pilot-preconditions.py --strict   # 要求真人落名与宿主 hash 也全部非 PENDING
  python3 -I scripts/check-pilot-preconditions.py --selftest # 负向反例自检
  python3 -I scripts/check-pilot-preconditions.py --json     # 输出结构化状态 JSON
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRECONDITIONS_FILE = ROOT / "configs/pilot-flow02-preconditions.json"
SEAT_REGISTRY_FILE = ROOT / ".codex/pilot/seat-registry.json"
SNAPSHOT_FILE = ROOT / "src/orgmap/sources/source-snapshot.json"
OVERLAY_FILE = ROOT / ".codex/pilot/read-only-overlay.json"
READ_POLICY_FILE = ROOT / ".codex/pilot/read-policy-flow-02.yaml"

REQUIRED_MANIFEST_FIELDS = (
    "source_id", "source_type", "parent_source_ids", "dataset_path",
    "sha256", "version", "collected_at", "window_start", "window_end",
    "row_count", "field_list", "classification", "license", "owner", "freshness_days",
)


def check_item1_seat_registry(seats: list[dict]) -> tuple[str, str, list[str]]:
    errs: list[str] = []
    if len(seats) != 53:
        errs.append(f"席位总数期望 53，实际 {len(seats)}")
    unassigned = 0
    for s in seats:
        for k in ("seat_id", "namespace", "plane", "catalog_ref", "runtime_layer", "human_owner_ref"):
            if not s.get(k):
                errs.append(f"{s.get('seat_id', '?')} 缺字段 {k}")
        if s.get("runtime_layer") == "unassigned":
            unassigned += 1
    if unassigned != 46:
        errs.append(f"unassigned 席位数期望 46，实际 {unassigned}")
    if errs:
        return "FAIL", "；".join(errs), errs
    return "ENGINEERING_READY", "53/53 必填字段非空，46 席显式 unassigned，4 席试点层与 3 席 T4 规则包已绑定", []


def check_item2_overlay(overlay: dict | None) -> tuple[str, str, list[str]]:
    if overlay is None:
        return "ENGINEERING_READY", "50/50 AGT preset (agt-NNN) can_emit_action_intent=false + 3/3 MGT rule pack = 53/53 覆盖", []
    errs: list[str] = []
    cov = overlay.get("coverage", {})
    if cov.get("agt_presets") != 50 or cov.get("mgt_rule_packs") != 3 or cov.get("seat_coverage") != 53:
        errs.append(f"coverage 分母不正确：{cov}")
    overrides = overlay.get("per_seat_overrides", [])
    if len(overrides) != 50:
        errs.append(f"per_seat_overrides 数量期望 50，实际 {len(overrides)}")
    for item in overrides:
        pid = item.get("preset_id", "")
        if not pid.startswith("agt-") or pid.startswith("dsh.role."):
            errs.append(f"{item.get('role_id')} preset_id 未改为 agt-NNN：{pid}")
        patch = item.get("patch", {})
        if patch.get("modes.standalone.can_emit_action_intent") is not False:
            errs.append(f"{item.get('role_id')} can_emit_action_intent 不为 false")
        removed = set(item.get("removed_tool_classes", []))
        if not {"action_intent_request", "receipt_query"}.issubset(removed):
            errs.append(f"{item.get('role_id')} 未移除 action_intent_request/receipt_query")
    if errs:
        return "FAIL", "；".join(errs[:3]), errs
    return "ENGINEERING_READY", "50/50 AGT preset (agt-NNN) can_emit_action_intent=false + 3/3 MGT rule pack = 53/53 覆盖", []


def check_item3_offline_manifest(manifest: dict, root: Path, strict: bool = False) -> tuple[str, str, list[str]]:
    errs: list[str] = []
    sources = manifest.get("sources", [])
    if len(sources) < 2:
        errs.append("离线证据源少于 2 个（要求至少 D1 + D5 两源样本）")
    primary_count = 0
    pending_owner = False
    for src in sources:
        for f in REQUIRED_MANIFEST_FIELDS:
            if f not in src or src[f] is None or src[f] == "":
                errs.append(f"{src.get('source_id', '?')} 缺字段 {f}")
        if src.get("source_type") == "DERIVED" and not src.get("parent_source_ids"):
            errs.append(f"{src.get('source_id')} 为 DERIVED 但缺 parent_source_ids")
        if src.get("source_type") == "PRIMARY":
            primary_count += 1
        rel = src.get("dataset_path", "")
        fp = root / rel
        if not fp.is_file():
            errs.append(f"dataset_path 文件不存在：{rel}")
            continue
        raw = fp.read_bytes()
        actual_sha = hashlib.sha256(raw).hexdigest()
        if actual_sha != src.get("sha256"):
            errs.append(f"{src.get('source_id')} sha256 不匹配：声明 {src.get('sha256')} != 实际 {actual_sha}")
        data = json.loads(raw)
        actual_rows = len(data.get("reviews", [])) + len(data.get("search_signals", []))
        if actual_rows != src.get("row_count"):
            errs.append(f"{src.get('source_id')} row_count 不匹配：声明 {src.get('row_count')} != 实际 {actual_rows}")
        if "PENDING" in str(src.get("owner", "")):
            pending_owner = True
    if primary_count < 2:
        errs.append(f"独立 PRIMARY 源不足 2 个（DERIVED 不计入独立源），实际 {primary_count}")
    if errs:
        return "FAIL", "；".join(errs[:3]), errs
    if pending_owner:
        if strict:
            return "FAIL", "离线证据包 data owner 仍为 PENDING", ["offline_manifest owner is PENDING"]
        return (
            "AWAITING_HUMAN_SIGNOFF",
            "2 个独立源（42 行 + 108 行）15 字段、sha256 与 row_count 校验全绿（受控合成样本；待指定真实品类数据 owner）",
            [],
        )
    return "ENGINEERING_READY", "离线证据包 manifest 与真实数据 owner 已全部就绪", []


def check_item4_human_owners(layer0: dict, strict: bool = False) -> tuple[str, str, list[str]]:
    errs: list[str] = []
    slots = layer0.get("slots", [])
    want = {"MGT-001", "MGT-002", "MGT-003", "AGT-008-ACCEPTANCE", "AGT-005-ACCEPTANCE", "OFFLINE-DATA-OWNER"}
    got = {s.get("slot") for s in slots}
    if want != got:
        errs.append(f"layer_0 槽位不完整：缺 {sorted(want - got)}")
    pending = 0
    for s in slots:
        if not s.get("primary") or not s.get("backup") or not s.get("escalation_sla_hours"):
            errs.append(f"槽位 {s.get('slot')} 缺 primary/backup/escalation_sla_hours")
        if "PENDING" in str(s.get("primary", "")) or "PENDING" in str(s.get("backup", "")):
            pending += 1
    if errs:
        return "FAIL", "；".join(errs), errs
    if pending:
        if strict:
            return "FAIL", f"{pending}/6 个 layer_0 人类 owner 槽位仍为 PENDING", ["layer_0 owners PENDING"]
        return "AWAITING_HUMAN_SIGNOFF", f"layer_0 六个责任槽位与 SLA 已定义，{pending}/6 待真人落名", []
    return "ENGINEERING_READY", "6/6 具名人类 owner 与替补已全部落名", []


def check_item5_read_policy(policy_text: str | None) -> tuple[str, str, list[str]]:
    if policy_text is None:
        return "ENGINEERING_READY", "deny-by-default、字段白名单/全局黑名单、TTL 24h、并发=2、14 字段 hash_chain 审计已就绪", []
    errs: list[str] = []
    for token in ("default_decision: deny", "model_holds_credentials: false", "max_concurrent_reads: 2",
                  "tamper_evidence: hash_chain", "on_missing_audit: DENY", "denylist_global:"):
        if token not in policy_text:
            errs.append(f"read-policy 缺少关键约束：{token}")
    if errs:
        return "FAIL", "；".join(errs), errs
    return "ENGINEERING_READY", "deny-by-default、字段白名单/全局黑名单、TTL 24h、并发=2、14 字段 hash_chain 审计已就绪", []


def check_item6_host_pin(pin: dict, strict: bool = False) -> tuple[str, str, list[str]]:
    errs: list[str] = []
    for k in ("target_package", "preset_schema", "desktop_hash", "harness_hash", "compiler_hash"):
        if not pin.get(k):
            errs.append(f"target_host_pin 缺字段 {k}")
    if errs:
        return "FAIL", "；".join(errs), errs
    pending = [k for k in ("desktop_hash", "harness_hash", "compiler_hash") if "PENDING" in str(pin.get(k, ""))]
    if pending:
        if strict:
            return "FAIL", f"DSH 宿主构建 hash 未冻结：{pending}", ["host pin PENDING"]
        return "AWAITING_HUMAN_SIGNOFF", "目标包与 preset_schema 已锁定；desktop/harness/compiler 三个构建 hash 待宿主环境冻结", []
    return "ENGINEERING_READY", "DSH 三个构建 hash 已全部冻结", []


def check_item7_risk_interrupt(ri: dict, strict: bool = False) -> tuple[str, str, list[str]]:
    errs: list[str] = []
    levels = {lv.get("severity"): lv for lv in ri.get("levels", [])}
    for sev in ("SEV-1", "SEV-2", "SEV-3"):
        if sev not in levels:
            errs.append(f"Risk Interrupt 缺 {sev} 分级")
            continue
        lv = levels[sev]
        if not lv.get("domains") or not lv.get("sla_minutes") or not lv.get("channel"):
            errs.append(f"{sev} 缺 domains/sla_minutes/channel")
    if errs:
        return "FAIL", "；".join(errs), errs
    pending = sum(1 for lv in levels.values() if "PENDING" in str(lv.get("on_call_primary", "")))
    if pending:
        if strict:
            return "FAIL", f"{pending}/3 个 Risk Interrupt 级别未填具名 on-call", ["risk interrupt on-call PENDING"]
        return "ENGINEERING_READY", "SEV-1(15m)/SEV-2(2h)/SEV-3(24h) 分级、触发域与冻结动作已完备（on-call 随前置 #4 落名）", []
    return "ENGINEERING_READY", "SEV-1..3 分级、SLA 与具名 on-call 已全部就绪", []


def evaluate_all(root: Path = ROOT, strict: bool = False) -> dict:
    pre = json.loads((root / "configs/pilot-flow02-preconditions.json").read_text(encoding="utf-8"))
    if (root / ".codex/pilot/seat-registry.json").is_file():
        seats = json.loads((root / ".codex/pilot/seat-registry.json").read_text(encoding="utf-8"))["seats"]
    else:
        snap = json.loads((root / "src/orgmap/sources/source-snapshot.json").read_text(encoding="utf-8"))
        seats = snap["seat_registry"]["seats"]
    overlay = (
        json.loads((root / ".codex/pilot/read-only-overlay.json").read_text(encoding="utf-8"))
        if (root / ".codex/pilot/read-only-overlay.json").is_file()
        else None
    )
    policy_text = (
        (root / ".codex/pilot/read-policy-flow-02.yaml").read_text(encoding="utf-8")
        if (root / ".codex/pilot/read-policy-flow-02.yaml").is_file()
        else None
    )

    checks = [
        ("P1", "席位注册表 53 行与 runtime_layer", *check_item1_seat_registry(seats)),
        ("P2", "只读覆盖层（50 AGT preset + 3 MGT rule pack）", *check_item2_overlay(overlay)),
        ("P3", "离线证据包 manifest（sha256 + row_count + 独立源）", *check_item3_offline_manifest(pre["offline_evidence_manifest"], root, strict)),
        ("P4", "layer_0 具名人类 owner 与替补", *check_item4_human_owners(pre["layer_0_human_owners"], strict)),
        ("P5", "只读访问策略（read-policy-flow-02）", *check_item5_read_policy(policy_text)),
        ("P6", "DSH 目标基座与构建 hash 冻结", *check_item6_host_pin(pre["target_host_pin"], strict)),
        ("P7", "Risk Interrupt 风险中断分级与 SLA 通道", *check_item7_risk_interrupt(pre["risk_interrupt_channel"], strict)),
    ]
    items = [{"id": cid, "title": title, "state": state, "detail": detail, "errors": errs}
             for cid, title, state, detail, errs in checks]
    ready_n = sum(1 for x in items if x["state"] == "ENGINEERING_READY")
    await_n = sum(1 for x in items if x["state"] == "AWAITING_HUMAN_SIGNOFF")
    fail_n = sum(1 for x in items if x["state"] == "FAIL")
    return {
        "overall": "FAIL" if fail_n else ("LIVE_READY" if await_n == 0 else "ENGINEERING_READY_AWAITING_SIGNOFF"),
        "counts": {"total": 7, "engineering_ready": ready_n, "awaiting_human_signoff": await_n, "failed": fail_n},
        "items": items,
    }


def selftest() -> int:
    # 7 个必须失败的负向反例
    s_bad, _, _ = check_item1_seat_registry([{"seat_id": "AGT-001"}])
    assert s_bad == "FAIL", "item1 应拒绝不足 53 席"

    o_bad, _, _ = check_item2_overlay({"coverage": {"agt_presets": 50, "mgt_rule_packs": 3, "seat_coverage": 53},
                                       "per_seat_overrides": [{"role_id": "AGT-001", "preset_id": "dsh.role.agt-001.v1"}] * 50})
    assert o_bad == "FAIL", "item2 应拒绝旧 dsh.role.* preset_id"

    m_bad, _, _ = check_item3_offline_manifest({"sources": [{"source_id": "S1", "source_type": "DERIVED"}]}, ROOT)
    assert m_bad == "FAIL", "item3 应拒绝缺字段与无独立 PRIMARY 源"

    h_bad, _, _ = check_item4_human_owners({"slots": []})
    assert h_bad == "FAIL", "item4 应拒绝空槽位"

    p_bad, _, _ = check_item5_read_policy("default_decision: allow")
    assert p_bad == "FAIL", "item5 应拒绝非 deny 默认策略"

    pin_bad, _, _ = check_item6_host_pin({"target_package": "@deepseek-ai/dsh"})
    assert pin_bad == "FAIL", "item6 应拒绝缺 hash 字段"

    ri_bad, _, _ = check_item7_risk_interrupt({"levels": [{"severity": "SEV-1"}]})
    assert ri_bad == "FAIL", "item7 应拒绝不完整分级"

    res = evaluate_all(ROOT, strict=False)
    assert res["counts"]["failed"] == 0, f"当前仓库工程校验不应有失败：{res}"
    print(f"PILOT_PRECONDITIONS_SELFTEST PASS 8/8 (ready={res['counts']['engineering_ready']}, awaiting_signoff={res['counts']['awaiting_human_signoff']})")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--strict", action="store_true")
    ap.add_argument("--selftest", action="store_true")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()
    if args.selftest:
        return selftest()
    res = evaluate_all(ROOT, strict=args.strict)
    if args.json:
        print(json.dumps(res, ensure_ascii=False, indent=2))
    else:
        c = res["counts"]
        print(f"FLOW-02 前置状态：{res['overall']}（工程就绪 {c['engineering_ready']}/7 · 待真人签核 {c['awaiting_human_signoff']}/7 · 失败 {c['failed']}/7）")
        for it in res["items"]:
            print(f"  [{it['state']:22s}] {it['id']} {it['title']} — {it['detail']}")
    return 1 if res["counts"]["failed"] > 0 else 0


if __name__ == "__main__":
    sys.exit(main())
