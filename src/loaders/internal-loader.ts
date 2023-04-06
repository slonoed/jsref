import path from 'path'
import FolderLoader from './folder-loader'
import { Logger, Fixer } from '../types'

export default class InternalLoader {
  folderLoader: FolderLoader

  constructor(logger: Logger) {
    const fPath = path.join(__dirname, '../fixers')
    this.folderLoader = new FolderLoader(logger, fPath)
  }

  async load(): Promise<Fixer[]> {
    return this.folderLoader.load()
  }
}
