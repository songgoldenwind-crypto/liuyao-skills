import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'

const python = process.env.LIUYAO_PYTHON || process.env.PYTHON_BIN || 'python3'

function run(body) {
  return spawnSync(python, ['server/python/divination_context.py'], {
    input: JSON.stringify(body),
    encoding: 'utf8'
  })
}

const valid = run({
  time: { year: 2026, month: 3, day: 17, hour: 15, minute: 39, second: 0 },
  dayBoundary: 'midnight'
})
assert.equal(valid.status, 0, valid.stderr)
assert.equal(JSON.parse(valid.stdout).ganzhi.day, '庚寅')

const upperBoundary = run({ time: { year: 9999, month: 12, day: 31, hour: 12 } })
assert.equal(upperBoundary.status, 0, upperBoundary.stderr)
assert.equal(JSON.parse(upperBoundary.stdout).solarTerms.nextJie, null)

for (const body of [
  { time: { year: 2026, month: 2, day: 30 } },
  { time: { year: 2026.5, month: 3, day: 17 } },
  { time: { year: 2026, month: 3, day: 17 }, dayBoundary: 'bad' }
]) {
  const invalid = run(body)
  assert.notEqual(invalid.status, 0)
  assert.ok(invalid.stderr.trim())
}

console.log(JSON.stringify({ status: 'pass', pythonValidation: 'pass' }))
