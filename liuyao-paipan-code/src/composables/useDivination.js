/**
 * 六爻摇卦核心逻辑
 * 算法参考: Humoonruc/auto-divination
 */
import { ref, computed } from 'vue'
import { HEXAGRAM_DATA, TRIGRAM_DATA, GUA_CODE_TABLE } from '../data/hexagrams.js'
import { simplifyHexagramRecord, toSimplifiedText } from '../utils/hexagramText.js'
import { assertYaoValues, InputValidationError } from '../utils/inputValidation.js'

// 爻值含义: 6=老阴(动), 7=少阳(静), 8=少阴(静), 9=老阳(动)
const YAO_TYPES = {
  6: { name: '老阴', yin: true, changing: true, symbol: '▪▪ ×' },
  7: { name: '少阳', yin: false, changing: false, symbol: '———' },
  8: { name: '少阴', yin: true, changing: false, symbol: '— —' },
  9: { name: '老阳', yin: false, changing: true, symbol: '——— ○' }
}

// 通过6位编码查找卦
function findHexagramByCode(codeArray) {
  const codeStr = codeArray.map(c => (c === 7 || c === 9) ? '9' : '6').join('')
  const entry = GUA_CODE_TABLE.find(g => g.code === codeStr)
  if (!entry) return null
  const hexagram = HEXAGRAM_DATA.find(h => h.simpleName === entry.name)
  if (!hexagram) return null

  // 保留回退顺序，兼容调用方传入缺少完整名称的自定义卦象数据。
  const displayName = hexagram.name?.trim() || hexagram.simpleName || entry.name
  return simplifyHexagramRecord({
    ...hexagram,
    name: toSimplifiedText(displayName),
    displayName: toSimplifiedText(displayName)
  })
}

// 本卦→变卦: 6↔9, 7和8不变
function getChangedCode(code) {
  return (code === 6 || code === 9) ? 15 - code : code
}

function hasValidYaoValues(values) {
  try {
    assertYaoValues(values)
    return true
  } catch {
    return false
  }
}

function secureCoinSource() {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error('当前运行环境不支持 crypto.getRandomValues()')
  }
  const bytes = new Uint8Array(3)
  globalThis.crypto.getRandomValues(bytes)
  return Array.from(bytes, value => value & 1)
}

// 抛三枚铜钱
function throwCoins(coinSource) {
  const coins = Array.from(coinSource?.() || [])
  if (coins.length !== 3 || coins.some(value => value !== 0 && value !== 1)) {
    throw new InputValidationError('coinSource 必须返回三个 0/1 数值')
  }
  const [c1, c2, c3] = coins
  return {
    coins, // 0=反, 1=正
    value: c1 + c2 + c3 + 6  // 6,7,8,9
  }
}

export function useDivination(options = {}) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new InputValidationError('useDivination 选项必须是对象')
  }
  const coinSource = options.coinSource ?? secureCoinSource
  if (typeof coinSource !== 'function') {
    throw new InputValidationError('coinSource 必须是函数')
  }
  const yaoValues = ref([])        // 6爻值 [bottom→top]
  const coinResults = ref([])      // 每次投掷的硬币结果
  const question = ref('')         // 用户的问题
  const divinationTime = ref(null)
  const throwCount = computed(() => yaoValues.value.length)
  const isComplete = computed(() => hasValidYaoValues(yaoValues.value))
  const manualChanging = computed(() =>
    Array.from({ length: 6 }, (_, index) => {
      const value = yaoValues.value[index]
      return value === 6 || value === 9
    })
  )

  function captureNow() {
    const now = new Date()
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds()
    }
  }

  // 投掷一次
  function doThrow() {
    if (throwCount.value >= 6) return null
    if (throwCount.value === 0 || !divinationTime.value) {
      divinationTime.value = captureNow()
    }
    const result = throwCoins(coinSource)
    yaoValues.value.push(result.value)
    coinResults.value.push(result.coins)
    return result
  }

  // 手动设置全部爻值（用于手动输入模式）
  function setYaoValues(values) {
    yaoValues.value = assertYaoValues(values)
    coinResults.value = []
    divinationTime.value = captureNow()
  }

  // 切换手动动爻
  function toggleChanging(index) {
    if (!Number.isInteger(index) || index < 0 || index >= yaoValues.value.length) {
      throw new InputValidationError('动爻索引超出当前爻值范围')
    }
    const current = yaoValues.value[index]
    if (current === 7) yaoValues.value[index] = 9  // 少阳→老阳(动)
    else if (current === 9) yaoValues.value[index] = 7  // 老阳→少阳(静)
    else if (current === 8) yaoValues.value[index] = 6  // 少阴→老阴(动)
    else if (current === 6) yaoValues.value[index] = 8  // 老阴→少阴(静)
  }

  // 本卦
  const currentHexagram = computed(() => {
    if (!hasValidYaoValues(yaoValues.value)) return null
    return findHexagramByCode(yaoValues.value)
  })

  // 变卦（之卦）
  const changedHexagram = computed(() => {
    if (!hasValidYaoValues(yaoValues.value)) return null
    const changedValues = yaoValues.value.map(getChangedCode)
    // 如果没有动爻，无变卦
    const hasChanging = yaoValues.value.some(v => v === 6 || v === 9)
    if (!hasChanging) return null
    return findHexagramByCode(changedValues)
  })

  // 动爻位置 (0-based)
  const changingLines = computed(() => {
    return yaoValues.value
      .map((v, i) => (v === 6 || v === 9) ? i : -1)
      .filter(i => i >= 0)
  })

  // 上下卦信息
  const trigrams = computed(() => {
    if (!hasValidYaoValues(yaoValues.value)) return null
    const codes = yaoValues.value.map(c => (c === 7 || c === 9) ? '9' : '6')
    const lowerCode = codes.slice(0, 3).join('')
    const upperCode = codes.slice(3, 6).join('')
    const lower = TRIGRAM_DATA.find(t => t.code === lowerCode)
    const upper = TRIGRAM_DATA.find(t => t.code === upperCode)
    return { lower, upper }
  })

  // 重置
  function reset() {
    yaoValues.value = []
    coinResults.value = []
    question.value = ''
    divinationTime.value = null
  }

  return {
    yaoValues,
    throwCount,
    coinResults,
    question,
    isComplete,
    manualChanging,
    divinationTime,
    doThrow,
    setYaoValues,
    toggleChanging,
    currentHexagram,
    changedHexagram,
    changingLines,
    trigrams,
    reset,
    YAO_TYPES,
    HEXAGRAM_DATA,
    GUA_CODE_TABLE
  }
}
