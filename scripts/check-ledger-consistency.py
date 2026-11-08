#!/usr/bin/env python3
"""台账一致性检查：找出「文档之间互相矛盾」和「文档与磁盘不符」的地方。

只读。stdlib only，无第三方依赖：python3 -I scripts/check-ledger-consistency.py

  python3 -I scripts/check-ledger-consistency.py            # 检查仓库
  python3 -I scripts/check-ledger-consistency.py --selftest  # 负向自检

设计：每个 check_* 是纯函数，接收已经抽好的数据、返回失败信息列表；
collect_* 负责从仓库取数。这样 --selftest 可以把坏数据直接喂给 check_*，
不需要伪造整个仓库。
"""

from __future__ import annotations

import argparse
import filecmp
import re
import subprocess
import sys
import tempfile
from pathlib import Path

DATE_RE = re.compile(r"\d{4}-\d{2}-\d{2}")
C_RE = re.compile(r"C-\d{3}")
ABS_PATH_RE = re.compile(r"/Users/[A-Za-z0-9._\-/]+")
HEADER_DATE_RES = (
    re.compile(r"^更新[：:]\s*(\d{4}-\d{2}-\d{2})", re.M),
    re.compile(r"^版本[：:]\s*(\d{4}-\d{2}-\d{2})", re.M),
    re.compile(r"^updated:\s*(\d{4}-\d{2}-\d{2})", re.M),
)

# 头部日期必须不早于文内最大日期的文档。
HEADER_DATE_FILES = (
    ".codex/context-pack.md",
    ".codex/sanbao-canvas-complete-plan.md",
    ".codex/canvas-playbook.md",
    ".codex/sanbao-memory-graph-design.md",
    ".codex/sanbao-weekly-retro-2026-11-02.md",
    "playbook.md",
    "deliverables/canvas/sanbao-canvas-playbook.md",
    "src/orgmap/README.md",
)

# 期望逐字节相同的 canonical -> 交付副本。
DELIVERABLE_PAIRS = (
    (".superpowers/brainstorm/38196-1789923100/content/sanbao-identity-boundaries.html",
     "deliverables/canvas/sanbao-identity-boundaries.html"),
    ("docs/index.html", "deliverables/canvas/sanbao-public-map.html"),
    (".codex/canvas-playbook.md", "deliverables/canvas/sanbao-canvas-playbook.md"),
    (".codex/sanbao-canvas-complete-plan.md", "deliverables/strategy/sanbao-canvas-complete-plan.md"),
    (".codex/3plus50-roster.md", "deliverables/strategy/sanbao-3plus50-roster.md"),
    (".codex/sources.md", "deliverables/research/sanbao-sources.md"),
    (".codex/ticket-batch-2026-10-09.md", "deliverables/execution/sanbao-ticket-batch-2026-10-09.md"),
)

# 检查绝对路径存在性的台账文档（不含 skill-library 的 1.2 万条历史归档）。
ABS_PATH_FILES = (
    "README.md",
    "playbook.md",
    "HANDOFF.md",
    "deliverables/README.md",
    "deliverables/SANBAO-RESULTS.md",
    "src/orgmap/README.md",
    "src/orgmap/data/graph.js",
    "src/orgmap/sources/source-snapshot.json",
    "configs/pilot-flow02-preconditions.json",
    "configs/flow02-stage-contracts.json",
    "CONTEXT.md",
    ".codex/context-pack.md",
    ".codex/product-responsibility-research.md",
    ".codex/sources.md",
    "deliverables/research/sanbao-sources.md",
    "deliverables/canvas/sanbao-identity-boundaries.html",
    ".superpowers/brainstorm/38196-1789923100/content/sanbao-identity-boundaries.html",
)

# 记录历史扫描主机的文档：里面的绝对路径是历史事实，不要求在本机存在。
# 加进这里的前提是该文档已经带「历史主机」注记，否则就是漏注记。
HISTORICAL_PATH_FILES = (
    "skill-library/PLAN_AND_TODO.md",
    "skill-library/SCAN_REPORT.md",
    "skill-library/CLUSTER_REPORT.md",
    "skill-library/SANBAO_REVIEW_REPORT.md",
    "skill-library/CAPABILITY_BID_REPORT.md",
    "skill-library/ENRICHMENT_REPORT.md",
    "skill-library/CODEX_RUNTIME_SYNC_REPORT.md",
    "skill-library/SKILL_ARCHIVE_RECONCILIATION.md",
)

