#!/usr/bin/env python3
"""Rename local skill folders to `编号-核心功能` without losing traceability."""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
from pathlib import Path
import sys

from skill_archive_paths import folder_name_for


PROJECT_ROOT = Path(__file__).resolve().parents[2]
LIBRARY_ROOT = PROJECT_ROOT / "skill-library"
ARCHIVE_ROOT = LIBRARY_ROOT / "skills"
INVENTORY_PATH = LIBRARY_ROOT / "skill_inventory_enriched.json"
MANIFEST_JSON = LIBRARY_ROOT / "skill_archive_manifest.json"
MANIFEST_CSV = LIBRARY_ROOT / "skill_archive_manifest.csv"
FOLDER_INDEX_JSON = LIBRARY_ROOT / "skill_archive_folder_index.json"
FOLDER_INDEX_CSV = LIBRARY_ROOT / "skill_archive_folder_index.csv"
NAMING_REPORT = LIBRARY_ROOT / "SKILL_ARCHIVE_NAMING.md"
SITE_DATA = LIBRARY_ROOT / "site" / "skill-data.js"
RUNTIME_JSON = LIBRARY_ROOT / "codex_runtime_inventory.json"
RUNTIME_CSV = LIBRARY_ROOT / "codex_runtime_inventory.csv"


