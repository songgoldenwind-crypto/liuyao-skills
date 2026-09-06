import { assertYaoValues } from './inputValidation.js'

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const SIX_SPIRITS = ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武']
const PALACE_POSITIONS = [
  { role: '本宫', shi: 6, ying: 3 },
  { role: '一世', shi: 1, ying: 4 },
  { role: '二世', shi: 2, ying: 5 },
  { role: '三世', shi: 3, ying: 6 },
  { role: '四世', shi: 4, ying: 1 },
  { role: '五世', shi: 5, ying: 2 },
  { role: '游魂', shi: 4, ying: 1 },
  { role: '归魂', shi: 3, ying: 6 }
]
const RELATION_ORDER = ['兄弟', '子孙', '妻财', '官鬼', '父母']

const BRANCH_ELEMENTS = {
  子: '水', 亥: '水',
  寅: '木', 卯: '木',
  巳: '火', 午: '火',
  申: '金', 酉: '金',
  辰: '土', 戌: '土', 丑: '土', 未: '土'
}

const TRIGRAM_ELEMENTS = {
  乾: '金', 兑: '金',
  震: '木', 巽: '木',
  坎: '水',
  离: '火',
  艮: '土', 坤: '土'
}

const TRIGRAM_CODE_BITS = {
  乾: '111',
  兑: '110',
  离: '101',
  震: '100',
  巽: '011',
  坎: '010',
  艮: '001',
  坤: '000'
}

const TRIGRAM_NAJIA = {
  乾: {
    lower: [['甲', '子'], ['甲', '寅'], ['甲', '辰']],
    upper: [['壬', '午'], ['壬', '申'], ['壬', '戌']]
  },
  兑: {
    lower: [['丁', '巳'], ['丁', '卯'], ['丁', '丑']],
    upper: [['丁', '亥'], ['丁', '酉'], ['丁', '未']]
  },
  离: {
    lower: [['己', '卯'], ['己', '丑'], ['己', '亥']],
    upper: [['己', '酉'], ['己', '未'], ['己', '巳']]
  },
  震: {
    lower: [['庚', '子'], ['庚', '寅'], ['庚', '辰']],
    upper: [['庚', '午'], ['庚', '申'], ['庚', '戌']]
  },
  巽: {
    lower: [['辛', '丑'], ['辛', '亥'], ['辛', '酉']],
    upper: [['辛', '未'], ['辛', '巳'], ['辛', '卯']]
  },
  坎: {
    lower: [['戊', '寅'], ['戊', '辰'], ['戊', '午']],
    upper: [['戊', '申'], ['戊', '戌'], ['戊', '子']]
  },
  艮: {
    lower: [['丙', '辰'], ['丙', '午'], ['丙', '申']],
    upper: [['丙', '戌'], ['丙', '子'], ['丙', '寅']]
  },
  坤: {
    lower: [['乙', '未'], ['乙', '巳'], ['乙', '卯']],
    upper: [['癸', '丑'], ['癸', '亥'], ['癸', '酉']]
  }
}

const DAY_STEM_SPIRIT = {
  甲: '青龙',
  乙: '青龙',
  丙: '朱雀',
  丁: '朱雀',
  戊: '勾陈',
  己: '螣蛇',
  庚: '白虎',
  辛: '白虎',
  壬: '玄武',
  癸: '玄武'
}

const YI_MA = {
  申子辰: '寅',
  寅午戌: '申',
  亥卯未: '巳',
  巳酉丑: '亥'
}

const TAO_HUA = {
  申子辰: '酉',
  寅午戌: '卯',
  亥卯未: '子',
  巳酉丑: '午'
}

const DAY_LU = {
  甲: '寅',
  乙: '卯',
  丙: '巳',
  丁: '午',
  戊: '巳',
  己: '午',
  庚: '申',
  辛: '酉',
  壬: '亥',
  癸: '子'
}

const GUI_REN = {
  甲: ['丑', '未'],
  戊: ['丑', '未'],
  乙: ['子', '申'],
  己: ['子', '申'],
  丙: ['亥', '酉'],
  丁: ['亥', '酉'],
  庚: ['寅', '午'],
  辛: ['寅', '午'],
  壬: ['卯', '巳'],
  癸: ['卯', '巳']
}

const EMPTY_BRANCHES = [
  '戌亥',
  '申酉',
  '午未',
  '辰巳',
  '寅卯',
  '子丑'
]

function toggleBit(bit) {
  return bit === '1' ? '0' : '1'
}

