import { spawn } from 'node:child_process'

const DEFAULT_TIMEOUT_MS = 10_000
const DEFAULT_OUTPUT_LIMIT_BYTES = 1_048_576

function positiveInteger(value, fallback) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export function runPython(bin, scriptPath, payload, options = {}) {
  const timeoutMs = positiveInteger(options.timeoutMs, DEFAULT_TIMEOUT_MS)
  const outputLimitBytes = positiveInteger(options.outputLimitBytes, DEFAULT_OUTPUT_LIMIT_BYTES)

  return new Promise((resolve, reject) => {
    const proc = spawn(bin, [scriptPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''
    let outputBytes = 0
    let settled = false

    const finish = (handler, value) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      handler(value)
    }

    const terminate = message => {
      proc.kill('SIGKILL')
      finish(reject, new Error(message))
    }

    const appendOutput = (target, chunk) => {
      outputBytes += chunk.length
      if (outputBytes > outputLimitBytes) {
        terminate(`Python 输出超过 ${outputLimitBytes} 字节限制`)
        return target
      }
      return target + chunk.toString()
    }

    const timer = setTimeout(() => {
      terminate(`Python 计算超过 ${timeoutMs} 毫秒`)
    }, timeoutMs)

    proc.stdout.on('data', chunk => {
      stdout = appendOutput(stdout, chunk)
    })

    proc.stderr.on('data', chunk => {
      stderr = appendOutput(stderr, chunk)
    })

    proc.on('error', error => {
      finish(reject, error)
    })

    proc.on('close', code => {
      if (settled) return
      if (code !== 0) {
        finish(reject, new Error(stderr.trim() || `python exited with code ${code}`))
        return
      }
      try {
        const jsonText = stdout.trim().split(/\n/).filter(Boolean).pop()
        if (!jsonText) throw new Error('Python 未返回 JSON')
        finish(resolve, JSON.parse(jsonText))
      } catch (error) {
        finish(reject, error)
      }
    })

    proc.stdin.on('error', error => {
      finish(reject, error)
    })
    proc.stdin.end(payload)
  })
}