HISTORICAL_MARKER = "历史主机"

C_CEILING_SOURCE = "deliverables/SANBAO-RESULTS.md"
C_CEILING_RE = re.compile(r"当前\s*(C-\d{3})\s*叶页")
C_CEILING_ACTUAL = ".codex/context-pack.md"
TICKET_BATCH = ".codex/ticket-batch-2026-10-09.md"
TICKET_ROW_RE = re.compile(r"^\|\s*(T-\d{2})\s*\|\s*(.+?)\s*\|", re.M)
PENDING_MARKERS = ("待", "未完成", "RETURN")

TOP_LEVEL_SOURCE_DIRS = (".codex/", ".superpowers/", "skill-library/", "deliverables/",
                         "docs/", "scripts/", "assets/", "drafts/", "tmp/", "configs/",
                         "sql/", "src/", "tests/")


# ----------------------------------------------------------------- pure checks

def check_c_ceiling(declared: str | None, actual: str | None) -> list[str]:
    if declared is None:
        return [f"{C_CEILING_SOURCE}: 找不到「当前 C-### 叶页」声明"]
    if actual is None:
        return [f"{C_CEILING_ACTUAL}: 找不到任何 C-### 编号"]
    if declared != actual:
        return [f"C 编号上限不一致：{C_CEILING_SOURCE} 声明 {declared}，"
                f"{C_CEILING_ACTUAL} 实际最高 {actual}"]
    return []


def check_header_date(name: str, header: str | None, body_max: str | None) -> list[str]:
    if header is None:
        return [f"{name}: 有日期头要求但没找到（更新/版本/updated）"]
    if body_max is None:
        return []
    if header < body_max:
        return [f"{name}: 头部日期 {header} 早于文内最大日期 {body_max}"]
    return []


def check_abs_paths(name: str, paths: list[str], exists, allow_historical: bool) -> list[str]:
    """返回不存在的路径说明。算 FAIL 还是 INFO 由调用方决定。"""
    out: list[str] = []
    for p in paths:
        if exists(p):
            continue
        kind = "历史路径" if allow_historical else "绝对路径"
        out.append(f"{name}: {kind}不存在：{p}")
    return out


def check_ticket_status(rows: dict[str, str], body: str) -> list[str]:
    out: list[str] = []
    for tid, cell in sorted(rows.items()):
        done_in_body = re.search(rf"{tid}\s*已完成", body) is not None
        still_in_body = re.search(rf"{tid}\s*仍为", body) is not None
        pending_in_cell = any(m in cell for m in PENDING_MARKERS)
        if done_in_body and pending_in_cell:
            out.append(f"{TICKET_BATCH}: 正文写 {tid} 已完成，汇总表仍写「{cell}」")
        if still_in_body and "已完成" in cell and tid != "T-01":
            out.append(f"{TICKET_BATCH}: 正文写 {tid} 仍为未决，汇总表写「{cell}」")
    return out


def check_pairs(pairs, compare) -> list[str]:
    out: list[str] = []
    for canonical, deliverable in pairs:
        verdict = compare(canonical, deliverable)
        if verdict == "missing-canonical":
            out.append(f"canonical 缺失：{canonical}")
        elif verdict == "missing-deliverable":
            out.append(f"交付副本缺失：{deliverable}")
        elif verdict == "differs":
            out.append(f"副本与 canonical 不一致：{canonical} != {deliverable}")
    return out




def check_draft_title_conflict(name: str, text: str) -> list[str]:
    m_status = re.search(r"^status:\s*(\S+)", text, re.M)
    if not m_status or m_status.group(1) != "draft":
        return []
    m_title = re.search(r"^title:\s*(.+)$", text, re.M)
    h1 = re.search(r"^#\s+(.+)$", text, re.M)
    combined = (m_title.group(1) if m_title else "") + " " + (h1.group(1) if h1 else "")
    for bad in ("锁定版", "正式版", "已上线版"):
        if bad in combined:
            return [f"{name}: frontmatter status=draft 但标题含「{bad}」"]
    return []


