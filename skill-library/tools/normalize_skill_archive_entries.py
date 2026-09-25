#!/usr/bin/env python3
"""Make every archived skill record directly addressable through SKILL.md.

The inventory intentionally contains two mutually exclusive source forms:
standard directory skills already have a SKILL.md entry, while the historical
paper_to_skills collection is a set of standalone Markdown or JSONL assets.
This utility preserves the archive and gives every record one predictable entry
file without pretending that a JSONL research trace is an installable Codex
skill.
"""

from __future__ import annotations

import csv
import datetime as dt
import json
from pathlib import Path
import shutil

from skill_archive_paths import load_folder_index


PROJECT_ROOT = Path(__file__).resolve().parents[2]
LIBRARY_ROOT = PROJECT_ROOT / "skill-library"
ARCHIVE_ROOT = LIBRARY_ROOT / "skills"
INVENTORY_PATH = LIBRARY_ROOT / "skill_inventory_enriched.json"
MANIFEST_JSON = LIBRARY_ROOT / "skill_archive_manifest.json"
MANIFEST_CSV = LIBRARY_ROOT / "skill_archive_manifest.csv"
REPORT_PATH = LIBRARY_ROOT / "SKILL_ARCHIVE_RECONCILIATION.md"
ARCHIVE_README = ARCHIVE_ROOT / "README.md"
FOLDER_INDEX_PATH = LIBRARY_ROOT / "skill_archive_folder_index.json"


def clean_line(value: object, limit: int = 320) -> str:
    text = str(value or "").replace("\r", " ").replace("\n", " ")
    text = "".join(character if character >= " " else " " for character in text)
    text = text.replace("\ufffd", "")
    text = " ".join(text.split())
    if len(text) > limit:
        return f"{text[: limit - 1].rstrip()}..."
    return text


def load_rows() -> list[dict]:
    data = json.loads(INVENTORY_PATH.read_text(encoding="utf-8"))
    rows = data if isinstance(data, list) else data.get("records", [])
    if not isinstance(rows, list):
        raise ValueError("skill_inventory_enriched.json does not contain a record list")
    return rows


def archive_folder_for(row: dict, folder_index: dict[str, dict]) -> Path:
    record = folder_index.get(str(row.get("skill_id", "")), {})
    return ARCHIVE_ROOT / str(record.get("folder_name") or row.get("skill_id", ""))


def source_asset_for(folder: Path, row: dict) -> Path | None:
    expected = folder / Path(str(row.get("source_path", ""))).name
    if expected.is_file():
        return expected
    candidates = sorted(
        path
        for path in folder.iterdir()
        if path.is_file() and path.name not in {"SKILL.md", "metadata.json"}
    )
    return candidates[0] if candidates else None


def readable_text(path: Path) -> bool:
    data = path.read_bytes()
    if b"\x00" in data:
        return False
    try:
        data.decode("utf-8")
    except UnicodeDecodeError:
        return False
    return True


def source_wrapper(row: dict, source_asset: Path | None, source_kind: str, source_origin: str) -> str:
    english_name = clean_line(row.get("英文名称"), 160)
    chinese_name = clean_line(row.get("中文名称"), 160)
    purpose = clean_line(row.get("一句话作用"), 360)
    inputs = clean_line(row.get("关键输入"), 420)
    outputs = clean_line(row.get("关键输出"), 420)
    scenario = clean_line(row.get("业务场景"), 160)
    problem = clean_line(row.get("解决具体问题"), 420)
    source_name = source_asset.name if source_asset else "未找到原始归档文件"
    wrapper_type = f"{clean_line(row.get('entry_type'), 80) or 'archived_skill'}_{source_kind}_wrapper"
    machine_trace = purpose.startswith("{") or "\ufffd" in purpose
    if source_kind.startswith("opaque") or machine_trace:
        path_name = Path(str(row.get("source_path", ""))).parent.name
        english_name = clean_line(path_name or row.get("skill_id") or "未命名技能线索", 160)
        chinese_name = f"待补：{english_name}"
        purpose = "原始归档文件未提供可稳定解码的任务说明；当前仅作为待复核的技能线索保留。"
        inputs = "待补：需先取得可稳定读取的原始任务说明、输入条件和适用范围。"
        outputs = "待补：原始文件不可可靠解读，不能推断固定交付物。"
        scenario = "待复核的研究/知识资产"
        problem = "当前不能可靠判断它解决的具体业务问题；需在原始内容可读取后再补齐。"
    return f"""---
name: {json.dumps(english_name, ensure_ascii=False)}
description: {json.dumps(purpose, ensure_ascii=False)}
archive_entry_type: {wrapper_type}
archive_source_file: {json.dumps(source_name, ensure_ascii=False)}
---

# {english_name}

## 业务名称

{chinese_name}

## 一句话作用

{purpose}

## 关键输入

{inputs}

## 关键输出

{outputs}

## 业务场景

{scenario}

## 解决的具体问题

{problem}

## 归档边界

- 这是 {source_origin} 的 {source_kind.upper()} 归档资产所生成的统一入口。
- 同目录的 `{source_name}` 保留原始归档记录；本入口不重写、不解释或补全其中的历史过程。
- 它可用于检索、比较和后续业务竞聘准备，不代表已验证为可安装的当前 Codex Skill，也不授予任何真实业务权限。
- 若上方标为“待复核”，表示现有归档内容不足以可靠概括用途，不能据此进行业务归类或竞聘判断。
"""


