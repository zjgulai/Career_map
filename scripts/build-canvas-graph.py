#!/usr/bin/env python3
"""三宝组织索引的数据层：把散落在卡片、决策日志、席位登记表里的结构抽成单一 graph。

只读输入，只写一个生成物。stdlib only：
  python3 -I scripts/build-canvas-graph.py
  python3 -I scripts/build-canvas-graph.py --check     # 生成物过期则 exit 1
  python3 -I scripts/build-canvas-graph.py --report tmp/graph-report.json

设计：抽取函数是纯函数（输入文本/路径，返回 dict），断言函数只接收抽好的数据。
--check 用同一份逻辑重算并逐字节比对，避免出现第二真相源。

部门口径：一级部门取 seat-registry 的 plane（4 个责任平面），二级部门取 source_group。
两者都已在既有登记表中，本脚本不新增组织假设。同一 source_group 出现在多个 plane 时，
按 (plane, group) 拆成独立二级节点，并在 shared_with 中互相指向，保留矩阵关系而不伪造树。
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

CONTEXT_PACK = ROOT / ".codex/context-pack.md"
SEAT_REGISTRY = ROOT / ".codex/pilot/seat-registry.json"
ROSTER = ROOT / ".codex/3plus50-roster.md"
TRACKED_ROSTER = ROOT / "deliverables/strategy/sanbao-3plus50-roster.md"
CROSSWALK = ROOT / "configs/seat-node-crosswalk.json"
CARDS_DIR = ROOT / ".superpowers/brainstorm/38196-1789923100/content"
SNAPSHOT = ROOT / "src/orgmap/sources/source-snapshot.json"
OUTPUT = ROOT / "src/orgmap/data/graph.js"

EXPECTED = {"decisions": 377, "cards": 63, "graph_cards": 33, "nodes": 20, "relations": 126, "seats": 53, "crosswalk_seats": 53, "crosswalk_links": 38}

# 固定 slug，遇到未登记的名称直接失败，逼出新结构先做决定。
LEVEL1_SLUG = {
    "经营管理": "mgmt",
    "业务运营": "ops",
    "独立控制": "control",
    "数据与Agent平台": "platform",
}
LEVEL2_SLUG = {
    "经营与组织": "business-org",
    "产品与创新": "product-innovation",
    "供应与履约": "supply-fulfillment",
    "渠道经营": "channel",
    "品牌与增长": "brand-growth",
    "服务与体验": "service-experience",
    "财务与合规": "finance-compliance",
    "数据与AI运行": "data-ai",
}
GOVERNANCE_PLANE = "决策权平面"

C_RE = re.compile(r"C-\d{3}")
HEADING_RE = re.compile(r"^(#{1,4})[^\n]*?(C-\d{3})([^\n]*)$", re.M)
BOLD_RE = re.compile(r"^\*\*(C-\d{3})([^\n]*)$", re.M)
NODE_DECL_RE = re.compile(r"const\s+nodes\s*=")
REL_DECL_RE = re.compile(r"const\s+relations\s*=")


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def extract_array(text: str, decl: re.Pattern[str]) -> list[dict]:
    """抽出 `const x = [...]` 的 JSON 字面量。卡片里全部是严格 JSON，解析失败即报错。"""
    m = decl.search(text)
    if not m:
        return []
    start = text.index("[", m.end() - 1)
    depth, quote, esc = 0, "", False
    for i in range(start, len(text)):
        ch = text[i]
        if quote:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == quote:
                quote = ""
        elif ch in "\"'":
            quote = ch
        elif ch == "[":
            depth += 1
        elif ch == "]":
            depth -= 1
            if depth == 0:
                return json.loads(text[start : i + 1])
    raise ValueError("unbalanced array literal")


def clean_title(raw: str) -> str:
    title = raw.strip()
    title = re.sub(r"^\*\*\s*", "", title)
    title = re.sub(r"^[·：:—\-–\s]+", "", title)
    title = re.sub(r"^已(定|记录|确认)[^\s·]*\s*", "", title)
    title = re.sub(r"\s*·\s*已确认\s*$", "", title)
    # 脱敏本机绝对路径，防止将 .codex 中的历史本机路径泄漏进已跟踪生成物
    title = re.sub(r"/" + r"Users/[A-Za-z0-9._\-]+/", "<repo>/", title)
    if len(title) > 120:
        title = title[:120].rstrip() + "…"
    return title.strip()


def collect_decisions() -> list[dict]:
    text = read(CONTEXT_PACK)
    seen: dict[str, dict] = {}
    for m in HEADING_RE.finditer(text):
        cid, rest = m.group(2), m.group(3)
        seen.setdefault(cid, {"id": cid, "title": clean_title(rest), "form": "heading",
                              "level": len(m.group(1)), "line": text[: m.start()].count("\n") + 1})
    for m in BOLD_RE.finditer(text):
        cid, rest = m.group(1), m.group(2)
        if cid not in seen:
            seen[cid] = {"id": cid, "title": clean_title(rest), "form": "bold", "level": 0,
                         "line": text[: m.start()].count("\n") + 1}
    return [seen[k] for k in sorted(seen)]


def collect_cards() -> tuple[list[dict], list[dict], list[dict]]:
    cards, nodes, relations = [], {}, {}
    page_layouts: dict[str, dict[str, dict]] = {}
    for path in sorted(CARDS_DIR.glob("*.html")):
        text = read(path)
        title_m = re.search(r"<title>(.*?)</title>", text, re.S)
        page_nodes = extract_array(text, NODE_DECL_RE)
        page_rels = extract_array(text, REL_DECL_RE)
        cards.append({"file": path.name,
                      "title": title_m.group(1).strip() if title_m else "",
                      "node_count": len(page_nodes), "relation_count": len(page_rels)})
        page_layouts[path.name] = {n["id"]: {k: n.get(k) for k in ("x", "y", "w", "h", "row", "col")}
                                   for n in page_nodes if n.get("id")}
        for node in page_nodes:
            nid = node.get("id")
            if not nid:
                continue
            slot = nodes.setdefault(nid, {"id": nid, "title": node.get("title", ""),
                                          "short": node.get("short", ""),
                                          "codes": node.get("codes", ""), "layouts": Counter(),
                                          "pages": []})
            slot["layouts"][json.dumps({k: node.get(k) for k in ("x", "y", "w", "h")},
                                       sort_keys=True, ensure_ascii=False)] += 1
            if path.name not in slot["pages"]:
                slot["pages"].append(path.name)
        for rel in page_rels:
            key = (rel.get("source"), rel.get("target"), rel.get("object"), rel.get("id"))
            slot = relations.setdefault(key, {"id": rel.get("id"), "source": rel.get("source"),
                                              "target": rel.get("target"), "object": rel.get("object"),
                                              "codes": set(), "baseline": False, "feedback": False,
                                              "status": "unspecified"})
            slot["codes"].update(C_RE.findall(rel.get("codes", "") or ""))
            slot["baseline"] = slot["baseline"] or bool(rel.get("baseline"))
            slot["feedback"] = slot["feedback"] or bool(rel.get("feedback"))
    # 坐标只能来自同一页：不同卡片用的是不同版式，跨页合并会让节点重叠。
    canonical = max(page_layouts, key=lambda f: (sum(1 for c in cards if c["file"] == f and c["relation_count"]), len(page_layouts[f])))
    layout_source = page_layouts[canonical]
    missing = sorted(set(nodes) - set(layout_source))
    if missing:
        raise SystemExit(f"规范页 {canonical} 缺少节点 {missing}，需要人工指定坐标来源")
    def kebab(name: str) -> str:
        return re.sub(r"(?<!^)(?=[A-Z])", "-", name).lower()

    merged_nodes = []
    for nid in sorted(nodes):
        slot = nodes[nid]
        layout = layout_source[nid]
        # 主卡优先按文件名匹配（节点 id 与卡片主题同名），其次退回带图页
        named = sorted((c["file"] for c in cards if kebab(nid) in c["file"]), key=len)
        primary = named[0] if named else next((f for f in slot["pages"] if kebab(nid) in f), slot["pages"][0])
        merged_nodes.append({"id": nid, "title": slot["title"], "short": slot["short"],
                             "codes": slot["codes"], **layout,
                             "layout_source": canonical, "primary_page": primary,
                             "pages": sorted(slot["pages"])})
    merged_rels = []
    for key in sorted(relations, key=lambda k: (k[3] or "", k[0] or "", k[1] or "")):
        slot = relations[key]
        slot["codes"] = sorted(slot["codes"])
        merged_rels.append(slot)
    return cards, merged_nodes, merged_rels


def collect_seats() -> dict:
    registry = json.loads(read(SEAT_REGISTRY))
    cw_raw = json.loads(read(CROSSWALK))
    cw_by_seat = {item["seat_id"]: item for item in cw_raw.get("seats", [])}
    seats, governance = [], []
    for s in registry["seats"]:
        plane, group = s.get("plane"), s.get("source_group")
        cw = cw_by_seat.get(s["seat_id"], {})
        row = {"seat_id": s["seat_id"], "alias": s.get("alias", ""), "title": s.get("title", ""),
               "namespace": s.get("namespace", ""), "plane": plane, "source_group": group,
               "tier": s.get("tier", ""), "admission_status": s.get("admission_status", ""),
               "production_authorized": bool(s.get("production_authorized")),
               "runtime_identity_status": bool(s.get("runtime_identity_status")),
               "catalog_ref": s.get("catalog_ref", ""),
               "runtime_layer": s.get("runtime_layer", ""),
               "human_owner_ref": s.get("human_owner_ref", ""),
               "slot_id": cw.get("slot_id", ""), "slot_title": cw.get("slot_title", ""),
               "slot_basis": cw.get("slot_basis", ""), "pilot_role": cw.get("pilot_role"),
               "node_links": cw.get("node_links", [])}
        if plane == GOVERNANCE_PLANE:
            governance.append(row)
        else:
            seats.append(row)
    return {"seats": seats, "governance": governance, "crosswalk": cw_raw,
            "meta": {k: registry.get(k) for k in ("version", "status", "artifact_kind",
                                                   "seat_count", "tier_definitions")}}


def build_departments(seats: list[dict]) -> tuple[list[dict], list[dict]]:
    if any(s["plane"] not in LEVEL1_SLUG for s in seats):
        raise SystemExit(f"未登记的 plane：{sorted({s['plane'] for s in seats})}")
    if any(s["source_group"] not in LEVEL2_SLUG for s in seats):
        raise SystemExit(f"未登记的 source_group：{sorted({s['source_group'] for s in seats})}")
    level1 = []
    for plane, slug in LEVEL1_SLUG.items():
        members = [s for s in seats if s["plane"] == plane]
        level1.append({"id": slug, "name": plane, "seat_count": len(members),
                       "seat_ids": sorted(s["seat_id"] for s in members)})
    cells: dict[str, dict] = {}
    for s in seats:
        cid = f"{LEVEL1_SLUG[s['plane']]}--{LEVEL2_SLUG[s['source_group']]}"
        cell = cells.setdefault(cid, {"id": cid, "name": s["source_group"],
                                      "level1_id": LEVEL1_SLUG[s["plane"]],
                                      "level1_name": s["plane"], "seat_ids": [], "shared_with": []})
        cell["seat_ids"].append(s["seat_id"])
    by_name: dict[str, list[str]] = defaultdict(list)
    for cell in cells.values():
        by_name[cell["name"]].append(cell["id"])
    for cell in cells.values():
        cell["seat_ids"].sort()
        cell["shared_with"] = sorted(x for x in by_name[cell["name"]] if x != cell["id"])
    return sorted(level1, key=lambda x: x["id"]), sorted(cells.values(), key=lambda x: x["id"])


def verify_roster(seats: list[dict], governance: list[dict]) -> list[str]:
    rows = {}
    roster_path = ROSTER if ROSTER.is_file() else TRACKED_ROSTER
    for line in read(roster_path).splitlines():
        m = re.match(r"\|\s*(AGT-\d{3}|MGT-\d{3})\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|", line)
        if m:
            rows[m.group(1)] = (m.group(2), m.group(3))
    problems = []
    for seat in seats + governance:
        want = rows.get(seat["seat_id"])
        if not want:
            problems.append(f"名册缺 {seat['seat_id']}")
        elif want != (seat["alias"], seat["title"]):
            problems.append(f"{seat['seat_id']} 名册={want} registry=({seat['alias']}, {seat['title']})")
    return problems


def fingerprint(paths: list[Path]) -> str:
    h = hashlib.sha256()
    for p in paths:
        h.update(p.name.encode())
        h.update(p.read_bytes())
    return h.hexdigest()[:16]


def has_local_raw_sources() -> bool:
    return CONTEXT_PACK.is_file() and SEAT_REGISTRY.is_file() and CARDS_DIR.is_dir()


def load_or_sync_sources(write_snapshot: bool) -> tuple[list[dict], list[dict], list[dict], list[dict], dict, str]:
    if has_local_raw_sources():
        decisions = collect_decisions()
        cards, nodes, relations = collect_cards()
        registry = json.loads(read(SEAT_REGISTRY))
        raw_fp = fingerprint([CONTEXT_PACK, SEAT_REGISTRY, ROSTER if ROSTER.is_file() else TRACKED_ROSTER] +
                             sorted(CARDS_DIR.glob("*.html")))
        snap = {
            "schema_version": 1,
            "raw_fingerprint": raw_fp,
            "decisions": decisions,
            "cards": cards,
            "nodes": nodes,
            "relations": relations,
            "seat_registry": registry,
        }
        if write_snapshot:
            SNAPSHOT.parent.mkdir(parents=True, exist_ok=True)
            SNAPSHOT.write_text(json.dumps(snap, ensure_ascii=False, indent=1) + chr(10), encoding="utf-8")
    elif SNAPSHOT.is_file():
        snap = json.loads(read(SNAPSHOT))
        decisions = snap["decisions"]
        cards = snap["cards"]
        nodes = snap["nodes"]
        relations = snap["relations"]
        registry = snap["seat_registry"]
        raw_fp = snap["raw_fingerprint"]
    else:
        raise SystemExit("缺少本地源（.codex/.superpowers）且无 src/orgmap/sources/source-snapshot.json")

    cw_raw = json.loads(read(CROSSWALK))
    cw_by_seat = {item["seat_id"]: item for item in cw_raw.get("seats", [])}
    seats, governance = [], []
    for s in registry["seats"]:
        plane, group = s.get("plane"), s.get("source_group")
        cw = cw_by_seat.get(s["seat_id"], {})
        row = {"seat_id": s["seat_id"], "alias": s.get("alias", ""), "title": s.get("title", ""),
               "namespace": s.get("namespace", ""), "plane": plane, "source_group": group,
               "tier": s.get("tier", ""), "admission_status": s.get("admission_status", ""),
               "production_authorized": bool(s.get("production_authorized")),
               "runtime_identity_status": bool(s.get("runtime_identity_status")),
               "catalog_ref": s.get("catalog_ref", ""),
               "runtime_layer": s.get("runtime_layer", ""),
               "human_owner_ref": s.get("human_owner_ref", ""),
               "slot_id": cw.get("slot_id", ""), "slot_title": cw.get("slot_title", ""),
               "slot_basis": cw.get("slot_basis", ""), "pilot_role": cw.get("pilot_role"),
               "node_links": cw.get("node_links", [])}
        if plane == GOVERNANCE_PLANE:
            governance.append(row)
        else:
            seats.append(row)
    seat_data = {"seats": seats, "governance": governance, "crosswalk": cw_raw,
                 "meta": {k: registry.get(k) for k in ("version", "status", "artifact_kind",
                                                        "seat_count", "tier_definitions")}}
    h = hashlib.sha256()
    h.update(raw_fp.encode())
    h.update(CROSSWALK.read_bytes())
    return decisions, cards, nodes, relations, seat_data, h.hexdigest()[:16]


def build(write_snapshot: bool = False) -> dict:
    decisions, cards, nodes, relations, seat_data, graph_ver = load_or_sync_sources(write_snapshot)
    level1, level2 = build_departments(seat_data["seats"])
    node_ids = {n["id"] for n in nodes}
    decision_ids = {d["id"] for d in decisions}
    problems = []
    resolved, unresolved = [], []
    for r in relations:
        missing = [r[k] for k in ("source", "target") if r[k] not in node_ids]
        if missing:
            unresolved.append({**r, "reason": "未声明的端点：" + ", ".join(missing)})
        else:
            resolved.append(r)
    problems += [f"关系 {r['id']} 依据无法解析：{c}" for r in resolved + unresolved
                 for c in r["codes"] if c not in decision_ids]
    problems += verify_roster(seat_data["seats"], seat_data["governance"])
    all_seats = seat_data["seats"] + seat_data["governance"]
    cw_seats = seat_data["crosswalk"].get("seats", [])
    seat_ids = {s["seat_id"] for s in all_seats}
    if {c["seat_id"] for c in cw_seats} != seat_ids:
        problems.append("crosswalk 席位集合与 seat-registry 不一致")
    node_seat_links: dict[str, list[dict]] = {n["id"]: [] for n in nodes}
    total_cw_links = 0
    for s in all_seats:
        if not s.get("slot_id") or s.get("slot_basis") not in decision_ids:
            problems.append(f"席位 {s['seat_id']} 缺少有效 slot_id 或 slot_basis：{s.get('slot_basis')}")
        for lk in s.get("node_links", []):
            total_cw_links += 1
            nid = lk.get("node_id")
            if nid not in node_ids:
                problems.append(f"crosswalk {s['seat_id']} 指向未知节点 {nid}")
                continue
            for bc in lk.get("basis", []):
                if bc not in decision_ids:
                    problems.append(f"crosswalk {s['seat_id']}->{nid} 依据无法解析：{bc}")
            node_seat_links[nid].append({
                "seat_id": s["seat_id"], "alias": s["alias"], "title": s["title"],
                "plane": s["plane"], "source_group": s["source_group"],
                "slot_id": s["slot_id"], "slot_title": s["slot_title"],
                "relation": lk.get("relation", ""), "basis": lk.get("basis", []),
                "note": lk.get("note", ""),
            })
    for n in nodes:
        n["seat_links"] = node_seat_links.get(n["id"], [])
    counts = {"decisions": len(decisions), "cards": len(cards),
              "graph_cards": sum(1 for c in cards if c["node_count"] or c["relation_count"]),
              "nodes": len(nodes), "relations": len(resolved),
              "unresolved_relations": len(unresolved),
              "seats": len(all_seats),
              "crosswalk_seats": len(cw_seats),
              "crosswalk_links": total_cw_links}
    for key, want in EXPECTED.items():
        got = counts["relations"] + counts["unresolved_relations"] if key == "relations" else counts[key]
        if got != want:
            problems.append(f"{key} 期望 {want}，实际 {got}（数据变了就先复核，不要静默改口径）")
    if sorted(s["seat_id"] for s in seat_data["seats"]) and \
       sum(d["seat_count"] for d in level1) != len(seat_data["seats"]):
        problems.append("一级部门席位总数与登记表不一致")
    if problems:
        raise SystemExit("构建失败：\n  - " + "\n  - ".join(problems))
    return {
        "schema_version": 1,
        "graph_version": graph_ver,
        "status": "draft_pending_owner_signoff",
        "counts": counts,
        "org": {"level1": level1, "level2": level2,
                "seats": seat_data["seats"], "governance": seat_data["governance"],
                "pilot_lens": seat_data["crosswalk"].get("pilot_lens"),
                "registry_meta": seat_data["meta"]},
        "network": {"nodes": nodes, "relations": resolved,
                    "unresolved_relations": unresolved},
        "decisions": decisions,
        "cards": cards,
        "notes": [
            "部门来自 seat-registry 的 plane / source_group，不是新设组织。",
            "3 个 MGT 是决策权参照，不是部门、不是 agent session。",
            "relations 无 status 字段；候选/已确认在关系层不可表达，统一标 unspecified。",
            "53 席是 addressable seats，不是并发进程；production_authorized 全为 false。",
            "席位↔节点映射来自 configs/seat-node-crosswalk.json（依据 C-300..C-310），映射≠任命。",
        ],
    }


def render(data: dict) -> str:
    body = json.dumps(data, ensure_ascii=False, indent=1, sort_keys=False)
    return ("// 由 scripts/build-canvas-graph.py 生成，不要手改。\n"
            "// 重新生成：python3 -I scripts/build-canvas-graph.py\n"
            f"window.SANBAO_GRAPH = {body};\n")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--report")
    ap.add_argument("--stdout", action="store_true")
    args = ap.parse_args()
    data = build(write_snapshot=not args.check and not args.stdout)
    rendered = render(data)
    if args.stdout:
        sys.stdout.write(rendered)
        return 0
    if args.check:
        current = OUTPUT.read_text(encoding="utf-8") if OUTPUT.exists() else ""
        if current != rendered:
            print("graph.js 已过期：重新运行 python3 -I scripts/build-canvas-graph.py", file=sys.stderr)
            return 1
        print(f"graph.js 最新（{data['graph_version']}）")
        return 0
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(rendered, encoding="utf-8")
    if args.report:
        Path(args.report).parent.mkdir(parents=True, exist_ok=True)
        Path(args.report).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    c = data["counts"]
    print(f"OK {c['decisions']} 决策 / {c['cards']} 卡（{c['graph_cards']} 带图）/ "
          f"{c['nodes']} 节点 / {c['relations']} 关系（+{c['unresolved_relations']} 未解析）/ "
          f"{c['seats']} 席 -> {OUTPUT.relative_to(ROOT)}")
    print(f"   一级部门 {len(data['org']['level1'])}，二级部门 {len(data['org']['level2'])}，"
          f"治理参照 {len(data['org']['governance'])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
