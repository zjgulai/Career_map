#!/usr/bin/env python3
"""Reconcile the broad Skill archive with the current Codex runtime roots.

The primary inventory intentionally remains a historical, cross-directory asset
catalogue.  This module adds a separate runtime dimension: it preserves every
existing record, imports newly available Codex entry files, records content
changes, and marks old plugin entries as replaced when a matching live entry
exists.  Runtime availability and business-competition readiness stay separate.
"""

from __future__ import annotations

from collections import Counter
import csv
import datetime as dt
import json
from pathlib import Path

import build_skill_library as base
from skill_archive_paths import load_folder_index
import enrich_skill_inventory as enrich


ROOT = Path("/Users/lute/project/Career/skill-library")
RAW_JSON = ROOT / "skill_inventory.json"
ENRICHED_JSON = ROOT / "skill_inventory_enriched.json"
RUNTIME_JSON = ROOT / "codex_runtime_inventory.json"
RUNTIME_CSV = ROOT / "codex_runtime_inventory.csv"
RUNTIME_XLSX = ROOT / "codex_runtime_inventory.xlsx"
REPORT = ROOT / "CODEX_RUNTIME_SYNC_REPORT.md"
RUNTIME_SITE_DATA = ROOT / "site" / "codex-runtime-data.js"

RUNTIME_ROOTS = [
    ("Codex system", Path("/Users/lute/.codex/skills/.system"), "本地系统", "system"),
    ("Codex 用户技能", Path("/Users/lute/.codex/skills"), "本地全局", "user"),
    ("Codex Agent 技能", Path("/Users/lute/.agents/skills"), "本地全局", "agent"),
    ("Codex primary runtime", Path("/Users/lute/.codex/plugins/cache/openai-primary-runtime"), "Primary Runtime", "primary"),
    ("Codex bundled plugin", Path("/Users/lute/.codex/plugins/cache/openai-bundled"), "Bundled Plugin", "bundled"),
    ("Codex remote plugin", Path("/Users/lute/.codex/plugins/cache/openai-curated-remote"), "Remote Plugin", "remote"),
]
FOLDER_INDEX = load_folder_index(base.OUTPUT_ROOT / "skill_archive_folder_index.json")


def archive_folder_for(row: dict) -> Path:
    record = FOLDER_INDEX.get(str(row.get("skill_id", "")), {})
    return base.ARCHIVE_ROOT / str(record.get("folder_name") or row.get("skill_id", ""))

CURRENT_OK = "当前可用，归档内容已核验"
CURRENT_CHANGED = "当前可用，内容已更新待业务复核"
CURRENT_NEW = "当前可用，新纳入待业务复核"
REPLACED = "已被当前版本替代"
OUTSIDE = "不在当前 Codex 运行时范围"
ORIGINAL_SNAPSHOT_COUNT = 12_828


def resolved(path_value: str | Path) -> Path:
    return Path(path_value).expanduser().resolve()


def relative_to(path: Path, root: Path) -> Path | None:
    try:
        return path.relative_to(root)
    except ValueError:
        return None


def runtime_descriptor(path: Path) -> dict[str, str] | None:
    """Return one MECE runtime source descriptor, or None outside Codex roots."""
    path = resolved(path)
    system_root = RUNTIME_ROOTS[0][1]
    rel = relative_to(path, system_root)
    if rel is not None:
        return {"layer": "Codex system", "distribution": "本地系统", "version": "本地系统", "identity": f"system:{rel}"}

    user_root = RUNTIME_ROOTS[1][1]
    rel = relative_to(path, user_root)
    if rel is not None:
        return {"layer": "Codex 用户技能", "distribution": "本地全局", "version": "本地用户技能", "identity": f"user:{rel}"}

    agent_root = RUNTIME_ROOTS[2][1]
    rel = relative_to(path, agent_root)
    if rel is not None:
        return {"layer": "Codex Agent 技能", "distribution": "本地全局", "version": "本地 Agent 技能", "identity": f"agent:{rel}"}

    for layer, root, distribution, kind in RUNTIME_ROOTS[3:]:
        rel = relative_to(path, root)
        if rel is None:
            continue
        parts = rel.parts
        if len(parts) >= 4 and parts[2] == "skills":
            plugin, version = parts[0], parts[1]
            tail = "/".join(parts[3:])
            return {
                "layer": layer,
                "distribution": distribution,
                "version": f"{plugin} {version}",
                "identity": f"{kind}:{plugin}:{tail}",
            }
        return {"layer": layer, "distribution": distribution, "version": "版本未解析", "identity": f"{kind}:{rel}"}
    return None