def write_archive_readme(
    total: int,
    standard: int,
    markdown: int,
    jsonl: int,
    opaque_paper: int,
    opaque_standard: int,
) -> None:
    ARCHIVE_README.write_text(
        "# Skill Archive\n\n"
        f"本目录按“编号-核心功能”命名；与 `skill_inventory_enriched.xlsx` / `skill_inventory_enriched.json` 的 `skill_id` 一一对应，"
        f"完整对应关系见 `skill_archive_folder_index.csv` / `skill_archive_folder_index.json`。\n\n"
        f"- 总记录：{total}\n"
        f"- 可读的标准目录型 `SKILL.md`：{standard}\n"
        f"- 可读 Markdown 文件型资产镜像为入口：{markdown}\n"
        f"- 文件型 JSONL 资产生成说明入口：{jsonl}\n\n"
        f"- 不透明 paper Markdown 资产生成说明入口：{opaque_paper}\n"
        f"- 不透明标准目录型入口生成说明入口：{opaque_standard}\n\n"
        f"每个子目录均应包含 `SKILL.md` 和 `metadata.json`。对于 JSONL 文件型资产，`SKILL.md` 是检索和业务理解入口，"
        f"同目录原始 JSONL 仍是来源归档；对于不透明 Markdown 也采用同一保留与说明方式。它们不自动等同于可安装或已通过竞聘的运行时 Skill。\n",
        encoding="utf-8",
    )


