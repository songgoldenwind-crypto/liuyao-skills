#!/usr/bin/env node
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ignoredDirectories = new Set(['.git', '.venv', '__pycache__', 'dist', 'node_modules'])

function shouldIgnore(relativePath, dirent) {
  const parts = relativePath.split(path.sep)
  if (parts.some(part => ignoredDirectories.has(part))) return true
  if (dirent.isDirectory()) return false
  const name = dirent.name
  return (
    relativePath === 'MANIFEST.json' ||
    name === '.DS_Store' ||
    name === '.env' ||
    name.startsWith('.env.') ||
    name.endsWith('.pyc') ||
    name.endsWith('.tgz')
  )
}

function collectFiles(directory = root) {
  const files = []
  for (const dirent of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, dirent.name)
    const relativePath = path.relative(root, absolutePath)
    if (shouldIgnore(relativePath, dirent)) continue
    if (dirent.isDirectory()) files.push(...collectFiles(absolutePath))
    else if (dirent.isFile()) files.push(relativePath.split(path.sep).join('/'))
  }
  return files
}

const files = collectFiles().sort().map(file => {
  const contents = fs.readFileSync(path.join(root, file))
  return {
    file,
    bytes: contents.length,
    sha256: crypto.createHash('sha256').update(contents).digest('hex')
  }
})

const manifest = {
  manifest_version: '2.0',
  package: 'liuyao-paipan-code',
  version: JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version,
  snapshot_date: new Date().toISOString().slice(0, 10),
  scope: '六爻排盘源码、CLI、历法服务、Vue 组件和自动化测试',
  files,
  verification: {
    command: 'npm test',
    coverage: [
      '4096 种六爻值组合',
      '64 卦八宫、宫位角色和世应',
      'CLI 与两种日界',
      '公开 API 与输入校验',
      'Python 入口输入校验',
      'HTTP 日历接口',
      'Python 子进程超时与输出上限',
      'Vue 单文件组件编译'
    ]
  }
}

fs.writeFileSync(path.join(root, 'MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`updated MANIFEST.json (${files.length} files)`)
