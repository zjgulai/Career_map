#!/usr/bin/env python3
"""三宝组织索引的数据层：把散落在卡片、决策日志、席位登记表与四维数字员工档案里的结构抽成单一 graph。

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
import subprocess
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SIBLING_AIORG = ROOT.parent / "AI组织变革"
SIBLING_SAGE = ROOT.parent / "Sage"

CONTEXT_PACK = ROOT / ".codex/context-pack.md"
SEAT_REGISTRY = ROOT / ".codex/pilot/seat-registry.json"
ROSTER = ROOT / ".codex/3plus50-roster.md"
TRACKED_ROSTER = ROOT / "deliverables/strategy/sanbao-3plus50-roster.md"
CROSSWALK = ROOT / "configs/seat-node-crosswalk.json"
PRECONDITIONS = ROOT / "configs/pilot-flow02-preconditions.json"
STAGE_CONTRACTS = ROOT / "configs/flow02-stage-contracts.json"
SKILL_CONTRACTS = ROOT / "configs/pilot-4seat-skill-contracts.json"
GOVERNANCE_MECHS = ROOT / "configs/pilot-governance-mechanisms.json"
CARDS_DIR = ROOT / ".superpowers/brainstorm/38196-1789923100/content"
SNAPSHOT = ROOT / "src/orgmap/sources/source-snapshot.json"
AVATARS_DIR = ROOT / "src/orgmap/assets/avatars"
OUTPUT = ROOT / "src/orgmap/data/graph.js"

AIORG_ROLE_CATALOG = SIBLING_AIORG / "docs/05-agents/role-catalog.json"
AIORG_MGT_CATALOG = SIBLING_AIORG / "docs/04-organization/management/management-catalog.json"
SAGE_SKILL_MAP = SIBLING_SAGE / "scripts/role-presets/skill-map.json"

EXPECTED = {
    "decisions": 377,
    "cards": 63,
    "graph_cards": 33,
    "nodes": 20,
    "relations": 126,
    "seats": 53,
    "crosswalk_seats": 53,
    "crosswalk_links": 38,
    "dossiers": 53,
}

# CR-AO-001 A 方案 9 席职责增补（仅作为只读请求叠加展示，不改源 catalog 正文）
CR_AO_001_OVERLAYS = {
    "AGT-041": {"gap": "汇率与外汇", "added_duty": "按已批准口径输出《汇率敞口清单与敏感性测算》；汇率损益和对冲效果不属本岗位责任"},
    "AGT-019": {"gap": "贸易合规", "added_duty": "输出《清关单证与风险预检表》；是否放行由海关与报关行决定，不属本岗位责任"},
    "AGT-044": {"gap": "认证项目管理", "added_duty": "输出《合规证据矩阵》；证书真实性与准入结论由签发机构/监管/海关认定"},
    "AGT-014": {"gap": "供应商风险", "added_duty": "维护《关键物料供应风险档案》；断供是否发生及损失由供应商与市场决定"},
    "AGT-018": {"gap": "召回决策", "added_duty": "输出《批次隔离与召回证据包》；是否召回由 L4 真人所有者决定"},
    "AGT-020": {"gap": "召回物流", "added_duty": "核对《履约与退货回执差异表》；实际出库退款由仓库与系统执行"},
    "AGT-027": {"gap": "账号矩阵", "added_duty": "输出《账号风险信号与证据包》；是否封禁与封禁范围由平台决定"},
    "AGT-043": {"gap": "IP 攻防", "added_duty": "输出《IP 风险与应对建议》；诉讼胜负与禁令由法院与外部律师决定"},
    "MGT-003": {"gap": "企业风险/保险/BCP", "added_duty": "维护《企业级风险与约束台账》；风险组合取舍由 MGT-001/真人所有者决定"},
}

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


def sanitize_text(s: str) -> str:
    return re.sub(r"/" + r"Users/[A-Za-z0-9._\-]+/", "<repo>/", s)


def extract_array(text: str, decl: re.Pattern[str]) -> list[dict]:
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
    title = sanitize_text(title)
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


def _parse_md_h2(text: str) -> dict[str, str]:
    secs: dict[str, list[str]] = {}
    cur = None
    for line in text.splitlines():
        if line.startswith("## "):
            cur = line[3:].strip()
            secs[cur] = []
        elif cur is not None:
            secs[cur].append(line)
    return {k: "\n".join(v).strip() for k, v in secs.items()}


def _extract_soul(sid: str, is_mgt: bool) -> dict:
    rel_path = f"docs/04-organization/management/souls/{sid}.soul.md" if is_mgt else f"docs/05-agents/roles/souls/{sid}.soul.md"
    p = SIBLING_AIORG / rel_path
    raw = read(p)
    sha = hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]
    secs = _parse_md_h2(raw)
    principles = []
    for k, v in secs.items():
        if "原则" in k:
            m = re.search(r"\*\*(.+?)\*\*", v)
            quote = m.group(1).strip() if m else v.splitlines()[0].strip("* ")
            bullets = []
            for ln in v.splitlines():
                s = ln.strip()
                if s.startswith(("- ", "* ")):
                    bullets.append(sanitize_text(re.sub(r"^[-*]\s+", "", s)))
            principles.append({"label": k, "quote": sanitize_text(quote), "manifestations": bullets})
    never_do = []
    for ln in secs.get("我绝不做什么", "").splitlines():
        s = ln.strip()
        if s.startswith(("- ", "* ")):
            never_do.append(sanitize_text(re.sub(r"^[-*]\s+", "", s)))
    stance = sanitize_text(" ".join(ln.strip() for ln in secs.get("我的协作姿态", "").splitlines() if ln.strip()))
    stop_signal = sanitize_text(" ".join(ln.strip() for ln in secs.get("我的停止信号", "").splitlines() if ln.strip()))
    who = sanitize_text(" ".join(ln.strip() for ln in secs.get("我是谁", "").splitlines() if ln.strip()))
    return {
        "who": who,
        "principles": principles,
        "never_do": never_do,
        "stance": stance,
        "stop_signal": stop_signal,
        "soul_ref": rel_path,
        "soul_sha256": sha,
    }


def _extract_playbook(sid: str, is_mgt: bool) -> dict:
    rel_path = f"docs/04-organization/management/playbooks/{sid}.md" if is_mgt else f"docs/06-playbooks/role-playbooks/{sid}.md"
    p = SIBLING_AIORG / rel_path
    raw = read(p)
    sha = hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]
    secs = _parse_md_h2(raw)
    pb_sec = secs.get("4. 独立执行 Playbook", "")
    steps = []
    for ln in pb_sec.splitlines():
        m = re.match(r"^(\d+)\.\s*\*\*(.+?)\*\*[：:]\s*(.+)$", ln.strip())
        if m:
            steps.append({
                "step": int(m.group(1)),
                "title": sanitize_text(m.group(2).strip()),
                "detail": sanitize_text(m.group(3).strip()),
            })
    return {"playbook_ref": rel_path, "playbook_sha256": sha, "steps": steps}


def collect_dossiers() -> dict[str, dict]:
    """从 AI组织变革 与 Sage skill-map 抽取 53 席完整四维档案（构建期写入 source-snapshot，清洁克隆免外部仓）。"""
    rc_raw = json.loads(read(AIORG_ROLE_CATALOG))["roles"]
    mc_raw = json.loads(read(AIORG_MGT_CATALOG))["roles"]
    sm_raw = json.loads(read(SAGE_SKILL_MAP))["skills"]
    rc_by_id = {r["id"]: r for r in rc_raw}
    mc_by_id = {r["id"]: r for r in mc_raw}

    dossiers: dict[str, dict] = {}
    for sid in sorted(list(rc_by_id.keys()) + list(mc_by_id.keys())):
        is_mgt = sid.startswith("MGT-")
        cat = mc_by_id[sid] if is_mgt else rc_by_id[sid]
        soul = _extract_soul(sid, is_mgt)
        pb = _extract_playbook(sid, is_mgt)
        personality_tags = [x.strip() for x in re.split(r"[、，,/]", cat.get("personality", "")) if x.strip()]
        raw_metrics = cat.get("metrics", [])
        if isinstance(raw_metrics, str):
            metrics = [x.strip() for x in re.split(r"[、，；;]", raw_metrics) if x.strip()]
        else:
            metrics = list(raw_metrics)

        skills_list = []
        for idx, sk_name in enumerate(cat.get("skills", []), 1):
            sm_entry = sm_raw.get(sk_name, {"kind": "gap", "supply": []})
            skills_list.append({
                "skill_id": f"SKILL-{sid}-{idx:02d}",
                "name": sk_name,
                "kind": sm_entry.get("kind", "gap"),
                "supply": list(sm_entry.get("supply", [])),
                "note": sanitize_text(sm_entry.get("note", "")) if sm_entry.get("note") else "",
            })

        avatar_info = (
            {
                "kind": "plaque",
                "mgt_visual": "T4_bronze_plaque",
                "note": "T4 决策权规则包 · 非 Agent 席位 · 不套人形头像",
            }
            if is_mgt
            else {
                "kind": "portrait",
                "light_64": f"./assets/avatars/light/64/{sid}.webp",
                "light_256": f"./assets/avatars/light/256/{sid}.webp",
                "dark_64": f"./assets/avatars/dark/64/{sid}.webp",
                "dark_256": f"./assets/avatars/dark/256/{sid}.webp",
            }
        )

        dossiers[sid] = {
            "seat_id": sid,
            "role_kind": "MGT" if is_mgt else "AGT",
            "avatar": avatar_info,
            "soul": {
                "personality": cat.get("personality", ""),
                "personality_tags": personality_tags,
                "who": soul["who"],
                "principles": soul["principles"],
                "stance": soul["stance"],
                "stop_signal": soul["stop_signal"],
                "soul_ref": soul["soul_ref"],
                "soul_sha256": soul["soul_sha256"],
            },
            "duty": {
                "mission": sanitize_text(cat.get("mission", "")),
                "artifact": sanitize_text(cat.get("artifact", "")),
                "metrics": metrics,
                "playbook_ref": pb["playbook_ref"],
                "playbook_sha256": pb["playbook_sha256"],
                "playbook_steps": pb["steps"],
                "cr_ao_001_overlay": CR_AO_001_OVERLAYS.get(sid),
                "management_domain": cat.get("management_domain") if is_mgt else None,
                "owned_role_count": cat.get("owned_role_count") if is_mgt else None,
            },
            "skills": skills_list,
            "collaboration": {
                "collaborates_with": list(cat.get("collaborates_with", [])),
                "flows": list(cat.get("flows", [])),
                "scenarios": list(cat.get("scenarios", [])),
                "shared_playbooks": list(cat.get("playbooks", [])),
                "boundary": sanitize_text(cat.get("boundary", "")),
                "never_do": soul["never_do"],
                "decision_rights": list(cat.get("decision_rights", [])) if is_mgt else [],
                "decision_rights_not_granted": list(cat.get("decision_rights_explicitly_not_granted", [])) if is_mgt else [],
                "domain_tension": cat.get("domain_tension", "") if is_mgt else "",
                "standalone_mode": (
                    "standalone_management_preset · 按管理节拍运行 · 只读聚合视图"
                    if is_mgt
                    else "standalone_role_preset · 独立工单入口 · 交付指定验收者"
                ),
                "team_mode": (
                    "受控接口 · 不作为任何 Case 的 Lead/Worker · 零岗位会话边"
                    if is_mgt
                    else "bounded_role_worker · 外部 Case Control 编排 · ArtifactEnvelope 交接 · 禁自由聊天"
                ),
                "handoff_envelope": (
                    ["管理周期", "约束版本", "引用聚合指标", "放弃项与代价", "资源配额变更", "L2b 移交记录"]
                    if is_mgt
                    else ["来源 Case", "阶段 ID", "产物类型", "schema 版本", "内容 Hash", "业务范围", "验收状态"]
                ),
                "visible_tool_classes": (
                    ["read_only_aggregate_view"]
                    if is_mgt
                    else ["fact_read", "deterministic_validate", "presentation", "action_intent_request", "receipt_query"]
                ),
                "credentials_policy": "never_visible_to_model (host_managed)",
            },
        }
    return dossiers


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


def verify_avatars(seats: list[dict]) -> list[str]:
    problems = []
    for s in seats:
        sid = s["seat_id"]
        for th in ("light", "dark"):
            for sz in ("64", "256"):
                p = AVATARS_DIR / th / sz / f"{sid}.webp"
                if not p.is_file() or p.stat().st_size == 0:
                    problems.append(f"缺少数字员工头像资产：{p.relative_to(ROOT)}")
    return problems


def fingerprint(paths: list[Path]) -> str:
    h = hashlib.sha256()
    for p in paths:
        h.update(p.name.encode())
        h.update(p.read_bytes())
    return h.hexdigest()[:16]


def has_local_raw_sources() -> bool:
    return CONTEXT_PACK.is_file() and SEAT_REGISTRY.is_file() and CARDS_DIR.is_dir()


def has_sibling_dossier_sources() -> bool:
    return AIORG_ROLE_CATALOG.is_file() and AIORG_MGT_CATALOG.is_file() and SAGE_SKILL_MAP.is_file()


def load_or_sync_sources(write_snapshot: bool) -> tuple[list[dict], list[dict], list[dict], list[dict], dict, str]:
    existing_snap = json.loads(read(SNAPSHOT)) if SNAPSHOT.is_file() else {}
    if has_local_raw_sources():
        decisions = collect_decisions()
        cards, nodes, relations = collect_cards()
        registry = json.loads(read(SEAT_REGISTRY))
        dossiers = collect_dossiers() if has_sibling_dossier_sources() else existing_snap.get("dossiers", {})
        raw_fp_paths = ([CONTEXT_PACK, SEAT_REGISTRY, ROSTER if ROSTER.is_file() else TRACKED_ROSTER] +
                        sorted(CARDS_DIR.glob("*.html")))
        raw_fp = fingerprint(raw_fp_paths)
        snap = {
            "schema_version": 2,
            "raw_fingerprint": raw_fp,
            "decisions": decisions,
            "cards": cards,
            "nodes": nodes,
            "relations": relations,
            "seat_registry": registry,
            "dossiers": dossiers,
        }
        if write_snapshot:
            SNAPSHOT.parent.mkdir(parents=True, exist_ok=True)
            SNAPSHOT.write_text(json.dumps(snap, ensure_ascii=False, indent=1) + chr(10), encoding="utf-8")
    elif SNAPSHOT.is_file():
        snap = existing_snap
        decisions = snap["decisions"]
        cards = snap["cards"]
        nodes = snap["nodes"]
        relations = snap["relations"]
        registry = snap["seat_registry"]
        dossiers = snap.get("dossiers", {})
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
               "node_links": cw.get("node_links", []),
               "dossier": dossiers.get(s["seat_id"])}
        if plane == GOVERNANCE_PLANE:
            governance.append(row)
        else:
            seats.append(row)
    seat_data = {"seats": seats, "governance": governance, "crosswalk": cw_raw,
                 "dossiers_count": len(dossiers),
                 "meta": {k: registry.get(k) for k in ("version", "status", "artifact_kind",
                                                        "seat_count", "tier_definitions")}}
    h = hashlib.sha256()
    h.update(raw_fp.encode())
    h.update(json.dumps(dossiers, sort_keys=True, ensure_ascii=False).encode("utf-8"))
    h.update(CROSSWALK.read_bytes())
    for cfg in (PRECONDITIONS, STAGE_CONTRACTS, SKILL_CONTRACTS, GOVERNANCE_MECHS):
        if cfg.is_file():
            h.update(cfg.read_bytes())
    return decisions, cards, nodes, relations, seat_data, h.hexdigest()[:16]


def collect_policy_and_skills() -> dict:
    script = ROOT / "scripts/check-readonly-policy-gate.py"
    if not script.is_file() or not SKILL_CONTRACTS.is_file():
        return {}
    res = subprocess.run([sys.executable, "-I", str(script), "--json"],
                         cwd=ROOT, capture_output=True, text=True, check=True)
    return json.loads(res.stdout)


def collect_pilot_dryrun() -> dict:
    script = ROOT / "scripts/run-flow02-dryrun.py"
    if not script.is_file() or not STAGE_CONTRACTS.is_file():
        return {}
    res = subprocess.run([sys.executable, "-I", str(script), "--json"],
                         cwd=ROOT, capture_output=True, text=True, check=True)
    return json.loads(res.stdout)


def collect_pilot_preconditions() -> dict:
    script = ROOT / "scripts/check-pilot-preconditions.py"
    if not script.is_file() or not PRECONDITIONS.is_file():
        return {}
    res = subprocess.run([sys.executable, "-I", str(script), "--json"],
                         cwd=ROOT, capture_output=True, text=True, check=True)
    return json.loads(res.stdout)


def collect_governance_mechanisms() -> dict:
    script = ROOT / "scripts/check-governance-mechanisms.py"
    if not script.is_file() or not GOVERNANCE_MECHS.is_file():
        return {}
    res = subprocess.run([sys.executable, "-I", str(script), "--json"],
                         cwd=ROOT, capture_output=True, text=True, check=True)
    return json.loads(res.stdout)


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
    problems += verify_avatars(seat_data["seats"])
    all_seats = seat_data["seats"] + seat_data["governance"]
    cw_seats = seat_data["crosswalk"].get("seats", [])
    seat_ids = {s["seat_id"] for s in all_seats}
    if {c["seat_id"] for c in cw_seats} != seat_ids:
        problems.append("crosswalk 席位集合与 seat-registry 不一致")
    node_seat_links: dict[str, list[dict]] = {n["id"]: [] for n in nodes}
    total_cw_links = 0
    for s in all_seats:
        if not s.get("dossier"):
            problems.append(f"席位 {s['seat_id']} 缺少四维数字员工档案 dossier")
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
    chain_lenses = seat_data["crosswalk"].get("chain_lenses", [])
    policy_skills = collect_policy_and_skills()
    gov_mechs = collect_governance_mechanisms()
    skills_by_seat: dict[str, list[dict]] = {}
    for sk in policy_skills.get("skills", []):
        skills_by_seat.setdefault(sk["seat_id"], []).append(sk)

    seat_chains: dict[str, list[str]] = {}
    node_chains: dict[str, list[str]] = {}
    for cl in chain_lenses:
        cid = cl["id"]
        for sid in cl.get("core_seats", []) + cl.get("support_seats", []):
            if cid not in seat_chains.setdefault(sid, []):
                seat_chains[sid].append(cid)
        for nid in cl.get("target_nodes", []):
            if cid not in node_chains.setdefault(nid, []):
                node_chains[nid].append(cid)

    for s_row in seat_data["seats"]:
        s_row["chains"] = seat_chains.get(s_row["seat_id"], [])
        s_row["skill_contracts"] = skills_by_seat.get(s_row["seat_id"], [])

    for n in nodes:
        n["seat_links"] = node_seat_links.get(n["id"], [])
        n["chains"] = node_chains.get(n["id"], [])
    counts = {"decisions": len(decisions), "cards": len(cards),
              "graph_cards": sum(1 for c in cards if c["node_count"] or c["relation_count"]),
              "nodes": len(nodes), "relations": len(resolved),
              "unresolved_relations": len(unresolved),
              "seats": len(all_seats),
              "crosswalk_seats": len(cw_seats),
              "crosswalk_links": total_cw_links,
              "dossiers": seat_data["dossiers_count"]}
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
        "schema_version": 2,
        "graph_version": graph_ver,
        "status": "draft_pending_owner_signoff",
        "counts": counts,
        "org": {"level1": level1, "level2": level2,
                "seats": seat_data["seats"], "governance": seat_data["governance"],
                "pilot_lens": {
                    **(seat_data["crosswalk"].get("pilot_lens") or {}),
                    "preconditions": collect_pilot_preconditions(),
                    "dryrun": collect_pilot_dryrun(),
                    "policy_gate": {
                        "negative_tests_passed": policy_skills.get("negative_tests_passed", 0),
                        "skill_contracts_count": policy_skills.get("skill_contracts_count", 0),
                    },
                    "governance_mechanisms": gov_mechs,
                },
                "chain_lenses": chain_lenses,
                "registry_meta": seat_data["meta"]},
        "network": {"nodes": nodes, "relations": resolved,
                    "unresolved_relations": unresolved},
        "decisions": decisions,
        "cards": cards,
        "notes": [
            "部门来自 seat-registry 的 plane / source_group，不是新设组织。",
            "3 个 MGT 是决策权参照，不是部门、不是 agent session、不套人形头像。",
            "relations 无 status 字段；候选/已确认在关系层不可表达，统一标 unspecified。",
            "53 席是 addressable seats，不是并发进程；production_authorized 全为 false。",
            "席位↔节点映射来自 configs/seat-node-crosswalk.json（依据 C-300..C-310），映射≠任命。",
            "50 AGT 头像来自 WorldPilot Collection 06 数字员工资产包（light/dark 64 & 256 WebP）；四维档案来自 AI组织变革 与 Sanbao skill-map。",
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
          f"{c['seats']} 席（{c['dossiers']} 四维档案）-> {OUTPUT.relative_to(ROOT)}")
    print(f"   一级部门 {len(data['org']['level1'])}，二级部门 {len(data['org']['level2'])}，"
          f"治理参照 {len(data['org']['governance'])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
