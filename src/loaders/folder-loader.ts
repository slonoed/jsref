import { readdir, stat } from 'fs/promises'
import path from 'path'
import { Logger, Fixer } from '../types'

export default class FolderLoader {
  logger: Logger
  path: string

  constructor(logger: Logger, path: string) {
    this.logger = logger
    this.path = path
  }

  async load(): Promise<Fixer[]> {
    const fixers: Fixer[] = []
    await this.loadFromDirectory(this.path, fixers)
    return fixers
  }

  private async loadFromDirectory(dirPath: string, fixers: Fixer[]): Promise<void> {
    const files = await readdir(dirPath)

    for (const file of files) {
      const filePath = path.join(dirPath, file)
      const fileStat = await stat(filePath)

      if (fileStat.isDirectory()) {
        await this.loadFromDirectory(filePath, fixers)
      } else if (file.endsWith('.js')) {
        const fixer = await this.loadFixer(filePath)
        if (fixer) {
          fixers.push(fixer)
        }
      }
    }
  }

  async loadFixer(filePath: string): Promise<Fixer | null> {
    try {
      const module = await import(filePath)
      if (module.default && typeof module.default.id === 'string' && module.default.id !== '') {
        return module.default
      }
    } catch (error: any) {
      this.logger.error(`Error loading fixer from ${filePath}: ${error?.message}`)
    }
    return null
  }
}
