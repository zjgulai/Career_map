#!/usr/bin/env python3
"""FLOW-02 × SCN-002 试点前置（P3/P4/P6）真人签核 CLI 助手（批次 40）。

原则：
- 未显式传入真实签核参数时，仅只读展示 P3/P4/P6 待签核槽位状态，绝不自动代填或伪造；
- 拦截 PENDING / TODO / TBD / mock / fake / example 等占位词；
- --selftest 仅在内存字典上验证签核校验逻辑，不落盘修改 configs/pilot-flow02-preconditions.json。

用法：
  python3 -I scripts/signoff-pilot-preconditions.py --status
  python3 -I scripts/signoff-pilot-preconditions.py --selftest
"""

from __future__ import annotations

import argparse
import copy
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRECONDITIONS_PATH = ROOT / "configs/pilot-flow02-preconditions.json"
FORBIDDEN_TOKENS = ("pending", "todo", "tbd", "mock", "fake", "example", "test", "placeholder")
HEX_HASH_RE = re.compile(r"^[0-9a-f]{7,64}$")


def is_valid_human_ident(val: str) -> bool:
    v = val.strip()
    if len(v) < 2:
        return False
    low = v.lower()
    return not any(tok in low for tok in FORBIDDEN_TOKENS)


def apply_signoff_in_memory(
    doc: dict,
    data_owner: str | None = None,
    slot_updates: list[str] | None = None,
    dsh_hashes: str | None = None,
) -> tuple[dict, list[str]]:
    out = copy.deepcopy(doc)
    errs: list[str] = []

    if data_owner is not None:
        if not is_valid_human_ident(data_owner):
            errs.append(f"P3 data_owner 非法或含占位词：{data_owner}")
        else:
            for src in out.get("offline_evidence_manifest", {}).get("sources", []):
                src["owner"] = data_owner.strip()

    for item in slot_updates or []:
        parts = [p.strip() for p in item.split(":")]
        if len(parts) != 3:
            errs.append(f"P4 slot 格式错误（应为 SLOT:PRIMARY:BACKUP）：{item}")
            continue
        slot_id, primary, backup = parts
        if not is_valid_human_ident(primary) or not is_valid_human_ident(backup) or primary == backup:
            errs.append(f"P4 {slot_id} 主责/替补姓名无效或主备相同：{item}")
            continue
        matched = False
        for s in out.get("layer_0_human_owners", {}).get("slots", []):
            if s.get("slot") == slot_id:
                s["primary"] = primary
                s["backup"] = backup
                matched = True
        if not matched:
            errs.append(f"P4 未知槽位：{slot_id}")

    if dsh_hashes is not None:
        parts = [p.strip() for p in dsh_hashes.split(":")]
        if len(parts) != 3 or not all(HEX_HASH_RE.match(p) for p in parts):
            errs.append(f"P6 DSH 构建 hash 格式错误（需 3 段 7-64 位十六进制 hash）：{dsh_hashes}")
        else:
            pin = out.get("target_host_pin", {})
            pin["desktop_hash"], pin["harness_hash"], pin["compiler_hash"] = parts

    return out, errs


def print_status(doc: dict) -> None:
    sources = doc.get("offline_evidence_manifest", {}).get("sources", [])
    p3_owners = sorted({s.get("owner", "PENDING") for s in sources})
    slots = doc.get("layer_0_human_owners", {}).get("slots", [])
    p4_ready = sum(1 for s in slots if is_valid_human_ident(s.get("primary", "")) and is_valid_human_ident(s.get("backup", "")))
    pin = doc.get("target_host_pin", {})
    p6_ready = all(HEX_HASH_RE.match(str(pin.get(k, ""))) for k in ("desktop_hash", "harness_hash", "compiler_hash"))
    print(f"P3 离线证据数据 owner: {p3_owners}")
    print(f"P4 layer_0 真人槽位已签核: {p4_ready}/{len(slots)}")
    print(f"P6 DSH 宿主构建 hash 已冻结: {p6_ready}")


def selftest() -> int:
    doc = json.loads(PRECONDITIONS_PATH.read_text(encoding="utf-8"))
    _, e1 = apply_signoff_in_memory(doc, data_owner="PENDING_USER")
    _, e2 = apply_signoff_in_memory(doc, slot_updates=["MGT-001:Alice:Alice"])
    _, e3 = apply_signoff_in_memory(doc, dsh_hashes="not-a-hash:123:456")
    u4, e4 = apply_signoff_in_memory(
        doc,
        data_owner="lin.chen",
        slot_updates=["MGT-001:zhang.wei:li.na"],
        dsh_hashes="a1b2c3d4:e5f60718:99aabbcc",
    )
    checks = [
        ("reject_placeholder_owner", len(e1) > 0),
        ("reject_same_primary_backup", len(e2) > 0),
        ("reject_invalid_dsh_hash", len(e3) > 0),
        ("accept_valid_in_memory_signoff", len(e4) == 0 and u4["target_host_pin"]["desktop_hash"] == "a1b2c3d4"),
    ]
    bad = [name for name, ok in checks if not ok]
    if bad:
        print(f"FAIL signoff selftest: {bad}", file=sys.stderr)
        return 1
    print(f"SIGNOFF_HELPER_SELFTEST PASS {len(checks)}/{len(checks)}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--status", action="store_true")
    ap.add_argument("--selftest", action="store_true")
    ap.add_argument("--data-owner", help="签核 P3 离线证据包数据 owner")
    ap.add_argument("--slot", action="append", help="签核 P4 槽位：SLOT:PRIMARY:BACKUP")
    ap.add_argument("--dsh-hashes", help="签核 P6 构建 hash：desktop:harness:compiler")
    ap.add_argument("--write", action="store_true", help="显式确认落盘写入 configs/pilot-flow02-preconditions.json")
    args = ap.parse_args()

    if args.selftest:
        return selftest()

    doc = json.loads(PRECONDITIONS_PATH.read_text(encoding="utf-8"))
    if args.status or (not args.data_owner and not args.slot and not args.dsh_hashes):
        print_status(doc)
        return 0

    updated, errs = apply_signoff_in_memory(doc, args.data_owner, args.slot, args.dsh_hashes)
    if errs:
        for e in errs:
            print(f"FAIL  {e}", file=sys.stderr)
        return 1
    if not args.write:
        print("DRYRUN_OK（未加 --write，不修改磁盘文件）")
        print_status(updated)
        return 0

    PRECONDITIONS_PATH.write_text(json.dumps(updated, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("WRITTEN configs/pilot-flow02-preconditions.json")
    print_status(updated)
    return 0


if __name__ == "__main__":
    sys.exit(main())
