import { Logger, Fixer } from '../types'
import importGlobalPackage, { getInstalledPackages } from '../npm-utils'

const re = /\/?jsref-fixer-.*$/

function isFixerPackageName(name: string): boolean {
  return re.test(name)
}

export default class PackagesLoader {
  logger: Logger

  constructor(logger: Logger) {
    this.logger = logger
  }

  async load(): Promise<Fixer[]> {
    let packageNames: string[]
    try {
      packageNames = await getInstalledPackages()
    } catch (e) {
      this.logger.error(`Unable to get installed packages`)
      return []
    }

    const promises = packageNames
      .filter(isFixerPackageName)
      .map((n) => this.loadFixersFromPackage(n))
    const result = await Promise.all(promises)
    return result.flat()
  }

  async loadFixersFromPackage(packageName: string): Promise<Fixer[]> {
    this.logger.info(`loading package ${packageName}`)

    let result
    try {
      result = await importGlobalPackage(packageName)
    } catch (e) {
      this.logger.warn(`unable to load package ${packageName}`, e)
      // We don't control packages. So, try not to throw when possible
      return []
    }

    const list = result.default

    if (!Array.isArray(list)) {
      this.logger.warn(`Package ${packageName} does not have default exported array of fixers`)
      return []
    }

    const fixers = list.filter((f: any) => this.isFixer(f, packageName))
    this.logger.info(`loaded ${fixers.length} from "${packageName}"`)
    return fixers
  }

  isFixer(f: any, name: string): boolean {
    if (!f) {
      this.logger.error(`fixer is empty in package "${name}"`)
      return false
    }
    if (typeof f.id !== 'string' || f.id === '') {
      this.logger.error(`fixer in package "${name}" should have "id" field`)
      return false
    }
    if (typeof f.fix !== 'function') {
      this.logger.error(`fixer ${f.id} in package "${name}" should have "fix" field`)
      return false
    }

    return true
  }
}
