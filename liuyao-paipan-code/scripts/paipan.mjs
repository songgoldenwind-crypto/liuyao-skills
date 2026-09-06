#!/usr/bin/env node

import { HEXAGRAM_DATA } from '../src/data/hexagrams.js'
import { buildLiuyaoDetail } from '../src/utils/liuyaoDetail.js'
import {
  assertYaoValues,
  isValidGanzhi,
  normalizeCivilTime,
  normalizeDayBoundary,
  normalizeMonthBranch
} from '../src/utils/inputValidation.js'
import { getDivinationContext } from '../server/utils/divinationCalendar.js'

function fail(message) {
  process.stderr.write(`${message}\n`)
  process.exit(2)
}

function parseArgs(argv) {
  const result = { dayBoundary: 'midnight' }
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--lines') {
      result.lines = argv.slice(index + 1, index + 7).map(Number)
      index += 6
    } else if (arg === '--day') {
      result.day = argv[++index]
    } else if (arg === '--month') {
      result.month = argv[++index]
    } else if (arg === '--at') {
      result.at = argv[++index]
    } else if (arg === '--day-boundary') {
      result.dayBoundary = argv[++index]
    } else if (arg === '--help' || arg === '-h') {
      result.help = true
    } else {
      fail(`未知参数：${arg}`)
    }
  }
  return result
}

function usage() {
  return [
    '用法：',
    '  node scripts/paipan.mjs --lines 6 7 8 9 7 8 --day 甲子 --month 申',
    '  node scripts/paipan.mjs --lines 6 7 8 9 7 8 --at 2026-09-06T20:00:00 --day-boundary midnight',
    '',
    '--lines 固定按初爻至上爻输入；6老阴、7少阳、8少阴、9老阳。',
    '--at 按目标地点的当地民用时间解释；日界可选 midnight 或 zi23。'
  ].join('\n')
}

function findHexagram(values) {
  const code = values.map(value => (value === 7 || value === 9) ? '9' : '6').join('')
  return HEXAGRAM_DATA.find(item => item.code === code) || null
}

function parseCivilTime(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value || '')
  if (!match) fail('--at 必须为 YYYY-MM-DDTHH:mm[:ss] 格式')
  const [, year, month, day, hour, minute, second = '0'] = match
  try {
    return normalizeCivilTime(
      Object.fromEntries(
        Object.entries({ year, month, day, hour, minute, second })
          .map(([key, part]) => [key, Number(part)])
      )
    )
  } catch (error) {
    fail(error.message)
  }
}

const args = parseArgs(process.argv.slice(2))
if (args.help) {
  process.stdout.write(`${usage()}\n`)
  process.exit(0)
}
try {
  assertYaoValues(args.lines)
  normalizeDayBoundary(args.dayBoundary)
} catch (error) {
  fail(error.message)
}
if (args.day && !isValidGanzhi(args.day)) fail('--day 必须是合法六十甲子日柱')
let monthBranch = null
if (args.month) {
  try {
    monthBranch = normalizeMonthBranch(args.month)
  } catch (error) {
    fail(error.message)
  }
}

let calendar = null
if (args.at) {
  try {
    calendar = await getDivinationContext(parseCivilTime(args.at), args.dayBoundary)
  } catch (error) {
    fail(`日历计算失败：${error.message}`)
  }
}
if (calendar?.ganzhi?.month) calendar.monthBranch = calendar.ganzhi.month.at(-1)
if (!calendar && args.day) calendar = { ganzhi: { day: args.day }, dayBoundary: args.dayBoundary }
if (args.day) calendar = { ...(calendar || {}), ganzhi: { ...(calendar?.ganzhi || {}), day: args.day } }
if (args.month) {
  calendar = {
    ...(calendar || {}),
    monthBranch,
    ganzhi: { ...(calendar?.ganzhi || {}), month: args.month }
  }
}

const changedValues = args.lines.map(value => value === 6 || value === 9 ? 15 - value : value)
const currentHexagram = findHexagram(args.lines)
const hasChange = args.lines.some(value => value === 6 || value === 9)
const changedHexagram = hasChange ? findHexagram(changedValues) : null
const detail = buildLiuyaoDetail({
  yaoValues: args.lines,
  currentHexagram,
  changedHexagram,
  calendar,
  hexagramData: HEXAGRAM_DATA
})

if (!detail) fail('排盘失败')
process.stdout.write(`${JSON.stringify(detail, null, 2)}\n`)