function buildPalaceMap() {
  const map = new Map()

  for (const [palaceName, trigramBits] of Object.entries(TRIGRAM_CODE_BITS)) {
    const bits = [...`${trigramBits}${trigramBits}`]
    const sequence = [bits.join('')]

    bits[0] = toggleBit(bits[0])
    sequence.push(bits.join(''))
    bits[1] = toggleBit(bits[1])
    sequence.push(bits.join(''))
    bits[2] = toggleBit(bits[2])
    sequence.push(bits.join(''))
    bits[3] = toggleBit(bits[3])
    sequence.push(bits.join(''))
    bits[4] = toggleBit(bits[4])
    sequence.push(bits.join(''))
    bits[3] = toggleBit(bits[3])
    sequence.push(bits.join(''))
    bits[0] = toggleBit(bits[0])
    bits[1] = toggleBit(bits[1])
    bits[2] = toggleBit(bits[2])
    sequence.push(bits.join(''))

    sequence.forEach((code, index) => {
      map.set(code, {
        palaceName,
        palaceElement: TRIGRAM_ELEMENTS[palaceName],
        pureCode: `${trigramBits}${trigramBits}`,
        ...PALACE_POSITIONS[index]
      })
    })
  }

  return map
}

const PALACE_MAP = buildPalaceMap()

function codeToBits(code) {
  return code.split('').map(char => (char === '9' ? '1' : '0')).join('')
}

function getHexagramPalaceInfo(hexagram) {
  if (!hexagram?.code) return null
  return PALACE_MAP.get(codeToBits(hexagram.code)) || null
}

function getLineShape(isYang) {
  return isYang ? '▅▅▅▅▅' : '▅▅　▅▅'
}

function getChangedValue(value) {
  return value === 6 || value === 9 ? 15 - value : value
}

function getWuxingRelation(selfElement, otherElement) {
  if (selfElement === otherElement) return '兄弟'
  if (
    (otherElement === '土' && selfElement === '金') ||
    (otherElement === '金' && selfElement === '水') ||
    (otherElement === '水' && selfElement === '木') ||
    (otherElement === '木' && selfElement === '火') ||
    (otherElement === '火' && selfElement === '土')
  ) {
    return '父母'
  }
  if (
    (selfElement === '土' && otherElement === '金') ||
    (selfElement === '金' && otherElement === '水') ||
    (selfElement === '水' && otherElement === '木') ||
    (selfElement === '木' && otherElement === '火') ||
    (selfElement === '火' && otherElement === '土')
  ) {
    return '子孙'
  }
  if (
    (otherElement === '木' && selfElement === '土') ||
    (otherElement === '土' && selfElement === '水') ||
    (otherElement === '水' && selfElement === '火') ||
    (otherElement === '火' && selfElement === '金') ||
    (otherElement === '金' && selfElement === '木')
  ) {
    return '官鬼'
  }
  return '妻财'
}

function getSpiritSequence(dayStem) {
  const startSpirit = DAY_STEM_SPIRIT[dayStem] || '青龙'
  const startIndex = SIX_SPIRITS.indexOf(startSpirit)
  return Array.from({ length: 6 }, (_, index) => SIX_SPIRITS[(startIndex + index) % 6])
}

function getHexagramLineMeta(hexagram, palaceElement) {
  if (!hexagram?.lowerTrigram?.name || !hexagram?.upperTrigram?.name) return []

  const lower = TRIGRAM_NAJIA[hexagram.lowerTrigram.name]?.lower || []
  const upper = TRIGRAM_NAJIA[hexagram.upperTrigram.name]?.upper || []
  const all = [...lower, ...upper]

  return all.map(([stem, branch], idx) => {
    const element = BRANCH_ELEMENTS[branch]
    return {
      idx,
      stem,
      branch,
      stemBranch: `${stem}${branch}`,
      element,
      relation: getWuxingRelation(palaceElement, element)
    }
  })
}

function findHexagramByCode(code, hexagramData) {
  return hexagramData.find(item => item.code === code) || null
}

function getPurePalaceHexagram(currentHexagram, hexagramData) {
  const palaceInfo = getHexagramPalaceInfo(currentHexagram)
  if (!palaceInfo) return null
  const pureCode = palaceInfo.pureCode.replaceAll('1', '9').replaceAll('0', '6')
  return findHexagramByCode(pureCode, hexagramData)
}

function buildFushen(currentLines, pureLines) {
  const missingRelations = RELATION_ORDER.filter(
    relation => !currentLines.some(line => line.relation === relation)
  )

  const hiddenMap = new Map()
  pureLines.forEach((line, idx) => {
    if (missingRelations.includes(line.relation) && currentLines[idx]?.relation !== line.relation) {
      hiddenMap.set(idx, `${line.relation}${line.stemBranch}${line.element}`)
    }
  })
  return hiddenMap
}

function getGroupValue(targetBranch, table) {
  return Object.entries(table).find(([group]) => group.includes(targetBranch))?.[1] || ''
}

function getXunKong(dayGanzhi) {
  const stem = dayGanzhi?.[0]
  const branch = dayGanzhi?.[1]
  const stemIndex = STEMS.indexOf(stem)
  const branchIndex = BRANCHES.indexOf(branch)
  if (stemIndex < 0 || branchIndex < 0) return ''
  let ganzhiIndex = -1
  for (let i = 0; i < 60; i++) {
    if (i % 10 === stemIndex && i % 12 === branchIndex) {
      ganzhiIndex = i
      break
    }
  }
  if (ganzhiIndex < 0) return ''
  const groupIndex = Math.floor(ganzhiIndex / 10)
  return EMPTY_BRANCHES[groupIndex] || ''
}

