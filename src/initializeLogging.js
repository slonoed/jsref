import log4js from 'log4js'
import path from 'path'
import {IConnection} from 'vscode-languageserver'

const MAX_LOG_SIZE = 1024 * 1024
const MAX_LOG_BACKUPS = 10

export default function initializeLogging(connection: IConnection) {
  log4js.configure({
    appenders: {
      everything: {type: 'file', filename: '/tmp/test/log'},
    },
    categories: {
      default: {appenders: ['everything'], level: 'debug'},
    },
  })

  // TODO add log to window/logMessage

  const logger = log4js.getLogger()
  process.on('uncaughtException', e => logger.error('uncaughtException', e))
  process.on('unhandledRejection', e => logger.error('unhandledRejection', e))

  global.console.log = logger.debug.bind(logger)
  global.console.error = logger.error.bind(logger)
}
