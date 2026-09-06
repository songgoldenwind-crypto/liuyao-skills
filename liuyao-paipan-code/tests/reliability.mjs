import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

import { runPython } from '../server/utils/pythonProcess.js'

const hangingScript = fileURLToPath(new URL('./fixtures/hanging.mjs', import.meta.url))
const largeOutputScript = fileURLToPath(new URL('./fixtures/large-output.mjs', import.meta.url))

await assert.rejects(
  runPython(process.execPath, hangingScript, '{}', { timeoutMs: 50 }),
  /超过 50 毫秒/
)
await assert.rejects(
  runPython(process.execPath, largeOutputScript, '{}', { outputLimitBytes: 100 }),
  /超过 100 字节限制/
)

console.log(JSON.stringify({ status: 'pass', timeout: 'pass', outputLimit: 'pass' }))
