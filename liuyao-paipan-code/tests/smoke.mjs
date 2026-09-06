import assert from 'node:assert/strict'

import { HEXAGRAM_DATA, GUA_CODE_TABLE } from '../src/data/hexagrams.js'
import { buildLiuyaoDetail } from '../src/utils/liuyaoDetail.js'

function findByYao(values) {
  const code = values.map(value => (value === 7 || value === 9) ? '9' : '6').join('')
  const entry = GUA_CODE_TABLE.find(item => item.code === code)
  assert.ok(entry, `missing gua code: ${code}`)
  const hexagram = HEXAGRAM_DATA.find(item => item.simpleName === entry.name)
  assert.ok(hexagram, `missing hexagram: ${entry.name}`)
  return hexagram
}

const yaoValues = [9, 7, 7, 7, 7, 7]
const changedValues = yaoValues.map(value => (value === 6 || value === 9) ? 15 - value : value)
const currentHexagram = findByYao(yaoValues)
const changedHexagram = findByYao(changedValues)
const detail = buildLiuyaoDetail({
  yaoValues,
  currentHexagram,
  changedHexagram,
  calendar: { ganzhi: { day: '甲子' } },
  hexagramData: HEXAGRAM_DATA
})

assert.equal(detail.rows.length, 6)
assert.equal(detail.rows.filter(row => row.current.move).length, 1)
assert.equal(detail.calendar.emptyBranches, '戌亥')
assert.equal(detail.calendar.shenSha.驿马, '寅')
assert.ok(detail.palace.name)
assert.ok(detail.changedPalace.name)

console.log(JSON.stringify({
  status: 'pass',
  current: currentHexagram.simpleName,
  changed: changedHexagram.simpleName,
  palace: detail.palace,
  rows: detail.rows.length,
  emptyBranches: detail.calendar.emptyBranches
}, null, 2))
