import assert from 'node:assert/strict'
import fs from 'node:fs'

import { compileScript, compileStyle, compileTemplate, parse } from '@vue/compiler-sfc'

const filename = 'src/components/HexagramChart.vue'
const source = fs.readFileSync(filename, 'utf8')
const parsed = parse(source, { filename })
assert.deepEqual(parsed.errors, [])

const { descriptor } = parsed
compileScript(descriptor, { id: 'hexagram-chart' })
const template = compileTemplate({ source: descriptor.template.content, filename, id: 'hexagram-chart' })
assert.deepEqual(template.errors, [])
const style = compileStyle({
  source: descriptor.styles[0].content,
  filename,
  id: 'hexagram-chart',
  scoped: true
})
assert.deepEqual(style.errors, [])

console.log(JSON.stringify({ status: 'pass', vueComponent: 'pass' }))
