import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'

import { HEXAGRAM_DATA } from '../src/data/hexagrams.js'
import { buildLiuyaoDetail } from '../src/utils/liuyaoDetail.js'

function findHexagram(values) {
  const code = values.map(value => value === 7 || value === 9 ? '9' : '6').join('')
  return HEXAGRAM_DATA.find(item => item.code === code)
}

for (let encoded = 0; encoded < 4 ** 6; encoded += 1) {
  let remainder = encoded
  const values = Array.from({ length: 6 }, () => {
    const value = [6, 7, 8, 9][remainder % 4]
    remainder = Math.floor(remainder / 4)
    return value
  })
  const changedValues = values.map(value => value === 6 || value === 9 ? 15 - value : value)
  const currentHexagram = findHexagram(values)
  const hasChange = values.some(value => value === 6 || value === 9)
  const detail = buildLiuyaoDetail({
    yaoValues: values,
    currentHexagram,
    changedHexagram: hasChange ? findHexagram(changedValues) : null,
    calendar: { ganzhi: { day: '庚申' } },
    hexagramData: HEXAGRAM_DATA
  })

  assert.ok(detail)
  assert.equal(detail.rows.length, 6)
  assert.equal(detail.rows.filter(row => row.actualChange).length, values.filter(value => value === 6 || value === 9).length)
  assert.ok(detail.rows.every(row => row.hiddenCandidate))
  assert.equal(detail.calendar.shenSha.贵人, '寅，午')
}

const PALACE_HEXAGRAMS = {
  乾: ['乾', '姤', '遁', '否', '观', '剥', '晋', '大有'],
  兑: ['兑', '困', '萃', '咸', '蹇', '谦', '小过', '归妹'],
  离: ['离', '旅', '鼎', '未济', '蒙', '涣', '讼', '同人'],
  震: ['震', '豫', '解', '恒', '升', '井', '大过', '随'],
  巽: ['巽', '小畜', '家人', '益', '无妄', '噬嗑', '颐', '蛊'],
  坎: ['坎', '节', '屯', '既济', '革', '丰', '明夷', '师'],
  艮: ['艮', '贲', '大畜', '损', '睽', '履', '中孚', '渐'],
  坤: ['坤', '复', '临', '泰', '大壮', '夬', '需', '比']
}
const PALACE_ROLES = ['本宫', '一世', '二世', '三世', '四世', '五世', '游魂', '归魂']
const PALACE_MARKERS = [[6, 3], [1, 4], [2, 5], [3, 6], [4, 1], [5, 2], [4, 1], [3, 6]]

for (const [palaceName, names] of Object.entries(PALACE_HEXAGRAMS)) {
  names.forEach((name, index) => {
    const hexagram = HEXAGRAM_DATA.find(item => item.simpleName === name)
    const values = [...hexagram.code].map(value => value === '9' ? 7 : 8)
    const detail = buildLiuyaoDetail({
      yaoValues: values,
      currentHexagram: hexagram,
      changedHexagram: null,
      calendar: { ganzhi: { day: '甲子' } },
      hexagramData: HEXAGRAM_DATA
    })
    assert.equal(detail.palace.name, palaceName, name)
    assert.equal(detail.palace.role, PALACE_ROLES[index], name)
    const shi = detail.rows.find(row => row.current.marker === '世')?.lineNumber
    const ying = detail.rows.find(row => row.current.marker === '应')?.lineNumber
    assert.deepEqual([shi, ying], PALACE_MARKERS[index], name)
  })
}

function runCli(args) {
  return JSON.parse(execFileSync(process.execPath, ['scripts/paipan.mjs', ...args], { encoding: 'utf8' }))
}

const cliDetail = runCli([
  '--lines', '9', '7', '7', '7', '7', '7', '--day', '甲子', '--month', '申'
])
assert.equal(cliDetail.rows.filter(row => row.actualChange).length, 1)
assert.equal(cliDetail.calendar.emptyBranches, '戌亥')
assert.equal(cliDetail.calendar.monthBranch, '申')

const partialDetail = runCli(['--lines', '7', '7', '7', '7', '7', '7', '--day', '甲子'])
assert.equal(partialDetail.changedPalace, null)
assert.equal(partialDetail.calendar.monthBranch, undefined)

const midnightDetail = runCli([
  '--lines', '7', '7', '7', '7', '7', '7', '--at', '2026-09-06T23:30:00', '--day-boundary', 'midnight'
])
const zi23Detail = runCli([
  '--lines', '7', '7', '7', '7', '7', '7', '--at', '2026-09-06T23:30:00', '--day-boundary', 'zi23'
])
assert.deepEqual(midnightDetail.calendar.ganzhi, { year: '丙午', month: '丙申', day: '癸未', hour: '壬子' })
assert.deepEqual(zi23Detail.calendar.ganzhi, { year: '丙午', month: '丙申', day: '甲申', hour: '甲子' })
assert.equal(midnightDetail.calendar.monthBranch, '申')

for (const args of [
  ['--lines', '7', '7', '7', '7', '7', '123', '--day', '甲子'],
  ['--lines', '7', '7', '7', '7', '7', '7', '--day', '甲子', '--month', '垃圾申'],
  ['--lines', '7', '7', '7', '7', '7', '7', '--at', '2026-02-30T12:00:00']
]) {
  const invalid = spawnSync(process.execPath, ['scripts/paipan.mjs', ...args], { encoding: 'utf8' })
  assert.equal(invalid.status, 2)
  assert.ok(invalid.stderr.trim())
}

console.log(JSON.stringify({
  status: 'pass',
  combinations: 4 ** 6,
  palaces: 64,
  cli: 'pass',
  dayBoundaries: 'pass',
  invalidInputs: 'pass'
}))
