import type { Fixer, Loader, Logger } from './types'

/**
 * Manages fixers. Can enable/disable depending on config
 */
export default class FixerStore {
  logger: Logger
  loaders: Loader[]
  fixers: Map<string, Fixer>

  constructor(logger: Logger, loaders: Loader[]) {
    this.logger = logger
    this.loaders = loaders
    this.fixers = new Map()
  }

  async init() {
    this.logger.info(`loading ${this.loaders.length} loaders`)

    const promises = this.loaders.map((loader) => this.loadOne(loader))
    await Promise.all(promises)
  }

  getIds() {
    return this.fixers.keys()
  }

  getAll() {
    return [...this.fixers.values()]
  }

  getById(id: string): Fixer | null {
    return this.fixers.get(id) || null
  }

  private async loadOne(loader: Loader) {
    try {
      const fixers = await loader.load()
      for (const fixer of fixers) {
        this.fixers.set(fixer.id, fixer)
      }
    } catch (e) {
      this.logger.error('error loading fixers in one of loaders', e)
    }
  }
}