def current_paths() -> dict[str, Path]:
    paths: dict[str, Path] = {}
    for _, root, _, _ in RUNTIME_ROOTS:
        if not root.exists():
            continue
        for pattern in ("SKILL.md", "skill.md"):
            for path in root.rglob(pattern):
                if path.is_file():
                    paths[str(resolved(path))] = resolved(path)
    return dict(sorted(paths.items()))


def archive_backup(row: dict, prior_hash: str) -> None:
    """Keep the archived entry text before replacing a changed current Skill."""
    folder = archive_folder_for(row)
    source = folder / "SKILL.md"
    if not source.exists() or not prior_hash:
        return
    history = folder / "history"
    history.mkdir(parents=True, exist_ok=True)
    target = history / f"{prior_hash[:12]}-SKILL.md"
    if not target.exists():
        target.write_text(source.read_text(encoding="utf-8", errors="replace"), encoding="utf-8")
    metadata = history / f"{prior_hash[:12]}-metadata.json"
    if not metadata.exists():
        metadata.write_text(json.dumps(row, ensure_ascii=False, indent=2), encoding="utf-8")


def file_fingerprint(path: Path) -> str:
    """Use raw file bytes so a runtime check has one stable hash convention."""
    return base.hashlib.sha256(path.read_bytes()).hexdigest()


def runtime_note(status: str) -> str:
    if status == CURRENT_OK:
        return "可在当前 Codex 根目录中定位；当前可用不等于已通过业务竞聘。"
    if status == CURRENT_CHANGED:
        return "当前 Skill 原文已更新；摘要、输入输出和边界已重新提取，仍需业务复核后再竞聘。"
    if status == CURRENT_NEW:
        return "已纳入当前 Codex；先补齐业务场景、输入输出、验收和边界，再判断是否进入竞聘。"
    if status == REPLACED:
        return "保留历史归档以便追溯；当前操作应使用已标明的替代入口。"
    return "保留来源资产；不能据此判断当前 Codex 是否可用。"


def runtime_added_row(row: dict) -> bool:
    if row.get("首次运行时纳入时间"):
        return True
    try:
        return int(str(row.get("skill_id", "")).split("-", 1)[0]) > ORIGINAL_SNAPSHOT_COUNT
    except ValueError:
        return False


def apply_runtime_fields(row: dict, descriptor: dict[str, str] | None, status: str, checked_at: str, current_hash: str = "", replacement: str = "") -> None:
    row["当前Codex状态"] = status
    row["Codex运行时范围"] = "是" if descriptor and status != REPLACED else "否"
    row["Codex来源层"] = descriptor["layer"] if descriptor else "非当前 Codex 资产"
    row["Codex分发来源"] = descriptor["distribution"] if descriptor else "不适用"
    row["Codex版本"] = descriptor["version"] if descriptor else "不适用"
    row["运行时核验时间"] = checked_at
    row["当前内容哈希"] = current_hash
    row["当前内容哈希口径"] = "sha256_file_bytes_v1"
    row["替代入口路径"] = replacement
    row["运行时业务提示"] = runtime_note(status)


def refresh_enriched(raw_rows: list[dict], affected_paths: set[str]) -> list[dict]:
    existing = json.loads(ENRICHED_JSON.read_text(encoding="utf-8"))
    existing_by_path = {str(resolved(row["source_path"])): row for row in existing if row.get("source_path")}
    enriched_rows: list[dict] = []
    for raw in raw_rows:
        path = str(resolved(raw["source_path"]))
        if path in affected_paths or path not in existing_by_path:
            item = enrich.enrich_row(raw)
        else:
            item = dict(existing_by_path[path])
            item.update(raw)
        enriched_rows.append(item)

    enriched_rows.sort(key=lambda row: (
        row.get("业务价值类型", ""),
        row.get("问题类型", ""),
        row.get("业务场景", ""),
        row.get("英文名称", "").lower(),
    ))
    return enriched_rows


