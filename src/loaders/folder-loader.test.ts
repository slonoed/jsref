import fs from 'fs/promises'
import path from 'path'
import os from 'os'

import FolderLoader from './folder-loader'

const tempDir = path.join(os.tmpdir(), 'folder-loader-test')
const logger = console

async function createTestFiles() {
  await fs.mkdir(tempDir, { recursive: true })

  const positiveCaseContent = `
    module.exports = {
      id: 'good'
    }
  `

  const negativeCaseContent = `module.exports = {};`

  await Promise.all([
    fs.writeFile(path.join(tempDir, 'positiveCase.js'), positiveCaseContent),
    fs.writeFile(path.join(tempDir, 'negativeCase.js'), negativeCaseContent),
  ])
}

async function cleanupTestFiles() {
  await fs.rm(tempDir, { recursive: true, force: true })
}

beforeAll(async () => {
  await createTestFiles()
})

afterAll(async () => {
  await cleanupTestFiles()
})

describe('FolderLoader', () => {
  it('should load Fixer instances from the specified folder', async () => {
    const folderLoader = new FolderLoader(logger as any, tempDir)
    const fixers = await folderLoader.load()

    expect(fixers).toHaveLength(1)
    expect(fixers[0]).toEqual({ id: 'good' })
  })
})
