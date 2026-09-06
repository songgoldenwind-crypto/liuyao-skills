#!/usr/bin/env python3
"""将带UTC偏移量的民用钟表时间分为时辰与十分钟流分。"""
import argparse
from datetime import datetime, timedelta
import json

BRANCHES = "子丑寅卯辰巳午未申酉戌亥"


def segment(value):
    moment = datetime.fromisoformat(value)
    if moment.tzinfo is None or moment.utcoffset() is None:
        raise ValueError("时间必须带UTC偏移量，例如2026-09-06T10:51:00+08:00")
    # 使用输入的固定偏移量，避免默认本机时区或暗中修正真太阳时。
    minute = moment.hour * 60 + moment.minute
    elapsed = (minute - 23 * 60) % 120
    hour_index = ((minute + 60) // 120) % 12
    start = moment.replace(second=0, microsecond=0) - timedelta(minutes=elapsed)
    segment_index = elapsed // 10
    sub_start = start + timedelta(minutes=segment_index * 10)
    return {
        "输入时间": moment.isoformat(),
        "时辰": BRANCHES[hour_index],
        "时辰开始": start.isoformat(),
        "时辰结束": (start + timedelta(minutes=120)).isoformat(),
        "流分": BRANCHES[segment_index],
        "流分开始": sub_start.isoformat(),
        "流分结束": (sub_start + timedelta(minutes=10)).isoformat(),
        "区间": "左闭右开",
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("datetime", help="带UTC偏移量的ISO 8601时间")
    args = parser.parse_args()
    try:
        result = segment(args.datetime)
    except ValueError as error:
        parser.error(str(error))
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