def check_graph_freshness(rc: int, detail: str) -> list[str]:
    if rc != 0:
        return [f"src/orgmap/data/graph.js 过期或构建失败：{detail.strip() or f'exit {rc}'}"]
    return []


def check_git_buckets(lines: list[str]) -> list[str]:
    quoted = [ln for ln in lines if ln.startswith('"')]
    if quoted:
        return [f"git ls-files 输出含 {len(quoted)} 条被引号包裹的路径（core.quotepath 未关闭）；"
                f"例如 {quoted[0][:60]}"]
    return []


def check_top_level(paths: list[str]) -> list[str]:
    """根目录只允许入口文件、配置和标准目录。"""
    allowed_files = {"README.md", "CLAUDE.md", "AGENTS.md", ".gitignore", "CONTEXT.md",
                     "HANDOFF.md", "playbook.md"}
    out = []
    for p in paths:
        top = p.split("/", 1)[0]
        if "/" not in p:
            if top not in allowed_files:
                out.append(f"根目录出现非入口文件：{p}")
        elif not p.startswith(TOP_LEVEL_SOURCE_DIRS):
            out.append(f"根目录出现非标准顶层目录的内容：{p}")
    return out


# ------------------------------------------------------------------- collectors

def read(root: Path, rel: str) -> str | None:
    f = root / rel
    try:
        return f.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return None


def header_date(text: str) -> str | None:
    head = "\n".join(text.splitlines()[:20])
    for rx in HEADER_DATE_RES:
        m = rx.search(head)
        if m:
            return m.group(1)
    return None


