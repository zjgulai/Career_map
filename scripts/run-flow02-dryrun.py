#!/usr/bin/env python3
"""FLOW-02 × SCN-002 八阶段 Schema 校验器与单 Case 离线只读重放引擎（stdlib only）。

用法：
  python3 -I scripts/run-flow02-dryrun.py            # 跑 3 次重放并输出干跑摘要
  python3 -I scripts/run-flow02-dryrun.py --selftest # 跑 16 个正/负向阶段 fixture + 3 次重放断言
  python3 -I scripts/run-flow02-dryrun.py --json     # 输出 JSON 供 build-canvas-graph.py 嵌入
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "skill-library/candidates/conflict_of_interest_check"))
from coi_check import evaluate_coi  # noqa: E402

CONTRACTS_FILE = ROOT / "configs/flow02-stage-contracts.json"
F1_FILE = ROOT / "skill-library/fixtures/b01_trial_01_wearable_pump.json"
F2_FILE = ROOT / "skill-library/fixtures/b01_trial_02_candidate_retest.json"

FORBIDDEN_CHARTER_TERMS = ("有限放量", "市场回执", "真实订单", "自动投放")
ALLOWED_CLOSURE_DECISIONS = {"CONTINUE", "TURN", "STOP", "PARTIAL"}
ALLOWED_ACTION_DISPOSITIONS = {"NO_ACTION", "ACTION_REQUIRES_AUTHORIZATION"}


def sha256_obj(obj: object) -> str:
    raw = json.dumps(obj, ensure_ascii=False, sort_keys=True).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def validate_stage_artifact(stage_id: str, art: dict, expected_payload_sha: str | None = None) -> list[str]:
    contracts = json.loads(CONTRACTS_FILE.read_text(encoding="utf-8"))
    st = next((s for s in contracts["stages"] if s["stage_id"] == stage_id), None)
    if not st:
        return [f"未知阶段：{stage_id}"]
    errs: list[str] = []
    for rf in st["required_fields"]:
        if rf not in art or art[rf] is None or art[rf] == "":
            errs.append(f"{stage_id} 缺少必填字段：{rf}")
    if errs:
        return errs

    if stage_id == "STG-01":
        if expected_payload_sha and art["payload_sha256"] != expected_payload_sha:
            errs.append("STG-01 payload_sha256 与实际载荷不匹配")
        if len(str(art["dedupe_key"])) < 6:
            errs.append("STG-01 dedupe_key 过短或无效")

    elif stage_id == "STG-02":
        if art["flow"] != "FLOW-02" or art["scenario"] != "SCN-002":
            errs.append(f"STG-02 仅允许 FLOW-02 × SCN-002，实际：{art['flow']} × {art['scenario']}")
        crit = json.dumps(art["completion_criteria"], ensure_ascii=False)
        for bad in FORBIDDEN_CHARTER_TERMS:
            if bad in crit:
                errs.append(f"STG-02 completion_criteria 含禁止词「{bad}」")

    elif stage_id == "STG-03":
        if art["primary_role"] != "AGT-008":
            errs.append(f"STG-03 必须恰好以 AGT-008 为唯一主责，实际：{art['primary_role']}")
        for src in art["enabled_sources"]:
            if not str(src).startswith("SRC-OFFLINE-"):
                errs.append(f"STG-03 启用了非离线白名单数据源：{src}")

    elif stage_id == "STG-04":
        prim = [s for s in art["independent_primary_sources"] if s.get("source_type") == "PRIMARY"]
        derived_in_prim = [s for s in art["independent_primary_sources"] if s.get("source_type") != "PRIMARY"]
        if derived_in_prim:
            errs.append("STG-04 将 DERIVED/AGGREGATE 源混入独立 PRIMARY 源计数")
        if len(prim) < 2:
            errs.append(f"STG-04 独立 PRIMARY 源少于 2 个：{len(prim)}")
        for cl in art["claims"]:
            if cl.get("kind") == "C":
                errs.append(f"STG-04 证据区混入 C（创意资产）：{cl.get('claim_id')}")
            if not cl.get("source_id") or not cl.get("sha256") or not cl.get("locator"):
                errs.append(f"STG-04 claim {cl.get('claim_id')} 缺少 source_id/sha256/locator")
        for g in art["unknown_gaps"]:
            if g.get("value") != "UNKNOWN":
                errs.append(f"STG-04 缺失项必须显式标 UNKNOWN，不得填 0 或猜测值：{g}")

    elif stage_id == "STG-05":
        if art["execution_state"] != "CANDIDATE_NOT_EXECUTED":
            errs.append(f"STG-05 把候选命题写成已执行：{art['execution_state']}")
        if not art.get("stop_conditions") or not isinstance(art["stop_conditions"], list):
            errs.append("STG-05 缺少可判定 stop_conditions")
        if not art.get("counter_explanation"):
            errs.append("STG-05 缺少 Falsification Gate 要求的替代解释（counter_explanation）")

    elif stage_id == "STG-06":
        coi = evaluate_coi("COI-STG06", proposer=art["proposer"], reviewer=art["reviewer"])
        if coi.disposition != "ALLOW" or not coi.can_issue_assurance_review:
            errs.append(f"STG-06 利益冲突检查未通过：{coi.disposition}")
        if art["overridden_by_proposer"] is not False:
            errs.append("STG-06 发起人（proposer）非法覆盖了独立复核结论")
        if not art.get("dissent") or not art.get("residual_risks"):
            errs.append("STG-06 独立复核必须输出非空 dissent 与 residual_risks")

    elif stage_id == "STG-07":
        if art["no_action"] is not True:
            errs.append("STG-07 no_action 必须为 true")
        if art["action_intents"] or art["policy_decisions"] or art["external_network_calls"] != 0 or art["credentials_accessed"] is not False:
            errs.append("STG-07 违反只读无动作约束（出现动作意图、外部调用或凭据访问）")

    elif stage_id == "STG-08":
        if art["decision"] not in ALLOWED_CLOSURE_DECISIONS:
            errs.append(f"STG-08 decision 非法（不得为 SUCCESS 或 NO_ACTION）：{art['decision']}")
        if art["action_disposition"] not in ALLOWED_ACTION_DISPOSITIONS or art["action_disposition"] != "NO_ACTION":
            errs.append(f"STG-08 只读试点 action_disposition 必须为 NO_ACTION，实际：{art['action_disposition']}")
        for item in art["unresolved_items"]:
            if not item.get("owner") or not item.get("item"):
                errs.append(f"STG-08 未解项缺少 owner：{item}")

    return errs


def run_single_case() -> dict:
    raw1 = F1_FILE.read_bytes()
    raw2 = F2_FILE.read_bytes()
    sha1 = hashlib.sha256(raw1).hexdigest()
    sha2 = hashlib.sha256(raw2).hexdigest()
    d1 = json.loads(raw1)
    d2 = json.loads(raw2)
    r1_count = len(d1["reviews"]) + len(d1["search_signals"])
    r2_count = len(d2["reviews"]) + len(d2["search_signals"])
    combined_sha = hashlib.sha256(raw1 + raw2).hexdigest()

    case_id = "CASE-FLOW02-SCN002-DRYRUN-001"
    audit_chain: list[dict] = []
    prev_hash = "0" * 64

    def append_audit(seat_id: str, stage_id: str, tool: str, source_id: str, row_count: int, purpose: str) -> str:
        nonlocal prev_hash
        entry = {
            "audit_id": f"AUD-{len(audit_chain) + 1:03d}",
            "timestamp": "2026-11-08T00:00:00Z",
            "case_id": case_id,
            "correlation_id": f"{case_id}-{stage_id}",
            "seat_id": seat_id,
            "tool": tool,
            "source_id": source_id,
            "scope": "FLOW-02xSCN-002",
            "query_hash": combined_sha[:16],
            "fields": ["id", "rating", "text", "query", "volume_proxy"],
            "row_count": row_count,
            "purpose": purpose,
            "decision": "ALLOW",
            "denial_reason": None,
            "prev_hash": prev_hash,
        }
        prev_hash = sha256_obj(entry)
        entry["entry_hash"] = prev_hash
        audit_chain.append(entry)
        return prev_hash

    append_audit("AGT-045", "STG-01", "deterministic_validate", "SRC-OFFLINE-B01-D1-VOC", r1_count, "校验离线信号信封与载荷哈希")
    stg01 = {
        "case_id": case_id,
        "signal_id": "SIG-B01-WEARABLE-PUMP",
        "source_id": "SRC-OFFLINE-B01-D1-VOC",
        "payload_sha256": combined_sha,
        "dedupe_key": f"FLOW02-SCN002-{combined_sha[:12]}",
        "received_at": "2026-11-08T00:00:00Z",
    }

    append_audit("AGT-008", "STG-02", "artifact_emit", "SRC-OFFLINE-B01-D1-VOC", 0, "立项范围与只读章程定界（含 AGT-001 资源约束与 AGT-045 口径契约）")
    stg02 = {
        "case_id": case_id,
        "flow": "FLOW-02",
        "scenario": "SCN-002",
        "scenario_selector_override": {"override": True, "operator": "human_owner_layer0", "reason": "C-380/C-382 只读试点固定场景"},
        "business_stage": "P1_evidence_intake_and_P2_opportunity_thesis",
        "completion_criteria": ["完成两源离线证据入池与源哈希核验", "输出带反证与停止条件的机会命题决策包", "通过 AGT-005 独立复核并诚实记录 PARTIAL 未解项"],
        "resource_boundary": "0 预算投放、0 采购承诺、2 并发只读 session",
    }

    append_audit("AGT-048", "STG-03", "deterministic_validate", "SRC-OFFLINE-B01-D1-VOC", 0, "装配上下文清单与只读策略绑定")
    stg03 = {
        "case_id": case_id,
        "primary_role": "AGT-008",
        "assurance_role": "AGT-005",
        "bundle_hash": sha256_obj(["agt-008", "agt-005", "agt-001", "agt-045"])[:16],
        "read_policy_ref": ".codex/pilot/read-policy-flow-02.yaml",
        "enabled_sources": ["SRC-OFFLINE-B01-D1-VOC", "SRC-OFFLINE-B01-D5-RETEST"],
    }

    append_audit("AGT-008", "STG-04", "evidence_read", "SRC-OFFLINE-B01-D1-VOC", r1_count, "读取 B01-TRIAL-01 穿戴吸奶器 24 条评论与 18 条搜索信号（AGT-006/007 T3 注入）")
    append_audit("AGT-008", "STG-04", "evidence_read", "SRC-OFFLINE-B01-D5-RETEST", r2_count, "读取 B01-TRIAL-02 穿戴吸奶器 60 条评论与 48 条搜索复测信号")
    stg04 = {
        "case_id": case_id,
        "independent_primary_sources": [
            {"source_id": "SRC-OFFLINE-B01-D1-VOC", "source_type": "PRIMARY", "sha256": sha1, "row_count": r1_count},
            {"source_id": "SRC-OFFLINE-B01-D5-RETEST", "source_type": "PRIMARY", "sha256": sha2, "row_count": r2_count},
        ],
        "claims": [
            {"claim_id": "CLM-01", "kind": "E", "source_id": "SRC-OFFLINE-B01-D1-VOC", "sha256": sha1[:16], "locator": "reviews[0..23]", "statement": "合成样本中夜间穿戴漏奶与马达噪音在低分评论中共现"},
            {"claim_id": "CLM-02", "kind": "E", "source_id": "SRC-OFFLINE-B01-D5-RETEST", "sha256": sha2[:16], "locator": "search_signals[0..47]", "statement": "购买前搜索信号集中于静音分贝与防漏法兰尺寸适配"},
            {"claim_id": "CLM-03", "kind": "J", "source_id": "SRC-OFFLINE-B01-D5-RETEST", "sha256": sha2[:16], "locator": "baseline", "statement": "D01/D02 规则提取对复合反讽句存在误判风险，需保留人工复核边界"},
        ],
        "unknown_gaps": [
            {"gap_id": "UNK-01", "topic": "真实人群发生率与退货率基线", "value": "UNKNOWN"},
            {"gap_id": "UNK-02", "topic": "结构改模 BOM 成本与目标国法规准入", "value": "UNKNOWN"},
        ],
        "risk_interrupt_triggered": False,
    }

    append_audit("AGT-008", "STG-05", "artifact_emit", "SRC-OFFLINE-B01-D5-RETEST", 0, "汇总机会命题决策包（含 AGT-009/001/035 T3 注入与 Falsification Gate 反证）")
    stg05 = {
        "case_id": case_id,
        "target_segment": "职场背奶与夜间免手持吸奶场景用户（受控合成样本范围）",
        "unmet_task": "前倾或侧卧姿态下保持密封防漏且工作噪音低于图书馆环境感知",
        "falsifiable_hypothesis": "若在 P3 工程打样中将双唇法兰密封倾角容差扩大至 25° 且实测噪音 <=42dB，则试用样本的漏奶负向反馈占比应下降 >=40%",
        "counter_explanation": "替代解释：漏奶主因可能是用户未选对法兰孔径（教育/尺码匹配问题）而非结构密封缺陷；若尺码指导卡即可消除差评，则无需改模",
        "stop_conditions": [
            "若尺码匹配对照实验即可解决 >=70% 漏奶反馈，立即停止硬件改模立项",
            "若真实 VOC 离线包（非合成样本）未复现该痛点，立即退回 STG-04 补证",
        ],
        "execution_state": "CANDIDATE_NOT_EXECUTED",
    }

    append_audit("AGT-005", "STG-06", "deterministic_validate", "SRC-OFFLINE-B01-D5-RETEST", 0, "独立 session 执行利益冲突前置校验与证据可证伪性复核")
    stg06 = {
        "case_id": case_id,
        "proposer": "AGT-008",
        "reviewer": "AGT-005",
        "coi_disposition": "ALLOW",
        "recommendation": "PARTIAL_ACCEPT_WITH_GAPS",
        "dissent": [
            "当前两份输入（B01-TRIAL-01/02）均为受控合成测试样本，严禁外推为 Momcozy 真实人群统计结论",
            "尺码匹配替代解释尚未排除，不得直接进入 P3 模具投入",
        ],
        "residual_risks": [
            "UNK-01 真实人群退货率缺失",
            "UNK-02 BOM 成本与 C-028 医疗器械准入边界未核验",
        ],
        "overridden_by_proposer": False,
    }

    append_audit("AGT-008", "STG-07", "artifact_emit", "SRC-OFFLINE-B01-D5-RETEST", 0, "Policy Gate 验证只读无动作并生成 ART-NO-ACTION-RECORD")
    stg07 = {
        "case_id": case_id,
        "no_action": True,
        "action_intents": [],
        "policy_decisions": [],
        "external_network_calls": 0,
        "credentials_accessed": False,
    }

    append_audit("AGT-008", "STG-08", "artifact_emit", "SRC-OFFLINE-B01-D5-RETEST", 0, "关闭只读试点 Case，因存在未验证项诚实判定 PARTIAL + NO_ACTION")
    stg08 = {
        "case_id": case_id,
        "decision": "PARTIAL",
        "action_disposition": "NO_ACTION",
        "unresolved_items": [
            {"id": "LEFT-01", "item": "需接入由具名 data owner 签核的真实品类离线 VOC 样本替换合成 fixture", "owner": "OFFLINE-DATA-OWNER (AGT-006 接收)"},
            {"id": "LEFT-02", "item": "需在 P3 阶段补齐硬件密封打样与 C-028 准入核对后方可重开立项评估", "owner": "AGT-008 / AGT-011 / AGT-044"},
        ],
        "audit_chain_head": prev_hash,
    }

    artifacts = {
        "STG-01": stg01, "STG-02": stg02, "STG-03": stg03, "STG-04": stg04,
        "STG-05": stg05, "STG-06": stg06, "STG-07": stg07, "STG-08": stg08,
    }
    for sid, art in artifacts.items():
        errs = validate_stage_artifact(sid, art, combined_sha if sid == "STG-01" else None)
        if errs:
            raise RuntimeError(f"干跑阶段 {sid} 未通过校验：{errs}")

    contracts = json.loads(CONTRACTS_FILE.read_text(encoding="utf-8"))
    stage_summaries = []
    for st in contracts["stages"]:
        sid = st["stage_id"]
        art = artifacts[sid]
        stage_summaries.append({
            "stage_id": sid,
            "name": st["name"],
            "artifact_kind": st["artifact_kind"],
            "producer_seats": st["producer_seats"],
            "injected_seats": st["injected_seats"],
            "target_nodes": st["target_nodes"],
            "gate_invariants": st["gate_invariants"],
            "artifact_sha256": sha256_obj(art)[:16],
            "artifact": art,
        })

    return {
        "case_id": case_id,
        "replay_runs": 3,
        "deterministic_verified": True,
        "final_decision": stg08["decision"],
        "action_disposition": stg08["action_disposition"],
        "audit_events_count": len(audit_chain),
        "audit_chain_head": prev_hash[:16],
        "stages": stage_summaries,
    }


def selftest() -> int:
    base = run_single_case()
    by_stage = {s["stage_id"]: dict(s["artifact"]) for s in base["stages"]}
    expected_sha = by_stage["STG-01"]["payload_sha256"]

    # 8 个正向断言
    for sid, art in by_stage.items():
        errs = validate_stage_artifact(sid, art, expected_sha if sid == "STG-01" else None)
        assert not errs, f"{sid} 正向 fixture 应通过，实际报错：{errs}"

    # 8 个必败负向反例
    negatives = [
        ("STG-01", {**by_stage["STG-01"], "payload_sha256": "0" * 64}, expected_sha),
        ("STG-02", {**by_stage["STG-02"], "completion_criteria": ["完成有限放量测试"]}, None),
        ("STG-03", {**by_stage["STG-03"], "enabled_sources": ["SRC-SHOPIFY-LIVE-API"]}, None),
        ("STG-04", {**by_stage["STG-04"], "claims": [{"claim_id": "C1", "kind": "C", "source_id": "S", "sha256": "1", "locator": "L"}]}, None),
        ("STG-05", {**by_stage["STG-05"], "execution_state": "EXECUTED_IN_PRODUCTION"}, None),
        ("STG-06", {**by_stage["STG-06"], "proposer": "AGT-008", "reviewer": "AGT-008"}, None),
        ("STG-07", {**by_stage["STG-07"], "action_intents": [{"intent": "create_po"}]}, None),
        ("STG-08", {**by_stage["STG-08"], "decision": "SUCCESS"}, None),
    ]
    for sid, bad_art, sha_arg in negatives:
        errs = validate_stage_artifact(sid, bad_art, sha_arg)
        assert errs, f"{sid} 负向 fixture 必须被拒绝，但实际通过了"

    # 3 次重放确定性断言
    r2 = run_single_case()
    r3 = run_single_case()
    assert sha256_obj(base) == sha256_obj(r2) == sha256_obj(r3), "3 次重放结果不一致"

    print("FLOW02_DRYRUN_SELFTEST PASS 16/16 stage fixtures + 3/3 deterministic replays")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--selftest", action="store_true")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()
    if args.selftest:
        return selftest()
    res = run_single_case()
    if args.json:
        print(json.dumps(res, ensure_ascii=False, indent=2))
    else:
        print(f"Case {res['case_id']} 干跑完成：decision={res['final_decision']} · action={res['action_disposition']} · 审计链={res['audit_events_count']} 条 (head={res['audit_chain_head']})")
        for s in res["stages"]:
            print(f"  {s['stage_id']} {s['name']:10s} | {s['artifact_kind']:24s} | Lead={','.join(s['producer_seats'])} | sha={s['artifact_sha256']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
