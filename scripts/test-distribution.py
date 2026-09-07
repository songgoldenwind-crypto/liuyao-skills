#!/usr/bin/env python3
"""Integration tests for installer layouts and generated archives."""

from __future__ import annotations

import subprocess
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
INSTALLER = REPO_ROOT / "scripts" / "install.py"
PACKAGER = REPO_ROOT / "scripts" / "package-skills.py"
SKILLS = ("liuyao", "liuyao-divination")

USER_LAYOUTS = (
    ".agents/skills",
    ".claude/skills",
    ".cursor/skills",
    ".gemini/skills",
    ".copilot/skills",
    ".config/opencode/skills",
    ".codeium/windsurf/skills",
    ".cline/skills",
)

PROJECT_LAYOUTS = (
    ".agents/skills",
    ".claude/skills",
    ".cursor/skills",
    ".gemini/skills",
    ".github/skills",
    ".opencode/skills",
    ".windsurf/skills",
    ".cline/skills",
)


def run(*args: str, expect: int = 0) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(
        [sys.executable, *args],
        cwd=REPO_ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    if result.returncode != expect:
        raise AssertionError(
            f"expected exit {expect}, got {result.returncode}\nstdout:\n{result.stdout}\nstderr:\n{result.stderr}"
        )
    return result


class InstallerTests(unittest.TestCase):
    def assert_layouts(self, root: Path, layouts: tuple[str, ...]) -> None:
        for layout in layouts:
            for skill in SKILLS:
                self.assertTrue((root / layout / skill / "SKILL.md").is_file())

    def test_all_user_layouts(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            run(str(INSTALLER), "--agent", "all", "--scope", "user", "--target", str(root))
            self.assert_layouts(root, USER_LAYOUTS)

    def test_all_project_layouts(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            run(str(INSTALLER), "--agent", "all", "--scope", "project", "--target", str(root))
            self.assert_layouts(root, PROJECT_LAYOUTS)

    def test_existing_directory_requires_force(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            destination = root / ".agents/skills/liuyao"
            destination.mkdir(parents=True)
            marker = destination / "old.txt"
            marker.write_text("old", encoding="utf-8")
            run(str(INSTALLER), "--target", str(root), "--skill", "liuyao", expect=1)
            self.assertTrue(marker.exists())
            run(str(INSTALLER), "--target", str(root), "--skill", "liuyao", "--force")
            self.assertFalse(marker.exists())
            self.assertTrue((destination / "SKILL.md").is_file())

    def test_dry_run_and_custom_destination(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            destination = root / "my-agent/skills"
            run(
                str(INSTALLER), "--agent", "custom", "--destination", str(destination),
                "--skill", "liuyao-divination", "--dry-run",
            )
            self.assertFalse(destination.exists())
            run(
                str(INSTALLER), "--agent", "custom", "--destination", str(destination),
                "--skill", "liuyao-divination",
            )
            self.assertTrue((destination / "liuyao-divination/SKILL.md").is_file())


class PackagingTests(unittest.TestCase):
    def test_upload_and_plugin_archives(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            output = Path(temporary)
            run(str(PACKAGER), "--output", str(output))
            for skill in SKILLS:
                skill_archive = output / f"{skill}.skill"
                agent_zip_archive = output / f"{skill}-agent.zip"
                zip_archive = output / f"{skill}.zip"
                self.assertEqual(skill_archive.read_bytes(), agent_zip_archive.read_bytes())
                with zipfile.ZipFile(skill_archive) as archive:
                    names = archive.namelist()
                    self.assertIn("SKILL.md", names)
                    self.assertIn("LICENSE", names)
                    self.assertTrue(archive.read("LICENSE").startswith(b"MIT License\n"))
                    self.assertFalse(any(name.startswith(f"{skill}/") for name in names))
                with zipfile.ZipFile(zip_archive) as archive:
                    names = archive.namelist()
                    self.assertIn(f"{skill}/SKILL.md", names)
                    self.assertIn(f"{skill}/LICENSE", names)
                    self.assertTrue(
                        archive.read(f"{skill}/LICENSE").startswith(b"MIT License\n")
                    )
                    self.assertFalse("SKILL.md" in names)

            with zipfile.ZipFile(output / "liuyao-skills-plugin.zip") as archive:
                names = archive.namelist()
                self.assertIn(".codex-plugin/plugin.json", names)
                self.assertIn(".claude-plugin/plugin.json", names)
                self.assertIn("skills/liuyao/SKILL.md", names)
                self.assertIn("skills/liuyao-divination/SKILL.md", names)
                self.assertTrue(archive.read("LICENSE").startswith(b"MIT License\n"))
                self.assertNotIn(".claude-plugin/marketplace.json", names)


if __name__ == "__main__":
    unittest.main()
