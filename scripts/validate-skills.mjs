#!/usr/bin/env node
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const skillsRoot = path.join(root, 'skills')
const skillDirectories = fs.readdirSync(skillsRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
  .sort()

assert.deepEqual(skillDirectories, ['liuyao', 'liuyao-divination'])

let checkedLinks = 0

function markdownFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) return markdownFiles(absolute)
    return entry.isFile() && entry.name.endsWith('.md') ? [absolute] : []
  })
}

for (const directoryName of skillDirectories) {
  const skillFile = path.join(skillsRoot, directoryName, 'SKILL.md')
  const skill = fs.readFileSync(skillFile, 'utf8')
  const frontmatter = skill.match(/^---\n([\s\S]*?)\n---\n/)
  assert(frontmatter, `${directoryName}: 缺少 YAML frontmatter`)
  assert.match(frontmatter[1], new RegExp(`^name: ${directoryName}$`, 'm'))
  assert.match(frontmatter[1], /^description: .+$/m)

  for (const markdownFile of markdownFiles(path.join(skillsRoot, directoryName))) {
    const contents = fs.readFileSync(markdownFile, 'utf8')
    for (const match of contents.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = match[1]
      if (/^(?:https?:|mailto:|#)/.test(target)) continue
      const decoded = decodeURIComponent(target.split('#')[0])
      assert(fs.existsSync(path.resolve(path.dirname(markdownFile), decoded)),
        `${path.relative(root, markdownFile)}: 无效链接 ${target}`)
      checkedLinks += 1
    }
  }
}

console.log(JSON.stringify({ status: 'pass', skills: skillDirectories.length, checkedLinks }))
