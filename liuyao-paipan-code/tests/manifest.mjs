import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const manifest = JSON.parse(fs.readFileSync('MANIFEST.json', 'utf8'))
assert.equal(manifest.manifest_version, '2.0')
assert.equal(manifest.version, JSON.parse(fs.readFileSync('package.json', 'utf8')).version)

const ignoredDirectories = new Set(['.git', '.venv', '__pycache__', 'dist', 'node_modules'])

function collectFiles(directory = '.') {
  const files = []
  for (const dirent of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, dirent.name)
    const relative = path.relative('.', file)
    if (relative.split(path.sep).some(part => ignoredDirectories.has(part))) continue
    if (dirent.isDirectory()) files.push(...collectFiles(file))
    else if (
      relative !== 'MANIFEST.json' &&
      dirent.name !== '.DS_Store' &&
      dirent.name !== '.env' &&
      !dirent.name.startsWith('.env.') &&
      !dirent.name.endsWith('.pyc') &&
      !dirent.name.endsWith('.tgz')
    ) {
      files.push(relative.split(path.sep).join('/'))
    }
  }
  return files
}

assert.deepEqual(manifest.files.map(item => item.file), collectFiles().sort())

for (const item of manifest.files) {
  const contents = fs.readFileSync(item.file)
  assert.equal(contents.length, item.bytes, `${item.file} byte count`)
  assert.equal(
    crypto.createHash('sha256').update(contents).digest('hex'),
    item.sha256,
    `${item.file} sha256`
  )
}

console.log(JSON.stringify({ status: 'pass', manifestFiles: manifest.files.length }))