function buildShenSha(dayStem, dayBranch) {
  return {
    驿马: getGroupValue(dayBranch, YI_MA),
    桃花: getGroupValue(dayBranch, TAO_HUA),
    日禄: DAY_LU[dayStem] || '',
    贵人: (GUI_REN[dayStem] || []).join('，')
  }
}

function formatHexLabel(hexagram) {
  if (!hexagram) return ''
  return `${hexagram.upperTrigram?.symbol || ''}${hexagram.lowerTrigram?.symbol || ''}${hexagram.name || hexagram.simpleName || ''}`
}

function buildColumnLine(value, lineMeta, markerLine, otherMarkerLine, lineNumber) {
  const isYang = value === 7 || value === 9
  return {
    text: `${lineMeta.relation}${lineMeta.stemBranch}${lineMeta.element}`,
    shape: getLineShape(isYang),
    isYang,
    marker: markerLine === lineNumber ? '世' : otherMarkerLine === lineNumber ? '应' : ''
  }
}

export function buildLiuyaoDetail({ yaoValues, currentHexagram, changedHexagram, calendar, hexagramData }) {
  try {
    assertYaoValues(yaoValues)
  } catch {
    return null
  }
  if (!currentHexagram || !Array.isArray(hexagramData)) return null

  const currentCode = yaoValues
    .map(value => (value === 7 || value === 9) ? '9' : '6')
    .join('')
  if (currentHexagram.code !== currentCode) return null

  const hasChange = yaoValues.some(value => value === 6 || value === 9)
  const changedCode = yaoValues
    .map(value => value === 6 || value === 9 ? 15 - value : value)
    .map(value => (value === 7 || value === 9) ? '9' : '6')
    .join('')
  if (hasChange ? changedHexagram?.code !== changedCode : changedHexagram != null) return null

  const palaceInfo = getHexagramPalaceInfo(currentHexagram)
  if (!palaceInfo) return null

  const currentLines = getHexagramLineMeta(currentHexagram, palaceInfo.palaceElement)
  const changedLines = changedHexagram
    ? getHexagramLineMeta(changedHexagram, palaceInfo.palaceElement)
    : []
  const pureHexagram = getPurePalaceHexagram(currentHexagram, hexagramData)
  const pureLines = pureHexagram ? getHexagramLineMeta(pureHexagram, palaceInfo.palaceElement) : []
  const hiddenMap = buildFushen(currentLines, pureLines)
  const changedPalaceInfo = changedHexagram ? getHexagramPalaceInfo(changedHexagram) : null
  const dayStem = calendar?.ganzhi?.day?.[0] || ''
  const dayBranch = calendar?.ganzhi?.day?.[1] || ''
  const spirits = getSpiritSequence(dayStem)
  const shenSha = buildShenSha(dayStem, dayBranch)
  const emptyBranches = getXunKong(calendar?.ganzhi?.day || '')

  const rows = Array.from({ length: 6 }, (_, offset) => {
    const idx = 5 - offset
    const lineNumber = idx + 1
    const currentLine = currentLines[idx]
    const changedLine = changedLines[idx]
    const currentValue = yaoValues[idx]
    const changedValue = getChangedValue(currentValue)
    const actualChange = currentValue === 6 || currentValue === 9

    return {
      idx,
      lineNumber,
      position: ['初', '二', '三', '四', '五', '上'][idx],
      spirit: spirits[idx],
      hidden: hiddenMap.get(idx) || '',
      hiddenCandidate: pureLines[idx]
        ? `${pureLines[idx].relation}${pureLines[idx].stemBranch}${pureLines[idx].element}`
        : '',
      actualChange,
      current: {
        ...buildColumnLine(currentValue, currentLine, palaceInfo.shi, palaceInfo.ying, lineNumber),
        value: currentValue,
        move: currentValue === 9 ? '○→' : currentValue === 6 ? '╳→' : ''
      },
      changed: changedLine
        ? {
            ...buildColumnLine(changedValue, changedLine, changedPalaceInfo?.shi, changedPalaceInfo?.ying, lineNumber),
            value: changedValue,
            actualChange
          }
        : null
    }
  })

  return {
    palace: {
      name: palaceInfo.palaceName,
      role: palaceInfo.role,
      title: `${palaceInfo.palaceName}宫：${formatHexLabel(currentHexagram)}${palaceInfo.role ? `（${palaceInfo.role}）` : ''}`
    },
    changedPalace: changedPalaceInfo
      ? {
          name: changedPalaceInfo.palaceName,
          role: changedPalaceInfo.role,
          title: `${changedPalaceInfo.palaceName}宫：${formatHexLabel(changedHexagram)}${changedPalaceInfo.role ? `（${changedPalaceInfo.role}）` : ''}`
        }
      : null,
    calendar: calendar
      ? {
          ...calendar,
          emptyBranches,
          shenSha
        }
      : null,
    rows
  }
}