def load_record_list(path: Path) -> list[dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    records = data if isinstance(data, list) else data.get("records", [])
    if not isinstance(records, list):
        raise ValueError(f"{path.name} does not contain a record list")
    return records


def read_site_data() -> list[dict]:
    source = SITE_DATA.read_text(encoding="utf-8")
    prefix = "window.SKILL_DATA = "
    if not source.startswith(prefix) or not source.rstrip().endswith(";"):
        raise ValueError("site/skill-data.js has an unexpected format")
    payload = source[len(prefix):].strip()
    return json.loads(payload[:-1])


def write_site_data(rows: list[dict]) -> None:
    SITE_DATA.write_text(
        "window.SKILL_DATA = " + json.dumps(rows, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )


def write_csv(path: Path, rows: list[dict], columns: list[str]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def rebase_archive_path(value: str, old_dir: Path, new_dir: Path) -> str:
    if not value:
        return value
    try:
        relative = Path(value).relative_to(old_dir)
    except ValueError:
        return value
    return str(new_dir / relative)


def build_plan(rows: list[dict], manifest: list[dict]) -> list[dict]:
    by_id = {str(record.get("skill_id")): record for record in manifest}
    plan: list[dict] = []
    used_names: set[str] = set()

    for row in rows:
        skill_id = str(row.get("skill_id", ""))
        existing = by_id.get(skill_id)
        if not existing:
            raise ValueError(f"{skill_id}: missing manifest record")
        old_dir = Path(existing["archive_directory"])
        if not old_dir.is_dir():
            raise ValueError(f"{skill_id}: archive folder missing: {old_dir}")
        folder_name, core_function, basis = folder_name_for(row, existing.get("archive_entry_status", ""))
        if folder_name in used_names:
            raise ValueError(f"folder name collision: {folder_name}")
        used_names.add(folder_name)
        plan.append(
            {
                "skill_id": skill_id,
                "folder_name": folder_name,
                "core_function": core_function,
                "naming_basis": basis,
                "old_directory": old_dir,
                "new_directory": ARCHIVE_ROOT / folder_name,
                "manifest": existing,
            }
        )

    return plan


def apply(plan: list[dict], manifest_payload: dict) -> None:
    conflicts = [item for item in plan if item["new_directory"] != item["old_directory"] and item["new_directory"].exists()]
    if conflicts:
        sample = ", ".join(item["new_directory"].name for item in conflicts[:5])
        raise RuntimeError(f"target folder already exists: {sample}")

    for item in plan:
        if item["new_directory"] != item["old_directory"]:
            item["old_directory"].rename(item["new_directory"])

    index_records: list[dict] = []
    manifest_records: list[dict] = []
    by_skill_id = {item["skill_id"]: item for item in plan}
    for item in plan:
        previous = item["manifest"]
        old_dir = item["old_directory"]
        new_dir = item["new_directory"]
        updated = dict(previous)
        updated["archive_directory"] = str(new_dir.resolve())
        updated["SKILL_md"] = str((new_dir / "SKILL.md").resolve())
        updated["source_asset"] = rebase_archive_path(str(previous.get("source_asset", "")), old_dir, new_dir)
        updated["archive_folder_name"] = item["folder_name"]
        updated["核心功能目录名"] = item["core_function"]
        updated["目录命名依据"] = item["naming_basis"]
        manifest_records.append(updated)
        index_records.append(
            {
                "skill_id": item["skill_id"],
                "folder_name": item["folder_name"],
                "core_function": item["core_function"],
                "naming_basis": item["naming_basis"],
                "archive_directory": str(new_dir.resolve()),
                "SKILL_md": str((new_dir / "SKILL.md").resolve()),
                "legacy_archive_directory": str(old_dir),
            }
        )

    manifest_payload["generated_at"] = dt.datetime.now().astimezone().isoformat(timespec="seconds")
    manifest_payload["records"] = manifest_records
    manifest_payload["notes"] = [
        "Every inventory record has one human-facing folder named 编号-核心功能.",
        "skill_id remains the stable internal identifier and is mapped in skill_archive_folder_index.",
        "Folder names are for retrieval only; they do not assert runtime availability or business authorization.",
    ]
    MANIFEST_JSON.write_text(json.dumps(manifest_payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_csv(MANIFEST_CSV, manifest_records, list(manifest_records[0].keys()))

    index_payload = {
        "generated_at": manifest_payload["generated_at"],
        "naming_rule": "五位编号-核心功能；可用中文名称优先，英文名称其次，不可读原件使用来源目录名-待复核。",
        "record_count": len(index_records),
        "records": index_records,
    }
    FOLDER_INDEX_JSON.write_text(json.dumps(index_payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_csv(FOLDER_INDEX_CSV, index_records, list(index_records[0].keys()))
    basis_counts: dict[str, int] = {}
    for record in index_records:
        basis = record["naming_basis"]
        basis_counts[basis] = basis_counts.get(basis, 0) + 1
    examples = index_records[:5]
    NAMING_REPORT.write_text(
        "# Skill 归档目录命名\n\n"
        "## 规则\n\n"
        "每个目录统一使用 `五位编号-核心功能`。编号保证唯一和稳定排序；核心功能优先使用已有中文名称，"
        "没有可靠中文名称时使用英文名称；原件不可读时使用来源目录名并追加 `待复核`。内部 `skill_id` 保留在映射表中，不再承担展示职责。\n\n"
        "## 本次结果\n\n"
        f"- 已重命名目录：{len(index_records)}\n"
        f"- 中文名称命名：{basis_counts.get('中文名称', 0)}\n"
        f"- 英文名称命名：{basis_counts.get('英文名称', 0)}\n"
        f"- 来源目录名加待复核：{basis_counts.get('来源目录名 + 待复核状态', 0)}\n"
        "- 哈希后缀：0\n\n"
        "## 追溯\n\n"
        "用 `skill_archive_folder_index.csv` 或 `skill_archive_folder_index.json` 可以从 `skill_id` 回查当前目录、"
        "`SKILL.md`、原目录和命名依据。目录名用于找技能，不代表当前 Codex 可用、业务竞聘通过或业务授权。\n\n"
        "## 示例\n\n"
        + "\n".join(
            f"- `{record['folder_name']}`：{record['naming_basis']}" for record in examples
        )
        + "\n",
        encoding="utf-8",
    )

    site_rows = read_site_data()
    for row in site_rows:
        item = by_skill_id.get(str(row.get("skill_id", "")))
        if item:
            row["archive_path"] = f"../skills/{item['folder_name']}/SKILL.md"
            row["archive_folder_name"] = item["folder_name"]
            row["核心功能目录名"] = item["core_function"]
    write_site_data(site_rows)

    if RUNTIME_JSON.is_file():
        runtime_payload = json.loads(RUNTIME_JSON.read_text(encoding="utf-8"))
        runtime_key = "entries" if isinstance(runtime_payload, dict) and isinstance(runtime_payload.get("entries"), list) else "records"
        runtime_rows = runtime_payload.get(runtime_key, []) if isinstance(runtime_payload, dict) else []
        for row in runtime_rows:
            item = by_skill_id.get(str(row.get("skill_id", "")))
            if item:
                row["归档目录"] = str(item["new_directory"].resolve())
                row["归档目录名"] = item["folder_name"]
        RUNTIME_JSON.write_text(json.dumps(runtime_payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        if RUNTIME_CSV.is_file() and runtime_rows:
            columns = list(runtime_rows[0].keys())
            write_csv(RUNTIME_CSV, runtime_rows, columns)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="rename folders and update current path indexes")
    args = parser.parse_args()

    rows = load_record_list(INVENTORY_PATH)
    manifest_payload = json.loads(MANIFEST_JSON.read_text(encoding="utf-8"))
    manifest_rows = manifest_payload.get("records", [])
    plan = build_plan(rows, manifest_rows)
    renamed = sum(item["new_directory"] != item["old_directory"] for item in plan)
    summary = {
        "mode": "apply" if args.apply else "dry-run",
        "records": len(plan),
        "folders_to_rename": renamed,
        "unchanged_folders": len(plan) - renamed,
        "examples": [
            {
                "skill_id": item["skill_id"],
                "from": item["old_directory"].name,
                "to": item["new_directory"].name,
                "basis": item["naming_basis"],
            }
            for item in plan[:8]
        ],
    }
    if args.apply:
        apply(plan, manifest_payload)
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