def write_enriched(enriched_rows: list[dict]) -> None:
    columns = [
        "英文名称", "中文名称", "一句话作用", "关键输入", "关键输出", "最新更新时间", "业务场景", "解决具体问题",
        "用途总结", "核心能力", "问题类型", "业务价值类型", "业务价值", "适用对象", "触发条件", "方法或机制",
        "关键约束", "证据摘要", "当前Codex状态", "Codex运行时范围", "Codex来源层", "Codex分发来源", "Codex版本",
        "运行时核验时间", "当前内容哈希", "替代入口路径", "运行时业务提示", "text_quality", "summary_confidence",
        "needs_review", "source_type", "entry_type", "relative_path", "skill_id",
    ]
    ENRICHED_JSON.write_text(json.dumps(enriched_rows, ensure_ascii=False, indent=2), encoding="utf-8")
    enrich.write_csv(enriched_rows, columns)
    enrich.write_xlsx(enrich.ENRICHED_XLSX, enriched_rows, columns)
    enrich.write_site_data(enriched_rows)


def runtime_ledger(enriched_rows: list[dict], current: dict[str, Path]) -> list[dict]:
    by_path = {str(resolved(row["source_path"])): row for row in enriched_rows}
    rows = []
    for path_text, path in current.items():
        row = by_path[path_text]
        rows.append({
            "英文名称": row.get("英文名称", ""),
            "中文名称": row.get("中文名称", ""),
            "当前Codex状态": row.get("当前Codex状态", ""),
            "Codex来源层": row.get("Codex来源层", ""),
            "Codex分发来源": row.get("Codex分发来源", ""),
            "Codex版本": row.get("Codex版本", ""),
            "用途总结": row.get("用途总结", ""),
            "关键输入": row.get("关键输入", ""),
            "关键输出": row.get("关键输出", ""),
            "业务场景": row.get("业务场景", ""),
            "问题类型": row.get("问题类型", ""),
            "当前竞聘状态": "待业务复核" if row.get("当前Codex状态") in (CURRENT_NEW, CURRENT_CHANGED) else "保留既有竞聘判断",
            "运行时业务提示": row.get("运行时业务提示", ""),
            "运行时核验时间": row.get("运行时核验时间", ""),
            "当前入口路径": path_text,
            "替代入口路径": row.get("替代入口路径", ""),
            "归档目录": str(archive_folder_for(row)),
            "skill_id": row.get("skill_id", ""),
        })
    return sorted(rows, key=lambda row: (row["Codex来源层"], row["英文名称"].lower()))


def write_runtime_ledger(rows: list[dict], checked_at: str) -> None:
    columns = [
        "英文名称", "中文名称", "当前Codex状态", "Codex来源层", "Codex分发来源", "Codex版本", "用途总结", "关键输入", "关键输出",
        "业务场景", "问题类型", "当前竞聘状态", "运行时业务提示", "运行时核验时间", "当前入口路径", "替代入口路径", "归档目录", "skill_id",
    ]
    payload = {
        "generated_at": checked_at,
        "scope": "当前 Codex 根目录中的标准 SKILL.md / skill.md 入口",
        "counts": dict(Counter(row["当前Codex状态"] for row in rows)),
        "entries": rows,
    }
    RUNTIME_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    RUNTIME_SITE_DATA.write_text(
        "window.CODEX_RUNTIME_DATA = " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )
    with RUNTIME_CSV.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns)
        writer.writeheader()
        writer.writerows({column: row.get(column, "") for column in columns} for row in rows)
    enrich.write_xlsx(RUNTIME_XLSX, rows, columns)