def collect(root: Path) -> list[str]:
    failures: list[str] = []
    infos: list[str] = []

    # 1. C 编号上限
    index_text = read(root, C_CEILING_SOURCE) or ""
    m = C_CEILING_RE.search(index_text)
    declared = m.group(1) if m else None
    pack_text = read(root, C_CEILING_ACTUAL) or ""
    ids = sorted(set(C_RE.findall(pack_text)))
    actual = ids[-1] if ids else None
    failures += check_c_ceiling(declared, actual)

    # 2. 头部日期
    for rel in HEADER_DATE_FILES:
        text = read(root, rel)
        if text is None:
            failures.append(f"{rel}: 文件不存在")
            continue
        dates = DATE_RE.findall(text)
        failures += check_header_date(rel, header_date(text), max(dates) if dates else None)

    # 3. 绝对路径
    for rel in ABS_PATH_FILES:
        text = read(root, rel)
        if text is None:
            failures.append(f"{rel}: 文件不存在")
            continue
        found = sorted({p.rstrip("/.,;:）)") for p in ABS_PATH_RE.findall(text)})
        if found:
            failures += [f for f in check_abs_paths(rel, found, lambda p: Path(p).exists(), False)]
    for rel in HISTORICAL_PATH_FILES:
        text = read(root, rel)
        if text is None:
            failures.append(f"{rel}: 文件不存在")
            continue
        if not ABS_PATH_RE.search(text):
            continue
        if HISTORICAL_MARKER not in text:
            failures.append(f"{rel}: 含历史绝对路径但没有「{HISTORICAL_MARKER}」注记")
        found = sorted({p.rstrip("/.,;:）)") for p in ABS_PATH_RE.findall(text)})
        infos += [f"INFO  {f}" for f in check_abs_paths(rel, found, lambda p: Path(p).exists(), True)]

    # 3b. 交接包目录零绝对路径与 draft 标题状态一致性
    handoff_dir = root / "deliverables/execution/sanbao-handoff-20261104"
    if handoff_dir.is_dir():
        for hp in sorted(handoff_dir.glob("*.md")):
            rel = str(hp.relative_to(root))
            htext = hp.read_text(encoding="utf-8", errors="ignore")
            found = sorted({p.rstrip("/.,;:）)") for p in ABS_PATH_RE.findall(htext)})
            if found:
                failures += check_abs_paths(rel, found, lambda _p: False, False)
            failures += check_draft_title_conflict(rel, htext)
    for dfile in sorted((root / ".codex").glob("*.md")) if (root / ".codex").is_dir() else []:
        rel = str(dfile.relative_to(root))
        dtext = dfile.read_text(encoding="utf-8", errors="ignore")
        failures += check_draft_title_conflict(rel, dtext)

    # 4. ticket 汇总表 vs 正文
    tb = read(root, TICKET_BATCH)
    if tb is None:
        failures.append(f"{TICKET_BATCH}: 文件不存在")
    else:
        rows = {tid: cell for tid, cell in TICKET_ROW_RE.findall(tb)}
        failures += check_ticket_status(rows, tb)

    # 5. canonical 与交付副本逐字节
    def compare(a: str, b: str) -> str:
        pa, pb = root / a, root / b
        if not pa.is_file():
            return "missing-canonical"
        if not pb.is_file():
            return "missing-deliverable"
        return "same" if filecmp.cmp(pa, pb, shallow=False) else "differs"

    failures += check_pairs(DELIVERABLE_PAIRS, compare)

    # 6. git 路径桶
    try:
        raw = subprocess.run(["git", "ls-files"], cwd=root, capture_output=True,
                             text=True, check=True).stdout.splitlines()
        n_quoted = sum(1 for ln in raw if ln.startswith('"'))
        if n_quoted:
            print(f"INFO  裸 git ls-files 给 {n_quoted} 条非 ASCII 路径加了引号"
                  f"（git 默认行为，非仓库缺陷）；所有按路径分桶的统计必须用 "
                  f"git -c core.quotepath=false ls-files")
        # core.quotepath 会把非 ASCII 路径转义成带引号的字符串；用它判顶层桶会造出假桶名，
        # 所以顶层桶判断必须走 core.quotepath=false。
        literal = subprocess.run(["git", "-c", "core.quotepath=false", "ls-files"],
                                 cwd=root, capture_output=True, text=True,
                                 check=True).stdout.splitlines()
        failures += check_git_buckets(literal)
        failures += check_top_level(literal)
    except (OSError, subprocess.CalledProcessError) as exc:
        failures.append(f"git ls-files 失败：{exc}")

    # 7. FLOW-02 试点前置工程完整性门禁
    pilot_script = root / "scripts/check-pilot-preconditions.py"
    if pilot_script.is_file():
        pres = subprocess.run([sys.executable, "-I", str(pilot_script)],
                              cwd=root, capture_output=True, text=True)
        if pres.returncode != 0:
            failures.append(f"FLOW-02 试点前置工程校验失败：{(pres.stderr or pres.stdout).strip()}")

    # 7b. FLOW-02 八阶段 Schema 与 3x 重放干跑门禁
    dryrun_script = root / "scripts/run-flow02-dryrun.py"
    if dryrun_script.is_file():
        dres = subprocess.run([sys.executable, "-I", str(dryrun_script), "--selftest"],
                              cwd=root, capture_output=True, text=True)
        if dres.returncode != 0:
            failures.append(f"FLOW-02 八阶段干跑自检失败：{(dres.stderr or dres.stdout).strip()}")

    # 8. orgmap graph.js 新鲜度门禁
    graph_script = root / "scripts/build-canvas-graph.py"
    if graph_script.is_file():
        res = subprocess.run([sys.executable, "-I", str(graph_script), "--check"],
                             cwd=root, capture_output=True, text=True)
        failures += check_graph_freshness(res.returncode, (res.stderr or res.stdout))

    for line in infos:
        print(line)
    return failures


# ------------------------------------------------------------------- selftest

