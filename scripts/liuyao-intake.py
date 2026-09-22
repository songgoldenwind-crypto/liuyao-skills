#!/usr/bin/env python3
"""Normalize six bottom-up line results, then call the public Liuyao chart engine."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path


LINE_VALUES = {
    "6": 6, "老阴": 6, "老陰": 6,
    "7": 7, "少阳": 7, "少陽": 7,
    "8": 8, "少阴": 8, "少陰": 8,
    "9": 9, "老阳": 9, "老陽": 9,
}


def engine_script() -> Path:
    root = Path(__file__).resolve().parents[1]
    bundled = root / "scripts" / "liuyao-paipan" / "scripts" / "paipan.mjs"
    source = root / "liuyao-paipan-code" / "scripts" / "paipan.mjs"
    for candidate in (bundled, source):
        if candidate.is_file():
            return candidate
    raise FileNotFoundError("未找到六爻排盘程序；请检查单卡包或仓库文件是否完整")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="按初爻至上爻输入六次结果，核对并生成确定性六爻盘。"
    )
    parser.add_argument(
        "--lines", nargs=6, required=True, metavar="爻值",
        help="六个 6/7/8/9 或老阴/少阳/少阴/老阳，顺序从初爻到上爻",
    )
    parser.add_argument("--day", help="已核实的六十甲子日柱，如甲子")
    parser.add_argument("--month", help="已核实的节气月支或月柱，如申")
    parser.add_argument("--at", help="起卦地的当地民用时间 YYYY-MM-DDTHH:mm[:ss]")
    parser.add_argument(
        "--day-boundary", choices=("midnight", "zi23"), default="midnight",
        help="公历模式的日界口径，默认午夜换日",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    unknown = [item for item in args.lines if item not in LINE_VALUES]
    if unknown:
        print(
            "无效爻值：" + "、".join(unknown) + "。只接受 6/7/8/9 或老阴/少阳/少阴/老阳。",
            file=sys.stderr,
        )
        return 2

    values = [LINE_VALUES[item] for item in args.lines]
    try:
        script = engine_script()
    except FileNotFoundError as error:
        print(str(error), file=sys.stderr)
        return 2
    command = ["node", str(script), "--lines", *(str(item) for item in values)]
    for option, value in (
        ("--day", args.day), ("--month", args.month),
        ("--at", args.at), ("--day-boundary", args.day_boundary),
    ):
        if value:
            command.extend((option, value))

    try:
        result = subprocess.run(command, text=True, capture_output=True, check=False)
    except (FileNotFoundError, OSError) as error:
        print(f"无法启动六爻排盘程序：{error}", file=sys.stderr)
        return 2
    if result.returncode != 0:
        print(result.stderr.strip() or "六爻排盘失败", file=sys.stderr)
        return result.returncode

    try:
        chart = json.loads(result.stdout)
    except json.JSONDecodeError:
        print("六爻排盘程序返回了无效 JSON", file=sys.stderr)
        return 2
    print(json.dumps({
        "input": {
            "raw_lines": args.lines,
            "normalized_lines": values,
            "line_order": "初爻到上爻",
            "civil_time": args.at,
        },
        "chart": chart,
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
