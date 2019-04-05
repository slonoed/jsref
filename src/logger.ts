import {Connection} from 'vscode-languageserver'
import * as fs from 'fs'

export interface Logger {
  log(msg: string): void
  info(msg: string): void
  error(msg: string): void
}

export type t = Logger

export function createFileLogger(filePath: string): Logger {
  return createGenericLogger(msg => {
    fs.appendFileSync(filePath, msg + '\n', 'utf8')
  })
}

export function createConnectionLogger(c: Connection): Logger {
  // TODO wait for connection ready
  return c.console
}

export function createNoopLogger(): Logger {
  return createGenericLogger(_ => {})
}

type logFunction = (msg: string) => void

function createGenericLogger(log: logFunction): Logger {
  return {
    log: msg => log('[log] ' + msg),
    info: msg => log('[info] ' + msg),
    error: msg => log('[error] ' + msg),
  }
}
