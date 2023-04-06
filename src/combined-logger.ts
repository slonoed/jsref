import { Logger } from './types'

export default class CombinedLogger {
  loggers: Logger[]

  constructor(...loggers: Logger[]) {
    this.loggers = loggers
  }

  add(logger: Logger) {
    this.loggers.push(logger)
  }

  each(callback: (l: Logger, ...args: any[]) => void) {
    for (const logger of this.loggers) {
      callback(logger)
    }
  }

  error(message: string, ...args: any[]) {
    this.each((l) => l.error(message, ...args))
  }
  warn(message: string, ...args: any[]) {
    this.each((l) => l.warn(message, ...args))
  }
  info(message: string, ...args: any[]) {
    this.each((l) => l.info(message, ...args))
  }
  log(message: string, ...args: any[]) {
    this.each((l) => l.log(message, ...args))
  }
}
