import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { normalizeCivilTime, normalizeDayBoundary } from '../../src/utils/inputValidation.js'
import { runPython } from './pythonProcess.js'

function getPythonCandidates() {
  return [
    process.env.LIUYAO_PYTHON,
    process.env.PYTHON_BIN,
    '/opt/miniconda3/bin/python3',
    'python3'
  ].filter((value, index, values) => value && values.indexOf(value) === index)
}

export async function getDivinationContext(time, dayBoundary = 'midnight', options = {}) {
  const normalizedTime = normalizeCivilTime(time)
  const normalizedBoundary = normalizeDayBoundary(dayBoundary)
  const scriptPath = fileURLToPath(new URL('../python/divination_context.py', import.meta.url))
  const payload = JSON.stringify({ time: normalizedTime, dayBoundary: normalizedBoundary })
  const candidates = getPythonCandidates().filter(bin => !path.isAbsolute(bin) || fs.existsSync(bin))

  let lastError = null
  let lastMeaningfulError = null
  for (const bin of candidates) {
    try {
      return await runPython(bin, scriptPath, payload, options)
    } catch (error) {
      lastError = error
      if (error?.code !== 'ENOENT') lastMeaningfulError = error
    }
  }
  throw lastMeaningfulError || lastError || new Error('未找到可用的 Python 解释器')
}
