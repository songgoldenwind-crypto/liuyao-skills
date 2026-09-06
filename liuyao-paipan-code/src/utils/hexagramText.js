import OpenCC from 'opencc-js/t2cn'

const traditionalToSimplified = OpenCC.Converter({ from: 't', to: 'cn' })
const QIAN_PLACEHOLDER = '\uE000'

function simplifyValue(value) {
  if (value == null) return value
  return traditionalToSimplified(String(value).replaceAll('乾', QIAN_PLACEHOLDER))
    .replaceAll(QIAN_PLACEHOLDER, '乾')
    .replace(/「/g, '“')
    .replace(/」/g, '”')
}

export function toSimplifiedText(value) {
  return simplifyValue(value)
}

export function simplifyHexagramRecord(hexagram) {
  if (!hexagram) return null

  return {
    ...hexagram,
    name: simplifyValue(hexagram.name),
    simpleName: simplifyValue(hexagram.simpleName),
    description: simplifyValue(hexagram.description),
    guaCi: simplifyValue(hexagram.guaCi),
    tuanCi: simplifyValue(hexagram.tuanCi),
    xiangCi: simplifyValue(hexagram.xiangCi),
    yaoCi: Array.isArray(hexagram.yaoCi)
      ? hexagram.yaoCi.map(item => ({
          ...item,
          name: simplifyValue(item.name),
          text: simplifyValue(item.text)
        }))
      : [],
    yaoXiang: Array.isArray(hexagram.yaoXiang)
      ? hexagram.yaoXiang.map(item => simplifyValue(item))
      : [],
    upperTrigram: hexagram.upperTrigram
      ? {
          ...hexagram.upperTrigram,
          name: simplifyValue(hexagram.upperTrigram.name),
          symbol: simplifyValue(hexagram.upperTrigram.symbol)
        }
      : null,
    lowerTrigram: hexagram.lowerTrigram
      ? {
          ...hexagram.lowerTrigram,
          name: simplifyValue(hexagram.lowerTrigram.name),
          symbol: simplifyValue(hexagram.lowerTrigram.symbol)
        }
      : null
  }
}

export function formatHexagramTitle(hexagram) {
  if (!hexagram) return ''
  const upper = hexagram.upperTrigram?.symbol || ''
  const lower = hexagram.lowerTrigram?.symbol || ''
  const name = hexagram.displayName || hexagram.name || hexagram.simpleName || ''
  return `${upper}${lower}${name}`
}

export function formatHexagramStructure(hexagram) {
  if (!hexagram) return ''
  const upper = `${hexagram.upperTrigram?.name || ''}${hexagram.upperTrigram?.symbol || ''}`
  const lower = `${hexagram.lowerTrigram?.name || ''}${hexagram.lowerTrigram?.symbol || ''}`
  return `${upper}上 · ${lower}下`
}
