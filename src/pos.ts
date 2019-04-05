import * as LangServer from 'vscode-languageserver'

// Line is 1-based, columen is 0-based
export type t = {
  readonly line: number
  readonly column: number
}

export function create(line: number, column: number): t {
  if (line < 1) {
    throw new Error("Can't create position with line < 1")
  }
  if (line < 0) {
    throw new Error("Can't create position with columnt < 0")
  }
  return {line, column}
}

export function fromProtocol(p: LangServer.Position): t {
  return {
    line: p.line + 1,
    column: p.character,
  }
}

export function toProtocol(p: t): LangServer.Position {
  return {
    line: p.line - 1,
    character: p.column,
  }
}

export function isBefore(a: t, b: t): boolean {
  return a.line < b.line || (a.line === b.line && a.column < b.column)
}

export function isBeforeOrSame(a: t, b: t): boolean {
  return a.line < b.line || (a.line === b.line && a.column <= b.column)
}

export function isAfter(a: t, b: t): boolean {
  return a.line > b.line || (a.line === b.line && a.column > b.column)
}

export function isAfterOrSame(a: t, b: t): boolean {
  return a.line > b.line || (a.line === b.line && a.column >= b.column)
}

export function isWithin(a: t, start: t, end: t): boolean {
  return isAfter(a, start) && isBefore(a, end)
}
