#!/usr/bin/env python3
"""Build reproducible upload archives for skills and plugin channels."""

from __future__ import annotations

import argparse
import json
import zipfile
from pathlib import Path

from workbuddy_compat import render_workbuddy_method, render_workbuddy_skill


REPO_ROOT = Path(__file__).resolve().parents[1]
SKILLS = ("liuyao", "liuyao-divination")
FIXED_TIMESTAMP = (2020, 1, 1, 0, 0, 0)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Package Liuyao skills for upload and plugins.")
    parser.add_argument(
        "--output",
        type=Path,
        default=REPO_ROOT / "dist",
        help="Output directory (default: ./dist).",
    )
    return parser.parse_args()


def files_under(directory: Path) -> list[Path]:
    return sorted(
        path for path in directory.rglob("*")
        if path.is_file()
        and path.name != ".DS_Store"
        and "__pycache__" not in path.parts
        and path.suffix != ".pyc"
    )


def write_archive(
    path: Path,
    entries: list[tuple[Path, str]],
    *,
    overrides: dict[str, bytes] | None = None,
) -> None:
    overrides = overrides or {}
    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for source, archive_name in sorted(entries, key=lambda item: item[1]):
            info = zipfile.ZipInfo(archive_name, FIXED_TIMESTAMP)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = (0o755 if source.stat().st_mode & 0o111 else 0o644) << 16
            archive.writestr(info, overrides.get(archive_name, source.read_bytes()))


def skill_entries(skill_name: str, *, wrapper: bool) -> list[tuple[Path, str]]:
    skill_root = REPO_ROOT / "skills" / skill_name
    prefix = f"{skill_name}/" if wrapper else ""
    entries = [
        (path, prefix + path.relative_to(skill_root).as_posix())
        for path in files_under(skill_root)
    ]
    entries.append((REPO_ROOT / "LICENSE", prefix + "LICENSE"))
    return entries


def plugin_entries() -> list[tuple[Path, str]]:
    included = [
        REPO_ROOT / ".codex-plugin" / "plugin.json",
        REPO_ROOT / ".claude-plugin" / "plugin.json",
        REPO_ROOT / "README.md",
        REPO_ROOT / "LICENSE",
    ]
    included.extend(path for name in SKILLS for path in files_under(REPO_ROOT / "skills" / name))
    return [(path, path.relative_to(REPO_ROOT).as_posix()) for path in included]


def workbuddy_suite_entries() -> list[tuple[Path, str]]:
    prefix = "liuyao-skills"
    entries = [
        (REPO_ROOT / "workbuddy" / "liuyao-skills" / "SKILL.md", f"{prefix}/SKILL.md"),
        (REPO_ROOT / "LICENSE", f"{prefix}/LICENSE"),
        (REPO_ROOT / "examples" / "quickstart.md", f"{prefix}/references/examples.md"),
        (REPO_ROOT / "scripts" / "liuyao-intake.py", f"{prefix}/scripts/liuyao-intake.py"),
        (
            REPO_ROOT / "skills" / "liuyao-divination" / "scripts" / "time_segments.py",
            f"{prefix}/scripts/time_segments.py",
        ),
    ]
    for skill_name in SKILLS:
        skill_root = REPO_ROOT / "skills" / skill_name
        entries.append(
            (skill_root / "SKILL.md", f"{prefix}/references/{skill_name}/method.md")
        )
        entries.extend(
            (path, f"{prefix}/references/{skill_name}/references/"
                   + path.relative_to(skill_root / "references").as_posix())
            for path in files_under(skill_root / "references")
        )

    engine_root = REPO_ROOT / "liuyao-paipan-code"
    engine_files = [
        *files_under(engine_root / "src"),
        *files_under(engine_root / "server"),
        engine_root / "scripts" / "paipan.mjs",
        *(engine_root / name for name in (
            "package.json", "package-lock.json", "requirements.txt", "README.md", "LICENSE"
        )),
    ]
    entries.extend(
        (path, f"{prefix}/scripts/liuyao-paipan/"
         + path.relative_to(engine_root).as_posix())
        for path in engine_files
    )
    return entries


def plugin_version() -> str:
    manifest = REPO_ROOT / ".codex-plugin" / "plugin.json"
    return json.loads(manifest.read_text(encoding="utf-8"))["version"]


def main() -> None:
    args = parse_args()
    output = args.output.expanduser().resolve()
    output.mkdir(parents=True, exist_ok=True)

    built: list[Path] = []
    version = plugin_version()
    for skill_name in SKILLS:
        skill_path = output / f"{skill_name}.skill"
        # Portable/OpenAI skill bundles expose SKILL.md at the archive root.
        write_archive(skill_path, skill_entries(skill_name, wrapper=False))
        agent_zip_path = output / f"{skill_name}-agent.zip"
        write_archive(agent_zip_path, skill_entries(skill_name, wrapper=False))
        # Claude upload ZIPs contain the named skill folder at the archive root.
        zip_path = output / f"{skill_name}.zip"
        write_archive(zip_path, skill_entries(skill_name, wrapper=True))
        # WorkBuddy upload archives use a named wrapper directory, platform
        # metadata, and explicit @references paths.
        workbuddy_path = output / f"{skill_name}-workbuddy.zip"
        workbuddy_skill_name = f"{skill_name}/SKILL.md"
        canonical = (REPO_ROOT / "skills" / skill_name / "SKILL.md").read_text(
            encoding="utf-8"
        )
        write_archive(
            workbuddy_path,
            skill_entries(skill_name, wrapper=True),
            overrides={
                workbuddy_skill_name: render_workbuddy_skill(
                    skill_name, canonical, version
                ).encode("utf-8")
            },
        )
        built.extend((skill_path, agent_zip_path, zip_path, workbuddy_path))

    plugin_path = output / "liuyao-skills-plugin.zip"
    write_archive(plugin_path, plugin_entries())
    built.append(plugin_path)

    suite_source = REPO_ROOT / "workbuddy" / "liuyao-skills" / "SKILL.md"
    suite_overrides = {
        "liuyao-skills/SKILL.md": render_workbuddy_skill(
            "liuyao-skills", suite_source.read_text(encoding="utf-8"), version
        ).encode("utf-8")
    }
    for skill_name in SKILLS:
        method_source = REPO_ROOT / "skills" / skill_name / "SKILL.md"
        suite_overrides[f"liuyao-skills/references/{skill_name}/method.md"] = (
            render_workbuddy_method(
                skill_name, method_source.read_text(encoding="utf-8")
            ).encode("utf-8")
        )
    suite_path = output / "liuyao-skills-workbuddy.zip"
    write_archive(suite_path, workbuddy_suite_entries(), overrides=suite_overrides)
    built.append(suite_path)

    for path in built:
        print(path)


if __name__ == "__main__":
    main()