def write_report(raw_rows: list[dict], ledger: list[dict], checked_at: str, added: int, changed: int, replaced: int) -> None:
    by_layer = Counter(row["Codex来源层"] for row in ledger)
    by_status = Counter(row["当前Codex状态"] for row in ledger)
    lines = [
        "# 当前 Codex Skill 运行时校准",
        "",
        f"- 核验时间：{checked_at}",
        f"- 历史资产总数：{len(raw_rows)}",
        f"- 当前 Codex 入口数：{len(ledger)}",
        f"- 新纳入当前入口：{added}",
        f"- 当前入口内容更新：{changed}",
        f"- 历史插件入口已替代：{replaced}",
        f"- 当前运行时 Excel：`{RUNTIME_XLSX}`",
        "",
        "## 当前可用性",
        "",
    ]
    lines.extend(f"- {status}: {by_status.get(status, 0)}" for status in (CURRENT_OK, CURRENT_CHANGED, CURRENT_NEW))
    lines.extend(["", "## 当前来源层", ""])
    lines.extend(f"- {layer}: {by_layer.get(layer, 0)}" for layer, _, _, _ in RUNTIME_ROOTS)
    lines.extend([
        "",
        "## 业务读法",
        "",
        "- 当前可用只说明本机 Codex 根目录可以定位该 Skill，不等于已经通过业务竞聘。",
        "- 新纳入或内容更新的 Skill 均维持待业务复核；不得自动获得岗位、Preset、数字员工或真实业务动作权限。",
        "- 已被替代的条目保留为历史归档，便于追溯，但网页和 Excel 会明确引导到当前入口。",
    ])
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    checked_at = dt.datetime.now().astimezone().isoformat(timespec="seconds")
    raw_rows = json.loads(RAW_JSON.read_text(encoding="utf-8"))
    by_path = {str(resolved(row["source_path"])): row for row in raw_rows if row.get("source_path")}
    current = current_paths()
    identities = {runtime_descriptor(path)["identity"]: path_text for path_text, path in current.items() if runtime_descriptor(path)}
    affected: set[str] = set()
    added = 0
    changed = 0

    for path_text, path in current.items():
        descriptor = runtime_descriptor(path)
        current_hash = file_fingerprint(path)
        existing = by_path.get(path_text)
        if existing is None:
            fresh = base.row_for_path(path, len(raw_rows) + 1, "directory_skill")
            fresh["首次运行时纳入时间"] = checked_at
            apply_runtime_fields(fresh, descriptor, CURRENT_NEW, checked_at, current_hash)
            raw_rows.append(fresh)
            by_path[path_text] = fresh
            base.archive_skill(fresh)
            affected.add(path_text)
            added += 1
            continue

        prior_runtime_hash = existing.get("当前内容哈希") if existing.get("当前内容哈希口径") == "sha256_file_bytes_v1" else ""
        text, _ = base.read_text(path)
        prior_inventory_hash = base.hashlib.sha256(text.encode("utf-8", errors="ignore")).hexdigest() if text else ""
        if prior_runtime_hash and prior_runtime_hash != current_hash or not prior_runtime_hash and existing.get("content_hash") != prior_inventory_hash:
            archive_backup(existing, str(existing.get("content_hash") or ""))
            fresh = base.row_for_path(path, 1, "directory_skill")
            fresh["skill_id"] = existing["skill_id"]
            fresh["原归档内容哈希"] = existing.get("content_hash", "")
            apply_runtime_fields(fresh, descriptor, CURRENT_CHANGED, checked_at, current_hash)
            existing.clear()
            existing.update(fresh)
            base.archive_skill(existing)
            affected.add(path_text)
            changed += 1
        else:
            pending_status = existing.get("当前Codex状态")
            status = CURRENT_NEW if runtime_added_row(existing) else pending_status if pending_status == CURRENT_CHANGED else CURRENT_OK
            apply_runtime_fields(existing, descriptor, status, checked_at, current_hash)
            base.archive_skill(existing)

    replaced = 0
    for row in raw_rows:
        path_text = str(resolved(row["source_path"]))
        if path_text in current:
            continue
        descriptor = runtime_descriptor(Path(path_text))
        replacement = identities.get(descriptor["identity"]) if descriptor else None
        if replacement:
            apply_runtime_fields(row, descriptor, REPLACED, checked_at, replacement=replacement)
            replaced += 1
        else:
            apply_runtime_fields(row, descriptor, OUTSIDE, checked_at)

    raw_rows.sort(key=lambda row: (row.get("业务场景", ""), row.get("英文名称", "").lower(), row.get("source_type", ""), row.get("relative_path", "")))
    RAW_JSON.write_text(json.dumps(raw_rows, ensure_ascii=False, indent=2), encoding="utf-8")
    base.write_csv(raw_rows)
    base.write_xlsx(raw_rows, {
        "unique_historical_assets": len(raw_rows),
        "current_codex_entries": len(current),
        "current_codex_new_entries": added,
        "current_codex_content_updates": changed,
        "historical_entries_replaced_by_current_version": replaced,
    })
    base.write_report(raw_rows, {"current_codex_entries": len(current), "runtime_checked_at": checked_at})

    enriched_rows = refresh_enriched(raw_rows, affected)
    write_enriched(enriched_rows)
    ledger = runtime_ledger(enriched_rows, current)
    write_runtime_ledger(ledger, checked_at)
    write_report(raw_rows, ledger, checked_at, added, changed, replaced)
    print(json.dumps({
        "current_entries": len(ledger),
        "new_entries": added,
        "content_updates": changed,
        "replaced_historical_entries": replaced,
        "runtime_xlsx": str(RUNTIME_XLSX),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
