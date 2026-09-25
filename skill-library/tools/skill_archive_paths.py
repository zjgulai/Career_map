"""Naming and lookup helpers for the human-facing local skill archive."""

from __future__ import annotations

import json
from pathlib import Path
import re


def clean_label(value: object, limit: int = 42) -> str:
    text = str(value or "").replace("\r", " ").replace("\n", " ")
    text = "".join(character if character >= " " else " " for character in text)
    text = text.replace("\ufffd", "")
    text = re.sub(r"^\s*(?:待补|待确认)\s*[：:]\s*", "", text, flags=re.I)
    text = re.sub(r"^\s*skill[-_\s]+", "", text, flags=re.I)
    text = re.sub(r"[\\/:*?\"<>|`]+", " ", text)
    text = re.sub(r"[()\[\]{}（）【】]+", " ", text)
    text = re.sub(r"\s+", "-", text.strip())
    text = re.sub(r"-+", "-", text).strip("-.")
    return text[:limit].rstrip("-.")


def is_placeholder(value: object) -> bool:
    text = str(value or "").strip()
    return not text or text.startswith(("待补", "待确认")) or "\ufffd" in text


def serial_for(row: dict) -> str:
    skill_id = str(row.get("skill_id", ""))
    match = re.match(r"^(\d{5})-", skill_id)
    if not match:
        raise ValueError(f"skill_id lacks a five-digit sequence: {skill_id}")
    return match.group(1)


def core_function_for(row: dict, archive_state: str = "") -> tuple[str, str]:
    source_parent = Path(str(row.get("source_path", ""))).parent.name
    is_opaque = "opaque" in archive_state

    if is_opaque:
        label = clean_label(source_parent) or "待复核技能"
        return f"{label}-待复核", "来源目录名 + 待复核状态"

    chinese_name = row.get("中文名称", "")
    if not is_placeholder(chinese_name):
        label = clean_label(chinese_name)
        if label:
            return label, "中文名称"

    english_name = clean_label(row.get("英文名称", ""))
    if english_name:
        return english_name, "英文名称"

    label = clean_label(source_parent) or "待命名技能"
    return label, "来源目录名"


def folder_name_for(row: dict, archive_state: str = "") -> tuple[str, str, str]:
    core_function, basis = core_function_for(row, archive_state)
    return f"{serial_for(row)}-{core_function}", core_function, basis


def load_folder_index(path: Path) -> dict[str, dict]:
    if not path.is_file():
        return {}
    data = json.loads(path.read_text(encoding="utf-8"))
    records = data.get("records", []) if isinstance(data, dict) else []
    return {
        str(record.get("skill_id")): record
        for record in records
        if isinstance(record, dict) and record.get("skill_id") and record.get("folder_name")
    }