def main() -> None:
    rows = load_rows()
    folder_index = load_folder_index(FOLDER_INDEX_PATH)
    generated_at = dt.datetime.now().astimezone().isoformat(timespec="seconds")
    manifest: list[dict] = []
    errors: list[str] = []
    standard_count = 0
    markdown_count = 0
    jsonl_count = 0
    opaque_markdown_count = 0
    opaque_standard_count = 0

    for row in rows:
        skill_id = str(row.get("skill_id", "")).strip()
        folder = archive_folder_for(row, folder_index)
        entry = folder / "SKILL.md"
        entry_type = row.get("entry_type", "")

        if not skill_id or not folder.is_dir():
            errors.append(f"{skill_id or '<empty skill_id>'}: archive folder missing")
            continue

        if entry_type == "paper_file_skill":
            source_asset = source_asset_for(folder, row)
            if source_asset is None:
                errors.append(f"{skill_id}: archived source asset missing")
                continue
            if source_asset.suffix.lower() == ".md" and readable_text(source_asset):
                shutil.copy2(source_asset, entry)
                markdown_count += 1
                state = "mirrored_readable_markdown_source"
            elif source_asset.suffix.lower() == ".jsonl":
                entry.write_text(source_wrapper(row, source_asset, "jsonl", "`paper_to_skills`"), encoding="utf-8")
                jsonl_count += 1
                state = "generated_jsonl_wrapper"
            elif source_asset.suffix.lower() == ".md":
                entry.write_text(source_wrapper(row, source_asset, "opaque_markdown", "`paper_to_skills`"), encoding="utf-8")
                opaque_markdown_count += 1
                state = "generated_opaque_markdown_wrapper"
            else:
                errors.append(f"{skill_id}: unsupported file asset {source_asset.name}")
                continue
        elif (folder / "SOURCE_SKILL.md").is_file():
            source_asset = folder / "SOURCE_SKILL.md"
            entry.write_text(
                source_wrapper(row, source_asset, "opaque_standard_skill", "原目录型 Skill 的不可读归档副本"),
                encoding="utf-8",
            )
            opaque_standard_count += 1
            state = "generated_opaque_standard_skill_wrapper"
        elif entry.is_file() and readable_text(entry):
            standard_count += 1
            state = "existing_standard_entry"
            source_asset = None
        elif entry.is_file():
            source_asset = folder / "SOURCE_SKILL.md"
            if not source_asset.is_file():
                shutil.move(entry, source_asset)
            entry.write_text(
                source_wrapper(row, source_asset, "opaque_standard_skill", "原目录型 Skill 的不可读归档副本"),
                encoding="utf-8",
            )
            opaque_standard_count += 1
            state = "generated_opaque_standard_skill_wrapper"
        else:
            errors.append(f"{skill_id}: standard skill entry missing")
            continue

        manifest.append(
            {
                "skill_id": skill_id,
                "英文名称": row.get("英文名称", ""),
                "中文名称": row.get("中文名称", ""),
                "entry_type": entry_type,
                "archive_directory": str(folder.resolve()),
                "archive_folder_name": folder.name,
                "核心功能目录名": folder_index.get(skill_id, {}).get("core_function", ""),
                "目录命名依据": folder_index.get(skill_id, {}).get("naming_basis", ""),
                "SKILL_md": str(entry.resolve()),
                "archive_entry_status": state,
                "source_asset": str(source_asset.resolve()) if source_asset else "SKILL.md is the archived source entry",
                "source_path": row.get("source_path", ""),
            }
        )

    if errors:
        raise RuntimeError("Archive normalization did not complete:\n" + "\n".join(errors[:50]))

    if len(manifest) != len(rows):
        raise RuntimeError("Manifest count does not equal inventory count")
    if any(not Path(item["SKILL_md"]).is_file() for item in manifest):
        raise RuntimeError("At least one manifest entry does not have a SKILL.md file")

    MANIFEST_JSON.write_text(
        json.dumps(
            {
                "generated_at": generated_at,
                "inventory_source": str(INVENTORY_PATH.resolve()),
                "record_count": len(manifest),
                "notes": [
                    "Every inventory record has exactly one archive directory and SKILL.md entry.",
                    "JSONL paper assets retain their original archived JSONL next to a business-readable SKILL.md wrapper.",
                    "This archive structure is a retrieval layer, not a claim of runtime availability or business authorization.",
                ],
                "records": manifest,
            },
            ensure_ascii=False,
            indent=2,
        ) + "\n",
        encoding="utf-8",
    )
    with MANIFEST_CSV.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(manifest[0].keys()))
        writer.writeheader()
        writer.writerows(manifest)

    write_archive_readme(
        len(rows),
        standard_count,
        markdown_count,
        jsonl_count,
        opaque_markdown_count,
        opaque_standard_count,
    )
    REPORT_PATH.write_text(
        "# Skill 归档入口核对\n\n"
        f"- 核对时间：{generated_at}\n"
        f"- 对照清单：`skill_inventory_enriched.json`\n"
        f"- Excel/JSON 记录数：{len(rows)}\n"
        f"- 可读的标准目录型入口：{standard_count}\n"
        f"- 可读 Markdown 文件型资产镜像为 `SKILL.md`：{markdown_count}\n"
        f"- 文件型 JSONL 资产生成 `SKILL.md` 说明入口：{jsonl_count}\n"
        f"- 不透明 Markdown 资产生成 `SKILL.md` 说明入口：{opaque_markdown_count}\n"
        f"- 不透明标准目录型入口生成 `SKILL.md` 说明入口：{opaque_standard_count}\n"
        f"- 缺失入口：0\n\n"
        f"## 完整性结论\n\n"
        f"`skills/<skill_id>/SKILL.md` 现已覆盖清单中全部 {len(rows)} 条记录，并可通过 `skill_archive_manifest.csv` 或 `skill_archive_manifest.json` 回查原始来源和归档位置。\n\n"
        f"## 口径边界\n\n"
        f"- 可读 Markdown 文件型资产：`SKILL.md` 是同目录归档 Markdown 的副本。\n"
        f"- JSONL 文件型资产：`SKILL.md` 是基于清单字段生成的可读入口，原始 JSONL 文件保留在同目录；它不被伪装成标准 Skill 规范。\n"
        f"- 不透明 Markdown 文件型资产：同样保留原始文件，但 `SKILL.md` 只提供清单级入口，不声称原始内容可读。\n"
        f"- 不透明标准目录型入口：原始字节移动为同目录 `SOURCE_SKILL.md`，`SKILL.md` 改为明确的待复核入口，以避免二进制伪装为可读技能说明。\n"
        f"- 本操作不修改任何 `/Users/lute` 或 iCloud 的原始来源，不改变当前 Codex 可用性、竞聘状态或业务授权。\n",
        encoding="utf-8",
    )
    print(
        json.dumps(
            {
                "records": len(rows),
                "existing_standard_entries": standard_count,
                "mirrored_markdown_entries": markdown_count,
                "generated_jsonl_wrappers": jsonl_count,
                "generated_opaque_markdown_wrappers": opaque_markdown_count,
                "generated_opaque_standard_skill_wrappers": opaque_standard_count,
                "missing_entries": 0,
                "manifest": str(MANIFEST_JSON),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