def selftest() -> int:
    """每条规则都要有一个「必须失败」的反例。一个恒真的检查器没有价值。"""
    with tempfile.TemporaryDirectory() as td:
        same_a = Path(td) / "a.txt"
        same_b = Path(td) / "b.txt"
        diff_b = Path(td) / "c.txt"
        same_a.write_text("same", encoding="utf-8")
        same_b.write_text("same", encoding="utf-8")
        diff_b.write_text("different", encoding="utf-8")

        def cmp_files(x, y):
            if not Path(x).is_file():
                return "missing-canonical"
            if not Path(y).is_file():
                return "missing-deliverable"
            return "same" if filecmp.cmp(x, y, shallow=False) else "differs"

        cases = [
            ("c-ceiling/drift", check_c_ceiling("C-376", "C-375"), True),
            ("c-ceiling/ok", check_c_ceiling("C-376", "C-376"), False),
            ("c-ceiling/missing-decl", check_c_ceiling(None, "C-376"), True),
            ("header-date/stale", check_header_date("x.md", "2026-10-08", "2026-10-09"), True),
            ("header-date/ok", check_header_date("x.md", "2026-10-09", "2026-10-09"), False),
            ("header-date/no-header", check_header_date("x.md", None, "2026-10-09"), True),
            ("abs-path/missing",
             check_abs_paths("x.md", ["/Users/__no_such_user__/x"], lambda q: Path(q).exists(), False), True),
            ("abs-path/exists",
             check_abs_paths("x.md", [str(same_a)], lambda q: Path(q).exists(), False), False),
            ("abs-path/historical-reported",
             check_abs_paths("x.md", ["/Users/lute/x"], lambda q: False, True), True),
            ("ticket/table-vs-body",
             check_ticket_status({"T-05": "**待网络重试**"}, "T-05 已完成：main 已推送。"), True),
            ("ticket/consistent",
             check_ticket_status({"T-05": "**已完成**"}, "T-05 已完成：main 已推送。"), False),
            ("git/quotepath", check_git_buckets(['"skill-library/x"', "README.md"]), True),
            ("git/clean", check_git_buckets(["skill-library/x", "README.md"]), False),
            ("toplevel/stray-file", check_top_level(["notes.md", "README.md"]), True),
            ("toplevel/ok",
             check_top_level(["README.md", "skill-library/x", "scripts/y.py"]), False),
            ("pairs/differs", check_pairs([(str(same_a), str(diff_b))], cmp_files), True),
            ("pairs/identical", check_pairs([(str(same_a), str(same_b))], cmp_files), False),
            ("pairs/missing-canonical", check_pairs([("nope", str(same_b))], cmp_files), True),
            ("graph/stale", check_graph_freshness(1, "graph.js 已过期"), True),
            ("graph/fresh", check_graph_freshness(0, "graph.js 最新"), False),
            ("draft/title-conflict", check_draft_title_conflict("x.md", "---\ntitle: 规格（锁定版）\nstatus: draft\n---\n# 规格（锁定版）"), True),
            ("draft/title-ok", check_draft_title_conflict("x.md", "---\ntitle: 规格（设计提案）\nstatus: draft\n---\n# 规格（设计提案）"), False),
        ]

    bad = [(n, want, got) for n, got, want in ((n, f, w) for n, f, w in cases) if bool(got) != want]

    print("-- 必须失败的反例（证明检查器不是恒真）--")
    for name, failures, expect_fail in cases:
        if expect_fail:
            print(f"  {name}: {failures[0] if failures else '（无失败——不合格）'}")

    for name, want, got in bad:
        print(f"FAIL  fixture {name}: 期望 {'失败' if want else '通过'}，实际 {'失败' if got else '通过'}")

    print(f"\nSELFTEST {'PASS' if not bad else 'FAIL'} {len(cases) - len(bad)}/{len(cases)}")
    return 1 if bad else 0


# ----------------------------------------------------------------------- main

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--root", default=str(Path(__file__).resolve().parents[1]))
    ap.add_argument("--selftest", action="store_true", help="负向 fixture 自检")
    args = ap.parse_args()

    if args.selftest:
        return selftest()

    root = Path(args.root).resolve()
    if not (root / ".git").exists() and not (root / "README.md").exists():
        print(f"FAIL  不像仓库根目录：{root}", file=sys.stderr)
        return 2

    failures = collect(root)
    print()
    if failures:
        for f in failures:
            print(f"FAIL  {f}")
        print(f"\n{len(failures)} 项不一致")
        return 1
    print("PASS  台账一致")
    return 0


if __name__ == "__main__":
    sys.exit(main())
