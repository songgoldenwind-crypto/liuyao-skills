#!/usr/bin/env python3
"""Render the canonical Agent Skills sources for WorkBuddy."""

from __future__ import annotations

import json
import re


AUTHOR = "songgoldenwind-crypto"

WORKBUDDY_METADATA = {
    "liuyao": {
        "display_name": "六爻分层断卦",
        "display_name_en": "Layered Liuyao Reading",
        "description_zh": (
            "按原时定局、日辰主宰、作用层级、动变顺序、开闭伏与真假空亡核盘并断卦。"
        ),
        "description_en": (
            "Verify and interpret Liuyao charts using the original casting time, "
            "day authority, interaction levels, moving-line sequence, hidden spirits, "
            "and void-state rules."
        ),
    },
    "liuyao-divination": {
        "display_name": "六爻测算",
        "display_name_en": "Liuyao Divination",
        "description_zh": (
            "用于六爻起卦、核盘和断卦，按世爻用神人、体用、双原与病药体系分析具体占问。"
        ),
        "description_en": (
            "Cast, verify, and interpret Liuyao charts with the subject-line, body-use, "
            "dual-source, imbalance, and remedy method for concrete questions."
        ),
    },
}

FRONTMATTER = re.compile(r"\A---\n(?P<header>[\s\S]*?)\n---\n(?P<body>[\s\S]*)\Z")
REFERENCE_LINK = re.compile(r"\[[^\]]+\]\((references/[^)]+)\)")


def yaml_string(value: str) -> str:
    """Return a JSON string, which is also a valid YAML scalar."""
    return json.dumps(value, ensure_ascii=False)


def frontmatter_value(header: str, field: str) -> str:
    match = re.search(rf"^{re.escape(field)}:\s*(.+)$", header, flags=re.MULTILINE)
    if not match:
        raise ValueError(f"canonical SKILL.md is missing {field}")
    return match.group(1).strip()


def render_workbuddy_skill(skill_name: str, canonical: str, version: str) -> str:
    """Add WorkBuddy metadata and its explicit @references syntax."""
    if skill_name not in WORKBUDDY_METADATA:
        raise ValueError(f"unsupported WorkBuddy skill: {skill_name}")

    parsed = FRONTMATTER.fullmatch(canonical)
    if not parsed:
        raise ValueError(f"{skill_name}: malformed SKILL.md frontmatter")

    header = parsed.group("header")
    if frontmatter_value(header, "name") != skill_name:
        raise ValueError(f"{skill_name}: frontmatter name does not match directory")

    description = frontmatter_value(header, "description")
    metadata = WORKBUDDY_METADATA[skill_name]
    body = REFERENCE_LINK.sub(lambda match: f"@{match.group(1)}", parsed.group("body"))

    fields = (
        ("name", skill_name),
        ("display_name", metadata["display_name"]),
        ("display_name_en", metadata["display_name_en"]),
        ("description", description),
        ("description_zh", metadata["description_zh"]),
        ("description_en", metadata["description_en"]),
        ("version", version),
        ("author", AUTHOR),
        ("allowed-tools", "Read, Bash"),
    )
    rendered_header = "\n".join(f"{key}: {yaml_string(value)}" for key, value in fields)
    return f"---\n{rendered_header}\n---\n{body}"
