import assert from 'node:assert/strict'

import app from 'liuyao-paipan-code/server'

const server = app.listen(0)
await new Promise((resolve, reject) => {
  server.once('listening', resolve)
  server.once('error', reject)
})

const baseUrl = `http://127.0.0.1:${server.address().port}`

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options)
  const body = await response.json()
  return { response, body }
}

try {
  const health = await request('/healthz')
  assert.equal(health.response.status, 200)
  assert.deepEqual(health.body, { ok: true })

  const valid = await request('/api/divination/context', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      time: { year: 2026, month: 3, day: 17, hour: 15, minute: 39, second: 0 },
      dayBoundary: 'midnight'
    })
  })
  assert.equal(valid.response.status, 200)
  assert.equal(valid.body.success, true)
  assert.deepEqual(valid.body.context.ganzhi, {
    year: '丙午', month: '辛卯', day: '庚寅', hour: '甲申'
  })

  for (const body of [
    {},
    { time: { year: 2026, month: 2, day: 30 } },
    { time: { year: '2026', month: 3, day: 17 } },
    { time: { year: 2026, month: 3, day: 17 }, dayBoundary: 'bad' }
  ]) {
    const invalid = await request('/api/divination/context', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    })
    assert.equal(invalid.response.status, 400)
    assert.equal(invalid.body.success, false)
  }

  const malformed = await request('/api/divination/context', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{'
  })
  assert.equal(malformed.response.status, 400)
  assert.deepEqual(malformed.body, { success: false, message: '请求体必须是有效 JSON' })
} finally {
  await new Promise(resolve => server.close(resolve))
}

console.log(JSON.stringify({ status: 'pass', server: 'pass', validation: 'pass' }))
