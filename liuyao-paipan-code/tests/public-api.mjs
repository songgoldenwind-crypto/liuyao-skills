import assert from 'node:assert/strict'

import {
  HEXAGRAM_DATA,
  InputValidationError,
  buildLiuyaoDetail,
  normalizeCivilTime,
  simplifyHexagramRecord,
  toSimplifiedText,
  useDivination
} from 'liuyao-paipan-code'

assert.deepEqual(
  normalizeCivilTime({ year: 2024, month: 2, day: 29 }),
  { year: 2024, month: 2, day: 29, hour: 0, minute: 0, second: 0 }
)
for (const time of [
  { year: 2026, month: 2, day: 30 },
  { year: 2026, month: 13, day: 1 },
  { year: 2026, month: 3, day: 17, hour: 24 },
  { year: '2026', month: 3, day: 17 }
]) {
  assert.throws(() => normalizeCivilTime(time), InputValidationError)
}

const divination = useDivination()
const secureThrow = divination.doThrow()
assert.equal(secureThrow.coins.length, 3)
assert.ok([6, 7, 8, 9].includes(secureThrow.value))
divination.reset()
divination.setYaoValues([9, 7, 7, 7, 7, 7])
assert.equal(divination.currentHexagram.value.simpleName, '乾')
assert.equal(divination.changedHexagram.value.simpleName, '姤')
assert.deepEqual(divination.manualChanging.value, [true, false, false, false, false, false])
assert.deepEqual(divination.coinResults.value, [])

divination.toggleChanging(1)
assert.equal(divination.yaoValues.value[1], 9)
assert.deepEqual(divination.manualChanging.value, [true, true, false, false, false, false])
assert.throws(() => divination.toggleChanging(6), InputValidationError)
assert.throws(() => divination.setYaoValues([7]), InputValidationError)
assert.throws(() => divination.setYaoValues([7, 7, 7, 7, 7, 123]), InputValidationError)

divination.question.value = '测试问题'
divination.reset()
assert.equal(divination.question.value, '')
assert.equal(divination.isComplete.value, false)
assert.deepEqual(divination.manualChanging.value, [false, false, false, false, false, false])

const throws = [[0, 0, 0], [1, 1, 1], [0, 1, 1], [0, 1, 0], [1, 0, 0], [1, 1, 0]]
const deterministic = useDivination({ coinSource: () => throws.shift() })
for (let index = 0; index < 6; index += 1) deterministic.doThrow()
assert.deepEqual(deterministic.yaoValues.value, [6, 9, 8, 7, 7, 8])
assert.throws(() => useDivination(null), InputValidationError)
assert.throws(() => useDivination({ coinSource: 1 }), InputValidationError)
assert.throws(
  () => useDivination({ coinSource: () => [0, 1, 2] }).doThrow(),
  InputValidationError
)

const externallyMutated = useDivination()
externallyMutated.yaoValues.value = [7, 7, 7, 7, 7, 123]
assert.equal(externallyMutated.isComplete.value, false)
assert.equal(externallyMutated.currentHexagram.value, null)
assert.equal(externallyMutated.changedHexagram.value, null)
assert.equal(externallyMutated.trigrams.value, null)

assert.equal(toSimplifiedText('乾為天，自強不息，潛龍勿用。'), '乾为天，自强不息，潜龙勿用。')
assert.equal(toSimplifiedText('終日乾乾'), '终日乾乾')

const qian = HEXAGRAM_DATA.find(item => item.simpleName === '乾')
const meng = HEXAGRAM_DATA.find(item => item.simpleName === '蒙')
const tun = HEXAGRAM_DATA.find(item => item.simpleName === '屯')
assert.equal(qian.yaoCi[1].text, '見龍在田，利見大人。')
assert.match(meng.guaCi, /初筮告/)
assert.match(tun.yaoXiang.join(''), /即鹿無虞/)
assert.doesNotMatch(JSON.stringify(HEXAGRAM_DATA), /見龍再田|初噬告|既鹿無虞/)
const simplifiedQian = simplifyHexagramRecord(qian)
assert.match(simplifiedQian.xiangCi, /自强不息/)
assert.doesNotMatch(simplifiedQian.xiangCi, /自強/)

function collectText(value) {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(collectText)
  if (value && typeof value === 'object') return Object.values(value).flatMap(collectText)
  return []
}

for (const hexagram of HEXAGRAM_DATA.map(simplifyHexagramRecord)) {
  for (const text of collectText(hexagram)) {
    assert.equal(toSimplifiedText(text), text, `${hexagram.simpleName}: ${text}`)
  }
}

const stableValues = [7, 7, 7, 7, 7, 7]
const validDetail = buildLiuyaoDetail({
  yaoValues: stableValues,
  currentHexagram: qian,
  changedHexagram: null,
  calendar: null,
  hexagramData: HEXAGRAM_DATA
})
assert.ok(validDetail)
assert.equal(buildLiuyaoDetail({
  yaoValues: stableValues,
  currentHexagram: HEXAGRAM_DATA.find(item => item.simpleName === '坤'),
  changedHexagram: null,
  calendar: null,
  hexagramData: HEXAGRAM_DATA
}), null)

console.log(JSON.stringify({
  status: 'pass',
  publicApi: 'pass',
  validation: 'pass',
  coinSource: 'pass',
  textConversion: 'pass'
}))
