const VALID_YAO_VALUES = new Set([6, 7, 8, 9])

export class InputValidationError extends TypeError {
  constructor(message) {
    super(message)
    this.name = 'InputValidationError'
  }
}

function isIntegerInRange(value, min, max) {
  return Number.isInteger(value) && value >= min && value <= max
}

function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

function daysInMonth(year, month) {
  if (month === 2) return isLeapYear(year) ? 29 : 28
  return [4, 6, 9, 11].includes(month) ? 30 : 31
}

export function normalizeCivilTime(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new InputValidationError('time 必须是包含年月日的对象')
  }

  const normalized = {
    year: value.year,
    month: value.month,
    day: value.day,
    hour: value.hour ?? 0,
    minute: value.minute ?? 0,
    second: value.second ?? 0
  }

  if (!isIntegerInRange(normalized.year, 1, 9999)) {
    throw new InputValidationError('year 必须是 1–9999 的整数')
  }
  if (!isIntegerInRange(normalized.month, 1, 12)) {
    throw new InputValidationError('month 必须是 1–12 的整数')
  }
  if (
    !Number.isInteger(normalized.day) ||
    normalized.day < 1 ||
    normalized.day > daysInMonth(normalized.year, normalized.month)
  ) {
    throw new InputValidationError('day 不是有效的公历日期')
  }
  if (!isIntegerInRange(normalized.hour, 0, 23)) {
    throw new InputValidationError('hour 必须是 0–23 的整数')
  }
  if (!isIntegerInRange(normalized.minute, 0, 59)) {
    throw new InputValidationError('minute 必须是 0–59 的整数')
  }
  if (!isIntegerInRange(normalized.second, 0, 59)) {
    throw new InputValidationError('second 必须是 0–59 的整数')
  }

  return normalized
}

export function normalizeDayBoundary(value = 'midnight') {
  if (!['midnight', 'zi23'].includes(value)) {
    throw new InputValidationError('dayBoundary 只能是 midnight 或 zi23')
  }
  return value
}

export function assertYaoValues(values) {
  if (
    !Array.isArray(values) ||
    values.length !== 6 ||
    values.some(value => !VALID_YAO_VALUES.has(value))
  ) {
    throw new InputValidationError('爻值必须恰好是六个 6/7/8/9 数值，并按初爻至上爻排列')
  }
  return [...values]
}

export function isValidGanzhi(value) {
  const stems = '甲乙丙丁戊己庚辛壬癸'
  const branches = '子丑寅卯辰巳午未申酉戌亥'
  if (typeof value !== 'string' || value.length !== 2) return false
  const stemIndex = stems.indexOf(value[0])
  const branchIndex = branches.indexOf(value[1])
  return stemIndex >= 0 && branchIndex >= 0 && stemIndex % 2 === branchIndex % 2
}

export function normalizeMonthBranch(value) {
  const branches = '子丑寅卯辰巳午未申酉戌亥'
  if (typeof value !== 'string') {
    throw new InputValidationError('month 必须是一个月支或合法月柱')
  }
  if (value.length === 1 && branches.includes(value)) return value
  if (isValidGanzhi(value)) return value[1]
  throw new InputValidationError('month 必须是一个月支或合法月柱')
}
