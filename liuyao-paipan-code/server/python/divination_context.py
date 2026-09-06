#!/usr/bin/env python3
import json
import sys
from datetime import datetime

from lunar_python import Solar


STEMS = '甲乙丙丁戊己庚辛壬癸'
BRANCHES = '子丑寅卯辰巳午未申酉戌亥'


def require_integer(time_info, name, default=None):
    value = time_info.get(name, default)
    if isinstance(value, bool) or not isinstance(value, int):
        raise ValueError(f'{name} must be an integer')
    return value


def hour_ganzhi(day_ganzhi, hour):
    branch_index = 0 if hour in (23, 0) else (hour + 1) // 2
    day_stem_index = STEMS.index(day_ganzhi[0])
    stem_index = ((day_stem_index % 5) * 2 + branch_index) % 10
    return STEMS[stem_index] + BRANCHES[branch_index]


def jie_info(jie):
    if jie is None:
        return None
    return {
        'name': jie.getName(),
        'text': jie.getSolar().toYmdHms()
    }


def main():
    payload = json.loads(sys.stdin.read() or '{}')
    time_info = payload.get('time') or {}

    year = require_integer(time_info, 'year')
    month = require_integer(time_info, 'month')
    day = require_integer(time_info, 'day')
    hour = require_integer(time_info, 'hour', 0)
    minute = require_integer(time_info, 'minute', 0)
    second = require_integer(time_info, 'second', 0)
    day_boundary = payload.get('dayBoundary', 'midnight')
    if day_boundary not in ('midnight', 'zi23'):
        raise ValueError('dayBoundary must be midnight or zi23')

    # lunar-python accepts overflowing day numbers such as February 30.
    # datetime performs strict Gregorian validation before calendar conversion.
    datetime(year, month, day, hour, minute, second)

    solar = Solar.fromYmdHms(year, month, day, hour, minute, second)
    lunar = solar.getLunar()
    prev_jie = lunar.getPrevJie(True)
    next_jie = lunar.getNextJie(True)
    day_ganzhi = (
        lunar.getDayInGanZhiExact()
        if day_boundary == 'zi23'
        else lunar.getDayInGanZhiExact2()
    )
    month_ganzhi = lunar.getMonthInGanZhiExact()

    result = {
        'solar': {
            'year': year,
            'month': month,
            'day': day,
            'hour': hour,
            'minute': minute,
            'second': second,
            'text': f'{year}年{month}月{day}日{hour}时{minute}分'
        },
        'lunar': {
            'text': f'{lunar.getYearInGanZhi()}年{lunar.getMonthInChinese()}月{lunar.getDayInChinese()}日{lunar.getTimeZhi()}时'
        },
        'ganzhi': {
            'year': lunar.getYearInGanZhiExact(),
            'month': month_ganzhi,
            'day': day_ganzhi,
            'hour': hour_ganzhi(day_ganzhi, hour)
        },
        'monthBranch': month_ganzhi[-1],
        'dayBoundary': day_boundary,
        'solarTerms': {
            'prevJie': jie_info(prev_jie),
            'nextJie': jie_info(next_jie)
        }
    }

    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
